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



var server = 'http://127.0.0.1:5000';

function redirect_to_login() {
    window.location.replace(server + "/medturk/login.html");
}


var app = angular.module('medTurkApp', ['angularFileUpload', 'ngRoute', 'ngSanitize'], function($httpProvider){

  // Use x-www-form-urlencoded Content-Type
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
 
  /**
   * This solution was found at http://victorblog.com/2012/12/20/make-angularjs-http-service-behave-like-jquery-ajax/
   *
   * Before adding this block of code, RESTful Posts would not serialize data into JSON properly 
   *
   * The workhorse; converts an object to x-www-form-urlencoded serialization.
   * @param {Object} obj
   * @return {String}
   */ 
  var param = function(obj) {
    var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
      
    for(name in obj) {
      value = obj[name];
        
      if(value instanceof Array) {
        for(i=0; i<value.length; ++i) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value instanceof Object) {
        for(subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value !== undefined && value !== null)
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
    }
      
    return query.length ? query.substr(0, query.length - 1) : query;
  };
 
  // Override $http service's default transformRequest
  $httpProvider.defaults.transformRequest = [function(data) {
    return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
  }];
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
  .when('/model',
  {
     controller: 'ModelController',
     templateUrl: 'views/model.html'
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
              url: '/questionnaire/upload',
              file: file
            });
     }

     factory.create_questionnaire = function() {
        return $http.post(server + '/questionnaire/create');
     }

     factory.create_question_choice = function(_questionnaire_id, _question_id, _choice_name) {

        var _json = {
                        questionnaire_id : _model_id, 
                        question_id      : _question_id, 
                        choice_name      : _choice_name
                    };

        return $http.post(server + '/questionnaire/question/choice/create', _json);
     }


     factory.create_question_trigger = function(_questionnaire_id, _question_id, _trigger_name, _case_sensitive) {

        var _json = {
                        questionnaire_id       : _questionnaire_id, 
                        question_id            : _question_id, 
                        trigger_name           : _trigger_name, 
                        trigger_case_sensitive : _case_sensitive
                    };


        return $http.post(server + '/questionnaire/question/trigger/create', _json);
     }


     factory.create_questionnaire_tag = function(_questionnaire_id, _tag_name) {

        var _json = {
                        questionnaire_id    : _questionnaire_id, 
                        tag_name            : _tag_name
                    };

        return $http.post(server + '/questionnaire/tag/create', _json);
     }


     factory.create_question_tag = function(_questionnaire_id, _question_id, _tag_id) {

        var _json = {
                        questionnaire_id  : _questionnaire_id, 
                        question_id       : _question_id, 
                        tag_id            : _tag_id
                    };

        return $http.post(server + '/questionnaire/question/tag/create', _json);
     }


     factory.create_question = function(_questionnaire_id) {

        var _json = {
                        questionnaire_id : _questionnaire_id
                    };

        return $http.post(server + '/questionnaire/question/create', _json);
     }








     /*
     *
     *     READ operations
     *   
     */
     factory.download_questionnaire = function(_questionnaire_id) {
       window.open(server + '/questionnaire/download?id=' + questionnaire_id, '_blank', '');
     }

     factory.get_questionnaire = function(_questionnaire_id) {
      
         return $http({
            url: server + '/questionnaire', 
            method: "GET",
            params: {questionnaire_id : _questionnaire_id}
        });

     }


     factory.get_questionnaires = function() {
       return $http.get(server + '/questionnaire/all');
     }









     /*
     *
     *     UPDATE operations
     *   
     */
     factory.update_questionnaire_tag_name = function(_questionnaire_id, _tag_id, _tag_name) {

        var _json = {
                        questionnaire_id : _questionnaire_id, 
                        tag_id           : _tag_id, 
                        tag_name         : _tag_name
                    };


        return $http.post(server + '/questionnaire/tag/name/update', _json);
     }


     factory.update_question_type = function(_questionnaire_id, _question_id, _question_type) {

        var _json = {
                        questionnaire_id : _questionnaire_id, 
                        question_id      : _question_id, 
                        question_type    : _question_type
                    };


        return $http.post(server + '/questionnaire/question/type/update', );
     }


     factory.update_question_text = function(_questionnaire_id, _question_id, _question_text) {

        var _json = {
                        questionnaire_id : _questionnaire_id, 
                        question_id      : _question_id, 
                        question_text    : _question_text
                    };


        return $http.post(server + '/questionnaire/question/text/update', _json);
     }


     factory.update_questionnaire_name = function(_questionnaire_id, _questionnaire_name) {

        var _json = {
                        questionnaire_id   : _questionnaire_id, 
                        questionnaire_name : _questionnaire_name
                    };


        return $http.post(server + '/questionnaire/name/update', _json);
     }


     factory.update_questionnaire_description = function(_questionnaire_id, _questionnaire_name) {

        var _json = {
                        questionnaire_id   : _questionnaire_id, 
                        questionnaire_name : _questionnaire_description
                    };


        return $http.post(server + '/questionnaire/description/update', _json);
     }











     /*
     *
     *     DELETE operations
     *   
     */
     factory.delete_questionnaire = function(_questionnaire_id) {

          var _json = {
                        questionnaire_id   : _questionnaire_id
                      };

          return $http.post(server + '/questionnaire/delete', _json);
     }

     factory.delete_questionnaire_tag = function(_questionnaire_id, _tag_id) {
        var _json = {
                        questionnaire_id   : _questionnaire_id,
                        tag_id             : _tag_id
                    };

        return $http.post(server + '/questionnaire/tag/delete', _json);
     }

     factory.delete_questionnaire_tag = function(_questionnaire_id, _question_id, _tag_id) {
        var _json = {
                        questionnaire_id   : _questionnaire_id,
                        question_id        : _question_id,
                        tag_id             : _tag_id
                    };

        return $http.post(server + '/questionnaire/question/tag/delete', _json);
     }


     factory.delete_question_trigger = function(_questionnaire_id, _question_id, _trigger_id) {
        var _json = {
                        questionnaire_id   : _questionnaire_id,
                        question_id        : _question_id,
                        tigger_id          : _trigger_id
                    };

        return $http.post(server + '/questionnaire/question/trigger/delete', _json);
     }


     factory.delete_question = function(_questionnaire_id, _question_id) {
        var _json = {
                        questionnaire_id   : _questionnaire_id,
                        question_id        : _question_id
                    };

        return $http.post(server + '/questionnaire/question/delete', _json);
     }


     factory.delete_question_choice = function(_questionnaire_id, _question_id, _choice_id) {
        var _json = {
                        questionnaire_id   : _questionnaire_id,
                        question_id        : _question_id,
                        choice_id          : _choice_id
                    };

        return $http.post(server + '/questionnaire/question/choice/delete', _json);
     }
          
     
     return factory;
});




