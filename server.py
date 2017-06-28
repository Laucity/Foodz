# FLASK
from flask import Flask, jsonify, request
from key import *
app = Flask(__name__)

# Helper modules
import json
import threading
import numpy as np
import scipy.io as sio

# YELP FUSION API 
from yelpapi import YelpAPI
yelp_api = YelpAPI(FUSION_ID, FUSION_KEY)

# LOAD IN RESTAURANT CATEGORIES
R_CATEGORIES = json.loads(open("r_categories.json", "r").read())
CATEGORY_ALIAS_ENCODING = {}
for i, R_CAT in enumerate(R_CATEGORIES):
	CATEGORY_ALIAS_ENCODING[R_CAT['alias']] = i

# LOAD IN PREFERENCES MAT
PREF_FILENAME = "preferences.mat"
def load_preference_mat():
	# Returns none if no file exists
	try:
		PREF_FILE = sio.loadmat(PREF_FILENAME)
	except:
		PREF_FILE = None
		print("No mat file exists")

	return PREF_FILE

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

# FEAURE VECTOR CREATION
def encode_business(business):

	# Turn a business into a feature vector
	
	f_vector = np.zeros(len(R_CATEGORIES))

	categories = business['categories']

	indices = []
	for c in categories:
		try:
			i = CATEGORY_ALIAS_ENCODING[c['alias']]
			indices.append(i)
		except:
			print("CATEGORY NOT FOUND")
			print(c['alias'])

	# one hot encoding
	f_vector[indices] = 1

	return f_vector

# Query format
# test_query = {
# 				'like': ['thai', 'japanese', 'chinese'],
# 				'dislike': ['italian', 'french'],
# 				'price': '2,3',
# 				'open_now': 1,
# 				'lat': "37.868654",
# 				'long': "-122.259153",
# 				'sort_by': 'rating'
# 			 }

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

	# OLD
	# for business in businesses:
	# 	b_id = business['id']
	# 	extra_info = yelp_api.business_query(id=b_id)
	# 	business['extra_details'] = extra_info

	# WITH LFA
	# PUll 50 businesses from the query
	# check if they have been encoded
	# encode those that have not been
	# rescore all the restaurants
	# sort them

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

@app.route("/pref/<p>", methods=['GET'])
def pref(p):
	# Handle preference sent to server

	business = json.loads(request.args.get('business'))
	score = json.loads(request.args.get('score'))

	# Add to the preference matrix
	encoded_business = encode_business(business)

	pref_file = load_preference_mat()

	if pref_file is not None:
		businesses = pref_file["businesses"]
		scores = pref_file["scores"]

		businesses = np.append(businesses, [encoded_business], axis=0)
		scores = np.append(scores, score)

	else:
		businesses = np.array([encoded_business])
		scores = np.array([score])

	# save mat with new preference
	assert(len(businesses) == len(scores))
	mat_dict = {
				"businesses": businesses, 
				"scores": scores
				}
	sio.savemat(PREF_FILENAME, mat_dict)

	# Acknowledge preference to client
	response = jsonify(["preference noted"])
	response.headers.add('Access-Control-Allow-Origin', '*')
	return response

if __name__ == "__main__":
    app.run()