#!/usr/bin/env python

from medturk.db import patient, record
from medturk.api import app, mimerender, render_xml, render_json, render_html, render_txt
from flask import request, abort
from bson import ObjectId

from medturk.core import ctakes


import json




@app.route('/patient/save', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
def patient_save_post():

    # Parse the file
    file = request.files['file']

    # Is this a json file?
    if file.filename.lower().endswith('.json'):

        # Read the file contents
        raw = file.read()

        # Parse into json format
        _patient = json.loads(raw)

        # Save patient's records
        for r in _patient['records']:
            r['patient_id'] = _patient.get('id')
            record.save(r)

        # Remove the records
        del _patient['records']

        # Save patient record
        patient.save(_patient)

    
    return {'msg' : 'success'}














