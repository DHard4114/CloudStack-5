const pool = require('../config/database');

async function findAllByCreator(creatorId) {
  const [rows] = await pool.execute(
    `SELECT uuid, title, description, is_public, created_at
     FROM quizzes WHERE creator_id = ? AND deleted_at IS NULL
     ORDER BY created_at DESC`, [creatorId]);
  return rows;
}

async function findByUuid(uuid) {
  const [rows] = await pool.execute(
    `SELECT id, uuid, creator_id, title, description, is_public,
            shuffle_questions, shuffle_options, passing_score
     FROM quizzes WHERE uuid = ? AND deleted_at IS NULL`, [uuid]);
  return rows[0] || null;
}

async function findByUuidAndCreator(uuid, creatorId) {
  const [rows] = await pool.execute(
    `SELECT id, uuid FROM quizzes
     WHERE uuid = ? AND creator_id = ? AND deleted_at IS NULL`,
    [uuid, creatorId]);
  return rows[0] || null;
}

async function create({ uuid, creatorId, title, description, isPublic,
                        shuffleQuestions, shuffleOptions, passingScore }) {
  await pool.execute(
    `INSERT INTO quizzes (uuid, creator_id, title, description, is_public,
       shuffle_questions, shuffle_options, passing_score)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [uuid, creatorId, title, description, isPublic,
     shuffleQuestions, shuffleOptions, passingScore]);
}

async function softDelete(uuid, creatorId) {
  const [r] = await pool.execute(
    `UPDATE quizzes SET deleted_at = NOW()
     WHERE uuid = ? AND creator_id = ? AND deleted_at IS NULL`,
    [uuid, creatorId]);
  return r.affectedRows;
}

async function findQuestionsByQuizId(quizId) {
  const [rows] = await pool.execute(
    `SELECT q.uuid, q.question_text, q.time_limit_seconds,
            q.base_points, q.difficulty, q.order_index,
            JSON_ARRAYAGG(JSON_OBJECT(
              'id', qo.id, 'option_text', qo.option_text,
              'is_correct', qo.is_correct
            )) AS options
     FROM questions q
     JOIN question_options qo ON qo.question_id = q.id
     WHERE q.quiz_id = ? GROUP BY q.id ORDER BY q.order_index`, [quizId]);
  return rows;
}

async function getNextOrderIndex(quizId) {
  const [rows] = await pool.execute(
    `SELECT COALESCE(MAX(order_index), 0) + 1 AS next_order
     FROM questions WHERE quiz_id = ?`, [quizId]);
  return rows[0].next_order;
}

async function createQuestion(conn, { uuid, quizId, questionText, mediaUrl,
                                      mediaType, timeLimitSeconds, basePoints,
                                      difficulty, orderIndex }) {
  const [r] = await conn.execute(
    `INSERT INTO questions (uuid, quiz_id, question_text, media_url, media_type,
       time_limit_seconds, base_points, difficulty, order_index)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [uuid, quizId, questionText, mediaUrl, mediaType,
     timeLimitSeconds, basePoints, difficulty, orderIndex]);
  return r.insertId;
}

async function createOption(conn, { questionId, optionText, isCorrect, explanation }) {
  await conn.execute(
    `INSERT INTO question_options (question_id, option_text, is_correct, explanation)
     VALUES (?, ?, ?, ?)`,
    [questionId, optionText, isCorrect ? 1 : 0, explanation || null]);
}

async function findQuestionWithOption(questionUuid, selectedOptionId) {
  const [rows] = await pool.execute(
    `SELECT q.id AS question_id, q.time_limit_seconds, q.base_points, qo.is_correct
     FROM questions q
     JOIN question_options qo ON qo.id = ? AND qo.question_id = q.id
     WHERE q.uuid = ?`, [selectedOptionId, questionUuid]);
  return rows[0] || null;
}

module.exports = {
  findAllByCreator, findByUuid, findByUuidAndCreator, create, softDelete,
  findQuestionsByQuizId, getNextOrderIndex, createQuestion, createOption,
  findQuestionWithOption,
};
