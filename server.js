var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var RSVP = require('rsvp');
var CryptoJS = require('crypto-js');
var uuid = require('node-uuid');
var cookieParser = require('cookie-parser');
// var cookie = require('cookie');

app.use(cookieParser());

var Sequelize = require('sequelize'),
                          // ('database', 'username', 'password');
  sequelize = new Sequelize('sof',        'sof',      'sof', {
  logging: function () {} //this says not to log sff w/ db. not a good idea generally
});

app.use(express.static(__dirname + '/app'));

// for body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// For manual queries
// var connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'youscriber',
//     password: 'youscriber',
//     database: 'youscriber'
// });
// connection.connect();
// function query (sql, params) {
//   var promise = new RSVP.Promise(function (resolve, reject) {
//     console.log(sql, params);
//     connection.query(sql, params, function (err, result) {
//       if(err) {
//         reject(err);
//       }
//       else {
//         resolve(result);
//       }
//     });
//   };
//   return promise;
// }

var UID = sequelize.define('uid', {
  name: Sequelize.STRING
});

var Assignment = sequelize.define('assignment', {
  name: Sequelize.STRING,
  goal: Sequelize.STRING,
  content: Sequelize.STRING
});

var ClassSection = sequelize.define('class_section', {
  name: Sequelize.STRING,
  time: Sequelize.STRING
});

var Person = sequelize.define('person', {
  first_name: Sequelize.STRING,
  last_name: Sequelize.STRING,
  email: Sequelize.STRING,
  sign_in_count:  Sequelize.INTEGER,
  silly_name: Sequelize.STRING,
  password_hash: Sequelize.STRING
});

var Role = sequelize.define('role', {
  name: Sequelize.STRING
});

var Setting = sequelize.define('setting', {
  mic_level: Sequelize.FLOAT
});

var Song = sequelize.define('song', {
  title: Sequelize.STRING,
  content: Sequelize.TEXT
});

var AssignmentClass = sequelize.define('assignment_class',{
});
Assignment.belongsToMany(ClassSection, {through: AssignmentClass});
ClassSection.belongsToMany(Assignment, {through: AssignmentClass});

var ClassPerson = sequelize.define('class_person', {
});
Person.belongsToMany(ClassSection, {through: ClassPerson});
ClassSection.belongsToMany(Person, {through: ClassPerson});

var PersonRole = sequelize.define('person_role',{
});

Person.belongsToMany(Role, {through: PersonRole});
Role.belongsToMany(Person, {through: PersonRole});

Setting.belongsTo(Person);
Person.hasOne(Setting);

Song.belongsTo(Person);
Person.hasMany(Song);

