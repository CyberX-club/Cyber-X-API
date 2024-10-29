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
resSpreadsheetId = os.environ['RESOURCES_SPREADSHEET_ID']

magazine_base_url = Endpoints.magazine_base_url(spreadsheetId, key, "A1:E")
resources_base_url = Endpoints.resources_base_url(resSpreadsheetId, key, "A:F")

# base entity simply defines the class so that we have a definite structure 
class BaseEntity:
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

    def to_dict(self):
        return {attr: getattr(self, attr) for attr in self.__dict__}

# these classes extend BaseEntity and define the structure of the data

class Article(BaseEntity):
    def __init__(self, title='', url='', author='', images='', content=''):
        super().__init__(title=title, url=url, author=author, images=images.split(",") if images else [], content=content)

    def __repr__(self):
        return (f"Article(title={self.title}, url={self.url}, "
                f"author={self.author}, images={self.images}, content={self.content})")

class Resource(BaseEntity):
    def __init__(self, label, description="", img="", author="", postedAt="", urls=[]):
        super().__init__(label=label, description=description, img=img, author=author, postedAt=postedAt,
                         urls=list(filter(None, urls.split(","))) if urls else [])

    def __repr__(self):
        return (f"Resource(label={self.label}, description={self.description}, "
                f"img={self.img}, author={self.author}, postedAt={self.postedAt}, urls={self.urls})")
header_mappings = {
    'articles': {
        "Title": "title",
        "Url": "url",
        "Author": "author",
        "Images (Seperated by comma)": "images",
        "Content": "content"
    },
    'resources': {
        "Label": "label",
        "Description": "description",
        "Img": "img",
        "Author": "author",
        "PostedAt": "postedAt",
        "Urls": "urls"
    }
}

def parse_spreadsheet_data(data, entity_type):
    if not data or len(data) < 2:
        return []

    header_mapping = header_mappings[entity_type]
    headers = data[0]
    entities = []

    for row in data[1:]:
        entity_data = {header_mapping[header]: (value if value else '') for header, value in zip(headers, row)}
        if entity_type == 'articles':
            entities.append(Article(**entity_data))
        elif entity_type == 'resources':
            entities.append(Resource(**entity_data))

    return entities





@app.route("/")
def hello_world():
    return render_template("index.html", title="Hello")

@app.route(Endpoints.get_magazaine_data)
def magazine_data(slug):
    error = None

    try:
        data = Endpoint(magazine_base_url, "GET").fetch()[0]['values']
        articles = parse_spreadsheet_data(data, 'articles')

        for article in articles:
            if article.url == slug:
                return jsonify(article.to_dict())
            
    except Exception as e:
        error = str(e)

    return jsonify({
        "error": error if error else "Article not found",
    })

@app.route(Endpoints.get_random_image)
def random_image():
    import random
    import os

    images = os.listdir(IMAGES_DIR)
    random_image = random.choice(images)
    
    return send_file(f"{IMAGES_DIR}/{random_image}")


@app.route(Endpoints.get_resources)
def resources():
    error = None

    try:
        data = Endpoint(resources_base_url, "GET").fetch()[0]['values']
        resources = parse_spreadsheet_data(data, 'resources')
        return jsonify({
            "resources": [resource.to_dict() for resource in resources]
        })
    except Exception as e:
        error = str(e)

    return jsonify({
        "error": error if error else "No resources found",
        "resources": []
    })



if __name__=="__main__":
    app.run()