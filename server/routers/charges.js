var express = require('express');
var Charge = require('../../db/models/index.js').Charge;
var Refund = require('../../db/models/index.js').Refund;
// var Address = require('../../db/models/index.js').Address;
var forEachAsync = require('forEachAsync').forEachAsync;

var chargeRouter = express.Router({mergeParams: true});


// use charge
chargeRouter.use(function(req, res, next) {
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

// create charge
chargeRouter.route('/')
  .post(function(req, res) {
    Charge.create(req.body).then(charge => {
      req.order.addCharge(charge).then(() => {
        res.send(charge)
      })
    })
  });

// list charges
chargeRouter.route('/')
  .get(function(req, res, next) {
    req.order.getCharges().then(charges => {
      res.send(charges)
    })
  })

// get charge info
chargeRouter.route('/:chargeId')
  .get(function(req, res) {
    var order = req.order;

    order.getCharges({where: {id: req.params.chargeId}}).then(charge => {
      var charge = charges[0];
      if (charge) {
        res.send(charge)        
      } else {
        res.send('charge not found')
      }
    })
  });

// Update charge
chargeRouter.route('/:chargeId')
  .post(function(req, res) {
    var refundIds = req.body.refunds;

    req.order.getCharges({where: {id: req.params.chargeId}}).then(charges => {
      var charge = charges[0];
      if (charge) {
        if (refundIds && refundIds.length > 0) {
          forEachAsync(refundIds, (next, refundId, index) => {
            Refund.find({where: {id: refundId}}).then(refund => {
              charge.addRefund(refund).then(() => {
                next();
              })
            })
          }).then(() => {
            res.send(charge)
          })
        } else {
          charge.update(req.body).then(newCharge => {
            res.send(newCharge)        
          });          
        }
      } else {
        res.send('charge not found')
      }
    })
  });

// Delete charge
chargeRouter.route('/:chargeId')
  .delete(function(req, res) {
    Charge.destroy({where: {id: req.params.chargeId}}).then(() => {
      res.send('charge deleted!');
    })
  });

module.exports = chargeRouter;

