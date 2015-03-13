var mongoskin  = require('mongoskin')
var db = require('./database.js').db()

module.exports = {
	get_by_project_id: function(_project_id, _callback, _error_callback, _passthrough) {

		var _query  = {'_id' : new mongoskin.ObjectID(_project_id)}

		db.collection('projects').findOne(_query, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else {
				_callback(_result, _passthrough)
			}
		})
	},


	get_all_projects: function(_callback, _error_callback, _passthrough) {
		db.collection('projects').find().toArray(function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else {
				_callback(_result, _passthrough)
			}
		})
	},


	get_projects_by_user_id: function(_user_id, _callback, _error_callback, _passthrough) {

		var _query = {'user_ids' : { '$in' : [new mongoskin.ObjectID(_user_id)]}}

		db.collection('projects').find(_query).toArray(function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else if(_result) {
				_callback(_result, _passthrough)
			}
			else {
				_error_callback(null, _passthrough)
			}
		})
	},


	delete_user_id: function(_project_id, _user_id, _callback, _error_callback, _passthrough) {

		var arg1 = {'_id' : new mongoskin.ObjectID(_project_id)}
		var arg2 = {$pull : {'user_ids' : new mongoskin.ObjectID(_user_id)}}

		db.collection('projects').update(arg1, arg2, function(_err, _result) {
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


	delete_project: function(_project_id, _callback, _error_callback, _passthrough) {

		var _query = {'_id' : new mongoskin.ObjectID(_project_id)}

		db.collection('projects').remove(_query, function(_err, _result) {
			if (_err) {
				_error_callback(_err, _passthrough)
			}
			if (_result) {
				_callback(_passthrough)
			}
			else {
				_error_callback(_err, _passthrough)
			}
		})
	},


	update_status: function(_project_id, _status, _callback, _error_callback, _passthrough) {

		var arg1 = {'_id' : new mongoskin.ObjectID(_project_id)}
		var arg2 = {'$set' : {'status' : _status}}

		db.collection('projects').update(arg1, arg2, function(_err, _result) {
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



	update_project_name: function(_project_id, _project_name, _callback, _error_callback, _passthrough) {

		var arg1 = {'_id' : new mongoskin.ObjectID(_project_id)}
		var arg2 = {'$set' : {'name' : _project_name}}

		db.collection('projects').update(arg1, arg2, function(_err, _result) {
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


	update_dataset_id: function(_project_id, _dataset_id, _callback, _error_callback, _passthrough) {

		var arg1 = {'_id' : new mongoskin.ObjectID(_project_id)}
		var arg2 = {'$set' : {'dataset_id' : new mongoskin.ObjectID(_dataset_id)}}
		
		db.collection('projects').update(arg1, arg2, function(_err, _result) {
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



	update_questionnaire_id: function(_project_id, _questionnaire_id, _callback, _error_callback, _passthrough) {

		var arg1 = {'_id' : new mongoskin.ObjectID(_project_id)}
		var arg2 = {'$set' : {'questionnaire_id' : new mongoskin.ObjectID(_questionnaire_id)}}
		
		db.collection('projects').update(arg1, arg2, function(_err, _result) {
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


	update_project_description: function(_project_id, _project_description, _callback, _error_callback, _passthrough) {

		var arg1 = {'_id' : new mongoskin.ObjectID(_project_id)}
		var arg2 = {'$set' : {'description' : _project_description}}
		
		db.collection('projects').update(arg1, arg2, function(_err, _result) {
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


	add_user: function(_project_id, _user_id, _callback, _error_callback, _passthrough) {

		var arg1 = {'_id' : new mongoskin.ObjectID(_project_id)}
		var arg2 = {'$push' : {'user_ids' : new mongoskin.ObjectID(_user_id)}}

		db.collection('projects').update(arg1, arg2, function(_err, _result) {
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


	create_project: function(_name, _description, _dataset_id, _questionnaire_id, _user_ids, _status, _num_hits, _num_answers, _callback, _error_callback, _passthrough) {
		
		var doc = {
				  'name'              : _name, 
				  'description'       : _description,
				  'dataset_id'        : _dataset_id,
				  'questionnaire_id'  : _questionnaire_id,
				  'user_ids'          : _user_ids,
				  'status'            : _status,
				  'num_hits'		  : _num_hits,
				  'num_answers'		  : _num_answers
		}

		// Insert and return inserted document to user
		db.collection('projects').insert(doc, function(_err, result) {

			if (_err) {
				_error_callback(_err, _passthrough)
			}
			else {
				_callback(result[0], _passthrough)
			}
		})
	}
}






