var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

function ItemDAO(database) {
    "use strict";

    this.db = database;

		this.getCategories = function(callback) {
    		"use strict";

		    this.db.collection('item').aggregate(
		        [
		            { $group: {
		                    _id: "$category",
		                    num: { $sum: 1 }
		                } },
		                { $sort: { _id: 1 } }
		        ])
						.toArray(function(err, result) {
			        assert.equal(err, null);
			        callback([{
	            _id: "All",
	            num: 23 // count
			        }, ...result]); // destructuring
				   });

		};

    this.getItems = function(category, page, itemsPerPage, callback) {
        "use strict";

				var query = category == "All" ? {} : {"category":category}
				var toSkip = page * itemsPerPage;
				var cursor = this.db.collection('item').find(query).skip(toSkip)
					.limit(itemsPerPage).toArray(function(err, pageItems) { callback(pageItems);
					});
    }


    this.getNumItems = function(category, callback) {
        "use strict";

        var numItems = this.db.collection('item').find()
					.count().then(function(count){callback(count);
					});
    }

    this.searchItems = function(query, page, itemsPerPage, callback) {
        "use strict";

				var cursor = this.db.collection('item').find({ $text: { $search: query } })
					.skip(page * itemsPerPage).limit(itemsPerPage).toArray(function(err, items) { callback(items);
					});
	    }


    this.getNumSearchItems = function(query, callback) {
        "use strict";

				var numItems = this.db.collection('item').find({ $text: { $search: query } })
					.count().then(function(count){callback(count);
					});
    }


    this.getItem = function(itemId, callback) {
        "use strict";

				var cursor = this.db.collection('item').find({ '_id': itemId })
					.toArray(function(err,item){ callback(item[0]);
					});
    }


    this.getRelatedItems = function(callback) {
        "use strict";

        this.db.collection("item").find({})
            .limit(4)
            .toArray(function(err, relatedItems) {
                assert.equal(null, err);
                callback(relatedItems);
            });
    };


    this.addReview = function(itemId, comment, name, stars, callback) {
        "use strict";

				var review = this.db.collection('item')
												.updateOne({ '_id': itemId },
												{ "$push": {"reviews": reviewDoc} },
												null,
												callback(review))
				/*
         * TODO-lab4
         *
         * LAB #4: Add a review to an item document. Reviews are stored as an
         * array value for the key "reviews". Each review has the fields: "name", "comment",
         * "stars", and "date".
         *
         */

        var reviewDoc = {
            name: name,
            comment: comment,
            stars: stars,
            date: Date.now()
        }

        var dummyItem = this.createDummyItem();
        dummyItem.reviews = [reviewDoc];
        callback(dummyItem);
    }


    this.createDummyItem = function() {
        "use strict";

        var item = {
            _id: 1,
            title: "Gray Hooded Sweatshirt",
            description: "The top hooded sweatshirt we offer",
            slogan: "Made of 100% cotton",
            stars: 0,
            category: "Apparel",
            img_url: "/img/products/hoodie.jpg",
            price: 29.99,
            reviews: []
        };

        return item;
    }
}


module.exports.ItemDAO = ItemDAO;
