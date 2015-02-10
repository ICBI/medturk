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



//var server = 'http://127.0.0.1:5000';
var server = 'https://localhost';

function redirect_to_login() {
    window.location.replace(server + "/login.html")
}


var app = angular.module('medTurkApp', ['angularFileUpload', 'ngRoute', 'ngSanitize'])

/*
 *
 *
 *
 *
 *
 *
 *
 *
 * Routing
 *
 *
 *
 *
 *
 *
 *
 */

app.config(function($routeProvider) {
  $routeProvider.when('/', 
  {
    controller: 'HomeController',
    templateUrl: 'views/home.html'
  })
  .when('/work',
  {
     controller: 'WorkController',
     templateUrl: 'views/work.html'
  })
  .when('/bulk',
  {
     controller: 'BulkController',
     templateUrl: 'views/bulk.html'
  })
   .when('/project',
  {
     controller: 'ProjectController',
     templateUrl: 'views/project.html'
  })
  .when('/questionnaire',
  {
     controller: 'QuestionnaireController',
     templateUrl: 'views/questionnaire.html'
  })
});

/*
 *
 *
 *
 *
 *
 *
 *
 *
 * Data Calls
 *
 *
 *
 *
 *
 *
 *
 */


app.factory('questionnaire_factory', function($http, $upload) {


    var factory = {};

    /*
     *
     *     CREATE operations
     *   
     */
    factory.upload_questionnaire = function(file) {
       return $upload.upload({
              url: '/questionnaires/upload',
              file: file
            });
     }

     factory.create_questionnaire = function() {
        return $http.post(server + '/questionnaires');
     }

     factory.create_question_choice = function(_id, _question_id, _name) {

        var _json = {
                        id          : _id, 
                        question_id : _question_id, 
                        name        : _name
                    };

        return $http.post(server + '/questionnaires/id/questions/id/choice', _json);
     }


     factory.create_question_trigger = function(_id, _question_id, _name, _case_sensitive) {

        var _json = {
                        id             : _id, 
                        question_id    : _question_id, 
                        name           : _name,
                        case_sensitive : _case_sensitive
                    };

        return $http.post(server + '/questionnaires/id/questions/id/trigger', _json);
     }


     factory.create_questionnaire_tag = function(_id, _name) {
      
      
        var _json = {
                        id    : _id, 
                        name  : _name
                    };

        return $http.post(server + '/questionnaires/id/tag', _json);
     }


     factory.create_question_tag = function(_id, _question_id, _tag_id) {

        var _json = {
                        id            : _id, 
                        question_id   : _question_id, 
                        tag_id        : _tag_id
                    };

        return $http.post(server + '/questionnaires/id/questions/id/tag', _json);
     }


     factory.create_question = function(_id) {

        var _json = {
                        id : _id
                    };

        return $http.post(server + '/questionnaires/id/question', _json);
     }








     /*
     *
     *     READ operations
     *   
     */
     factory.download_questionnaire = function(_id) {
        window.open(server + '/questionnaires/id/download?id=' + _id, '_blank', '');
     }

     factory.get_questionnaire = function(_id) {
         return $http.get(server + '/questionnaires/id?id=' + _id); 
     }


     factory.get_questionnaires = function() {
       return $http.get(server + '/questionnaires');
     }









     /*
     *
     *     UPDATE operations
     *   
     */
     factory.update_questionnaire_tag_name = function(_id, _tag_id, _name) {

        var _json = {
                        id        : _id, 
                        tag_id    : _tag_id, 
                        name      : _name
                    };

                    
        return $http.post(server + '/questionnaires/id/tag/name', _json);
     }


    factory.update_question_type = function(_id, _question_id, _type) {

          var _json = {
                          id            : _id, 
                          question_id   : _question_id, 
                          type          : _type
                      };

        return $http.post(server + '/questionnaires/id/questions/id/type', _json);
     }


     factory.update_question_frequency = function(_id, _question_id, _frequency) {

          var _json = {
                          id          : _id, 
                          question_id : _question_id, 
                          frequency   : _frequency
                      };

        return $http.post(server + '/questionnaires/id/questions/id/frequency', _json);
     }


     factory.update_question_choice_name = function(_id, _question_id, _choice_id, _name) {

          var _json = {
                          id            : _id, 
                          question_id   : _question_id,
                          choice_id     : _choice_id, 
                          name          : _name
                      };

        return $http.post(server + '/questionnaires/id/questions/id/choices/id/name', _json);
     }



     factory.update_question_text = function(_id, _question_id, _question) {

        var _json = {
                        id           : _id, 
                        question_id  : _question_id, 
                        question     : _question
                    };

        return $http.post(server + '/questionnaires/id/questions/id/question', _json);
     }


     factory.update_questionnaire_name = function(_id, _name) {

        var _json = {
                        id   : _id, 
                        name : _name
                    };


        return $http.post(server + '/questionnaires/id/name', _json);
     }


     factory.update_questionnaire_description = function(_id, _description) {

        var _json = {
                        id          : _id, 
                        description : _description
                    };


        return $http.post(server + '/questionnaires/id/description', _json);
     }











     /*
     *
     *     DELETE operations
     *   
     */
     factory.delete_questionnaire = function(_id) {
          return $http.delete(server + '/questionnaires/id?id=' + _id);
     }

     factory.delete_questionnaire_tag = function(_id, _tag_id) {
     
        return $http.delete(server + '/questionnaires/id/tag?id=' + _id + '&tag_id=' + _tag_id);
     }


     factory.delete_question_tag = function(_id, _question_id, _tag_id) {
 
        return $http.delete(server + '/questionnaires/id/questions/id/tags/id?id=' + _id + '&question_id=' + _question_id + '&tag_id=' + _tag_id);
     }



     factory.delete_question_trigger = function(_id, _question_id, _trigger_id) {
 
        return $http.delete(server + '/questionnaires/id/questions/id/triggers/id?id=' + _id + '&question_id=' + _question_id + '&trigger_id=' + _trigger_id);
     }


     factory.delete_question = function(_id, _question_id) {
        return $http.delete(server + '/questionnaires/id/question?id=' + _id + '&question_id=' + _question_id);
     }


     factory.delete_question_choice = function(_id, _question_id, _choice_id) {
 
        return $http.delete(server + '/questionnaires/id/questions/id/choices/id?id=' + _id + '&question_id=' + _question_id + '&choice_id=' + _choice_id);
     }
          
     
     return factory;
});




