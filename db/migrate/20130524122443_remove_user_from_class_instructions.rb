class RemoveUserFromClassInstructions < ActiveRecord::Migration
  def up
    remove_column :class_instructions, :user_id
  end

  def down
  end
end
