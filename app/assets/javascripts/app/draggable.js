define([
], function(){


  return Draggable = {
    draggableElementID: {
      0: "#beat-palette"
    }, 

    size : function() {
      var size = 0, key;
      for (key in this.draggableElementID) {
          if (this.draggableElementID.hasOwnProperty(key)) size++;
      }
      return size;
    }
  };
});

