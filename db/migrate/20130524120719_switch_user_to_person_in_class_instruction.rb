class SwitchUserToPersonInClassInstruction < ActiveRecord::Migration
  def up
    remove_column :class_instructions, :user_id
    remove_index :class_instructions, :user
    add_column :class_instructions, :person_id, :integer
    add_index :class_instructions, :person_id
  end

  def down
  end
end
