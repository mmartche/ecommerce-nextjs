const jwt = require("jsonwebtoken");

function authGuard(req, res, next) {
  const token = req.cookies?.auth_token;

  if (!token) {
    return res.status(401).json({
      error: "Authentication required"
    });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = payload;

    next();
  } catch {
    return res.status(401).json({
      error: "Invalid or expired session"
    });
  }
}

function adminGuard(req, res, next) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "Admin access required"
    });
  }

  next();
}

module.exports = {
  authGuard,
  adminGuard
};