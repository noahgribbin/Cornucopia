'use strict';

const debug = require('debug')('cornucopia:recipe-router');
const Promise = require('bluebird');
const createError = require('http-errors');
const jsonParser = require('body-parser').json();
const Router = require('express').Router;

const bearerAuth = require('../lib/bearer-auth-middleware.js');
const Profile = require('../model/profile.js');
const Recipe = require('../model/recipe.js');

const recipeRouter = module.exports = Router();

recipeRouter.post('/api/recipe', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/recipe');
  if (!req.body) return next(createError(400, 'expected body'));
  if (!req.user) return next(createError(400, 'expected user'));

  Profile.findOne( {userID: req.user._id} )
  .then(profile => {
    req.body.profileID = profile._id;
    return new Recipe(req.body).save()
  })
  .then(recipe => {
    Profile.findById(recipe.profileID)
    .then(profile => {
      profile.recipes.push(recipe._id);
      return profile.save()
    })
    .then(profile => {
      let response = { profile: profile, recipe: recipe };
      res.json(response);
    })
    .catch(next);
  })
  .catch(next);
});

recipeRouter.get('/api/recipe/:id', function(req, res, next) {
  debug('GET: /api/recipe/:id');

  Recipe.findById(req.params.id)
  .then(recipe => res.json(recipe))
  .catch(next);
});

recipeRouter.get('/api/allrecipes/:profileID', function(req, res, next) {
  debug('GET: /api/allrecipes/:profileID');

  Profile.findById(req.params.profileID)
  .then(profile => {
    console.log('PROFILE *************', profile);
    res.json(profile.recipes);
  })
  .catch(next);
});

// recipeRouter.delete('/api/recipe/:id', bearerAuth, function(req, res, next) {
//   debug('DELETE: /api/recipe/:id');
//
//   Profile.findById(req.user._id)
//   .then(profile => {
//     let recipeArray = profile.recipes;
//     let recipeIndex = recipeArray.indexOf(req.params.id);
//     if (recipeIndex === -1) return next(createError(404, 'not found'));
//     recipeArray.splice(recipeIndex, 1);
//     profile.recipes = recipeArray;
//     Profile.update( { _id: req.user._id }, { $set: {recipes: recipeArray} } )
//     .then( () => {
//       Recipe.findByIdAndRemove(req.params.id)
//       res.status(204).send();
//     })
//     .catch(next);
//   })
//   .catch(next);
// });
//
// recipeRouter.put('/api/recipe/:id', bearerAuth, jsonParser, function(req, res, next) {
//   debug('PUT: /api/recipe/:id');
//
//   if(req._body !== true) return next(createError(400, 'nothing to update'));
//   Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true })
//   .then( recipe => res.json(recipe))
//   .catch(next);
// });
