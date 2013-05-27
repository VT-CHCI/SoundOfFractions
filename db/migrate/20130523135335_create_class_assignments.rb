class CreateClassAssignments < ActiveRecord::Migration
  def change
    create_table :class_assignments do |t|
      t.belongs_to :class_instruction
      t.belongs_to :assignment

      t.timestamps
    end
    add_index :class_assignments, :class_instruction_id
    add_index :class_assignments, :assignment_id
  end
end
