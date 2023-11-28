<CsoundSynthesizer>
<CsOptions>
-odac -m4
</CsOptions>
<CsInstruments>

sr = 44100
ksmps = 10
nchnls = 2
0dbfs = 1.0
seed 0



;; ================================================================================
;; GlobalSetup
;; ================================================================================
gkTempo init (60 / 60) * 32
gkCount init 0
gaRevL init 0
gaRevR init 0

schedule "reverb", 0, -1



;; ================================================================================
;; ControlChannel
;; ================================================================================


gkPadPan init 0
gkPadPan chnexport "gkPadPan", 2, 0
gkPadPanSpeed init 0.1
gkPadPanSpeed chnexport "gkPadPanSpeed", 2, 2, i(gkPadPanSpeed), 0, 10.0
gkPadVol init 0
gkPadVol chnexport "gkPadVol", 1, 0
gkPadReverb init 0
gkPadReverb chnexport "gkPadReverb", 1, 0



;; ================================================================================
;; Synthesizer
;; ================================================================================

instr 1
  ktrig metro gkTempo
  kcount init 0
  if ktrig == 1 then
    schedulek "schedule", .0, .1, kcount * 1/32
    kcount += 1
  endif
  gkCount += 0.1 * gkPadPanSpeed
endin


instr clock_off
  turnoff2 1, 0, 0
endin


instr schedule
  icount = p4
  if icount % (4) == 0 then
    inotes[] fillarray 71,72,74,79
    schedule "pad", .0, 6, inotes[random(0, lenarray(inotes))]
  endif
endin


instr pad

  kenv linseg 0,  p3*0.2, 1, p3*0.6,1, p3*0.2,0
  a1 oscil 0.1, cpsmidinn(48)
  a2 oscil 0.1, cpsmidinn(55)
  a3 oscil 0.1, cpsmidinn(64)
  a4 oscil 0.1, cpsmidinn(p4)
  asig = a1 + a2 + a3 + a4
  asig = asig*kenv*gkPadVol
  kalpha = abs(gkCount % 360)
  kbeta = 0
  gkPadPan = kalpha
  ; generate B format
  aw, ax, ay, az, ar, as, at, au, av bformenc1 asig, kalpha, kbeta
  al,ar bformdec1 1, aw, ax, ay, az, ar, as, at, au, av
  outs al, ar
  gaRevL += al * gkPadReverb * 0.3
  gaRevR += ar * gkPadReverb * 0.3
endin


instr reverb
  al, ar reverbsc gaRevL, gaRevR, .9, 12000
  outs al, ar
  gaRevL = 0
  gaRevR = 0
endin


</CsInstruments>
<CsScore>


</CsScore>
</CsoundSynthesizer>
