# FLASK
from flask import Flask, jsonify, request
from key import *
app = Flask(__name__)

import json
import threading

from yelpapi import YelpAPI
yelp_api = YelpAPI(FUSION_ID, FUSION_KEY)

test_query = {
				'like': ['thai', 'japanese', 'chinese'],
				'dislike': ['italian', 'french'],
				'price': '2,3',
				'open_now': 1,
				'lat': "37.868654",
				'long': "-122.259153",
				'sort_by': 'rating'
			 }

# Thread Class for async requests
class bThread (threading.Thread):
   def __init__(self, threadID, business):
      threading.Thread.__init__(self)
      self.threadID = threadID
      self.business = business

   def run(self):
      print ("Starting " + str(self.threadID))
      
      extra_details = yelp_api.business_query(id=self.business['id'])
      self.business['extra_details'] = extra_details

      print ("Exiting " + str(self.threadID))


@app.route("/")
def hello():
    search_results = yelp_api.search_query(latitude=my_lat, longitude=my_long, term="restaurants")
    return str(search_results)

@app.route("/<q>", methods=['GET'])
def query(q):

	query = json.loads(request.args.get('query'))
	print("QUERY")
	print(query)

	q = query #json.loads(q)
	results = yelp_api.search_query(latitude=q['lat'], 
									longitude=q['long'],
									price=",".join(q['price']),
									open_now=q['open_now'],
									term='restaurants',
									categories=",".join(q['like']),
									limit=10
									)
	# pull extra business data
	businesses = results['businesses']
	# for business in businesses:
	# 	b_id = business['id']
	# 	extra_info = yelp_api.business_query(id=b_id)

	# 	business['extra_details'] = extra_info

	threads = []
	for i, business in enumerate(businesses):
		new_t = bThread(i, business)
		new_t.start()
		threads.append(new_t)

	for t in threads:
		t.join()

	print("All threads complete")

	response = jsonify(results)
	response.headers.add('Access-Control-Allow-Origin', '*')
	return response


if __name__ == "__main__":
    app.run()