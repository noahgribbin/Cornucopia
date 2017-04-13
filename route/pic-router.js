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

picRouter.post('./api/profile/:id/pic', bearerAuth, upload.single('file'), function(req, res, next){
  debug('POST /api/profile/:id/pic');

  if(!req.file) return next(createError(400, 'file not found!'));

  let ext = path.extname(req.file.originalname);

  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path),
  };

  Profile.findById(req.params.profileID)
  .catch( err => Promise.reject(createError(404, err.message)))
  .then( profile => {
    return new Promise((resolve, reject) => {
      s3.upload(params, (err, s3data) => {
        if (err) return reject(err);
        resolve(s3data);
        });
     });     
  })
  .catch( err => err.status ? Promise.reject(err) : Promise.reject(createError(500, err.message)))
  .then(s3data => {
    del([`${dataDir}/*`])
    // TODO: we left off here.
    let picData = {
      profileID: req.user._id
      recipeID:
      imageURI:
      objectKey:
    }
  })
});