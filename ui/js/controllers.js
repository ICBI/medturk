function get_highlighted_text(text, text_to_highlight) {
	return text.replace(text_to_highlight, '<span class="highlight">' + text_to_highlight + '</span>');
}


 app.controller('HomeController', function($scope) {
 	

});


  app.controller('ProjectController', function($scope, model_factory, hit_factory, project_factory) {
 	
	$scope.num_answered = 0;
	$scope.num_questions = 1;

  	model_factory.get_model().success(function(data){
         		 $scope.model = data;
    });


  	hit_factory.get_count().success(function(data) {
  				$scope.num_questions = data.count;
  	});

  	hit_factory.get_answer_count().success(function(data) {
  				$scope.num_answered = data.count;
  	});


  	$scope.download = function() {
  		hit_factory.download();
  	}

});



app.controller('CreateController', function($scope, $upload, model_factory, patient_factory, project_factory, annotation_factory) {

	$scope.project_name = '';


	$scope.on_model_upload = function($files) {
			  
			    var file = $files[0];

			    model_factory.save(file).success(function(data){
			    	console.log(data);
			    }).progress(function(evt) {
              		console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
              	});
		}


		$scope.on_patient_files_upload = function($files) {
			  
			    for (var i = 0; i < $files.length; i++) {
      				var file = $files[i];

				    patient_factory.save(file).success(function(data){
				    	console.log(data);
				    }).progress(function(evt) {
	              		console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
	              	});

				}
		}


		$scope.on_ctakes_files_upload = function($files) {
			  
			    for (var i = 0; i < $files.length; i++) {
      				var file = $files[i];

				    annotation_factory.ctakes_save(file).success(function(data){
				    	console.log(data);
				    }).progress(function(evt) {
	              		console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
	              	});

				}
		}


		$scope.create_project = function(name) {
				if (name.length == 0) {
					alert("Hey! You never named your project :(");

				}
				else {
					project_factory.create(name).success(function(data) {
						alert('Congrats! Your project is now underway')
					});

				}
		  }
});


app.controller('WorkController', function($scope, $sce, $location, patient_factory, hit_factory, record_factory) {

		 $scope.hit = undefined;
		 $scope.annotation = undefined;
		 $scope.is_project_complete = false;


		 $scope.get_hit = function() {
		 	
		 	hit_factory.get_hit().success(function(data){
            	$scope.hit = data;
            	
            	// Set first annotation as default annotation
            	$scope.annotation = data.annotations[0];
          }).error(function(data) {
		 		$scope.is_project_complete = true;
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
		  			$scope.clinical_note = $sce.trustAsHtml(get_highlighted_text(data.note, $scope.annotation.kwic));
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

	     // Generate an initial hit
	     $scope.get_hit();

});



      