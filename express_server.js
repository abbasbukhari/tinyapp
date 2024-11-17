const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

// Middleware setup
app.use(cookieParser());  // Use cookie-parser middleware to handle cookies
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// In-memory URL database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// Route to show all URLs
app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],  // Retrieve the username from the cookie
    urls: urlDatabase,  // Pass the URLs to the template
  };
  res.render("urls_index", templateVars);  // Render the view and pass templateVars
});

// Route for handling login (set cookie with username)
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);  // Set the username cookie
  res.redirect("/urls");  // Redirect to /urls after login
});

// Route for creating a new URL
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// Route to display a specific URL
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { id: id, longURL: longURL };
  res.render("urls_show", templateVars);
});

// Generate random short URL
function generateRandomString() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let shortURL = "";
  for (let i = 0; i < 6; i++) {
    shortURL += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return shortURL;
}

// POST route for deleting URLs
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// Route for redirecting short URLs to long URLs
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("Short URL not found.");
  }
});

// Route to handle logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");  // Clear the username cookie
  res.redirect("/urls");  // Redirect to /urls page
});

// Start server
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
