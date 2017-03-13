'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recipeSchema = Schema({
  profileID: { type: Schema.Types.ObjectId, required: true },
  ingredients: { type: Array, required: true},
  instructions: { type: String, required: true },
  picURI: { type: String },
  categories: { type: Array, required: true },
  created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('recipe', recipeSchema);
