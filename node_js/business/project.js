var hit           = require('../business/hit.js')
var patient       = require('../business/patient.js')
var questionnaire = require('../business/questionnaire.js')
var user          = require('../business/user.js')

var project_db    = require('../db/project.js')



module.exports = {

	delete_user_id: function(_project_id, _user_id, _callback, _error_callback, _passthrough) {
		project_db.update_project_name(_project_id, _user_id, _callback, _error_callback, _passthrough)
	},


	update_project_name: function(_project_id, _project_name, _callback, _error_callback, _passthrough) {
		project_db.update_project_name(_project_id, _project_name, _callback, _error_callback, _passthrough)
	},

	update_project_description: function(_project_id, _project_decription, _callback, _error_callback, _passthrough) {
		project_db.update_project_name(_project_id, _project_decription, _callback, _error_callback, _passthrough)
	},

	update_dataset_id: function(_project_id, _dataset_id, _callback, _error_callback, _passthrough) {
		project_db.update_dataset_id(_project_id, _dataset_id, _callback, _error_callback, _passthrough)
	},


	update_questionnaire_id: function(_project_id, _questionnaire_id, _callback, _error_callback, _passthrough) {
		project_db.update_questionnaire_id(_project_id, _questionnaire_id, _callback, _error_callback, _passthrough)
	},


	add_user: function(_project_id, _user_id, _callback, _error_callback, _passthrough) {
		project_db.add_user(_project_id, _user_id, _callback, _error_callback, _passthrough)
	},


	create_project: function(_callback, _error_callback, _passthrough) {
		project_db.create_project('New Application', '', null, null, [], 'Needs Building', 0, 0, _callback, _error_callback, _passthrough)
	},

	generate_csv: function(_project_id, _callback, _error_callback) {

		var g_questionnaire    = undefined
		var g_question_ids     = []
		var g_choice_ids       = []
		var g_number_of_hits = 0
		var g_number_of_hits_traversed = 0
		var g_users = {}
		var g_project = undefined
		var csv_data = 'Patient Id,medTurk Patient Id,Question Id,Question,Answer,Date,Answered Date,Answered By'


		function create_csv_record(_hit, _question, _question_index, _date, _answered_date, _answered_by_id, _patient_id, _json) {
			
			var _answer = ''
		
			if (_question.type == 'text') {
				_answer = _json.answer_text
			}
			else if (_question.type == 'radio') {

				g_questionnaire.questions[_question_index]

				if (_json.choice_id) {
					var choice_index = g_choice_ids[_question_index].indexOf(_json.choice_id.toString())
					_answer = g_questionnaire.questions[_question_index].choices[choice_index].name
				}
			}

			if (_answer.length > 0) {

				csv_data += _patient_id + ','
				csv_data += _hit.patient_id.toString() + ','
				csv_data += _question._id.toString() + ','
				csv_data += '"' + _question.question + '",' 
				csv_data += '"' + _answer + '",'
				csv_data += '"' + _date + '",'
				csv_data += '"' + _answered_date + '",'
				csv_data += '"' + g_users[_answered_by_id.toString()] + '"'

				if (_question.csv_tags.length > 0) {
					csv_data += _question.csv_tags
				}

				csv_data += '\r\n'
			}		
		}


		function on_get_patient_callback(_patient, _hit) {



			var question_index = g_question_ids.indexOf(_hit.question_id.toString())
			_question = g_questionnaire.questions[question_index]

			g_number_of_hits_traversed += 1

			if (_question.frequency == 'multiple') {

				for(var i = 0; i < _hit.annotations.length; i++) {
					if (_hit.annotations[i].answered) {
						create_csv_record(_hit, _question, question_index, _hit.annotations[i].date, _hit.annotations[i].answered_date, _hit.annotations[i].user_id, _patient.id, _hit.annotations[i])
					}
				}
			}

			else if (_question.frequency == 'once') {
				create_csv_record(_hit, _question, question_index, '', _hit.answered_date, _hit.user_id, _patient.id, _hit)
			}

			if (g_number_of_hits_traversed == g_number_of_hits) {
				_callback(csv_data)
			}
		}

		function on_get_patient_error_callback(_err, _hit) {

		}


		function for_each_hit_in_answer_cursor_callback(_err, _hit) {
			if (_hit) {
				patient.get_by_id(_hit.patient_id, on_get_patient_callback, on_get_patient_error_callback, _hit)
			}
		}


		function get_answered_hits_callback(_answered_hits_cursor, _passthrough) {
			_answered_hits_cursor.count(function(_err, _number_of_hits) {
				g_number_of_hits = _number_of_hits

				if (g_number_of_hits == 0) {
					_callback(csv_data)
				}
				else {
					_answered_hits_cursor.each(for_each_hit_in_answer_cursor_callback)
				}
			})
		}


		function get_answered_hits_error_callback(_err, _passthrough) {
			_error_callback(_err)
		}

		function get_questionnaire_callback(_questionnaire) {

			g_questionnaire = _questionnaire

			// Add tags to csv header
			for (var i = 0; i < g_questionnaire.tags.length; i++) {
				csv_data += ',' + g_questionnaire.tags[i].name
			}

			csv_data += '\r\n'

			for (var i = 0; i < g_questionnaire.questions.length; i++) {

				// Used for faster lookup
				g_question_ids.push(g_questionnaire.questions[i]._id.toString())

				var _choice_ids = []
				if (g_questionnaire.questions[i].choices) {
					for (var j = 0; j < g_questionnaire.questions[i].choices.length; j++) {
						_choice_ids.push(g_questionnaire.questions[i].choices[j]._id.toString())
					}
				}
				g_choice_ids.push(_choice_ids)

				g_questionnaire.questions[i]['csv_tags'] = ''

				for (var j = 0; j < g_questionnaire.tags.length; j++) {

					var _tag_id = g_questionnaire.tags[j]._id.toString()

					var s = ',0'
					for(var k = 0; k < g_questionnaire.questions[i].tag_ids.length; k++) {
						if (_tag_id === g_questionnaire.questions[i].tag_ids[k].toString()) {
							s = ',1'
							break
						}
					}
					g_questionnaire.questions[i]['csv_tags'] += s
				}
			}


			hit.get_by_answered(_project_id, true, get_answered_hits_callback, get_answered_hits_error_callback)
		}

		function get_questionnaire_error_callback(_err) {
			_error_callback(_err)
		}


		function on_get_users_callback(_users, _passthrough) {
			
			for (var i = 0; i < _users.length; i++) {
				g_users[_users[i]._id.toString()] = _users[i].username
			}

			questionnaire.get_by_id(g_project.questionnaire_id, get_questionnaire_callback, get_questionnaire_error_callback)
		}

		function on_get_users_error_callback(_err, _passthrough) {
			_error_callback(_err)
		}


		function get_project_callback(_project) {
			g_project = _project
			user.get_users_with_passwords_removed(on_get_users_callback, on_get_users_error_callback)
		}

		function get_project_error_callback(_err) {
			_error_callback(_err)
		}

		project_db.get_by_project_id(_project_id, get_project_callback, get_project_error_callback)
	},

	get_by_project_id: function(_project_id, _callback, _error_callback, _passthrough) {

	
		function on_finish(_projects) {
			_callback(_projects[0], _passthrough)
		}

		function on_error(_err) {
			_error_callback(_err, _passthrough)
		}

		function on_get_project_callback(_project) {
			_add_status_information_to_projects([_project], on_finish, on_error)
		}

		function on_get_project_error_callback(_err) {
			_error_callback(_err, _passthrough)
		}


		project_db.get_by_project_id(_project_id, on_get_project_callback, _error_callback)
	},

	get: function(_callback, _error_callback, _passthrough) {

		function on_finish(_projects) {
			_callback(_projects, _passthrough)
		}

		function on_error(_err) {
			_error_callback(_err, _passthrough)
		}

		project_db.get_all_projects(function(_result, _passthrough){
			_add_status_information_to_projects(_result, on_finish, on_error)
		}, _error_callback)
	},


	get_by_user_id: function(_user_id, _callback, _error_callback, _passthrough) {

		function on_finish(_projects) {
			_callback(_projects, _passthrough)
		}

		function on_error(_err) {
			_error_callback(_err, _passthrough)
		}


		function on_success(_result, _passthrough) {
			_add_status_information_to_projects(_result, on_finish, on_error)
		}

		project_db.get_projects_by_user_id(_user_id, on_success, _error_callback, _passthrough)
	},


	update_status: function(_project_id, _status, _callback, _error_callback, _passthrough) {
		project_db.update_status(_project_id, _status, _callback, _error_callback, _passthrough)
	},


	delete_project: function(_project_id, _callback, _error_callback, _passthrough) {
		project_db.delete_project(_project_id, _callback, _error_callback, _passthrough)
	}
}



function _add_status_information_to_projects(_projects, _callback, _error_callback) {

	var number_of_callbacks = _projects.length * 2
	var count = 0

	function check_exit_status() {
		if (count === number_of_callbacks) {
			_callback(_projects)
		}
	}

	function get_number_of_hits_callback(_hit_count, _i) {
		count += 1
		_projects[_i]['num_hits'] = _hit_count
		check_exit_status()
	}

	function get_number_of_hits_error_callback(_err, _i) {
		_error_callback(_err)
	}

	function get_number_of_answered_hits_callback(_answered_hit_count, _i) {
		count += 1
		_projects[_i]['num_answers'] = _answered_hit_count
		check_exit_status()
	}

	function get_number_of_answered_hits_error_callback(_err, _i) {
		_error_callback(_err)
	}

	for (var i = 0; i < _projects.length; i++) {
		hit.get_number_of_hits(_projects[i]._id, get_number_of_hits_callback, get_number_of_hits_error_callback, i)
		hit.get_number_of_answered_hits(_projects[i]._id, get_number_of_answered_hits_callback, get_number_of_answered_hits_error_callback, i)
	}
}

