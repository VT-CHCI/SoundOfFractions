class CreateClassInstructions < ActiveRecord::Migration
  def change
    create_table :class_instructions do |t|
      t.string :name
      t.datetime :time
      t.belongs_to :user

      t.timestamps
    end
    add_index :class_instructions, :user_id
  end
end
