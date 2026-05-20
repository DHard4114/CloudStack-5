const express = require('express');
const router  = express.Router();

router.use('/auth',     require('./auth.routes'));
router.use('/quizzes',  require('./quiz.routes'));
router.use('/sessions', require('./session.routes'));

module.exports = router;
