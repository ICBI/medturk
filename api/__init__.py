'''
    medTurk (inspired by Amazon's Mechanical Turk) supports clinical research by using the 
    ingenuity of humans to convert unstructured clinical notes into structured data.

    Copyright (C) 2014 Innovation Center for Biomedical Informatics (ICBI)
    			  	   Georgetown University <http://icbi.georgetown.edu/>
    
    Author: Robert M. Johnson "matt"
    		<rmj49@georgetown.edu>
    		<http://mattshomepage.com/>
    	    <@mattshomepage>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
'''


from medturk import config
from flask import Flask
from flask.ext.login import LoginManager
from flask.ext.mail import Mail
import pymongo, mimerender, json
from bson import ObjectId
from datetime import timedelta


'''
	static_url_path
		Directory where html,js,css,... files live

	static_folder
		Prefix to use when accessing the static files (e.g. http://127.0.0.1:5000/medturk/index.html )
'''
app = Flask(__name__, static_url_path='/medturk', static_folder = '../ui')

app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'
app.config["REMEMBER_COOKIE_DURATION"] = timedelta(days=1)
app.config['MAIL_SERVER']              = 'smtp.gmail.com'
app.config['MAIL_USE_TLS']             = True
app.config['MAIL_PORT']                = 587
app.config['MAIL_USERNAME']            = 'rjohnson0186@gmail.com'
app.config['MAIL_PASSWORD']            = '10Faceb00k10'
app.config['DEFAULT_MAIL_SENDER']      = 'rjohnson0186@gmail.com'

# Handles authentication
login_manager = LoginManager()
login_manager.init_app(app)

# Handles e-mailing
mail = Mail()
mail.init_app(app)


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
import medturk.api.user
import medturk.api.dataset