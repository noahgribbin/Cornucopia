'use strict';

const debug = require('debug')('cornucopia:recipe-router');
const Promise = require('bluebird');
const createError = require('http-errors');
const jsonParser = require('body-parser').json();
const Router = require('express').Router;

const bearerAuth = require('../lib/bearer-auth-middleware.js');
const Profile = require('../model/profile.js');
const Recipe = require('../model/recipe.js');
const ResComment = require('../model/comment.js');

const commentRouter = module.exports = Router();

commentRouter.post('/api/comment/:recipeID', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/comment/:recipeID');

  if (!req._body) return next(createError(400, 'request body expected'));
  if (!req.user) return next(createError(400, 'request user expected'));

  req.body.recipeID = req.params.recipeID;
  Profile.findOne( {userID: req.user._id} )
  .then( profile => {
    req.body.commenterProfileID = profile._id;
    new ResComment(req.body).save()
    .then(comment => {
      profile.comments.push(comment._id);
      profile.save();
      Recipe.findById(req.params.recipeID)
      .then(recipe => {
        recipe.comments.push(comment._id);
        recipe.save();
        return recipe;
      })
      .then(recipe => {
        Profile.findById(comment.commenterProfileID)
        .then(profile => {
          let response = { profile: profile, recipe: recipe, comment: comment };
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

commentRouter.get('/api/comment/:id', function(req, res, next) {
  debug('GET: /api/comment/:id');

  ResComment.findById(req.params.id)
  .then(comment => res.json(comment))
  .catch(next);
});

commentRouter.get('/api/allcomments/:profileID', function(req, res, next) {
  debug('GET: /api/allcomments/:profileID');

  Profile.findById(req.params.profileID)
  .populate('comment')
  .then(comment => res.json(comment))
  .catch(next);
});

commentRouter.delete('/api/comment/:id', bearerAuth, function(req, res, next) {
  debug('DELETE: /api/comment/:id');

  ResComment.findById(req.params.id)
  .then(comment => {
    Profile.findById(comment.commenterProfileID)
    .then( profile => {
      let commentArray = profile.comments;
      let commentIndex = commentArray.indexOf(comment._id);
      if (commentIndex === -1) return next(createError(404, 'not found'));
      commentArray.splice(commentIndex, 1);
      profile.comments = commentArray;
      Profile.findByIdAndUpdate( profile._id, profile, { new: true} )
      .catch(next);
      return comment;
    })
    .then( comment => Recipe.findById(comment.recipeID))
    .then( recipe => {

      let commentArray = recipe.comments;
      let commentIndex = commentArray.indexOf(comment._id);
      if (commentIndex === -1) return next(createError(404, 'not found'));

      commentArray.splice(commentIndex, 1);
      recipe.comments = commentArray;

      Recipe.findByIdAndUpdate( recipe._id, recipe, { new: true} )
      .then( () => ResComment.findByIdAndRemove(comment._id))
      .then( () => {
        res.status(204).send();
      })
      .catch(next);
    })
    .catch(next);
  })
  .catch(next);
});

commentRouter.put('/api/comment/:id', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/comment/:id');

  if (req._body !== true) return next(createError(400, 'nothing to update'));
  ResComment.findByIdAndUpdate(req.params.id, req.body, { new: true })
  .then( comment => res.json(comment))
  .catch(next);
});
