const uuidv4 = require('uuid/v4');

module.exports = function(sequelize, Sequelize) {

  var Refund = sequelize.define('refunds', {
    id: {
      type: Sequelize.UUID,
      defaultValue: () => {
        var arr = uuidv4().split('-');
        arr.pop();
        return 'ref_'+arr.join('');
      },
      primaryKey: true,
      allowNull: false,
    },

    amount: {
      type: Sequelize.DECIMAL(10, 2)
    },

    destination: {
      type: Sequelize.STRING
    },
    type: {
      type: Sequelize.STRING // 
    },

    currency: {
      type: Sequelize.STRING
    },
    status: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING
    },
  });

  return Refund;
};