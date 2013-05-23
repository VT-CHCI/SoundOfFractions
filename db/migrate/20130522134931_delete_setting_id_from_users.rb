class DeleteSettingIdFromUsers < ActiveRecord::Migration
  def up
  	remove_column :users, :setting_id, :integer
  end

  def down
  end
end
