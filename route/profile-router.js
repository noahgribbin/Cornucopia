'use strict';

const debug = require('debug')('cornucopia:profile-router');
const Promise = require('bluebird');
const createError = require('http-errors');
const Router = require('express').Router;
const jsonParser = require('body-parser').json();

const bearerAuth = require('../lib/bearer-auth-middleware.js');
const Profile = require('../model/profile.js');
const User = require('../model/user.js');
const Recipe = require('../model/recipe.js');
const Comment = require('../model/comment.js');

const profileRouter = module.exports = Router();

profileRouter.post('/api/profile', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/profile');

  if (!req._body) return next(createError(400, 'request body expected'));
  if (!req.user) return next(createError(400, 'request user expected'));
  req.body.userID = req.user._id;
  new Profile(req.body).save()
  .then(profile => res.json(profile))
  .catch(next);
});

profileRouter.get('/api/profile/:id', function(req, res, next) {
  debug('GET: /api/profile/:id');

  Profile.findById(req.params.id)
  .then(profile => res.json(profile))
  .catch(next);
});

profileRouter.get('/api/profile/:id/allprofiles', function(req, res, next) {
  debug('GET: /api/profile/:id/allprofiles');

  Profile.findById(req.params.allprofiles)
  .populate('profile')
  .then(profile => res.json(profile))
  .catch(next);
});

profileRouter.put('/api/profile/:id', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/profile/:id');

  if (req._body !== true) return next(createError(400, 'nothing to update'));

  Profile.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(profile => res.json(profile))
    .catch(next);
});

profileRouter.delete('/api/profile/:id', bearerAuth, function(req, res, next) {
  debug('DELETE: /api/profile/:id');
  console.log('request', req.user);

  Profile.findOne( {userID: req.user._id} )
  .then( profile => {
    let recipeArray = profile.recipes;

    recipeArray.forEach( recipes => {
      Recipe.findByIdAndRemove(recipes)
      .catch(next);
    });
    return;
  });

  Profile.findOne( {userID: req.user._id} )
  .then( profile => {
    let commentArray = recipes.comments;

    commentArray.forEach( comments => {
      Comment.findByIdAndRemove(comments)
       .catch(next);
    });
    return;
  });

  Profile.deleteOne( {userID: req.user._id} );  
  User.deleteOne( {username: req.user.username} );    

});