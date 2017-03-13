'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const debug = require('debug')('cornucopia:server');
const Promise = require('bluebird');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const recipeRouter = require('./route/recipe-router.js');

dotenv.load();

const PORT = 3003;
const app = express();


mongoose.connect(process.env.MONGODB_URI);

// let morganFormat = process.env.PRODUCTION ? 'common' : 'dev';

app.use(cors());
app.use(morgan('dev'));

app.use(recipeRouter);

const server = module.exports = app.listen(PORT, () => {
  debug((`server up: ${PORT}`));
});

// server.isRunning = true;
