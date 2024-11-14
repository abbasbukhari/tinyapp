const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

// Middleware to parse POST request body data
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set("view engine", "ejs");

// URL Database
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// Function to generate a random short URL (for simplicity)
function generateShortURL() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let shortURL = "";
  for (let i = 0; i < 6; i++) {
    shortURL += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return shortURL;
}

// Root route that renders the home page
app.get("/", (req, res) => {
  const templateVars = { title: "Welcome to TinyApp" };
  res.render("index", templateVars);
});

// Route to display all URLs in a table
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Route to display a single URL based on the ID in the URL
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { id: id, longURL: longURL };
  res.render("urls_show", templateVars);
});

// Route to render the new URL form
app.get("/u/new", (req, res) => {
  res.render("new_url"); // This will render the 'new_url.ejs' template
});

// POST route to handle new URL creation
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL; // Get the long URL from the form
  const shortURL = generateShortURL(); // Generate a short URL
  urlDatabase[shortURL] = longURL; // Add the new URL to the database
  res.redirect(`/urls/${shortURL}`); // Redirect to the newly created URL's page
});

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