app.factory('dataset_factory', function($http) {

    var factory = {};

    /*
     *
     *     CREATE operations
     *   
     */

    factory.create_dataset = function(_name, _description, _folder, _callback) {
          
          // If undefined, field will not show up on server
          if (!_description) {
              _description = ''
          }


          var _json = {
                        name        : _name, 
                        description : _description,
                        folder      : _folder
                      };

          return $http.post(server + '/datasets', _json);
     }

  
     factory.build_dataset = function(_id, _callback) {
     
          var es = new EventSource(server + '/datasets/id/build?id=' + _id)
          es.onmessage = function (event) {

              var _json = JSON.parse(event.data);

              // Know when to close the connection!
              if (_json.status == "Active") {
                  es.close()
              }   

              _callback(_json);
          }
     }


    /*
     *
     *     READ operations
     *   
     */
     factory.get_datasets = function() {
          return $http.get(server + '/datasets');
     }

     factory.get_dataset = function(_id) {
          return $http.get(server + '/datasets/id?id=' + _id);
     }

     factory.get_raw_datasets = function() {
          return $http.get(server + '/datasets/raw');
     }




     /*
     *
     *     UPDATE operations
     *   
     */
     factory.update_dataset_name = function(_id, _name) {

          var _json = {
                        id    : _id, 
                        name  : _name
                      };

          return $http.post(server + '/datasets/name', _json);
     }



     factory.update_dataset_description = function(_id, _description) {
          var _json = {
                        id           : _id, 
                        description  : _description
                      }


          return $http.post(server + '/datasets/description', _json);
     }



     /*
     *
     *     DELETE operations
     *   
     */
     factory.delete_dataset = function(_id) {
          return $http.delete(server + '/datasets?id=' + _id);
     }
     

     return factory;
});



