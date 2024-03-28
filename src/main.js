/* eslint no-undef: "OFF", no-unused-vars: "OFF" */

import { Csound } from '@csound/browser';
import csoundCode from './csound.csd?raw';
import p5 from 'p5';
import './style.css';

import seaSound from './resources/sea-atmos.mp3?url';
import birdSound from './resources/bird-atmos.mp3?url';
import rainSound from './resources/rain-atmos.mp3?url';

// ================================================================================
// Global Initialization
// ================================================================================

document.querySelector('#start').value = 'CLICK TO START - Please Use Headphone';

let initialized = false;
let start = false;
let audioContext;
let csound;


async function init() {
  if(!initialized) {
    audioContext = new AudioContext();
    
    csound = await Csound({
      audioContext: audioContext,
      inputChannelCount: 0
    });

    await csound.compileCsdText(csoundCode);
    await csound.start();

    loadAmbient();
    
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
      e.target.value = 'CLICK TO START - Please Use Headphone';
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
    let sz = Math.min(parent.clientWidth, parent.clientHeight);
    let canvas = s.createCanvas(sz, sz);
    canvas.parent(parent);
    s.angleMode(s.DEGREES);
  }
  let pan = 0.0;
  s.draw = function() {
    s.background(255);
    s.translate(s.width*0.5, s.height*0.5);
    s.noFill();
    s.stroke(0);
    s.line(-150, 0, 150, 0);
    s.line( 0, -150, 0, 150);

    
    if(start) {
      csound.getControlChannel("gkPadPan").then(v => {
	pan = v;
      });
      let time = s.millis() * 0.001;
      s.noStroke();
      s.fill(255, 0, 0, document.querySelector("#padvol").value * 255 * 2);
      s.rotate(pan);
      s.translate(0, s.height*0.45);
      s.ellipse(0, 0, s.width*0.05, s.width*0.05);
    }  
  }
};

new p5(s1);





// ================================================================================
// section.2 - windAudio
// ================================================================================

let seaSoundGainNode = false;
let birdSoundGainNode = false;
let rainSoundGainNode = false;

function loadAmbient() {
  fetch(seaSound)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
    .then(buffer => {
      let seaBufferSource = audioContext.createBufferSource();
      seaBufferSource.buffer = buffer;
      seaBufferSource.loop = true;
      seaSoundGainNode = audioContext.createGain();
      seaSoundGainNode.gain.value = 0.0;
      seaBufferSource.connect(seaSoundGainNode).connect(audioContext.destination);
      seaBufferSource.start();
      document.querySelector('#seaSoundVol').disabled = false;
    });


  fetch(birdSound)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
    .then(buffer => {
      let birdBufferSource = audioContext.createBufferSource();
      birdBufferSource.buffer = buffer;
      birdBufferSource.loop = true;
      birdSoundGainNode = audioContext.createGain();
      birdSoundGainNode.gain.value = 0.0;
      birdBufferSource.connect(birdSoundGainNode).connect(audioContext.destination);
      birdBufferSource.start();
      document.querySelector('#birdSoundVol').disabled = false;
    });

  
  fetch(rainSound)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
    .then(buffer => {
      let rainBufferSource = audioContext.createBufferSource();
      rainBufferSource.buffer = buffer;
      rainBufferSource.loop = true;
      rainSoundGainNode = audioContext.createGain();
      rainSoundGainNode.gain.value = 0.0;
      rainBufferSource.connect(rainSoundGainNode).connect(audioContext.destination);
      rainBufferSource.start();
      document.querySelector('#rainSoundVol').disabled = false;
    });
}

document.querySelector("#seaSoundVol")
  .addEventListener("input", (e) => {
    if(initialized) {
      seaSoundGainNode.gain.value = e.target.value * 0.1;
    }
  })

document.querySelector("#birdSoundVol")
  .addEventListener("input", (e) => {
    if(initialized) {
      birdSoundGainNode.gain.value = e.target.value * 0.1;
    }
  })

document.querySelector("#rainSoundVol")
  .addEventListener("input", (e) => {
    if(initialized) {
      rainSoundGainNode.gain.value = e.target.value * 0.1;
    }
  })




