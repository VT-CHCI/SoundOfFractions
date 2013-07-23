# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

# User
  puts 'SETTING UP DEFAULT USER LOGIN'.colorize( :color => :light_blue, :background => :green )
  adminUser = User.create({ :email => "test@test.org", :password => "asdfasdf", :password_confirmation => "asdfasdf" }, :without_protection => true ).save!
  teacherUser1 = User.create({ :email => "tea@test.org", :password => "asdfasdf", :password_confirmation => "asdfasdf" }, :without_protection => true ).save!
  studentUser1 = User.create({ :email => "stu@test.org", :password => "asdfasdf", :password_confirmation => "asdfasdf" }, :without_protection => true ).save!
  studentUser2 = User.create({ :email => "stu2@test.org", :password => "asdfasdf", :password_confirmation => "asdfasdf" }, :without_protection => true ).save!
  teacherUser2 = User.create({ :email => "tea2@test.org", :password => "asdfasdf", :password_confirmation => "asdfasdf" }, :without_protection => true ).save!
  studentUser3 = User.create({ :email => "stu3@test.org", :password => "asdfasdf", :password_confirmation => "asdfasdf" }, :without_protection => true ).save!
  studentUser4 = User.create({ :email => "stu4@test.org", :password => "asdfasdf", :password_confirmation => "asdfasdf" }, :without_protection => true ).save!
  teacherUser3 = User.create({ :email => "tea3@test.org", :password => "asdfasdf", :password_confirmation => "asdfasdf" }, :without_protection => true ).save!

# Person
  p1 = Person.create({ firstName: "Admin", lastName: "All", user_id: 1}, without_protection: true).save!
  p2 = Person.create({ firstName: "Teacher", lastName: "1", user_id: 2}, without_protection: true).save!
  p3 = Person.create({ firstName: "Student", lastName: "1", user_id: 3}, without_protection: true).save!
  p4 = Person.create({ firstName: "Student", lastName: "2", user_id: 4}, without_protection: true).save!
  p5 = Person.create({ firstName: "Teacher", lastName: "2", user_id: 5}, without_protection: true).save!
  p6 = Person.create({ firstName: "Student", lastName: "3", user_id: 6}, without_protection: true).save!
  p7 = Person.create({ firstName: "Student", lastName: "4", user_id: 7}, without_protection: true).save!
  p8 = Person.create({ firstName: "Teacher", lastName: "3", user_id: 8}, without_protection: true).save!

# Roles
  puts 'SETTING UP DEFAULT ROLES'.colorize( :color => :light_blue, :background => :green )
  role1 = Role.create({ :name => "Admin" }, :without_protection => true ).save!
  role2 = Role.create({ :name => "Teacher" }, :without_protection => true ).save!
  role3 = Role.create({ :name => "Student" }, :without_protection => true ).save!

# UserRole
  puts 'SETTING UP DEFAULT USER-ROLES'.colorize( :color => :light_blue, :background => :green )
  ur1 = UserRole.create({ :user_id => 1, :role_id => role1 }, :without_protection => true ).save!
  ur2 = UserRole.create({ :user_id => 2, :role_id => 2 }, :without_protection => true ).save!
  ur3 = UserRole.create({ :user_id => 3, :role_id => 3 }, :without_protection => true ).save!
  ur4 = UserRole.create({ :user_id => 4, :role_id => 3 }, :without_protection => true ).save!
  ur5 = UserRole.create({ :user_id => 5, :role_id => 2 }, :without_protection => true ).save!
  ur6 = UserRole.create({ :user_id => 6, :role_id => 3 }, :without_protection => true ).save!
  ur7 = UserRole.create({ :user_id => 7, :role_id => 3 }, :without_protection => true ).save!
  ur8 = UserRole.create({ :user_id => 8, :role_id => 2 }, :without_protection => true ).save!

# Class Instruction
  puts 'SETTING UP DEFAULT CLASSES'.colorize( :color => :light_blue, :background => :green )
  class1 = ClassInstruction.create({ :name => "math-101", :time => "Sun, 9 Dec 2012 12:00:00 -0500".to_datetime }, :without_protection => true ).save!
  class2 = ClassInstruction.create({ :name => "ss", :time => "Sun, 9 Dec 2012 12:00:00 -0500".to_datetime }, :without_protection => true ).save!

