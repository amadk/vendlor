var express = require('express');
var Address = require('../../db/models/index.js').Address;
var request = require('request');
var googleMapsKey = process.env.GOOGLEMAPSKEY;

var addressRouter = express.Router();

// create Address
addressRouter.route('/')
  .post(function(req, res) {
    var account = req.account;

    Address.create(req.body).then(address => {
      account.addAddress(address).then(() => {
        res.send(address);
      })
    })
  });

// list Addresss
addressRouter.route('/')
  .get(function(req, res, next) {
    var account = req.account;

    account.getAddresses().then(addresses => {
      res.send(addresses)
    })
  })

// get Address options
addressRouter.route('/googlemaps')
  .get(function(req, res) {
    console.log(req.query)
    request('https://maps.googleapis.com/maps/api/place/autocomplete/json?input='+req.query.q+'&&components=country:ae&key='+googleMapsKey, function (error, response, body) {
      console.log('error:', error); // Print the error if one occurred
      // console.log('body:', body); // Print the HTML for the Google homepage.
      res.send(body)
    });
  });

// get Address info
addressRouter.route('/:addressId')
  .get(function(req, res) {
    var account = req.account;

    account.getAddress({where: {id: req.params.addressId}}).then(address => {
      res.send(address)
    })
  });

// Update Address
addressRouter.route('/:addressId')
  .post(function(req, res) {
    req.account.getAddresses({where: {id: req.params.addressId}}).then(addresses => {
      addresses[0].update(req.body).then(newAddress => {
        res.send(newAddress)        
      })
    })
  });

// Delete Address
addressRouter.route('/:addressId')
  .delete(function(req, res) {
    Address.destroy({where: {id: req.params.addressId}}).then(() => {
      res.send('Address deleted!');
    })
  });

module.exports = addressRouter;

