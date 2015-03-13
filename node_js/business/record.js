var record_db = require('../db/record.js')

module.exports = {


	get_record_by_id: function(_record_id, _callback, _error_callback, _passthrough) {
		record_db.get_record_by_id(_record_id, _callback, _error_callback, _passthrough)
	},

	get_records_by_dataset_id_and_patient_id: function(_dataset_id, _patient_id, _callback, _error_callback, _passthrough) {
		record_db.get_records_by_dataset_id_and_patient_id(_dataset_id, _patient_id, _callback, _error_callback, _passthrough)
	},

	insert: function(_document, _callback, _error_callback, _passthrough) {
		record_db.insert(_document, _callback, _error_callback, _passthrough)
	},


	delete_by_dataset_id: function(_dataset_id, _callback, _error_callback, _passthrough) {
		record_db.delete_by_dataset_id(_dataset_id, _callback, _error_callback, _passthrough)
	}
}






