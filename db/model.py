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

def save(model):
    '''
        Parameters:
            [1] model (dict)
                    The research model that encapsulates questions, answers, triggers, etc.
    '''
    db.models.save(model)


def create():
    return db.models.insert({'name'        : '[Insert name here]', 
                            'description'  : '[Insert description here]', 
                            'questions'    : [], 
                            'tags'         : []})

def create_question(model_id):
    _id = ObjectId()
    question = {'_id' : _id, 'question' : '[Insert question here]', 'type' : 'radio', 'tag_ids' : [], 'choices' : [], 'triggers' : []}
    m = get(model_id)
    m['questions'].append(question)
    save(m)
    return question


def save_question_type(model_id, question_id, question_type):
    m = get(model_id)
    question_id = ObjectId(question_id)
    for question in m['questions']:
        if question_id == question['_id']:
            question['type'] = question_type
            save(m)
            break


def save_question_text(model_id, question_id, question_text):
    m = get(model_id)
    question_id = ObjectId(question_id)
    for question in m['questions']:
        if question_id == question['_id']:
            question['question'] = question_text
            save(m)
            break


def save_tag(model_id, tag_id, tag_name):
    m = get(model_id)
    tag_id = ObjectId(tag_id)
    for tag in m['tags']:
        if tag_id == tag['_id']:
            tag['name'] = tag_name
            save(m)
            break




def create_question_choice(model_id, question_id, choice_name):

    _id = ObjectId()
    choice = {'_id' : _id, 'name' : choice_name}

    m = get(model_id)
    question_id = ObjectId(question_id)
    for question in m['questions']:
        if question_id == question['_id']:
            question['choices'].append(choice)
            save(m)
            break

    return choice



def create_question_trigger(model_id, question_id, trigger_name, trigger_case_sensitive):

    _id = ObjectId()
    trigger = {'_id' : _id, 'name' : trigger_name, 'case_sensitive' : bool(trigger_case_sensitive)}

    m = get(model_id)
    question_id = ObjectId(question_id)
    for question in m['questions']:
        if question_id == question['_id']:
            question['triggers'].append(trigger)
            save(m)
            break

    return trigger




def create_question_tag(model_id, question_id, tag_id):
    m = get(model_id)
    question_id = ObjectId(question_id)
    for question in m['questions']:
        if question_id == question['_id']:
            question['tag_ids'].append(tag_id)
            save(m)
            break




def create_tag(model_id, tag_name):
    _id = ObjectId()
    tag = {'_id' : _id, 'name' : tag_name}
    m = get(model_id)
    m['tags'].append({'_id' : _id, 'name' : tag_name})
    save(m)
    return tag


def remove_tag(model_id, tag_id):
    
    m = get(model_id)

    index = -1
    tag_id = ObjectId(tag_id)

    for i,tag in enumerate(m['tags']):
        if tag['_id'] == tag_id:
            index = i
            break
    
    if index > -1:
        del m['tags'][index]
        save(m)




def remove_question_tag(model_id, question_id, _tag_id):
    
    m = get(model_id)

    index = -1
    question_id = ObjectId(question_id)

    for i,question in enumerate(m['questions']):
        if question['_id'] == question_id:
            for j,tag_id in enumerate(m['questions'][i]['tag_ids']):
                if tag_id == _tag_id:
                    del m['questions'][i]['tag_ids'][j]
                    save(m)
                    return


def remove_question_trigger(model_id, question_id, trigger_id):
    
    m = get(model_id)

    index = -1
    question_id = ObjectId(question_id)
    trigger_id   = ObjectId(trigger_id)

    for i,question in enumerate(m['questions']):
        if question['_id'] == question_id:
            for j,trigger in enumerate(m['questions'][i]['triggers']):
                if trigger['_id'] == trigger_id:
                    del m['questions'][i]['triggers'][j]
                    save(m)
                    return




def remove_question_choice(model_id, question_id, choice_id):
    
    m = get(model_id)

    index = -1
    question_id = ObjectId(question_id)
    choice_id   = ObjectId(choice_id)

    for i,question in enumerate(m['questions']):
        if question['_id'] == question_id:
            for j,choice in enumerate(m['questions'][i]['choices']):
                if choice['_id'] == choice_id:
                    del m['questions'][i]['choices'][j]
                    save(m)
                    return





def remove_question(model_id, question_id):
    
    m = get(model_id)

    index = -1
    question_id = ObjectId(question_id)

    for i,question in enumerate(m['questions']):
        if question['_id'] == question_id:
            index = i
            break
    
    if index > -1:
        del m['questions'][index]
        save(m)



def delete(_id):
    db.models.remove({'_id' : ObjectId(_id)})


def get_all():
    return [m for m in db.models.find()]


def get(_id):
    return db.models.find_one({'_id' : ObjectId(_id)})

if __name__ == '__main__':
    pass



