module.exports = {
  apps: [{
    name: "compeng-quiz-api",
    script: "./compeng-quiz-api/src/app.js",
    cwd: "./compeng-quiz-api",
    instances: "max",             // Mengaktifkan mode cluster memanfaatkan seluruh core CPU KVM
    exec_mode: "cluster",         // Otomatis membagi beban trafik (internal load balancing)
    watch: false,
    autorestart: true,
    env: {
      NODE_ENV: "production",
      PORT: 3000
    }
  }]
};