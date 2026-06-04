module.exports = {
  apps: [{
    name: "compeng-quiz-api",
    script: "./compeng-quiz-api/src/app.js",
    cwd: "./compeng-quiz-api",
    instances: "max",
    exec_mode: "cluster",    
    watch: false,
    autorestart: true,
    env: {
      NODE_ENV: "production",
      PORT: 3000
    }
  }]
};
