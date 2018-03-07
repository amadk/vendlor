var express = require('express');

var Account = require('../../db/models/index.js').Account;
var Product = require('../../db/models/index.js').Product;
var BankAccount = require('../../db/models/index.js').BankAccount;
var Payout = require('../../db/models/index.js').Payout;
var Shipment = require('../../db/models/index.js').Shipment;
var OrderedProduct = require('../../db/models/index.js').OrderedProduct;
var forEachAsync = require('forEachAsync').forEachAsync;
var CronJob = require('cron').CronJob;



var adminRouter = express.Router();

var Model = {
  sellers: Account,
  products: Product,
  bankAccounts: BankAccount,
  payouts: Payout,
  shipments: Shipment
}


adminRouter.route('/:items')
  .post(function(req, res, next) {
    var searchParams = { order: [['createdAt', 'DESC']] };
    if (Object.keys(req.body).length > 0) { Object.assign(searchParams, {where: req.body}) }

    Model[req.params.items].findAll(searchParams).then(items => {
      var newItems = [];
      if (req.params.items === 'products') {
        forEachAsync(items, (next, product, index) => {
          product.getProductPhotos({order: [['order', 'DESC']]}).then(photos => {
            product = product.toJSON();
            product.photos = photos.map(photo=>('https://s3.ap-south-1.amazonaws.com/dibba/'+photo.key));
            newItems.push(product)
            next()
          })
        }).then(() => {
          res.send(newItems);          
        })
      } else if (req.params.items === 'sellers') {
        var adminIndex = items.map(item=>item.email).indexOf('amadxk@gmail.com');
        if (adminIndex > -1) {
          items.splice(adminIndex, 1);
        }
        res.send(items)
      } else {
        res.send(items)
      }
    })
  })

adminRouter.route('/:items/:itemId')
  .post(function(req, res, next) {
    const { items, itemId } = req.params
    if (items === 'shipments' && req.body.deliveredDate) { req.body.status = 'delivered' }

    if (Object.keys(req.body).length > 0) {

      Model[items].find({where: {id: itemId}}).then(item => {
        var deliveredDate = item.deliveredDate;
        item.update(req.body).then(updatedItem => {
          console.log('preparing to create cron job')
          console.log(items === 'shipments', !!req.body.deliveredDate, !deliveredDate, deliveredDate)
          if (items === 'shipments' && req.body.deliveredDate && !deliveredDate) {
            if (updatedItem.type === 'order') {
              // create cron job
              console.log('creating cron job')
              var job = new CronJob(new Date(Date.parse(req.body.deliveredDate)+86400000), ()=>(job.stop()), function () {

                console.log('cron job stopped')
                updatedItem.getOrderedProducts().then(products => {
                  forEachAsync(products, (next, product, index) => {
                    Account.find({where: {id: product.seller_id}}).then(seller => {
                    console.log('cron job:')
                    console.log('account email:', req.account.email)
                    console.log('seller email:', seller.email)
                    console.log('product status:', product.status)


                      if (seller && (product.status === 'ordered' || product.status === 'return_cancelled')) {
                        seller.update({
                          availableBalance: seller.availableBalance + (product.price*0.9),
                          pendingBalance: seller.pendingBalance - (product.price*0.9)
                        })
                        .then(() => {
                          product.update({returnCart: false, status: 'return_closed'}).then(() => {
                            next()
                          })
                        })
                      } else {
                        next()
                      }
                    })
                  }).then(() => {
                    console.log('cron job completed for shipment: ', updatedItem.id)
                  })
                })
              }, true, 'Asia/Dubai');

              res.send(updatedItem)
              
            } else if (updatedItem.type === 'return') {
              updatedItem.getOrderedProducts().then(products => {
                forEachAsync(products, (next, product, index) => {
                  Account.find({where: {id: product.buyer_id}}).then(buyer => {
                    buyer.update({
                      availableBalance: buyer.availableBalance + product.price,
                      pendingBalance: buyer.pendingBalance - product.price
                    }).then(next)
                  })
                }).then(() => {
                  res.send(updatedItem)
                })
              })
            }
          } else {
            res.send(updatedItem)            
          }
        })
      })

    } else {
      res.send('no update params')
    }

  })

/*
// list unverified products
adminRouter.route('/products')
  .get(function(req, res, next) {
    Product.findAll({where: {verification: 'Pending'}}).then(products => {
      res.send(products);
    })
  })

adminRouter.route('/products/:productId')
  .post(function(req, res, next) {
    Product.find({where: {id: req.params.productId}}).then(product => {
      product.update({verification: req.body.verification}).then(updatedProduct => {
        res.send(updatedProduct)
      })
    })
  })

// list unverified seller accounts
adminRouter.route('/sellers')
  .get(function(req, res, next) {
    Account.findAll({where: {sellerVerified: false}}).then(sellers => {
      res.send(sellers);
    })
  })

adminRouter.route('/sellers/:sellerId')
  .post(function(req, res, next) {
    Account.find({where: {id: req.params.sellerId}}).then(account => {
      account.update({sellerVerified: req.body.sellerVerified}).then(updatedSeller => {
        res.send(updatedSeller)
      })
    })
  })

// list unverified bank accounts
adminRouter.route('/bank_accounts')
  .get(function(req, res, next) {
    BankAccount.findAll({where: {verified: false}}).then(bankAccounts => {
      res.send(bankAccounts);
    })
  })

adminRouter.route('/bank_accounts/:bankId')
  .post(function(req, res, next) {
    BankAccount.find({where: {id: req.params.bankId}}).then(bankAccount => {
      bankAccount.update({verified: req.body.verified}).then(updatedBank => {
        res.send(updatedBank)
      })
    })
  })


// list payouts to be transferred
adminRouter.route('/payouts')
  .get(function(req, res, next) {
    Payout.findAll({where: {status: 'Payout Created'}}).then(payouts => {
      res.send(payouts);
    })
  })

adminRouter.route('/payouts/:payoutId')
  .post(function(req, res, next) {
    Payout.find({where: {id: req.params.payoutId}}).then(payout => {
      payout.update({status: req.body.status}).then(updatedPayout => {
        res.send(updatedPayout)
      })
    })
  })


// list payouts to be transferred
adminRouter.route('/shipments')
  .get(function(req, res, next) {
    Shipment.findAll({where: {status: 'Order Received'}}).then(shipments => {
      res.send(shipments);
    })
  })

adminRouter.route('/shipments/:shipmentId')
  .post(function(req, res, next) {
    Shipment.find({where: {id: req.params.shipmentId}}).then(shipment => {
      shipment.update({status: req.body.status}).then(updatedShipment => {
        res.send(updatedShipment)
      })
    })
  })
*/

module.exports = adminRouter;

