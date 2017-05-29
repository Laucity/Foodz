import json
from flask_sqlalchemy import SQLAlchemy

# DOESNT WORK

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/test.db'
db = SQLAlchemy(app)

empty_pref = {"price": "",
              "like": "",
              "dislike": "",
              "history": ["", ""],
              "max_distance": 10
              }

class User(db.Model):

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True)
    preferences = db.Column(db.Text, unique=False)

    def __init__(self):
        self.name = "SwagMaster"
        self.preferences = json.dumps(empty_pref)