/*
	



var mongoskin  = require('mongoskin')
var db = require('./database.js').db()



module.exports = {

	bulk_answer_multiple: function(_phrase_id, _answer, _answer_type, _user_id, _callback, _error_callback, _passthrough) {

		_phrase_id = new mongoskin.ObjectID(_phrase_id)

		// Ensures every annotation receives the same time stamp
		var _answered_date = Date()
		var number_of_hits  = 0
		var number_of_save_hit_callbacks = 0


		// We execute this code once so we do not have to repeat the same decision on every loop
		var answer_type_key = 'answer_text'
		if (_answer_type == 'radio') {
			_answer_type_key = 'choice_id'
			_answer = new mongoskin.ObjectID(_answer)
		}
		else if (_answer_type != 'text') {
			throw new Error('Unrecognized answer type')
		}


		function hit_callback() {
			number_of_save_hit_callbacks += 1

			// When this number equals, we are finished updating all hits
			if (number_of_hits == number_of_save_hit_callbacks) {
				_callback()
			}
		}

		function save_hit_callback() {
			hit_callback()
		}

		function save_hit_error_callback(_err) {
			hit_callback()
		}


		function get_hits_callback(_hit_cursor, _passthrough) {

			// Need a count of how many items we have
			_hit_cursor.count(function(_err, _number_of_hits) {


				number_of_hits = _number_of_hits

				// In case the number of hits is 0, exit
				if (number_of_hits == 0) {
					_callback()
				}

				_hit_cursor.each(function(_err, _hit) {
					// Let's perform a linear scan for the annotations which contain the phrase ids we seek
					// This code will block the thread for a bit

					if(_hit != null) {
						var number_of_annotations_affected = 0

						for (var j = 0; j < _hit.annotations.length; j++) {
							// Is this the annotation that contains our phrase id?
							for (var k = 0; k < _hit.annotations[j].phrase_ids.length; k++) {
								if (_hit.annotations[j].phrase_ids[k].equals(_phrase_id)) {
									number_of_annotations_affected += 1
									_hit.annotations[j]['answered']       = true
									_hit.annotations[j]['bulk_answered']  = true
									_hit.annotations[j]['user_id']        = _user_id
									_hit.annotations[j]['answered_date']  = _answered_date
									_hit.annotations[j][_answer_type_key] = _answer
									break
								}
							}
						}

						// Was every annotation answered on?
						if (number_of_annotations_affected == _hit.annotations.length) {
							_hit['answered'] 	   = true
							_hit['bulk_answered']  = true
							_hit['user_id']        = _user_id
							_hit['answered_date']  = _answered_date
						}

						hit.update(_hit, save_hit_callback, save_hit_error_callback)
					}
					else {
						
					}
				})
			})	
		}

		function get_hits_callback_error(_error, _passthrough) {
			_error_callback(_error)
		}

		_get_hits_by_phrase_id(_phrase_id, get_hits_callback, get_hits_callback_error)
	},



	bulk_answer_once: function(_phrase_id, _answer, _answer_type, _user_id, _callback, _error_callback, _passthrough) {
		//
		//	1. Find all hits with this phrase id
		//	2. Update hit with this answer choice
		//	3. Set 'answered' = true, 'user' : current_user, 'bulk_answered : true'
		//	4. Delete this phrase id
		

		_phrase_id = new mongoskin.ObjectID(_phrase_id)

		var _query        = {'annotations' : {$elemMatch : { 'phrase_ids' : _phrase_id}}}
		var _update_document = {'answered' : true, 'bulk_answered' : true, 'user_id' : _user_id, 'answered_date' : Date()}

		if (_answer_type == 'radio') {
			_update_document['choice_id'] = new mongoskin.ObjectID(_answer)
		}
		else if (_answer_type == 'text') {
			_update_document['answer_text'] = _answer
		}
		else {
			throw new Error('Unrecognized answer type')
		}

		var _update_query = {$set : _update_document}
		var _flags = {'multi' : true}

		db.collection('hits').update(_query, _update_query, _flags, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else {
				_callback(_passthrough)
			}
		})
	},


	generate_id: function() {
		return new mongoskin.ObjectID()
	},


	get_phrases_by_project_id_and_question_id: function(_project_id, _question_id, _callback, _error_callback, _passthrough) {

		var _query = {'project_id' : new mongoskin.ObjectID(_project_id), 'question_id' : new mongoskin.ObjectID(_question_id)}
		
		db.collection('phrases').find(_query).sort({'num_patients': -1, 'count' : -1}).limit(40).toArray( function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else {
				_callback(_result, _passthrough)
			}
		})
	},


	delete_phrase: function(_phrase_id, _callback, _error_callback, _passthrough) {
		var _query = {'_id' : _phrase_id}

		db.collection('phrases').remove(_query, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else {
				_callback(_passthrough)
			}
		})
	},


	delete_annotations_with_phrase_id: function(_phrase_id, _callback, _error_callback, _passthrough) {

		_phrase_id = new mongoskin.ObjectID(_phrase_id)

		var _query        = {}
		var _update_query = {$pull : {'annotations' : {'phrase_ids' : _phrase_id}}}
		var _flags        = {multi : true}

		db.collection('hits').update(_query, _update_query, _flags, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else {
				_callback(_passthrough)
			}
		})
	},


	delete_hits_with_empty_annotations: function(_callback, _error_callback, _passthrough) {

		// See which hits have empty annotations
		var _query = {'annotations.0' : {$exists: false}}

		db.collection('hits').remove(_query, function(_err, _result) {
				if (_err) {
					_error_callback(_err, _passthrough)
				}
				else {
					_callback(_passthrough)
				}
		})
	},


	insert: function(_document, _callback, _error_callback, _passthrough) {

		_document.project_id  = new mongoskin.ObjectID(_document.project_id)
		_document.question_id = new mongoskin.ObjectID(_document.question_id)

		db.collection('phrases').insert(_document, function(_err, _result) {
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
}



function _get_hits_by_phrase_id(_phrase_id, _callback, _error_callback, _passthrough) {

	var _query        = {'annotations' : {$elemMatch : { 'phrase_ids' : _phrase_id}}}	

	db.collection('hits').find(_query, _update_query, _flags, function(_err, _result) {
		if (_err) {
			_error_callback(_err, _passthrough)
		}
		else {
			_callback(_passthrough)
		}
	})
}

*/

