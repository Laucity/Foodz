# FLASK
from flask import Flask
from key import *
app = Flask(__name__)

import json

from yelpapi import YelpAPI
yelp_api = YelpAPI(FUSION_ID, FUSION_KEY)


my_lat = "37.868654"
my_long = "-122.259153"

test_query = {
				'like': ['thai', 'japanese', 'chinese'],
				'dislike': ['italian', 'french'],
				'price': '2,3',
				'open_now': 1,
				'lat': my_lat,
				'long': my_long,
				'sort_by': 'rating'
			 }

@app.route("/")
def hello():
    search_results = yelp_api.search_query(latitude=my_lat, longitude=my_long, term="restaurants", limit=1)
    return str(search_results)

@app.route("/<q>")
def query(q):
	q = test_query #json.loads(q)
	results = yelp_api.search_query(latitude=q['lat'], 
									longitude=q['long'],
									price=q['price'],
									open_now=q['open_now'],
									term='restaurants',
									categories=",".join(q['like']),
									limit=1
									)
	return str(results)


if __name__ == "__main__":
    app.run()