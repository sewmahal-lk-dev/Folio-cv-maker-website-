window.normalizeCanvas=function(value){
 const input=value&&typeof value==='object'?value:{};
 const number=(v,min,max,fallback)=>Number.isFinite(v)?Math.max(min,Math.min(max,v)):fallback;
 const result={pages:input.pages===2?2:1,margin:number(input.margin,0,20,0),gap:number(input.gap,0,35,21),order:[],blocks:{}};
 if(Array.isArray(input.order))result.order=[...new Set(input.order.filter(x=>typeof x==='string'&&/^[a-z]+$/.test(x)))].slice(0,30);
 for(const [id,b] of Object.entries(input.blocks||{})){
  if(!/^[a-z]+$/.test(id)||!b||typeof b!=='object')continue;
  result.blocks[id]={x:number(b.x,-100,100,0),y:number(b.y,-100,100,0),width:number(b.width,40,100,100),size:number(b.size,8,24,11),line:number(b.line,1,2.3,1.6),bold:b.bold===true,italic:b.italic===true,align:['left','center','right'].includes(b.align)?b.align:'left',photoSize:number(b.photoSize,40,160,100)};
 }
 return result;
};
