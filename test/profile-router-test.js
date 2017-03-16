'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Profile = require('../model/profile.js');
const User = require('../model/user.js');
const Recipe = require('../model/recipe.js');
const ResComment = require('../model/comment.js');
const Upvote = require('../model/upvote.js');

require('../server.js');

const url = `http://localhost:3003`;
// const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'testusername',
  password: 'lalala',
  email: 'example@example.com'
};

const exampleProfile = {
  name: 'example name',
  profilePicURI: 'example uri'
};

const exampleComment = {
  comment: 'example comment'
};

const exampleUpvote = {
  upvote: 'example upvote'
};

const exampleRecipe = {
  ingredients: ['example ingredient 1', 'example ingredient 2', 'example ingredient 3'],
  instructions: 'example recipe instructions',
  picURI: 'example recipe picURI',
  categories: ['example cat 1', 'example cat 2']
};


describe('Profile Routes', () => {
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
      done();
    })
    .catch( err => done(err));
  });
  afterEach( done => {
    Promise.all([
      User.remove({}),
      Profile.remove({})
    ])
    .then( () => {
      delete exampleProfile.userID;
      done();
    })
    .catch(done);
  });
  describe('POST /api/profile', () => {
    describe('with a valid body', () => {
      it('should return a token', done => {
        request.post(`${url}/api/profile`)
        .set( { Authorization: `Bearer ${this.tempToken}` } )
        .send(exampleProfile)
        .end((err, res) => {
          if(err) return done(err);
          let date = new Date(res.body.created).toString();
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(exampleProfile.name);
          expect(res.body.picURI).to.equal(exampleProfile.picURI);
          expect(date).to.not.equal('invalid date');
          done();
        });
      });
    });
    describe('with an invalid body', () => {
      it('should return a 400 error', done => {
        request.post(`${url}/api/profile`)
        .set( { Authorization: `Bearer ${this.tempToken}` } )
        .end((err, res) => {
          expect(err.status).to.equal(400);
          expect(res.text).to.equal('request body expected');
          done();
        });
      });
    });
    describe('with an invalid token', () => {
      it('should return 401 error', done => {
        request.post(`${url}/api/profile`)
        .send(exampleProfile)
        .end((err, res) => {
          expect(err.status).to.equal(401);
          expect(res.text).to.equal('authorization header required');
          done();
        });
      });
    });
  });
  describe('GET /api/profile/:id', () => {
    before( done => {
      exampleProfile.userID = this.tempUser._id.toString();
      new Profile(exampleProfile).save()
      .then( profile => {
        this.tempProfile = profile;
        done();
      })
      .catch(err => done(err));
    });
    describe('with a valid profile id', () => {
      it('should return a profile', done => {
        request.get(`${url}/api/profile/${this.tempProfile._id.toString()}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(exampleProfile.name);
          expect(res.body.profilePicURI).to.equal(exampleProfile.profilePicURI);
          done();
        });
      });
    });
    describe('without a valid profile id', () => {
      it('should return a 404 error', done => {
        request.get(`${url}/api/profile/n0taval1d1d00p5`)
        .end( err => {
          expect(err.status).to.equal(404);
          done();
        });
      });
    });
  });
  describe('GET /api/allprofiles', () => {
    before( done => {
      exampleProfile.userID = this.tempUser._id.toString();
      new Profile(exampleProfile).save()
      .then( profile => {
        this.tempProfile = profile;
        done();
      })
      .catch(err => done(err));
    });
    describe('with a valid endpoint', () => {
      it('should return a list of all profiles', done => {
        request.get(`${url}/api/allprofiles`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.length).to.equal(1);
          expect(res.body[0]._id.toString()).to.equal(this.tempProfile._id.toString());
          expect(res.body[0].name).to.equal(this.tempProfile.name);
          expect(res.body[0].userID.toString()).to.equal(this.tempProfile.userID.toString());
          expect(res.body[0].profilePicURI).to.equal(this.tempProfile.profilePicURI);
          done();
        });
      });
    });
    describe('with an invalid path', () => {
      it('should return a 404 error', done => {
        request.get(`${url}/api/ohdear`)
        .end( err => {
          expect(err.status).to.equal(404);
          done();
        });
      });
    });
  });
  describe('PUT /api/profile/:id', () => {
    before( done => {
      exampleProfile.userID = this.tempUser._id.toString();
      new Profile(exampleProfile).save()
      .then( profile => {
        this.tempProfile = profile;
        done();
      })
      .catch( err => done(err));
    });
    const updated = {
      name: 'updated name',
      profilePicURI: 'updated profile image url'
    };
    describe('with a valid profile id and body', () => {
      it('should return an updated profile', done => {
        request.put(`${url}/api/profile/${this.tempProfile._id.toString()}`)
        .set( { Authorization: `Bearer ${this.tempToken}`} )
        .send(updated)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(updated.name);
          expect(res.body.profilePicURI).to.equal(updated.profilePicURI);
          done();
        });
      });
    });
    describe('without a valid profile id', () => {
      it('should return a 404 error', done => {
        request.put(`${url}/api/profile/n0taval1d1d00p5`)
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
        request.put(`${url}/api/profile/${this.tempProfile._id}`)
        .set( { Authorization: `Bearer ${this.tempToken}`} )
        .end((err, res) => {
          expect(err.status).to.equal(400);
          expect(res.text).to.equal('nothing to update');
          done();
        });
      });
    });
  });
  describe('DELETE /api/profile/:id', () => {
    beforeEach( done => {
      exampleProfile.userID = this.tempUser._id.toString();
      new Profile(exampleProfile).save()
      .then( profile => {
        this.tempProfile = profile;
        done();
      })
      .catch( err => done(err));
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
    beforeEach( done => {
      exampleComment.commenterProfileID = this.tempProfile._id;
      exampleComment.recipeID = this.tempRecipe._id;
      new ResComment(exampleComment).save()
      .then( comment => {
        this.tempComment = comment;
        done();
      })
      .catch(done);
    });
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
    afterEach( done => {
      Promise.all([
        User.remove({}),
        Profile.remove({}),
        Recipe.remove({}),
        ResComment.remove({}),
        Upvote.remove({})
      ])
      .then( () => {
        delete exampleProfile.userID;
        delete exampleUpvote.commenterProfileID;
        delete exampleUpvote.recipeID;
        delete exampleComment.commenterProfileID;
        delete exampleComment.recipeID;
        done();
      })
      .catch(done);
    });

    describe('with a valid profile id', () => {
      it('should delete the user and profile, with the profiles recipes and comments', done => {
        request.delete(`${url}/api/profile/${this.tempProfile._id.toString()}`)
        .set( { Authorization: `Bearer ${this.tempToken}` } )
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(204);
          ResComment.findById(this.tempComment._id)
          .catch( err => {
            expect(err).to.be(404);
          });
          Upvote.findById(this.tempUpvote._id)
          .catch( err => {
            expect(err).to.be(404);
          });
          Recipe.findById(this.tempRecipe._id)
          .catch( err => {
            expect(err).to.be(404);
          });
          Profile.findById(this.tempProfile._id)
          .catch( err => {
            expect(err).to.be(404);
          });
          User.findById(this.tempUser._id)
          .catch( err => {
            expect(err).to.be(404);
          });
          done();
        });
      });
    });
    describe('without a valid profile id', () => {
      it('should return a 404 error', done => {
        request.delete(`${url}/api/profile/n0taval1d1d00p5`)
        .set( { Authorization: `Bearer ${this.tempToken}` } )
        .end( err => {
          expect(err.status).to.equal(404);
          done();
        });
      });
    });
  });
});
