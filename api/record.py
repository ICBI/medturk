#!/usr/bin/env python

'''
    Author:         Robert M. Johnson "matt"       rmj49@georgetown.edu
    Organization:   ICBI, Georgetown University    http://icbi.georgetown.edu

    Handles API calls for research models.
'''


from medturk.db import record
from medturk.api import app, mimerender, render_xml, render_json, render_html, render_txt
from flask import request, abort

@app.route('/record', methods=['GET'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
def record_get():
    
    record_id = request.args.get('id')

    if record_id == None or len(record_id) == 0:
        abort(415, 'Record Id is missing')

    return record.get_record(record_id)


