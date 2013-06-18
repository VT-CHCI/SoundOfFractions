class RemovePersonIdFromClassInstructions < ActiveRecord::Migration
  def up
    remove_column :class_instructions, :person_id
  end

  def down
  end
end
