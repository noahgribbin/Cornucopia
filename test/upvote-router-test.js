'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const User = require('../model/user.js');
const Profile = require('../model/profile.js');
const Recipe = require('../model/recipe.js');
const Upvote = require('../model/upvote.js');

require('../server.js');

const url = `http://localhost:3003`;
// const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'voteertestname',
  password: 's0m3pa55w0rd',
  email: 'email@example.com'
};

const exampleProfile = {
  name: 'upvote example name',
  profilePicURI: 'upvote example uri'
};

const exampleRecipe = {
  ingredients: ['example ingredient 1', 'example ingredient 2', 'example ingredient 3'],
  instructions: 'example recipe instructions',
  picURI: 'example recipe picURI',
  categories: ['example cat 1', 'example cat 2']
};

const exampleUpvote = {
  upvote: 'example upvote'
};

describe('Upvote Routes', () => {
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
      })
      .catch(done);
    })
    .catch(done);
  });
  beforeEach( done => {
    exampleRecipe.profileID = this.tempProfile._id;
    new Recipe(exampleRecipe).save()
    .then( recipe => {
      this.tempRecipe = recipe;
      this.tempProfile.recipes.push(this.tempRecipe._id);
      return Profile.findByIdAndUpdate(this.tempProfile._id, this.tempProfile, { new: true } );
    })
    .then( () => done())
    .catch(done);
  });
  afterEach( done => {
    Promise.all([
      User.remove({}),
      Profile.remove({}),
      Upvote.remove({}),
      Recipe.remove({})
    ])
    .then( () => {
      delete exampleProfile.userID;
      delete exampleRecipe.profileID;
      delete exampleUpvote.recipeID;
      delete exampleUpvote.voterProfileID;
      this.tempProfile.recipes = [];
      done();
    })
    .catch(done);
  });
  describe('POST /api/upvote/:recipeID', () => {
    describe('with a valid body and recipe ID', () => {
      it('should return a upvote', done => {
        exampleUpvote.recipeID = this.tempRecipe._id;
        exampleUpvote.voterProfileID = this.tempProfile._id;
        request.post(`${url}/api/upvote/${this.tempRecipe._id.toString()}`)
        .set( { Authorization: `Bearer ${this.tempToken}` } )
        .send(exampleUpvote)
        .end((err, res) => {
          if(err) return done(err);
          let date = new Date(res.body.created).toString();
          expect(res.status).to.equal(200);
          expect(res.body.profile.upvotes[0].toString()).to.equal(res.body.upvote._id.toString());
          expect(res.body.recipe.upvotes[0].toString()).to.equal(res.body.upvote._id.toString());
          expect(res.body.upvote.upvote).to.equal(exampleUpvote.upvote);
          expect(res.body.upvote.voterProfileID).to.equal(this.tempProfile._id.toString());
          expect(res.body.upvote.recipeID).to.equal(this.tempRecipe._id.toString());
          expect(date).to.not.equal('invalid date');
          done();
        });
      });
    });
    describe('with an invalid body', () => {
      it('should return a 400 error', done => {
        request.post(`${url}/api/upvote/${this.tempRecipe._id}`)
        .set( { Authorization: `Bearer ${this.tempToken}` } )
        .end((err, res) => {
          expect(err.status).to.equal(400);
          expect(res.text).to.equal('BadRequestError');
          done();
        });
      });
    });
    describe('with an invalid token', () => {
      it('should return 401 error', done => {
        request.post(`${url}/api/upvote/${this.tempRecipe._id}`)
        .send(exampleUpvote)
        .end((err, res) => {
          expect(err.status).to.equal(401);
          expect(res.text).to.equal('authorization header required');
          done();
        });
      });
    });
  });
  describe('GET /api/upvote/:id', () => {
    beforeEach( done => {
      exampleUpvote.voterProfileID = this.tempProfile._id;
      exampleUpvote.recipeID = this.tempRecipe._id;
      new Upvote(exampleUpvote).save()
      .then( upvote => {
        this.tempUpvote = upvote;
        done();
      })
      .catch(done);
    });
    describe('with a valid upvote id', () => {
      it('should return a upvote', done => {
        request.get(`${url}/api/upvote/${this.tempUpvote._id.toString()}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.upvote).to.equal(exampleUpvote.upvote);
          expect(res.body.recipeID.toString()).to.equal(exampleUpvote.recipeID.toString());
          expect(res.body.voterProfileID.toString()).to.equal(exampleUpvote.voterProfileID.toString());
          done();
        });
      });
    });
    describe('without a valid upvote id', () => {
      it('should return a 404 error', done => {
        request.get(`${url}/api/upvote/alskdjf`)
        .end( err => {
          expect(err.status).to.equal(404);
          done();
        });
      });
    });
  });
  describe('GET /api/allupvotes/:profileID', () => {
    beforeEach( done => {
      exampleUpvote.voterProfileID = this.tempProfile._id;
      exampleUpvote.recipeID = this.tempRecipe._id;
      new Upvote(exampleUpvote).save()
      .then( upvote => {
        this.tempUpvote = upvote;
        this.tempRecipe.upvotes.push(upvote._id);
        this.tempRecipe.save();
        this.tempProfile.upvotes.push(upvote._id);
        this.tempProfile.save();
        done();
      })
      .catch(done);
    });
    describe('with a valid profile id', () => {
      it('should return a list of upvotes', done => {
        request.get(`${url}/api/allupvotes/${this.tempProfile._id.toString()}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.upvotes[0].toString()).to.equal(this.tempUpvote._id.toString());
          expect(res.body.upvotes.length).to.equal(1);
          expect(res.body._id.toString()).to.equal(this.tempProfile._id.toString());
          done();
        });
      });
    });
    describe('without a valid user id', () => {
      it('should return a 404 error', done => {
        request.get(`${url}/api/allupvotes/alskdjf`)
        .end( err => {
          expect(err.status).to.equal(404);
          done();
        });
      });
    });
    describe('without a valid profile id', () => {
      it('should return a 404 error', done => {
        request.get(`${url}/api/allupvotes/n0taval1d1d00p5`)
        .set( { Authorization: `Bearer ${this.tempToken}` } )
        .end( err => {
          expect(err.status).to.equal(404);
          done();
        });
      });
    });
  });
  describe('GET /api/allrecipeupvotes/:recipeID', () => {
    beforeEach( done => {
      exampleUpvote.voterProfileID = this.tempProfile._id;
      exampleUpvote.recipeID = this.tempRecipe._id;
      new Upvote(exampleUpvote).save()
      .then( upvote => {
        this.tempUpvote = upvote;
        this.tempRecipe.upvotes.push(upvote._id);
        this.tempRecipe.save();
        this.tempProfile.upvotes.push(upvote._id);
        this.tempProfile.save();
        done();
      })
      .catch(done);
    });
    describe('with a valid recipe id', () => {
      it('should return a list of upvotes', done => {
        request.get(`${url}/api/allrecipeupvotes/${this.tempRecipe._id.toString()}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.upvotes[0].toString()).to.equal(this.tempUpvote._id.toString());
          expect(res.body.upvotes.length).to.equal(1);
          expect(res.body._id.toString()).to.equal(this.tempRecipe._id.toString());
          done();
        });
      });
    });
    describe('without a valid user id', () => {
      it('should return a 404 error', done => {
        request.get(`${url}/api/allrecipeupvotes/alskdjf`)
        .end(err => {
          expect(err.status).to.equal(404);
          done();
        });
      });
    });
    describe('without a valid recipe id', () => {
      it('should return a 404 error', done => {
        request.get(`${url}/api/allrecipeupvotes/n0taval1d1d00p5`)
        .set( { Authorization: `Bearer ${this.tempToken}`} )
        .end( err => {
          expect(err.status).to.equal(404);
          done();
        });
      });
    });
  });
  describe('PUT /api/upvote/:id', () => {
    beforeEach( done => {
      exampleUpvote.voterProfileID = this.tempProfile._id;
      exampleUpvote.recipeID = this.tempRecipe._id;
      new Upvote(exampleUpvote).save()
      .then( upvote => {
        this.tempUpvote = upvote;
        done();
      })
      .catch(done);
    });
    const updated = {
      upvote: 'the updated upvote content'
    };
    describe('with a valid upvote id and body', () => {
      it('should return an updated recipe', done => {
        request.put(`${url}/api/upvote/${this.tempUpvote._id.toString()}`)
        .set( { Authorization: `Bearer ${this.tempToken}`} )
        .send(updated)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.upvote).to.equal(updated.upvote);
          done();
        });
      });
    });
    describe('without a valid upvote id', () => {
      it('should return a 404 error', done => {
        request.put(`${url}/api/upvote/n0taval1d1d00p5`)
        .set( { Authorization: `Bearer ${this.tempToken}`} )
        .send(updated)
        .end((err, res) => {
          expect(err.status).to.equal(404);
          expect(res.text).to.equal('NotFoundError');
          done();
        });
      });
    });
    describe('without a valid body', () => {
      it('should return a 400 error', done => {
        request.put(`${url}/api/upvote/${this.tempUpvote._id}`)
        .set({ Authorization: `Bearer ${this.tempToken}`})
        .end((err, res) => {
          expect(err.status).to.equal(400);
          expect(res.text).to.equal('nothing to update');
          done();
        });
      });
    });
  });
  describe('DELETE /api/upvote/:id', () => {
    beforeEach( done => {
      exampleUpvote.voterProfileID = this.tempProfile._id;
      exampleUpvote.recipeID = this.tempRecipe._id;
      new Upvote(exampleUpvote).save()
      .then( upvote => {
        this.tempUpvote = upvote;
        this.tempRecipe.upvotes.push(upvote._id);
        this.tempRecipe.save();
        this.tempProfile.upvotes.push(upvote._id);
        this.tempProfile.save();
        done();
      })
      .catch(done);
    });
    describe('with a valid upvote id', () => {
      it('should return a 204 status', done => {
        request.delete(`${url}/api/upvote/${this.tempUpvote._id.toString()}`)
        .set( { Authorization: `Bearer ${this.tempToken}` } )
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(204);
          Upvote.findById(this.tempUpvote._id)
          .catch(err => {
            expect(err).to.be(404);
          });
          Profile.findById(this.tempProfile._id)
          .then( profile => {
            expect(profile.upvotes.indexOf(this.tempUpvote._id)).to.equal(-1);
          })
          .catch(done);
          Recipe.findById(this.tempRecipe._id)
          .then( recipe => {
            expect(recipe.upvotes.indexOf(this.tempUpvote._id)).to.equal(-1);
          })
          .catch(done);
          done();
        });
      });
    });
    describe('without a valid upvote id', () => {
      it('should return a 404 error', done => {
        request.delete(`${url}/api/upvote/n0taval1d1d00p5`)
        .set({ Authorization: `Bearer ${this.tempToken}` } )
        .end( err => {
          expect(err.status).to.equal(404);
          done();
        });
      });
    });
  });
});
