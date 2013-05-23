class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable,
  # :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation, :remember_me
  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable,
  # :lockable, :timeoutable and :omniauthable

  #== Associations
  has_many :user_roles, :dependent => :destroy
  has_many :roles, :through => :user_roles

  has_many :songs
  has_one :setting

  #== Instance Methods

  def thisUsersID
    self.id
  end

  def student_classes(class_instruction_name)
    member_classes(class_instruction_name, 'Student')
  end

  def teacher_classes(class_instruction_name)
    member_classes(class_instruction_name, Role::TEACHER)
  end

  private

  def member_classes(class_instruction_name, type)
   ClassInstruction \
     .joins(:user_role) \
     .where(["user_role.user_id = ?", id]) \
     .joins("INNER JOIN roles ON roles.id = user_roles.role_id") \
     .where("roles.name = ?", type) \
     .where("class_instructions.name = ?", class_instruction_name)
  end
end
