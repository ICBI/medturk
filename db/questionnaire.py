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







'''
    CREATE operations
'''
def create_questionnaire():
    return db.questionnaires.insert({'name'         : 'My New Questionnaire', 
                                     'description'  : 'TODO', 
                                     'questions'    : [], 
                                     'tags'         : []})

def create_uploaded_questionnaire(_questionnaire):
    db.questionnaires.insert(_questionnaire)

def create_question(_questionnaire_id):
    _id = ObjectId()
    question = {'_id' : _id, 'question' : '', 'type' : 'radio', 'frequency' : 'once', 'tag_ids' : [], 'choices' : [], 'triggers' : []}
    _questionnaire = get_questionnaire(_questionnaire_id)
    _questionnaire['questions'].append(question)
    db.questionnaires.save(_questionnaire)
    return question

def create_question_choice(_questionnaire_id, _question_id, _choice_name):

    _id = ObjectId()
    choice = {'_id' : _id, 'name' : _choice_name}

    _questionnaire = get_questionnaire(_questionnaire_id)
    _question_id = ObjectId(_question_id)
    for question in _questionnaire['questions']:
        if _question_id == question['_id']:
            question['choices'].append(choice)
            db.questionnaires.save(_questionnaire)
            break

    return choice


def create_question_trigger(_questionnaire_id, _question_id, _trigger_name, _trigger_case_sensitive):

    _id = ObjectId()
    trigger = {'_id' : _id, 'name' : _trigger_name, 'case_sensitive' : bool(_trigger_case_sensitive)}

    _questionnaire = get_questionnaire(_questionnaire_id)
    _question_id = ObjectId(_question_id)
    for question in _questionnaire['questions']:
        if _question_id == question['_id']:
            question['triggers'].append(trigger)
            db.questionnaires.save(_questionnaire)
            break

    return trigger

def create_question_tag(_questionnaire_id, _question_id, _tag_id):
    _questionnaire = get_questionnaire(_questionnaire_id)
    _question_id = ObjectId(_question_id)
    for question in _questionnaire['questions']:
        if _question_id == question['_id']:
            question['tag_ids'].append(_tag_id)
            db.questionnaires.save(_questionnaire)
            break

def create_questionnaire_tag(_questionnaire_id, _tag_name):
    _id = ObjectId()
    tag = {'_id' : _id, 'name' : _tag_name}
    _questionnaire = get_questionnaire(_questionnaire_id)
    _questionnaire['tags'].append(tag)
    db.questionnaires.save(_questionnaire)
    return tag












'''
    READ operations
'''
def get_questionnaires():
    return [m for m in db.questionnaires.find()]


def get_questionnaire(_questionnaire_id):
    return db.questionnaires.find_one({'_id' : ObjectId(_questionnaire_id)})











'''
    UPDATE operations
'''
def update_questionnaire_name(_questionnaire_id, _questionnaire_name):
    _questionnaire = get_questionnaire(_questionnaire_id)
    _questionnaire['name'] = _questionnaire_name
    db.questionnaires.save(_questionnaire)

def update_questionnaire_description(_questionnaire_id, _questionnaire_description):
    _questionnaire = get_questionnaire(_questionnaire_id)
    _questionnaire['description'] = _questionnaire_description
    db.questionnaires.save(_questionnaire)


def update_question_type(_questionnaire_id, _question_id, _question_type):
    _questionnaire = get_questionnaire(_questionnaire_id)
    _question_id = ObjectId(_question_id)
    for question in _questionnaire['questions']:
        if _question_id == question['_id']:
            question['type'] = _question_type
            db.questionnaires.save(_questionnaire)
            break


def update_question_frequency(_questionnaire_id, _question_id, _question_frequency):
    _questionnaire = get_questionnaire(_questionnaire_id)
    _question_id = ObjectId(_question_id)
    for question in _questionnaire['questions']:
        if _question_id == question['_id']:
            question['frequency'] = _question_frequency
            db.questionnaires.save(_questionnaire)
            break


