var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var RSVP = require('rsvp');


var Sequelize = require('sequelize'),
                          // ('database', 'username', 'password');
  sequelize = new Sequelize('sof', 'sof', 'sof', {
  logging: function () {} //this says not to log sff w/ db. not a good idea generally
});

app.use(express.static(__dirname + '/app'));

// for body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))



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
  content: Sequelize.STRING
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

function start(options) {
  var promise = new RSVP.Promise(function (resolve, reject) {
    return Person.sync()
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
                // asdf
                password_hash: '912ec803b2ce49e4a541068d495ab570'
              }
            })
              .spread(function (newlyCreatedPerson, created) {
                // PersonRold
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
                            return newlyCreatedClassSection.addPerson(newlyCreatedPerson)
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
                        // content: 'JSON'
                        content: '{"stage":[{"label":"Snare","img":"snare.png","mute":false,"sample":"808_sd.m4a","measures":[{"beats":[{"selected":true},{"selected":true},{"selected":true},{"selected":true}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},{"label":"Hi Hat","img":"hihat.png","mute":true,"sample":"808_chh.m4a","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},{"label":"Kick Drum","img":"kick.png","mute":true,"sample":"808_bd.m4a","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},{"label":"Synth","img":"synth.png","mute":true,"sample":"ambass.mp3","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"}]}'
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

  app.post('/api/login', function (req, res) {
    console.log('Getting a login request with a body of: ');
    console.log(req.body);
    if (req.body.hasOwnProperty('uname') && req.body.hasOwnProperty('pwHash')) {
      Person.find({
        where: {
          silly_name: req.body.uname,
          password_hash: req.body.pwHash
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
            res.status(200).send(personResults);
          }
        })
        .catch(function(error){
            res.status(400).send('some other error');
        });
    } else {
      res.status(400).send('login requires a uname and pwhash');
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

  var server = app.listen(80, function() {
      console.log('Listening on port %d', server.address().port);
  });
}


start();

// models.Tweet.findAll({
//     include: [
//       models.User,
//       {
//         model: models.Media
//       }
//     ],

//   })
//     .then(function (tweets) {
//       res.status(200).json(tweets);
//     })
//     .catch(function (error) {
//       res.status(404).send(error);
//     });