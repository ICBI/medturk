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
import sys, glob, json, pymongo
from bson import ObjectId
from medturk.db import db

dataset_name = sys.argv[1]
directory    = sys.argv[2]

# Generate an object Id for this dataset
dataset_id = ObjectId()

for file_name in glob.glob(directory + '/*.json'):

    with open(file_name) as file:

        # Read the file contents
        raw = file.read()

        # Parse into json format
        patient = json.loads(raw)

        # Save each patient record
        for record in patient['records']:
            record['patient_id'] = patient.get('id')
            record['dataset_id'] = dataset_id
            db.records.insert(record)

        # Remove records from patient
        del patient['records']

        # Save patient record
        patient['dataset_id'] = dataset_id
        db.patients.insert(patient)


db.records.ensure_index([('patient_id', pymongo.ASCENDING)])
db.records.ensure_index([('dataset_id', pymongo.ASCENDING)])
db.patients.ensure_index([('dataset_id', pymongo.ASCENDING)])
db.datasets.insert({'_id' : dataset_id, 'name' : dataset_name})
print dataset_name + ' has been inserted'














