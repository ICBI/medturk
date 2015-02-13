var config     = require('./config.js')
var mongoskin  = require('mongoskin')
var db         = mongoskin.db(config.db_url)


module.exports = {

	generate_id: function() {
		return new mongoskin.ObjectID()
	},


	get: function(_hit_id, _callback, _error_callback, _passthrough) {

		var _query  = {'_id' : new mongoskin.ObjectID(_hit_id)}

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


	get_random: function(_project_id, _callback, _error_callback, _passthrough) {

		
		function on_get_number_of_answered_hits_callback(N, __passthrough) {

			var r = Math.floor(Math.random()*N)

			var arg = {'project_id' : new mongoskin.ObjectID(_project_id), 'answered' : {$exists : false} }

			db.collection('hits').find(arg, null, {limit: -1, skip: r}, function(_err, result) {
			
				if (_err) {
					_error_callback(result[0], _passthrough)
				}
				else {
					result.next(function(_err, _hit) {
						_callback(_hit, _passthrough)
					})
				}
			})
		}


		function on_get_number_of_answered_hits_error_callback(_err, __passthrough) {
			_error_callback(_err, _passthrough)
		}

		_get_number_of_hits_without_answers(_project_id, on_get_number_of_answered_hits_callback, on_get_number_of_answered_hits_error_callback)
	},


	get_number_of_hits: function(_project_id, _callback, _error_callback, _passthrough) {

		var _query  = {'project_id' : new mongoskin.ObjectID(_project_id)}

		db.collection('hits').count(_query, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else {
				_callback(_result, _passthrough)
			}
		})
	},


	get_number_of_answered_hits: function(_project_id, _callback, _error_callback, _passthrough) {

		var _query  = {'project_id' : new mongoskin.ObjectID(_project_id), 'answered' : true}	

		db.collection('hits').count(_query, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else {
				_callback(_result, _passthrough)
			}
		})
	},


	get_by_answered: function(_project_id, _answered, _callback, _error_callback, _passthrough) {

		var _query  = {'project_id' : new mongoskin.ObjectID(_project_id), 'answered' : _answered}	

		db.collection('hits').find(_query, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else {
				_callback(_result, _passthrough)
			}
		})
	},



	get_hits_by_phrase_id: function(_phrase_id, _callback, _error_callback, _passthrough) {

		var _query        = {'annotations' : {$elemMatch : { 'phrase_ids' : _phrase_id}}}	

		db.collection('hits').find(_query, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else {
				_callback(_result, _passthrough)
			}
		})
	},


	update: function(_hit, _callback, _error_callback, _passthrough) {

		var _query        = {'_id' : _hit._id}

		db.collection('hits').update(_query, _hit, function(err, result) {
			if (err) {
				_error_callback(err, _passthrough)
			}
			else {
				_callback(_passthrough)
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
	},


	delete_by_project_id: function(_project_id, _callback, _error_callback, _passthrough) {
		var _query = {'project_id' : new mongoskin.ObjectID(_project_id)}

		db.collection('hits').remove(_query, function(err, result) {
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




function _get_number_of_hits_without_answers(_project_id, _callback, _error_callback, _passthrough) {

	var _query = {'project_id' : new mongoskin.ObjectID(_project_id), 'answered' : {$exists : false} }

	db.collection('hits').count(_query, function(_err, _result) {
		if (_err) {
			_error_callback(_err, _passthrough)
		}
		else {
			_callback(_result, _passthrough)
		}
	})
}





