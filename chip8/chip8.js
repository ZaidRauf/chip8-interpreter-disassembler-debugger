"use strict"

class chip8{

    static get NUM_REGISTERS() { 
        return 0x10;
    }

    static get MEMORY_SIZE() { 
        return 0x1000;
    }

    static get STACK_SIZE() { 
        return 0x10;
    }

    static get PIXEL_BUFFER_WIDTH() { 
        return 64;
    }

    static get PIXEL_BUFFER_HEIGHT() { 
        return 32;
    }

    // Can be loaded in anywhere is arbitrary
    static get DIGIT_START_OFFSET() { 
        return 0x10;
    }

    static get FLAG_REGISTER() { 
        return 0xF;
    }

    static get NUM_KEYS() { 
        return 0x10;
    }

    static get PROGRAM_START() { 
        return 0x200;
    }


    static get TIMER_WAIT_TIME() { 
        return 16.7;
    }

    static randomByteGenerator(){
        return Math.floor(Math.random() * 256);
    }

    static getXArgument(opcode){
        return (0x0F00 & opcode) >>> 8;
    }

    static getYArgument(opcode){
        return (0x00F0 & opcode) >>> 4;
    }

    static getKKArgument(opcode){
        return 0x00FF & opcode;
    }

    static getNNNArgument(opcode){
        return 0x0FFF & opcode;
    }

    loadFonts(){
        let digitSprites =
        [   0xF0, 0x90, 0x90, 0x90, 0xF0,
            0x20, 0x60, 0x20, 0x20, 0x70,
            0xF0, 0x10, 0xF0, 0x80, 0xF0,
            0xF0, 0x10, 0xF0, 0x10, 0xF0,
            0x90, 0x90, 0xF0, 0x10, 0x10,
            0xF0, 0x80, 0xF0, 0x10, 0xF0,
            0xF0, 0x80, 0xF0, 0x90, 0xF0,
            0xF0, 0x10, 0x20, 0x40, 0x40,
            0xF0, 0x90, 0xF0, 0x90, 0xF0,
            0xF0, 0x90, 0xF0, 0x10, 0xF0,
            0xF0, 0x90, 0xF0, 0x90, 0x90,
            0xE0, 0x90, 0xE0, 0x90, 0xE0,
            0xF0, 0x80, 0x80, 0x80, 0xF0,
            0xE0, 0x90, 0x90, 0x90, 0xE0,
            0xF0, 0x80, 0xF0, 0x80, 0xF0,
            0xF0, 0x80, 0xF0, 0x80, 0x80 ]

        digitSprites.forEach((element, index) => this.memory[chip8.DIGIT_START_OFFSET + index] = element);
        
    }

    constructor() {
        // Instantiates and initializes registers V0, V1, V2, ... VF
        this.registers = new Array(chip8.NUM_REGISTERS).fill(0);

        // Instantiates and initializes memory
        this.memory = new Array(chip8.MEMORY_SIZE).fill(0);

        // Pixel Buffer Init
        this.pixelBuffer = new Array(chip8.PIXEL_BUFFER_HEIGHT);

        for(let x = 0; x < chip8.PIXEL_BUFFER_WIDTH; x++){
            this.pixelBuffer[x] = new Array(chip8.PIXEL_BUFFER_WIDTH).fill(0);
        }
            

        this.stack = [];
        this.indexRegister = 0;
        this.programCounter = 0;
        this.stackPointer = -1; //Is there any need for a stack pointer if im just using .length?
        this.delayTimer = 0;
        this.soundTimer = 0;
        this.currentOpcode = 0;

        this.awaitingBlockingKeypress = false;

        this.inputKeys = Array(chip8.NUM_KEYS).fill(false);

        this.keyArr = ['KeyX', 'Digit1', 'Digit2', 'Digit3', 'KeyQ', 'KeyW', 'KeyE', 'KeyA', 'KeyS', 'KeyD', 'KeyZ', 'KeyC', 'Digit4', 'KeyR', 'KeyF', 'KeyV'];
        this.keyMap = new Map();
        
        this.keyArr.forEach((value, index) => {
            this.keyMap.set(value, index);
        })

        this.loadFonts();

        this.inputListener();

    }

