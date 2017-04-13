'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const picSchema = Schema({
  profileID: { type: Schema.Types.ObjectId, required: true },
  recipeID: { type: Schema.Types.ObjectId, required: false },
  imageURI: { type: String, required: true, unique: true },
  objectKey: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('pic', picSchema);