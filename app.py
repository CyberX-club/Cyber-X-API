from flask import Flask, render_template, jsonify, send_file, request
from flask_cors import CORS  # Import CORS
from Endpoint import Endpoint
from dotenv import load_dotenv
import os
from db_var import db
from Database.DbObject import DbObject
from firebase import Firebase
from decorators import Decor

from Endpoints import Endpoints
load_dotenv()

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

IMAGES_DIR = f'{os.path.dirname(__file__)}/{"images"}'
SHEETS_DATA_COL = 'sheets_data'
ALBUM = 'images_album'
IMAGES = 'images'
ADMIN = 'admin'



key = os.environ['SHEETS_API_KEY']

db.set_db(os.environ.get('DB_NAME', 'CyberX'))
db.set_collection(SHEETS_DATA_COL)


firebase = Firebase(db, ADMIN)
decor = Decor(firebase)

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
@decor.login_required
def test():
    return "Hello World"



    # image_path = "images/1.jpg"
    # db.set_collection(IMAGES)
    # data = imgur.upload_image_endpoint(image_path,"Test Image", "This is a test image","lW08KxwEyhhBl3l").fetch()[0]['data']
    # _id = data['id']
    # deletehash = data['deletehash']
    # obj = DbObject(Endpoints.Imgur.image_schema, False)
    # obj._id = _id
    # obj.deletehash = deletehash
    # obj.data = data

    # db.insert(obj)
    # return jsonify(data)




@app.route('/test2')
def test2():
    db.set_collection(IMAGES)
    images = db.get_objects({})
    return jsonify([image.compile() for image in images])

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
    }), 500

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
    }), 500


@app.route(Endpoints.Local.data)
def get_data(id):
    try:
        db.set_collection(SHEETS_DATA_COL)

        data = db.get_object({"_id": id})

        if not data.compile():
            return jsonify({
                "error": "Data not found"
            })
        else:
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
        }),500


@app.route(Endpoints.Local.Spreadsheet.create,methods=['POST'])
def create_new_spreadsheet_data(id):
    
    try:
        data = request.json
        print(data)
        name = data.get('name')
        id = data.get('id')
        mappings = data.get('mappings')

        if  not id:
            return jsonify({
                "error": "Invalid data"
            })
        
        db.set_collection(SHEETS_DATA_COL)

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
        }), 500

@app.route(Endpoints.Local.get_mappings)
def get_mappings():
    try:
        db.set_collection(SHEETS_DATA_COL)
        mappings = db.get_objects({})
        return jsonify(
            [mapping.compile() for mapping in mappings]
        )
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

@app.route(Endpoints.Local.get_mapping_for_id)
@decor.login_required
def get_mapping_for_id(id):
    try:
        db.set_collection(SHEETS_DATA_COL)
        mapping = db.get_object({"_id": id})
        return jsonify(mapping.compile())
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


@app.route(Endpoints.Local.new_album, methods=['POST'])
def new_album():
    try:
        data = request.json
        title = data.get('title')
        description = data.get('description')

        album = imgur.create_album_endpoint(title, description)
        response = album.fetch()[0]['data']

        

        obj = DbObject(Endpoints.Imgur.album_schema, True)
        obj.title = title
        obj.description = description
        obj.album_id = response['id']
        obj.deletehash = response['deletehash']

        db.set_collection(ALBUM)
        db.insert(obj)


        return jsonify(response)
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

@app.route(Endpoints.Local.get_albums)
def get_albums():
    db.set_collection(ALBUM)
    albums = db.get_objects({})
    return jsonify([album.compile() for album in albums])


@app.route(Endpoints.Local.get_images_in_album)
@decor.login_required
def get_images_in_album(album_id):
    import json
    try:


        data = imgur.get_images_in_album_endpoint(album_id).fetch()[0]['data']

        #title = data['title']
        #print(f"Getting images for album {title}")

        print(json.dumps(data, indent=4))
        print("-+-"*40,"\n")




        return jsonify(data)
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 400

@app.route(Endpoints.Local.delete_image,methods=['DELETE'])
def delete_image(image_id):
    try:
        # find the deletehash for the image
        db.set_collection(IMAGES)
        image = db.get_object({"_id": image_id})
        deletehash = image.deletehash

        if not deletehash:
            return jsonify({
                "error": "Image not found"
            }), 400
        else:
            print(f"Deleting image {image_id}")

        data = imgur.delete_image_endpoint(deletehash).fetch()[0]['data']

        # remove the image from the database
        db.delete({"_id": image_id})

        print(data)
        return jsonify(data)
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 400

@app.route(Endpoints.Local.upload_image, methods=['POST'])
def upload_image_to_album(album_id):
    import json
    # Get the list of file objects from the request
    images = request.files.getlist("files")

    print(len(images))
    
    try:
        for index ,image in enumerate(images):
            image_content = image.read()
            
            print(f"Now uploading image {image.filename}")

            # try getting title, description from image 
            try:
                title = request.form.get(f"title_{index}")
                description = request.form.get(f"description_{index}")
            except Exception as e:
                title = None
                description = None

            print(f"Title: {title}, Description: {description}")



            # get delete hash for the id 
            db.set_collection(ALBUM)
            album = db.get_object({"album_id": album_id}).compile()
            if not album:
                return jsonify({
                    "error": "Album not found"
                }), 400
            
            album_hash = album['deletehash']


            data = imgur.upload_image_endpoint(image_content=image_content, title=title, description=description).fetch()[0]['data']

            # move the image to the album
            move = imgur.move_image_to_album_endpoint(data['deletehash'], album_hash).fetch()[0]


            
            print("-+-"*40,"\n",json.dumps(data, indent=4),"\n","-+-"*40,"\n",json.dumps(move, indent=4),"\n","-+-"*40,"\n")        

            db.set_collection(IMAGES)
            obj = DbObject(Endpoints.Imgur.image_schema, False)
            obj._id = data['id']
            obj.deletehash = data['deletehash']
            obj.data = data
        
            db.insert(obj)

        return jsonify({
            "message": "Images uploaded"})
    
    except Exception as e:
        print(f"Error uploading image: {e}")
        return jsonify({
            "error": str(e)
        }), 400  


@app.route(Endpoints.Local.admin)
@decor.login_required
def get_admin():
    db.set_collection(ADMIN)
    data = db.get_objects({})
    return jsonify([d.compile()['email'] for d in data])

@app.route(Endpoints.Local.admin, methods=['POST'])
@decor.login_required
def add_admin():
    data = request.json

    if not data or not data.get('emails'):
        return jsonify({
            "error": "Invalid data"
        }), 400

    db.set_collection(ADMIN)
    for email in data['emails']:
        obj = DbObject(Endpoints.Users.admin_user_schema, True)
        obj.email = email.strip()
        db.insert(obj)

    return jsonify({
        "message": "Admins added"
    })

@app.route(Endpoints.Local.admin, methods=['DELETE'])
@decor.login_required
def remove_1_admin():
    email = request.json.get('email')

    if not email:
        return jsonify({
            "error": "Invalid data"
        }), 400

    db.set_collection(ADMIN)
    db.delete({"email": email.strip()})

    return jsonify({
        "message": "Admin removed"
    })

if __name__=="__main__":
    app.run(debug=True)