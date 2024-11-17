const express = require("express");
const app = express();
const PORT = 8080;

// Middleware to parse POST request body data
app.use(express.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set("view engine", "ejs");

// URL Database (temporary in-memory storage)
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// Function to generate a random short URL ID (6 characters long)
function generateRandomString() {
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
app.get("/urls/new", (req, res) => {
  res.render("urls_new"); // This will render the 'urls_new.ejs' template
});

// POST route to handle the URL creation
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL; // Get the long URL from the form
  const shortURL = generateRandomString(); // Generate a short URL
  urlDatabase[shortURL] = longURL; // Add the new URL to the database
  res.redirect(`/urls/${shortURL}`); // Redirect to the newly created URL's page
});

// Route for redirecting short URLs to their long versions
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];

  if (longURL) {
    res.redirect(longURL); // Redirect to the long URL
  } else {
    res.status(404).send("Short URL not found.");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
