'use strict';

const expect = require('chai').expect;
const request = require('superagent');

const User = require('../model/user.js');

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'test username',
  password: 'test password',
  email: 'test@example.com'
};
const badUser = {
  username: 'bad test username',
  email: 'teste'
};

describe('Auth Routes', () => {
  afterEach( done => {
    User.remove({})
    .then( () => done())
    .catch(done);
  });
  describe('POST /api/signup', () => {
    describe('with a valid body', () => {
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
    describe('with an invalid body', () => {
      it('should return a 400 status code', done => {
        request.post(`${url}/api/signup`)
        .send(badUser)
        .end((err, res) => {
          expect(err.status).to.equal(400);
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
    describe('with no body', () => {
      it('should return a 400 status code', done => {
        request.post(`${url}/api/signup`)
        .send({})
        .end((err, res) => {
          expect(err.status).to.equal(400);
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
  });
  describe('GET /api/signin', () => {
    describe('with a valid username and password', () => {
      before( done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => user.generateToken())
        .then( () => done())
        .catch( err => done(err));
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
    describe('with an invalid username', () => {
      before( done => {
        let password  = exampleUser.password;
        let user = new User(exampleUser);
        user.generatePasswordHash(password)
        .then( user => user.save())
        .then( user => user.generateToken())
        .then( () => done())
        .catch( err => done(err));
      });
      it('should return 404 status code', done => {
        request.get(`${url}/api/signin`)
        .auth(badUser.username, exampleUser.password)
        .end((err, res) => {
          expect(err.status).to.equal(404);
          expect(res.status).to.equal(404);
          expect(res.text).to.be.a('string');
          done();
        });
      });
    });
    describe('with an invalid password', () => {
      before( done => {
        let password  = exampleUser.password;
        let user = new User(exampleUser);
        user.generatePasswordHash(password)
        .then( user => user.save())
        .then( user => user.generateToken())
        .then( () => done())
        .catch( err => done(err));
      });
      it('should return a 401 status code', done => {
        request.get(`${url}/api/signin`)
        .auth(exampleUser.username, badUser.password)
        .end((err, res) => {
          expect(err.status).to.equal(401);
          expect(res.status).to.equal(401);
          expect(res.text).to.equal('Wrong password!');
          expect(res.res.statusMessage).to.equal('Unauthorized');
          expect(res.text).to.be.a('string');
          done();
        });
      });
    });
  });
  describe('PUT /api/account', () => {
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
      .catch( err => done(err));
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
    describe('with a valid body, updated email and same password', () => {
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
