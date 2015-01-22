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
	}
}






