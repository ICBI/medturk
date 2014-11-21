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


from medturk.db import hit
from flask.ext.login import login_required
from medturk.api import app, mimerender, render_xml, render_json, render_html, render_txt
from flask import request, abort, Response, make_response

'''
    CREATE operations
'''
@app.route('/hit/all/create', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def hit_create_post():

    _project_id = request.form.get('project_id')
    hit.create_hits(_project_id)
    return {'msg' : 'success'}

@app.route('/hit/choice/create', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def hit_choice_create_post():

    _hit_id    = request.form.get('hit_id')
    _choice_id = request.form.get('choice_id')
    hit.create_hit_choice(_hit_id, _choice_id)
    return {'msg' : 'success'}






'''
    READ operations
'''
@app.route('/hit', methods=['GET'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def hit_get():

    _project_id = request.args.get('project_id')
    _hit = hit.get_hit(_project_id)

    if _hit == None:
        abort(404, 'No hits are available')
    
    return {'hit' : _hit}


@app.route('/hit/count', methods=['GET'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def hit_count_get():
    
    count = hit.get_count()
    return {'count' : count}

@app.route('/hit/answer/count', methods=['GET'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def hit_answer_count_get():
    
    count = hit.get_answer_count()
    return {'count' : count}







'''
    DELETE operations
'''
@app.route('/hit/all/delete', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def hit_all_delete_post():

    _project_id   = request.form.get('project_id')
    hit.delete_hits(_project_id)
  
    return {'msg' : 'success'}


