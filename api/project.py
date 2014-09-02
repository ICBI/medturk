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