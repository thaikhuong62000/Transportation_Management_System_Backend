"use strict";
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
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
  // Init firebase
  const firebaseApp = initializeApp();

  strapi.firebase = {};
  strapi.firebase.auth = getAuth();
  strapi.firebase.sendCloudMessage = sendCloudMessage;

  // Init socket
  var io = require("socket.io")(strapi.server);
  require("./socket")(strapi, io);
};

function sendCloudMessage(token, message) {
  const options = {
    contentAvailable: true,
    priority: "high",
    timeToLive: 7 * 60 * 60 * 24,
  };
  return getMessaging().sendToDevice(token, { data: message }, options);
}
