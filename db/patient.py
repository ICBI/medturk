#!/usr/bin/env python

'''
    Author:       Robert M. Johnson <rmj49@georgetown.edu>
    Organization: ICBI, Georgetown University <http://icbi.georgetown.edu>

'''


from medturk.db import db


def save(patient):
    '''
        Parameters:
            [1] patient (dict)
                    The patient's data. Includes all records and optional gender, dob, name, etc.
    '''
    db.patients.save(patient)





if __name__ == '__main__':
    pass



