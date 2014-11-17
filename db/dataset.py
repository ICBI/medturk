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

def edit(_id, _name, _description):

    converted_id = ObjectId(_id)

    doc = db.datasets.find_one({'_id' : converted_id})
    doc['name']        = _name
    doc['description'] = _description
    db.datasets.update({'_id': converted_id}, {'$set': doc}, upsert=False)



def delete(_id):
    db.datasets.remove({'_id' : ObjectId(_id)})
    db.patients.remove({'dataset_id' : ObjectId(_id)})
    db.records.remove({'dataset_id' : ObjectId(_id)})


def get():
    return [dataset for dataset in db.datasets.find()]


def create(name, description, folder):
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

    db.datasets.save({'_id' : _id, 'name' : name, 'description' : description, 'date' : str(date.today()), 'patient_count' : patient_count})



if __name__ == '__main__':
    pass



