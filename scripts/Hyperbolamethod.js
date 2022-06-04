(()=>{var de=Object.defineProperty;var K=Object.getOwnPropertySymbols;var he=Object.prototype.hasOwnProperty,me=Object.prototype.propertyIsEnumerable;var A=(i,e,t)=>e in i?de(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t,_=(i,e)=>{for(var t in e||(e={}))he.call(e,t)&&A(i,t,e[t]);if(K)for(var t of K(e))me.call(e,t)&&A(i,t,e[t]);return i};var H=(i,e,t)=>new Promise((n,r)=>{var a=d=>{try{m(t.next(d))}catch(c){r(c)}},s=d=>{try{m(t.throw(d))}catch(c){r(c)}},m=d=>d.done?n(d.value):Promise.resolve(d.value).then(a,s);m((t=t.apply(i,e)).next())});function E(i,e=[],t={},n={}){let r=document.createElement(i);for(let[s,m]of Object.entries(t))r.setAttribute(s,typeof m=="string"?m:m+"");for(let[s,m]of Object.entries(n))r[s]=m;if(Array.isArray(e))for(var a of e)typeof a=="string"&&(a=document.createTextNode(a)),r.append(a);else r.innerHTML=e.__html;return r}function W(i,e){for(var t of e)Array.isArray(t)?W(i,t):i.append(t instanceof Node?t:""+t)}function f(i,e,...t){if(i===f.Fragment){let s=document.createDocumentFragment();return W(s,t),s}let n=document.createElement(i);e=e||{},"__html"in e&&(n.innerHTML=""+e.__html,delete e.__html);for(var[r,a]of Object.entries(e))typeof a=="function"?n[r]=a:n.setAttribute(r,""+a);return W(n,t),n}f.Fragment="";var be=`:host{position:relative;top:0;left:0;display:block;width:100%;height:100%;overflow:hidden;padding:0;margin:0}._container_1kdby_13{display:block;position:absolute;width:100%;height:100%;touch-action:none;-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}._container_1kdby_13>div,._container_1kdby_13>canvas{position:absolute;top:0;left:0;width:100%;height:100%}
`,ce={container:"_container_1kdby_13"},G={css:be,class:ce};function Y(i){return{update(e,t){let n=t.getContext("2d"),r=window.devicePixelRatio;(Math.floor(e.width*r)!==t.width||Math.floor(e.height*r)!==t.height)&&(t.width=Math.floor(e.width*r),t.height=Math.floor(e.height*r)),n.setTransform(r,0,0,r,0,0),i.update(e,n)},resized(e){e.update(this)},connected(e){return{nodes:E("canvas",[],{class:"canvas-layer"})}}}}var pe=`._button_1aydv_1{position:absolute;bottom:1em;right:1em;width:50px;height:50px;padding:10px;border-radius:50%;border:2px solid #012;background-color:#012;color:#def;z-index:99}._button_1aydv_1:hover{background-color:#bbddee;color:#001122}._button_1aydv_1:active{transform:translateY(1px);background-color:#bbddee;color:#001122}._icon_1aydv_25{display:block;width:100%;height:100%}.active ._icon_1aydv_25{display:none}._icon_x_1aydv_35{display:none;width:100%;height:100%}.active ._icon_x_1aydv_35{display:block}._container_1aydv_45{display:none;position:absolute;overflow:scroll;top:0;right:0;width:100%;height:100%;background-color:#eeeeeeaa;margin:0;padding:20px;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;z-index:99}._list_1aydv_63{display:grid;display:block;grid-template-columns:repeat(auto-fill,250px);margin:auto}dialog::backdrop{background:rgba(0,0,0,0.9)}
`,fe={button:"_button_1aydv_1",icon:"_icon_1aydv_25",icon_x:"_icon_x_1aydv_35",container:"_container_1aydv_45",list:"_list_1aydv_63"},T={css:pe,class:fe};var ye={section:function(i,e){var t;return{input:f((t=e==null?void 0:e.level)!=null?t:"h2",{},i)}},number:function(i){let e=i.onChange;return{label:f("label",null,i.label),input:f("input",_({type:"number",oninput:t=>{e==null||e(parseInt(t.target.value))}},i.default?{value:i.default}:{}))}},color:function(i){let e=i.onChange;return{label:f("label",null,i.label),input:f("input",_({type:"color",oninput:t=>{e==null||e(t.target.value)}},i.default?{value:i.default}:{}))}},radio:function(i){let e=i.onChange;return{label:f("label",null,i.label),input:f(f.Fragment,null,i.values.map(t=>f(f.Fragment,null,f("label",null,t.label,f("input",_({type:"radio",name:i.label,value:t.name,oninput:n=>{e==null||e(n.target.value)}},t.name===i.default?{checked:""}:{}))),f("span",{style:"display:inline-block;width:1em;"}))))}},multiButton:function(i){let e=i.onClick;return{label:f("label",null,i.label),input:f(f.Fragment,null,i.values.map(t=>f("button",{value:t.name,onclick:n=>{e==null||e(n.target.value)}},t.label)))}},custom:function(i){return{label:typeof i.label=="string"?f("span",null,i.label):i.label,input:i.input}}};function B(){return i=>{let e=f("div",{class:T.class.container},f("h1",null,"Options")),t=f("button",{"arial-label":"Options Toggle",class:T.class.button,title:"Show all options",__html:`<svg xmlns="http://www.w3.org/2000/svg" class="${T.class.icon}" viewBox="0 0 24 24" style="fill:currentColor;"><path d="M19.9,13.3C20,12.8,20,12.4,20,12s0-0.8-0.1-1.3L21.8,9l-2.3-4l-2.4,0.8c-0.7-0.5-1.4-1-2.2-1.3L14.3,2H9.7L9.2,4.5	C8.3,4.8,7.6,5.3,6.9,5.8L4.5,5L2.2,9l1.9,1.7C4,11.2,4,11.6,4,12c0,0.4,0,0.8,0.1,1.3L2.2,15l2.3,4l2.4-0.8l0,0	c0.7,0.5,1.4,1,2.2,1.3L9.7,22h4.7l0.5-2.5c0.8-0.3,1.6-0.7,2.2-1.3l0,0l2.4,0.8l2.3-4L19.9,13.3L19.9,13.3z M12,16	c-2.2,0-4-1.8-4-4c0-2.2,1.8-4,4-4c2.2,0,4,1.8,4,4C16,14.2,14.2,16,12,16z"></path></svg><svg class="${T.class.icon_x}" version="1.1" viewBox="0 0 460.78 460.78" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="m285.08 230.4 171.14-171.13c6.076-6.077 6.076-15.911 0-21.986l-32.707-32.719c-2.913-2.911-6.866-4.55-10.992-4.55-4.127 0-8.08 1.639-10.993 4.55l-171.14 171.14-171.14-171.14c-2.913-2.911-6.866-4.55-10.993-4.55-4.126 0-8.08 1.639-10.992 4.55l-32.707 32.719c-6.077 6.075-6.077 15.909 0 21.986l171.14 171.13-171.12 171.11c-6.074 6.077-6.074 15.911 0 21.986l32.709 32.719c2.911 2.911 6.865 4.55 10.992 4.55s8.08-1.639 10.994-4.55l171.12-171.12 171.12 171.12c2.913 2.911 6.866 4.55 10.993 4.55 4.128 0 8.081-1.639 10.992-4.55l32.709-32.719c6.074-6.075 6.074-15.909 0-21.986l-171.12-171.11z"/></svg>`,onclick:()=>{let r=e.style.display=="block";e.style.display=r?"":"block",r?t.classList.remove("active"):t.classList.add("active")}}),n=new J;return n.container.className=T.class.list,e.append(n.container),i.attachToShaddow(f("style",{__html:T.css}),e,t),{nodes:void 0,handle:n}}}function V(i){let e=f("input",{type:"number",style:"width:6em;"}),t=f("input",{type:"number",style:"width:6em;"}),n=f("span",null,"auto sizing"),r=new ResizeObserver(()=>{if(i.containerElement.style.width==="")return;let b=i.hostElement;if(!b)return;let{clientWidth:o,clientHeight:h}=i.containerElement,{clientWidth:l,clientHeight:u}=b,p=Math.min(l/o,u/h);i.containerElement.style.transformOrigin="top left",i.containerElement.style.transform=`translate(${(l-o*p)/2}px, ${(u-h*p)/2}px) scale(${p}, ${p})`}),a=!1,s=(b,o)=>{let h=b<0||o<0||isNaN(b)||isNaN(o);h&&a&&(r.unobserve(i.containerElement),r.unobserve(i.hostElement),a=!1),!a&&!h&&(r.observe(i.containerElement),r.observe(i.hostElement),a=!0),h?(i.containerElement.style.width="",i.containerElement.style.height="",i.containerElement.style.outline="",i.containerElement.style.transform="",i.containerElement.style.transformOrigin="",n.textContent="auto sizing"):(i.containerElement.style.width=b+"px",i.containerElement.style.height=o+"px",i.containerElement.style.outline="1px dashed black",n.textContent=b+" x "+o),m.close()},m=f("dialog",null,f("form",{onsubmit:()=>(s(parseInt(e.value),parseInt(t.value)),!1)},f("p",null,"Choose new size:"),e," x ",t,f("br",null),f("input",{type:"submit",value:"Apply"}),f("input",{type:"button",value:"Reset",onclick:()=>{s(-1,-1)}}))),d,c;return d=f("span",null,f("input",{type:"button",value:"Change",onclick:()=>{m.showModal()}}),m),{label:f("span",null,"Canvas size (",n,")"),input:d}}var J=class{constructor(){this.container=f("div",null)}add(e,...t){Array.isArray(e)&&(t=e.slice(1),e=e[0]);var r=(typeof e=="function"?e:ye[e])(...t);if(this.addOption(r),"handle"in r)return r.handle}addOption(e){this.container.appendChild(f("div",{style:"margin-top: 10px;"},e.label?f("div",null,f("b",null,e.label,":")):[],f("div",null,e.input)))}};var U=class extends HTMLElement{constructor(){super(...arguments);this.shadow=this.attachShadow({mode:"open"});this.cleanup=[]}connectedCallback(){var c,b;let e=this.shadow;e.innerHTML="";let t=E("style",[G.css]),n=E("div",[],{class:G.class.container}),r=new ResizeObserver(()=>{var h,l,u,p;(l=(h=this.layerHandler).resized)==null||l.call(h,d);for(var o of a.values())(p=(u=o.layer)==null?void 0:u.resized)==null||p.call(u,d,o.nodes)});r.observe(n),e.append(t,n);let a=new Map,s=0,m=()=>{var l,u;let o=s===2;s=0;for(var h of a.values())(o||h.update)&&((u=(l=h.layer)==null?void 0:l.update)==null||u.call(l,d,h.nodes)),h.update=!1},d={get width(){return n.clientWidth},get height(){return n.clientHeight},containerElement:n,hostElement:this,update:function(o){if(s!==2){if(s===0&&requestAnimationFrame(m),o===void 0){s=2;return}if(typeof o=="string"){s=1;let l=a.get(o);l&&(l.update=!0);return}for(var h of a.values())o===h.layer&&(h.update=!0)}},addStyles:function(o){t.append(o)},addLayer:function(o,h){if(h instanceof Node){n.appendChild(h);return}let l,u;typeof h=="function"?(u=h(d),l=void 0):(u=h.connected(d),l=h);let p=u.nodes;p&&(Array.isArray(p)?n.append(...p):n.append(p)),a.set(o,{nodes:p,layer:l,update:!1}),d.update(o);let y=u.handle;return y||(y={}),y.update=()=>{this.update(o)},y},attachToShaddow(...o){e.append(...o)}};(b=(c=this.layerHandler).connected)==null||b.call(c,d),this.cleanup.push(()=>{var h,l,u,p;r.unobserve(n);for(var o of a.values())(l=(h=o.layer)==null?void 0:h.disconnected)==null||l.call(h,d);(p=(u=this.layerHandler).disconnected)==null||p.call(u,d)})}disconnectedCallback(){for(var e of this.cleanup)e();this.cleanup=[],this.shadow.innerHTML=""}};function q(i){return class extends U{constructor(){super(...arguments);this.layerHandler=i}}}var Z=2*Math.PI,Q=.5/Math.PI,I=class{constructor(e,t,n){this._lineWidth=1;this._fontSize=13;this._fillColor="#000000";this._strokeColor="#000000";this.fontAscent=-1;this.fontDescent=-1;this._ctx=e,this.width=t===void 0?e.canvas.width:t,this.height=n===void 0?e.canvas.height:n,this.fontSize=13}get lineWidth(){return this._lineWidth}set lineWidth(e){this._ctx.lineWidth=e,this._lineWidth=e}get fontSize(){return this._fontSize}set fontSize(e){this._ctx.textBaseline="alphabetic",this._ctx.font=e+"px Times New Roman",this._fontSize=e;let t=this._ctx.measureText("1ATOgjp");this.fontAscent=t.fontBoundingBoxAscent||t.actualBoundingBoxAscent,this.fontDescent=t.fontBoundingBoxDescent||t.actualBoundingBoxDescent}get fillStyle(){return this._fillColor}set fillStyle(e){this._ctx.fillStyle=e,this._fillColor=e}get strokeStyle(){return this._strokeColor}set strokeStyle(e){this._ctx.strokeStyle=e,this._strokeColor=e}set(e){for(var[t,n]of Object.entries(e))switch(t){case"fontSize":this.fontSize=n;break;case"lineWidth":this.lineWidth=n;break;case"fill":this.fillStyle=n;break;case"stroke":this.strokeStyle=n;break;default:let r=t;console.warn(`Unknown option key '${t}'`)}return this}measureText(e){this._ctx.textAlign="center";let t=this._ctx.measureText(e),n=(this.fontAscent+this.fontDescent)/2;return{top:n*1.3,bot:n*1,left:t.actualBoundingBoxLeft,right:t.actualBoundingBoxRight}}drawText(e,t,n,r){let a="middle",s="center";switch(r&12){case x.T:a="top";break;case x.B:a="bottom";break}switch(r&3){case x.L:s="left";break;case x.R:s="right";break}return this._ctx.textBaseline=a,this._ctx.textAlign=s,this._ctx.fillText(e,t,n),this}begin(){return this._ctx.beginPath(),this}move(e,t){return this._ctx.moveTo(e,t),this}line(e,t){return this._ctx.lineTo(e,t),this}quadratic(e,t,n,r){return this._ctx.quadraticCurveTo(e,t,n,r),this}cubic(e,t,n,r,a,s){return this._ctx.bezierCurveTo(e,t,n,r,a,s),this}close(){return this._ctx.closePath(),this}rect(e,t,n,r){return this._ctx.rect(e,t,n,r),this}arc(e,t,n,r,a,s){return r=r-Z*Math.floor(Q*r),a=a-Z*Math.floor(Q*a),this._ctx.arc(e,t,n,-r,-a,!s),this}stroke(){return this._ctx.stroke(),this}fill(){return this._ctx.fill(),this}fillAndStroke(){return this.fill(),this.stroke(),this}};var j=class{constructor(e,t,...n){this.name=e;this.children=n,this.attributes=t||{}}attrString(){return Object.entries(this.attributes).map(([e,t])=>`${e}="${t}"`).join(" ")}chString(){return this.children.map(e=>e.toString()).join("")}append(e){this.children.push(e)}toString(){let e=this.name;return e===""?this.chString():`<${e} ${this.attrString()}>${this.chString()}</${e}>`}};function S(i,e,...t){return typeof i=="function"?i(e,...t):new j(i,e,...t)}S.Fragment="";var Ye=180/Math.PI,De=2*Math.PI,ge=.5/Math.PI,O=class{constructor(e,t){this.style={stroke:{stroke:"#000000","stroke-width":1},fill:{fill:"#000000"},fontSize:13};this.svg=S("svg",{xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",version:"1.1",viewBox:`0 0 ${e} ${t}`})}round(e){return Math.round(e*1e4)/1e4}get fillStyle(){return this.style.fill.fill}set fillStyle(e){let{fill:t}=this.style;if(e.length==9){let n=parseInt("0x"+e.slice(7,9))/255;e=e.slice(0,7),n===1?delete t["fill-opacity"]:t["fill-opacity"]=Math.round(1e3*n)/1e3}else delete t["fill-opacity"];t.fill=e}get strokeStyle(){return this.style.stroke.stroke}set strokeStyle(e){let{stroke:t}=this.style;if(e.length==9){let n=parseInt("0x"+e.slice(7,9))/255;e=e.slice(0,7),n===1?delete t["stroke-opacity"]:t["stroke-opacity"]=Math.round(1e3*n)/1e3}else delete t["stroke-opacity"];t.stroke=e}get lineWidth(){return this.style.stroke["stroke-width"]}set lineWidth(e){this.style.stroke["stroke-width"]=e}get fontSize(){return this.style.fontSize}set fontSize(e){this.style.fontSize=e}set(e){for(var[t,n]of Object.entries(e))switch(t){case"fontSize":this.fontSize=n;break;case"lineWidth":this.lineWidth=n;break;case"fill":this.fillStyle=n;break;case"stroke":this.strokeStyle=n;break;default:let r=t;console.warn(`Unknown option key '${t}'`)}return this}drawText(e,t,n,r=0){let a="middle",s="middle";switch(r&12){case x.T:a="hanging";break;case x.B:a="text-after-edge";break}switch(r&3){case x.L:s="start";break;case x.R:s="end";break}let m=this.round;return this.svg.append(S("text",{x:m(t),y:m(n),"font-size":this.style.fontSize,"font-family":"Times New Roman","dominant-baseline":a,"text-anchor":s},e)),this}begin(){return this._path=void 0,this}move(e,t){let n=this.round;return this._path=(this._path||"")+`M${n(e)} ${n(t)}`,this}line(e,t){if(!this._path)return this.move(e,t);let n=this.round;return this._path+=`L${n(e)} ${n(t)}`,this}quadratic(e,t,n,r){if(!this._path)return this.move(n,r);let a=this.round;return this._path+=`Q${a(e)} ${a(t)} ${a(n)} ${a(r)}`,this}cubic(e,t,n,r,a,s){if(!this._path)return this.move(a,s);let m=this.round;return this._path+=`C${m(e)} ${m(t)} ${m(n)} ${m(r)} ${m(a)} ${m(s)}`,this}close(){return this._path=(this._path||"")+"Z",this}rect(e,t,n,r){return this.move(e,t),this.line(e+n,t),this.line(e+n,t+r),this.line(e,t+r),this.line(e,t),this}arc(e,t,n,r,a,s){r=-r,a=-a;let m=(a-r)*ge;if(m=m-Math.floor(m),m>=.499&&m<=.511){let u=r+(s?.5*m:-.5*m);return this.arc(e,t,n,r,u,s),this.arc(e,t,n,u,a,s),this}let d=e+n*Math.cos(r),c=t+n*Math.sin(r),b=e+n*Math.cos(a),o=t+n*Math.sin(a),h=m<=.5==s,l=this.round;return this.line(d,c),this._path+=`A ${l(n)} ${l(n)} 0 ${h?0:1} ${s?1:0} ${l(b)} ${l(o)}`,this}stroke(){return this._path&&this.svg.append(S("path",_({d:this._path,fill:"none"},this.style.stroke))),this}fill(){return this._path&&this.svg.append(S("path",_({d:this._path},this.style.fill))),this}fillAndStroke(){return this._path&&this.svg.append(S("path",_(_({d:this._path},this.style.fill),this.style.stroke))),this}toXML(){return`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
${this.svg.toString()}`}toFileString(){return this.toXML()}};var N=class{constructor(e,t){this.style={stroke:{color:"black",opacity:1,width:1},fill:{opacity:1,color:"black"},fontSize:13};this.width=e,this.height=t,this.TeX=`\\begin{tikzpicture}[x=1pt,y=-1pt,every node/.style={inner sep=0,outer sep=0}]%
\\fontfamily{ptm}\\selectfont%
\\useasboundingbox (0,0) rectangle (${e},${t});%
\\clip (0,0) rectangle (${e},${t});%
`}round(e){return Math.round(e*1e4)/1e4}_pathAttr(e,t){let{fill:n,stroke:r}=this.style,a;return e&&(a=`fill=${n.color}${n.opacity==1?"":",fill opacity="+n.opacity}`),t&&(a=(a?a+",":"")+`draw=${r.color},line width=${r.width}${r.opacity==1?"":",draw opacity="+r.opacity}`),a}get fillStyle(){throw new Error("not implemented")}set fillStyle(e){let{fill:t}=this.style,n=parseInt("0x"+e.substring(1));e.length===9?(t.opacity=(n&255)/255,n>>=8):t.opacity=1;let r=255&n,a=255&n>>8,s=255&n>>16;s==0&&a==0&&r==0?t.color="black":t.color=`{rgb,255:red,${s}; green,${a}; blue,${r}}`}get strokeStyle(){throw new Error("Not Implemented")}set strokeStyle(e){let{stroke:t}=this.style,n=parseInt("0x"+e.substring(1));e.length===9?(t.opacity=(n&255)/255,n>>=8):t.opacity=1;let r=255&n,a=255&n>>8,s=255&n>>16;s==0&&a==0&&r==0?t.color="black":t.color=`{rgb,255:red,${s}; green,${a}; blue,${r}}`}get lineWidth(){throw new Error("Not Implemented")}set lineWidth(e){this.style.stroke.width=e}get fontSize(){return this.style.fontSize}set fontSize(e){this.style.fontSize=e}set(e){for(var[t,n]of Object.entries(e))switch(t){case"fontSize":this.fontSize=n;break;case"lineWidth":this.lineWidth=n;break;case"fill":this.fillStyle=n;break;case"stroke":this.strokeStyle=n;break;default:let r=t;console.warn(`Unknown option key '${t}'`)}return this}drawText(e,t,n,r=0){let a;switch(r&12){case x.T:a="north";break;case x.B:a="south";break}switch(r&3){case x.L:a=(a?a+" ":"")+"west";break;case x.R:a=(a?a+" ":"")+"east";break}a=a||"center";let s=this.round;return this.TeX+=`\\node at(${s(t)},${s(n)}) [anchor=${a}]{\\fontsize{${this.style.fontSize}pt}{${this.style.fontSize}pt}\\selectfont\\vphantom{Og}${e.replace("\\","\\textbackslash{}")}};`,this}begin(){return this.path=void 0,this.pos=void 0,this}move(e,t){let n=this.round;return this.path=(this.path||"")+` (${n(e)},${n(t)})`,this.pos=[e,t],this}line(e,t){if(!this.path)return this.move(e,t);let n=this.round;return this.path+=` -- (${n(e)},${n(t)})`,this.pos=[e,t],this}quadratic(e,t,n,r){if(!this.path)return this.move(n,r);let[a,s]=this.pos;return this.cubic(a+2/3*(e-a),s+2/3*(t-s),n+2/3*(e-n),r+2/3*(t-r),n,r)}cubic(e,t,n,r,a,s){if(!this.path)return this.move(a,s);let m=this.round;return this.path+=` .. controls (${m(e)},${m(t)}) and (${m(n)},${m(r)}) .. (${m(a)},${m(s)})`,this.pos=[a,s],this}close(){return this.path+=" -- cycle",this}rect(e,t,n,r){return this.move(e,t),this.line(e+n,t),this.line(e+n,t+r),this.line(e,t+r),this.line(e,t),this}arc(e,t,n,r,a,s){r=-r,a=-a;let m=e+n*Math.cos(r),d=t+n*Math.sin(r),c=e+n*Math.cos(a),b=t+n*Math.sin(a);r/=2*Math.PI,a/=2*Math.PI,r-=Math.floor(r),a-=Math.floor(a),s&&a<r&&(a+=1),!s&&r<a&&(a-=1),this.line(m,d);let o=this.round;return this.path+=` arc(${o(r*360)}:${o(a*360)}:${o(n)})`,this.pos=[c,b],this}stroke(){let e=`\\path [${this._pathAttr(!1,!0)}]${this.path};%
`;return this.TeX+=e,this}fill(){let e=`\\path [${this._pathAttr(!0,!1)}]${this.path};%
`;return this.TeX+=e,this}fillAndStroke(){let e=`\\path [${this._pathAttr(!0,!0)}]${this.path};%
`;return this.TeX+=e,this}toTeX(){return this.TeX+"\\end{tikzpicture}"}toFileString(){return this.toTeX()}};var x;(function(c){c[c.C=0]="C",c[c.T=8]="T",c[c.L=2]="L",c[c.R=1]="R",c[c.B=4]="B",c[c.TL=10]="TL",c[c.TR=9]="TR",c[c.BL=6]="BL",c[c.BR=5]="BR"})(x||(x={}));function ee(i,e,t,n){return H(this,null,function*(){var m,d;n!=null||(n=ve);let r=n.create();(m=r.begin)==null||m.call(r);let a=e.apply(i,t),s=a.next();for(;!s.done;)r.shouldYield()&&(yield r.yield()),s=a.next();return(d=r.done)==null||d.call(r),s.value})}function te(i,e,t){let n=e.apply(i,t),r=n.next();for(;!r.done;)r=n.next();return r.value}var ve={create:()=>({shouldYield(){return!1},yield(){return H(this,null,function*(){})}})};function ne(i){let e=i[i.length-1],t;return"create"in e&&(i=Array.prototype.slice.call(i,0,i.length-1),t=e),[t,i]}var re;(function(t){function i(n){return function(...a){let[s,m]=ne(a);return ee(this,n,m,s)}}t.async=i;function e(n){return function(...a){return te(this,n,a)}}t.sync=e})(re||(re={}));var P;(function(t){function i(n){return function(...a){let[s,m]=ne(a);return ee(this,this[n],m,s)}}t.async=i;function e(n){return function(...a){return te(this,this[n],a)}}t.sync=e})(P||(P={}));var M;(function(n){n.Infinity="infinity",n.Complex="complex",n.Moebius="moebius"})(M||(M={}));var R={mathtype:M.Infinity},F=class{constructor(e,t,n=1){this.start=e;this.end=t;this.step=n}*[Symbol.iterator](){let{start:e,step:t,end:n}=this;for(;e<n;)yield e,e+=t}};function xe(i,e){return typeof i=="number"?new k(i,e):Array.isArray(i)?new k(i[0],i[1]):i}var k=class{constructor(e,t=0){this.mathtype=M.Complex;this.real=e,this.imag=t}abs2(){return this.real*this.real+this.imag*this.imag}abs(){return Math.sqrt(this.abs2())}add(e){return typeof e=="number"?new k(this.real+e,this.imag):new k(this.real+e.real,this.imag+e.imag)}sub(e){return typeof e=="number"?new k(this.real-e,this.imag):new k(this.real-e.real,this.imag-e.imag)}mul(e){return typeof e=="number"?new k(e*this.real,e*this.imag):new k(this.real*e.real-this.imag*e.imag,this.imag*e.real+this.real*e.imag)}div(e){return typeof e=="number"?new k(this.real/e,this.imag/e):this.mul(e.inv())}inv(){var e=this.abs2();return new k(this.real/e,-this.imag/e)}arg(){var e=this.real,t=this.imag;if(e==0)return t>0?.5*Math.PI:t<0?1.5*Math.PI:0;if(e>=0){let n=Math.atan(1*t/e);return n<0?2*Math.PI+n:n}return Math.atan(1*t/e)+Math.PI}toTeX(){return this.imag==0?`${this.real}`:this.real==0?`${this.imag}i`:`${this.real} + ${this.imag}i`}},w=class{constructor(e,t,n,r){this.mathtype=M.Moebius;this.m=[e,t,n,r]}mul(e){let t=this.m,n=e.m;return new w(t[0]*n[0]+t[1]*n[2],t[0]*n[1]+t[1]*n[3],t[2]*n[0]+t[3]*n[2],t[2]*n[1]+t[3]*n[3])}inv(){let e=this.m;return new w(e[3],-e[1],-e[2],e[0])}transform(e,t){if(typeof e=="number")e=xe(e,t);else if(e.mathtype===M.Infinity)return this.m[2]==0?R:new k(this.m[0]/this.m[2]);let n=this.m,r=e.mul(n[2]).add(n[3]);return r.real==0&&r.imag==0?R:e.mul(n[0]).add(n[1]).div(r)}toTeX(){return`\\begin{pmatrix}${this.m[0]}&${this.m[1]}\\\\ ${this.m[2]}&${this.m[3]}\\end{pmatrix}`}},ie;(function(b){class i{constructor(h,l){this.cosetRepresentatives=P.sync("_cosetRepresentatives");this.cosetRepresentativesAsync=P.async("_cosetRepresentatives");this.indicator=h,this.tex=l}findCosetIndex(h,l,u){let p=u.inv(),y=this.indicator;for(var v=0;v<l.length;v++)if(y(h,l[v].mul(p)))return v;return-1}findCoset(h,l,u){let p=u.inv(),y=this.indicator;return l.find(v=>y(h,v.mul(p)))}*_cosetRepresentatives(h){if(!Number.isInteger(h)||h<=0)throw"Invalid Level";let l=[new w(0,-1,1,0),new w(1,1,0,1),new w(1,-1,0,1)],u=this,p=[new w(1,0,0,1)];for(var y=[],v=[],C=[new w(1,0,0,1)];C.length>0;){y=v,v=C,C=[];for(let le of v)for(let ue of l){yield;let L=le.mul(ue);u.findCosetIndex(h,y,L)==-1&&u.findCosetIndex(h,C,L)==-1&&u.findCosetIndex(h,v,L)==-1&&(p.push(L),C.push(L))}}return p}toTeX(){return this.tex}}b.CongruenceSubgroup=i;function e(o,h,l){return(o-h)%l==0}function t(o,h){return e(h.m[2],0,o)}b.Gamma_0=new i(t,"\\Gamma_0");function r(o,h){return e(h.m[2],0,o)&&(e(h.m[0],1,o)||e(h.m[0],-1,o))}b.Gamma_1=new i(r,"\\Gamma_1");function s(o,h){return e(h.m[2],0,o)&&e(h.m[1],0,o)&&(e(h.m[0],1,o)||e(h.m[0],-1,o))}b.Gamma=new i(s,"\\Gamma"),b.Gamma.cosetRepresentatives=function(o){let h=b.Gamma_1.cosetRepresentatives(o),l=[];for(let u=0;u<o;u++){let p=new w(1,u,0,1);l.push(...h.map(y=>p.mul(y)))}return l},b.Gamma._cosetRepresentatives=function*(o){let h=yield*b.Gamma_1._cosetRepresentatives(o),l=[];for(let u=0;u<o;u++){yield;let p=new w(1,u,0,1);l.push(...h.map(y=>p.mul(y)))}return l};let d=new k(Math.cos(Math.PI/3),Math.sin(Math.PI/3));b.Domain1={corners:[R,d,new k(0,1),new k(-d.real,d.imag)],findCosetOf(o,h=100){if(o.imag<=0)return;let l=new w(1,0,0,1),u=o;for(var p=0;p<h;p++){if(u==R)return l.inv();var y=Math.floor(u.real+.5);if(l=new w(1,-y,0,1).mul(l),u=l.transform(o),u.abs2()>=1)return l.inv();l=new w(0,1,-1,0).mul(l),u=l.transform(o)}console.log("Max iterations in 'findMoebiousToFund' reached")}}})(ie||(ie={}));var g;(function(u){u[u.BEGIN=0]="BEGIN",u[u.MOVE=1]="MOVE",u[u.LINE=2]="LINE",u[u.QUADRATIC=3]="QUADRATIC",u[u.CUBIC=4]="CUBIC",u[u.ARC=5]="ARC",u[u.CLOSE=6]="CLOSE",u[u.STROKE=7]="STROKE",u[u.FILL=8]="FILL",u[u.TEXTNODE=9]="TEXTNODE",u[u.CH_LINEWIDTH=10]="CH_LINEWIDTH",u[u.CH_FONTSIZE=11]="CH_FONTSIZE",u[u.CH_STROKESTYLE=12]="CH_STROKESTYLE",u[u.CH_FILLSTYLE=13]="CH_FILLSTYLE"})(g||(g={}));var z=class{constructor(){this.data=[]}get strokeStyle(){throw new Error("Method not implemented.")}get fontSize(){throw new Error("Method not implemented.")}get lineWidth(){throw new Error("Method not implemented.")}get fillStyle(){throw new Error("Method not implemented.")}set strokeStyle(e){this.data.push(12,e)}set fillStyle(e){this.data.push(13,e)}set lineWidth(e){this.data.push(10,e)}set fontSize(e){this.data.push(11,e)}set(e){var t,n;for([t,n]of Object.entries(e))switch(t){case"fontSize":this.fontSize=n;break;case"lineWidth":this.lineWidth=n;break;case"fill":this.fillStyle=n;break;case"stroke":this.strokeStyle=n;break;default:let r=t;console.warn(`Unknown option key '${t}'`)}return this}measureText(e){throw new Error("Method not implemented.")}drawText(e,t,n,r=0){return this.data.push(9,e,t,n,r),this}begin(){return this.data.push(0),this}move(e,t){return this.data.push(1,e,t),this}line(e,t){return this.data.push(2,e,t),this}quadratic(e,t,n,r){return this.data.push(3,e,t,n,r),this}cubic(e,t,n,r,a,s){return this.data.push(4,e,t,n,r,a,s),this}close(){return this.data.push(6),this}rect(e,t,n,r){return this.move(e,t),this.line(e+n,t),this.line(e+n,t+r),this.line(e,t+r),this.line(e,t),this}arc(e,t,n,r,a,s){return this.data.push(5,e,t,n,r,a,s),this}stroke(){return this.data.push(7),this}fill(){return this.data.push(8),this}fillAndStroke(){return this.fill(),this.stroke(),this}applyWith(e,t){let n=(t==null?void 0:t.scale)||1,[r,a]=(t==null?void 0:t.origin)||[0,0],s=this.data,m,d;for(d=0;d<this.data.length;d++)switch(m=s[d],m){case 0:e.begin();break;case 11:e.set({fontSize:s[++d]});break;case 10:e.set({lineWidth:s[++d]});break;case 12:e.set({stroke:s[++d]});break;case 13:e.set({fill:s[++d]});break;case 8:e.fill();break;case 2:e.line(n*s[++d]+r,n*s[++d]+a);break;case 3:e.quadratic(n*s[++d]+r,n*s[++d]+a,n*s[++d]+r,n*s[++d]+a);break;case 4:e.cubic(n*s[++d]+r,n*s[++d]+a,n*s[++d]+r,n*s[++d]+a,n*s[++d]+r,n*s[++d]+a);break;case 5:e.arc(n*s[++d]+r,n*s[++d]+a,n*s[++d],s[++d],s[++d],s[++d]);break;case 1:e.move(n*s[++d]+r,n*s[++d]+a);break;case 7:e.stroke();break;case 9:e.drawText(s[++d],n*s[++d]+r,n*s[++d]+a,s[++d]);break;case 6:e.close();break;default:let c=m}}};var at=2*Math.PI,ae=.5/Math.PI,st=.5/Math.PI,$=class extends z{constructor(){super(...arguments);this.minX=Number.POSITIVE_INFINITY;this.minY=Number.POSITIVE_INFINITY;this.maxX=Number.NEGATIVE_INFINITY;this.maxY=Number.NEGATIVE_INFINITY}addVisiblePoint(e,t){this.minX=Math.min(e,this.minX),this.maxX=Math.max(e,this.maxX),this.minY=Math.min(t,this.minY),this.maxY=Math.max(t,this.maxY)}arc(e,t,n,r,a,s){super.arc(e,t,n,r,a,s),this.addVisiblePoint(e+n*Math.cos(r),t-n*Math.sin(r)),this.addVisiblePoint(e+n*Math.cos(a),t-n*Math.sin(a));let m=r*ae;m=(m-Math.floor(m))*4;let d=a*ae;if(d=(d-Math.floor(d))*4,s){let c=m;m=d,d=c}d<m&&(d+=4);for(let c=Math.ceil(m);c<d;c++){let b=c%2==0;this.addVisiblePoint(e+(b?c==0||c==4?n:-n:0),t+(b?0:c==1||c==5?-n:n))}return this}move(e,t){return super.move(e,t),this.addVisiblePoint(e,t),this}line(e,t){return super.line(e,t),this.addVisiblePoint(e,t),this}applyScaled(e,t,n,r){let a=(r==null?void 0:r.buffer)||0,{minX:s=0,maxX:m=0,minY:d=0,maxY:c=0}=this,b=Math.min((t-2*a)/(m-s),(n-2*a)/(c-d)),o=[.5*(t-b*(s+m)),.5*(n-b*(d+c))];super.applyWith(e,{scale:b,origin:o})}};function ke(i,e,t="text/plain"){let n=`data:${t};base64,${window.btoa(i)}`,r=document.createElement("a");r.setAttribute("download",e),r.href=n,r.click()}function se(i,e){let{N:t,J:n,W:r}=e,{shadeTop:a="#0000FF33",shadeFront:s="#ffcc0033",shadeSide:m="#444444"}=e.color||{},d=Math.log(t/r)/n,c=[...new F(0,n+1)].map(l=>r*Math.exp(l*d)),b=1/4,o=(l,u,p)=>[l-p*b,t-(u-.8*p*b)];function h(l,[u,p,y]){let v="ff";i.set({fill:s+v}),i.begin(),i.move(...o(l[u],l[p],l[y])).line(...o(l[u-1],l[p],l[y])).line(...o(l[u-1],l[p-1],l[y])).line(...o(l[u],l[p-1],l[y])).close().fill().stroke(),i.set({fill:a+v}),i.begin(),i.move(...o(l[u],l[p],l[y])).line(...o(l[u-1],l[p],l[y])).line(...o(l[u-1],l[p],l[y-1])).line(...o(l[u],l[p],l[y-1])).close().fill().stroke(),i.set({fill:m+v}),i.begin(),i.move(...o(l[u],l[p],l[y])).line(...o(l[u],l[p],l[y-1])).line(...o(l[u],l[p-1],l[y-1])).line(...o(l[u],l[p-1],l[y])).close().fill().stroke()}i.set({lineWidth:1.5,stroke:"#000000"}),i.begin(),i.move(...o(r,r,r)).line(...o(t+(t-r)*.1,r,r)),i.move(...o(r,r,r)).line(...o(r,t+(t-r)*.1,r)),i.move(...o(r,r,r)).line(...o(r,r,t+(t-r)*.1)),i.stroke(),i.set({lineWidth:.75});for(let l=1;l<c.length;l++)for(let u=1;u<c.length-l+1;u++)h(c,[l,u,c.length+1-l-u])}function oe(i,e){let{N:t,J:n,W:r}=e,{fill:a="#0000FF33",error:s="#ffcc0033",gridLine:m="#444444",hypLine:d="#000000"}=e.color||{},c=Math.log(t/r)/n,b=[...new F(0,n+1)].map(y=>r*Math.exp(y*c));i.set({fill:a,stroke:m,lineWidth:1.5}),i.begin(),i.move(b[0],t-b[0]).line(b[0],t-b[n]);for(var o=1;o<b.length;o++)i.line(b[o-1],t-b[n-o]).line(b[o],t-b[n-o]);i.line(b[n],t-b[0]).close(),i.fill(),i.begin(),i.set({lineWidth:1.5,fill:s}),i.move(b[0],t-b[n]);for(var o=1;o<b.length;o++)i.line(b[o-1],t-b[n-o+1]).line(b[o],t-b[n-o+1]);for(var o=n;o>0;o--)i.line(b[o],t-b[n-o]).line(b[o-1],t-b[n-o]);i.line(b[0],t-b[n]),i.fill();let h;i.set({lineWidth:1}),i.begin(),h=[b[1],t-b[n]],i.move(r,t-r).line(r,h[1]).line(h[0],h[1]).line(h[0],t-r),h=[b[n],t-b[1]],i.move(r,t-r).line(h[0],t-r).line(h[0],h[1]).line(r,h[1]);let l=n+1,u=2;for(var o=u;o<=l-u;o++)h=[b[o],t-b[l-o]],i.move(r,h[1]).line(h[0],h[1]).line(h[0],t-r);i.stroke(),i.begin();let p=100;i.set({lineWidth:2,stroke:d}),i.move(r,t-r);for(let y of[...new F(0,p+1)]){let v=Math.pow(t/r,y/p);i.line(r*v,t-t/v)}i.close(),i.stroke()}window.customElements.define("hyperbola-app",q({connected(i){let e={N:100,W:10,J:10,dim:"3D",color:{shadeTop:"#bbbbbb",shadeFront:"#555555",shadeSide:"#111111",hypLine:"#000000",gridLine:"#000000",fill:"#333333",error:"#999999"}};i.addLayer("draw",Y({update(n,r){r.clearRect(0,0,n.width,n.height);let a=new $;e.dim=="2D"?oe(a,e):se(a,e),a.applyScaled(new I(r),n.width,n.height,{buffer:10})}}));let t=i.addLayer("options",B());t.add("number",{label:"Cuts",onChange:n=>{e.J=n,i.update()},default:e.J}),t.add("radio",{label:"Dimension",values:[{name:"2D",label:"2D"},{name:"3D",label:"3D"}],default:e.dim,onChange:n=>{e.dim=n,i.update()}}),t.add("color",{label:"3D-top",onChange:n=>{e.color.shadeTop=n,i.update()},default:e.color.shadeTop}),t.add("color",{label:"3D-front",onChange:n=>{e.color.shadeFront=n,i.update()},default:e.color.shadeFront}),t.add("color",{label:"3D-side",onChange:n=>{e.color.shadeSide=n,i.update()},default:e.color.shadeSide}),t.add("color",{label:"2D-lower",onChange:n=>{e.color.fill=n,i.update()},default:e.color.fill}),t.add("color",{label:"2D-upper",onChange:n=>{e.color.error=n,i.update()},default:e.color.error}),t.add(V,i),t.add("multiButton",{label:"Export as",values:[{name:"SVG",label:"SVG"},{name:"TikZ",label:"TikZ"}],onClick(n){let r,a="Hyperbola",s;if(n=="SVG")r=new O(i.width,i.height),a+=".svg",s="image/svg+xml";else if(n=="TikZ")r=new N(i.width,i.height),a+=".tikz",s="text/plain";else throw new Error("Unknown format");let m=new $;e.dim=="2D"?oe(m,e):se(m,e),m.applyScaled(r,i.width,i.height,{buffer:10}),ke(r.toFileString(),a,s)}})}}));})();
