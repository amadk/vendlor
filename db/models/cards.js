const uuidv4 = require('uuid/v4');

module.exports = function(sequelize, Sequelize) {

  var Card = sequelize.define('cards', {
    id: {
      type: Sequelize.UUID,
      defaultValue: () => {
        var arr = uuidv4().split('-');
        arr.pop();
        return 'card_'+arr.join('');
      },
      primaryKey: true,
      allowNull: false,
    },
    token: {
      type: Sequelize.STRING
    },
    type: {
      type: Sequelize.STRING // credit, debit, prepaid
    },
    last4: {
      type: Sequelize.STRING
    },
    brand: {
      type: Sequelize.STRING // Visa, mastercard etc
    }
  });

  return Card;
};