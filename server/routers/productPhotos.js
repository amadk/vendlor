var express = require('express');
var Product = require('../../db/models/index.js').Product;
var ProductPhoto = require('../../db/models/index.js').ProductPhoto;
var uploadPhotos = require('../lib/utilities.js').uploadPhotos;
var removePhotos = require('../lib/utilities.js').removePhotos;
var multer = require('multer');
var forEachAsync = require('forEachAsync').forEachAsync;


const upload = multer({
  storage: multer.memoryStorage(),
  // file size limitation in bytes
  limits: { fileSize: 52428800 },
});


var productPhotoRouter = express.Router({mergeParams: true});


// use productPhotos
productPhotoRouter.use(function(req, res, next) {
    var productId = req.params.productId;
    console.log(productId)
    Product.find({where: {id: productId}}).then(product => {
      if (product) {
        req.product = product;
        next();
      } else {
        res.send('product not found');
      }
    })
  })

// create productPhoto
productPhotoRouter.route('/')
  .post(upload.any(), function(req, res) {

    if (req.files) {
      req.product.getProductPhotos({order: [['order', 'DESC']]}).then(productPhotos => {
        if (productPhotos.length < 6) {
          var cutoffAmount = 6 - (productPhotos.length + req.files.length)
          if (cutoffAmount > 0) { cutoffAmount = 6 }
          var photosToUpload = req.files.slice(0, cutoffAmount)
          uploadPhotos(photosToUpload, results => {
            var photosToSave = results.map((photoKey, index) => {
              return {
                order: productPhotos.length+index,
                key: photoKey
              }
            })
            console.log(photosToSave)
            ProductPhoto.bulkCreate(photosToSave).then(newProductPhotos => {
              req.product.addProductPhotos(newProductPhotos).then(() => {
                res.send(newProductPhotos);              
              })
            })
          })
        } else {
          res.send('Product photo album full')
        }
      })
    } else {
      res.send('no photos to upload')
    }
  });

// list productPhotos
productPhotoRouter.route('/')
  .get(function(req, res, next) {
    var product = req.product;

    product.getProductPhotos({order: [['order', 'ASC']]}).then(productPhotos => {
      res.send(productPhotos)
    })
  })

// get productPhoto info
productPhotoRouter.route('/:productPhotoId')
  .get(function(req, res) {
    var product = req.product;

    product.getProductPhotos({where: {id: req.params.productPhotoId}}).then(productPhotos => {
      res.send(productPhotos[0])
    })
  });

// Delete productPhoto
productPhotoRouter.route('/delete')
  .post(function(req, res) {
    if (req.body.photos.length > 0) {
      removePhotos(req.body.photos, removedPhotoKeys => {
        ProductPhoto.destroy({where: {key: removedPhotoKeys}}).then(() => {
          req.product.getProductPhotos({order: [['order', 'ASC']]}).then(productPhotos => {
            forEachAsync(productPhotos, (next, productPhoto, index) => {
              productPhoto.update({order: index}).then(() => {
                next();
              })
            }).then(() => {
              res.send('product photos deleted!');              
            })
          })
        })
      })
    } else {
      res.send('no photos to be removed')
    }
  });

// Update productPhoto
productPhotoRouter.route('/:productPhotoId')
  .post(function(req, res) {
    req.product.getProductPhotos({where: {id: req.params.productPhotoId}}).then(productPhotos => {
      productPhotos[0].update(req.body).then(newProductPhoto => {
        res.send(newProductPhoto)        
      })
    })
  });

module.exports = productPhotoRouter;

