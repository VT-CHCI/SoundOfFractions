class UserRole < ActiveRecord::Base
  belongs_to :user
  belongs_to :role

  def roleName
    self.role.name
  end
end
