"use strict"

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runProgram(c8){
  running = true
  while(running){
    await c8.runProgramCycle()
    render_pixel_buffer(c8.pixelBuffer)
    await(sleep(2))
  }
}

function pauseProgram(){
  running = false
}