class CreateClassAssignment < ActiveRecord::Migration
  def change
    create_table :class_assignment do |t|
      t.belongs_to :class_instruction
      t.belongs_to :assignment

      t.timestamps
    end
    add_index :class_assignment, :class_instruction_id
    add_index :class_assignment, :assignment_id
  end
end
