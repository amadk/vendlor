const uuidv4 = require('uuid/v4');

module.exports = function(sequelize, Sequelize) {

  var ShipmentProduct = sequelize.define('shipmentProducts', {
    id: {
      type: Sequelize.UUID,
      defaultValue: () => {
        var arr = uuidv4().split('-');
        arr.pop();
        return 'sp_'+arr.join('');
      },
      primaryKey: true,
      allowNull: false,
    }
  });

  return ShipmentProduct;
};