const uuidv4 = require('uuid/v4');

module.exports = function(sequelize, Sequelize) {

  var Payout = sequelize.define('payouts', {
    id: {
      type: Sequelize.UUID,
      defaultValue: () => {
        var arr = uuidv4().split('-');
        arr.pop();
        return 'py_'+arr.join('');
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
      type: Sequelize.STRING
    },

    currency: {
      type: Sequelize.STRING
    },
    status: {
      type: Sequelize.ENUM,
      values: ['new', 'payout_started', 'transferred', 'payout_failed', 'errored'],
      defaultValue: 'new'
    },
    description: {
      type: Sequelize.STRING
    },
  });

  return Payout;
};