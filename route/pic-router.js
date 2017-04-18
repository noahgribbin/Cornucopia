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

picRouter.post('/api/profile/:theID/pic', bearerAuth, upload.single('file'), function(req, res, next){
  debug('POST /api/profile/:theID/pic');

  if (!req.file) return next(createError(400, 'file not found!'));
  if (!req.file.path) return next(createError(500, 'file not saved'));

  let ext = path.extname(req.file.originalname);
  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path)
  };

  Profile.findById(req.params.theID)
  .then( () => s3uploadProm(params))
  .then(s3data => {
    del([`${dataDir}/*`]);
    let picData = {
      theID: req.params.theID,
      objectKey: s3data.Key,
      imageURI: s3data.Location
    };
    return new Pic(picData).save();
  })
  .then(pic => {
    let update = {};
    update.profilePicURI = pic.imageURI;
    Profile.findByIdAndUpdate(pic.theID, update, { new: true })
    .then(profile => res.json(profile));
  })
  .catch(next);
});

picRouter.post('/api/recipe/:theID/pic', bearerAuth, upload.single('file'), function(req, res, next){
  debug('POST /api/recipe/:theID/pic');

  if(!req.file) return next(createError(400, 'file not found!'));
  if (!req.file.path) return next(createError(500, 'file not saved'));

  let ext = path.extname(req.file.originalname);
  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path)
  };

  Recipe.findById(req.params.theID)
  .then( () => s3uploadProm(params))
  .then(s3data => {
    del([`${dataDir}/*`]);
    let picData = {
      theID: req.params.theID,
      objectKey: s3data.Key,
      imageURI: s3data.Location
    };
    return new Pic(picData).save();
  })
  .then(pic => {
    let update = {};
    update.recipePicURI = pic.imageURI;
    Recipe.findByIdAndUpdate(pic.theID, update, { new: true })
    .then(recipe => res.json(recipe));
  })
  .catch(next);
});


picRouter.get('/api/pic/:picID', function(req, res, next) {
  debug('GET: /api/pic/:picID');

  Pic.findById(req.params.picID)
  .then(pic => res.json(pic))
  .catch(next);
});

picRouter.delete('/api/profile/:theID/pic', function(req, res, next) {
  debug('DELETE: /api/profile/:theID/pic');

  Pic.findOne( { theID: req.params.theID } )
  .then(pic => {
    let params = {
      Bucket: process.env.AWS_BUCKET,
      Key: pic.objectKey,
    };
    return s3.deleteObject(params).promise();
  })
  .then( () => {
    let update = {};
    update.profilePicURI = null;
    return Profile.findByIdAndUpdate(req.params.theID, update, { new: true });
  })
  .then( () => res.status(204).send())
  .catch(next);
});

picRouter.delete('/api/recipe/:theID/pic', function(req, res, next) {
  debug('DELETE: /api/recipe/:theID/pic');

  Pic.findOne( { theID: req.params.theID } )
  .then(pic => {
    let params = {
      Bucket: process.env.AWS_BUCKET,
      Key: pic.objectKey,
    };
    return s3.deleteObject(params).promise();
  })
  .then( () => {
    let update = {};
    update.recipePicURI = null;
    return Recipe.findByIdAndUpdate(req.params.theID, update, { new: true });
  })
  .then( () => res.status(204).send())
  .catch(next);
});
