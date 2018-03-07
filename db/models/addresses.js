const uuidv4 = require('uuid/v4');

module.exports = function(sequelize, Sequelize) {

  var Address = sequelize.define('addresses', {
    id: {
      type: Sequelize.UUID,
      defaultValue: () => {
        var arr = uuidv4().split('-');
        arr.pop();
        return 'addr_'+arr.join('');
      },
      primaryKey: true,
      allowNull: false,
    },
    fullName: {
      type: Sequelize.STRING
    },
    country: {
      type: Sequelize.STRING
    },
    city: {
      type: Sequelize.STRING
    },
    region: {
      type: Sequelize.STRING
    },
    zip: {
      type: Sequelize.STRING
    },
    addressLine1: {
      type: Sequelize.STRING
    },
    addressLine2: {
      type: Sequelize.STRING
    },
    phone: {
      type: Sequelize.STRING
    },
    additionalInfo: {
      type: Sequelize.STRING
    },

    googleMapsAddress: {
      type: Sequelize.STRING
    },
    googleMapsPlaceId: {
      type: Sequelize.STRING
    },
    suiteNumber: {
      type: Sequelize.STRING
    },
    mobile: {
      type: Sequelize.STRING    
    }
  });

  return Address;
};