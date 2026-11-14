/* Textbook p.177: R → D9, G → D10, B → D11, GND → GND. */
window.lessonCircuitConfig={
 board:{pins:[{name:'D9',x:824/1454,y:72/1082},{name:'D10',x:768/1454,y:72/1082},{name:'D11',x:709/1454,y:72/1082},{name:'GND',x:.62169,y:.925}]},
 // Match the 1.5× image and its occupied rectangle; keep the original terminal coordinates.
 module:{labelInsets:{left:-.25,right:-.25,top:-.25,bottom:-.25},pins:[{name:'GND',x:1261/1346,y:558/1168},{name:'R',x:1263/1346,y:664.5/1168},{name:'G',x:1264/1346,y:772.5/1168},{name:'B',x:1264/1346,y:882.5/1168}].map(p=>({...p,x:.5+(p.x-.5)*1.5,y:.5+(p.y-.5)*1.5}))},
 layout:{mode:'separated',labelDirection:'auto',labelPlacement:'on-wire',labelGap:6},
 // Shared route settings, as in neopixel/circuit.js: preserve terminal ends and label space.
 connections:[
  {from:'GND',to:'GND',route:{via:[{x:.464,y:'start'},{x:.464,y:.055},{x:.995,y:.055},{x:.995,y:.992},{x:'end',y:.992}]}},
  {from:'R',to:'D9',color:'#e53935',route:{via:[{x:.495,y:'start'},{x:.495,y:.125},{x:'end',y:.125}]}},
  {from:'G',to:'D10',color:'#43a047',route:{via:[{x:.51,y:'start'},{x:.51,y:.184},{x:'end',y:.184}]}},
  {from:'B',to:'D11',color:'#1976d2',route:{via:[{x:.525,y:'start'},{x:.525,y:.2435},{x:'end',y:.2435}]}}
 ]
};
