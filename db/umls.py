#!/usr/bin/env python

'''
    Author:       Robert M. Johnson <rmj49@georgetown.edu>
    Organization: ICBI, Georgetown University <http://icbi.georgetown.edu>
    
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




