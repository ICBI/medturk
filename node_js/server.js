var express    = require('express')
var https      = require('https')
var http       = require('http')
var fs 		   = require('fs')
var path       = require('path')
var bodyParser = require('body-parser')
var passport   = require('passport')
var config     = require('./config.js')
var mongoskin  = require('mongoskin')
var multipart  = require('connect-multiparty')

var db         = mongoskin.db(config.db_url)
var app        = express()
var jsonParser = bodyParser.json()
var multipartMiddleware = multipart()



var options = {
  key:  fs.readFileSync('./security/medturk-key.pem'),
  cert: fs.readFileSync('./security/medturk-cert.pem')
}




/*
TUTORIALS:

Login
http://scotch.io/tutorials/javascript/easy-node-authentication-setup-and-local

EXAMPLES:

How to use curl to run api call:
curl -v -H "Content-Type: application/json" -XPOST --data "{\"project_name\" : \"test\"}" https://localhost/project/create --insecure

*/



// Let's front-end content be accessed by users
app.use(express.static(config.ui_path))


app.post('/projects', jsonParser, function(req, res) {

	// Create document to insert
	doc = {
			  'name'              : 'My New Project', 
			  'description'       : '',
			  'dataset_id'        : null,
			  'questionnaire_id'  : null,
			  'user_ids'          : [],
			  'status'            : 'Needs Building'
	      }

	// Insert and return inserted document to user
	db.collection('projects').insert(doc, function(err, result) {
		if (err) throw err
		res.json(result[0])
	})
})






function get_questionnaire(questionnaire_id, callback) {
		
		var arg1 = {'_id' : new mongoskin.ObjectID(questionnaire_id)}

		db.collection('questionnaires').findOne(arg1, function(err, questionnaire) {
			if (err) throw err

			if (questionnaire) {
				callback(questionnaire)
			}
			else {
				console.log('questionnaire not found')
				res.sendStatus(404)
			}
		})
	}


function get_project(project_id, callback) {

	var arg1 = {'_id' : new mongoskin.ObjectID(project_id)}

	db.collection('projects').findOne(arg1, function(err, project) {
		if (err) throw err

		if (project) {
			callback(project)
		}
		else {
			console.log('project not found')
			res.sendStatus(404)
		}
	})
}



function get_documents(_collection, _query, _callback, passthrough) {

	db.collection(_collection).find(_query, function(err, result) {
		if (err) throw err

		if (result) {
			_callback(result, passthrough)
		}
		else {
			console.log('Not found')
			res.sendStatus(404)
		}
	})
}







































// curl -v -H "Content-Type: application/json" -XPOST --data "{\"project_id\" : \"548b49fbf694066a0779dd50\", \"user_id\" : \"123\"}" https://localhost/projects/user --insecure
app.post('/projects/id/user', jsonParser, function(req, res) {


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

		var arg1 = {'_id' : new mongoskin.ObjectID(req.body.id)}
		var arg2 = {'$push' : {'user_ids' : new mongoskin.ObjectID(req.body.user_id)}}
		db.collection('projects').update(arg1, arg2, function(err, result) {
			if (err) throw err

			if(result) {
				res.sendStatus(200)
			}
			else {
				res.sendStatus(404)
			}
		})
	}
})




app.post('/projects/id/name', jsonParser, function(req, res) {

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

		var arg1 = {'_id' : new mongoskin.ObjectID(req.body.id)}
		var arg2 = {'$set' : {'name' : req.body.name}}
		db.collection('projects').update(arg1, arg2, function(err, result) {
			if (err) throw err

			if (result) {
				res.sendStatus(200)
			}
			else {
				res.sendStatus(404)
			}
			
		})
	}
})




app.post('/projects/id/description', jsonParser, function(req, res) {

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

		var arg1 = {'_id' : new mongoskin.ObjectID(req.body.id)}
		var arg2 = {'$set' : {'description' : req.body.description}}
		db.collection('projects').update(arg1, arg2, function(err, result) {
			if (err) throw err

			if (result) {
				res.sendStatus(200)
			}
			else {
				res.sendStatus(404)
			}
			
		})
	}
})



app.post('/projects/id/dataset_id', jsonParser, function(req, res) {

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

		var arg1 = {'_id' : new mongoskin.ObjectID(req.body.id)}
		var arg2 = {'$set' : {'dataset_id' : new mongoskin.ObjectID(req.body.dataset_id)}}
		db.collection('projects').update(arg1, arg2, function(err, result) {
			if (err) throw err

			if (result) {
				res.sendStatus(200)
			}
			else {
				res.sendStatus(404)
			}
			
		})
	}
})




app.post('/projects/id/questionnaire_id', jsonParser, function(req, res) {

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

		var arg1 = {'_id' : new mongoskin.ObjectID(req.body.id)}
		var arg2 = {'$set' : {'questionnaire_id' : new mongoskin.ObjectID(req.body.questionnaire_id)}}
		db.collection('projects').update(arg1, arg2, function(err, result) {
			if (err) throw err

			if (result) {
				res.sendStatus(200)
			}
			else {
				res.sendStatus(404)
			}
			
		})
	}
})




