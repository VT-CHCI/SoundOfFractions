class AddRepresentationsAndTempoToSong < ActiveRecord::Migration
  def change
    add_column :songs, :fractionRepresentation, :string
    add_column :songs, :measureRepresentation, :string
  end
end
