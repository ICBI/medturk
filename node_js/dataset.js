var config     = require('./config.js')
var mongoskin  = require('mongoskin')
var db         = mongoskin.db(config.db_url)


module.exports = {

	get: function(_dataset_id, _callback, _error_callback, _passthrough) {

		var _query  = {'_id' : new mongoskin.ObjectID(_dataset_id)}

		db.collection('datasets').findOne(_query, function(err, result) {
			if (err) throw err

			if (result) {
				_callback(result, _passthrough)
			}
			else {
				_error_callback(err, _passthrough)
			}
		})
	},



	update_status: function(_dataset_id, _status, _num_patients, _callback, _error_callback, _passthrough) {

		var _query        = {'_id' : new mongoskin.ObjectID(_dataset_id)}
		var _update_query = {'$set' : {'status' : _status, 'num_patients' : _num_patients}}

		db.collection('datasets').update(_query, _update_query, function(err, result) {
			if (err) throw err

			if (result) {
				_callback(_passthrough)
			}
			else {
				_error_callback(err, _passthrough)
			}
		})
	}

}