app.factory('user_factory', function($http, $upload) {


    var factory = {};

     factory.login = function(_email, _password) {
          return $http.post(server + '/users/login', {username : _email, password : _password});
     }

     factory.delete_user = function(_id) {
          return $http.delete(server + '/users?id=' + _id)
     }

     factory.update_user_email = function(_id, _email) {
        return $http.post(server + '/users/username', {id : _id, username : _email});
     }

     factory.update_user_password = function(_id, _password) {
        return $http.post(server + '/users/password', {id : _id, password : _password});
     }

     factory.update_user_is_admin = function(_id, _is_admin) {
        return $http.post(server + '/users/is_admin', {id : _id, is_admin : _is_admin});
     }

     factory.create_user = function(_email, _password, _is_admin) {

          return $http.post(server + '/users', {username : _email, password : _password, is_admin : _is_admin});
     }

     factory.get_user = function() {
         return $http.get(server + '/users/session');
     }

     factory.get_users = function() {
         return $http.get(server + '/users');
     }

     factory.logout = function() {
         return $http.get(server + '/user/logout');
     }

     return factory;
});




app.factory('project_factory', function($http) {


    var factory = {};

    /*
     *
     *     CREATE operations
     *   
     */
     factory.create_project = function() {
          return $http.post(server + '/projects');
     }

     factory.create_user = function(_id, _user_id) {

        var _json = {
                        id       : _id, 
                        user_id  : _user_id
                    }

        return $http.post(server + '/projects/id/user', _json);
     }





    /*
     *
     *     READ operations
     *   
     */
     factory.get_projects = function() {
        return $http.get(server + '/projects');
     }

     factory.get_project = function(_project_id) {
        return $http.get(server + '/projects/id?id=' + _project_id);
     }

     factory.get_answer_file = function(_project_id) {
       window.open(server + '/project/data?id=' + _project_id, '_blank', '');
     }



    /*
     *
     *     UPDATE operations
     *   
     */
     factory.update_project_name = function(_id, _name) {

          var _json = {
                        id    : _id, 
                        name  : _name
                      };


          return $http.post(server + '/projects/id/name', _json);
     }

     factory.update_project_description = function(_id, _description) {

          var _json = {
                        id          : _id, 
                        description : _description
                      };


          return $http.post(server + '/projects/id/description', _json);
     }



     factory.update_project_dataset = function(_id, _dataset_id) {

          var _json = {
                         id         : _id, 
                         dataset_id : _dataset_id
                      };


          return $http.post(server + '/projects/id/dataset_id', _json);
     }


     factory.update_project_questionnaire = function(_id, _questionnaire_id) {

          var _json = {
                        id                : _id, 
                        questionnaire_id  : _questionnaire_id
                      };


          return $http.post(server + '/projects/id/questionnaire_id', _json);
     }



     /*
     *
     *     DELETE operations
     *   
     */
     factory.delete_project = function(_id) {
          return $http.delete(server + '/projects?id=' + _id);
     }

     factory.delete_user_from_project = function(_id, _user_id) {
          return $http.delete(server + '/projects/id/user?id=' + _id + '&user_id=' + _user_id);
     }
     

     return factory;
});






