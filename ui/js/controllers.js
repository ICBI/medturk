/**
 *  medTurk (inspired by Amazon's Mechanical Turk) supports clinical research by using the 
 *  ingenuity of humans to convert unstructured clinical notes into structured data.
 *
 *  Copyright (C) 2014 Innovation Center for Biomedical Informatics (ICBI)
 *                     Georgetown University <http://icbi.georgetown.edu/>
 *   
 *  Author: Robert M. Johnson "matt"
 *          <rmj49@georgetown.edu>
 *          <http://mattshomepage.com/>
 *          <@mattshomepage>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


function get_highlighted_text(text, beg, end) {

	var html  = text.substring(0, beg);
	    html += '<span class="highlight">';
	    html += text.substring(beg, end);
	    html += '</span>';
	    html += text.substring(end);

	return html;
}


app.controller('HomeController', function($scope, $upload, user_factory, project_factory, model_factory, patient_factory, dataset_factory) {

	 $scope.project = undefined;
	 $scope.dataset = undefined;

	 $scope.project_name = '';
	 $scope.model_id = '';
	 $scope.workers = []; 
	 $scope.project_description = '';
	 $scope.datasets = [];
	 $scope.models = [];



	 user_factory.user().success(function(data){
           $scope.user = data.user;
     }).error(function(data, status, headers, config){
     		if (status == '401') {
     			 redirect_to_login();
     		}
     		
     });

     project_factory.get_all().success(function(data){
           $scope.projects = data.projects;
     });


	  $scope.add_analyst = function(email) {

			project_factory.add_analyst($scope.project._id, email).success(function(data){
	           $('#close').click();

	        }).error(function(data, status, headers, config){
     			if (status == '401') {
     			 	redirect_to_login();
     			}
     		
     		}); 
	  }

	  $scope.set_project = function(project) {
  		$scope.project = project;
  	  }

  	  $scope.set_dataset = function(dataset) {
  		$scope.dataset = dataset;
  	  }


	  $scope.download = function(project_id) {
  		 project_factory.data(project_id);
  	  }

  	  model_factory.get_models().success(function(data) {
			$scope.models = data.models;
		});


		dataset_factory.get_datasets().success(function(data) {
			$scope.datasets = data.datasets;
		});

		$scope.on_model_upload = function($files) {
			  
			    var file = $files[0];

			    model_factory.save(file).success(function(data){
			    	$scope.model_id = data._id;
			    }).progress(function(evt) {
              		console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
              	});
		}

		$scope.add_worker = function(email) {

				if ($scope.workers.indexOf(email) == -1) {
					$scope.workers.push(email);
				}	
		  }

		$scope.create_project = function(name) {
				project_factory.create($scope.project_name, $scope.project_description, $scope.dataset._id, $scope.model_id).success(function(data) {
					window.location.replace(server + "/medturk/index.html");
				});
		  }



		dataset_factory.get_raw_datasets().success(function(data) {
			$scope.raw_datasets = data.datasets;
		});


		$scope.delete_dataset = function(dataset_id, dataset_name) {
  		 	if(window.confirm('Are you sure you want to delete the dataset ' + dataset_name + '?')) {
  		 	
  		 		dataset_factory.delete(dataset_id).success(function(data) {
					window.location.replace(server + "/medturk/index.html");
				});

  		 	}
  	    }

  	    $scope.delete_model = function(model_id, model_name) {
  		 	if(window.confirm('Are you sure you want to delete the model ' + model_name + '?')) {
  		 	
  		 		model_factory.delete(model_id).success(function(data) {
					window.location.replace(server + "/medturk/index.html");
				});

  		 	}
  	    }


  	    $scope.edit_project = function() {
  	    	
  		 	project_factory.edit($scope.project._id, $scope.project.name, $scope.project.description).success(function(data) {
				window.location.replace(server + "/medturk/index.html");
			});
  	    }



  	    $scope.edit_dataset = function() {
  	    	
  		 	dataset_factory.edit($scope.dataset._id, $scope.dataset.name, $scope.dataset.description).success(function(data) {
				window.location.replace(server + "/medturk/index.html");
			});
  	    }

  	    $scope.add_model = function() {
			window.location.replace(server + "/medturk/index.html#/model");
  	    }



		$scope.delete_project = function(project_id, project_name) {
  		 	if(window.confirm('Are you sure you want to delete ' + project_name + '?. All data will be lost.')) {
  		 	
  		 		project_factory.delete(project_id).success(function(data) {
					window.location.replace(server + "/medturk/index.html");
				});

  		 	}
  	    }


		$scope.create_dataset = function() {

				dataset_factory.create($scope.name, $scope.description, $scope.folder).success(function(data) {
					window.location.replace(server + "/medturk/index.html");
				});
		  }







});


app.controller('ModelController', function($scope) {

	$scope.tag 		= undefined;
	$scope.tag_text = '';
	$scope.choice_name = '';
	$scope.question = undefined;
	$scope.binary = [true, false];

	$scope.answer_types = ['radio', 'text'];


	questions = [{'_id' : '1', 'question' : 'Hello?', 'type' : 'radio', 'tag_ids' : ['2'], 'choices' : [{'_id' : 1, 'name' : 'Yes'}, {'_id' : 2, 'name' : 'No'}], 'triggers' : [{'_id' : 1, 'name' : 'cancer', 'case_sensitive' : true}]}, 
				 {'_id' : '2', 'question' : 'Was this patient diagnosed with Leukemia?', 'type' : 'radio', 'tag_ids' : ['1', '2'], 'choices' : [{'_id' : 1, 'name' : 'Yes'}, {'_id' : 2, 'name' : 'No'}], 'triggers' : [{'_id' : '1', 'name' : 'cancer', 'case_sensitive' : true}]}
				 ];

	$scope.model = {'name'        : 'My Model', 
					'description' : 'This is the description',
					'tags' : [{'_id' : '1', 'name' : 'Cancer'}, {'_id' : '2', 'name' : 'Leukemia'}, {'_id' : '3', 'name' : 'ALL'}], 
					'questions'   : questions};


	$scope.get_tag_by_id = function(_id) {

		for (var i = 0; i < $scope.model.tags.length; i++) {
			if (_id == $scope.model.tags[i]._id) {

				return $scope.model.tags[i];
			}
		}

		return undefined;
	}

	$scope.set_tag = function(tag) {
  		$scope.tag = tag;
  	 }


	 $scope.set_question = function(question) {
	  	if (question == undefined) {
	  		$scope.question = {'_id' : undefined, 'question' : '', 'type' : 'radio', 'tags' : [''], 'choices' : [], 'triggers' : []};
	  	}
	  	else {
	  		$scope.question = question;
	  	}
	  }


	  $scope.save_question = function(question) {
	  		if (question._id == undefined) {
	  			$scope.model.questions.push(question);
	  		}

	  		$('#question_modal').modal('hide');
	  }


	$scope.delete_choice = function(question, choice) {
		var index = $scope.question.choices.indexOf(choice);
		$scope.question.choices.splice(index, 1);
	}

	$scope.remove_tag_id_from_question = function(question, tag_id) {
		var index = $scope.question.tag_ids.indexOf(tag_id);
		$scope.question.tag_ids.splice(index, 1);
	}


  	$scope.delete_tag = function(_id) {

  		tags = [];

  		for (var i = 0; i < $scope.model.tags.length; i++) {
			if (_id != $scope.model.tags[i]._id) {
				tags.push($scope.model.tags[i])
			}
		}

		$scope.model.tags = tags;
  	}



  	$scope.remove_trigger_from_question = function(question, trigger_index) {
		question.triggers.splice(trigger_index, 1);
  	}






  	$scope.add_trigger = function(question, trigger) {

  		question.triggers.push({'_id' : '58', 'name' : trigger, 'case_sensitive' : $scope.case_sensitive})
  		
  		$scope.case_sensitive = false;
  		$scope.trigger = '';
  	}


  	$scope.save_question = function() {
  		if ($scope.question._id == undefined) {
  			$scope.model.questions.push($scope.question);
  		}
  	}

  	$scope.add_choice = function(choice_name) {
		$scope.question.choices.push({'_id' : 44, 'name' : choice_name});
		$scope.choice_name = '';	
  	}


	$scope.add_tag = function(tag_name) {

		for (var i = 0; i < $scope.model.tags.length; i++) {
			if (tag_name == $scope.model.tags[i].name) {
				alert('Tag already exists');
				return
			}
		}

		
		$scope.model.tags.push({'_id' : 44, 'name' : tag_name});	
	}



	$scope.add_tag_to_question = function(question, tag) {

		for (var i = 0; i < question.tag_ids.length; i++) {
			if (tag._id == question.tag_ids[i]) {
				alert('Tag is already added');
				return;
			}
		}
		
		question.tag_ids.push(tag._id);
	}











});



app.controller('WorkController', function($scope, $sce, $location, patient_factory, hit_factory, record_factory, project_factory) {

		 $scope.hit = undefined;
		 $scope.annotation = undefined;
		 $scope.is_project_complete = false;

		 $scope.projects = [];
		 $scope.project = undefined;

		 project_factory.get_all().success(function(data){
           $scope.projects = data.projects;
           $scope.project = $scope.projects[0];

            // Generate an initial hit
	        $scope.get_hit();

         }).error(function(data, status, headers, config){
     			if (status == '401') {
     			 	redirect_to_login();
     			}
     		
     	});

		 $scope.on_change_project = function(project) {
		 		$scope.project = project;
	        	$scope.get_hit();
		 }


		 $scope.get_hit = function() {
		 	
		 	hit_factory.get_hit($scope.project._id).success(function(data){
            	$scope.hit = data.hit;
           	
            	if ($scope.hit) {
            		$scope.is_project_complete = false;

            		// Highlights all triggers
            		for (var i = 0; i < $scope.hit.annotations.length; i++) {
            			$scope.hit.annotations[i].kwic = $sce.trustAsHtml(get_highlighted_text($scope.hit.annotations[i].kwic, $scope.hit.annotations[i].beg, $scope.hit.annotations[i].end));
            		}

            		// Set first annotation as default annotation
            		$scope.annotation = $scope.hit.annotations[0];
            	}
            	else {
            		$scope.is_project_complete = true;
            	}
            	
            	

          }).error(function(data, status, headers, config){
     			if (status == '401') {
     			 	redirect_to_login();
     			}
     		
     		});
		 }

		  $scope.prevent_default = function() {
		  		event.preventDefault();
		  }

		
		  $scope.validate_patient = function(is_validated, patient_id) {  
		  		patient_factory.validate_patient(patient_id, is_validated).success(function(data){
         		 	$scope.selected_patient.validated = is_validated;
        	});

		  }

		  $scope.get_record = function(record_id, kwic) {

		  		record_factory.get_record(record_id).success(function(data) {
		  			$scope.clinical_note = $sce.trustAsHtml(get_highlighted_text(data.note, $scope.annotation.beg, $scope.annotation.end));
          		});
		  }

		  $scope.set_annotation = function(annotation) {
	     	
	     	$scope.annotation = annotation;
	      	$scope.$apply();
	     }

	     $scope.answer = function(ans) {

	     	hit_factory.answer($scope.hit._id, ans).success(function(data){

	     		 // Generate a new hit
         		 $scope.get_hit();
        	});
	     }


	     $scope.download = function() {
  			hit_factory.download();
  		}

});



      