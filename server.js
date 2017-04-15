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
const picRouter = require('./route/pic-router.js');

dotenv.load();

const app = express();

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI);

app.use(cors());
app.use(morgan('dev'));
app.use(authRouter);
app.use(profileRouter);
app.use(recipeRouter);
app.use(picRouter);
app.use(commentRouter);
app.use(upvoteRouter);
app.use(errors);

app.listen((process.env.PORT || 8000), () => debug('server up!'));
