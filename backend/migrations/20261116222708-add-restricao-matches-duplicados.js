"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX unique_match_entre_animais
      ON matches (
        (LEAST(animal_1_id, animal_2_id)),
        (GREATEST(animal_1_id, animal_2_id))
      )
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP INDEX unique_match_entre_animais ON matches
    `);
  },
};
