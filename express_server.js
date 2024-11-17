const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

// In-memory users database
const users = {};

// Dummy URL database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Helper function to generate a random string
function generateRandomString() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let shortURL = "";
  for (let i = 0; i < 6; i++) {
    shortURL += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return shortURL;
}

// Helper function to find a user by email
function getUserByEmail(email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null; // Return null if no user with the email is found
}

// GET /urls route to display URLs page
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];

  const templateVars = {
    user: user,
    urls: urlDatabase,
  };

  res.render("urls_index", templateVars);
});

// GET /register route to render the registration page
app.get("/register", (req, res) => {
  res.render("register");
});

// POST /register route to handle user registration
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return res.status(400).send("Email and password are required.");
  }

  // Check if the email is already in use
  if (getUserByEmail(email)) {
    return res.status(400).send("Email already exists.");
  }

  // Generate random user ID
  const userId = generateRandomString();

  // Create user object and add it to the users database
  users[userId] = {
    id: userId,
    email: email,
    password: password, // Note: In a real app, we would hash the password
  };

  // Set user_id cookie
  res.cookie("user_id", userId);

  // Redirect to /urls page after registration
  res.redirect("/urls");
});

// POST /login route to handle login (for testing purposes)
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  for (const userId in users) {
    const user = users[userId];
    if (user.email === email && user.password === password) {
      // Set user_id cookie
      res.cookie("user_id", userId);
      return res.redirect("/urls");
    }
  }
  res.status(403).send("Invalid email or password");
});

// POST /logout route to clear cookies and log out
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// Default route for unknown URLs
app.get("*", (req, res) => {
  res.send("404 Not Found");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
