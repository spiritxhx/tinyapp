
const getUserByEmail = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) return { valid: true, user };
  }
  return { valid: false };
};

module.exports = {getUserByEmail};