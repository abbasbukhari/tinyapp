const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

// Database for URLs and Users
const urlDatabase = {};
const users = {};

// Middleware
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Helper function to generate random string (for URL and User IDs)
function generateRandomString() {
  return Math.random().toString(36).slice(2, 8);
}

// Helper function to find user by email
function getUserByEmail(email) {
  for (let userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
  return null;
}

// Helper function to filter URLs by user ID
function urlsForUser(id) {
  const userUrls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
}

// Routes

// Landing page - redirects if logged in
app.get("/", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  res.redirect("/login");
});

// Register page (only accessible when logged out)
app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  res.render("register");
});

// Register POST route
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  // Check if email or password is empty
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty.");
  }

  // Check if email already exists
  if (getUserByEmail(email)) {
    return res.status(400).send("Email already registered.");
  }

  const userID = generateRandomString();
  users[userID] = { id: userID, email, password };

  // Set user_id cookie and redirect
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

// Login page (only accessible when logged out)
app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  res.render("login");
});

// Login POST route
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);

  if (!user || user.password !== password) {
    return res.status(403).send("Invalid credentials.");
  }

  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

// Logout route
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

// URLs page (only accessible when logged in)
app.get("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.status(401).send("Please log in to view your URLs.");
  }

  const userUrls = urlsForUser(req.cookies["user_id"]);
  res.render("urls_index", { urls: userUrls, user: users[req.cookies["user_id"]] });
});

// New URL page (only accessible when logged in)
app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  }
  res.render("urls_new");
});

// POST route to create a new URL
app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.status(401).send("Please log in to create a URL.");
  }

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies["user_id"] };

  res.redirect(`/urls/${shortURL}`);
});

// Show individual URL page (only accessible by the URL owner)
app.get("/urls/:id", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.status(401).send("Please log in to view this URL.");
  }

  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(404).send("URL not found.");
  }

  if (url.userID !== req.cookies["user_id"]) {
    return res.status(403).send("You do not own this URL.");
  }

  res.render("urls_show", { url, user: users[req.cookies["user_id"]] });
});

// Delete URL (only accessible by the URL owner)
app.post("/urls/:id/delete", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.status(401).send("Please log in to delete this URL.");
  }

  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(404).send("URL not found.");
  }

  if (url.userID !== req.cookies["user_id"]) {
    return res.status(403).send("You do not own this URL.");
  }

  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// Edit URL (only accessible by the URL owner)
app.post("/urls/:id", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.status(401).send("Please log in to edit this URL.");
  }

  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(404).send("URL not found.");
  }

  if (url.userID !== req.cookies["user_id"]) {
    return res.status(403).send("You do not own this URL.");
  }

  url.longURL = req.body.longURL;
  res.redirect(`/urls/${req.params.id}`);
});

// Redirect to long URL
app.get("/u/:id", (req, res) => {
  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(404).send("URL not found.");
  }
  res.redirect(url.longURL);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
