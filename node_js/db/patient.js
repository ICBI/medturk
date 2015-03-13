var mongoskin  = require('mongoskin')
var db = require('./database.js').db()

module.exports = {

	generate_id: function() {
		return new mongoskin.ObjectID()
	},

	get_by_id: function(_patient_id, _callback, _error_callback, _passthrough) {

		var _query = {'_id' : new mongoskin.ObjectID(_patient_id)}

		db.collection('patients').findOne(_query, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				_callback(_result, _passthrough)
			}
			else {
				_error_callback(_err, _passthrough)
			}
		})
	},

	get_all: function(_patient_id, _callback, _error_callback, _passthrough) {

		var _query = {'_id' : new mongoskin.ObjectID(_patient_id)}

		db.collection('patients').find(_query, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				_callback(_result, _passthrough)
			}
			else {
				_error_callback(_err, _passthrough)
			}
		})
	},


	insert: function(_document, _callback, _error_callback, _passthrough) {

		// Convert dataset id
		_document.dataset_id = new mongoskin.ObjectID(_document.dataset_id)

		db.collection('patients').insert(_document, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				_callback(_result[0], _passthrough)
			}
			else {
				_error_callback(null, _passthrough)
			}
		})
	},


	get_all_by_dataset_id: function(_dataset_id, _callback, _error_callback, _passthrough) {

		var _query = {'dataset_id' : new mongoskin.ObjectID(_dataset_id)}

		db.collection('patients').find(_query).toArray( function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else {
				_callback(_result, _passthrough)
			}
		})
	},

	delete_by_dataset_id: function(_dataset_id, _callback, _error_callback, _passthrough) {
		var _query = {'dataset_id' : new mongoskin.ObjectID(_dataset_id)}

		db.collection('patients').remove(_query, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else {
				_callback(_passthrough)
			}
		})
	}
}