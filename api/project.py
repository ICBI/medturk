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



@app.route('/project/data')
@login_required
def project_get():

    project_id = request.form.get('id')

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




@app.route('/project/get_all', methods=['GET'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def project_get_all():
    projects = project.get_all()

    # Add completion percentage to each one
    for p in projects:
      
        p['percentage'] = 100
        answered = hit.get_answer_count(p['_id'])
        total    = hit.get_count(p['_id'])

        if total > 0:
            p['percentage'] = int( (answered / (total*1.0))*100.0  )

    return {'projects' : projects}



@app.route('/project/analyst/add', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def project_analyst_add():

    project_id  = request.form.get('project_id')
    email       = request.form.get('email')
    password    = '5dsf*934fj$@($&'


    print project_id
    p = project.get(project_id)


    msg = Message("medTurk", sender = app.config.get('DEFAULT_MAIL_SENDER'), recipients=[email])

    msg.html  = '<p>Hello ' + email + ' . You are invited to be part of the ' + p['name'] + ' project.</p>'
    
    # Add this only if a description exists
    if len(p['description']) > 0:
        msg.html += '<p>Here\'s a brief description about this project:</p>'
        msg.html += '<p>' + p['description'] +'</p>'


    # Does this user account already exist?
    if user.get(email) == None:

        user.add(email, password, app.secret_key)

        msg.html += '<p>We know you are new to medTurk. So, when you login, use this e-mail as your username and the following password:</p>'
        msg.html += '<br/><br/><p><b>' + password +'</b></p>'
        msg.html += '<br/><br/><p>Please change your password after logging in!</p>'

    msg.html += 'Ready? <a href="http://127.0.0.1:5000/medturk/login.html">Click here</a> to get started!</p>'
    mail.send(msg)

    # Add this user to the projects list
    project.add_analyst(project_id, email)
  
    return {'msg' : 'success'}




@app.route('/project/create', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def project_save_post():

    _id          = ObjectId()
    name         = request.form.get('name')
    description  = request.form.get('description')
    dataset_id   = request.form.get('dataset_id')
    model_id     = request.form.get('model_id')

    project.save(_id, name, description, dataset_id, model_id)
    hit.create(_id)
  
    return {'msg' : 'success'}