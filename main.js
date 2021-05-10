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

  // const ke = new KeyboardEvent('keydown', {
  //     bubbles: true, cancelable: true, keyCode: 13
  // });
  // document.body.dispatchEvent(ke);
}

canvas_init(1024)
var c8 = new chip8();
read_chip8_file_init(c8)
var running = true

document.getElementById("startBtn").onclick = function(){runProgram(c8)}
document.getElementById("pauseBtn").onclick =function(){pauseProgram()}
