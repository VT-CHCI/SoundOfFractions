class AddSettingIdToUser < ActiveRecord::Migration
  def change
    add_column :users, :setting_id, :integer
  end
end
