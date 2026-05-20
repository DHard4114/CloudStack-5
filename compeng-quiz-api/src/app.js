const env = require('./config/env');
const express        = require('express');
const http           = require('http');
const { Server }     = require('socket.io');
const cors           = require('cors');
const helmet         = require('helmet');
const routes         = require('./routes/index');
const { initGameSocket } = require('./socket/gameSocket');
const errorHandler   = require('./middleware/errorHandler.middleware');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

initGameSocket(io);
app.set('io', io);

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/api', routes);

app.get('/health', (_, res) => res.json({
  success: true, service: 'CompEng Quiz API', version: '1.0.0',
  env: env.nodeEnv, timestamp: new Date().toISOString(),
}));

app.use((req, res) => res.status(404).json({
  success: false, error: `${req.method} ${req.path} tidak ditemukan.`,
}));

app.use(errorHandler);

server.listen(env.port, () => {
  console.log(`\n[APP] CompEng Quiz API running → http://localhost:${env.port}`);
  console.log(`[APP] Health check             → http://localhost:${env.port}/health\n`);
});
