'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Profile = require('../model/profile.js');
const User = require('../model/user.js');
const Recipe = require('../model/recipe.js');
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

const exampleRecipe = {
  ingredients: ['example ingredient 1', 'example ingredient 2', 'example ingredient 3'],
  instructions: 'example recipe instructions',
  picURI: 'example recipe picURI',
  categories: ['example cat 1', 'example cat 2']
};


describe('Recipe Routes', () => {
  // beforeEach( done => {
  //   let password = exampleUser.password;
  //   new User(exampleUser)
  //   .generatePasswordHash(exampleUser.password)
  //   .then( user => user.save())
  //   .then( user => {
  //     this.tempUser = user;
  //     return user.generateToken();
  //   })
  //   .then(token => {
  //     this.tempToken = token;
  //     return;
  //   })
  //   .then( () => {
  //     exampleProfile.userID = this.tempUser._id.toString();
  //     new Profile(exampleProfile).save()
  //     .then( profile => {
  //       this.tempProfile = profile;
  //       done();
  //     })
  //   })
  //   .catch( err => done(err));
  // });
  // beforeEach( done => {
  //   console.log('in second beforeEach')
  //   exampleProfile.userID = this.tempUser._id.toString();
  //   new Profile(exampleProfile).save()
  //   .then( profile => {
  //     this.tempProfile = profile;
  //     console.log('this temp profile in before each', this.tempProfile);
  //     done();
  //   })
  //   .catch( err => done(err));
  // });
  beforeEach( done => {
    let password = exampleUser.password;
    new User(exampleUser)
    .generatePasswordHash(exampleUser.password)
    .then( user => user.save())
    .then( user => {
      this.tempUser = user;
      return user.generateToken();
    })
    .then(token => {
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
  describe('POST /api/recipe', () => {
    afterEach(done => {
      Recipe.remove({})
      .then( () => {
        delete exampleRecipe.profileID;
        done();
      })
      .catch(done);
    })
    describe('with a valid body', () => {
      it('should return a token', done => {
        request.post(`${url}/api/recipe`)
        .set( { Authorization: `Bearer ${this.tempToken}` } )
        .send(exampleRecipe)
        .end((err, res) => {
          if(err) return done(err);
          let date = new Date(res.body.created).toString();
          expect(res.status).to.equal(200);
          expect(res.body.recipe.ingredients.toString()).to.equal(exampleRecipe.ingredients.toString());
          expect(res.body.recipe.instructions).to.equal(exampleRecipe.instructions);
          expect(res.body.recipe.categories.toString()).to.equal(exampleRecipe.categories.toString());
          expect(res.body.recipe.picURI).to.equal(exampleRecipe.picURI);
          expect(date).to.not.equal('invalid date');
          done();
        });
      });
    });
  //   describe('with an invalid body', () => {
  //     it('should return a 400 error', done => {
  //       request.post(`${url}/api/profile`)
  //       .set( { Authorization: `Bearer ${this.tempToken}` } )
  //       .end((err, res) => {
  //         expect(err.status).to.equal(400);
  //         expect(res.text).to.equal('request body expected');
  //         done();
  //       });
  //     });
  //   });
  //   describe('with an invalid token', () => {
  //     it('should return 401 error', done => {
  //       request.post(`${url}/api/profile`)
  //       .send(exampleProfile)
  //       .end((err, res) => {
  //         expect(err.status).to.equal(401);
  //         expect(res.text).to.equal('authorization header required');
  //         done();
  //       });
  //     });
  //   });
  });
  describe('GET /api/recipe/:id', () => {
    beforeEach(done => {
      exampleRecipe.profileID = this.tempProfile._id;
      new Recipe(exampleRecipe).save()
      .then(recipe => {
        this.tempRecipe = recipe;
        done();
      })
      .catch(done);
    });
    afterEach(done => {
      Recipe.remove({})
      .then( () => {
        delete exampleRecipe.profileID;
        done();
      })
      .catch(done);
    })
    describe('with a valid recipe id', () => {
      it('should return a recipe', done => {
        request.get(`${url}/api/recipe/${this.tempRecipe._id.toString()}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.ingredients.toString()).to.equal(exampleRecipe.ingredients.toString());
          expect(res.body.instructions).to.equal(exampleRecipe.instructions);
          expect(res.body.categories.toString()).to.equal(exampleRecipe.categories.toString());
          expect(res.body.picURI).to.equal(exampleRecipe.picURI);
          done();
        });
      });
    });
    describe('without a valid recipe id', () => {
      it('should return a 404 error', done => {
        request.get(`${url}/api/recipe/alskdjf`)
        .end(err => {
          expect(err.status).to.equal(404);
          done();
        });
      });
    });
  });
  describe('GET /api/allrecipes/:profileID', () => {
    describe('with a valid profile id', () => {
      it('should return a list of recipes', done => {
        request.get(`${url}/api/allrecipes/${this.tempProfile._id.toString()}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body[0]).to.equal(this.tempRecipe._id.toString());
          expect(res.body.length).to.equal(1);
          done();
        });
      });
    });
    describe('without a valid user id', () => {
      it('should return a 404 error', done => {
        request.get(`${url}/api/allrecipes/alskdjf`)
        .end(err => {
          expect(err.status).to.equal(404);
          done();
        });
      });
    });
  });
  //   describe('without a valid profile id', () => {
  //     it('should return a 404 error', done => {
  //       request.get(`${url}/api/profile/n0taval1d1d00p5`)
  //       .set({ Authorization: `Bearer ${this.tempToken}`})
  //       .end((err, res) => {
  //         expect(err.status).to.equal(404);
  //         done();
  //       });
  //     });
  //   });
  // });
  // describe('PUT /api/profile/:id', () => {
  //   before(done => {
  //     exampleProfile.userID = this.tempUser._id.toString();
  //     new Profile(exampleProfile).save()
  //     .then( profile => {
  //       this.tempProfile = profile;
  //       done();
  //     })
  //     .catch(err => done(err));
  //   });
  //   const updated = {
  //     name: 'updated name',
  //     profilePicURI: 'updated profile image url'
  //   };
  //   describe('with a valid profile id and body', () => {
  //     it('should return an updated profile', done => {
  //       request.put(`${url}/api/profile/${this.tempProfile._id.toString()}`)
  //       .set({ Authorization: `Bearer ${this.tempToken}`})
  //       .send(updated)
  //       .end((err, res) => {
  //         if (err) return done(err);
  //         expect(res.status).to.equal(200);
  //         expect(res.body.name).to.equal(updated.name);
  //         expect(res.body.profilePicURI).to.equal(updated.profilePicURI);
  //         done();
  //       });
  //     });
  //   });
  //   describe('without a valid profile id', () => {
  //     it('should return a 404 error', done => {
  //       request.put(`${url}/api/profile/n0taval1d1d00p5`)
  //       .set({ Authorization: `Bearer ${this.tempToken}`})
  //       .send(updated)
  //       .end((err, res) => {
  //         expect(err.status).to.equal(404);
  //         expect(res.text).to.equal('NotFoundError');
  //         done();
  //       });
  //     });
  //   });
  //   describe('without a valid body', () => {
  //     it('should return a 400 error', done => {
  //       request.put(`${url}/api/profile/${this.tempProfile._id}`)
  //       .set({ Authorization: `Bearer ${this.tempToken}`})
  //       .end((err, res) => {
  //         expect(err.status).to.equal(400);
  //         expect(res.text).to.equal('nothing to update');
  //         done();
  //       });
  //     });
  //   });
  // });
  // describe('DELETE /api/profile/:id', () => {
  //   before(done => {
  //     exampleProfile.userID = this.tempUser._id.toString();
  //     new Profile(exampleProfile).save()
  //     .then( profile => {
  //       this.tempProfile = profile;
  //       done();
  //     })
  //     .catch(err => done(err));
  //   });
  //   describe('with a valid profile id', () => {
  //     it('should return a 204 status', done => {
  //       request.delete(`${url}/api/profile/${this.tempProfile._id.toString()}`)
  //       .set({ Authorization: `Bearer ${this.tempToken}`})
  //       .end((err, res) => {
  //         if (err) return done(err);
  //         expect(res.status).to.equal(204);
  //         done();
  //       });
  //     });
  //   });
  //   describe('without a valid profile id', () => {
  //     it('should return a 404 error', done => {
  //       request.delete(`${url}/api/profile/n0taval1d1d00p5`)
  //       .set({ Authorization: `Bearer ${this.tempToken}`})
  //       .end((err, res) => {
  //         expect(err.status).to.equal(404);
  //         done();
  //       });
  //     });
  //   });
});
