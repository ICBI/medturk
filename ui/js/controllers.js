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


app.controller('HomeController', function($scope, $upload, user_factory, project_factory, questionnaire_factory, patient_factory, dataset_factory) {

	 $scope.project = undefined;
	 $scope.dataset = undefined;
	 $scope.analysts = [];
	 $scope.project_name = '';
	 $scope.model_id = '';
	 $scope.workers = []; 
	 $scope.project_description = '';
	 $scope.datasets = [];
	 $scope.models = [];
	 $scope.roles = ['admin', 'analyst'];
	 $scope.new_user_role = 'analyst';


	 user_factory.get_users().success(function(data){
           $scope.users = data.users;
     }).error(function(data, status, headers, config){
     		if (status == '401') {
     			 redirect_to_login();
     		}
     		
     });



	 user_factory.get_user().success(function(data){
           $scope.user = data.user;
     }).error(function(data, status, headers, config){
     		if (status == '401') {
     			 redirect_to_login();
     		}
     		
     });



     $( "#edit_user_email" ).focusout(function() {
			user_factory.update_user_email($scope.edit_user._id, $scope.edit_user.id).success(function(data){
		});
	});


     $( "#edit_user_password" ).focusout(function() {
     	user_factory.update_user_password($scope.edit_user._id, $scope.edit_user.password).success(function(data){
		
		});
  	});

    $scope.update_user_role = function() {

  		user_factory.update_user_role($scope.edit_user._id,$scope.edit_user.role).success(function(data){
    	});
  	}



	  $scope.add_analyst = function(email) {

			project_factory.add_analyst($scope.project._id, email).success(function(data){
	           $('#close').click();

	        }).error(function(data, status, headers, config){
     			if (status == '401') {
     			 	redirect_to_login();
     			}
     		
     		}); 
	  }

	  $scope.set_edit_user = function(edit_user) {
	  	$scope.edit_user = edit_user;
  	  }


	  

  	  $scope.set_dataset = function(dataset) {
  		$scope.dataset = dataset;
  	  }

  	  $scope.download_model = function(model_id) {
  		 model_factory.download_model(model_id);
  	  }


	  $scope.download = function(project_id) {
  		 project_factory.get_answer_file(project_id);
  	  }

  	  questionnaire_factory.get_questionnaires().success(function(data) {
			$scope.models = data.models;
		});


		dataset_factory.get_datasets().success(function(data) {
			$scope.datasets = data.datasets;
		});

		$scope.on_model_upload = function($files) {
			  
			    var file = $files[0];

			    model_factory.upload(file).success(function(data){
			    	window.location.replace(server + "/medturk/index.html");
			    }).progress(function(evt) {
              		console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
              	});
		}

		$scope.add_worker = function(email) {

				if ($scope.workers.indexOf(email) == -1) {
					$scope.workers.push(email);
				}	
		  }


		 $scope.create_user = function(new_user_email, new_user_password, new_user_role) {
		 	
		 	
		 	user_factory.create_user(new_user_email, new_user_password, new_user_role).success(function(data) {
		 		$scope.users.push(data.user);
			});

		 }





		$scope.get_dataset_by_id = function(dataset_id) {
  			for (var i = 0; i < $scope.datasets.length; i++) {
  				if ($scope.datasets[i]._id == dataset_id) {
  					return $scope.datasets[i];
  				}
  			}

  			return undefined;
  		}

  		$scope.get_user_name = function(_user_id) {
  			for (var i = 0; i < $scope.users.length; i++) {
  				if ($scope.users[i]._id == _user_id) {
  					return $scope.users[i].id;
  				}
  			}

  			return '';
  		}


  		$scope.get_questionnaire_by_id = function(questionnaire_id) {
  			for (var i = 0; i < $scope.models.length; i++) {
  				if ($scope.models[i]._id == questionnaire_id) {
  					return $scope.models[i];
  				}
  			}

  			return undefined;
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
  		 	if(window.confirm('Are you sure you want to delete ' + model_name + '?')) {
  		 	
  		 		model_factory.delete(model_id).success(function(data) {
					window.location.replace(server + "/medturk/index.html");
				});

  		 	}
  	    }

  	    $scope.delete_user = function(_id, user_index) {
		user_factory.delete_user(_id).success(function(data){
			$scope.users.splice(user_index, 1);
    	});	
  	}


  	    



  	    $scope.edit_dataset = function() {
  	    	
  		 	dataset_factory.edit($scope.dataset._id, $scope.dataset.name, $scope.dataset.description).success(function(data) {
				window.location.replace(server + "/medturk/index.html");
			});
  	    }

  	    $scope.create_model = function() {

  	    	model_factory.create().success(function(data){
  	    			$scope.edit_model(data.id);
			    });
  	    }


  	    $scope.edit_model = function(model_id) {
  	    	window.location.replace(server + "/medturk/index.html#/model?_id=" + model_id);
  	    }

  	    $scope.create_dataset = function() {

				dataset_factory.create($scope.name, $scope.description, $scope.folder).success(function(data) {
					window.location.replace(server + "/medturk/index.html");
				});
		  }












  	    /*
  	     *
  	     *
  	     * Project Operations
  	     *
  	     *  
  	     */
  	    
  	    $( "#project_name" ).focusout(function() {
    		project_factory.update_project_name($scope.project._id, $scope.project.name).success(function(data){
    		});
  		});

  		$( "#project_description" ).focusout(function() {
    		project_factory.update_project_description($scope.project._id, $scope.project.description).success(function(data){
    		});
  		});

  	  	// Gets all of the available projects
  	     project_factory.get_projects().success(function(data){
           	$scope.projects = data.projects;
     	 });


  	     // Creates a new project
  	     $scope.create_project = function() {
  	    	project_factory.create_project().success(function(data){
  	    			$scope.projects.push(data.project);
  	    			$scope.project = data.project;
  	    			$scope.project_dataset 	     = undefined;
  					$scope.project_questionnaire = undefined;
			});
  	 	 }


  	 	 $scope.add_user_to_project = function(user_id) {


  	 	 	if ($scope.project.user_ids.indexOf(user_id) == -1) {
  				project_factory.create_user($scope.project._id, user_id).success(function(data){
					$scope.project.user_ids.push(user_id);
	    		});
  			}
			else {
				alert('User has already been added');
			}	
		}


		$scope.delete_user_from_project = function(_user_id, user_index) {
			project_factory.delete_user_from_project($scope.project._id, _user_id).success(function(data){
				$scope.project.user_ids.splice(user_index, 1);
    		});	
  		}


  	 	 // Updates the dataset the project is linked to
  	     $scope.update_project_dataset = function(_project_id, _project_dataset) {
  	     	
  	    	project_factory.update_project_dataset(_project_id, _project_dataset._id).success(function(data){
			});
  	 	 }

  	 	 // Updates the dataset the project is linked to
  	     $scope.update_project_questionnaire = function(_project_id, _project_questionnaire) {
  	    	project_factory.update_project_questionnaire(_project_id, _project_questionnaire._id).success(function(data){
			});
  	 	 }

  	 	 // Updates an existing project
  	     $scope.update_project = function() {
  	    	
  		 	project_factory.edit($scope.project._id, $scope.project.name, $scope.project.description).success(function(data) {
				window.location.replace(server + "/medturk/index.html");
			});
  	     }

  	     $scope.set_project = function(project) {
  			$scope.project = project;
  			$scope.project_dataset 	     = $scope.get_dataset_by_id($scope.project.dataset_id);
  			$scope.project_questionnaire = $scope.get_questionnaire_by_id($scope.project.questionnaire_id);
  	     }


		 $scope.delete_project = function(project_id, project_name, project_index) {
  		 	if(window.confirm('Are you sure you want to delete ' + project_name + '?. All data will be lost.')) {
  		 	
  		 		project_factory.delete_project(project_id).success(function(data) {
  		 			$scope.projects.splice(project_index, 1);
				});

  		 	}
  	    }


  	    $scope.build_project = function(project_id) {
  	    	$scope.project.status = 'Building...';
  	    }


		
});


