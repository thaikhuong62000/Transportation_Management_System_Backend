module.exports = ({ env }) => {
  if (env("NODE_ENV") === "production") {
    return {
      upload: {
        ...s3UploadConfig(env),
        ...defaultUploadConfig,
      },
    };
  } else
    return {
      upload: {
        ...defaultUploadConfig,
      },
    };
};

const s3UploadConfig = (env) => ({
  provider: "aws-s3",
  providerOptions: {
    accessKeyId: env("AWS_ACCESS_KEY_ID"),
    secretAccessKey: env("AWS_ACCESS_SECRET"),
    region: env("AWS_REGION"),
    params: {
      Bucket: env("AWS_BUCKET_NAME"),
    },
  },
});

const defaultUploadConfig = {
  breakpoints: {
    small: 256,
  },
};
