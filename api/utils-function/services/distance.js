"use strict";

module.exports = {
  async calcDistance(from_address, to_address) {
    try {
      await strapi.services.address.prepareAddress(from_address);
      await strapi.services.address.prepareAddress(to_address);
    } catch (error) {
      throw "Invalid addresses";
    }
    return strapi.services.distance.coordToDistance(from_address, to_address);
  },

  coordToDistance(from_address, to_address) {
    return coordToDistance(
      from_address.latitude,
      from_address.longitude,
      to_address.latitude,
      to_address.longitude
    );
  },
};

function coordToDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1); // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
