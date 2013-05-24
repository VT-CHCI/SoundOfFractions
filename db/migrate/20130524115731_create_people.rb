class CreatePeople < ActiveRecord::Migration
  def change
    create_table :people do |t|
      t.string :firstName
      t.string :lastName
      t.belongs_to :user

      t.timestamps
    end
  add_index :people, :user_id
  end
end
