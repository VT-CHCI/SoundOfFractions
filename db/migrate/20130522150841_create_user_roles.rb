class CreateUserRoles < ActiveRecord::Migration
  def change
    create_table :user_roles do |t|
      t.belongs_to :user
      t.belongs_to :role

      t.timestamps
    end
    add_index :user_roles, :user_id
    add_index :user_roles, :role_id
  end
end
