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


app.controller('HomeController', function($scope, user_factory, project_factory) {

	 $scope.project = undefined;

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


	  $scope.download = function(project_id) {
  		 project_factory.data(project_id);
  	  }
});


app.controller('CreateController', function($scope, $upload, model_factory, patient_factory, project_factory, dataset_factory) {

		$scope.project_name = '';
		$scope.model_id = '';
		$scope.workers = []; 
		$scope.project_description = '';
		$scope.datasets = [];


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



      