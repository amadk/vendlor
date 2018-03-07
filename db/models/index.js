// This file makes all join table relationships
const Sequelize = require('sequelize');

var db = process.env.DB;
var dbUser = process.env.DBUSER;
var dbPassword = process.env.DBPASSWORD;
var dbHost = process.env.DBHOST;

const sequelize = new Sequelize(db, dbUser, dbPassword, {
  dialect: 'mysql',
  operatorsAliases: Sequelize.Op,
  host: dbHost,
  logging: false,
  dialectOptions: { decimalNumbers: true }
});

const Account = require('./accounts.js')(sequelize, Sequelize);

const Address = require('./addresses.js')(sequelize, Sequelize);
const Product = require('./products.js')(sequelize, Sequelize);
const ProductPhoto = require('./productPhotos.js')(sequelize, Sequelize);

const Cart = require('./cart.js')(sequelize, Sequelize);
const Order = require('./orders.js')(sequelize, Sequelize);
const Shipment = require('./shipments.js')(sequelize, Sequelize);
const OrderedProduct = require('./orderedProducts.js')(sequelize, Sequelize);
const ShipmentProduct = require('./shipmentProducts.js')(sequelize, Sequelize);

const Charge = require('./charges.js')(sequelize, Sequelize);
const Refund = require('./refunds.js')(sequelize, Sequelize);
const BalanceTransaction = require('./balanceTransactions.js')(sequelize, Sequelize);
const Payout = require('./payouts.js')(sequelize, Sequelize);

const Card = require('./cards.js')(sequelize, Sequelize);
const BankAccount = require('./bankAccounts.js')(sequelize, Sequelize);

// -----------------------------------------------------Accounts-----------------------------------------------------------------------------------

// User-Product relationship:
Account.hasMany(Order, {
  foreignKey: 'account_id'
});

Order.belongsTo(Account, {
  foreignKey: 'account_id'
});

// User-Product relationship:
Order.hasMany(Shipment, {
  foreignKey: 'order_id'
});

Shipment.belongsTo(Order, {
  foreignKey: 'order_id'
});

// User-Product relationship:
Order.hasMany(OrderedProduct, {
  foreignKey: 'order_id'
});

OrderedProduct.belongsTo(Order, {
  foreignKey: 'order_id'
});

// User-Product relationship:
Account.hasMany(OrderedProduct, {
  foreignKey: 'seller_id',
  as: 'sellerProduct'
});

OrderedProduct.belongsTo(Account, {
  foreignKey: 'seller_id',
  as: 'sellerProduct'
});

// User-Product relationship:
Account.hasMany(OrderedProduct, {
  foreignKey: 'buyer_id',
  as: 'buyerProduct'
});

OrderedProduct.belongsTo(Account, {
  foreignKey: 'buyer_id',
  as: 'buyerProduct'
});



Shipment.belongsToMany(OrderedProduct, {through: 'shipmentProducts'});
OrderedProduct.belongsToMany(Shipment, {through: 'shipmentProducts'});


Account.hasMany(Payout, {
  foreignKey: 'account_id'
});

Payout.belongsTo(Account, {
  foreignKey: 'account_id'
});


Account.hasMany(BalanceTransaction, {
  foreignKey: 'account_id'
});

BalanceTransaction.belongsTo(Account, {
  foreignKey: 'account_id'
});

Order.hasMany(Charge, {
  foreignKey: 'order_id'
});

Charge.belongsTo(Order, {
  foreignKey: 'order_id'
});


Charge.hasMany(Refund, {
  foreignKey: 'charge_id'
});

Refund.belongsTo(Charge, {
  foreignKey: 'charge_id'
});




Product.belongsToMany(Account, { 
  as: 'cartProduct', 
  through: 'cart', 
  foreignKey: 'product_id' 
});

Account.belongsToMany(Product, {
  as: 'cartProduct',
  through: 'cart',
  foreignKey: 'account_id'
})


// User-Product relationship:
Account.hasMany(Address, {
  foreignKey: 'account_id'
});

Address.belongsTo(Account, {
  foreignKey: 'account_id'
});


Account.hasMany(Product, {
  foreignKey: 'account_id'
});

Product.belongsTo(Account, {
  foreignKey: 'account_id'
});


Product.hasMany(ProductPhoto, {
  foreignKey: 'product_id'
});

ProductPhoto.belongsTo(Product, {
  foreignKey: 'product_id'
});


Account.hasMany(Card, {
  foreignKey: 'account_id'
});

Card.belongsTo(Account, {
  foreignKey: 'account_id'
});


Account.hasMany(BankAccount, {
  foreignKey: 'account_id'
});

BankAccount.belongsTo(Account, {
  foreignKey: 'account_id'
});


// Create missing tables, if any
// sequelize.sync({force: true});
sequelize.sync();

exports.Account = Account;
exports.Address = Address;

exports.Card = Card;
exports.BankAccount = BankAccount;

exports.Product = Product;
exports.ProductPhoto = ProductPhoto;

exports.Cart = Cart;
exports.Order = Order;
exports.Shipment = Shipment;
exports.OrderedProduct = OrderedProduct;
exports.ShipmentProduct = ShipmentProduct;

exports.Charge = Charge;
exports.Refunds = Refund;
exports.BalanceTransaction = BalanceTransaction;
exports.Payout = Payout;



