const uuidv4 = require('uuid/v4');

module.exports = function(sequelize, Sequelize) {

  var Cart = sequelize.define('cart', {
    id: {
      type: Sequelize.UUID,
      defaultValue: () => {
        var arr = uuidv4().split('-');
        arr.pop();
        return 'cart_'+arr.join('');
      },
      primaryKey: true,
      allowNull: false,
    },
    quantity: {
      type: Sequelize.INTEGER
    },
  });

  return Cart;
};