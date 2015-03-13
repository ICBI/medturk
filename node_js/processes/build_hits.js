require('../db/database.js').connect()

var dataset        = require('../business/dataset.js')
var patient        = require('../business/patient.js')
var record         = require('../business/record.js')
var project        = require('../business/project.js')
var questionnaire  = require('../business/questionnaire.js')
var hit  		   = require('../business/hit.js')
var phrase  	   = require('../business/phrase.js')


var g_project         = undefined
var g_patient         = undefined
var g_questionnaire   = undefined
var g_flank_size      = 200
var g_project_id      = process.argv[2]
var g_hits_inserted   = 0
var g_patient_cursor  = undefined
var g_hits 			  = []
var g_phrases 		  = []
var g_hit_count       = 0
var g_phrase_flank_size = 3 // was 8


var g_num_hits_processed      = 0
var g_num_hits_to_process     = undefined
var g_num_patients_processed  = 0
var g_num_patients_to_process = undefined
var g_num_phrases_processed   = 0
var g_num_phrases_to_process  = undefined

// Holds common phrases found in the questions
var g_question_phrases = {}


function send_update_status(_json) {
	process.stdout.write(JSON.stringify(_json))
}



// Original function written by 
// @Nasser: See http://stackoverflow.com/questions/18677834/javascript-find-all-occurrences-of-word-in-text-document
// I modified it a bit
function get_matches(needle, haystack, case_sensitive) {
    var myRe      = new RegExp("\\b" + needle + "\\b((?!\\W(?=\\w))|(?=\\s))", "g" + (case_sensitive ? "" : "i"))
    var myArray   = []
    var myResult  = []
    while ((myArray = myRe.exec(haystack)) !== null) {
        myResult.push(myArray.index)
    }

    return myResult
}


function get_phrases_by_annotation(_annotations, _note) {
    
	var _phrases_by_annotation = []
	var lb = []
	var rb = []

	function get_left_indices(_annotation) {

		var indices = []

		var i = _annotation.abs_beg

		while(indices.length < g_phrase_flank_size) {
			i = _note.lastIndexOf(' ', i-1)

			if (i == -1) {
                indices.push(0)
				break;
			}

			indices.push(i)
		}

		return indices
	}

	function get_right_indices(_annotation) {
		var indices = []
		var i = _annotation.abs_beg + _annotation.trigger.length

		while(indices.length < g_phrase_flank_size) {
			i = _note.indexOf(' ', i+1)
			if (i == -1) {
				indices.push(_note.length)
				break;
			}
			indices.push(i)
		}

		return indices
	}


	for (var i = 0; i < _annotations.length; i++) {

		var _phrases = []
		var a = _annotations[i]

		var lb = get_left_indices(a)        
		var rb = get_right_indices(a)

		for (var l = 0; l < lb.length; l++) {
			for (var r = 0; r < rb.length; r++) {
				if (  (lb[l] == a.abs_beg) && (rb[r] == (a.abs_end + a.trigger.length))  ) {
					// Skip. This simply carves out the trigger
				}
				else {
					_phrases.push(_note.substr(lb[l], rb[r] - lb[l]).trim())
				}
			}
		}


		_phrases_by_annotation.push(_phrases)
	}

	return _phrases_by_annotation
}




function get_annotations(_trigger, _case_sensitive, _note) {
	
	var _annotations = []
	var _kwic = ''
	var _indices = get_matches(_trigger, _note, _case_sensitive)

	if (_indices.length == 0) {
		return _annotations
	}
	

	for (var i = 0; i < _indices.length; i++) {
		var _abs_beg = _indices[i]

		var _kwic_beg = _abs_beg - g_flank_size
		if (_kwic_beg < 0) {
			_kwic_beg = 0
		}

		var _kwic     = _note.substr(_kwic_beg, 2*g_flank_size + _trigger.length)
		var _rel_beg  = _abs_beg - _kwic_beg

		_annotations.push({ 
							'abs_beg' : _abs_beg,  
					        'rel_beg' : _rel_beg,
					        'trigger' : _trigger,
					        'kwic'    : _kwic
		})
	}

	return _annotations
}

