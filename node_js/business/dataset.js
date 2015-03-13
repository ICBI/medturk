var fs         = require('fs')
var path       = require('path')
var config     = require('../config.js')
var patient    = require('../business/patient.js')
var record     = require('../business/record.js')
var dataset_db = require('../db/dataset.js')


module.exports = {


	create_dataset: function(_dataset_name, _dataset_description, _dataset_folder, _callback, _error_callback) {
		dataset_db.create_dataset(_dataset_name, 
								  _dataset_description, 
								  _dataset_folder, 
								  'Building (0% complete)', 
								  0, 
								  Date(), 
								  _callback, 
								  _error_callback)
	},

	get_dataset_folders: function(_callback, _error_callback, _passthrough) {

		paths = fs.readdirSync(config.datasets_path).filter(function(file) {
	    	return fs.statSync(path.join(config.datasets_path, file)).isDirectory()
		})

		_callback(paths)
	},


	get_all_datasets: function(_callback, _error_callback, _passthrough) {
		dataset_db.get_all_datasets(_callback, _error_callback, _passthrough)
	},

	get_dataset_by_id: function(_dataset_id, _callback, _error_callback, _passthrough) {
		dataset_db.get_dataset_by_id(_dataset_id, _callback, _error_callback, _passthrough)
	},

	update_dataset_name: function(_dataset_id, _dataset_name, _callback, _error_callback, _passthrough) {
		dataset_db.update_dataset_name(_dataset_id, _dataset_name, _callback, _error_callback, _passthrough)
	},

	update_dataset_description: function(_dataset_id, _dataset_description, _num_patients, _callback, _error_callback, _passthrough) {
		dataset_db.update_dataset_description(_dataset_id, _dataset_description, _num_patients, _callback, _error_callback, _passthrough)
	},

	update_dataset_status: function(_dataset_id, _dataset_status, _num_patients, _callback, _error_callback, _passthrough) {
		dataset_db.update_dataset_status(_dataset_id, _dataset_status, _num_patients, _callback, _error_callback, _passthrough)
	},

	delete_dataset: function(_dataset_id, _callback, _error_callback, _passthrough) {

		// Wait for three events to finish
		var num_events = 3
		var counter = 0

		function on_success(_passthrough) {
			counter += 1
			if (counter == num_events) {
				_callback(_passthrough)
			}
		}

		function on_fail(_passthrough) {
			_error_callback(null, _passthrough)
		}

		// These are the three events
		dataset_db.delete_by_dataset_id(_dataset_id, on_success, on_fail)
		patient.delete_by_dataset_id(_dataset_id, on_success, on_fail)
		record.delete_by_dataset_id(_dataset_id, on_success, on_fail)
	}
}