app.delete('/projects', jsonParser, function(req, res) {

	if (!req.query.id) {
		return res.sendStatus(400)
	}
	else if (req.query.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		var calls_completed   = 0
		var calls_to_complete = 2

		var arg = {'_id' : new mongoskin.ObjectID(req.query.id)}
		db.collection('projects').remove(arg, function(err, result) {
			if (err) throw err

			if (result) {
				calls_completed += 1
				if (calls_to_complete == calls_completed) {
					res.sendStatus(200)
				}
			}
			else {
				res.sendStatus(404)
			}
			
		})


		var arg = {'project_id' : new mongoskin.ObjectID(req.query.id)}
		db.collection('hits').remove(arg, function(err, result) {
			if (err) throw err

			if (result) {
				calls_completed += 1
				if (calls_to_complete == calls_completed) {
					res.sendStatus(200)
				}
			}
			else {
				res.sendStatus(404)
			}
			
		})
	}
})


app.delete('/projects/id/user', jsonParser, function(req, res) {

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
		// matt
		var arg1 = {'_id' : new mongoskin.ObjectID(req.query.id)}
		var arg2 = {$pull : {'user_ids' : new mongoskin.ObjectID(req.query.user_id)}}

		db.collection('projects').update(arg1, arg2, function(err, result) {
			if (err) throw err

			if (result) {
				return res.sendStatus(200)
			}
			else {
				res.sendStatus(404)
			}
		})
	}
})



// curl -v -H "Content-Type: application/json" https://localhost/projects --insecure
app.get('/projects', function(req, res) {

	// Fetch all projects
	db.collection('projects').find().toArray(function(err, result) {
		if (err) throw err
		res.json(result)
	})
})

























app.get('/datasets', function(req, res) {

	// Fetch all datasets
	db.collection('datasets').find().toArray(function(err, result) {
		if (err) throw err
		res.json(result)
	})
})

app.get('/datasets/raw', function(req, res) {

	paths = fs.readdirSync(config.datasets_path).filter(function(file) {
	    return fs.statSync(path.join(config.datasets_path, file)).isDirectory();
	});

	res.json(paths)
})


app.get('/datasets/id', function(req, res) {

	if (!req.query.id) {
		return res.sendStatus(400)
	}
	else if (req.query.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {

		var arg1 = {'_id' : new mongoskin.ObjectID(req.query.id)}

		// Fetch a dataset
		db.collection('datasets').findOne(arg1, function(err, result) {
			if (err) throw err
			res.json(result)
		})
	}
})






app.get('/datasets/create', jsonParser, function(req, res) {


	if (!req.query.name) {
		return res.sendStatus(400)
	}
	else if (req.query.name.trim().length == 0) {
		return res.sendStatus(400)
	}
	if (req.query.folder == null) {
		return res.sendStatus(400)
	}
	else if (req.query.folder.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (!req.query.description) {
		return res.sendStatus(400)
	}
	else {
	
		var progress = 0
		var patient_count = 0
		var status = 'Building (0% complete)'
		req.socket.setTimeout(Infinity)

		res.writeHead(200, 
						{
								"Content-Type"  : "text/event-stream", 
								"Cache-Control" : "no-cache", 
								"Connection"    : "keep-alive"
						})


		var dataset_id = new mongoskin.ObjectID
		
		doc = {
				  '_id'				  : dataset_id,
				  'name'              : req.query.name, 
				  'description'       : req.query.description,
				  'status'            : status,
				  'num_patients'	  : patient_count,
				  'date'              : Date()
		      }

		update_doc = {
			'_id'    : dataset_id,
			'status' : status,
			'num_patients' : patient_count
		}

		var dir_name = config.datasets_path + req.query.folder + '/'

		res.write('data: ' + JSON.stringify(update_doc) + '\n\n')

		db.collection('datasets').insert(doc, function(err, result) {
				if (err) {
					throw err
					return res.sendStatus(500)
				}
				else {
						fs.readdir(dir_name, function(err, files) {

							var num_patients = 0

							// After every 'k' patients, update the dataset status
							var update_frequency = 5

							var json_files = []

							// Need to figure out how many json files are present in order to calculate
							// update an update status. This loop is blocking and filters out 
							// files for ones that have extension '.json'
							for (var i = 0; i < files.length; i++) {
								if (files[i].slice(-5).toLowerCase() == '.json') {
									json_files.push(files[i])
								}
							}

							json_files.forEach(function(file) {
								
								fs.readFile(dir_name + file, 'utf8', function(err, data) {

									// JSON of patient
									patient = JSON.parse(data)

									patient.records.forEach(function (record) {
										record.patient_id = patient.id
										record.dataset_id = dataset_id
										
										// Insert clinical note
										db.collection('records').insert(record, function(err, result) {
											if (err) throw err
										})
									})

									// Remove records from patient
	    							delete patient.records

	    							// Add the dataset id
	    							patient['dataset_id'] = dataset_id

									// Insert patient record
									db.collection('patients').insert(patient, function(err, result) {
											if (err) {
												throw err
											}
											else {
												
												num_patients += 1

												if (num_patients == json_files.length) {
													update_doc.status = 'Active'
													update_doc.patient_count = num_patients
													res.write('data: ' + JSON.stringify(update_doc) + '\n\n')
													res.end()
													console.log('finished!')

													// Now, update the dataset collection about our progress
													var arg1 = {'_id' : update_doc._id}
													var arg2 = {'$set' : {'status' : update_doc.status, 'num_patients' : num_patients}}

													db.collection('datasets').update(arg1, arg2, function(err, result) {
														if (err) throw err
													})

												}
												else {
													var progress = Math.round((num_patients/json_files.length)*100.0)
													update_doc.status = 'Building (' + progress + '% (' + num_patients + '/' + json_files.length + ') complete)'
													update_doc.patient_count = num_patients
													res.write('data: ' + JSON.stringify(update_doc) + '\n\n')

													// Now, update the dataset collection about our progress
													var arg1 = {'_id' : update_doc._id}
													var arg2 = {'$set' : {'status' : update_doc.status, 'num_patients' : num_patients}}

													db.collection('datasets').update(arg1, arg2, function(err, result) {
														if (err) throw err
													})
												}
											}
									})

								})
								
							})
						})
				}
		})

	}
})



app.post('/datasets/name', jsonParser, function(req, res) {

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

		var arg1 = {'_id' : new mongoskin.ObjectID(req.body.id)}
		var arg2 = {'$set' : {'name' : req.body.name}}
		db.collection('datasets').update(arg1, arg2, function(err, result) {
			if (err) throw err

			if (result) {
				res.sendStatus(200)
			}
			else {
				res.sendStatus(404)
			}
			
		})
	}
})


app.post('/datasets/description', jsonParser, function(req, res) {

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

		var arg1 = {'_id' : new mongoskin.ObjectID(req.body.id)}
		var arg2 = {'$set' : {'description' : req.body.description}}
		db.collection('datasets').update(arg1, arg2, function(err, result) {
			if (err) throw err

			if (result) {
				res.sendStatus(200)
			}
			else {
				res.sendStatus(404)
			}
			
		})
	}
})


