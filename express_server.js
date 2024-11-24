// express_server.js

const express = require("express");
const cookieSession = require("cookie-session");
const { getUserByEmail } = require('./helpers');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

// Middleware to parse POST body
app.use(express.urlencoded({ extended: true }));

// Use cookie-session for handling encrypted cookies
app.use(cookieSession({
  name: 'session',
  keys: ['your-secret-key'],  // Set your secret key here
}));

// Users database
const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

// Helper function to get user by email
const getUserByEmail = (email, database) => {
  for (let userId in database) {
    if (database[userId].email === email) {
      return database[userId];
    }
  }
  return null;
};

// GET Routes

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(400).send("Please log in to view URLs.");
  }
  const user = users[req.session.user_id];
  res.json(user);  // Return logged in user's URLs
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  res.render("urls_new");
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  res.render("login");
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  res.render("register");
});

// POST Routes

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty.");
  }
  if (getUserByEmail(email, users)) {
    return res.status(400).send("Email already registered.");
  }

  const userId = "user" + Math.random().toString(36).substring(2, 8); // Random user ID
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[userId] = {
    id: userId,
    email,
    password: hashedPassword
  };
  req.session.user_id = userId;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);
  
  if (!user) {
    return res.status(403).send("User not found.");
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Incorrect password.");
  }

  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null; // Clear the session
  res.redirect("/login");
});

// Delete User URL (Example) - Protected by User Session
app.post("/urls/:id/delete", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(403).send("Please log in to delete URLs.");
  }
  const urlId = req.params.id;
  const url = urlDatabase[urlId];

  if (!url) {
    return res.status(404).send("URL does not exist.");
  }

  if (url.userID !== user.id) {
    return res.status(403).send("You can only delete your own URLs.");
  }

  delete urlDatabase[urlId];
  res.redirect("/urls");
});

// Start server
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}`);
});
