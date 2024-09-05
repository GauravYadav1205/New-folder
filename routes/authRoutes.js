const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const keycloak = require("../keycloak-config");

// Login route
router.post("/login", authController.login);

// Logout route (protected by Keycloak)
router.post("/logout", keycloak.protect(), authController.logout);

module.exports = router;
