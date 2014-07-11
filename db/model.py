#!/usr/bin/env python

'''
    Author:       Robert M. Johnson <rmj49@georgetown.edu>
    Organization: ICBI, Georgetown University <http://icbi.georgetown.edu>

'''

from medturk.db import db

def save(model):
    '''
        Parameters:
            [1] model (dict)
                    The research model that encapsulates questions, answers, triggers, etc.
    '''
    db.models.save(model)


def get_model():
	return db.models.find_one()

if __name__ == '__main__':
    pass



