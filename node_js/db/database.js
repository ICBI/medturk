var config     = require('../config.js')
var mongoskin  = require('mongoskin')
var _db = undefined

module.exports = {
	db: function() {
		return _db
	},

	connect: function() {
		_db = mongoskin.db(config.db_url)
	}
}