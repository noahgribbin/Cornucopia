'use strict';

const mongoose = require('mongoose');
const createError = require('http-errors');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Promise = require('bluebird');
const debug = require('debug')('cornucopia:user');

const Schema = mongoose.Schema;
const userSchema = Schema({
  username : {type: String, required: true, unique: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  findHash: {type: String, required: true }
});

userSchema.methods.generatePasswordHash = function(password){
  debug('generatePasswordHash');

  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return reject(err);
      this.password = hash;
      resolve(this)
    })
  })
}

userSchema.methods.comparePasswordHash = function(password){
  debug('comparePasswordHash');

  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, (err, valid) => {
      if(err) return reject(err);
      if(!valid) return reject(createError(401, 'Wrong password!'));
    });
  });
};

userSchema.methods.generateFindHash = function(){
  debug('generateFindHash');

  return new Promise((resolve, reject) => {
    let tries = 0;

    _generateFindHash.call(this);// Ask later
    function _generateFindHash(){
      this.findHash = crypto.randomBytes(32).toString('hex');
      this.save()
      .then( () => resolve(this.findHash))
      .catch( err => {
        if(tries > 3) return reject(err);
        tries++;
        _generateFindHash.call(this);
      });
    }
  });
};

