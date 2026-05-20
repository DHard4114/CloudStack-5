const express    = require('express');
const controller = require('../controllers/auth.controller');
const { loginLimiter } = require('../middleware/rateLimiter.middleware');
const router = express.Router();

router.post('/register', controller.register);
router.post('/login',    loginLimiter, controller.login);

module.exports = router;
