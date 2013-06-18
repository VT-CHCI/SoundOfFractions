class Setting < ActiveRecord::Base
	attr_accessible :mic_level
	belongs_to :user
end
