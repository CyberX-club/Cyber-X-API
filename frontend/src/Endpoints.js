class Endpoints{

    static APP_NAME = "CyberX-Admin";
    static BASE_URL = "https://humble-telegram-44vvrr5qggwc7vp6-5000.app.github.dev/api";

    static BUILD_HEADERS = (token) => ({
        'Authorization': `${token}`,
    });

    static CREATE_SPREADSHEET = (id) => `${Endpoints.BASE_URL}/spreadsheet/new/${id}`;
    static MAPPINGS = `${Endpoints.BASE_URL}/mappings`;
    static MAPPING = (id) => `${Endpoints.BASE_URL}/mappings/${id}`;    
    
    static NEW_ALBUM = `${Endpoints.BASE_URL}/album/new`;
    static ALBUMS = `${Endpoints.BASE_URL}/album`;
    static IMAGES_IN_ALBUM = (id) => `${Endpoints.BASE_URL}/album/${id}`;
    static DEL_IMAGE = (id) => `${Endpoints.BASE_URL}/image/${id}/delete`;
    static DEL_ALBUM = (id) => `${Endpoints.BASE_URL}/album/${id}/delete`;
    static UPLOAD_IMAGE = (id) => `${Endpoints.BASE_URL}/image/${id}/upload`;
    static ADMIN = `${Endpoints.BASE_URL}/admin`;


}

export default Endpoints;