'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Profile = require('../model/profile.js');
const User = require('../model/user.js');
const Recipe = require('../model/recipe.js');
const ResComment = require('../model/comment.js');

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'testusername',
  password: 'lalala',
  email: 'example@example.com'
};

const exampleProfile = {
  name: 'comment example name',
  profilePicURI: 'upvote example uri'
};

const exampleRecipe = {
  ingredients: ['example ingredient 1', 'example ingredient 2', 'example ingredient 3'],
  instructions: 'example recipe instructions',
  picURI: 'example recipe picURI',
  categories: ['example cat 1', 'example cat 2']
};

const exampleComment = {
  comment: 'example comment'
};

describe('Comment Routes', () => {
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
      return Profile.findByIdAndUpdate(this.tempProfile._id, this.tempProfile, {new: true} );
    })
    .then( () => done())
    .catch(done);
  });
  afterEach( done => {
    Promise.all([
      User.remove({}),
      Profile.remove({}),
      ResComment.remove({}),
      Recipe.remove({})
    ])
    .then( () => {
      delete exampleProfile.userID;
      delete exampleRecipe.profileID;
      delete exampleComment.recipeID;
      delete exampleComment.commenterProfileID;
      this.tempProfile.recipes = [];
      done();
    })
    .catch(done);
  });
  describe('POST /api/comment/:recipeID', () => {
    describe('with a valid body and recipe ID', () => {
      it('should return a comment', done => {
        exampleComment.recipeID = this.tempRecipe._id;
        exampleComment.commenterProfileID = this.tempProfile._id;
        request.post(`${url}/api/comment/${this.tempRecipe._id.toString()}`)
        .set( { Authorization: `Bearer ${this.tempToken}` } )
        .send(exampleComment)
        .end((err, res) => {
          if(err) return done(err);
          let date = new Date(res.body.created).toString();
          expect(res.status).to.equal(200);
          expect(res.body.profile.comments[0].toString()).to.equal(res.body.comment._id.toString());
          expect(res.body.recipe.comments[0].toString()).to.equal(res.body.comment._id.toString());
          expect(res.body.comment.comment).to.equal(exampleComment.comment);
          expect(res.body.comment.commenterProfileID).to.equal(this.tempProfile._id.toString());
          expect(res.body.comment.recipeID).to.equal(this.tempRecipe._id.toString());
          expect(date).to.not.equal('invalid date');
          done();
        });
      });
    });
    describe('with an invalid body', () => {
      it('should return a 400 error', done => {
        request.post(`${url}/api/comment/${this.tempRecipe._id}`)
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
        request.post(`${url}/api/comment/${this.tempRecipe._id}`)
        .send(exampleComment)
        .end((err, res) => {
          expect(err.status).to.equal(401);
          expect(res.text).to.equal('authorization header required');
          done();
        });
      });
    });
  });
  describe('GET /api/comment/:id', () => {
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
    describe('with a valid comment id', () => {
      it('should return a comment', done => {
        request.get(`${url}/api/comment/${this.tempComment._id.toString()}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.comment).to.equal(exampleComment.comment);
          expect(res.body.recipeID.toString()).to.equal(exampleComment.recipeID.toString());
          expect(res.body.commenterProfileID.toString()).to.equal(exampleComment.commenterProfileID.toString());
          done();
        });
      });
    });
    describe('without a valid comment id', () => {
      it('should return a 404 error', done => {
        request.get(`${url}/api/comment/alskdjf`)
        .end( err => {
          expect(err.status).to.equal(404);
          done();
        });
      });
    });
  });
  describe('GET /api/allcomments/:profileID', () => {
    beforeEach( done => {
      exampleComment.commenterProfileID = this.tempProfile._id;
      exampleComment.recipeID = this.tempRecipe._id;
      new ResComment(exampleComment).save()
      .then(comment => {
        this.tempComment = comment;
        this.tempRecipe.comments.push(comment._id);
        this.tempRecipe.save();
        this.tempProfile.comments.push(comment._id);
        this.tempProfile.save();
        done();
      })
      .catch(done);
    });
    describe('with a valid profile id', () => {
      it('should return a list of comments', done => {
        request.get(`${url}/api/allcomments/${this.tempProfile._id.toString()}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.comments[0].toString()).to.equal(this.tempComment._id.toString());
          expect(res.body.comments.length).to.equal(1);
          expect(res.body._id.toString()).to.equal(this.tempProfile._id.toString());
          done();
        });
      });
    });
    describe('without a valid user id', () => {
      it('should return a 404 error', done => {
        request.get(`${url}/api/allcomments/alskdjf`)
        .end( err => {
          expect(err.status).to.equal(404);
          done();
        });
      });
    });
    describe('without a valid profile id', () => {
      it('should return a 404 error', done => {
        request.get(`${url}/api/allcomments/n0taval1d1d00p5`)
        .set( { Authorization: `Bearer ${this.tempToken}`} )
        .end( err => {
          expect(err.status).to.equal(404);
          done();
        });
      });
    });
  });
  describe('GET /api/allrecipecomments/:recipeID', () => {
    beforeEach( done => {
      exampleComment.commenterProfileID = this.tempProfile._id;
      exampleComment.recipeID = this.tempRecipe._id;
      new ResComment(exampleComment).save()
      .then( comment => {
        this.tempComment = comment;
        this.tempRecipe.comments.push(comment._id);
        this.tempRecipe.save();
        this.tempProfile.comments.push(comment._id);
        this.tempProfile.save();
        done();
      })
      .catch(done);
    });
    describe('with a valid recipe id', () => {
      it('should return a list of comments', done => {
        request.get(`${url}/api/allrecipecomments/${this.tempRecipe._id.toString()}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.comments[0].toString()).to.equal(this.tempComment._id.toString());
          expect(res.body.comments.length).to.equal(1);
          expect(res.body._id.toString()).to.equal(this.tempRecipe._id.toString());
          done();
        });
      });
    });
    describe('without a valid user id', () => {
      it('should return a 404 error', done => {
        request.get(`${url}/api/allrecipecomments/alskdjf`)
        .end( err => {
          expect(err.status).to.equal(404);
          done();
        });
      });
    });
    describe('without a valid recipe id', () => {
      it('should return a 404 error', done => {
        request.get(`${url}/api/allrecipecomments/n0taval1d1d00p5`)
        .set( { Authorization: `Bearer ${this.tempToken}`} )
        .end( err => {
          expect(err.status).to.equal(404);
          done();
        });
      });
    });
  });
  describe('PUT /api/comment/:id', () => {
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
    const updated = {
      comment: 'the updated comment content'
    };
    describe('with a valid comment id and body', () => {
      it('should return an updated recipe', done => {
        request.put(`${url}/api/comment/${this.tempComment._id.toString()}`)
        .set( { Authorization: `Bearer ${this.tempToken}`} )
        .send(updated)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.comment).to.equal(updated.comment);
          done();
        });
      });
    });
    describe('without a valid comment id', () => {
      it('should return a 404 error', done => {
        request.put(`${url}/api/comment/n0taval1d1d00p5`)
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
        request.put(`${url}/api/comment/${this.tempComment._id}`)
        .set( { Authorization: `Bearer ${this.tempToken}`} )
        .end((err, res) => {
          expect(err.status).to.equal(400);
          expect(res.text).to.equal('nothing to update');
          done();
        });
      });
    });
  });
  describe('DELETE /api/comment/:id', () => {
    beforeEach( done => {
      exampleComment.commenterProfileID = this.tempProfile._id;
      exampleComment.recipeID = this.tempRecipe._id;
      new ResComment(exampleComment).save()
      .then( comment => {
        this.tempComment = comment;
        this.tempRecipe.comments.push(comment._id);
        this.tempRecipe.save();
        this.tempProfile.comments.push(comment._id);
        this.tempProfile.save();
        done();
      })
      .catch(done);
    });
    describe('with a valid comment id', () => {
      it('should return a 204 status', done => {
        request.delete(`${url}/api/comment/${this.tempComment._id.toString()}`)
        .set( { Authorization: `Bearer ${this.tempToken}`} )
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(204);
          ResComment.findById(this.tempComment._id)
          .catch( err => {
            expect(err).to.be(404);
          });
          Profile.findById(this.tempProfile._id)
          .then( profile => {
            expect(profile.comments.indexOf(this.tempComment._id)).to.equal(-1);
          })
          .catch(done);
          Recipe.findById(this.tempRecipe._id)
          .then( recipe => {
            expect(recipe.comments.indexOf(this.tempComment._id)).to.equal(-1);
          })
          .catch(done);
          done();
        });
      });
    });
    describe('without a valid comment id', () => {
      it('should return a 404 error', done => {
        request.delete(`${url}/api/comment/n0taval1d1d00p5`)
        .set( { Authorization: `Bearer ${this.tempToken}`} )
        .end( err => {
          expect(err.status).to.equal(404);
          done();
        });
      });
    });
  });
});
