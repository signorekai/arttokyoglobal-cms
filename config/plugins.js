module.exports = ({ env }) => ({
  ckeditor: true,
  "duplicate-button": true,
  "random-sort": true,
  "vercel-deploy": true,
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
  email: {
    config: {
      provider: "sendmail",
      settings: {
        defaultFrom: "no-reply@arttokyoglobal.io",
        defaultReplyTo: "admin@arttokyoglobal.io",
      },
      providerOptions: {
        dkim: {
          privateKey: "./dkim-private.pem",
          keySelector:
            "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDM6qa8xIgNs3JCwEE2qOp/5gx7 za/ZjdmEfPx8zGyQ6sZi37JSwuoDrOgdjok5xukOV6vBNrQdrtVHl2JS4XRAIU1l IVM6ECsJjmz9n0CZU7fvkYoAM7UpirnJ8h45cB9AfUYq3qmsBtpRS3VhaEqHUSCg NMYWvRDR8DWobvMxOwIDAQAB",
        },
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
});
