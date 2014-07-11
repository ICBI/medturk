#!/usr/bin/env python

'''
    Author:         Robert M. Johnson "matt"       rmj49@georgetown.edu
    Organization:   ICBI, Georgetown University    http://icbi.georgetown.edu

    Handles API calls for projects
'''


from medturk.db import hit
from medturk.api import app, mimerender, render_xml, render_json, render_html, render_txt
from flask import request, abort, Response, make_response



@app.route('/hit', methods=['GET'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
def hit_get():
    
    return hit.get_hit()




@app.route('/hit/count', methods=['GET'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
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
def hit_answer_count_get():
    
    count = hit.get_answer_count()
    return {'count' : count}



@app.route('/hit/answer', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
def hit_answer_post():

    hit_id = request.form.get('id')
    answer = request.form.get('answer')
    

    if hit_id == None or len(hit_id) == 0:
        abort(415, 'Hit Id is missing')

    if answer == None or len(answer) == 0:
        abort(415, 'Answer is missing')

    
    # Save project information
    hit.answer(hit_id, answer)
  
    return {'msg' : 'success'}



@app.route('/hit/download')
def hit_download_get():

    # Get all answered HITs
    hits = hit.get_hits(True)
    file_name = None


    data = 'Patient Id, Question, Answer, Tags \n'
    for h in hits:
        if file_name == None:
            file_name = h.get('project_name').replace(' ', '_') + '.csv'

        tags = '|'.join(h.get('tags'))
        data += h.get('patient_id') + ',"' + h.get('question') + '",' + h.get('answer') + ',"' + tags + '"\n'
    
    generator = (cell for row in data
                    for cell in row)
    return Response(generator,
                       mimetype="text/csv",
                       headers={"Content-Disposition":
                                    "attachment;filename=" + file_name})


