var config     = require('./config.js')
var mongoskin  = require('mongoskin')
var db         = mongoskin.db(config.db_url)


module.exports = {

	generate_id: function() {
		return new mongoskin.ObjectID()
	},

	get: function(_patient_id, _callback, _error_callback, _passthrough) {

		var _query = {'_id' : new mongoskin.ObjectID(_patient_id)}

		db.collection('patients').findOne(_query, function(err, result) {
			if (err) throw err

			if (result) {
				_callback(result, _passthrough)
			}
			else {
				_error_callback(err, _passthrough)
			}
		})
	},

	get_all: function(_patient_id, _callback, _error_callback, _passthrough) {

		var _query = {'_id' : new mongoskin.ObjectID(_patient_id)}

		db.collection('patients').find(_query, function(err, result) {
			if (err) throw err

			if (result) {
				_callback(result, _passthrough)
			}
			else {
				_error_callback(err, _passthrough)
			}
		})
	},


	get_all_by_dataset_id: function(_dataset_id, _callback, _error_callback, _passthrough) {

		var _query = {'dataset_id' : new mongoskin.ObjectID(_dataset_id)}

		db.collection('patients').find(_query, function(err, result) {
			if (err) throw err

			if (result) {
				_callback(result, _passthrough)
			}
			else {
				_error_callback(err, _passthrough)
			}
		})
	},


	insert: function(_document, _callback, _error_callback, _passthrough) {

		// Convert dataset id
		_document.dataset_id = new mongoskin.ObjectID(_document.dataset_id)

		db.collection('patients').insert(_document, function(err, result) {
			if (err) throw err

			if (result) {
				_callback(result[0], _passthrough)
			}
			else {
				_error_callback(err, _passthrough)
			}
		})
	}
}






