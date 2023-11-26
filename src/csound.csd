<CsoundSynthesizer>
<CsOptions>
-odac -m4 -i"dummy.wav"
</CsOptions>
<CsInstruments>

sr = 44100
ksmps = 10
nchnls = 2
0dbfs = 1.0
seed 0

gkTempo init (60 / 60) * 32
gaRevL init 0
gaRevR init 0


schedule "reverb", 0, -1

instr clock_off
  turnoff2 1, 0, 0
endin

instr 1
  ktrig metro gkTempo
  kcount init 0
  if ktrig == 1 then
    schedulek "schedule", .0, .1, kcount * 1/32
    kcount += 1
  endif
endin

instr schedule
  icount = p4
  if icount % (1/4) == 0 then
    schedule "_init_sound", .0, .25
  endif
endin


instr _init_sound
  asig oscil line:k(0.1, p3, 0.0), 440
  outs asig, asig
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
