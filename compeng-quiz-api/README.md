QuizLive CompEng API

Overview
This folder contains the Node.js + Express backend for the QuizLive CompEng project. The API runs inside a CloudStack isolated network on an Ubuntu Server VM and is exposed to the Windows host through the CloudStack Virtual Router NAT.

Runtime Overview
- Service: CompEng Quiz API
- Default port: 3000
- Health check: GET /health
- WebSocket: Socket.IO on the same port

Requirements
- Node.js 20.x
- MySQL 8.0
- npm 10.x

Environment Variables
Create a .env file from .env.example and fill the values below:

PORT=3000
NODE_ENV=production

DB_HOST=localhost
DB_PORT=3306
DB_USER=quiz_api_worker
DB_PASSWORD=your_password
DB_NAME=enterprise_quizapp
DB_CONNECTION_LIMIT=20

JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12

Install and Run
1) Install dependencies

npm install

2) Initialize database schema

mysql -u quiz_api_worker -p enterprise_quizapp < src/database/quizapp.sql

3) Start the API

node src/app.js

Recommended for production (VM):

pm2 start src/app.js --name quizlive-api
pm2 save
pm2 startup systemd

Health Check

curl http://localhost:3000/health

API Base URL

All API routes are prefixed with /api

Response Format

Success:
{ "success": true, "message": "OK", "data": {} }

Error:
{ "success": false, "error": "message" }

Authentication
- Login returns a JWT.
- Include the JWT in Authorization header: Bearer <token>
- Only users with role teacher or super_admin can access quiz management endpoints.

Rate Limiting
- POST /api/auth/login: 10 requests per 15 minutes per IP
- POST /api/sessions/join: 10 requests per 1 minute per IP

REST Endpoints

Auth
- POST /api/auth/register
  Body: { "username", "email", "password", "role" }
  role: teacher or student

- POST /api/auth/login
  Body: { "email", "password" }
  Response data: { token, user: { uuid, username, role } }

Quizzes (teacher only)
- GET /api/quizzes
  Response data: list of quizzes owned by the logged-in teacher

- GET /api/quizzes/:quizUuid
  Response data: quiz detail with questions and options

- POST /api/quizzes
  Body:
  { "title", "description", "is_public", "shuffle_questions", "shuffle_options", "passing_score" }

- POST /api/quizzes/:quizUuid/questions
  Body:
  {
    "question_text",
    "media_url",
    "media_type",
    "time_limit_seconds",
    "base_points",
    "difficulty",
    "options": [
      { "option_text", "is_correct", "explanation" }
    ]
  }
  Notes:
  - options length must be 2 to 4
  - exactly one option must be is_correct = true

- DELETE /api/quizzes/:quizUuid

Sessions
- POST /api/sessions
  Body: { "quiz_uuid", "session_name" }
  Response data: { uuid, join_code }

- POST /api/sessions/join
  Body: { "join_code", "player_nickname" }
  Response data: { session_uuid, player_nickname }

- POST /api/sessions/:sessionUuid/start
  Body: {}

- POST /api/sessions/:sessionUuid/answer
  Body:
  { "question_uuid", "selected_option_id", "time_taken_ms", "player_nickname" }
  Notes:
  - If player is logged in, player_nickname is optional and is taken from session participant data.

- PATCH /api/sessions/:sessionUuid/finish
  Body: {}

Socket.IO (Real-time)

Client emits:
- join-session { join_code, player_nickname }
- request-leaderboard { join_code }
- host:join { session_uuid }
- host:start_session { session_uuid }
- host:next_question { session_uuid }
- host:end_session { session_uuid }

Server emits:
- session:question
- session:end
- session:error
- host:session_info
- host:question_started
- host:session_error
- host:session_ended
- host:answer_submitted
- leaderboard-update

Error Cases (Common)
- 400 Bad Request: missing required fields or invalid payload
- 401 Unauthorized: missing token
- 403 Forbidden: invalid or expired token, or role not allowed
- 404 Not Found: resource not found
- 409 Conflict: nickname already used or answer already submitted

Folder Structure

compeng-quiz-api/
├── src/
│   ├── app.js
│   ├── config/
│   │   ├── database.js
│   │   └── env.js
│   ├── controllers/
│   ├── database/
│   │   └── quizapp.sql
│   ├── middleware/
│   ├── repositories/
│   ├── routes/
│   ├── socket/
│   └── utils/
├── .env.example
├── package.json
└── package-lock.json

Notes
- The API assumes MySQL is reachable inside the VM and uses the schema in src/database/quizapp.sql.
- For CloudStack deployments, use the Virtual Router public IP for client access.
