class AddUserRolesToUser < ActiveRecord::Migration
  def change
  	has_many :userRoles
	has_many :roles, :through => userRoles
  end
end
