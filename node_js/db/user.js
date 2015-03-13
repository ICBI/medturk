var mongoskin  = require('mongoskin')
var db = require('./database.js').db()

module.exports = {

	update_username: function(_id, _username, _callback, _error_callback, _passthrough) {
		
		var arg1 = {'_id' : new mongoskin.ObjectID(_id)}
		var arg2 = {'$set' : {'username' : _username}}

		db.collection('users').update(arg1, arg2, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if(_result) {
				_callback(_result, _passthrough)
			}
			else {
				_error_callback(_result, _passthrough)
			}			
		})
	},


	get_users_with_passwords_removed: function(_callback, _error_callback, _passthrough) {
		db.collection('users').find().toArray(function(_err, _result) {

			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else {
				for (var i = 0; i < _result.length; i++) {
					delete _result[i]['password']
				}

				_callback(_result, _passthrough)
			}
		})
	},

	create_user: function(_username, _password, _is_admin, _callback, _error_callback, _passthrough) {
		
		// Create user to insert
		doc = {
				  'username'          : _username, 
				  'password'		  : _password,
				  'is_admin'          : _is_admin,
		      }

		// Insert and return inserted document to user
		db.collection('users').insert(doc, function(_err, result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else {
				_callback(result[0], _passthrough)
			}
		})
	},


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


	get: function(_callback, _error_callback, _passthrough) {

		db.collection('users').find().toArray(function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				_callback(_result, _passthrough)
			}
			else {
				_error_callback(_result, _passthrough)
			}
		})
	},


	get_by_id: function(_id, _callback, _error_callback, _passthrough) {

		var _query  = {'_id' : new mongoskin.ObjectID(_id)}

		db.collection('users').findOne(_query, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				_callback(_result, _passthrough)
			}
			else {
				_error_callback(_result, _passthrough)
			}
		})
	},

	update_is_admin: function(_id, _is_admin, _callback, _error_callback, _passthrough) {
		
		var arg1 = {'_id' : new mongoskin.ObjectID(_id)}
		var arg2 = {'$set' : {'is_admin' : _is_admin}}

		db.collection('users').update(arg1, arg2, function(_err, _result) {
			if (_err) {
				_error_callback(err, _passthrough)
			}
			else if (_result) {
				_callback(_result, _passthrough)
			}
			else {
				_error_callback(_result, _passthrough)
			}
		})
	},

	update_password: function(_id, _password, _callback, _error_callback, _passthrough) {

		var _query        = {'_id' : new mongoskin.ObjectID(_id)}
		var _update_query = {'$set' : {'password' : _password}}

		db.collection('users').update(_query, _update_query, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				_callback(_result, _passthrough)
			}
			else {
				_error_callback(_result, _passthrough)
			}
		})
	},

	delete_user: function(_id, _callback, _error_callback, _passthrough) {

		var arg = {'_id' : new mongoskin.ObjectID(_id)}

		db.collection('users').remove(arg, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if (_result) {
				_callback(_result, _passthrough)
			}
			else {
				_error_callback(_result, _passthrough)
			}
		})	
	}
}






