module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
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
