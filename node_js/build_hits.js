var dataset        = require('./dataset.js')
var patient        = require('./patient.js')
var record         = require('./record.js')
var project        = require('./project.js')
var questionnaire  = require('./questionnaire.js')
var hit  		   = require('./hit.js')


var g_project       = undefined
var g_patient       = undefined
var g_questionnaire = undefined
var g_flank_size    = 200
var g_project_id    = process.argv[2]
var g_hits_inserted = 0
var g_patient_cursor = undefined
var g_hits = []
var g_hit_count = 0


// Number of hits we've processed
var g_num_hits_processed = 0

// Number of hits to process
var g_num_hits_to_process = undefined

// Number of patients we've processed
var g_num_patients_processed = 0

// Number of patients to process
var g_num_patients_to_process = undefined


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

				// Get the annotations
				var _annotations = get_annotations(_trigger.name, _trigger.case_sensitive, _record.note)

				// Add extra info to these annotation
				for (var k = 0; k < _annotations.length; k++) {
					_annotations[k]._id       = hit.generate_id()
					_annotations[k].record_id = _record._id
					_annotations[k].date      = _record.date
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
		// Finished!
		project.update_status(g_project_id, 'Active', 0, g_hit_count, update_project_callback, update_project_error_callback)
		
	}
	else {
		g_patient = g_patients[g_num_patients_processed]

		var progress = Math.round(  (g_num_patients_processed / g_num_patients_to_process) * 100.0 )
		var status   =  'Building (' + progress + '% (' + g_num_patients_processed + '/' + g_num_patients_to_process + ') complete)'
		var completion = '0% (0/'+g_hit_count+')'

		send_update_status({'status' : status, 'num_hits' : g_hit_count, 'num_answers' : 0})

		record.get_all_by_dataset_id_and_patient_id(g_project.dataset_id, g_patient._id, get_records_callback, get_records_error_callback)
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
	patient.get_all_by_dataset_id(g_project.dataset_id, get_patients_callback, get_patients_error_callback)
}

function get_questionnaire_error_callback(err, _passthrough) {
	
}

function get_project_callback(_project, _passthrough) {
	g_project = _project
	questionnaire.get(g_project.questionnaire_id, get_questionnaire_callback, get_questionnaire_error_callback)
}

function get_project_error_callback(_err, _passthrough) {
	
}

send_update_status({'status' : 'Building'})
project.get_by_project_id(g_project_id, get_project_callback, get_project_error_callback)	
