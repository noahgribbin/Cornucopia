'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Recipe = require('../model/recipe.js');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const url = 'http://localhost:3003';

const exampleRecipe = {
  category: ['example category', 'example category2'],
  ingredients: ['example ingredient1', 'example ingredient2'],
  instructions: 'example instructions',
  picURI: 'example URI',
};

require('../server.js');

describe('Recipe Routes', function() {
  describe('GET: /api/recipe/:id', function() {
    before(done => {
      new Recipe(example)
    })
    describe('with valid recipe id', () => {

    });
  });
});
