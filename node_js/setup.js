require('./db/database.js').connect()
var db   = require('./db/database.js').db()
var user = require('./business/user.js')
var pos = 0
var neg = 0
var max = 6
var default_username = 'admin'
var default_password = 'password'
var errors = []

function exit() {
	if ((pos + neg) == 5) {
		if (neg) {
			console.log('Setup has completed but with errors:')
			for (var i; i < errors.length; i++) {
				console.log(errors[i]);
			}
		}
		else {
			console.log('Setup was successful!')
			process.exit()
		}
	}
}

function success() {
	pos += 1
	exit()
}


function fail(_error_message) {
	errors.push(_error_message)
	neg += 1
	exit()
}





function get_by_username_callback(_user, _passthrough) {
	user.update_password(_user._id, 
						 default_password, 
						 function(_result, _passthrough){
						 	success()
						 }, 
						 function(_err, _passthrough){
						 	fail('default admin account was not reset')
						 }, _passthrough)
}

function get_by_username_error_callback(_user, _passthrough) {
	user.create_user(default_username, 
				default_password, 
				true, 
				function(_user, _passthrough){
					success()
				}, function(_err, _passthrough){
					fail('default admin account was not created')
				})
}

user.get_by_username(default_username, get_by_username_callback, get_by_username_error_callback)


db.collection('records').ensureIndex({'patient_id' : 1, 'dataset_id' : 1}, function(_err, _result) {
	if (_err) {
		fail('records.patient_id was not indexed; records.dataset_id was not indexed')
	}
	else {
		success()
	}
})


db.collection('users').ensureIndex({'username' : 1}, function(_err, _result) {
	if (_err) {
		fail('users.username was not indexed')
	}
	else {
		success()
	}
})


db.collection('patients').ensureIndex({'username' : 1}, function(_err, _result) {
	if (_err) {
		fail('patients.username was not indexed')
	}
	else {
		success()
	}
})

db.collection('hits').ensureIndex({'project_id' : 1, 'answered' : 1}, function(_err, _result) {
	if (_err) {
		fail('hits.project_id was not indexed; hits.answered was not indexed')
	}
	else {
		success()
	}
})

/*
db.collection('hits').ensureIndex({'annotations.phrase_ids' : 1}, function(_err, _result) {
	if (_err) {
		fail('hits.annotations.phrase_ids was not indexed; hits.project_id was not indexed; hits.answered was not indexed')
	}
	else {
		success()
	}
})
*/


