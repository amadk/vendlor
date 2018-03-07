const uuidv4 = require('uuid/v4');

module.exports = function(sequelize, Sequelize) {

  var Product = sequelize.define('products', {
    id: {
      type: Sequelize.UUID,
      defaultValue: () => {
        var arr = uuidv4().split('-');
        arr.pop();
        return 'pr_'+arr.join('');
      },
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.TEXT
    },
    quantity: {
      type: Sequelize.INTEGER
    },
    price: {
      type: Sequelize.DECIMAL(10, 2)
    },
    category: {
      type: Sequelize.STRING
    },
    condition: {
      type: Sequelize.STRING
    },
    live: {
      type: Sequelize.BOOLEAN
    },
    pickupAddressId: {
      type: Sequelize.STRING
    },
    weight: {
      type: Sequelize.INTEGER //kg
    },
    age: {
      type: Sequelize.STRING
    },
    usage: {
      type: Sequelize.STRING
    },
    warranty: {
      type: Sequelize.STRING
    },
    status: {
      type: Sequelize.ENUM,
      values: ['pending', 'verified', 'rejected'],
      defaultValue: 'pending'
    },
  });

  return Product;
};