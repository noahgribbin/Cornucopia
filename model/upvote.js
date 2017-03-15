'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const upvoteSchema = Schema({
  voterProfileID: { type: Schema.Types.ObjectId, required: true },
  recipeID: { type : Schema.Types.ObjectId, required: true },
  upvote: { type: String, required: true },
  created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('upvote', upvoteSchema);
