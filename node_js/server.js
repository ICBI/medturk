var express       		= require('express')
var https         		= require('https')
var http          		= require('http')
var bodyParser    		= require('body-parser')
var config        		= require('./config.js')
var multipart     		= require('connect-multiparty')
var spawn         		= require('child_process').spawn
var app                 = express()
var jsonParser          = bodyParser.json()
var multipartMiddleware = multipart()
var fs 		      		= require('fs')
require('./db/database.js').connect()
var user 		  = require('./business/user.js')
var setting 	  = require('./business/setting.js')
var project       = require('./business/project.js')
var hit           = require('./business/hit.js')
var questionnaire = require('./business/questionnaire.js')
var phrase        = require('./business/phrase.js')
var dataset       = require('./business/dataset.js')
var record        = require('./business/record.js')

app.use(express.static(config.ui_path))
app = user.modify_app(app)

app.get('/settings', function(req, res) {

	function on_success(_settings, _passthrough) {
		res.json(_settings)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(400)
	}

	setting.get_settings(on_success, on_fail)
})



app.post('/users/login', jsonParser, function(req, res) {

	function on_login_success(_user, _passthrough) {
		res.send({'success' : true, 'is_admin' : _user.is_admin})
	}

	function on_login_failure(_err, _passthrough) {
		res.send({'success' : false, 'is_admin' : false})
	}

	user.login(req, res, on_login_success, on_login_failure)
 })


app.get('/users/logout', function(req, res) {

	function on_success(_user, _passthrough) {
		res.sendStatus(200)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(400)
	}

	user.logout(req, on_success, on_fail)
})



app.get('/users/session', function(req, res) {

	function get_user_callback(_user, _passthrough) {
			res.json(_user)
	}

	function get_user_error_callback(_err, _passthrough) {
		res.sendStatus(404)
	}

	if (req.user) {
		user.get_by_username(req.user.username, get_user_callback, get_user_error_callback) 
	}
	else {
		res.sendStatus(404)
	} 
})



app.post('/users', user.admin_role, jsonParser, function(req, res) {

	function on_success(_user, _passthrough) {
		res.json(_user)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(400)
	}

	if (req.body.username == null) {
		return res.sendStatus(400)
	}
	else if (req.body.username.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.password == null) {
		return res.sendStatus(400)
	}
	else if (req.body.password.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.is_admin == null) {
		return res.sendStatus(400)
	}
	else {

		user.create_user(req.body.username, req.body.password, req.body.is_admin, on_success, on_fail)
	}
})


app.get('/users', user.admin_role, function(req, res) {

	function on_success(_users, _passthrough) {
		res.json(_users)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(400)
	}

	user.get_users_with_passwords_removed(on_success, on_fail)
})


app.post('/users/username', user.admin_role, jsonParser, function(req, res) {

	function on_success(_result, _passthrough) {
		res.sendStatus(200)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(400)
	}


	if (req.body.id == null) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.username == null) {
		return res.sendStatus(400)
	} 
	else if (req.body.username.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		user.update_username(req.body.id, req.body.username, on_success, on_fail)
	}
})

app.post('/users/password', user.admin_role, jsonParser, function(req, res) {

	function on_success(_result, _passthrough) {
		res.sendStatus(200)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(400)
	}


	if (req.body.id == null) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.password == null) {
		return res.sendStatus(400)
	} 
	else if (req.body.password.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		user.update_password(req.body.id, req.body.password, on_success, on_fail)
	}
})

app.post('/users/self/password', user.basic_role, jsonParser, function(req, res) {

	function on_success(_user, _passthrough) {
		return res.send({'success' : true})
	}


	function on_fail(_err, _passthrough) {
		return res.send({'success' : false})
	}

	if (req.body.current_password == null) {
		return res.sendStatus(400)
	}
	else if (req.body.current_password.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.new_password == null) {
		return res.sendStatus(400)
	} 
	else if (req.body.new_password.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		user.update_password_self(req.user, req.body.current_password, req.body.new_password, on_success, on_fail)
	}
})

app.post('/users/is_admin', user.admin_role, jsonParser, function(req, res) {

	function on_success(_user, _passthrough) {
		return res.send({'success' : true})
	}

	function on_fail(_err, _passthrough) {
		return res.send({'success' : false})
	}

	if (req.body.id == null) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.is_admin == null) {
		return res.sendStatus(400)
	} 
	else {
		user.update_is_admin(req.body.id, req.body.is_admin, on_success, on_fail)
	}
})

