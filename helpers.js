//Helper function allows you to check for an existing email address, if it encounters it, it returns true.

const checkForExistingEmail = (email, users) => {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return false;
};

module.exports = (checkForExistingEmail);