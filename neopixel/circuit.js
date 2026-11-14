/* Textbook p.84: IN → D8, VCC → 5V, GND → GND. Coordinates on reused assets. */
window.lessonCircuitConfig={
 board:{pins:[{name:'D8',x:883/1454,y:72/1082},{name:'5V',x:.55263,y:.925},{name:'GND',x:.62169,y:.925}]},
 module:{pins:[{name:'IN',x:1396/1536,y:451/1024},{name:'VCC',x:1396/1536,y:503/1024},{name:'GND',x:1396/1536,y:556/1024}]},
 layout:{mode:'separated',labelPlacement:'on-wire',labelDirection:'auto',labelGap:6},
 connections:[
  {from:'GND',to:'GND',route:{exitDistance:20,via:[{x:.435,y:'start'},{x:.435,y:.937},{x:'end',y:.937}]},label:{position:.5}},
  {from:'VCC',to:'5V',route:{exitDistance:30,via:[{x:.445,y:'start'},{x:.445,y:.865},{x:'end',y:.865}]},label:{position:.5}},
  {from:'IN',to:'D8',route:{auto:true},label:{position:.52,placement:'above'}}
 ]
};
