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


app.controller('HomeController', function($scope, $upload, user_factory, project_factory, questionnaire_factory, patient_factory, dataset_factory, hit_factory) {

  	 $scope.project = undefined;
  	 $scope.dataset = undefined;
  	 $scope.analysts = [];
  	 $scope.project_name = '';
  	 $scope.questionnaire_id = '';
  	 $scope.workers = []; 
  	 $scope.project_description = '';
  	 $scope.datasets = [];
  	 $scope.questionnaires = [];
  	 $scope.roles = ['admin', 'analyst'];
  	 $scope.new_user_role = 'analyst';



      /*
       *
       *
       *
       *
       *
       *
       *
       * User Operations
       * 
       *
       *
       *
       *
       *  
       */

       // Gets all users
  	   user_factory.get_users().success(function(data){
             $scope.users = data.users;
        });


       // Gets current user
  	   user_factory.get_user().success(function(data){
             $scope.user = data.user;
       }).error(function(data, status, headers, config){
       		if (status == '401') {
       			 redirect_to_login();
       		}
       		
       });

       // Set the user that might be edited
      $scope.set_edit_user = function(edit_user) {
          $scope.edit_user = edit_user;
      }


       // Update user name of the user being edited
       $( "#edit_user_email" ).focusout(function() {
    			user_factory.update_user_email($scope.edit_user._id, $scope.edit_user.id).success(function(data){
    		  });
  	   });


       // Update user password of the user being edited
       $( "#edit_user_password" ).focusout(function() {
       	  user_factory.update_user_password($scope.edit_user._id, $scope.edit_user.password).success(function(data){
  		    });
    	 });

       // Update user role of the user being edited
      $scope.update_user_role = function() {

    		user_factory.update_user_role($scope.edit_user._id,$scope.edit_user.role).success(function(data){
      	});
    	}

      // Add new user
  	  $scope.add_analyst = function(email) {

  			project_factory.add_analyst($scope.project._id, email).success(function(data){
  	           $('#close').click();

  	        }).error(function(data, status, headers, config){
       			if (status == '401') {
       			 	redirect_to_login();
       			}
       		
       		}); 
  	  }

      // Create new user
      $scope.create_user = function(new_user_email, new_user_password, new_user_role) {
        user_factory.create_user(new_user_email, new_user_password, new_user_role).success(function(data) {
          $scope.users.push(data.user);
        });

       }

       $scope.get_user_name = function(_user_id) {
            for (var i = 0; i < $scope.users.length; i++) {
              if ($scope.users[i]._id == _user_id) {
                return $scope.users[i].id;
              }
            }

            return '';
        }
  	 

  	    

    	 $scope.delete_user = function(_id, user_index) {
  		        user_factory.delete_user(_id).success(function(data){
  			           $scope.users.splice(user_index, 1);
      	     });	
    	 }

        /*
         *
         *
         *
         *
         *
         *
         *
         * Dataset Operations
         * 
         *
         *
         *
         *
         *  
         */
         dataset_factory.get_datasets().success(function(data) {
              $scope.datasets = data.datasets;
         });


         dataset_factory.get_raw_datasets().success(function(data) {
              $scope.raw_datasets = data.datasets;
         });


         $scope.get_dataset_by_id = function(dataset_id) {
              for (var i = 0; i < $scope.datasets.length; i++) {
                  if ($scope.datasets[i]._id == dataset_id) {
                      return $scope.datasets[i];
                  }
              }

          return undefined;
        }

        $( "#dataset_name" ).focusout(function() {
              dataset_factory.update_dataset_name($scope.dataset._id, $scope.dataset.name).success(function(data){
              });
        });


        $( "#dataset_description" ).focusout(function() {
              dataset_factory.update_dataset_description($scope.dataset._id, $scope.dataset.description).success(function(data){
              });
        });



         $scope.create_dataset = function() {
              dataset_factory.create_dataset($scope.name, $scope.description, $scope.folder).success(function(data) {
                  $scope.datasets.push(data.dataset);
              });
         }

          $scope.set_dataset = function(dataset) {
              $scope.dataset = dataset;
          }


          $scope.delete_dataset = function(_dataset_id, _dataset_name, _dataset_index) {
              if(window.confirm('Are you sure you want to delete the dataset ' + _dataset_name + '?')) {
                    dataset_factory.delete_dataset(_dataset_id).success(function(data) {
                            $scope.datasets.splice(_dataset_index, 1);
                    });
              }
         }

        

        /*
         *
         *
         *
         *
         *
         *
         *
         * Questionnaire Operations
         * 
         *
         *
         *
         *
         *  
         */
         questionnaire_factory.get_questionnaires().success(function(data) {
              $scope.questionnaires = data.questionnaires;
         });


         $scope.get_questionnaire_by_id = function(questionnaire_id) {
              for (var i = 0; i < $scope.questionnaires.length; i++) {
                  if ($scope.questionnaires[i]._id == questionnaire_id) {
                      return $scope.questionnaires[i];
                  }
              }

            return undefined;
          }



         $scope.edit_questionnaire = function(_questionnaire_id) {
            window.location.replace(server + "/medturk/index.html#/questionnaire?questionnaire_id=" + _questionnaire_id);
         }

         $scope.create_questionnaire = function() {

            questionnaire_factory.create_questionnaire().success(function(data){
                $scope.edit_questionnaire(data.questionnaire_id);
            });
          }


          $scope.on_questionnaire_upload = function($files) {
        
                var file = $files[0];

                questionnaire_factory.upload_questionnaire(file).success(function(data){
                  window.location.replace(server + "/medturk/index.html");
                }).progress(function(evt) {
                        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                });
          }


           $scope.download_questionnaire = function(_questionnaire_id) {
              questionnaire_factory.download_questionnaire(_questionnaire_id);
           }



           $scope.delete_questionnaire = function(_questionnaire_id, _questionnaire_name, _questionnaire_index) {
                if(window.confirm('Are you sure you want to delete ' + _questionnaire_name + '?')) {
                      questionnaire_factory.delete_questionnaire(_questionnaire_id).success(function(data) {
                            $scope.questionnaires.splice(_questionnaire_index, 1);
                      });
                }
          }

  	    /*
         *
         *
         *
         *
         *
         *
         *
         * Project Operations
         * 
         *
         *
         *
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


        $scope.download = function(project_id) {
              project_factory.get_answer_file(project_id);
        }

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

                   hit_factory.delete_hits(project_id).success(function(data) {
                          
                   });

  		 	    }
  	 }


  	$scope.build_project = function(_project_id) {
  	    $scope.project.status = 'Building...';
        hit_factory.create_hits(_project_id).success(function(data){
                $scope.project.status = 'Ready';
        });

  	 }


		
});


app.controller('QuestionnaireController', function($scope, $routeParams, questionnaire_factory) {

	var questionnaire_id    = $routeParams.questionnaire_id;
  $scope.tag              = undefined;
  $scope.tag_text         = '';
  $scope.choice_name      = '';
  $scope.question         = undefined;
  $scope.binary           = [true, false];
  $scope.answer_types     = ['radio', 'text'];


  questionnaire_factory.get_questionnaire(questionnaire_id).success(function(data){
      $scope.questionnaire = data.questionnaire;
  });


  $( "#questionnaire_name" ).focusout(function() {
      questionnaire_factory.update_questionnaire_name($scope.questionnaire._id, $scope.questionnaire.name).success(function(data){
      });
  });


  $( "#questionnaire_description" ).focusout(function() {
      questionnaire_factory.update_questionnaire_description($scope.questionnaire._id, $scope.questionnaire.description).success(function(data){
      });
  });



	$( "#question_text" ).focusout(function() {
    	questionnaire_factory.update_question_text($scope.questionnaire._id, $scope.question._id, $scope.question.question).success(function(data){
    	});
  });


  $( "#questionnaire_tag_name" ).focusout(function() {
    	questionnaire_factory.update_questionnaire_tag_name($scope.questionnaire._id, $scope.tag._id, $scope.tag.name).success(function(data){
    	});
  });



	$scope.get_tag_by_id = function(_tag_id) {

		for (var i = 0; i < $scope.questionnaire.tags.length; i++) {
			if (_tag_id == $scope.questionnaire.tags[i]._id) {

				return $scope.questionnaire.tags[i];
			}
		}

		return undefined;
	}

	$scope.set_tag = function(_tag) {
  		$scope.tag = _tag;
  }


  $scope.edit_question = function(_question) {
		  $scope.question = _question;
  }


	$scope.create_question = function() {

  	    	questionnaire_factory.create_question($scope.questionnaire._id).success(function(data){
  	    			$scope.questionnaire.questions.push(data.question);
  	    			$scope.question = data.question;
			});
  	 }


	$scope.delete_question_choice = function(_choice, _choice_index) {
		
		  questionnaire_factory.delete_question_choice($scope.questionnaire._id, $scope.question._id, _choice._id).success(function(data){
			     $scope.question.choices.splice(_choice_index, 1);
      });
	}



  	$scope.delete_question = function(_questionnaire_id, _question_id, _question_index) {
  		questionnaire_factory.delete_question(_questionnaire_id, _question_id).success(function(data){
			     $scope.questionnaire.questions.splice(_question_index, 1);
    	});
	}


	$scope.create_question_choice = function(_choice_name) {
		
      		for (var i = 0; i < $scope.question.choices.length; i++) {
      			   if ($scope.question.choices[i].name == _choice_name) {
      				      alert('Choice already exists');
      				      return;
      			   }
      		}	

	
		      questionnaire_factory.create_question_choice($scope.questionnaire._id, $scope.question._id, _choice_name).success(function(data){
    			       $scope.question.choices.push({'_id' : data.choice._id, 'name' : data.choice.name});
    			       $scope.choice_name = '';
		      });	
  	}


  	$scope.create_question_tag = function(_tag) {
  		
  		if ($scope.question.tag_ids.indexOf(_tag._id) == -1) {
      			questionnaire_factory.create_question_tag($scope.questionnaire._id, $scope.question._id, _tag._id).success(function(data){
    				    $scope.question.tag_ids.push(_tag._id);
        		});
  		}
		  else {
			        alert('Tag is already added');
		   }	
	}


	$scope.create_question_trigger = function(_trigger) {
		    _trigger = _trigger.trim();

    		if (_trigger.length == 0) {
        			alert('Trigger cannot be empty');
        			$scope.case_sensitive = false;
          		$scope.trigger = '';
        			return;
    		}

    		for (var i = 0; i < $scope.question.triggers.length; i++) {
        			if ($scope.question.triggers[i].name == _trigger) {
        				alert('Trigger already exists');
        				return;
        			}
		    }



		
    		questionnaire_factory.create_question_trigger($scope.questionnaire._id, $scope.question._id, _trigger, $scope.case_sensitive).success(function(data){
    			     $scope.question.triggers.push(data.trigger);
    			     $scope.case_sensitive = false;
      			   $scope.trigger = '';
    		});
  }


	$scope.update_question_type = function() {

		questionnaire_factory.update_question_type($scope.questionnaire._id, $scope.question._id, $scope.question.type).success(function(data){
				
    	});
	}


	$scope.delete_question_tag = function(_tag_id, _index) {
		

		  questionnaire_factory.delete_question_tag($scope.questionnaire._id, $scope.question._id, _tag_id).success(function(data){
			       $scope.question.tag_ids.splice(_index, 1);
    	});	

	}


  	$scope.delete_questionnaire_tag = function(_questionnaire_id, _tag_id, _tag_index) {
		        questionnaire_factory.delete_questionnaire_tag(_questionnaire_id, _tag_id).success(function(data){
			           $scope.questionnaire.tags.splice(_tag_index, 1);
    	      });	
  	}



  	$scope.delete_question_trigger = function(_trigger_id, _trigger_index) {
		
  		    questionnaire_factory.delete_question_trigger($scope.questionnaire._id, $scope.question._id, _trigger_id).success(function(data){
			           $scope.question.triggers.splice(_trigger_index, 1);
    	    });	
  	}



  	$scope.save_question = function() {
  		    if ($scope.question._id == undefined) {
  			       $scope.questionnaire.questions.push($scope.question);
  		    }
  	}


	  $scope.create_questionnaire_tag = function(_questionnaire, _tag_name) {

        		for (var i = 0; i < $scope.questionnaire.tags.length; i++) {
            			if (_tag_name == $scope.questionnaire.tags[i].name) {
            				      alert('Tag already exists');
            				      return;
            			}
    		    }

        
        		questionnaire_factory.create_questionnaire_tag(_questionnaire._id, _tag_name).success(function(data){
        		  	$scope.questionnaire.tags.push(data.tag);
        		  	$scope.tag_name = '';
            });
	  }


});







app.controller('WorkController', function($scope, $sce, $location, patient_factory, hit_factory, record_factory, project_factory, questionnaire_factory) {

		 $scope.hit = undefined;
		 $scope.annotation = undefined;
		 $scope.is_project_complete = false;
		 $scope.projects = [];
		 $scope.project = undefined;
     $scope.questionnaire = undefined;
     $scope.question = undefined;


     function get_question(_question_id) {
          for (var i = 0; i < $scope.questionnaire.questions.length; i++) {
                if ($scope.questionnaire.questions[i]._id == _question_id) {
                    return $scope.questionnaire.questions[i]
                }
          }

          return undefined;
     }



  
      project_factory.get_projects().success(function(data){
             $scope.projects = data.projects;
             $scope.project = $scope.projects[0];

             questionnaire_factory.get_questionnaire($scope.project.questionnaire_id).success(function(data){
                  $scope.questionnaire = data.questionnaire;
                  $scope.get_hit();
             });

           }).error(function(data, status, headers, config){
            if (status == '401') {
              redirect_to_login();
            }
    
      });
     

		 

		 $scope.on_change_project = function(project) {
		 		$scope.project = project;
        questionnaire_factory.get_questionnaire($scope.project.questionnaire_id).success(function(data){
                $scope.questionnaire = data.questionnaire;
        });
	      $scope.get_hit();
		 }

     


		 $scope.get_hit = function() {
		 	
		 	hit_factory.get_hit($scope.project._id).success(function(data){
            
              $scope.hit = data.hit;
              $scope.question = get_question($scope.hit.question_id);
           	
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
          else if (status == '404') {
            $scope.is_project_complete = true;
            $scope.hit = undefined;
            $scope.question = undefined;
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

	     $scope.create_hit_choice = function(choice) {

	     	hit_factory.create_hit_choice($scope.hit._id, choice._id).success(function(data){

	     		 // Generate a new hit
         		 $scope.get_hit();
        	});
	     }


       $scope.create_answer_text = function(text) {

        hit_factory.create_answer($scope.hit._id, text).success(function(data){

           // Generate a new hit
             $scope.get_hit();
          });
       }


	     $scope.download = function() {
  			hit_factory.download();
  		}

});



      