var questionnaire_db = require('../db/questionnaire.js')
var fs = require('fs')

module.exports = {

	update_question_frequency: function(_questionnaire_id, _question_id, _frequency, _callback, _error_callback, _passthrough) {
		questionnaire_db.update_question_frequency(_questionnaire_id, _question_id, _frequency, _callback, _error_callback, _passthrough)
	},

	update_question_type: function(_questionnaire_id, _question_id, _type, _callback, _error_callback, _passthrough) {
		questionnaire_db.update_question_type(_questionnaire_id, _question_id, _type, _callback, _error_callback, _passthrough)
	},

	update_question_choice_name: function(_questionnaire_id, _question_id, _choice_id, _name, _callback, _error_callback, _passthrough) {
		questionnaire_db.update_question_choice_name(_questionnaire_id, _question_id, _choice_id, _name, _callback, _error_callback, _passthrough)
	},

	update_question_name: function(_questionnaire_id, _question_id, _name, _callback, _error_callback, _passthrough) {
		questionnaire_db.update_question_name(_questionnaire_id, _question_id, _name, _callback, _error_callback, _passthrough)
	},
		
	update_tag_name: function(_questionnaire_id, _tag_id, _name, _callback, _error_callback, _passthrough) {
		questionnaire_db.update_tag_name(_questionnaire_id, _tag_id, _name, _callback, _error_callback, _passthrough)
	},

	update_name: function(_questionnaire_id, _name, _callback, _error_callback, _passthrough) {
		questionnaire_db.update_name(_questionnaire_id, _name, _callback, _error_callback, _passthrough)
	},

	update_description: function(_questionnaire_id, _description, _callback, _error_callback, _passthrough) {
		questionnaire_db.update_description(_questionnaire_id, _description, _callback, _error_callback, _passthrough)
	},

	upload: function(_file, _callback, _error_callback, _passthrough) {

		// Is this a json file?
		if (_file.name.substr(_file.name.length-5).toLowerCase() == '.json') {

			fs.readFile(_file.path, 'utf8', function (_err, _data) {
	  			if (_err) {
	  				_error_callback(_err, _passthrough)
	  			}
	  			else {
	  				// This code blocks the thread
	  				var doc = JSON.parse(_data)
	  				_create_questionnaire_from_upload(doc, _callback, _error_callback, _passthrough)
	  			}
			})
		}
		else {
			_error_callback(none, _passthrough)
		}
	},


	get_all_questionnaires: function(_callback, _error_callback, _passthrough) {
		questionnaire_db.get_all_questionnaires(_callback, _error_callback, _passthrough)
	},

	create_tag: function(_questionnaire_id, _tag_name, _callback, _error_callback, _passthrough) {
		questionnaire_db.create_tag(_questionnaire_id, _tag_name, _callback, _error_callback, _passthrough)
	},

	create_trigger: function(_questionnaire_id, _question_id, _trigger_name, _case_sensitive, _callback, _error_callback, _passthrough) {
		questionnaire_db.create_trigger(_questionnaire_id, _question_id, _trigger_name, _case_sensitive, _callback, _error_callback, _passthrough)
	},

	create_question: function(_questionnaire_id, _callback, _error_callback, _passthrough) {
		questionnaire_db.create_question(_questionnaire_id, '', 'radio', 'once', [], [], [], _callback, _error_callback, _passthrough)
	},

	insert_question_tag_id: function(_questionnaire_id, _question_id, _tag_id, _callback, _error_callback, _passthrough) {
		questionnaire_db.insert_question_tag_id(_questionnaire_id, _question_id, _tag_id, _callback, _error_callback, _passthrough)
	},	

	create_question_choice: function(_questionnaire_id, _question_id, _name, _callback, _error_callback, _passthrough) {
		questionnaire_db.create_question_choice(_questionnaire_id, _question_id, _name, _callback, _error_callback, _passthrough)
	},

	 create_questionnaire: function(_callback, _error_callback, _passthrough) {
	 	questionnaire_db.create_questionnaire('New Questionnaire', 
	 										  '', 
	 										  [], 
	 										  [], 
	 										  _callback, 
	 										  _error_callback, 
	 										  _passthrough)
	 },

	 get_by_id: function(_questionnaire_id, _callback, _error_callback, _passthrough) {
	 	questionnaire_db.get_by_id(_questionnaire_id, _callback, _error_callback, _passthrough)
   	},

   	delete_question: function(_questionnaire_id, _question_id, _callback, _error_callback, _passthrough) {
   		questionnaire_db.delete_question(_questionnaire_id, _question_id, _callback, _error_callback, _passthrough) 
   	},

   	delete_tag: function(_questionnaire_id, _tag_id, _callback, _error_callback, _passthrough) {
   		questionnaire_db.delete_tag(_questionnaire_id, _tag_id, _callback, _error_callback, _passthrough)
	},

	delete_questionnaire: function(_questionnaire_id, _callback, _error_callback, _passthrough) {
   		questionnaire_db.delete_questionnaire(_questionnaire_id, _callback, _error_callback, _passthrough)
	},

	delete_question_choice: function(_questionnaire_id, _question_id, _choice_id, _callback, _error_callback, _passthrough) {
   		questionnaire_db.delete_question_choice(_questionnaire_id, _question_id, _choice_id, _callback, _error_callback, _passthrough)
	},

	delete_question_trigger: function(_questionnaire_id, _question_id, _trigger_id, _callback, _error_callback, _passthrough) {
		questionnaire_db.delete_question_trigger(_questionnaire_id, _question_id, _trigger_id, _callback, _error_callback, _passthrough)
	},

	delete_question_tag: function(_questionnaire_id, _question_id, _tag_id, _callback, _error_callback, _passthrough) {
		questionnaire_db.delete_question_tag(_questionnaire_id, _question_id, _tag_id, _callback, _error_callback, _passthrough)
	}
}





function _create_questionnaire_from_upload(_questionnaire, _callback, _error_callback, _passthrough) {

		// Remove current id
  		delete _questionnaire['_id']

  		_questionnaire['name'] += ' (uploaded)'

  		// Replaces string ids from previous model and replaces them with new BSON Ids
  		for (var i = 0; i < _questionnaire.questions.length; i++) {

  			_questionnaire.questions[i]['_id'] = questionnaire_db.generate_id()

  			for (var j = 0; j < _questionnaire.questions[i].tag_ids.length; j++) {
  				_questionnaire.questions[i].tag_ids[j] = questionnaire_db.generate_id()
  			}

  			for (var j = 0; j < _questionnaire.questions[i].choices.length; j++) {
  				_questionnaire.questions[i].choices[j]['_id'] = questionnaire_db.generate_id()
  			}

  			for (var j = 0; j < _questionnaire.questions[i].triggers.length; j++) {
  				_questionnaire.questions[i].triggers[j]['_id'] = questionnaire_db.generate_id()
  			}
  		}

  		for (var i = 0; i < _questionnaire.tags.length; i++) {
  			_questionnaire.tags[i]['_id'] = questionnaire_db.generate_id()
  		}

  		questionnaire_db.insert_questionnaire(_questionnaire, _callback, _error_callback, _passthrough)
	}



