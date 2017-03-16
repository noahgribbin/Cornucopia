'use strict';

const debug = require('debug')('cornucopia:upvote-router');
const bearerAuth = require('../lib/bearer-auth-middleware.js');
const createError = require('http-errors');
const jsonParser = require('body-parser').json();
const Router = require('express').Router;

const Profile = require('../model/profile.js');
const Recipe = require('../model/recipe.js');
const Upvote = require('../model/upvote.js');

const upvoteRouter = module.exports = Router();

upvoteRouter.post('/api/upvote/:recipeID', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/upvote/:recipeID');

  if (!req.body) return next(createError(400, 'request body expected'));
  if (!req.user) return next(createError(400, 'request user expected'));

  req.body.recipeID = req.params.recipeID;
  Profile.findOne( { userID: req.user._id } )
  .then( profile => {
    req.body.voterProfileID = profile._id;
    new Upvote(req.body).save()
    .then( upvote => {
      profile.upvotes.push(upvote._id);
      profile.save();
      Recipe.findById(req.params.recipeID)
      .then( recipe => {
        recipe.upvotes.push(upvote._id);
        recipe.save();
        return recipe;
      })
      .then( recipe => {
        Profile.findById(upvote.voterProfileID)
        .then( profile => {
          let response = { profile: profile, recipe: recipe, upvote: upvote };
          res.json(response);
        })
        .catch(next);
      })
      .catch(next);
    })
    .catch(next);
  })
  .catch(next);
});

upvoteRouter.get('/api/upvote/:id', function(req, res, next) {
  debug('GET: /api/upvote/:id');

  Upvote.findById(req.params.id)
  .then( upvote => res.json(upvote))
  .catch(next);
});

upvoteRouter.get('/api/allupvotes/:profileID', function(req, res, next) {
  debug('GET: /api/allupvotes/:profileID');

  Profile.findById(req.params.profileID)
  .populate('upvote')
  .then( upvote => res.json(upvote))
  .catch(next);
});

upvoteRouter.get('/api/allrecipeupvotes/:recipeID', function(req, res, next) {
  debug('GET: /api/allrecipeupvotes/:recipeID');

  Recipe.findById(req.params.recipeID)
  .populate('upvote')
  .then( upvote => res.json(upvote))
  .catch(next);
});

upvoteRouter.delete('/api/upvote/:id', bearerAuth, function(req, res, next) {
  debug('DELETE: /api/upvote/:id');

  Upvote.findById(req.params.id)
  .then( upvote => {
    Profile.findById(upvote.voterProfileID)
    .then( profile => {
      let upvoteArray = profile.upvotes;
      let upvoteIndex = upvoteArray.indexOf(upvote._id);
      if (upvoteIndex === -1) return next(createError(404, 'not found'));
      upvoteArray.splice(upvoteIndex, 1);
      Profile.findByIdAndUpdate( profile._id, { $set: { comments: upvoteArray } }, { new: true} )
      .catch(next);
      return upvote;
    })
    .then( upvote => Recipe.findById(upvote.recipeID))
    .then( recipe => {

      let upvoteArray = recipe.upvotes;
      let upvoteIndex = upvoteArray.indexOf(upvote._id);
      if (upvoteIndex === -1) return next(createError(404, 'not found'));

      upvoteArray.splice(upvoteIndex, 1);
      recipe.upvotes = upvoteArray;

      Recipe.findByIdAndUpdate( recipe._id, recipe, { new: true} )
      .then( () => Upvote.findByIdAndRemove(upvote._id))
      .then( () => {
        res.status(204).send();
      })
      .catch(next);
    })
    .catch(next);
  })
  .catch(next);
});

upvoteRouter.put('/api/upvote/:id', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/upvote/:id');

  if (req._body !== true) return next(createError(400, 'nothing to update'));
  Upvote.findByIdAndUpdate(req.params.id, req.body, { new: true })
  .then( upvote => res.json(upvote))
  .catch(next);
});
