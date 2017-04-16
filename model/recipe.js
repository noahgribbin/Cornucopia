'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recipeSchema = Schema({
  profileID: { type: Schema.Types.ObjectId, required: true },
  description: { type: String, required: true },
  ingredients: [{ type: String, required: true}],
  instructions: { type: String, required: true },
  cookTime: { type: String, required: true },
  prepTime: { type: String, required: true },
  recipeName: { type: String },
  recipePicURI: {type: String},
  categories: [{ type: String, required: true }],
  comments: [{ type: Schema.Types.ObjectId, unique: true, ref: 'comment'}],
  upvotes: [{ type: Schema.Types.ObjectId, unique: true, ref: 'upvote' }],
  created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('recipe', recipeSchema);
