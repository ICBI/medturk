#!/usr/bin/env python

'''
    Author:       Robert M. Johnson <rmj49@georgetown.edu>
    Organization: ICBI, Georgetown University <http://icbi.georgetown.edu>

'''

from medturk.db import db


def save(annotation):
    db.annotations.save(annotation)

if __name__ == '__main__':
    pass



