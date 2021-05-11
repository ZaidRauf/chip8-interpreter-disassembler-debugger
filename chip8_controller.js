"use strict"

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var running = true;
var runLock = true;

async function runProgram(c8){
  running = true
  
  if(runLock){
    runLock = false
    while(running){
      await c8.runProgramCycle()
      render_pixel_buffer(c8.pixelBuffer)
      await(sleep(2))
    }
    runLock = true
  }
}

async function pauseProgram(c8){
  running = false

  if(c8.awaitingBlockingKeypress){
    breakBlockingKeypress(c8);
    c8.awaitingBlockingKeypress = false;
  }
}

function breakBlockingKeypress(c8){
  var e = document.createEvent('HTMLEvents');
  e.keyCode = 13;
  e.initEvent('keydown', false, true);
  document.dispatchEvent(e);

  c8.programCounter -= 2;
}