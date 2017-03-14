'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Profile = require('../model/profile.js');
const User = require('../model/user.js');

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'dastestusername',
  password: 'lalala',
  email: 'example@example.com'
};

const exampleProfile = {
  name: 'example name',
  picURI: 'example uri'
};

describe('Profile Routes', () => {
  // afterEach( done => {
  //   Promise.all([
  //     User.remove({}),
  //     Profile.remove({})
  //   ])
  //   .then( () => {
  //     delete exampleProfile.userID;
  //     done();
  //   })
  //   .catch(done);
  // });
  describe('POST /api/profile', () => {
    describe('with a valid body', () => {
      before( done => {
        let password  = exampleUser.password;
        delete exampleUser.password;
        let user = new User(exampleUser);
        user.generatePasswordHash(password)
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
          exampleProfile.userID = user._id.toString();
          new Profile(exampleProfile).save()
          .then( profile => {
            this.tempProfile = profile;
            done();
          })
          .catch(err => done(err));
        })
        .catch( err => done(err));
      });
      it('should return a token', done => {
        // exampleProfile.userID = this.tempUser._id.toString();
        request.post(`${url}/api/profile`)
        .set( { Authorization: `Bearer ${this.tempToken}` } )
        .send(exampleProfile)
        .end((err, res) => {
          if(err) return done(err);
          let date = new Date(res.body.created).toString();
          expect(res.status).to.equal(200);
          expect(date).to.not.equal('invalid date');
          expect(res.body.name).to.equal(exampleProfile.name);
          expect(res.body.picURI).to.equal(exampleProfile.picURI);
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