# Songs
  puts 'SETTING UP DEFAULTS SONGS'.colorize( :color => :light_blue, :background => :green )
  song1 = Song.create({ :title => "Snare - 1", :content => '{"stage":[{"label":"Snare","img":"snare.png","mute":false,"sample":"808_sd.m4a","measures":[{"beats":[{"selected":true},{"selected":true},{"selected":true},{"selected":true}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},{"label":"Hi Hat","img":"hihat.png","mute":true,"sample":"808_chh.m4a","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},{"label":"Kick Drum","img":"kick.png","mute":true,"sample":"808_bd.m4a","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},{"label":"Synth","img":"synth.png","mute":true,"sample":"ambass.mp3","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"}]}', :user_id => 1 }, :without_protection => true ).save!
  song2 = Song.create({ :title => "Hi Hat - 1", :content => '{"stage":[{"label":"Snare","img":"snare.png","mute":false,"sample":"808_sd.m4a","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},{"label":"Hi Hat","img":"hihat.png","mute":true,"sample":"808_chh.m4a","measures":[{"beats":[{"selected":true},{"selected":true},{"selected":true},{"selected":true}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},{"label":"Kick Drum","img":"kick.png","mute":true,"sample":"808_bd.m4a","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},{"label":"Synth","img":"synth.png","mute":true,"sample":"ambass.mp3","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"}]}', :user_id => 1 }, :without_protection => true ).save!
  song3 = Song.create({ :title => "Kick Drum - 1", :content => '{"stage":[{"label":"Snare","img":"snare.png","mute":false,"sample":"808_sd.m4a","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},{"label":"Hi Hat","img":"hihat.png","mute":true,"sample":"808_chh.m4a","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},{"label":"Kick Drum","img":"kick.png","mute":true,"sample":"808_bd.m4a","measures":[{"beats":[{"selected":true},{"selected":true},{"selected":true},{"selected":true}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},{"label":"Synth","img":"synth.png","mute":true,"sample":"ambass.mp3","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"}]}', :user_id => 1 }, :without_protection => true ).save!
  song4 = Song.create({ :title => "Synth - 1", :content => '{"stage":[{"label":"Snare","img":"snare.png","mute":false,"sample":"808_sd.m4a","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},{"label":"Hi Hat","img":"hihat.png","mute":true,"sample":"808_chh.m4a","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},{"label":"Kick Drum","img":"kick.png","mute":true,"sample":"808_bd.m4a","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},{"label":"Synth","img":"synth.png","mute":true,"sample":"ambass.mp3","measures":[{"beats":[{"selected":true},{"selected":true},{"selected":true},{"selected":true}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"}]}', :user_id => 1 }, :without_protection => true ).save
  song5 = Song.create({ :title => "Snare - 2", :content => '{"stage":[{"label":"Snare","img":"snare.png","mute":false,"sample":"808_sd.m4a","measures":[{"beats":[{"selected":true},{"selected":true},{"selected":true},{"selected":true}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},{"label":"Hi Hat","img":"hihat.png","mute":true,"sample":"808_chh.m4a","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},{"label":"Kick Drum","img":"kick.png","mute":true,"sample":"808_bd.m4a","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},{"label":"Synth","img":"synth.png","mute":true,"sample":"ambass.mp3","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"}]}', :user_id => 2 }, :without_protection => true ).save!
  song6 = Song.create({ :title => "Hi Hat - 2", :content => '{"stage":[{"label":"Snare","img":"snare.png","mute":false,"sample":"808_sd.m4a","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},{"label":"Hi Hat","img":"hihat.png","mute":true,"sample":"808_chh.m4a","measures":[{"beats":[{"selected":true},{"selected":true},{"selected":true},{"selected":true}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},{"label":"Kick Drum","img":"kick.png","mute":true,"sample":"808_bd.m4a","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},{"label":"Synth","img":"synth.png","mute":true,"sample":"ambass.mp3","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"}]}', :user_id => 2 }, :without_protection => true ).save!
  song7 = Song.create({ :title => "Kick Drum - 2", :content => '{"stage":[{"label":"Snare","img":"snare.png","mute":false,"sample":"808_sd.m4a","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},{"label":"Hi Hat","img":"hihat.png","mute":true,"sample":"808_chh.m4a","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},{"label":"Kick Drum","img":"kick.png","mute":true,"sample":"808_bd.m4a","measures":[{"beats":[{"selected":true},{"selected":true},{"selected":true},{"selected":true}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},{"label":"Synth","img":"synth.png","mute":true,"sample":"ambass.mp3","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"}]}', :user_id => 2 }, :without_protection => true ).save!
  song8 = Song.create({ :title => "Synth - 2", :content => '{"stage":[{"label":"Snare","img":"snare.png","mute":false,"sample":"808_sd.m4a","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},{"label":"Hi Hat","img":"hihat.png","mute":true,"sample":"808_chh.m4a","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},{"label":"Kick Drum","img":"kick.png","mute":true,"sample":"808_bd.m4a","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},{"label":"Synth","img":"synth.png","mute":true,"sample":"ambass.mp3","measures":[{"beats":[{"selected":true},{"selected":true},{"selected":true},{"selected":true}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"}]}', :user_id => 2 }, :without_protection => true ).save