app.delete('/datasets', jsonParser, function(req, res) {
	
	if (req.query.id == null) {
		return res.sendStatus(400)
	}
	else if (req.query.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {

		// We must wait for three events to finish
		// Once this counter hits max, we are finished
		var counter = 0
		var max = 3

		// Delete dataset
		var _id = new mongoskin.ObjectID(req.query.id)

		var arg = {'_id' : _id}
		db.collection('datasets').remove(arg, function(err, result) {
			if (err) throw err

			if (result) {
				counter += 1
				if (counter >= max) {
					res.sendStatus(200)
				}
			}
			else {
				res.sendStatus(404)
			}
			
		})


		arg = {'dataset_id' : _id}

		// Delete patients
		db.collection('patients').remove(arg, function(err, result) {
			if (err) throw err

			if (result) {
				counter += 1
				if (counter >= max) {
					res.sendStatus(200)
				}
			}
			else {
				res.sendStatus(404)
			}
			
		})


		// Delete records
		db.collection('records').remove(arg, function(err, result) {
			if (err) throw err

			if (result) {
				counter += 1
				if (counter >= max) {
					res.sendStatus(200)
				}
			}
			else {
				res.sendStatus(404)
			}
			
		})
	}
})

















































app.get('/records/id', function(req, res) {

	if (!req.query.id) {
		return res.sendStatus(400)
	}
	else if (req.query.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {

		var arg = { '_id' : new mongoskin.ObjectID(req.query.id)}

		db.collection('records').findOne(arg, function(err, result) {
	    	if (err) {
	    		throw err
	    	}
	    	else {
	    		res.json(result)
	    	}
	    
		})
	}
})



























app.post('/users', jsonParser, function(req, res) {

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

		// Create user to insert
		doc = {
				  'username'          : req.body.username, 
				  'password'		  : req.body.password,
				  'is_admin'          : (req.body.is_admin == 'true'),
		      }

		// Insert and return inserted document to user
		db.collection('users').insert(doc, function(err, result) {
			if (err) throw err
			res.json(result[0])
		})
	}
})


app.get('/users', function(req, res) {

	// Fetch all datasets
	db.collection('users').find().toArray(function(err, result) {
		if (err) throw err
		res.json(result)
	})
})


app.post('/users/username', jsonParser, function(req, res) {

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

		var arg1 = {'_id' : new mongoskin.ObjectID(req.body.id)}
		var arg2 = {'$set' : {'username' : req.body.username}}
		db.collection('users').update(arg1, arg2, function(err, result) {
			if (err) throw err

			if (result) {
				res.sendStatus(200)
			}
			else {
				res.sendStatus(404)
			}
			
		})
	}
})



app.post('/users/password', jsonParser, function(req, res) {

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

		var arg1 = {'_id' : new mongoskin.ObjectID(req.body.id)}
		var arg2 = {'$set' : {'password' : req.body.password}}
		db.collection('users').update(arg1, arg2, function(err, result) {
			if (err) throw err

			if (result) {
				res.sendStatus(200)
			}
			else {
				res.sendStatus(404)
			}
			
		})
	}
})



