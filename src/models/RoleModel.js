module.exports = (sequelize, Sequelize) => {
    const Role = sequelize.define('roles', {
        nama_role: {
            type: Sequelize.STRING
        }
    });

    return Role;
}