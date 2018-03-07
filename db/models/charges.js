const uuidv4 = require('uuid/v4');

module.exports = function(sequelize, Sequelize) {

  var Charge = sequelize.define('charges', {
    id: {
      type: Sequelize.UUID,
      defaultValue: () => {
        var arr = uuidv4().split('-');
        arr.pop();
        return 'ch_'+arr.join('');
      },
      primaryKey: true,
      allowNull: false,
    },

    source: {
      type: Sequelize.STRING
    },
    type: {
      type: Sequelize.STRING //cash, credit, debit, paypal
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2)
    },

    currency: {
      type: Sequelize.STRING
    },
    transactionFee: {
      type: Sequelize.DECIMAL(10, 2)
    },
    status: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING
    },
    receiptEmail: {
      type: Sequelize.STRING
    }
  });

  return Charge;
};