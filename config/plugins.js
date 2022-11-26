const fs = require("fs");
const privateKey = fs.readFileSync("./dkim-private.pem", "utf8");

module.exports = ({ env }) => ({
  "rest-cache": {
    config: {
      provider: {
        name: "memory",
        options: {
          max: 32767,
          maxAge: 3600000,
        },
      },
      strategy: {
        contentTypes: [
          // list of Content-Types UID to cache
          "api::collection.collection",
          "api::token.token",
          "api::general-setting.general-setting",
          "api::about-us.about-us",
        ],
      },
    },
  },
  transformer: {
    enabled: true,
    config: {
      prefix: "/api/",
      responseTransforms: {
        removeAttributesKey: true,
        removeDataKey: true,
      },
    },
  },
  ckeditor: true,
  "fetch-metadata": {
    enabled: true,
    resolve: "./src/plugins/fetch-metadata",
  },
  "webthree-auth": {
    enabled: true,
    resolve: "./src/plugins/strapi-webthree-auth-main",
  },
  "duplicate-button": true,
  "random-sort": true,
  upload: {
    config: {
      provider: "aws-s3",
      providerOptions: {
        accessKeyId: env("STORAGE_KEY"),
        secretAccessKey: env("STORAGE_SECRET"),
        endpoint: env("STORAGE_ENDPOINT"), // e.g. "s3.fr-par.scw.cloud"
        params: {
          ACL: "public-read",
          CacheControl: "public, max-age=31536000, immutable",
          Bucket: env("STORAGE_BUCKET"),
        },
        baseUrl: env("STORAGE_BASE_URL"),
        prefix: env("STORAGE_PREFIX"),
      },
      breakpoints: {
        large: 1000,
        medium: 750,
        small: 500,
        thumbnail: 350,
      },
    },
  },
  email: {
    config: {
      provider: "sendgrid",
      providerOptions: {
        apiKey: env("SENDGRID_API_KEY"),
      },
      settings: {
        defaultFrom: "no-reply@arttokyoglobal.io",
        defaultReplyTo: "admin@arttokyoglobal.io",
      },
    },
  },
});
