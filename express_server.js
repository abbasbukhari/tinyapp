const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

let users = {}; // This will store the user data

// Helper function to generate random strings for IDs
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

// Helper function to get user by email
function getUserByEmail(email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}

// Route to display registration form
app.get("/register", (req, res) => {
  res.render("register");
});

// Route to handle registration form submission
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty");
  }

  if (getUserByEmail(email)) {
    return res.status(400).send("Email already exists");
  }

  // Hash the password using bcryptjs
  const hashedPassword = bcrypt.hashSync(password, 10);

  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    email: email,
    password: hashedPassword,
  };

  res.cookie("user_id", userId); // Set cookie with user ID
  return res.redirect("/urls");
});

// Route to display login form
app.get("/login", (req, res) => {
  res.render("login");
});

// Route to handle login form submission
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = getUserByEmail(email); // Find user by email

  if (!user) {
    return res.status(403).send("Email not found");
  }

  // Compare the entered password with the hashed password
  const passwordMatch = bcrypt.compareSync(password, user.password);

  if (!passwordMatch) {
    return res.status(403).send("Incorrect password");
  }

  res.cookie("user_id", user.id); // Set cookie with user ID
  return res.redirect("/urls");
});

// Route to log out and clear user session
app.post("/logout", (req, res) => {
  res.clearCookie("user_id"); // Clear the user_id cookie
  return res.redirect("/login"); // Redirect to login page
});

// Route to display user's URLs
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    return res.status(400).send("You must be logged in to see your URLs");
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

// Your existing URL database (now with user association)
let urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

// Route to create a new URL (only accessible by logged-in users)
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    return res.redirect("/login");
  }
  res.render("urls_new");
});

// Route to handle POST requests to create new URL
app.post("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
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

// Route to show individual URL details
app.get("/urls/:id", (req, res) => {
  const userId = req.cookies["user_id"];
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

// Route to delete a URL
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.cookies["user_id"];
  const shortURL = req.params.id;

  if (!userId) {
    return res.status(400).send("You must be logged in to delete URLs");
  }

  const url = urlDatabase[shortURL];

  if (!url) {
    return res.status(400).send("URL not found");
  }

  if (url.userID !== userId) {
    return res.status(403).send("You cannot delete this URL");
  }

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// The server is running
app.listen(8080, () => {
  console.log("TinyApp listening on port 8080!");
});
