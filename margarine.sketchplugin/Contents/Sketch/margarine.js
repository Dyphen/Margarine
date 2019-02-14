@import 'defaults.js'

var doc, selection, count

function onSetUp(context) {
  doc = context.document
  selection = context.selection
  count = selection.count()
  fetchDefaults()
}

var directions = {
  LEFT: 0,
  RIGHT: 1,
  UP: 2,
  DOWN: 3
}

function tileSelectionUp(context) {
  document = context.document;
  tileSelection(directions.UP)
}

function tileSelectionDown(context) {
  document = context.document;
  tileSelection(directions.DOWN)
}

function tileSelectionLeft(context) {
  document = context.document;
  tileSelection(directions.LEFT)
}

function tileSelectionRight(context) {
  document = context.document;
  tileSelection(directions.RIGHT)
}

function tileSelectionUpAddingMargin(context) {
  document = context.document;
  tileSelection(directions.UP, true)
}

function tileSelectionDownAddingMargin(context) {
  document = context.document;
  tileSelection(directions.DOWN, true)
}

function tileSelectionLeftAddingMargin(context) {
  document = context.document;
  tileSelection(directions.LEFT, true)
}

function tileSelectionRightAddingMargin(context) {
  document = context.document;
  tileSelection(directions.RIGHT, true)
}

function tileSelection(direction, prompt) {

  if (selection.count() == 0) {
    var page = document.currentPage()
    var artboard = page.currentArtboard()
    selection = artboard ? artboard.layers() : page.layers()
  }
  else if (selection.count() == 1) {
    if (selection.firstObject().layers().count() > 0) {
      selection = selection.firstObject().layers();
    }

  }
  if (selection.count() < 2) {
    document.showMessage("Please select more than 2 layers.");
    return;   
  }
  var gap = getGap(prompt)
  
  selection.forEach(function(layer) {
    layer.select_byExtendingSelection(false, false)
  })

  var layersArray = []
  selection.forEach(function(layer) {
    layersArray.push(layer)
    layer.select_byExtendingSelection(true, true)
  })

  var layers = sortLayersForDirection(layersArray, direction)

  var rect = getRectFromLayers(layers);
  
  var x = rect.x();
  var y = rect.y();
  var right = rect.maxX();
  var bottom = rect.maxY();
  

  if (direction == 0) {
    for (var i = 0; i < layers.length; i++) {
      var layer = layers[i];
      layer.frame().setX(x);
      x = x + layer.frame().width() + gap;
    }
  }

  else if (direction == 1) {
    for (var i = 0; i < layers.length; i++) {
      var layer = layers[i];
      layer.frame().setMaxX(right);
      right = right - layer.frame().width() - gap;
    }
  }
  else if (direction == 2) {
    for (var i = 0; i < layers.length; i++) {
      var layer = layers[i];
      layer.frame().setY(y);
      y = y + layer.frame().height() + gap;
    }
  }
  else if (direction == 3) {
    for (var i = 0; i < layers.length; i++) {
      var layer = layers[i];
      layer.frame().setY(bottom-layer.frame().height());
      bottom = bottom - layer.frame().height() - gap;
    }
  }
  var loopSelection = selection.objectEnumerator();
  var selectedLayer;
  while (selectedLayer = loopSelection.nextObject()) {
    if (selectedLayer.parentGroup().class() == "MSLayerGroup") {
      if (MSApplicationMetadata.metadata().appVersion >= 53) {
        selectedLayer.parentGroup().fixGeometryWithOptions(1);
      } else {
        selectedLayer.parentGroup().resizeToFitChildrenWithOption(1);
      }
    }
  }
}

function getGap(prompt) {

  if (!prompt)
    return 0

  var alert = COSAlertWindow.new();
  alert.setMessageText("Enter Spacing:")
  var viewWidth = 300;
  var viewHeight = 30;
  var horizontalTextField = NSTextField.alloc().initWithFrame(NSMakeRect(3, viewHeight - 25, 150, 20));
  var view = NSView.alloc().initWithFrame(NSMakeRect(0, 0, viewWidth, viewHeight));
  alert.addAccessoryView(view);
  view.addSubview(horizontalTextField);
  alert.addButtonWithTitle("OK");
  alert.addButtonWithTitle("Cancel");
  var cancelButton = alert.buttons().lastObject();
  cancelButton.wantsLayer = true;
  cancelButton.layer().opacity = 0;
  horizontalTextField.setStringValue(defaults.lastValue)
  alert.alert().window().setInitialFirstResponder(horizontalTextField);
  var response = alert.runModal()
  
  if (response === null)
    return null

  if (response == "1000") {
    var gap = +horizontalTextField.stringValue();
    updateLastValueDefault(gap)
    return gap
  }
  else {
    return 0
  }
}

function getRectFromLayers(layers) {
  var rectArray = NSMutableArray.alloc().init();
  for (var i = 0; i < layers.length; i++){
    rectArray.addObject(layers[i].frame());
  }
  return MSRect.rectWithUnionOfRects(rectArray);
}

function pageRectForLayer(layer) {
  var frame = layer.frameForTransforms()
  var coords = pageCoordinatesForLayer(layer)
  return MSRect.rectWithX_y_width_height(coords.x, coords.y, frame.size.width, frame.size.height)
}

function sortLayersForDirection(layers, direction) {
  document.showMessage(direction)
  return layers.sort(function(a, b) {
    var aFrame = pageRectForLayer(a)
    var bFrame = pageRectForLayer(b)


    switch(direction) {
      case 0:
        return aFrame.minX() <= bFrame.minX() ? -1 : 1
      case 1:
        return aFrame.maxX() >= bFrame.maxX() ? -1 : 1
      case 2:
        return aFrame.minY() <= bFrame.minY() ? -1 : 1
      case 3:
        return aFrame.maxY() >= bFrame.maxY() ? -1 : 1
    }
  })
}

function pageCoordinatesForLayer(layer) {
  var x = 0, y = 0
  
  while(layer) {
    var frame = layer.frameForTransforms()
    x += frame.origin.x
    y += frame.origin.y
    layer = layer.parentGroup()
  }
  return { x: x, y: y}
}