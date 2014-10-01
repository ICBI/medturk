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



import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.MIMEImage import MIMEImage



def get(_id):
    return db.projects.find_one({'_id' : ObjectId(_id)})

def get_all():
    return list(db.projects.find())

def add_analyst(project_id, email):

    # Add analyst to project
    p = get(project_id)


    name        = p['name']
    description = p['description']
    p['analysts'] = [email]
    db.projects.save(p)

    # Now email them


    # Create a text/plain message
    me       = 'rjohnson0186@gmail.com'
    you      = email
    username = 'rjohnson0186@gmail.com'
    password = ''


    # Create message container - the correct MIME type is multipart/alternative.
    msgRoot = MIMEMultipart('related')
    msgRoot['Subject'] = 'medTurk'
    msgRoot['From'] = me
    msgRoot['To'] = you


    # Record the MIME types of both parts - text/plain and text/html.
    msgAlternative = MIMEMultipart('alternative')
    msgRoot.attach(msgAlternative)


    msgText = MIMEText('This is the alternative plain text message.')
    msgAlternative.attach(msgText)

    # We reference the image in the IMG SRC attribute by the ID we give it below
    #msgText = MIMEText('<img src="cid:image1" /> You\'ve been invited to participate in the ' + name + ' project on medTurk. ' + description +'. By answering questions, you are helping to drive clinical research forward. <a href="http://127.0.0.1:5000/medturk/login.html">Click here</a> to get started, and good luck!', 'html')
    
    msgText = MIMEText('You\'ve been invited to participate in the ' + name + ' project on medTurk. ' + description +'. By answering questions, you are helping to drive clinical research forward. <a href="http://127.0.0.1:5000/medturk/login.html">Click here</a> to get started, and good luck!', 'html')
    msgAlternative.attach(msgText)

    # This example assumes the image is in the current directory
    #fp = open('/Users/matt/Desktop/medkit.png', 'rb')
    #msgImage = MIMEImage(fp.read())
    #fp.close()

    # Define the image's ID as referenced above
    #msgImage.add_header('Content-ID', '<image1>')
    #msgRoot.attach(msgImage)




    # Send the message via our own SMTP server, but don't include the
    # envelope header.
    server = smtplib.SMTP("smtp.gmail.com:587")
    server.starttls()
    server.login(username, password)
    server.sendmail(me, you, msgRoot.as_string())
    server.quit()




def save(_id, name, description, dataset_id, model_id):
    '''
        Create the project
    '''
    # Insert the project
    db.projects.insert({'_id' : _id, 'name' : name, 'description' : description, 'dataset_id' : ObjectId(dataset_id), 'model_id' : ObjectId(model_id)})


if __name__ == '__main__':
    pass



