module.exports = {
  apps: [
    {
      name: "atg-goerli-cms",
      script: "npm",
      args: "start",
      env_production: {
        NODE_ENV: "production",
        AWS_REGION: "ap-south-1",
      },
    },
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
    staging: {
      key: "/users/alfredlau/.ssh/atg",
      user: "alfred",
      host: ["159.223.85.8"],
      ref: "origin/main",
      repo: "git@gitlab.com:alfredlau/art-tokyo-global-cms.git",
      path: "/var/www/cms-goerli",
      "post-setup": "npm install && npm run build:prod",
      "post-deploy":
        "npm install && npm run build:prod && pm2 startOrRestart ecosystem.config.js --env production",
    },
    production: {
      key: "/users/alfredlau/.ssh/atg",
      user: "alfred",
      host: ["159.223.85.8"],
      ref: "origin/main",
      repo: "git@gitlab.com:alfredlau/art-tokyo-global-cms.git",
      path: "/var/www/cms",
      "post-setup": "npm install && npm run build:prod",
      "post-deploy":
        "npm install && npm run build:prod && pm2 startOrRestart ecosystem.config.js --env production",
    },
    "production:no-build": {
      key: "/users/alfredlau/.ssh/atg",
      user: "alfred",
      host: ["159.223.85.8"],
      ref: "origin/main",
      repo: "git@gitlab.com:alfredlau/art-tokyo-global-cms.git",
      path: "/var/www/cms",
      "post-deploy":
        "npm install && pm2 startOrRestart ecosystem.config.js --env production",
    },
    "production:quick": {
      key: "/users/alfredlau/.ssh/atg",
      user: "alfred",
      host: ["159.223.85.8"],
      ref: "origin/main",
      repo: "git@gitlab.com:alfredlau/art-tokyo-global-cms.git",
      path: "/var/www/cms",
      "post-deploy": "pm2 startOrRestart ecosystem.config.js --env production",
    },
  },
};
