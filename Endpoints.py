class Endpoints:

    get_magazaine_data = '/magazine/<slug>'
    get_random_image = '/random-image'
    magazine_base_url = lambda spreadsheetId,key,range : f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}?key={key}"