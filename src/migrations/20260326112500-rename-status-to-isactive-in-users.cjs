'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Rename column status to isActive
        await queryInterface.renameColumn('Users', 'status', 'isActive');

        // 2. Temporarily change column type to STRING to allow update
        await queryInterface.changeColumn('Users', 'isActive', {
            type: Sequelize.STRING,
            allowNull: true
        });

        // 3. Update existing data to booleans (as strings '1' and '0')
        await queryInterface.sequelize.query("UPDATE Users SET isActive = '1' WHERE isActive = 'active'");
        await queryInterface.sequelize.query("UPDATE Users SET isActive = '0' WHERE isActive = 'inactive'");

        // 4. Change column type from STRING to BOOLEAN
        await queryInterface.changeColumn('Users', 'isActive', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        });
    },

    async down(queryInterface, Sequelize) {
        // 1. Change back to STRING first
        await queryInterface.changeColumn('Users', 'isActive', {
            type: Sequelize.STRING,
            allowNull: true
        });

        // 2. Update data back to ENUM strings
        await queryInterface.sequelize.query("UPDATE Users SET isActive = 'active' WHERE isActive = '1' OR isActive = 'true'");
        await queryInterface.sequelize.query("UPDATE Users SET isActive = 'inactive' WHERE isActive = '0' OR isActive = 'false'");

        // 3. Change back to ENUM
        await queryInterface.changeColumn('Users', 'isActive', {
            type: Sequelize.ENUM('active', 'inactive'),
            allowNull: false,
            defaultValue: 'active'
        });

        // 4. Rename back to status
        await queryInterface.renameColumn('Users', 'isActive', 'status');
    }
};
