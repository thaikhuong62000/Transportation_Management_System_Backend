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

  async function loop(socket, room, time) {
    console.log(`Emit message time ${time}`);
    socket.to(`${room}`).emit("chat", {
      user: "bot",
      text: `A`,
    });
    new Promise((resolve) => setTimeout(resolve, 4000)).then(() =>
      loop(socket, room, time + 1)
    );
  }

  // https://strapi.io/blog/how-to-build-a-real-time-chat-forum-using-strapi-socket-io-react-and-mongo-db
  // https://dev.to/kris/buiding-chat-app-with-react-native-and-socket-io-4p8l
  io.on("connection", function (socket) {
    // On Join room event
    socket.on(
      "join",
      async ({ userId = "userID", anotherId = "userID", roomId = false }) => {
        try {
          let room;
          if (roomId) {
            room = await strapi.services["room-chat"].findOne({ id: roomId });
          } else {
            room = await strapi.services["room-chat"].findRoomByUsers(
              userId,
              anotherId
            );
            if (room === null) {
              room = await strapi.services["room-chat"].create({
                user1: userId,
                user2: anotherId,
              });
            }
          }

          socket.emit("join", room.id, {
            id: room.user2._id,
            name: room.user2.name,
            phone: room.user2.phone,
            avatar: room.user2.avatar,
          });

          // Join if not in room
          if (!socket.rooms.has(room.id)) {
            socket.join(room.id);

            // Add listener
            socket.on("chat", (data, room) => {
              strapi.services.message.create({
                subID: data._id,
                text: data.text,
                user: data.user._id,
                room: room.id,
              });
              socket.to(`${room}`).emit(
                // TODO: Change io to socket later
                "chat",
                data,
                room
              );
            });
          }
        } catch (error) {
          console.log("Something bruh at join socket", error);
        }
      }
    );
  });
};