app.post('/users/is_admin', jsonParser, function(req, res) {

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

		var arg1 = {'_id' : new mongoskin.ObjectID(req.body.id)}
		var arg2 = {'$set' : {'is_admin' : req.body.is_admin}}
		db.collection('users').update(arg1, arg2, function(err, result) {
			if (err) throw err

			if (result) {
				res.sendStatus(200)
			}
			else {
				res.sendStatus(404)
			}
			
		})
	}
})



app.delete('/users', jsonParser, function(req, res) {
	
	if (req.query.id == null) {
		return res.sendStatus(400)
	}
	else if (req.query.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {

		var arg = {'_id' : new mongoskin.ObjectID(req.query.id)}
		db.collection('users').remove(arg, function(err, result) {
			if (err) throw err

			if (result) {
				res.sendStatus(200)
			}
			else {
				res.sendStatus(404)
			}
			
		})
	}
})

































app.post('/questionnaires', jsonParser, function(req, res) {

	var doc = {'name' : 'New Questionnaire', 'description' : '', 'questions' : [], 'tags' : []}


	// Insert and return inserted document to user
	db.collection('questionnaires').insert(doc, function(err, result) {
	if (err) throw err
		
		res.json(result[0])
	})
})



app.post('/questionnaires/id/question', jsonParser, function(req, res) {

	if (req.body.id == null) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {

	    var doc = {'_id' : new mongoskin.ObjectID(), 'question' : '', 'type' : 'radio', 'frequency' : 'once', 'tag_ids' : [], 'choices' : [], 'triggers' : []}
		var arg1 = {'_id' : new mongoskin.ObjectID(req.body.id)}
		var arg2 = { $push: { 'questions' : doc } }

		db.collection('questionnaires').update(arg1, arg2, function(err, result) {
			if (err) throw err

			if (result) {
				res.json(doc)
			}	
			else {
				return res.sendStatus(400)
			}
		})
	}
})





app.post('/questionnaires/id/questions/id/choice', jsonParser, function(req, res) {

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

		// todo
		var _id          = new mongoskin.ObjectID(req.body.id)
		var _question_id = new mongoskin.ObjectID(req.body.question_id)

		var doc  = {'_id' : new mongoskin.ObjectID(), 'name' : req.body.name}

		var arg1 = {'_id' : _id, "questions" : {$elemMatch : {'_id' : _question_id}}}
		var arg2 = { $push: { 'questions.$.choices' : doc } }

		db.collection('questionnaires').update(arg1, arg2, function(err, result) {
			if (err) throw err

			if (result) {
				res.json(doc)
			}	
			else {
				return res.sendStatus(400)
			}
		})
	}
})





app.post('/questionnaires/id/questions/id/tag', jsonParser, function(req, res) {

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

		// todo
		var _id          = new mongoskin.ObjectID(req.body.id)
		var _question_id = new mongoskin.ObjectID(req.body.question_id)
		var _tag_id      = new mongoskin.ObjectID(req.body.tag_id)

		var doc  = _tag_id

		var arg1 = {'_id' : _id, "questions" : {$elemMatch : {'_id' : _question_id}}}
		var arg2 = { $push: { 'questions.$.tag_ids' : doc } }

		db.collection('questionnaires').update(arg1, arg2, function(err, result) {
			if (err) throw err

			if (result) {
				res.json(doc)
			}	
			else {
				return res.sendStatus(400)
			}
		})
	}
})



app.post('/questionnaires/id/questions/id/trigger', jsonParser, function(req, res) {

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

		// todo
		var _id          = new mongoskin.ObjectID(req.body.id)
		var _question_id = new mongoskin.ObjectID(req.body.question_id)

		var doc  = {'_id' : new mongoskin.ObjectID(), 'name' : req.body.name, 'case_sensitive' : req.body.case_sensitive}

		var arg1 = {'_id' : _id, "questions" : {$elemMatch : {'_id' : _question_id}}}
		var arg2 = { $push: { 'questions.$.triggers' : doc } }

		db.collection('questionnaires').update(arg1, arg2, function(err, result) {
			if (err) throw err

			if (result) {
				res.json(doc)
			}	
			else {
				return res.sendStatus(404)
			}
		})
	}
})




app.post('/questionnaires/id/tag', jsonParser, function(req, res) {

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

		var arg1 = {'_id' : new mongoskin.ObjectID(req.body.id)}

		db.collection('questionnaires').findOne(arg1, function(err, result) {
			if (err) throw err
			
			// Add this tag to the current collection
			var tag = {'_id' : new mongoskin.ObjectID(), 'name' : req.body.name}
			result.tags.push(tag)

			var arg2 = {'$set' : {'tags' : result.tags}}

			db.collection('questionnaires').update(arg1, arg2, function(err, result) {
				if (err) throw err

				if (result) {
					res.json(tag)
				}
				else {
					res.sendStatus(404)
				}
			})
		})
	}
})



