var mongoose = require("mongoose");

var Schema = mongoose.Schema;


var HeadlineSchema = new Schema({
  
  title: String,
  
  body: String
  
});

var Note = mongoose.model("Headline", HeadlineSchema);

module.exports = HeadlineSchema;