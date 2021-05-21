# CHIP-8 Interpreter, Disassembler and Debugger
A JavaScript based CHIP-8 Interpreter, Disassembler and Debugger.

## Live Application

**Photosensitivity Warning:** Many CHIP-8 programs exhibit a flickering effect due to the way they are created and how they operate by clearing and redrawing the screen, so please be wary of this if you are an individual who experiences photosensitivity.

[Check out the live application here](https://zaidrauf.github.io/chip8/)

## Features
- Interprets and executes CHIP-8 programs
- Can load your own CHIP-8 progarms into the application or run one of the pre-loaded programs
- Displays graphics in the browser using the HTML Canvas API
- Provides debugging tools such as real time register and stack information
- Pause, step through, and resume your program at any point during it's execution
- Can add breakpoints that pause program execution at specific points in the program
- Can choose a custom background and foreground colors for the CHIP-8 interpreter
- Dissasembles the currently loaded CHIP-8 program and displays instructions in a human readable format

## Motivation
Wanting to learn more about how I could build an emulator in the future, many online sources suggested starting with CHIP-8 interpreter as an initial stepping stone in emulator development which was my main motivation for pursuing this project. I chose to go with JavaScript to learn a bit more about the language as I have not had the oppporuntity to use it during my university classes. As I was building the emulator, I wanted to add some more features other than just being able to run CHIP-8 programs, hence why I added some debugging features such as breakpoints, disassembly, and pausing/stepping through programs. Through this project I gained a deeper understanding of programming for the browser, lower level computer systems, and emulation.

## Instructions
- Choose ROM from dropdown menu
- Change the pixel and background colors with the color selection tools
- Scroll through stack to see all currently pushed Program Counters
- While Running:
    - Pause the current program with the 'Pause Execution' button or by hitting 'O'
    - Instruction about to be executed is highlighted in green
    - If a breakpoint is hit while a ROM is executing the program will pause
- While paused:
    - Step through ROM by pressing the 'Step Execution' Button or 'I' 
    - Continue execution by pressing the 'Start Execution' Button or 'U' 
    - Set breakpoints by clicking an instruction, it will be highlighted red
    - Remove breakpoints by clicking a red highlighted instruction
    - Can freely scroll through instruction list
- Uncheck 'Run On Load' if you don't want ROM execution to begin immediately

## Notes
- CHIP-8 Programs exhibit a flickering effect, this is expected as programs worked by constantly clearing and re-drawing the screen

## Running Locally
1. Install any simple HTTP webserver of your choice
    - [Suggested application](https://www.npmjs.com/package/local-web-server)
2. Start the webserver in the directory of the 'index.html' file for the CHIP-8 applciation
3. Access the CHIP-8 application from your browser 

## References
- [CHIP‐8 Technical Reference](https://github.com/mattmikolay/chip-8/wiki/CHIP%E2%80%908-Technical-Reference) by Matthew Mikolay
- [Chip-8 Technical Reference](http://devernay.free.fr/hacks/chip8/C8TECH10.HTM) by Cowgod

### ROM Authors
- Maze - [David Winter](http://www.pong-story.com/chip8/)
- Pong - [Paul Vervalin, 1990](https://github.com/kripod/chip8-roms/blob/master/games/Pong%20%5BPaul%20Vervalin%2C%201990%5D.ch8)
- Connect 4 - [David Winter](http://www.pong-story.com/chip8/)
- Tic-Tac-Toe - [David Winter](http://www.pong-story.com/chip8/)
- Tetris - [David Winter](http://www.pong-story.com/chip8/)
- Keypad Test - [Hap](https://github.com/loktar00/chip8/blob/master/roms/Keypad%20Test%20%5BHap%2C%202006%5D.ch8)
- Sierpinski - [Sergey Naydenov](https://github.com/kripod/chip8-roms/blob/master/demos/Sierpinski%20%5BSergey%20Naydenov%2C%202010%5D.ch8)

### Referenced Interpreters
Note: Didn't really look focus on their code, mainly used these implementations to see how mine compared, look for ROMs these emulators used, looked for general technical details surrounding their emulators, and looked for inspiration in the features they implemented. 
- [Chip8.js](https://taniarascia.github.io/chip8/) By Tania Rascia 
- [CHIP-8 Emulator](https://austinmorlan.com/posts/chip8_emulator/) By Austin Morlan
- [uni-chip8](https://github.com/eth-p/uni-chip8) By Team CHIPotle