def update_question_choice_name(_questionnaire_id, _question_id, _choice_id, _choice_name):
    _questionnaire = get_questionnaire(_questionnaire_id)

    # Convert to BSON
    _question_id = ObjectId(_question_id)
    _choice_id = ObjectId(_choice_id)

    for question in _questionnaire['questions']:
        if _question_id == question['_id']:
            for choice in question['choices']:
                if _choice_id == choice['_id']:
                    choice['name'] = _choice_name
                    db.questionnaires.save(_questionnaire)
                    break
            break



def update_question_text(_questionnaire_id, _question_id, _question_text):
    _questionnaire = get_questionnaire(_questionnaire_id)
    _question_id = ObjectId(_question_id)
    for question in _questionnaire['questions']:
        if _question_id == question['_id']:
            question['question'] = _question_text
            db.questionnaires.save(_questionnaire)
            break

def update_questionnaire_tag_name(_questionnaire_id, _tag_id, _tag_name):
    _questionnaire = get_questionnaire(_questionnaire_id)
    _tag_id = ObjectId(_tag_id)
    for tag in _questionnaire['tags']:
        if _tag_id == tag['_id']:
            tag['name'] = _tag_name
            db.questionnaires.save(_questionnaire)
            break









'''
    DELETE operations
'''
def delete_questionnaire_tag(_questionnaire_id, _tag_id):
    
    _questionnaire = get_questionnaire(_questionnaire_id)

    index = -1
    _tag_id = ObjectId(_tag_id)

    for i,tag in enumerate(_questionnaire['tags']):
        if tag['_id'] == _tag_id:
            index = i
            break
    
    if index > -1:
        del _questionnaire['tags'][index]
        db.questionnaires.save(_questionnaire)


def delete_question_tag(_questionnaire_id, _question_id, _tag_id):
    
    _questionnaire = get_questionnaire(_questionnaire_id)

    index = -1
    _question_id = ObjectId(_question_id)

    for i,question in enumerate(_questionnaire['questions']):
        if question['_id'] == _question_id:
            for j,tag_id in enumerate(_questionnaire['questions'][i]['tag_ids']):
                if tag_id == _tag_id:
                    del _questionnaire['questions'][i]['tag_ids'][j]
                    db.questionnaires.save(_questionnaire)
                    return


def delete_question_trigger(_questionnaire_id, _question_id, _trigger_id):
    
    _questionnaire = get_questionnaire(_questionnaire_id)

    index = -1
    _question_id  = ObjectId(_question_id)
    _trigger_id   = ObjectId(_trigger_id)

    for i,question in enumerate(_questionnaire['questions']):
        if question['_id'] == _question_id:
            for j,trigger in enumerate(_questionnaire['questions'][i]['triggers']):
                if trigger['_id'] == _trigger_id:
                    del _questionnaire['questions'][i]['triggers'][j]
                    db.questionnaires.save(_questionnaire)
                    return

def delete_question_choice(_questionnaire_id, question_id, choice_id):
    
    _questionnaire = get_questionnaire(_questionnaire_id)

    index = -1
    question_id = ObjectId(question_id)
    choice_id   = ObjectId(choice_id)

    for i,question in enumerate(_questionnaire['questions']):
        if question['_id'] == question_id:
            for j,choice in enumerate(_questionnaire['questions'][i]['choices']):
                if choice['_id'] == choice_id:
                    del _questionnaire['questions'][i]['choices'][j]
                    db.questionnaires.save(_questionnaire)
                    return

def delete_question(_questionnaire_id, _question_id):
    
    _questionnaire = get_questionnaire(_questionnaire_id)

    index = -1
    _question_id = ObjectId(_question_id)

    for i,question in enumerate(_questionnaire['questions']):
        if question['_id'] == _question_id:
            index = i
            break
    
    if index > -1:
        del _questionnaire['questions'][index]
        db.questionnaires.save(_questionnaire)



def delete_questionnaire(_questionnaire_id):
    db.questionnaires.remove({'_id' : ObjectId(_questionnaire_id)})







