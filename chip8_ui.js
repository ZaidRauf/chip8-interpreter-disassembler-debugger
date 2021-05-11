"use strict"

var PIXEL_SIZE = 0
const canvas = document.getElementById('screen')
const context = canvas.getContext('2d')

const romList = ['Maze', 'Pong', 'Connect-4', 'Tic-Tac-Toe', 'Tetris', 'KeypadTest', 'Sierpinski']

function canvas_init(width){
    canvas.width = width
    canvas.height = width/2

    PIXEL_SIZE = width/64
}

function render_pixel_buffer(pixel_buffer){
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
        console.log(fileList[0])
        var fileReader = new FileReader()
        
        fileReader.readAsArrayBuffer(fileList[0])
        
        fileReader.onload = function() {
            let typedArray = new Uint8Array(fileReader.result)

            pauseProgram()
            
            c8.reset()
            c8.loadProgram(typedArray)

            document.getElementById("startBtn").hidden = true;
            document.getElementById("pauseBtn").hidden = false;

            runProgram(c8)

        };
    

    }, false)

}

function initExecutionButtons(c8) {
    document.getElementById("pauseBtn").hidden = true;

    document.getElementById("startBtn").onclick = function(){
        document.getElementById("startBtn").hidden = true;
        document.getElementById("pauseBtn").hidden = false;

        runProgram(c8);
    };

    document.getElementById("pauseBtn").onclick = function(){
        document.getElementById("startBtn").hidden = false;
        document.getElementById("pauseBtn").hidden = true;

        pauseProgram();
    };    
}

function initSelectDropdown(c8) {
    const customInput = document.getElementById("input")
    customInput.hidden = true;
    const select = document.getElementById("romSelect");

    select.addEventListener('change', () => {

        if(select.value === 'custom'){
            customInput.hidden = false;
        }

        else{
            customInput.hidden = true;
        }
    })
    
    romList.forEach((item, index) => {

        const select = document.getElementById('romSelect')

        let option = document.createElement('option')
        option.text = item
        option.value = index.toString()

        select.add(option)

        select.addEventListener('change', () => {

            if(select.value == index){
                fetch('/roms/' + item + '.c8')
                .then(response => response.body.getReader().read()
                .then(
                    function loadRom({done, value}){

                        let typedArray = new Uint8Array(value)

                        pauseProgram()

                        c8.reset()
                        c8.loadProgram(typedArray)

                        document.getElementById("startBtn").hidden = true;
                        document.getElementById("pauseBtn").hidden = false;
            
                        runProgram(c8)
                    }
                ))
            }

        })
    })

    let option = document.createElement('option')
    option.text = 'Custom Program'
    option.value = 'custom'
    select.add(option)

}