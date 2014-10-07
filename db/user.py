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
import md5


def hash_pass(password, secret_key):
    """
    Return the md5 hash of the password+salt
    """
    salted_password = password + secret_key
    return md5.new(salted_password).hexdigest()


def clear():
    db.users.drop()

def get(_id):
    return db.users.find_one({'id' : _id})

def update_password(_id, _password):
    db.users.update({'id' : _id}, {'$set' : {'password' : _password}})

def update_is_authenticated(_id, _is_authenticated):
    db.users.update({'id' : _id}, {'$set' : {'authenticated' : _is_authenticated}})

def add(email, password, secret_key, authenticated = False):

    db.users.insert({'id' : email, 'password' : hash_pass(password, secret_key), 'authenticated' : authenticated})
    return True


