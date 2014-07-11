from medturk import config
from flask import Flask
import pymongo, mimerender, json
from bson import ObjectId



'''
	static_url_path
		Directory where html,js,css,... files live

	static_folder
		Prefix to use when accessing the static files (e.g. http://127.0.0.1:5000/medturk/index.html )
'''
app = Flask(__name__, static_url_path='/medturk', static_folder = '../ui')



class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)


mimerender = mimerender.FlaskMimeRender()
render_xml  = lambda message: '<message>%s</message>'%message
render_json = lambda **args: JSONEncoder().encode(args)
render_html = lambda message: '<html><body>%s</body></html>'%message
render_txt  = lambda message: message

import medturk.api.patient
import medturk.api.model
import medturk.api.project
import medturk.api.annotation
import medturk.api.hit
import medturk.api.record