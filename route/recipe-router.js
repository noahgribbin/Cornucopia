'use strict';

const debug = require('debug')('cornucopia:recipe-router');
const fs = require('fs');
const Promise = require('bluebird');
const createError = require('http-errors');
const jsonParser = require('body-parser');
const Router = require('express').Router;
const Recipe = require('../model/recipe.js');

const recipeRouter = module.exports = Router();

recipeRouter.post('/api/recipe', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/recipe');

  if (!req.body) return next(createError(400, 'expected body'));
  if (!req.user) return next(createError(400, 'expected user'));
  req.body.profileID = req.user._id;
  return new Recipe(req.body).save()
  .then(recipe => res.json(recipe))
  .catch(next);
};

recipeRouter.get('/api/recipe/:id', function(req, res, next) {
  debug('GET: /api/recipe/:id');

  Recipe.findById(req.params.id)
  .then(recipe => res.json(recipe))
  .catch(next);
});

recipeRouter.get('/api/recipe/:profileID', function(req, res, next) {
  debug('GET: /api/recipe/:id');

  Recipe.findById(req.params.profileID)
  .then(profile.recipes => res.json(profile.recipes))
  .catch(next);
});
