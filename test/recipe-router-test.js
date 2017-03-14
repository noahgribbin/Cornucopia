'use strict';

const expect = require('chai').expect;
const Promise = require('bluebird');
const request = require('superagent');
const Recipe = require('../model/recipe.js');
const Proflie = require('../model/profile.js');
const User = require('../model/user.js');

const url = `http://localhost:${process.env.PORT}`;

require('../server.js');

const exampleRecipe = {
  category: ['example category', 'example category2'],
  ingredients: ['example ingredient1', 'example ingredient2'],
  instructions: 'example instructions',
  picURI: 'example URI',
};

const exampleUser = {
  username : 'username',
  email: 'example@example.com',
  password: '1234',
};

const exampleProfile = {
  name: 'examplename',
  profilePicURI: 'exampleprofileuri',
};

describe('Recipe Routes', function() {
  describe('GET: /api/recipe/:id', function() {
    before(done => {
      new Recipe(example);
    });
    describe('with valid recipe id', () => {
      it('should return a recipe', done => {
        request.get(`${url}/api/recipe/${this.tempRecipe._id}/`)
       .set({
         Authorization: `Bearer ${this.tempToken}`
       })
      .end((err, res) => {
        if (err) return done(err);
        let date = new Date(res.body.created).toString();
        expect(res.status).to.equal(200);
        expect(res.body.category).to.equal(exampleRecipe.category);
        expect(res.body.ingredients).to.equal(exampleRecipe.ingredients);
        expect(res.body.instructions).to.equal(exampleRecipe.instructions);
        expect(res.body.picURI).to.equal(exampleRecipe.picURI);
        expect(date).to.not.equal('invalid date');
        done();
       
        });
      });
    });
  });
});