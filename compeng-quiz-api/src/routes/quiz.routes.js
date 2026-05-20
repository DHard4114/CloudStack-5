const express    = require('express');
const controller = require('../controllers/quiz.controller');
const { requireAuth, requireTeacher } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(requireAuth, requireTeacher);
router.get   ('/',                    controller.getMyQuizzes);
router.get   ('/:quizUuid',           controller.getQuizDetail);
router.post  ('/',                    controller.createQuiz);
router.post  ('/:quizUuid/questions', controller.addQuestion);
router.delete('/:quizUuid',          controller.deleteQuiz);

module.exports = router;
