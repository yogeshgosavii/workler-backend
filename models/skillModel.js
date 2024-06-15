// skillModel.js

const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: String,
  level: String,
});

const Skill = mongoose.model('Skill', skillSchema);

module.exports = Skill;
