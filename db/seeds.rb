# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

# User
  puts 'SETTING UP DEFAULT USER LOGIN'
  testUser = User.create({ :email => "test@test.org", :password => "asdfasdf", :password_confirmation => "asdfasdf" }, :without_protection => true ).save!
  puts 'test'
  testerUser = User.create({ :email => "tester@tester.org", :password => "asdfasdf", :password_confirmation => "asdfasdf" }, :without_protection => true ).save!
  puts 'tester'

# Songs
  puts 'SETTING UP DEFAULTS SONGS'
  song1 = Song.create({ :title => "OnE", :content => "JSON String OnE", :user_id => 1 }, :without_protection => true ).save!
  song2 = Song.create({ :title => "TwO", :content => "JSON String TwO", :user_id => 1 }, :without_protection => true ).save!
  song3 = Song.create({ :title => "ThreE", :content => "JSON String ThreE", :user_id => 2 }, :without_protection => true ).save!
  song4 = Song.create({ :title => "FouR", :content => "JSON String FouR", :user_id => 2 }, :without_protection => true ).save
