"use strict"

var PIXEL_SIZE = 0

function init_buttons(){

    var hex = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F']

    hex.forEach((item, index) => {
        var btn = document.getElementById("inputBtn_" + item);
        btn.addEventListener("click", () =>{
            console.log("btn" + item + " Pressed!")
        })
    
    })
    
}

// Width is power of 2
function canvas_init(width){
    const canvas = document.getElementById('screen')
    canvas.width = width
    canvas.height = width/2

    PIXEL_SIZE = width/64
}

function draw_pixel(context, x, y){
    context.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
}

function render_pixel_buffer(pixel_buffer){
    const canvas = document.getElementById('screen')
    const context = canvas.getContext('2d')
    context.fillStyle = 'white'

    for(var x = 0; x < 64; x++){

        for(var y = 0; y < 32; y++){

            if(pixel_buffer[x][y] === 1){
                draw_pixel(context, x, y)
            }

        }
        
    }

}

init_buttons()
canvas_init(1024)
// pixelBuffer = Array(chip8.PIXEL_BUFFER_WIDTH).fill(Array(chip8.PIXEL_BUFFER_HEIGHT).fill(0))

// var pixelBuffer = new Array(chip8.PIXEL_BUFFER_HEIGHT)

// for(var y = 0; y < chip8.PIXEL_BUFFER_WIDTH; y++){
//     pixelBuffer[y] = new Array(chip8.PIXEL_BUFFER_WIDTH).fill(0)
// }

// pixelBuffer[0][0] = 1
// pixelBuffer[63][0] = 1
// pixelBuffer[63][31] = 1
// pixelBuffer[0][31] = 1

// console.log(pixelBuffer)
// console.log(pixelBuffer[0][0])

// render_pixel_buffer(pixelBuffer)