app.delete('/users', user.admin_role, jsonParser, function(req, res) {


	function on_success(_result, _passthrough) {
		res.sendStatus(200)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}

	
	if (req.query.id == null) {
		return res.sendStatus(400)
	}
	else if (req.query.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		user.delete_user(req.query.id, on_success, on_fail)
	}
})






























app.post('/projects', user.admin_role, jsonParser, function(req, res) {


	function on_success(_result, _passthrough) {
		res.json(_result)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}

	project.create_project(on_success, on_fail)
})


app.get('/projects/download', user.admin_role, jsonParser, function(req, res) {

	function generate_csv_callback(_csv_string) {
		res.attachment('project.csv')
    	res.setHeader('Content-Type', 'text/csv')
    	res.end(_csv_string)
	}

	function generate_csv_error_callback() {
		return res.sendStatus(400)
	}


	if (!req.query.project_id) {
		return res.sendStatus(400)
	}
	else if (req.query.project_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		project.generate_csv(req.query.project_id, generate_csv_callback, generate_csv_error_callback)
	}
})




// curl -v -H "Content-Type: application/json" -XPOST --data "{\"project_id\" : \"548b49fbf694066a0779dd50\", \"user_id\" : \"123\"}" https://localhost/projects/user --insecure
app.post('/projects/id/user', user.admin_role, jsonParser, function(req, res) {


	function on_success(_result, _passthrough) {
		res.sendStatus(200)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}


	if (!req.body.id) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (!req.body.user_id) {
		return res.sendStatus(400)
	} 
	else if (req.body.user_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		project.add_user(req.body.id, req.body.user_id, on_success, on_fail)
	}
})




app.post('/projects/id/name', user.admin_role, jsonParser, function(req, res) {

	function on_success(_result, _passthrough) {
		res.sendStatus(200)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}


	if (!req.body.id) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (!req.body.name) {
		return res.sendStatus(400)
	} 
	else if (req.body.name.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		project.update_project_name(req.body.id, req.body.name, on_success, on_fail)
	}
})




app.post('/projects/id/description', user.admin_role, jsonParser, function(req, res) {


	function on_success(_result, _passthrough) {
		res.sendStatus(200)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}

	if (!req.body.id) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (!req.body.description) {
		return res.sendStatus(400)
	} 
	else {
		project.update_project_description(req.body.id, req.body.description, on_success, on_fail)
	}
})



app.post('/projects/id/dataset_id', user.admin_role, jsonParser, function(req, res) {

	function on_success(_result, _passthrough) {
		res.sendStatus(200)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}


	if (!req.body.id) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (!req.body.dataset_id) {
		return res.sendStatus(400)
	} 
	else if (req.body.dataset_id.trim().length == 0) {
		return res.sendStatus(400)
	} 
	else {
		project.update_dataset_id(req.body.id, req.body.dataset_id, on_success, on_fail)
	}
})




app.post('/projects/id/questionnaire_id', user.admin_role, jsonParser, function(req, res) {

	function on_success(_result, _passthrough) {
		res.sendStatus(200)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}


	if (!req.body.id) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (!req.body.questionnaire_id) {
		return res.sendStatus(400)
	} 
	else if (req.body.questionnaire_id.trim().length == 0) {
		return res.sendStatus(400)
	} 
	else {
		project.update_questionnaire_id(req.body.id, req.body.questionnaire_id, on_success, on_fail)
	}
})




