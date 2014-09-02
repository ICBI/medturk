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
import itertools

hits = []



def answer(hit_id, answer):
	
	db.hits.update({'_id' : ObjectId(hit_id)}, {'$set' : {'answer' : answer}})

def get_hit(answered = False):
    return db.hits.find_one( {'answer' : {'$exists' : answered}} )


def get_hits(answered = False):
    return db.hits.find( {'answer' : {'$exists' : answered}} )


def get_answer_count():
    return db.hits.find( {'answer' : {'$exists' : True}} ).count()


def get_count():
    return db.hits.count()


def generate_hits(node, tags = []):

    # Is this an active node or a passive node?
    if 'triggers' in node:
        node['tags'] = tags
        hits.append(node)

    children = node.get('children')
    if children != None:
        for child in node.get('children'):

            _tags = [node.get('name')] + tags
           
            generate_hits(child, _tags)

def create(project_name):
    # Retrieve the research model
    model = db.models.find_one()

    # Modifies our gobal variable of 'hits'
    generate_hits(model)

    for hit in hits:

        triggered_records = []

        for trigger in hit.get('triggers'):
            if trigger.get('type') == 'cui':
                triggered_records.extend( [record for record in db.annotations.find({'cui' : trigger.get('name')})])
            elif trigger.get('type') == 'keyword':
                triggered_records.extend( [record for record in db.annotations.find({'tokens' : {'$in' : [trigger.get('name').lower()]}})])

        for key, group in itertools.groupby(triggered_records, lambda item: item['patient_id']):
            hit['annotations'] = [a for a in group]
            hit['patient_id']  = key
            hit['project_name'] = project_name
            db.hits.save(hit)

if __name__ == '__main__':
    pass



