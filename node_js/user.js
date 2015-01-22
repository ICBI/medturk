var config     = require('./config.js')
var mongoskin  = require('mongoskin')
var db         = mongoskin.db(config.db_url)


module.exports = {

	get_by_username: function(_user_name, _callback, _error_callback, _passthrough) {

		var _query  = {'username' : _user_name}

		db.collection('users').findOne(_query, function(err, result) {
			if (err) throw err

			if (result) {
				_callback(result, _passthrough)
			}
			else {
				_error_callback(err, _passthrough)
			}
		})
	},


	get_by_id: function(_id, _callback, _error_callback, _passthrough) {

		var _query  = {'_id' : new mongoskin.ObjectID(_id)}

		db.collection('users').findOne(_query, function(err, result) {
			if (err) throw err

			if (result) {
				_callback(result, _passthrough)
			}
			else {
				_error_callback(err, _passthrough)
			}
		})
	},


	update_password: function(_id, _password, _callback, _error_callback, _passthrough) {

		var _query        = {'_id' : new mongoskin.ObjectID(_id)}
		var _update_query = {'$set' : {'password' : _password}}

		db.collection('users').update(_query, _update_query, function(err, result) {
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






