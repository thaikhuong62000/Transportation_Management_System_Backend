"use strict";

module.exports = {
  async getNearestStorage(address) {
    let storages = await strapi.services.storage.find({}, []);

    if (storages.length === 0) return null;

    if (!address.latitude || !address.longitude) return storages[0];

    storages = storages.map((item) => {
      return {
        ...item,
        distance: strapi.services.distance.calcDistance(address, item.address),
      };
    });

    storages.sort((a, b) => a.distance - b.distance);

    return storages;
  },
};
