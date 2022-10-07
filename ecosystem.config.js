module.exports = {
  apps: [
    {
      name: "atg-cms",
      script: "npm",
      args: "start",
      env_production: {
        NODE_ENV: "production",
        AWS_REGION: "ap-south-1",
      },
    },
  ],
  // Deployment Configuration
  deploy: {
    production: {
      key: "/users/alfredlau/.ssh/atg",
      user: "alfred",
      host: ["159.223.85.8"],
      ref: "origin/main",
      repo: "git@gitlab.com:alfredlau/art-tokyo-global-cms.git",
      path: "/var/www/cms",
      "post-setup": "npm run build:prod",
      "post-deploy":
        "npm install && npm run build:prod && pm2 startOrRestart ecosystem.config.js --env production",
    },
    "production:silent": {
      key: "/users/alfredlau/.ssh/atg",
      user: "alfred",
      host: ["159.223.85.8"],
      ref: "origin/main",
      repo: "git@gitlab.com:alfredlau/art-tokyo-global-cms.git",
      path: "/var/www/cms",
      "post-setup": "npm run build:prod",
      "post-deploy": "pm2 startOrRestart ecosystem.config.js --env production",
    },
  },
};
