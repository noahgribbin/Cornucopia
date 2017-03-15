'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const resCommentSchema = Schema({
  commenterProfileID: { type: Schema.Types.ObjectId, required: true },
  recipeID: { type: Schema.Types.ObjectId, required: true },
  comment: { type: String, required: true },
  created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('comment', resCommentSchema);
