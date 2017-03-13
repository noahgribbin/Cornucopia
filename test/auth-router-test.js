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
          expect(res.body.username).to.equal('test username');
          // expect(res.body.password)
          done();
        });
      });
    });
  });
});

