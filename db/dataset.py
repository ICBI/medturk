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
import sys, glob, json, pymongo
from bson import ObjectId
from medturk.db import db
from datetime import date







'''
    CREATE operations
'''
def create_dataset(name, description, folder):
    '''
        Create the dataset
    '''

    # Generate the id for this dataset
    _id = ObjectId()

    # Create an entry for this dataset
    patient_count = 0

    for file_name in glob.glob('/Users/matt/Development/git/ICBI/medturk/datasets/' + folder + '/*.json'):

        with open(file_name) as file:

            # Read the file contents
            raw = file.read()

            # Parse into json format
            patient = json.loads(raw)

            # Save each patient record
            for record in patient['records']:
                record['patient_id'] = patient.get('id')
                record['dataset_id'] = _id
                db.records.insert(record)

            # Remove records from patient
            del patient['records']

            # Save patient record
            patient['dataset_id'] = _id
            db.patients.insert(patient)

            # Update patient count
            patient_count += 1

    _dataset = {'_id' : _id, 'name' : name, 'description' : description, 'date' : str(date.today()), 'patient_count' : patient_count}
    db.datasets.save(_dataset)

    return _dataset






'''
    READ operations
'''
def get_dataset(_dataset_id):
    return db.datasets.find_one({'_id' : ObjectId(_dataset_id)})

def get_datasets():
    return list(db.datasets.find())









'''
    UPDATE operations
'''
def update_dataset_name(_dataset_id, _dataset_name):
    _dataset = get_dataset(_dataset_id)
    _dataset['name'] = _dataset_name
    db.datasets.save(_dataset)

def update_dataset_description(_dataset_id, _dataset_description):
    _dataset = get_dataset(_dataset_id)
    _dataset['description'] = _dataset_description
    db.datasets.save(_dataset)








'''
    DELETE operations
'''
def delete_dataset(_dataset_id):
    db.datasets.remove({'_id' : ObjectId(_dataset_id)})




