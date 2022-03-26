module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: portNumber(env("NODE_ENV")),
  admin: {
    auth: {
      secret: env("ADMIN_JWT_SECRET", "0441af3dad953748a97088752b630471"),
    },
  },
  settings: {
    cors: {
      enabled: true,
      origin: ["*"],
    },
  },
});

const portNumber = (env) => {
  switch (env) {
    case "development":
      return 1337;
    case "staging":
      return 1338;
    case "production":
      return 1339;
    default:
      return 1337;
  }
};
