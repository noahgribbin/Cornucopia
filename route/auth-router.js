'use strict';

const debug = require('debug')('cornucopia:auth-router');
const createError = require('http-errors');
const Router = require('express').Router;
const jsonParser = require('body-parser').json();

const User = require('../model/user.js');
const basicAuth = require('../lib/basic-auth-middleware.js');

const authRouter = module.exports = Router();

authRouter.post('/api/signup', jsonParser, function(req, res, next) {
  // why json parser?
  debug('POST /api/signup');

  let password = req.body.password;
  delete req.body.password;

  let user = new User(req.body);
  user.generatePasswordHash(password)
  .then( user => user.save())
  .then( user => user.generateToken())
  .then( token => res.send(token))
  .catch( err => next(createError(400, err.message)));
});

authRouter.get('/api/signin', basicAuth, function(req, res, next) {
  // why not json parser?
  debug('GET /api/signin');
  // whats goin on with the token
  console.log('RRRRRRRRRRRRRRRRRREC', req.body);
  User.findOne({ username: req.auth.username})
  .then( user => {
    // console.log('djkasndkjasndkjaaaaaaaaaannnnnnnnnnnnnnnnnnn', user);
    return user.comparePasswordHash(req.auth.password);
  })
  .then( user => user.generateToken())
  .then( token => res.send(token))
  .catch(next);
});

authRouter.put('/api/account', basicAuth, jsonParser, function(req, res, next) {
  debug('PUT /api/account');

  if (!req._body) return next(createError(400, 'Expected request body')); 
  User.findOne({ username : req.auth.username})
  .then( user => user.comparePasswordHash(req.auth.password))
  .then( user => User.findByIdAndUpdate(user._id, req.body, {new: true}))
  .catch(next);
});
authRouter.delete('/api/account', basicAuth, function(req, res, next) {
  debug('DELETE /api/account');

  User.findOne({username: res.auth.username})
  .then( user => user.comparePasswordHash(req.auth.password))
  .then( user => User.findByIdAndRemove(user._id))
  .then( () => res.status(204).send('Deleted successfuly'))
  .catch(next);
});
