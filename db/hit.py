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


from medturk.db import project, model, record
from medturk.db import db
from bson import ObjectId
import itertools
from operator import itemgetter

flank_size = 200
bounded  = [' ', ',', ';', '(', ')', '.', '?', '!', '/', '\\', '{', '}', '[', ']', '"', '\'', ':']




'''
    CREATE operations
'''
def create_hits(_project_id):
    '''
        When generating hits, we want to group every mentioned concept by patient
    '''

    _project = project.get(_project_id)

    dataset_id = _project['dataset_id']
    m = model.get(_project['model_id'])

    # Get cursor for all records from this dataset
    for record in record.get_record_cursor(dataset_id):
        _note             = record['note']
        _lower_cased_note = record['note'].lower()




    # Sort triggers in each active node by name before iterating through patient dataset
    for an in active_nodes:

        # Lower case all
        for trigger in an.get('triggers'):
            trigger['name'] = trigger['name'].lower()

        # Sort by name
        triggers = sorted(an.get('triggers'), key=lambda d: len(d['name']), reverse=True)
        an['triggers'] = triggers

    # Get all records
    records = record.get_records(dataset_id)

    # Group the records by patient
    for key, group in itertools.groupby(records, lambda item: item['patient_id']):
        
        patient_id = key

        # For every active node
        for an in active_nodes:

            annotations = []

            for patient_record in group:

                normalized_note = patient_record['note'].lower()

                record_annotations = []

                # For every trigger in this active node
                for trigger in an['triggers']:
                    record_annotations = get_annotations(trigger['name'], normalized_note, patient_record['note'])
                    record_annotations.extend([a for a in record_annotations if does_not_overlap(a, record_annotations)])

                 # Add record id and date
                for ra in record_annotations:
                    ra['record_id'] = patient_record['_id']
                    ra['date']      = patient_record['date']

                annotations.extend(record_annotations)


            if len(annotations) > 0:
                # Create a hit
                hit = an.copy()
                del hit['triggers']
                hit['patient_id']  = patient_record['patient_id']
                hit['dataset_id']  = patient_record['dataset_id']
                hit['project_id']  = project_id
                hit['annotations'] = annotations
                db.hits.insert(hit)





def answer(hit_id, answer):
	
	db.hits.update({'_id' : ObjectId(hit_id)}, {'$set' : {'answer' : answer}})

def get_hit(project_id, answered = False):
    return db.hits.find_one( {'project_id' : ObjectId(project_id), 'answer' : {'$exists' : answered}} )


def get_hits(project_id, answered = False):
    return list(db.hits.find( {'answer' : {'$exists' : answered}} ))


def get_answer_count(project_id):
    return db.hits.find( {'project_id' : ObjectId(project_id), 'answer' : {'$exists' : True}} ).count()


def get_count(project_id):
    return db.hits.find({'project_id' : ObjectId(project_id)}).count()


def populate_active_nodes_list(node, active_nodes = [], tags = []):
    '''
        Parses active nodes from model
    '''

    # Is this an active node?
    if 'triggers' in node:
        node['tags'] = tags
        active_nodes.append(node)

    # Keep searching for more active nodes
    children = node.get('children')
    if children != None:
        for child in node.get('children'):
            populate_active_nodes_list(child, active_nodes, [node.get('name')] + tags)


def does_not_overlap(annotation, annotations):
    return True


def is_start_boundary_ok(i, text):
    return (  i == 0   or   (text[i-1] in bounded)  )

def is_end_boundary_ok(i, name, text):
    return ((i + len(name)) == len(text)) or (text[i+len(name)] in bounded)

def get_annotations(trigger, normalized_note, note):

    i = -1
    annotations = []

    try:
        while(True):
            i = normalized_note.index(trigger, i+1)
            # Check to see if bounded by approved characters
            if is_start_boundary_ok(i, note) and is_end_boundary_ok(i, trigger, note):
                
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


def create(project_id):
    '''
        When generating hits, we want to group every mentioned concept by patient
    '''

    # Ensure active nodes array is empty
    active_nodes = []

    # Get information about this projrect
    p = project.get(project_id)

    dataset_id = p['dataset_id']

    # Retrieve the research model
    m = model.get(p['model_id'])

    populate_active_nodes_list(m, active_nodes)

    # Sort triggers in each active node by name before iterating through patient dataset
    for an in active_nodes:

        # Lower case all
        for trigger in an.get('triggers'):
            trigger['name'] = trigger['name'].lower()

        # Sort by name
        triggers = sorted(an.get('triggers'), key=lambda d: len(d['name']), reverse=True)
        an['triggers'] = triggers

    # Get all records
    records = record.get_records(dataset_id)

    # Group the records by patient
    for key, group in itertools.groupby(records, lambda item: item['patient_id']):
        
        patient_id = key

        # For every active node
        for an in active_nodes:

            annotations = []

            for patient_record in group:

                normalized_note = patient_record['note'].lower()

                record_annotations = []

                # For every trigger in this active node
                for trigger in an['triggers']:
                    record_annotations = get_annotations(trigger['name'], normalized_note, patient_record['note'])
                    record_annotations.extend([a for a in record_annotations if does_not_overlap(a, record_annotations)])

                 # Add record id and date
                for ra in record_annotations:
                    ra['record_id'] = patient_record['_id']
                    ra['date']      = patient_record['date']

                annotations.extend(record_annotations)


            if len(annotations) > 0:
                # Create a hit
                hit = an.copy()
                del hit['triggers']
                hit['patient_id']  = patient_record['patient_id']
                hit['dataset_id']  = patient_record['dataset_id']
                hit['project_id']  = project_id
                hit['annotations'] = annotations
                db.hits.insert(hit)

if __name__ == '__main__':
    pass



