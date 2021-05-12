"use strict"

var PIXEL_SIZE = 0
var foregroundColor = '#FFFFFF'
var previousInstr = ''

const canvas = document.getElementById('screen')
const context = canvas.getContext('2d')

const romList = ['Maze', 'Pong', 'Connect-4', 'Tic-Tac-Toe', 'Tetris', 'KeypadTest', 'Sierpinski']

function canvas_init(width){
    canvas.width = width
    canvas.height = width/2

    PIXEL_SIZE = width/64
}

function render_pixel_buffer(pixel_buffer){
    context.fillStyle = foregroundColor
    context.clearRect(0, 0, canvas.width, canvas.height)

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

            disassembleAndDisplay(typedArray);

            document.getElementById("startBtn").disabled = false

            pauseProgram(c8)
            
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

        pauseProgram(c8);
    };    
}

function initColorPicker(c8) {
    const foregroundInput = document.getElementById("foregroundColorInput")

    foregroundInput.onchange = () => {
        foregroundColor = foregroundInput.value

        render_pixel_buffer(c8.pixelBuffer)
    }

    const backgroundInput = document.getElementById("backgroundColorInput")
    
    backgroundInput.onchange = () => {
        let backgroundColor = backgroundInput.value
        canvas.style.backgroundColor = backgroundColor
    }
}

function initSelectDropdown(c8) {
    const customInput = document.getElementById("input")
    customInput.hidden = true;
    const select = document.getElementById("romSelect");

    select.addEventListener('change', () => {

        if(select.value === 'custom'){
            customInput.hidden = false;

            pauseProgram(c8)

            document.getElementById("startBtn").disabled = true
            document.getElementById("startBtn").hidden = false;
            document.getElementById("pauseBtn").hidden = true;

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

                        disassembleAndDisplay(typedArray)

                        pauseProgram(c8)

                        c8.reset()
                        c8.loadProgram(typedArray)
                        
                        document.getElementById("startBtn").hidden = true;
                        document.getElementById("startBtn").disabled = false
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

function disassembleAndDisplay(byteArrayProgram){
    let instructionDisassembly = disassembleProgram(byteArrayProgram)

    let instructionList = document.getElementById('instructionList')
    instructionList.innerHTML = ''

    instructionDisassembly.forEach((item, index) => {
        
        let listElement = document.createElement('li');
        listElement.id = 'instr' + index;

        let instructionLabel = "0x" + ((index * 2) + chip8.PROGRAM_START).toString(16).toUpperCase() + ":"

        listElement.onclick = () => {

            if(running || index === Math.floor(((c8.programCounter - chip8.PROGRAM_START))/2)){
                console.log('Running or Match: ' + index + ' ' + Math.floor(((c8.programCounter - chip8.PROGRAM_START))/2))
                return;
            }

            else if(!breakpointSet.has(index)){
                listElement.style.backgroundColor = 'rgba(255,0,0,0.35)'
                breakpointSet.add(index)
                console.log('Index Added: ' + index + ' Total: ' + breakpointSet.size)
            }

            else{
                listElement.style.backgroundColor = ''
                breakpointSet.delete(index)
                console.log('Index Removed: ' + index + ' Total: ' + breakpointSet.size)
            }

        }

        listElement.appendChild(document.createTextNode( instructionLabel + " " + item));
        
        instructionList.appendChild(listElement)
    })


    document.getElementById('instr0').scrollIntoView()    
}

function initRegisterInfo(c8){
    let pcSpan = document.getElementById('pcSpan')
    let indexSpan = document.getElementById('iSpan')
    let delaySpan = document.getElementById('dtSpan')
    let soundSpan = document.getElementById('stSpan')


    setInterval(() => {
        var pcValue = c8.programCounter;
        pcSpan.innerHTML = '0x' + pcValue.toString(16);
        indexSpan.innerHTML = '0x' + c8.indexRegister.toString(16);
        delaySpan.innerHTML = '0x' + c8.delayTimer.toString(16);
        soundSpan.innerHTML = '0x' + c8.soundTimer.toString(16);

        c8.registers.forEach((item, index) => {
            let registerSpan = document.getElementById('v' + index.toString(16) + 'Span')
            registerSpan.innerHTML = '0x' + item.toString(16)
        })

        let stackPrint = ['---','---','---','---','---','---','---','---','---','---','---','---','---','---','---','---',]

        c8.stack.forEach((item, index) => {
            stackPrint[index] = '0x' + item.toString(16);
        })

        stackPrint.forEach((item, index) => {
            let stackItem = document.getElementById('stackItem' + index);
            stackItem.innerHTML = '0x' + index.toString(16).toUpperCase() + ': ' + item;
        })

        try{
            let pcNoOffset = Math.floor((pcValue - chip8.PROGRAM_START)/2);
            let currentInstr = document.getElementById('instr' + pcNoOffset)

            if(previousInstr !== ''){
                previousInstr.style.backgroundColor = ''
            }

            currentInstr.style.backgroundColor = 'rgba(0,255,0,0.35)'
            currentInstr.scrollIntoView()
            previousInstr = currentInstr
        }
        catch(e){

        }

    }, 2)
}