app.delete('/projects', user.admin_role, jsonParser, function(req, res) {

	var calls_completed   = 0
	var calls_to_complete = 2


	function on_callback() {
		calls_completed += 1
		if (calls_completed == calls_to_complete) {
			return res.sendStatus(200)
		}
	}

	function hit_delete_callback(_passthrough) {
		on_callback()

	}


	function hit_delete_error_callback(_err, _passthrough) {
		on_callback()
	}



	function project_delete_callback(_passthrough) {
		on_callback()
	}


	function project_delete_error_callback(_err, _passthrough) {
		on_callback()
	}

	if (!req.query.id) {
		return res.sendStatus(400)
	}
	else if (req.query.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {

		project.delete_project(req.query.id, project_delete_callback, project_delete_error_callback)
		hit.delete_by_project_id(req.query.id, hit_delete_callback, hit_delete_error_callback)
	}
})


app.delete('/projects/id/user', user.admin_role, jsonParser, function(req, res) {

	function on_success(_result, _passthrough) {
		res.sendStatus(200)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}


	if (!req.query.id) {
		return res.sendStatus(400)
	}
	else if (req.query.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (!req.query.user_id) {
		return res.sendStatus(400)
	}
	else if (req.query.user_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		project.delete_user_id(req.body.id, req.query.user_id, on_success, on_fail)
	}
})


app.get('/projects', user.basic_role, function(req, res) {

	function on_success(_projects, _passthrough) {
		res.json(_projects)
	}

	function on_fail(_projects, _passthrough) {
		res.sendStatus(404)
	}
	
	if (req.user.is_admin) {
		project.get(on_success, on_fail)
	}
	else {
		project.get_by_user_id(req.user._id, on_success, on_fail)
	}
})



app.get('/projects/id', user.basic_role, function(req, res) {

	function on_success(_project, _passthrough) {
		res.json(_project)
	}

	function on_fail(_project, _passthrough) {

	}

	if (!req.query.id) {
		return res.sendStatus(400)
	}
	else if (req.query.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		project.get_by_project_id(req.query.id, on_success, on_fail)
	}

})


app.get('/datasets', user.admin_role, function(req, res) {

	function on_success(_result, _passthrough) {
		res.json(_result)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}

	dataset.get_all_datasets(on_success, on_fail)
})

app.get('/datasets/raw', user.admin_role, function(req, res) {

	function on_success(_result, _passthrough) {
		res.json(_result)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}

	dataset.get_dataset_folders(on_success, on_fail)
})


app.get('/datasets/id', user.admin_role, function(req, res) {

	function on_success(_result, _passthrough) {
		res.json(_result)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}


	if (!req.query.id) {
		return res.sendStatus(400)
	}
	else if (req.query.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		dataset.get_dataset_by_id(req.query.id, on_success, on_fail)
	}
})



app.post('/datasets', user.admin_role, jsonParser, function(req, res) {


	function on_success(_result, _passthrough) {
		res.json(_result)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}


	if (!req.body.name) {
		return res.sendStatus(400)
	}
	else if (req.body.name.trim().length == 0) {
		return res.sendStatus(400)
	}
	if (req.body.folder == null) {
		return res.sendStatus(400)
	}
	else if (req.body.folder.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.description == null) {
		return res.sendStatus(400)
	}
	else {
		dataset.create_dataset(req.body.name, req.body.description, req.body.folder, on_success, on_fail)
	}
})


app.get('/datasets/id/build', user.admin_role, jsonParser, function(req, res) {
	/*
		Reads in patient .json files and stores them in the db.patients and db.records
		The OS has an upper limit on how many file descriptors can exist at once.
		"ulimit -n" is the command that reports what this upper limit is.

	*/

	function send_json_to_user(_json, _callback) {
		res.write('data: ' + _json + '\n\n')
		_callback()
	}


	// Used for SSE (server sent events)
	req.socket.setTimeout(Infinity)

	
	res.writeHead(200, 
						{
								"Content-Type"  : "text/event-stream", 
								"Cache-Control" : "no-cache", 
								"Connection"    : "keep-alive"
						})

	
	if (!req.query.id) {
		return res.sendStatus(400)
	}
	else if (req.query.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
	
		_child_process = spawn('node', ['./processes/build_dataset.js', req.query.id])
		
		_child_process.stdout.on('data', function(data) {
			
			_json = JSON.parse(data)
			
			send_json_to_user(data, function() {
				
				if (_json.status == 'Active') {
					_child_process.kill('SIGINT')
				}
			})
		})
		
		_child_process.stderr.on('data', function(data) {
		})

		_child_process.on('close', function(code) {
		    
		})
	}
})



app.post('/datasets/name', user.admin_role, jsonParser, function(req, res) {


	function on_success(_result, _passthrough) {
		res.json(_result)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}


	if (req.body.id == null) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.name == null) {
		return res.sendStatus(400)
	} 
	else if (req.body.name.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		dataset.update_dataset_name(req.body.id, req.body.name, on_success, on_fail)
	}
})


app.post('/datasets/description', user.admin_role, jsonParser, function(req, res) {

	function on_success(_result, _passthrough) {
		res.json(_result)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}


	if (req.body.id == null) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.description == null) {
		return res.sendStatus(400)
	} 
	else if (req.body.description.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		dataset.update_dataset_description(req.body.id, req.body.description, on_success, on_fail)
	}
})


