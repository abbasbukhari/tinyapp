const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// In-memory databases
const urlDatabase = {};
const users = {};

// Function to generate random string
const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

// Check if user exists by email
const getUserByEmail = (email) => {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};

// Redirect to /urls if logged in
app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  res.render("login");
});

app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  res.render("register");
});

// Registration POST
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Email and Password cannot be empty");
  }
  if (getUserByEmail(email)) {
    return res.status(400).send("Email already exists");
  }

  const userId = generateRandomString();
  users[userId] = { id: userId, email, password };
  res.cookie("user_id", userId);
  res.redirect("/urls");
});

// Login POST
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);

  if (!user || user.password !== password) {
    return res.status(403).send("Invalid email or password");
  }

  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

// Logout POST
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

// Protect creating new URLs
app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  }
  res.render("urls_new");
});

// Create URL POST
app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.status(400).send("You must be logged in to create a new URL.");
  }

  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
});

// View short URL
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  
  if (!longURL) {
    return res.status(404).send("Error: This short URL does not exist.");
  }

  res.render("urls_show", { shortURL, longURL });
});

// Redirect to long URL
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];

  if (!longURL) {
    return res.status(404).send("Error: This short URL does not exist.");
  }

  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
