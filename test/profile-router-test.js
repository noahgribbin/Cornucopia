'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Profile = require('../model/profile.js');
const User = require('../model/user.js');

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'testusername',
  password: 'lalala',
  email: 'example@example.com'
};

const exampleProfile = {
  name: 'example name',
  profilePicURI: 'example uri'
};

describe('Profile Routes', () => {
  describe('POST /api/profile', () => {
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
          done();
        })
        // .then( () => {
        //   // exampleProfile.userID = this.tempUser._id.toString();
        //   console.log('example profile userid', exampleProfile.userID);
        //   new Profile(exampleProfile).save()
        //   .then( profile => {
        //     console.log('profile', profile)
        //     this.tempProfile = profile;
        //     done();
        //   })
        //   .catch(err => done(err));
        // })
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
          .end(err => {
            expect(err.status).to.equal(400);
            done();
          });
        });
      });
      describe('with an invalid token', () => {
        it('should return 401 error', done => {
          request.post(`${url}/api/profile`)
          .send(exampleProfile)
          .end(err => {
            expect(err.status).to.equal(401);
            done();
          });
        });
      });
    });
  describe('GET /api/signin', () => {
    // describe('with a valid body', () => {
    //   it('should return a token', done => {
    //     request.get(`${url}/api/signin`)
    //     .auth('test username','test password')
    //     .end((err, res) => {
    //       if(err) return done(err);
    //       expect(res.status).to.equal(200);
    //       expect(res.text).to.be.a('string');
    //       done();
    //     });
    //   });
    // });
  });
});
