var express = require('express');
var OrderedProduct = require('../../db/models/index.js').OrderedProduct;
var Account = require('../../db/models/index.js').Account;
var forEachAsync = require('forEachAsync').forEachAsync;

var orderedProductRouter = express.Router({mergeParams: true});


// use orderedProduct
orderedProductRouter.use((req, res, next) => {
  var orderId = req.params.orderId;
  var shipmentId = req.params.shipmentId;

  req.account.getOrders({where: {id: orderId}}).then(orders => {
    var order = orders[0];
    if (order) {
      req.order = order;
      req.order.getShipments({where: {id: shipmentId}}).then(shipments => {
        var shipment = shipments[0];
        if (shipment) {
          req.shipment = shipment;
          next();
        } else {
          res.send('shipment not found')
        }
      })
    } else {
      res.send('order not found')
    }
  })
});

// create orderedProduct
orderedProductRouter.route('/')
  .post(function(req, res) {


    req.body.status = 'ordered'
    OrderedProduct.create(req.body).then(orderedProduct => {
      req.shipment.addOrderedProduct(orderedProduct).then(() => {
        req.order.addOrderedProduct(orderedProduct).then(() => {
          Account.find({where: {id: req.body.seller_id}}).then(seller => {
            seller.addSellerProduct(orderedProduct).then(() => {
              req.account.addBuyerProduct(orderedProduct).then(() => {
                
                seller.update({pendingBalance: seller.pendingBalance+(orderedProduct.price*0.9)}).then(() => {

                  req.account.getCartProduct({where: {id: req.body.product_id}}).then(products => {
                    var product = products[0];
                    if (product) {
                      req.account.removeCartProduct(product).then(() => {
                        product.update({quantity: product.quantity-1}).then(() => {
                          res.send(orderedProduct)                
                        })
                      })
                    } else {
                      console.log('product not found in Cart')
                      res.send(orderedProduct)
                    }
                  })
                })                
              })
            })
          })
        })
      })
    })

  });

// list orderedProducts
orderedProductRouter.route('/')
  .get(function(req, res, next) {
    var shipment = req.shipment;

    shipment.getOrderedProducts().then(orderedProducts => {
      res.send(orderedProducts)
    })
  })

// get orderedProduct info
orderedProductRouter.route('/:orderedProductId')
  .get(function(req, res) {
    var shipment = req.shipment;

    shipment.getOrderedProduct({where: {id: req.params.orderedProductId}}).then(orderedProduct => {
      res.send(orderedProduct)
    })
  });

// Update orderedProduct
orderedProductRouter.route('/:orderedProductId')
  .post(function(req, res) {
    req.shipment.getOrderedProducts({where: {id: req.params.orderedProductId}}).then(orderedProducts => {
      var orderedProduct = orderedProducts[0];
      if (orderedProduct) {
        orderedProduct.update(req.body).then(newOrderedProduct => {

          if (req.body.status === 'order_cancelled' && req.shipment.status === 'order_received') {
            Account.find({where: {id: orderedProduct.seller_id}}).then(seller => {
              var pendingBalance = seller.pendingBalance - (orderedProduct.price*0.9)
              seller.update({pendingBalance: pendingBalance}).then(() => {
                req.order.update({
                  subtotal: req.order.subtotal - orderedProduct.price,
                  grandTotal: req.order.grandTotal - orderedProduct.price
                })
                .then(() => {
                  req.shipment.getOrderedProducts().then(newOrderedProducts => {
                    var cancelShipment = newOrderedProducts.length === newOrderedProducts.filter(product=>product.status === 'order_cancelled').length
                    console.log(cancelShipment, newOrderedProducts.length, newOrderedProducts[0].status)
                    var amountToCollect =  cancelShipment ? 0 : req.shipment.amountToCollect - orderedProduct.price
                    req.shipment.update({
                      amountToCollect: amountToCollect,
                      status: cancelShipment ? 'cancelled' : req.shipment.status
                    })
                    .then(() => {
                      res.send(newOrderedProduct)
                    })
                  })
                })
              })
            })

          } else if (req.body.status === 'returned') {
            Account.find({where: {id: orderedProduct.seller_id}}).then(seller => {
              seller.update({
                pendingBalance: seller.pendingBalance - (orderedProduct.price*0.9)
              }).then(() => {
                req.account.update({
                  pendingBalance: Number(req.account.pendingBalance) + orderedProduct.price
                })
                .then(() => {
                  req.order.update({
                    subtotal: req.order.subtotal - orderedProduct.price,
                    grandTotal: req.order.grandTotal - orderedProduct.price
                  })
                  .then(() => {
                    res.send(newOrderedProduct)
                  })
                })                
              })
            })

          } else if (req.body.status === 'return_cancelled' && req.shipment.type === 'return') {
            Account.find({where: {id: orderedProduct.seller_id}}).then(seller => {
              seller.update({
                pendingBalance: seller.pendingBalance + (orderedProduct.price*0.9)
              }).then(() => {
                req.account.update({
                  pendingBalance: req.account.pendingBalance - orderedProduct.price,
                })
                .then(() => {
                  req.order.update({
                    subtotal: req.order.subtotal + orderedProduct.price,
                    grandTotal: req.order.grandTotal + orderedProduct.price
                  })
                  .then(() => {
                    res.send(newOrderedProduct)
                  })
                })
              })
            })

          } else {
            res.send(newOrderedProduct)
          }            
        })
      } else {
        res.send('Ordered product not found')
      }
    })
  });

// Delete orderedProduct
orderedProductRouter.route('/:orderedProductId')
  .delete(function(req, res) {
    OrderedProduct.destroy({where: {id: req.params.orderedProductId}}).then(() => {
      res.send('orderedProduct deleted!');
    })
  });

module.exports = orderedProductRouter;