function exit() {
	project.update_status(g_project_id, 'Active', update_project_callback, update_project_error_callback)
}


function insert_phrase_callback(_hit, _passthrough) {
	g_num_phrases_processed += 1
	
	if (g_num_phrases_processed == g_num_phrases_to_process) {
		exit()
	}
	else {
		phrase.insert(g_phrases[g_num_phrases_processed], insert_phrase_callback, insert_phrase_error_callback)
	}
}


function insert_phrase_error_callback(_err, _passthrough) {
	g_num_phrases_processed += 1

	if (g_num_phrases_processed == g_num_phrases_to_process) {
		exit()
	}
	else {
		phrase.insert(g_phrases[g_num_phrases_processed], insert_phrase_callback, insert_phrase_error_callback)
	}
}



function save_phrases() {

	g_phrases = []

	// Prepare documents
	for (var _id in g_question_phrases) {
		for (var _phrase in g_question_phrases[_id]) {
			var count        = g_question_phrases[_id][_phrase].count
			var phrase_id    = g_question_phrases[_id][_phrase]._id
			var num_patients = 0

			for (key in g_question_phrases[_id][_phrase].patients) {
        		num_patients += 1
    		}


			var _doc = {'_id' : phrase_id, 'count' : count, 'num_patients' : num_patients, 'phrase' : _phrase, 'question_id' : _id, 'project_id' : g_project_id}
			g_phrases.push(_doc)
		}
	}

	g_num_phrases_processed  = 0
	g_num_phrases_to_process = g_phrases.length

	if (g_num_phrases_to_process == 0) {
		exit()
	}
	else {
		phrase.insert(g_phrases[g_num_phrases_processed], insert_phrase_callback, insert_phrase_error_callback)
	}
}




function update_project_callback(_passthrough) {
	send_update_status({'status' : 'Active', 'num_answers' : 0, 'num_hits' : g_hit_count})
}


function update_project_error_callback(err, _passthrough) {
	send_update_status({'status' : 'Active', 'num_answers' : 0, 'num_hits' : g_hit_count})
}


function insert_hit_callback(_hit, _passthrough) {
	g_num_hits_processed += 1
	g_hit_count += 1
	
	if (g_num_hits_processed == g_num_hits_to_process) {
		// Finished inserting hits
		// Move to next patient
		process_patient()
	}
	else {
		hit.insert(g_hits[g_num_hits_processed], insert_hit_callback, insert_hit_error_callback)
	}
}


function insert_hit_error_callback(_err, _passthrough) {
	g_num_hits_processed += 1

	if (g_num_hits_processed == g_num_hits_to_process) {
		// Finished inserting hits
		// Move to next patient
		process_patient()
	}
	else {
		hit.insert(g_hits[g_num_hits_processed], insert_hit_callback, insert_hit_error_callback)
	}
}


