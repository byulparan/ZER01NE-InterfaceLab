/* eslint no-undef: "OFF", no-unused-vars: "OFF" */

import { Csound } from '@csound/browser';
import csoundCode from './csound.csd?raw';
import p5 from 'p5';
import './style.css';


// ================================================================================
// initialization
// ================================================================================

document.querySelector('#start').value = 'START - Please Use Headphone';

let initialized = false;
let start = false;
let csound;

async function init() {
  if(!initialized) {
    csound = await Csound({inputChannelCount: 0});
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



// ================================================================================
// section.1
// ================================================================================

document.querySelector("#padvol")
  .addEventListener("input", (e) => {
    if(initialized) {
      csound.setControlChannel("gkPadVol", e.target.value);
    }
  })

document.querySelector("#padreverb")
  .addEventListener("input", (e) => {
    if(initialized) {
      csound.setControlChannel("gkPadReverb", e.target.value);
    }
  })

document.querySelector("#padPanSpeed")
  .addEventListener("input", (e) => {
    if(initialized) {
      csound.setControlChannel("gkPadPanSpeed", e.target.value);
    }
  })



let s1 = function( s ) {
  s.setup = function() {
    let parent = document.querySelector('#canvas1');
    let canvas = s.createCanvas(parent.clientWidth, parent.clientHeight);
    canvas.parent(parent);
    s.angleMode(s.DEGREES);
  }
  let pan = 0.0;
  s.draw = function() {
    s.background(255);
    if(start) {
      csound.getControlChannel("gkPadPan").then(v => {
	pan = v;
      });
      let time = s.millis() * 0.001;
      s.noFill();
      s.stroke(0);
      s.push();
      s.translate(s.width*0.5, s.height*0.5);
      s.rotate(pan);
      s.translate(0, 100);
      s.ellipse(0, 0, 100,100);
      s.pop();
    }  
  }
};

new p5(s1);





