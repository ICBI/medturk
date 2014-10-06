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
import md5
from flask import request, abort
from flask.ext.login import (UserMixin, login_user, logout_user, login_required, current_user)
from medturk.api import app, login_manager, mimerender, render_xml, render_json, render_html, render_txt
from itsdangerous import URLSafeTimedSerializer

'''
    @login_required decorators check to see if current_user.is_authenticated():
'''


def hash_pass(password):
    """
    Return the md5 hash of the password+salt
    """
    salted_password = password + app.secret_key
    return md5.new(salted_password).hexdigest()

def create_users():

    db.users.drop()
    db.users.insert({'id' : 'rmj49@georgetown.edu', 'name' : 'matt', 'password' : hash_pass('password'), 'authenticated' : False})
    db.users.insert({'id' : 'amcdevitt14@gmail.com', 'name' : 'anna', 'password' : hash_pass('password'), 'authenticated' : False})


login_serializer = URLSafeTimedSerializer(app.secret_key)

# The class that models a user
class User(UserMixin):
    def __init__(self, _id, _password, _authenticated):
        self.id            = _id
        self.password      = _password
        self.authenticated = _authenticated

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def is_authenticated(self):
        return self.authenticated

    def get_id(self):
        return self.id


    def get_auth_token(self):

        data = [str(self.id), self.password]
        return login_serializer.dumps(data)



class UserManager():
    '''
        Manages users from database. Converts users on-the-fly to a 'User' object as required
        by Flask-Login
    '''
    def __init__(self):
        self._users = dict()

        create_users()

    def meets_credentials(self, _id, _password):
        user = db.users.find_one({'id' : _id})
        return (user and hash_pass(_password) == user['password'])


    def set_password(self, _id, _password):

        password_changed = False

        # Get the user from the database
        user = db.users.find_one({'id' : _id})

        # We can only authenticate this user, if he/she exists
        if user != None:
            password_changed = True

            # Save back to database
            db.users.update({'id' : _id}, {'$set' : {'password' : _password}})

        return password_changed


    def set_authenticated(self, _id, is_authenticated):

            is_authenticated = False

            # Get the user from the database
            user = db.users.find_one({'id' : _id})

            # We can only authenticate this user, if he/she exists
            if user != None:
                is_authenticated = True

                # Save back to database
                db.users.update({'id' : _id}, {'$set' : {'authenticated' : is_authenticated}})

            return is_authenticated

    def get_settings(self, _id):

        #Get the user from the database
        user = db.users.find_one({'id' : _id})
        
        if user != None:
            return {'name' : user['name']}

    def get(self, _id):

        #Get the user from the database
        user = db.users.find_one({'id' : _id})

        # We can only create and return a User object if he/she exists
        if user != None:
            return User(user['id'], user['password'], user['authenticated'])

        # Flask-Login specifies to return None if User does not exist
        return None

user_manager = UserManager()


@login_manager.user_loader
def load_user(_id):
    #For every Flask request, we reconstruct the User object
    return user_manager.get(_id)


@login_manager.token_loader
def load_token(token):
    """
    Flask-Login token_loader callback. 
    The token_loader function asks this function to take the token that was 
    stored on the users computer process it to check if its valid and then 
    return a User Object if its valid or None if its not valid.
    """

    #The Token itself was generated by User.get_auth_token.  So it is up to 
    #us to known the format of the token data itself.  

    #The Token was encrypted using itsdangerous.URLSafeTimedSerializer which 
    #allows us to have a max_age on the token itself.  When the cookie is stored
    #on the users computer it also has a exipry date, but could be changed by
    #the user, so this feature allows us to enforce the exipry date of the token
    #server side and not rely on the users cookie to exipre. 
    max_age = app.config["REMEMBER_COOKIE_DURATION"].total_seconds()

    #Decrypt the Security Token, data = [username, hashpass]
    data = login_serializer.loads(token, max_age=max_age)

    #Find the User
    user = user_manager.get(data[0])

    #Check Password and return user or None
    if user and data[1] == user.password:
        return user
    return None


@app.route("/user/login", methods=["POST"])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
def user_login():

    _id       = request.form.get('id')
    _password = request.form.get('password')
    
    if _id == None or len(_id) == 0:
        abort(415, 'User Id is missing')

    if _password == None or len(_password) == 0:
        abort(415, 'Password is missing')
  
    user = user_manager.get(_id)

    if user_manager.meets_credentials(_id, _password):

        # By setting "remember = True", 
        # this lets Flask-Login save a cookie to the user's computer
        login_user(user, remember=True)

        if user_manager.set_authenticated(current_user.get_id(), True):
            return {'success' : True}

    return {'success' : False} 





@app.route("/user/password", methods=["POST"])
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def user_password():

    _current_password = request.form.get('current_password')
    _new_password = request.form.get('new_password')


    _id = current_user.get_id()
    if user_manager.meets_credentials(_id, _current_password):

        _new_password = hash_pass(_new_password)
        if user_manager.set_password(_id, _new_password):
            return {'success' : True}



    return {'success' : False}





@app.route("/user/logout")
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def user_logout():
    user_manager.set_authenticated(current_user.get_id(), False)
    logout_user()
    return {'success' : True}




@app.route("/user/settings")
@mimerender(
            default = 'json',
            html = render_html,
            xml  = render_xml,
            json = render_json,
            txt  = render_txt
            )
@login_required
def user_settings():
    return user_manager.get_settings(current_user.get_id())









