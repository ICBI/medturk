var mongoskin  = require('mongoskin')
var db = require('./database.js').db()

module.exports = {

	generate_id: function() {
		return new mongoskin.ObjectID()
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


	update: function(_hit, _callback, _error_callback, _passthrough) {

		var _query = {'_id' : _hit._id}

		db.collection('hits').update(_query, _hit, function(_err, _result) {
			if (_err) {
				_error_callback(err, _passthrough)
			}
			else {
				_callback(_passthrough)
			}
		})
	},


	get_number_of_hits_without_answers: function(_project_id, _callback, _error_callback, _passthrough) {
		_get_number_of_hits_without_answers(_project_id, _callback, _error_callback, _passthrough)
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


	get_by_id: function(_hit_id, _callback, _error_callback, _passthrough) {
		var _query  = {'_id' : new mongoskin.ObjectID(_hit_id)}

		db.collection('hits').findOne(_query, function(_err, _result) {
			if (_err) {
				_error_callback(err, _passthrough)
			}
			else if (_result) {
				_callback(_result, _passthrough)
			}
			else {
				_error_callback(null, _passthrough)
			}
		})
	},

	update_annotation_choice_id: function(_hit_id, _annotation_id, _choice_id, _user_id, _answered_date, _callback, _error_callback, _passthrough) {

		var arg1 = {'_id' : new mongoskin.ObjectID(_hit_id), 'annotations' : {$elemMatch : {'_id' : new mongoskin.ObjectID(_annotation_id)}}}
		var arg2 = { $set: {'annotations.$.choice_id' : new mongoskin.ObjectID(_choice_id), 'annotations.$.answered' : true, 'annotations.$.user_id' : _user_id, 'annotations.$.answered_date' : _answered_date } } 

		db.collection('hits').update(arg1, arg2, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				_callback(_passthrough)
			}
			else {
				_error_callback(_err, _passthrough)
			}
		})
	},


	update_answered: function(_hit_id, _answered, _user_id, _answered_date, _callback, _error_callback, _passthrough) {

		var arg1 = {'_id' : mongoskin.ObjectID(_hit_id)}
		var arg2 = {$set : {'answered' : _answered, 'user_id' : _user_id, 'answered_date' : _answered_date}}

		db.collection('hits').update(arg1, arg2, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				_callback(_passthrough)
			}
			else {
				_error_callback(_err, _passthrough)
			}
		})
	},


	update_text: function(_hit_id, _text, _answered, _user_id, _answered_date, _callback, _error_callback, _passthrough) {

		arg1 = {'_id' : mongoskin.ObjectID(_hit_id)}

		arg2 = {$set : {'answer_text'   : _text, 
						'answered'      : _answered, 
						'user_id'       : _user_id, 
						'answered_date' : _answered_date}}

		db.collection('hits').update(arg1, arg2, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				_callback(_passthrough)
			}
			else {
				_error_callback(_err, _passthrough)
			}
		})
	},

	update_choice_id: function(_hit_id, _choice_id, _user_id, _answered, _answered_date, _callback, _error_callback, _passthrough) {

		arg1 = {'_id' : mongoskin.ObjectID(_hit_id)}
		arg2 = {$set : {'choice_id' :  mongoskin.ObjectID(_choice_id), 
						'answered' : _answered, 
						'user_id' : _user_id, 
						'answered_date' : _answered_date}}

		db.collection('hits').update(arg1, arg2, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				_callback(_passthrough)
			}
			else {
				_error_callback(_err, _passthrough)
			}
		})
	},


	delete_by_project_id: function(_project_id, _callback, _error_callback, _passthrough) {
		var _query = {'project_id' : new mongoskin.ObjectID(_project_id)}

		db.collection('hits').remove(_query, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				_callback(_passthrough)
			}
			else {
				_error_callback(_err, _passthrough)
			}
		})
	},

	insert: function(_document, _callback, _error_callback, _passthrough) {

		_document.patient_id  = new mongoskin.ObjectID(_document.patient_id)
		_document.dataset_id  = new mongoskin.ObjectID(_document.dataset_id)
		_document.project_id  = new mongoskin.ObjectID(_document.project_id)
		_document.question_id = new mongoskin.ObjectID(_document.question_id)

		db.collection('hits').insert(_document, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				_callback(_result[0], _passthrough)
			}
			else {
				_error_callback(_err, _passthrough)
			}
		})
	},

	insert_annotation: function(_hit_id, _annotation, _callback, _error_callback, _passthrough) {

		var _query        = {'_id' : new mongoskin.ObjectID(_hit_id)}
		var _update_query = {'$push' : {'annotations' : _annotation}}

		db.collection('hits').update(_query, _update_query, function(err, result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				_callback(_result[0], _passthrough)
			}
			else {
				_error_callback(_err, _passthrough)
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