app.get('/questionnaires', function(req, res) {

	// Fetch all datasets
	db.collection('questionnaires').find().toArray(function(err, result) {
		if (err) throw err
		res.json(result)
	})
})




app.get('/questionnaires/id/download', function(req, res) {
	
	if (!req.query.id) {
		return res.sendStatus(400)
	}
	else if (req.query.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {

		var arg1 = {'_id' : new mongoskin.ObjectID(req.query.id)}

		// Fetch a dataset
		db.collection('questionnaires').findOne(arg1, function(err, result) {
			if (err) throw err
	

			result

			res.setHeader('Content-disposition', 'attachment; filename='+result.name + ".json");
			res.setHeader('Content-type', 'application/json');
			res.charset = 'UTF-8';
			res.write(JSON.stringify(result, undefined, 2))
			res.end()
		})
	}
})





app.get('/questionnaires/id', function(req, res) {
	
	if (!req.query.id) {
		return res.sendStatus(400)
	}
	else if (req.query.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {

		var arg1 = {'_id' : new mongoskin.ObjectID(req.query.id)}

		// Fetch a dataset
		db.collection('questionnaires').findOne(arg1, function(err, result) {
			if (err) throw err
			res.json(result)
		})
	}
})





app.post('/questionnaires/upload', multipartMiddleware, function(req, res) {
	
	var file = req.files.file

	// Is this a json file?
	if (file.name.substr(file.name.length-5).toLowerCase() == '.json') {

		fs.readFile(file.path, 'utf8', function (err, data) {
  			if (err) throw err

  			var doc = JSON.parse(data)

  			// Remove current id and replace with new
  			delete doc['_id']

  			// Insert and return inserted document to user
			db.collection('questionnaires').insert(doc, function(err, result) {
			if (err) throw err
				
				res.json({'_id' : result[0]._id})
			})


		})
	}
})




app.get('/questionnaires/download', function(req, res) {

	// Fetch all datasets
	db.collection('questionnaires').find().toArray(function(err, result) {
		if (err) throw err
		res.json(result)
	})
})




app.post('/questionnaires/id/name', jsonParser, function(req, res) {

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

		var arg1 = {'_id' : new mongoskin.ObjectID(req.body.id)}
		var arg2 = {'$set' : {'name' : req.body.name}}
		db.collection('questionnaires').update(arg1, arg2, function(err, result) {
			if (err) throw err

			if (result) {
				res.sendStatus(200)
			}
			else {
				res.sendStatus(404)
			}
			
		})
	}
})


app.post('/questionnaires/id/description', jsonParser, function(req, res) {

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

		var arg1 = {'_id' : new mongoskin.ObjectID(req.body.id)}
		var arg2 = {'$set' : {'description' : req.body.description}}
		db.collection('questionnaires').update(arg1, arg2, function(err, result) {
			if (err) throw err

			if (result) {
				res.sendStatus(200)
			}
			else {
				res.sendStatus(404)
			}
			
		})
	}
})



app.post('/questionnaires/id/tag/name', jsonParser, function(req, res) {

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


		var tag_id = new mongoskin.ObjectID(req.body.tag_id)

		var arg1 = {'_id' : new mongoskin.ObjectID(req.body.id), "tags" : {$elemMatch : {'_id' : tag_id}}}
		var arg2 = { $set : {"tags.$.name" : req.body.name}}

		db.collection('questionnaires').update(arg1, arg2, function(err, result) {
			if (err) throw err

			if (result) {
				res.sendStatus(200)
			}
			else {
				res.sendStatus(404)
			}
			
		})
	}
})


app.post('/questionnaires/id/questions/id/question', jsonParser, function(req, res) {

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

		var _id         = new mongoskin.ObjectID(req.body.id)
		var question_id = new mongoskin.ObjectID(req.body.question_id)


		var arg1 = {'_id' : _id, "questions" : {$elemMatch : {'_id' : question_id}}}
		var arg2 = { $set : {"questions.$.question" : req.body.question}}

		db.collection('questionnaires').update(arg1, arg2, function(err, result) {
			if (err) throw err

			if (result) {
				res.sendStatus(200)
			}
			else {
				res.sendStatus(404)
			}
			
		})
	}
})


app.post('/questionnaires/id/questions/id/choices/id/name', jsonParser, function(req, res) {

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

		var _id         = new mongoskin.ObjectID(req.body.id)
		var question_id = new mongoskin.ObjectID(req.body.question_id)
		var choice_id   = req.body.choice_id


		// [1] Only retrieve the question portion of the questionnaire
		// [2] Update choice porition of the question
		// [3] Update the question subdocument in the questionnaire

		// Query for the questionnaire
		var arg1 = {'_id' : _id}

		// But only return the question
		var arg2 = {_id: 0, questions: {$elemMatch: {_id:  question_id}}}

		// Fetch the question
		db.collection('questionnaires').findOne(arg1, arg2, function(err, result) {
			if (err) throw err

			if (result) {
				
				var question = result.questions[0]
				var choice = undefined

				for (i = 0; i < question.choices.length; i++) {
					if (question.choices[i]._id == choice_id) {
						choice = question.choices[i]
						break
					}
				}

				if (choice == undefined) {
					return res.sendStatus(404)
				}
				else {

					// Now we can update the choice name
					choice.name = req.body.name

					arg1 = {'_id' : _id, "questions" : {$elemMatch : {'_id' : question_id}}}
					arg2 = { $set : {"questions.$" : question}}

					db.collection('questionnaires').update(arg1, arg2, function(err, result) {
						if (err) throw err

						if (result) {
							res.sendStatus(200)
						}
						else {
							res.sendStatus(404)
						}
						
					})
				}
				
			}
			else {
				// Couldn't find it
				return res.sendStatus(404)
			}
		})
	}
})



