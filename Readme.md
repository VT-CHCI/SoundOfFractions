# Sound of Fractions #

**Sound of Fractions** is a teaching aid designed to help learn the concept of fractions using a multimodal representation. The main concept is that measures can be dividing into sub-sections and manipulated to produce music. As these changes occur, the mathematical representation of the measures are constructed and updated.  That way, students can see how fractions relate both visually and aurally. This is similar to block manipulative used currently to teach fractions with the addition of sound.

## Installing ##

This project is a web app that uses Javascript and the Web Audio API. The only thing needed to install **Sound of Fractions** is placing it on a web server. To use it, simply access the directory using any Web Audio accessible browser (like Chrome for example). For a demo click [here](http://vt-chci.github.com/MusicFractions/).

## Using ##

The interface is dividing into two sections, the musical components and the beat pallet toolbar.

### Musical Components ###
In the main workspace, there is a list of each musical component and their individual measures. For each component, there is also a mathematical representation of its current state. To enable a beat, simply click a subsection of the measure. It will turn orange to show that has been enabled. As beats are enabled or disabled, the mathematical representation of the component changes. To add new measures, click the green plus button, and to remove, click the red [X] above the measure. *Note: there must always be at least one measure; therefore the application will not allow you to remove all of them. Also, as more measures are added the fraction denominator will not change. This is because a measure represents one whole. Instead, as more than a measures worth of beats are selected, improper fractions will be made.*

### Beat Pallet ###

The beat pallet on the right provides different tools to modify the musical components. The first set of button on the top, change the mathematical representations to either hidden, fraction, percent, or decimal. The next set of sliders change the tempo of the music and the number of beats per division. The Tempo Slider ranges from 1/2 (slower) to 2 (faster) and affects the playback globally. The Beats per Measure slider changes a selected components’ measure division. *Note: Tempo is represented as a fraction rather than a number so that it can be used to explain how it mathematically affects the components’ sound. Also, when changing the number of division, all the beats will be reset.* There is also a visualization under the beat slider which shows common fractions of the measure based on the number of divisions selected.*

### Music Playback ###

To play music, click the play button (triangle in the circle) under the beat pallet. When playing, the play button will change into the stop button and an animation will begin showing what beats are currently playing.

## Program Structure ##

This web app was written using [JQuery]( http://jquery.com/ "JQuery Homepage"), [Backbone](http://backbonejs.org/ "Backbone.js Homepage"), [RequireJS]( http://requirejs.org/ "Requre.js Homepage") and [Bootstrap]( http://twitter.github.com/bootstrap/ "Bootstrap Homepage") .  It adheres as closely as possible to a traditional Backbone architecture, with models, collection, views, routes, and functions named fairly logically. This application has no backend, however, we do have logging currently enabled for data analysis purposes.

### Global Dispatcher and State ###
We use a global dispatcher, as explained in the Backbone documentation, to send events to multiple views. We also have a global state variable for the temp and signature (beats per measure). To use the dispatcher, first pass it through to the function as dispatch. To send an event use:

    dispatch.trigger('YOUR_EVENT_NAME.event', OPTIONAL_PARAMETERS);

To receive the event, in the initialize function add:

    dispatch.on('YOUR_EVENT_NAME.event', this.YOUR_EVENT_HANDLER_FUNCTION, this);

### Adding New Instruments ###
To add a new instrument, first upload the sound sample to /samples and an image to /img. Then, in the initialize function of componentsView (located in /js/views/components) add:

    this.measure = new BeatsCollection;

    for (var i = 0; i < 4; i++) {
      this.measure.add();
    }

    this.component = new MeasuresCollection;
    this.component.add({beats: this.measure});

    this.drumkit = componentsCollection.add({
      label: '',
      img: '',
      mute: true,
      sample: '',
      measures: this.component,
      active: true
    });

Make sure to add values for lable, img, and sample that correspond to your instrument. It is preferable you add this block of code right before:

    ///////Create Gain Nodes///////

### Logging ###
Logging is currently enabled. Initially, a random number is generated and stored into local storage. If you sign in using the navigation bar, the user id will replace the random number. This ensures that even if someone doesn't sign in, the logging info can be differentiated between other users. Currently logged events are:

- On page load and after signing in: all components, measures, and beats
- Beats that are clicked
- Representation changes
- Components muted and unmuted
- Signature changes
- Tempo changes
- Play clicked along with state of components, measures, and beats
- Play stopped

To create custom logs, first pass it through to the function as log. Then, to send a log event use:

    log.sendLog([[LOG_TYPE, DESCRIPTION]]);

Valid LOG_TYPEs are

- id: 1
- type: "Begin Interaction"

- id: 2
- type: "Selection"

- id: 3
- type: "Action"


## Future Plans ##

This project is currently a work in progress.  We have additional features we would like to implement as well as lesson plans we want to develop.  We are currently keeping track of code related bugs and feature requests through github.  If you are interested in developing a lesson plan, or have a lesson plan that could utilize this application please let us know!
