var express = require('express');
var Payout = require('../../db/models/index.js').Payout;
var BankAccount = require('../../db/models/index.js').BankAccount;

var payoutRouter = express.Router();

// create payout
payoutRouter.route('/')
  .post(function(req, res) {
    var availableBalance = req.account.availableBalance;
    req.account.getBankAccounts({where: {id: req.body.destination}}).then(banks => {
      var bank = banks[0];
      if (bank) {
        if (bank.status === 'verified') {
          if (availableBalance >= req.body.amount) {
            req.account.update({availableBalance: availableBalance - req.body.amount}).then(() => {
              Payout.create(req.body).then(payout => {
                req.account.addPayout(payout).then(() => {
                  res.send(payout);
                })
              })              
            })
          } else {
            res.send({error: true, serverMessage: 'Amount exceeded available balance'})
          }
        } else {
          res.send({error: true, serverMessage: 'Bank not verified'})
        }        
      } else {
        res.send({error: true, serverMessage: 'Bank not found'})
      }
    })
  });

// list payouts
payoutRouter.route('/')
  .get(function(req, res, next) {
    req.account.getPayouts().then(payouts => {
      res.send(payouts)
    })
  })

// get payout info
payoutRouter.route('/:payoutId')
  .get(function(req, res) {
    req.account.getPayouts({where: {id: req.params.payoutId}}).then(payouts => {
      var payout = payouts[0];
      if (payout) {
        res.send(payout)
      }
    })
  });

// Update payout
payoutRouter.route('/:payoutId')
  .post(function(req, res) {
    req.account.getPayouts({where: {id: req.params.payoutId}}).then(payouts => {
      var payout = payouts[0];
      if (payout) {
        payout.update(req.body).then(newPayout => {
          res.send(newPayout)        
        })
      }
    })
  });

// Delete payout
payoutRouter.route('/:payoutId')
  .delete(function(req, res) {
    Payout.destroy({where: {id: req.params.payoutId}}).then(() => {
      res.send('payout deleted!');
    })
  });

module.exports = payoutRouter;

