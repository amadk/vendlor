const uuidv4 = require('uuid/v4');

module.exports = function(sequelize, Sequelize) {

  var BalanceTransaction = sequelize.define('balanceTransactions', {
    id: {
      type: Sequelize.UUID,
      defaultValue: () => {
        var arr = uuidv4().split('-');
        arr.pop();
        return 'btrx_'+arr.join('');
      },
      primaryKey: true,
      allowNull: false,
    },

    source: {
      type: Sequelize.STRING
    },
    type: {
      type: Sequelize.STRING // addition, deduction
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2)
    },

    currency: {
      type: Sequelize.STRING
    },

    description: {
      type: Sequelize.STRING
    },
  });

  return BalanceTransaction;
};