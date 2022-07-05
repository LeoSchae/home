(()=>{var Fe=Object.defineProperty;var ae=Object.getOwnPropertySymbols;var Ie=Object.prototype.hasOwnProperty,ze=Object.prototype.propertyIsEnumerable;var se=(a,e,t)=>e in a?Fe(a,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[e]=t,S=(a,e)=>{for(var t in e||(e={}))Ie.call(e,t)&&se(a,t,e[t]);if(ae)for(var t of ae(e))ze.call(e,t)&&se(a,t,e[t]);return a};var E=(a,e,t)=>new Promise((r,n)=>{var i=d=>{try{s(t.next(d))}catch(h){n(h)}},o=d=>{try{s(t.throw(d))}catch(h){n(h)}},s=d=>d.done?r(d.value):Promise.resolve(d.value).then(i,o);s((t=t.apply(a,e)).next())});function B(a,e=[],t={},r={}){let n=document.createElement(a);for(let[o,s]of Object.entries(t))n.setAttribute(o,typeof s=="string"?s:s+"");for(let[o,s]of Object.entries(r))n[o]=s;if(Array.isArray(e))for(var i of e)typeof i=="string"&&(i=document.createTextNode(i)),n.append(i);else n.innerHTML=e.__html;return n}function V(a,e){for(var t of e)Array.isArray(t)?V(a,t):a.append(t instanceof Node?t:""+t)}function y(a,e,...t){if(a===y.Fragment){let o=document.createDocumentFragment();return V(o,t),o}let r=document.createElement(a);e=e||{},"__html"in e&&(r.innerHTML=""+e.__html,delete e.__html);for(var[n,i]of Object.entries(e))typeof i=="function"?r[n]=i:r.setAttribute(n,""+i);return V(r,t),r}y.Fragment="";var He=`:host{position:relative;top:0;left:0;display:block;width:100%;height:100%;overflow:hidden;padding:0;margin:0}._container_1kdby_13{display:block;position:absolute;width:100%;height:100%;touch-action:none;-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}._container_1kdby_13>div,._container_1kdby_13>canvas{position:absolute;top:0;left:0;width:100%;height:100%}
`,Ge={container:"_container_1kdby_13"},J={css:He,class:Ge};function Q(a){return{update(e,t){let r=t.getContext("2d"),n=window.devicePixelRatio;(Math.floor(e.width*n)!==t.width||Math.floor(e.height*n)!==t.height)&&(t.width=Math.floor(e.width*n),t.height=Math.floor(e.height*n)),r.setTransform(n,0,0,n,0,0),a.update(e,r)},resized(e){e.update(this)},connected(e){return{nodes:B("canvas",[],{class:"canvas-layer"})}}}}var De="._button_1auyb_1{--_fg:#def;--_bg:hsl(207,100%,40%);--_fgHov:white;--_bgHov:hsl(207,100%,20%);position:absolute;bottom:1em;right:1em;width:50px;height:50px;padding:10px;border-radius:50%;border:none;background-color:var(--_bg);color:var(--_fg);z-index:99}._button_1auyb_1:hover{background-color:var(--_bgHov);color:var(--_fgHov)}._button_1auyb_1:active{transform:translateY(1px)}._icon_1auyb_28{display:block;width:100%;height:100%}.active ._icon_1auyb_28{display:none}._icon_x_1auyb_38{display:none;width:100%;height:100%}.active ._icon_x_1auyb_38{display:block}._container_1auyb_48{display:none;position:absolute;overflow:scroll;top:0;right:0;width:100%;height:100%;background-color:#eeeeeeaa;margin:0;padding:20px;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;z-index:99}._list_1auyb_66{display:grid;display:block;grid-template-columns:repeat(auto-fill,250px);margin:auto}dialog::backdrop{background:rgba(0,0,0,0.9)}",qe={button:"_button_1auyb_1",icon:"_icon_1auyb_28",icon_x:"_icon_x_1auyb_38",container:"_container_1auyb_48",list:"_list_1auyb_66"},L={css:De,class:qe};var We={section:function(a,e){var t;return{input:y((t=e==null?void 0:e.level)!=null?t:"h2",{},a)}},number:function(a){let e=a.onChange;return{label:y("label",null,a.label),input:y("input",S({type:"number",oninput:t=>{e==null||e(parseInt(t.target.value))}},a.default?{value:a.default}:{}))}},color:function(a){let e=a.onChange;return{label:y("label",null,a.label),input:y("input",S({type:"color",oninput:t=>{e==null||e(t.target.value)}},a.default?{value:a.default}:{}))}},radio:function(a){let e=a.onChange;return{label:y("label",null,a.label),input:y(y.Fragment,null,a.values.map(t=>y(y.Fragment,null,y("label",null,t.label,y("input",S({type:"radio",name:a.label,value:t.name,oninput:r=>{e==null||e(r.target.value)}},t.name===a.default?{checked:""}:{}))),y("span",{style:"display:inline-block;width:1em;"}))))}},multiButton:function(a){let e=a.onClick;return{label:y("label",null,a.label),input:y(y.Fragment,null,a.values.map(t=>y("button",{value:t.name,onclick:r=>{e==null||e(r.target.value)}},t.label)))}},custom:function(a){return{label:typeof a.label=="string"?y("span",null,a.label):a.label,input:a.input}}};function j(){return a=>{let e=y("div",{class:L.class.container},y("h1",null,"Options")),t=y("button",{"arial-label":"Options Toggle",class:L.class.button,title:"Show all options",__html:`<svg xmlns="http://www.w3.org/2000/svg" class="${L.class.icon}" viewBox="0 0 24 24" style="fill:currentColor;"><path d="M19.9,13.3C20,12.8,20,12.4,20,12s0-0.8-0.1-1.3L21.8,9l-2.3-4l-2.4,0.8c-0.7-0.5-1.4-1-2.2-1.3L14.3,2H9.7L9.2,4.5	C8.3,4.8,7.6,5.3,6.9,5.8L4.5,5L2.2,9l1.9,1.7C4,11.2,4,11.6,4,12c0,0.4,0,0.8,0.1,1.3L2.2,15l2.3,4l2.4-0.8l0,0	c0.7,0.5,1.4,1,2.2,1.3L9.7,22h4.7l0.5-2.5c0.8-0.3,1.6-0.7,2.2-1.3l0,0l2.4,0.8l2.3-4L19.9,13.3L19.9,13.3z M12,16	c-2.2,0-4-1.8-4-4c0-2.2,1.8-4,4-4c2.2,0,4,1.8,4,4C16,14.2,14.2,16,12,16z"></path></svg><svg class="${L.class.icon_x}" version="1.1" viewBox="0 0 460.78 460.78" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="m285.08 230.4 171.14-171.13c6.076-6.077 6.076-15.911 0-21.986l-32.707-32.719c-2.913-2.911-6.866-4.55-10.992-4.55-4.127 0-8.08 1.639-10.993 4.55l-171.14 171.14-171.14-171.14c-2.913-2.911-6.866-4.55-10.993-4.55-4.126 0-8.08 1.639-10.992 4.55l-32.707 32.719c-6.077 6.075-6.077 15.909 0 21.986l171.14 171.13-171.12 171.11c-6.074 6.077-6.074 15.911 0 21.986l32.709 32.719c2.911 2.911 6.865 4.55 10.992 4.55s8.08-1.639 10.994-4.55l171.12-171.12 171.12 171.12c2.913 2.911 6.866 4.55 10.993 4.55 4.128 0 8.081-1.639 10.992-4.55l32.709-32.719c6.074-6.075 6.074-15.909 0-21.986l-171.12-171.11z"/></svg>`,onclick:()=>{let n=e.style.display=="block";e.style.display=n?"":"block",n?t.classList.remove("active"):t.classList.add("active")}}),r=new le;return r.container.className=L.class.list,e.append(r.container),a.attachToShaddow(y("style",{__html:L.css}),e,t),{nodes:void 0,handle:r}}}function oe(a){let e=y("input",{type:"number",style:"width:6em;"}),t=y("input",{type:"number",style:"width:6em;"}),r=y("span",null,"auto sizing"),n=new ResizeObserver(()=>{if(a.containerElement.style.width==="")return;let b=a.hostElement;if(!b)return;let{clientWidth:l,clientHeight:m}=a.containerElement,{clientWidth:c,clientHeight:u}=b,f=Math.min(c/l,u/m);a.containerElement.style.transformOrigin="top left",a.containerElement.style.transform=`translate(${(c-l*f)/2}px, ${(u-m*f)/2}px) scale(${f}, ${f})`}),i=!1,o=(b,l)=>{let m=b<0||l<0||isNaN(b)||isNaN(l);m&&i&&(n.unobserve(a.containerElement),n.unobserve(a.hostElement),i=!1),!i&&!m&&(n.observe(a.containerElement),n.observe(a.hostElement),i=!0),m?(a.containerElement.style.width="",a.containerElement.style.height="",a.containerElement.style.outline="",a.containerElement.style.transform="",a.containerElement.style.transformOrigin="",r.textContent="auto sizing"):(a.containerElement.style.width=b+"px",a.containerElement.style.height=l+"px",a.containerElement.style.outline="1px dashed black",r.textContent=b+" x "+l),s.close()},s=y("dialog",null,y("form",{onsubmit:()=>(o(parseInt(e.value),parseInt(t.value)),!1)},y("p",null,"Choose new size:"),e," x ",t,y("br",null),y("input",{type:"submit",value:"Apply"}),y("input",{type:"button",value:"Reset",onclick:()=>{o(-1,-1)}}))),d,h;return d=y("span",null,y("input",{type:"button",value:"Change",onclick:()=>{s.showModal()}}),s),{label:y("span",null,"Canvas size (",r,")"),input:d}}var le=class{constructor(){this.container=y("div",null)}add(e,...t){Array.isArray(e)&&(t=e.slice(1),e=e[0]);var n=(typeof e=="function"?e:We[e])(...t);if(this.addOption(n),"handle"in n)return n.handle}addOption(e){this.container.appendChild(y("div",{style:"margin-top: 10px;"},e.label?y("div",null,y("b",null,e.label,":")):[],y("div",null,e.input)))}};var ue=class extends HTMLElement{constructor(){super(...arguments);this.shadow=this.attachShadow({mode:"open"});this.cleanup=[]}connectedCallback(){var h,b;let e=this.shadow;e.innerHTML="";let t=B("style",[J.css]),r=B("div",[],{class:J.class.container}),n=new ResizeObserver(()=>{var m,c,u,f;(c=(m=this.layerHandler).resized)==null||c.call(m,d);for(var l of i.values())(f=(u=l.layer)==null?void 0:u.resized)==null||f.call(u,d,l.nodes)});n.observe(r),e.append(t,r);let i=new Map,o=0,s=()=>{var c,u;let l=o===2;o=0;for(var m of i.values())(l||m.update)&&((u=(c=m.layer)==null?void 0:c.update)==null||u.call(c,d,m.nodes)),m.update=!1},d={get width(){return r.clientWidth},get height(){return r.clientHeight},containerElement:r,hostElement:this,update:function(l){if(o!==2){if(o===0&&requestAnimationFrame(s),l===void 0){o=2;return}if(typeof l=="string"){o=1;let c=i.get(l);c&&(c.update=!0);return}for(var m of i.values())l===m.layer&&(m.update=!0)}},addStyles:function(l){t.append(l)},addLayer:function(l,m){if(m instanceof Node){r.appendChild(m);return}let c,u;typeof m=="function"?(u=m(d),c=void 0):(u=m.connected(d),c=m);let f=u.nodes;f&&(Array.isArray(f)?r.append(...f):r.append(f)),i.set(l,{nodes:f,layer:c,update:!1}),d.update(l);let g=u.handle;return g||(g={}),g.update=()=>{this.update(l)},g},attachToShaddow(...l){e.append(...l)}};(b=(h=this.layerHandler).connected)==null||b.call(h,d),this.cleanup.push(()=>{var m,c,u,f;n.unobserve(r);for(var l of i.values())(c=(m=l.layer)==null?void 0:m.disconnected)==null||c.call(m,d);(f=(u=this.layerHandler).disconnected)==null||f.call(u,d)})}disconnectedCallback(){for(var e of this.cleanup)e();this.cleanup=[],this.shadow.innerHTML=""}};function me(a){return class extends ue{constructor(){super(...arguments);this.layerHandler=a}}}function he(a,e,t,r){return E(this,null,function*(){var s,d;r!=null||(r=Xe);let n=r.create();(s=n.begin)==null||s.call(n);let i=e.apply(a,t),o=i.next();for(;!o.done;)n.shouldYield()&&(yield n.yield()),o=i.next();return(d=n.done)==null||d.call(n),o.value})}function de(a,e,t){let r=e.apply(a,t),n=r.next();for(;!n.done;)n=r.next();return n.value}var Xe={create:()=>({shouldYield(){return!1},yield(){return E(this,null,function*(){})}})};function be(a){let e=a[a.length-1],t;return"create"in e&&(a=Array.prototype.slice.call(a,0,a.length-1),t=e),[t,a]}var ce;(function(t){function a(r){return function(...i){let[o,s]=be(i);return he(this,r,s,o)}}t.async=a;function e(r){return function(...i){return de(this,r,i)}}t.sync=e})(ce||(ce={}));var $;(function(t){function a(r){return function(...i){let[o,s]=be(i);return he(this,this[r],s,o)}}t.async=a;function e(r){return function(...i){return de(this,this[r],i)}}t.sync=e})($||($={}));var O;(function(r){r.Infinity="infinity",r.Complex="complex",r.Moebius="moebius"})(O||(O={}));var z={mathtype:O.Infinity},F=class{constructor(e,t,r=1){this.start=e;this.end=t;this.step=r}*[Symbol.iterator](){let{start:e,step:t,end:r}=this;for(;e<r;)yield e,e+=t}};function Ae(a,e){return typeof a=="number"?new w(a,e):Array.isArray(a)?new w(a[0],a[1]):a}var w=class{constructor(e,t=0){this.mathtype=O.Complex;this.real=e,this.imag=t}abs2(){return this.real*this.real+this.imag*this.imag}abs(){return Math.sqrt(this.abs2())}add(e){return typeof e=="number"?new w(this.real+e,this.imag):new w(this.real+e.real,this.imag+e.imag)}sub(e){return typeof e=="number"?new w(this.real-e,this.imag):new w(this.real-e.real,this.imag-e.imag)}mul(e){return typeof e=="number"?new w(e*this.real,e*this.imag):new w(this.real*e.real-this.imag*e.imag,this.imag*e.real+this.real*e.imag)}div(e){return typeof e=="number"?new w(this.real/e,this.imag/e):this.mul(e.inv())}inv(){var e=this.abs2();return new w(this.real/e,-this.imag/e)}arg(){var e=this.real,t=this.imag;if(e==0)return t>0?.5*Math.PI:t<0?1.5*Math.PI:0;if(e>=0){let r=Math.atan(1*t/e);return r<0?2*Math.PI+r:r}return Math.atan(1*t/e)+Math.PI}toTeX(){return this.imag==0?`${this.real}`:this.real==0?`${this.imag}i`:`${this.real} + ${this.imag}i`}},C=class{constructor(e,t,r,n){this.mathtype=O.Moebius;this.m=[e,t,r,n]}mul(e){let t=this.m,r=e.m;return new C(t[0]*r[0]+t[1]*r[2],t[0]*r[1]+t[1]*r[3],t[2]*r[0]+t[3]*r[2],t[2]*r[1]+t[3]*r[3])}inv(){let e=this.m;return new C(e[3],-e[1],-e[2],e[0])}transform(e,t){if(typeof e=="number")e=Ae(e,t);else if(e.mathtype===O.Infinity)return this.m[2]==0?z:new w(this.m[0]/this.m[2]);let r=this.m,n=e.mul(r[2]).add(r[3]);return n.real==0&&n.imag==0?z:e.mul(r[0]).add(r[1]).div(n)}toTeX(){return`\\begin{pmatrix}${this.m[0]}&${this.m[1]}\\\\ ${this.m[2]}&${this.m[3]}\\end{pmatrix}`}},pe;(function(b){class a{constructor(m,c){this.cosetRepresentatives=$.sync("_cosetRepresentatives");this.cosetRepresentativesAsync=$.async("_cosetRepresentatives");this.indicator=m,this.tex=c}findCosetIndex(m,c,u){let f=u.inv(),g=this.indicator;for(var v=0;v<c.length;v++)if(g(m,c[v].mul(f)))return v;return-1}findCoset(m,c,u){let f=u.inv(),g=this.indicator;return c.find(v=>g(m,v.mul(f)))}*_cosetRepresentatives(m){if(!Number.isInteger(m)||m<=0)throw"Invalid Level";let c=[new C(0,-1,1,0),new C(1,1,0,1),new C(1,-1,0,1)],u=this,f=[new C(1,0,0,1)];for(var g=[],v=[],T=[new C(1,0,0,1)];T.length>0;){g=v,v=T,T=[];for(let Y of v)for(let ie of c){yield;let N=Y.mul(ie);u.findCosetIndex(m,g,N)==-1&&u.findCosetIndex(m,T,N)==-1&&u.findCosetIndex(m,v,N)==-1&&(f.push(N),T.push(N))}}return f}toTeX(){return this.tex}}b.CongruenceSubgroup=a;function e(l,m,c){return(l-m)%c==0}function t(l,m){return e(m.m[2],0,l)}b.Gamma_0=new a(t,"\\Gamma_0");function n(l,m){return e(m.m[2],0,l)&&(e(m.m[0],1,l)||e(m.m[0],-1,l))}b.Gamma_1=new a(n,"\\Gamma_1");function o(l,m){return e(m.m[2],0,l)&&e(m.m[1],0,l)&&(e(m.m[0],1,l)||e(m.m[0],-1,l))}b.Gamma=new a(o,"\\Gamma"),b.Gamma.cosetRepresentatives=function(l){let m=b.Gamma_1.cosetRepresentatives(l),c=[];for(let u=0;u<l;u++){let f=new C(1,u,0,1);c.push(...m.map(g=>f.mul(g)))}return c},b.Gamma._cosetRepresentatives=function*(l){let m=yield*b.Gamma_1._cosetRepresentatives(l),c=[];for(let u=0;u<l;u++){yield;let f=new C(1,u,0,1);c.push(...m.map(g=>f.mul(g)))}return c};let d=new w(Math.cos(Math.PI/3),Math.sin(Math.PI/3));b.Domain1={corners:[z,d,new w(0,1),new w(-d.real,d.imag)],findCosetOf(l,m=100){if(l.imag<=0)return;let c=new C(1,0,0,1),u=l;for(var f=0;f<m;f++){if(u==z)return c.inv();var g=Math.floor(u.real+.5);if(c=new C(1,-g,0,1).mul(c),u=c.transform(l),u.abs2()>=1)return c.inv();c=new C(0,1,-1,0).mul(c),u=c.transform(l)}console.log("Max iterations in 'findMoebiousToFund' reached")}}})(pe||(pe={}));var p;(function(h){h[h.C=0]="C",h[h.T=8]="T",h[h.L=2]="L",h[h.R=1]="R",h[h.B=4]="B",h[h.TL=10]="TL",h[h.TR=9]="TR",h[h.BL=6]="BL",h[h.BR=5]="BR"})(p||(p={}));(function(t){function a(r){return r&12}t.vertical=a;function e(r){return r&3}t.horizontal=e})(p||(p={}));function I(a){if(!a)return;if(typeof a!="string")return a;let e=parseInt("0x"+a.substring(1)),t;a.length===9&&(t=(e&255)/255,e>>=8);let r=255&e,n=255&e>>8,i=255&e>>16;return t===void 0?[i,n,r]:[i,n,r,t]}function ee(a){let e={};for(let[t,r]of Object.entries(a))if(r!==void 0)switch(t){case"fill":e.fill=I(r);break;case"stroke":e.stroke=I(r);break;case"lineWidth":e.lineWidth=r;break;case"fontSize":e.fontSize=r;break;default:console.log("Unknown style option '"+t+"'")}return e}function fe(a){let e={_backend:a,clear(t){return this._backend.clear(I(t)),this},save(){return this._backend.save(),this},restore(){return this._backend.restore(),this},style(t){return this._backend.style(ee(t)),this},path(){return new ye(this._backend.path())},primitive(){var t,r;return new ve(this,(r=(t=this._backend).primitive)==null?void 0:r.call(t))}};return"text"in a&&(e.text=function(){return this._backend.text()}),e}var ye=class{constructor(e){this.backend=e;this.isSet=!1;this.sx=NaN;this.sy=NaN;this.cx=NaN;this.cy=NaN}_c(e,t){this.cx=e,this.cy=t}move(e,t){return this.isSet=!0,this.backend.move(e,t),this.sx=e,this.sy=t,this._c(e,t),this}line(e,t){return this.isSet?(this.backend.line(e,t),this._c(e,t),this):this.move(e,t)}cubic(e,t,r,n,i,o){return this.isSet||this.move(i,o),this.backend.cubic(e,t,r,n,i,o),this._c(i,o),this}quadratic(e,t,r,n){if(this.isSet||this.move(r,n),this.backend.quadratic)this.backend.quadratic(e,t,r,n),this._c(r,n);else{let i=this.cx,o=this.cy;this.backend.cubic(i+2/3*(e-i),o+2/3*(t-o),r+2/3*(e-r),n+2/3*(t-n),r,n),this._c(r,n)}return this}ellipse(e,t,r,n,i,o,s){return this.line(...x(e,t,r,n,i,o)),this.backend.ellipse(e,t,r,n,i,o,s),this._c(...x(e,t,r,n,i,o+s)),this}arc(e,t,r,n,i){return this.backend.arc?(this.line(...x(e,t,r,r,0,n)),this.backend.arc(e,t,r,n,i),this):this.ellipse(e,t,r,r,0,n,i)}close(){if(!this.isSet)throw new Error("No path to close");return this.backend.close(),this._c(this.sx,this.sy),this}draw(e=!0,t=!0){return this.backend.draw(e,t),this}fill(){return this.draw(!1,!0)}stroke(){return this.draw(!0,!1)}clip(){return this.backend.clip(),this}};function ge(a){return{draw:(e=!0,t=!0)=>a.draw(e,t),stroke:()=>a.draw(!0,!1),fill:()=>a.draw(!1,!0)}}var ve=class{constructor(e,t){this.r=e;this.b=t}circle(e,t,r,n=0){var o;if((o=this.b)==null?void 0:o.circle)return ge(this.b.circle(e,t,r,n));let i=.5*r;switch(p.vertical(n)){case p.T:t-=i;break;case p.B:t+=i;break;case p.C:break}switch(p.horizontal(n)){case p.L:e-=i;break;case p.R:e+=i;break;case p.C:break}return this.r.path().arc(e,t,i,0,.999).close()}square(e,t,r,n=0){var o;if((o=this.b)==null?void 0:o.square)return ge(this.b.square(e,t,r,n));let i=.5*r;switch(p.vertical(n)){case p.T:t-=i;break;case p.B:t+=i;break;case p.C:break}switch(p.horizontal(n)){case p.L:e-=i;break;case p.R:e+=i;break;case p.C:break}return this.r.path().move(e-i,t-i).line(e+i,t-i).line(e+i,t+i).line(e-i,t+i).close()}};var M;(function(r){r.from=fe,r.toBackendStyle=ee,r.Color=I})(M||(M={}));var te=2*Math.PI;function re(a){let e="#"+a[0].toString(16).padStart(2,"0")+a[1].toString(16).padStart(2,"0")+a[2].toString(16).padStart(2,"0");return a[3]&&(e+=Math.round(a[3]*255).toString(16).padStart(2,"0")),e}var ke=class{constructor(e){this.ctx=e;this._path=new Path2D}move(e,t){return this._path.moveTo(e,t),this}line(e,t){return this._path.lineTo(e,t),this}cubic(e,t,r,n,i,o){return this._path.bezierCurveTo(e,t,r,n,i,o),this}ellipse(e,t,r,n,i,o,s){return s*=te,o*=te,i*=te,this._path.ellipse(e,t,r,n,-i,-o,-o-s,s>=0),this}close(){return this._path.closePath(),this}draw(e,t){return t&&this.ctx.fill(this._path),e&&this.ctx.stroke(this._path),this}clip(){return this.ctx.clip(this._path),this}},we=class{constructor(e){this.ctx=e;this.fontSize=9}draw(e,t,r,n=p.C){let i="middle",o="center",s=p.vertical(n),d=p.horizontal(n);switch(s){case p.T:i="top";break;case p.B:i="bottom";break;case p.C:break;default:let h=s}switch(d){case p.L:o="left";break;case p.R:o="right";break;case p.C:break;default:let h=d}return this.ctx.textBaseline=i,this.ctx.textAlign=o,this.ctx.fillText(r,e,t),this}},H=class{constructor(e){this.ctx=e}clear(e){return this.ctx.clearRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height),e&&(this.ctx.save(),this.ctx.setTransform(1,0,0,1,0,0),this.ctx.fillStyle=re(e),this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height),this.ctx.restore()),this}save(){return this.ctx.save(),this}restore(){return this.ctx.restore(),this}style(e){let t;for(let[r,n]of Object.entries(e))switch(r){case"fill":t=n,this.ctx.fillStyle=re(t);break;case"stroke":t=n,this.ctx.strokeStyle=re(t);break;case"lineWidth":this.ctx.lineWidth=n;break;case"fontSize":this.ctx.font=n+"px 'LinuxLibertine', 'Times New Roman', Serif";break;default:console.warn("Style option '"+r+"' not implemented (Canvas backend)")}return this}path(){return new ke(this.ctx)}text(){return new we(this.ctx)}};var xe=class{constructor(e,t,...r){this.name=e;this.children=r,this.attributes=t||{}}applyAttributes(...e){for(let t of e)Object.assign(this.attributes,t)}removeAttributes(...e){for(let t of e)delete this.attributes[t]}attrString(){return Object.entries(this.attributes).map(([e,t])=>`${e}="${t}"`).join(" ")}chString(){return this.children.map(e=>e.toString()).join("")}append(...e){this.children.push(...e)}toString(){let e=this.name;return e===""?this.chString():`<${e} ${this.attrString()}>${this.chString()}</${e}>`}};function R(a,e,...t){return typeof a=="function"?a(e,...t):new xe(a,e,...t)}R.Fragment="";var _e=class{constructor(e){this.svg=e;this.d="";this.round=e=>e}move(e,t){let r=this.round;return this.d+=`M${r(e)} ${r(t)}`,this}line(e,t){let r=this.round;return this.d+=`L${r(e)} ${r(t)}`,this}cubic(e,t,r,n,i,o){let s=this.round;return this.d+=`C${s(e)} ${s(t)} ${s(r)} ${s(n)} ${s(i)} ${s(o)}`,this}ellipse(e,t,r,n,i,o,s){let d=Math.abs(s),h=Math.floor(d);if(s=Math.sign(s)*(d-h),s>=.499&&s<=.511){let v=.5*s;return this.ellipse(e,t,r,n,i,o,v),this.ellipse(e,t,r,n,i,o+v,v),this}let[b,l]=x(e,t,r,n,i,o),[m,c]=x(e,t,r,n,i,o+s),u=s>=0;this.line(b,l);let f=this.round,g="";if(h!==0){let v=`A${r} ${n} ${-i*360}`,[T,Y]=x(e,t,r,n,i,o+(u?.25:-.25));g=`${v} ${0} ${u?0:1} ${f(T)} ${f(Y)}${v} ${1} ${u?0:1} ${f(b)} ${f(l)}`.repeat(h)}return this.d+=g,s===0?this:(this.d+=`A${r} ${n} ${-i*360} ${Math.abs(s)>.5?1:0} ${u?0:1} ${f(m)} ${f(c)}`,this)}close(){return this.d+="Z",this}draw(e,t){return this.svg._draw_path(this.d,e,t),this}clip(){throw new Error("Method not implemented.")}},Te=class{constructor(e){this.svg=e;this.round=e=>e}draw(e,t,r,n=p.C){let i="middle",o="middle";switch(p.vertical(n)){case p.T:i="hanging";break;case p.B:i="text-after-edge";break}switch(p.horizontal(n)){case p.L:o="start";break;case p.R:o="end";break}let s=this.round;return this.svg._do_draw(R("text",{x:s(e),y:s(t),"dominant-baseline":i,"text-anchor":o},r),!1,!0),this}};function ne(a){var t;return["#"+a[0].toString(16).padStart(2,"0")+a[1].toString(16).padStart(2,"0")+a[2].toString(16).padStart(2,"0"),(t=a[3])!=null?t:1]}function Ce(a,e,t,r,n,i){switch(t/=2,r/=2,p.horizontal(n)){case p.L:a-=t;break;case p.R:a+=t;break}switch(p.horizontal(i)){case p.L:a+=t;break;case p.R:a-=t;break}switch(p.vertical(n)){case p.T:e-=r;break;case p.B:e+=r;break}switch(p.vertical(i)){case p.T:e+=r;break;case p.B:e-=r;break}return[a,e]}var Se=class{constructor(e){this.svg=e}circle(e,t,r,n=p.C){let i=this.svg;return{draw(o=!0,s=!0){[e,t]=Ce(e,t,r,r,p.C,n),i._do_draw(R("circle",{cx:e,cy:t,r:r/2}),o,s)}}}square(e,t,r,n=p.C){let i=this.svg;return{draw(o=!0,s=!0){[e,t]=Ce(e,t,r,r,p.TL,n),i._do_draw(R("rect",{x:e,y:t,width:r,height:r}),o,s)}}}},G=class{constructor(e,t){this._style_stack=[];this._style={stroke:{stroke:"#000000","stroke-width":1},fill:{fill:"#000000"},fontSize:9};this._svg=R("svg",{xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",version:"1.1",viewBox:`0 0 ${e} ${t}`})}_get_sg(){return this._sg?this._sg:(this._sg=R("g",null),this._sg.applyAttributes(this._style.stroke,this._style.fill,{"font-size":this._style.fontSize,"font-family":"Times New Roman"}),this._svg.append(this._sg),this._sg)}_do_draw(e,t,r){e.applyAttributes(t?{}:{stroke:"none"},r?{}:{fill:"none"}),this._get_sg().append(e)}_attrsc(e,t){return S(S({},e?this._style.stroke:{}),t?this._style.fill:{fill:"none"})}_draw_path(e,t,r){this._do_draw(R("path",{d:e}),t,r)}clear(e){if(this._svg.children=[],e){let t=ne(e);this._svg.append(R("rect",{width:"100%",height:"100%",fill:t[0],"fill-opacity":t[1]}))}return this}save(){let e=this._style,t={stroke:S({},e.stroke),fill:S({},e.fill),fontSize:e.fontSize};return this._style_stack.push(t),this}restore(){let e=this._style_stack.pop();if(!e)throw new Error("Stack is empty!");return this._style=e,this._sg=void 0,this}style(e){let t,r=this._style;for(let[n,i]of Object.entries(e))switch(n){case"fill":t=ne(i),r.fill.fill=t[0],t[1]===1?delete r.fill["fill-opacity"]:r.fill["fill-opacity"]=t[1];break;case"stroke":t=ne(i),r.stroke.stroke=t[0],t[1]===1?delete r.stroke["stroke-opacity"]:r.stroke["stroke-opacity"]=t[1];break;case"lineWidth":r.stroke["stroke-width"]=i;break;case"fontSize":r.fontSize=i;break;default:console.warn("Style option '"+n+"' not implemented (Canvas backend)")}return this._sg=void 0,this}path(){return new _e(this)}text(){return new Te(this)}primitive(){return new Se(this)}};function D(a){var e;return[`{rgb,255:red,${a[0]}; green,${a[1]}; blue,${a[2]}}`,(e=a[3])!=null?e:1]}var Pe=class{constructor(e){this.svg=e;this.d="";this.round=e=>e}move(e,t){let r=this.round;return this.d+=`(${r(e)},${r(t)}) `,this}line(e,t){let r=this.round;return this.d+=`-- (${r(e)},${r(t)})`,this}cubic(e,t,r,n,i,o){let s=this.round;return this.d+=`.. controls (${s(e)},${s(t)}) and (${s(r)},${s(n)}) .. (${s(i)},${s(o)})`,this}ellipse(e,t,r,n,i,o,s){let d=Math.abs(s),h=Math.floor(d);if(s=Math.sign(s)*(d-h),s>=.499&&s<=.511){let f=.5*s;return this.ellipse(e,t,r,n,i,o,f),this.ellipse(e,t,r,n,i,o+f,f),this}let[b,l]=x(e,t,r,n,i,o),[m,c]=x(e,t,r,n,i,o+s),u=this.round;return this.d+=`-- (${u(b)},${u(l)}) { arc[x radius=${u(r)},y radius=${u(n)},start angle=${-u(360*o)},delta angle=${-u(360*s)}]}`,this}close(){return this.d+="-- cycle",this}draw(e,t){return this.svg._draw(this.d,e,t),this}clip(){throw new Error("Method not implemented.")}},Me=class{constructor(e){this.tikz=e;this.round=e=>e}draw(e,t,r,n=p.C){let i;switch(p.vertical(n)){case p.T:i="north";break;case p.B:i="south";break}switch(p.horizontal(n)){case p.L:i=(i?i+" ":"")+"west";break;case p.R:i=(i?i+" ":"")+"east";break}i=i||"center";let o=this.round;return this.tikz.TeX+=`\\node at(${o(e)},${o(t)}) [anchor=${i}]{\\fontsize{${this.tikz._style.fontSize}pt}{${this.tikz._style.fontSize}pt}\\selectfont\\vphantom{Og}${r.replace("\\","\\textbackslash{}")}};`,this}},q=class{constructor(e,t){this._style_stack=[];this._style={stroke:{color:D([0,0,0])[0],width:1,opacity:1},fill:{color:D([0,0,0])[0],opacity:1},fontSize:9};this.width=e,this.height=t,this.TeX="",this.clear()}_pathAttr(e,t){let{fill:r,stroke:n}=this._style,i;return t&&(i=`fill=${r.color}${r.opacity==1?"":",fill opacity="+r.opacity}`),e&&(i=(i?i+",":"")+`draw=${n.color},line width=${n.width}${n.opacity==1?"":",draw opacity="+n.opacity}`),i}_draw(e,t,r){let n=`\\path [${this._pathAttr(t,r)}]${e};%
`;this.TeX+=n}clear(e){return this.TeX=`\\begin{tikzpicture}[x=1pt,y=-1pt,every node/.style={inner sep=0,outer sep=0}]%
\\fontfamily{ptm}\\selectfont%
\\useasboundingbox (0,0) rectangle (${this.width},${this.height});%
\\clip (0,0) rectangle (${this.width},${this.height});%
`,e&&(this.save(),this.style({fill:e}),this.path().move(0,0).line(this.width,0).line(this.width,this.height).line(0,this.height).close().draw(!1,!0),this.restore()),this}save(){let e=this._style,t={stroke:S({},e.stroke),fill:S({},e.fill),fontSize:e.fontSize};return this._style_stack.push(t),this}restore(){let e=this._style_stack.pop();if(!e)throw new Error("Stack is empty!");return this._style=e,this}style(e){let t,r=this._style;for(let[n,i]of Object.entries(e))switch(n){case"fill":t=D(i),r.fill.color=t[0],r.fill.opacity=t[1];break;case"stroke":t=D(i),r.stroke.color=t[0],r.stroke.opacity=t[1];break;case"lineWidth":r.stroke.width=i;break;case"fontSize":r.fontSize=i;break;default:console.warn("Style option '"+n+"' not implemented (Canvas backend)")}return this}path(){return new Pe(this)}text(){return new Me(this)}toTikZ(){return this.TeX+"\\end{tikzpicture}"}};var k;(function(h){h[h.move=0]="move",h[h.line=1]="line",h[h.cubic=2]="cubic",h[h.quadratic=3]="quadratic",h[h.ellipse=4]="ellipse",h[h.arc=5]="arc",h[h.close=6]="close",h[h.draw=7]="draw",h[h.clip=8]="clip"})(k||(k={}));var _;(function(s){s[s.clear=0]="clear",s[s.clear_color=1]="clear_color",s[s.save=2]="save",s[s.restore=3]="restore",s[s.style=4]="style",s[s.apply=5]="apply",s[s.path=6]="path"})(_||(_={}));var Re=class{constructor(e,t){this.backend=e;this.buffer=[];this.id=t}move(e,t){return this.buffer.push(0,e,t),this}line(e,t){return this.buffer.push(1,e,t),this}cubic(e,t,r,n,i,o){return this.buffer.push(2,e,t,r,n,i,o),this}quadratic(e,t,r,n){return this.buffer.push(3,e,t,r,n),this}ellipse(e,t,r,n,i,o,s){return this.buffer.push(4,e,t,r,n,i,o,s),this}arc(e,t,r,n,i){return this.buffer.push(4,e,t,r,n,i),this}close(){return this.buffer.push(6),this}draw(e,t){return this.buffer.push(7,+e,+t),this.backend._apply(this),this}fill(){return this.draw(!1,!0)}stroke(){return this.draw(!0,!1)}clip(){return this.backend._apply(this),this}replayAction(e,t){let r=this.buffer,n,i;e:for(i=e;i<r.length;i++)switch(n=r[i],n){case 0:t.move(r[++i],r[++i]);break;case 1:t.line(r[++i],r[++i]);break;case 3:t.quadratic(r[++i],r[++i],r[++i],r[++i]);break;case 2:t.cubic(r[++i],r[++i],r[++i],r[++i],r[++i],r[++i]);break;case 4:t.ellipse(r[++i],r[++i],r[++i],r[++i],r[++i],r[++i],r[++i]);break;case 5:t.arc(r[++i],r[++i],r[++i],r[++i],r[++i]);break;case 6:t.close();break;case 7:t.draw(r[++i]===1,r[++i]===1);break e;case 8:t.clip();break e;default:let o=n}return++i}},W=class{constructor(){this.buffer=[];this.pathBuffer=[];this.optionBuffer=[]}_apply(e){this.buffer.push(5,e.id)}clear(e){if(e){let t=e[3];this.buffer.push(1,e[0],e[1],e[2],t===void 0?0:t)}else this.buffer.push(0);return this}save(){return this.buffer.push(2),this}restore(){return this.buffer.push(3),this}style(e){return this.buffer.push(4),this.optionBuffer.push(e),this}path(){let e;return this.buffer.push(6),this.pathBuffer.push(e=new Re(this,this.pathBuffer.length)),e}replay(e){let t=this.buffer,r,n,i=0,o=[];for(n=0;n<t.length;n++)switch(r=t[n],r){case 0:e.clear();break;case 1:e.clear([t[++n],t[++n],t[++n],t[++n]]);break;case 2:e.save();break;case 3:e.restore();break;case 4:e.style(this.optionBuffer[i++]);break;case 6:o.push([0,e.path()]);break;case 5:let s=t[++n],d=o[s];d[0]=this.pathBuffer[s].replayAction(d[0],d[1]);break;default:let h=r}}};var Le=2*Math.PI;function x(a,e,t,r,n,i){i*=Le,n*=Le;let o=t*Math.cos(i),s=r*Math.sin(i),d=Math.cos(n),h=Math.sin(n);return[a+d*o-h*s,e-h*o-d*s]}var P=class{static rotation(e){let t=Math.cos(2*Math.PI*e),r=Math.sin(2*Math.PI*e);return new P(t,-r,r,t)}constructor(e,t,r,n){Array.isArray(e)?this.m=[e[0],e[1],e[2],e[3]]:this.m=[e,t,r,n]}get det(){let e=this.m;return e[0]*e[3]-e[1]*e[2]}get I(){let e=this.det;if(e===0)throw new Error("Determinant is 0");e=1/e;let t=this.m;return new P(e*t[3],-e*t[1],-e*t[2],e*t[0])}get T(){let e=this.m;return new P(e[0],e[2],e[1],e[3])}mul(e){let t=this.m,r=e.m;return new P(t[0]*r[0]+t[1]*r[2],t[0]*r[1]+t[1]*r[3],t[2]*r[0]+t[3]*r[2],t[2]*r[1]+t[3]*r[3])}of(e){let t=this.m;return[t[0]*e[0]+t[1]*e[1],t[2]*e[0]+t[3]*e[1]]}};function Ke(a){let[e,t,r,n]=a.m;if(Math.abs(t-r)>1e-5)throw new Error("Matrix not diagonal!");let i,o,s;{s=e-n,s=s*s+4*t*t,s=Math.sqrt(s);let h=e+n;i=.5*(h+s),o=.5*(h-s)}let d;if(Math.abs(t)<1e-5)d=e>=n?0:.25;else if(Math.abs(e-n)<1e-5)d=t>0?.125:.375;else{d=.25*Math.atan(2*t/(e-n))/Math.PI,d<0&&(d+=.125);let h=Math.sign(t),b=Math.sign(e-n);h===1&&b===1||(h===1&&b===-1?d+=.125:h===-1&&b===1?d+=.375:h===-1&&b===-1?d+=.25:d=0)}return[[i,o],d]}function Oe(a,e,t,r,n,i){let o=new P(e*e,0,0,t*t),s=a.mul(P.rotation(r));o=s.mul(o.mul(s.T));let[[d,h],b]=Ke(o);b=-b,d=Math.sqrt(d),h=Math.sqrt(h);let l=a.of(x(0,0,e,t,r,n));l=P.rotation(b).of(l);let m=.5*new w(l[0]/d,l[1]/h).arg()/Math.PI;return[d,h,b,-m,a.det<0?-i:i]}function Ne(a,e){function t(r,n){let i=a.of([r,n]);return[i[0]+e[0],i[1]+e[1]]}return{move(r,n){return this.move(...t(r,n)),!0},line(r,n){return this.line(...t(r,n)),!0},cubic(r,n,i,o,s,d){return this.cubic(...t(r,n),...t(i,o),...t(s,d)),!0},quadratic(r,n,i,o){return this.quadratic(...t(r,n),...t(i,o)),!0},ellipse(r,n,i,o,s,d,h){return this.ellipse(...t(r,n),...Oe(a,i,o,s,d,h)),!0},arc(r,n,i,o,s){return this.ellipse(...t(r,n),...Oe(a,i,i,0,o,s)),!0},close(){},draw(r=!0,n=!0){},clip(){}}}var X=class{constructor(e,t,r=!0){this.intercepts=e;this.handler=t;r||(this.current=e.length-1)}_do(e,t){if(this.current===void 0)new X(this.intercepts,this.handler,!1)._do(e,t);else{let r;for(;this.current>=0;)if(r=this.intercepts[this.current--][e],typeof r=="function"&&r.apply(this,t))return;this.handler[e].apply(this.handler,t)}}move(...e){return this._do("move",e),this}line(...e){return this._do("line",e),this}cubic(...e){return this._do("cubic",e),this}quadratic(...e){return this._do("quadratic",e),this}ellipse(...e){return this._do("ellipse",e),this}arc(...e){return this._do("arc",e),this}close(...e){return this._do("close",e),this}draw(...e){return this._do("draw",e),this}clip(...e){return this._do("clip",e),this}fill(){return this.draw(!1,!0)}stroke(){return this.draw(!1,!0)}},A=class{constructor(e,t){this.backend=e;this.intercepts=[];for(let r of t||[])this.addIntercept(r)}addIntercept(e){e.path&&this.intercepts.push(e.path)}path(){return new X(this.intercepts,this.backend.path())}clear(e){return this.backend.clear(e),this}save(){return this.backend.save(),this}restore(){return this.backend.restore(),this}style(e){return this.backend.style(e),this}};var K=class extends A{constructor(){super(new W);this.minX=Number.POSITIVE_INFINITY;this.minY=Number.POSITIVE_INFINITY;this.maxX=Number.NEGATIVE_INFINITY;this.maxY=Number.NEGATIVE_INFINITY;let e=(t,r)=>{this.minX=Math.min(t,this.minX),this.maxX=Math.max(t,this.maxX),this.minY=Math.min(r,this.minY),this.maxY=Math.max(r,this.maxY)};this.addIntercept({path:{arc(t,r,n,i,o){e(...x(t,r,n,n,0,i)),e(...x(t,r,n,n,0,i+o));let s=i;s=(s-Math.floor(s))*4;let d=i+o;if(d=(d-Math.floor(d))*4,o<0){let h=s;s=d,d=h}d<s&&(d+=4);for(let h=Math.ceil(s);h<d;h++){let b=h%2==0;e(t+(b?h==0||h==4?n:-n:0),r+(b?0:h==1||h==5?-n:n))}},move(t,r){e(t,r)},line(t,r){e(t,r)}}})}replay(e,t){if(t==null?void 0:t.fit){let r=this.maxX-this.minX,n=this.maxY-this.minY,i=Math.min(t.fit.width/r,t.fit.height/n);e=new A(e,[{path:Ne(new P(i,0,0,i),[.5*(t.fit.width-i*r)-this.minX*i,.5*(t.fit.height-i*n)-this.minY*i])}])}this.backend.replay(e)}};function Ye(a,e,t="text/plain"){let r=`data:${t};base64,${window.btoa(a)}`,n=document.createElement("a");n.setAttribute("download",e),n.href=r,n.click()}function Ee(a){return["multiButton",{label:"Export as",values:[{name:"TikZ",label:"TikZ"},{name:"SVG",label:"SVG"}],onClick(e){return E(this,null,function*(){let t;typeof a.setup=="function"?t=a.setup():t=a.setup;let r,n=t.fileName||"Export",i,o;if(e==="SVG")r=new G(t.width,t.height),n+=".svg",i="image/svg+xml",o=()=>r._svg.toString();else if(e==="TikZ")r=new q(t.width,t.height),n+=".tikz",i="text/plain",o=()=>r.toTikZ();else throw new Error;yield a.render(M.from(r)),Ye(o(),n,i)})}}]}function Be(a,e){let{N:t,J:r,W:n}=e,{shadeTop:i="#0000FF33",shadeFront:o="#ffcc0033",shadeSide:s="#444444"}=e.color||{},d=Math.log(t/n)/r,h=[...new F(0,r+1)].map(u=>n*Math.exp(u*d)),b=1/4,l=(u,f,g)=>[u-g*b,t-(f-.8*g*b)];function m(u,[f,g,v]){let T="ff";a.style({fill:o+T}),a.path().move(...l(u[f],u[g],u[v])).line(...l(u[f-1],u[g],u[v])).line(...l(u[f-1],u[g-1],u[v])).line(...l(u[f],u[g-1],u[v])).close().fill().stroke(),a.style({fill:i+T}),a.path().move(...l(u[f],u[g],u[v])).line(...l(u[f-1],u[g],u[v])).line(...l(u[f-1],u[g],u[v-1])).line(...l(u[f],u[g],u[v-1])).close().fill().stroke(),a.style({fill:s+T}),a.path().move(...l(u[f],u[g],u[v])).line(...l(u[f],u[g],u[v-1])).line(...l(u[f],u[g-1],u[v-1])).line(...l(u[f],u[g-1],u[v])).close().fill().stroke()}a.style({lineWidth:1.5,stroke:"#000000"});let c=a.path();c.move(...l(n,n,n)).line(...l(t+(t-n)*.1,n,n)),c.move(...l(n,n,n)).line(...l(n,t+(t-n)*.1,n)),c.move(...l(n,n,n)).line(...l(n,n,t+(t-n)*.1)),c.stroke(),a.style({lineWidth:.75});for(let u=1;u<h.length;u++)for(let f=1;f<h.length-u+1;f++)m(h,[u,f,h.length+1-u-f])}function $e(a,e){let{N:t,J:r,W:n}=e,{fill:i="#0000FF33",error:o="#ffcc0033",gridLine:s="#444444",hypLine:d="#000000"}=e.color||{},h=Math.log(t/n)/r,b=[...new F(0,r+1)].map(v=>n*Math.exp(v*h));a.style({fill:i,stroke:s,lineWidth:1.5});let l=a.path();l.move(b[0],t-b[0]).line(b[0],t-b[r]);for(var m=1;m<b.length;m++)l.line(b[m-1],t-b[r-m]).line(b[m],t-b[r-m]);l.line(b[r],t-b[0]).close(),l.fill(),l=a.path(),a.style({lineWidth:1.5,fill:o}),l.move(b[0],t-b[r]);for(var m=1;m<b.length;m++)l.line(b[m-1],t-b[r-m+1]).line(b[m],t-b[r-m+1]);for(var m=r;m>0;m--)l.line(b[m],t-b[r-m]).line(b[m-1],t-b[r-m]);l.line(b[0],t-b[r]),l.fill();let c;a.style({lineWidth:1}),l=a.path(),c=[b[1],t-b[r]],l.move(n,t-n).line(n,c[1]).line(c[0],c[1]).line(c[0],t-n),c=[b[r],t-b[1]],l.move(n,t-n).line(c[0],t-n).line(c[0],c[1]).line(n,c[1]);let u=r+1,f=2;for(var m=f;m<=u-f;m++)c=[b[m],t-b[u-m]],l.move(n,c[1]).line(c[0],c[1]).line(c[0],t-n);l.stroke(),l=a.path();let g=100;a.style({lineWidth:2,stroke:d}),l.move(n,t-n);for(let v of[...new F(0,g+1)]){let T=Math.pow(t/n,v/g);l.line(n*T,t-t/T)}l.close(),l.stroke()}window.customElements.define("hyperbola-app",me({connected(a){let e={N:100,W:10,J:10,dim:"3D",color:{shadeTop:"#bbbbbb",shadeFront:"#555555",shadeSide:"#111111",hypLine:"#000000",gridLine:"#000000",fill:"#333333",error:"#999999"}};a.addLayer("draw",Q({update(r,n){n.clearRect(0,0,r.width,r.height);let i=new K,o=M.from(i);e.dim=="2D"?$e(o,e):Be(o,e),i.replay(M.from(new H(n)),{fit:{width:r.width,height:r.height}})}}));let t=a.addLayer("options",j());t.add("number",{label:"Cuts",onChange:r=>{e.J=r,a.update()},default:e.J}),t.add("radio",{label:"Dimension",values:[{name:"2D",label:"2D"},{name:"3D",label:"3D"}],default:e.dim,onChange:r=>{e.dim=r,a.update()}}),t.add("color",{label:"3D-top",onChange:r=>{e.color.shadeTop=r,a.update()},default:e.color.shadeTop}),t.add("color",{label:"3D-front",onChange:r=>{e.color.shadeFront=r,a.update()},default:e.color.shadeFront}),t.add("color",{label:"3D-side",onChange:r=>{e.color.shadeSide=r,a.update()},default:e.color.shadeSide}),t.add("color",{label:"2D-lower",onChange:r=>{e.color.fill=r,a.update()},default:e.color.fill}),t.add("color",{label:"2D-upper",onChange:r=>{e.color.error=r,a.update()},default:e.color.error}),t.add(oe,a),t.add(Ee({setup(){return{fileName:"Hyperbola",width:a.width,height:a.height}},render(r){let n=new K,i=M.from(n);e.dim=="2D"?$e(i,e):Be(i,e),n.replay(r,{fit:{width:a.width,height:a.height}})}}))}}));})();
