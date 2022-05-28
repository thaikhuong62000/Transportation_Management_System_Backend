const request = require("supertest");

const { jwtToken, createdUser } = require("../../__mocks__/AuthMocks");

const mockAvatar = [
  { avatar: "public/uploads/map.png", expected: "update" },
  { avatar: "public/uploads/MDT-48.txt", expected: "not update" },
  { avatar: "", expected: "not update" },
];
const adminMockAvatar = [
  { avatar: "public/uploads/map.png", expected: "update" },
  { avatar: "", expected: "not update" },
];
it.each(mockAvatar)("should $expected avatar", async ({ avatar, expected }) => {
  const user = (
    await request(strapi.server)
      .put("/users/avatar")
      .set("accept", "*")
      .set("Authorization", "Bearer " + jwtToken("customer"))
      .attach("avatar", avatar)
      .expect("Content-Type", /json/)
      .expect(expected === "update" ? 200 : 400)
  )._body;
  if (expected === "update") {
    const avatarName = avatar.split("/").pop();
    expect(user.avatar?.name).toBe(avatarName);
    createdUser("customer", user);
  }
});

it.each(adminMockAvatar)(
  "admin $expected avatar",
  async ({ avatar, expected }) => {
    const user = (
      await request(strapi.server)
        .put("/users/avatar")
        .set("accept", "*")
        .set("Authorization", "Bearer " + jwtToken("admin"))
        .attach("avatar", avatar)
        .field("userId", createdUser("customer").id)
        .field("avaId", createdUser("customer").avatar.id)
        .expect("Content-Type", /json/)
        .expect(expected === "update" ? 200 : 400)
    ).body;
    if (expected === "update") {
      const avatarName = avatar.split("/").pop();
      expect(user.avatar?.name).toBe(avatarName);
      // Delete Test Avatar
      await strapi
        .query("file", "upload")
        .model.deleteOne({ _id: user.avatar?.id });
    }
  }
);
