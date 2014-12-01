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

from medturk.db import project
from medturk.db import hit as hit_db
from medturk.db import user as user_db
from medturk.db import questionnaire as questionnaire_db
from flask.ext.login import login_required
from medturk.api import app, mail, mimerender, render_xml, render_json, render_html, render_txt
from flask.ext.login import current_user
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

    _project = project.get_project(project_id)
    _questionnaire = questionnaire_db.get_questionnaire(_project['questionnaire_id'])
    _hits = hit_db.get_hits(project_id, True)

    file_name = _project.get('name').replace(' ', '_') + '.csv'
    data = 'Patient Id, Question, Answer \n'

    for hit in _hits:
  
        question = ''
        answer   = ''
        for q in _questionnaire['questions']:
            if q['_id'] == hit['question_id']:
                question = q['question']
                for c in q['choices']:
                    if c['_id'] == hit['choice_id']:
                        answer = c['name']
                        break
                break

        data += hit.get('patient_id') + ',"' + question + '",' + answer + '\n'
    
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

    u = user_db.get_user(current_user.get_id())
    projects = project.get_projects(u['_id'], u['is_admin'])

    # Add completion status to each one
    for p in projects:
      
        p['completion'] = '0% (0/0)'

        answered = hit_db.get_answer_count(p['_id'])
        total    = hit_db.get_count(p['_id'])

        if total > 0:
            p['completion'] = str(int( (answered / (total*1.0))*100.0)) + '% (' + str(answered) + '/' + str(total) + ')'

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



