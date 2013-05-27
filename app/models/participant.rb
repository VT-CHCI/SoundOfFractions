class Participant < ActiveRecord::Base
  belongs_to :person
  belongs_to :class_instruction
end
