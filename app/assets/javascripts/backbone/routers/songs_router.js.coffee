# class SoundOfFractions.Routers.SongsRouter extends Backbone.Router
#   initialize: (options) ->
#     @songs = new SoundOfFractions.Collections.SongsCollection()
#     @songs.reset options.songs

#   routes:
#     "new"      : "newSong"
#     "index"    : "index"
#     ":id/edit" : "edit"
#     ":id"      : "show"
#     ".*"        : "index"

#   newSong: ->
#     @view = new SoundOfFractions.Views.Songs.NewView(collection: @songs)
#     $("#songs").html(@view.render().el)

#   index: ->
#     console.log('songs index');
#     @view = new SoundOfFractions.Views.Songs.IndexView(songs: @songs)
#     $("#songs").html(@view.render().el)
#   # index: ->
#   #   @view = new SoundOfFractions.Views.Home.HomeView(songs: @songs)
#   #   $("#songs").html(@view.render().el)

#   show: (id) ->
#     song = @songs.get(id)

#     @view = new SoundOfFractions.Views.Songs.ShowView(model: song)
#     $("#songs").html(@view.render().el)

#   edit: (id) ->
#     song = @songs.get(id)

#     @view = new SoundOfFractions.Views.Songs.EditView(model: song)
#     $("#songs").html(@view.render().el)
