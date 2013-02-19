SoundOfFractions.Views.Songs ||= {}

class SoundOfFractions.Views.Songs.IndexView extends Backbone.View
  template: JST["backbone/templates/songs/index"]

  initialize: () ->
    @options.songs.bind('reset', @addAll)

  addAll: () =>
    @options.songs.each(@addOne)

  addOne: (song) =>
    view = new SoundOfFractions.Views.Songs.SongView({model : song})
    @$("tbody").append(view.render().el)

  render: =>
    $(@el).html(@template(songs: @options.songs.toJSON() ))
    @addAll()

    return this
