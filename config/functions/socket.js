"use strict";

// Test socket function
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

function getUser(room, userId) {
  return String(room.user1._id) === userId ? room.user1 : room.user2;
}

function getReceiver(room, userId) {
  return String(room.user1._id) === userId ? room.user2 : room.user1;
}

module.exports = (strapi, io) => {
  function initSocket(strapi, io) {
    io.on("connection", function (socket) {
      // On create room event
      socket.on("room", async ({ senderId, receiverId }) => {
        try {
          // Get room, create if not found
          const room = await getRoomChat(senderId, receiverId, false);

          // Send room info to both user on create room
          if (senderId && receiverId) {
            notifyUser(socket, senderId, receiverId, room);
          }
        } catch (error) {
          console.log("Something bruh at room socket", error);
        }
      });

      // On Join room event
      socket.on("join", (roomId = []) => {
        const rooms = Array.isArray(roomId) ? roomId : [roomId];
        rooms.forEach((room) => socket.join(room));
      });

      // On user chat
      socket.on("chat", async (data, room) => {
        strapi.services.message.create({
          subID: data._id,
          text: data.text,
          user: data.user._id,
          room: room,
        });
        socket.to(`${room}`).emit("chat", data, room);
        const _room = await getRoomChat("", "", room);
        const receiver = getReceiver(_room, data.user._id);
        sendCloudMessage(receiver.device_token, {
          data: JSON.stringify(data),
          room: room,
          type: "CHAT",
        });
      });
    });
  }

  async function getRoomChat(senderId, receiverId, roomId) {
    if (roomId) {
      return await strapi.services["room-chat"].findOne({ id: roomId });
    } else {
      const room = await strapi.services["room-chat"].findRoomByUsers(
        senderId,
        receiverId
      );
      if (room === null) {
        room = await strapi.services["room-chat"].create({
          user1: senderId,
          user2: receiverId,
        });
      }
      return room;
    }
  }

  function notifyUser(socket, senderId, receiverId, room) {
    const sender = getUser(room, senderId);
    const receiver = getUser(room, receiverId);

    // Emit receiver info to sender
    socket.emit("room", room.id, {
      id: receiver._id,
      name: receiver.name,
      phone: receiver.phone,
      avatar: receiver.avatar?.url,
    });

    // Send sender info to receiver
    sendCloudMessage(receiver.device_token, {
      id: String(sender._id),
      name: sender.name,
      phone: sender.phone,
      avatar: sender.avatar?.url,
      room: room.id,
      type: "ROOM",
    });
  }

  function sendCloudMessage(token, message) {
    const options = {
      contentAvailable: true,
      priority: "high",
      timeToLive: 7 * 60 * 60 * 24,
    };
    const { getMessaging } = require("firebase-admin/messaging");
    getMessaging().sendToDevice(token, { data: message }, options);
  }

  initSocket(strapi, io);
};
