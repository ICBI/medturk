var fs 		   = require('fs')
var FileQueue  = require('filequeue')
var config     = require('./config.js') 
var dataset    = require('./dataset.js')
var patient    = require('./patient.js')
var record     = require('./record.js')

var fq         = new FileQueue(100)


/*
	Reads in patient .json files and stores them in the db.patients and db.records
	The OS has an upper limit on how many file descriptors can exist at once.
	"ulimit -n" is the command that reports what this upper limit is.

*/
// Holds the dataset id 
var dataset_id  = process.argv[2]

// Name of the directory where the patient files exist
var dir_name = undefined

// Number of patients we've processed
var num_patients_processed = 0

// Number of patients to process
var num_patients_to_process = undefined

// After every 'k' patients, let the user know how far we've come
var update_frequency = 10


var files_opened = 0


function send_update_status(_json) {
	process.stdout.write(JSON.stringify(_json))
}


function insert_record_callback(_passthrough) {

}

function insert_record_error_callback(_err, _passthrough) {

}


function final_update_dataset_callback(_passthrough) {

}


function final_update_dataset_error_callback(err, _passthrough) {

}

function update_dataset_callback(_passthrough) {
	
}


function update_dataset_error_callback(err, _passthrough) {
	process.stderr.write(JSON.stringify(err))
}



function insert_patient_callback(_patient, _passthrough) {

	// Update the number of patients we've processed
	num_patients_processed += 1
		
	// If true, we are processing the last patient	
	if (num_patients_processed == num_patients_to_process) {


		send_update_status({'_id'  : dataset_id, 'status' : 'Active', 'num_patients' : num_patients_processed})

		dataset.update_status(dataset_id, 'Active', num_patients_processed, final_update_dataset_callback, final_update_dataset_error_callback)
	}
	else if ((num_patients_processed % update_frequency) == 0) {

		var progress = Math.round(  (num_patients_processed / num_patients_to_process) * 100.0 )
		var status   =  'Building (' + progress + '% (' + num_patients + '/' + json_files.length + ') complete)'
	
		send_update_status({'_id'   : dataset_id, 
						  'status' : status, 
						  'num_patients' : num_patients_processed})

		// Now, update the dataset collection about our progress
		dataset.update_status(dataset_id, status, num_patients_processed, update_dataset_callback, update_dataset_error_callback)
	}
}


function insert_patient_error_callback(_err, _passthrough) {
	// Update the number of patients we've processed
	num_patients_processed += 1
}


function get_file_callback(err, _file) {

	if (err) throw err


	send_update_status({'_id'  : dataset_id, 'status' : 'files opened', 'num_patients' : files_opened})


	// Convert string to json;
    // This is blocking!
	_json = JSON.parse(_file)

    // Generate a patient id
	patient_id = patient.generate_id()


	// Insert every record into database
	_json.records.forEach(function (_record) {

		_record.patient_id = patient_id
		_record.dataset_id = dataset_id
		
		record.insert(_record, insert_record_callback, insert_record_error_callback)
	})


	// Remove records before inserting into patient
	delete _json['records']
	
	// Add the dataset id
	_json['dataset_id'] = dataset_id
	_json['_id']        = patient_id

	patient.insert(_json, insert_patient_callback, insert_patient_error_callback)
}




function get_file_names_callback(_err, _files) {

	var json_files = []

	// Need to figure out how many json files are present in order to calculate
	// update an update status. This loop is blocking and filters out 
	// files for ones that have extension '.json'
	for (var i = 0; i < _files.length; i++) {
		if (_files[i].slice(-5).toLowerCase() == '.json') {
			json_files.push(_files[i])
		}
	}


	num_patients_to_process = json_files.length

	send_update_status({'_id'  : dataset_id, 'status' : 'num patients to process', 'num_patients' : num_patients_to_process})

	// Now, let's open each file. Notice we are using filequeue instead of filestream. This takes care
	// of us not opening an amount of file descriptors beyond what the OS allows
	json_files.forEach(function(_file) {
		files_opened += 1
		fq.readFile(dir_name + _file, 'utf8', get_file_callback)
	})
}




function get_dataset_callback(_dataset, _passthrough) {
	dir_name = config.datasets_path + _dataset.folder + '/'
	fs.readdir(dir_name, get_file_names_callback)
}

function get_dataset_error_callback(_err, _passthrough) {

}




function fetch_dataset_document() {

	send_update_status({'_id'  : dataset_id, 'status' : 'Building (0% complete)', 'num_patients' : num_patients_processed})

	// Fetch the dataset document
	dataset.get(dataset_id, get_dataset_callback, get_dataset_error_callback) 
}


fetch_dataset_document()
