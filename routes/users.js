const { Router } = require('express');
const router = Router();
const passport = require('passport');
const { isAdmin } = require('../middlewares/isAdmin');
/* GET users listing. */
router.get(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  (req, res, next) => {
    res.json({ user: 'user' });
  }
);

module.exports = router;
