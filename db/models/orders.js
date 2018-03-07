const uuidv4 = require('uuid/v4');

module.exports = function(sequelize, Sequelize) {

  var Order = sequelize.define('orders', {
    id: {
      type: Sequelize.UUID,
      defaultValue: () => {
        var arr = uuidv4().split('-');
        arr.pop();
        return 'or_'+arr.join('');
      },
      primaryKey: true,
      allowNull: false,
    },

    status: {
      type: Sequelize.STRING
    },
    
    paymentMethod: {
      type: Sequelize.STRING
    },

    subtotal: {
      type: Sequelize.DECIMAL(10, 2)
    },
    shippingTotal: {
      type: Sequelize.DECIMAL(10, 2)
    },
    grandTotal: {
      type: Sequelize.DECIMAL(10, 2)
    },
    type: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING
    }
  });

  return Order;
};