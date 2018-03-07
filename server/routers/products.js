var express = require('express');
var Product = require('../../db/models/index.js').Product;
var ProductPhoto = require('../../db/models/index.js').ProductPhoto;
var forEachAsync = require('forEachAsync').forEachAsync;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

var productRouter = express.Router();

// create product
productRouter.route('/')
  .post(function(req, res) {
    console.log(req.body, req.files)
  
    Product.create(req.body).then(product => {
      req.account.addProduct(product).then(() => {
        res.send(product);
      })
    })
  });

// list live products
productRouter.route('/')
  .get(function(req, res, next) {
    console.log(req.query)
    var findParams = {}
    if (req.query.category) {
      findParams.category = req.query.category
    } 
    if (req.query.search) {
      findParams.title = { [Op.like]: '%'+req.query.search+'%' }
    }
    Product.findAll({where: Object.assign({live: true, status: 'verified'}, findParams), order: [['createdAt', 'DESC']]}).then(products => {
      var newProducts = [];
      forEachAsync(products, (next, product, index) => {
        product.getProductPhotos({where: {order: 0}}).then(productPhotos => {
          var newProduct = product.toJSON();
          newProduct.primaryPhoto = productPhotos.length > 0 ? productPhotos[0].key : '';
          newProducts.push(newProduct);
          next();
        })
      }).then(() => {
        res.send(newProducts)
      })
    })
  })

// list user owned products
productRouter.route('/inventory')
  .get(function(req, res, next) {
    req.account.getProducts({order: [['createdAt', 'DESC']]}).then(products => {
      var newProducts = [];
      forEachAsync(products, (next, product, index) => {
        product.getProductPhotos({where: {order: 0}}).then(productPhotos => {
          var newProduct = product.toJSON();
          newProduct.primaryPhoto = productPhotos.length > 0 ? productPhotos[0].key : '';
          newProducts.push(newProduct);
          next();
        })
      }).then(() => {
        res.send(newProducts)
      })
    })
  })


// publish a product for selling
productRouter.route('/publish/:productId')
  .get(function(req, res) {

    req.account.getProducts({where: {id: req.params.productId}}).then(products => {
      var product = products[0];
      if (product) {
        product.update({
          live: true
        }).then(product => {
          res.send('product posted for selling')
        })
      } else {
        res.send('product not found')
      }
    })
  });
  

// get product info
productRouter.route('/:productId')
  .get(function(req, res) {
    Product.find({where: {id: req.params.productId}}).then(product => {
      if (product) {
        if ((product.live && product.status === 'verified') || product.account_id === req.account.id) {
          res.send(product);
        } else {
          res.send('product is not live')
        }
      } else {
        res.send('No product found')
      }
    })
  });



// Update product
productRouter.route('/:productId')
  .post(function(req, res) {
    
    req.account.getProducts({where: {id: req.params.productId}}).then(products => {
      var product = products[0];
      if (product) {
        req.body.verification = 'Pending'
        product.update(req.body).then(newProduct => {
          res.send(newProduct);
        })
      } else {
        res.send('no product found')
      }
    })
  });

// Delete product
productRouter.route('/:productId')
  .delete(function(req, res) {
    req.account.getProducts({where: {id: req.params.productId}}).then(products => {
      var product = products[0];
      product.destroy().then(() => {
        res.send('product deleted')
      })
    })
  });

module.exports = productRouter;

