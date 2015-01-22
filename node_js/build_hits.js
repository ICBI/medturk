var dataset        = require('./dataset.js')
var patient        = require('./patient.js')
var record         = require('./record.js')
var project        = require('./project.js')
var questionnaire  = require('./questionnaire.js')
var hit  		   = require('./hit.js')


var g_project       = undefined
var g_questionnaire = undefined
var g_flank_size    = 200
var g_project_id    = process.argv[2]
var g_hits_inserted = 0


function send_update_status(_json) {
	process.stdout.write(JSON.stringify(_json))
}



// Original function written by 
// @Nasser: See http://stackoverflow.com/questions/18677834/javascript-find-all-occurrences-of-word-in-text-document
// I modified it a bit
function get_matches(needle, haystack, case_sensitive, callback) {
    var myRe      = new RegExp("\\b" + needle + "\\b((?!\\W(?=\\w))|(?=\\s))", "g" + (case_sensitive ? "" : "i"))
    var myArray   = []
    var myResult  = []
    while ((myArray = myRe.exec(haystack)) !== null) {
        myResult.push(myArray.index)
    }

    callback(myResult)
}


function get_annotations(_trigger, _case_sensitive, _note, _callback) {
	
	var _annotations = []
	var _kwic = ''
	
	get_matches(_trigger, _note, _case_sensitive, function(_indices) {

		if(_indices.length > 0) {

			_indices.forEach(function(_abs_beg) {

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

				// If true, we have covered every index
				if (_indices.length == _annotations.length) {
					_callback(_annotations)
				}
			})
		}
		else {

		}
	})
}


function insert_annotation_callback(_annotation, _passthrough) {

}

function insert_annotation_error_callback(_err, _passthrough) {

}


function process_record(_record, _passthrough) {

	// Use all triggers to look for hits within this record

	for(var i = 0; i < _passthrough.question.triggers.length; i++) {

		var _trigger = _passthrough.question.triggers[i]

		get_annotations(_trigger.name, _trigger.case_sensitive, _record.note, function(_annotations) {
			// Now we have annotations

			_annotations.forEach(function(_annotation) {
				
				// Add some extra info to this annotation
				_annotation.record_id = _record._id
				_annotation.date      = _record.date

				hit.insert_annotation(_passthrough.hit_id, _annotation, insert_annotation_callback, insert_annotation_error_callback)
			})
		})
	}
}


function get_records_error_callback(_err, _passthrough) {
	
}


function insert_hit_callback(_hit, _passthrough) {
	g_hits_inserted += 1
	send_update_status({'status' : g_hits_inserted})
	record.get_all_by_dataset_id_and_patient_id(g_project.dataset_id, _hit.patient_id, process_record, get_records_error_callback, {'question' : _passthrough, 'hit_id' : _hit._id})
}


function insert_hit_error_callback(_err, _passthrough) {
}



function get_patients_callback(_patients, _passthrough) {

	_patients.each(function (err, _patient) {
		if(_patient) {
			for (var i = 0; i < g_questionnaire.questions.length; i++) {

				var _question = g_questionnaire.questions[i]

				_hit = {
					'patient_id'  : _patient._id,
					'dataset_id'  : g_project.dataset_id,
					'project_id'  : g_project._id,
					'question_id' : _question._id,
					'tag_ids'     : _question.tag_ids,
					'annotations' : []
   			   }

   			   hit.insert(_hit, insert_hit_callback, insert_hit_error_callback, _question)
			}
		}
	})
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
project.get(g_project_id, get_project_callback, get_project_error_callback)	