app.delete('/datasets', user.admin_role, jsonParser, function(req, res) {

	function on_success(_passthrough) {
		res.sendStatus(200)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}

	
	if (req.query.id == null) {
		return res.sendStatus(400)
	}
	else if (req.query.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		dataset.delete_dataset(req.query.id, on_success, on_fail)
	}
})



app.get('/records/id', user.admin_role, function(req, res) {


	function on_success(_result, _passthrough) {
		res.json(_result)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}

	if (!req.query.id) {
		return res.sendStatus(400)
	}
	else if (req.query.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		record.get_record_by_id(req.query.id, on_success, on_fail)
	}
})


app.post('/questionnaires', user.admin_role, jsonParser, function(req, res) {

	function on_success(_result, _passthrough) {
		res.json(_result)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}

	questionnaire.create_questionnaire(on_success, on_fail)
})



app.post('/questionnaires/id/question', user.admin_role, jsonParser, function(req, res) {

	function on_success(_result, _passthrough) {
		res.json(_result)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}


	if (req.body.id == null) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		questionnaire.create_question(req.body.id, on_success, on_fail)
	}
})



app.post('/questionnaires/id/questions/id/choice', user.admin_role, jsonParser, function(req, res) {

	function on_success(_result, _passthrough) {
		res.json(_result)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}


	if (req.body.id == null) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.question_id == null) {
		return res.sendStatus(400)
	}
	else if (req.body.question_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.name == null) {
		return res.sendStatus(400)
	}
	else if (req.body.name.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		questionnaire.create_question_choice(req.body.id, req.body.question_id, req.body.name, on_success, on_fail)
	}
})





app.post('/questionnaires/id/questions/id/tag', user.admin_role, jsonParser, function(req, res) {

	function on_success(_result, _passthrough) {
		res.json(_result)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}

	if (req.body.id == null) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.question_id == null) {
		return res.sendStatus(400)
	}
	else if (req.body.question_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.tag_id == null) {
		return res.sendStatus(400)
	}
	else if (req.body.tag_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		questionnaire.insert_question_tag_id(req.body.id, req.body.question_id, req.body.tag_id, on_success, on_fail)
	}
})


app.post('/questionnaires/id/questions/id/trigger', user.admin_role, jsonParser, function(req, res) {


	function on_success(_result, _passthrough) {
		res.json(_result)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}

	if (req.body.id == null) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.question_id == null) {
		return res.sendStatus(400)
	}
	else if (req.body.question_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.name == null) {
		return res.sendStatus(400)
	}
	else if (req.body.name.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.case_sensitive == null) {
		return res.sendStatus(400)
	}
	else {
		questionnaire.create_trigger(req.body.id, req.body.question_id, req.body.name, req.body.case_sensitive, on_success, on_fail)
	}
})




app.post('/questionnaires/id/tag', user.admin_role, jsonParser, function(req, res) {

	function on_success(_result, _passthrough) {
		res.json(_result)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}


	if (req.body.id == null) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.name == null) {
		return res.sendStatus(400)
	}
	else if (req.body.name.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		questionnaire.create_tag(req.body.id ,req.body.name, on_success, on_fail)
	}
})



app.get('/questionnaires', user.basic_role, function(req, res) {

	function on_success(_result, _passthrough) {
		res.json(_result)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}

	questionnaire.get_all_questionnaires(on_success, on_fail)
})




app.get('/questionnaires/id/download', user.admin_role, function(req, res) {

	function on_success(_result, _passthrough) {
		res.setHeader('Content-disposition', 'attachment; filename=' + _result.name + ".json");
		res.setHeader('Content-type', 'application/json');
		res.charset = 'UTF-8';
		res.write(JSON.stringify(_result, undefined, 2))
		res.end()
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}
	
	if (!req.query.id) {
		return res.sendStatus(400)
	}
	else if (req.query.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		questionnaire.get_by_id(req.query.id, on_success, on_fail)
	}
})





app.get('/questionnaires/id', user.basic_role, function(req, res) {

	function on_success(_result, _passthrough) {
		res.json(_result)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}

	
	if (!req.query.id) {
		return res.sendStatus(400)
	}
	else if (req.query.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		questionnaire.get_by_id(req.query.id, on_success, on_fail)
	}
})


