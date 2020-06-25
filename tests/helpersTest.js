const { assert } = require('chai');

const { checkForExistingEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('checkForExistingEmail', function() {
  it('should return a user with valid email', function() {
    const user = checkForExistingEmail("user@example.com", users)
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
  it('should return undefined with an invalid email', function() {
    const user = checkForExistingEmail("user3@example.com", testUsers);
    assert.equal(user, undefined);
  });
  it('should return a user with valid email', function() {
    const user = checkForExistingEmail("user2@example.com", users)
    const expectedOutput = "user2RandomID";
    assert.equal(user, expectedOutput);
  });
});