app.factory('dataset_factory', function($http) {

    var factory = {};


    factory.delete = function(_dataset_id) {
          return $http.post(server + '/dataset/delete', {id : _dataset_id});
     }


    factory.get_datasets = function() {
       return $http.get(server + '/datasets');
     }

     factory.get_raw_datasets = function() {
       return $http.get(server + '/datasets/raw');
     }

     factory.edit = function(_id, _name, _description) {

          return $http.post(server + '/dataset/edit', {id          : _id, 
                                                       name        : _name,
                                                       description : _description});
     }


     factory.create = function(_name, _description, _folder) {
          return $http.post(server + '/dataset/create', {name        : _name, 
                                                         description : _description,
                                                         folder      : _folder});
     }

     return factory;
});



app.factory('user_factory', function($http, $upload) {


    var factory = {};

     factory.login = function(_email, _password) {
          return $http.post(server + '/user/login', {user_id : _email, password : _password});
     }

     factory.delete_user = function(__id) {
          return $http.post(server + '/user/delete', {_id : __id});
     }

     factory.update_user_email = function(__id, _email) {
        return $http.post(server + '/user/email', {_id : __id, email : _email});
     }

     factory.update_user_password = function(__id, _password) {
        return $http.post(server + '/user/password', {_id : __id, password : _password});
     }

     factory.update_user_role = function(__id, _role) {
        return $http.post(server + '/user/role', {_id : __id, role : _role});
     }


     factory.create_user = function(_email, _password, _role) {
          return $http.post(server + '/user/create', {id : _email, password : _password, role : _role});
     }

     factory.get_user = function() {
         return $http.get(server + '/user');
     }

     factory.get_users = function() {
         return $http.get(server + '/users');
     }

     factory.logout = function() {
         return $http.get(server + '/user/logout');
     }

     return factory;
});



