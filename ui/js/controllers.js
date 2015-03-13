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



app.controller('HomeController', function($scope, $upload, user_factory, project_factory, questionnaire_factory, dataset_factory, hit_factory, settings_factory) {

  	 $scope.project = undefined;
  	 $scope.dataset = undefined;
  	 $scope.users = [];
     $scope.projects = []
  	 $scope.project_name = '';
  	 $scope.questionnaire_id = '';
  	 $scope.project_description = '';
  	 $scope.datasets = [];
  	 $scope.questionnaires = [];
     $scope.new_user_is_admin = false;
     $scope.new_user_password = '';

     settings_factory.get_settings().success(function(data){
            $scope.settings = data;
     });


     $scope.get_dataset_index_by_id = function(dataset_id) {
              for (var i = 0; i < $scope.datasets.length; i++) {
                  if ($scope.datasets[i]._id == dataset_id) {
                      return i;
                  }
              }

          return -1;
     }


     $scope.get_dataset_by_id = function(dataset_id) {
              for (var i = 0; i < $scope.datasets.length; i++) {
                  if ($scope.datasets[i]._id == dataset_id) {
                      return $scope.datasets[i];
                  }
              }

          return undefined;
     }


     $scope.get_project_by_id = function(project_id) {
              for (var i = 0; i < $scope.projects.length; i++) {
                  if ($scope.projects[i]._id == project_id) {
                      return $scope.projects[i];
                  }
              }

          return undefined;
     }


     


  
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
             $scope.users = data;
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
       $( "#edit_username" ).focusout(function() {
    			user_factory.update_user_email($scope.edit_user._id, $scope.edit_user.username).success(function(data){
    		  });
  	   });


       // Update user password of the user being edited
       $( "#edit_user_password" ).focusout(function() {
       	  user_factory.update_user_password($scope.edit_user._id, $scope.edit_user.password).success(function(data){
  		    });
    	 });

      $scope.update_user_is_admin = function(_is_admin) {
        $scope.edit_user.is_admin = _is_admin
    		user_factory.update_user_is_admin($scope.edit_user._id, _is_admin).success(function(data){
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
      $scope.create_user = function(new_user_email, new_user_password, new_user_is_admin) {

        user_factory.create_user(new_user_email, new_user_password, new_user_is_admin).success(function(data) {
          $scope.users.push(data);
        });

       }

       $scope.get_user_name = function(_user_id) {
            for (var i = 0; i < $scope.users.length; i++) {
              if ($scope.users[i]._id == _user_id) {
                return $scope.users[i].username;
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
              $scope.datasets = data;
         });


         dataset_factory.get_raw_datasets().success(function(data) {
              $scope.raw_datasets = data;
         });


        $( "#dataset_name" ).focusout(function() {
              dataset_factory.update_dataset_name($scope.dataset._id, $scope.dataset.name).success(function(data){
              });
        });


        $( "#dataset_description" ).focusout(function() {
              dataset_factory.update_dataset_description($scope.dataset._id, $scope.dataset.description).success(function(data){
              });
        });



         $scope.create_dataset = function() {

              var _dataset;

              function on_build_dataset_callback(_json) {
                  
                    _dataset.status       = _json.status
                    _dataset.num_patients = _json.num_patients
                    $scope.$apply();
              }

              dataset_factory.create_dataset($scope.name, $scope.description, $scope.folder).success(function(data) {
                   _dataset = data
                   $scope.datasets.push(_dataset);

                  // Now that we have it, let's begin the uploading process
                   dataset_factory.build_dataset(_dataset._id, on_build_dataset_callback)
              })
         }


          $scope.set_dataset = function(dataset) {
              $scope.dataset = dataset;
          }



          $scope.delete_dataset = function(_dataset_id, _dataset_name, _dataset_index) {
              if(window.confirm('Are you sure you want to delete the dataset ' + _dataset_name + '?')) {
                    var _ds = $scope.get_dataset_by_id(_dataset_id);
                    _ds.status = 'Deleting...';

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
              $scope.questionnaires = data;
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
            window.location.replace(server + "/index.html#/questionnaire?questionnaire_id=" + _questionnaire_id);
         }


         $scope.edit_project = function(_project_id) {
            window.location.replace(server + "/index.html#/project?project_id=" + _project_id);
         }


         $scope.create_questionnaire = function() {

            questionnaire_factory.create_questionnaire().success(function(data){
                $scope.edit_questionnaire(data._id);
            });
          }


          $scope.on_questionnaire_upload = function($files) {
        
                var file = $files[0];

                questionnaire_factory.upload_questionnaire(file).success(function(data){
                  window.location.replace(server + "/index.html");
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
           	$scope.projects = data;
     	 });


  	     // Creates a new project
  	     $scope.create_project = function() {
        	    	project_factory.create_project().success(function(data){
        	    		$scope.projects.push(data);
        	    		$scope.project               = data;
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

  	 	 // Updates the questionnaire the project is linked to
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
  		 	    }
  	 }

     $scope.build_project = function() {

            $scope.project.status = 'Building (0% complete)';

            function on_build_hits_callback(_json) {
                
                  $scope.project.status      = _json.status
                  $scope.project.num_hits    = _json.num_hits
                  $scope.project.num_answers = _json.num_answers
                  $scope.$apply();
            }

            hit_factory.build_hits($scope.project._id, on_build_hits_callback)
     }


		
});


app.controller('QuestionnaireController', function($scope, $routeParams, questionnaire_factory) {

	var questionnaire_id        = $routeParams.questionnaire_id;
  $scope.tag                  = undefined;
  $scope.case_sensitive       = false;
  $scope.tag_text             = '';
  $scope.choice_name          = '';
  $scope.question             = undefined;
  $scope.binary               = [true, false];
  $scope.question_frequencies = [{'name' : 'Once', 'value' : 'once'}, {'name' : 'Multiple', 'value' : 'multiple'}];
  $scope.question_types       = [{'name' : 'Multiple Choice', 'value' : 'radio'}, {'name' : 'Free Text', 'value' : 'text'}];


  questionnaire_factory.get_questionnaire(questionnaire_id).success(function(data){
      $scope.questionnaire = data;
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

  $scope.update_choice_name = function(_choice_id, _choice_name) {
      questionnaire_factory.update_question_choice_name($scope.questionnaire._id, $scope.question._id, _choice_id, _choice_name).success(function(data){
      });
  }



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
  	    			$scope.questionnaire.questions.push(data);
  	    			$scope.question = data;
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
    			       $scope.question.choices.push(data);
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
          		$scope.trigger = '';
        			return;
    		}

    		for (var i = 0; i < $scope.question.triggers.length; i++) {
        			if ($scope.question.triggers[i].name == _trigger) {
        				alert('Keyword already in use');
        				return;
        			}
		    }


    		questionnaire_factory.create_question_trigger($scope.questionnaire._id, $scope.question._id, _trigger, $scope.case_sensitive).success(function(data){
    			     $scope.question.triggers.push(data);
      			   $scope.trigger = '';
    		});
  }


  $scope.update_question_type = function(_question_type) {

    $scope.question.type = _question_type.value;
    questionnaire_factory.update_question_type($scope.questionnaire._id, $scope.question._id, $scope.question.type).success(function(data){
        
    });
  }


  $scope.update_question_frequency = function(_question_frequency) {

    $scope.question.frequency = _question_frequency.value;
    questionnaire_factory.update_question_frequency($scope.questionnaire._id, $scope.question._id, $scope.question.frequency).success(function(data){
        
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
        		  	$scope.questionnaire.tags.push(data);
        		  	$scope.tag_name = '';
            });
	  }


});












app.controller('ProjectController', function($scope, $routeParams, project_factory, user_factory, questionnaire_factory) {

  var project_id     = $routeParams.project_id;


  // Gets all users
  user_factory.get_users().success(function(data){
             $scope.users = data;
  });


   $scope.get_user_name = function(_user_id) {
        for (var i = 0; i < $scope.users.length; i++) {
          if ($scope.users[i]._id == _user_id) {
            return $scope.users[i].username;
          }
        }

        return '';
    }


  $scope.delete_user_from_project = function(_user_id, user_index) {
      project_factory.delete_user_from_project($scope.project._id, _user_id).success(function(data){
            $scope.project.user_ids.splice(user_index, 1);
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


  project_factory.get_project(project_id).success(function(data){
      $scope.project = data;

      // Now we can retrieve the questionnaire
      questionnaire_factory.get_questionnaire($scope.project.questionnaire_id).success(function(data){
            $scope.questionnaire = data;
      });
  })

  $( "#project_name" ).focusout(function() {
      project_factory.update_project_name($scope.project._id, $scope.project.name).success(function(data){
      });
  });


  $( "#project_description" ).focusout(function() {
      project_factory.update_project_description($scope.project._id, $scope.project.description).success(function(data){
      });
  });

});







app.controller('BulkController', function($scope, project_factory, questionnaire_factory, phrase_factory) {

     $scope.is_project_complete = false;
     $scope.projects = [];
     $scope.phrases = {}


      project_factory.get_projects().success(function(data){
             $scope.projects = data;
             $scope.project = $scope.projects[0];

             if ($scope.project) {

                questionnaire_factory.get_questionnaire($scope.project.questionnaire_id).success(function(data){
                    $scope.questionnaire = data;
                    $scope.question = $scope.questionnaire.questions[0]
                    $scope.get_phrases()
                });
            }

           }).error(function(data, status, headers, config){
            if (status == '401') {
              redirect_to_login();
            }
    
      });
     

     

     $scope.on_change_project = function(project) {
        $scope.project = project;
        questionnaire_factory.get_questionnaire($scope.project.questionnaire_id).success(function(data){
                $scope.questionnaire = data;
                $scope.question = $scope.questionnaire.questions[0]
                $scope.get_phrases()
        });
     }


     $scope.on_change_question = function(question) {
        $scope.question = question;
        $scope.get_phrases()
     }


     $scope.get_phrases_by_project_id_and_question_id_callback = function(data) {
          if (data.length == 0) {
              $scope.phrases = []
          }
          else {
              $scope.phrases = data
          }
      }

      $scope.get_phrases = function() {

          phrase_factory.get_phrases_by_project_id_and_question_id($scope.project._id, $scope.question._id)
                  .success($scope.get_phrases_by_project_id_and_question_id_callback)
      }


      $scope.ignore_phrase = function(_phrase, _phrase_index) {
  
          phrase_factory.ignore(_phrase._id).success(function(){
              $scope.phrases.splice(_phrase_index, 1);
          })
      }

      $scope.mark_phrase_as_not_relevant = function(_phrase, _phrase_index) {

          phrase_factory.not_applicable(_phrase._id).success(function(){
              $scope.phrases.splice(_phrase_index, 1);
          })
      } 


      $scope.answer = function(_phrase_id, _answer, _phrase_index) {
        
          phrase_factory.answer(_phrase_id, _answer, $scope.question.type, $scope.question.frequency).success(function(){
              $scope.phrases.splice(_phrase_index, 1);
          })
      }
})





app.controller('WorkController', function($scope, $sce, $location, hit_factory, record_factory, project_factory, questionnaire_factory) {

		 $scope.hit = undefined;
		 $scope.annotation = undefined;
		 $scope.is_project_complete = false;
		 $scope.projects = [];
		 //$scope.project = undefined;
     $scope.questionnaire = undefined;
     //$scope.question = undefined;


     function get_question(_question_id) {
          for (var i = 0; i < $scope.questionnaire.questions.length; i++) {
                if ($scope.questionnaire.questions[i]._id == _question_id) {
                    return $scope.questionnaire.questions[i]
                }
          }

          return undefined;
     }


     function get_choice(_choice_id) {
          for (var i = 0; i < $scope.question.choices.length; i++) {
                if ($scope.question.choices[i]._id == _choice_id) {
                    return $scope.question.choices[i];
                }
          }

          return undefined;
     }



  
      project_factory.get_projects().success(function(data){
             $scope.projects = data;
             $scope.project = $scope.projects[0];

             if ($scope.project) {

                questionnaire_factory.get_questionnaire($scope.project.questionnaire_id).success(function(data){
                    $scope.questionnaire = data;
                    $scope.get_hit();
                });
            }

           }).error(function(data, status, headers, config){
            if (status == '401') {
              redirect_to_login();
            }
    
      });
     

		 

		 $scope.on_change_project = function(project) {
		 		$scope.project = project;
        questionnaire_factory.get_questionnaire($scope.project.questionnaire_id).success(function(data){
                $scope.questionnaire = data;
        });
	      $scope.get_hit();
		 }

     


		 $scope.get_hit = function() {

      // Update status information
      project_factory.get_project($scope.project._id).success(function(data){
             $scope.project.num_answers = data.num_answers
      })


		 	
		 	hit_factory.get_hit($scope.project._id).success(function(data){
            
              $scope.hit = data;
              $scope.question = get_question($scope.hit.question_id);
           	
              
            	if ($scope.hit) {
            		$scope.is_project_complete = false;

            		// Highlights all triggers
            		for (var i = 0; i < $scope.hit.annotations.length; i++) {
            			$scope.hit.annotations[i].kwic = $sce.trustAsHtml(get_highlighted_text($scope.hit.annotations[i].kwic, $scope.hit.annotations[i].rel_beg, $scope.hit.annotations[i].rel_beg + $scope.hit.annotations[i].trigger.length));
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


		  $scope.get_record = function(record_id) {

		  		record_factory.get_record(record_id).success(function(data) {
            
		  			$scope.clinical_note = $sce.trustAsHtml(get_highlighted_text(data.note, $scope.annotation.abs_beg, $scope.annotation.abs_beg + $scope.annotation.trigger.length));
          		});
		  }

		  $scope.set_annotation = function(annotation) {
	     	  
	     	  $scope.annotation = annotation;

          if ($scope.question.frequency == 'multiple' && annotation.answered) {
              $scope.selected_choice = get_choice($scope.annotation.choice_id); 
          }

	      	$scope.$apply();
	     }

	     $scope.create_hit_choice = function(choice) {

            if ($scope.question.frequency == 'once') {
                  hit_factory.create_hit_choice($scope.project._id, $scope.hit._id, choice._id).success(function(data){

                      // Generate a new hit
                      $scope.get_hit();
                  });
            }
            else {

                hit_factory.create_hit_annotation_choice($scope.hit._id, $scope.annotation._id, choice._id).success(function(data){
                      $scope.annotation.answered = true;
                      $scope.annotation.choice_id = choice._id;
                });
            }
	     }


       $scope.update_hit_answered = function() {
          hit_factory.update_hit_answered($scope.project._id, $scope.hit._id).success(function(data){
                  $scope.get_hit();
          });
       }


       $scope.create_hit_text = function(text) {
       
        hit_factory.create_hit_text($scope.project._id, $scope.hit._id, text).success(function(data){
             $scope.get_hit();
          });
       }


	     $scope.download = function() {
  			hit_factory.download();
  		}

});



      