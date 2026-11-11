/**
 * Module dependencies.
 */

var express = require('express');
var fs = require('fs');
var baseDir = __dirname + '/../../../';
var exports = module.exports;

exports.init = function(parent, options){
  var verbose = options.verbose;
  fs.readdirSync(baseDir + 'controllers').forEach(function(name){
    if (name.indexOf("template") == -1 && name.indexOf('.svn')==-1) {
        verbose && console.log('\n   %s:', name);
        var app = express();
        app.set('views', baseDir + 'views/' + name + '');
        var controllers = require(baseDir+'controllers/' + name+"/controllers");
        for(var key in controllers){
            var locController= controllers[key];
            var locPath = "/"+name+"/"+key;
            var locConfig = locController.config||{};
            var locMethod = locConfig.method||"get";
            app[locMethod]("/"+name+"/"+key+".html", locController.handler);
            verbose && console.log('     %s %s -> %s', locMethod, locPath, key);
        }
        // mount the app
        parent.use(app);
    }
  });
};
