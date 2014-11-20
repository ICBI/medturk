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

from medturk.db import project, hit, user
from flask.ext.login import login_required
from medturk.api import app, mail, mimerender, render_xml, render_json, render_html, render_txt
from flask import request, abort, Response, make_response
from bson import ObjectId
from flask.ext.mail import Message








'''
    CREATE operations
'''
@app.route('/project/create', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def project_create_post():
    return {'project' : project.create_project()}


@app.route('/project/user/create', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def project_user_create():

    _project_id  = request.form.get('project_id')
    _user_id     = request.form.get('user_id')
    project.create_user(_project_id, _user_id)
    return {'msg' : 'success'}







'''
    READ operations
'''
@app.route('/project/data')
@login_required
def project_get():

    project_id = request.args.get('id')

    #p = project.get(project_id)
    #project_name = p.get('name')
    project_name = 'medturk'

    # Get all answered HITs
    hits = hit.get_hits(project_id, True)
    file_name = None

    data = 'Patient Id, Question, Answer, Tags \n'
   
    if file_name == None:
        file_name = project_name.replace(' ', '_') + '.csv'

    for h in hits:

        tags = '|'.join(h.get('tags'))
        data += h.get('patient_id') + ',"' + h.get('question') + '",' + h.get('answer') + ',"' + tags + '"\n'
    
    generator = (cell for row in data
                    for cell in row)
    return Response(generator,
                       mimetype="text/csv",
                       headers={"Content-Disposition":
                                    "attachment;filename=" + file_name})


@app.route('/projects', methods=['GET'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def project_get_all():
    projects = project.get_projects()

    # Add completion percentage to each one
    for p in projects:
      
        p['percentage'] = 100
        answered = hit.get_answer_count(p['_id'])
        total    = hit.get_count(p['_id'])

        if total > 0:
            p['percentage'] = int( (answered / (total*1.0))*100.0  )

    return {'projects' : projects}









'''
    UPDATE operations
'''
@app.route('/project/name/update', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def project_name_update_post():

    _project_id  = request.form.get('project_id')
    _name        = request.form.get('name')
    
    project.update_project_name(_project_id, _name)
  
    return {'msg' : 'success'}

@app.route('/project/description/update', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def project_description_update_post():

    _project_id  = request.form.get('project_id')
    _description = request.form.get('description')
    
    project.update_project_description(_project_id, _description)
  
    return {'msg' : 'success'}

@app.route('/project/dataset/update', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def project_dataset_update_post():

    _project_id  = request.form.get('project_id')
    _dataset_id  = request.form.get('dataset_id')
    
    project.update_project_dataset(_project_id, _dataset_id)
  
    return {'msg' : 'success'}

@app.route('/project/questionnaire/update', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def project_questionnaire_update_post():

    _project_id        = request.form.get('project_id')
    _questionnaire_id  = request.form.get('questionnaire_id')
    
    project.update_project_questionnaire(_project_id, _questionnaire_id)
  
    return {'msg' : 'success'}








'''
    DELETE operations
'''
@app.route('/project/delete', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def project_delete_post():

    _project_id   = request.form.get('project_id')
    project.delete_project(_project_id)
  
    return {'msg' : 'success'}



@app.route('/project/user/delete', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def project_user_delete_post():

    _project_id   = request.form.get('project_id')
    _user_id      = request.form.get('user_id')
    project.delete_user(_project_id, _user_id)
  
    return {'msg' : 'success'}



