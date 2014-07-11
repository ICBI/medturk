#!/usr/bin/env python

'''
    Author:         Robert M. Johnson "matt"       rmj49@georgetown.edu
    Organization:   ICBI, Georgetown University    http://icbi.georgetown.edu

    Handles API calls for research models.
'''


from medturk.db import model
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


@app.route('/model', methods=['GET'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
def model_get():
    return model.get_model()


