var Shipment = require('../../db/models/index.js').Shipment;
var OrderedProduct = require('../../db/models/index.js').OrderedProduct;
var Account = require('../../db/models/index.js').Account;
var Op = require('sequelize').Op;

var forEachAsync = require('forEachAsync').forEachAsync;
var CronJob = require('cron').CronJob;
var moment = require('moment-timezone');

exports.completeShipment = () => {
  console.log('cron job start', moment().format('YYYY-MM-DD hh:mm:ss'))
  var job = new CronJob('0 * * * *', () => {
    console.log('cron job run', moment().format('YYYY-MM-DD hh:mm:ss'))
    Shipment.findAll({
      where: {
        status: 'delivered',
        type: 'order',
        deliveredDate: {
          [Op.lte]: moment(moment().tz('UTC').valueOf() - 86400000).format('YYYY-MM-DD hh:mm:ss').toString()
        }
      }
    }).then(shipments => {
      if (shipments.length > 0) {
        forEachAsync(shipments, (next1, shipment, index1) => {
          shipment.getOrderedProducts({
            where: {
              [Op.or]: [
                {status: {[Op.eq]: 'ordered'}},
                {status: {[Op.eq]: 'return_cancelled'}}
              ]
            }
          }).then(products => {
            forEachAsync(products, (next2, product, index2) => {
              updateProduct(shipment, product, next2)
            }).then(() => {
              shipment.update({status: 'complete'}).then(() => {
                console.log('updated ordered product');
                next1()              
              })
            })

          })
        }).then(() => {
          console.log('updated shipments')
        })
      }
    })
  }, function () {
    console.log('cron job stopped')
  }, true, 'Asia/Dubai');
}


var updateProduct = (shipment, product, callback) => {
  if (shipment.status === 'delivered' && shipment.type === 'order'
    && (moment(shipment.deliveredDate).valueOf() <= moment().tz('UTC').valueOf() - 86400000)
    && (product.status ==='ordered' || product.status === 'return_cancelled')) {
    console.log('updated product to complete')
    Account.find({where: {id: product.seller_id}}).then(seller => {
      if (seller) {
        seller.update({
          availableBalance: seller.availableBalance + (product.price*0.9),
          pendingBalance: seller.pendingBalance - (product.price*0.9)
        })
        .then(() => {
          product.update({returnCart: false, status: 'return_closed'}).then(() => {
            callback()
          })
        })
      } else {
        callback()
      }
    })
  } else {
    callback()
  }
}

var updateShipment = (shipment, callback) => {
  if (shipment.status === 'delivered' && shipment.type === 'order'
    && (moment(shipment.deliveredDate).valueOf() <= moment().tz('UTC').valueOf() - 86400000)) {
    
    console.log('updated shipment to complete')
    shipment.update({status: 'complete'}).then(callback)
  } else {
    callback()
  }
}

exports.updateProduct = updateProduct
exports.updateShipment = updateShipment