app.factory('annotation_factory', function($http, $upload) {


    var factory = {};

    factory.ctakes_save = function(file) {
       return $upload.upload({
              url: '/annotation/ctakes/save',
              file: file
            });
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
          return $http.post(server + '/project/create');
     }

     factory.create_user = function(_project_id, _user_id) {

        var _json = {
                        project_id : _project_id, 
                        user_id    : _user_id
                    };

        return $http.post(server + '/project/user/create', _json);
     }





    /*
     *
     *     READ operations
     *   
     */
     factory.get_projects = function() {
        return $http.get(server + '/projects');
     }

     factory.get_answer_file = function(_project_id) {
       window.open(server + '/project/data?id=' + _project_id, '_blank', '');
     }



    /*
     *
     *     UPDATE operations
     *   
     */
     factory.update_project_name = function(_project_id, _name) {

          var _json = {
                        project_id  : _project_id, 
                        name        : _name
                      };


          return $http.post(server + '/project/name/update', _json);
     }

     factory.update_project_description = function(_project_id, _description) {

          var _json = {
                        project_id  : _project_id, 
                        description : _description
                      };


          return $http.post(server + '/project/description/update', _json);
     }


     factory.update_project_dataset = function(_project_id, _dataset_id) {

          var _json = {
                        project_id  : _project_id, 
                        dataset_id : _dataset_id
                      };


          return $http.post(server + '/project/dataset/update', _json);
     }


     factory.update_project_questionnaire = function(_project_id, _questionnaire_id) {

          var _json = {
                        project_id          : _project_id, 
                        questionnaire_id    : _questionnaire_id
                      };


          return $http.post(server + '/project/questionnaire/update', _json);
     }



     /*
     *
     *     DELETE operations
     *   
     */
     factory.delete_project = function(_project_id) {
          var _json = {
                        project_id  : _project_id
                      };

          return $http.post(server + '/project/delete', _json);
     }

     factory.delete_user_from_project = function(_project_id, _user_id) {
          var _json = {
                        project_id  : _project_id,
                        user_id     : _user_id
                      };

          return $http.post(server + '/project/user/delete', _json);
     }

     

     return factory;
});



app.factory('hit_factory', function($http) {


    var factory = {};


     factory.get_hit = function(_project_id) {
 
       return $http({
          url: server + '/hit', 
          method: "GET",
          params: {project_id : _project_id}
       });

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


     return factory;
});


app.factory('record_factory', function($http) {


    var factory = {};


     factory.get_record = function(record_id) {
      
       return $http({
          url: server + '/record', 
          method: "GET",
          params: {id : record_id}
      });

     }

     return factory;
});



app.factory('patient_factory', function($http, $upload) {

    var factory = {};

    factory.save = function(file) {
       return $upload.upload({
              url: '/patient/save',
              file: file
            });
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
                height = 0;

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


                var svg = d3.select(element[0]).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                
                  svg.append("g")
                  .attr("class", "x axis")
                  .attr("transform", "translate(0," + height + ")")
                  .call(xAxis);
                
                  svg.selectAll("circle")
                     .data(data)
                     .enter()
                     .append("circle")
                     .attr("r", 8.0)
                     .attr("class", "circle")
                     .attr("cy", function(d) {return height})
                     .attr("cx", function(d) {return x(d.date)})
                     .on("mouseover", function(d) {
                          scope.callback({annotation: d});

                          d3.select(".selected_circle").attr("r", 8.0);
                          d3.select(".selected_circle").attr("class", "circle");
                          d3.select(this).attr("class", "selected_circle");
                          d3.select(this).attr("r", 10.0);
                  });



              });


      }
    };
});






