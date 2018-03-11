var express = require('express');
var forEachAsync = require('forEachAsync').forEachAsync;
var Order = require('../../db/models/index.js').Order;
var Shipment = require('../../db/models/index.js').Shipment;
var OrderedProduct = require('../../db/models/index.js').OrderedProduct;
var ProductPhoto = require('../../db/models/index.js').ProductPhoto;

var orderedProduct = express.Router();

// list sales
orderedProduct.route('/')
  .get(function(req, res, next) {

    req.account.getSellerProduct({order: [['createdAt', 'DESC']]}).then(products => {
      var results = [];

      forEachAsync(products, (next, product, index) => {
          
        ProductPhoto.find({where: {order: 0, product_id: product.product_id}}).then(photo => {
          product.getShipments({order: [['createdAt', 'DESC']]}).then(shipments => {
            product = product.toJSON();
            product.primaryPhoto = photo.key;
            shipments.forEach(shipment => {
              var checkShipment = results.filter(result => result.id === shipmient.id)[0]
              if (!checkShipment) {
                results.push(shipment.toJSON())
                results[results.length-1].orderedProducts = [product];
              } else {
                checkShipment.orderedProducts.push(product)
              }
            })
            next();
          })
        })
      }).then(() => {
        res.send(results)
      })
    })
  })

// // get order info
// orderedProduct.route('/:orderedProductId')
//   .get(function(req, res) {
//     req.account.getOrderedProduct({where: {id: req.params.orderedProductId}}).then(orderedProduct => {
//       res.send(orderedProduct)
//     })
//   });

// // Update order
// orderedProduct.route('/:orderedProductId')
//   .put(function(req, res) {
//     req.account.getOrder({where: {id: req.params.orderedProductId}}).then(orderedProduct => {
//       orderedProduct.update(req.body).then(newOrderedProduct => {
//         res.send(newOrderedProduct)        
//       })
//     })
//   });

// // Delete order
// orderedProduct.route('/:orderedProductId')
//   .delete(function(req, res) {
//     OrderedProduct.destroy({where: {id: req.params.orderedProductId}}).then(() => {
//       res.send('order deleted!');
//     })
//   });

module.exports = orderedProduct;

