# FLASK
from flask import Flask
from key import *
app = Flask(__name__)

from yelpapi import YelpAPI
yelp_api = YelpAPI(client_id, client_secret)


my_lat = "37.868654"
my_long = "-122.259153"

@app.route("/")
def hello():
    search_results = yelp_api.search_query(latitude=my_lat, longitude=my_long, term="restaurants")
    return str(search_results)

if __name__ == "__main__":
    app.run()