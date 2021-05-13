canvas_init(1024)
var c8 = new chip8();
read_chip8_file_init(c8)
initExecutionButtons(c8)
initSelectDropdown(c8)
initColorPicker(c8)
initRegisterInfo(c8)
initRunOnLoad()
test(c8)

function test (c8){
    document.addEventListener('keydown', (event)=>{
        const pressedKey = event.code
      
        if(pressedKey === 'KeyM'){
            stepProgram(c8)    
        }
      
      }, false)
}