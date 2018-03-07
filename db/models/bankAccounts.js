const uuidv4 = require('uuid/v4');

module.exports = function(sequelize, Sequelize) {

  var BankAccount = sequelize.define('bankAccounts', {
    id: {
      type: Sequelize.UUID,
      defaultValue: () => {
        var arr = uuidv4().split('-');
        arr.pop();
        return 'ba_'+arr.join('');
      },
      primaryKey: true,
      allowNull: false,
    },
    accountHolderName: {
      type: Sequelize.STRING
    },
    bankName: {
      type: Sequelize.STRING
    },
    accountHolderType: {
      type: Sequelize.STRING
    },
    country: {
      type: Sequelize.STRING
    },
    currency: {
      type: Sequelize.STRING
    },
    iban: {
      type: Sequelize.STRING
    },
    accountNumber: {
      type: Sequelize.STRING
    },
    ibanLast4: {
      type: Sequelize.STRING
    },
    accountNumberLast4: {
      type: Sequelize.STRING
    },
    status: {
      type: Sequelize.ENUM,
      values: ['new', 'validated', 'verified', 'verification_failed', 'errored'],
      defaultValue: 'new'
    }
  });

  return BankAccount;
};