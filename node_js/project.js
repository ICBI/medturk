var config     = require('./config.js')
var mongoskin  = require('mongoskin')
var db         = mongoskin.db(config.db_url)


module.exports = {

	get_by_project_id: function(_project_id, _callback, _error_callback, _passthrough) {

		var _query  = {'_id' : new mongoskin.ObjectID(_project_id)}

		db.collection('projects').findOne(_query, function(err, result) {
			if (err) throw err

			if (result) {
				_callback(result, _passthrough)
			}
			else {
				_error_callback(err, _passthrough)
			}
		})
	},

	get: function(_callback, _error_callback, _passthrough) {

		db.collection('projects').find().toArray(function(err, result) {
			if (err) throw err

			if (result) {
				_callback(result, _passthrough)
			}
			else {
				_error_callback(err, _passthrough)
			}
		})
	},


	increment_num_answers: function(_project_id, _callback,_error_callback, _passthrough) {
		var _query        = {'_id' : new mongoskin.ObjectID(_project_id)}
		var _update_query = {'$inc' : {'num_answers' : 1}}

		db.collection('projects').update(_query, _update_query, function(err, result) {
			if (err) throw err

			if (result) {
				_callback(_passthrough)
			}
			else {
				_error_callback(err, _passthrough)
			}
		})
	},


	update_status: function(_project_id, _status, _num_answers, _num_hits, _callback, _error_callback, _passthrough) {

		var _query        = {'_id' : new mongoskin.ObjectID(_project_id)}
		var _update_query = {'$set' : {'status' : _status, 'num_answers' : _num_answers, 'num_hits' : _num_hits}}

		db.collection('projects').update(_query, _update_query, function(err, result) {
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






