const express = require("express");
const session = require("express-session");
const cors = require("cors");
const Keycloak = require("keycloak-connect");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();

// Session setup
const memoryStore = new session.MemoryStore();

app.use(
  session({
    secret: "your-secret",
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);

app.use(
  cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Keycloak setup
const keycloak = new Keycloak({ store: memoryStore });

app.use(keycloak.middleware());

// Body parser setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Login route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const grant = await keycloak.grantManager.obtainDirectly(
      username,
      password
    );

    const token = grant.access_token.token;

    req.session.token = token;

    // Decode the token
    const decodedToken = jwt.decode(token);
    const userId = decodedToken.sub;

    const name = decodedToken.preferred_username;
    const email = decodedToken.email;
    const roles = decodedToken.realm_access?.roles;

    const userInfo = {
      username: name,
      email: email,
      roles: roles,
    };

    res.json({
      message: "Login successful",
      token: token,
      user: userInfo,
    });
  } catch (error) {
    console.error("Login failed:", error);
    res.status(401).json({ message: "Login failed" });
  }
});

// Logout route
app.post("/logout", keycloak.protect(), async (req, res) => {
  try {
    const token = req.session.token;

    if (!token) {
      return res.status(400).json({ message: "No token found" });
    }

    // Invalidate the session
    req.session.destroy((err) => {
      if (err) {
        console.error("Failed to destroy session:", err);
        return res.status(500).json({ message: "Logout failed" });
      }

      res.json({ message: "Logout successful" });
    });
  } catch (error) {
    console.error("Logout failed:", error);
    res.status(500).json({ message: "Logout failed" });
  }
});
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
