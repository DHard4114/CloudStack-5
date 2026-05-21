const { v4: uuidv4 }        = require('uuid');
const R                     = require('../utils/response.util');
const { generateSecurePin } = require('../utils/pin.util');
const { calculatePoints }   = require('../utils/points.util');
const quizRepo              = require('../repositories/quiz.repository');
const sessionRepo           = require('../repositories/session.repository');

async function openSession(req, res, next) {
  try {
    const { quiz_uuid, session_name } = req.body;
    if (!quiz_uuid) return R.badRequest(res, 'quiz_uuid wajib diisi.');
    const quiz = await quizRepo.findByUuidAndCreator(quiz_uuid, req.user.id);
    if (!quiz)  return R.notFound(res, 'Kuis tidak ditemukan.');

    let joinCode;
    do { joinCode = generateSecurePin(); }
    while (await sessionRepo.isPinInUse(joinCode));

    const uuid = uuidv4();
    await sessionRepo.createSession({ uuid, quizId: quiz.id, hostId: req.user.id,
                                       joinCode, sessionName: session_name });
    return R.created(res, { uuid, join_code: joinCode }, 'Sesi berhasil dibuka.');
  } catch (err) { next(err); }
}

async function startSession(req, res, next) {
  try {
    const session = await sessionRepo.findByUuidAndHost(req.params.sessionUuid, req.user.id);
    if (!session || session.status !== 'waiting')
      return R.notFound(res, 'Sesi tidak ditemukan atau sudah dimulai.');
    await sessionRepo.startSession(session.id);
    return R.ok(res, null, 'Sesi dimulai.');
  } catch (err) { next(err); }
}

async function joinSession(req, res, next) {
  try {
    const { join_code, player_nickname } = req.body;
    if (!join_code || !player_nickname)
      return R.badRequest(res, 'join_code dan player_nickname wajib diisi.');
    if (player_nickname.length > 50)
      return R.badRequest(res, 'Nickname maksimal 50 karakter.');

    const session = await sessionRepo.findActiveByJoinCode(join_code);
    if (!session)  return R.notFound(res, 'PIN tidak valid atau sesi sudah dimulai.');

    const count = await sessionRepo.countParticipants(session.id);
    if (count >= session.max_participants) return R.conflict(res, 'Ruangan sudah penuh.');

    await sessionRepo.createParticipant({
      sessionId: session.id, userId: req.user?.id || null, playerNickname: player_nickname,
    });
    return R.created(res, { session_uuid: session.uuid, player_nickname }, 'Berhasil masuk sesi.');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return R.conflict(res, 'Nickname sudah digunakan.');
    next(err);
  }
}

async function submitAnswer(req, res, next) {
  try {
    const { question_uuid, selected_option_id, time_taken_ms, player_nickname } = req.body;
    if (!question_uuid || !selected_option_id || time_taken_ms === undefined)
      return R.badRequest(res, 'question_uuid, selected_option_id, time_taken_ms wajib diisi.');

    let participant = await sessionRepo.findParticipantByUser(req.params.sessionUuid, req.user?.id);
    if (!participant) {
      participant = await sessionRepo.findParticipantByNickname(req.params.sessionUuid, player_nickname);
    }
    if (!participant) return R.notFound(res, 'Bukan peserta sesi ini atau sesi belum dimulai.');

    const q = await quizRepo.findQuestionWithOption(question_uuid, selected_option_id);
    if (!q) return R.badRequest(res, 'Soal atau pilihan jawaban tidak valid.');

    const pointsAwarded = calculatePoints(q.is_correct, time_taken_ms, q.time_limit_seconds, q.base_points);

    await sessionRepo.createAnswer({
      participantId: participant.participant_id, questionId: q.question_id,
      selectedOptionId: selected_option_id, isCorrect: q.is_correct,
      timeTakenMs: time_taken_ms, pointsAwarded,
    });

    // Push leaderboard real-time (non-blocking)
    const joinCode = await sessionRepo.findJoinCodeByUuid(req.params.sessionUuid);
    if (joinCode) {
      const submitted = await sessionRepo.countAnswersForQuestion(req.params.sessionUuid, question_uuid);
      const total = await sessionRepo.countParticipantsBySessionUuid(req.params.sessionUuid);
      req.app.get('io').to(`session:${joinCode}`).emit('host:answer_submitted', { submitted, total });
      const { pushLeaderboard } = require('../socket/gameSocket');
      pushLeaderboard(req.app.get('io'), joinCode).catch(console.error);
    }

    return R.created(res, { is_correct: q.is_correct, points_awarded: pointsAwarded }, 'Jawaban diterima.');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return R.conflict(res, 'Kamu sudah menjawab soal ini.');
    next(err);
  }
}

async function finishSession(req, res, next) {
  try {
    const session = await sessionRepo.findByUuidAndHost(req.params.sessionUuid, req.user.id);
    if (!session || session.status !== 'in_progress')
      return R.notFound(res, 'Sesi tidak ditemukan atau belum dimulai.');
    await sessionRepo.finalizeSession(session.id);
    return R.ok(res, null, 'Sesi selesai. Peringkat final telah dihitung.');
  } catch (err) { next(err); }
}

module.exports = { openSession, startSession, joinSession, submitAnswer, finishSession };
