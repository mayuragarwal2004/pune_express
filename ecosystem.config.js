module.exports = {
    apps: [
      {
        name: 'pune-express',
        script: 'npm',
        args: 'start',
        instances: 'max',
        exec_mode: 'cluster',
        env: {
          NODE_ENV: 'production',
        },
      },
    ],
  };
  