function start() {
  var promise = new RSVP.Promise(function (resolve, reject) {
    return Person.sync()
      .then(function() {
        return UID.sync();
      })
      .then(function() {
        return Role.sync();
      })
      .then(function() {
        return PersonRole.sync();
      })
      .then(function() {
        return Assignment.sync();
      })
      .then(function() {
        return ClassSection.sync();
      })
      .then(function() {
        return AssignmentClass.sync();
      })
      .then(function() {
        return ClassPerson.sync();
      })
      .then(function() {
        return Setting.sync();
      })
      .then(function() {
        return Song.sync();
      })
      .then(function () {
        // Setting
        return Setting.findOrCreate({
          where: {
            mic_level: 1
          }               
        })
          .spread(function (newlyCreatedSetting, created) {
            // Person
            return Person.findOrCreate({
              where: {          
                first_name: 'Chris',
                last_name: 'Frisina',
                email: 'asdf@asdf.com',
                sign_in_count:  0,
                silly_name: 'specialorange',
                // password  : 'asdf'
                password_hash: '912ec803b2ce49e4a541068d495ab570'
              }
            })
              .spread(function (newlyCreatedPerson, created) {
                // PersonRole
                return newlyCreatedPerson.setSetting(newlyCreatedSetting)
                  .then(function(){              
                    // Role
                    return Role.findOrCreate({
                      where: {              
                        name: 'Student'
                      }
                    })
                      .spread(function (newlyCreatedRole, created) {
                        // PersonRole
                        return newlyCreatedPerson.addRole(newlyCreatedRole);
                      })
                      .then(function () {
                        // ClassSection
                        return ClassSection.findOrCreate({
                          where: {
                            name: 'math-101',
                            time: '07:15:00'
                          }
                        })
                          .spread(function (newlyCreatedClassSection, created) {
                            // ClassPerson
                            return newlyCreatedClassSection.addPerson( )
                              .then(function(){
                                // Assignment
                                return Assignment.findOrCreate({
                                  where: {                    
                                    name: 'Teacher Assignment 1',
                                    goal: 'Get here',
                                    content: '{song}'
                                  }
                                })
                                  .spread(function (newlyCreatedAssignment, created) {
                                    // AssignmentClass
                                    return newlyCreatedAssignment.addClass_section(newlyCreatedClassSection);
                                  })                      
                              })                  
                          })
                      })
                  })
                  .then(function (){
                    // Song
                    return Song.findOrCreate({
                      where: {              
                        title: 'Song 1',
                        // content: 'Petey'
                        // content: 'JSON'
                        content: '{"stage":[{"htrack":[{"label":"sn","measure":[{"beats":[{"selected":true},{"selected":true},{"selected":false},{"selected":true}],"measureRepresentations":[{"currentRepresentationType":"audio"},{"currentRepresentationType":"bead"},{"currentRepresentationType":"line"}]}]}]},{"htrack":[{"label":"hh","measure":[{"beats":[{"selected":true},{"selected":true},{"selected":false},{"selected":true},{"selected":true},{"selected":false}],"measureRepresentations":[{"currentRepresentationType":"audio"},{"currentRepresntationType":"bead"}]}]}]}]}'
                        // content: '{"stage":[{"htrack":[{"label":"sn","measure":[{"beats":[{"selected":true},{"selected":true},{"selected":false},{"selected":true}],"measureRepresentations":[{"currentRepresentationType":"audio"},{"currentRepresentationType":"bead"},{"currentRepresentationType":"line"}]}]}]},{"htrack":[{"label":"hh","measure":[{"beats":[{"selected":true},{"selected":true},{"selected":false},{"selected":true},{"selected":true},{"selected":false}],"measureRepresentations":[{"currentRepresentationType":"audio"},{"currentRepresentationType":"bead"}]}]}]}]}'
                        //content: '{"stage":[{"htrack":[{"label":"sn","measure":[{"beats":[{"selected":true},{"selected":true},{"selected":false},{"selected":true}],"measureRepresentations":[{"currentRepresentationType":"audio"},{"currentRepresentationType":"bead"},{"currentRepresentationType":"line"}]}]}]},{"htrack":[{"label":"hh","measure":[{"beats":[{"selected":true},{"selected":true},{"selected":false},{"selected":true},{"selected":true},{"selected":false}],"measureRepresentations":[{"currentRepresentationType":"audio"},{"currentRepresentationType":"bead"}]}]}]}]}'
                      }
                    })
                      .spread(function (newlyCreatedSong, created){
                        // PersonSong
                        return newlyCreatedPerson.addSong(newlyCreatedSong);
                      })
                  })
                  .then(function (){
                    // Song
                    return Song.findOrCreate({
                      where: {              
                        title: 'Song 2',
                        content: 'JSON'
                      }
                    })
                      .spread(function (newlyCreatedSong, created){
                        // PersonSong
                        return newlyCreatedPerson.addSong(newlyCreatedSong);
                      })
                  })
              })
          })
      })
      .catch(function (error) {
        console.error('problem syncing with db in START:', error);
      });
  });
}

var server = app.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at localhost:%s', port);
  // console.log('Listening on port %d', server.address().port);
  start();
});

