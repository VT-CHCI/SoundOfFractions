class Participants < ActiveRecord::Migration
  def change
    create_table :participants do |t|
      t.belongs_to :person
      t.belongs_to :class_instruction

      t.timestamps
    end
    add_index :participants, :person_id
    add_index :participants, :class_instruction_id
  end
end