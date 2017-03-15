'use strict';

const expect = require('chai').expect;
const request = require('superagent');

const User = require('../model/user.js');

require('../server.js');
const url = `http://localhost:3003`;
// const url = `http://localhost:${process.env.PORT}`;


const exampleUser = {
  username: 'test username',
  password: 'test password',
  email: 'test@example.com'
};
const badUser = {

  username: 'test username',
  email: 'teste'
}

describe('Auth Routes', function(){
  describe('POST /api/signup', function(){
    describe('with a valid body', function(){

      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', done => {
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.text).to.be.a('string');
          done();
        });
      });
    });

    describe('with an invalid body', function(){

      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return 400', done => {
        request.post(`${url}/api/signup`)
        .send(badUser)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });

    describe('with no body', function(){

      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return 400', done => {
        request.post(`${url}/api/signup`)
        .send({})
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
  });

  describe('GET /api/signin', function(){
    describe('with a valid body', function(){
      before( done => {
        let password  = exampleUser.password;
        let user = new User(exampleUser);
        user.generatePasswordHash(password)
        .then( user => user.save())
        .then( user => user.generateToken())
        .then( () => done())
        .catch(err => done(err));
      });

      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', done => {
        request.get(`${url}/api/signin`)
        .auth('test username','test password')
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.text).to.be.a('string');
          done();
        });
      });
    });
    describe('with a valid body', function(){
      before( done => {
        let password  = exampleUser.password;
        let user = new User(exampleUser);
        user.generatePasswordHash(password)
        .then( user => user.save())
        .then( user => user.generateToken())
        .then( () => done())
        .catch(err => done(err));
      });

      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', done => {
        request.get(`${url}/api/signin`)
        .auth(badUser.username, badUser.password)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.text).to.be.a('string');
          done();
        });
      });
    });
  });
});
