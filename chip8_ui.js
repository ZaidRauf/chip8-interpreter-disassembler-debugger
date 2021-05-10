"use strict"

var PIXEL_SIZE = 0
const canvas = document.getElementById('screen')
const context = canvas.getContext('2d')

// Width is power of 2
function canvas_init(width){
    // const canvas = document.getElementById('screen')
    canvas.width = width
    canvas.height = width/2

    PIXEL_SIZE = width/64
}

function render_pixel_buffer(pixel_buffer){
    // const canvas = document.getElementById('screen')
    // const context = canvas.getContext('2d')
    context.fillStyle = 'white'
    context.clearRect(0, 0, canvas.width, canvas.height) // Neccesarry?

    for(var x = 0; x < 64; x++){

        for(var y = 0; y < 32; y++){

            if(pixel_buffer[x][y] === 1){
                context.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
            }

        }
        
    }

}

function read_chip8_file_init(c8){
    const inputElement = document.getElementById("input");
    inputElement.addEventListener("change", function () {

        const fileList = this.files; /* now you can work with the file list */
        
          var fileReader = new FileReader()
        
          fileReader.readAsArrayBuffer(fileList[0])
        
          fileReader.onload = function() {        
            let typedArray = new Uint8Array(fileReader.result)

            c8.reset()
            // c8.resetMemory()
            c8.loadProgram(typedArray)
          };
    

    }, false)

}