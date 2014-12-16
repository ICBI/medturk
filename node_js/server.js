var express    = require('express')
var https      = require('https')
var http      = require('http')
var fs 		   = require('fs')
var bodyParser = require('body-parser')
var passport   = require('passport')
var config     = require('./config.js')
var mongoskin  = require('mongoskin')

var db         = mongoskin.db(config.db_url)
var app        = express()
var jsonParser = bodyParser.json()




var options = {
  key:  fs.readFileSync('./security/medturk-key.pem'),
  cert: fs.readFileSync('./security/medturk-cert.pem')
}




/*
TUTORIALS:

Login
http://scotch.io/tutorials/javascript/easy-node-authentication-setup-and-local
*/














// curl -v -H "Content-Type: application/json" -XPOST --data "{\"project_name\" : \"test\"}" https://localhost/project/create --insecure
app.post('/projects', jsonParser, function(req, res) {


	if (!req.body.name) {
		return res.sendStatus(400)
	}
	else if (req.body.name.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {

		// Create document to insert
		doc = {
				  'name'              : req.body.name, 
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
	}
})


// curl -v -H "Content-Type: application/json" -XPOST --data "{\"project_id\" : \"548b49fbf694066a0779dd50\", \"user_id\" : \"123\"}" https://localhost/projects/user --insecure
app.post('/projects/user', jsonParser, function(req, res) {


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
		var arg2 = {'$push' : {'user_ids' : req.body.id}}
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




app.post('/projects/name', jsonParser, function(req, res) {

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




app.post('/projects/description', jsonParser, function(req, res) {

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



app.post('/projects/dataset_id', jsonParser, function(req, res) {

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




app.post('/projects/questionnaire_id', jsonParser, function(req, res) {

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

	if (!req.body.id) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {

		var arg = {'_id' : new mongoskin.ObjectID(req.body.id)}
		db.collection('projects').remove(arg, function(err, result) {
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




// curl -v -H "Content-Type: application/json" https://localhost/projects --insecure
app.get('/projects', function(req, res) {

	// Fetch all projects
	db.collection('projects').find().toArray(function(err, result) {
		if (err) throw err
		res.json(result)
	})
})


















// curl -v -H "Content-Type: application/json" -XPOST --data "{\"name\" : \"test\", \"folder\" : \"test\"}" https://localhost/project/create --insecure
app.get('/datasets', jsonParser, function(req, res) {


	if (!req.query.name) {
		return res.sendStatus(400)
	}
	else if (req.query.name.trim().length == 0) {
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
				  'patient_count'	  : patient_count,
				  'date'              : Date()
		      }

		update_doc = {
			'_id'    : dataset_id,
			'status' : status,
			'patient_count' : patient_count
		}

		var dir_name = '/Users/matt/Development/git/ICBI/medturk/datasets/example_dataset/'

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

							var json_files = new Array()

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




















/*


// curl -v -H "Content-Type: application/json" -XPOST --data "{\"name\" : \"test\", \"folder\" : \"test\"}" https://localhost/project/create --insecure
app.post('/datasets', jsonParser, function(req, res) {


	req.socket.setTimeout(Infinity)

	res.writeHead(200, 
					{
							"Content-Type"  : "text/event-stream", 
							"Cache-Control" : "no-cache", 
							"Connection"    : "keep-alive"
					})


	if (!req.body.name) {
		return res.sendStatus(400)
	}
	else if (req.body.name.trim().length == 0) {
		return res.sendStatus(400)
	}
	else if (!req.body.description) {
		return res.sendStatus(400)
	}
	if (!req.body.folder) {
		return res.sendStatus(400)
	}
	else if (req.body.folder.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {

    	res.write("retry: 10000\n")
    	res.write("data: " + (new Date()) + "\n\n")
    	res.write("data: " + (new Date()) + "\n\n")


		var dataset_id = new mongoskin.ObjectID
		
		doc = {
				  '_id'				  : dataset_id,
				  'name'              : req.body.name, 
				  'description'       : req.body.description,
				  'status'            : 'Building (0% complete)',
				  'patient_count'	  : 0,
				  'date'              : Date()
		      }

		var dir_name = '/Users/matt/Development/git/ICBI/medturk/datasets/' + req.body.folder + '/'


		// Insert dataset
		db.collection('datasets').insert(doc, function(err, result) {
				if (err) {
					throw err
					return res.sendStatus(500)
				}
				else {
						fs.readdir(dir_name, function(err, files) {

							var patient_count = 0

							// After every 'k' patients, update the dataset status
							var update_frequency = 5

							files.forEach(function(file) {
								if (file.slice(-5).toLowerCase() == '.json') {

									fs.readFile(dir_name + file, 'utf8', function(err, data) {

										// JSON of patient
										patient = JSON.parse(data)

										patient.records.forEach(function (record) {
											record.patient_id = patient.id
											record.dataset_id = dataset_id
											
											// Insert clinical note
											db.collection('records').insert(record, function(err, result) {
												if (err) {
													throw err
												}
												else {
													
												}
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
													
													patient_count += 1
													res.end()

													if ((patient_count % update_frequency) == 0) {
														console.log('test')
													}
												}
										})

									})
								}
							})
						})
				}
		})
	}
})

*/



































app.get('/records', function(req, res) {

	if (!req.body.id) {
		return res.sendStatus(400)
	}
	else if (req.body.id.trim().length == 0) {
		return res.sendStatus(400)
	}
	else {

		var arg = { '_id' : record_id}

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
































https.createServer(options, app).listen(443)


