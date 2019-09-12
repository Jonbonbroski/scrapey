var express = require("express");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");
var db = require("./models");
var PORT = process.env.PORT || 3000;
var app = express();


app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.set("index", __dirname + "/views");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scrapey";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

var results = [];


app.get("/", function (req, res) {
	db.Article.find({ saved: false }, function (err, result) {
		if (err) throw err;
		res.render("index", { result });
	});

});


app.get("/scrape", function (req, res) {
	axios.get("https://www.politico.com/").then((response) => {
		var $ = cheerio.load(response.data);
    
        
		$(".media-item__summary").each((i, element) => {

			var result = {};


			result.title = $(element).find("h1 a").text();
			result.link = $(element).find("h1 a").attr("href");
			result.tease = $(element).find(".tease").text();
            
            
			// Create a new Article using the `result` object built from scraping
			db.Article.create(result)
				.then(function (dbArticle) {
					// View the added result in the console
					console.log(dbArticle);
				})
				.catch(function (err) {
					// If an error occurred, log it
					console.log(err);
				});
		});

		// Send a message to the client
		res.send("Scrape Complete");
	});
});

// Route for getting all Articles from the db
app.get("/", function(req, res) {
	db.Article.find({})
		.sort("-_id")
		.then(function(dbArticle) {
			var hbsObject = {
				Article: dbArticle,
				title: "Current Politio Articles to begin Conversations"
			};
			res.render("index", hbsObject);
		})
		.catch(function(err) {
			res.json(err);
		});
});

// Route for getting all saved Articles from the db
app.get("/saved", function(req, res) {
	db.Article.find({saved: true})
		.then(function(dbArticle) {
			var hbsObject = {
				Article: dbArticle
			};
			res.render("saved", hbsObject);
		})
		.catch(function(err) {
			res.json(err);
		});
});

// // Route for grabbing a specific Article by id, populate it with it's comment
// app.get("/articles/:id", function(req, res) {
// 	db.Article.findOne({ _id: req.params.id })
// 		.populate("comment")
// 		.then(function(dbArticle) {
// 			res.json(dbArticle);
// 		})
// 		.catch(function(err) {
// 			res.json(err);
// 		});
// });

// //Route for marking an Article as saved
// app.post("/articles/saved/:id", function(req, res) {
// 	db.Article.findOneAndUpdate({"_id": req.params.id}, {saved: true})
// 		.then(function(data) {
// 			res.send(data);
// 		})
// 		.catch(function(err) {
// 			res.json(err);
// 		});
// });


// //Route for removing an article from the saved field
// app.post("/articles/saved/:id/remove", function(req, res) {
// 	db.Article.findOneAndUpdate({"_id": req.params.id}, {saved: false})
// 		.then(function(data) {
// 			res.send(data);
// 		})
// 		.catch(function(err) {
// 			res.json(err);
// 		});
// });

// // Route for saving/updating an Article's associated Comment
// app.post("/articles/:id", function(req, res) {
// 	db.Comment.create(req.body)
// 		.then(function(dbComment) {
// 			return db.Article.findOneAndUpdate({ _id: req.params.id }, 
// 				{ $push: { comment: dbComment._id} }, 
// 				{ new: true });
// 		})
// 		.catch(function(err) {
// 			res.json(err);
// 		});
// });

// app.delete("/comments/:id", function(req, res) {
// 	console.log(req.params.id);
// 	// eslint-disable-next-line quotes
// 	db.Comment.deleteOne( {_id: 'ObjectId('+req.params.id+')'} );
// });

app.listen(PORT, function () {
	console.log("Server listening on: http://localhost:" + PORT);
});