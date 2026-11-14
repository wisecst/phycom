/* Pure geometry shared by the Stage host and validation tools. */
(function(root,factory){
 const geometry=factory();
 if(typeof module==='object'&&module.exports)module.exports=geometry;
 else root.phycomStageGeometry=geometry;
})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const design=Object.freeze({width:1600,height:900,sidebar:190,footer:42});
 function fit(width,height,safe={},offset={}){
  const left=Math.max(0,Number(safe.left)||0),right=Math.max(0,Number(safe.right)||0);
  const top=Math.max(0,Number(safe.top)||0),bottom=Math.max(0,Number(safe.bottom)||0);
  const availableWidth=Math.max(0,width-left-right),availableHeight=Math.max(0,height-top-bottom);
  const scale=Math.min(availableWidth/design.width,availableHeight/design.height);
  return {scale,width:design.width*scale,height:design.height*scale,
   x:(Number(offset.left)||0)+left+(availableWidth-design.width*scale)/2,
   y:(Number(offset.top)||0)+top+(availableHeight-design.height*scale)/2,
   availableWidth,availableHeight,availableX:(Number(offset.left)||0)+left,availableY:(Number(offset.top)||0)+top};
 }
 return Object.freeze({design,fit});
});
