"use strict";

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#bootstrap
 */

module.exports = () => {
  var io = require("socket.io")(
    strapi.server
    // , {
    //   cors: {
    //     origin: "http://localhost:3000",
    //     methods: ["GET", "POST"],
    //     allowedHeaders: ["my-custom-header"],
    //     credentials: true,
    //   },
    // }
  );
  // https://strapi.io/blog/how-to-build-a-real-time-chat-forum-using-strapi-socket-io-react-and-mongo-db
  // https://dev.to/kris/buiding-chat-app-with-react-native-and-socket-io-4p8l
  io.on("connection", function (socket) {
    socket.on("chat", ({ username, room }) => {
      console.log("user connected");
      console.log("username is ", username);
      console.log("room is...", room);
    });
  });
};
