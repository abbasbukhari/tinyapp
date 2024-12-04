const bcrypt = require("bcryptjs"); // Import bcrypt

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
};

module.exports = users;
