const jwt = require('jsonwebtoken');

/**
 * Manually parse a named cookie from the raw Cookie header.
 */
function getCookieValue(cookieHeader, name) {
  if (!cookieHeader) return null;
  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    if (key === name) {
      return decodeURIComponent(pair.slice(idx + 1).trim());
    }
  }
  return null;
}

/**
 * Verify JWT from "Authorization: Bearer <token>" header or "token" cookie.
 * Missing token -> 403 { message: "No token provided" }
 * Invalid/expired -> 401 { message: "Invalid or expired token" }
 */
function authenticate(req, res, next) {
  let token = null;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else {
    token = getCookieValue(req.headers.cookie, 'token');
  }

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
 * Role-Based Access Control (RBAC) middleware.
 * Returns 403 if the authenticated user's role is not in the allowed list.
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden. Insufficient permissions.' });
    }
    return next();
  };
}

module.exports = { authenticate, authorize };
