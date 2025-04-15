module.exports = {
  apps: [
    {
      name: "tool-api", // Nama proses di PM2
      script: "apps.js", // Entry point, ganti sesuai file utama kamu
      instances: 1, // Atur jadi 'max' jika mau multi-core
      autorestart: true,
      watch: true, // Ganti true kalau mau auto-reload saat file berubah (hanya untuk dev)
      max_memory_restart: "200M", // Restart otomatis kalau lewat 200 MB

      env_development: {
        NODE_ENV: "development",
        PORT: 3000,
        ROOT_PATH: __dirname,
      },

      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        ROOT_PATH: __dirname,
      },

      error_file: "./logs/error.log", // File error log
      out_file: "./logs/output.log", // File log biasa (console.log)
      log_date_format: "YYYY-MM-DD HH:mm Z",
    },
  ],
};
