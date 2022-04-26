const { setupStrapi } = require("./strapi");

jest.setTimeout(30000);

beforeAll(async () => {
  await setupStrapi();
});
