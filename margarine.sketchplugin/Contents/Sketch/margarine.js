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

  var layers = selection.mutableCopy();

  var rect = getRectFromLayers(layers);

  var x = rect.x();
  var y = rect.y();
  var right = rect.maxX();
  var bottom = rect.maxY();


  if (direction == 0) {
    for (var i = 0; i < layers.count(); i++) {
      var layer = layers[i];
      layer.frame().setX(x);
      layer.frame().setY(y);
      x = x + layer.frame().width() + gap;
    }
  }

  else if (direction == 1) {
    for (var i = 0; i < layers.count(); i++) {
      var layer = layers[i];
      layer.frame().setMaxX(right);
      layer.frame().setY(y);
      right = right - layer.frame().width() - gap;
    }
  }
  else if (direction == 2) {
    for (var i = 0; i < layers.count(); i++) {
      var layer = layers[i];
      log(`${layer.name()} (${x}, ${bottom})`);
      layer.frame().setX(x);
      layer.frame().setMaxY(bottom);
      bottom = bottom - layer.frame().height() - gap;
    }
  }
  else if (direction == 3) {
    for (var i = 0; i < layers.count(); i++) {
      var layer = layers[i];
      layer.frame().setX(x);
      layer.frame().setY(y);
      y = y + layer.frame().height() + gap;
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
  var loopLayers = layers.objectEnumerator();
  var layer;
  while (layer = loopLayers.nextObject()) {
    rectArray.addObject(layer.frame());
  }
  return MSRect.rectWithUnionOfRects(rectArray);
}
