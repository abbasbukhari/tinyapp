const express = require("express");
const app = express();
const PORT = 8080; // Default port 8080

// Set EJS as the view engine
app.set("view engine", "ejs");

// Database of URLs (can be expanded later)
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// Root route - renders the index.ejs template with dynamic data
app.get("/", (req, res) => {
  const templateVars = { title: "Welcome to TinyApp" };
  res.render("index", templateVars);
});

// JSON route for URL database (this can be expanded later)
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Listen on the specified port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


   