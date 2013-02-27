//filename: app/dispatch.js
/*
	This the dispatch object that Backbone uses to handle events.
*/
define(['backbone'], function (Backbone) {
    var dispatch = _.extend({}, Backbone.Events); 
    return dispatch;
});