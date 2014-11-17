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


import os
from medturk.db import dataset
from flask.ext.login import login_required
from medturk.api import app, mimerender, render_xml, render_json, render_html, render_txt
from flask import jsonify, request, abort



@app.route('/dataset/edit', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def dataset_edit_post():

    _id          = request.form.get('id')
    _name        = request.form.get('name')
    _description = request.form.get('description')
    
    dataset.edit(_id, _name, _description)
  
    return {'msg' : 'success'}



@app.route('/dataset/delete', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def dataset_delete_post():

    dataset_id = request.form.get('id')
    dataset.delete(dataset_id)
  
    return {'msg' : 'success'}




@app.route('/dataset/create', methods=['POST'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def dataset_create_post():

    name         = request.form.get('name')
    description  = request.form.get('description')
    folder       = request.form.get('folder')

    dataset.create(name, description, folder)
  
    return {'msg' : 'success'}


@app.route('/datasets/raw', methods=['GET'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def datasets_raw_get():
    
    top = '/Users/matt/Development/git/ICBI/medturk/datasets'

    datasets = []
    for root, dirs, files in os.walk(top, topdown=False):
        for name in dirs:
            datasets.append(name)

    return {'datasets' : datasets}




@app.route('/datasets', methods=['GET'])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def datasets_get():
    return {'datasets' : dataset.get()}


