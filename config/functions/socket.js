"use strict";

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

module.exports = (strapi, io) => {
  function initSocket(strapi, io) {
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
  }
  initSocket(strapi, io);
};
