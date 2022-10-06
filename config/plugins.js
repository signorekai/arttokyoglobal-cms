module.exports = ({ env }) => ({
  ckeditor: true,
  "duplicate-button": true,
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
});
