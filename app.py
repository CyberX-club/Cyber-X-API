from flask import Flask, render_template, jsonify, send_file, request
from flask_cors import CORS  # Import CORS
from Endpoint import Endpoint
from dotenv import load_dotenv
import os
from db_var import db
from Database.DbObject import DbObject

from Endpoints import Endpoints
load_dotenv()

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)
IMAGES_DIR = f'{os.path.dirname(__file__)}/{"images"}'

key = os.environ['SHEETS_API_KEY']

db.set_db(os.environ.get('DB_NAME', 'CyberX'))
db.set_collection('sheets_data')



spreadsheetId = os.environ['SPREADSHEET_ID']
resSpreadsheetId = os.environ['RESOURCES_SPREADSHEET_ID']

magazine_base_url = Endpoints.magazine_base_url(spreadsheetId, key, "A1:E")
resources_base_url = Endpoints.resources_base_url(resSpreadsheetId, key, "A:F")

imgur = Endpoints.Imgur(os.environ['IMGUR_API_KEY'])


class Spreadsheet:
    def __init__(self, spreadsheetId):
        self.spreadsheetId = spreadsheetId
        self.url = Endpoints.spreadsheet_base_url(spreadsheetId, key, "A1:1")
        self.data = []

    def fetch_headers(self):
        try:
            data = Endpoint(self.url, "GET").fetch()
            data =  data[0]['values']
            return data

        except Exception as e:
            raise(e)


def create_entity_class(class_name, header_mapping):
    # Check if the class already exists
    if class_name in globals():
        print(f"Class {class_name} already exists.")
        return globals()[class_name]  # Return the existing class

    # Dynamically create a new class
    class_attributes = {}

    # Create the constructor dynamically
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

    # Add the constructor to class attributes
    class_attributes['__init__'] = __init__

    # Add a to_dict method to convert the instance to a dictionary
    def to_dict(self):
        return {attr: getattr(self, attr) for attr in self.__dict__}

    class_attributes['to_dict'] = to_dict

    # Create the class dynamically using the header_mapping
    for field, python_field in header_mapping.items():
        class_attributes[python_field] = None

    # Dynamically create the class
    entity_class = type(class_name, (BaseEntity,), class_attributes)

    # Register the class globally so it can be used later
    globals()[class_name] = entity_class

    print(f"Class {class_name} created.")
    return entity_class

        


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

def parse_spreadsheet_data_0(data, entity_type):
    if not data or len(data) < 2:
        print("No data found")
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


def parse_spreadsheet_data(data, entity_name):

    header_mapping = header_mappings[entity_name]
    # Create the class dynamically (if it doesn't exist)
    entity_class = create_entity_class(entity_name, header_mapping)

    if not data or len(data) < 2:
        print("No data found")
        return []

    headers = data[0]
    entities = []

    for row in data[1:]:
        entity_data = {header_mapping.get(header, header): (value if value else '') for header, value in zip(headers, row)}

        # Create an instance of the dynamically generated class
        entity = entity_class(**entity_data).to_dict()
        entities.append(entity)

    return entities



@app.route('/test')
def test():
    s = Spreadsheet(os.environ['SPREADSHEET_ID'])
    headers = s.fetch_headers()
    return jsonify({"message": headers})

@app.route("/")
def hello_world():
    return render_template("index.html", title="Hello")

@app.route(Endpoints.Local.get_magazaine_data)
def magazine_data(slug):
    error = None

    try:
        data = Endpoint(magazine_base_url, "GET").fetch()[0]['values']
        articles = parse_spreadsheet_data_0(data, 'articles')

        for article in articles:
            if article.url == slug:
                return jsonify(article.to_dict())
            
    except Exception as e:
        error = str(e)

    return jsonify({
        "error": error if error else "Article not found",
    })

@app.route(Endpoints.Local.get_random_image)
def random_image():
    import random
    import os

    images = os.listdir(IMAGES_DIR)
    random_image = random.choice(images)
    
    return send_file(f"{IMAGES_DIR}/{random_image}")


@app.route(Endpoints.Local.get_resources)
def resources():
    error = None

    try:
        data = Endpoint(resources_base_url, "GET").fetch()[0]['values']
        resources = parse_spreadsheet_data_0(data, 'resources')
        return jsonify({
            "resources": [resource.to_dict() for resource in resources]
        })
    except Exception as e:
        error = str(e)

    return jsonify({
        "error": error if error else "No resources found",
        "resources": []
    })


@app.route(Endpoints.Local.data)
def get_data(id):
    try:
        db.set_collection('sheets_data')

        data = db.get_object({"_id": id})

        if not data.compile():
            return jsonify({
                "error": "Data not found"
            })
        else:
            # construct mappings from data.mappings 
            #   "mappings": [
            #         {
            #         "id": 84465,
            #         "python_header": "123123123",
            #         "sheets_header": "12e457"
            #         },
            #         {
            #         "id": 47971,
            #         "python_header": "345435435",
            #         "sheets_header": "3123123"
            #         }
            #     ],

            mappings = {mapping['sheets_header']:mapping['python_header'] for mapping in data.mappings}
            header_mappings[id] = mappings
            data  = Endpoint(Endpoints.spreadsheet_base_url(id, key, "A1:100"), "GET").fetch()[0]['values']
            # return data
            #return header_mappings[id]
            return parse_spreadsheet_data(data, id)



        return jsonify(data.compile())
    except Exception as e:
        return jsonify({
            "error": str(e)
        })


@app.route(Endpoints.Local.Spreadsheet.create,methods=['POST'])
def create_new_spreadsheet_data(id):
    
    try:
        data = request.json
        print(data)
        name = data.get('name')
        id = data.get('id')
        mappings = data.get('mappings')

        if not name or not mappings or not id:
            return jsonify({
                "error": "Invalid data"
            })
        
        db.set_collection('sheets_data')

        data_object = DbObject(Endpoints.Local.Spreadsheet.create_schema,True)
        data_object.name = name
        data_object._id = id
        data_object.mappings = mappings

        if db.get_object({"_id": id}).compile():
            db.update({"_id": id}, {"$set": data_object.compile()})
        else:
            db.insert(data_object)

        return jsonify({
            "message": "Data inserted"
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e)
        })

@app.route(Endpoints.Local.get_mappings)
def get_mappings():
    try:
        db.set_collection('sheets_data')
        mappings = db.get_objects({})
        return jsonify(
            [mapping.compile() for mapping in mappings]
        )
    except Exception as e:
        return jsonify({
            "error": str(e)
        })

if __name__=="__main__":
    app.run()