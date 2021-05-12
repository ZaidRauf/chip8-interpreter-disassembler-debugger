"use strict"

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var breakpointSet = new Set()

var running = true;
var runLock = true;

async function runProgram(c8){
  running = true
  
  if(runLock){
    runLock = false

    while(running){

      if(checkBreakpoint(c8)){
        return;
      }

      await c8.runProgramCycle()
      render_pixel_buffer(c8.pixelBuffer)
      await(sleep(2))
    }
    runLock = true
  }
}

function checkBreakpoint(c8){
  let breakValue = Math.floor(((c8.programCounter - chip8.PROGRAM_START)/2))

  if(breakpointSet.has(breakValue)){
    console.log('MATCH FOUND')
    breakpointSet.delete(breakValue)
    pauseProgram(c8);
    runLock = true;
    return true;
  }

  return false
}

async function stepProgram(c8){

  if(running){
    return;
  }

  if(!runLock){
    simulateArbitraryKeypress();
  }

  if(!runLock){
    return;
  }

  await c8.runProgramCycle()
  render_pixel_buffer(c8.pixelBuffer)

  let breakValue = Math.floor(((c8.programCounter - chip8.PROGRAM_START)/2))

  if(breakpointSet.has(breakValue)){
    console.log('MATCH FOUND STEP')
    breakpointSet.delete(breakValue)
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
  simulateArbitraryKeypress();
  c8.programCounter -= 2;
}

function simulateArbitraryKeypress(){
  var e = document.createEvent('HTMLEvents');
  e.keyCode = -1;
  e.initEvent('keydown', false, true);
  document.dispatchEvent(e);
}