app.post('/questionnaires/id/questions/id/frequency', jsonParser, function(req, res) {

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

		var _id         = new mongoskin.ObjectID(req.body.id)
		var question_id = new mongoskin.ObjectID(req.body.question_id)


		var arg1 = {'_id' : _id, "questions" : {$elemMatch : {'_id' : question_id}}}
		var arg2 = { $set : {"questions.$.frequency" : req.body.frequency}}

		db.collection('questionnaires').update(arg1, arg2, function(err, result) {
			if (err) throw err

			if (result) {
				res.sendStatus(200)
			}
			else {
				res.sendStatus(404)
			}
			
		})
	}
})



app.post('/questionnaires/id/questions/id/type', jsonParser, function(req, res) {

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

		var _id         = new mongoskin.ObjectID(req.body.id)
		var question_id = new mongoskin.ObjectID(req.body.question_id)


		var arg1 = {'_id' : _id, "questions" : {$elemMatch : {'_id' : question_id}}}
		var arg2 = { $set : {"questions.$.type" : req.body.type}}

		db.collection('questionnaires').update(arg1, arg2, function(err, result) {
			if (err) throw err

			if (result) {
				res.sendStatus(200)
			}
			else {
				res.sendStatus(404)
			}
			
		})
	}
})

app.delete('/questionnaires/id/question', jsonParser, function(req, res) {

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

		var arg1 = {'_id' : new mongoskin.ObjectID(req.query.id)}
		var arg2 = {$pull : {'questions' : {'_id': new mongoskin.ObjectID(req.query.question_id)} }}

		db.collection('questionnaires').update(arg1, arg2, function(err, result) {
			if (err) throw err

			if (result) {
				return res.sendStatus(200)
			}
			else {
				res.sendStatus(404)
			}
		})

		
	}
})



app.delete('/questionnaires/id/tag', jsonParser, function(req, res) {

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

		var arg1 = {'_id' : new mongoskin.ObjectID(req.query.id)}
		var arg2 = {$pull : {'tags' : {'_id': new mongoskin.ObjectID(req.query.tag_id)} }}

		db.collection('questionnaires').update(arg1, arg2, function(err, result) {
			if (err) throw err

			if (result) {
				return res.sendStatus(200)
			}
			else {
				res.sendStatus(404)
			}
		})

		
	}
})


app.delete('/questionnaires/id', jsonParser, function(req, res) {

	if (!req.query.id) {
		return res.sendStatus(400)
	}
	else if (req.query.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {

		var arg = {'_id' : new mongoskin.ObjectID(req.query.id)}
		db.collection('questionnaires').remove(arg, function(err, result) {
			if (err) throw err

			if (result) {
				res.sendStatus(200)
			}
			else {
				res.sendStatus(404)
			}
			
		})
	}
})


app.delete('/questionnaires/id/questions/id/choices/id', jsonParser, function(req, res) {

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

		var _id         = new mongoskin.ObjectID(req.query.id)
		var question_id = new mongoskin.ObjectID(req.query.question_id)
		var choice_id   = req.query.choice_id


		// [1] Only retrieve the question portion of the questionnaire
		// [2] Update choice porition of the question
		// [3] Update the question subdocument in the questionnaire

		// Query for the questionnaire
		var arg1 = {'_id' : _id}

		// But only return the question
		var arg2 = {_id: 0, questions: {$elemMatch: {_id:  question_id}}}

		// Fetch the question
		db.collection('questionnaires').findOne(arg1, arg2, function(err, result) {
			if (err) throw err

			if (result) {
				// RMJ
				var question = result.questions[0]
				var choice_index = undefined

				for (i = 0; i < question.choices.length; i++) {
					if (question.choices[i]._id == choice_id) {
						choice_index = i
			
						break
					}
				}


				if (choice_index == undefined) {
					return res.sendStatus(404)
				}
				else {

					// Now we can remove the choice
					question.choices.splice(choice_index, 1)

					arg1 = {'_id' : _id, "questions" : {$elemMatch : {'_id' : question_id}}}
					arg2 = { $set : {"questions.$" : question}}

					db.collection('questionnaires').update(arg1, arg2, function(err, result) {
						if (err) throw err

						if (result) {
							res.sendStatus(200)
						}
						else {
							res.sendStatus(404)
						}
						
					})
				}
				
			}
			else {
				// Couldn't find it
				return res.sendStatus(404)
			}
		})
	}
})




