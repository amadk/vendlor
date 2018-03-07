var uuidv4 = require('uuid/v4');

module.exports = function(sequelize, Sequelize) {

  var Account = sequelize.define('accounts', {
    id: {
      type: Sequelize.UUID,
      defaultValue: () => {
        var arr = uuidv4().split('-');
        arr.pop();
        return 'acct_'+arr.join('');
      },
      primaryKey: true,
      allowNull: false,
    },
    fullName: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    mobile: {
      type: Sequelize.STRING
    },
    hash: {
      type: Sequelize.STRING
    },
    salt: {
      type: Sequelize.STRING
    },

    profilePhoto: {
      type: Sequelize.STRING
    },
    coverPhoto: {
      type: Sequelize.STRING
    },
    
    idFront: {
      type: Sequelize.STRING
    },
    idBack: {
      type: Sequelize.STRING
    },
    companyRegistration: {
      type: Sequelize.STRING
    },
    availableBalance: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0
    },
    pendingBalance: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0
    },
    sellerStatus: {
      type: Sequelize.ENUM,
      values: ['verified', 'pending', 'rejected'],
      defaultValue: 'pending'
    },
    accountStatus: {
      type: Sequelize.ENUM,
      values: ['banned', 'suspended', 'clear'],
      defaultValue: 'clear'
    },
    sellerRating: {
      type: Sequelize.INTEGER,
      defaultValue: 100
    },
    sellerType: {
      type: Sequelize.ENUM,
      values: ['Individual', 'Business']
    },
    nationality: {
      type: Sequelize.STRING
    },
    dateOfBirth: {
      type: Sequelize.DATE
    },
    gender: {
      type: Sequelize.ENUM,
      values: ['Male', 'Female']
    }
  });

  return Account;
};