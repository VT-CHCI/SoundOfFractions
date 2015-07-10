// Local storage.js -> See bottom of page for discussion of structure
//See links below for information on storing objects in HTML5 local storage
//https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
//https://github.com/mdn/web-storage-demo/blob/gh-pages/main.js
//http://diveintohtml5.info/storage.html
//http://stackoverflow.com/questions/2010892/storing-objects-in-html5-localstorage

define([
  'jquery', 'underscore', 'bbone',
  'backbone/collections/stage',
  'backbone/views/stage/stageView',
  'node-uuid'
], function($, _, Backbone, StageCollection, StageView, NodeUUID){
	return LocalStorage = {
		initialize: function(){
			// Check for localStorage capabilities
			if (this.checkStorageSupport()) {
				console.info("Congrats, your browser supports HTML5 local storage!");
				// If a session does not already exist, initialize localStorage
				if (!localStorage.getItem('UID')) {
					this.startNewLocalStorageSession();
					// Send a message that we have a new UID, that may log in later
					this.logStorage('NEW USER SESSION - Starting with a UID : ' + localStorage.getItem('UID'));
				// If a UID does exist
				} else {
					// Send a message they have a UID
					this.logStorage('RETURNING USER SESSION with a UID : ' + localStorage.getItem('UID'));
					console.warn('LOCAL STORAGE UID: ', localStorage.getItem('UID'));
					// Check wasSaved and log info if false.
					if (!JSON.parse(localStorage.getItem('wasSaved')) && (localStorage.getItem('unsavedActions') !== '') ) {
						console.info("Last session has unsaved data");
						this.logStorage("Logging unsaved storage");
					}
					//Clear Local Storage
					this.clearLocalStorageSession();
				}
			}
			else {
				console.error("Your browser does not support HTML5 local storage.");
			}
		},

		//Check browser support for HTML5 local storage
		checkStorageSupport: function() {
			try {
				return 'localStorage' in window && window['localStorage'] != null;
			}
			catch (e) {
				return false;
			}
		},

		// Send local storage data to server with the specified log message
		logStorage: function(message) {
			console.log("Logging to server, message: ", message);
			localStorage.setItem('action', message);
			localStorage.setItem('currentState', this.makeReadableStageCollectionJSON());
		  // Since we are sending another log, we must reset the wasSaved to be false in case something breaks
		  localStorage.setItem('wasSaved', JSON.stringify(false));
			console.log(localStorage);

			//Attempt to send localStorage to the server
			$.ajax({
		      url: '/api/logging/',
		      type: 'POST',
		      crossDomain: true,	//Delete for production
		      data: {
		      	header: "SSSSSSSSSSSSSSSSSSSSS " + this.getTimestamp() + " TTTTTTTTTTTTTTTTTTTTTTTTTTT",
		        UID: 						localStorage.getItem('UID'),
		        UserLoggedIn: 	localStorage.getItem('UserLoggedIn'),
		        Action: 				localStorage.getItem('action'),				// Current interaction
		        SavedActions: 	localStorage.getItem('savedActions'),		// Previous interactions that have been logged
		        UnsavedActions:	localStorage.getItem('unsavedActions'),		// Previous unlogged interactions
		        CurrentStageCollection:	localStorage.getItem('currentState'),
		        //WasSaved: 			localStorage.getItem('wasSaved'),
		      	footer: "EEEEEEEEEEEEEEEEEEEEE " + this.getTimestamp() + " NNNNNNNNNNNNNNNNNNNNNNNNNNN"
		      }
		    })
		      .done(function(data){
		        console.log('Success sending to log message to the server');

		        if (localStorage.getItem('savedActions') != '') {
		        	localStorage.setItem('savedActions', localStorage.getItem('savedActions') + ', ');
		        }
		        if (localStorage.getItem('unsavedActions') != '') {
		        	localStorage.setItem('unsavedActions', localStorage.getItem('unsavedActions') + ', ');
		        }
		        // Save the action list
		        localStorage.setItem('savedActions', localStorage.getItem('savedActions') + localStorage.getItem('unsavedActions') + localStorage.getItem('action'));
		        localStorage.setItem('unsavedActions', '');
		        localStorage.setItem('action', '');
		        localStorage.setItem('wasSaved', JSON.stringify(true));
		      })
		      .fail(function(data){
		        console.error('FAILURE sending to log message to the server');
		        console.log(data);

		        // if (localStorage.getItem('unsavedActions') !== '') {
		        // 	localStorage.setItem('unsavedActions', localStorage.getItem('unsavedActions') + ', ');
		        // }
		        // Log the interaction as unsaved
		        // localStorage.setItem('unsavedActions', localStorage.getItem('unsavedActions') + localStorage.getItem('action'));
		        localStorage.setItem('unsavedActions', localStorage.getItem('unsavedActions').push(localStorage.getItem('action')) );
		        localStorage.setItem('action', '');
		      })
		},
		// Return the current date and time as a formatted date object
		getTimestamp: function() {
			var now = new Date();
			return now;
			// return $.datepicker.formatDate('yy/mm/dd', now) + " " + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
		},
		// Generate a uniqui id
		makeUID: function() {
			var newID = NodeUUID();
			localStorage.setItem('UID', newID);
			console.warn('LOCAL STORAGE UID: ', localStorage.getItem('UID'));
		},
		setUserLoggedIn: function(userLoggedIn) {
			localStorage.setItem('UserLoggedIn', userLoggedIn);
		},
		startNewLocalStorageSession: function(){
			console.log("Starting new LocalStorage");
			// Just as a failsafe
			localStorage.clear();
			this.makeUID();
			localStorage.setItem('savedActions', "");
			localStorage.setItem('unsavedActions', "");
			localStorage.setItem('action', "");
			localStorage.setItem('wasSaved', JSON.stringify(true));
		},
		clearLocalStorageSession: function(){
			console.info("Clearing LocalStorage");
			var oldUID = localStorage.getItem("UID");
			localStorage.clear();
			localStorage.setItem('UID', oldUID);
			localStorage.setItem('savedActions', "");
			localStorage.setItem('unsavedActions', "");
			localStorage.setItem('action', "");
			localStorage.setItem('wasSaved', JSON.stringify(true));
		},
		sendUnsavedLocalStorage: function() {
			if (!JSON.parse(localStorage.getItem('wasSaved'))) {
				console.warn("Last session has unsaved data");
				this.logStorage("Logging unsaved storage");
			}
		},
		makeReadableStageCollectionJSON: function(){
			var ComputedStageCollection = {};
			var instruments = [];
			// Get each of the stage instruments
			_.each(StageCollection.models, function(instrumentModel){
				var instrument = {};
				instrument.label 		 = instrumentModel.get('label');
				instrument.active 	 = instrumentModel.get('active');
				instrument.signature = instrumentModel.get('signature');
				instrument.tempo 		 = instrumentModel.get('tempo');
				// For each of the measures
				instrument.measures = [];
				_.each(instrumentModel.get('measures').models, function(measureModel){
					var measure = {};
					measure.allMeasureChildRepresentationsTransitioned  = measureModel.get('allMeasureChildRepresentationsTransitioned');
					// make a beats array
					measure.beatsArray = [];
						_.each(measureModel.get('beats').models, function(beat){
							if(beat.get('selected')){
								measure.beatsArray.push('ON');
							} else {
								measure.beatsArray.push('OFF');
							}
						}, this)
					measure.numberOfBeats = measure.beatsArray.length;
					// Make a rep array
					measure.measureRepresentations = [];
						_.each(measureModel.get('measureRepresentations').models, function(measureRep){
							var mR = {};
							mR.currentRepresentationType = measureRep.get('currentRepresentationType');
							mR.transitions = measureRep.get('transitions');
							measure.measureRepresentations.push(mR);
						}, this)
					
					instrument.measures.push(measure);
				}, this)

				// add the instrument to the Stage collection
				instruments.push(instrument);
			}, this)
			ComputedStageCollection.usedInstruments = instruments;
			ComputedStageCollection.unusedInstrumentsCount = 3 - instruments.length;
			
			return JSON.stringify(ComputedStageCollection);
			// A sample of ComputedStageCollection
			// {
			// "usedInstruments":[
			// 	{
			// 		"label":"Snare",
			// 		"active":true,
			// 		"signature":7,
			// 		"tempo":120,
			// 		"measures":[
			// 		{
			// 			"allMeasureChildRepresentationsTransitioned":1,
			// 			"beatsArray":["ON","OFF","OFF","OFF","OFF","ON","OFF"],
			// 			"numberOfBeats":7,
			// 			"measureRepresentations":[
			// 			{
			// 				"currentRepresentationType":"audio",
			// 				"transitions":0
			// 			},{
			// 				"currentRepresentationType":"line",
			// 				"transitions":1
			// 			},{
			// 				"currentRepresentationType":"line",
			// 				"transitions":0
			// 			},{
			// 				"currentRepresentationType":"pie",
			// 				"transitions":0
			// 			},{
			// 				"currentRepresentationType":"bar",
			// 				"transitions":0
			// 			}
			// 			]
			// 		}
			// 		]
			// 	}
			// ],
			// "unusedInstrumentsCount":2
			// }
		}
	};
});

