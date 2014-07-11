#!/usr/bin/env python

'''
    Author:       Robert M. Johnson <rmj49@georgetown.edu>
    Organization: ICBI, Georgetown University <http://icbi.georgetown.edu>

'''


from medturk.db import db




def save(name):
    '''
        Create the project
    '''

    # Save information about the project
    db.projects.save({'name' : name})


if __name__ == '__main__':
    pass



