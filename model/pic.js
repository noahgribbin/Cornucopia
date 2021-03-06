'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const picSchema = Schema({
  theID: { type: Schema.Types.ObjectId, required: true },
  imageURI: { type: String, required: true, unique: true },
  objectKey: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('pic', picSchema);
