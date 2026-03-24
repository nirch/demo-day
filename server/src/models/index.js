const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.url, {
  dialect: dbConfig.dialect,
  logging: dbConfig.logging,
  ...(dbConfig.dialectOptions && { dialectOptions: dbConfig.dialectOptions }),
});

const User = require('./User')(sequelize);
const Event = require('./Event')(sequelize);
const Team = require('./Team')(sequelize);

User.hasMany(Event, { foreignKey: 'created_by', as: 'events' });
Event.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

Event.hasMany(Team, { foreignKey: 'event_id', as: 'teams' });
Team.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

module.exports = { sequelize, User, Event, Team };
