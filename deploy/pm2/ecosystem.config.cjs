module.exports = {
  apps: [
    {
      name: "mrfixer-backend",
      cwd: "/var/www/mrfixer/backend",
      script: "src/server.js",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      autorestart: true,
      max_memory_restart: "300M",
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
  ],
};
