var config             = require('../config.js')

module.exports = {

	get_settings: function(_callback, _error_callback, _passthrough) {
		var _settings = {}
		_settings['use_ldap'] = config.use_ldap
		_callback(_settings, _passthrough)
	}
}