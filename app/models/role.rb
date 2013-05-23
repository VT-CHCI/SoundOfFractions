class Role < ActiveRecord::Base
  has_many :user_roles, :dependent => :destroy
end
