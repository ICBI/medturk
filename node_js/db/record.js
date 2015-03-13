var mongoskin  = require('mongoskin')
var db = require('./database.js').db()

module.exports = {


	get_record_by_id: function(_record_id, _callback, _error_callback, _passthrough) {

		db.collection('records').findOne({'_id' : new mongoskin.ObjectID(_record_id)}, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else {
				_callback(_result, _passthrough)
			}
		})
	},


	insert: function(_document, _callback, _error_callback, _passthrough) {
		
		_document.patient_id = new mongoskin.ObjectID(_document.patient_id)
		_document.dataset_id = new mongoskin.ObjectID(_document.dataset_id)

		db.collection('records').insert(_document, function(_err, _result) {
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


	get_records_by_dataset_id_and_patient_id: function(_dataset_id, _patient_id, _callback, _error_callback, _passthrough) {

		var _query = {'dataset_id' : new mongoskin.ObjectID(_dataset_id), 'patient_id' : new mongoskin.ObjectID(_patient_id)}
		
		db.collection('records').find(_query).toArray( function(_err, _result) {
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

		db.collection('records').remove(_query, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else {
				_callback(_passthrough)
			}
		})
	}
}