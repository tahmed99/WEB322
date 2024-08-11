require('dotenv').config();
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

const Theme = sequelize.define('Theme', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: Sequelize.STRING
}, {
    timestamps: false
});

const Set = sequelize.define('Set', {
    set_num: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    theme_id: Sequelize.INTEGER,
    img_url: Sequelize.STRING
}, {
    timestamps: false
});

Set.belongsTo(Theme, { foreignKey: 'theme_id' });

function initialize() {
    return sequelize.sync().then(() => {
        console.log("Database synchronized");
    }).catch((err) => {
        console.log("Unable to sync the database:", err);
    });
}

function getAllSets() {
    return Set.findAll({
        include: [Theme]  // Include the Theme model to get theme details
    });
}

function getSetByNum(setNum) {
    return Set.findOne({
        include: [Theme],
        where: { set_num: setNum }
    }).then((set) => {
        if (set) {
            return set;
        } else {
            throw new Error("Set not found.");
        }
    });
}

function getSetsByTheme(theme) {
    return Set.findAll({
        include: [Theme],
        where: {
            '$Theme.name$': {
                [Sequelize.Op.iLike]: `%${theme}%`
            }
        }
    }).then((sets) => {
        if (sets.length > 0) {
            return sets;
        } else {
            throw new Error("No sets found for the given theme.");
        }
    });
}

function getAllThemes() {
    return Theme.findAll();
}

function addSet(setData) {
    return Set.create(setData).then(() => {
        console.log("Set added successfully");
    }).catch((err) => {
        throw new Error(err.errors[0].message);
    });
}

function editSet(set_num, setData) {
    return Set.update(setData, {
        where: { set_num: set_num }
    }).then(() => {
        console.log("Set updated successfully");
    }).catch((err) => {
        throw new Error(err.errors[0].message);
    });
}

function deleteSet(set_num) {
    return Set.destroy({
        where: { set_num: set_num }
    }).then(() => {
        console.log("Set deleted successfully");
    }).catch((err) => {
        throw new Error(err.message);
    });
}

module.exports = {
    initialize,
    getAllSets,
    getSetByNum,
    getSetsByTheme,
    addSet,
    editSet,
    deleteSet,
    getAllThemes
};
