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


from medturk.db import project as project_db
from medturk.db import project, questionnaire, record
from medturk.db import db
from bson import ObjectId
import itertools
from operator import itemgetter

flank_size = 200
bounded  = [' ', ',', ';', '(', ')', '.', '?', '!', '/', '\\', '{', '}', '[', ']', '"', '\'', ':']


def _is_start_boundary_ok(i, text):
    return (  i == 0   or   (text[i-1] in bounded)  )

def _is_end_boundary_ok(i, name, text):
    return ((i + len(name)) == len(text)) or (text[i+len(name)] in bounded)

def _get_record_annotations(trigger, case_sensitive, note, normalized_note):

    i = -1
    annotations = []

    try:
        while(True):
            if case_sensitive:
                i = normalized_note.index(trigger, i+1)
            else:
                i = note.index(trigger, i+1)

            # Check to see if bounded by approved characters
            if _is_start_boundary_ok(i, note) and _is_end_boundary_ok(i, trigger, note):
                
                beg = i - flank_size

                # A string can only begin at 0, so set beginning kwic at 0
                if beg < 0:
                    beg = 0

                # Grab contents surrounding the trigger
                kwic = note[beg:(i + flank_size)]

                annotations.append({'beg' : i, 'end' : (i + len(trigger)), 'kwic' : kwic})
    except ValueError:
        pass

    return annotations









'''
    CREATE operations
'''
def create_hits(_project_id):
    '''
        When generating hits, we want to group every mentioned concept by patient
    '''

    _project       = project.get_project(_project_id)
    _dataset_id    = _project['dataset_id']
    _questionnaire = questionnaire.get_questionnaire(_project['questionnaire_id'])

    # Get all records specific to this dataset id
    records = record.get_records(_dataset_id)
    
    # Group the records by patient
    for key, group in itertools.groupby(records, lambda item: item['patient_id']):
        
        patient_id = key

        # For every question
        for question in _questionnaire['questions']:

            question_annotations = []

            for patient_record in group:

                record_annotations = []

                note            = patient_record['note']
                normalized_note = patient_record['note'].lower()

                for trigger in question['triggers']:
                    record_annotations.extend(_get_record_annotations(trigger['name'], trigger['case_sensitive'], note, normalized_note))

                 # Add record id and date
                for record_annotation in record_annotations:
                    record_annotation['record_id'] = patient_record['_id']
                    record_annotation['date']      = patient_record['date']

                question_annotations.extend(record_annotations)


            if len(question_annotations) > 0:
                # Create a hit
                hit = dict()
                hit['patient_id']   = patient_record['patient_id']
                hit['dataset_id']   = patient_record['dataset_id']
                hit['project_id']   = ObjectId(_project_id)
                hit['question_id']  = question['_id']
                hit['tag_ids']      = question['tag_ids']
                hit['annotations']  = question_annotations
                db.hits.insert(hit)

    project_db.update_project_status(_project_id, 'Build Complete')

def create_hit_choice(_hit_id, _choice_id):
    db.hits.update({'_id' : ObjectId(_hit_id)}, {'$set' : {'choice_id' : ObjectId(_choice_id)}})







'''
    READ operations
'''
def get_hit(_project_id, _choice_id_exists = False):
    return db.hits.find_one( {'project_id' : ObjectId(_project_id), 'choice_id' : {'$exists' : _choice_id_exists}} )


def get_hits(_project_id, _choice_id_exists = False):
    return list(db.hits.find( {'project_id' : ObjectId(_project_id), 'choice_id' : {'$exists' : _choice_id_exists}} ))


def get_answer_count(_project_id):
    return db.hits.find( {'project_id' : ObjectId(_project_id), 'choice_id' : {'$exists' : True}} ).count()


def get_count(_project_id):
    return db.hits.find({'project_id' : ObjectId(_project_id)}).count()




'''
    DELETE operations
'''

def delete_hits(_project_id):
    db.hits.remove({'project_id' : ObjectId(_project_id)})






