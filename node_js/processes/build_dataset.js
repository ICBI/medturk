require('../db/database.js').connect()

var fs 		   = require('fs')
var config     = require('../config.js') 
var dataset    = require('../business/dataset.js')
var patient    = require('../business/patient.js')
var record     = require('../business/record.js')


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


// Number of records we've processed
var num_records_processed = 0

// Number of records to process
var num_records_to_process = undefined


// JSON files
var json_files = []

// After every 'k' patients, let the user know how far we've come
var update_frequency = 20


var files_opened = 0


function send_update_status(_json) {
	process.stdout.write(JSON.stringify(_json))
}


function insert_record_callback(_passthrough) {
	num_records_processed += 1

	if (num_records_processed == num_records_to_process) {
		on_patient_upload_complete()
	}	
}

function insert_record_error_callback(_err, _passthrough) {
	num_records_processed += 1

	if (num_records_processed == num_records_to_process) {
		on_patient_upload_complete()
	}	
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




function on_patient_upload_complete() {
	// Update the number of patients we've processed
	num_patients_processed += 1
	
	// If true, we are processing the last patient	
	if (num_patients_processed == num_patients_to_process) {


		send_update_status({'_id'  : dataset_id, 'status' : 'Active', 'num_patients' : num_patients_processed})

		dataset.update_dataset_status(dataset_id, 'Active', num_patients_processed, final_update_dataset_callback, final_update_dataset_error_callback)
	}
	else if ((num_patients_processed % update_frequency) == 0) {

		var progress = Math.round(  (num_patients_processed / num_patients_to_process) * 100.0 )
		var status   =  'Building (' + progress + '% (' + num_patients_processed + '/' + num_patients_to_process + ') complete)'
	
		send_update_status({'_id'   : dataset_id, 
						  'status' : status, 
						  'num_patients' : num_patients_processed})

		// Now, update the dataset collection about our progress
		dataset.update_dataset_status(dataset_id, status, num_patients_processed, update_dataset_callback, update_dataset_error_callback)
	}

	on_process_file_finish()
}



function insert_patient_callback(_patient, _passthrough) {

	// Now, insert the patient's records
	num_records_processed = 0
	num_records_to_process = _passthrough.records.length

	for (var i = 0; i < _passthrough.records.length; i++) {
		var _record = _passthrough.records[i]
		_record.patient_id = _passthrough.patient_id
		_record.dataset_id = dataset_id

		record.insert(_record, insert_record_callback, insert_record_error_callback)
	}
}


function insert_patient_error_callback(_err, _passthrough) {
	// Update the number of patients we've processed
	num_patients_processed += 1
}




function process_file(_patient_file) {

	var patient_id = patient.generate_id()
	var _file = fs.readFileSync(dir_name + _patient_file, 'utf8')
	var _json = JSON.parse(_file)


	// Remove records before inserting into patient
	var patient_records = _json['records']
	delete _json['records']
	
	// Add the dataset id
	_json['dataset_id'] = dataset_id
	_json['_id']        = patient_id

	patient.insert(_json, insert_patient_callback, insert_patient_error_callback, {'records' : patient_records, 'patient_id' : patient_id})
}



function on_process_file_finish() {

	if (num_patients_processed < num_patients_to_process) {
		process_file(json_files[num_patients_processed])
	}
}


function get_file_names_callback(_err, _files) {

	json_files = []

	// Need to figure out how many json files are present in order to calculate
	// update an update status. This loop is blocking and filters out 
	// files for ones that have extension '.json'
	for (var i = 0; i < _files.length; i++) {
		if (_files[i].slice(-5).toLowerCase() == '.json') {
			json_files.push(_files[i])
		}
	}


	num_patients_to_process = json_files.length

	process_file(json_files[num_patients_processed])
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
	dataset.get_dataset_by_id(dataset_id, get_dataset_callback, get_dataset_error_callback) 
}


fetch_dataset_document()
