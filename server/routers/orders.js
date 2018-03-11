var express = require('express');
var forEachAsync = require('forEachAsync').forEachAsync;
var Order = require('../../db/models/index.js').Order;
var Shipment = require('../../db/models/index.js').Shipment;
var OrderedProduct = require('../../db/models/index.js').OrderedProduct;
var ProductPhoto = require('../../db/models/index.js').ProductPhoto;

var orderRouter = express.Router();

// create order
orderRouter.route('/')
  .post(function(req, res) {
    req.body.status = 'Order Successful';
    Order.create(req.body).then(order => {
      req.account.addOrder(order).then(() => {
        res.send(order)
      }) 
    })
  })

// list orders
orderRouter.route('/')
  .get(function(req, res, next) {
    var account = req.account;

    account.getOrders({order: [['createdAt', 'DESC']]}).then(orders => {
      var newOrders = [];
      forEachAsync(orders, (next1, order, index1) => {
        order.getShipments().then(shipments => {
          order = order.toJSON();
          order.shipments = [];

          forEachAsync(shipments, (next2, shipment, index2) => {
            shipment.getOrderedProducts().then(products => {
              shipment = shipment.toJSON();
              shipment.orderedProducts = [];

              forEachAsync(products, (next3, product, index3) => {
                ProductPhoto.find({where: {order: 0, product_id: product.product_id}}).then(photo => {
                  product = product.toJSON();
                  product.primaryPhoto = photo.key;
                  shipment.orderedProducts.push(product);
                  next3();
                })
              }).then(() => {
                order.shipments.push(shipment);
                next2();
              })

            })
          }).then(() => {
            newOrders.push(order)
            next1()
          })
        }) 
      }).then(() => {
        res.send(newOrders)        
      })
    })
  })

// get order info
orderRouter.route('/:orderId')
  .get(function(req, res) {
    var account = req.account;

    account.getOrder({where: {id: req.params.orderId}}).then(order => {
      res.send(order)
    })
  });

// Update order
orderRouter.route('/:orderId')
  .put(function(req, res) {
    req.account.getOrder({where: {id: req.params.orderId}}).then(order => {
      order.update(req.body).then(newOrder => {
        res.send(newOrder)        
      })
    })
  });

// Delete order
orderRouter.route('/:orderId')
  .delete(function(req, res) {
    req.account.getOrders({where: {id: req.params.orderId}}).then(orders => {
      var order = orders[0];
      if (order) {
        Order.destroy({where: {id: req.params.orderId}}).then(() => {
          res.send('Order '+order.id+' has been deleted!');
        })
      } else {
        res.send('User is not authorized to delete this product')
      }
    })
  });

module.exports = orderRouter;

