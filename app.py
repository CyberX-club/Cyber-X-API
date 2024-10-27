from flask import Flask, render_template, jsonify
from flask_cors import CORS  # Import CORS
from Endpoint import Endpoint

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

key = "AIzaSyDK9jBZMyLX-vfdgxdRLSBPv7RSjeYenlE"
spreadsheetId = "1VVb8mmL2bkjjgyGztW3_EbAYYRgv9-OUyRVb8rGDlFs"
base_url = f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/A1:E100?key={key}"

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

def parse_data(data):
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

# @app.route("/")
# def hello_world():
#     return render_template("index.html", title="Hello")

@app.route('/magazine/<slug>')
def hi(slug):
    data = Endpoint(base_url, "GET").fetch()[0]['values']
    articles = parse_data(data)

    for article in articles:
        if article.url == slug:
            return jsonify(article.to_dict())
    
    return "nine"
