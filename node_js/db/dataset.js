var db = require('./database.js').db()
var mongoskin  = require('mongoskin')

module.exports = {

	create_dataset: function(_dataset_name, _dataset_description, _dataset_folder, _status, _num_patients, _date, _callback, _error_callback, _passthrough) {
		var doc = {
					  'name'              : _dataset_name, 
					  'description'       : _dataset_description,
					  'folder'            : _dataset_folder,
					  'status'            : _status,
					  'num_patients'	  : _num_patients,
					  'date'              : _date
				  }

		db.collection('datasets').insert(doc, function(_err, _result) {
				if (_err) {
					_error_callback(_err, _passthrough)
				}
				else {
					_callback(_result[0], _passthrough)
				}
		})
	},

	get_all_datasets: function(_callback, _error_callback, _passthrough) {

		db.collection('datasets').find().toArray(function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else {
				_callback(_result, _passthrough)
			}
		})
	},


	get_dataset_by_id: function(_dataset_id, _callback, _error_callback, _passthrough) {

		var _query  = {'_id' : new mongoskin.ObjectID(_dataset_id)}

		db.collection('datasets').findOne(_query, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else {
				_callback(_result, _passthrough)
			}
		})
	},


	update_dataset_name: function(_dataset_id, _dataset_name, _callback, _error_callback, _passthrough) {

		var arg1 = {'_id' : new mongoskin.ObjectID(_dataset_id)}
		var arg2 = {'$set' : {'name' : _dataset_name}}

		db.collection('datasets').update(arg1, arg2, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				_callback(_passthrough)
			}
			else {
				_error_callback(null, _passthrough)
			}
		})
	},


	update_dataset_description: function(_dataset_id, _dataset_description, _callback, _error_callback, _passthrough) {

		var arg1 = {'_id' : new mongoskin.ObjectID(_dataset_id)}
		var arg2 = {'$set' : {'description' : _dataset_description}}

		db.collection('datasets').update(arg1, arg2, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				_callback(_passthrough)
			}
			else {
				_error_callback(null, _passthrough)
			}
		})
	},


	update_dataset_status: function(_dataset_id, _status, _num_patients, _callback, _error_callback, _passthrough) {

		var _query        = {'_id' : new mongoskin.ObjectID(_dataset_id)}
		var _update_query = {'$set' : {'status' : _status, 'num_patients' : _num_patients}}

		db.collection('datasets').update(_query, _update_query, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				_callback(_passthrough)
			}
			else {
				_error_callback(null, _passthrough)
			}
		})
	},


	delete_by_dataset_id: function(_dataset_id, _callback, _error_callback, _passthrough) {
		var _query = {'_id' : new mongoskin.ObjectID(_dataset_id)}

		db.collection('datasets').remove(_query, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			if (_result) {
				_callback(_passthrough)
			}
			else {
				_error_callback(_err, _passthrough)
			}
		})
	}


}