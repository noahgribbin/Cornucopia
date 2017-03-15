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
  username: 'bad test username',
  email: 'teste'
};

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
    describe('with a valid username and password', function(){
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
    describe('with an invalid username', function(){
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
        .auth(badUser.username, exampleUser.password)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.text).to.be.a('string');
          done();
        });
      });
    });
    describe('with an invalid password', function(){
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
        .auth(exampleUser.username, badUser.password)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.text).to.equal('Wrong password!');
          expect(res.res.statusMessage).to.equal('Unauthorized');
          console.log(res);
          expect(res.text).to.be.a('string');
          done();
        });
      });
    });
  });

  describe('PUT /api/account', function(){
    
    beforeEach( done => {
      let password  = exampleUser.password;
      let user = new User(exampleUser);
      user.generatePasswordHash(password)
      .then( user => {
        this.tempUser = user;
        return user.save();
      })
      .then( user => user.generateToken())
      .then( () => done())
      .catch(err => done(err));
    });

    afterEach( done => {
      User.remove({})
      .then( () => done())
      .catch(done);
    });

    describe('with a valid body', () => {
      it('should return an updated user ', done => {
        let updated = {
          password: 'updatedpassword',
          email: 'updated email'
        };

        request.put(`${url}/api/account`)
        .auth('test username','test password')
        .send(updated)
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.email).to.be.equal(updated.email);
          expect(res.body.username).to.equal(this.tempUser.username);
          expect(res.body.password).to.not.equal(this.tempUser.password);
          done();
        });
      });
    });

    describe('with a valid body and different and same password', () => {
      it('should return an updated user', done => {
        let updated = {
          username: 'updated username',
          email: 'updated email'
        };

        request.put(`${url}/api/account`)
        .auth('test username','test password')
        .send(updated)
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.email).to.be.equal(updated.email);
          expect(res.body.username).to.equal(updated.username);
          expect(res.body.password).to.equal(this.tempUser.password);
          done();
        });
      });
    });

    
    describe('with an invalid body', () => {
      it('should return an 400 status error', done => {
        request.put(`${url}/api/account`)
        .auth('test username','test password')
        .send()
        .end((err, res) => {
          expect(res.text).to.equal('Expected request body');
          expect(res.status).to.equal(400);
          expect(res.badRequest).to.equal(true);
          expect(res.clientError).to.equal(true);
          expect(err.status).to.equal(400);
          done();
        });
      });
    });
  });
});

