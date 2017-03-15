'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profileSchema = Schema({
  userID: { type: Schema.Types.ObjectId, required: true, unique: true },
  name: { type: String },
  profilePicURI: { type: String },
  recipes: [{ type: Schema.Types.ObjectId, unique: true, ref: 'recipe' }],
  comments: [{ type: Schema.Types.ObjectId, unique: true, ref: 'comment' }],
  upvotes: [{ type: Schema.Types.ObjectId, unique: true, ref: 'upvote' }]
});

module.exports = mongoose.model('profile', profileSchema);
