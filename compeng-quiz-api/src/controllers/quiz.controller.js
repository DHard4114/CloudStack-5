const { v4: uuidv4 } = require('uuid');
const pool     = require('../config/database');
const R        = require('../utils/response.util');
const quizRepo = require('../repositories/quiz.repository');

async function getMyQuizzes(req, res, next) {
  try {
    return R.ok(res, await quizRepo.findAllByCreator(req.user.id));
  } catch (err) { next(err); }
}

async function getQuizDetail(req, res, next) {
  try {
    const quiz = await quizRepo.findByUuid(req.params.quizUuid);
    if (!quiz) return R.notFound(res, 'Kuis tidak ditemukan.');
    const questions = await quizRepo.findQuestionsByQuizId(quiz.id);
    return R.ok(res, { ...quiz, questions });
  } catch (err) { next(err); }
}

async function createQuiz(req, res, next) {
  try {
    const { title, description = null, is_public = false,
            shuffle_questions = false, shuffle_options = true,
            passing_score = 60 } = req.body;
    if (!title) return R.badRequest(res, 'Judul kuis wajib diisi.');
    const uuid = uuidv4();
    await quizRepo.create({ uuid, creatorId: req.user.id, title, description,
      isPublic: is_public, shuffleQuestions: shuffle_questions,
      shuffleOptions: shuffle_options, passingScore: passing_score });
    return R.created(res, { uuid, title }, 'Kuis berhasil dibuat.');
  } catch (err) { next(err); }
}

async function addQuestion(req, res, next) {
  const { question_text, media_url = null, media_type = 'none',
          time_limit_seconds = 20, base_points = 1000,
          difficulty = 'medium', options = [] } = req.body;

  if (!question_text)     return R.badRequest(res, 'Teks soal wajib diisi.');
  if (options.length < 2) return R.badRequest(res, 'Minimal 2 pilihan jawaban.');
  if (options.length > 4) return R.badRequest(res, 'Maksimal 4 pilihan jawaban.');
  if (options.filter(o => o.is_correct).length !== 1)
    return R.badRequest(res, 'Harus ada tepat 1 jawaban benar.');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const quiz = await quizRepo.findByUuidAndCreator(req.params.quizUuid, req.user.id);
    if (!quiz) { await conn.rollback(); return R.notFound(res, 'Kuis tidak ditemukan.'); }

    const orderIndex   = await quizRepo.getNextOrderIndex(quiz.id);
    const questionUuid = uuidv4();
    const questionId   = await quizRepo.createQuestion(conn, {
      uuid: questionUuid, quizId: quiz.id, questionText: question_text,
      mediaUrl: media_url, mediaType: media_type, timeLimitSeconds: time_limit_seconds,
      basePoints: base_points, difficulty, orderIndex,
    });
    for (const opt of options)
      await quizRepo.createOption(conn, { questionId,
        optionText: opt.option_text, isCorrect: opt.is_correct, explanation: opt.explanation });

    await conn.commit();
    return R.created(res, { uuid: questionUuid, order_index: orderIndex }, 'Soal berhasil ditambahkan.');
  } catch (err) { await conn.rollback(); next(err); }
  finally       { conn.release(); }
}

async function deleteQuiz(req, res, next) {
  try {
    const affected = await quizRepo.softDelete(req.params.quizUuid, req.user.id);
    if (!affected) return R.notFound(res, 'Kuis tidak ditemukan.');
    return R.ok(res, null, 'Kuis berhasil dihapus.');
  } catch (err) { next(err); }
}

module.exports = { getMyQuizzes, getQuizDetail, createQuiz, addQuestion, deleteQuiz };
