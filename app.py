from flask import Flask, render_template, jsonify, send_file
from flask_cors import CORS  # Import CORS
from Endpoint import Endpoint
from dotenv import load_dotenv
import os

from Endpoints import Endpoints
load_dotenv()

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)
IMAGES_DIR = f'{os.path.dirname(__file__)}/{"images"}'

key = os.environ['SHEETS_API_KEY']
spreadsheetId = os.environ['SPREADSHEET_ID']
magazine_base_url = Endpoints.magazine_base_url(spreadsheetId, key, "A1:E")

class Article:
    def __init__(self, title='', url='', author='', images='', content=''):
        self.title = title
        self.url = url
        self.author = author
        self.images = images.split(",") if images else []
        self.content = content

    def __repr__(self):
        return (f"Article(title={self.title}, url={self.url}, "
                f"author={self.author}, images={self.images}, content={self.content})")

    def to_dict(self):
        return {
            "title": self.title,
            "url": self.url,
            "author": self.author,
            "images": self.images,
            "content": self.content
        }

def parse_magazine_spreadsheet_data(data):
    if not data or len(data) < 2:
        return []

    header_mapping = {
        "Title": "title",
        "Url": "url",
        "Author": "author",
        "Images (Seperated by comma)": "images",
        "Content": "content"
    }

    headers = data[0]
    articles = []

    for row in data[1:]:
        article_data = {header_mapping[header]: (value if value else '') for header, value in zip(headers, row)}
        articles.append(Article(**article_data))

    return articles

@app.route("/")
def hello_world():
    return render_template("index.html", title="Hello")

@app.route(Endpoints.get_magazaine_data)
def magazine_data(slug):

    error = None

    try:
        data = Endpoint(magazine_base_url, "GET").fetch()[0]['values']

        articles = parse_magazine_spreadsheet_data(data)

        for article in articles:
            if article.url == slug:
                return jsonify(article.to_dict())
            
    except Exception as e:
        error = str(e)

    return jsonify({
        "error" : error if error else "Article not found",
    })

@app.route(Endpoints.get_random_image)
def random_image():
    import random
    import os

    images = os.listdir(IMAGES_DIR)
    random_image = random.choice(images)
    
    return send_file(f"{IMAGES_DIR}/{random_image}")


if __name__=="__main__":
    app.run()