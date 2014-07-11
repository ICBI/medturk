#!/usr/bin/env python

'''
    Author:       Robert M. Johnson <rmj49@georgetown.edu>
    Organization: ICBI, Georgetown University <http://icbi.georgetown.edu>

'''

from medturk.db import db


def save(record):
    '''
        Parameters:
            [1] record (dict)
                    A patient's medical record
    '''
    db.records.save(record)


def get_record(record_id):
    return db.records.find_one({'id' : record_id})


if __name__ == '__main__':
    pass



