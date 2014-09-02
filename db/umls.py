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
'''
    
    Description:  This file gets data out of the local UMLS database
    
                  Useful references:
                  http://www.nlm.nih.gov/research/umls/implementation_resources/query_diagrams/er1.html
                  http://dev.mysql.com/doc/connector-python/en/index.html
'''

import mysql.connector

conn = mysql.connector.connect(user='root', database='umls')

def get_name_from_cui(cui):
    name = None
    cursor = conn.cursor(buffered=True)
    query = ("SELECT str FROM MRCONSO WHERE cui = '" + cui + "' AND stt = 'PF' AND ts = 'P' AND lat = 'ENG'")
    
    cursor.execute(query)
    
    for result in cursor:
        name = result[0]
        break
  
    return name


if __name__ == '__main__':
    pass