function get_records_callback(_records, _passthrough) {


	g_hits = []

	// For each question
	for (var i = 0; i < g_questionnaire.questions.length; i++) {

		// The question
		var _question = g_questionnaire.questions[i]

		// The annotations for this potential hit
		var annotations = []

		for (var r = 0; r < _records.length; r++) {

			var _record = _records[r]

		   for(var j = 0; j < _question.triggers.length; j++) {

		   		// The trigger
				var _trigger = _question.triggers[j]
				
				var _annotations = get_annotations(_trigger.name, _trigger.case_sensitive, _record.note)

				// This is guaranteed to have the same length as the first argument
				var _phrases_by_annotation = get_phrases_by_annotation(_annotations, _record.note)

				// Phrase ids we will save for this particular annotation
				var _phrase_ids_by_annotation = []


				// Loop over every phrase
				for (var l = 0; l < _phrases_by_annotation.length; l++) {

					var _phrases = _phrases_by_annotation[l]
					var _phrase_ids = []

					for (var k = 0; k < _phrases.length; k++) {

			   			// Have we seen this phrase before?
			   			if (_phrases[k] in g_question_phrases[_question._id]) {

			   				// Associate this id with the annotation
			   				_phrase_ids.push(g_question_phrases[_question._id][_phrases[k]]._id)

			   				 // Increase the count for the number of times we've seen this phrase in this particular question
			   				 g_question_phrases[_question._id][_phrases[k]].count += 1

			   				 // Has this patient been associated with this phrase id before?
			   				 if (g_patient._id in g_question_phrases[_question._id][_phrases[k]].patients) {
			   				 	// Do nothing
			   				 }
			   				 else {
			   				 	g_question_phrases[_question._id][_phrases[k]].patients[g_patient._id] = 1
			   				 }
			   			}
			   			else {
			   				// This is the first time we've observed this phrase
			   				g_num_phrases_to_process += 1
			   				var x = {}
			   				x[g_patient._id] = 1
			   				
			   				// Generate a phrase id
			   				var _phrase_id = phrase.generate_id()

			   				// Associate this id with the annotation
			   				_phrase_ids.push(_phrase_id)
			   				
			   				g_question_phrases[_question._id][_phrases[k]] = {'count' : 1, 'patients' : x, '_id' : _phrase_id}
			   			}
		   			}


		   			_phrase_ids_by_annotation.push(_phrase_ids)
				}


				// Add extra info to these annotation
				for (var k = 0; k < _annotations.length; k++) {
					_annotations[k]._id        = hit.generate_id()
					_annotations[k].record_id  = _record._id
					_annotations[k].date       = _record.date
					_annotations[k].phrase_ids =  _phrase_ids_by_annotation[k]
					annotations.push(_annotations[k])
		   		}
		   	}
		}

		if (annotations.length > 0) {
			var _hit = {
							'patient_id'  : g_patient._id,
							'dataset_id'  : g_project.dataset_id,
							'project_id'  : g_project._id,
							'question_id' : _question._id,
							'tag_ids'     : _question.tag_ids,
							'annotations' : annotations
   			}

			g_hits.push(_hit)
		}
	}


	g_num_hits_to_process = g_hits.length
	g_num_hits_processed = 0

	if (g_num_hits_to_process == 0) {
		process_patient()
	}
	else {
		hit.insert(g_hits[g_num_hits_processed], insert_hit_callback, insert_hit_error_callback)
	}
}



function get_records_error_callback(_err, _passthrough) {
	
}


function process_patient() {
	g_num_patients_processed += 1

	if (g_num_patients_processed == g_num_patients_to_process) {
		// Now, save all of the phrases found....

		send_update_status({'status' : 'Building aggregate questions...', 'num_hits' : g_hit_count, 'num_answers' : 0})
		save_phrases()
	}
	else {
		g_patient = g_patients[g_num_patients_processed]

		var progress = Math.round(  (g_num_patients_processed / g_num_patients_to_process) * 100.0 )
		var status   =  'Building (' + progress + '% (' + g_num_patients_processed + '/' + g_num_patients_to_process + ') complete)'
		var completion = '0% (0/'+g_hit_count+')'

		send_update_status({'status' : status, 'num_hits' : g_hit_count, 'num_answers' : 0})

		record.get_records_by_dataset_id_and_patient_id(g_project.dataset_id, g_patient._id, get_records_callback, get_records_error_callback)
	}
}



function get_patients_callback(_patients, _passthrough) {
	g_patients = _patients
	g_num_patients_to_process = _patients.length
	g_num_patients_processed = -1
	process_patient()
}

function get_patients_error_callback(_err, _passthrough) {
}


function get_questionnaire_callback(_questionnaire, _passthrough) {
	g_questionnaire = _questionnaire

	for (var i = 0; i < g_questionnaire.questions.length; i++) {
		g_question_phrases[g_questionnaire.questions[i]._id] = {}
	}

	patient.get_all_by_dataset_id(g_project.dataset_id, get_patients_callback, get_patients_error_callback)
}

function get_questionnaire_error_callback(err, _passthrough) {
}

function get_project_callback(_project, _passthrough) {
	g_project = _project
	questionnaire.get_by_id(g_project.questionnaire_id, get_questionnaire_callback, get_questionnaire_error_callback)
}

function get_project_error_callback(_err, _passthrough) {
	
}

send_update_status({'status' : 'Building'})

project.get_by_project_id(g_project_id, get_project_callback, get_project_error_callback)	
