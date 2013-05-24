class Person < ActiveRecord::Base
  belongs_to :user
  has_many :class_instructions
end
