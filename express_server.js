const express = require("express");
const app = express();
const PORT = 8080;

// Middleware to parse POST request body data
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Temporary in-memory URL database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// Route to display all URLs
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"] || null  // Display username from cookie
  };
  res.render("urls_index", templateVars);
});

// Route to handle user login
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);  // Set cookie with username
  res.redirect("/urls");  // Redirect to /urls page
});

// Generate a random string for short URL
function generateRandomString() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let shortURL = "";
  for (let i = 0; i < 6; i++) {
    shortURL += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return shortURL;
}

// Route to display specific URL by ID
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { id: id, longURL: longURL };
  res.render("urls_show", templateVars);
});

// POST route to handle URL creation
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

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

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
