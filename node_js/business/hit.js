var hit_db = require('../db/hit.js')


module.exports = {

	generate_id: function() {
		return hit_db.generate_id()
	},

	get_by_id: function(_hit_id, _callback, _error_callback, _passthrough) {

		hit_db.get_by_id(_hit_id, _callback, _error_callback, _passthrough)
	},

	get_random: function(_project_id, _callback, _error_callback, _passthrough) {

		hit_db.get_random(_project_id, _callback, _error_callback, _passthrough)
	},

	get_number_of_hits: function(_project_id, _callback, _error_callback, _passthrough) {
		hit_db.get_number_of_hits(_project_id, _callback, _error_callback, _passthrough)
	},


	get_number_of_answered_hits: function(_project_id, _callback, _error_callback, _passthrough) {
		hit_db.get_number_of_answered_hits(_project_id, _callback, _error_callback, _passthrough)
	},


	get_by_answered: function(_project_id, _answered, _callback, _error_callback, _passthrough) {
		hit_db.get_by_answered(_project_id, _answered, _callback, _error_callback, _passthrough)
	},

	get_hits_by_phrase_id: function(_phrase_id, _callback, _error_callback, _passthrough) {
		hit_db.get_hits_by_phrase_id(_phrase_id, _callback, _error_callback, _passthrough)
	},

	update: function(_hit, _callback, _error_callback, _passthrough) {
		hit_db.update(_hit, _callback, _error_callback, _passthrough)
	},

	update_text: function(_hit_id, _text, _user_id, _callback, _error_callback, _passthrough) {
		hit_db.update_text(_hit_id, _text, true, _user_id, Date(), _callback, _error_callback, _passthrough)
	},

	update_annotation_choice_id: function(_hit_id, _annotation_id, _choice_id, _user_id, _callback, _error_callback, _passthrough) {
		hit_db.update_annotation_choice_id(_hit_id, _annotation_id, _choice_id, _user_id, Date(), _callback, _error_callback, _passthrough)
	},

	update_answered: function(_hit_id, _user_id, _callback, _error_callback, _passthrough) {
		hit_db.update_answered(_hit_id, true, _user_id, Date(), _callback, _error_callback, _passthrough)
	},
	
	update_choice_id: function(_hit_id, _choice_id, _user_id, _callback, _error_callback, _passthrough) {
		hit_db.update_choice_id(_hit_id, _choice_id, _user_id, true, Date(), _callback, _error_callback, _passthrough)
	},	

	insert: function(_document, _callback, _error_callback, _passthrough) {
		hit_db.insert(_document, _callback, _error_callback, _passthrough)
	},

	insert_annotation: function(_hit_id, _annotation, _callback, _error_callback, _passthrough) {
		hit_db.insert_annotation(_hit_id, _annotation, _callback, _error_callback, _passthrough)
	},

	delete_by_project_id: function(_project_id, _callback, _error_callback, _passthrough) {
		hit_db.delete_by_project_id(_project_id, _callback, _error_callback, _passthrough)
	}
}




