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
  .when('/create',
  {
     controller: 'CreateController',
     templateUrl: 'views/create.html'
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


app.factory('model_factory', function($http, $upload) {


    var factory = {};

    factory.save = function(file) {

       return $upload.upload({
              url: '/model/save',
              file: file
            });
     }


      factory.get_model = function() {
       return $http.get(server + '/model');
     }

     return factory;
});




app.factory('dataset_factory', function($http) {

    var factory = {};

      factory.get_datasets = function() {
       return $http.get(server + '/datasets');
     }

     return factory;
});



app.factory('user_factory', function($http, $upload) {


    var factory = {};

     factory.login = function(_email, _password) {
         return $http.post(server + '/user/login', {user_id : _email, password : _password});
     }

     factory.settings = function() {
         return $http.get(server + '/user/settings');
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


    factory.data = function(_project_id) {
       window.open(server + '/project/data?id=' + _project_id, '_blank', '');
     }

    factory.get_all = function() {
       return $http.get(server + '/project/get_all');
     }


     factory.add_analyst = function(_project_id, _email) {
        return $http.post(server + '/project/analyst/add', {project_id    : _project_id, 
                                                            email : _email});
     }


    factory.create = function(_project_name, _project_description, _dataset_id, _model_id) {
          return $http.post(server + '/project/create', {name        : _project_name, 
                                                         description : _project_description, 
                                                         dataset_id  : _dataset_id,
                                                         model_id    : _model_id});
     }

     return factory;
});



app.factory('hit_factory', function($http) {


    var factory = {};


     factory.get_hit = function() {
       return $http.get(server + '/hit');
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



                  console.log(Object.keys(d));
                  console.log(d._children);
                  console.log('');
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

