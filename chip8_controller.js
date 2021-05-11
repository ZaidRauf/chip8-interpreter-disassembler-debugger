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



async function pauseProgram(){
  running = false
}