"use strict"

var runner = false;

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

    static get NUM_KEYS() { 
        return 0x10
    }

    static get PROGRAM_START() { 
        return 0x200
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
        this.registers = new Array(chip8.NUM_REGISTERS).fill(0)

        // Instantiates and initializes memory
        this.memory = new Array(chip8.MEMORY_SIZE).fill(0)

        // Pixel Buffer Init
        this.pixelBuffer = new Array(chip8.PIXEL_BUFFER_HEIGHT)

        for(var x = 0; x < chip8.PIXEL_BUFFER_WIDTH; x++){
            this.pixelBuffer[x] = new Array(chip8.PIXEL_BUFFER_WIDTH).fill(0)
        }
            

        this.stack = []
        this.indexRegister = 0
        this.programCounter = 0
        this.stackPointer = -1 //Is there any need for a stack pointer if im just using .length?
        this.delayTimer = 0
        this.soundTimer = 0
        this.currentOpcode = 0

        this.inputKeys = Array(chip8.NUM_KEYS).fill(false);

        this.loadFonts();

        this.inputListener();
    }

    set setCurrentOpcode(newOpcode){
        this.currentOpcode = newOpcode;
    }

    set pressKey(key){
        this.currentKeyPress[key] = true;
    }

    set releaseKey(key){
        this.currentKeyPress[key] = false;
    }

    inputListener(){
        const keyArr = ['x', '1', '2', '3', 'q', 'w', 'e', 'a', 's', 'd', 'z', 'c', '4', 'r', 'f', 'v']
        var keyMap = new Map();
        

        document.addEventListener('keydown', (event)=>{
            const pressedKey = event.key

            runner = true

            // while(true){
            this.fetchProgramCounterInstruction();
            this.decodeAndExecuteInstruction();
            render_pixel_buffer(this.pixelBuffer)
            // }
            // console.log("KeyDown: " + pressedKey)

        }, false)

        document.addEventListener('keyup', (event)=>{
            const releasedKey = event.key

            // console.log("KeyUp: " + releasedKey)

        }, false)
        
    }

    //Instruction Functions
    SYS(){ console.log("SYS call does nothing") }
    CLS(){this.pixelBuffer.fill(false)} //00E0
    RET(){this.programCounter = this.stack[this.stack.length - 1]; this.stack.pop(); this.stackPointer--} // 00EE
    JP(){this.programCounter = 0x0FFF & this.currentOpcode} //1nnn
    CALL(){this.stack.push(this.programCounter); this.programCounter = 0x0FFF & this.currentOpcode; this.stackPointer++} //2nnn
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

        if (this.registers[x] > this.registers[y]) this.registers[chip8.FLAG_REGISTER] = 1
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
        var y = (0x00F0 & this.currentOpcode) >>> 4
        
        if (this.registers[x] !== this.registers[y]){
            this.programCounter += 2
        }
    }
    LD_ia(){
        var addr = 0x0FFF & this.currentOpcode
        this.indexRegister = addr;
    }
    JP_ra(){
        this.programCounter = (0x0FFF & this.currentOpcode) + this.registers[0]
    } //1nnn
    RND_rb(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        this.registers[x] = chip8.randomByteGenerator() & (0x00FF & this.currentOpcode)
    }
    DRW_rr(){
        var num_bytes = 0x000F & this.currentOpcode
        var x_draw_register = (0x0F00 & this.currentOpcode) >>> 8
        var y_draw_register = (0x00F0 & this.currentOpcode) >>> 4
        this.registers[chip8.FLAG_REGISTER] = 0

        var x_draw_pixel = this.registers[x_draw_register] % chip8.PIXEL_BUFFER_WIDTH
        var y_draw_pixel = this.registers[y_draw_register] % chip8.PIXEL_BUFFER_HEIGHT

        var y_pixel_offset = 0
        for(var i = 0; i < num_bytes; i++){
            var display_value = this.memory[this.indexRegister + i]
            var x_pixel_offset = 0

            var y_pixel_pos = (y_draw_pixel + y_pixel_offset) % chip8.PIXEL_BUFFER_HEIGHT
            var bit_mask = 0x80
            
            for(var k = 7; k >= 0; k--){
                var display_bit = (bit_mask & display_value) >>> k
                
                var x_pixel_pos = (x_draw_pixel + x_pixel_offset) % chip8.PIXEL_BUFFER_WIDTH

                if(this.pixelBuffer[x_pixel_pos][y_pixel_pos] == 1 && display_bit == 1){
                    this.registers[chip8.FLAG_REGISTER] = 1
                }

                // console.log(x_pixel_pos)
                // console.log(y_pixel_pos)
                this.pixelBuffer[x_pixel_pos][y_pixel_pos] ^= display_bit

                x_pixel_offset++
                bit_mask >>>= 1
            }

            y_pixel_offset++
        }

    }
    SKP_r(){
        var x = (0x0F00 & this.currentOpcode) >>> 8

        if(this.inputKeys[x] == true){
            pc += 2
        }

    }
    SKNP_r(){
        var x = (0x0F00 & this.currentOpcode) >>> 8

        if(this.inputKeys[x] == false){
            pc += 2
        }
    }
    LD_rd(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        this.registers[x] = this.delayTimer
    } // Fx07 - LD Vx, DT
    LD_rk(){
        console.log("Load key press into register not implemented yet")
    }
    LD_dr(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        this.delayTimer = this.registers[x]

        while(this.delayTimer != 0){
            // Do Delay at specified time rate
            this.delayTimer--
        }
    } // Fx15 - LD DT, Vx
    LD_sr(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        this.soundTimer = this.registers[x]

        while(this.soundTimer != 0){
            // Play Sound at 60 times per second
            this.soundTimer--
        }
    }
    ADD_ir(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        this.indexRegister = (this.indexRegister+ this.registers[x]) & 0xFF
    }
    LD_fr(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        this.indexRegister = c8.FONT_START_OFFSET + (x * 0x5)
    }
    LD_br(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        var bcd_val = this.registers[x]

        var least_significant_digit = bcd_val % 10
        var mid_significant_digit = ((bcd_val % 100) - least_significant_digit) / 10
        var most_significant_digit = ((bcd_val) - mid_significant_digit - least_significant_digit) / 100

        this.memory[this.indexRegister] = most_significant_digit
        this.memory[this.indexRegister + 1] = mid_significant_digit
        this.memory[this.indexRegister + 2] = least_significant_digit

    }
    LD_ar(){
        this.registers.forEach((element, index) => element = this.memory[this.indexRegister + index])
    }
    LD_ra(){
        this.registers.forEach((element, index) => this.memory[this.indexRegister + index] = element)
    }

    loadProgram(programBuffer){
        this.programCounter = chip8.PROGRAM_START

        programBuffer.forEach((value,index) => {
            this.memory[chip8.PROGRAM_START + index] = value
        })
    }

    resetMemory(){
        this.memory = new Array(chip8.MEMORY_SIZE).fill(0)
        this.loadFonts()
    }

    fetchProgramCounterInstruction(){
        let upperHalf = this.memory[this.programCounter] << 8
        let lowerHalf = this.memory[this.programCounter + 1]
        let opcode = upperHalf + lowerHalf

        this.programCounter += 2
        this.currentOpcode = opcode
        // console.log(this.programCounter)

        return opcode;
    }

    decodeAndExecuteInstruction(){
        console.log("Executing Opcode: " + '0x' + this.currentOpcode.toString(16))

        if(this.currentOpcode == 0x00E0){
            this.CLS()
        }
        else if(this.currentOpcode == 0x00EE) {
            this.RET()
        }
        else if( (0xF000 & this.currentOpcode) == 0x0000) {
            this.SYS()
        }
        else if( (0xF000 & this.currentOpcode) == 0x1000) {
            this.JP()
        }
        else if( (0xF000 & this.currentOpcode) == 0x2000) {
            this.CALL()
        }
        else if( (0xF000 & this.currentOpcode) == 0x3000) {
            this.SE_rb()
        }
        else if( (0xF000 & this.currentOpcode) == 0x4000) {
            this.SNE_rb()
        }
        else if( (0xF000 & this.currentOpcode) == 0x5000) {
            this.SE_rr()
        }
        else if( (0xF000 & this.currentOpcode) == 0x6000) {
            this.LD_rb()
        }
        else if( (0xF000 & this.currentOpcode) == 0x7000) {
            this.ADD_rb()
        }
        else if( (0xF00F & this.currentOpcode) == 0x8000) {
            this.LD_rr()
        }
        else if( (0xF00F & this.currentOpcode) == 0x8001) {
            this.OR_rr()
        }
        else if( (0xF00F & this.currentOpcode) == 0x8002) {
            this.AND_rr()
        }
        else if( (0xF00F & this.currentOpcode) == 0x8003) {
            this.XOR_rr()
        }
        else if( (0xF00F & this.currentOpcode) == 0x8004) {
            this.ADD_rr()
        }
        else if( (0xF00F & this.currentOpcode) == 0x8005) {
            this.SUB_rr()
        }
        else if( (0xF00F & this.currentOpcode) == 0x8006) {
            this.SHR_r()
        }
        else if( (0xF00F & this.currentOpcode) == 0x8007) {
            this.SUBN_rr()
        }
        else if( (0xF00F & this.currentOpcode) == 0x800E) {
            this.SHL_r()
        }
        else if( (0xF00F & this.currentOpcode) == 0x9000) {
            this.SNE_rr()
        }
        else if( (0xF000 & this.currentOpcode) == 0xA000) {
            this.LD_ia()
        }
        else if( (0xF000 & this.currentOpcode) == 0xB000) {
            this.JP_ra()
        }
        else if( (0xF000 & this.currentOpcode) == 0xC000) {
            this.RND_rb()
        }
        else if( (0xF000 & this.currentOpcode) == 0xD000) {
            this.DRW_rr()
        }
        else if( (0xF0FF & this.currentOpcode) == 0xE09E) {
            this.SKP_r()
        }
        else if( (0xF0FF & this.currentOpcode) == 0xE0A1) {
            this.SKNP_r()
        }
        else if( (0xF0FF & this.currentOpcode) == 0xF007) {
            this.LD_rd()
        }
        else if( (0xF0FF & this.currentOpcode) == 0xF00A) {
            this.LD_rk()
        }
        else if( (0xF0FF & this.currentOpcode) == 0xF015) {
            this.LD_dr()
        }
        else if( (0xF0FF & this.currentOpcode) == 0xF018) {
            this.LD_sr()
        }
        else if( (0xF0FF & this.currentOpcode) == 0xF01E) {
            this.ADD_ir()
        }
        else if( (0xF0FF & this.currentOpcode) == 0xF029) {
            this.LD_fr()
        }
        else if( (0xF0FF & this.currentOpcode) == 0xF033) {
            this.LD_br()
        }
        else if( (0xF0FF & this.currentOpcode) == 0xF055) {
            this.LD_ar()
        }
        else if( (0xF0FF & this.currentOpcode) == 0xF065) {
            this.LD_ra()
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
            // console.log(fileReader.result);
        
            let typedArray = new Uint8Array(fileReader.result)
            // console.log(typedArray)

            // let printArray = []
            // typedArray.forEach((value, index) => printArray.push('0x' + value.toString(16)))
            // console.log(printArray)

            c8.resetMemory()
            c8.loadProgram(typedArray)
            typedArray.forEach((value, index) => c8.memory[chip8.PROGRAM_START + index] = value)

            // console.log(c8.memory)
          };
    

    }, false)

}

var c8 = new chip8();
read_chip8_file_init(c8)

// c8.setCurrentOpcode = 0x6000
// c8.LD_rb()

// c8.setCurrentOpcode = 0x6100
// c8.LD_rb()

// c8.setCurrentOpcode = 0xA010
// c8.LD_ia()

// c8.setCurrentOpcode = 0xD015
// c8.DRW_rr()

// render_pixel_buffer(c8.pixelBuffer)

// console.log(c8.pixelBuffer)