app.factory('phrase_factory', function($http) {
     var factory = {}

     factory.get_phrases_by_project_id_and_question_id = function(_project_id, _question_id) {
          return $http.get(server + '/phrases?project_id=' + _project_id + '&question_id=' + _question_id);
     }

     factory.create_hit_choice = function(_phrase_id, _choice_id, _frequency) {

          var _json = {
                        phrase_id  : _phrase_id, 
                        choice_id  : _choice_id,
                        frequency  : _frequency
                      };

          return $http.post(server + '/phrases/choice_id', _json);
     }


     factory.ignore = function(_phrase_id) {
          return $http.delete(server + '/phrases/ignore?phrase_id=' + _phrase_id)
     }

     factory.not_applicable = function(_phrase_id) {
          return $http.delete(server + '/phrases/not_applicable?phrase_id=' + _phrase_id)
     }

     return factory;
})




app.factory('hit_factory', function($http) {


    var factory = {};

    /*
     *
     *     CREATE operations
     *   
     */
     factory.build_hits = function(_id, _callback) {

          var es = new EventSource(server + '/hits/project_id/build?id=' + _id)
          es.onmessage = function (event) {
              _callback( JSON.parse(event.data))
          }
     }




    factory.create_hit_choice = function(_project_id, _hit_id, _choice_id) {
        var _json = {
                        project_id : _project_id,
                        hit_id     : _hit_id,
                        choice_id  : _choice_id
                    };


        return $http.post(server + '/hits/choice_id', _json);
     }


  
     factory.create_hit_annotation_choice = function(_hit_id, _annotation_id, _choice_id) {
        var _json = {
                        id            : _hit_id,
                        annotation_id : _annotation_id,
                        choice_id     : _choice_id
                    };


        return $http.post(server + '/hits/annotations/choice_id', _json);
     }


     factory.create_hit_text = function(_project_id, _hit_id, _text) {
        var _json = {
                        hit_id     : _hit_id,
                        project_id : _project_id,
                        text       : _text
                    };


        return $http.post(server + '/hits/text', _json);
     }




     /*
     *
     *     UPDATE operations
     *   
     */
     factory.update_hit_answered = function(_project_id, _hit_id) {
        var _json = {
                        hit_id : _hit_id,
                        project_id : _project_id
                    };


        return $http.post(server + '/hits/id/answered', _json);
     }








    /*
     *
     *     READ operations
     *   
     */
     factory.get_hit = function(_project_id) {
       return $http.get(server + '/hits?project_id=' + _project_id);
     }

     factory.get_count = function() {
       return $http.get(server + '/hit/count');
     }

     factory.get_answer_count = function() {
       return $http.get(server + '/hit/answer/count');
     }


     factory.answer = function(hit_id, answer) {
        return $http.post(server + '/hit/answer', {'id' : hit_id, 'answer' : answer});
     }





     /*
     *
     *     DELETE operations
     *   
     */
     factory.delete_hits = function(_project_id) {
        var _json = {
                        project_id : _project_id
                    };

        return $http.post(server + '/hit/all/delete', _json);
     }


     return factory;
});


app.factory('record_factory', function($http) {


    var factory = {};


     factory.get_record = function(record_id) {
       return $http.get(server + '/records/id?id=' + record_id)
     }

     return factory;
});



/*
 *
 *
 *
 *
 *
 *
 *
 *
 * Widgets
 *
 *
 *
 *
 *
 *
 *
 */




