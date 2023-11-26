/* eslint no-undef: "OFF", no-unused-vars: "OFF" */

import { Csound } from '@csound/browser';
import csoundCode from './csound.csd?raw';
import 'p5';
import './style.css';


let initialized = false;
let start = false;
let csound;


document.querySelector('#start').value = 'START - Please Use Headphone';


window.setup = () => {
  let canvas = createCanvas(300,300);
  canvas.parent('canvas1');
}

window.draw = () => {
  background(255);
  if(start) {
    let time = millis() * 0.001;

    noFill();
    stroke(0);
    translate(width*0.5, height*0.5);
    ellipse(sin(time) * 100, cos(time) * 100, 30 + sin(time * 30) * 100, 30 + sin(time * 30) * 100);
  }  
}




async function init() {
  if(!initialized) {
    csound = await Csound();
    await csound.compileCsdText(csoundCode);
    await csound.start();
    initialized = true;
  }
}

document.querySelector('#start')
  .addEventListener('mousedown', async (e) => {
    await init();
    if(!start) {
      await csound.evalCode('schedule 1, 0, -1');
      e.target.value = 'STOP';
    } else {
      await csound.evalCode('schedule "clock_off", 0, 0.1');
      e.target.value = 'START - Please Use Headphone';
    }
    start = !start;
  })


