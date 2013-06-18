class Assignment < ActiveRecord::Base
  has_many :class_assignments
  has_many :class_instructions, :through => :class_assignments
end