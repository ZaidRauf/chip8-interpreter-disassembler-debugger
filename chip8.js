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

    static get NUM_KEYS() { 
        return 0x10
    }

    static get PROGRAM_START() { 
        return 0x200
    }


    static get TIMER_WAIT_TIME() { 
        return 16.7
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

        this.awaitingBlockingKeypress = false

        this.inputKeys = Array(chip8.NUM_KEYS).fill(false);

        this.keyArr = ['x', '1', '2', '3', 'q', 'w', 'e', 'a', 's', 'd', 'z', 'c', '4', 'r', 'f', 'v']
        this.keyMap = new Map();
        
        this.keyArr.forEach((value, index) => {
            this.keyMap.set(value, index)
        })

        this.loadFonts();

        this.inputListener();

    }

    reset(){
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

        this.loadFonts()
    }

    set setCurrentOpcode(newOpcode){
        this.currentOpcode = newOpcode;
    }

    set pressKey(key){
        this.inputKeys[key] = true;
    }

    set releaseKey(key){
        this.inputKeys[key] = false;
    }

    inputListener(){

        document.addEventListener('keydown', (event)=>{
            const pressedKey = event.key

            let keyValue = this.keyMap.get(pressedKey)

            if(keyValue !== undefined){
                this.pressKey = keyValue
            }

            else if(pressedKey === 'm'){
                this.runProgramCycle()
                render_pixel_buffer(this.pixelBuffer)    
            }

        }, false)

        document.addEventListener('keyup', (event)=>{
            const releasedKey = event.key

            let keyValue = this.keyMap.get(releasedKey)

            if(keyValue !== undefined){
                this.releaseKey = keyValue
            }

        }, false)
        
    }

    //Instruction Functions
    SYS(){ return }
    CLS(){

        for(var x = 0; x < chip8.PIXEL_BUFFER_WIDTH; x++){

            for(var y = 0; y < chip8.PIXEL_BUFFER_HEIGHT; y++){

                this.pixelBuffer[x][y] = 0

            }
            
        }
    } //00E0
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

        this.registers[chip8.FLAG_REGISTER] = this.registers[x] & 0x1

        this.registers[x] = (this.registers[x] >>> 1) & 0xFF
    }
    SUBN_rr(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        var y = (0x00F0 & this.currentOpcode) >>> 4

        if (this.registers[y] > this.registers[x]) this.registers[chip8.FLAG_REGISTER] = 1
        else this.registers[chip8.FLAG_REGISTER] = 0

        this.registers[x] = this.registers[y] - this.registers[x]
        this.registers[x] = this.registers[x] & 0xFF
    }
    SHL_r(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        var y = (0x00F0 & this.currentOpcode) >>> 4

        this.registers[chip8.FLAG_REGISTER] = (this.registers[x] & 0x80) >>> 7 

        this.registers[x] = (this.registers[x] << 1) & 0xFF
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

                if(this.pixelBuffer[x_pixel_pos][y_pixel_pos] === 1 && display_bit === 1){
                    this.registers[chip8.FLAG_REGISTER] = 1
                }

                this.pixelBuffer[x_pixel_pos][y_pixel_pos] ^= display_bit

                x_pixel_offset++
                bit_mask >>>= 1
            }

            y_pixel_offset++
        }

    }
    SKP_r(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        var x_key_value = this.registers[x]

        if(this.inputKeys[x_key_value]){
            this.programCounter += 2
        }

    }
    SKNP_r(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        var x_key_value = this.registers[x]

        if(!this.inputKeys[x_key_value]){
            this.programCounter += 2
        }
    }
    LD_rd(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        this.registers[x] = this.delayTimer
    } // Fx07 - LD Vx, DT
    async LD_rk(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        await this.blockingKeyPress(x, this)
    }

    blockingKeyPress(x, c8){
        return new Promise ((resolve) => {
            
            document.addEventListener('keydown', blockingKeyListener);
            function blockingKeyListener(e) {
                var keyValue = c8.keyMap.get(e.key)
                // console.log(e.keyCode)

                if (keyValue !== undefined) {
                    document.removeEventListener('keydown', blockingKeyListener);
                    c8.registers[x] = keyValue
                    resolve();
                }

            }
        
        })
    }
    async LD_dr(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        this.delayTimer = this.registers[x]

        while(this.delayTimer != 0){
            // Do Delay at specified time rate
            this.delayTimer--
            await this.sleep(chip8.TIMER_WAIT_TIME);
        }
    } // Fx15 - LD DT, Vx
    async LD_sr(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        this.soundTimer = this.registers[x]

        while(this.soundTimer != 0){
            // Play Sound at 60 times per second
            this.soundTimer--
            await this.sleep(chip8.TIMER_WAIT_TIME);
        }
    }
    ADD_ir(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        this.indexRegister = (this.indexRegister + this.registers[x]) & 0xFFFF
    }
    LD_fr(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        this.indexRegister = chip8.FONT_START_OFFSET + (this.registers[x] * 0x5)
    }
    LD_br(){
        var x = (0x0F00 & this.currentOpcode) >>> 8
        var bcd_val = this.registers[x]

        var least_significant_digit = bcd_val % 10
        var mid_significant_digit = ((bcd_val % 100) - least_significant_digit) / 10
        var most_significant_digit = ((bcd_val) - ((bcd_val % 100) - least_significant_digit) - least_significant_digit) / 100

        this.memory[this.indexRegister] = most_significant_digit
        this.memory[this.indexRegister + 1] = mid_significant_digit
        this.memory[this.indexRegister + 2] = least_significant_digit

    }
    LD_ar(){
        var x = (0x0F00 & this.currentOpcode) >>> 8

        for(let k = 0; k <= x; k++){
            this.memory[this.indexRegister + k] = this.registers[k]           
        }
    }
    LD_ra(){
        var x = (0x0F00 & this.currentOpcode) >>> 8

        for(let k = 0; k <= x; k++){
            this.registers[k] = this.memory[this.indexRegister + k]
        }

    }

    async runProgramCycle(){
        this.fetchProgramCounterInstruction()
        this.programCounter += 2
        await this.decodeAndExecuteInstruction()
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

        this.currentOpcode = opcode

        return opcode;
    }

    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async decodeAndExecuteInstruction(){
        let opcodePrefix = this.currentOpcode & 0xF000;

        switch(opcodePrefix) {
            case(0x0000):
                switch(this.currentOpcode){
                    case(0x00E0):
                        this.CLS();
                        break;

                    case(0x00EE):
                        this.RET();
                        break;

                    default:
                        this.SYS();
                        break;
                }
                break;
            case(0x1000):
                this.JP();
                break;
            case(0x2000):
                this.CALL();
                break;
            case(0x3000):
                this.SE_rb();
                break;
            case(0x4000):
                this.SNE_rb();
                break;
            case(0x5000):
                this.SE_rr();
                break;
            case(0x6000):
                this.LD_rb();
                break;
            case(0x7000):
                this.ADD_rb();
                break;
            case(0x8000):
                let binaryOpSuffix = this.currentOpcode & 0xF;

                switch(binaryOpSuffix){
                    case(0x0):
                        this.LD_rr();
                        break;
                    case(0x1):
                        this.OR_rr()
                        break;
                    case(0x2):
                        this.AND_rr()
                        break;
                    case(0x3):
                        this.XOR_rr()
                        break;
                    case(0x4):
                        this.ADD_rr()
                        break;
                    case(0x5):
                        this.SUB_rr()
                        break;
                    case(0x6):
                        this.SHR_r()
                        break;
                    case(0x7):
                        this.SUBN_rr()
                        break;
                    case(0xE):
                        this.SHL_r()
                        break; 
                }
                
                break;
            case(0x9000):
                this.SNE_rr()
                break;
            case(0xA000):
                this.LD_ia()
                break;
            case(0xB000):
                this.JP_ra()
                break;
            case(0xC000):
                this.RND_rb();
                break;
            case(0xD000):
                this.DRW_rr();
                break;
            case(0xE000):
                let skpOpcodeSuffix = this.currentOpcode & 0x00FF;

                switch(skpOpcodeSuffix){
                    case(0x9E):
                        this.SKP_r()
                        break;
                    case(0xA1):
                        this.SKNP_r()
                        break;
                }

                break;
            case(0xF000):
                let auxOpcodeSuffix = this.currentOpcode & 0x00FF;

                switch(auxOpcodeSuffix){
                    case(0x07):
                        this.LD_rd()
                        break;
                    case(0x0A):
                        await this.LD_rk()
                        break;
                    case(0x15):
                        await this.LD_dr()
                        break;
                    case(0x18):
                        await this.LD_sr()
                        break;
                    case(0x1E):
                        this.ADD_ir();
                        break;
                    case(0x29):
                        this.LD_fr()
                        break;
                    case(0x33):
                        this.LD_br()
                        break;
                    case(0x55):
                        this.LD_ar()
                        break;
                    case(0x65):
                        this.LD_ra();
                        break;
                }
                break;

            default:
                break;
        }

    }

}
