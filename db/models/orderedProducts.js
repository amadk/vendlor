const uuidv4 = require('uuid/v4');

module.exports = function(sequelize, Sequelize) {

  var OrderedProduct = sequelize.define('orderedProducts', {
    id: {
      type: Sequelize.UUID,
      defaultValue: () => {
        var arr = uuidv4().split('-');
        arr.pop();
        return 'op_'+arr.join('');
      },
      primaryKey: true,
      allowNull: false,
    },

    title: {
      type: Sequelize.STRING
    },
    price: {
      type: Sequelize.DECIMAL(10, 2)
    },
    quantity: {
      type: Sequelize.INTEGER
    },
    condition: {
      type: Sequelize.STRING
    },

    product_id: {
      type: Sequelize.STRING
    },

    status: {
      type: Sequelize.ENUM,
      values: ['ordered', 'order_cancelled', 'returned', 'return_cancelled', 'return_closed']
    },
    returnReason: {
      type: Sequelize.STRING
    },
    returnDetails: {
      type: Sequelize.TEXT
    },
    returnCart: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  });

  return OrderedProduct;
};