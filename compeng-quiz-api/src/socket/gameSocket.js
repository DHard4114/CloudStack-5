const sessionRepo = require('../repositories/session.repository');

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

    socket.on('disconnect', () => console.log(`[WS] Disconnected: ${socket.id}`));
  });
}

async function pushLeaderboard(io, joinCode) {
  try {
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
