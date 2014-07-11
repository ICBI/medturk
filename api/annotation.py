#!/usr/bin/env python

from medturk.db import annotation, record
from medturk.api import app, mimerender, render_xml, render_json, render_html, render_txt
from flask import request
from medturk.core import ctakes


@app.route('/annotation/ctakes/save', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
def annotation_ctakes_save_post():

    # Parse the file
    file = request.files['file']

    # Is this a xml file?
    if file.filename.lower().endswith('.xml'):

        # Read the file contents
        raw = file.read()

        # Parse the record Id
        record_id = file.filename[:file.filename.index('.')]
      
        # Parse ctakes file
        ct = ctakes.cTAKES(raw)

        # Get annotations from cTAKES
        annotations = ct.get_annotations()

        r = record.get_record(record_id)
        patient_id = r.get('patient_id')
        date       = r.get('date')

        for a in annotations:

            # Add the record Id
            a['record_id']  = record_id

            # Add the patient Id
            a['patient_id'] =  patient_id

            # Add the record date
            a['date'] = date

            # Save this annotation
            annotation.save(a)
    
    return {'msg' : 'success'}


