import inspect

from Endpoint import Endpoint
from Database.Schema import Schema

class Endpoints:
    # Static endpoints
    class Local:
        get_magazaine_data = '/magazine/<slug>'
        get_resources = '/resources'
        get_random_image = '/random-image'
        
        create_image_folder = '/image/new/<folder>'


        get_mappings = '/api/mappings'
        get_mapping_for_id = '/api/mappings/<id>'
        data = '/api/data/<id>'


        new_album = '/api/album/new'
        get_albums = '/api/album'
        get_images_in_album = '/api/album/<album_id>'
        delete_image = '/api/image/<image_id>/delete'
        upload_image = '/api/image/<album_id>/upload'

        admin = '/api/admin'
        
        class Spreadsheet:
            create = '/api/spreadsheet/new/<id>'
            get_headers = '/api/spreadsheet/headers'
            get_data = '/api/spreadsheet/data'

            create_schema = Schema({
                "name":{"type":str},
                "_id":{"type":str},
                "mappings":{"type":dict}
            });

    # Lambda-based endpoints
    spreadsheet_base_url = lambda spreadsheetId, key, range: f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}?key={key}"
    magazine_base_url = lambda spreadsheetId, key, range: f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}?key={key}"
    resources_base_url = lambda spreadsheetId, key, range: f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}?key={key}"
    
    class Users:
        admin_user_schema = Schema({
            "email": {"type": str},
        })

        

    # Immgur API endpoints
    class Imgur:
        imgur_base_url = "https://api.imgur.com/3"
        album = "/album"
        album_schema = Schema({
            "title": {"type": str},
            "description": {"type": str},
            "album_id": {"type": str},
            "deletehash": {"type": str}
        })

        image_schema = Schema({
            "_id": {"type": str},
            "deletehash": {"type": str},
            "data": {"type": dict}
        })

        def __init__(self,api_key):
            self.api_key = api_key
            self.headers={"Authorization": f"Client-ID {self.api_key}"}
        
        

        def create_album_endpoint(self,title,description):
            return Endpoint(
            url=f"{self.imgur_base_url}{self.album}",
            method="POST",
            headers=self.headers,
            payload={
                "title": title,
                "description": description
            }
        )

        def upload_image_endpoint(self,image_path=None,image_content=None,title=None,description=None,album_id=None):
            try:
                payload = {}

                if title:
                    payload["title"] = title
                if description:
                    payload["description"] = description
                if album_id:
                    payload["album"] = album_id
                if not image_content and image_path:
                    with open(image_path, "rb") as image_file:
                        image_data = image_file.read()
                else:
                    image_data = image_content

                return Endpoint(
                    url=f"{self.imgur_base_url}/image",
                    method="POST",
                    headers=self.headers,
                    payload=payload,
                    files={
                        "image": image_data
                    }
                )
            except FileNotFoundError:
                print(f"File not found: {image_path}")
                return {"error": "File not found"}
            except Exception as e:
                print(f"Error uploading image: {e}")
                return {"error": "Error uploading image"}

        def move_image_to_album_endpoint(self,image_id,album_id):
            return Endpoint(
                url=f"{self.imgur_base_url}/album/{album_id}/add",
                method="POST",
                headers=self.headers,
                payload={
                     "deletehashes[]"  : image_id
                    }
            )
        
        def get_images_in_album_endpoint(self,album_hash):
            return Endpoint(
                url=f"{self.imgur_base_url}/album/{album_hash}/images",
                method="GET",
                headers=self.headers
            )

        def delete_image_endpoint(self,image_hash):
            return Endpoint(
                url=f"{self.imgur_base_url}/image/{image_hash}",
                method="DELETE",
                headers=self.headers
            )


        
    
    

    
    def __str__(self):
        # Start with the basic structure
        result = []
        
        # Iterate through the attributes of the class
        for attr_name in dir(self):
            # Skip private or dunder (special) methods and non-endpoint attributes
            if attr_name.startswith("__"):
                continue

            # Get the attribute value
            attr_value = getattr(self, attr_name)
            
            # Check if it's a callable (lambda function for base URLs)
            if callable(attr_value):
                # This is a dynamic endpoint, include placeholders
                result.append(f"{attr_name}: '{inspect.signature(attr_value)}'")
            else:
                # This is a static endpoint, just print the string
                result.append(f"{attr_name}: '{attr_value}'")
        
        # Return the joined result as a string
        return "\n".join(result)

    def to_dict(self):
        # Initialize an empty dictionary to hold the endpoints
        endpoints_dict = {}

        # Iterate through the attributes of the class
        for attr_name in dir(self):
            # Skip private or dunder (special) methods and non-endpoint attributes
            if attr_name.startswith("__") or attr_name.startswith("to_"):
                continue

            # Get the attribute value
            attr_value = getattr(self, attr_name)

            # Check if it's a callable (lambda function for base URLs)
            if callable(attr_value):
                # This is a dynamic endpoint, add the signature or placeholders
                # Instead of calling the function, just display the expected signature
                signature = str(inspect.signature(attr_value))
                endpoints_dict[attr_name] = f"Lambda function with signature: {signature}"
            else:
                # This is a static endpoint, add the actual endpoint string
                endpoints_dict[attr_name] = attr_value

        return endpoints_dict
