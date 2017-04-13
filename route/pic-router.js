'use strict';

const fs = require('fs');
const path = require('path');
const del = require('del');
const AWS = require('aws-sdk');
const multer = require('multer');
const createError = require('http-errors');
const debug = require('debug')('Cornucopia:pic-router');

const Pic = require('../model/pic.js');
const Recipe = require('../model/recipe.js');
const Profile = require('../model/profile.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

AWS.config.setPromiseDependency(require('bluebird'));

const s3 = new AWS.s3();
const dataDir = `${__dirname}/../data`;
const upload = multer({dest: dataDir});
const picRouter = module.exports = require('express').Router();

picRouter.post('./api/pic', bearerAuth, upload.single('file'), function(req, res, next){
  debug('POST /api/pic');

  if(!req.file) return next(createError(400, 'file not found!'));

  let ext = path.extname(req.file.originalname);

  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path),
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, s3data) => {
      if (err) return reject(err);
      resolve(s3data);
    });
  })
  .then(s3data => {
    del([`${dataDir}/*`]);
    let picData = {
      profileID: req.body.profileID,
      recipeID: req.body.recipeID,
      objectKey: s3data.Key,
      imageURI: s3data.Location,
    };
    return new Pic(picData).save();
  })
  .then(pic => {
    let update = {};
    if (pic.recipeID) {
      update.recipePicURI = pic.imageURI;
      Recipe.findByIdAndUpdate(pic.recipeID, update, { new: true })
      .catch(next);
    }
    if (pic.profileID) {
      update.profilePicURI = pic.imageURI;
      Profile.findByIdAndUpdate(pic.profileID, update, { new: true })
      .catch(next);
    }
  })
  .catch(next);
});

picRouter.get('/api/pic/:picID', function(req, res, next) {
  debug('GET: /api/pic/:id');

  Pic.findById(req.params.picID)
  .then(pic => res.json(pic))
  .catch(next);
});

picRouter.delete('/api/pic/:picID', function(req, res, next) {
  debug('DELETE: /api/pic/:id');

  Pic.findById(req.params.picID)
  .then(pic => {
    let update = {};
    if (pic.recipeID) {
      update.recipePicURI = null;
      Recipe.findByIdAndUpdate(pic.recipeID, update, { new: true });
    }
    if (pic.profileID) {
      update.profilePicURI = null;
      Profile.findByIdAndUpdate(pic.profileID, update, { new: true });
    }
  })
  .catch(next);
  Pic.findByIdAndRemove(req.params.picID)
  .then( () => res.status(204).send())
  .catch(next);
});
