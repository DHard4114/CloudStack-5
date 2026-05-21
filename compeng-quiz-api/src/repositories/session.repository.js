const pool = require('../config/database');

async function findActiveByJoinCode(joinCode) {
  const [rows] = await pool.execute(
    `SELECT id, uuid, max_participants FROM quiz_sessions
     WHERE join_code = ? AND status = 'waiting'`, [joinCode]);
  return rows[0] || null;
}

async function findByUuidAndHost(uuid, hostId) {
  const [rows] = await pool.execute(
    `SELECT id, uuid, status, join_code FROM quiz_sessions
     WHERE uuid = ? AND host_id = ?`, [uuid, hostId]);
  return rows[0] || null;
}

async function findJoinCodeByUuid(uuid) {
  const [rows] = await pool.execute(
    `SELECT join_code FROM quiz_sessions WHERE uuid = ?`, [uuid]);
  return rows[0]?.join_code || null;
}

async function isPinInUse(joinCode) {
  const [rows] = await pool.execute(
    `SELECT id FROM quiz_sessions
     WHERE join_code = ? AND status IN ('waiting','in_progress')`, [joinCode]);
  return rows.length > 0;
}

async function createSession({ uuid, quizId, hostId, joinCode, sessionName }) {
  await pool.execute(
    `INSERT INTO quiz_sessions (uuid, quiz_id, host_id, join_code, session_name)
     VALUES (?, ?, ?, ?, ?)`,
    [uuid, quizId, hostId, joinCode, sessionName || null]);
}

async function startSession(id) {
  await pool.execute(
    `UPDATE quiz_sessions SET status = 'in_progress', started_at = NOW()
     WHERE id = ?`, [id]);
}

async function countParticipants(sessionId) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM session_participants WHERE session_id = ?`,
    [sessionId]);
  return rows[0].total;
}

async function findParticipant(sessionUuid, userId) {
  const [rows] = await pool.execute(
    `SELECT sp.id AS participant_id
     FROM session_participants sp
     JOIN quiz_sessions qs ON qs.id = sp.session_id
     WHERE qs.uuid = ? AND sp.user_id = ? AND qs.status = 'in_progress'`,
    [sessionUuid, userId]);
  return rows[0] || null;
}

async function createParticipant({ sessionId, userId, playerNickname }) {
  await pool.execute(
    `INSERT INTO session_participants (session_id, user_id, player_nickname)
     VALUES (?, ?, ?)`, [sessionId, userId || null, playerNickname]);
}

async function getLeaderboard(joinCode, limit = 20) {
  if (!joinCode) return [];

  // MySQL prepared statements can be sensitive with LIMIT placeholders on some setups.
  // Coerce limit to a safe integer and inline it to avoid stmt arg mismatches.
  const safeLimit = Number.isFinite(Number(limit))
    ? Math.max(1, Math.min(200, Number(limit)))
    : 20;

  const [rows] = await pool.execute(
    `SELECT sp.player_nickname, sp.total_score, sp.correct_count, sp.avatar_url,
            RANK() OVER (ORDER BY sp.total_score DESC, sp.joined_at ASC) AS current_rank
     FROM session_participants sp
     JOIN quiz_sessions qs ON qs.id = sp.session_id
     WHERE qs.join_code = ? AND qs.status IN ('waiting','in_progress')
     ORDER BY current_rank
     LIMIT ${safeLimit}`,
    [joinCode]
  );
  return rows;
}

async function createAnswer({ participantId, questionId, selectedOptionId,
                               isCorrect, timeTakenMs, pointsAwarded }) {
  await pool.execute(
    `INSERT INTO participant_answers
       (participant_id, question_id, selected_option_id,
        is_correct, time_taken_ms, points_awarded)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [participantId, questionId, selectedOptionId,
     isCorrect, timeTakenMs, pointsAwarded]);
}

async function finalizeSession(sessionId) {
  await pool.execute(`CALL sp_finalize_session(?)`, [sessionId]);
}

async function findSessionWithQuizByUuid(sessionUuid) {
  const [rows] = await pool.execute(
    `SELECT qs.id, qs.uuid AS session_uuid, qs.join_code, qs.status,
            q.id AS quiz_id, q.uuid AS quiz_uuid, q.title AS quiz_title
     FROM quiz_sessions qs
     JOIN quizzes q ON q.id = qs.quiz_id
     WHERE qs.uuid = ?`,
    [sessionUuid]
  );
  return rows[0] || null;
}

module.exports = {
  findActiveByJoinCode, findByUuidAndHost, findJoinCodeByUuid, isPinInUse,
  createSession, startSession, countParticipants, findParticipant,
  createParticipant, getLeaderboard, createAnswer, finalizeSession,
  findSessionWithQuizByUuid,
};