app.post('/questionnaires/upload', user.admin_role, multipartMiddleware, function(req, res) {
	

	function on_success(_result, _passthrough) {
		res.json(_result)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}

	questionnaire.upload(req.files.file, on_success, on_fail)
})



app.post('/questionnaires/id/name', user.admin_role, jsonParser, function(req, res) {

	function on_success(_result, _passthrough) {
		res.json(_result)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}


	if (req.body.id == null) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.name == null) {
		return res.sendStatus(400)
	} 
	else if (req.body.name.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		questionnaire.update_name(req.body.id, req.body.name, on_success, on_fail)
	}
})


app.post('/questionnaires/id/description', user.admin_role, jsonParser, function(req, res) {

	function on_success(_result, _passthrough) {
		res.json(_result)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}


	if (req.body.id == null) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.description == null) {
		return res.sendStatus(400)
	}
	else {
		questionnaire.update_description(req.body.id, req.body.description, on_success, on_fail)
	}
})



app.post('/questionnaires/id/tag/name', user.admin_role, jsonParser, function(req, res) {

	function on_success(_result, _passthrough) {
		res.json(_result)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}


	if (req.body.id == null) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.tag_id == null) {
		return res.sendStatus(400)
	}
	else if (req.body.tag_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.name == null) {
		return res.sendStatus(400)
	}
	else if (req.body.name.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		questionnaire.update_tag_name(req.body.id, req.body.tag_id, req.body.name, on_success, on_fail)
	}
})


app.post('/questionnaires/id/questions/id/question', user.admin_role, jsonParser, function(req, res) {

	function on_success(_result, _passthrough) {
		res.json(_result)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}

	if (req.body.id == null) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.question_id == null) {
		return res.sendStatus(400)
	}
	else if (req.body.question_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.question == null) {
		return res.sendStatus(400)
	}
	else if (req.body.question.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		questionnaire.update_question_name(req.body.id, req.body.question_id, req.body.question, on_success, on_fail)
	}
})


app.post('/questionnaires/id/questions/id/choices/id/name', user.admin_role, jsonParser, function(req, res) {

	function on_success(_passthrough) {
		res.sendStatus(200)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}

	if (req.body.id == null) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.question_id == null) {
		return res.sendStatus(400)
	}
	else if (req.body.question_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.choice_id == null) {
		return res.sendStatus(400)
	}
	else if (req.body.choice_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.name == null) {
		return res.sendStatus(400)
	}
	else if (req.body.name.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		questionnaire.update_question_choice_name(req.body.id, req.body.question_id, req.body.choice_id, req.body.name, on_success, on_fail)
	}
})



app.post('/questionnaires/id/questions/id/frequency', user.admin_role, jsonParser, function(req, res) {

	function on_success(_passthrough) {
		res.sendStatus(200)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}

	if (req.body.id == null) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.question_id == null) {
		return res.sendStatus(400)
	}
	else if (req.body.question_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.frequency == null) {
		return res.sendStatus(400)
	}
	else if (req.body.frequency.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		questionnaire.update_question_frequency(req.body.id, req.body.question_id, req.body.frequency, on_success, on_fail)
	}
})


app.post('/questionnaires/id/questions/id/type', user.admin_role, jsonParser, function(req, res) {

	function on_success(_passthrough) {
		res.sendStatus(200)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}


	if (req.body.id == null) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.question_id == null) {
		return res.sendStatus(400)
	}
	else if (req.body.question_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.body.type == null) {
		return res.sendStatus(400)
	}
	else if (req.body.type.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		questionnaire.update_question_type(req.body.id, req.body.question_id, req.body.type, on_success, on_fail)
	}
})

