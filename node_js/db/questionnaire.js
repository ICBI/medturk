var mongoskin  = require('mongoskin')
var db = require('./database.js').db()

module.exports = {

	generate_id: function() {
		return new mongoskin.ObjectID()
	},

	update_question_type: function(_questionnaire_id, _question_id, _type, _callback, _error_callback, _passthrough) {

		_questionnaire_id = new mongoskin.ObjectID(_questionnaire_id)
		_question_id      = new mongoskin.ObjectID(_question_id)

		var arg1 = {'_id' : _questionnaire_id, "questions" : {$elemMatch : {'_id' : _question_id}}}
		var arg2 = { $set : {"questions.$.type" : _type}}

		db.collection('questionnaires').update(arg1, arg2, function(_err, _result) {
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


	update_question_frequency: function(_questionnaire_id, _question_id, _frequency, _callback, _error_callback, _passthrough) {

		_questionnaire_id = new mongoskin.ObjectID(_questionnaire_id)
		_question_id      = new mongoskin.ObjectID(_question_id)

		var arg1 = {'_id' : _questionnaire_id, "questions" : {$elemMatch : {'_id' : _question_id}}}
		var arg2 = { $set : {"questions.$.frequency" : _frequency}}

		db.collection('questionnaires').update(arg1, arg2, function(_err, _result) {
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


	update_question_choice_name: function(_questionnaire_id, _question_id, _choice_id, _name, _callback, _error_callback, _passthrough) {

		_questionnaire_id = new mongoskin.ObjectID(_questionnaire_id)
		_question_id      = new mongoskin.ObjectID(_question_id)

		// [1] Only retrieve the question portion of the questionnaire
		// [2] Update choice porition of the question
		// [3] Update the question subdocument in the questionnaire

		// Query for the questionnaire
		var arg1 = {'_id' : _questionnaire_id}

		// But only return the question
		var arg2 = {_id: 0, questions: {$elemMatch: {_id:  _question_id}}}

		// Fetch the question
		db.collection('questionnaires').findOne(arg1, arg2, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				
				var question = _result.questions[0]
				var choice = undefined

				for (i = 0; i < question.choices.length; i++) {
					if (question.choices[i]._id == _choice_id) {
						choice = question.choices[i]
						break
					}
				}

				if (choice == undefined) {
					_error_callback(null, _passthrough)
				}
				else {

					// Now we can update the choice name
					choice.name = _name

					arg1 = {'_id' : _id, "questions" : {$elemMatch : {'_id' : question_id}}}
					arg2 = { $set : {"questions.$" : question}}

					db.collection('questionnaires').update(arg1, arg2, function(_err, _result) {
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
				}
				
			}
			else {
				_error_callback(null, _passthrough)
			}
		})
	},


	update_question_name: function(_questionnaire_id, _question_id, _name, _callback, _error_callback, _passthrough) {
		
		_questionnaire_id = new mongoskin.ObjectID(_questionnaire_id)
		_question_id      = new mongoskin.ObjectID(_question_id)

		var arg1 = {'_id' : _questionnaire_id, "questions" : {$elemMatch : {'_id' : _question_id}}}
		var arg2 = { $set : {"questions.$.question" : _name}}

		db.collection('questionnaires').update(arg1, arg2, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				_callback(_passthrough)
			}
			else {
				_error_callback(null, _passthrough)
			}
		})
	},


	update_tag_name: function(_questionnaire_id, _tag_id, _name, _callback, _error_callback, _passthrough) {

		_tag_id = new mongoskin.ObjectID(_tag_id)

		var arg1 = {'_id' : new mongoskin.ObjectID(_questionnaire_id), "tags" : {$elemMatch : {'_id' : _tag_id}}}
		var arg2 = { $set : {"tags.$.name" : _name}}

		db.collection('questionnaires').update(arg1, arg2, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				_callback(_passthrough)
			}
			else {
				_error_callback(null, _passthrough)
			}
		})
	},


	update_name: function(_questionnaire_id, _name, _callback, _error_callback, _passthrough) {

		var arg1 = {'_id' : new mongoskin.ObjectID(_questionnaire_id)}
		var arg2 = {'$set' : {'name' : _name}}

		db.collection('questionnaires').update(arg1, arg2, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				_callback(_passthrough)
			}
			else {
				_error_callback(null, _passthrough)
			}
			
		})
	},


	update_description: function(_questionnaire_id, _description, _callback, _error_callback, _passthrough) {

		var arg1 = {'_id' : new mongoskin.ObjectID(_questionnaire_id)}
		var arg2 = {'$set' : {'description' : _description}}

		db.collection('questionnaires').update(arg1, arg2, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				_callback(_passthrough)
			}
			else {
				_error_callback(null, _passthrough)
			}
			
		})
	},


	insert_questionnaire: function(_questionnaire, _callback, _error_callback, _passthrough) {

		db.collection('questionnaires').insert(_questionnaire, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else {
				_callback({'_id' : _result[0]._id}, _passthrough)
			}
		})
	},

	get_by_id: function(_questionnaire_id, _callback, _error_callback, _passthrough) {

		var _query = {'_id' : new mongoskin.ObjectID(_questionnaire_id)}

		db.collection('questionnaires').findOne(_query, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else {
				_callback(_result, _passthrough)
			}
		})
	},


	get_all_questionnaires: function(_callback, _error_callback, _passthrough) {
		db.collection('questionnaires').find().toArray(function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else {
				_callback(_result, _passthrough)
			}
		})
	},


	create_tag: function(_questionnaire_id, _tag_name, _callback, _error_callback, _passthrough) {

		var arg1 = {'_id' : new mongoskin.ObjectID(_questionnaire_id)}

		db.collection('questionnaires').findOne(arg1, function(err, result) {
			if (err) throw err
			
			// Add this tag to the current collection
			var tag = {'_id' : new mongoskin.ObjectID(), 'name' : _tag_name}
			result.tags.push(tag)

			var arg2 = {'$set' : {'tags' : result.tags}}

			db.collection('questionnaires').update(arg1, arg2, function(_err, _result) {
				if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				_callback(tag, _passthrough)
			}	
			else {
				_error_callback(null, _passthrough)
			}
			})
		})
	},


	create_trigger: function(_questionnaire_id, _question_id, _trigger_name, _case_sensitive, _callback, _error_callback, _passthrough) {
		
		_questionnaire_id = new mongoskin.ObjectID(_questionnaire_id)
		_question_id      = new mongoskin.ObjectID(_question_id)

		var doc  = {'_id' : new mongoskin.ObjectID(), 'name' : _trigger_name, 'case_sensitive' : _case_sensitive}

		var arg1 = {'_id' : _questionnaire_id, "questions" : {$elemMatch : {'_id' : _question_id}}}
		var arg2 = { $push: { 'questions.$.triggers' : doc } }

		db.collection('questionnaires').update(arg1, arg2, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				_callback(doc, _passthrough)
			}	
			else {
				_error_callback(null, _passthrough)
			}
		})
	},


	insert_question_tag_id: function(_questionnaire_id, _question_id, _tag_id, _callback, _error_callback, _passthrough) {
		
		_questionnaire_id = new mongoskin.ObjectID(_questionnaire_id)
		_question_id      = new mongoskin.ObjectID(_question_id)
		_tag_id           = new mongoskin.ObjectID(_tag_id)

		var doc  = _tag_id

		var arg1 = {'_id' : _questionnaire_id, "questions" : {$elemMatch : {'_id' : _question_id}}}
		var arg2 = { $push: { 'questions.$.tag_ids' : doc } }

		db.collection('questionnaires').update(arg1, arg2, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				_callback(doc, _passthrough)
			}	
			else {
				_error_callback(null, _passthrough)
			}
		})
	},

	create_question_choice: function(_questionnaire_id, _question_id, _name, _callback, _error_callback, _passthrough) {

		_questionnaire_id = new mongoskin.ObjectID(_questionnaire_id)
		_question_id      = new mongoskin.ObjectID(_question_id)

		var doc  = {'_id' : new mongoskin.ObjectID(), 'name' : _name}

		var arg1 = {'_id' : _questionnaire_id, "questions" : {$elemMatch : {'_id' : _question_id}}}
		var arg2 = { $push: { 'questions.$.choices' : doc } }

		db.collection('questionnaires').update(arg1, arg2, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				_callback(doc, _passthrough)
			}	
			else {
				_error_callback(null, _passthrough)
			}
		})
	},


	create_question: function(_questionnaire_id, _question, _type, _frequency, _tag_ids, _choices, _triggers, _callback, _error_callback, _passthrough) {

		var doc = {'_id'       : new mongoskin.ObjectID(), 
				  'question'   : _question, 
				  'type'       : _type, 
				  'frequency'  : _frequency, 
				  'tag_ids'    : _tag_ids, 
				  'choices'    : _choices, 
				  'triggers'   : _triggers}
		

		var arg1 = {'_id' : new mongoskin.ObjectID(_questionnaire_id)}
		var arg2 = { $push: { 'questions' : doc } }

		db.collection('questionnaires').update(arg1, arg2, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				_callback(doc, _passthrough)
			}	
			else {
				_error_callback(null, _passthrough)
			}
		})
	},


	create_questionnaire: function(_questionnaire_name, _questionnaire_description, _questions, _tags, _callback, _error_callback, _passthrough) {
		
		var doc = {'name' : _questionnaire_name, 
				  'description' : _questionnaire_description, 
				  'questions' : _questions, 
				  'tags' :_tags}

		db.collection('questionnaires').insert(doc, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if(_result) {
				_callback(_result[0], _passthrough)
			}
			else {
				_error_callback(null, _passthrough)
			}
		})
	},



	delete_question: function(_questionnaire_id, _question_id, _callback, _error_callback, _passthrough) {
		
		var arg1 = {'_id' : new mongoskin.ObjectID(_questionnaire_id)}
		var arg2 = {$pull : {'questions' : {'_id': new mongoskin.ObjectID(_question_id)} }}

		db.collection('questionnaires').update(arg1, arg2, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if(_result) {
				_callback(_passthrough)
			}
			else {
				_error_callback(null, _passthrough)
			}
		})
	},


	delete_tag: function(_questionnaire_id, _tag_id, _callback, _error_callback, _passthrough) {
		
		var arg1 = {'_id' : new mongoskin.ObjectID(_questionnaire_id)}
		var arg2 = {$pull : {'tags' : {'_id': new mongoskin.ObjectID(_tag_id)} }}

		db.collection('questionnaires').update(arg1, arg2, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if(_result) {
				_callback(_passthrough)
			}
			else {
				_error_callback(null, _passthrough)
			}
		})
	},


	delete_questionnaire: function(_questionnaire_id, _callback, _error_callback, _passthrough) {

		var arg = {'_id' : new mongoskin.ObjectID(_questionnaire_id)}

		db.collection('questionnaires').remove(arg, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if(_result) {
				_callback(_passthrough)
			}
			else {
				_error_callback(null, _passthrough)
			}
		})
	},


	delete_question_choice: function(_questionnaire_id, _question_id, _choice_id, _callback, _error_callback, _passthrough) {

		_questionnaire_id = new mongoskin.ObjectID(_questionnaire_id)
		_question_id      = new mongoskin.ObjectID(_question_id)

		// [1] Only retrieve the question portion of the questionnaire
		// [2] Update choice porition of the question
		// [3] Update the question subdocument in the questionnaire

		// Query for the questionnaire
		var arg1 = {'_id' : _questionnaire_id}

		// But only return the question
		var arg2 = {_id: 0, questions: {$elemMatch: {_id:  _question_id}}}

		// Fetch the question
		db.collection('questionnaires').findOne(arg1, arg2, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				var question = _result.questions[0]
				var choice_index = undefined

				for (i = 0; i < question.choices.length; i++) {
					if (question.choices[i]._id == _choice_id) {
						choice_index = i
			
						break
					}
				}


				if (choice_index == undefined) {
					_error_callback(null, _passthrough)
				}
				else {

					// Now we can remove the choice
					question.choices.splice(choice_index, 1)

					arg1 = {'_id' : _questionnaire_id, "questions" : {$elemMatch : {'_id' : _question_id}}}
					arg2 = { $set : {"questions.$" : question}}

					db.collection('questionnaires').update(arg1, arg2, function(_err, _result) {
						if (_err) {
							_error_callback(_err, _passthrough)
						}
						else if (_result) {
							_callback(_passthrough)
						}
						else {
							_error_callback(null, _passthrough)
						}
						
					})
				}
				
			}
			else {
				// Couldn't find it
				_error_callback(null, _passthrough)
			}
		})

	},


	delete_question_trigger: function(_questionnaire_id, _question_id, _trigger_id, _callback, _error_callback, _passthrough) {

		_questionnaire_id = new mongoskin.ObjectID(_questionnaire_id)
		_question_id 	  = new mongoskin.ObjectID(_question_id)

		// [1] Only retrieve the question portion of the questionnaire
		// [2] Update choice porition of the question
		// [3] Update the question subdocument in the questionnaire

		// Query for the questionnaire
		var arg1 = {'_id' : _questionnaire_id}

		// But only return the question
		var arg2 = {_id: 0, questions: {$elemMatch: {_id:  _question_id}}}

		// Fetch the question
		db.collection('questionnaires').findOne(arg1, arg2, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				var question = _result.questions[0]
				var trigger_index = undefined

				for (i = 0; i < question.triggers.length; i++) {
					if (question.triggers[i]._id == _trigger_id) {
						trigger_index = i
						break
					}
				}


				if (trigger_index == undefined) {
					_error_callback(null, _passthrough)
				}
				else {

					// Now we can remove the choice
					question.triggers.splice(trigger_index, 1)

					arg1 = {'_id' : _questionnaire_id, "questions" : {$elemMatch : {'_id' : _question_id}}}
					arg2 = { $set : {"questions.$" : question}}

					db.collection('questionnaires').update(arg1, arg2, function(err, result) {
						if (_err) {
							_error_callback(_err, _passthrough)
						}
						else if (result) {
							_callback(_passthrough)
						}
						else {
							_error_callback(null, _passthrough)
						}
						
					})
				}
				
			}
			else {
				// Couldn't find it
				_error_callback(null, _passthrough)
			}
		})
	},


	delete_question_tag: function(_questionnaire_id, _question_id, _tag_id, _callback, _error_callback, _passthrough) {

		_questionnaire_id = new mongoskin.ObjectID(_questionnaire_id)
		_question_id      = new mongoskin.ObjectID(_question_id)

		// [1] Only retrieve the question portion of the questionnaire
		// [2] Update tag portion of the question
		// [3] Update the question subdocument in the questionnaire

		// Query for the questionnaire
		var arg1 = {'_id' : _questionnaire_id}

		// But only return the question
		var arg2 = {_id: 0, questions: {$elemMatch: {_id:  _question_id}}}

		// Fetch the question
		db.collection('questionnaires').findOne(arg1, arg2, function(_err, _result) {
			if (_err) {
				_error_callback(null, _passthrough)
			}
			else if (_result) {
				// RMJ
				var question = _result.questions[0]
				var tag_index = undefined

				for (i = 0; i < question.tag_ids.length; i++) {
					if (question.tag_ids[i] == _tag_id) {
						tag_index = i
						break
					}
				}


				if (tag_index == undefined) {
					return res.sendStatus(404)
				}
				else {

					// Now we can remove the tag
					question.tag_ids.splice(tag_index, 1)

					arg1 = {'_id' : _questionnaire_id, "questions" : {$elemMatch : {'_id' : _question_id}}}
					arg2 = { $set : {"questions.$" : question}}

					db.collection('questionnaires').update(arg1, arg2, function(_err, _result) {
						if (_err) {
							_error_callback(_err, _passthrough)
						}
						else if (_result) {
							_callback(_passthrough)
						}
						else {
							_error_callback(null, _passthrough)
						}
						
					})
				}
				
			}
			else {
				// Couldn't find it
				_error_callback(null, _passthrough)
			}
		})
	}


}