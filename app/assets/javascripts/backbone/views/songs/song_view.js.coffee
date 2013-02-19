SoundOfFractions.Views.Songs ||= {}

class SoundOfFractions.Views.Songs.SongView extends Backbone.View
  template: JST["backbone/templates/songs/song"]

  events:
    "click .destroy" : "destroy"

  tagName: "tr"

  destroy: () ->
    @model.destroy()
    this.remove()

    return false

  render: ->
    $(@el).html(@template(@model.toJSON() ))
    return this
