class CreateAssignments < ActiveRecord::Migration
  def change
    create_table :assignments do |t|
      t.string :name
      t.string :fractionRepresentations
      t.string :measureRepresentations
      t.string :visibleWindows
      t.string :visibleWindowItems
      t.boolean :tempoEditable
      t.integer :lowerRangeOfTempo
      t.integer :upperRangeOfTempo
      t.integer :lowerRangeOfBeatsPerMeasure
      t.integer :upperRangeOfBeatsPerMeasure
      t.boolean :looping

      t.timestamps
    end
  end
end
