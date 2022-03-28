//import Datatypes
const { DataTypes } = require('sequelize');

//import DB
const { sequelize } = require('../utils/database');

const ActorsInMovie = sequelize.define('actorsinmovie', {
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false
  },
  actorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  movieId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = { ActorsInMovie };
