source 'https://rubygems.org'

gem 'rails', '3.2.2'

# Bundle edge Rails instead:
# gem 'rails', :git => 'git://github.com/rails/rails.git'

group :development, :test do
  gem 'railroady'
  gem 'sqlite3'
  # For linux support
  gem 'therubyracer'
end

group :production do
  gem 'pg'
  gem 'thin'
end

# Gems used only for assets and not required
# in production environments by default.
group :assets do
  # See https://github.com/sstephenson/execjs#readme for more supported runtimes
  gem 'uglifier', '>= 1.0.3'
end

# gem "better_errors", ">= 0.2.0", :group => :development
# gem "binding_of_caller", ">= 0.6.8", :group => :development
  
gem 'sass-rails',   '~> 3.2.3'
gem 'coffee-rails', '~> 3.2.1'

gem 'jquery-rails'
gem 'rails-backbone'
gem "bootstrap-sass", "~> 2.3.0.0"
gem 'requirejs-rails'
gem 'ejs'
gem 'devise'
gem "better_errors", ">= 0.2.0", :group => :development
gem "binding_of_caller", ">= 0.6.8", :group => :development
# not sure if this is working well with require, but installed nonetheless
gem "d3_rails"

# for a better way of looking at the rake routes by calling rake color_routes
gem 'color_routes'
# lets us know which user is logged in, and store ins a gloabel variable gon{}
gem 'gon'
#browser detection
gem 'browser'

# Deploy with Capistrano
# gem 'capistrano'

# To use debugger
# gem 'ruby-debug19', :require => 'ruby-debug'
