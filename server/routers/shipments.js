var express = require('express');
var Shipment = require('../../db/models/index.js').Shipment;
var OrderedProduct = require('../../db/models/index.js').OrderedProduct;
var Address = require('../../db/models/index.js').Address;
var forEachAsync = require('forEachAsync').forEachAsync;

var shipmentRouter = express.Router({mergeParams: true});


// use shipment
shipmentRouter.use(function(req, res, next) {
    var orderId = req.params.orderId;

    req.account.getOrders({where: {id: orderId}}).then(orders => {
      var order = orders[0];
      if (order) {
        req.order = order;
        next();
      } else {
        res.send('order not found')
      }
    })
  });

// create shipment
shipmentRouter.route('/')
  .post(function(req, res) {

    if (req.body.type === 'return') {
      Shipment.create(Object.assign({
        status: 'order_received',
      }, req.body)).then(shipment => {
        req.order.addShipment(shipment).then(() => {
          forEachAsync(req.body.productIds, (next, productId, index) => {
            OrderedProduct.find({where: {id: productId}}).then(orderedProduct => {
              shipment.addOrderedProduct(orderedProduct).then(() => {
                next();
              })
            })
          }).then(() => {
            res.send(shipment)
          })
        })      
      })
    } else {

      req.account.getAddresses({where: {id: req.body.deliveryAddressId}}).then(addresses => {
        var deliveryAddress =  addresses[0];

        Address.find({where: {id: req.body.pickupAddressId}}).then(pickupAddress => {
          if (deliveryAddress && pickupAddress) {
            pickupAddress = pickupAddress.toJSON();
            delete pickupAddress.id; delete pickupAddress.createdAt; delete pickupAddress.updatedAt;
            deliveryAddress = deliveryAddress.toJSON();
            delete deliveryAddress.id; delete deliveryAddress.createdAt; delete deliveryAddress.updatedAt;
            Shipment.create(Object.assign({
              status: 'order_received',
              pickupAddress: JSON.stringify(pickupAddress),
              deliveryAddress: JSON.stringify(deliveryAddress),
            }, req.body)).then(shipment => {
              req.order.addShipment(shipment).then(() => {
                res.send(shipment)
              })      
            })
          } else {
            res.send('address not found')
          }
        })
      })
    }

  });

// list shipments
shipmentRouter.route('/')
  .get(function(req, res, next) {
    var order = req.order;

    order.getShipments().then(shipments => {
      res.send(shipments)
    })
  })

// get shipment info
shipmentRouter.route('/:shipmentId')
  .get(function(req, res) {
    req.order.getShipment({where: {id: req.params.shipmentId}}).then(shipment => {
      res.send(shipment)
    })
  });

// Update shipment
shipmentRouter.route('/:shipmentId')
  .post(function(req, res) {
    var productIds = req.body.orderedProducts;

    req.order.getShipments({where: {id: req.params.shipmentId}}).then(shipments => {
      var shipment = shipments[0];
      if (shipment) {
        if (productIds && productIds.length > 0) {
          forEachAsync(productIds, (next, productId, index) => {
            OrderedProduct.find({where: {id: productId}}).then(orderedProduct => {
              shipment.addOrderedProduct(orderedProduct).then(() => {
                next();
              })
            })
          }).then(() => {
            res.send(shipment)
          })
        } else {
          shipment.update(req.body).then(newShipment => {
            res.send(newShipment)        
          });          
        }
      } else {
        res.send('shipment not found')
      }
    })
  });

// Delete shipment
shipmentRouter.route('/:shipmentId')
  .delete(function(req, res) {
    Shipment.delete({where: {id: req.params.shipmentId}}).then(() => {
      res.send('shipment deleted!');
    })
  });

module.exports = shipmentRouter;