    reset(){
        // Instantiates and initializes registers V0, V1, V2, ... VF
        this.registers = new Array(chip8.NUM_REGISTERS).fill(0);

        // Instantiates and initializes memory
        this.memory = new Array(chip8.MEMORY_SIZE).fill(0);

        // Pixel Buffer Init
        this.pixelBuffer = new Array(chip8.PIXEL_BUFFER_HEIGHT);

        for(let x = 0; x < chip8.PIXEL_BUFFER_WIDTH; x++){
            this.pixelBuffer[x] = new Array(chip8.PIXEL_BUFFER_WIDTH).fill(0);
        }
            

        this.stack = [];
        this.indexRegister = 0;
        this.programCounter = 0;
        this.stackPointer = -1; //Is there any need for a stack pointer if im just using .length?
        this.delayTimer = 0;
        this.soundTimer = 0;
        this.currentOpcode = 0;

        this.loadFonts();
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
            const pressedKey = event.code;

            let keyValue = this.keyMap.get(pressedKey);

            if(keyValue !== undefined){
                this.pressKey = keyValue;
            }

        }, false)

        document.addEventListener('keyup', (event)=>{
            const releasedKey = event.code;

            let keyValue = this.keyMap.get(releasedKey);

            if(keyValue !== undefined){
                this.releaseKey = keyValue;
            }

        }, false)
        
    }

    //Instruction Functions
    SYS(){ return; }
    CLS(){

        for(let x = 0; x < chip8.PIXEL_BUFFER_WIDTH; x++){

            for(let y = 0; y < chip8.PIXEL_BUFFER_HEIGHT; y++){

                this.pixelBuffer[x][y] = 0;

            }
            
        }
    } //00E0
    RET(){this.programCounter = this.stack[this.stack.length - 1]; this.stack.pop(); this.stackPointer--} // 00EE
    JP(){this.programCounter = chip8.getNNNArgument(this.currentOpcode)} //1nnn
    CALL(){this.stack.push(this.programCounter); this.programCounter = chip8.getNNNArgument(this.currentOpcode); this.stackPointer++} //2nnn
    SE_rb(){
        let x = chip8.getXArgument(this.currentOpcode)
        let kk = chip8.getKKArgument(this.currentOpcode)
        
        if (this.registers[x] === kk){
            this.programCounter += 2
        }
    }
    SNE_rb(){
        let x = chip8.getXArgument(this.currentOpcode)
        let kk = chip8.getKKArgument(this.currentOpcode)
        
        if (this.registers[x] !== kk){
            this.programCounter += 2
        }
    }
    SE_rr(){
        let x = chip8.getXArgument(this.currentOpcode)
        let y = chip8.getYArgument(this.currentOpcode)
        
        if (this.registers[x] === this.registers[y]){
            this.programCounter += 2
        }
    }
    LD_rb(){
        let x = chip8.getXArgument(this.currentOpcode)
        let kk = chip8.getKKArgument(this.currentOpcode)
        this.registers[x] = kk;
    }
    ADD_rb(){
        // Do i need to set the carry flag? Seems no
        let x = chip8.getXArgument(this.currentOpcode)
        let kk = chip8.getKKArgument(this.currentOpcode)
        this.registers[x] = (this.registers[x] + kk) & 0x00FF;
    }
    LD_rr(){
        let x = chip8.getXArgument(this.currentOpcode)
        let y = chip8.getYArgument(this.currentOpcode)

        this.registers[x] = this.registers[y]
    }
    OR_rr(){
        let x = chip8.getXArgument(this.currentOpcode)
        let y = chip8.getYArgument(this.currentOpcode)

        this.registers[x] = this.registers[x] | this.registers[y]

    }
    AND_rr(){
        let x = chip8.getXArgument(this.currentOpcode)
        let y = chip8.getYArgument(this.currentOpcode)

        this.registers[x] = this.registers[x] & this.registers[y]

    }
    XOR_rr(){
        let x = chip8.getXArgument(this.currentOpcode)
        let y = chip8.getYArgument(this.currentOpcode)

        this.registers[x] = this.registers[x] ^ this.registers[y]
    }
    ADD_rr(){
        let x = chip8.getXArgument(this.currentOpcode)
        let y = chip8.getYArgument(this.currentOpcode)

        this.registers[x] += this.registers[y]

        if (this.registers[x] > 255) this.registers[chip8.FLAG_REGISTER] = 1
        else this.registers[chip8.FLAG_REGISTER] = 0

        this.registers[x] = this.registers[x] & 0xFF
    }
    SUB_rr(){
        let x = chip8.getXArgument(this.currentOpcode)
        let y = chip8.getYArgument(this.currentOpcode)

        if (this.registers[x] > this.registers[y]) this.registers[chip8.FLAG_REGISTER] = 1
        else this.registers[chip8.FLAG_REGISTER] = 0

        this.registers[x] = this.registers[x] - this.registers[y]
        this.registers[x] = this.registers[x] & 0xFF
    }
    SHR_r(){
        let x = chip8.getXArgument(this.currentOpcode)
        let y = chip8.getYArgument(this.currentOpcode)

        this.registers[chip8.FLAG_REGISTER] = this.registers[x] & 0x1

        this.registers[x] = (this.registers[x] >>> 1) & 0xFF
    }
    SUBN_rr(){
        let x = chip8.getXArgument(this.currentOpcode)
        let y = chip8.getYArgument(this.currentOpcode)

        if (this.registers[y] > this.registers[x]) this.registers[chip8.FLAG_REGISTER] = 1
        else this.registers[chip8.FLAG_REGISTER] = 0

        this.registers[x] = this.registers[y] - this.registers[x]
        this.registers[x] = this.registers[x] & 0xFF
    }
    SHL_r(){
        let x = chip8.getXArgument(this.currentOpcode)
        let y = chip8.getYArgument(this.currentOpcode)

        this.registers[chip8.FLAG_REGISTER] = (this.registers[x] & 0x80) >>> 7;

        this.registers[x] = (this.registers[x] << 1) & 0xFF;
    }
    SNE_rr(){
        let x = chip8.getXArgument(this.currentOpcode)
        let y = chip8.getYArgument(this.currentOpcode)
        
        if (this.registers[x] !== this.registers[y]){
            this.programCounter += 2;
        }
    }
    LD_ia(){
        let addr = chip8.getNNNArgument(this.currentOpcode);
        this.indexRegister = addr;
    }
    JP_ra(){
        this.programCounter = chip8.getNNNArgument(this.currentOpcode) + this.registers[0];
    } //1nnn
    RND_rb(){
        let x = chip8.getXArgument(this.currentOpcode)
        this.registers[x] = chip8.randomByteGenerator() & chip8.getKKArgument(this.currentOpcode)
    }
    DRW_rr(){
        let num_bytes = 0x000F & this.currentOpcode
        let x_draw_register = chip8.getXArgument(this.currentOpcode)
        let y_draw_register = (0x00F0 & this.currentOpcode) >>> 4
        this.registers[chip8.FLAG_REGISTER] = 0

        let x_draw_pixel = this.registers[x_draw_register] % chip8.PIXEL_BUFFER_WIDTH
        let y_draw_pixel = this.registers[y_draw_register] % chip8.PIXEL_BUFFER_HEIGHT

        let y_pixel_offset = 0
        for(let i = 0; i < num_bytes; i++){
            let display_value = this.memory[this.indexRegister + i]
            let x_pixel_offset = 0

            let y_pixel_pos = (y_draw_pixel + y_pixel_offset) % chip8.PIXEL_BUFFER_HEIGHT
            let bit_mask = 0x80
            
            for(let k = 7; k >= 0; k--){
                let display_bit = (bit_mask & display_value) >>> k
                
                let x_pixel_pos = (x_draw_pixel + x_pixel_offset) % chip8.PIXEL_BUFFER_WIDTH

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
        let x = chip8.getXArgument(this.currentOpcode)
        let x_key_value = this.registers[x]

        if(this.inputKeys[x_key_value]){
            this.programCounter += 2
        }

    }
    SKNP_r(){
        let x = chip8.getXArgument(this.currentOpcode)
        let x_key_value = this.registers[x]

        if(!this.inputKeys[x_key_value]){
            this.programCounter += 2
        }
    }
    LD_rd(){
        let x = chip8.getXArgument(this.currentOpcode)
        this.registers[x] = this.delayTimer
    } // Fx07 - LD Vx, DT
    async LD_rk(){
        this.awaitingBlockingKeypress = true

        let x = chip8.getXArgument(this.currentOpcode)
        await this.blockingKeyPress(x, this)

        this.awaitingBlockingKeypress = false
    }

    blockingKeyPress(x, c8){
        return new Promise ((resolve) => {
            
            document.addEventListener('keydown', blockingKeyListener);
            function blockingKeyListener(e) {
                let keyValue = c8.keyMap.get(e.code)

                if (keyValue !== undefined) {
                    document.removeEventListener('keydown', blockingKeyListener);
                    c8.registers[x] = keyValue
                    resolve();
                }

                else if (e.keyCode === -1){
                    document.removeEventListener('keydown', blockingKeyListener);
                    resolve();
                }

            }
        
        })
    }
    async LD_dr(){
        let x = chip8.getXArgument(this.currentOpcode)
        this.delayTimer = this.registers[x]

        while(this.delayTimer != 0){
            // Do Delay at specified time rate
            this.delayTimer--
            await this.sleep(chip8.TIMER_WAIT_TIME);
        }
    } // Fx15 - LD DT, Vx
    async LD_sr(){
        let x = chip8.getXArgument(this.currentOpcode)
        this.soundTimer = this.registers[x]

        while(this.soundTimer != 0){
            // Play Sound at 60 times per second
            this.soundTimer--
            await this.sleep(chip8.TIMER_WAIT_TIME);
        }

    }
    ADD_ir(){
        let x = chip8.getXArgument(this.currentOpcode)
        this.indexRegister = (this.indexRegister + this.registers[x]) & 0xFFFF
    }
    LD_fr(){
        let x = chip8.getXArgument(this.currentOpcode)
        this.indexRegister = chip8.DIGIT_START_OFFSET + (this.registers[x] * 0x5)
    }
    LD_br(){
        let x = chip8.getXArgument(this.currentOpcode)
        let bcd_val = this.registers[x]

        let least_significant_digit = bcd_val % 10
        let mid_significant_digit = ((bcd_val % 100) - least_significant_digit) / 10
        let most_significant_digit = ((bcd_val) - ((bcd_val % 100) - least_significant_digit) - least_significant_digit) / 100

        this.memory[this.indexRegister] = most_significant_digit
        this.memory[this.indexRegister + 1] = mid_significant_digit
        this.memory[this.indexRegister + 2] = least_significant_digit

    }
    LD_ar(){
        let x = chip8.getXArgument(this.currentOpcode)

        for(let k = 0; k <= x; k++){
            this.memory[this.indexRegister + k] = this.registers[k]           
        }
    }
    LD_ra(){
        let x = chip8.getXArgument(this.currentOpcode)

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
                    default:
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
                    default:
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

                    default:
                        break;
                }
                break;

            default:
                break;
        }

    }

}
