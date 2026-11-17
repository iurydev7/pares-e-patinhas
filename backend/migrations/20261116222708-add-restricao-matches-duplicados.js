"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex(
      "matches",
      ["animal_1_id", "animal_2_id"],
      {
        unique: true,
        name: "unique_match_entre_animais",
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "matches",
      "unique_match_entre_animais"
    );
  },
};
