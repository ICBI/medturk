var config     = require('./config.js')
var mongoskin  = require('mongoskin')
var db         = mongoskin.db(config.db_url)


module.exports = {

	generate_id: function() {
		return new mongoskin.ObjectID()
	},


	get: function(_dataset_id, _callback, _error_callback, _passthrough) {

		var _query  = {'_id' : new mongoskin.ObjectID(_dataset_id)}

		db.collection('hits').findOne(_query, function(err, result) {
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

		_document.patient_id  = new mongoskin.ObjectID(_document.patient_id)
		_document.dataset_id  = new mongoskin.ObjectID(_document.dataset_id)
		_document.project_id  = new mongoskin.ObjectID(_document.project_id)
		_document.question_id = new mongoskin.ObjectID(_document.question_id)

		db.collection('hits').insert(_document, function(err, result) {
			if (err) throw err

			if (result) {
				_callback(result[0], _passthrough)
			}
			else {
				_error_callback(err, _passthrough)
			}
		})
	},

	insert_annotation: function(_hit_id, _annotation, _callback, _error_callback, _passthrough) {

		var _query        = {'_id' : new mongoskin.ObjectID(_hit_id)}
		var _update_query = {'$push' : {'annotations' : _annotation}}

		db.collection('hits').update(_query, _update_query, function(err, result) {
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