app.delete('/questionnaires/id/questions/id/triggers/id', jsonParser, function(req, res) {

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

		var _id         = new mongoskin.ObjectID(req.query.id)
		var question_id = new mongoskin.ObjectID(req.query.question_id)
		var trigger_id   = req.query.trigger_id


		// [1] Only retrieve the question portion of the questionnaire
		// [2] Update choice porition of the question
		// [3] Update the question subdocument in the questionnaire

		// Query for the questionnaire
		var arg1 = {'_id' : _id}

		// But only return the question
		var arg2 = {_id: 0, questions: {$elemMatch: {_id:  question_id}}}

		// Fetch the question
		db.collection('questionnaires').findOne(arg1, arg2, function(err, result) {
			if (err) throw err

			if (result) {
				// RMJ
				var question = result.questions[0]
				var trigger_index = undefined

				for (i = 0; i < question.triggers.length; i++) {
					if (question.triggers[i]._id == trigger_id) {
						trigger_index = i
						break
					}
				}


				if (trigger_index == undefined) {
					return res.sendStatus(404)
				}
				else {

					// Now we can remove the choice
					question.triggers.splice(trigger_index, 1)

					arg1 = {'_id' : _id, "questions" : {$elemMatch : {'_id' : question_id}}}
					arg2 = { $set : {"questions.$" : question}}

					db.collection('questionnaires').update(arg1, arg2, function(err, result) {
						if (err) throw err

						if (result) {
							res.sendStatus(200)
						}
						else {
							res.sendStatus(404)
						}
						
					})
				}
				
			}
			else {
				// Couldn't find it
				return res.sendStatus(404)
			}
		})
	}
})






app.delete('/questionnaires/id/questions/id/tags/id', jsonParser, function(req, res) {

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

		var _id         = new mongoskin.ObjectID(req.query.id)
		var question_id = new mongoskin.ObjectID(req.query.question_id)
		var tag_id      = req.query.tag_id

		// [1] Only retrieve the question portion of the questionnaire
		// [2] Update tag portion of the question
		// [3] Update the question subdocument in the questionnaire

		// Query for the questionnaire
		var arg1 = {'_id' : _id}

		// But only return the question
		var arg2 = {_id: 0, questions: {$elemMatch: {_id:  question_id}}}

		// Fetch the question
		db.collection('questionnaires').findOne(arg1, arg2, function(err, result) {
			if (err) throw err

			if (result) {
				// RMJ
				var question = result.questions[0]
				var tag_index = undefined

				for (i = 0; i < question.tag_ids.length; i++) {
					if (question.tag_ids[i] == tag_id) {
						tag_index = i
						break
					}
				}


				if (tag_index == undefined) {
					return res.sendStatus(404)
				}
				else {

					// Now we can remove the tag
					question.tag_ids.splice(tag_index, 1)

					arg1 = {'_id' : _id, "questions" : {$elemMatch : {'_id' : question_id}}}
					arg2 = { $set : {"questions.$" : question}}

					db.collection('questionnaires').update(arg1, arg2, function(err, result) {
						if (err) throw err

						if (result) {
							res.sendStatus(200)
						}
						else {
							res.sendStatus(404)
						}
						
					})
				}
				
			}
			else {
				// Couldn't find it
				return res.sendStatus(404)
			}
		})
	}
})





app.get('/hits', function(req, res) {

	if (!req.query.project_id) {
		return res.sendStatus(400)
	}
	else if (req.query.project_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		var arg1 = {'project_id' : new mongoskin.ObjectID(req.query.project_id), 'annotations.0' : {$exists : true}, 'answered' : {$exists : false} }

		db.collection('hits').findOne(arg1, function(err, hit) {
			if (err) throw err

			if (hit) {
				return res.json(hit)
			}
			else {
				return res.sendStatus(404)
			}
		})
	}
})



app.post('/hits/choice_id', jsonParser, function(req, res) {

	if (!req.body.id) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (!req.body.choice_id) {
		return res.sendStatus(400)
	}
	else if (req.body.choice_id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {

		arg1 = {'_id' : mongoskin.ObjectID(req.body.id)}
		arg2 = {$set : {'choice_id' :  mongoskin.ObjectID(req.body.choice_id), 'answered' : true, 'user_id' : 'todo', 'date' : Date()}}

		db.collection('hits').update(arg1, arg2, function(err, result) {
			if (err) throw err
			
			if (result) {
				res.sendStatus(200)
			}
			else {
				res.sendStatus(404)
			}
		})
	}
})





app.post('/hits/id/answered', jsonParser, function(req, res) {

	if (!req.body.id) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {

		arg1 = {'_id' : mongoskin.ObjectID(req.body.id)}
		arg2 = {$set : {'answered' : true, 'user_id' : 'todo', 'date' : Date()}}

		db.collection('hits').update(arg1, arg2, function(err, result) {
			if (err) throw err
			
			if (result) {
				res.sendStatus(200)
			}
			else {
				res.sendStatus(404)
			}
		})
	}
})



app.post('/hits/annotations/choice_id', jsonParser, function(req, res) {

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

		var arg1 = {'_id' : new mongoskin.ObjectID(req.body.id), 'annotations' : {$elemMatch : {'_id' : new mongoskin.ObjectID(req.body.annotation_id)}}}
		var arg2 = { $set: {'annotations.$.choice_id' : new mongoskin.ObjectID(req.body.choice_id) } }

		db.collection('hits').update(arg1, arg2, function(err, result) {
			if (err) throw err

			if (result) {
				return res.sendStatus(200)
			}	
			else {
				return res.sendStatus(400)
			}
		})
	}
})




