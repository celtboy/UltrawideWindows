/*jshint esversion: 6 */

/**
 * Alows for window placing in Kde KWIN, using hotkeys. Works best for ultra-wide monitors.
 * Hitting the same hotkey multiple times in a row will cycle through different layout options.
 */


// These are different layout options.
// Layouts are grid-based, with 0,0 ([x]column 0, [y]row 0) being top-left on the display
// e.g.
//  label: [
//      number of rows, number of columns,
//      target column, target row,
//      num columns to span, num rows to span
//     ]
const DEBUG = false;
var locationsArray = {
  upLeft:[
    [3, 2, 0, 0, 1, 1],
    [2, 2, 0, 0, 1, 1],
    [4, 2, 0, 0, 1, 1],
    [3, 2, 0, 0, 2, 1],
    [6, 2, 0, 0, 1, 1]
  ],
  upRight:[
    [3, 2, 2, 0, 1, 1],
    [2, 2, 1, 0, 1, 1],
    [4, 2, 3, 0, 1, 1],
    [3, 2, 1, 0, 2, 1],
    [6, 2, 5, 0, 1, 1],
  ],
  downLeft:[
    [3, 2, 2, 0, 1, 1],
    [2, 2, 1, 0, 1, 1],
    [4, 2, 3, 0, 1, 1],
    [3, 2, 1, 0, 2, 1],
    [6, 2, 5, 0, 1, 1]
  ],
  downRight:[
    [3, 2, 2, 1, 1, 1],
    [2, 2, 1, 1, 1, 1],
    [4, 2, 3, 1, 1, 1],
    [3, 2, 1, 1, 2, 1],
    [6, 2, 5, 1, 1, 1]
  ],
  leftHeight:[
    [3, 1, 0, 0, 1, 1],
    [2, 1, 0, 0, 1, 1],
    [4, 1, 0, 0, 1, 1],
    [3, 1, 0, 0, 2, 1],
    [6, 1, 0, 0, 1, 1]
  ],
  rightHeight:[
    [3, 1, 2, 0, 1, 1],
    [2, 1, 1, 0, 1, 1],
    [4, 1, 3, 0, 1, 1],
    [3, 1, 1, 0, 2, 1],
    [6, 1, 5, 0, 1, 1]
  ],
  upCenter:[
    [3, 2, 1, 0, 1, 1],
    [1, 2, 0, 0, 1, 1],
    [4, 2, 1, 0, 2, 1],
    [1, 2, 0, 0, 1, 1],
    [6, 2, 1, 0, 4, 1],
  ],
  downCenter:[
    [3, 2, 1, 1, 1, 1],
    [1, 2, 0, 1, 1, 1],
    [4, 2, 1, 1, 2, 1],
    [1, 2, 0, 1, 1, 1],
    [6, 2, 1, 1, 4, 1]
  ],
  centerHeight:[
    [3, 1, 1, 0, 1, 1],
    [1, 1, 0, 0, 1, 1],
    [4, 1, 1, 0, 2, 1],
    [1, 1, 0, 0, 1, 1],
    [6, 1, 1, 0, 4, 1],
  ],
  top_row_4x3:[
    [4, 3, 0, 0, 1, 1],
    [4, 3, 1, 0, 1, 1],
    [4, 3, 2, 0, 1, 1],
    [4, 3, 3, 0, 1, 1]
  ],
  center_row_4x3:[
    [4, 3, 0, 1, 1, 1],
    [4, 3, 1, 1, 1, 1],
    [4, 3, 2, 1, 1, 1],
    [4, 3, 3, 1, 1, 1]
  ],
  bottom_row_4x3:[
    [4, 3, 0, 2, 1, 1],
    [4, 3, 1, 2, 1, 1],
    [4, 3, 2, 2, 1, 1],
    [4, 3, 3, 2, 1, 1],
  ],
  top_row_4x2:[
    [4, 2, 0, 0, 1, 1],
    [4, 2, 1, 0, 1, 1],
    [4, 2, 2, 0, 1, 1],
    [4, 2, 3, 0, 1, 1]
  ],
  bottom_row_4x2:[
    [4, 2, 0, 1, 1, 1],
    [4, 2, 1, 1, 1, 1],
    [4, 2, 2, 1, 1, 1],
    [4, 2, 3, 1, 1, 1]
  ]
};






var previousClient;
var previousAction;
var previousStep = 0;

if (DEBUG) {
  var clientWindow;
  ////////////////////////////////////////////////////////
  // wm console testing/debug code
  ////////////////////////////////////////////////////////

  workspace.clientList().forEach(function(window) {
    if (window.caption == 'Untitled — Kate') {
        clientWindow = window;
        let maxArea = workspace.clientArea(KWin.MaximizeArea, window);
        let newX = Math.round(maxArea.x + ((maxArea.width - window.width) / 2));
        let newY = Math.round(maxArea.y + ((maxArea.height - window.height) / 2));
        print(`Window: ${clientWindow.caption} , ${clientWindow.windowId}`);

        move(workspace,"center_row_4x3");
        move(workspace,"center_row_4x3");
        move(workspace,"top_row_4x2","left");

    }
  });
} else {
  // var clientWindow = workspace.activeClient;
}


