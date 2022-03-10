"use strict";
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

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

  strapi.firebase = getAuth();

  // Init socket
  var io = require("socket.io")(strapi.server);
  require("./socket")(strapi, io);
};
