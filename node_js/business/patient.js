var patient_db = require('../db/patient.js')


module.exports = {

	generate_id: function() {
		return patient_db.generate_id()
	},

	get_by_id: function(_patient_id, _callback, _error_callback, _passthrough) {
		patient_db.get_by_id(_patient_id, _callback, _error_callback, _passthrough)
	},

	get_all: function(_patient_id, _callback, _error_callback, _passthrough) {
		patient_db.get_all(_patient_id, _callback, _error_callback, _passthrough)
	},

	get_all_by_dataset_id: function(_dataset_id, _callback, _error_callback, _passthrough) {
		patient_db.get_all_by_dataset_id(_dataset_id, _callback, _error_callback, _passthrough)
	},

	insert: function(_document, _callback, _error_callback, _passthrough) {
		patient_db.insert(_document, _callback, _error_callback, _passthrough)
	},

	delete_by_dataset_id: function(_dataset_id, _callback, _error_callback, _passthrough) {
		patient_db.delete_by_dataset_id(_dataset_id, _callback, _error_callback, _passthrough)
	}

}