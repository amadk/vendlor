var express = require('express');
var Account = require('../../db/models/index.js').Account;
const bcrypt = require('bcryptjs');
var auth = require('basic-auth');

var accountRouter = express.Router();


accountRouter.route('/signup')
  .post(function(req, res) {
    const { fullName, email, mobile, password } = req.body;

    if (!(email && password && mobile && fullName)) {
      return res.send({authenticated: false, serverMessage: 'Required data is missing'});
    }

    Account.find({where: {email: email}}).then(account => {
      if (!account) {
        bcrypt.genSalt(12, function(err, salt) {
          bcrypt.hash(password, salt, function(err, hash) {
            Account.create({
              email: email,
              hash: hash,
              salt: salt,
              fullName: fullName,
              mobile: mobile
            }).then(newAccount => {
              req.session.regenerate(() => {
                req.session.accountId = newAccount.id;
                res.send({authenticated: true})
              })
            })
          });
        });
      } else {
        res.send({authenticated: false, error: true, serverMessage: 'This email is already registered. Please login.'});
      }
    })
  });

// Login account
accountRouter.route('/login')
  .post(function(req, res, next) {
    var email = req.body.email;
    var password = req.body.password;

    if (!(email && password)) {
      return res.send({authenticated: false});
    }

    Account.find({where: {email: email}}).then(account => {
      if (account) {
        bcrypt.compare(password, account.hash, (err, match) => {
          if (match) {
            req.session.regenerate(() => {
              req.session.accountId = account.id;
              res.send({authenticated: true});
            });
          } else {
            console.log('error:', err)
            res.send({authenticated: false, error: true, serverMessage: err})
          }
        });
      } else {
        res.send({authenticated: false});
      }
    })
  })

// Sign out account
accountRouter.route('/signout')
  .get(function(req, res, next) {
    req.session.destroy(() => {
      res.redirect('/login');
    })
  })

// get account info
accountRouter.route('/')
  .get(function(req, res) {
    var account = req.account.toJSON();
    delete account.hash;
    delete account.salt;

    res.send(account);
  });

// Update account
accountRouter.route('/')
  .post(function(req, res) {
    delete req.body.salt;
    delete req.body.hash;

    req.account.update(req.body).then(account => {
      res.send('Account updated!')
    })
   
  });

// Delete account
accountRouter.route('/')
  .delete(function(req, res) {
    req.account.delete().then(() => {
      res.send('Account deleted')
    })
  });

module.exports = accountRouter;