# Assignments
  puts 'SETTING UP DEFAULT ASSIGNMENTS'.colorize( :color => :light_blue, :background => :green )
  assignment1 = Assignment.create({ :name => 'Assignment 1', :fractionRepresentations => 'fraction', :measureRepresentations => 'circular-pie', :visibleWindows => '', :visibleWindowItems => '', :tempoEditable => true, :lowerRangeOfTempo => 30, :upperRangeOfTempo => 400, :lowerRangeOfBeatsPerMeasure => 2, :upperRangeOfBeatsPerMeasure => 14, :looping => false }, :without_protection => true ).save!
  assignment2 = Assignment.create({ :name => 'Assignment 1', :fractionRepresentations => 'fraction,percent', :measureRepresentations => 'circular-bead,circular-pie', :visibleWindows => '', :visibleWindowItems => '', :tempoEditable => true, :lowerRangeOfTempo => 30, :upperRangeOfTempo => 400, :lowerRangeOfBeatsPerMeasure => 2, :upperRangeOfBeatsPerMeasure => 14, :looping => true }, :without_protection => true ).save!

# Settings
  puts 'SETTING UP DEFAULT SETTINGS'.colorize( :color => :light_blue, :background => :green )
  settings1 = Setting.create({ user_id: 1, mic_level: 1 }, :without_protection => true).save!
  settings2 = Setting.create({ user_id: 2, mic_level: 1 }, :without_protection => true).save!
  settings3 = Setting.create({ user_id: 3, mic_level: 1 }, :without_protection => true).save!
  settings4 = Setting.create({ user_id: 4, mic_level: 1 }, :without_protection => true).save!
  settings5 = Setting.create({ user_id: 5, mic_level: 1 }, :without_protection => true).save!
  settings6 = Setting.create({ user_id: 6, mic_level: 1 }, :without_protection => true).save!
  settings7 = Setting.create({ user_id: 7, mic_level: 1 }, :without_protection => true).save!


# ClassInstruction Assignment
  puts 'SETTING UP DEFAULT Class-Assignments'.colorize( :color => :light_blue, :background => :green )
  cia1 = ClassAssignment.create({ class_instruction_id: 1, assignment_id:1 }, :without_protection => true).save! 
  cia2 = ClassAssignment.create({ class_instruction_id: 1, assignment_id:2 }, :without_protection => true).save! 
  cia3 = ClassAssignment.create({ class_instruction_id: 2, assignment_id:1 }, :without_protection => true).save! 

# Participants
  puts 'SETTING UP DEFAULT Participants'.colorize( :color => :light_blue, :background => :green )
  # Admin ATTENDS class 1 and 2
  p1a = Participant.create({ person_id: 1, class_instruction_id: 1 }, :without_protection => true).save!
  p1b = Participant.create({ person_id: 1, class_instruction_id: 2 }, :without_protection => true).save!
  # Teacher 1 and student 1 and 2 ATTEND class 1
  p2 = Participant.create({ person_id: 2, class_instruction_id: 1 }, :without_protection => true).save!
  p3 = Participant.create({ person_id: 3, class_instruction_id: 1 }, :without_protection => true).save!
  p4 = Participant.create({ person_id: 4, class_instruction_id: 1 }, :without_protection => true).save!
  # Teacher 2 ATTENDS class 2
  p5 = Participant.create({ person_id: 5, class_instruction_id: 2 }, :without_protection => true).save!
  # Student 3 ATTENDS class 2
  p6 = Participant.create({ person_id: 6, class_instruction_id: 2 }, :without_protection => true).save!
  # Student 4 ATTENDS class 1 and 2
  p7a = Participant.create({ person_id: 7, class_instruction_id: 1 }, :without_protection => true).save!
  p7b = Participant.create({ person_id: 7, class_instruction_id: 2 }, :without_protection => true).save!
  # Teacher 3 ATTENDS class 1 and 2
  p8a = Participant.create({ person_id: 8, class_instruction_id: 1 }, :without_protection => true).save!
  p8a = Participant.create({ person_id: 8, class_instruction_id: 2 }, :without_protection => true).save!


# {"stage":[
#     {"label":"Snare","img":"snare.png","mute":false,"sample":"808_sd.m4a","measures":[{"beats":[{"selected":true},{"selected":true},{"selected":true},{"selected":true}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},
#     {"label":"Hi Hat","img":"hihat.png","mute":true,"sample":"808_chh.m4a","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},
#     {"label":"Kick Drum","img":"kick.png","mute":true,"sample":"808_bd.m4a","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"},
#     {"label":"Synth","img":"synth.png","mute":true,"sample":"ambass.mp3","measures":[{"beats":[{"selected":false},{"selected":false},{"selected":false},{"selected":false}],"label":"0/4","numberOfBeats":0,"divisions":8}],"active":true,"signature":4,"representation":"fraction"}
#   ]}

