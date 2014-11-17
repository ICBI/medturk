#!/usr/bin/env python
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


from medturk.db import model
from flask.ext.login import login_required
from medturk.api import app, mimerender, render_xml, render_json, render_html, render_txt
from flask import jsonify, request, abort
from bson import ObjectId
import json

@app.route('/model/save', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
def model_post():
    
    # Parse the file
    file = request.files['file']

    _id = None

    # Is this a json file?
    if file.filename.lower().endswith('.json'):

        # Read the file contents
        raw = file.read()

        # Parse into json format
        _model = json.loads(raw)

        # Generate an object Id
        _id = ObjectId()

        # Assign the model an Id
        _model['_id'] = _id

        # Save the model
        model.save(_model)
    
    return {'_id' : str(_id)}



@app.route('/model/delete', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def model_delete_post():

    _id = request.form.get('id')
    model.delete(_id)
  
    return {'msg' : 'success'}




@app.route('/model', methods=['GET'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def model_get():
    
    model_id = request.args.get('id')
    return model.get(model_id)


@app.route('/models', methods=['GET'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def models_get():
    return {'models' : model.get_all()}


