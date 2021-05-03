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
    context.clearRect(0, 0, canvas.width, canvas.height) // Neccesarry?

    for(var x = 0; x < 64; x++){

        for(var y = 0; y < 32; y++){

            if(pixel_buffer[x][y] === 1){
                draw_pixel(context, x, y)
            }

        }
        
    }

}

// var loadedFile = null;
// function read_chip8_file_init(){
//     const inputElement = document.getElementById("input");
//     inputElement.addEventListener("change", function () {

//         const fileList = this.files; /* now you can work with the file list */
        
//           var fileReader = new FileReader()
        
//           fileReader.readAsArrayBuffer(fileList[0])
        
//           fileReader.onload = function() {
//             console.log(fileReader.result);
        
//             let typedArray = new Uint8Array(fileReader.result)
//             console.log(typedArray)

//             let printArray = []
            
//             typedArray.forEach((value, index) => printArray.push('0x' + value.toString(16)))
            
//             console.log(printArray)

//             loadedFile = fileReader.result
//           };
    

//     }, false)

// }


init_buttons()
canvas_init(1024)
// read_chip8_file_init()