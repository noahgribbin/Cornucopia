'use strict';

const fs = require('fs');
const path = require('path');
const del = require('del');
const AWS = require('aws-sdk');
const multer = require('multer');
const createError = require('http-errors');
const debug = require('debug')('cornucopia:pic-router');

const Pic = require('../model/pic.js');
const Recipe = require('../model/recipe.js');
const Profile = require('../model/profile.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');
const Router = require('express').Router;

AWS.config.setPromisesDependency(require('bluebird'));

const s3 = new AWS.S3();
const dataDir = `${__dirname}/../data`;
const upload = multer({dest: dataDir});
const picRouter = module.exports = Router();

function s3uploadProm(params) {
  debug('s3uploadProm');

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, s3data) => {
      if (err) return reject(err);
      resolve(s3data);
    });
  });
}

picRouter.post('/api/profile/:profileID/pic', bearerAuth, upload.single('image'), function(req, res, next) {
  debug('POST /api/profile/:profileID/pic');

  if(!req.file) return next(createError(400, 'file not found!'));
  if (!req.file.path) return next(createError(500, 'file not saved'));

  let ext = path.extname(req.file.originalname);
  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path)
  };

  Profile.findById(req.params.profileID)
  .then( () => s3uploadProm(params))
  .then(s3data => {
    del([`${dataDir}/*`]);
    let picData = {
      theID: req.params.profileID,
      objectKey: s3data.Key,
      imageURI: s3data.Location
    };
    return new Pic(picData).save();
  })
  .then(pic => res.json(pic))
  .catch(next);
});

// picRouter.post('/api/profile/:profileID/pic', bearerAuth, upload.single('image'), function(req, res, next){
//   debug('POST /api/profile/:profileID/pic');
//
//   if(!req.file) return next(createError(400, 'file not found!'));
//   if (!req.file.path) return next(createError(500, 'file not saved'));
//
//   let ext = path.extname(req.file.originalname);
//   let params = {
//     ACL: 'public-read',
//     Bucket: process.env.AWS_BUCKET,
//     Key: `${req.file.filename}${ext}`,
//     Body: fs.createReadStream(req.file.path)
//   };
//
//   Profile.findById(req.params.theID)
//   .then( () => s3uploadProm(params))
//   .then(s3data => {
//     del([`${dataDir}/*`]);
//     let picData = {
//       theID: req.params.theID,
//       objectKey: s3data.Key,
//       imageURI: s3data.Location
//     };
//     return new Pic(picData).save();
//   })
//   .then(pic => {
//     let update = {};
//     update.profilePicURI = pic.theID;
//     Profile.findByIdAndUpdate(pic.theID, update, { new: true })
//     .then(profile => res.json(profile));
//   })
//   .catch(next);
// });

picRouter.get('/api/pic/:picID', function(req, res, next) {
  debug('GET: /api/pic/:picID');

  Pic.findById(req.params.picID)
  .then(pic => res.json(pic))
  .catch(next);
});

picRouter.delete('/api/pic/:picID', function(req, res, next) {
  debug('DELETE: /api/pic/:picID');

  Pic.findByIdAndRemove(req.params.picID)
  .then( () => {
    let update = {};
    update.profilePicURI = null;
    return Profile.findByIdAndUpdate(req.params.theID, update, { new: true });
  })
  .then( () => res.status(204).send())
  .catch(next);
});
