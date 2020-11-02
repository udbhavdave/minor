// Define namespace Home
if (typeof Home === "undefined") {
    var Home = {};
};

// function that creates error modals
Home.errorModal = (function ($, _) {
    "use strict";
    var errorModalTemplate = _.template('<div class="modal fade" tabindex="-1" role="dialog"><div class="modal-dialog"><div class="alert alert-danger"><%= message %></div></div></div>');
    return (function (message) {
        console.log(message);
        $(errorModalTemplate({
            message: message
        })).modal('show');
    });
})(jQuery, _);


// function that creates the success alerts
Home.successAlert = (function ($, _) {
    "use strict";
    var successAlertTemplate = _.template('<div id="alert-<%= id %>" class="alert alert-success"><%= message %></div>');
    return (function (message) {
        console.log(message);
        var timestamp = new Date().getTime();
        message.id = timestamp;
        var alrtContainer = $("#alert").append(successAlertTemplate(message));
        var alrt = alrtContainer.find("#alert-" + timestamp);
        alrt.fadeTo(1000, 500).slideUp(500, function () {
            alrt.alert('close');
        });
    });
})(jQuery, _);

Home.moduleDataManager = (function ($, _) {
    "use strict";
    
    function ModuleDataManager() {
        this.REFRESH_INTERVAL = 15000; // refresh the data ever 15 seconds

        this.dataUrl = "modules/data.json";
        this.data;
        this.registeredHandlers = [];
    }

    ModuleDataManager.prototype.init = function () {
        this.refreshData(this);
        setInterval(this.refreshData, this.REFRESH_INTERVAL, this);
    };

    ModuleDataManager.prototype.addListener = function (listener, context) {
        this.registeredHandlers.push({
            "listener": listener,
            "context": context
        });
    };

    ModuleDataManager.prototype.getCurrentData = function () {
        return this.data;
    }

    ModuleDataManager.prototype.refreshData = function (that) {
        $.ajax({
                url: that.dataUrl + "?_ck=" + new Date().getTime(),
                dataType: "json",
                context: that
            })
            .done(function (data, textStatus, jqXHR) {
                this.data = data;
                for (var i = 0; i < this.registeredHandlers.length; i++) {
                    var fn = this.registeredHandlers[i].listener;
                    fn(data, this.registeredHandlers[i].context);
                }
            }).fail(function (request, status, error) {
                Home.errorModal("Failed to load " + this.dataUrl + " " + error);
            });
    };
    return new ModuleDataManager(); // instantiate singleton of ModuleDataManager
})(jQuery, _);


/*
 * ModuleLoader (Singleton class) that loads all control panel modules
 */
Home.moduleLoader = (function ($) {
    "use strict";
    function ModuleLoader() {
        this.modulesFolderURL = "modules"
        this.moduleInstancesJsonURL = this.modulesFolderURL + "/instances.json";
        this.modulesTxtURL = this.modulesFolderURL + "/modules.txt";
        this.moduleNames = [];
        // load the list of instances
        this.instances = {};
        this.maxGridColumns = 4;
        this.numberOfModulesLoaded = 0;

    }
    
    ModuleLoader.prototype.loadModule = function(moduleHtml, currentModule) {
        // Get the javascript file
        console.log("Loading module " + currentModule);
        $.ajax({
            url: "modules/" + currentModule + "/script.js",
            context: this,
            dataType: "script"
        }).done(function (data, textStatus, jqXHR) {
            // Load the module's CSS
            $('head').append('<link rel="stylesheet" type="text/css" href="' + this.modulesFolderURL + "/" + currentModule + '/styles.css">');
            console.log("Loaded css and js for module " + currentModule);

            // Now we iterate through all instances from instances.json and create an array with the matching ones
            var matchingInstances = [];
            for (var b = 0; b < this.instances.length; b++) {
                if (this.instances[b].module.trim() == currentModule.trim()) {
                    matchingInstances.push(this.instances[b]);
                }
            }

            // Iterate through all the matching instances and add them to the grid container layout
            for (var m = 0; m < matchingInstances.length; m++) {
                var lastRow = $("#grid-container .row").last(); // Retrieve last responsive grid row
                if (lastRow.find("> div").length >= this.maxGridColumns) { // if the last row already 
                    // has the max number of columns then add a new row
                    var lastRow = $("<div class=\"row\"></div>").appendTo($("#grid-container"));
                }
                //Create and retrieve new grid column
                var col = $("<div class=\"col-xs-18 col-sm-6 col-md-3\"></div>").appendTo(lastRow);

                col.html(moduleHtml(matchingInstances[m]));
                console.log("Loaded instance " + matchingInstances[m].id);
            }

            //If it's the last file that needs to be loaded, run init.
            if (++this.numberOfModulesLoaded == this.moduleNames.length) {
                console.log("Done loading all modules.");
                Home.moduleDataManager.init();
            }

        }).fail(function (request, status, error) {
            Home.errorModal("Failed to load modules/" + currentModule + "/script.js, " + error);
        });
    }

    ModuleLoader.prototype.loadModules = function () {
        this.moduleNames = this.instances.map(function(instance) {return instance.module} ).unique();

        // define callback function for calling loadModule
        var callLoadModule = function(currentModule) {
            return function (data, textStatus, jqXHR) {
                var instances = this.instances;
                //Now we loaded the html for the module
                var moduleHtml = _.template(data);
                this.loadModule(moduleHtml, currentModule);
            }
        }

        // loop through all the modules available and instantiate the
        // instances of those modules defined in modules/instances.json
        for (var a = 0; a < this.moduleNames.length; a++) {

            // retrieve the html file for the module
            $.ajax({
                url: this.modulesFolderURL + "/" + this.moduleNames[a] + "/index.html",
                context: this,
                dataType: "html"
            }).done(callLoadModule(this.moduleNames[a]));
        }
    }
    
    
    ModuleLoader.prototype.loadControlPanel = function () {
        // Retrieve the listing of module instances
        $.ajax({dataType: "json",
                url: this.moduleInstancesJsonURL,
                context: this,
                success: function (data) {
                    this.instances = data;
                    this.loadModules();
                },
                fail: function (request, status, error) {
                    Home.errorModal("Failed to load " + this.moduleInstancesJsonURL + ", " + error);
                }
        });
    }
    
    return new ModuleLoader();
})(jQuery, _);

// Execute function right away
(function ($) {
    "use strict";
    
    $(Home.moduleLoader.loadControlPanel());
})(jQuery, _)