var passport           = require('passport')
var user_db            = require('../db/user.js')
var LocalStrategy      = require('passport-local').Strategy
var config             = require('../config.js')
var cookieParser       = require('cookie-parser')
var bcrypt             = require('bcrypt-nodejs')
var session		  		= require('express-session')
var ldap               = undefined
var client             = undefined
var compare_passwords  = undefined
var logout 		       = undefined





module.exports = {

	modify_app: function(_app) {
		_app.use(cookieParser())
		_app.use(session({ secret: config.secret_key, 
						  saveUninitialized: true,
						  resave: true 
						}))
		_app.use(passport.initialize())
		_app.use(passport.session())
		return _app
	},

	login: function(_req, _res, _callback, _error_callback, _passthrough) {

		passport.authenticate('local', function(_err, _user, _message) {
		
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if(!_user) {
				_error_callback(_err, _passthrough)
			}
			else {
				_req.logIn(_user, function(_err) {
					_callback(_user, _passthrough)
				})
			}

		})(_req, _res)
	},

	logout: function(_req, _callback, _error_callback, _passthrough) {
		_req.logout()
		_callback()
	},


	get_by_username: function(_user_name, _callback, _error_callback, _passthrough) {
		user_db.get_by_username(_user_name, _callback, _error_callback, _passthrough)
	},

	basic_role: function(req, res, next) {

		  if (req.isAuthenticated()) { 
		  	return next() 
		  }

		  res.redirect('/login.html')
	},


	admin_role: function(req, res, next) {

	  if (req.isAuthenticated() && req.user.is_admin) { 
	  	return next() 
	  }

	  res.redirect('/login.html')
	},

	create_user: function(_username, _password, _is_admin, _callback, _error_callback, _passthrough) {
		user_db.create_user(_username, _get_hash(_password), _is_admin, _callback, _error_callback, _passthrough)
	},

	get_users_with_passwords_removed: function(_callback, _error_callback, _passthrough) {
		user_db.get_users_with_passwords_removed(_callback, _error_callback, _passthrough)
	},

	update_username: function(_id, _username, _callback, _error_callback, _passthrough) {
		user_db.update_username(_id, _username, _callback, _error_callback, _passthrough)
	},

	update_password: function(_id, _password, _callback, _error_callback, _passthrough) {
		user_db.update_password(_id, _get_hash(_password), _callback, _error_callback, _passthrough)
	},

	update_is_admin: function(_id, _is_admin, _callback, _error_callback, _passthrough) {
		user_db.update_is_admin(_id, _is_admin, _callback, _error_callback, _passthrough)
	},

	update_password_self: function(_user, _current_password, _new_password, _callback, _error_callback, _passthrough) {

		_current_password = _get_hash(_current_password)
		_new_password     = _get_hash(_new_password)

		compare_passwords(_user,
						  _user.username, 
						  _current_password, 
						  function(_passthrough){ 
						  	 user_db.update_password(_user._id, _new_password, _callback, _error_callback, _passthrough)
						  },
						  function(_err, _passthrough) {
						  	 _error_callback(null, _passthrough)
						  })
	},

	update_is_admin: function(_id, _is_admin, _callback, _error_callback, _passthrough) {
		user_db.update_is_admin(_id, _is_admin, _callback, _error_callback, _passthrough)
	},


	delete_user: function(_id, _callback, _error_callback, _passthrough) {
		user_db.delete_user(_id, _callback, _error_callback, _passthrough)
	}
}


function _get_hash(_password) {
	return bcrypt.hashSync(_password, bcrypt.genSaltSync(8))
}





passport.serializeUser(function(_user, _done) {
  	_done(null, _user._id)
})

passport.deserializeUser(function(_id, _done) {
  	
	function get_user_callback(_user, _passthrough) {
		return _done(null, _user)
	}

	function get_user_error_callback(_err, _passthrough) {
		return _done(null, false)
	}

	user_db.get_by_id(_id, get_user_callback, get_user_error_callback) 
})



if (config.use_ldap) {

	ldap   = require('ldapjs')
	client = ldap.createClient({
	  url: config.ldap_url
	})

	compare_passwords = function(_user, _username, _password, _callback, _error_callback, _passthrough) {

		client.bind('uid=' + _username + ',' + config.ldap_dn, _password, function(_err) {
	  		if(_err) {
	  			_error_callback(_err, _passthrough)
	  		}
	  		else {
	  			_callback(_passthrough)
	  		}
		})
	}

	g_logout = function(_callback, _error_callback, _passthrough) {
		if (config.use_ldap) {
			client.unbind(function(_err) {
				if (_err) {
					_error_callback(_err, _passthrough)
				}
				else {
					_callback(_passthrough)
				}
			})
		}
	}
}
else {

	compare_passwords = function(_user, _username, _password, _callback, _error_callback, _passthrough) {
		
		if (bcrypt.compareSync(_password, _user.password)) {
			_callback(_passthrough)
		}
		else {
			_error_callback(null, _passthrough)
		}
	}
}



passport.use(new LocalStrategy( {usernameField: 'username'}, function(_username, _password, _done) {

		function get_user_callback(_user, _passthrough) {

			compare_passwords(_user,
							  _username, 
							  _password, 
							  function(_passthrough){ 
							  	return _done(null, _user)
							  },
							  function(_err, _passthrough) {
							  	return _done(null, false)
							  })
		}

		function get_user_error_callback(_err, _passthrough) {
			return _done(null, false, { message: 'Invalid login' })
		}

		user_db.get_by_username(_username, get_user_callback, get_user_error_callback)
  }
))






