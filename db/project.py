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
from medturk.db import db
from bson import ObjectId


def get(_id):
    return db.projects.find_one({'_id' : ObjectId(_id)})

def get_all():
    return list(db.projects.find())

def add_analyst(project_id, email):

    # Add analyst to project
    p = get(project_id)
    p['analysts'] = list(set(p.get('analysts', []) + [email]))
    db.projects.save(p)

def save(_id, name, description, dataset_id, model_id):
    '''
        Create the project
    '''
    # Insert the project
    db.projects.insert({'_id' : _id, 'name' : name, 'description' : description, 'dataset_id' : ObjectId(dataset_id), 'model_id' : ObjectId(model_id)})


if __name__ == '__main__':
    pass



