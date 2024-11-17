// Require necessary libraries
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Users database (simulated)
const users = {};

// Helper function to get user by email
const getUserByEmail = (email) => {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};

// Helper function to generate random string for user id
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

// GET /login - Render login page
app.get("/login", (req, res) => {
  res.render("login"); // Render login.ejs template
});

// POST /login - Handle user login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Search for a user by email
  const user = getUserByEmail(email);

  if (user && user.password === password) {
    // Set the user_id cookie if the user is found and the password matches
    res.cookie("user_id", user.id);
    return res.redirect("/urls");
  }

  // If no user is found or the password doesn't match
  res.status(403).send("Invalid email or password");
});

// POST /logout - Clear cookie and logout user
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// GET /register - Render registration page
app.get("/register", (req, res) => {
  res.render("register"); // Render register.ejs template
});

// POST /register - Handle user registration
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  // Check if email or password is empty
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty");
  }

  // Check if email already exists
  if (getUserByEmail(email)) {
    return res.status(400).send("Email already in use");
  }

  const userId = generateRandomString(); // Generate a new random user ID
  users[userId] = { id: userId, email: email, password: password };

  res.cookie("user_id", userId); // Set cookie with user_id
  res.redirect("/urls"); // Redirect to /urls page
});

// GET /urls - Show user URLs page
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];

  if (!user) {
    return res.redirect("/login"); // Redirect to login if no user is found
  }

  const templateVars = { user: user }; // Pass the entire user object to template
  res.render("urls_index", templateVars);
});

// Start the server
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
