'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const debug = require('debug')('cornucopia:server');
const Promise = require('bluebird');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const errors = require('./lib/error-middleware.js');

const authRouter = require('./route/auth-router.js');
const profileRouter = require('./route/profile-router.js');
const recipeRouter = require('./route/recipe-router.js');
const commentRouter = require('./route/comment-router.js');
const upvoteRouter = require('./route/upvote-router.js');

dotenv.load();

const PORT = 3003;
// process.env.PORT || 8000;
const app = express();

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI);

// let morganFormat = process.env.PRODUCTION ? 'common' : 'dev';

app.use(cors());
app.use(morgan('dev'));
app.use(authRouter);
app.use(profileRouter);
app.use(recipeRouter);
app.use(commentRouter);
app.use(upvoteRouter);
app.use(errors);

const server = module.exports = app.listen(PORT, () => {
  debug((`server up: ${PORT}`));
});

// server.isRunning = true;
