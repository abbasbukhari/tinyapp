
# TinyApp Project

TinyApp is a full-stack web application built with Node.js and Express that allows users to shorten long URLs, similar to services like TinyURL and Bitly.

---

## Final Product

*(Include screenshots or descriptions of the final product here if available.)*

---

## Features

- Users can register and log in.
- Each user has access to their own list of shortened URLs.
- Users can create, edit, and delete their URLs.
- Shortened URLs redirect to the original long URLs.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v12.0.0 or higher)
- [Git](https://git-scm.com/)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/tinyapp.git
   cd tinyapp
   ```

2. Install dependencies:

   ```bash
   npm install
   npm install bcryptjs
   npm install ejs
   ```

3. Start the server:

   ```bash
   node express_server.js
   ```

4. Open your browser and navigate to:

   ```
   http://localhost:8080
   ```

---

## Dependencies

- **bcryptjs**: For hashing user passwords.
- **cookie-session**: For managing user sessions.
- **ejs**: As the template engine for rendering dynamic HTML.
- **express**: For handling routing and middleware.

---

## Project Structure

- **`/views`**: Contains EJS templates for rendering pages.
- **`/helpers.js`**: Helper functions used throughout the app.
- **`/express_server.js`**: The main server file handling routes and logic.

---

## Future Enhancements

- Add analytics for URL visits.
- Implement user profile settings.

---

## Author

- **Abbas Bukhari**