let s2 = function( s ) {
  s.setup = function() {
    let parent = document.querySelector('#canvas2');
    let sz = Math.min(parent.clientWidth, parent.clientHeight);
    let canvas = s.createCanvas(sz, sz);
    canvas.parent(parent);
    s.angleMode(s.DEGREES);
    s.textAlign(s.CENTER);
    s.textSize(15);
  }
  let pan = 0.0;
  s.draw = function() {
    s.background(255);
    s.translate(s.width*0.5, s.height*0.5);
    s.noFill();
    s.stroke(0);
    s.line(-150, 0, 150, 0);
    s.line( 0, -150, 0, 150);
    if(start) {
      if(!(seaSoundGainNode && birdSoundGainNode && rainSoundGainNode)) {
	if(Math.floor(s.millis() / 500.0) % 2 == 0) {
	  s.push();
	  s.noStroke();
	  s.fill(255,0,0);
	  s.text("Resources Loading..", 0,0);
	  s.pop();
	}
      }
      s.push();
      s.noStroke();
      s.fill(0, 0, 255, document.querySelector("#seaSoundVol").value * 255 * 2);
      s.rotate(-45.0);
      s.translate(0, s.height*0.5);
      s.ellipse(0, 0, 10, 10);
      s.pop();
      s.push();
      s.noStroke();
      s.fill(0, 200, 0, document.querySelector("#birdSoundVol").value * 255 * 2);
      s.rotate(45.0);
      s.translate(0, s.height*0.5);
      s.ellipse(0, 0, 10, 10);
      s.pop();
      s.push();
      s.noStroke();
      s.fill(135, 206, 235, document.querySelector("#rainSoundVol").value * 255 * 2);
      s.push();
      s.rotate(135.0);
      s.translate(0, s.height*0.5);
      s.ellipse(0, 0, 10, 10);
      s.pop();
      s.push();
      s.rotate(-135.0);
      s.translate(0, s.height*0.5);
      s.ellipse(0, 0, 10, 10);
      s.pop();
      s.pop();

    }  
  }
};

new p5(s2);



// ================================================================================
// section.3 - Organ
// ================================================================================


document.querySelector("#organSoundVol")
  .addEventListener("input", (e) => {
    if(initialized) {
      csound.setControlChannel("gkOrganVol", e.target.value);
    }
  })

document.querySelector("#organAzimuth")
  .addEventListener("input", (e) => {
    if(initialized) {
      csound.setControlChannel("gkOrganAzimuth", e.target.value);
    }
  })

document.querySelector("#organAltitude")
  .addEventListener("input", (e) => {
    if(initialized) {
      csound.setControlChannel("gkOrganAltitude", e.target.value);
    }
  })




let s3 = function( s ) {
  s.setup = function() {
    let parent = document.querySelector('#canvas3');
    let sz = Math.min(parent.clientWidth, parent.clientHeight);
    let canvas = s.createCanvas(sz, sz);
    canvas.parent(parent);
    s.angleMode(s.DEGREES);
    s.textAlign(s.CENTER);
    s.textSize(15);
  }
  let pan = 0.0;
  s.draw = function() {
    s.background(255);
    s.translate(s.width*0.5, s.height*0.5);
    s.noFill();
    s.stroke(0);
    s.line(-150, 0, 150, 0);
    s.line( 0, -150, 0, 150);
    if(start) {

    }  
  }
};

new p5(s3);


// ================================================================================
// section.4 - Bell
// ================================================================================

document.querySelector("#bellSoundVol")
  .addEventListener("input", (e) => {
    if(initialized) {
      csound.setControlChannel("gkBellVol", e.target.value);
    }
  })

document.querySelector("#bellAzimuth")
  .addEventListener("input", (e) => {
    if(initialized) {
      csound.setControlChannel("gkBellAzimuth", e.target.value);
    }
  })

document.querySelector("#bellAltitude")
  .addEventListener("input", (e) => {
    if(initialized) {
      csound.setControlChannel("gkBellAltitude", e.target.value);
    }
  })




let s4 = function( s ) {
  s.setup = function() {
    let parent = document.querySelector('#canvas4');
    let sz = Math.min(parent.clientWidth, parent.clientHeight);
    let canvas = s.createCanvas(sz, sz);
    canvas.parent(parent);
    s.angleMode(s.DEGREES);
    s.textAlign(s.CENTER);
    s.textSize(15);
  }
  let pan = 0.0;
  s.draw = function() {
    s.background(255);
    s.translate(s.width*0.5, s.height*0.5);
    s.noFill();
    s.stroke(0);
    s.line(-150, 0, 150, 0);
    s.line( 0, -150, 0, 150);
    if(start) {

    }  
  }
};

new p5(s4);


// ================================================================================
// section.5 - Rhythms
// ================================================================================

document.querySelector("#bassSoundVol")
  .addEventListener("input", (e) => {
    if(initialized) {
      csound.setControlChannel("gkBassVol", e.target.value);
    }
  })

document.querySelector("#noiseSoundVol")
  .addEventListener("input", (e) => {
    if(initialized) {
      csound.setControlChannel("gkNoiseVol", e.target.value);
    }
  })

document.querySelector("#percSoundVol")
  .addEventListener("input", (e) => {
    if(initialized) {
      csound.setControlChannel("gkPercVol", e.target.value);
    }
  })




let s5 = function( s ) {
  s.setup = function() {
    let parent = document.querySelector('#canvas5');
    let sz = Math.min(parent.clientWidth, parent.clientHeight);
    let canvas = s.createCanvas(sz, sz);
    canvas.parent(parent);
    s.angleMode(s.DEGREES);
    s.textAlign(s.CENTER);
    s.textSize(15);
  }
  let pan = 0.0;
  s.draw = function() {
    s.background(255);
    s.translate(s.width*0.5, s.height*0.5);
    s.noFill();
    s.stroke(0);
    s.line(-150, 0, 150, 0);
    s.line( 0, -150, 0, 150);
    if(start) {

    }  
  }
};

new p5(s5);





