'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Profile = require('../model/profile.js');
const User = require('../model/user.js');
const Recipe = require('../model/recipe.js');
const Pic = require('../model/pic.js');

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'testusername',
  password: 'lalala',
  email: 'example@example.com'
};

const exampleProfile = {
  name: 'pic example name',
  profilePicURI: 'upvote example uri'
};

const exampleRecipe = {
  ingredients: ['example ingredient 1', 'example ingredient 2', 'example ingredient 3'],
  instructions: 'example recipe instructions',
  recipeName: 'example recipe recipeName',
  categories: ['example cat 1', 'example cat 2'],
  prepTime: 'prep time',
  cookTime: 'cook time',
  description: 'description'
};

const examplePic = {
  image: `${__dirname}/data/tester.png`
};

describe('Pic Routes', () => {
  beforeEach( done => {
    new User(exampleUser)
    .generatePasswordHash(exampleUser.password)
    .then( user => user.save())
    .then( user => {
      this.tempUser = user;
      return user.generateToken();
    })
    .then( token => {
      this.tempToken = token;
      return;
    })
    .then( () => {
      exampleProfile.userID = this.tempUser._id.toString();
      new Profile(exampleProfile).save()
      .then( profile => {
        this.tempProfile = profile;
        done();
      });
    })
    .catch( err => done(err));
  });
  beforeEach( done => {
    exampleRecipe.profileID = this.tempProfile._id;
    new Recipe(exampleRecipe).save()
    .then( recipe => {
      this.tempRecipe = recipe;
      this.tempProfile.recipes.push(this.tempRecipe._id);
      return Profile.findByIdAndUpdate(this.tempProfile._id, { $set: { recipes: this.tempProfile.recipes } }, {new: true} );
    })
    .then( () => done())
    .catch(done);
  });
  afterEach( done => {
    Promise.all([
      User.remove({}),
      Profile.remove({}),
      Pic.remove({}),
      Recipe.remove({})
    ])
    .then( () => {
      delete exampleProfile.userID;
      delete exampleRecipe.profileID;
      delete examplePic.theID;
      this.tempProfile.recipes = [];
      done();
    })
    .catch(done);
  });
  describe('Pic Routes', () => {
    describe('POST: /api/profile/:theID/pic', () => {
      describe('with a valid image and profile ID', () => {
        it('should return a profile pic', done => {
          request.post(`${url}/api/profile/${this.tempProfile._id.toString()}/pic`)
          .set( { Authorization: `Bearer ${this.tempToken}` } )
          .attach('image', examplePic.image)
          .end((err, res) => {
            if(err) return done(err);
            expect(res.status).to.equal(200);
            expect(res.body.profilePicURI).to.equal(this.tempProfile._id.toString());
            done();
          });
        });
      });
    });
    describe('POST: /api/recipe/:theID/pic', () => {
      describe('with a valid image and profile ID', () => {
        it('should return a recipe pic', done => {
          request.post(`${url}/api/recipe/${this.tempRecipe._id.toString()}/pic`)
          .set( { Authorization: `Bearer ${this.tempToken}` } )
          .attach('image', examplePic.image)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).to.equal(200);
            expect(res.body.recipePicURI).to.equal(this.tempRecipe._id.toString());
            done();
          });
        });
      });
    });
    describe('DELETE: /api/profile/:theID/pic', () => {
      describe('with a valid profileID', () => {
        it('should remove the pic and pic URI in profile', done => {
          request.post(`${url}/api/profile/${this.tempProfile._id.toString()}/pic`)
          .set( { Authorization: `Bearer ${this.tempToken}` } )
          .attach('image', examplePic.image)
          .end((err) => {
            if (err) return done(err);
            request.delete(`${url}/api/profile/${this.tempProfile._id.toString()}/pic`)
            .set( { Authorization: `Bearer ${this.tempToken}`} )
            .end((err, res) => {
              if (err) return done(err);
              expect(res.status).to.equal(204);
              done();
            });
          });
        });
      });
    });
    describe('DELETE: /api/recipe/:theID/pic', () => {
      describe('with a valid recipeID', () => {
        it('should remove the pic and pic URI in recipe', done => {
          request.post(`${url}/api/recipe/${this.tempRecipe._id.toString()}/pic`)
          .set( { Authorization: `Bearer ${this.tempToken}` } )
          .attach('image', examplePic.image)
          .end((err) => {
            if (err) return done(err);
            request.delete(`${url}/api/recipe/${this.tempRecipe._id.toString()}/pic`)
            .set( { Authorization: `Bearer ${this.tempToken}`} )
            .end((err, res) => {
              if (err) return done(err);
              expect(res.status).to.equal(204);
              done();
            });
          });
        });
      });
    });
  });
});