app.get('/', function(req, res) {
  console.log('XXXXXX new listener XXXXXX');
  console.log(req);
  console.log(req.cookies);
  if(req.headers.cookie){ 
    // This parses the cookies into a usable array
    var incoming_cookies = cookie.parse(req.headers.cookie);

    Person.find({
      where: {
        silly_name: incoming_cookies.silly_name
      },
      include: [
        Song,
        Role,
        ClassSection,
        Setting
      ]
    })
      .then(function(personResults) {
        if (personResults.rowCount === 0) {
          console.log('user not found');
          res.status(400).send('user not found');
        } else {
          // if (incoming_cookies.silly_name === req.body.uname) {
          if (incoming_cookies.silly_name) {
            res.cookie('UID', req.body.uid, {maxAge: 10800000});
            res.cookie('silly_name', req.body.uname, {maxAge: 10800000});
            console.log('Starting with a cookie log in');
            res.status(200).send(personResults);
          } else {
            console.log('Some other problem with cookies');
            res.cookie('UID', req.body.uid, {maxAge: 10800000});
            res.cookie('silly_name', req.body.uname, {maxAge: 10800000});
            res.status(400).send('Some other problem with cookies');
          }
          // res.status(200).send(personResults);
        }
      })
      .catch(function(error){
          res.status(400).send('some other error in starting, error: ' + error);
      });
  } else {
    res.cookie('UID', req.body.uid, {maxAge: 10800000});
    res.cookie('silly_name', req.body.uname, {maxAge: 10800000});      
    res.status(200).send('Starting from scratch.');
  }
});

app.post('/api/login', function (req, res) {
  console.log('Getting a login request with a body of: ');
  console.log(req.body);
  // var lists = cookieParser.JSONCookies(req.headers.cookie);
  if (req.body.hasOwnProperty('uname') && req.body.hasOwnProperty('pwd')) {
    var pwdHash = CryptoJS.MD5(req.body.pwd); // this is a word grouping of 4 words, and needs to be converted to a string
    pwdHash = pwdHash.toString(CryptoJS.enc.Hex);

    Person.find({
      where: {
        silly_name: req.body.uname,
        password_hash: pwdHash
      },
      include: [
        Song,
        Role,
        ClassSection,
        Setting
      ]
    })
      .then(function(personResults) {
        if (personResults.rowCount === 0) {
          res.status(400).send('user not found');
        } else {
          console.log('Logging in at \'/api/login\', and sending a cookie.');
          res.cookie('UID', req.body.uid, {maxAge: 10800000});
          res.cookie('silly_name', req.body.uname, {maxAge: 10800000});
          res.status(200).send(personResults);
          // if they are already logged in from the cookie, reset the cookie date expiration
        }
      })
      .catch(function(error){
          res.status(400).send('some other error in logging in, error: ' + error);
      });
  } else {
    res.status(400).send('login requires a uname and pwhash');
  }
});

app.post('/api/loginwithbox', function (req, res) {
  console.log('Getting a login request to checkbox with a body of: ');
  console.log(req.body);
  if (req.body.hasOwnProperty('uname') && req.body.hasOwnProperty('pwHash') && req.body.hasOwnProperty('chbox')) {
    var message = {
      text: 'You checked the box'
    };
    res.status(200).send(message);
  } else {
    res.status(400).send('login requires a uname and pwhash and checkbox checked');
  }
});

app.post('/api/setstorage', function (req, res) {
  console.log('Logging request at ' + new Date() + ': ');
  console.log(req.body);
  //if (req.body.hasOwnProperty('UID')) {            // What exactly should we check to verify the request?
  if (req.body.hasOwnProperty('Action') && req.body.Action != '') {
    var message = {
      text: 'Saved logging on the server',
      action: req.body.Action
    };
    res.status(200).send(message);
  } else {
    //res.status(400).send('bad data for local storage');
    res.status(400).send(req.body);
  }
});

// Testing if the login and pwd has is working to get the info from the database
// app.get('/api/login/:user/:pwHash', function (req, res) {
//     Person.find({
//       where: {
//         silly_name: req.params.user,
//         password_hash: req.params.pwHash
//       },
//       include: [
//         Song,
//         Role,
//         ClassSection,
//         Setting
//       ],
//     })
//       .then(function(personResults) {
//         if (personResults.rowCount === 0) {
//           res.status(400).send('user not found');
//         } else {
//           res.status(200).send(personResults);
//         }
//       })
//       .catch(function (error){      
//         res.status(400).send('login requires a proper user and pwhash: ' + error);
//       })
// });
/* // For debugging
app.post('/api/clearstorage', function (req, res) {
  console.log('Local storage cleared: ');
  console.log(req.body);
    var message = {
      text: 'Cleared local storage'
    };
    res.status(200).send(message);
});

app.post('/api/logstorage', function (req, res) {
  console.log('Local storage current state: ');
  console.log(req.body);
    var message = {
      text: 'Printed local storage'
    };
    res.status(200).send(message);
});
*/