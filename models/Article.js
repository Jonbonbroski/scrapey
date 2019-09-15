var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({

	title: {
		type: String,
        required: true
        
	},
	link: {
		type: String,
		required: true
    },
    
    summary : {

        type: String,
        required: true

    },


	headline: {
		type: Schema.Types.ObjectId,
		ref: "headline"
	}
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;