/* eslint no-undef: "OFF", no-unused-vars: "OFF" */

import { Csound } from '@csound/browser';
import csoundCode from './csound.csd?raw';
import 'p5';
import './style.css';


window.setup = () => {
  createCanvas(400,400);
}

window.draw = () => {
  background(0);
  let time = millis() * 0.001;

  noFill();
  stroke(255);
  translate(width*0.5, height*0.5);
  ellipse(sin(time) * 100, cos(time) * 100, 30 + sin(time * 10) * 100, 30 + sin(time * 10) * 100);
  
}




let initialized = false;
let start = false;
let csound;

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
      e.target.value = 'stop';
    } else {
      await csound.evalCode('schedule "clock_off", 0, 0.1');
      e.target.value = 'start';
    }
    start = !start;
  })


