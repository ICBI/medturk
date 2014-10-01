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

from medturk.db import annotation, record
from flask.ext.login import login_required
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
@login_required
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


