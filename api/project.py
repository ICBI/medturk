#!/usr/bin/env python

'''
    Author:         Robert M. Johnson "matt"       rmj49@georgetown.edu
    Organization:   ICBI, Georgetown University    http://icbi.georgetown.edu

    Handles API calls for projects
'''


from medturk.db import project, hit
from medturk.api import app, mimerender, render_xml, render_json, render_html, render_txt
from flask import request, abort

@app.route('/project/create', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
def project_save_post():

    project_name = request.form.get('name')
    
    if project_name == None or len(project_name) == 0:
        abort(415, 'Project name is missing')

    
    # Save project information
    project.save(project_name)

    # Create hits for project
    hit.create(project_name)
  
    return {'msg' : 'success'}