app.controller('ModelController', function($scope, $routeParams, model_factory) {


	var model_id = $routeParams._id;

	model_factory.get_model(model_id).success(function(data){
		  $scope.model = data.model;
    });


	var model_id = $routeParams._id;



	$scope.tag 		= undefined;
	$scope.tag_text = '';
	$scope.choice_name = '';
	$scope.question = undefined;
	$scope.binary = [true, false];

	$scope.answer_types = ['radio', 'text'];


	$( "#question_text" ).focusout(function() {
    	model_factory.save_question_text($scope.model._id, $scope.question._id, $scope.question.question).success(function(data){
    	});
  	});


  	$( "#tag_name" ).focusout(function() {
    	model_factory.save_tag($scope.model._id, $scope.tag._id, $scope.tag.name).success(function(data){
    	});
  	});



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


  	 $scope.save_model = function(model) {
  		model_factory.save_model(model._id, model.name, model.description).success(function(data){
    	});
  	 }

  	 $scope.edit_question = function(question) {
		$scope.question = question;
  	 }


	$scope.create_question = function() {

  	    	model_factory.create_question($scope.model._id).success(function(data){
  	    			$scope.model.questions.push(data.question);
  	    			$scope.question = data.question;
			});
  	 }


	$scope.remove_choice_from_question = function(choice, choice_index) {
		
		model_factory.remove_choice_from_question($scope.model._id, $scope.question._id, choice._id).success(function(data){
			$scope.question.choices.splice(choice_index, 1);
    	});
	}



  	$scope.remove_question_from_model = function(model_id, question_id, question_index) {
  		model_factory.remove_question_from_model(model_id, question_id).success(function(data){
			$scope.model.questions.splice(question_index, 1);
    	});
	}


	$scope.save_question = function(question) {
  		if (question._id == undefined) {
  			$scope.model.questions.push(question);
  		}

  		$('#question_modal').modal('hide');
	}


	$scope.add_choice_to_question = function(choice_name) {
		
		for (var i = 0; i < $scope.question.choices.length; i++) {
			if ($scope.question.choices[i].name == choice_name) {
				alert('Choice already exists');
				return;
			}
		}	

	
		model_factory.create_choice_for_question($scope.model._id, $scope.question._id, choice_name).success(function(data){
			$scope.question.choices.push({'_id' : data.choice._id, 'name' : data.choice.name});
			$scope.choice_name = '';
		});	
  	}


  	$scope.add_tag_to_question = function(tag) {
  		
  		if ($scope.question.tag_ids.indexOf(tag._id) == -1) {
  			model_factory.create_tag_for_question($scope.model._id, $scope.question._id, tag._id).success(function(data){
				$scope.question.tag_ids.push(tag._id);
    		});
  		}
		else {
			alert('Tag is already added');
		}	
	}


	$scope.add_trigger_to_question = function(trigger) {
		trigger = trigger.trim();

		if (trigger.length == 0) {
			alert('Trigger cannot be empty');
			$scope.case_sensitive = false;
  			$scope.trigger = '';
			return;
		}

		for (var i = 0; i < $scope.question.triggers.length; i++) {
			if ($scope.question.triggers[i].name == trigger) {
				alert('Trigger already exists');
				return;
			}
		}



		
		model_factory.create_trigger_for_question($scope.model._id, $scope.question._id, trigger, $scope.case_sensitive).success(function(data){
			$scope.question.triggers.push(data.trigger);
			$scope.case_sensitive = false;
  			$scope.trigger = '';

		});

  	}


	$scope.save_question_type = function() {

		model_factory.save_question_type($scope.model._id, $scope.question._id, $scope.question.type).success(function(data){
				
    	});
	}


	$scope.remove_tag_id_from_question = function(tag_id, index) {
		

		model_factory.remove_tag_from_question($scope.model._id, $scope.question._id, tag_id).success(function(data){
			$scope.question.tag_ids.splice(index, 1);
    	});	

	}


  	$scope.remove_tag_from_model = function(model_id, tag_id, tag_index) {
		model_factory.remove_tag_from_model(model_id, tag_id).success(function(data){
			$scope.model.tags.splice(tag_index, 1);
    	});	
  	}



  	$scope.remove_trigger_from_question = function(trigger_id, trigger_index) {
		
  		model_factory.remove_trigger_from_question($scope.model._id, $scope.question._id, trigger_id).success(function(data){
			$scope.question.triggers.splice(trigger_index, 1);
    	});	
  	}



  	$scope.save_question = function() {
  		if ($scope.question._id == undefined) {
  			$scope.model.questions.push($scope.question);
  		}
  	}


	$scope.add_tag_to_model = function(model, tag_name) {

		for (var i = 0; i < $scope.model.tags.length; i++) {
			if (tag_name == $scope.model.tags[i].name) {
				alert('Tag already exists');
				return;
			}
		}

		// Create tag
		model_factory.create_tag_for_model(model._id, tag_name).success(function(data){
		  	$scope.model.tags.push(data.tag);
		  	$scope.tag_name = '';
    	});	
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



      