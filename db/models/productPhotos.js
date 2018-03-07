const uuidv4 = require('uuid/v4');

module.exports = function(sequelize, Sequelize) {

  var ProductPhoto = sequelize.define('productPhotos', {
    id: {
      type: Sequelize.UUID,
      defaultValue: () => {
        var arr = uuidv4().split('-');
        arr.pop();
        return 'pp_'+arr.join('');
      },
      primaryKey: true,
      allowNull: false,
    },
    order: {
      type: Sequelize.STRING
    },
    key: {
      type: Sequelize.STRING
    },
  });

  return ProductPhoto;
};