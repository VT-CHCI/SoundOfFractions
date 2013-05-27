class ClassInstruction < ActiveRecord::Base
  belongs_to :people

  has_many :participants
  has_many :people, :through => :participants
end