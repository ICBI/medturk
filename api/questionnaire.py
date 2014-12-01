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


from medturk.db import questionnaire as questionnaire_db
from flask.ext.login import login_required
from medturk.api import app, mimerender, render_xml, render_json, render_html, render_txt
from flask import jsonify, request, abort, Response
from bson import ObjectId
from bson.json_util import dumps
from bson.json_util import loads








'''
    CREATE operations
'''
@app.route('/questionnaire/tag/create', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def questionnaire_tag_create_post():
    
    _questionnaire_id   = request.form.get('questionnaire_id')
    _tag_name           = request.form.get('tag_name')
    tag = questionnaire_db.create_questionnaire_tag(_questionnaire_id, _tag_name)
    
    return {'tag' : tag}


@app.route('/questionnaire/upload', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def questionnaire_upload_post():
    
    # Parse the file
    file = request.files['file']

    _id = None

    # Is this a json file?
    if file.filename.lower().endswith('.json'):

        # Read the file contents
        raw = file.read()

        # Parse into json format
        _questionnaire = loads(raw)

        # Generate an object Id
        _id = ObjectId()

        # Assign the model an Id
        _questionnaire['_id'] = _id

        # Save the model
        questionnaire_db.create_uploaded_questionnaire(_questionnaire)
    
    return {'_id' : str(_id)}


@app.route('/questionnaire/create', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def questionnaire_create_post(): 
    return {'questionnaire_id' : questionnaire_db.create_questionnaire()}





@app.route('/questionnaire/question/choice/create', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def questionnaire_question_choice_create_post():
    _questionnaire_id = request.form.get('questionnaire_id')
    _question_id      = request.form.get('question_id')
    _choice_name      = request.form.get('choice_name')
    choice = questionnaire_db.create_question_choice(_questionnaire_id, _question_id, _choice_name)
    return {'choice' : choice}



@app.route('/questionnaire/question/trigger/create', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def questionnaire_question_trigger_create_post():
    _questionnaire_id         = request.form.get('questionnaire_id')
    _question_id              = request.form.get('question_id')
    _trigger_name             = request.form.get('trigger_name')
    _trigger_case_sensitive   = request.form.get('trigger_case_sensitive')

    trigger = questionnaire_db.create_question_trigger(_questionnaire_id, _question_id, _trigger_name, _trigger_case_sensitive)
    return {'trigger' : trigger}



@app.route('/questionnaire/question/tag/create', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def questionnaire_question_tag_create_post():
    _questionnaire_id = request.form.get('questionnaire_id')
    _question_id      = request.form.get('question_id')
    _tag_id           = request.form.get('tag_id')
    questionnaire_db.create_question_tag(_questionnaire_id, _question_id, _tag_id)
    return {'status' : 'success'}



@app.route('/questionnaire/question/create', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def questionnaire_create_question_post():
    _questionnaire_id        = request.form.get('questionnaire_id')
    return {'question' : questionnaire_db.create_question(_questionnaire_id)}














'''
    READ operations
'''
@app.route('/questionnaire/download')
@login_required
def questionnaire_download_get():

    _questionnaire_id = request.args.get('questionnaire_id')
    _questionnaire    = questionnaire_db.get_questionnaire(_questionnaire_id)

    _json = dumps(_questionnaire, sort_keys=True, indent=4, separators=(',', ': '))

    return Response(_json,
                    mimetype="text/json",
                    headers={"Content-Disposition":"attachment;filename=" +  _questionnaire['name'] + ".json"})


@app.route('/questionnaire', methods=['GET'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def questionnaire_get():
    
    _questionnaire_id = request.args.get('questionnaire_id')
    return {'questionnaire' : questionnaire_db.get_questionnaire(_questionnaire_id)}


@app.route('/questionnaire/all', methods=['GET'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def questionnaire_all_get():
    return {'questionnaires' : questionnaire_db.get_questionnaires()}








'''
    UPDATE operations
'''
@app.route('/questionnaire/tag/name/update', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def questionnaire_tag_name_update_post(): 

    _questionnaire_id  = request.form.get('questionnaire_id')
    _tag_id            = request.form.get('tag_id')
    _tag_name          = request.form.get('tag_name')

    questionnaire_db.update_questionnaire_tag_name(_questionnaire_id, _tag_id, _tag_name)

    return {'status' : 'success'}

@app.route('/questionnaire/question/type/update', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def questionnaire_question_type_update_post(): 

    _questionnaire_id   = request.form.get('questionnaire_id')
    _question_id        = request.form.get('question_id')
    _question_type      = request.form.get('question_type')

    questionnaire_db.update_question_type(_questionnaire_id, _question_id, _question_type)

    return {'status' : 'success'}


@app.route('/questionnaire/question/choice/name/update', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def questionnaire_question_choice_name_update_post(): 

    _questionnaire_id   = request.form.get('questionnaire_id')
    _question_id        = request.form.get('question_id')
    _choice_id          = request.form.get('choice_id')
    _choice_name        = request.form.get('choice_name')

    questionnaire_db.update_question_choice_name(_questionnaire_id, _question_id, _choice_id, _choice_name)

    return {'status' : 'success'}



@app.route('/questionnaire/question/text/update', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def questionnaire_question_text_update_post(): 

    _questionnaire_id = request.form.get('questionnaire_id')
    _question_id      = request.form.get('question_id')
    _question_text    = request.form.get('question_text')
    questionnaire_db.update_question_text(_questionnaire_id, _question_id, _question_text)
    return {'status' : 'success'}


@app.route('/questionnaire/name/update', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def questionnaire_name_update_post(): 

    _questionnaire_id          = request.form.get('questionnaire_id')
    _questionnaire_name        = request.form.get('questionnaire_name')
    questionnaire_db.update_questionnaire_name(_questionnaire_id, _questionnaire_name)
    return {'status' : 'success'}


@app.route('/questionnaire/description/update', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def questionnaire_description_update_post(): 

    _questionnaire_id          = request.form.get('questionnaire_id')
    _questionnaire_description = request.form.get('questionnaire_description')
    questionnaire_db.update_questionnaire_description(_questionnaire_id, _questionnaire_description)
    return {'status' : 'success'}










'''
    DELETE operations
'''
@app.route('/questionnaire/delete', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def questionnaire_delete_post():

    _questionnaire_id = request.form.get('questionnaire_id')
    questionnaire_db.delete_questionnaire(_questionnaire_id)
  
    return {'msg' : 'success'}

@app.route('/questionnaire/tag/delete', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def questionnaire_tag_delete_post():

    _questionnaire_id = request.form.get('questionnaire_id')
    _tag_id            = request.form.get('tag_id')
    questionnaire_db.delete_questionnaire_tag(_questionnaire_id, _tag_id)
    return {'status' : 'success'}


@app.route('/questionnaire/question/tag/delete', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def questionnaire_question_tag_delete_post():

    _questionnaire_id = request.form.get('questionnaire_id')
    _question_id      = request.form.get('question_id')
    _tag_id           = request.form.get('tag_id')
    questionnaire_db.delete_question_tag(_questionnaire_id, _question_id, _tag_id)

    return {'status' : 'success'}


@app.route('/questionnaire/question/trigger/delete', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def questionnaire_question_trigger_delete_post():
    _questionnaire_id = request.form.get('questionnaire_id')
    _question_id      = request.form.get('question_id')
    _trigger_id       = request.form.get('trigger_id')
    questionnaire_db.delete_question_trigger(_questionnaire_id, _question_id, _trigger_id)
    return {'status' : 'success'}



@app.route('/questionnaire/question/choice/delete', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def questionnaire_question_choice_remove_post():
    _questionnaire_id = request.form.get('questionnaire_id')
    _question_id      = request.form.get('question_id')
    _choice_id        = request.form.get('choice_id')
    questionnaire_db.delete_question_choice(_questionnaire_id, _question_id, _choice_id)
    return {'status' : 'success'}


@app.route('/questionnaire/question/delete', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def questionnaire_question_delete_post():

    _questionnaire_id = request.form.get('questionnaire_id')
    _question_id      = request.form.get('question_id')
    questionnaire_db.delete_question(_questionnaire_id, _question_id)
    return {'status' : 'success'}











