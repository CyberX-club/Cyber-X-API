class Endpoints{

    static BASE_URL = "https://moonlit-spirit-7vp5rvjqrr5jcx7v7-5000.app.github.dev/api";

    static CREATE_SPREADSHEET = (id) => `${Endpoints.BASE_URL}/spreadsheet/new/${id}`;
    static MAPPINGS = `${Endpoints.BASE_URL}/mappings`;
    


}

export default Endpoints;