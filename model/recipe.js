'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recipeSchema = Schema({
  profileID: { type: Schema.Types.ObjectId, required: true, unique: true },
  ingredients: [{ type: String, required: true}],
  instructions: { type: String, required: true },
  picURI: { type: String },
  categories: [{ type: String, required: true }],
  comments: [{ type: Schema.Types.ObjectId, unique: true, ref: 'comment'}],
  upvotes: [{ type: Schema.Types.ObjectId, unique: true, ref: 'upvote' }],
  created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('recipe', recipeSchema);
