#!/usr/bin/env python
'''
    medTurk (inspired by Amazon's Mechanical Turk) supports clinical research by using the 
    ingenuity of humans to convert unstructured clinical notes into structured data.

    Copyright (C) 2014 Innovation Center for Biomedical Informatics (ICBI)
                       Georgetown University <http://icbi.georgetown.edu/>
    
    Author: Robert M. Johnson
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
from medturk.db import db
from bson import ObjectId








'''
    CREATE operations
'''
def create_project():
    _id = ObjectId()
    project = {'_id' : _id, 'name' : 'My New Project', 'description' : 'My description of this project', 'dataset_id' : None, 'model_id' : None, 'user_ids' : [], 'status' : 'Needs Building'}
    db.projects.insert(project)
    return project

def create_user(_project_id, _user_id):
    _project = get_project(_project_id)
    _project['user_ids'].append(ObjectId(_user_id))
    db.projects.save(_project)






'''
    READ operations
'''
def get_project(_project_id):
    return db.projects.find_one({'_id' : ObjectId(_project_id)})

def get_projects():
    return list(db.projects.find())









'''
    UPDATE operations
'''
def update_project_name(_project_id, _name):
    _project = get_project(_project_id)
    _project['name'] = _name
    db.projects.save(_project)

def update_project_description(_project_id, _description):
    _project = get_project(_project_id)
    _project['description'] = _description
    db.projects.save(_project)

def update_project_dataset(_project_id, _dataset_id):
    _project = get_project(_project_id)
    _project['dataset_id'] = ObjectId(_dataset_id)
    db.projects.save(_project)

def update_project_questionnaire(_project_id, _questionnaire_id):
    _project = get_project(_project_id)
    _project['questionnaire_id'] = ObjectId(_questionnaire_id)
    db.projects.save(_project)






'''
    DELETE operations
'''
def delete_project(_project_id):
    db.projects.remove({'_id' : ObjectId(_project_id)})

def delete_user(_project_id, _user_id):
    _user_id = ObjectId(_user_id)
    _project = get_project(_project_id)
    if _user_id in _project['user_ids']:
        _project['user_ids'].remove(_user_id)
    db.projects.save(_project)






