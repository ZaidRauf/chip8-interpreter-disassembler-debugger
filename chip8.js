"use strict"

class chip8{

    static get NUM_REGISTERS() { 
        return 0x10
    }

    static get MEMORY_SIZE() { 
        return 0x1000
    }

    static get STACK_SIZE() { 
        return 0x10
    }

    static get PIXEL_BUFFER_WIDTH() { 
        return 64
    }

    static get PIXEL_BUFFER_HEIGHT() { 
        return 32
    }

    // Can be loaded in anywhere is arbitrary
    static get FONT_START_OFFSET() { 
        return 0x10
    }

    static randomByteGenerator(){
        return Math.floor(Math.random() * 256)
    }

    loadFonts(){
        var fontSet =
        [
        0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
        0x20, 0x60, 0x20, 0x20, 0x70, // 1
        0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
        0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
        0x90, 0x90, 0xF0, 0x10, 0x10, // 4
        0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
        0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
        0xF0, 0x10, 0x20, 0x40, 0x40, // 7
        0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
        0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
        0xF0, 0x90, 0xF0, 0x90, 0x90, // A
        0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
        0xF0, 0x80, 0x80, 0x80, 0xF0, // C
        0xE0, 0x90, 0x90, 0x90, 0xE0, // D
        0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
        0xF0, 0x80, 0xF0, 0x80, 0x80  // F
        ]

        fontSet.forEach((element, index) => this.memory[chip8.FONT_START_OFFSET + index] = element)
        
    }

    constructor() {
        // Instantiates and initializes registers V0, V1, V2, ... VF
        this.registers = Array(chip8.NUM_REGISTERS).fill(0)
        
        // Instantiates and initializes memory
        this.memory = Array(chip8.MEMORY_SIZE).fill(0)

        // Pixel Buffer screen
        this.pixelBuffer = Array(chip8.PIXEL_BUFFER_WIDTH * chip8.PIXEL_BUFFER_HEIGHT).fill(false)

        this.stack = []
        this.indexRegister = 0
        this.programCounter = 0
        // this.stackPointer = -1 //Is there any need for a stack pointer?
        this.delayTimer = 0
        this.soundTimer = 0
        // this.currentlyExecutingOpCode = 0

        this.loadFonts();
    }

    //Instruction Functions
    SYS(){}
    CLS(){this.pixelBuffer.fill(false)} //00E0
    RET(){this.programCounter = this.stack[this.stack.length - 1]; this.stack.pop()} // 00EE
    JP(opcode){this.programCounter = 0x0FFF & opcode} //1nnn
    CALL(opcode){this.stack.push(this.programCounter); this.programCounter = 0x0FFF & opcode} //2nnn
    SE(opcode){
        var x = (0x0F00 & opcode) >>> 8
        var kk = 0x00FF & opcode
        
        if (this.registers[x] === kk){
            this.programCounter += 2
        }
    }
    SNE(opcode){
        var x = (0x0F00 & opcode) >>> 8
        var kk = 0x00FF & opcode
        
        if (this.registers[x] !== kk){
            this.programCounter += 2
        }
    }

}

var c8 = new chip8();

console.log(chip8.randomByteGenerator());

// function init_buttons(){

//     var hex = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F']

//     hex.forEach((item, index) => {
//         var btn = document.getElementById("inputBtn_" + item);
//         btn.addEventListener("click", () =>{
//             console.log("btn" + item + " Pressed!")
//         })
    
//     })
    
// }

// init_buttons()