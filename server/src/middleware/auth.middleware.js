const jwt = require('jsonwebtoken');

/**
 * Verifies the JWT on the Authorization header and attaches the decoded
 * payload to req.user. Does not check role — pair with authorize() for that.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or malformed Authorization header' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
 * Restricts a route to one or more roles. Use after requireAuth.
 * Example: router.get('/tasks', requireAuth, authorize('worker'), ...)
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions for this action' });
    }
    next();
  };
}

module.exports = { requireAuth, authorize };
