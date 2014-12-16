var superagent = require('superagent')
var chai       = require('chai')
var fs 		   = require('fs')
var config     = require('./config.js')
var EventSource = require('eventsource')

var should = chai.should()
var cert = fs.readFileSync('./security/medturk-cert.pem')

// Reference blog for testing:
// http://webapplog.com/tutorial-node-js-and-mongodb-json-rest-api-server-with-mongoskin-and-express-js/
//


describe('/projects', function() {
	var project_id

	// Create a projects in order to save its project_id used in other tests
	before(function(done) {
		superagent
		.post(config.api_url + '/projects')
		.ca(cert)
		.send({
			'name' : 'test project'
		})
		.end(function(error, response) {
			should.not.exist(error)
			response.status.should.equal(200)
			project_id = response.body._id
			done()
		})
	})


	it('/projects                      POST - Creates a project', function(done) {
		superagent
		.post(config.api_url + '/projects')
		.ca(cert)
		.send({
			'name' : 'test project'
		})
		.end(function(error, response) {
			should.not.exist(error)
			response.status.should.equal(200)
			response.body.name.should.equal('test project')
			response.body.description.should.equal('')
			should.not.exist(response.body.dataset_id)
			should.not.exist(response.body.model_id)
			response.body.status.should.equal('Needs Building')

			done()
		})
	})



	it('/projects/user                 POST - Adds a user id to a project', function(done) {
		
		superagent
		.post(config.api_url + '/projects/user')
		.ca(cert)
		.send({
			'id' : project_id,
			'user_id'    : 'matt_j'
		})
		.end(function(error, response) {
			should.not.exist(error)
			response.status.should.equal(200)
			done()
		})
	})



	it('/projects/name                 POST - Updates the name of the project', function(done) {
		
		superagent
		.post(config.api_url + '/projects/name')
		.ca(cert)
		.send({
			'id'   : project_id,
			'name' : 'This is the updated project name'
		})
		.end(function(error, response) {
			should.not.exist(error)
			response.status.should.equal(200)
			done()
		})
	})


	it('/projects/description          POST - Updates the description of the project', function(done) {
		
		superagent
		.post(config.api_url + '/projects/description')
		.ca(cert)
		.send({
			'id'          : project_id,
			'description' : 'This is the updated project description'
		})
		.end(function(error, response) {
			should.not.exist(error)
			response.status.should.equal(200)
			done()
		})
	})


	it('/projects/dataset_id           POST - Updates the dataset id of the project', function(done) {
		
		superagent
		.post(config.api_url + '/projects/dataset_id')
		.ca(cert)
		.send({
			'id'         : project_id,
			'dataset_id' : '548f2c439237f15904fef426'
		})
		.end(function(error, response) {
			should.not.exist(error)
			response.status.should.equal(200)
			done()
		})
	})


	it('/projects/questionnaire_id     POST - Updates the questionnaire id of the project', function(done) {
		
		superagent
		.post(config.api_url + '/projects/questionnaire_id')
		.ca(cert)
		.send({
			'id'               : project_id,
			'questionnaire_id' : '948f2c439237f15904fef422'
		})
		.end(function(error, response) {
			should.not.exist(error)
			response.status.should.equal(200)
			done()
		})
	})



	it('/projects                      GET  - Gets all projects', function(done) {
		superagent
		.get(config.api_url + '/projects')
		.ca(cert)
		.end(function(error, response) {
			should.not.exist(error)
			response.status.should.equal(200)
			response.should.be.a('object')
			done()
		})
	})


	it('/projects/file                 GET  - Gets data file for project', function(done) {
		superagent
		.get(config.api_url + '/projects/file')
		.ca(cert)
		.end(function(error, response) {
			should.not.exist(error)
			response.status.should.equal(200)
			done()
		})
	})



	it('/projects                      DELETE  - Deletes a project', function(done) {
		superagent
		.del(config.api_url + '/projects')
		.ca(cert)
		.send({
			'id' : project_id,
		})
		.end(function(error, response) {
			should.not.exist(error)
			response.status.should.equal(200)
			done()
		})
	})
})




























describe('/datasets', function() {
	

	it('/datasets                      GET - Creates a project', function(done) {

			var EventSource = require('eventsource')
			var eventSourceInitDict = {rejectUnauthorized: false}
			var description = 'This is the dataset description'
			var name = 'This is a dataset name'
			var url = config.api_url + '/datasets?name=' + name + '&description=' + description
			var es = new EventSource(url, eventSourceInitDict)

			es.onmessage = function(e) {
			  
			  var json = JSON.parse(e.data)
			  console.log(json.status)

			  if (json.status == 'Active') {
			  		es.close()
					done()
			  }
			}


			es.onopen = function(e) {
			  console.log(e)
			}


			es.onerror = function(e) {
			  console.log(e)
			}
	})
})










































describe('/records', function() {
	var dataset_id

	it('/records                           GET - Gets a record', function(done) {
			superagent
			.get(config.api_url + '/projects')
			.ca(cert)
			.query({ 'id' : '548f93a260be09dd017087c2' })
			.end(function(error, response) {
				should.not.exist(error)
				response.status.should.equal(200)
				response.should.be.a('object')
				done()
			})
	})
})



