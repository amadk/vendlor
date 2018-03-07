var express = require('express');
var Refund = require('../../db/models/index.js').Refund;
var forEachAsync = require('forEachAsync').forEachAsync;

var refundRouter = express.Router({mergeParams: true});


// use refund
refundRouter.use((req, res, next) => {
  var orderId = req.params.orderId;
  var chargeId = req.params.chargeId;

  req.account.getOrders({where: {id: orderId}}).then(orders => {
    var order = orders[0];
    if (order) {
      req.order = order;
      req.order.getcharges({where: {id: chargeId}}).then(charges => {
        var charge = charges[0];
        if (charge) {
          req.charge = charge;
          next();
        } else {
          res.send('charge not found')
        }
      })
    } else {
      res.send('order not found')
    }
  })
});

// create refund
refundRouter.route('/')
  .post(function(req, res) {
    Refund.create(req.body).then(refund => {
      req.charge.addRefund(refund).then(() => {
        res.send(refund);
      })
    })
  });

// list refunds
refundRouter.route('/')
  .get(function(req, res, next) {
    var charge = req.charge;

    charge.getRefunds().then(refunds => {
      res.send(refunds)
    })
  })

// get refund info
refundRouter.route('/:refundId')
  .get(function(req, res) {
    var charge = req.charge;

    charge.getRefund({where: {id: req.params.refundId}}).then(refund => {
      res.send(refund)
    })
  });

// Update refund
refundRouter.route('/:refundId')
  .post(function(req, res) {
    req.charge.getRefunds({where: {id: req.params.refundId}}).then(refunds => {
      var refund = refunds[0];
      if (refund) {
        refund.update(req.body).then(newRefund => {
          res.send(newRefund)   
        })
      } else {
        res.send('Ordered product not found')
      }
    })
  });

// Delete refund
refundRouter.route('/:refundId')
  .delete(function(req, res) {
    refund.destroy({where: {id: req.params.refundId}}).then(() => {
      res.send('refund deleted!');
    })
  });

module.exports = refundRouter;

