"use strict"

var c8 = new chip8();

canvas_init(1024);

read_chip8_file_init(c8);

initExecutionButtons(c8);

initSelectDropdown(c8);

initColorPicker(c8);

initRegisterInfo(c8);

initRunOnLoad();

initDebuggerInputs(c8);
