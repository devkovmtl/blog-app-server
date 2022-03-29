const { Router } = require('express');
const router = Router();
const authController = require('../controllers/authController');
// const passport = require('../config/passport');

router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/checkJWT', authController.checkJWTToken);

module.exports = router;
