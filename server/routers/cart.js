var express = require('express');
var Cart = require('../../db/models/index.js').Cart;
var Product = require('../../db/models/index.js').Product;
var ProductPhoto = require('../../db/models/index.js').ProductPhoto;


var cartRouter = express.Router();

// add cart item
cartRouter.route('/:productId')
  .post(function(req, res) {
    var account = req.account;
    console.log(account.id, 'carts.js', 13)

    account.getCartProduct({where: {id: req.params.productId}}).then(cartProducts => {
      Product.find({where: {id: req.params.productId}}).then(product => {
        var cartProduct = cartProducts[0];
        account.getProducts({where: {id: product.id}}).then(products => {
          var accountProduct = products[0];
          if (accountProduct) {
            res.send('Seller cannot buy owned product')
          } else {
            if (cartProduct) {
              if (product.quantity >= (cartProduct.cart.quantity+req.body.quantity)) {
                cartProduct.cart.update({quantity: cartProduct.cart.quantity+req.body.quantity}).then(() => {
                  res.send(req.body.quantity+' items added to cart')
                })
              } else {
                var quantity = product.quantity-cartProduct.cart.quantity;
                cartProduct.cart.update({quantity: product.quantity}).then(() => {
                  res.send(quantity+' items added to cart')
                })
              }
            } else if (!cartProduct && product.quantity >= req.body.quantity) {
              console.log(account.addCartProduct)
              account.addCartProduct(product, {through: {quantity: req.body.quantity}}).then(() => {
                res.send('Added to cart')
              })
            } else {
              res.send('Product cannot be added')
            }
          }
        })
      })
    }) 
  });

// list cart items
cartRouter.route('/')
  .get(function(req, res) {
    var account = req.account;

    account.getCartProduct().then(products => {
      ProductPhoto.findAll({where: {order: 0, product_id: products.map(product=>product.id)}}).then(productPhotos => {
        products = products.map((product, index) => {
          var newProduct = product.toJSON();
          newProduct.primaryPhoto = productPhotos.length > 0 ? productPhotos[index].key : '';
          return newProduct;
        })
        console.log(productPhotos.map(productPhoto=>productPhoto.key))
        res.send(products)
      })
    })
  })


// Update cart item
cartRouter.route('/:productId')
  .put(function(req, res) {
    var account = req.account;

    account.getCartProduct({where: {id: req.params.productId}}).then(products => {
      var product = products[0];
      product.cart.update({quantity: req.body.quantity}).then(product => {
        res.send('updated cart')        
      })
    })
  });

// remove cart item
cartRouter.route('/:productId')
  .delete(function(req, res) {
    var account = req.account;

    account.getCartProduct({where: {id: req.params.productId}}).then(products => {
      var product = products[0];
      product.cart.destroy().then(() => {
        res.send('removed from cart')        
      })
    })
  });

module.exports = cartRouter;

