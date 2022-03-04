"use strict";
const { initializeApp } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
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
  // Init socket
  var io = require("socket.io")(strapi.server);
  require("./socket")(strapi, io);

  // Init firebase
  const fbm = initializeApp();
  // Init Message App
  const messaging = getMessaging();
  const message = {
    data: {
      text: "bo` ra'",
      score: "850",
      time: "2:45",
    },
    token:
      "e5CvA8ZsRTOjtT9QM29FyB:APA91bG5qrDugyjCr6eayyttd-QG4AYhgiACf5fZEYEHPYP_Ot5I1keSF_bWI8NkFzoqzhokwqQy0N9atVfr8r50GlOeCroDVJk4XJdPGC_Z4RpXozBcL-bEJMQSZoOcv2RDBd81E5Sz",
  };

  // Send a message to the device corresponding to the provided
  // registration token.
  messaging
    .send(message)
    .then((response) => {
      // Response is a message ID string.
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      console.log("Error sending message:", error);
    });
};
