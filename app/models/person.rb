class Person < ActiveRecord::Base
  belongs_to :user
  
  has_many :participants
  has_many :class_instructions, :through => :participants
end