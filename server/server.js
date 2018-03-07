require('babel-register')({ ignore: /\/(build|node_modules)\//, presets: ['react', 'es2015'] });

import path from 'path';
import { Server } from 'http';
import Express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter as Router } from 'react-router-dom';
var bodyParser = require('body-parser');
var session = require('express-session');
var App = require('../client/src/components/App.jsx').default;
require('dotenv').config();
var Account = require('../db/models/index.js').Account;
var Product = require('../db/models/index.js').Product;
const uuidv4 = require('uuid/v4');

var accountRouter = require('./routers/accounts.js')
var addressRouter = require('./routers/addresses.js')
var cardRouter = require('./routers/cards.js')
var bankAccountRouter = require('./routers/bankAccounts.js')
var orderRouter = require('./routers/orders.js')
var productRouter = require('./routers/products.js')
var productPhotoRouter = require('./routers/productPhotos.js')
var cartRouter = require('./routers/cart.js')
var shipmentRouter = require('./routers/shipments.js')
var orderedProductRouter = require('./routers/orderedProducts.js')
var chargeRouter = require('./routers/charges.js')
var refundRouter = require('./routers/refunds.js')
// var balanceTransactionRouter = require('./routers/balanceTransactions.js')
var payoutRouter = require('./routers/payouts.js')

var adminRouter = require('./routers/admin.js')
var OrderedProduct = require('../db/models/index.js').OrderedProduct;
var ProductPhoto = require('../db/models/index.js').ProductPhoto;
var forEachAsync = require('forEachAsync').forEachAsync;

(function () {
  var log = console.log;
  console.log = function () {
    if (process.env.NODE_ENV !== 'production') {
      log.apply(this, Array.prototype.slice.call(arguments));
    }
  };
}());

const app = new Express();
const server = new Server(app);

var sessionMiddleware = session({
  secret: 'shesellsseashellsattheseashore',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: new Date(Date.now() + 2628000000)
  }
})

app.use(sessionMiddleware);

// use ejs templates
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../client/views'));

// define the folder that will be used for static assets
app.use(Express.static(path.join(__dirname, '../client/assets')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

if (process.env.NODE_ENV === 'production') {
  app.get('*.js', function (req, res, next) {
    req.url = req.url + '.gz';
    res.set('Content-Encoding', 'gzip');
    next();
  });  
}

app.use('/', (req, res, next) => {
  if (req.session.accountId) {
    Account.find({where: {id: req.session.accountId}}).then(account => {
      req.account = account;
      next()
    })
  } else {
    next()
  }
})

var adminAccounts = ['amadxk@gmail.com'];

app.get('/api/auth/isloggedin', (req, res) => {
  res.send({
    isLoggedIn: !!req.session.accountId,
    userType: !req.account ? 'user' : (adminAccounts.indexOf(req.account.email) === -1 ? 'user' : 'admin')
  })
})

app.get('/api/orderedProducts/return', (req, res) => {
  OrderedProduct.findAll({where: {returnCart: true}})
  .then(products => {
    var results = []
    forEachAsync(products, (next, product, index) => {
      ProductPhoto.find({where: {order: 0, product_id: product.product_id}}).then(photo => {
        product = product.toJSON();
        product.primaryPhoto = photo.key;
        results.push(product)
        next();
      })
    }).then(() => {
      res.send(results)
    })
  })
})


app.use('/api/admin', adminRouter);

app.use('/api/accounts', accountRouter);
app.use('/api/addresses', addressRouter);

app.use('/api/products/:productId/photos', productPhotoRouter);
app.use('/api/products', productRouter);

app.use('/api/cards', cardRouter);
app.use('/api/bank_accounts', bankAccountRouter);

app.use('/api/payouts', payoutRouter);

app.use('/api/orders/:orderId/shipments/:shipmentId/products', orderedProductRouter);
app.use('/api/orders/:orderId/shipments', shipmentRouter);
app.use('/api/orders/:orderId/charges/:chargeId/refunds', refundRouter);
app.use('/api/orders/:orderId/charges', chargeRouter);
app.use('/api/orders', orderRouter);

app.use('/api/cart', cartRouter);

// app.use('/api/balance_transactions', balanceTransactionRouter);





// universal routing and rendering
app.get('*', (req, res) => {

  let markup = '';
  let status = 200;

  const context = {};
  markup = renderToString(
    <Router location={req.url} context={context}>
      <App />
    </Router>
  );

  // context.url will contain the URL to redirect to if a <Redirect> was used
  if (context.url) {
    return res.redirect(302, context.url);
  }

  if (context.is404) {
    status = 404;
  }

  return res.status(status).render('index', { markup });
});

// start the server
const port = process.env.PORT;

server.listen(port, (err) => {
  if (err) {
    return console.error(err);
  }
  console.log('server running on port ' + port)
})