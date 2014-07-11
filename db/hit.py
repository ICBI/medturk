#!/usr/bin/env python

'''
    Author:       Robert M. Johnson <rmj49@georgetown.edu>
    Organization: ICBI, Georgetown University <http://icbi.georgetown.edu>

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
    if 'trigger' in node:
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
    
        records_by_cui = [record for record in db.annotations.find({'cui' : hit.get('trigger')})]

        for key, group in itertools.groupby(records_by_cui, lambda item: item['patient_id']):
            hit['annotations'] = [a for a in group]
            hit['patient_id']  = key
            hit['project_name'] = project_name
            db.hits.save(hit)

if __name__ == '__main__':
    pass



