module.exports = {
  apps: [
    {
      name: 'sikancil-backend',
      cwd: '/opt/sikancil/backend',
      script: 'npm',
      args: 'run start:dev',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      error_file: '/opt/logs/sikancil-backend-error.log',
      out_file: '/opt/logs/sikancil-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    {
      name: 'sikancil-frontend',
      cwd: '/opt/sikancil/frontend',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      error_file: '/opt/logs/sikancil-frontend-error.log',
      out_file: '/opt/logs/sikancil-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    }
  ]
};
