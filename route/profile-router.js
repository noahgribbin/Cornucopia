'use strict';

const debug = require('debug')('cornucopia:profile-router');
const createError = require('http-errors');
const Router = require('express').Router;
const jsonParser = require('body-parser').json();

const bearerAuth = require('../lib/bearer-auth-middleware.js');
const Profile = require('../model/profile.js');
const User = require('../model/user.js');
const Recipe = require('../model/recipe.js');
const Pic = require('../model/pic.js');
const ResComment = require('../model/comment.js');
const Upvote = require('../model/upvote.js');
const picRouter = require('./pic-router.js');


const profileRouter = module.exports = Router();

profileRouter.post('/api/profile', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/profile');

  if (!req._body) return next(createError(400, 'request body expected'));
  req.body.userID = req.user._id;
  new Profile(req.body).save()
  .then( profile => res.json(profile))
  .catch(next);
});

profileRouter.get('/api/profile/:id', function(req, res, next) {
  debug('GET: /api/profile/:id');

  Profile.findById(req.params.id)
  .then( profile => res.json(profile))
  .catch(next);
});

profileRouter.get('/api/allprofiles', function(req, res, next) {
  debug('GET: /api/allprofiles');

  Profile.find({})
  .then( profile => res.json(profile))
  .catch(next);
});

profileRouter.put('/api/profile/:id', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/profile/:id');

  if (req._body !== true) return next(createError(400, 'nothing to update'));

  Profile.findByIdAndUpdate(req.params.id, req.body, { new: true } )
    .then( profile => res.json(profile))
    .catch(next);
});

profileRouter.delete('/api/profile/:id', bearerAuth, function(req, res, next) {
  debug('DELETE: /api/profile/:id');
  Recipe.remove( { profileID: req.params.id } )
  .then( () => ResComment.remove( { commenterProfileID: req.params.id } ))
  .then( () => Upvote.remove( { voterProfileID: req.params.id } ))
  .then( () => Profile.remove( { userID: req.user._id } ))
  .then( () => User.remove( { username: req.user.username } ))
  .then( () => Pic.remove( { theID: req.params.id } ))
  .then( () => res.status(204).send())
  .catch(next);
});
