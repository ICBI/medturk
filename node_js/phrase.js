var config     = require('./config.js')
var mongoskin  = require('mongoskin')
var db         = mongoskin.db(config.db_url)


module.exports = {

	generate_id: function() {
		return new mongoskin.ObjectID()
	},

	get_phrases_by_project_id_and_question_id: function(_project_id, _question_id, _callback, _error_callback, _passthrough) {

		var _query = {'project_id' : new mongoskin.ObjectID(_project_id), 'question_id' : new mongoskin.ObjectID(_question_id)}
		
		db.collection('phrases').find(_query).sort({'num_patients': -1, 'count' : -1}).limit(40).toArray( function(err, result) {
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

		_document.project_id  = new mongoskin.ObjectID(_document.project_id)
		_document.question_id = new mongoskin.ObjectID(_document.question_id)

		db.collection('phrases').insert(_document, function(err, result) {
			if (err) throw err

			if (result) {
				_callback(result[0], _passthrough)
			}
			else {
				_error_callback(err, _passthrough)
			}
		})
	},


	bulk_answer: function(_phrase_id, _choice_id, _frequency, _user_id, _callback, _error_callback, _passthrough) {

		console.log('bulk_answer')

		_choice_id = new mongoskin.ObjectID(_choice_id)
		_phrase_id = new mongoskin.ObjectID(_phrase_id)

	
		function bulk_answer_once_with_choice_id_callback() {
			console.log('bulk_answer_once_with_choice_id_callback')
			delete_phrase(_phrase_id, _callback, _error_callback, _passthrough)
		}

		function bulk_answer_once_with_choice_id_error_callback(_err) {
			_error_callback(_err, _passthrough)
		}

		/* If frequency = 'multiple'
			1. Find all annotations with this phrase id
			2. Update annotations with this answer choice. Set 'bulk_answered' : true'
			3. If all annotations have been answered...
				Set 'answered' = true, 'user' : current_user
			4. Delete this phrase id
		*/

		if (_frequency == 'once') {
			/*
			1. Find all hits with this phrase id
			2. Update hit with this answer choice
			3. Set 'answered' = true, 'user' : current_user, 'bulk_answered : true'
			4. Delete this phrase id
			*/

			console.log('once')
			bulk_answer_once_with_choice_id(_phrase_id, _choice_id, _user_id, bulk_answer_once_with_choice_id_callback, bulk_answer_once_with_choice_id_error_callback)
		}
		else if(_frequency == 'multiple') {
			/*
			1. Find all annotations with this phrase id
			2. Update annotations with this answer choice. Set 'bulk_answered' : true'
			3. If all annotations have been answered...
				Set 'answered' = true, 'user' : current_user
			4. Delete this phrase id
			*/
		}
		else {
			throw new Error('Unrecognized frequency type')
		}
	},

	not_applicable: function(_phrase_id, _callback, _error_callback, _passthrough) {
		/*
			1. Deletes any annotation with a reference to this phrase
			2. Ensures if annotations become empty, that hit is deleted
			3. Deletes phrase from phrase collection
		*/

		_phrase_id = new mongoskin.ObjectID(_phrase_id)

		function delete_empty_hits_callback() {
			delete_phrase(_phrase_id, _callback, _error_callback, _passthrough)
		}


		function delete_empty_hits_error_callback(_err) {
			_error_callback(_err, _passthrough)
		}
		

		function delete_annotations_callback() {
			delete_hits_with_empty_annotations(delete_empty_hits_callback, delete_empty_hits_error_callback)
		}


		function delete_annotations_error_callback(_err) {
			_error_callback(err, _passthrough)
		}

		delete_annotations_with_phrase_id(_phrase_id, delete_annotations_callback, delete_annotations_error_callback)
	},


	ignore: function(_phrase_id, _callback, _error_callback, _passthrough) {
		/*
			Deletes phrase from phrase collection
		*/

		_phrase_id = new mongoskin.ObjectID(_phrase_id)

	
		delete_phrase(_phrase_id, _callback, _error_callback, _passthrough)
	}
}


function bulk_answer_once_with_choice_id(_phrase_id, _choice_id, _user_id, _callback, _error_callback) {
	/*
		1. Find all hits with this phrase id
		2. Update hit with this answer choice
		3. Set 'answered' = true, 'user' : current_user, 'bulk_answered : true'
		4. Delete this phrase id
	*/

	console.log('bulk_answer_once_with_choice_id')

	var _query        = {'annotations' : {$elemMatch : { 'phrase_ids' : _phrase_id}}}
	console.log(_query)
	var _update_query = {$set : {'choice_id' : _choice_id, 'answered' : true, 'bulk_answered' : true, 'user_id' : _user_id, 'answered_date' : Date()}}
	var _flags = {'multi' : true}

	db.collection('hits').update(_query, _update_query, _flags, function(err, result) {
		if (err) {
			_error_callback(err)
		}
		else {
			console.log('result')
			console.log(result)
			_callback()
		}
	})
}


function delete_phrase(_phrase_id, _callback, _error_callback, _passthrough) {
	var _query = {'_id' : _phrase_id}

	db.collection('phrases').remove(_query, function(err, result) {
		if (err) {
			_error_callback(err, _passthrough)
		}

		_callback(_passthrough)
	})
}



function delete_annotations_with_phrase_id(_phrase_id, _callback, _error_callback) {

	var _query        = {}
	var _update_query = {$pull : {'annotations' : {'phrase_ids' : _phrase_id}}}
	var _flags        = {multi : true}

	db.collection('hits').update(_query, _update_query, _flags, function(err, result) {
		if (err) throw err

		if (result) {
			_callback()
		}
		else {
			_error_callback(err)
		}
	})
}




function delete_hits_with_empty_annotations(_callback, _error_callback) {

	// See which hits have empty annotations
	var _query = {'annotations.0' : {$exists: false}}

	db.collection('hits').remove(_query, function(err, result) {
			if (err) {
				_error_callback(err)
			}

			_callback()
	})
}






