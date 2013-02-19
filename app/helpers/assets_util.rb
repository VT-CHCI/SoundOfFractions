module AssetsUtil
  def self.images
    Dir.glob(Rails.root.join("app/assets/images/**/*.*")).map do |path| 
      path.gsub(Rails.root.join("app/assets/images/").to_s, "")
    end
  end
end