"use strict"

const X_MASK = 0x0F00
const Y_MASK = 0x00F0
const NNN_mask = 0x0FFF
const KK_mask = 0x00FF

function getXArg(opcode){
    return 'V' + ((X_MASK & opcode) >>> 8).toString(16).toUpperCase()
}

function getYArg(opcode){
    return 'V' + ((Y_MASK & opcode) >>> 4).toString(16).toUpperCase()
}

function getNNNArg(opcode){
    console.log()
    return '0x' + (NNN_mask & opcode).toString(16).toUpperCase()
}

function getKKArg(opcode){
    return '0x' + (KK_mask & opcode).toString(16).toUpperCase()
}

function disassembleProgram(programArray){

    let instructions = []

    for(let k = 0; k < programArray.length; k += 2){
        let upperHalf = programArray[k] << 8
        let lowerHalf = programArray[k + 1]
        let opcode = upperHalf + lowerHalf

        instructions.push(dissasembleInstruction(opcode))
    }

    return instructions;
}

function dissasembleInstruction(opcode){
    let opcodePrefix = opcode & 0xF000;

    switch(opcodePrefix) {
        case(0x0000):
            switch(opcode){
                case(0x00E0):
                    return 'CLS';

                case(0x00EE):
                    return 'RET';

                default:
                    return 'SYS ' + getNNNArg(opcode);
            }
        case(0x1000):
            return 'JP ' + getNNNArg(opcode);

        case(0x2000):
            return 'CALL ' + getNNNArg(opcode);

        case(0x3000):
            return 'SE ' + getXArg(opcode) + ', ' + getKKArg(opcode);

        case(0x4000):
            return 'SNE ' + getXArg(opcode) + ', ' + getKKArg(opcode);

        case(0x5000):
            return 'SE ' + getXArg(opcode) + ', ' + getYArg(opcode);

        case(0x6000):
            return 'LD ' + getXArg(opcode) + ', ' + getKKArg(opcode);
        case(0x7000):
            return 'ADD ' + getXArg(opcode) + ', ' + getKKArg(opcode);
            
        case(0x8000):
            let binaryOpSuffix = opcode & 0xF;

            switch(binaryOpSuffix){
                case(0x0):
                    return 'LD ' + getXArg(opcode) + ', ' + getYArg(opcode);

                case(0x1):
                    return 'OR ' + getXArg(opcode) + ', ' + getYArg(opcode);

                case(0x2):
                    return 'AND ' + getXArg(opcode) + ', ' + getYArg(opcode);

                case(0x3):
                    return 'XOR ' + getXArg(opcode) + ', ' + getYArg(opcode);

                case(0x4):
                    return 'ADD ' + getXArg(opcode) + ', ' + getYArg(opcode);

                case(0x5):
                    return 'SUB ' + getXArg(opcode) + ', ' + getYArg(opcode);

                case(0x6):
                    return 'SHR ' + getXArg(opcode)

                case(0x7):
                    return 'SUBN ' + getXArg(opcode) + ', ' + getYArg(opcode);

                case(0xE):
                    return 'SHL ' + getXArg(opcode)

                default:
                    return 'UNK'
            }
            
            break;
        case(0x9000):
            return 'SNE ' + getXArg(opcode) + ', ' + getYArg(opcode);

        case(0xA000):
            return 'LD ' + 'I' + ', ' + getNNNArg(opcode);

        case(0xB000):
            return 'JP ' + 'V0' + ', ' + getNNNArg(opcode)

        case(0xC000):
            return 'RND ' + getXArg(opcode) + ', ' + getKKArg(opcode);

        case(0xD000):
            return 'DRW ' + getXArg(opcode) + ', ' + getYArg(opcode) + ', 0x' + (opcode & 0x000F).toString(16).toUpperCase();

        case(0xE000):
            let skpOpcodeSuffix = opcode & 0x00FF;

            switch(skpOpcodeSuffix){
                case(0x9E):
                    return 'SKP ' + getXArg(opcode)

                case(0xA1):
                    return 'SKNP ' + getXArg(opcode)

                default:
                    return 'UNK'
            }

            break;
        case(0xF000):
            let auxOpcodeSuffix = opcode & 0x00FF;

            switch(auxOpcodeSuffix){
                case(0x07):
                    return 'LD ' + getXArg(opcode) + ', DT';

                case(0x0A):
                    return 'LD ' + getXArg(opcode) + ', K';

                case(0x15):
                    return 'LD DT, ' + getXArg(opcode);

                case(0x18):
                    return 'LD ST, ' + getXArg(opcode);

                case(0x1E):
                    return 'ADD I, ' + getXArg(opcode);

                case(0x29):
                    return 'LD F, ' + getXArg(opcode);

                case(0x33):
                    return 'LD B, ' + getXArg(opcode);

                case(0x55):
                    return 'LD [I], ' + getXArg(opcode);

                case(0x65):
                    return 'LD [I], ' + getXArg(opcode);

                default:
                    return 'UNK'
            }
            break;

        default:
            return 'UNK'
    }

}
