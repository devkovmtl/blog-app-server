const jwt = require('jsonwebtoken');

exports.isAdmin = (req, res, next) => {
  const bearerHeaders = req.headers['authorization'];
  // if user exist token was sent with the request
  if (bearerHeaders) {
    const bearer = bearerHeaders.split(' ');
    const bearerToken = bearer[1];
    const decodedToken = jwt.decode(bearerToken);
    if (decodedToken.isAdmin) {
      next();
    } else {
      res.status(401).json({ error: 'You are not authorized' });
    }
  } else {
    res.status(403).json({ error: 'You must login first.' });
  }
};
