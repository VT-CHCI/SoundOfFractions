SoundOfFractions.Views.Songs ||= {}

class SoundOfFractions.Views.Songs.EditView extends Backbone.View
  template : JST["backbone/templates/songs/edit"]

  events :
    "submit #edit-song" : "update"

  update : (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.save(null,
      success : (song) =>
        @model = song
        window.location.hash = "/#{@model.id}"
    )

  render : ->
    $(@el).html(@template(@model.toJSON() ))

    this.$("form").backboneLink(@model)

    return this
