var phrase_db = require('../db/phrase.js')


module.exports = {

	generate_id: function() {
		return phrase_db.generate_id()
	},

	get_phrases_by_project_id_and_question_id: function(_project_id, _question_id, _callback, _error_callback, _passthrough) {
		phrase_db.get_phrases_by_project_id_and_question_id(_project_id, _question_id, _callback, _error_callback, _passthrough)
	},

	insert: function(_document, _callback, _error_callback, _passthrough) {
		phrase_db.insert(_document, _callback, _error_callback, _passthrough)
	},


	bulk_answer: function(_phrase_id, _answer, _answer_type, _frequency, _user_id, _callback, _error_callback, _passthrough) {
	
		function on_success() {
			phrase_db.delete_phrase(_phrase_id, _callback, _error_callback, _passthrough)
		}

		function on_fail(_err) {
			_error_callback(_err, _passthrough)
		}

		if (_frequency == 'once') {
			phrase_db.bulk_answer_once(_phrase_id, _answer, _answer_type, _user_id, on_success, on_fail)
		}
		else if(_frequency == 'multiple') {
			phrase_db.bulk_answer_multiple(_phrase_id, _answer, _answer_type, _frequency, _user_id, on_success, on_fail)
		}
		else {
			throw new Error('Unrecognized frequency type')
		}
	},


	not_applicable: function(_phrase_id, _callback, _error_callback, _passthrough) {
		/*
			1. Deletes any annotation with a reference to this phrase
			2. Ensures if annotations become empty, that hit is deleted
			3. Deletes phrase from phrase collection
		*/

		function delete_empty_hits_callback() {
			phrase_db.delete_phrase(_phrase_id, _callback, _error_callback, _passthrough)
		}


		function delete_empty_hits_error_callback(_err) {
			_error_callback(_err, _passthrough)
		}
		

		function delete_annotations_callback() {
			phrase_db.delete_hits_with_empty_annotations(delete_empty_hits_callback, delete_empty_hits_error_callback)
		}


		function delete_annotations_error_callback(_err) {
			_error_callback(err, _passthrough)
		}

		phrase_db.delete_annotations_with_phrase_id(_phrase_id, delete_annotations_callback, delete_annotations_error_callback)
	},


	ignore: function(_phrase_id, _callback, _error_callback, _passthrough) {
		/*
			Deletes phrase from phrase collection
		*/	
		phrase_db.delete_phrase(_phrase_id, _callback, _error_callback, _passthrough)
	}
}

