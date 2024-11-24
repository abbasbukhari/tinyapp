const express = require("express");
const cookieSession = require("cookie-session"); // Require cookie-session
const app = express();
const bcrypt = require("bcryptjs");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Use cookie-session middleware for secure, encrypted cookies
app.use(cookieSession({
  name: 'session',
  secret: 'your-secret-key', // A random secret string used to encrypt cookies
  maxAge: 24 * 60 * 60 * 1000 // 24 hours (optional, can be adjusted)
}));

// Mock database for storing users and URLs
let users = {};
let urlDatabase = {};

// Helper functions to handle user registration and login logic
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

function getUserByEmail(email) {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}

// Registration Route (GET)
app.get("/register", (req, res) => {
  res.render("register");
});

// Registration Route (POST)
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty");
  }

  if (getUserByEmail(email)) {
    return res.status(400).send("Email already exists");
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = generateRandomString();
  users[userId] = { id: userId, email: email, password: hashedPassword };

  req.session.user_id = userId; // Store user_id in the encrypted cookie
  return res.redirect("/urls");
});

// Login Route (GET)
app.get("/login", (req, res) => {
  res.render("login");
});

// Login Route (POST)
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);

  if (!user) {
    return res.status(403).send("Email not found");
  }

  const passwordMatch = bcrypt.compareSync(password, user.password);

  if (!passwordMatch) {
    return res.status(403).send("Incorrect password");
  }

  req.session.user_id = user.id; // Store user_id in the encrypted cookie
  return res.redirect("/urls");
});

// Logout Route (POST)
app.post("/logout", (req, res) => {
  req.session = null; // Clear the session data
  return res.redirect("/login"); // Redirect to login page after logout
});

// URLs Route (GET)
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;

  if (!userId) {
    return res.status(400).send("You must be logged in to view your URLs");
  }

  const userUrls = Object.keys(urlDatabase).filter(
    (key) => urlDatabase[key].userID === userId
  ).map((key) => ({
    id: key,
    longURL: urlDatabase[key].longURL,
  }));

  const templateVars = { user: users[userId], urls: userUrls };
  res.render("urls_index", templateVars);
});

// Create New URL (GET)
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;

  if (!userId) {
    return res.redirect("/login"); // Redirect to login page if user is not logged in
  }

  res.render("urls_new");
});

// Create New URL (POST)
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;

  if (!userId) {
    return res.status(400).send("You must be logged in to shorten URLs");
  }

  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userId,
  };

  res.redirect("/urls");
});

// View URL (GET)
app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.id;

  if (!userId) {
    return res.status(400).send("You must be logged in to view URLs");
  }

  const url = urlDatabase[shortURL];

  if (!url || url.userID !== userId) {
    return res.status(403).send("You are not authorized to view this URL");
  }

  const templateVars = { user: users[userId], shortURL, longURL: url.longURL };
  res.render("urls_show", templateVars);
});

// Delete URL (POST)
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.id;

  if (!userId) {
    return res.status(400).send("You must be logged in to delete URLs");
  }

  const url = urlDatabase[shortURL];

  if (!url || url.userID !== userId) {
    return res.status(403).send("You cannot delete this URL");
  }

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// The server is running
app.listen(8080, () => {
  console.log("TinyApp listening on port 8080!");
});
