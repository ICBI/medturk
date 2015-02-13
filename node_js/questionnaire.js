var config     = require('./config.js')
var mongoskin  = require('mongoskin')
var db         = mongoskin.db(config.db_url)


module.exports = {

	 get: function(_questionnaire_id, _callback, _error_callback, _passthrough) {

		var _query = {'_id' : new mongoskin.ObjectID(_questionnaire_id)}

		db.collection('questionnaires').findOne(_query, function(err, _questionnaire) {
			if (err) throw err

			if (_questionnaire) {
				_callback(_questionnaire, _passthrough)
			}
			else {
				_error_callback(err, _passthrough)
			}
		})
	},


	insert: function(_questionnaire, _callback, _error_callback, _passthrough) {

		// Remove current id
  		delete _questionnaire['_id']

  		_questionnaire['name'] += ' (uploaded)'

  		// Replaces string ids from previous model and replaces them with new BSON Ids
  		for (var i = 0; i < _questionnaire.questions.length; i++) {
  			_questionnaire.questions[i]['_id'] = new mongoskin.ObjectID()

  			for (var j = 0; j < _questionnaire.questions[i].tag_ids.length; j++) {
  				_questionnaire.questions[i].tag_ids[j] = new mongoskin.ObjectID()
  			}

  			for (var j = 0; j < _questionnaire.questions[i].choices.length; j++) {
  				_questionnaire.questions[i].choices[j]['_id'] = new mongoskin.ObjectID()
  			}

  			for (var j = 0; j < _questionnaire.questions[i].triggers.length; j++) {
  				_questionnaire.questions[i].triggers[j]['_id'] = new mongoskin.ObjectID()
  			}
  		}

  		for (var i = 0; i < _questionnaire.tags.length; i++) {
  			_questionnaire.tags[i]['_id'] = new mongoskin.ObjectID()
  		}


		// Insert and return inserted document to user
		db.collection('questionnaires').insert(_questionnaire, function(err, result) {
			if (err) {
				_error_callback(err, _passthrough)
			}
			else {
				_callback(result[0]._id, _passthrough)
			}
		})
	}
}



