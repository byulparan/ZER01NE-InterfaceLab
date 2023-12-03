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

giSin ftgen 1, 0, 8192, 10, 1

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

gkOrganVol init 0
gkOrganVol chnexport "gkOrganVol", 1, 0
gkOrganAzimuth init 0
gkOrganAzimuth chnexport "gkOrganAzimuth", 1, 0
gkOrganAltitude init 0
gkOrganAltitude chnexport "gkOrganAltitude", 1, 0

gkBellVol init 0
gkBellVol chnexport "gkBellVol", 1, 0
gkBellAzimuth init 0
gkBellAzimuth chnexport "gkBellAzimuth", 1, 0
gkBellAltitude init 0
gkBellAltitude chnexport "gkBellAltitude", 1, 0

gkBassVol init 0
gkBassVol chnexport "gkBassVol", 1, 0
gkNoiseVol init 0
gkNoiseVol chnexport "gkNoiseVol", 1, 0
gkPercVol init 0
gkPercVol chnexport "gkPercVol", 1, 0

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
    schedule "organ", .0, 6
  endif
  
  if icount % (4) == 0 then
    inotes[] fillarray 60,66,67,71,72,78,79,83
    schedule "bell", .0, 6, inotes[random(0, lenarray(inotes))]
  endif
  
  if icount % 0.25 == 0 then
    schedule "bass", .0, .25, 48
  endif

  if icount % 0.25 == 0 && random(0,1.0) > 0.92 then
    schedule "noise", .0, random(0.04, 0.3)
  endif

  if icount % 2 == 0 || icount % 2 == 0.75 || icount % 2 == 1.25 then
    schedule "perc", .0, 1.0, cpsmidinn(48)
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


instr organ
  kenv linseg 0, p3*0.2, 1, p3*0.6, 1, p3*0.2, 0
  a1 foscil 0.1, cpsmidinn(55), 1, 2, 0.4, giSin
  a2 foscil 0.1, cpsmidinn(78), 1, int(random(1,4)), 0.4, giSin
  a3 foscil 0.1, cpsmidinn(79), 1, int(random(1,4)), 0.4, giSin
  asig = a1 + a2 + a3
  asig = asig * kenv * 0.6 * gkOrganVol

  kalpha = gkOrganAzimuth
  kbeta = gkOrganAltitude

  aw, ax, ay, az, ar, as, at, au, av bformenc1 asig, kalpha, kbeta
  al,ar bformdec1 1, aw, ax, ay, az, ar, as, at, au, av
  outs al, ar

endin


instr bell
  kenv line 0.1, p3, 0
  ifreq = cpsmidinn(p4)
  asig foscil kenv*gkBellVol, ifreq, 1, 14, 0.2, giSin

  kalpha = gkBellAzimuth
  kbeta = gkBellAltitude

  aw, ax, ay, az, ar, as, at, au, av bformenc1 asig, kalpha, kbeta
  al,ar bformdec1 1, aw, ax, ay, az, ar, as, at, au, av
  
  outs al, ar
  gaRevL += al * 0.2
  gaRevR += ar * 0.2
endin


instr bass
  kenv line 0.2, p3, 0
  ifreq = cpsmidinn(p4)
  indx = random(1, 4)
  asig foscil kenv, ifreq, 1, 0.5, indx, giSin
  asig = asig * gkBassVol
  outs asig, asig
endin


instr noise
  anoise noise 0.1, 0
  anoise = anoise * gkNoiseVol
  outs anoise, anoise
endin


instr perc
  kenv line 0.6, p3, 0
  ifreq = p4
  kfreq linseg ifreq,p3*0.1, ifreq*0.5, p3*0.9, ifreq*0.5
  asig oscil kenv, kfreq
  asig = asig * gkPercVol
  kalpha = int(random(0,360))
  kbeta = 0
  
  aw, ax, ay, az, ar, as, at, au, av bformenc1 asig, kalpha, kbeta
  al,ar bformdec1 1, aw, ax, ay, az, ar, as, at, au, av
  outs al, ar
  gaRevL += al * 0.3
  gaRevR += ar * 0.3
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