app.directive("timeGraph", function($parse) {
    return {
      restrict: "E",
      replace: false,
      scope: {data: '=timeData'},
      link: function(scope, element, attrs) {

        var data = scope.data;

        var parseDate = d3.time.format("%m/%d/%Y").parse;
        var y_label = 'test';
        var t_min = '';
        var t_max = '';
    
        var y_min = '';
        var y_max = '';


        
        data.forEach(function(d) {
        
          d.t = parseDate(d.t);

          
          if (t_min == '' || d.t < t_min) {
            t_min = d.t;
          }
          
          if (t_max == '' || d.t > t_max) {
            t_max = d.t;
          }
          
          if (y_min == '' || d.y < y_min) {
            y_min = d.y;
          }       
          
          if (y_max == '' || d.y > y_max) {
            y_max = d.y;
          }
        });


        data = data.sort(function (a, b) {
                               
           return new Date(b.t) - new Date(a.t);
        });




        var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

        var x = d3.time.scale()
        .range([0, width]);

        var y = d3.scale.linear()
        .range([height, 0]);

        var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

        var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");
    
    
        var line = d3.svg.line()
        .x(function(d) { return x(d.t); })
        .y(function(d) { return y(d.y); });
      
        x.domain([t_min, t_max]);
        y.domain([y_min, y_max]);



        var svg = d3.select(element[0]).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
          svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

          svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text(y_label);
              
          for (var i = 0; i < data.length; i++) {
              svg.append("path")
              .datum(data)
              .attr("class", "line")
              .attr("d", line);
          }

      }
    };
});





app.directive("annotationsGraph", function($parse) {
    return {
      restrict: "E",
      replace: false,
      scope: {data: '=data', callback: '&'},
      link: function(scope, element, attrs) {

        var data = scope.data;

        /* Watches for updates in data */
        scope.$watch('data', function (_data) {

 
          if (_data === undefined) {
                return;
          }
             
          data = _data;
          d3.select(element[0]).select("svg").remove();


                var parseDate = d3.time.format("%Y-%m-%d").parse;
              
                var t_min = '';
                var t_max = '';
            

                data.forEach(function(d) {
                
                  d.date = parseDate(d.date);

                  
                  if (t_min == '' || d.date < t_min) {
                    t_min = d.date;
                  }
                  
                  if (t_max == '' || d.date > t_max) {
                    t_max = d.date;
                  }
                  
                });


                data = data.sort(function (a, b) {
                                       
                   return new Date(b.date) - new Date(a.date);
                });


                var margin = {top: 20, right: 20, bottom: 30, left: 50},
                width = 960 - margin.left - margin.right,
                //height = 500 - margin.top - margin.bottom;
                height = 50;

                var x = d3.time.scale()
                .range([0, width]);

                var y = d3.scale.linear()
                .range([height, 0]);

                var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

                var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");
            
            
                var line = d3.svg.line()
                .x(function(d) { return x(d.date); });
     
              
                x.domain([t_min, t_max]);


                var x_points = new Array();
                var last_selected_annotation = undefined;


                var svg = d3.select(element[0]).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                
                  svg.append("g")
                  .attr("class", "x axis")
                  .attr("transform", "translate(0," + height + ")")
                  .call(xAxis);
                
                  svg.selectAll("rect")
                     .data(data)
                     .enter()
                     .append("rect")
                     .attr("width", 15.0)
                     .attr("height", 15.0)
                     .attr("class", function(d) {
                          return d.answered ? "answered_rect" : "rect";
                      })
                     .attr("y", function(d) {
                        // If this is not done, rects would align on top of each other
                        // They need to be perturbed if sharing same x-coordinate
                        _x = x(d.date);
                        var num_repeats = 0;
                        for(var i = 0; i < x_points.length; i++) {
                            if (_x == x_points[i]) {
                                num_repeats += 1;
                            }
                        }

                        x_points.push(_x);

                        return height - num_repeats*15.0 - 15.0;
                      })
                     .attr("x", function(d) {return x(d.date)})
                     .on("mouseover", function(d) {

                          // Apply styling that depends if user answered question
                          if (last_selected_annotation != undefined && last_selected_annotation.answered) {
                              d3.select(".selected_rect").attr("class", "answered_rect");
                          }
                          else {
                              d3.select(".selected_rect").attr("class", "rect");
                          }

                          // Sends to listener objects
                          scope.callback({annotation: d});
                          

                          // Convert current rect into a selected rect
                          d3.select(this).attr("class", "selected_rect");

                          last_selected_annotation = d;
                  });



              });


      }
    };
});

