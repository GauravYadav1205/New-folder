const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const keycloak = require("./keycloak-config"); // Keycloak config
const authRoutes = require("./routes/authRoutes"); // Authentication routes

const app = express();

// CORS setup
app.use(
  cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Keycloak middleware
app.use(keycloak.middleware());

// Routes
app.use("/auth", authRoutes);

// Server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Disable SSL certificate verification (use with caution)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
