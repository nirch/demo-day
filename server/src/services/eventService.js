const { Event, User } = require('../models');

const EVENT_ATTRIBUTES = ['id', 'name', 'description', 'date', 'status', 'time_limit', 'created_by', 'created_at', 'updated_at'];

const findAll = async () => {
  return Event.findAll({
    attributes: EVENT_ATTRIBUTES,
    order: [['date', 'DESC']],
  });
};

const create = async ({ name, description, date, time_limit, created_by }) => {
  return Event.create({
    name,
    description: description || null,
    date,
    status: 'draft',
    time_limit: time_limit || 7,
    created_by,
  });
};

const findById = async (id) => {
  return Event.findByPk(id, {
    attributes: EVENT_ATTRIBUTES,
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'email'],
      },
    ],
  });
};

module.exports = { findAll, create, findById };