app.post('/hits', jsonParser, function(req, res) {


	var project       = undefined
	var questionnaire = undefined
	var flank_size    = 200
	var lookup        = {}


	// Original function written by 
	// @Nasser: See http://stackoverflow.com/questions/18677834/javascript-find-all-occurrences-of-word-in-text-document
	// I modified it a bit
	function get_matches(needle, haystack, case_sensitive, callback) {
	    var myRe      = new RegExp("\\b" + needle + "\\b((?!\\W(?=\\w))|(?=\\s))", "g" + (case_sensitive ? "" : "i"))
	    var myArray   = []
	    var myResult  = []
	    while ((myArray = myRe.exec(haystack)) !== null) {
	        myResult.push(myArray.index)
	    }

	    callback(myResult)
	}


	function get_annotations(_trigger, _case_sensitive, _note, _callback) {
		
		var _annotations = []
		var _kwic = ''
		
		get_matches(_trigger, _note, _case_sensitive, function(_indices) {

			if(_indices.length > 0) {

				_indices.forEach(function(_abs_beg) {

					var _kwic_beg = _abs_beg - flank_size
					if (_kwic_beg < 0) {
						_kwic_beg = 0
					}

					var _kwic     = _note.substr(_kwic_beg, 2*flank_size + _trigger.length)
					var _rel_beg  = _abs_beg - _kwic_beg

					_annotations.push({ 
										'abs_beg' : _abs_beg,  
								        'rel_beg' : _rel_beg,
								        'trigger' : _trigger,
								        'kwic'    : _kwic
					})

					// If true, we have covered every index
					if (_indices.length == _annotations.length) {
						_callback(_annotations)
					}
				})
			}
			else {

			}
		})
	}

	
	function process_record(_record, _passthrough) {

		// Use all triggers to look for hits within this record
	
		for(var i = 0; i < _passthrough.question.triggers.length; i++) {

			var _trigger = _passthrough.question.triggers[i]

			get_annotations(_trigger.name, _trigger.case_sensitive, _record.note, function(_annotations) {
				// Now we have annotations

				_annotations.forEach(function(_annotation) {
					// Now, insert this into mongodb
					// Does this annotation have a hit it needs to be inserted into? Or should we create a hit for it?
					_annotation._id       = new mongoskin.ObjectID()
					_annotation.record_id = new mongoskin.ObjectID(_record._id)
					_annotation.date      = _record.date

					var arg1 = {'_id' : new mongoskin.ObjectID(_passthrough.hit_id)}
					var arg2 = {'$push' : {'annotations' : _annotation}}
					db.collection('hits').update(arg1, arg2, function(err, result) {
						if (err) throw err

					})
				})
			})
		}
	}


	function get_records_callback(_records, _passthrough) {
		

		_records.each(function (err, _record) {
			
			if (_record) {
				process_record(_record, _passthrough)
			}
		})
	}


	function create_hit(_patient, _question) {

			_hit = {
						'patient_id'  : new mongoskin.ObjectID(_patient._id),
						'dataset_id'  : new mongoskin.ObjectID(project.dataset_id),
						'project_id'  : new mongoskin.ObjectID(project._id),
						'question_id' : new mongoskin.ObjectID(_question._id),
						'tag_ids'     : _question.tag_ids,
						'annotations' : []
       			   }

			// Insert and return inserted document to user
			db.collection('hits').insert(_hit, function(err, result) {
					if (err) throw err

					if(result) {
						get_documents('records', {'dataset_id' : new mongoskin.ObjectID(project.dataset_id), 'patient_id' : _patient.id}, get_records_callback, {'question' : _question, 'hit_id' : result[0]._id})
					}	
			})
	}


	function get_patients_callback(_patients, passthrough) {
		_patients.each(function (err, _patient) {
			if(_patient) {
				for (var i = 0; i < questionnaire.questions.length; i++) {
					create_hit(_patient, questionnaire.questions[i])
				}
			}
		})
	}
	
	function get_questionnaire_callback(_questionnaire) {
		questionnaire = _questionnaire
		get_documents('patients', {'dataset_id' : new mongoskin.ObjectID(project.dataset_id)}, get_patients_callback, undefined)
	}

	function get_project_callback(_project) {
		project = _project
		get_questionnaire(project.questionnaire_id, get_questionnaire_callback)
	}

	if (!req.body.id) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {
		// Our chain of events is started by getting a project
		project_id = req.body.id

		get_project(project_id, get_project_callback)
	}	
})















https.createServer(options, app).listen(443)