/**
 *
 * @param {*} workspace
 * @param {Kwin::Client} clientWindow
 * @param {int array} action - where to position the client window
 * @returns {int array} - new X,Y,client Width, Height
 */
function newSlotPosition(workspace, action) {

  clientWindow = workspace.activeClient;

  numberXslots = action[0];
  numberYslots = action[1];
  x = action[2];
  y = action[3];
  xSlotToFill = action[4];
  ySlotToFill = action[5];

  var maxArea = workspace.clientArea(KWin.MaximizeArea, clientWindow);

  var newX = maxArea.x + Math.round(maxArea.width / numberXslots * x);
  var newY = maxArea.y + Math.round(maxArea.height / numberYslots * y);

  // Width and height is calculated by finding where the window should end and subtracting where it should start
  var clientWidth = Math.round(maxArea.width / numberXslots * (x + xSlotToFill)) - (newX - maxArea.x);
  var clientHeight = Math.round(maxArea.height / numberYslots * (y + ySlotToFill)) - (newY - maxArea.y);

  // return an object suitable for client.geometry
  return {x:newX, y:newY, width:clientWidth, height:clientHeight};
}


/**
 * Moves the active client window
 * @param {*} workspace
 * @param {int array} action - array containing positional information
 * @param {string || boolean} direction - direction to move the client window
 */
function move(workspace, action, direction=false) {
  clientWindow = workspace.activeClient;
  if (clientWindow.moveable) {
    if (clientWindow !== previousClient || previousAction !== action) {
      previousStep = 0;
    } else {
      previousStep++;  // action[2], action[3]
    }

    // if user hit a 'move left' key; should refactor out all direction changes to support
    // different hotkeys such as Meta+Left, Meta+Up
    if (direction) {
      if (direction === "left") {
          if (previousStep <= 1) {
              previousStep = locationsArray[action].length-1;
          } else {
              previousStep -= 2;
          }
      }
    }

    tmp = figureNewAction(workspace,action);
    newGeometry = newSlotPosition(workspace, tmp);

    // This was set to an indexed array. Needs to be a Kv object
    clientWindow.geometry = newGeometry;
  }
  previousClient = clientWindow;
  previousAction = action;
}

/**
 * Provides stepper helper, allows incrementing through presets using same hotkey
 * @param {kde workspace} workspace
 * @param {int array} action
 * @returns array
 */
function figureNewAction(workspace, action) {
  if ( locationsArray.upLeft.length == previousStep) {
    previousStep = 0;
  }

  // enable window wrapping
  if (previousStep == locationsArray[action].length) {
      previousStep = 0;
  }
  previousStep = (previousStep < 0 ) ? 0 : previousStep;


  newAction = locationsArray[action][previousStep];
  return newAction;
}

/**
 * Centers the activeClient window in the workspace
 * @param {*} workspace
 * @returns null
 */
function center(workspace) {
  clientWindow = workspace.activeClient
  if (clientWindow.moveable) {
    var maxArea = workspace.clientArea(KWin.MaximizeArea, clientWindow);
    var newX = Math.round(maxArea.x + ((maxArea.width - clientWindow.width) / 2));
    var newY = Math.round(maxArea.y + ((maxArea.height - clientWindow.height) / 2));
    clientWindow.geometry = {
      x: newX,
      y: newY,
      width: clientWindow.width,
      height: clientWindow.width
    };
  }
}


