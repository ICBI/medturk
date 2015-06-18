'''
	Author: Robert M. Johnson <rmj49@georgetown.edu>

	This script generates fake clinical notes for medTurk
'''

# Used to shuffle lists
from random import shuffle

# Used to generate sentences
from random import random

# Used to generate ages, dates, etc.
from random import randint

# Used to to generate random patients' names
from nltk.corpus import names

# Used to convert Python Dict to JSON
import json

# Used for record date generation
from datetime import datetime
from datetime import timedelta

# Number of patients
N = 100

# Average number of records per patient
mean_records = 8

# Where to save patient files
medturk_directory = '/Users/matt/Desktop/Datasets/pediatric_cancer_dataset/'


def save_as_json_file(_json):
    with open(medturk_directory + _json['id'] + '.json', 'w') as json_file:
        json_file.write(json.dumps(_json, indent=4, sort_keys=True))


class Cancer():
	'''
		Used to generate a fake cancer diagnosis
	'''

	@staticmethod
	def generate_cancer():

		r = random()

		if r < 0.33:
			return Leukemia()
		elif r < 0.66:
			return ALL()
		else:
			return Neuroblastoma()

	def get_cancer(self):
		raise NotImplementedError

	def get_late_effect(self):
		raise NotImplementedError


class Leukemia(Cancer):
	
	_cancer = ['leukemia', 'Leukemia', 'cancer of the blood']
	_late_effects = [['heart problems', 'chronic heart failure'], ['secondary cancer', 'a second cancer']]

	def __init__(self):
		self._late_effect = Leukemia._late_effects[randint(0,len(Leukemia._late_effects) - 1)]

	def get_cancer(self):
		return Leukemia._cancer[randint(0,len(Leukemia._cancer) - 1)]

	def get_description(self):
		return 'Leukemia is cancer of the blood and bone marrow (the soft material in the center of most bones).'

	def get_late_effect(self):
		return self._late_effect[randint(0,len(self._late_effect) - 1)]



class ALL(Cancer):
	
	_cancer       = ['ALL', 'acute lymphoblastic leukemia']
	_late_effects = [['heart problems', 'chronic heart failure'], ['secondary cancer', 'a second cancer']]

	def __init__(self):
		self._late_effect = ALL._late_effects[randint(0,len(ALL._late_effects) - 1)]

	def get_cancer(self):
		return ALL._cancer[randint(0,len(ALL._cancer) - 1)]

	def get_description(self):
		return 'Childhood acute lymphoblastic leukemia (also called ALL or acute lymphocytic leukemia) is a cancer of the blood and bone marrow. This type of cancer usually gets worse quickly if it is not treated.'

	def get_late_effect(self):
		return self._late_effect[randint(0,len(self._late_effect) - 1)]


class Neuroblastoma(Cancer):
	
	_cancer       = ['Neuroblastoma', 'neuroblastoma', 'solid tumor in the nerve cells']
	_late_effects = [['heart problems', 'chronic heart failure'], ['secondary cancer', 'a second cancer']]

	def __init__(self):
		self._late_effect = Neuroblastoma._late_effects[randint(0,len(Neuroblastoma._late_effects) - 1)]

	def get_cancer(self):
		return Neuroblastoma._cancer[randint(0,len(Neuroblastoma._cancer) - 1)]

	def get_description(self):
		return 'Neuroblastoma is a solid cancerous tumor that begins in the nerve cells outside the brain of infants and young children. It can start in the nerve tissue near the spine in the neck, chest, abdomen, or pelvis, but it most often begins in the adrenal glands. The adrenal glands are located on top of both kidneys and make hormones that help control body functions, such as heart rate and blood pressure.'

	def get_late_effect(self):
		return self._late_effect[randint(0,len(self._late_effect) - 1)]



class Patient():
	'''
		Used to generate a fake patient
	'''

	# Static variables used across patients
	_id = 0
	_record_id = 0
	_ethnicities = [['African-American', 'black', 'african american'], 
					['White', 'white', 'Caucasian', 'caucasian'], 
					['Hispanic', 'hispanic', 'latino'],
					['chinese', 'Chinese', 'from china']]

	_names       = [(name, 'male') for name in names.words('male.txt')] + [(name, 'female') for name in names.words('female.txt')]
	shuffle(_names)

	def __init__(self):
		Patient._id += 1
		self._id                   = str(Patient._id)
		self._age                  = randint(1,15)
		self._name, self._gender   = Patient._names[randint(0,len(Patient._names) - 1)]
		self._ethnicity            = Patient._ethnicities[randint(0,len(Patient._ethnicities) - 1)]
		self._pronoun			   = 'he' if self.is_male() else 'she'
		self._cancer			   = Cancer.generate_cancer()
		self._has_school_problems  = True if random() < 0.5 else False
		self._has_anxiety          = True if random() < 0.5 else False
		self._father_diagnosed     = True if random() < 0.1 else False
		self._mother_diagnosed     = True if random() < 0.1 else False
		self._record_date          = datetime(randint(1995, 2012), randint(1, 12), randint(1, 28))

	def get_id(self):
		return self._id

	def get_ethnicity(self):
		return self._ethnicity[randint(0,len(self._ethnicity) - 1)]

	def get_name(self):
		return self._name

	def get_age(self):
		return self._age

	def get_gender(self):
		return self._gender

	def is_male(self):
		return self.get_gender() == 'male'

	def get_pronoun(self):
		return self._pronoun

	def get_diagnosis_sentence(self):
		_list = [self.get_name(), 
				 ' is a ', str(self._age), 
				 '-year-old ', self.get_ethnicity(), 
				 ' ', self.get_gender(),
				 ' diagnosed with ', 
				 self._cancer.get_cancer(),
				 '. ']

		return ''.join(_list)


	def get_adverse_event_sentence(self):
		_list = [self.get_pronoun().title(), 
				 ' has ', 
				 self._cancer.get_late_effect(),
				 '. ']

		return ''.join(_list)

	def generate_note(self):
		sentences = []

		if random() < 0.5:
			sentences.append(self.get_diagnosis_sentence())

			if self._mother_diagnosed:
				sentences.append('Patient\'s mother was also diagnosed with ' + self._cancer.get_cancer())

			if self._father_diagnosed:
				sentences.append('Patient\'s father was also diagnosed with ' + self._cancer.get_cancer())

			if random() < 0.5:
				sentences.append(self._cancer.get_description())

		if random() < 0.5:
			sentences.append(self.get_adverse_event_sentence())

		if self._has_anxiety:
			if random() < 0.5:
				sentences.append(self.get_pronoun().title() + ' reports suffering from major anxiety. ' + self.get_name()  + ' reports sleeping at night is difficult.')

		if self._has_school_problems:
			if random() < 0.5:
				sentences.append(self.get_pronoun().title() + ' has had problems in school. ')
		
		# Ensures note is non-empty
		if len(sentences) == 0:
			sentences.append(self.get_diagnosis_sentence())

		return ''.join(sentences)

	def generate_record(self):
		Patient._record_id += 1
		self._record_date += timedelta(days=randint(1,30))

		_record = {}
		_record['id']   = Patient._record_id
		_record['note'] = self.generate_note()
		_record['date'] = self._record_date.strftime("%Y-%m-%d")
		return _record



for i in range(N):
	_json = {}
	p = Patient()

	_json['id']      = p.get_id()
	_json['records'] = []

	for x in range(mean_records):
		_json['records'].append(p.generate_record())
	
	save_as_json_file(_json)




