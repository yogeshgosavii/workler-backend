
const mongoose = require('mongoose');

const descriptionSchema = new mongoose.Schema({
  description:String
 });

const Description = mongoose.model('Description', descriptionSchema);

module.exports = Description;