if (!DEBUG) {
  /**
    * Register 9 shortcuts, using ALT + Meta + Keypad. Divide screen in 3 rows, 4 columns.
    * 7,4,1 = Move window left on row
    * 8,5,2 = Move window to row (top, center, bottom). Repeating will cycle through slots on the row (like 9,6,3)
    * 9,6,3 = Move window right on row
    */
  registerShortcut("MoveTopRowWindowLeft4x3", "UltrawideWindows: Move Top Row Window Left (4x3)", "alt+Meta+Num+7", function() {
    move(workspace,"top_row_4x3","left");
  });
  registerShortcut("MoveWindowToTopRow4x3", "UltrawideWindows: Move Window to Top Row (4x3)", "alt+Meta+Num+8", function() {
    move(workspace,"top_row_4x3");
  });
  registerShortcut("MoveTopRowWindowRight4x3", "UltrawideWindows: Move Top Row Window Right (4x3)", "alt+Meta+Num+9", function() {
    move(workspace,"top_row_4x3","right");
  });

  registerShortcut("MoveCenterRowWindowLeft4x3", "UltrawideWindows: Move Center Row Window Right (4x3)", "alt+Meta+Num+4", function() {
    move(workspace,"center_row_4x3","left");
  });
  registerShortcut("MoveWindowToCenterRow4x3", "UltrawideWindows: Move Window to Center Row(4x3)", "alt+Meta+Num+5", function() {
    move(workspace,"center_row_4x3");
  });
  registerShortcut("MoveCenterRowWindowRight4x3", "UltrawideWindows: Move Center Row Window Right (4x3)", "alt+Meta+Num+6", function() {
    move(workspace,"center_row_4x3","right");
  });

  registerShortcut("MoveBottomRowWindowLeft4x3", "UltrawideWindows: Move Bottom Row Window Right (4x3)", "alt+Meta+Num+1", function() {
    move(workspace,"bottom_row_4x3","left");
  });
  registerShortcut("MoveWindowToBottomRow4x3", "UltrawideWindows: Move Window to Bottom Row (4x3)", "alt+Meta+Num+2", function() {
    move(workspace,"bottom_row_4x3");
  });
  registerShortcut("MoveBottomRowWindowRight4x3", "UltrawideWindows: Move Bottom Row Window Right (4x3)", "alt+Meta+Num+3", function() {
    move(workspace,"bottom_row_4x3","right");
  });

  /**
    * Register 9 shortcuts, using CTRL + Meta + Keypad. Divide screen in 2 rows, 4 columns.
    * 7,4,1 = Move window left on row
    * 8,5,2 = Move window to row (top, center, bottom). Repeating will cycle through slots on the row (like 9,6,3)
    * 9,6,3 = Move window right on row
    */
  registerShortcut("MoveTopRowWindowLeft4x2", "UltrawideWindows: Move Top Row Window Left (4x2)", "ctrl+Meta+Num+7", function() {
    move(workspace,"top_row_4x2","left");
  });
  registerShortcut("MoveWindowToTopRow4x2", "UltrawideWindows: Move Window to Top Row (4x2)", "ctrl+Meta+Num+8", function() {
    move(workspace,"top_row_4x2");
  });
  registerShortcut("MoveTopRowWindowRight4x2", "UltrawideWindows: Move Top Row Window Right (4x2)", "ctrl+Meta+Num+9", function() {
    move(workspace,"top_row_4x2","right");
  });

  registerShortcut("MoveBottomRowWindowLeft4x2", "UltrawideWindows: Move Bottom Row Window Right (4x2)", "ctrl+Meta+Num+1", function() {
    move(workspace,"bottom_row_4x2","left");
  });
  registerShortcut("MoveWindowToBottomRow4x2", "UltrawideWindows: Move Window to Bottom Row (4x2)", "ctrl+Meta+Num+2", function() {
    move(workspace,"bottom_row_4x2");
  });
  registerShortcut("MoveBottomRowWindowRight4x2", "UltrawideWindows: Move Bottom Row Window Right (4x2)", "ctrl+Meta+Num+3", function() {
    move(workspace,"bottom_row_4x2","right");
  });






  // GRID 3x2
  registerShortcut("MoveWindowToUpLeft3x2", "UltrawideWindows: Move Window to up-left (3x2)", "Meta+Num+7", function () {
      move(workspace, "upLeft");
  });

  registerShortcut("MoveWindowToUpCenter3x2", "UltrawideWindows: Move Window to up-center (3x2)", "Meta+Num+8", function () {
      move(workspace, "upCenter");
  });

  registerShortcut("MoveWindowToUpRight3x2", "UltrawideWindows: Move Window to up-right (3x2)", "Meta+Num+9", function () {
      move(workspace, "upRight");
  });

  registerShortcut("MoveWindowToDownLeft3x2", "UltrawideWindows: Move Window to down-left (3x2)", "Meta+Num+1", function () {
      move(workspace, "downLeft");
  });

  registerShortcut("MoveWindowToDownCenter3x2", "UltrawideWindows: Move Window to down-center (3x2)", "Meta+Num+2", function () {
      move(workspace, "downCenter");
  });

  registerShortcut("MoveWindowToDownRight3x2", "UltrawideWindows: Move Window to down-right (3x2)", "Meta+Num+3", function () {
      move(workspace, "downRight");
  });

  registerShortcut("MoveWindowToLeftHeight3x2", "UltrawideWindows: Move Window to left-height (3x2)", "Meta+Num+4", function () {
      move(workspace, "leftHeight");
  });

  registerShortcut("MoveWindowToCenterHeight3x2", "UltrawideWindows: Move Window to center-height (3x2)", "Meta+Num+5", function () {
      move(workspace, "centerHeight");
  });

  registerShortcut("MoveWindowToRightHeight3x2", "UltrawideWindows: Move Window to right-height (3x2)", "Meta+Num+6", function () {
      move(workspace, "rightHeight");
  });

}