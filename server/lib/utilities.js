const sharp = require('sharp');
var forEachAsync = require('forEachAsync').forEachAsync;
const AWS = require('aws-sdk');
var uuidv4 = require('uuid/v4');
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';

var uploadPhotos = (photos, callback) => {

  var results = [];

  if (photos.length === 0) {
    callback(results);
    return;
  }

  const ACCESSKEYID = process.env.ACCESSKEYID;
  const SECRETACCESSKEY = process.env.SECRETACCESSKEY;
  const AWSS3BUCKET = process.env.AWSS3BUCKET;

  AWS.config.update({
    accessKeyId: ACCESSKEYID,
    secretAccessKey: SECRETACCESSKEY
  });
  const s3Bucket = new AWS.S3( { params: {Bucket: AWSS3BUCKET} } );

  forEachAsync(photos, function (next, photo, index) {
    console.log(photo);

    var photoKey = uuidv4()+'.'+photo.originalname.split('.')[1];
    // sharp(photo.buffer)
    // .resize(400, 300)
    // .toBuffer()
    // .then(bufferData => {

      const photoDataForS3 = {
        Bucket: AWSS3BUCKET,
        Key:  photoKey,
        Body: photo.buffer,
        ContentType: photo.mimetype
      };

      s3Bucket.putObject(photoDataForS3, (err, data) => {
        if (err) {
          console.log('Error uploading photos:', data, err);
        } else {
          console.log('Successfully uploaded photo to s3:', photo.originalname)
          results.push(photoKey);
        }
        next()
      })
    // })
    // .catch( err => {
    //   console.log(err);
    //   return err;
    // });
  }).then(() => {
    callback(results)
  })
}

var removePhotos = (photoKeys, callback) => {
  var results = [];

  if (photoKeys.length === 0) {
    callback(results);
    return;
  }

  const ACCESSKEYID = process.env.ACCESSKEYID;
  const SECRETACCESSKEY = process.env.SECRETACCESSKEY;
  const AWSS3BUCKET = process.env.AWSS3BUCKET;

  AWS.config.update({
    accessKeyId: ACCESSKEYID,
    secretAccessKey: SECRETACCESSKEY
  });
  const s3Bucket = new AWS.S3( { params: {Bucket: AWSS3BUCKET} } );

  forEachAsync(photoKeys, function (next, photoKey, index) {
    console.log(photoKey)

    const photoDataForS3 = {
      Bucket: AWSS3BUCKET,
      Key:  photoKey
    };

    s3Bucket.deleteObject(photoDataForS3, (err, data) => {
      if (err) {
        console.log('Error deleting photos:', data, err);
      } else {
        results.push(photoKey)
      }
      next();
    })

  }).then(() => {
    callback(results);
  })
}

var encrypt = (text, password) => {
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

var decrypt = (text, password) => {
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

exports.uploadPhotos = uploadPhotos;
exports.removePhotos = removePhotos;
exports.encrypt = encrypt;
exports.decrypt = decrypt;


