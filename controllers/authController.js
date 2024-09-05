const keycloak = require("../keycloak-config");
const jwt = require("jsonwebtoken");

// Login controller
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const grant = await keycloak.grantManager.obtainDirectly(
      username,
      password
    );
    const token = grant.access_token.token;

    // Decode the token
    const decodedToken = jwt.decode(token);
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
};

// Logout controller
exports.logout = (req, res) => {
  try {
    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout failed:", error);
    res.status(500).json({ message: "Logout failed" });
  }
};
