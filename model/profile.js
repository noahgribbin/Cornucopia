'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profileSchema = Schema({
  userID: { type: Schema.Types.ObjectId, required: true, unique: true },
  name: { type: String },
  profilePicURI: { type: String },
  recipes: [{ type: Schema.Types.ObjectId, ref: 'recipe' }]
});

module.exports = mongoose.model('profile', profileSchema);
