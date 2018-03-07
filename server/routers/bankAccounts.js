var express = require('express');
var BankAccount = require('../../db/models/index.js').BankAccount;
var encrypt = require('../lib/utilities.js').encrypt;
var decrypt = require('../lib/utilities.js').decrypt;

var bankAccountRouter = express.Router();

// create bankAccount
bankAccountRouter.route('/')
  .post(function(req, res) {
    const { bankName, accountHolderName, accountNumber, iban, status } = req.body;
    BankAccount.create({
      bankName: bankName,
      accountHolderName: accountHolderName,
      accountNumber: encrypt(accountNumber, req.account.salt),
      accountNumberLast4: accountNumber.substr(-4),
      iban: encrypt(iban, req.account.salt),
      ibanLast4: iban.substr(-4),
      status: 'new'
    }).then(bankAccount => {
      req.account.addBankAccount(bankAccount).then(() => {
        bankAccount = bankAccount.toJSON();
        delete bankAccount.accountNumber;
        delete bankAccount.iban;
        res.send(bankAccount);
      })
    })
  });

// list bankAccounts
bankAccountRouter.route('/')
  .get(function(req, res, next) {
    req.account.getBankAccounts().then(bankAccounts => {
      res.send(bankAccounts)
    })
  })

// get bankAccount info
bankAccountRouter.route('/:bankAccountId')
  .get(function(req, res) {
    req.account.getBankAccounts({where: {id: req.params.bankAccountId}}).then(bankAccounts => {
      var bankAccount = bankAccounts[0];
      if (bankAccount) {
        bankAccount = bankAccount.toJSON();
        delete bankAccount.accountNumber;
        delete bankAccount.iban;
        res.send(bankAccount)        
      } else {
        res.send({error: true, serverMessage: 'Bank account not found'})
      }
    })
  });

// Update bankAccount
bankAccountRouter.route('/:bankAccountId')
  .post(function(req, res) {
    const { bankName, accountHolderName, accountNumber, iban } = req.body;

    req.account.getBankAccounts({where: {id: req.params.bankAccountId}}).then(bankAccounts => {
      var bankAccount = bankAccounts[0];
      if (bankAccount) {
        bankAccount.update({
          bankName: bankName,
          accountHolderName: accountHolderName,
          accountNumber: accountNumber.length === 0 ? bankAccount.accountNumber : encrypt(accountNumber, req.account.salt),
          accountNumberLast4: accountNumber.length === 0 ? bankAccount.accountNumberLast4 : accountNumber.substr(-4),
          iban: iban.length === 0 ? bankAccount.iban : encrypt(iban, req.account.salt),
          ibanLast4: iban.length === 0 ? bankAccount.ibanLast4 : iban.substr(-4),
          status: 'new'
        }).then(newBankAccount => {
          bankAccount = bankAccount.toJSON();
          delete bankAccount.accountNumber;
          delete bankAccount.iban;
          res.send(newBankAccount)        
        })
      } else {
        res.send({error: true, serverMessage: 'Bank account not found'})
      }
    })
  });

// Delete bankAccount
bankAccountRouter.route('/:bankAccountId')
  .delete(function(req, res) {
    BankAccount.destroy({where: {id: req.params.bankAccountId}}).then(() => {
      res.send('Bank account deleted!');
    })
  });

module.exports = bankAccountRouter;

