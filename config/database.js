module.exports = ({ env }) => {
  if (env("NODE_ENV") === "development") {
    return {
      defaultConnection: "default",
      connections: {
        default: {
          connector: "mongoose",
          settings: {
            host: env("DATABASE_HOST", "127.0.0.1"),
            srv: env.bool("DATABASE_SRV", false),
            port: env.int("DATABASE_PORT", 27017),
            database: env("DATABASE_NAME", "tms_local"),
            username: env("DATABASE_USERNAME", null),
            password: env("DATABASE_PASSWORD", null),
          },
          options: {
            authenticationDatabase: env("AUTHENTICATION_DATABASE", "admin"),
            ssl: env.bool("DATABASE_SSL", false),
          },
        },
      },
    };
  } else
    return {
      defaultConnection: "default",
      connections: {
        default: {
          connector: "mongoose",
          settings: {
            host: env("DATABASE_HOST"),
            srv: env.bool("DATABASE_SRV", true),
            port: env.int("DATABASE_PORT", 27017),
            database: env("DATABASE_NAME"),
            username: env("DATABASE_USERNAME"),
            password: env("DATABASE_PASSWORD"),
          },
          options: {
            authenticationDatabase: env("AUTHENTICATION_DATABASE", null),
            ssl: env.bool("DATABASE_SSL", true),
          },
        },
      },
    };
};
