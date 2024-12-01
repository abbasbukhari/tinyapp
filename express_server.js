const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { getUserByEmail } = require("./helpers"); // Import helper functions

const app = express();
const PORT = 8080;

// Middleware to parse POST requests and set up session cookies
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  keys: ["your-secret-key"], // Replace with your secret key
}));

// Set EJS as the view engine
app.set("view engine", "ejs");

// In-memory databases
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
};

// Routes

// Home route: Redirect based on login status
app.get("/", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  return res.redirect("/login");
});

// Route to display URLs specific to a logged-in user
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(401).send("Please log in to view URLs.");
  }

  // Filter URLs for the logged-in user
  const userURLs = {};
  for (const id in urlDatabase) {
    if (urlDatabase[id].userID === userID) {
      userURLs[id] = urlDatabase[id];
    }
  }

  const templateVars = { urls: userURLs, user: users[userID] };
  res.render("urls_index", templateVars);
});

// Route to display the form for creating a new URL
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  const templateVars = { user: users[req.session.user_id] }; // Pass only the user data
  res.render("urls_new", templateVars);
});

// Route to handle URL creation
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).send("Unauthorized: Please log in to create a URL.");
  }

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  res.redirect(`/urls/${shortURL}`);
});

// Route to handle editing and rendering the edit page
app.get("/urls/:id", (req, res) => {
  const { id } = req.params;
  const userID = req.session.user_id;
  const urlData = urlDatabase[id];

  if (!urlData) {
    return res.status(404).send("URL not found.");
  }
  if (urlData.userID !== userID) {
    return res.status(403).send("Access denied: This URL does not belong to you.");
  }

  const templateVars = {
    user: users[userID],
    url: { shortURL: id, longURL: urlData.longURL }, // Pass the URL object to the template
  };
  res.render("urls_edit", templateVars); // Render the editing page
});

// Route to handle URL updates
app.post("/urls/:id", (req, res) => {
  const { id } = req.params;
  const userID = req.session.user_id;

  if (!urlDatabase[id]) {
    return res.status(404).send("URL not found.");
  }
  if (urlDatabase[id].userID !== userID) {
    return res.status(403).send("Access denied: You cannot edit this URL.");
  }

  // Update long URL
  urlDatabase[id].longURL = req.body.longURL;
  res.redirect("/urls");
});

// Route to handle URL deletion
app.post("/urls/:id/delete", (req, res) => {
  const { id } = req.params;
  const userID = req.session.user_id;

  if (!urlDatabase[id]) {
    return res.status(404).send("URL not found.");
  }
  if (urlDatabase[id].userID !== userID) {
    return res.status(403).send("Access denied: You cannot delete this URL.");
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});

// Route to redirect to the long URL from a short URL
app.get("/u/:id", (req, res) => {
  const { id } = req.params;
  const urlData = urlDatabase[id];

  if (!urlData) {
    return res.status(404).send("Short URL not found.");
  }

  res.redirect(urlData.longURL);
});

// Login route
app.get("/login", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  const templateVars = { user: null };
  res.render("login", templateVars);
});

// Handle login form submission
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Invalid credentials.");
  }

  req.session.user_id = user.id;
  res.redirect("/urls");
});

// Handle logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// Registration page
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  const templateVars = { user: null };
  res.render("register", templateVars);
});

// Handle new user registration
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty.");
  }
  if (getUserByEmail(email, users)) {
    return res.status(400).send("Email already registered.");
  }

  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[id] = { id, email, password: hashedPassword };
  req.session.user_id = id;
  res.redirect("/urls");
});

// Helper function to generate random string
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

// Server listener
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