app.directive("ontologyGraph", function($parse) {
    return {
      restrict: "E",
      replace: false,
      scope: {data: '=data', callback: '&'},
      link: function(scope, element, attrs) {

        var data = scope.data;

        / * Watches for updates in data */
        scope.$watch('data', function (_data) {


                if (_data === undefined) {
                    return;
                }
             
                data = _data;
                d3.select(element[0]).select("svg").remove();

                var h = 4000;
                var w = 1200;

                var margin = {top: 20, right: 120, bottom: 20, left: 120},
                    width = w - margin.right - margin.left,
                    height = h - margin.top - margin.bottom;
                    
                var i = 0,
                    duration = 750,
                    root;

                var tree = d3.layout.tree()
                    .size([height, width]);

                var diagonal = d3.svg.diagonal()
                    .projection(function(d) { return [d.y, d.x]; });

                var svg = d3.select(element[0]).append("svg")
                    .attr("width", width + margin.right + margin.left)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                
                  
                root = data;
                root.x0 = height / 2;
                root.y0 = 0;

                function collapse(d) {
                  if (d.children) {
                    d._children = d.children;
                    d._children.forEach(collapse);
                    d.children = null;
                  }
                }

                // Uncomment below line if you wish to start the ontology in a collapsed state
                //root.children.forEach(collapse);
                update(root);
                

                d3.select(self.frameElement).style("height", h+"px");

                function update(source) {

                  // Compute the new tree layout.
                  var nodes = tree.nodes(root).reverse(),
                      links = tree.links(nodes);

                  // Normalize for fixed-depth.
                  nodes.forEach(function(d) { d.y = d.depth * 180; });

                  // Update the nodes
                  var node = svg.selectAll("g.node")
                      .data(nodes, function(d) { return d.id || (d.id = ++i); });

                  // Enter any new nodes at the parent's previous position.
                  var nodeEnter = node.enter().append("g")
                      .attr("class", "node")
                      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
                      .on("click", click);

                  
                  nodeEnter.append("circle")
                      .attr("r", 1e-6)
                      .style("fill", function(d) { return d._children ? "#676767" : "#999999"; });
                      
                 nodeEnter.append("text")  
                      .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
                      .attr("y", "4")
                      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
                      .text(function(d) { return d.name; })
                      .style("fill-opacity", 1e-6);

                  // Transition nodes to their new position.
                  var nodeUpdate = node.transition()
                      .duration(duration)
                      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

                  
                 nodeUpdate.select("circle")
                      .attr("r", 8.0)
                      .style("fill", function(d) { return d._children ? "#930D1A" : "#999999"; });

                  nodeUpdate.select("text")
                      .style("fill-opacity", 1);

                  // Transition exiting nodes to the parent's new position.
                  var nodeExit = node.exit().transition()
                      .duration(duration)
                      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
                      .remove();
                  
                  nodeExit.select("circle")
                      .attr("r", 1e-6);

                  nodeExit.select("text")
                      .style("fill-opacity", 1e-6);

                  // Update the links
                  var link = svg.selectAll("path.link")
                      .data(links, function(d) { return d.target.id; });

                  // Enter any new links at the parent's previous position.
                  link.enter().insert("path", "g")
                      .attr("class", "link")
                      .attr("d", function(d) {
                        var o = {x: source.x0, y: source.y0};
                        return diagonal({source: o, target: o});
                      });

                  // Transition links to their new position.
                  link.transition()
                      .duration(duration)
                      .attr("d", diagonal);

                  // Transition exiting nodes to the parent's new position.
                  link.exit().transition()
                      .duration(duration)
                      .attr("d", function(d) {
                        var o = {x: source.x, y: source.y};
                        return diagonal({source: o, target: o});
                      })
                      .remove();

                  // Stash the old positions for transition.
                  nodes.forEach(function(d) {
                    d.x0 = d.x;
                    d.y0 = d.y;
                  });
                }

                // Toggle children on click.
                function click(d) {



                  //console.log(Object.keys(d));
                  //console.log(d._children);
                  //console.log('');
                  if (d._children == null || d._children == undefined) {
                     scope.callback({name: d.name});
                  }
                 

                  if (d.children) {
                    d._children = d.children;
                    d.children = null;
                  } else {
  
                    d.children = d._children;
                    d._children = null;
                  }
                  update(d);
                }

          });
      }
    };
});

