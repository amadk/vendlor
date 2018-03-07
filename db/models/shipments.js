const uuidv4 = require('uuid/v4');

module.exports = function(sequelize, Sequelize) {

  var Shipment = sequelize.define('shipments', {
    id: {
      type: Sequelize.UUID,
      defaultValue: () => {
        var arr = uuidv4().split('-');
        arr.pop();
        return 'ship_'+arr.join('');
      },
      primaryKey: true,
      allowNull: false,
    },

    amountToCollect: {
      type: Sequelize.DECIMAL(10, 2)
    },

    type: {
      type: Sequelize.ENUM,
      values: ['order', 'return']
    },
    speed: {
      type: Sequelize.STRING
    },
    estimatedPickup: {
      type: Sequelize.DATE
    },
    estimatedDelivery: {
      type: Sequelize.DATE
    },
    status: {
      type: Sequelize.ENUM,
      values: ['order_received', 'picking_up', 'picked_up', 'delivering', 'delivered', 'cancelled']
    },
    pickupDate: {
      type: Sequelize.DATE
    },
    deliveredDate: {
      type: Sequelize.DATE
    },
    shipper: {
      type: Sequelize.STRING
    },
    pickupAddress: {
      type: Sequelize.TEXT
    },
    deliveryAddress: {
      type: Sequelize.TEXT
    }
  });

  return Shipment;
};




