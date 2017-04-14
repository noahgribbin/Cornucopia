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
  categories: ['example cat 1', 'example cat 2']
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
      delete examplePic.recipeID;
      delete examplePic.profileID;
      this.tempProfile.recipes = [];
      done();
    })
    .catch(done);
  });
  describe('POST: /api/profile/:profileID/pic', () => {
    describe.only('with a valid body and id', () => {
      it('should return a profile pic', done => {
        request.post(`${url}/api/profile/${this.tempProfile._id.toString()}/pic`)
        .set( { Authorization: `Bearer ${this.tempToken}` } )
        .attach('image', examplePic.image)
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.theID).to.equal(this.tempProfile._id.toString());
          done();
        });
      });
    });
  //   describe('with an invalid body', () => {
  //     it('should return a 400 error', done => {
  //       request.post(`${url}/api/pic/${this.tempRecipe._id}`)
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
  //       request.post(`${url}/api/pic/${this.tempRecipe._id}`)
  //       .send(examplePic)
  //       .end((err, res) => {
  //         expect(err.status).to.equal(401);
  //         expect(res.text).to.equal('authorization header required');
  //         done();
  //       });
  //     });
  //   });
  // });
  // describe('GET /api/pic/:id', () => {
  //   beforeEach( done => {
  //     examplePic.profileID = this.tempProfile._id;
  //     examplePic.recipeID = this.tempRecipe._id;
  //     new ResPic(examplePic).save()
  //     .then( pic => {
  //       this.tempPic = pic;
  //       done();
  //     })
  //     .catch(done);
  //   });
  //   describe('with a valid pic id', () => {
  //     it('should return a pic', done => {
  //       request.get(`${url}/api/pic/${this.tempPic._id.toString()}`)
  //       .end((err, res) => {
  //         if (err) return done(err);
  //         expect(res.status).to.equal(200);
  //         expect(res.body.pic).to.equal(examplePic.pic);
  //         expect(res.body.recipeID.toString()).to.equal(examplePic.recipeID.toString());
  //         expect(res.body.profileID.toString()).to.equal(examplePic.profileID.toString());
  //         done();
  //       });
  //     });
  //   });
  //   describe('without a valid pic id', () => {
  //     it('should return a 404 error', done => {
  //       request.get(`${url}/api/pic/alskdjf`)
  //       .end( err => {
  //         expect(err.status).to.equal(404);
  //         done();
  //       });
  //     });
  //   });
  // });
  // describe('GET /api/allpics/:profileID', () => {
  //   beforeEach( done => {
  //     examplePic.profileID = this.tempProfile._id;
  //     examplePic.recipeID = this.tempRecipe._id;
  //     new ResPic(examplePic).save()
  //     .then(pic => {
  //       this.tempPic = pic;
  //       this.tempRecipe.pics.push(pic._id);
  //       this.tempRecipe.save();
  //       this.tempProfile.pics.push(pic._id);
  //       this.tempProfile.save();
  //       done();
  //     })
  //     .catch(done);
  //   });
  //   describe('with a valid profile id', () => {
  //     it('should return a list of pics', done => {
  //       request.get(`${url}/api/allpics/${this.tempProfile._id.toString()}`)
  //       .end((err, res) => {
  //         if (err) return done(err);
  //         expect(res.status).to.equal(200);
  //         expect(res.body.pics[0].toString()).to.equal(this.tempPic._id.toString());
  //         expect(res.body.pics.length).to.equal(1);
  //         expect(res.body._id.toString()).to.equal(this.tempProfile._id.toString());
  //         done();
  //       });
  //     });
  //   });
  //   describe('without a valid user id', () => {
  //     it('should return a 404 error', done => {
  //       request.get(`${url}/api/allpics/alskdjf`)
  //       .end( err => {
  //         expect(err.status).to.equal(404);
  //         done();
  //       });
  //     });
  //   });
  //   describe('without a valid profile id', () => {
  //     it('should return a 404 error', done => {
  //       request.get(`${url}/api/allpics/n0taval1d1d00p5`)
  //       .set( { Authorization: `Bearer ${this.tempToken}`} )
  //       .end( err => {
  //         expect(err.status).to.equal(404);
  //         done();
  //       });
  //     });
  //   });
  // });
  // describe('GET /api/allrecipepics/:recipeID', () => {
  //   beforeEach( done => {
  //     examplePic.profileID = this.tempProfile._id;
  //     examplePic.recipeID = this.tempRecipe._id;
  //     new ResPic(examplePic).save()
  //     .then( pic => {
  //       this.tempPic = pic;
  //       this.tempRecipe.pics.push(pic._id);
  //       this.tempRecipe.save();
  //       this.tempProfile.pics.push(pic._id);
  //       this.tempProfile.save();
  //       done();
  //     })
  //     .catch(done);
  //   });
  //   describe('with a valid recipe id', () => {
  //     it('should return a list of pics', done => {
  //       request.get(`${url}/api/allrecipepics/${this.tempRecipe._id.toString()}`)
  //       .end((err, res) => {
  //         if (err) return done(err);
  //         expect(res.status).to.equal(200);
  //         expect(res.body.pics[0].toString()).to.equal(this.tempPic._id.toString());
  //         expect(res.body.pics.length).to.equal(1);
  //         expect(res.body._id.toString()).to.equal(this.tempRecipe._id.toString());
  //         done();
  //       });
  //     });
  //   });
  //   describe('without a valid user id', () => {
  //     it('should return a 404 error', done => {
  //       request.get(`${url}/api/allrecipepics/alskdjf`)
  //       .end( err => {
  //         expect(err.status).to.equal(404);
  //         done();
  //       });
  //     });
  //   });
  //   describe('without a valid recipe id', () => {
  //     it('should return a 404 error', done => {
  //       request.get(`${url}/api/allrecipepics/n0taval1d1d00p5`)
  //       .set( { Authorization: `Bearer ${this.tempToken}`} )
  //       .end( err => {
  //         expect(err.status).to.equal(404);
  //         done();
  //       });
  //     });
  //   });
  // });
  // describe('PUT /api/pic/:id', () => {
  //   beforeEach( done => {
  //     examplePic.profileID = this.tempProfile._id;
  //     examplePic.recipeID = this.tempRecipe._id;
  //     new ResPic(examplePic).save()
  //     .then( pic => {
  //       this.tempPic = pic;
  //       done();
  //     })
  //     .catch(done);
  //   });
  //   const updated = {
  //     pic: 'the updated pic content'
  //   };
  //   describe('with a valid pic id and body', () => {
  //     it('should return an updated recipe', done => {
  //       request.put(`${url}/api/pic/${this.tempPic._id.toString()}`)
  //       .set( { Authorization: `Bearer ${this.tempToken}`} )
  //       .send(updated)
  //       .end((err, res) => {
  //         if (err) return done(err);
  //         expect(res.status).to.equal(200);
  //         expect(res.body.pic).to.equal(updated.pic);
  //         done();
  //       });
  //     });
  //   });
  //   describe('without a valid pic id', () => {
  //     it('should return a 404 error', done => {
  //       request.put(`${url}/api/pic/n0taval1d1d00p5`)
  //       .set( { Authorization: `Bearer ${this.tempToken}`} )
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
  //       request.put(`${url}/api/pic/${this.tempPic._id}`)
  //       .set( { Authorization: `Bearer ${this.tempToken}`} )
  //       .end((err, res) => {
  //         expect(err.status).to.equal(400);
  //         expect(res.text).to.equal('nothing to update');
  //         done();
  //       });
  //     });
  //   });
  // });
  // describe('DELETE /api/pic/:id', () => {
  //   beforeEach( done => {
  //     examplePic.profileID = this.tempProfile._id;
  //     examplePic.recipeID = this.tempRecipe._id;
  //     new ResPic(examplePic).save()
  //     .then( pic => {
  //       this.tempPic = pic;
  //       this.tempRecipe.pics.push(pic._id);
  //       this.tempRecipe.save();
  //       this.tempProfile.pics.push(pic._id);
  //       this.tempProfile.save();
  //       done();
  //     })
  //     .catch(done);
  //   });
  //   describe('with a valid pic id', () => {
  //     it('should return a 204 status', done => {
  //       request.delete(`${url}/api/pic/${this.tempPic._id.toString()}`)
  //       .set( { Authorization: `Bearer ${this.tempToken}`} )
  //       .end((err, res) => {
  //         if (err) return done(err);
  //         expect(res.status).to.equal(204);
  //         ResPic.findById(this.tempPic._id)
  //         .catch( err => {
  //           expect(err).to.be(404);
  //         });
  //         Profile.findById(this.tempProfile._id)
  //         .then( profile => {
  //           expect(profile.pics.indexOf(this.tempPic._id)).to.equal(-1);
  //         })
  //         .catch(done);
  //         Recipe.findById(this.tempRecipe._id)
  //         .then( recipe => {
  //           expect(recipe.pics.indexOf(this.tempPic._id)).to.equal(-1);
  //         })
  //         .catch(done);
  //         done();
  //       });
  //     });
  //   });
  //   describe('without a valid pic id', () => {
  //     it('should return a 404 error', done => {
  //       request.delete(`${url}/api/pic/n0taval1d1d00p5`)
  //       .set( { Authorization: `Bearer ${this.tempToken}`} )
  //       .end( err => {
  //         expect(err.status).to.equal(404);
  //         done();
  //       });
  //     });
  //   });
  });
});
