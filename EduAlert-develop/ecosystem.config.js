module.exports = {
  apps: [
    {
      name: 'edualert-api',
      script: './server/server.js',
      instances: 'max', // Utiliza todos los núcleos de CPU disponibles en modo cluster
      exec_mode: 'cluster',
      autorestart: true,
      watch: false, // Desactivado en producción para evitar reinicios cíclicos accidentales
      max_memory_restart: '1G', // Reinicia si el uso de memoria excede 1GB
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001, // Puerto por defecto para producción
      },
      // Configuración de almacenamiento de logs
      error_file: './logs/pm2-err.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      combine_logs: true,
      merge_logs: true,
    },
  ],
};