app.delete('/questionnaires/id/question', user.admin_role, jsonParser, function(req, res) {


	function on_success(_passthrough) {
		res.sendStatus(200)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}


	if (!req.query.id) {
		return res.sendStatus(400)
	}
	else if (req.query.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (!req.query.question_id) {
		return res.sendStatus(400)
	}
	else if (req.query.question_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		questionnaire.delete_question(req.body.id, req.body.question_id, req.query.question_id, on_success, on_fail)		
	}
})



app.delete('/questionnaires/id/tag', user.admin_role, jsonParser, function(req, res) {

	function on_success(_passthrough) {
		res.sendStatus(200)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}


	if (!req.query.id) {
		return res.sendStatus(400)
	}
	else if (req.query.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (!req.query.tag_id) {
		return res.sendStatus(400)
	}
	else if (req.query.tag_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		questionnaire.delete_tag(req.query.id, req.query.tag_id, on_success, on_fail)	
	}
})


app.delete('/questionnaires/id', user.admin_role, jsonParser, function(req, res) {

	function on_success(_passthrough) {
		res.sendStatus(200)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}

	if (!req.query.id) {
		return res.sendStatus(400)
	}
	else if (req.query.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		questionnaire.delete_questionnaire(req.query.id, on_success, on_fail)	
	}
})


app.delete('/questionnaires/id/questions/id/choices/id', user.admin_role, jsonParser, function(req, res) {

	function on_success(_passthrough) {
		res.sendStatus(200)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}


	if (req.query.id == null) {
		return res.sendStatus(400)
	}
	else if (req.query.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.query.question_id == null) {
		return res.sendStatus(400)
	}
	else if (req.query.question_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.query.choice_id == null) {
		return res.sendStatus(400)
	}
	else if (req.query.choice_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		questionnaire.delete_question_choice(req.query.id, req.query.question_id, req.query.choice_id, on_success, on_fail)
	}
})




app.delete('/questionnaires/id/questions/id/triggers/id', user.admin_role, jsonParser, function(req, res) {

	function on_success(_passthrough) {
		res.sendStatus(200)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}

	if (req.query.id == null) {
		return res.sendStatus(400)
	}
	else if (req.query.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.query.question_id == null) {
		return res.sendStatus(400)
	}
	else if (req.query.question_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.query.trigger_id == null) {
		return res.sendStatus(400)
	}
	else if (req.query.trigger_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		questionnaire.delete_question_trigger(req.query.id, req.query.question_id, req.query.trigger_id, on_success, on_fail)
	}
})


app.delete('/questionnaires/id/questions/id/tags/id', user.admin_role, jsonParser, function(req, res) {

	function on_success(_passthrough) {
		res.sendStatus(200)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}

	if (req.query.id == null) {
		return res.sendStatus(400)
	}
	else if (req.query.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.query.question_id == null) {
		return res.sendStatus(400)
	}
	else if (req.query.question_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.query.tag_id == null) {
		return res.sendStatus(400)
	}
	else if (req.query.tag_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		questionnaire.delete_question_tag(req.query.id, req.query.question_id, req.query.tag_id, on_success, on_fail)
	}
})

app.get('/hits', user.basic_role, function(req, res) {

	function on_success(_hit, _passthrough) {
		if (_hit) {
			return res.json(_hit)
		}
		else {
			return res.sendStatus(404)
		}
	}

	function on_fail(_err, _passthrough) {
		return res.sendStatus(400)
	}

	if (!req.query.project_id) {
		return res.sendStatus(400)
	}
	else if (req.query.project_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		hit.get_random(req.query.project_id, on_success, on_fail)
	}
})



app.post('/hits/choice_id', user.basic_role, jsonParser, function(req, res) {

	function on_success(_passthrough) {
		return res.sendStatus(200)
	}

	function on_fail(_err, _passthrough) {
		return res.sendStatus(400)
	}


	if (!req.body.hit_id) {
		return res.sendStatus(400)
	}
	else if (req.body.hit_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (!req.body.choice_id) {
		return res.sendStatus(400)
	}
	else if (req.body.choice_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		hit.update_choice_id(req.body.hit_id, req.body.choice_id, req.user._id, on_success, on_fail)
	}
})



app.post('/hits/text', user.basic_role, jsonParser, function(req, res) {

	function on_success(_passthrough) {
		return res.sendStatus(200)
	}

	function on_fail(_err, _passthrough) {
		return res.sendStatus(400)
	}


	if (!req.body.hit_id) {
		return res.sendStatus(400)
	}
	else if (req.body.hit_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (!req.body.text) {
		return res.sendStatus(400)
	}
	else if (req.body.text.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		var _text = req.body.text.trim()
		hit.update_text(req.body.hit_id, _text, req.user._id, on_success, on_fail)
	}
})





app.post('/hits/id/answered', user.basic_role, jsonParser, function(req, res) {

	function on_success(_passthrough) {
		return res.sendStatus(200)
	}

	function on_fail(_err, _passthrough) {
		return res.sendStatus(400)
	}


	if (!req.body.hit_id) {
		return res.sendStatus(400)
	}
	else if (req.body.hit_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		hit.update_answered(req.body.hit_id, req.user._id, on_success, on_fail)
	}
})



app.post('/hits/annotations/choice_id', user.basic_role, jsonParser, function(req, res) {

	function on_success(_passthrough) {
		return res.sendStatus(200)
	}

	function on_fail(_err, _passthrough) {
		return res.sendStatus(400)
	}


	if (!req.body.id) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (!req.body.annotation_id) {
		return res.sendStatus(400)
	}
	else if (req.body.annotation_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (!req.body.choice_id) {
		return res.sendStatus(400)
	}
	else if (req.body.choice_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		hit.update_annotation_choice_id(req.body.id, req.body.annotation_id, req.body.choice_id, req.user._id, on_success, on_fail)
	}
})


app.get('/hits/session', function(req, res) {

	function on_success(_user, _passthrough) {
			res.json(_user)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}

	if (req.user) {
		user.get_by_username(req.user.username, on_success, on_fail) 
	}
	else {
		res.sendStatus(404)
	}	 
})





app.get('/hits/project_id/build', user.admin_role, jsonParser, function(req, res) {
	/*
		Reads in patient .json files and stores them in the db.patients and db.records
		The OS has an upper limit on how many file descriptors can exist at once.
		"ulimit -n" is the command that reports what this upper limit is.

	*/

	function send_json_to_user(_json, _callback) {
		res.write('data: ' + _json + '\n\n')
		_callback()
	}


	// Used for SSE (server sent events)
	req.socket.setTimeout(Infinity)

	
	res.writeHead(200, 
						{
								"Content-Type"  : "text/event-stream", 
								"Cache-Control" : "no-cache", 
								"Connection"    : "keep-alive"
						})




	if (!req.query.id) {
		return res.sendStatus(400)
	}
	else if (req.query.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		_child_process = spawn('node', ['./processes/build_hits.js', req.query.id])
		
		_child_process.stdout.on('data', function(data) {

			send_json_to_user(data, function() {
			})
		})
		
		_child_process.stderr.on('data', function(data) {
			console.log('error: ' + data)
		})

		_child_process.on('close', function(code) {
		    console.log('close: ' + code)
		})
	}
})





app.get('/phrases', function(req, res) {

	function on_success(_result, _passthrough) {
		res.json(_result)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}


	if (req.query.project_id == null) {
		return res.sendStatus(400)
	}
	else if (req.query.project_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (req.query.question_id == null) {
		return res.sendStatus(400)
	}
	else if (req.query.question_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		var project_id   = req.query.project_id.trim()
		var question_id  = req.query.question_id.trim()

		phrase.get_phrases_by_project_id_and_question_id(project_id, question_id, on_success, on_fail)
	} 
})



app.post('/phrases/answer', user.basic_role, jsonParser, function(req, res) {

	function on_success() {
		res.sendStatus(200)
	}

	function on_fail(_err) {
		return res.sendStatus(400)
	}

	if (!req.body.phrase_id) {
		return res.sendStatus(400)
	}
	else if (req.body.phrase_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (!req.body.answer) {
		return res.sendStatus(400)
	}
	else if (req.body.answer.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (!req.body.type) {
		return res.sendStatus(400)
	}
	else if (req.body.type.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (!req.body.frequency) {
		return res.sendStatus(400)
	}
	else if (req.body.frequency.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {

		phrase.bulk_answer(req.body.phrase_id, req.body.answer, req.body.type, req.body.frequency, req.user._id, on_success, on_fail)
	}
})


app.delete('/phrases/not_applicable', user.basic_role, jsonParser, function(req, res) {

	function on_success(_passthrough) {
		res.sendStatus(200)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}
	
	if (req.query.phrase_id == null) {
		return res.sendStatus(400)
	}
	else if (req.query.phrase_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		phrase.not_applicable(req.query.phrase_id, on_success, on_fail)
	}
})



app.delete('/phrases/ignore', user.basic_role, jsonParser, function(req, res) {


	function on_success(_passthrough) {
		res.sendStatus(200)
	}

	function on_fail(_err, _passthrough) {
		res.sendStatus(404)
	}
	
	if (req.query.phrase_id == null) {
		return res.sendStatus(400)
	}
	else if (req.query.phrase_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		phrase.ignore(req.query.phrase_id, on_success, on_fail)
	}
})



var options = {
  key:  fs.readFileSync(config.key_path),
  cert: fs.readFileSync(config.cert_path)
}
https.createServer(options, app).listen(443)


