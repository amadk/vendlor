var express = require('express');
var Card = require('../../db/models/index.js').Card;

var cardRouter = express.Router();

// create card
cardRouter.route('/')
  .post(function(req, res) {
    var account = req.account;

    Card.create(req.body).then(card => {
      account.addCard(card).then(() => {
        res.send(card);
      })
    })
  });

// list cards
cardRouter.route('/')
  .get(function(req, res, next) {
    var account = req.account;

    account.getCards().then(cards => {
      res.send(cards)
    })
  })

// get card info
cardRouter.route('/:cardId')
  .get(function(req, res) {
    var account = req.account;

    account.getCard({where: {id: req.params.cardId}}).then(card => {
      res.send(card)
    })
  });

// Update card
cardRouter.route('/:cardId')
  .post(function(req, res) {
    account.getCard({where: {id: req.params.cardId}}).then(card => {
      Card.update(req.body).then(newCard => {
        res.send(newCard)        
      })
    })
  });

// Delete card
cardRouter.route('/:cardId')
  .delete(function(req, res) {
    Card.delete({where: {id: req.params.cardId}}).then(() => {
      res.send('Card deleted!');
    })
  });

module.exports = cardRouter;

