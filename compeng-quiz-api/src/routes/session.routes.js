const express    = require('express');
const controller = require('../controllers/session.controller');
const { requireAuth, requireTeacher } = require('../middleware/auth.middleware');
const { joinLimiter } = require('../middleware/rateLimiter.middleware');
const router = express.Router();

router.post  ('/',                    requireAuth, requireTeacher, controller.openSession);
router.post  ('/join',                joinLimiter,                controller.joinSession);
router.post  ('/:sessionUuid/start',  requireAuth, requireTeacher, controller.startSession);
router.post  ('/:sessionUuid/answer', requireAuth,                controller.submitAnswer);
router.patch ('/:sessionUuid/finish', requireAuth, requireTeacher, controller.finishSession);

module.exports = router;
