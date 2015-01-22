var config     = require('./config.js')
var mongoskin  = require('mongoskin')
var db         = mongoskin.db(config.db_url)


module.exports = {

	get: function(_project_id, _callback, _error_callback, _passthrough) {

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
	}
}






