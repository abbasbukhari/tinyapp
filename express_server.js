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

// Route to display a single URL based on the ID in the URL
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { id: id, longURL: longURL };
  res.render("urls_show", templateVars);
});

// POST route to handle the URL update
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const updatedLongURL = req.body.longURL; // Get the updated long URL from the form
  urlDatabase[id] = updatedLongURL; // Update the long URL in the database
  res.redirect("/urls"); // Redirect back to the URL list
});

// POST route to handle URL creation
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// POST route to handle URL deletion
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// Route for redirecting short URLs to their long versions
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("Short URL not found.");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
