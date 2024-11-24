const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;
const { generateRandomString, getUserByEmail } = require("./helpers");
const users = {}; // This will store our user data

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// GET /login route (renders login page)
app.get("/login", (req, res) => {
  res.render("login");
});

// POST /login route (handles login)
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = getUserByEmail(email);

  // If user doesn't exist or password doesn't match, send 403
  if (!user || user.password !== password) {
    return res.status(403).send("Email or password incorrect");
  }

  // Set user_id cookie and redirect to /urls
  res.cookie("user_id", user.id);
  return res.redirect("/urls");
});

// GET /urls (renders URLs page)
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];

  if (!user) {
    return res.redirect("/login");
  }

  const templateVars = {
    user,
    urls: {}, // Your URL database object goes here
  };
  res.render("urls_index", templateVars);
});

// POST /logout route (handles logout)
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");  // Clear the user_id cookie
  res.redirect("/login");  // Redirect user to login page
});

// Helper function to get user by email
function getUserByEmail(email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}

app.listen(PORT, () => {
  console.log(`TinyApp is listening on port ${PORT}`);
});
