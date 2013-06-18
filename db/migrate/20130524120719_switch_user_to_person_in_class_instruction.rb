class SwitchUserToPersonInClassInstruction < ActiveRecord::Migration
  def up
    add_column :class_instructions, :person_id, :integer
    add_index :class_instructions, :person_id
  end

  def down
  end
end
