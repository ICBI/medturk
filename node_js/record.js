var config     = require('./config.js')
var mongoskin  = require('mongoskin')
var db         = mongoskin.db(config.db_url)


module.exports = {


	get: function(_record_id, _callback, _error_callback, _passthrough) {

		db.collection('records').findOne({'_id' : new mongoskin.ObjectID(_record_id)}, function(err, result) {
			if (err) throw err

			if (result) {
				_callback(result, _passthrough)
			}
			else {
				_error_callback(err, _passthrough)
			}
		})
	},


	get_all_by_dataset_id_and_patient_id: function(_dataset_id, _patient_id, _callback, _error_callback, _passthrough) {

		var _query = {'dataset_id' : new mongoskin.ObjectID(_dataset_id), 'patient_id' : new mongoskin.ObjectID(_patient_id)}
		
		db.collection('records').find(_query, function(err, result) {
			if (err) throw err

			if (result) {
				result.each(function(err, _document) {
			
					if (_document) {
        				_callback(_document, _passthrough)
        			}
    			})
			}
			else {
				_error_callback(err, _passthrough)
			}
		})
	},


	insert: function(_document, _callback, _error_callback, _passthrough) {

		_document.patient_id = new mongoskin.ObjectID(_document.patient_id)
		_document.dataset_id = new mongoskin.ObjectID(_document.dataset_id)

		db.collection('records').insert(_document, function(err, result) {
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






