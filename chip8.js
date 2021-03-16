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

    static get FLAG_REGISTER() { 
        return 0xF
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
        // this.stackPointer = -1 //Is there any need for a stack pointer if im just using .length?
        this.delayTimer = 0
        this.soundTimer = 0
        this.currentOpcode = 0

        this.loadFonts();
    }

    set setCurrentOpcode(newOpcode){
        this.currentOpcode = newOpcode;
    }

    //Instruction Functions
    SYS(){}
    CLS(){this.pixelBuffer.fill(false)} //00E0
    RET(){this.programCounter = this.stack[this.stack.length - 1]; this.stack.pop()} // 00EE
    JP(){this.programCounter = 0x0FFF & this.currentOpcode} //1nnn
    CALL(){this.stack.push(this.programCounter); this.programCounter = 0x0FFF & this.currentOpcode} //2nnn
    SE_rb(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        var kk = 0x00FF & this.currentOpcode
        
        if (this.registers[x] === kk){
            this.programCounter += 2
        }
    }
    SNE_rb(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        var kk = 0x00FF & this.currentOpcode
        
        if (this.registers[x] !== kk){
            this.programCounter += 2
        }
    }
    SE_rr(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        var y = (0x00F0 & this.currentOpcode) >>> 4
        
        if (this.registers[x] === this.registers[y]){
            this.programCounter += 2
        }
    }
    LD_rb(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        var kk = 0x00FF & this.currentOpcode
        this.registers[x] = kk;
    }
    ADD_rb(){
        // Do i need to set the carry flag? Seems no
        var x = (0x0F00 & this.currentOpcode) >>> 8
        var kk = 0x00FF & this.currentOpcode
        this.registers[x] = (this.registers[x] + kk) & 0x00FF;
    }
    LD_rr(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        var y = (0x00F0 & this.currentOpcode) >>> 4

        this.registers[x] = this.registers[y]
    }
    OR_rr(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        var y = (0x00F0 & this.currentOpcode) >>> 4

        this.registers[x] = this.registers[x] | this.registers[y]

    }
    AND_rr(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        var y = (0x00F0 & this.currentOpcode) >>> 4

        this.registers[x] = this.registers[x] & this.registers[y]

    }
    XOR_rr(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        var y = (0x00F0 & this.currentOpcode) >>> 4

        this.registers[x] = this.registers[x] ^ this.registers[y]
    }
    ADD_rr(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        var y = (0x00F0 & this.currentOpcode) >>> 4

        this.registers[x] += this.registers[y]

        if (this.registers[x] > 255) this.registers[chip8.FLAG_REGISTER] = 1
        else this.registers[chip8.FLAG_REGISTER] = 0

        this.registers[x] = this.registers[x] & 0xFF
    }
    SUB_rr(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        var y = (0x00F0 & this.currentOpcode) >>> 4

        if (this.registers[x] > registers[y]) this.registers[chip8.FLAG_REGISTER] = 1
        else this.registers[chip8.FLAG_REGISTER] = 0

        this.registers[x] = this.registers[x] - this.registers[y]
        this.registers[x] = this.registers[x] & 0xFF
    }
    SHR_r(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        var y = (0x00F0 & this.currentOpcode) >>> 4

        if((this.registers[x] & 0b1) == 0b1) this.registers[chip8.FLAG_REGISTER] = 1
        else this.registers[chip8.FLAG_REGISTER] = 0

        this.registers[x] = this.registers[x] >>> 1
    }
    SUBN_rr(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        var y = (0x00F0 & this.currentOpcode) >>> 4

        if (this.registers[y] > registers[x]) this.registers[chip8.FLAG_REGISTER] = 1
        else this.registers[chip8.FLAG_REGISTER] = 0

        this.registers[x] = this.registers[y] - this.registers[x]
        this.registers[x] = this.registers[x] & 0xFF
    }
    SHL_r(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        var y = (0x00F0 & this.currentOpcode) >>> 4

        if((this.registers[x] & 0x80) == 0x80) this.registers[chip8.FLAG_REGISTER] = 1
        else this.registers[chip8.FLAG_REGISTER] = 0

        this.registers[x] = this.registers[x] << 1
    }
    SNE_rr(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        var y = 0x00F0 & this.currentOpcode >>> 4
        
        if (this.registers[x] !== this.registers[y]){
            this.programCounter += 2
        }
    }


}

var c8 = new chip8();
c8.setCurrentOpcode = 0x1111 
c8.ADD_rr()

console.log(chip8.randomByteGenerator());