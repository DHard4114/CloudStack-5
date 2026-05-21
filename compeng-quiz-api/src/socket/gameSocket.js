const sessionRepo = require('../repositories/session.repository');
const quizRepo = require('../repositories/quiz.repository');

// In-memory runtime state for live question flow.
// Keyed by session UUID to support host:start_session / host:next_question.
const liveStateBySession = new Map();

function normalizeOptions(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function initGameSocket(io) {
  io.on('connection', (socket) => {
    console.log(`[WS] Connected: ${socket.id}`);

    socket.on('join-session', async ({ join_code, player_nickname }) => {
      if (!join_code) return;
      socket.join(`session:${join_code}`);
      await pushLeaderboard(io, join_code);
    });

    socket.on('request-leaderboard', async ({ join_code }) => {
      if (join_code) await pushLeaderboard(io, join_code);
    });

    socket.on('host:join', async ({ session_uuid }) => {
      if (!session_uuid) return;
      const sess = await sessionRepo.findSessionWithQuizByUuid(session_uuid);
      if (!sess) return;
      socket.join(`session:${sess.join_code}`);
      socket.emit('host:session_info', {
        session_uuid: sess.session_uuid,
        quiz_title: sess.quiz_title,
        join_code: sess.join_code,
        total_questions: liveStateBySession.get(session_uuid)?.questions?.length || 0,
      });
      await pushLeaderboard(io, sess.join_code);
    });

    socket.on('host:start_session', async ({ session_uuid }) => {
      try {
        if (!session_uuid) return;
        const sess = await sessionRepo.findSessionWithQuizByUuid(session_uuid);
        if (!sess) return;

        let state = liveStateBySession.get(session_uuid);
        if (!state) {
          const rawQuestions = await quizRepo.findQuestionsByQuizId(sess.quiz_id);
          const questions = (rawQuestions || [])
            .map((q) => {
              const normalized = normalizeOptions(q.options)
                .map((opt) => ({ id: opt.id, text: opt.option_text }))
                .filter((opt) => opt.id && opt.text);
              return {
                uuid: q.uuid,
                text: q.question_text,
                time_limit: q.time_limit_seconds,
                options: normalized,
              };
            })
            .filter((q) => q.uuid && q.text && q.options.length >= 2);

          state = { questions, index: 0 };
          liveStateBySession.set(session_uuid, state);
        } else {
          state.index = 0;
        }

        const question = state.questions[state.index];
        if (!question) {
          io.to(`session:${sess.join_code}`).emit('session:error', {
            message: 'Sesi tidak dapat dimulai: kuis belum memiliki soal yang valid.',
          });
          socket.emit('host:session_error', {
            message: 'Kuis belum memiliki soal valid (minimal 1 soal, tiap soal minimal 2 opsi).',
          });
          return;
        }

        io.to(`session:${sess.join_code}`).emit('session:question', {
          question,
          index: state.index + 1,
          total: state.questions.length,
        });
        io.to(`session:${sess.join_code}`).emit('host:question_started', {
          question,
          index: state.index + 1,
          total: state.questions.length,
        });
      } catch (err) {
        console.error('[WS] host:start_session error:', err.message);
        socket.emit('host:session_error', { message: 'Gagal memulai sesi live.' });
      }
    });

    socket.on('host:next_question', async ({ session_uuid }) => {
      if (!session_uuid) return;
      const sess = await sessionRepo.findSessionWithQuizByUuid(session_uuid);
      const state = liveStateBySession.get(session_uuid);
      if (!sess || !state) return;

      state.index += 1;
      const question = state.questions[state.index];
      if (!question) {
        io.to(`session:${sess.join_code}`).emit('session:end', { reason: 'completed' });
        io.to(`session:${sess.join_code}`).emit('host:session_ended');
        liveStateBySession.delete(session_uuid);
        return;
      }

      io.to(`session:${sess.join_code}`).emit('session:question', {
        question,
        index: state.index + 1,
        total: state.questions.length,
      });
      io.to(`session:${sess.join_code}`).emit('host:question_started', {
        question,
        index: state.index + 1,
        total: state.questions.length,
      });
    });

    socket.on('host:end_session', async ({ session_uuid }) => {
      if (!session_uuid) return;
      const sess = await sessionRepo.findSessionWithQuizByUuid(session_uuid);
      if (!sess) return;
      io.to(`session:${sess.join_code}`).emit('session:end', { reason: 'manual' });
      io.to(`session:${sess.join_code}`).emit('host:session_ended');
      liveStateBySession.delete(session_uuid);
    });

    socket.on('disconnect', () => console.log(`[WS] Disconnected: ${socket.id}`));
  });
}

async function pushLeaderboard(io, joinCode) {
  try {
    if (!joinCode || typeof joinCode !== 'string') return;
    const leaderboard = await sessionRepo.getLeaderboard(joinCode, 20);
    io.to(`session:${joinCode}`).emit('leaderboard-update', {
      timestamp: new Date().toISOString(),
      leaderboard,
    });
  } catch (err) {
    console.error('[WS] pushLeaderboard error:', err.message);
  }
}

module.exports = { initGameSocket, pushLeaderboard };
