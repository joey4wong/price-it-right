var DB='https://price-it-right-game-default-rtdb.firebaseio.com';
var QS=new URLSearchParams(location.search);
var ROOM=(QS.get('room')||'class').replace(/[^A-Za-z0-9_-]/g,'').slice(0,30)||'class';
var SEARCH=ROOM==='class'?'':'?room='+ROOM;
var PAGES={price:'index.html',swipe:'swipe.html',auction:'auction.html'};
function $(i){return document.getElementById(i)}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')}
function pid(){return 'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function api(path,method,body){
  var o={cache:'no-store'};if(method){o.method=method;if(body!==undefined)o.body=JSON.stringify(body)}
  return fetch(DB+'/rooms/'+path+'.json',o).then(function(r){return r.json()});
}
function rec(o){var r={name:'x',score:0,secs:0,q:0,done:false,ts:{'.sv':'timestamp'}};for(var k in o)r[k]=o[k];return r}
var CTL=ROOM+'__ctl/state';
function getCtl(){return api(CTL).then(function(c){return c||{phase:'price'}}).catch(function(){return null})}
function setPhase(ph){return api(CTL,'PUT',rec({name:'ctl',phase:ph}))}
function follow(cur){
  function chk(){getCtl().then(function(c){if(c&&c.phase&&c.phase!==cur&&PAGES[c.phase])location.replace(PAGES[c.phase]+SEARCH)})}
  chk();return setInterval(chk,1500);
}
function goBoard(ph){setPhase(ph).then(function(){location.href=PAGES[ph]+SEARCH+'#board'})}
function resetAll(){
  if(!confirm('Reset all three rounds and send everyone back to Round 1?'))return;
  Promise.all([ROOM,ROOM+'__swipe',ROOM+'__auction',ROOM+'__ctl'].map(function(k){return api(k,'DELETE')}))
  .then(function(){location.href='index.html'+SEARCH+'#board';if(location.pathname.match(/index\.html$|\/$/))location.reload()});
}
function stepsHTML(cur){
  var L=[['price','Price It Right'],['swipe','Swipe to Shop'],['auction','Falling Price']];
  return '<div class="steps">'+L.map(function(x,i){return '<button class="'+(x[0]===cur?'on':'')+'" onclick="goBoard(\''+x[0]+'\')"><b>'+(i+1)+'</b>'+x[1]+'</button>'}).join('')+'</div>';
}
function myName(){return localStorage.getItem('pir_name')||''}
function setName(n){localStorage.setItem('pir_name',n)}
/* Tims Reserve can artwork (generic, drawn in SVG) */
function oneCan(x,y,s){
  return '<g transform="translate('+x+','+y+') scale('+s+')">'+
  '<rect x="0" y="6" width="60" height="114" rx="11" fill="url(#cbg)"/>'+
  '<rect x="3" y="0" width="54" height="12" rx="6" fill="url(#lid)"/>'+
  '<rect x="0" y="38" width="60" height="28" fill="#c8102e"/>'+
  '<text x="30" y="57" font-family="Sora,Inter,sans-serif" font-weight="800" font-size="14" fill="#fff" text-anchor="middle">TIMS</text>'+
  '<text x="30" y="84" font-family="Inter,sans-serif" font-size="9" font-weight="800" fill="#e9c46a" text-anchor="middle" letter-spacing="1.6">RESERVE</text>'+
  '<text x="30" y="97" font-family="Inter,sans-serif" font-size="6.6" font-weight="600" fill="#f1e6d8" text-anchor="middle" letter-spacing="1.2">COLD BREW</text>'+
  '<text x="30" y="111" font-family="Inter,sans-serif" font-size="5.6" fill="#bfae9c" text-anchor="middle">355 mL</text>'+
  '<rect x="6" y="10" width="7" height="104" rx="3.5" fill="#fff" opacity=".08"/></g>';
}
function timsSVG(n,h){
  n=n||1;h=h||180;var cols=n===1?1:n===4?4:6,rows=n===12?2:1;
  var W=cols*66+6,H=rows===2?190:126,g='';
  if(rows===2){for(var r=0;r<2;r++)for(var c=0;c<6;c++)g+=oneCan(6+c*66+(r?0:0),r?66:0,1)}
  else for(var c2=0;c2<cols;c2++)g+=oneCan(3+c2*66,3,1);
  return '<svg viewBox="0 0 '+W+' '+(H+4)+'" style="height:'+h+'px;max-width:100%" xmlns="http://www.w3.org/2000/svg"><defs>'+
  '<linearGradient id="cbg" x1="0" x2="1"><stop offset="0" stop-color="#3a241b"/><stop offset=".55" stop-color="#22140f"/><stop offset="1" stop-color="#140b08"/></linearGradient>'+
  '<linearGradient id="lid" x1="0" x2="1"><stop offset="0" stop-color="#9aa3ad"/><stop offset=".5" stop-color="#e6eaee"/><stop offset="1" stop-color="#8b949e"/></linearGradient></defs>'+g+'</svg>';
}
