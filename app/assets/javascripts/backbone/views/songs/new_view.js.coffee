SoundOfFractions.Views.Songs ||= {}

class SoundOfFractions.Views.Songs.NewView extends Backbone.View
  template: JST["backbone/templates/songs/new"]

  events:
    "submit #new-song": "save"

  constructor: (options) ->
    super(options)
    @model = new @collection.model()

    @model.bind("change:errors", () =>
      this.render()
    )

  save: (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.unset("errors")

    @collection.create(@model.toJSON(),
      success: (song) =>
        @model = song
        window.location.hash = "/#{@model.id}"

      error: (song, jqXHR) =>
        @model.set({errors: $.parseJSON(jqXHR.responseText)})
    )

  render: ->
    $(@el).html(@template(@model.toJSON() ))

    this.$("form").backboneLink(@model)

    return this