// Timestamping
//http://stackoverflow.com/questions/221294/how-do-you-get-a-timestamp-in-javascript

/*
	We want to save every interaciton the user has to our local storage object so we can see what they do.
	For example, if the user adds a beat, deletes the beat, then adds another one, we want a log of those actions.
		-> Have event handlers signal us every time an action takes place and we send it to the server.

	We want to accomplish this by linking a user's actions with a UID, generated the first time they open the window.
		-> This UID is separate from their login info, i.e. instead of designating a user, it designates the machine/browser the user is working on.
		-> Though the user's login name will become associated with a UID by virtue of using the same machine
		-> The user's login name may be associated with many UID's if they login from multiple machines or clear their cache

	The Local Storage object should hold the following members:
		- UID									This identifies the machine/browser as described above.
		- Login info					This identifies the user. This may or may not be present, depending on whether the user is logged in.
													Consists of a silly name and a pwd hash
		- Interaction lists				Each list is a concatenated string that represents the list of interactions the user has made with the application.
													When a user interacts with the application, the action is set as the Action object and then a request is made to post to the server. If the post is unsuccesful, this Action is then added to the UnsavedActionsList. If it is successful, the UnsavedActionsList and the Action are added to the SavedActionsList.
													Each time an interaction is received, it is added to this string so that the whole user session is sent every time we log.
		- Saved on server 		This boolean represents whether the data was saved to the server the last time we logged.
													It may not have been saved, say if the server loses connection between the time the user completes an interaction and the request is sent,
													e.g. if they close the window. We must then check for this every time the user loads the page to see whether the last request made was successful before the session ended. If not* we should have retained information from last session and must resend it before setting up the new local storage object (i.e. clearing the interaction list, checking login info, etc.).
													To do this, we set the bool to true after every successful post and false at the beginning of every request.
													*and also check if it has been an hour+ since last interaction as a timeout check?
													What purpose would this serve since the page gets reset anyway?
		- Stage collection				This allows us to rebuild the application to match this specific state
*/

// Questions
//	- How do we treat logging if the user has multiple tabs of the application open?
