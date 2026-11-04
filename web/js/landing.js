(()=>{function ql(e){return e.phone||e.calm||!e.webgl?"flat":"live"}var Ic="182";var Pc=0,Ja=1,Lc=2;var As=1,Nc=2,qi=3,Wn=0,Pt=1,Kt=2,In=0,Es=1,Ka=2,$a=3,ja=4,Dc=5,Yi=100,Uc=101,Fc=102,Oc=103,Bc=104,zc=200,kc=201,Gc=202,Hc=203,Vc=204,Wc=205,Xc=206,qc=207,Yc=208,Zc=209,Jc=210,Kc=211,$c=212,jc=213,Qc=214,wr=0,Rr=1,Cr=2,ws=3,Ir=4,Pr=5,Lr=6,Nr=7,eh=0,th=1,nh=2,an=0,Qa=1,eo=2,to=3,no=4,io=5,so=6,Rs=7;var Zi=301,ci=302,Dr=303,Ur=304,Cs=306,Xn=1000,Ji=1001,Fr=1002,on=1003,Or=1004;var hi=1005;var Tt=1006,Ki=1007;var Pn=1008;var ln=1009,ih=1010,sh=1011,Is=1012,ro=1013,qn=1014,Ln=1015,Nn=1016,ao=1017,oo=1018,$i=1020,rh=35902,ah=35899,oh=1021,lh=1022,un=1023,ui=1026,di=1027,ch=1028,lo=1029,ji=1030,co=1031;var ho=1033,Br=33776,zr=33777,kr=33778,Gr=33779,uo=35840,fo=35841,po=35842,mo=35843,go=36196,_o=37492,xo=37496,vo=37488,yo=37489,Mo=37490,So=37491,bo=37808,To=37809,Ao=37810,Eo=37811,wo=37812,Ro=37813,Co=37814,Io=37815,Po=37816,Lo=37817,No=37818,Do=37819,Uo=37820,Fo=37821,Oo=36492,Bo=36494,zo=36495,ko=36283,Go=36284,Ho=36285,Vo=36286;var Wo=2300,Hr=2301;var Xo=0,Ps=1,Qi=2;var hh=0,uh=1,fi="",dn="srgb",Lt="srgb-linear",qo="linear",rt="srgb";var dh=512,fh=513,ph=514,Vr=515,mh=516,gh=517,Wr=518,_h=519;var Yo="300 es",Zo=2000;function Jo(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function Qu(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function Vi(e){return document.createElementNS("http://www.w3.org/1999/xhtml",e)}function xh(){let e=Vi("canvas");return e.style.display="block",e}var Yl={},Wi=null;function Ts(...e){let t="THREE."+e.shift();if(Wi)Wi("log",t,...e);else console.log(t,...e)}function Me(...e){let t="THREE."+e.shift();if(Wi)Wi("warn",t,...e);else console.warn(t,...e)}function Ie(...e){let t="THREE."+e.shift();if(Wi)Wi("error",t,...e);else console.error(t,...e)}function Xi(...e){let t=e.join(" ");if(t in Yl)return;Yl[t]=!0,Me(...e)}function vh(e,t,n){return new Promise(function(i,s){function r(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:s();break;case e.TIMEOUT_EXPIRED:setTimeout(r,n);break;default:i()}}setTimeout(r,n)})}class Yn{addEventListener(e,t){if(this._listeners===void 0)this._listeners={};let n=this._listeners;if(n[e]===void 0)n[e]=[];if(n[e].indexOf(t)===-1)n[e].push(t)}hasEventListener(e,t){let n=this._listeners;if(n===void 0)return!1;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let i=n[e];if(i!==void 0){let s=i.indexOf(t);if(s!==-1)i.splice(s,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let i=n.slice(0);for(let s=0,r=i.length;s<r;s++)i[s].call(this,e);e.target=null}}}var At=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Zl=1234567,Ss=Math.PI/180,oi=180/Math.PI;function rn(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(At[e&255]+At[e>>8&255]+At[e>>16&255]+At[e>>24&255]+"-"+At[t&255]+At[t>>8&255]+"-"+At[t>>16&15|64]+At[t>>24&255]+"-"+At[n&63|128]+At[n>>8&255]+"-"+At[n>>16&255]+At[n>>24&255]+At[i&255]+At[i>>8&255]+At[i>>16&255]+At[i>>24&255]).toLowerCase()}function Xe(e,t,n){return Math.max(t,Math.min(n,e))}function Ko(e,t){return(e%t+t)%t}function ed(e,t,n,i,s){return i+(e-t)*(s-i)/(n-t)}function td(e,t,n){if(e!==t)return(n-e)/(t-e);else return 0}function bs(e,t,n){return(1-n)*e+n*t}function nd(e,t,n,i){return bs(e,t,1-Math.exp(-n*i))}function id(e,t=1){return t-Math.abs(Ko(e,t*2)-t)}function sd(e,t,n){if(e<=t)return 0;if(e>=n)return 1;return e=(e-t)/(n-t),e*e*(3-2*e)}function rd(e,t,n){if(e<=t)return 0;if(e>=n)return 1;return e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10)}function ad(e,t){return e+Math.floor(Math.random()*(t-e+1))}function od(e,t){return e+Math.random()*(t-e)}function ld(e){return e*(0.5-Math.random())}function cd(e){if(e!==void 0)Zl=e;let t=Zl+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function hd(e){return e*Ss}function ud(e){return e*oi}function dd(e){return(e&e-1)===0&&e!==0}function fd(e){return Math.pow(2,Math.ceil(Math.log(e)/Math.LN2))}function pd(e){return Math.pow(2,Math.floor(Math.log(e)/Math.LN2))}function md(e,t,n,i,s){let{cos:r,sin:a}=Math,o=r(n/2),l=a(n/2),c=r((t+i)/2),h=a((t+i)/2),u=r((t-i)/2),d=a((t-i)/2),m=r((i-t)/2),_=a((i-t)/2);switch(s){case"XYX":e.set(o*h,l*u,l*d,o*c);break;case"YZY":e.set(l*d,o*h,l*u,o*c);break;case"ZXZ":e.set(l*u,l*d,o*h,o*c);break;case"XZX":e.set(o*h,l*_,l*m,o*c);break;case"YXY":e.set(l*m,o*h,l*_,o*c);break;case"ZYZ":e.set(l*_,l*m,o*h,o*c);break;default:Me("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function sn(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error("Invalid component type.")}}function et(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error("Invalid component type.")}}var $o={DEG2RAD:Ss,RAD2DEG:oi,generateUUID:rn,clamp:Xe,euclideanModulo:Ko,mapLinear:ed,inverseLerp:td,lerp:bs,damp:nd,pingpong:id,smoothstep:sd,smootherstep:rd,randInt:ad,randFloat:od,randFloatSpread:ld,seededRandom:cd,degToRad:hd,radToDeg:ud,isPowerOfTwo:dd,ceilPowerOfTwo:fd,floorPowerOfTwo:pd,setQuaternionFromProperEuler:md,normalize:et,denormalize:sn};class Oe{constructor(e=0,t=0){Oe.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Xe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Xe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),i=Math.sin(t),s=this.x-e.x,r=this.y-e.y;return this.x=s*n-r*i+e.x,this.y=s*i+r*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class cn{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,s,r,a){let o=n[i+0],l=n[i+1],c=n[i+2],h=n[i+3],u=s[r+0],d=s[r+1],m=s[r+2],_=s[r+3];if(a<=0){e[t+0]=o,e[t+1]=l,e[t+2]=c,e[t+3]=h;return}if(a>=1){e[t+0]=u,e[t+1]=d,e[t+2]=m,e[t+3]=_;return}if(h!==_||o!==u||l!==d||c!==m){let x=o*u+l*d+c*m+h*_;if(x<0)u=-u,d=-d,m=-m,_=-_,x=-x;let f=1-a;if(x<0.9995){let p=Math.acos(x),A=Math.sin(p);f=Math.sin(f*p)/A,a=Math.sin(a*p)/A,o=o*f+u*a,l=l*f+d*a,c=c*f+m*a,h=h*f+_*a}else{o=o*f+u*a,l=l*f+d*a,c=c*f+m*a,h=h*f+_*a;let p=1/Math.sqrt(o*o+l*l+c*c+h*h);o*=p,l*=p,c*=p,h*=p}}e[t]=o,e[t+1]=l,e[t+2]=c,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,i,s,r){let a=n[i],o=n[i+1],l=n[i+2],c=n[i+3],h=s[r],u=s[r+1],d=s[r+2],m=s[r+3];return e[t]=a*m+c*h+o*d-l*u,e[t+1]=o*m+c*u+l*h-a*d,e[t+2]=l*m+c*d+a*u-o*h,e[t+3]=c*m-a*h-o*u-l*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let{_x:n,_y:i,_z:s,_order:r}=e,{cos:a,sin:o}=Math,l=a(n/2),c=a(i/2),h=a(s/2),u=o(n/2),d=o(i/2),m=o(s/2);switch(r){case"XYZ":this._x=u*c*h+l*d*m,this._y=l*d*h-u*c*m,this._z=l*c*m+u*d*h,this._w=l*c*h-u*d*m;break;case"YXZ":this._x=u*c*h+l*d*m,this._y=l*d*h-u*c*m,this._z=l*c*m-u*d*h,this._w=l*c*h+u*d*m;break;case"ZXY":this._x=u*c*h-l*d*m,this._y=l*d*h+u*c*m,this._z=l*c*m+u*d*h,this._w=l*c*h-u*d*m;break;case"ZYX":this._x=u*c*h-l*d*m,this._y=l*d*h+u*c*m,this._z=l*c*m-u*d*h,this._w=l*c*h+u*d*m;break;case"YZX":this._x=u*c*h+l*d*m,this._y=l*d*h+u*c*m,this._z=l*c*m-u*d*h,this._w=l*c*h-u*d*m;break;case"XZY":this._x=u*c*h-l*d*m,this._y=l*d*h-u*c*m,this._z=l*c*m+u*d*h,this._w=l*c*h+u*d*m;break;default:Me("Quaternion: .setFromEuler() encountered an unknown order: "+r)}if(t===!0)this._onChangeCallback();return this}setFromAxisAngle(e,t){let n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],i=t[4],s=t[8],r=t[1],a=t[5],o=t[9],l=t[2],c=t[6],h=t[10],u=n+a+h;if(u>0){let d=0.5/Math.sqrt(u+1);this._w=0.25/d,this._x=(c-o)*d,this._y=(s-l)*d,this._z=(r-i)*d}else if(n>a&&n>h){let d=2*Math.sqrt(1+n-a-h);this._w=(c-o)/d,this._x=0.25*d,this._y=(i+r)/d,this._z=(s+l)/d}else if(a>h){let d=2*Math.sqrt(1+a-n-h);this._w=(s-l)/d,this._x=(i+r)/d,this._y=0.25*d,this._z=(o+c)/d}else{let d=2*Math.sqrt(1+h-n-a);this._w=(r-i)/d,this._x=(s+l)/d,this._y=(o+c)/d,this._z=0.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;if(n<0.00000001)if(n=0,Math.abs(e.x)>Math.abs(e.z))this._x=-e.y,this._y=e.x,this._z=0,this._w=n;else this._x=0,this._y=-e.z,this._z=e.y,this._w=n;else this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n;return this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Xe(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();if(e===0)this._x=0,this._y=0,this._z=0,this._w=1;else e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e;return this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let{_x:n,_y:i,_z:s,_w:r}=e,{_x:a,_y:o,_z:l,_w:c}=t;return this._x=n*c+r*a+i*l-s*o,this._y=i*c+r*o+s*a-n*l,this._z=s*c+r*l+n*o-i*a,this._w=r*c-n*a-i*o-s*l,this._onChangeCallback(),this}slerp(e,t){if(t<=0)return this;if(t>=1)return this.copy(e);let{_x:n,_y:i,_z:s,_w:r}=e,a=this.dot(e);if(a<0)n=-n,i=-i,s=-s,r=-r,a=-a;let o=1-t;if(a<0.9995){let l=Math.acos(a),c=Math.sin(l);o=Math.sin(o*l)/c,t=Math.sin(t*l)/c,this._x=this._x*o+n*t,this._y=this._y*o+i*t,this._z=this._z*o+s*t,this._w=this._w*o+r*t,this._onChangeCallback()}else this._x=this._x*o+n*t,this._y=this._y*o+i*t,this._z=this._z*o+s*t,this._w=this._w*o+r*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class D{constructor(e=0,t=0,n=0){D.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){if(n===void 0)n=this.z;return this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Jl.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Jl.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*i,this.y=s[1]*t+s[4]*n+s[7]*i,this.z=s[2]*t+s[5]*n+s[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,s=e.elements,r=1/(s[3]*t+s[7]*n+s[11]*i+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*i+s[12])*r,this.y=(s[1]*t+s[5]*n+s[9]*i+s[13])*r,this.z=(s[2]*t+s[6]*n+s[10]*i+s[14])*r,this}applyQuaternion(e){let t=this.x,n=this.y,i=this.z,{x:s,y:r,z:a,w:o}=e,l=2*(r*i-a*n),c=2*(a*t-s*i),h=2*(s*n-r*t);return this.x=t+o*l+r*h-a*c,this.y=n+o*c+a*l-s*h,this.z=i+o*h+s*c-r*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*i,this.y=s[1]*t+s[5]*n+s[9]*i,this.z=s[2]*t+s[6]*n+s[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this.z=Xe(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this.z=Xe(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Xe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let{x:n,y:i,z:s}=e,{x:r,y:a,z:o}=t;return this.x=i*o-s*a,this.y=s*r-n*o,this.z=n*a-i*r,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Ma.copy(this).projectOnVector(e),this.sub(Ma)}reflect(e){return this.sub(Ma.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Xe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}var Ma=new D,Jl=new cn;class ze{constructor(e,t,n,i,s,r,a,o,l){if(ze.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0)this.set(e,t,n,i,s,r,a,o,l)}set(e,t,n,i,s,r,a,o,l){let c=this.elements;return c[0]=e,c[1]=i,c[2]=a,c[3]=t,c[4]=s,c[5]=o,c[6]=n,c[7]=r,c[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,s=this.elements,r=n[0],a=n[3],o=n[6],l=n[1],c=n[4],h=n[7],u=n[2],d=n[5],m=n[8],_=i[0],x=i[3],f=i[6],p=i[1],A=i[4],b=i[7],T=i[2],I=i[5],E=i[8];return s[0]=r*_+a*p+o*T,s[3]=r*x+a*A+o*I,s[6]=r*f+a*b+o*E,s[1]=l*_+c*p+h*T,s[4]=l*x+c*A+h*I,s[7]=l*f+c*b+h*E,s[2]=u*_+d*p+m*T,s[5]=u*x+d*A+m*I,s[8]=u*f+d*b+m*E,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],r=e[4],a=e[5],o=e[6],l=e[7],c=e[8];return t*r*c-t*a*l-n*s*c+n*a*o+i*s*l-i*r*o}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],r=e[4],a=e[5],o=e[6],l=e[7],c=e[8],h=c*r-a*l,u=a*o-c*s,d=l*s-r*o,m=t*h+n*u+i*d;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/m;return e[0]=h*_,e[1]=(i*l-c*n)*_,e[2]=(a*n-i*r)*_,e[3]=u*_,e[4]=(c*t-i*o)*_,e[5]=(i*s-a*t)*_,e[6]=d*_,e[7]=(n*o-l*t)*_,e[8]=(r*t-n*s)*_,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,s,r,a){let o=Math.cos(s),l=Math.sin(s);return this.set(n*o,n*l,-n*(o*r+l*a)+r+e,-i*l,i*o,-i*(-l*r+o*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(Sa.makeScale(e,t)),this}rotate(e){return this.premultiply(Sa.makeRotation(-e)),this}translate(e,t){return this.premultiply(Sa.makeTranslation(e,t)),this}makeTranslation(e,t){if(e.isVector2)this.set(1,0,e.x,0,1,e.y,0,0,1);else this.set(1,0,e,0,1,t,0,0,1);return this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}var Sa=new ze,Kl=new ze().set(0.4123908,0.3575843,0.1804808,0.212639,0.7151687,0.0721923,0.0193308,0.1191948,0.9505322),$l=new ze().set(3.2409699,-1.5373832,-0.4986108,-0.9692436,1.8759675,0.0415551,0.0556301,-0.203977,1.0569715);function gd(){let e={enabled:!0,workingColorSpace:"srgb-linear",spaces:{},convert:function(s,r,a){if(this.enabled===!1||r===a||!r||!a)return s;if(this.spaces[r].transfer==="srgb")s.r=wn(s.r),s.g=wn(s.g),s.b=wn(s.b);if(this.spaces[r].primaries!==this.spaces[a].primaries)s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ);if(this.spaces[a].transfer==="srgb")s.r=Hi(s.r),s.g=Hi(s.g),s.b=Hi(s.b);return s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){if(s==="")return"linear";return this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Xi("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),e.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Xi("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),e.colorSpaceToWorking(s,r)}},t=[0.64,0.33,0.3,0.6,0.15,0.06],n=[0.2126,0.7152,0.0722],i=[0.3127,0.329];return e.define({["srgb-linear"]:{primaries:t,whitePoint:i,transfer:"linear",toXYZ:Kl,fromXYZ:$l,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:"srgb"},outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}},["srgb"]:{primaries:t,whitePoint:i,transfer:"srgb",toXYZ:Kl,fromXYZ:$l,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}}}),e}var We=gd();function wn(e){return e<0.04045?e*0.0773993808:Math.pow(e*0.9478672986+0.0521327014,2.4)}function Hi(e){return e<0.0031308?e*12.92:1.055*Math.pow(e,0.41666)-0.055}var Ti;class jo{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src))return e.src;if(typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{if(Ti===void 0)Ti=Vi("canvas");Ti.width=e.width,Ti.height=e.height;let i=Ti.getContext("2d");if(e instanceof ImageData)i.putImageData(e,0,0);else i.drawImage(e,0,0,e.width,e.height);n=Ti}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Vi("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let i=n.getImageData(0,0,e.width,e.height),s=i.data;for(let r=0;r<s.length;r++)s[r]=wn(s[r]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)if(t instanceof Uint8Array||t instanceof Uint8ClampedArray)t[n]=Math.floor(wn(t[n]/255)*255);else t[n]=wn(t[n]);return{data:t,width:e.width,height:e.height}}else return Me("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}var _d=0;class Ls{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:_d++}),this.uuid=rn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;if(typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement)e.set(t.videoWidth,t.videoHeight,0);else if(typeof VideoFrame<"u"&&t instanceof VideoFrame)e.set(t.displayHeight,t.displayWidth,0);else if(t!==null)e.set(t.width,t.height,t.depth||0);else e.set(0,0,0);return e}set needsUpdate(e){if(e===!0)this.version++}toJSON(e){let t=e===void 0||typeof e==="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let s;if(Array.isArray(i)){s=[];for(let r=0,a=i.length;r<a;r++)if(i[r].isDataTexture)s.push(ba(i[r].image));else s.push(ba(i[r]))}else s=ba(i);n.url=s}if(!t)e.images[this.uuid]=n;return n}}function ba(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap)return jo.getDataURL(e);else if(e.data)return{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name};else return Me("Texture: Unable to serialize Texture."),{}}var xd=0,Ta=new D;class gt extends Yn{constructor(e=gt.DEFAULT_IMAGE,t=gt.DEFAULT_MAPPING,n=1001,i=1001,s=1006,r=1008,a=1023,o=1009,l=gt.DEFAULT_ANISOTROPY,c=""){super();this.isTexture=!0,Object.defineProperty(this,"id",{value:xd++}),this.uuid=rn(),this.name="",this.source=new Ls(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=s,this.minFilter=r,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=o,this.offset=new Oe(0,0),this.repeat=new Oe(1,1),this.center=new Oe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ze,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=c,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=e&&e.depth&&e.depth>1?!0:!1,this.pmremVersion=0}get width(){return this.source.getSize(Ta).x}get height(){return this.source.getSize(Ta).y}get depth(){return this.source.getSize(Ta).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){Me(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let i=this[t];if(i===void 0){Me(`Texture.setValues(): property '${t}' does not exist.`);continue}if(i&&n&&(i.isVector2&&n.isVector2))i.copy(n);else if(i&&n&&(i.isVector3&&n.isVector3))i.copy(n);else if(i&&n&&(i.isMatrix3&&n.isMatrix3))i.copy(n);else this[t]=n}}toJSON(e){let t=e===void 0||typeof e==="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};if(Object.keys(this.userData).length>0)n.userData=this.userData;if(!t)e.textures[this.uuid]=n;return n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case 1000:e.x=e.x-Math.floor(e.x);break;case 1001:e.x=e.x<0?0:1;break;case 1002:if(Math.abs(Math.floor(e.x)%2)===1)e.x=Math.ceil(e.x)-e.x;else e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case 1000:e.y=e.y-Math.floor(e.y);break;case 1001:e.y=e.y<0?0:1;break;case 1002:if(Math.abs(Math.floor(e.y)%2)===1)e.y=Math.ceil(e.y)-e.y;else e.y=e.y-Math.floor(e.y);break}if(this.flipY)e.y=1-e.y;return e}set needsUpdate(e){if(e===!0)this.version++,this.source.needsUpdate=!0}set needsPMREMUpdate(e){if(e===!0)this.pmremVersion++}}gt.DEFAULT_IMAGE=null;gt.DEFAULT_MAPPING=300;gt.DEFAULT_ANISOTROPY=1;class ct{constructor(e=0,t=0,n=0,i=1){ct.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,s=this.w,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*i+r[12]*s,this.y=r[1]*t+r[5]*n+r[9]*i+r[13]*s,this.z=r[2]*t+r[6]*n+r[10]*i+r[14]*s,this.w=r[3]*t+r[7]*n+r[11]*i+r[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);if(t<0.0001)this.x=1,this.y=0,this.z=0;else this.x=e.x/t,this.y=e.y/t,this.z=e.z/t;return this}setAxisAngleFromRotationMatrix(e){let t,n,i,s,r=0.01,a=0.1,o=e.elements,l=o[0],c=o[4],h=o[8],u=o[1],d=o[5],m=o[9],_=o[2],x=o[6],f=o[10];if(Math.abs(c-u)<0.01&&Math.abs(h-_)<0.01&&Math.abs(m-x)<0.01){if(Math.abs(c+u)<0.1&&Math.abs(h+_)<0.1&&Math.abs(m+x)<0.1&&Math.abs(l+d+f-3)<0.1)return this.set(1,0,0,0),this;t=Math.PI;let A=(l+1)/2,b=(d+1)/2,T=(f+1)/2,I=(c+u)/4,E=(h+_)/4,P=(m+x)/4;if(A>b&&A>T)if(A<0.01)n=0,i=0.707106781,s=0.707106781;else n=Math.sqrt(A),i=I/n,s=E/n;else if(b>T)if(b<0.01)n=0.707106781,i=0,s=0.707106781;else i=Math.sqrt(b),n=I/i,s=P/i;else if(T<0.01)n=0.707106781,i=0.707106781,s=0;else s=Math.sqrt(T),n=E/s,i=P/s;return this.set(n,i,s,t),this}let p=Math.sqrt((x-m)*(x-m)+(h-_)*(h-_)+(u-c)*(u-c));if(Math.abs(p)<0.001)p=1;return this.x=(x-m)/p,this.y=(h-_)/p,this.z=(u-c)/p,this.w=Math.acos((l+d+f-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Xe(this.x,e.x,t.x),this.y=Xe(this.y,e.y,t.y),this.z=Xe(this.z,e.z,t.z),this.w=Xe(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Xe(this.x,e,t),this.y=Xe(this.y,e,t),this.z=Xe(this.z,e,t),this.w=Xe(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Xe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Qo extends Yn{constructor(e=1,t=1,n={}){super();n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:1006,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new ct(0,0,e,t),this.scissorTest=!1,this.viewport=new ct(0,0,e,t);let i={width:e,height:t,depth:n.depth},s=new gt(i);this.textures=[];let r=n.count;for(let a=0;a<r;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){let t={minFilter:1006,generateMipmaps:!1,flipY:!1,internalFormat:null};if(e.mapping!==void 0)t.mapping=e.mapping;if(e.wrapS!==void 0)t.wrapS=e.wrapS;if(e.wrapT!==void 0)t.wrapT=e.wrapT;if(e.wrapR!==void 0)t.wrapR=e.wrapR;if(e.magFilter!==void 0)t.magFilter=e.magFilter;if(e.minFilter!==void 0)t.minFilter=e.minFilter;if(e.format!==void 0)t.format=e.format;if(e.type!==void 0)t.type=e.type;if(e.anisotropy!==void 0)t.anisotropy=e.anisotropy;if(e.colorSpace!==void 0)t.colorSpace=e.colorSpace;if(e.flipY!==void 0)t.flipY=e.flipY;if(e.generateMipmaps!==void 0)t.generateMipmaps=e.generateMipmaps;if(e.internalFormat!==void 0)t.internalFormat=e.internalFormat;for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){if(this._depthTexture!==null)this._depthTexture.renderTarget=null;if(e!==null)e.renderTarget=this;this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,s=this.textures.length;i<s;i++)if(this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n,this.textures[i].isData3DTexture!==!0)this.textures[i].isArrayTexture=this.textures[i].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let i=Object.assign({},e.textures[t].image);this.textures[t].source=new Ls(i)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null)this.depthTexture=e.depthTexture.clone();return this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class $t extends Qo{constructor(e=1,t=1,n={}){super(e,t,n);this.isWebGLRenderTarget=!0}}class Xr extends gt{constructor(e=null,t=1,n=1,i=1){super(null);this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class el extends gt{constructor(e=null,t=1,n=1,i=1){super(null);this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Ot{constructor(e=new D(1/0,1/0,1/0),t=new D(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(en.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(en.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=en.copy(t).multiplyScalar(0.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(0.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let r=0,a=s.count;r<a;r++){if(e.isMesh===!0)e.getVertexPosition(r,en);else en.fromBufferAttribute(s,r);en.applyMatrix4(e.matrixWorld),this.expandByPoint(en)}else{if(e.boundingBox!==void 0){if(e.boundingBox===null)e.computeBoundingBox();js.copy(e.boundingBox)}else{if(n.boundingBox===null)n.computeBoundingBox();js.copy(n.boundingBox)}js.applyMatrix4(e.matrixWorld),this.union(js)}}let i=e.children;for(let s=0,r=i.length;s<r;s++)this.expandByObject(i[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,en),en.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;if(e.normal.x>0)t=e.normal.x*this.min.x,n=e.normal.x*this.max.x;else t=e.normal.x*this.max.x,n=e.normal.x*this.min.x;if(e.normal.y>0)t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y;else t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y;if(e.normal.z>0)t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z;else t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z;return t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ds),Qs.subVectors(this.max,ds),Ai.subVectors(e.a,ds),Ei.subVectors(e.b,ds),wi.subVectors(e.c,ds),On.subVectors(Ei,Ai),Bn.subVectors(wi,Ei),ii.subVectors(Ai,wi);let t=[0,-On.z,On.y,0,-Bn.z,Bn.y,0,-ii.z,ii.y,On.z,0,-On.x,Bn.z,0,-Bn.x,ii.z,0,-ii.x,-On.y,On.x,0,-Bn.y,Bn.x,0,-ii.y,ii.x,0];if(!Aa(t,Ai,Ei,wi,Qs))return!1;if(t=[1,0,0,0,1,0,0,0,1],!Aa(t,Ai,Ei,wi,Qs))return!1;return er.crossVectors(On,Bn),t=[er.x,er.y,er.z],Aa(t,Ai,Ei,wi,Qs)}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,en).distanceTo(e)}getBoundingSphere(e){if(this.isEmpty())e.makeEmpty();else this.getCenter(e.center),e.radius=this.getSize(en).length()*0.5;return e}intersect(e){if(this.min.max(e.min),this.max.min(e.max),this.isEmpty())this.makeEmpty();return this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){if(this.isEmpty())return this;return yn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),yn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),yn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),yn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),yn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),yn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),yn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),yn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(yn),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}var yn=[new D,new D,new D,new D,new D,new D,new D,new D],en=new D,js=new Ot,Ai=new D,Ei=new D,wi=new D,On=new D,Bn=new D,ii=new D,ds=new D,Qs=new D,er=new D,si=new D;function Aa(e,t,n,i,s){for(let r=0,a=e.length-3;r<=a;r+=3){si.fromArray(e,r);let o=s.x*Math.abs(si.x)+s.y*Math.abs(si.y)+s.z*Math.abs(si.z),l=t.dot(si),c=n.dot(si),h=i.dot(si);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var vd=new Ot,fs=new D,Ea=new D;class Vt{constructor(e=new D,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;if(t!==void 0)n.copy(t);else vd.setFromPoints(e).getCenter(n);let i=0;for(let s=0,r=e.length;s<r;s++)i=Math.max(i,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);if(t.copy(e),n>this.radius*this.radius)t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center);return t}getBoundingBox(e){if(this.isEmpty())return e.makeEmpty(),e;return e.set(this.center,this.center),e.expandByScalar(this.radius),e}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;fs.subVectors(e,this.center);let t=fs.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),i=(n-this.radius)*0.5;this.center.addScaledVector(fs,i/n),this.radius+=i}return this}union(e){if(e.isEmpty())return this;if(this.isEmpty())return this.copy(e),this;if(this.center.equals(e.center)===!0)this.radius=Math.max(this.radius,e.radius);else Ea.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(fs.copy(e.center).add(Ea)),this.expandByPoint(fs.copy(e.center).sub(Ea));return this}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}var Mn=new D,wa=new D,tr=new D,zn=new D,Ra=new D,nr=new D,Ca=new D;class es{constructor(e=new D,t=new D(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Mn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);if(n<0)return t.copy(this.origin);return t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Mn.subVectors(e,this.origin).dot(this.direction);if(t<0)return this.origin.distanceToSquared(e);return Mn.copy(this.origin).addScaledVector(this.direction,t),Mn.distanceToSquared(e)}distanceSqToSegment(e,t,n,i){wa.copy(e).add(t).multiplyScalar(0.5),tr.copy(t).sub(e).normalize(),zn.copy(this.origin).sub(wa);let s=e.distanceTo(t)*0.5,r=-this.direction.dot(tr),a=zn.dot(this.direction),o=-zn.dot(tr),l=zn.lengthSq(),c=Math.abs(1-r*r),h,u,d,m;if(c>0)if(h=r*o-a,u=r*a-o,m=s*c,h>=0)if(u>=-m)if(u<=m){let _=1/c;h*=_,u*=_,d=h*(h+r*u+2*a)+u*(r*h+u+2*o)+l}else u=s,h=Math.max(0,-(r*u+a)),d=-h*h+u*(u+2*o)+l;else u=-s,h=Math.max(0,-(r*u+a)),d=-h*h+u*(u+2*o)+l;else if(u<=-m)h=Math.max(0,-(-r*s+a)),u=h>0?-s:Math.min(Math.max(-s,-o),s),d=-h*h+u*(u+2*o)+l;else if(u<=m)h=0,u=Math.min(Math.max(-s,-o),s),d=u*(u+2*o)+l;else h=Math.max(0,-(r*s+a)),u=h>0?s:Math.min(Math.max(-s,-o),s),d=-h*h+u*(u+2*o)+l;else u=r>0?-s:s,h=Math.max(0,-(r*u+a)),d=-h*h+u*(u+2*o)+l;if(n)n.copy(this.origin).addScaledVector(this.direction,h);if(i)i.copy(wa).addScaledVector(tr,u);return d}intersectSphere(e,t){Mn.subVectors(e.center,this.origin);let n=Mn.dot(this.direction),i=Mn.dot(Mn)-n*n,s=e.radius*e.radius;if(i>s)return null;let r=Math.sqrt(s-i),a=n-r,o=n+r;if(o<0)return null;if(a<0)return this.at(o,t);return this.at(a,t)}intersectsSphere(e){if(e.radius<0)return!1;return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0){if(e.distanceToPoint(this.origin)===0)return 0;return null}let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);if(n===null)return null;return this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);if(t===0)return!0;if(e.normal.dot(this.direction)*t<0)return!0;return!1}intersectBox(e,t){let n,i,s,r,a,o,l=1/this.direction.x,c=1/this.direction.y,h=1/this.direction.z,u=this.origin;if(l>=0)n=(e.min.x-u.x)*l,i=(e.max.x-u.x)*l;else n=(e.max.x-u.x)*l,i=(e.min.x-u.x)*l;if(c>=0)s=(e.min.y-u.y)*c,r=(e.max.y-u.y)*c;else s=(e.max.y-u.y)*c,r=(e.min.y-u.y)*c;if(n>r||s>i)return null;if(s>n||isNaN(n))n=s;if(r<i||isNaN(i))i=r;if(h>=0)a=(e.min.z-u.z)*h,o=(e.max.z-u.z)*h;else a=(e.max.z-u.z)*h,o=(e.min.z-u.z)*h;if(n>o||a>i)return null;if(a>n||n!==n)n=a;if(o<i||i!==i)i=o;if(i<0)return null;return this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,Mn)!==null}intersectTriangle(e,t,n,i,s){Ra.subVectors(t,e),nr.subVectors(n,e),Ca.crossVectors(Ra,nr);let r=this.direction.dot(Ca),a;if(r>0){if(i)return null;a=1}else if(r<0)a=-1,r=-r;else return null;zn.subVectors(this.origin,e);let o=a*this.direction.dot(nr.crossVectors(zn,nr));if(o<0)return null;let l=a*this.direction.dot(Ra.cross(zn));if(l<0)return null;if(o+l>r)return null;let c=-a*zn.dot(Ca);if(c<0)return null;return this.at(c/r,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Be{constructor(e,t,n,i,s,r,a,o,l,c,h,u,d,m,_,x){if(Be.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0)this.set(e,t,n,i,s,r,a,o,l,c,h,u,d,m,_,x)}set(e,t,n,i,s,r,a,o,l,c,h,u,d,m,_,x){let f=this.elements;return f[0]=e,f[4]=t,f[8]=n,f[12]=i,f[1]=s,f[5]=r,f[9]=a,f[13]=o,f[2]=l,f[6]=c,f[10]=h,f[14]=u,f[3]=d,f[7]=m,f[11]=_,f[15]=x,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Be().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){if(this.determinant()===0)return e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this;return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinant()===0)return this.identity();let t=this.elements,n=e.elements,i=1/Ri.setFromMatrixColumn(e,0).length(),s=1/Ri.setFromMatrixColumn(e,1).length(),r=1/Ri.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*r,t[9]=n[9]*r,t[10]=n[10]*r,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,{x:n,y:i,z:s}=e,r=Math.cos(n),a=Math.sin(n),o=Math.cos(i),l=Math.sin(i),c=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){let u=r*c,d=r*h,m=a*c,_=a*h;t[0]=o*c,t[4]=-o*h,t[8]=l,t[1]=d+m*l,t[5]=u-_*l,t[9]=-a*o,t[2]=_-u*l,t[6]=m+d*l,t[10]=r*o}else if(e.order==="YXZ"){let u=o*c,d=o*h,m=l*c,_=l*h;t[0]=u+_*a,t[4]=m*a-d,t[8]=r*l,t[1]=r*h,t[5]=r*c,t[9]=-a,t[2]=d*a-m,t[6]=_+u*a,t[10]=r*o}else if(e.order==="ZXY"){let u=o*c,d=o*h,m=l*c,_=l*h;t[0]=u-_*a,t[4]=-r*h,t[8]=m+d*a,t[1]=d+m*a,t[5]=r*c,t[9]=_-u*a,t[2]=-r*l,t[6]=a,t[10]=r*o}else if(e.order==="ZYX"){let u=r*c,d=r*h,m=a*c,_=a*h;t[0]=o*c,t[4]=m*l-d,t[8]=u*l+_,t[1]=o*h,t[5]=_*l+u,t[9]=d*l-m,t[2]=-l,t[6]=a*o,t[10]=r*o}else if(e.order==="YZX"){let u=r*o,d=r*l,m=a*o,_=a*l;t[0]=o*c,t[4]=_-u*h,t[8]=m*h+d,t[1]=h,t[5]=r*c,t[9]=-a*c,t[2]=-l*c,t[6]=d*h+m,t[10]=u-_*h}else if(e.order==="XZY"){let u=r*o,d=r*l,m=a*o,_=a*l;t[0]=o*c,t[4]=-h,t[8]=l*c,t[1]=u*h+_,t[5]=r*c,t[9]=d*h-m,t[2]=m*h-d,t[6]=a*c,t[10]=_*h+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(yd,e,Md)}lookAt(e,t,n){let i=this.elements;if(kt.subVectors(e,t),kt.lengthSq()===0)kt.z=1;if(kt.normalize(),kn.crossVectors(n,kt),kn.lengthSq()===0){if(Math.abs(n.z)===1)kt.x+=0.0001;else kt.z+=0.0001;kt.normalize(),kn.crossVectors(n,kt)}return kn.normalize(),ir.crossVectors(kt,kn),i[0]=kn.x,i[4]=ir.x,i[8]=kt.x,i[1]=kn.y,i[5]=ir.y,i[9]=kt.y,i[2]=kn.z,i[6]=ir.z,i[10]=kt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,s=this.elements,r=n[0],a=n[4],o=n[8],l=n[12],c=n[1],h=n[5],u=n[9],d=n[13],m=n[2],_=n[6],x=n[10],f=n[14],p=n[3],A=n[7],b=n[11],T=n[15],I=i[0],E=i[4],P=i[8],N=i[12],y=i[1],S=i[5],R=i[9],k=i[13],X=i[2],G=i[6],K=i[10],H=i[14],O=i[3],Y=i[7],ee=i[11],ie=i[15];return s[0]=r*I+a*y+o*X+l*O,s[4]=r*E+a*S+o*G+l*Y,s[8]=r*P+a*R+o*K+l*ee,s[12]=r*N+a*k+o*H+l*ie,s[1]=c*I+h*y+u*X+d*O,s[5]=c*E+h*S+u*G+d*Y,s[9]=c*P+h*R+u*K+d*ee,s[13]=c*N+h*k+u*H+d*ie,s[2]=m*I+_*y+x*X+f*O,s[6]=m*E+_*S+x*G+f*Y,s[10]=m*P+_*R+x*K+f*ee,s[14]=m*N+_*k+x*H+f*ie,s[3]=p*I+A*y+b*X+T*O,s[7]=p*E+A*S+b*G+T*Y,s[11]=p*P+A*R+b*K+T*ee,s[15]=p*N+A*k+b*H+T*ie,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],i=e[8],s=e[12],r=e[1],a=e[5],o=e[9],l=e[13],c=e[2],h=e[6],u=e[10],d=e[14],m=e[3],_=e[7],x=e[11],f=e[15],p=o*d-l*u,A=a*d-l*h,b=a*u-o*h,T=r*d-l*c,I=r*u-o*c,E=r*h-a*c;return t*(_*p-x*A+f*b)-n*(m*p-x*T+f*I)+i*(m*A-_*T+f*E)-s*(m*b-_*I+x*E)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let i=this.elements;if(e.isVector3)i[12]=e.x,i[13]=e.y,i[14]=e.z;else i[12]=e,i[13]=t,i[14]=n;return this}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],r=e[4],a=e[5],o=e[6],l=e[7],c=e[8],h=e[9],u=e[10],d=e[11],m=e[12],_=e[13],x=e[14],f=e[15],p=h*x*l-_*u*l+_*o*d-a*x*d-h*o*f+a*u*f,A=m*u*l-c*x*l-m*o*d+r*x*d+c*o*f-r*u*f,b=c*_*l-m*h*l+m*a*d-r*_*d-c*a*f+r*h*f,T=m*h*o-c*_*o-m*a*u+r*_*u+c*a*x-r*h*x,I=t*p+n*A+i*b+s*T;if(I===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let E=1/I;return e[0]=p*E,e[1]=(_*u*s-h*x*s-_*i*d+n*x*d+h*i*f-n*u*f)*E,e[2]=(a*x*s-_*o*s+_*i*l-n*x*l-a*i*f+n*o*f)*E,e[3]=(h*o*s-a*u*s-h*i*l+n*u*l+a*i*d-n*o*d)*E,e[4]=A*E,e[5]=(c*x*s-m*u*s+m*i*d-t*x*d-c*i*f+t*u*f)*E,e[6]=(m*o*s-r*x*s-m*i*l+t*x*l+r*i*f-t*o*f)*E,e[7]=(r*u*s-c*o*s+c*i*l-t*u*l-r*i*d+t*o*d)*E,e[8]=b*E,e[9]=(m*h*s-c*_*s-m*n*d+t*_*d+c*n*f-t*h*f)*E,e[10]=(r*_*s-m*a*s+m*n*l-t*_*l-r*n*f+t*a*f)*E,e[11]=(c*a*s-r*h*s-c*n*l+t*h*l+r*n*d-t*a*d)*E,e[12]=T*E,e[13]=(c*_*i-m*h*i+m*n*u-t*_*u-c*n*x+t*h*x)*E,e[14]=(m*a*i-r*_*i-m*n*o+t*_*o+r*n*x-t*a*x)*E,e[15]=(r*h*i-c*a*i+c*n*o-t*h*o-r*n*u+t*a*u)*E,this}scale(e){let t=this.elements,{x:n,y:i,z:s}=e;return t[0]*=n,t[4]*=i,t[8]*=s,t[1]*=n,t[5]*=i,t[9]*=s,t[2]*=n,t[6]*=i,t[10]*=s,t[3]*=n,t[7]*=i,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){if(e.isVector3)this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1);else this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1);return this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),i=Math.sin(t),s=1-n,{x:r,y:a,z:o}=e,l=s*r,c=s*a;return this.set(l*r+n,l*a-i*o,l*o+i*a,0,l*a+i*o,c*a+n,c*o-i*r,0,l*o-i*a,c*o+i*r,s*o*o+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,s,r){return this.set(1,n,s,0,e,1,r,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){let i=this.elements,{_x:s,_y:r,_z:a,_w:o}=t,l=s+s,c=r+r,h=a+a,u=s*l,d=s*c,m=s*h,_=r*c,x=r*h,f=a*h,p=o*l,A=o*c,b=o*h,{x:T,y:I,z:E}=n;return i[0]=(1-(_+f))*T,i[1]=(d+b)*T,i[2]=(m-A)*T,i[3]=0,i[4]=(d-b)*I,i[5]=(1-(u+f))*I,i[6]=(x+p)*I,i[7]=0,i[8]=(m+A)*E,i[9]=(x-p)*E,i[10]=(1-(u+_))*E,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){let i=this.elements;if(e.x=i[12],e.y=i[13],e.z=i[14],this.determinant()===0)return n.set(1,1,1),t.identity(),this;let s=Ri.set(i[0],i[1],i[2]).length(),r=Ri.set(i[4],i[5],i[6]).length(),a=Ri.set(i[8],i[9],i[10]).length();if(this.determinant()<0)s=-s;tn.copy(this);let l=1/s,c=1/r,h=1/a;return tn.elements[0]*=l,tn.elements[1]*=l,tn.elements[2]*=l,tn.elements[4]*=c,tn.elements[5]*=c,tn.elements[6]*=c,tn.elements[8]*=h,tn.elements[9]*=h,tn.elements[10]*=h,t.setFromRotationMatrix(tn),n.x=s,n.y=r,n.z=a,this}makePerspective(e,t,n,i,s,r,a=2000,o=!1){let l=this.elements,c=2*s/(t-e),h=2*s/(n-i),u=(t+e)/(t-e),d=(n+i)/(n-i),m,_;if(o)m=s/(r-s),_=r*s/(r-s);else if(a===2000)m=-(r+s)/(r-s),_=-2*r*s/(r-s);else if(a===2001)m=-r/(r-s),_=-r*s/(r-s);else throw Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=m,l[14]=_,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,i,s,r,a=2000,o=!1){let l=this.elements,c=2/(t-e),h=2/(n-i),u=-(t+e)/(t-e),d=-(n+i)/(n-i),m,_;if(o)m=1/(r-s),_=r/(r-s);else if(a===2000)m=-2/(r-s),_=-(r+s)/(r-s);else if(a===2001)m=-1/(r-s),_=-s/(r-s);else throw Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=0,l[12]=u,l[1]=0,l[5]=h,l[9]=0,l[13]=d,l[2]=0,l[6]=0,l[10]=m,l[14]=_,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}var Ri=new D,tn=new Be,yd=new D(0,0,0),Md=new D(1,1,1),kn=new D,ir=new D,kt=new D,jl=new Be,Ql=new cn;class Jt{constructor(e=0,t=0,n=0,i=Jt.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let i=e.elements,s=i[0],r=i[4],a=i[8],o=i[1],l=i[5],c=i[9],h=i[2],u=i[6],d=i[10];switch(t){case"XYZ":if(this._y=Math.asin(Xe(a,-1,1)),Math.abs(a)<0.9999999)this._x=Math.atan2(-c,d),this._z=Math.atan2(-r,s);else this._x=Math.atan2(u,l),this._z=0;break;case"YXZ":if(this._x=Math.asin(-Xe(c,-1,1)),Math.abs(c)<0.9999999)this._y=Math.atan2(a,d),this._z=Math.atan2(o,l);else this._y=Math.atan2(-h,s),this._z=0;break;case"ZXY":if(this._x=Math.asin(Xe(u,-1,1)),Math.abs(u)<0.9999999)this._y=Math.atan2(-h,d),this._z=Math.atan2(-r,l);else this._y=0,this._z=Math.atan2(o,s);break;case"ZYX":if(this._y=Math.asin(-Xe(h,-1,1)),Math.abs(h)<0.9999999)this._x=Math.atan2(u,d),this._z=Math.atan2(o,s);else this._x=0,this._z=Math.atan2(-r,l);break;case"YZX":if(this._z=Math.asin(Xe(o,-1,1)),Math.abs(o)<0.9999999)this._x=Math.atan2(-c,l),this._y=Math.atan2(-h,s);else this._x=0,this._y=Math.atan2(a,d);break;case"XZY":if(this._z=Math.asin(-Xe(r,-1,1)),Math.abs(r)<0.9999999)this._x=Math.atan2(u,l),this._y=Math.atan2(a,s);else this._x=Math.atan2(-c,d),this._y=0;break;default:Me("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}if(this._order=t,n===!0)this._onChangeCallback();return this}setFromQuaternion(e,t,n){return jl.makeRotationFromQuaternion(e),this.setFromRotationMatrix(jl,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Ql.setFromEuler(this),this.setFromQuaternion(Ql,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){if(this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0)this._order=e[3];return this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Jt.DEFAULT_ORDER="XYZ";class qr{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}var Sd=0,ec=new D,Ci=new cn,Sn=new Be,sr=new D,ps=new D,bd=new D,Td=new cn,tc=new D(1,0,0),nc=new D(0,1,0),ic=new D(0,0,1),sc={type:"added"},Ad={type:"removed"},Ii={type:"childadded",child:null},Ia={type:"childremoved",child:null};class tt extends Yn{constructor(){super();this.isObject3D=!0,Object.defineProperty(this,"id",{value:Sd++}),this.uuid=rn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=tt.DEFAULT_UP.clone();let e=new D,t=new Jt,n=new cn,i=new D(1,1,1);function s(){n.setFromEuler(t,!1)}function r(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(r),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Be},normalMatrix:{value:new ze}}),this.matrix=new Be,this.matrixWorld=new Be,this.matrixAutoUpdate=tt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=tt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new qr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){if(this.matrixAutoUpdate)this.updateMatrix();this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Ci.setFromAxisAngle(e,t),this.quaternion.multiply(Ci),this}rotateOnWorldAxis(e,t){return Ci.setFromAxisAngle(e,t),this.quaternion.premultiply(Ci),this}rotateX(e){return this.rotateOnAxis(tc,e)}rotateY(e){return this.rotateOnAxis(nc,e)}rotateZ(e){return this.rotateOnAxis(ic,e)}translateOnAxis(e,t){return ec.copy(e).applyQuaternion(this.quaternion),this.position.add(ec.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(tc,e)}translateY(e){return this.translateOnAxis(nc,e)}translateZ(e){return this.translateOnAxis(ic,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Sn.copy(this.matrixWorld).invert())}lookAt(e,t,n){if(e.isVector3)sr.copy(e);else sr.set(e,t,n);let i=this.parent;if(this.updateWorldMatrix(!0,!1),ps.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight)Sn.lookAt(ps,sr,this.up);else Sn.lookAt(sr,ps,this.up);if(this.quaternion.setFromRotationMatrix(Sn),i)Sn.extractRotation(i.matrixWorld),Ci.setFromRotationMatrix(Sn),this.quaternion.premultiply(Ci.invert())}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}if(e===this)return Ie("Object3D.add: object can't be added as a child of itself.",e),this;if(e&&e.isObject3D)e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(sc),Ii.child=e,this.dispatchEvent(Ii),Ii.child=null;else Ie("Object3D.add: object not an instance of THREE.Object3D.",e);return this}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);if(t!==-1)e.parent=null,this.children.splice(t,1),e.dispatchEvent(Ad),Ia.child=e,this.dispatchEvent(Ia),Ia.child=null;return this}removeFromParent(){let e=this.parent;if(e!==null)e.remove(this);return this}clear(){return this.remove(...this.children)}attach(e){if(this.updateWorldMatrix(!0,!1),Sn.copy(this.matrixWorld).invert(),e.parent!==null)e.parent.updateWorldMatrix(!0,!1),Sn.multiply(e.parent.matrixWorld);return e.applyMatrix4(Sn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(sc),Ii.child=e,this.dispatchEvent(Ii),Ii.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}return}getObjectsByProperty(e,t,n=[]){if(this[e]===t)n.push(this);let i=this.children;for(let s=0,r=i.length;s<r;s++)i[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ps,e,bd),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ps,Td,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;if(t!==null)e(t),t.traverseAncestors(e)}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldNeedsUpdate||e){if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);this.matrixWorldNeedsUpdate=!1,e=!0}let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null)n.updateWorldMatrix(!0,!1);if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);if(t===!0){let i=this.children;for(let s=0,r=i.length;s<r;s++)i[s].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e==="string",n={};if(t)e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"};let i={};if(i.uuid=this.uuid,i.type=this.type,this.name!=="")i.name=this.name;if(this.castShadow===!0)i.castShadow=!0;if(this.receiveShadow===!0)i.receiveShadow=!0;if(this.visible===!1)i.visible=!1;if(this.frustumCulled===!1)i.frustumCulled=!1;if(this.renderOrder!==0)i.renderOrder=this.renderOrder;if(Object.keys(this.userData).length>0)i.userData=this.userData;if(i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1)i.matrixAutoUpdate=!1;if(this.isInstancedMesh){if(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null)i.instanceColor=this.instanceColor.toJSON()}if(this.isBatchedMesh){if(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map((a)=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map((a)=>({...a})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(e),i.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null)i.colorsTexture=this._colorsTexture.toJSON(e);if(this.boundingSphere!==null)i.boundingSphere=this.boundingSphere.toJSON();if(this.boundingBox!==null)i.boundingBox=this.boundingBox.toJSON()}function s(a,o){if(a[o.uuid]===void 0)a[o.uuid]=o.toJSON(e);return o.uuid}if(this.isScene){if(this.background){if(this.background.isColor)i.background=this.background.toJSON();else if(this.background.isTexture)i.background=this.background.toJSON(e).uuid}if(this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0)i.environment=this.environment.toJSON(e).uuid}else if(this.isMesh||this.isLine||this.isPoints){i.geometry=s(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let o=a.shapes;if(Array.isArray(o))for(let l=0,c=o.length;l<c;l++){let h=o[l];s(e.shapes,h)}else s(e.shapes,o)}}if(this.isSkinnedMesh){if(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0)s(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid}if(this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let o=0,l=this.material.length;o<l;o++)a.push(s(e.materials,this.material[o]));i.material=a}else i.material=s(e.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){let o=this.animations[a];i.animations.push(s(e.animations,o))}}if(t){let a=r(e.geometries),o=r(e.materials),l=r(e.textures),c=r(e.images),h=r(e.shapes),u=r(e.skeletons),d=r(e.animations),m=r(e.nodes);if(a.length>0)n.geometries=a;if(o.length>0)n.materials=o;if(l.length>0)n.textures=l;if(c.length>0)n.images=c;if(h.length>0)n.shapes=h;if(u.length>0)n.skeletons=u;if(d.length>0)n.animations=d;if(m.length>0)n.nodes=m}return n.object=i,n;function r(a){let o=[];for(let l in a){let c=a[l];delete c.metadata,o.push(c)}return o}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let i=e.children[n];this.add(i.clone())}return this}}tt.DEFAULT_UP=new D(0,1,0);tt.DEFAULT_MATRIX_AUTO_UPDATE=!0;tt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var nn=new D,bn=new D,Pa=new D,Tn=new D,Pi=new D,Li=new D,rc=new D,La=new D,Na=new D,Da=new D,Ua=new ct,Fa=new ct,Oa=new ct;class Ht{constructor(e=new D,t=new D,n=new D){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),nn.subVectors(e,t),i.cross(nn);let s=i.lengthSq();if(s>0)return i.multiplyScalar(1/Math.sqrt(s));return i.set(0,0,0)}static getBarycoord(e,t,n,i,s){nn.subVectors(i,t),bn.subVectors(n,t),Pa.subVectors(e,t);let r=nn.dot(nn),a=nn.dot(bn),o=nn.dot(Pa),l=bn.dot(bn),c=bn.dot(Pa),h=r*l-a*a;if(h===0)return s.set(0,0,0),null;let u=1/h,d=(l*o-a*c)*u,m=(r*c-a*o)*u;return s.set(1-d-m,m,d)}static containsPoint(e,t,n,i){if(this.getBarycoord(e,t,n,i,Tn)===null)return!1;return Tn.x>=0&&Tn.y>=0&&Tn.x+Tn.y<=1}static getInterpolation(e,t,n,i,s,r,a,o){if(this.getBarycoord(e,t,n,i,Tn)===null){if(o.x=0,o.y=0,"z"in o)o.z=0;if("w"in o)o.w=0;return null}return o.setScalar(0),o.addScaledVector(s,Tn.x),o.addScaledVector(r,Tn.y),o.addScaledVector(a,Tn.z),o}static getInterpolatedAttribute(e,t,n,i,s,r){return Ua.setScalar(0),Fa.setScalar(0),Oa.setScalar(0),Ua.fromBufferAttribute(e,t),Fa.fromBufferAttribute(e,n),Oa.fromBufferAttribute(e,i),r.setScalar(0),r.addScaledVector(Ua,s.x),r.addScaledVector(Fa,s.y),r.addScaledVector(Oa,s.z),r}static isFrontFacing(e,t,n,i){return nn.subVectors(n,t),bn.subVectors(e,t),nn.cross(bn).dot(i)<0?!0:!1}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return nn.subVectors(this.c,this.b),bn.subVectors(this.a,this.b),nn.cross(bn).length()*0.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(0.3333333333333333)}getNormal(e){return Ht.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Ht.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,s){return Ht.getInterpolation(e,this.a,this.b,this.c,t,n,i,s)}containsPoint(e){return Ht.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Ht.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,i=this.b,s=this.c,r,a;Pi.subVectors(i,n),Li.subVectors(s,n),La.subVectors(e,n);let o=Pi.dot(La),l=Li.dot(La);if(o<=0&&l<=0)return t.copy(n);Na.subVectors(e,i);let c=Pi.dot(Na),h=Li.dot(Na);if(c>=0&&h<=c)return t.copy(i);let u=o*h-c*l;if(u<=0&&o>=0&&c<=0)return r=o/(o-c),t.copy(n).addScaledVector(Pi,r);Da.subVectors(e,s);let d=Pi.dot(Da),m=Li.dot(Da);if(m>=0&&d<=m)return t.copy(s);let _=d*l-o*m;if(_<=0&&l>=0&&m<=0)return a=l/(l-m),t.copy(n).addScaledVector(Li,a);let x=c*m-d*h;if(x<=0&&h-c>=0&&d-m>=0)return rc.subVectors(s,i),a=(h-c)/(h-c+(d-m)),t.copy(i).addScaledVector(rc,a);let f=1/(x+_+u);return r=_*f,a=u*f,t.copy(n).addScaledVector(Pi,r).addScaledVector(Li,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}var yh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Gn={h:0,s:0,l:0},rr={h:0,s:0,l:0};function Ba(e,t,n){if(n<0)n+=1;if(n>1)n-=1;if(n<0.16666666666666666)return e+(t-e)*6*n;if(n<0.5)return t;if(n<0.6666666666666666)return e+(t-e)*6*(0.6666666666666666-n);return e}class Se{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let i=e;if(i&&i.isColor)this.copy(i);else if(typeof i==="number")this.setHex(i);else if(typeof i==="string")this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t="srgb"){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,We.colorSpaceToWorking(this,t),this}setRGB(e,t,n,i=We.workingColorSpace){return this.r=e,this.g=t,this.b=n,We.colorSpaceToWorking(this,i),this}setHSL(e,t,n,i=We.workingColorSpace){if(e=Ko(e,1),t=Xe(t,0,1),n=Xe(n,0,1),t===0)this.r=this.g=this.b=n;else{let s=n<=0.5?n*(1+t):n+t-n*t,r=2*n-s;this.r=Ba(r,s,e+0.3333333333333333),this.g=Ba(r,s,e),this.b=Ba(r,s,e-0.3333333333333333)}return We.colorSpaceToWorking(this,i),this}setStyle(e,t="srgb"){function n(s){if(s===void 0)return;if(parseFloat(s)<1)Me("Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,r=i[1],a=i[2];switch(r){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:Me("Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=i[1],r=s.length;if(r===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);else if(r===6)return this.setHex(parseInt(s,16),t);else Me("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t="srgb"){let n=yh[e.toLowerCase()];if(n!==void 0)this.setHex(n,t);else Me("Color: Unknown color "+e);return this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=wn(e.r),this.g=wn(e.g),this.b=wn(e.b),this}copyLinearToSRGB(e){return this.r=Hi(e.r),this.g=Hi(e.g),this.b=Hi(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e="srgb"){return We.workingToColorSpace(Et.copy(this),e),Math.round(Xe(Et.r*255,0,255))*65536+Math.round(Xe(Et.g*255,0,255))*256+Math.round(Xe(Et.b*255,0,255))}getHexString(e="srgb"){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=We.workingColorSpace){We.workingToColorSpace(Et.copy(this),t);let{r:n,g:i,b:s}=Et,r=Math.max(n,i,s),a=Math.min(n,i,s),o,l,c=(a+r)/2;if(a===r)o=0,l=0;else{let h=r-a;switch(l=c<=0.5?h/(r+a):h/(2-r-a),r){case n:o=(i-s)/h+(i<s?6:0);break;case i:o=(s-n)/h+2;break;case s:o=(n-i)/h+4;break}o/=6}return e.h=o,e.s=l,e.l=c,e}getRGB(e,t=We.workingColorSpace){return We.workingToColorSpace(Et.copy(this),t),e.r=Et.r,e.g=Et.g,e.b=Et.b,e}getStyle(e="srgb"){We.workingToColorSpace(Et.copy(this),e);let{r:t,g:n,b:i}=Et;if(e!=="srgb")return`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`;return`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(Gn),this.setHSL(Gn.h+e,Gn.s+t,Gn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Gn),e.getHSL(rr);let n=bs(Gn.h,rr.h,t),i=bs(Gn.s,rr.s,t),s=bs(Gn.l,rr.l,t);return this.setHSL(n,i,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,i=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*i,this.g=s[1]*t+s[4]*n+s[7]*i,this.b=s[2]*t+s[5]*n+s[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}var Et=new Se;Se.NAMES=yh;var Ed=0;class Nt extends Yn{constructor(){super();this.isMaterial=!0,Object.defineProperty(this,"id",{value:Ed++}),this.uuid=rn(),this.name="",this.type="Material",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Se(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=7680,this.stencilZFail=7680,this.stencilZPass=7680,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){if(this._alphaTest>0!==e>0)this.version++;this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e===void 0)return;for(let t in e){let n=e[t];if(n===void 0){Me(`Material: parameter '${t}' has value of undefined.`);continue}let i=this[t];if(i===void 0){Me(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}if(i&&i.isColor)i.set(n);else if(i&&i.isVector3&&(n&&n.isVector3))i.copy(n);else this[t]=n}}toJSON(e){let t=e===void 0||typeof e==="string";if(t)e={textures:{},images:{}};let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};if(n.uuid=this.uuid,n.type=this.type,this.name!=="")n.name=this.name;if(this.color&&this.color.isColor)n.color=this.color.getHex();if(this.roughness!==void 0)n.roughness=this.roughness;if(this.metalness!==void 0)n.metalness=this.metalness;if(this.sheen!==void 0)n.sheen=this.sheen;if(this.sheenColor&&this.sheenColor.isColor)n.sheenColor=this.sheenColor.getHex();if(this.sheenRoughness!==void 0)n.sheenRoughness=this.sheenRoughness;if(this.emissive&&this.emissive.isColor)n.emissive=this.emissive.getHex();if(this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1)n.emissiveIntensity=this.emissiveIntensity;if(this.specular&&this.specular.isColor)n.specular=this.specular.getHex();if(this.specularIntensity!==void 0)n.specularIntensity=this.specularIntensity;if(this.specularColor&&this.specularColor.isColor)n.specularColor=this.specularColor.getHex();if(this.shininess!==void 0)n.shininess=this.shininess;if(this.clearcoat!==void 0)n.clearcoat=this.clearcoat;if(this.clearcoatRoughness!==void 0)n.clearcoatRoughness=this.clearcoatRoughness;if(this.clearcoatMap&&this.clearcoatMap.isTexture)n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid;if(this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture)n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid;if(this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture)n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray();if(this.sheenColorMap&&this.sheenColorMap.isTexture)n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid;if(this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture)n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid;if(this.dispersion!==void 0)n.dispersion=this.dispersion;if(this.iridescence!==void 0)n.iridescence=this.iridescence;if(this.iridescenceIOR!==void 0)n.iridescenceIOR=this.iridescenceIOR;if(this.iridescenceThicknessRange!==void 0)n.iridescenceThicknessRange=this.iridescenceThicknessRange;if(this.iridescenceMap&&this.iridescenceMap.isTexture)n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid;if(this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture)n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid;if(this.anisotropy!==void 0)n.anisotropy=this.anisotropy;if(this.anisotropyRotation!==void 0)n.anisotropyRotation=this.anisotropyRotation;if(this.anisotropyMap&&this.anisotropyMap.isTexture)n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid;if(this.map&&this.map.isTexture)n.map=this.map.toJSON(e).uuid;if(this.matcap&&this.matcap.isTexture)n.matcap=this.matcap.toJSON(e).uuid;if(this.alphaMap&&this.alphaMap.isTexture)n.alphaMap=this.alphaMap.toJSON(e).uuid;if(this.lightMap&&this.lightMap.isTexture)n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity;if(this.aoMap&&this.aoMap.isTexture)n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity;if(this.bumpMap&&this.bumpMap.isTexture)n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale;if(this.normalMap&&this.normalMap.isTexture)n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray();if(this.displacementMap&&this.displacementMap.isTexture)n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias;if(this.roughnessMap&&this.roughnessMap.isTexture)n.roughnessMap=this.roughnessMap.toJSON(e).uuid;if(this.metalnessMap&&this.metalnessMap.isTexture)n.metalnessMap=this.metalnessMap.toJSON(e).uuid;if(this.emissiveMap&&this.emissiveMap.isTexture)n.emissiveMap=this.emissiveMap.toJSON(e).uuid;if(this.specularMap&&this.specularMap.isTexture)n.specularMap=this.specularMap.toJSON(e).uuid;if(this.specularIntensityMap&&this.specularIntensityMap.isTexture)n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid;if(this.specularColorMap&&this.specularColorMap.isTexture)n.specularColorMap=this.specularColorMap.toJSON(e).uuid;if(this.envMap&&this.envMap.isTexture){if(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0)n.combine=this.combine}if(this.envMapRotation!==void 0)n.envMapRotation=this.envMapRotation.toArray();if(this.envMapIntensity!==void 0)n.envMapIntensity=this.envMapIntensity;if(this.reflectivity!==void 0)n.reflectivity=this.reflectivity;if(this.refractionRatio!==void 0)n.refractionRatio=this.refractionRatio;if(this.gradientMap&&this.gradientMap.isTexture)n.gradientMap=this.gradientMap.toJSON(e).uuid;if(this.transmission!==void 0)n.transmission=this.transmission;if(this.transmissionMap&&this.transmissionMap.isTexture)n.transmissionMap=this.transmissionMap.toJSON(e).uuid;if(this.thickness!==void 0)n.thickness=this.thickness;if(this.thicknessMap&&this.thicknessMap.isTexture)n.thicknessMap=this.thicknessMap.toJSON(e).uuid;if(this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0)n.attenuationDistance=this.attenuationDistance;if(this.attenuationColor!==void 0)n.attenuationColor=this.attenuationColor.getHex();if(this.size!==void 0)n.size=this.size;if(this.shadowSide!==null)n.shadowSide=this.shadowSide;if(this.sizeAttenuation!==void 0)n.sizeAttenuation=this.sizeAttenuation;if(this.blending!==1)n.blending=this.blending;if(this.side!==0)n.side=this.side;if(this.vertexColors===!0)n.vertexColors=!0;if(this.opacity<1)n.opacity=this.opacity;if(this.transparent===!0)n.transparent=!0;if(this.blendSrc!==204)n.blendSrc=this.blendSrc;if(this.blendDst!==205)n.blendDst=this.blendDst;if(this.blendEquation!==100)n.blendEquation=this.blendEquation;if(this.blendSrcAlpha!==null)n.blendSrcAlpha=this.blendSrcAlpha;if(this.blendDstAlpha!==null)n.blendDstAlpha=this.blendDstAlpha;if(this.blendEquationAlpha!==null)n.blendEquationAlpha=this.blendEquationAlpha;if(this.blendColor&&this.blendColor.isColor)n.blendColor=this.blendColor.getHex();if(this.blendAlpha!==0)n.blendAlpha=this.blendAlpha;if(this.depthFunc!==3)n.depthFunc=this.depthFunc;if(this.depthTest===!1)n.depthTest=this.depthTest;if(this.depthWrite===!1)n.depthWrite=this.depthWrite;if(this.colorWrite===!1)n.colorWrite=this.colorWrite;if(this.stencilWriteMask!==255)n.stencilWriteMask=this.stencilWriteMask;if(this.stencilFunc!==519)n.stencilFunc=this.stencilFunc;if(this.stencilRef!==0)n.stencilRef=this.stencilRef;if(this.stencilFuncMask!==255)n.stencilFuncMask=this.stencilFuncMask;if(this.stencilFail!==7680)n.stencilFail=this.stencilFail;if(this.stencilZFail!==7680)n.stencilZFail=this.stencilZFail;if(this.stencilZPass!==7680)n.stencilZPass=this.stencilZPass;if(this.stencilWrite===!0)n.stencilWrite=this.stencilWrite;if(this.rotation!==void 0&&this.rotation!==0)n.rotation=this.rotation;if(this.polygonOffset===!0)n.polygonOffset=!0;if(this.polygonOffsetFactor!==0)n.polygonOffsetFactor=this.polygonOffsetFactor;if(this.polygonOffsetUnits!==0)n.polygonOffsetUnits=this.polygonOffsetUnits;if(this.linewidth!==void 0&&this.linewidth!==1)n.linewidth=this.linewidth;if(this.dashSize!==void 0)n.dashSize=this.dashSize;if(this.gapSize!==void 0)n.gapSize=this.gapSize;if(this.scale!==void 0)n.scale=this.scale;if(this.dithering===!0)n.dithering=!0;if(this.alphaTest>0)n.alphaTest=this.alphaTest;if(this.alphaHash===!0)n.alphaHash=!0;if(this.alphaToCoverage===!0)n.alphaToCoverage=!0;if(this.premultipliedAlpha===!0)n.premultipliedAlpha=!0;if(this.forceSinglePass===!0)n.forceSinglePass=!0;if(this.allowOverride===!1)n.allowOverride=!1;if(this.wireframe===!0)n.wireframe=!0;if(this.wireframeLinewidth>1)n.wireframeLinewidth=this.wireframeLinewidth;if(this.wireframeLinecap!=="round")n.wireframeLinecap=this.wireframeLinecap;if(this.wireframeLinejoin!=="round")n.wireframeLinejoin=this.wireframeLinejoin;if(this.flatShading===!0)n.flatShading=!0;if(this.visible===!1)n.visible=!1;if(this.toneMapped===!1)n.toneMapped=!1;if(this.fog===!1)n.fog=!1;if(Object.keys(this.userData).length>0)n.userData=this.userData;function i(s){let r=[];for(let a in s){let o=s[a];delete o.metadata,r.push(o)}return r}if(t){let s=i(e.textures),r=i(e.images);if(s.length>0)n.textures=s;if(r.length>0)n.images=r}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let i=t.length;n=Array(i);for(let s=0;s!==i;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){if(e===!0)this.version++}}class fn extends Nt{constructor(e){super();this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Se(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Jt,this.combine=0,this.reflectivity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}var _t=new D,ar=new Oe,wd=0;class yt{constructor(e,t,n=!1){if(Array.isArray(e))throw TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:wd++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=35044,this.updateRanges=[],this.gpuType=1015,this.version=0}onUploadCallback(){}set needsUpdate(e){if(e===!0)this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,s=this.itemSize;i<s;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)ar.fromBufferAttribute(this,t),ar.applyMatrix3(e),this.setXY(t,ar.x,ar.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)_t.fromBufferAttribute(this,t),_t.applyMatrix3(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)_t.fromBufferAttribute(this,t),_t.applyMatrix4(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)_t.fromBufferAttribute(this,t),_t.applyNormalMatrix(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)_t.fromBufferAttribute(this,t),_t.transformDirection(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];if(this.normalized)n=sn(n,this.array);return n}setComponent(e,t,n){if(this.normalized)n=et(n,this.array);return this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];if(this.normalized)t=sn(t,this.array);return t}setX(e,t){if(this.normalized)t=et(t,this.array);return this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];if(this.normalized)t=sn(t,this.array);return t}setY(e,t){if(this.normalized)t=et(t,this.array);return this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];if(this.normalized)t=sn(t,this.array);return t}setZ(e,t){if(this.normalized)t=et(t,this.array);return this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];if(this.normalized)t=sn(t,this.array);return t}setW(e,t){if(this.normalized)t=et(t,this.array);return this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){if(e*=this.itemSize,this.normalized)t=et(t,this.array),n=et(n,this.array);return this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){if(e*=this.itemSize,this.normalized)t=et(t,this.array),n=et(n,this.array),i=et(i,this.array);return this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,s){if(e*=this.itemSize,this.normalized)t=et(t,this.array),n=et(n,this.array),i=et(i,this.array),s=et(s,this.array);return this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};if(this.name!=="")e.name=this.name;if(this.usage!==35044)e.usage=this.usage;return e}}class Yr extends yt{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class Zr extends yt{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class Ft extends yt{constructor(e,t,n){super(new Float32Array(e),t,n)}}var Rd=0,Yt=new Be,za=new tt,Ni=new D,Gt=new Ot,ms=new Ot,bt=new D;class wt extends Yn{constructor(){super();this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Rd++}),this.uuid=rn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){if(Array.isArray(e))this.index=new((Jo(e))?Zr:Yr)(e,1);else this.index=e;return this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;if(t!==void 0)t.applyMatrix4(e),t.needsUpdate=!0;let n=this.attributes.normal;if(n!==void 0){let s=new ze().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}let i=this.attributes.tangent;if(i!==void 0)i.transformDirection(e),i.needsUpdate=!0;if(this.boundingBox!==null)this.computeBoundingBox();if(this.boundingSphere!==null)this.computeBoundingSphere();return this}applyQuaternion(e){return Yt.makeRotationFromQuaternion(e),this.applyMatrix4(Yt),this}rotateX(e){return Yt.makeRotationX(e),this.applyMatrix4(Yt),this}rotateY(e){return Yt.makeRotationY(e),this.applyMatrix4(Yt),this}rotateZ(e){return Yt.makeRotationZ(e),this.applyMatrix4(Yt),this}translate(e,t,n){return Yt.makeTranslation(e,t,n),this.applyMatrix4(Yt),this}scale(e,t,n){return Yt.makeScale(e,t,n),this.applyMatrix4(Yt),this}lookAt(e){return za.lookAt(e),za.updateMatrix(),this.applyMatrix4(za.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ni).negate(),this.translate(Ni.x,Ni.y,Ni.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let i=0,s=e.length;i<s;i++){let r=e[i];n.push(r.x,r.y,r.z||0)}this.setAttribute("position",new Ft(n,3))}else{let n=Math.min(e.length,t.count);for(let i=0;i<n;i++){let s=e[i];t.setXYZ(i,s.x,s.y,s.z||0)}if(e.length>t.count)Me("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.");t.needsUpdate=!0}return this}computeBoundingBox(){if(this.boundingBox===null)this.boundingBox=new Ot;let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ie("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new D(-1/0,-1/0,-1/0),new D(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){let s=t[n];if(Gt.setFromBufferAttribute(s),this.morphTargetsRelative)bt.addVectors(this.boundingBox.min,Gt.min),this.boundingBox.expandByPoint(bt),bt.addVectors(this.boundingBox.max,Gt.max),this.boundingBox.expandByPoint(bt);else this.boundingBox.expandByPoint(Gt.min),this.boundingBox.expandByPoint(Gt.max)}}else this.boundingBox.makeEmpty();if(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))Ie('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){if(this.boundingSphere===null)this.boundingSphere=new Vt;let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ie("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new D,1/0);return}if(e){let n=this.boundingSphere.center;if(Gt.setFromBufferAttribute(e),t)for(let s=0,r=t.length;s<r;s++){let a=t[s];if(ms.setFromBufferAttribute(a),this.morphTargetsRelative)bt.addVectors(Gt.min,ms.min),Gt.expandByPoint(bt),bt.addVectors(Gt.max,ms.max),Gt.expandByPoint(bt);else Gt.expandByPoint(ms.min),Gt.expandByPoint(ms.max)}Gt.getCenter(n);let i=0;for(let s=0,r=e.count;s<r;s++)bt.fromBufferAttribute(e,s),i=Math.max(i,n.distanceToSquared(bt));if(t)for(let s=0,r=t.length;s<r;s++){let a=t[s],o=this.morphTargetsRelative;for(let l=0,c=a.count;l<c;l++){if(bt.fromBufferAttribute(a,l),o)Ni.fromBufferAttribute(e,l),bt.add(Ni);i=Math.max(i,n.distanceToSquared(bt))}}if(this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius))Ie('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Ie("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let{position:n,normal:i,uv:s}=t;if(this.hasAttribute("tangent")===!1)this.setAttribute("tangent",new yt(new Float32Array(4*n.count),4));let r=this.getAttribute("tangent"),a=[],o=[];for(let P=0;P<n.count;P++)a[P]=new D,o[P]=new D;let l=new D,c=new D,h=new D,u=new Oe,d=new Oe,m=new Oe,_=new D,x=new D;function f(P,N,y){l.fromBufferAttribute(n,P),c.fromBufferAttribute(n,N),h.fromBufferAttribute(n,y),u.fromBufferAttribute(s,P),d.fromBufferAttribute(s,N),m.fromBufferAttribute(s,y),c.sub(l),h.sub(l),d.sub(u),m.sub(u);let S=1/(d.x*m.y-m.x*d.y);if(!isFinite(S))return;_.copy(c).multiplyScalar(m.y).addScaledVector(h,-d.y).multiplyScalar(S),x.copy(h).multiplyScalar(d.x).addScaledVector(c,-m.x).multiplyScalar(S),a[P].add(_),a[N].add(_),a[y].add(_),o[P].add(x),o[N].add(x),o[y].add(x)}let p=this.groups;if(p.length===0)p=[{start:0,count:e.count}];for(let P=0,N=p.length;P<N;++P){let y=p[P],{start:S,count:R}=y;for(let k=S,X=S+R;k<X;k+=3)f(e.getX(k+0),e.getX(k+1),e.getX(k+2))}let A=new D,b=new D,T=new D,I=new D;function E(P){T.fromBufferAttribute(i,P),I.copy(T);let N=a[P];A.copy(N),A.sub(T.multiplyScalar(T.dot(N))).normalize(),b.crossVectors(I,N);let S=b.dot(o[P])<0?-1:1;r.setXYZW(P,A.x,A.y,A.z,S)}for(let P=0,N=p.length;P<N;++P){let y=p[P],{start:S,count:R}=y;for(let k=S,X=S+R;k<X;k+=3)E(e.getX(k+0)),E(e.getX(k+1)),E(e.getX(k+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new yt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let u=0,d=n.count;u<d;u++)n.setXYZ(u,0,0,0);let i=new D,s=new D,r=new D,a=new D,o=new D,l=new D,c=new D,h=new D;if(e)for(let u=0,d=e.count;u<d;u+=3){let m=e.getX(u+0),_=e.getX(u+1),x=e.getX(u+2);i.fromBufferAttribute(t,m),s.fromBufferAttribute(t,_),r.fromBufferAttribute(t,x),c.subVectors(r,s),h.subVectors(i,s),c.cross(h),a.fromBufferAttribute(n,m),o.fromBufferAttribute(n,_),l.fromBufferAttribute(n,x),a.add(c),o.add(c),l.add(c),n.setXYZ(m,a.x,a.y,a.z),n.setXYZ(_,o.x,o.y,o.z),n.setXYZ(x,l.x,l.y,l.z)}else for(let u=0,d=t.count;u<d;u+=3)i.fromBufferAttribute(t,u+0),s.fromBufferAttribute(t,u+1),r.fromBufferAttribute(t,u+2),c.subVectors(r,s),h.subVectors(i,s),c.cross(h),n.setXYZ(u+0,c.x,c.y,c.z),n.setXYZ(u+1,c.x,c.y,c.z),n.setXYZ(u+2,c.x,c.y,c.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)bt.fromBufferAttribute(e,t),bt.normalize(),e.setXYZ(t,bt.x,bt.y,bt.z)}toNonIndexed(){function e(a,o){let{array:l,itemSize:c,normalized:h}=a,u=new l.constructor(o.length*c),d=0,m=0;for(let _=0,x=o.length;_<x;_++){if(a.isInterleavedBufferAttribute)d=o[_]*a.data.stride+a.offset;else d=o[_]*c;for(let f=0;f<c;f++)u[m++]=l[d++]}return new yt(u,c,h)}if(this.index===null)return Me("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new wt,n=this.index.array,i=this.attributes;for(let a in i){let o=i[a],l=e(o,n);t.setAttribute(a,l)}let s=this.morphAttributes;for(let a in s){let o=[],l=s[a];for(let c=0,h=l.length;c<h;c++){let u=l[c],d=e(u,n);o.push(d)}t.morphAttributes[a]=o}t.morphTargetsRelative=this.morphTargetsRelative;let r=this.groups;for(let a=0,o=r.length;a<o;a++){let l=r[a];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!=="")e.name=this.name;if(Object.keys(this.userData).length>0)e.userData=this.userData;if(this.parameters!==void 0){let o=this.parameters;for(let l in o)if(o[l]!==void 0)e[l]=o[l];return e}e.data={attributes:{}};let t=this.index;if(t!==null)e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)};let n=this.attributes;for(let o in n){let l=n[o];e.data.attributes[o]=l.toJSON(e.data)}let i={},s=!1;for(let o in this.morphAttributes){let l=this.morphAttributes[o],c=[];for(let h=0,u=l.length;h<u;h++){let d=l[h];c.push(d.toJSON(e.data))}if(c.length>0)i[o]=c,s=!0}if(s)e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative;let r=this.groups;if(r.length>0)e.data.groups=JSON.parse(JSON.stringify(r));let a=this.boundingSphere;if(a!==null)e.data.boundingSphere=a.toJSON();return e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;if(n!==null)this.setIndex(n.clone());let i=e.attributes;for(let l in i){let c=i[l];this.setAttribute(l,c.clone(t))}let s=e.morphAttributes;for(let l in s){let c=[],h=s[l];for(let u=0,d=h.length;u<d;u++)c.push(h[u].clone(t));this.morphAttributes[l]=c}this.morphTargetsRelative=e.morphTargetsRelative;let r=e.groups;for(let l=0,c=r.length;l<c;l++){let h=r[l];this.addGroup(h.start,h.count,h.materialIndex)}let a=e.boundingBox;if(a!==null)this.boundingBox=a.clone();let o=e.boundingSphere;if(o!==null)this.boundingSphere=o.clone();return this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}var ac=new Be,ri=new es,or=new Vt,oc=new D,lr=new D,cr=new D,hr=new D,ka=new D,ur=new D,lc=new D,dr=new D;class dt extends tt{constructor(e=new wt,t=new fn){super();this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){if(super.copy(e,t),e.morphTargetInfluences!==void 0)this.morphTargetInfluences=e.morphTargetInfluences.slice();if(e.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary);return this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,r=i.length;s<r;s++){let a=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){let n=this.geometry,i=n.attributes.position,s=n.morphAttributes.position,r=n.morphTargetsRelative;t.fromBufferAttribute(i,e);let a=this.morphTargetInfluences;if(s&&a){ur.set(0,0,0);for(let o=0,l=s.length;o<l;o++){let c=a[o],h=s[o];if(c===0)continue;if(ka.fromBufferAttribute(h,e),r)ur.addScaledVector(ka,c);else ur.addScaledVector(ka.sub(t),c)}t.add(ur)}return t}raycast(e,t){let n=this.geometry,i=this.material,s=this.matrixWorld;if(i===void 0)return;if(n.boundingSphere===null)n.computeBoundingSphere();if(or.copy(n.boundingSphere),or.applyMatrix4(s),ri.copy(e.ray).recast(e.near),or.containsPoint(ri.origin)===!1){if(ri.intersectSphere(or,oc)===null)return;if(ri.origin.distanceToSquared(oc)>(e.far-e.near)**2)return}if(ac.copy(s).invert(),ri.copy(e.ray).applyMatrix4(ac),n.boundingBox!==null){if(ri.intersectsBox(n.boundingBox)===!1)return}this._computeIntersections(e,t,ri)}_computeIntersections(e,t,n){let i,s=this.geometry,r=this.material,a=s.index,o=s.attributes.position,l=s.attributes.uv,c=s.attributes.uv1,h=s.attributes.normal,{groups:u,drawRange:d}=s;if(a!==null)if(Array.isArray(r))for(let m=0,_=u.length;m<_;m++){let x=u[m],f=r[x.materialIndex],p=Math.max(x.start,d.start),A=Math.min(a.count,Math.min(x.start+x.count,d.start+d.count));for(let b=p,T=A;b<T;b+=3){let I=a.getX(b),E=a.getX(b+1),P=a.getX(b+2);if(i=fr(this,f,e,n,l,c,h,I,E,P),i)i.faceIndex=Math.floor(b/3),i.face.materialIndex=x.materialIndex,t.push(i)}}else{let m=Math.max(0,d.start),_=Math.min(a.count,d.start+d.count);for(let x=m,f=_;x<f;x+=3){let p=a.getX(x),A=a.getX(x+1),b=a.getX(x+2);if(i=fr(this,r,e,n,l,c,h,p,A,b),i)i.faceIndex=Math.floor(x/3),t.push(i)}}else if(o!==void 0)if(Array.isArray(r))for(let m=0,_=u.length;m<_;m++){let x=u[m],f=r[x.materialIndex],p=Math.max(x.start,d.start),A=Math.min(o.count,Math.min(x.start+x.count,d.start+d.count));for(let b=p,T=A;b<T;b+=3){let I=b,E=b+1,P=b+2;if(i=fr(this,f,e,n,l,c,h,I,E,P),i)i.faceIndex=Math.floor(b/3),i.face.materialIndex=x.materialIndex,t.push(i)}}else{let m=Math.max(0,d.start),_=Math.min(o.count,d.start+d.count);for(let x=m,f=_;x<f;x+=3){let p=x,A=x+1,b=x+2;if(i=fr(this,r,e,n,l,c,h,p,A,b),i)i.faceIndex=Math.floor(x/3),t.push(i)}}}}function Cd(e,t,n,i,s,r,a,o){let l;if(t.side===1)l=i.intersectTriangle(a,r,s,!0,o);else l=i.intersectTriangle(s,r,a,t.side===0,o);if(l===null)return null;dr.copy(o),dr.applyMatrix4(e.matrixWorld);let c=n.ray.origin.distanceTo(dr);if(c<n.near||c>n.far)return null;return{distance:c,point:dr.clone(),object:e}}function fr(e,t,n,i,s,r,a,o,l,c){e.getVertexPosition(o,lr),e.getVertexPosition(l,cr),e.getVertexPosition(c,hr);let h=Cd(e,t,n,i,lr,cr,hr,lc);if(h){let u=new D;if(Ht.getBarycoord(lc,lr,cr,hr,u),s)h.uv=Ht.getInterpolatedAttribute(s,o,l,c,u,new Oe);if(r)h.uv1=Ht.getInterpolatedAttribute(r,o,l,c,u,new Oe);if(a){if(h.normal=Ht.getInterpolatedAttribute(a,o,l,c,u,new D),h.normal.dot(i.direction)>0)h.normal.multiplyScalar(-1)}let d={a:o,b:l,c,normal:new D,materialIndex:0};Ht.getNormal(lr,cr,hr,d.normal),h.face=d,h.barycoord=u}return h}class Zn extends wt{constructor(e=1,t=1,n=1,i=1,s=1,r=1){super();this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:s,depthSegments:r};let a=this;i=Math.floor(i),s=Math.floor(s),r=Math.floor(r);let o=[],l=[],c=[],h=[],u=0,d=0;m("z","y","x",-1,-1,n,t,e,r,s,0),m("z","y","x",1,-1,n,t,-e,r,s,1),m("x","z","y",1,1,e,n,t,i,r,2),m("x","z","y",1,-1,e,n,-t,i,r,3),m("x","y","z",1,-1,e,t,n,i,s,4),m("x","y","z",-1,-1,e,t,-n,i,s,5),this.setIndex(o),this.setAttribute("position",new Ft(l,3)),this.setAttribute("normal",new Ft(c,3)),this.setAttribute("uv",new Ft(h,2));function m(_,x,f,p,A,b,T,I,E,P,N){let y=b/E,S=T/P,R=b/2,k=T/2,X=I/2,G=E+1,K=P+1,H=0,O=0,Y=new D;for(let ee=0;ee<K;ee++){let ie=ee*S-k;for(let fe=0;fe<G;fe++){let Pe=fe*y-R;Y[_]=Pe*p,Y[x]=ie*A,Y[f]=X,l.push(Y.x,Y.y,Y.z),Y[_]=0,Y[x]=0,Y[f]=I>0?1:-1,c.push(Y.x,Y.y,Y.z),h.push(fe/E),h.push(1-ee/P),H+=1}}for(let ee=0;ee<P;ee++)for(let ie=0;ie<E;ie++){let fe=u+ie+G*ee,Pe=u+ie+G*(ee+1),ht=u+(ie+1)+G*(ee+1),$e=u+(ie+1)+G*ee;o.push(fe,Pe,$e),o.push(Pe,ht,$e),O+=6}a.addGroup(d,O,N),d+=O,u+=H}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Zn(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function pi(e){let t={};for(let n in e){t[n]={};for(let i in e[n]){let s=e[n][i];if(s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion))if(s.isRenderTargetTexture)Me("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[n][i]=null;else t[n][i]=s.clone();else if(Array.isArray(s))t[n][i]=s.slice();else t[n][i]=s}}return t}function Rt(e){let t={};for(let n=0;n<e.length;n++){let i=pi(e[n]);for(let s in i)t[s]=i[s]}return t}function Id(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function tl(e){let t=e.getRenderTarget();if(t===null)return e.outputColorSpace;if(t.isXRRenderTarget===!0)return t.texture.colorSpace;return We.workingColorSpace}var Mh={clone:pi,merge:Rt},Pd=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Ld=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class jt extends Nt{constructor(e){super();if(this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Pd,this.fragmentShader=Ld,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0)this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=pi(e.uniforms),this.uniformsGroups=Id(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let i in this.uniforms){let r=this.uniforms[i].value;if(r&&r.isTexture)t.uniforms[i]={type:"t",value:r.toJSON(e).uuid};else if(r&&r.isColor)t.uniforms[i]={type:"c",value:r.getHex()};else if(r&&r.isVector2)t.uniforms[i]={type:"v2",value:r.toArray()};else if(r&&r.isVector3)t.uniforms[i]={type:"v3",value:r.toArray()};else if(r&&r.isVector4)t.uniforms[i]={type:"v4",value:r.toArray()};else if(r&&r.isMatrix3)t.uniforms[i]={type:"m3",value:r.toArray()};else if(r&&r.isMatrix4)t.uniforms[i]={type:"m4",value:r.toArray()};else t.uniforms[i]={value:r}}if(Object.keys(this.defines).length>0)t.defines=this.defines;t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let i in this.extensions)if(this.extensions[i]===!0)n[i]=!0;if(Object.keys(n).length>0)t.extensions=n;return t}}class Jr extends tt{constructor(){super();this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Be,this.projectionMatrix=new Be,this.projectionMatrixInverse=new Be,this.coordinateSystem=2000,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}var Hn=new D,cc=new Oe,hc=new Oe;class vt extends Jr{constructor(e=50,t=1,n=0.1,i=2000){super();this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=0.5*this.getFilmHeight()/e;this.fov=oi*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Ss*0.5*this.fov);return 0.5*this.getFilmHeight()/e}getEffectiveFOV(){return oi*2*Math.atan(Math.tan(Ss*0.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Hn.set(-1,-1,0.5).applyMatrix4(this.projectionMatrixInverse),t.set(Hn.x,Hn.y).multiplyScalar(-e/Hn.z),Hn.set(1,1,0.5).applyMatrix4(this.projectionMatrixInverse),n.set(Hn.x,Hn.y).multiplyScalar(-e/Hn.z)}getViewSize(e,t){return this.getViewBounds(e,cc,hc),t.subVectors(hc,cc)}setViewOffset(e,t,n,i,s,r){if(this.aspect=e/t,this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Ss*0.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,s=-0.5*i,r=this.view;if(this.view!==null&&this.view.enabled){let{fullWidth:o,fullHeight:l}=r;s+=r.offsetX*i/o,t-=r.offsetY*n/l,i*=r.width/o,n*=r.height/l}let a=this.filmOffset;if(a!==0)s+=e*a/this.getFilmWidth();this.projectionMatrix.makePerspective(s,s+i,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);if(t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null)t.object.view=Object.assign({},this.view);return t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}var Di=-90,Ui=1;class nl extends tt{constructor(e,t,n){super();this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let i=new vt(Di,Ui,e,t);i.layers=this.layers,this.add(i);let s=new vt(Di,Ui,e,t);s.layers=this.layers,this.add(s);let r=new vt(Di,Ui,e,t);r.layers=this.layers,this.add(r);let a=new vt(Di,Ui,e,t);a.layers=this.layers,this.add(a);let o=new vt(Di,Ui,e,t);o.layers=this.layers,this.add(o);let l=new vt(Di,Ui,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,i,s,r,a,o]=t;for(let l of t)this.remove(l);if(e===2000)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),r.up.set(0,0,1),r.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),o.up.set(0,1,0),o.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),r.up.set(0,0,-1),r.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),o.up.set(0,-1,0),o.lookAt(0,0,-1);else throw Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){if(this.parent===null)this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:i}=this;if(this.coordinateSystem!==e.coordinateSystem)this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem();let[s,r,a,o,l,c]=this.children,h=e.getRenderTarget(),u=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;let _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,i),e.render(t,s),e.setRenderTarget(n,1,i),e.render(t,r),e.setRenderTarget(n,2,i),e.render(t,a),e.setRenderTarget(n,3,i),e.render(t,o),e.setRenderTarget(n,4,i),e.render(t,l),n.texture.generateMipmaps=_,e.setRenderTarget(n,5,i),e.render(t,c),e.setRenderTarget(h,u,d),e.xr.enabled=m,n.texture.needsPMREMUpdate=!0}}class Kr extends gt{constructor(e=[],t=301,n,i,s,r,a,o,l,c){super(e,t,n,i,s,r,a,o,l,c);this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class $r extends $t{constructor(e=1,t={}){super(e,e,t);this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new Kr(i),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new Zn(5,5,5),s=new jt({name:"CubemapFromEquirect",uniforms:pi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});s.uniforms.tEquirect.value=t;let r=new dt(i,s),a=t.minFilter;if(t.minFilter===1008)t.minFilter=1006;return new nl(1,10,this).update(e,r),t.minFilter=a,r.geometry.dispose(),r.material.dispose(),this}clear(e,t=!0,n=!0,i=!0){let s=e.getRenderTarget();for(let r=0;r<6;r++)e.setRenderTarget(this,r),e.clear(t,n,i);e.setRenderTarget(s)}}class Zt extends tt{constructor(){super();this.isGroup=!0,this.type="Group"}}var Nd={type:"move"};class Ns{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){if(this._hand===null)this._hand=new Zt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1};return this._hand}getTargetRaySpace(){if(this._targetRay===null)this._targetRay=new Zt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new D,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new D;return this._targetRay}getGripSpace(){if(this._grip===null)this._grip=new Zt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new D,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new D;return this._grip}dispatchEvent(e){if(this._targetRay!==null)this._targetRay.dispatchEvent(e);if(this._grip!==null)this._grip.dispatchEvent(e);if(this._hand!==null)this._hand.dispatchEvent(e);return this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){if(this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null)this._targetRay.visible=!1;if(this._grip!==null)this._grip.visible=!1;if(this._hand!==null)this._hand.visible=!1;return this}update(e,t,n){let i=null,s=null,r=null,a=this._targetRay,o=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){r=!0;for(let _ of e.hand.values()){let x=t.getJointPose(_,n),f=this._getHandJoint(l,_);if(x!==null)f.matrix.fromArray(x.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=x.radius;f.visible=x!==null}let c=l.joints["index-finger-tip"],h=l.joints["thumb-tip"],u=c.position.distanceTo(h.position),d=0.02,m=0.005;if(l.inputState.pinching&&u>d+m)l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this});else if(!l.inputState.pinching&&u<=d-m)l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this})}else if(o!==null&&e.gripSpace){if(s=t.getPose(e.gripSpace,n),s!==null){if(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity)o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity);else o.hasLinearVelocity=!1;if(s.angularVelocity)o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity);else o.hasAngularVelocity=!1}}if(a!==null){if(i=t.getPose(e.targetRaySpace,n),i===null&&s!==null)i=s;if(i!==null){if(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,i.linearVelocity)a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity);else a.hasLinearVelocity=!1;if(i.angularVelocity)a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity);else a.hasAngularVelocity=!1;this.dispatchEvent(Nd)}}}if(a!==null)a.visible=i!==null;if(o!==null)o.visible=s!==null;if(l!==null)l.visible=r!==null;return this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Zt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}class ts extends tt{constructor(){super();if(this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Jt,this.environmentIntensity=1,this.environmentRotation=new Jt,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){if(super.copy(e,t),e.background!==null)this.background=e.background.clone();if(e.environment!==null)this.environment=e.environment.clone();if(e.fog!==null)this.fog=e.fog.clone();if(this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null)this.overrideMaterial=e.overrideMaterial.clone();return this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);if(this.fog!==null)t.object.fog=this.fog.toJSON();if(this.backgroundBlurriness>0)t.object.backgroundBlurriness=this.backgroundBlurriness;if(this.backgroundIntensity!==1)t.object.backgroundIntensity=this.backgroundIntensity;if(t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1)t.object.environmentIntensity=this.environmentIntensity;return t.object.environmentRotation=this.environmentRotation.toArray(),t}}class ns{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=35044,this.updateRanges=[],this.version=0,this.uuid=rn()}onUploadCallback(){}set needsUpdate(e){if(e===!0)this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,s=this.stride;i<s;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){if(e.arrayBuffers===void 0)e.arrayBuffers={};if(this.array.buffer._uuid===void 0)this.array.buffer._uuid=rn();if(e.arrayBuffers[this.array.buffer._uuid]===void 0)e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer;let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){if(e.arrayBuffers===void 0)e.arrayBuffers={};if(this.array.buffer._uuid===void 0)this.array.buffer._uuid=rn();if(e.arrayBuffers[this.array.buffer._uuid]===void 0)e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer));return{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}var It=new D;class Vn{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)It.fromBufferAttribute(this,t),It.applyMatrix4(e),this.setXYZ(t,It.x,It.y,It.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)It.fromBufferAttribute(this,t),It.applyNormalMatrix(e),this.setXYZ(t,It.x,It.y,It.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)It.fromBufferAttribute(this,t),It.transformDirection(e),this.setXYZ(t,It.x,It.y,It.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];if(this.normalized)n=sn(n,this.array);return n}setComponent(e,t,n){if(this.normalized)n=et(n,this.array);return this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){if(this.normalized)t=et(t,this.array);return this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){if(this.normalized)t=et(t,this.array);return this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){if(this.normalized)t=et(t,this.array);return this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){if(this.normalized)t=et(t,this.array);return this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];if(this.normalized)t=sn(t,this.array);return t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];if(this.normalized)t=sn(t,this.array);return t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];if(this.normalized)t=sn(t,this.array);return t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];if(this.normalized)t=sn(t,this.array);return t}setXY(e,t,n){if(e=e*this.data.stride+this.offset,this.normalized)t=et(t,this.array),n=et(n,this.array);return this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){if(e=e*this.data.stride+this.offset,this.normalized)t=et(t,this.array),n=et(n,this.array),i=et(i,this.array);return this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,s){if(e=e*this.data.stride+this.offset,this.normalized)t=et(t,this.array),n=et(n,this.array),i=et(i,this.array),s=et(s,this.array);return this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=s,this}clone(e){if(e===void 0){Ts("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[i+s])}return new yt(new this.array.constructor(t),this.itemSize,this.normalized)}else{if(e.interleavedBuffers===void 0)e.interleavedBuffers={};if(e.interleavedBuffers[this.data.uuid]===void 0)e.interleavedBuffers[this.data.uuid]=this.data.clone(e);return new Vn(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}}toJSON(e){if(e===void 0){Ts("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[i+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else{if(e.interleavedBuffers===void 0)e.interleavedBuffers={};if(e.interleavedBuffers[this.data.uuid]===void 0)e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e);return{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}}class Ds extends Nt{constructor(e){super();this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Se(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}var Fi,gs=new D,Oi=new D,Bi=new D,zi=new Oe,_s=new Oe,Sh=new Be,pr=new D,xs=new D,mr=new D,uc=new Oe,Ga=new Oe,dc=new Oe;class jr extends tt{constructor(e=new Ds){super();if(this.isSprite=!0,this.type="Sprite",Fi===void 0){Fi=new wt;let t=new Float32Array([-0.5,-0.5,0,0,0,0.5,-0.5,0,1,0,0.5,0.5,0,1,1,-0.5,0.5,0,0,1]),n=new ns(t,5);Fi.setIndex([0,1,2,0,2,3]),Fi.setAttribute("position",new Vn(n,3,0,!1)),Fi.setAttribute("uv",new Vn(n,2,3,!1))}this.geometry=Fi,this.material=e,this.center=new Oe(0.5,0.5),this.count=1}raycast(e,t){if(e.camera===null)Ie('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.');if(Oi.setFromMatrixScale(this.matrixWorld),Sh.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Bi.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1)Oi.multiplyScalar(-Bi.z);let n=this.material.rotation,i,s;if(n!==0)s=Math.cos(n),i=Math.sin(n);let r=this.center;gr(pr.set(-0.5,-0.5,0),Bi,r,Oi,i,s),gr(xs.set(0.5,-0.5,0),Bi,r,Oi,i,s),gr(mr.set(0.5,0.5,0),Bi,r,Oi,i,s),uc.set(0,0),Ga.set(1,0),dc.set(1,1);let a=e.ray.intersectTriangle(pr,xs,mr,!1,gs);if(a===null){if(gr(xs.set(-0.5,0.5,0),Bi,r,Oi,i,s),Ga.set(0,1),a=e.ray.intersectTriangle(pr,mr,xs,!1,gs),a===null)return}let o=e.ray.origin.distanceTo(gs);if(o<e.near||o>e.far)return;t.push({distance:o,point:gs.clone(),uv:Ht.getInterpolation(gs,pr,xs,mr,uc,Ga,dc,new Oe),face:null,object:this})}copy(e,t){if(super.copy(e,t),e.center!==void 0)this.center.copy(e.center);return this.material=e.material,this}}function gr(e,t,n,i,s,r){if(zi.subVectors(e,n).addScalar(0.5).multiply(i),s!==void 0)_s.x=r*zi.x-s*zi.y,_s.y=s*zi.x+r*zi.y;else _s.copy(zi);e.copy(t),e.x+=_s.x,e.y+=_s.y,e.applyMatrix4(Sh)}var fc=new D,pc=new ct,mc=new ct,Dd=new D,gc=new Be,_r=new D,Ha=new Vt,_c=new Be,Va=new es;class Qr extends dt{constructor(e,t){super(e,t);this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode="attached",this.bindMatrix=new Be,this.bindMatrixInverse=new Be,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;if(this.boundingBox===null)this.boundingBox=new Ot;this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,_r),this.boundingBox.expandByPoint(_r)}computeBoundingSphere(){let e=this.geometry;if(this.boundingSphere===null)this.boundingSphere=new Vt;this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,_r),this.boundingSphere.expandByPoint(_r)}copy(e,t){if(super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null)this.boundingBox=e.boundingBox.clone();if(e.boundingSphere!==null)this.boundingSphere=e.boundingSphere.clone();return this}raycast(e,t){let n=this.material,i=this.matrixWorld;if(n===void 0)return;if(this.boundingSphere===null)this.computeBoundingSphere();if(Ha.copy(this.boundingSphere),Ha.applyMatrix4(i),e.ray.intersectsSphere(Ha)===!1)return;if(_c.copy(i).invert(),Va.copy(e.ray).applyMatrix4(_c),this.boundingBox!==null){if(Va.intersectsBox(this.boundingBox)===!1)return}this._computeIntersections(e,t,Va)}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){if(this.skeleton=e,t===void 0)this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld;this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new ct,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);let s=1/e.manhattanLength();if(s!==1/0)e.multiplyScalar(s);else e.set(1,0,0,0);t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){if(super.updateMatrixWorld(e),this.bindMode==="attached")this.bindMatrixInverse.copy(this.matrixWorld).invert();else if(this.bindMode==="detached")this.bindMatrixInverse.copy(this.bindMatrix).invert();else Me("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,i=this.geometry;pc.fromBufferAttribute(i.attributes.skinIndex,e),mc.fromBufferAttribute(i.attributes.skinWeight,e),fc.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let s=0;s<4;s++){let r=mc.getComponent(s);if(r!==0){let a=pc.getComponent(s);gc.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(Dd.copy(fc).applyMatrix4(gc),r)}}return t.applyMatrix4(this.bindMatrixInverse)}}class Us extends tt{constructor(){super();this.isBone=!0,this.type="Bone"}}class Fs extends gt{constructor(e=null,t=1,n=1,i,s,r,a,o,l=1003,c=1003,h,u){super(null,r,a,o,l,c,i,s,h,u);this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}var xc=new Be,Ud=new Be;class Os{constructor(e=[],t=[]){this.uuid=rn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.previousBoneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){Me("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new Be)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new Be;if(this.bones[e])n.copy(this.bones[e].matrixWorld).invert();this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];if(n)n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];if(n){if(n.parent&&n.parent.isBone)n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld);else n.matrix.copy(n.matrixWorld);n.matrix.decompose(n.position,n.quaternion,n.scale)}}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let s=0,r=e.length;s<r;s++){let a=e[s]?e[s].matrixWorld:Ud;xc.multiplyMatrices(a,t[s]),xc.toArray(n,s*16)}if(i!==null)i.needsUpdate=!0}clone(){return new Os(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new Fs(t,e,e,1023,1015);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let i=this.bones[t];if(i.name===e)return i}return}dispose(){if(this.boneTexture!==null)this.boneTexture.dispose(),this.boneTexture=null}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){let s=e.bones[n],r=t[s];if(r===void 0)Me("Skeleton: No bone found with UUID:",s),r=new Us;this.bones.push(r),this.boneInverses.push(new Be().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let i=0,s=t.length;i<s;i++){let r=t[i];e.bones.push(r.uuid);let a=n[i];e.boneInverses.push(a.toArray())}return e}}class li extends yt{constructor(e,t,n,i=1){super(e,t,n);this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}var ki=new Be,vc=new Be,xr=[],yc=new Ot,Fd=new Be,vs=new dt,ys=new Vt;class is extends dt{constructor(e,t,n){super(e,t);this.isInstancedMesh=!0,this.instanceMatrix=new li(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,Fd)}computeBoundingBox(){let e=this.geometry,t=this.count;if(this.boundingBox===null)this.boundingBox=new Ot;if(e.boundingBox===null)e.computeBoundingBox();this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ki),yc.copy(e.boundingBox).applyMatrix4(ki),this.boundingBox.union(yc)}computeBoundingSphere(){let e=this.geometry,t=this.count;if(this.boundingSphere===null)this.boundingSphere=new Vt;if(e.boundingSphere===null)e.computeBoundingSphere();this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ki),ys.copy(e.boundingSphere).applyMatrix4(ki),this.boundingSphere.union(ys)}copy(e,t){if(super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null)this.morphTexture=e.morphTexture.clone();if(e.instanceColor!==null)this.instanceColor=e.instanceColor.clone();if(this.count=e.count,e.boundingBox!==null)this.boundingBox=e.boundingBox.clone();if(e.boundingSphere!==null)this.boundingSphere=e.boundingSphere.clone();return this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,i=this.morphTexture.source.data.data,s=n.length+1,r=e*s+1;for(let a=0;a<n.length;a++)n[a]=i[r+a]}raycast(e,t){let n=this.matrixWorld,i=this.count;if(vs.geometry=this.geometry,vs.material=this.material,vs.material===void 0)return;if(this.boundingSphere===null)this.computeBoundingSphere();if(ys.copy(this.boundingSphere),ys.applyMatrix4(n),e.ray.intersectsSphere(ys)===!1)return;for(let s=0;s<i;s++){this.getMatrixAt(s,ki),vc.multiplyMatrices(n,ki),vs.matrixWorld=vc,vs.raycast(e,xr);for(let r=0,a=xr.length;r<a;r++){let o=xr[r];o.instanceId=s,o.object=this,t.push(o)}xr.length=0}}setColorAt(e,t){if(this.instanceColor===null)this.instanceColor=new li(new Float32Array(this.instanceMatrix.count*3).fill(1),3);t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let n=t.morphTargetInfluences,i=n.length+1;if(this.morphTexture===null)this.morphTexture=new Fs(new Float32Array(i*this.count),i,this.count,1028,1015);let s=this.morphTexture.source.data.data,r=0;for(let l=0;l<n.length;l++)r+=n[l];let a=this.geometry.morphTargetsRelative?1:1-r,o=i*e;s[o]=a,s.set(n,o+1)}updateMorphTargets(){}dispose(){if(this.dispatchEvent({type:"dispose"}),this.morphTexture!==null)this.morphTexture.dispose(),this.morphTexture=null}}var Wa=new D,Od=new D,Bd=new ze;class En{constructor(e=new D(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let i=Wa.subVectors(n,t).cross(Od.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(Wa),i=this.normal.dot(n);if(i===0){if(this.distanceToPoint(e.start)===0)return t.copy(e.start);return null}let s=-(e.start.dot(this.normal)+this.constant)/i;if(s<0||s>1)return null;return t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Bd.getNormalMatrix(e),i=this.coplanarPoint(Wa).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}var ai=new Vt,zd=new Oe(0.5,0.5),vr=new D;class Bs{constructor(e=new En,t=new En,n=new En,i=new En,s=new En,r=new En){this.planes=[e,t,n,i,s,r]}set(e,t,n,i,s,r){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(i),a[4].copy(s),a[5].copy(r),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=2000,n=!1){let i=this.planes,s=e.elements,r=s[0],a=s[1],o=s[2],l=s[3],c=s[4],h=s[5],u=s[6],d=s[7],m=s[8],_=s[9],x=s[10],f=s[11],p=s[12],A=s[13],b=s[14],T=s[15];if(i[0].setComponents(l-r,d-c,f-m,T-p).normalize(),i[1].setComponents(l+r,d+c,f+m,T+p).normalize(),i[2].setComponents(l+a,d+h,f+_,T+A).normalize(),i[3].setComponents(l-a,d-h,f-_,T-A).normalize(),n)i[4].setComponents(o,u,x,b).normalize(),i[5].setComponents(l-o,d-u,f-x,T-b).normalize();else if(i[4].setComponents(l-o,d-u,f-x,T-b).normalize(),t===2000)i[5].setComponents(l+o,d+u,f+x,T+b).normalize();else if(t===2001)i[5].setComponents(o,u,x,b).normalize();else throw Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0){if(e.boundingSphere===null)e.computeBoundingSphere();ai.copy(e.boundingSphere).applyMatrix4(e.matrixWorld)}else{let t=e.geometry;if(t.boundingSphere===null)t.computeBoundingSphere();ai.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ai)}intersectsSprite(e){ai.center.set(0,0,0);let t=zd.distanceTo(e.center);return ai.radius=0.7071067811865476+t,ai.applyMatrix4(e.matrixWorld),this.intersectsSphere(ai)}intersectsSphere(e){let t=this.planes,n=e.center,i=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let i=t[n];if(vr.x=i.normal.x>0?e.max.x:e.min.x,vr.y=i.normal.y>0?e.max.y:e.min.y,vr.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(vr)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class zs extends Nt{constructor(e){super();this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Se(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}var Ar=new D,Er=new D,Mc=new Be,Ms=new es,yr=new Vt,Xa=new D,Sc=new D;class ss extends tt{constructor(e=new wt,t=new zs){super();this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let i=1,s=t.count;i<s;i++)Ar.fromBufferAttribute(t,i-1),Er.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=Ar.distanceTo(Er);e.setAttribute("lineDistance",new Ft(n,1))}else Me("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let n=this.geometry,i=this.matrixWorld,s=e.params.Line.threshold,r=n.drawRange;if(n.boundingSphere===null)n.computeBoundingSphere();if(yr.copy(n.boundingSphere),yr.applyMatrix4(i),yr.radius+=s,e.ray.intersectsSphere(yr)===!1)return;Mc.copy(i).invert(),Ms.copy(e.ray).applyMatrix4(Mc);let a=s/((this.scale.x+this.scale.y+this.scale.z)/3),o=a*a,l=this.isLineSegments?2:1,c=n.index,u=n.attributes.position;if(c!==null){let d=Math.max(0,r.start),m=Math.min(c.count,r.start+r.count);for(let _=d,x=m-1;_<x;_+=l){let f=c.getX(_),p=c.getX(_+1),A=Mr(this,e,Ms,o,f,p,_);if(A)t.push(A)}if(this.isLineLoop){let _=c.getX(m-1),x=c.getX(d),f=Mr(this,e,Ms,o,_,x,m-1);if(f)t.push(f)}}else{let d=Math.max(0,r.start),m=Math.min(u.count,r.start+r.count);for(let _=d,x=m-1;_<x;_+=l){let f=Mr(this,e,Ms,o,_,_+1,_);if(f)t.push(f)}if(this.isLineLoop){let _=Mr(this,e,Ms,o,m-1,d,m-1);if(_)t.push(_)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,r=i.length;s<r;s++){let a=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}function Mr(e,t,n,i,s,r,a){let o=e.geometry.attributes.position;if(Ar.fromBufferAttribute(o,s),Er.fromBufferAttribute(o,r),n.distanceSqToSegment(Ar,Er,Xa,Sc)>i)return;Xa.applyMatrix4(e.matrixWorld);let c=t.ray.origin.distanceTo(Xa);if(c<t.near||c>t.far)return;return{distance:c,point:Sc.clone().applyMatrix4(e.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:e}}var bc=new D,Tc=new D;class ea extends ss{constructor(e,t){super(e,t);this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let i=0,s=t.count;i<s;i+=2)bc.fromBufferAttribute(t,i),Tc.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+bc.distanceTo(Tc);e.setAttribute("lineDistance",new Ft(n,1))}else Me("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class ta extends ss{constructor(e,t){super(e,t);this.isLineLoop=!0,this.type="LineLoop"}}class ks extends Nt{constructor(e){super();this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Se(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}var Ac=new Be,Za=new es,Sr=new Vt,br=new D;class na extends tt{constructor(e=new wt,t=new ks){super();this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let n=this.geometry,i=this.matrixWorld,s=e.params.Points.threshold,r=n.drawRange;if(n.boundingSphere===null)n.computeBoundingSphere();if(Sr.copy(n.boundingSphere),Sr.applyMatrix4(i),Sr.radius+=s,e.ray.intersectsSphere(Sr)===!1)return;Ac.copy(i).invert(),Za.copy(e.ray).applyMatrix4(Ac);let a=s/((this.scale.x+this.scale.y+this.scale.z)/3),o=a*a,l=n.index,h=n.attributes.position;if(l!==null){let u=Math.max(0,r.start),d=Math.min(l.count,r.start+r.count);for(let m=u,_=d;m<_;m++){let x=l.getX(m);br.fromBufferAttribute(h,x),Ec(br,x,o,i,e,t,this)}}else{let u=Math.max(0,r.start),d=Math.min(h.count,r.start+r.count);for(let m=u,_=d;m<_;m++)br.fromBufferAttribute(h,m),Ec(br,m,o,i,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,r=i.length;s<r;s++){let a=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}function Ec(e,t,n,i,s,r,a){let o=Za.distanceSqToPoint(e);if(o<n){let l=new D;Za.closestPointToPoint(e,l),l.applyMatrix4(i);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:a})}}class Gs extends gt{constructor(e,t,n,i,s,r,a,o,l){super(e,t,n,i,s,r,a,o,l);this.isCanvasTexture=!0,this.needsUpdate=!0}}class mi extends gt{constructor(e,t,n=1014,i,s,r,a=1003,o=1003,l,c=1026,h=1){if(c!==1026&&c!==1027)throw Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:e,height:t,depth:h};super(u,i,s,r,a,o,c,n,l);this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Ls(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);if(this.compareFunction!==null)t.compareFunction=this.compareFunction;return t}}class il extends mi{constructor(e,t=1014,n=301,i,s,r=1003,a=1003,o,l=1026){let c={width:e,height:e,depth:1},h=[c,c,c,c,c,c];super(e,e,t,n,i,s,r,a,o,l);this.image=h,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class ia extends gt{constructor(e=null){super();this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Hs extends wt{constructor(e=1,t=1,n=1,i=1){super();this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};let s=e/2,r=t/2,a=Math.floor(n),o=Math.floor(i),l=a+1,c=o+1,h=e/a,u=t/o,d=[],m=[],_=[],x=[];for(let f=0;f<c;f++){let p=f*u-r;for(let A=0;A<l;A++){let b=A*h-s;m.push(b,-p,0),_.push(0,0,1),x.push(A/a),x.push(1-f/o)}}for(let f=0;f<o;f++)for(let p=0;p<a;p++){let A=p+l*f,b=p+l*(f+1),T=p+1+l*(f+1),I=p+1+l*f;d.push(A,b,I),d.push(b,T,I)}this.setIndex(d),this.setAttribute("position",new Ft(m,3)),this.setAttribute("normal",new Ft(_,3)),this.setAttribute("uv",new Ft(x,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Hs(e.width,e.height,e.widthSegments,e.heightSegments)}}class sl extends jt{constructor(e){super(e);this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Dn extends Nt{constructor(e){super();this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Se(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Se(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new Oe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Jt,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Wt extends Dn{constructor(e){super();this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Oe(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Xe(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+0.4*t)/(1-0.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Se(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Se(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Se(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){if(this._anisotropy>0!==e>0)this.version++;this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){if(this._clearcoat>0!==e>0)this.version++;this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){if(this._iridescence>0!==e>0)this.version++;this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){if(this._dispersion>0!==e>0)this.version++;this._dispersion=e}get sheen(){return this._sheen}set sheen(e){if(this._sheen>0!==e>0)this.version++;this._sheen=e}get transmission(){return this._transmission}set transmission(e){if(this._transmission>0!==e>0)this.version++;this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class sa extends Nt{constructor(e){super();this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Se(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Se(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new Oe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Jt,this.combine=0,this.reflectivity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class rl extends Nt{constructor(e){super();this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class al extends Nt{constructor(e){super();this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}function Tr(e,t){if(!e||e.constructor===t)return e;if(typeof t.BYTES_PER_ELEMENT==="number")return new t(e);return Array.prototype.slice.call(e)}function kd(e){function t(s,r){return e[s]-e[r]}let n=e.length,i=Array(n);for(let s=0;s!==n;++s)i[s]=s;return i.sort(t),i}function wc(e,t,n){let i=e.length,s=new e.constructor(i);for(let r=0,a=0;a!==i;++r){let o=n[r]*t;for(let l=0;l!==t;++l)s[a++]=e[o+l]}return s}function bh(e,t,n,i){let s=1,r=e[0];while(r!==void 0&&r[i]===void 0)r=e[s++];if(r===void 0)return;let a=r[i];if(a===void 0)return;if(Array.isArray(a))do{if(a=r[i],a!==void 0)t.push(r.time),n.push(...a);r=e[s++]}while(r!==void 0);else if(a.toArray!==void 0)do{if(a=r[i],a!==void 0)t.push(r.time),a.toArray(n,n.length);r=e[s++]}while(r!==void 0);else do{if(a=r[i],a!==void 0)t.push(r.time),n.push(a);r=e[s++]}while(r!==void 0)}class Jn{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,i=t[n],s=t[n-1];n:{e:{let r;t:{i:if(!(e<i)){for(let a=n+2;;){if(i===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(s=i,i=t[++n],e<i)break e}r=t.length;break t}if(!(e>=s)){let a=t[1];if(e<a)n=2,s=a;for(let o=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===o)break;if(i=s,s=t[--n-1],e>=s)break e}r=n,n=0;break t}break n}while(n<r){let a=n+r>>>1;if(e<t[a])r=a;else n=a+1}if(i=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,i)}return this.interpolate_(n,s,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=e*i;for(let r=0;r!==i;++r)t[r]=n[s+r];return t}interpolate_(){throw Error("call to abstract method")}intervalChanged_(){}}class ol extends Jn{constructor(e,t,n,i){super(e,t,n,i);this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:2400,endingEnd:2400}}intervalChanged_(e,t,n){let i=this.parameterPositions,s=e-2,r=e+1,a=i[s],o=i[r];if(a===void 0)switch(this.getSettings_().endingStart){case 2401:s=e,a=2*t-n;break;case 2402:s=i.length-2,a=t+i[s]-i[s+1];break;default:s=e,a=n}if(o===void 0)switch(this.getSettings_().endingEnd){case 2401:r=e,o=2*n-t;break;case 2402:r=1,o=n+i[1]-i[0];break;default:r=e-1,o=t}let l=(n-t)*0.5,c=this.valueSize;this._weightPrev=l/(t-a),this._weightNext=l/(o-n),this._offsetPrev=s*c,this._offsetNext=r*c}interpolate_(e,t,n,i){let s=this.resultBuffer,r=this.sampleValues,a=this.valueSize,o=e*a,l=o-a,c=this._offsetPrev,h=this._offsetNext,u=this._weightPrev,d=this._weightNext,m=(n-t)/(i-t),_=m*m,x=_*m,f=-u*x+2*u*_-u*m,p=(1+u)*x+(-1.5-2*u)*_+(-0.5+u)*m+1,A=(-1-d)*x+(1.5+d)*_+0.5*m,b=d*x-d*_;for(let T=0;T!==a;++T)s[T]=f*r[c+T]+p*r[l+T]+A*r[o+T]+b*r[h+T];return s}}class ll extends Jn{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let s=this.resultBuffer,r=this.sampleValues,a=this.valueSize,o=e*a,l=o-a,c=(n-t)/(i-t),h=1-c;for(let u=0;u!==a;++u)s[u]=r[l+u]*h+r[o+u]*c;return s}}class cl extends Jn{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}}class Xt{constructor(e,t,n,i){if(e===void 0)throw Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Tr(t,this.TimeBufferType),this.values=Tr(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Tr(e.times,Array),values:Tr(e.values,Array)};let i=e.getInterpolation();if(i!==e.DefaultInterpolation)n.interpolation=i}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new cl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new ll(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new ol(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case 2300:t=this.InterpolantFactoryMethodDiscrete;break;case 2301:t=this.InterpolantFactoryMethodLinear;break;case 2302:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(n);return Me("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return 2300;case this.InterpolantFactoryMethodLinear:return 2301;case this.InterpolantFactoryMethodSmooth:return 2302}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){let n=this.times,i=n.length,s=0,r=i-1;while(s!==i&&n[s]<e)++s;while(r!==-1&&n[r]>t)--r;if(++r,s!==0||r!==i){if(s>=r)r=Math.max(r,1),s=r-1;let a=this.getValueSize();this.times=n.slice(s,r),this.values=this.values.slice(s*a,r*a)}return this}validate(){let e=!0,t=this.getValueSize();if(t-Math.floor(t)!==0)Ie("KeyframeTrack: Invalid value size in track.",this),e=!1;let n=this.times,i=this.values,s=n.length;if(s===0)Ie("KeyframeTrack: Track is empty.",this),e=!1;let r=null;for(let a=0;a!==s;a++){let o=n[a];if(typeof o==="number"&&isNaN(o)){Ie("KeyframeTrack: Time is not a valid number.",this,a,o),e=!1;break}if(r!==null&&r>o){Ie("KeyframeTrack: Out of order keys.",this,a,o,r),e=!1;break}r=o}if(i!==void 0){if(Qu(i))for(let a=0,o=i.length;a!==o;++a){let l=i[a];if(isNaN(l)){Ie("KeyframeTrack: Value is not a valid number.",this,a,l),e=!1;break}}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===2302,s=e.length-1,r=1;for(let a=1;a<s;++a){let o=!1,l=e[a],c=e[a+1];if(l!==c&&(a!==1||l!==e[0]))if(!i){let h=a*n,u=h-n,d=h+n;for(let m=0;m!==n;++m){let _=t[h+m];if(_!==t[u+m]||_!==t[d+m]){o=!0;break}}}else o=!0;if(o){if(a!==r){e[r]=e[a];let h=a*n,u=r*n;for(let d=0;d!==n;++d)t[u+d]=t[h+d]}++r}}if(s>0){e[r]=e[s];for(let a=s*n,o=r*n,l=0;l!==n;++l)t[o+l]=t[a+l];++r}if(r!==e.length)this.times=e.slice(0,r),this.values=t.slice(0,r*n);else this.times=e,this.values=t;return this}clone(){let e=this.times.slice(),t=this.values.slice(),i=new this.constructor(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}}Xt.prototype.ValueTypeName="";Xt.prototype.TimeBufferType=Float32Array;Xt.prototype.ValueBufferType=Float32Array;Xt.prototype.DefaultInterpolation=2301;class Kn extends Xt{constructor(e,t,n){super(e,t,n)}}Kn.prototype.ValueTypeName="bool";Kn.prototype.ValueBufferType=Array;Kn.prototype.DefaultInterpolation=2300;Kn.prototype.InterpolantFactoryMethodLinear=void 0;Kn.prototype.InterpolantFactoryMethodSmooth=void 0;class ra extends Xt{constructor(e,t,n,i){super(e,t,n,i)}}ra.prototype.ValueTypeName="color";class Rn extends Xt{constructor(e,t,n,i){super(e,t,n,i)}}Rn.prototype.ValueTypeName="number";class hl extends Jn{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let s=this.resultBuffer,r=this.sampleValues,a=this.valueSize,o=(n-t)/(i-t),l=e*a;for(let c=l+a;l!==c;l+=4)cn.slerpFlat(s,0,r,l-a,r,l,o);return s}}class Un extends Xt{constructor(e,t,n,i){super(e,t,n,i)}InterpolantFactoryMethodLinear(e){return new hl(this.times,this.values,this.getValueSize(),e)}}Un.prototype.ValueTypeName="quaternion";Un.prototype.InterpolantFactoryMethodSmooth=void 0;class $n extends Xt{constructor(e,t,n){super(e,t,n)}}$n.prototype.ValueTypeName="string";$n.prototype.ValueBufferType=Array;$n.prototype.DefaultInterpolation=2300;$n.prototype.InterpolantFactoryMethodLinear=void 0;$n.prototype.InterpolantFactoryMethodSmooth=void 0;class Cn extends Xt{constructor(e,t,n,i){super(e,t,n,i)}}Cn.prototype.ValueTypeName="vector";class aa{constructor(e="",t=-1,n=[],i=2500){if(this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=rn(),this.userData={},this.duration<0)this.resetDuration()}static parse(e){let t=[],n=e.tracks,i=1/(e.fps||1);for(let r=0,a=n.length;r!==a;++r)t.push(Hd(n[r]).scale(i));let s=new this(e.name,e.duration,t,e.blendMode);return s.uuid=e.uuid,s.userData=JSON.parse(e.userData||"{}"),s}static toJSON(e){let t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let s=0,r=n.length;s!==r;++s)t.push(Xt.toJSON(n[s]));return i}static CreateFromMorphTargetSequence(e,t,n,i){let s=t.length,r=[];for(let a=0;a<s;a++){let o=[],l=[];o.push((a+s-1)%s,a,(a+1)%s),l.push(0,1,0);let c=kd(o);if(o=wc(o,1,c),l=wc(l,1,c),!i&&o[0]===0)o.push(s),l.push(l[0]);r.push(new Rn(".morphTargetInfluences["+t[a].name+"]",o,l).scale(1/n))}return new this(e,-1,r)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let i={},s=/^([\w-]*?)([\d]+)$/;for(let a=0,o=e.length;a<o;a++){let l=e[a],c=l.name.match(s);if(c&&c.length>1){let h=c[1],u=i[h];if(!u)i[h]=u=[];u.push(l)}}let r=[];for(let a in i)r.push(this.CreateFromMorphTargetSequence(a,i[a],t,n));return r}static parseAnimation(e,t){if(Me("AnimationClip: parseAnimation() is deprecated and will be removed with r185"),!e)return Ie("AnimationClip: No animation in JSONLoader data."),null;let n=function(h,u,d,m,_){if(d.length!==0){let x=[],f=[];if(bh(d,x,f,m),x.length!==0)_.push(new h(u,x,f))}},i=[],s=e.name||"default",r=e.fps||30,a=e.blendMode,o=e.length||-1,l=e.hierarchy||[];for(let h=0;h<l.length;h++){let u=l[h].keys;if(!u||u.length===0)continue;if(u[0].morphTargets){let d={},m;for(m=0;m<u.length;m++)if(u[m].morphTargets)for(let _=0;_<u[m].morphTargets.length;_++)d[u[m].morphTargets[_]]=-1;for(let _ in d){let x=[],f=[];for(let p=0;p!==u[m].morphTargets.length;++p){let A=u[m];x.push(A.time),f.push(A.morphTarget===_?1:0)}i.push(new Rn(".morphTargetInfluence["+_+"]",x,f))}o=d.length*r}else{let d=".bones["+t[h].name+"]";n(Cn,d+".position",u,"pos",i),n(Un,d+".quaternion",u,"rot",i),n(Cn,d+".scale",u,"scl",i)}}if(i.length===0)return null;return new this(s,o,i,a)}resetDuration(){let e=this.tracks,t=0;for(let n=0,i=e.length;n!==i;++n){let s=this.tracks[n];t=Math.max(t,s.times[s.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}}function Gd(e){switch(e.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Rn;case"vector":case"vector2":case"vector3":case"vector4":return Cn;case"color":return ra;case"quaternion":return Un;case"bool":case"boolean":return Kn;case"string":return $n}throw Error("THREE.KeyframeTrack: Unsupported typeName: "+e)}function Hd(e){if(e.type===void 0)throw Error("THREE.KeyframeTrack: track type undefined, can not parse");let t=Gd(e.type);if(e.times===void 0){let n=[],i=[];bh(e.keys,n,i,"value"),e.times=n,e.values=i}if(t.parse!==void 0)return t.parse(e);else return new t(e.name,e.times,e.values,e.interpolation)}var hn={enabled:!1,files:{},add:function(e,t){if(this.enabled===!1)return;this.files[e]=t},get:function(e){if(this.enabled===!1)return;return this.files[e]},remove:function(e){delete this.files[e]},clear:function(){this.files={}}};class ul{constructor(e,t,n){let i=this,s=!1,r=0,a=0,o=void 0,l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(c){if(a++,s===!1){if(i.onStart!==void 0)i.onStart(c,r,a)}s=!0},this.itemEnd=function(c){if(r++,i.onProgress!==void 0)i.onProgress(c,r,a);if(r===a){if(s=!1,i.onLoad!==void 0)i.onLoad()}},this.itemError=function(c){if(i.onError!==void 0)i.onError(c)},this.resolveURL=function(c){if(o)return o(c);return c},this.setURLModifier=function(c){return o=c,this},this.addHandler=function(c,h){return l.push(c,h),this},this.removeHandler=function(c){let h=l.indexOf(c);if(h!==-1)l.splice(h,2);return this},this.getHandler=function(c){for(let h=0,u=l.length;h<u;h+=2){let d=l[h],m=l[h+1];if(d.global)d.lastIndex=0;if(d.test(c))return m}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){if(!this._abortController)this._abortController=new AbortController;return this._abortController}}var Th=new ul;class Fn{constructor(e){this.manager=e!==void 0?e:Th,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(i,s){n.load(e,i,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}}Fn.DEFAULT_MATERIAL_NAME="__DEFAULT";var An={};class Ah extends Error{constructor(e,t){super(e);this.response=t}}class Vs extends Fn{constructor(e){super(e);this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,i){if(e===void 0)e="";if(this.path!==void 0)e=this.path+e;e=this.manager.resolveURL(e);let s=hn.get(`file:${e}`);if(s!==void 0)return this.manager.itemStart(e),setTimeout(()=>{if(t)t(s);this.manager.itemEnd(e)},0),s;if(An[e]!==void 0){An[e].push({onLoad:t,onProgress:n,onError:i});return}An[e]=[],An[e].push({onLoad:t,onProgress:n,onError:i});let r=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any==="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),a=this.mimeType,o=this.responseType;fetch(r).then((l)=>{if(l.status===200||l.status===0){if(l.status===0)Me("FileLoader: HTTP Status 0 received.");if(typeof ReadableStream>"u"||l.body===void 0||l.body.getReader===void 0)return l;let c=An[e],h=l.body.getReader(),u=l.headers.get("X-File-Size")||l.headers.get("Content-Length"),d=u?parseInt(u):0,m=d!==0,_=0,x=new ReadableStream({start(f){p();function p(){h.read().then(({done:A,value:b})=>{if(A)f.close();else{_+=b.byteLength;let T=new ProgressEvent("progress",{lengthComputable:m,loaded:_,total:d});for(let I=0,E=c.length;I<E;I++){let P=c[I];if(P.onProgress)P.onProgress(T)}f.enqueue(b),p()}},(A)=>{f.error(A)})}}});return new Response(x)}else throw new Ah(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`,l)}).then((l)=>{switch(o){case"arraybuffer":return l.arrayBuffer();case"blob":return l.blob();case"document":return l.text().then((c)=>new DOMParser().parseFromString(c,a));case"json":return l.json();default:if(a==="")return l.text();else{let h=/charset="?([^;"\s]*)"?/i.exec(a),u=h&&h[1]?h[1].toLowerCase():void 0,d=new TextDecoder(u);return l.arrayBuffer().then((m)=>d.decode(m))}}}).then((l)=>{hn.add(`file:${e}`,l);let c=An[e];delete An[e];for(let h=0,u=c.length;h<u;h++){let d=c[h];if(d.onLoad)d.onLoad(l)}}).catch((l)=>{let c=An[e];if(c===void 0)throw this.manager.itemError(e),l;delete An[e];for(let h=0,u=c.length;h<u;h++){let d=c[h];if(d.onError)d.onError(l)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}var Gi=new WeakMap;class dl extends Fn{constructor(e){super(e)}load(e,t,n,i){if(this.path!==void 0)e=this.path+e;e=this.manager.resolveURL(e);let s=this,r=hn.get(`image:${e}`);if(r!==void 0){if(r.complete===!0)s.manager.itemStart(e),setTimeout(function(){if(t)t(r);s.manager.itemEnd(e)},0);else{let h=Gi.get(r);if(h===void 0)h=[],Gi.set(r,h);h.push({onLoad:t,onError:i})}return r}let a=Vi("img");function o(){if(c(),t)t(this);let h=Gi.get(this)||[];for(let u=0;u<h.length;u++){let d=h[u];if(d.onLoad)d.onLoad(this)}Gi.delete(this),s.manager.itemEnd(e)}function l(h){if(c(),i)i(h);hn.remove(`image:${e}`);let u=Gi.get(this)||[];for(let d=0;d<u.length;d++){let m=u[d];if(m.onError)m.onError(h)}Gi.delete(this),s.manager.itemError(e),s.manager.itemEnd(e)}function c(){a.removeEventListener("load",o,!1),a.removeEventListener("error",l,!1)}if(a.addEventListener("load",o,!1),a.addEventListener("error",l,!1),e.slice(0,5)!=="data:"){if(this.crossOrigin!==void 0)a.crossOrigin=this.crossOrigin}return hn.add(`image:${e}`,a),s.manager.itemStart(e),a.src=e,a}}class oa extends Fn{constructor(e){super(e)}load(e,t,n,i){let s=new gt,r=new dl(this.manager);return r.setCrossOrigin(this.crossOrigin),r.setPath(this.path),r.load(e,function(a){if(s.image=a,s.needsUpdate=!0,t!==void 0)t(s)},n,i),s}}class gi extends tt{constructor(e,t=1){super();this.isLight=!0,this.type="Light",this.color=new Se(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}class la extends gi{constructor(e,t,n){super(e,n);this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(tt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Se(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}}var qa=new Be,Rc=new D,Cc=new D;class ca{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Oe(512,512),this.mapType=1009,this.map=null,this.mapPass=null,this.matrix=new Be,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Bs,this._frameExtents=new Oe(1,1),this._viewportCount=1,this._viewports=[new ct(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;if(Rc.setFromMatrixPosition(e.matrixWorld),t.position.copy(Rc),Cc.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Cc),t.updateMatrixWorld(),qa.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(qa,t.coordinateSystem,t.reversedDepth),t.reversedDepth)n.set(0.5,0,0,0.5,0,0.5,0,0.5,0,0,1,0,0,0,0,1);else n.set(0.5,0,0,0.5,0,0.5,0,0.5,0,0,0.5,0.5,0,0,0,1);n.multiply(qa)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){if(this.map)this.map.dispose();if(this.mapPass)this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};if(this.intensity!==1)e.intensity=this.intensity;if(this.bias!==0)e.bias=this.bias;if(this.normalBias!==0)e.normalBias=this.normalBias;if(this.radius!==1)e.radius=this.radius;if(this.mapSize.x!==512||this.mapSize.y!==512)e.mapSize=this.mapSize.toArray();return e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class Eh extends ca{constructor(){super(new vt(50,1,0.5,500));this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=oi*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height*this.aspect,s=e.distance||t.far;if(n!==t.fov||i!==t.aspect||s!==t.far)t.fov=n,t.aspect=i,t.far=s,t.updateProjectionMatrix();super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class ha extends gi{constructor(e,t,n=0,i=Math.PI/3,s=0,r=2){super(e,t);this.isSpotLight=!0,this.type="SpotLight",this.position.copy(tt.DEFAULT_UP),this.updateMatrix(),this.target=new tt,this.distance=n,this.angle=i,this.penumbra=s,this.decay=r,this.map=null,this.shadow=new Eh}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);if(t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture)t.object.map=this.map.toJSON(e).uuid;return t.object.shadow=this.shadow.toJSON(),t}}class wh extends ca{constructor(){super(new vt(90,1,0.5,500));this.isPointLightShadow=!0}}class rs extends gi{constructor(e,t,n=0,i=2){super(e,t);this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new wh}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}}class _i extends Jr{constructor(e=-1,t=1,n=1,i=-1,s=0.1,r=2000){super();this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=s,this.far=r,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,s,r){if(this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2,s=n-e,r=n+e,a=i+t,o=i-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,c=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=l*this.view.offsetX,r=s+l*this.view.width,a-=c*this.view.offsetY,o=a-c*this.view.height}this.projectionMatrix.makeOrthographic(s,r,a,o,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);if(t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null)t.object.view=Object.assign({},this.view);return t}}class Rh extends ca{constructor(){super(new _i(-5,5,5,-5,0.5,500));this.isDirectionalLightShadow=!0}}class xi extends gi{constructor(e,t){super(e,t);this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(tt.DEFAULT_UP),this.updateMatrix(),this.target=new tt,this.shadow=new Rh}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}class ua extends gi{constructor(e,t){super(e,t);this.isAmbientLight=!0,this.type="AmbientLight"}}class jn{static extractUrlBase(e){let t=e.lastIndexOf("/");if(t===-1)return"./";return e.slice(0,t+1)}static resolveURL(e,t){if(typeof e!=="string"||e==="")return"";if(/^https?:\/\//i.test(t)&&/^\//.test(e))t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1");if(/^(https?:)?\/\//i.test(e))return e;if(/^data:.*,.*$/i.test(e))return e;if(/^blob:.*$/i.test(e))return e;return t+e}}var Ya=new WeakMap;class da extends Fn{constructor(e){super(e);if(this.isImageBitmapLoader=!0,typeof createImageBitmap>"u")Me("ImageBitmapLoader: createImageBitmap() not supported.");if(typeof fetch>"u")Me("ImageBitmapLoader: fetch() not supported.");this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,i){if(e===void 0)e="";if(this.path!==void 0)e=this.path+e;e=this.manager.resolveURL(e);let s=this,r=hn.get(`image-bitmap:${e}`);if(r!==void 0){if(s.manager.itemStart(e),r.then){r.then((l)=>{if(Ya.has(r)===!0){if(i)i(Ya.get(r));s.manager.itemError(e),s.manager.itemEnd(e)}else{if(t)t(l);return s.manager.itemEnd(e),l}});return}return setTimeout(function(){if(t)t(r);s.manager.itemEnd(e)},0),r}let a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader,a.signal=typeof AbortSignal.any==="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let o=fetch(e,a).then(function(l){return l.blob()}).then(function(l){return createImageBitmap(l,Object.assign(s.options,{colorSpaceConversion:"none"}))}).then(function(l){if(hn.add(`image-bitmap:${e}`,l),t)t(l);return s.manager.itemEnd(e),l}).catch(function(l){if(i)i(l);Ya.set(o,l),hn.remove(`image-bitmap:${e}`),s.manager.itemError(e),s.manager.itemEnd(e)});hn.add(`image-bitmap:${e}`,o),s.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}class fl extends vt{constructor(e=[]){super();this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}var pl="\\[\\]\\.:\\/",Vd=new RegExp("["+pl+"]","g"),ml="[^"+pl+"]",Wd="[^"+pl.replace("\\.","")+"]",Xd=/((?:WC+[\/:])*)/.source.replace("WC",ml),qd=/(WCOD+)?/.source.replace("WCOD",Wd),Yd=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",ml),Zd=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",ml),Jd=new RegExp("^"+Xd+qd+Yd+Zd+"$"),Kd=["material","materials","bones","map"];class Ch{constructor(e,t,n){let i=n||Ke.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,i=this._bindings[n];if(i!==void 0)i.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,s=n.length;i!==s;++i)n[i].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class Ke{constructor(e,t,n){this.path=t,this.parsedPath=n||Ke.parseTrackName(t),this.node=Ke.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){if(!(e&&e.isAnimationObjectGroup))return new Ke(e,t,n);else return new Ke.Composite(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Vd,"")}static parseTrackName(e){let t=Jd.exec(e);if(t===null)throw Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){let s=n.nodeName.substring(i+1);if(Kd.indexOf(s)!==-1)n.nodeName=n.nodeName.substring(0,i),n.objectName=s}if(n.propertyName===null||n.propertyName.length===0)throw Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(s){for(let r=0;r<s.length;r++){let a=s[r];if(a.name===t||a.uuid===t)return a;let o=n(a.children);if(o)return o}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,{objectName:n,propertyName:i,propertyIndex:s}=t;if(!e)e=Ke.findNode(this.rootNode,t.nodeName),this.node=e;if(this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Me("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=t.objectIndex;switch(n){case"materials":if(!e.material){Ie("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Ie("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Ie("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let c=0;c<e.length;c++)if(e[c].name===l){l=c;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Ie("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Ie("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){Ie("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(l!==void 0){if(e[l]===void 0){Ie("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}let r=e[i];if(r===void 0){let l=t.nodeName;Ie("PropertyBinding: Trying to update property for track: "+l+"."+i+" but it wasn't found.",e);return}let a=this.Versioning.None;if(this.targetObject=e,e.isMaterial===!0)a=this.Versioning.NeedsUpdate;else if(e.isObject3D===!0)a=this.Versioning.MatrixWorldNeedsUpdate;let o=this.BindingType.Direct;if(s!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){Ie("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Ie("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}if(e.morphTargetDictionary[s]!==void 0)s=e.morphTargetDictionary[s]}o=this.BindingType.ArrayElement,this.resolvedProperty=r,this.propertyIndex=s}else if(r.fromArray!==void 0&&r.toArray!==void 0)o=this.BindingType.HasFromToArray,this.resolvedProperty=r;else if(Array.isArray(r))o=this.BindingType.EntireArray,this.resolvedProperty=r;else this.propertyName=i;this.getValue=this.GetterByBindingType[o],this.setValue=this.SetterByBindingTypeAndVersioning[o][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}Ke.Composite=Ch;Ke.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Ke.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Ke.prototype.GetterByBindingType=[Ke.prototype._getValue_direct,Ke.prototype._getValue_array,Ke.prototype._getValue_arrayElement,Ke.prototype._getValue_toArray];Ke.prototype.SetterByBindingTypeAndVersioning=[[Ke.prototype._setValue_direct,Ke.prototype._setValue_direct_setNeedsUpdate,Ke.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Ke.prototype._setValue_array,Ke.prototype._setValue_array_setNeedsUpdate,Ke.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Ke.prototype._setValue_arrayElement,Ke.prototype._setValue_arrayElement_setNeedsUpdate,Ke.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Ke.prototype._setValue_fromArray,Ke.prototype._setValue_fromArray_setNeedsUpdate,Ke.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var s_=new Float32Array(1);function gl(e,t,n,i){let s=$d(i);switch(n){case 1021:return e*t;case 1028:return e*t/s.components*s.byteLength;case 1029:return e*t/s.components*s.byteLength;case 1030:return e*t*2/s.components*s.byteLength;case 1031:return e*t*2/s.components*s.byteLength;case 1022:return e*t*3/s.components*s.byteLength;case 1023:return e*t*4/s.components*s.byteLength;case 1033:return e*t*4/s.components*s.byteLength;case 33776:case 33777:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case 33778:case 33779:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case 35841:case 35843:return Math.max(e,16)*Math.max(t,8)/4;case 35840:case 35842:return Math.max(e,8)*Math.max(t,8)/2;case 36196:case 37492:case 37488:case 37489:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case 37496:case 37490:case 37491:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case 37808:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case 37809:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case 37810:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case 37811:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case 37812:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case 37813:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case 37814:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case 37815:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case 37816:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case 37817:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case 37818:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case 37819:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case 37820:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case 37821:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case 36492:case 36494:case 36495:return Math.ceil(e/4)*Math.ceil(t/4)*16;case 36283:case 36284:return Math.ceil(e/4)*Math.ceil(t/4)*8;case 36285:case 36286:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function $d(e){switch(e){case 1009:case 1010:return{byteLength:1,components:1};case 1012:case 1011:case 1016:return{byteLength:2,components:1};case 1017:case 1018:return{byteLength:2,components:4};case 1014:case 1013:case 1015:return{byteLength:4,components:1};case 35902:case 35899:return{byteLength:4,components:3}}throw Error(`Unknown texture type ${e}.`)}if(typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"182"}}));if(typeof window<"u")if(window.__THREE__)Me("WARNING: Multiple instances of Three.js being imported.");else window.__THREE__="182";function jh(){let e=null,t=!1,n=null,i=null;function s(r,a){n(r,a),i=e.requestAnimationFrame(s)}return{start:function(){if(t===!0)return;if(n===null)return;i=e.requestAnimationFrame(s),t=!0},stop:function(){e.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(r){n=r},setContext:function(r){e=r}}}function jd(e){let t=new WeakMap;function n(o,l){let{array:c,usage:h}=o,u=c.byteLength,d=e.createBuffer();e.bindBuffer(l,d),e.bufferData(l,c,h),o.onUploadCallback();let m;if(c instanceof Float32Array)m=e.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)m=e.HALF_FLOAT;else if(c instanceof Uint16Array)if(o.isFloat16BufferAttribute)m=e.HALF_FLOAT;else m=e.UNSIGNED_SHORT;else if(c instanceof Int16Array)m=e.SHORT;else if(c instanceof Uint32Array)m=e.UNSIGNED_INT;else if(c instanceof Int32Array)m=e.INT;else if(c instanceof Int8Array)m=e.BYTE;else if(c instanceof Uint8Array)m=e.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)m=e.UNSIGNED_BYTE;else throw Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:m,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function i(o,l,c){let{array:h,updateRanges:u}=l;if(e.bindBuffer(c,o),u.length===0)e.bufferSubData(c,0,h);else{u.sort((m,_)=>m.start-_.start);let d=0;for(let m=1;m<u.length;m++){let _=u[d],x=u[m];if(x.start<=_.start+_.count+1)_.count=Math.max(_.count,x.start+x.count-_.start);else++d,u[d]=x}u.length=d+1;for(let m=0,_=u.length;m<_;m++){let x=u[m];e.bufferSubData(c,x.start*h.BYTES_PER_ELEMENT,h,x.start,x.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){if(o.isInterleavedBufferAttribute)o=o.data;return t.get(o)}function r(o){if(o.isInterleavedBufferAttribute)o=o.data;let l=t.get(o);if(l)e.deleteBuffer(l.buffer),t.delete(o)}function a(o,l){if(o.isInterleavedBufferAttribute)o=o.data;if(o.isGLBufferAttribute){let h=t.get(o);if(!h||h.version<o.version)t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=t.get(o);if(c===void 0)t.set(o,n(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var Qd=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,ef=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,tf=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,nf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,sf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,rf=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,af=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,of=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,lf=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,cf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,hf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,uf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,df=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,ff=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,pf=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,mf=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,gf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,_f=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,xf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,vf=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,yf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Mf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Sf=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,bf=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Tf=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Af=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Ef=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,wf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Rf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Cf=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,If="gl_FragColor = linearToOutputTexel( gl_FragColor );",Pf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Lf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Nf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Df=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Uf=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Ff=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Of=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Bf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,zf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,kf=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Gf=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Hf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Vf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Wf=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Xf=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,qf=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Yf=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Zf=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Jf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Kf=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,$f=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,jf=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return v;
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( vec3( 1.0 ) - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Qf=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,ep=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,tp=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,np=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,ip=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,sp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,rp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,ap=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,op=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,lp=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,cp=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,hp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,up=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,dp=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,fp=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,pp=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,mp=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,gp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,_p=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,xp=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,vp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,yp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Mp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Sp=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,bp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Tp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Ap=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Ep=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,wp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Rp=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Cp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Ip=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Pp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Lp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Np=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Dp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Up=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * 6.28318530718;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * 6.28318530718;
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 0, 5, phi ).x + bitangent * vogelDiskSample( 0, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 1, 5, phi ).x + bitangent * vogelDiskSample( 1, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 2, 5, phi ).x + bitangent * vogelDiskSample( 2, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 3, 5, phi ).x + bitangent * vogelDiskSample( 3, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 4, 5, phi ).x + bitangent * vogelDiskSample( 4, 5, phi ).y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadow = step( depth, dp );
			#else
				shadow = step( dp, depth );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,Fp=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Op=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Bp=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,zp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,kp=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Gp=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Hp=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Vp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Wp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Xp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,qp=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Yp=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Zp=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Jp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Kp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,$p=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,jp=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Qp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,em=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,tm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,nm=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,im=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,sm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,rm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,am=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,om=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,lm=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,cm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,hm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,um=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,dm=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,fm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`;var pm=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,mm=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,gm=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,_m=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,xm=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,vm=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,ym=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Mm=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Sm=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,bm=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Tm=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Am=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Em=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,wm=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Rm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Cm=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Im=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Pm=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Lm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ge={alphahash_fragment:Qd,alphahash_pars_fragment:ef,alphamap_fragment:tf,alphamap_pars_fragment:nf,alphatest_fragment:sf,alphatest_pars_fragment:rf,aomap_fragment:af,aomap_pars_fragment:of,batching_pars_vertex:lf,batching_vertex:cf,begin_vertex:hf,beginnormal_vertex:uf,bsdfs:df,iridescence_fragment:ff,bumpmap_pars_fragment:pf,clipping_planes_fragment:mf,clipping_planes_pars_fragment:gf,clipping_planes_pars_vertex:_f,clipping_planes_vertex:xf,color_fragment:vf,color_pars_fragment:yf,color_pars_vertex:Mf,color_vertex:Sf,common:bf,cube_uv_reflection_fragment:Tf,defaultnormal_vertex:Af,displacementmap_pars_vertex:Ef,displacementmap_vertex:wf,emissivemap_fragment:Rf,emissivemap_pars_fragment:Cf,colorspace_fragment:If,colorspace_pars_fragment:Pf,envmap_fragment:Lf,envmap_common_pars_fragment:Nf,envmap_pars_fragment:Df,envmap_pars_vertex:Uf,envmap_physical_pars_fragment:qf,envmap_vertex:Ff,fog_vertex:Of,fog_pars_vertex:Bf,fog_fragment:zf,fog_pars_fragment:kf,gradientmap_pars_fragment:Gf,lightmap_pars_fragment:Hf,lights_lambert_fragment:Vf,lights_lambert_pars_fragment:Wf,lights_pars_begin:Xf,lights_toon_fragment:Yf,lights_toon_pars_fragment:Zf,lights_phong_fragment:Jf,lights_phong_pars_fragment:Kf,lights_physical_fragment:$f,lights_physical_pars_fragment:jf,lights_fragment_begin:Qf,lights_fragment_maps:ep,lights_fragment_end:tp,logdepthbuf_fragment:np,logdepthbuf_pars_fragment:ip,logdepthbuf_pars_vertex:sp,logdepthbuf_vertex:rp,map_fragment:ap,map_pars_fragment:op,map_particle_fragment:lp,map_particle_pars_fragment:cp,metalnessmap_fragment:hp,metalnessmap_pars_fragment:up,morphinstance_vertex:dp,morphcolor_vertex:fp,morphnormal_vertex:pp,morphtarget_pars_vertex:mp,morphtarget_vertex:gp,normal_fragment_begin:_p,normal_fragment_maps:xp,normal_pars_fragment:vp,normal_pars_vertex:yp,normal_vertex:Mp,normalmap_pars_fragment:Sp,clearcoat_normal_fragment_begin:bp,clearcoat_normal_fragment_maps:Tp,clearcoat_pars_fragment:Ap,iridescence_pars_fragment:Ep,opaque_fragment:wp,packing:Rp,premultiplied_alpha_fragment:Cp,project_vertex:Ip,dithering_fragment:Pp,dithering_pars_fragment:Lp,roughnessmap_fragment:Np,roughnessmap_pars_fragment:Dp,shadowmap_pars_fragment:Up,shadowmap_pars_vertex:Fp,shadowmap_vertex:Op,shadowmask_pars_fragment:Bp,skinbase_vertex:zp,skinning_pars_vertex:kp,skinning_vertex:Gp,skinnormal_vertex:Hp,specularmap_fragment:Vp,specularmap_pars_fragment:Wp,tonemapping_fragment:Xp,tonemapping_pars_fragment:qp,transmission_fragment:Yp,transmission_pars_fragment:Zp,uv_pars_fragment:Jp,uv_pars_vertex:Kp,uv_vertex:$p,worldpos_vertex:jp,background_vert:Qp,background_frag:em,backgroundCube_vert:tm,backgroundCube_frag:nm,cube_vert:im,cube_frag:sm,depth_vert:rm,depth_frag:am,distance_vert:om,distance_frag:lm,equirect_vert:cm,equirect_frag:hm,linedashed_vert:um,linedashed_frag:dm,meshbasic_vert:fm,meshbasic_frag:pm,meshlambert_vert:mm,meshlambert_frag:gm,meshmatcap_vert:_m,meshmatcap_frag:xm,meshnormal_vert:vm,meshnormal_frag:ym,meshphong_vert:Mm,meshphong_frag:Sm,meshphysical_vert:bm,meshphysical_frag:Tm,meshtoon_vert:Am,meshtoon_frag:Em,points_vert:wm,points_frag:Rm,shadow_vert:Cm,shadow_frag:Im,sprite_vert:Pm,sprite_frag:Lm},ce={common:{diffuse:{value:new Se(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ze},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ze}},envmap:{envMap:{value:null},envMapRotation:{value:new ze},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:0.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ze}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ze}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ze},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ze},normalScale:{value:new Oe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ze},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ze}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ze}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ze}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:0.00025},fogNear:{value:1},fogFar:{value:2000},fogColor:{value:new Se(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Se(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0},uvTransform:{value:new ze}},sprite:{diffuse:{value:new Se(16777215)},opacity:{value:1},center:{value:new Oe(0.5,0.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ze},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0}}},mn={basic:{uniforms:Rt([ce.common,ce.specularmap,ce.envmap,ce.aomap,ce.lightmap,ce.fog]),vertexShader:Ge.meshbasic_vert,fragmentShader:Ge.meshbasic_frag},lambert:{uniforms:Rt([ce.common,ce.specularmap,ce.envmap,ce.aomap,ce.lightmap,ce.emissivemap,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.fog,ce.lights,{emissive:{value:new Se(0)}}]),vertexShader:Ge.meshlambert_vert,fragmentShader:Ge.meshlambert_frag},phong:{uniforms:Rt([ce.common,ce.specularmap,ce.envmap,ce.aomap,ce.lightmap,ce.emissivemap,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.fog,ce.lights,{emissive:{value:new Se(0)},specular:{value:new Se(1118481)},shininess:{value:30}}]),vertexShader:Ge.meshphong_vert,fragmentShader:Ge.meshphong_frag},standard:{uniforms:Rt([ce.common,ce.envmap,ce.aomap,ce.lightmap,ce.emissivemap,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.roughnessmap,ce.metalnessmap,ce.fog,ce.lights,{emissive:{value:new Se(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ge.meshphysical_vert,fragmentShader:Ge.meshphysical_frag},toon:{uniforms:Rt([ce.common,ce.aomap,ce.lightmap,ce.emissivemap,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.gradientmap,ce.fog,ce.lights,{emissive:{value:new Se(0)}}]),vertexShader:Ge.meshtoon_vert,fragmentShader:Ge.meshtoon_frag},matcap:{uniforms:Rt([ce.common,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.fog,{matcap:{value:null}}]),vertexShader:Ge.meshmatcap_vert,fragmentShader:Ge.meshmatcap_frag},points:{uniforms:Rt([ce.points,ce.fog]),vertexShader:Ge.points_vert,fragmentShader:Ge.points_frag},dashed:{uniforms:Rt([ce.common,ce.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ge.linedashed_vert,fragmentShader:Ge.linedashed_frag},depth:{uniforms:Rt([ce.common,ce.displacementmap]),vertexShader:Ge.depth_vert,fragmentShader:Ge.depth_frag},normal:{uniforms:Rt([ce.common,ce.bumpmap,ce.normalmap,ce.displacementmap,{opacity:{value:1}}]),vertexShader:Ge.meshnormal_vert,fragmentShader:Ge.meshnormal_frag},sprite:{uniforms:Rt([ce.sprite,ce.fog]),vertexShader:Ge.sprite_vert,fragmentShader:Ge.sprite_frag},background:{uniforms:{uvTransform:{value:new ze},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ge.background_vert,fragmentShader:Ge.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ze}},vertexShader:Ge.backgroundCube_vert,fragmentShader:Ge.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ge.cube_vert,fragmentShader:Ge.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ge.equirect_vert,fragmentShader:Ge.equirect_frag},distance:{uniforms:Rt([ce.common,ce.displacementmap,{referencePosition:{value:new D},nearDistance:{value:1},farDistance:{value:1000}}]),vertexShader:Ge.distance_vert,fragmentShader:Ge.distance_frag},shadow:{uniforms:Rt([ce.lights,ce.fog,{color:{value:new Se(0)},opacity:{value:1}}]),vertexShader:Ge.shadow_vert,fragmentShader:Ge.shadow_frag}};mn.physical={uniforms:Rt([mn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ze},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ze},clearcoatNormalScale:{value:new Oe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ze},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ze},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ze},sheen:{value:0},sheenColor:{value:new Se(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ze},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ze},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ze},transmissionSamplerSize:{value:new Oe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ze},attenuationDistance:{value:0},attenuationColor:{value:new Se(0)},specularColor:{value:new Se(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ze},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ze},anisotropyVector:{value:new Oe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ze}}]),vertexShader:Ge.meshphysical_vert,fragmentShader:Ge.meshphysical_frag};var fa={r:0,b:0,g:0},vi=new Jt,Nm=new Be;function Dm(e,t,n,i,s,r,a){let o=new Se(0),l=r===!0?0:1,c,h,u=null,d=0,m=null;function _(b){let T=b.isScene===!0?b.background:null;if(T&&T.isTexture)T=(b.backgroundBlurriness>0?n:t).get(T);return T}function x(b){let T=!1,I=_(b);if(I===null)p(o,l);else if(I&&I.isColor)p(I,1),T=!0;let E=e.xr.getEnvironmentBlendMode();if(E==="additive")i.buffers.color.setClear(0,0,0,1,a);else if(E==="alpha-blend")i.buffers.color.setClear(0,0,0,0,a);if(e.autoClear||T)i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil)}function f(b,T){let I=_(T);if(I&&(I.isCubeTexture||I.mapping===Cs)){if(h===void 0)h=new dt(new Zn(1,1,1),new jt({name:"BackgroundCubeMaterial",uniforms:pi(mn.backgroundCube.uniforms),vertexShader:mn.backgroundCube.vertexShader,fragmentShader:mn.backgroundCube.fragmentShader,side:Pt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(E,P,N){this.matrixWorld.copyPosition(N.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h);if(vi.copy(T.backgroundRotation),vi.x*=-1,vi.y*=-1,vi.z*=-1,I.isCubeTexture&&I.isRenderTargetTexture===!1)vi.y*=-1,vi.z*=-1;if(h.material.uniforms.envMap.value=I,h.material.uniforms.flipEnvMap.value=I.isCubeTexture&&I.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=T.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Nm.makeRotationFromEuler(vi)),h.material.toneMapped=We.getTransfer(I.colorSpace)!==rt,u!==I||d!==I.version||m!==e.toneMapping)h.material.needsUpdate=!0,u=I,d=I.version,m=e.toneMapping;h.layers.enableAll(),b.unshift(h,h.geometry,h.material,0,0,null)}else if(I&&I.isTexture){if(c===void 0)c=new dt(new Hs(2,2),new jt({name:"BackgroundMaterial",uniforms:pi(mn.background.uniforms),vertexShader:mn.background.vertexShader,fragmentShader:mn.background.fragmentShader,side:Wn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c);if(c.material.uniforms.t2D.value=I,c.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,c.material.toneMapped=We.getTransfer(I.colorSpace)!==rt,I.matrixAutoUpdate===!0)I.updateMatrix();if(c.material.uniforms.uvTransform.value.copy(I.matrix),u!==I||d!==I.version||m!==e.toneMapping)c.material.needsUpdate=!0,u=I,d=I.version,m=e.toneMapping;c.layers.enableAll(),b.unshift(c,c.geometry,c.material,0,0,null)}}function p(b,T){b.getRGB(fa,tl(e)),i.buffers.color.setClear(fa.r,fa.g,fa.b,T,a)}function A(){if(h!==void 0)h.geometry.dispose(),h.material.dispose(),h=void 0;if(c!==void 0)c.geometry.dispose(),c.material.dispose(),c=void 0}return{getClearColor:function(){return o},setClearColor:function(b,T=1){o.set(b),l=T,p(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(b){l=b,p(o,l)},render:x,addToRenderList:f,dispose:A}}function Um(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),i={},s=d(null),r=s,a=!1;function o(S,R,k,X,G){let K=!1,H=u(X,k,R);if(r!==H)r=H,c(r.object);if(K=m(S,X,k,G),K)_(S,X,k,G);if(G!==null)t.update(G,e.ELEMENT_ARRAY_BUFFER);if(K||a){if(a=!1,T(S,R,k,X),G!==null)e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(G).buffer)}}function l(){return e.createVertexArray()}function c(S){return e.bindVertexArray(S)}function h(S){return e.deleteVertexArray(S)}function u(S,R,k){let X=k.wireframe===!0,G=i[S.id];if(G===void 0)G={},i[S.id]=G;let K=G[R.id];if(K===void 0)K={},G[R.id]=K;let H=K[X];if(H===void 0)H=d(l()),K[X]=H;return H}function d(S){let R=[],k=[],X=[];for(let G=0;G<n;G++)R[G]=0,k[G]=0,X[G]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:R,enabledAttributes:k,attributeDivisors:X,object:S,attributes:{},index:null}}function m(S,R,k,X){let G=r.attributes,K=R.attributes,H=0,O=k.getAttributes();for(let Y in O)if(O[Y].location>=0){let ie=G[Y],fe=K[Y];if(fe===void 0){if(Y==="instanceMatrix"&&S.instanceMatrix)fe=S.instanceMatrix;if(Y==="instanceColor"&&S.instanceColor)fe=S.instanceColor}if(ie===void 0)return!0;if(ie.attribute!==fe)return!0;if(fe&&ie.data!==fe.data)return!0;H++}if(r.attributesNum!==H)return!0;if(r.index!==X)return!0;return!1}function _(S,R,k,X){let G={},K=R.attributes,H=0,O=k.getAttributes();for(let Y in O)if(O[Y].location>=0){let ie=K[Y];if(ie===void 0){if(Y==="instanceMatrix"&&S.instanceMatrix)ie=S.instanceMatrix;if(Y==="instanceColor"&&S.instanceColor)ie=S.instanceColor}let fe={};if(fe.attribute=ie,ie&&ie.data)fe.data=ie.data;G[Y]=fe,H++}r.attributes=G,r.attributesNum=H,r.index=X}function x(){let S=r.newAttributes;for(let R=0,k=S.length;R<k;R++)S[R]=0}function f(S){p(S,0)}function p(S,R){let k=r.newAttributes,X=r.enabledAttributes,G=r.attributeDivisors;if(k[S]=1,X[S]===0)e.enableVertexAttribArray(S),X[S]=1;if(G[S]!==R)e.vertexAttribDivisor(S,R),G[S]=R}function A(){let S=r.newAttributes,R=r.enabledAttributes;for(let k=0,X=R.length;k<X;k++)if(R[k]!==S[k])e.disableVertexAttribArray(k),R[k]=0}function b(S,R,k,X,G,K,H){if(H===!0)e.vertexAttribIPointer(S,R,k,G,K);else e.vertexAttribPointer(S,R,k,X,G,K)}function T(S,R,k,X){x();let G=X.attributes,K=k.getAttributes(),H=R.defaultAttributeValues;for(let O in K){let Y=K[O];if(Y.location>=0){let ee=G[O];if(ee===void 0){if(O==="instanceMatrix"&&S.instanceMatrix)ee=S.instanceMatrix;if(O==="instanceColor"&&S.instanceColor)ee=S.instanceColor}if(ee!==void 0){let ie=ee.normalized,fe=ee.itemSize,Pe=t.get(ee);if(Pe===void 0)continue;let{buffer:ht,type:$e,bytesPerElement:Z}=Pe,oe=$e===e.INT||$e===e.UNSIGNED_INT||ee.gpuType===ro;if(ee.isInterleavedBufferAttribute){let se=ee.data,Te=se.stride,Ee=ee.offset;if(se.isInstancedInterleavedBuffer){for(let Le=0;Le<Y.locationSize;Le++)p(Y.location+Le,se.meshPerAttribute);if(S.isInstancedMesh!==!0&&X._maxInstanceCount===void 0)X._maxInstanceCount=se.meshPerAttribute*se.count}else for(let Le=0;Le<Y.locationSize;Le++)f(Y.location+Le);e.bindBuffer(e.ARRAY_BUFFER,ht);for(let Le=0;Le<Y.locationSize;Le++)b(Y.location+Le,fe/Y.locationSize,$e,ie,Te*Z,(Ee+fe/Y.locationSize*Le)*Z,oe)}else{if(ee.isInstancedBufferAttribute){for(let se=0;se<Y.locationSize;se++)p(Y.location+se,ee.meshPerAttribute);if(S.isInstancedMesh!==!0&&X._maxInstanceCount===void 0)X._maxInstanceCount=ee.meshPerAttribute*ee.count}else for(let se=0;se<Y.locationSize;se++)f(Y.location+se);e.bindBuffer(e.ARRAY_BUFFER,ht);for(let se=0;se<Y.locationSize;se++)b(Y.location+se,fe/Y.locationSize,$e,ie,fe*Z,fe/Y.locationSize*se*Z,oe)}}else if(H!==void 0){let ie=H[O];if(ie!==void 0)switch(ie.length){case 2:e.vertexAttrib2fv(Y.location,ie);break;case 3:e.vertexAttrib3fv(Y.location,ie);break;case 4:e.vertexAttrib4fv(Y.location,ie);break;default:e.vertexAttrib1fv(Y.location,ie)}}}}A()}function I(){N();for(let S in i){let R=i[S];for(let k in R){let X=R[k];for(let G in X)h(X[G].object),delete X[G];delete R[k]}delete i[S]}}function E(S){if(i[S.id]===void 0)return;let R=i[S.id];for(let k in R){let X=R[k];for(let G in X)h(X[G].object),delete X[G];delete R[k]}delete i[S.id]}function P(S){for(let R in i){let k=i[R];if(k[S.id]===void 0)continue;let X=k[S.id];for(let G in X)h(X[G].object),delete X[G];delete k[S.id]}}function N(){if(y(),a=!0,r===s)return;r=s,c(r.object)}function y(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:N,resetDefaultState:y,dispose:I,releaseStatesOfGeometry:E,releaseStatesOfProgram:P,initAttributes:x,enableAttribute:f,disableUnusedAttributes:A}}function Fm(e,t,n){let i;function s(c){i=c}function r(c,h){e.drawArrays(i,c,h),n.update(h,i,1)}function a(c,h,u){if(u===0)return;e.drawArraysInstanced(i,c,h,u),n.update(h,i,u)}function o(c,h,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,h,0,u);let m=0;for(let _=0;_<u;_++)m+=h[_];n.update(m,i,1)}function l(c,h,u,d){if(u===0)return;let m=t.get("WEBGL_multi_draw");if(m===null)for(let _=0;_<c.length;_++)a(c[_],h[_],d[_]);else{m.multiDrawArraysInstancedWEBGL(i,c,0,h,0,d,0,u);let _=0;for(let x=0;x<u;x++)_+=h[x]*d[x];n.update(_,i,1)}}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function Om(e,t,n,i){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let P=t.get("EXT_texture_filter_anisotropic");s=e.getParameter(P.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(P){if(P!==un&&i.convert(P)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))return!1;return!0}function o(P){let N=P===Nn&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));if(P!==ln&&i.convert(P)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&P!==Ln&&!N)return!1;return!0}function l(P){if(P==="highp"){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return"highp";P="mediump"}if(P==="mediump"){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0)return"mediump"}return"lowp"}let c=n.precision!==void 0?n.precision:"highp",h=l(c);if(h!==c)Me("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h;let u=n.logarithmicDepthBuffer===!0,d=n.reversedDepthBuffer===!0&&t.has("EXT_clip_control"),m=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),_=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=e.getParameter(e.MAX_TEXTURE_SIZE),f=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),p=e.getParameter(e.MAX_VERTEX_ATTRIBS),A=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),b=e.getParameter(e.MAX_VARYING_VECTORS),T=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),I=e.getParameter(e.MAX_SAMPLES),E=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:m,maxVertexTextures:_,maxTextureSize:x,maxCubemapSize:f,maxAttributes:p,maxVertexUniforms:A,maxVaryings:b,maxFragmentUniforms:T,maxSamples:I,samples:E}}function Bm(e){let t=this,n=null,i=0,s=!1,r=!1,a=new En,o=new ze,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let m=u.length!==0||d||i!==0||s;return s=d,i=u.length,m},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){n=h(u,d,0)},this.setState=function(u,d,m){let{clippingPlanes:_,clipIntersection:x,clipShadows:f}=u,p=e.get(u);if(!s||_===null||_.length===0||r&&!f)if(r)h(null);else c();else{let A=r?0:i,b=A*4,T=p.clippingState||null;l.value=T,T=h(_,d,b,m);for(let I=0;I!==b;++I)T[I]=n[I];p.clippingState=T,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=A}};function c(){if(l.value!==n)l.value=n,l.needsUpdate=i>0;t.numPlanes=i,t.numIntersection=0}function h(u,d,m,_){let x=u!==null?u.length:0,f=null;if(x!==0){if(f=l.value,_!==!0||f===null){let p=m+x*4,A=d.matrixWorldInverse;if(o.getNormalMatrix(A),f===null||f.length<p)f=new Float32Array(p);for(let b=0,T=m;b!==x;++b,T+=4)a.copy(u[b]).applyMatrix4(A,o),a.normal.toArray(f,T),f[T+3]=a.constant}l.value=f,l.needsUpdate=!0}return t.numPlanes=x,t.numIntersection=0,f}}function zm(e){let t=new WeakMap;function n(a,o){if(o===Dr)a.mapping=Zi;else if(o===Ur)a.mapping=ci;return a}function i(a){if(a&&a.isTexture){let o=a.mapping;if(o===Dr||o===Ur)if(t.has(a)){let l=t.get(a).texture;return n(l,a.mapping)}else{let l=a.image;if(l&&l.height>0){let c=new $r(l.height);return c.fromEquirectangularTexture(e,a),t.set(a,c),a.addEventListener("dispose",s),n(c.texture,a.mapping)}else return null}}return a}function s(a){let o=a.target;o.removeEventListener("dispose",s);let l=t.get(o);if(l!==void 0)t.delete(o),l.dispose()}function r(){t=new WeakMap}return{get:i,dispose:r}}var Qn=4,Ih=[0.125,0.215,0.35,0.446,0.526,0.582],Mi=20,km=256,Ws=new _i,Ph=new Se,_l=null,xl=0,vl=0,yl=!1,Gm=new D;class Zs{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=0.1,i=100,s={}){let{size:r=256,position:a=Gm}=s;_l=this._renderer.getRenderTarget(),xl=this._renderer.getActiveCubeFace(),vl=this._renderer.getActiveMipmapLevel(),yl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(r);let o=this._allocateTargets();if(o.depthBuffer=!0,this._sceneToCubeUV(e,n,i,o,a),t>0)this._blur(o,0,0,t);return this._applyPMREM(o),this._cleanup(o),o}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){if(this._cubemapMaterial===null)this._cubemapMaterial=Dh(),this._compileMaterial(this._cubemapMaterial)}compileEquirectangularShader(){if(this._equirectMaterial===null)this._equirectMaterial=Nh(),this._compileMaterial(this._equirectMaterial)}dispose(){if(this._dispose(),this._cubemapMaterial!==null)this._cubemapMaterial.dispose();if(this._equirectMaterial!==null)this._equirectMaterial.dispose();if(this._backgroundBox!==null)this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){if(this._blurMaterial!==null)this._blurMaterial.dispose();if(this._ggxMaterial!==null)this._ggxMaterial.dispose();if(this._pingPongRenderTarget!==null)this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(_l,xl,vl),this._renderer.xr.enabled=yl,e.scissorTest=!1,as(e,0,0,e.width,e.height)}_fromTexture(e,t){if(e.mapping===Zi||e.mapping===ci)this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width);else this._setSize(e.image.width/4);_l=this._renderer.getRenderTarget(),xl=this._renderer.getActiveCubeFace(),vl=this._renderer.getActiveMipmapLevel(),yl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Tt,minFilter:Tt,generateMipmaps:!1,type:Nn,format:un,colorSpace:Lt,depthBuffer:!1},i=Lh(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){if(this._pingPongRenderTarget!==null)this._dispose();this._pingPongRenderTarget=Lh(e,t,n);let{_lodMax:s}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=Hm(s)),this._blurMaterial=Wm(s,e,t),this._ggxMaterial=Vm(s,e,t)}return i}_compileMaterial(e){let t=new dt(new wt,e);this._renderer.compile(t,Ws)}_sceneToCubeUV(e,t,n,i,s){let o=new vt(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,{autoClear:u,toneMapping:d}=h;if(h.getClearColor(Ph),h.toneMapping=an,h.autoClear=!1,h.state.buffers.depth.getReversed())h.setRenderTarget(i),h.clearDepth(),h.setRenderTarget(null);if(this._backgroundBox===null)this._backgroundBox=new dt(new Zn,new fn({name:"PMREM.Background",side:Pt,depthWrite:!1,depthTest:!1}));let _=this._backgroundBox,x=_.material,f=!1,p=e.background;if(p){if(p.isColor)x.color.copy(p),e.background=null,f=!0}else x.color.copy(Ph),f=!0;for(let A=0;A<6;A++){let b=A%3;if(b===0)o.up.set(0,l[A],0),o.position.set(s.x,s.y,s.z),o.lookAt(s.x+c[A],s.y,s.z);else if(b===1)o.up.set(0,0,l[A]),o.position.set(s.x,s.y,s.z),o.lookAt(s.x,s.y+c[A],s.z);else o.up.set(0,l[A],0),o.position.set(s.x,s.y,s.z),o.lookAt(s.x,s.y,s.z+c[A]);let T=this._cubeSize;if(as(i,b*T,A>2?T:0,T,T),h.setRenderTarget(i),f)h.render(_,o);h.render(e,o)}h.toneMapping=d,h.autoClear=u,e.background=p}_textureToCubeUV(e,t){let n=this._renderer,i=e.mapping===Zi||e.mapping===ci;if(i){if(this._cubemapMaterial===null)this._cubemapMaterial=Dh();this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1}else if(this._equirectMaterial===null)this._equirectMaterial=Nh();let s=i?this._cubemapMaterial:this._equirectMaterial,r=this._lodMeshes[0];r.material=s;let a=s.uniforms;a.envMap.value=e;let o=this._cubeSize;as(t,0,0,3*o,2*o),n.setRenderTarget(t),n.render(r,Ws)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let i=this._lodMeshes.length;for(let s=1;s<i;s++)this._applyGGXFilter(e,s-1,s);t.autoClear=n}_applyGGXFilter(e,t,n){let i=this._renderer,s=this._pingPongRenderTarget,r=this._ggxMaterial,a=this._lodMeshes[n];a.material=r;let o=r.uniforms,l=n/(this._lodMeshes.length-1),c=t/(this._lodMeshes.length-1),h=Math.sqrt(l*l-c*c),u=0+l*1.25,d=h*u,{_lodMax:m}=this,_=this._sizeLods[n],x=3*_*(n>m-Qn?n-m+Qn:0),f=4*(this._cubeSize-_);o.envMap.value=e.texture,o.roughness.value=d,o.mipInt.value=m-t,as(s,x,f,3*_,2*_),i.setRenderTarget(s),i.render(a,Ws),o.envMap.value=s.texture,o.roughness.value=0,o.mipInt.value=m-n,as(e,x,f,3*_,2*_),i.setRenderTarget(e),i.render(a,Ws)}_blur(e,t,n,i,s){let r=this._pingPongRenderTarget;this._halfBlur(e,r,t,n,i,"latitudinal",s),this._halfBlur(r,e,n,n,i,"longitudinal",s)}_halfBlur(e,t,n,i,s,r,a){let o=this._renderer,l=this._blurMaterial;if(r!=="latitudinal"&&r!=="longitudinal")Ie("blur direction must be either latitudinal or longitudinal!");let c=3,h=this._lodMeshes[i];h.material=l;let u=l.uniforms,d=this._sizeLods[n]-1,m=isFinite(s)?Math.PI/(2*d):2*Math.PI/(2*Mi-1),_=s/m,x=isFinite(s)?1+Math.floor(c*_):Mi;if(x>Mi)Me(`sigmaRadians, ${s}, is too large and will clip, as it requested ${x} samples when the maximum is set to ${Mi}`);let f=[],p=0;for(let E=0;E<Mi;++E){let P=E/_,N=Math.exp(-P*P/2);if(f.push(N),E===0)p+=N;else if(E<x)p+=2*N}for(let E=0;E<f.length;E++)f[E]=f[E]/p;if(u.envMap.value=e.texture,u.samples.value=x,u.weights.value=f,u.latitudinal.value=r==="latitudinal",a)u.poleAxis.value=a;let{_lodMax:A}=this;u.dTheta.value=m,u.mipInt.value=A-n;let b=this._sizeLods[i],T=3*b*(i>A-Qn?i-A+Qn:0),I=4*(this._cubeSize-b);as(t,T,I,3*b,2*b),o.setRenderTarget(t),o.render(h,Ws)}}function Hm(e){let t=[],n=[],i=[],s=e,r=e-Qn+1+Ih.length;for(let a=0;a<r;a++){let o=Math.pow(2,s);t.push(o);let l=1/o;if(a>e-Qn)l=Ih[a-e+Qn-1];else if(a===0)l=0;n.push(l);let c=1/(o-2),h=-c,u=1+c,d=[h,h,u,h,u,u,h,h,u,u,h,u],m=6,_=6,x=3,f=2,p=1,A=new Float32Array(x*_*m),b=new Float32Array(f*_*m),T=new Float32Array(p*_*m);for(let E=0;E<m;E++){let P=E%3*2/3-1,N=E>2?0:-1,y=[P,N,0,P+0.6666666666666666,N,0,P+0.6666666666666666,N+1,0,P,N,0,P+0.6666666666666666,N+1,0,P,N+1,0];A.set(y,x*_*E),b.set(d,f*_*E);let S=[E,E,E,E,E,E];T.set(S,p*_*E)}let I=new wt;if(I.setAttribute("position",new yt(A,x)),I.setAttribute("uv",new yt(b,f)),I.setAttribute("faceIndex",new yt(T,p)),i.push(new dt(I,null)),s>Qn)s--}return{lodMeshes:i,sizeLods:t,sigmas:n}}function Lh(e,t,n){let i=new $t(e,t,n);return i.texture.mapping=Cs,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function as(e,t,n,i,s){e.viewport.set(t,n,i,s),e.scissor.set(t,n,i,s)}function Vm(e,t,n){return new jt({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:km,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:ma(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 3.2: Transform view direction to hemisphere configuration
				vec3 Vh = normalize(vec3(alpha * V.x, alpha * V.y, V.z));

				// Section 4.1: Orthonormal basis
				float lensq = Vh.x * Vh.x + Vh.y * Vh.y;
				vec3 T1 = lensq > 0.0 ? vec3(-Vh.y, Vh.x, 0.0) / sqrt(lensq) : vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(Vh, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + Vh.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * Vh;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:In,depthTest:!1,depthWrite:!1})}function Wm(e,t,n){let i=new Float32Array(Mi),s=new D(0,1,0);return new jt({name:"SphericalGaussianBlur",defines:{n:Mi,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:ma(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:In,depthTest:!1,depthWrite:!1})}function Nh(){return new jt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ma(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:In,depthTest:!1,depthWrite:!1})}function Dh(){return new jt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ma(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:In,depthTest:!1,depthWrite:!1})}function ma(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Xm(e){let t=new WeakMap,n=null;function i(o){if(o&&o.isTexture){let l=o.mapping,c=l===Dr||l===Ur,h=l===Zi||l===ci;if(c||h){let u=t.get(o),d=u!==void 0?u.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==d){if(n===null)n=new Zs(e);return u=c?n.fromEquirectangular(o,u):n.fromCubemap(o,u),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),u.texture}else if(u!==void 0)return u.texture;else{let m=o.image;if(c&&m&&m.height>0||h&&m&&s(m)){if(n===null)n=new Zs(e);return u=c?n.fromEquirectangular(o):n.fromCubemap(o),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),o.addEventListener("dispose",r),u.texture}else return null}}}return o}function s(o){let l=0,c=6;for(let h=0;h<c;h++)if(o[h]!==void 0)l++;return l===c}function r(o){let l=o.target;l.removeEventListener("dispose",r);let c=t.get(l);if(c!==void 0)t.delete(l),c.dispose()}function a(){if(t=new WeakMap,n!==null)n.dispose(),n=null}return{get:i,dispose:a}}function qm(e){let t={};function n(i){if(t[i]!==void 0)return t[i];let s=e.getExtension(i);return t[i]=s,s}return{has:function(i){return n(i)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(i){let s=n(i);if(s===null)Xi("WebGLRenderer: "+i+" extension not supported.");return s}}}function Ym(e,t,n,i){let s={},r=new WeakMap;function a(u){let d=u.target;if(d.index!==null)t.remove(d.index);for(let _ in d.attributes)t.remove(d.attributes[_]);d.removeEventListener("dispose",a),delete s[d.id];let m=r.get(d);if(m)t.remove(m),r.delete(d);if(i.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0)delete d._maxInstanceCount;n.memory.geometries--}function o(u,d){if(s[d.id]===!0)return d;return d.addEventListener("dispose",a),s[d.id]=!0,n.memory.geometries++,d}function l(u){let d=u.attributes;for(let m in d)t.update(d[m],e.ARRAY_BUFFER)}function c(u){let d=[],m=u.index,_=u.attributes.position,x=0;if(m!==null){let A=m.array;x=m.version;for(let b=0,T=A.length;b<T;b+=3){let I=A[b+0],E=A[b+1],P=A[b+2];d.push(I,E,E,P,P,I)}}else if(_!==void 0){let A=_.array;x=_.version;for(let b=0,T=A.length/3-1;b<T;b+=3){let I=b+0,E=b+1,P=b+2;d.push(I,E,E,P,P,I)}}else return;let f=new((Jo(d))?Zr:Yr)(d,1);f.version=x;let p=r.get(u);if(p)t.remove(p);r.set(u,f)}function h(u){let d=r.get(u);if(d){let m=u.index;if(m!==null){if(d.version<m.version)c(u)}}else c(u);return r.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function Zm(e,t,n){let i;function s(d){i=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function l(d,m){e.drawElements(i,m,r,d*a),n.update(m,i,1)}function c(d,m,_){if(_===0)return;e.drawElementsInstanced(i,m,r,d*a,_),n.update(m,i,_)}function h(d,m,_){if(_===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,m,0,r,d,0,_);let f=0;for(let p=0;p<_;p++)f+=m[p];n.update(f,i,1)}function u(d,m,_,x){if(_===0)return;let f=t.get("WEBGL_multi_draw");if(f===null)for(let p=0;p<d.length;p++)c(d[p]/a,m[p],x[p]);else{f.multiDrawElementsInstancedWEBGL(i,m,0,r,d,0,x,0,_);let p=0;for(let A=0;A<_;A++)p+=m[A]*x[A];n.update(p,i,1)}}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function Jm(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,a,o){switch(n.calls++,a){case e.TRIANGLES:n.triangles+=o*(r/3);break;case e.LINES:n.lines+=o*(r/2);break;case e.LINE_STRIP:n.lines+=o*(r-1);break;case e.LINE_LOOP:n.lines+=o*r;break;case e.POINTS:n.points+=o*r;break;default:Ie("WebGLInfo: Unknown draw mode:",a);break}}function s(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:s,update:i}}function Km(e,t,n){let i=new WeakMap,s=new ct;function r(a,o,l){let c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0,d=i.get(o);if(d===void 0||d.count!==u){let y=function(){P.dispose(),i.delete(o),o.removeEventListener("dispose",y)};if(d!==void 0)d.texture.dispose();let m=o.morphAttributes.position!==void 0,_=o.morphAttributes.normal!==void 0,x=o.morphAttributes.color!==void 0,f=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],A=o.morphAttributes.color||[],b=0;if(m===!0)b=1;if(_===!0)b=2;if(x===!0)b=3;let T=o.attributes.position.count*b,I=1;if(T>t.maxTextureSize)I=Math.ceil(T/t.maxTextureSize),T=t.maxTextureSize;let E=new Float32Array(T*I*4*u),P=new Xr(E,T,I,u);P.type=Ln,P.needsUpdate=!0;let N=b*4;for(let S=0;S<u;S++){let R=f[S],k=p[S],X=A[S],G=T*I*4*S;for(let K=0;K<R.count;K++){let H=K*N;if(m===!0)s.fromBufferAttribute(R,K),E[G+H+0]=s.x,E[G+H+1]=s.y,E[G+H+2]=s.z,E[G+H+3]=0;if(_===!0)s.fromBufferAttribute(k,K),E[G+H+4]=s.x,E[G+H+5]=s.y,E[G+H+6]=s.z,E[G+H+7]=0;if(x===!0)s.fromBufferAttribute(X,K),E[G+H+8]=s.x,E[G+H+9]=s.y,E[G+H+10]=s.z,E[G+H+11]=X.itemSize===4?s.w:1}}d={count:u,texture:P,size:new Oe(T,I)},i.set(o,d),o.addEventListener("dispose",y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(e,"morphTexture",a.morphTexture,n);else{let m=0;for(let x=0;x<c.length;x++)m+=c[x];let _=o.morphTargetsRelative?1:1-m;l.getUniforms().setValue(e,"morphTargetBaseInfluence",_),l.getUniforms().setValue(e,"morphTargetInfluences",c)}l.getUniforms().setValue(e,"morphTargetsTexture",d.texture,n),l.getUniforms().setValue(e,"morphTargetsTextureSize",d.size)}return{update:r}}function $m(e,t,n,i){let s=new WeakMap;function r(l){let c=i.render.frame,h=l.geometry,u=t.get(l,h);if(s.get(u)!==c)t.update(u),s.set(u,c);if(l.isInstancedMesh){if(l.hasEventListener("dispose",o)===!1)l.addEventListener("dispose",o);if(s.get(l)!==c){if(n.update(l.instanceMatrix,e.ARRAY_BUFFER),l.instanceColor!==null)n.update(l.instanceColor,e.ARRAY_BUFFER);s.set(l,c)}}if(l.isSkinnedMesh){let d=l.skeleton;if(s.get(d)!==c)d.update(),s.set(d,c)}return u}function a(){s=new WeakMap}function o(l){let c=l.target;if(c.removeEventListener("dispose",o),n.remove(c.instanceMatrix),c.instanceColor!==null)n.remove(c.instanceColor)}return{update:r,dispose:a}}var jm={[Qa]:"LINEAR_TONE_MAPPING",[eo]:"REINHARD_TONE_MAPPING",[to]:"CINEON_TONE_MAPPING",[no]:"ACES_FILMIC_TONE_MAPPING",[so]:"AGX_TONE_MAPPING",[Rs]:"NEUTRAL_TONE_MAPPING",[io]:"CUSTOM_TONE_MAPPING"};function Qm(e,t,n,i,s){let r=new $t(t,n,{type:e,depthBuffer:i,stencilBuffer:s}),a=new $t(t,n,{type:Nn,depthBuffer:!1,stencilBuffer:!1}),o=new wt;o.setAttribute("position",new Ft([-1,3,0,-1,-1,0,3,-1,0],3)),o.setAttribute("uv",new Ft([0,2,0,0,2,0],2));let l=new sl({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),c=new dt(o,l),h=new _i(-1,1,1,-1,0,1),u=null,d=null,m=!1,_,x=null,f=[],p=!1;this.setSize=function(A,b){r.setSize(A,b),a.setSize(A,b);for(let T=0;T<f.length;T++){let I=f[T];if(I.setSize)I.setSize(A,b)}},this.setEffects=function(A){f=A,p=f.length>0&&f[0].isRenderPass===!0;let{width:b,height:T}=r;for(let I=0;I<f.length;I++){let E=f[I];if(E.setSize)E.setSize(b,T)}},this.begin=function(A,b){if(m)return!1;if(A.toneMapping===an&&f.length===0)return!1;if(x=b,b!==null){let{width:T,height:I}=b;if(r.width!==T||r.height!==I)this.setSize(T,I)}if(p===!1)A.setRenderTarget(r);return _=A.toneMapping,A.toneMapping=an,!0},this.hasRenderPass=function(){return p},this.end=function(A,b){A.toneMapping=_,m=!0;let T=r,I=a;for(let E=0;E<f.length;E++){let P=f[E];if(P.enabled===!1)continue;if(P.render(A,I,T,b),P.needsSwap!==!1){let N=T;T=I,I=N}}if(u!==A.outputColorSpace||d!==A.toneMapping){if(u=A.outputColorSpace,d=A.toneMapping,l.defines={},We.getTransfer(u)===rt)l.defines.SRGB_TRANSFER="";let E=jm[d];if(E)l.defines[E]="";l.needsUpdate=!0}l.uniforms.tDiffuse.value=T.texture,A.setRenderTarget(x),A.render(c,h),x=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){r.dispose(),a.dispose(),o.dispose(),l.dispose()}}var Qh=new gt,bl=new mi(1,1),eu=new Xr,tu=new el,nu=new Kr,Uh=[],Fh=[],Oh=new Float32Array(16),Bh=new Float32Array(9),zh=new Float32Array(4);function os(e,t,n){let i=e[0];if(i<=0||i>0)return e;let s=t*n,r=Uh[s];if(r===void 0)r=new Float32Array(s),Uh[s]=r;if(t!==0){i.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=n,e[a].toArray(r,o)}return r}function Mt(e,t){if(e.length!==t.length)return!1;for(let n=0,i=e.length;n<i;n++)if(e[n]!==t[n])return!1;return!0}function St(e,t){for(let n=0,i=t.length;n<i;n++)e[n]=t[n]}function ga(e,t){let n=Fh[t];if(n===void 0)n=new Int32Array(t),Fh[t]=n;for(let i=0;i!==t;++i)n[i]=e.allocateTextureUnit();return n}function eg(e,t){let n=this.cache;if(n[0]===t)return;e.uniform1f(this.addr,t),n[0]=t}function tg(e,t){let n=this.cache;if(t.x!==void 0){if(n[0]!==t.x||n[1]!==t.y)e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y}else{if(Mt(n,t))return;e.uniform2fv(this.addr,t),St(n,t)}}function ng(e,t){let n=this.cache;if(t.x!==void 0){if(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z}else if(t.r!==void 0){if(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b}else{if(Mt(n,t))return;e.uniform3fv(this.addr,t),St(n,t)}}function ig(e,t){let n=this.cache;if(t.x!==void 0){if(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w}else{if(Mt(n,t))return;e.uniform4fv(this.addr,t),St(n,t)}}function sg(e,t){let n=this.cache,i=t.elements;if(i===void 0){if(Mt(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),St(n,t)}else{if(Mt(n,i))return;zh.set(i),e.uniformMatrix2fv(this.addr,!1,zh),St(n,i)}}function rg(e,t){let n=this.cache,i=t.elements;if(i===void 0){if(Mt(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),St(n,t)}else{if(Mt(n,i))return;Bh.set(i),e.uniformMatrix3fv(this.addr,!1,Bh),St(n,i)}}function ag(e,t){let n=this.cache,i=t.elements;if(i===void 0){if(Mt(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),St(n,t)}else{if(Mt(n,i))return;Oh.set(i),e.uniformMatrix4fv(this.addr,!1,Oh),St(n,i)}}function og(e,t){let n=this.cache;if(n[0]===t)return;e.uniform1i(this.addr,t),n[0]=t}function lg(e,t){let n=this.cache;if(t.x!==void 0){if(n[0]!==t.x||n[1]!==t.y)e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y}else{if(Mt(n,t))return;e.uniform2iv(this.addr,t),St(n,t)}}function cg(e,t){let n=this.cache;if(t.x!==void 0){if(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z}else{if(Mt(n,t))return;e.uniform3iv(this.addr,t),St(n,t)}}function hg(e,t){let n=this.cache;if(t.x!==void 0){if(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w}else{if(Mt(n,t))return;e.uniform4iv(this.addr,t),St(n,t)}}function ug(e,t){let n=this.cache;if(n[0]===t)return;e.uniform1ui(this.addr,t),n[0]=t}function dg(e,t){let n=this.cache;if(t.x!==void 0){if(n[0]!==t.x||n[1]!==t.y)e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y}else{if(Mt(n,t))return;e.uniform2uiv(this.addr,t),St(n,t)}}function fg(e,t){let n=this.cache;if(t.x!==void 0){if(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z}else{if(Mt(n,t))return;e.uniform3uiv(this.addr,t),St(n,t)}}function pg(e,t){let n=this.cache;if(t.x!==void 0){if(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w}else{if(Mt(n,t))return;e.uniform4uiv(this.addr,t),St(n,t)}}function mg(e,t,n){let i=this.cache,s=n.allocateTextureUnit();if(i[0]!==s)e.uniform1i(this.addr,s),i[0]=s;let r;if(this.type===e.SAMPLER_2D_SHADOW)bl.compareFunction=n.isReversedDepthBuffer()?Wr:Vr,r=bl;else r=Qh;n.setTexture2D(t||r,s)}function gg(e,t,n){let i=this.cache,s=n.allocateTextureUnit();if(i[0]!==s)e.uniform1i(this.addr,s),i[0]=s;n.setTexture3D(t||tu,s)}function _g(e,t,n){let i=this.cache,s=n.allocateTextureUnit();if(i[0]!==s)e.uniform1i(this.addr,s),i[0]=s;n.setTextureCube(t||nu,s)}function xg(e,t,n){let i=this.cache,s=n.allocateTextureUnit();if(i[0]!==s)e.uniform1i(this.addr,s),i[0]=s;n.setTexture2DArray(t||eu,s)}function vg(e){switch(e){case 5126:return eg;case 35664:return tg;case 35665:return ng;case 35666:return ig;case 35674:return sg;case 35675:return rg;case 35676:return ag;case 5124:case 35670:return og;case 35667:case 35671:return lg;case 35668:case 35672:return cg;case 35669:case 35673:return hg;case 5125:return ug;case 36294:return dg;case 36295:return fg;case 36296:return pg;case 35678:case 36198:case 36298:case 36306:case 35682:return mg;case 35679:case 36299:case 36307:return gg;case 35680:case 36300:case 36308:case 36293:return _g;case 36289:case 36303:case 36311:case 36292:return xg}}function yg(e,t){e.uniform1fv(this.addr,t)}function Mg(e,t){let n=os(t,this.size,2);e.uniform2fv(this.addr,n)}function Sg(e,t){let n=os(t,this.size,3);e.uniform3fv(this.addr,n)}function bg(e,t){let n=os(t,this.size,4);e.uniform4fv(this.addr,n)}function Tg(e,t){let n=os(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function Ag(e,t){let n=os(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function Eg(e,t){let n=os(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function wg(e,t){e.uniform1iv(this.addr,t)}function Rg(e,t){e.uniform2iv(this.addr,t)}function Cg(e,t){e.uniform3iv(this.addr,t)}function Ig(e,t){e.uniform4iv(this.addr,t)}function Pg(e,t){e.uniform1uiv(this.addr,t)}function Lg(e,t){e.uniform2uiv(this.addr,t)}function Ng(e,t){e.uniform3uiv(this.addr,t)}function Dg(e,t){e.uniform4uiv(this.addr,t)}function Ug(e,t,n){let i=this.cache,s=t.length,r=ga(n,s);if(!Mt(i,r))e.uniform1iv(this.addr,r),St(i,r);let a;if(this.type===e.SAMPLER_2D_SHADOW)a=bl;else a=Qh;for(let o=0;o!==s;++o)n.setTexture2D(t[o]||a,r[o])}function Fg(e,t,n){let i=this.cache,s=t.length,r=ga(n,s);if(!Mt(i,r))e.uniform1iv(this.addr,r),St(i,r);for(let a=0;a!==s;++a)n.setTexture3D(t[a]||tu,r[a])}function Og(e,t,n){let i=this.cache,s=t.length,r=ga(n,s);if(!Mt(i,r))e.uniform1iv(this.addr,r),St(i,r);for(let a=0;a!==s;++a)n.setTextureCube(t[a]||nu,r[a])}function Bg(e,t,n){let i=this.cache,s=t.length,r=ga(n,s);if(!Mt(i,r))e.uniform1iv(this.addr,r),St(i,r);for(let a=0;a!==s;++a)n.setTexture2DArray(t[a]||eu,r[a])}function zg(e){switch(e){case 5126:return yg;case 35664:return Mg;case 35665:return Sg;case 35666:return bg;case 35674:return Tg;case 35675:return Ag;case 35676:return Eg;case 5124:case 35670:return wg;case 35667:case 35671:return Rg;case 35668:case 35672:return Cg;case 35669:case 35673:return Ig;case 5125:return Pg;case 36294:return Lg;case 36295:return Ng;case 36296:return Dg;case 35678:case 36198:case 36298:case 36306:case 35682:return Ug;case 35679:case 36299:case 36307:return Fg;case 35680:case 36300:case 36308:case 36293:return Og;case 36289:case 36303:case 36311:case 36292:return Bg}}class iu{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=vg(t.type)}}class su{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=zg(t.type)}}class ru{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let i=this.seq;for(let s=0,r=i.length;s!==r;++s){let a=i[s];a.setValue(e,t[a.id],n)}}}var Ml=/(\w+)(\])?(\[|\.)?/g;function kh(e,t){e.seq.push(t),e.map[t.id]=t}function kg(e,t,n){let i=e.name,s=i.length;Ml.lastIndex=0;while(!0){let r=Ml.exec(i),a=Ml.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l)o=o|0;if(c===void 0||c==="["&&a+2===s){kh(n,c===void 0?new iu(o,e,t):new su(o,e,t));break}else{let u=n.map[o];if(u===void 0)u=new ru(o),kh(n,u);n=u}}}class Ys{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let a=e.getActiveUniform(t,r),o=e.getUniformLocation(t,a.name);kg(a,o,this)}let i=[],s=[];for(let r of this.seq)if(r.type===e.SAMPLER_2D_SHADOW||r.type===e.SAMPLER_CUBE_SHADOW||r.type===e.SAMPLER_2D_ARRAY_SHADOW)i.push(r);else s.push(r);if(i.length>0)this.seq=i.concat(s)}setValue(e,t,n,i){let s=this.map[t];if(s!==void 0)s.setValue(e,n,i)}setOptional(e,t,n){let i=t[n];if(i!==void 0)this.setValue(e,n,i)}static upload(e,t,n,i){for(let s=0,r=t.length;s!==r;++s){let a=t[s],o=n[a.id];if(o.needsUpdate!==!1)a.setValue(e,o.value,i)}}static seqWithValue(e,t){let n=[];for(let i=0,s=e.length;i!==s;++i){let r=e[i];if(r.id in t)n.push(r)}return n}}function Gh(e,t,n){let i=e.createShader(t);return e.shaderSource(i,n),e.compileShader(i),i}var Gg=37297,Hg=0;function Vg(e,t){let n=e.split(`
`),i=[],s=Math.max(t-6,0),r=Math.min(t+6,n.length);for(let a=s;a<r;a++){let o=a+1;i.push(`${o===t?">":" "} ${o}: ${n[a]}`)}return i.join(`
`)}var Hh=new ze;function Wg(e){We._getMatrix(Hh,We.workingColorSpace,e);let t=`mat3( ${Hh.elements.map((n)=>n.toFixed(4))} )`;switch(We.getTransfer(e)){case qo:return[t,"LinearTransferOETF"];case rt:return[t,"sRGBTransferOETF"];default:return Me("WebGLProgram: Unsupported color space: ",e),[t,"LinearTransferOETF"]}}function Vh(e,t,n){let i=e.getShaderParameter(t,e.COMPILE_STATUS),r=(e.getShaderInfoLog(t)||"").trim();if(i&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return n.toUpperCase()+`

`+r+`

`+Vg(e.getShaderSource(t),o)}else return r}function Xg(e,t){let n=Wg(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,"}"].join(`
`)}var qg={[Qa]:"Linear",[eo]:"Reinhard",[to]:"Cineon",[no]:"ACESFilmic",[so]:"AgX",[Rs]:"Neutral",[io]:"Custom"};function Yg(e,t){let n=qg[t];if(n===void 0)return Me("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+e+"( vec3 color ) { return LinearToneMapping( color ); }";return"vec3 "+e+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}var pa=new D;function Zg(){We.getLuminanceCoefficients(pa);let e=pa.x.toFixed(4),t=pa.y.toFixed(4),n=pa.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${e}, ${t}, ${n} );`,"\treturn dot( weights, rgb );","}"].join(`
`)}function Jg(e){return[e.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",e.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(qs).join(`
`)}function Kg(e){let t=[];for(let n in e){let i=e[n];if(i===!1)continue;t.push("#define "+n+" "+i)}return t.join(`
`)}function $g(e,t){let n={},i=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let r=e.getActiveAttrib(t,s),a=r.name,o=1;if(r.type===e.FLOAT_MAT2)o=2;if(r.type===e.FLOAT_MAT3)o=3;if(r.type===e.FLOAT_MAT4)o=4;n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function qs(e){return e!==""}function Wh(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Xh(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var jg=/^[ \t]*#include +<([\w\d./]+)>/gm;function Tl(e){return e.replace(jg,e0)}var Qg=new Map;function e0(e,t){let n=Ge[t];if(n===void 0){let i=Qg.get(t);if(i!==void 0)n=Ge[i],Me('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw Error("Can not resolve #include <"+t+">")}return Tl(n)}var t0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function qh(e){return e.replace(t0,n0)}function n0(e,t,n,i){let s="";for(let r=parseInt(t);r<parseInt(n);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Yh(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;if(e.precision==="highp")t+=`
#define HIGH_PRECISION`;else if(e.precision==="mediump")t+=`
#define MEDIUM_PRECISION`;else if(e.precision==="lowp")t+=`
#define LOW_PRECISION`;return t}var i0={[As]:"SHADOWMAP_TYPE_PCF",[qi]:"SHADOWMAP_TYPE_VSM"};function s0(e){return i0[e.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var r0={[Zi]:"ENVMAP_TYPE_CUBE",[ci]:"ENVMAP_TYPE_CUBE",[Cs]:"ENVMAP_TYPE_CUBE_UV"};function a0(e){if(e.envMap===!1)return"ENVMAP_TYPE_CUBE";return r0[e.envMapMode]||"ENVMAP_TYPE_CUBE"}var o0={[ci]:"ENVMAP_MODE_REFRACTION"};function l0(e){if(e.envMap===!1)return"ENVMAP_MODE_REFLECTION";return o0[e.envMapMode]||"ENVMAP_MODE_REFLECTION"}var c0={[eh]:"ENVMAP_BLENDING_MULTIPLY",[th]:"ENVMAP_BLENDING_MIX",[nh]:"ENVMAP_BLENDING_ADD"};function h0(e){if(e.envMap===!1)return"ENVMAP_BLENDING_NONE";return c0[e.combine]||"ENVMAP_BLENDING_NONE"}function u0(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,n),112)),texelHeight:i,maxMip:n}}function d0(e,t,n,i){let s=e.getContext(),{defines:r,vertexShader:a,fragmentShader:o}=n,l=s0(n),c=a0(n),h=l0(n),u=h0(n),d=u0(n),m=Jg(n),_=Kg(r),x=s.createProgram(),f,p,A=n.glslVersion?"#version "+n.glslVersion+`
`:"";if(n.isRawShaderMaterial){if(f=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,_].filter(qs).join(`
`),f.length>0)f+=`
`;if(p=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,_].filter(qs).join(`
`),p.length>0)p+=`
`}else f=[Yh(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,_,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+h:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","\tattribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","\tattribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","\tuniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","\tattribute vec2 uv1;","#endif","#ifdef USE_UV2","\tattribute vec2 uv2;","#endif","#ifdef USE_UV3","\tattribute vec2 uv3;","#endif","#ifdef USE_TANGENT","\tattribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","\tattribute vec4 color;","#elif defined( USE_COLOR )","\tattribute vec3 color;","#endif","#ifdef USE_SKINNING","\tattribute vec4 skinIndex;","\tattribute vec4 skinWeight;","#endif",`
`].filter(qs).join(`
`),p=[Yh(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,_,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+c:"",n.envMap?"#define "+h:"",n.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor||n.batchingColor?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==an?"#define TONE_MAPPING":"",n.toneMapping!==an?Ge.tonemapping_pars_fragment:"",n.toneMapping!==an?Yg("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",Ge.colorspace_pars_fragment,Xg("linearToOutputTexel",n.outputColorSpace),Zg(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(qs).join(`
`);if(a=Tl(a),a=Wh(a,n),a=Xh(a,n),o=Tl(o),o=Wh(o,n),o=Xh(o,n),a=qh(a),o=qh(o),n.isRawShaderMaterial!==!0)A=`#version 300 es
`,f=[m,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+f,p=["#define varying in",n.glslVersion===Yo?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===Yo?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p;let b=A+f+a,T=A+p+o,I=Gh(s,s.VERTEX_SHADER,b),E=Gh(s,s.FRAGMENT_SHADER,T);if(s.attachShader(x,I),s.attachShader(x,E),n.index0AttributeName!==void 0)s.bindAttribLocation(x,0,n.index0AttributeName);else if(n.morphTargets===!0)s.bindAttribLocation(x,0,"position");s.linkProgram(x);function P(R){if(e.debug.checkShaderErrors){let k=s.getProgramInfoLog(x)||"",X=s.getShaderInfoLog(I)||"",G=s.getShaderInfoLog(E)||"",K=k.trim(),H=X.trim(),O=G.trim(),Y=!0,ee=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(Y=!1,typeof e.debug.onShaderError==="function")e.debug.onShaderError(s,x,I,E);else{let ie=Vh(s,I,"vertex"),fe=Vh(s,E,"fragment");Ie("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+K+`
`+ie+`
`+fe)}else if(K!=="")Me("WebGLProgram: Program Info Log:",K);else if(H===""||O==="")ee=!1;if(ee)R.diagnostics={runnable:Y,programLog:K,vertexShader:{log:H,prefix:f},fragmentShader:{log:O,prefix:p}}}s.deleteShader(I),s.deleteShader(E),N=new Ys(s,x),y=$g(s,x)}let N;this.getUniforms=function(){if(N===void 0)P(this);return N};let y;this.getAttributes=function(){if(y===void 0)P(this);return y};let S=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){if(S===!1)S=s.getProgramParameter(x,Gg);return S},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Hg++,this.cacheKey=t,this.usedTimes=1,this.program=x,this.vertexShader=I,this.fragmentShader=E,this}var f0=0;class au{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let{vertexShader:t,fragmentShader:n}=e,i=this._getShaderStage(t),s=this._getShaderStage(n),r=this._getShaderCacheForMaterial(e);if(r.has(i)===!1)r.add(i),i.usedTimes++;if(r.has(s)===!1)r.add(s),s.usedTimes++;return this}remove(e){let t=this.materialCache.get(e);for(let n of t)if(n.usedTimes--,n.usedTimes===0)this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);if(n===void 0)n=new Set,t.set(e,n);return n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);if(n===void 0)n=new ou(e),t.set(e,n);return n}}class ou{constructor(e){this.id=f0++,this.code=e,this.usedTimes=0}}function p0(e,t,n,i,s,r,a){let o=new qr,l=new au,c=new Set,h=[],u=new Map,{logarithmicDepthBuffer:d,precision:m}=s,_={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(y){if(c.add(y),y===0)return"uv";return`uv${y}`}function f(y,S,R,k,X){let G=k.fog,K=X.geometry,H=y.isMeshStandardMaterial?k.environment:null,O=(y.isMeshStandardMaterial?n:t).get(y.envMap||H),Y=!!O&&O.mapping===Cs?O.image.height:null,ee=_[y.type];if(y.precision!==null){if(m=s.getMaxPrecision(y.precision),m!==y.precision)Me("WebGLProgram.getParameters:",y.precision,"not supported, using",m,"instead.")}let ie=K.morphAttributes.position||K.morphAttributes.normal||K.morphAttributes.color,fe=ie!==void 0?ie.length:0,Pe=0;if(K.morphAttributes.position!==void 0)Pe=1;if(K.morphAttributes.normal!==void 0)Pe=2;if(K.morphAttributes.color!==void 0)Pe=3;let ht,$e,Z,oe;if(ee){let je=mn[ee];ht=je.vertexShader,$e=je.fragmentShader}else ht=y.vertexShader,$e=y.fragmentShader,l.update(y),Z=l.getVertexShaderID(y),oe=l.getFragmentShaderID(y);let se=e.getRenderTarget(),Te=e.state.buffers.depth.getReversed(),Ee=X.isInstancedMesh===!0,Le=X.isBatchedMesh===!0,ft=!!y.map,Ye=!!y.matcap,Je=!!O,ke=!!y.aoMap,Ce=!!y.lightMap,ut=!!y.bumpMap,w=!!y.normalMap,xt=!!y.displacementMap,Ue=!!y.emissiveMap,it=!!y.metalnessMap,be=!!y.roughnessMap,at=y.anisotropy>0,M=y.clearcoat>0,g=y.dispersion>0,F=y.iridescence>0,q=y.sheen>0,J=y.transmission>0,W=at&&!!y.anisotropyMap,ge=M&&!!y.clearcoatMap,re=M&&!!y.clearcoatNormalMap,Ae=M&&!!y.clearcoatRoughnessMap,Ne=F&&!!y.iridescenceMap,j=F&&!!y.iridescenceThicknessMap,te=q&&!!y.sheenColorMap,_e=q&&!!y.sheenRoughnessMap,ve=!!y.specularMap,ue=!!y.specularColorMap,He=!!y.specularIntensityMap,C=J&&!!y.transmissionMap,ae=J&&!!y.thicknessMap,ne=!!y.gradientMap,pe=!!y.alphaMap,Q=y.alphaTest>0,V=!!y.alphaHash,xe=!!y.extensions,Fe=an;if(y.toneMapped){if(se===null||se.isXRRenderTarget===!0)Fe=e.toneMapping}let ot={shaderID:ee,shaderType:y.type,shaderName:y.name,vertexShader:ht,fragmentShader:$e,defines:y.defines,customVertexShaderID:Z,customFragmentShaderID:oe,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:m,batching:Le,batchingColor:Le&&X._colorsTexture!==null,instancing:Ee,instancingColor:Ee&&X.instanceColor!==null,instancingMorph:Ee&&X.morphTexture!==null,outputColorSpace:se===null?e.outputColorSpace:se.isXRRenderTarget===!0?se.texture.colorSpace:Lt,alphaToCoverage:!!y.alphaToCoverage,map:ft,matcap:Ye,envMap:Je,envMapMode:Je&&O.mapping,envMapCubeUVHeight:Y,aoMap:ke,lightMap:Ce,bumpMap:ut,normalMap:w,displacementMap:xt,emissiveMap:Ue,normalMapObjectSpace:w&&y.normalMapType===uh,normalMapTangentSpace:w&&y.normalMapType===hh,metalnessMap:it,roughnessMap:be,anisotropy:at,anisotropyMap:W,clearcoat:M,clearcoatMap:ge,clearcoatNormalMap:re,clearcoatRoughnessMap:Ae,dispersion:g,iridescence:F,iridescenceMap:Ne,iridescenceThicknessMap:j,sheen:q,sheenColorMap:te,sheenRoughnessMap:_e,specularMap:ve,specularColorMap:ue,specularIntensityMap:He,transmission:J,transmissionMap:C,thicknessMap:ae,gradientMap:ne,opaque:y.transparent===!1&&y.blending===Es&&y.alphaToCoverage===!1,alphaMap:pe,alphaTest:Q,alphaHash:V,combine:y.combine,mapUv:ft&&x(y.map.channel),aoMapUv:ke&&x(y.aoMap.channel),lightMapUv:Ce&&x(y.lightMap.channel),bumpMapUv:ut&&x(y.bumpMap.channel),normalMapUv:w&&x(y.normalMap.channel),displacementMapUv:xt&&x(y.displacementMap.channel),emissiveMapUv:Ue&&x(y.emissiveMap.channel),metalnessMapUv:it&&x(y.metalnessMap.channel),roughnessMapUv:be&&x(y.roughnessMap.channel),anisotropyMapUv:W&&x(y.anisotropyMap.channel),clearcoatMapUv:ge&&x(y.clearcoatMap.channel),clearcoatNormalMapUv:re&&x(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ae&&x(y.clearcoatRoughnessMap.channel),iridescenceMapUv:Ne&&x(y.iridescenceMap.channel),iridescenceThicknessMapUv:j&&x(y.iridescenceThicknessMap.channel),sheenColorMapUv:te&&x(y.sheenColorMap.channel),sheenRoughnessMapUv:_e&&x(y.sheenRoughnessMap.channel),specularMapUv:ve&&x(y.specularMap.channel),specularColorMapUv:ue&&x(y.specularColorMap.channel),specularIntensityMapUv:He&&x(y.specularIntensityMap.channel),transmissionMapUv:C&&x(y.transmissionMap.channel),thicknessMapUv:ae&&x(y.thicknessMap.channel),alphaMapUv:pe&&x(y.alphaMap.channel),vertexTangents:!!K.attributes.tangent&&(w||at),vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!K.attributes.color&&K.attributes.color.itemSize===4,pointsUvs:X.isPoints===!0&&!!K.attributes.uv&&(ft||pe),fog:!!G,useFog:y.fog===!0,fogExp2:!!G&&G.isFogExp2,flatShading:y.flatShading===!0&&y.wireframe===!1,sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:Te,skinning:X.isSkinnedMesh===!0,morphTargets:K.morphAttributes.position!==void 0,morphNormals:K.morphAttributes.normal!==void 0,morphColors:K.morphAttributes.color!==void 0,morphTargetsCount:fe,morphTextureStride:Pe,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:y.dithering,shadowMapEnabled:e.shadowMap.enabled&&R.length>0,shadowMapType:e.shadowMap.type,toneMapping:Fe,decodeVideoTexture:ft&&y.map.isVideoTexture===!0&&We.getTransfer(y.map.colorSpace)===rt,decodeVideoTextureEmissive:Ue&&y.emissiveMap.isVideoTexture===!0&&We.getTransfer(y.emissiveMap.colorSpace)===rt,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===Kt,flipSided:y.side===Pt,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:xe&&y.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(xe&&y.extensions.multiDraw===!0||Le)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return ot.vertexUv1s=c.has(1),ot.vertexUv2s=c.has(2),ot.vertexUv3s=c.has(3),c.clear(),ot}function p(y){let S=[];if(y.shaderID)S.push(y.shaderID);else S.push(y.customVertexShaderID),S.push(y.customFragmentShaderID);if(y.defines!==void 0)for(let R in y.defines)S.push(R),S.push(y.defines[R]);if(y.isRawShaderMaterial===!1)A(S,y),b(S,y),S.push(e.outputColorSpace);return S.push(y.customProgramCacheKey),S.join()}function A(y,S){y.push(S.precision),y.push(S.outputColorSpace),y.push(S.envMapMode),y.push(S.envMapCubeUVHeight),y.push(S.mapUv),y.push(S.alphaMapUv),y.push(S.lightMapUv),y.push(S.aoMapUv),y.push(S.bumpMapUv),y.push(S.normalMapUv),y.push(S.displacementMapUv),y.push(S.emissiveMapUv),y.push(S.metalnessMapUv),y.push(S.roughnessMapUv),y.push(S.anisotropyMapUv),y.push(S.clearcoatMapUv),y.push(S.clearcoatNormalMapUv),y.push(S.clearcoatRoughnessMapUv),y.push(S.iridescenceMapUv),y.push(S.iridescenceThicknessMapUv),y.push(S.sheenColorMapUv),y.push(S.sheenRoughnessMapUv),y.push(S.specularMapUv),y.push(S.specularColorMapUv),y.push(S.specularIntensityMapUv),y.push(S.transmissionMapUv),y.push(S.thicknessMapUv),y.push(S.combine),y.push(S.fogExp2),y.push(S.sizeAttenuation),y.push(S.morphTargetsCount),y.push(S.morphAttributeCount),y.push(S.numDirLights),y.push(S.numPointLights),y.push(S.numSpotLights),y.push(S.numSpotLightMaps),y.push(S.numHemiLights),y.push(S.numRectAreaLights),y.push(S.numDirLightShadows),y.push(S.numPointLightShadows),y.push(S.numSpotLightShadows),y.push(S.numSpotLightShadowsWithMaps),y.push(S.numLightProbes),y.push(S.shadowMapType),y.push(S.toneMapping),y.push(S.numClippingPlanes),y.push(S.numClipIntersection),y.push(S.depthPacking)}function b(y,S){if(o.disableAll(),S.instancing)o.enable(0);if(S.instancingColor)o.enable(1);if(S.instancingMorph)o.enable(2);if(S.matcap)o.enable(3);if(S.envMap)o.enable(4);if(S.normalMapObjectSpace)o.enable(5);if(S.normalMapTangentSpace)o.enable(6);if(S.clearcoat)o.enable(7);if(S.iridescence)o.enable(8);if(S.alphaTest)o.enable(9);if(S.vertexColors)o.enable(10);if(S.vertexAlphas)o.enable(11);if(S.vertexUv1s)o.enable(12);if(S.vertexUv2s)o.enable(13);if(S.vertexUv3s)o.enable(14);if(S.vertexTangents)o.enable(15);if(S.anisotropy)o.enable(16);if(S.alphaHash)o.enable(17);if(S.batching)o.enable(18);if(S.dispersion)o.enable(19);if(S.batchingColor)o.enable(20);if(S.gradientMap)o.enable(21);if(y.push(o.mask),o.disableAll(),S.fog)o.enable(0);if(S.useFog)o.enable(1);if(S.flatShading)o.enable(2);if(S.logarithmicDepthBuffer)o.enable(3);if(S.reversedDepthBuffer)o.enable(4);if(S.skinning)o.enable(5);if(S.morphTargets)o.enable(6);if(S.morphNormals)o.enable(7);if(S.morphColors)o.enable(8);if(S.premultipliedAlpha)o.enable(9);if(S.shadowMapEnabled)o.enable(10);if(S.doubleSided)o.enable(11);if(S.flipSided)o.enable(12);if(S.useDepthPacking)o.enable(13);if(S.dithering)o.enable(14);if(S.transmission)o.enable(15);if(S.sheen)o.enable(16);if(S.opaque)o.enable(17);if(S.pointsUvs)o.enable(18);if(S.decodeVideoTexture)o.enable(19);if(S.decodeVideoTextureEmissive)o.enable(20);if(S.alphaToCoverage)o.enable(21);y.push(o.mask)}function T(y){let S=_[y.type],R;if(S){let k=mn[S];R=Mh.clone(k.uniforms)}else R=y.uniforms;return R}function I(y,S){let R=u.get(S);if(R!==void 0)++R.usedTimes;else R=new d0(e,S,y,r),h.push(R),u.set(S,R);return R}function E(y){if(--y.usedTimes===0){let S=h.indexOf(y);h[S]=h[h.length-1],h.pop(),u.delete(y.cacheKey),y.destroy()}}function P(y){l.remove(y)}function N(){l.dispose()}return{getParameters:f,getProgramCacheKey:p,getUniforms:T,acquireProgram:I,releaseProgram:E,releaseShaderCache:P,programs:h,dispose:N}}function m0(){let e=new WeakMap;function t(a){return e.has(a)}function n(a){let o=e.get(a);if(o===void 0)o={},e.set(a,o);return o}function i(a){e.delete(a)}function s(a,o,l){e.get(a)[o]=l}function r(){e=new WeakMap}return{has:t,get:n,remove:i,update:s,dispose:r}}function g0(e,t){if(e.groupOrder!==t.groupOrder)return e.groupOrder-t.groupOrder;else if(e.renderOrder!==t.renderOrder)return e.renderOrder-t.renderOrder;else if(e.material.id!==t.material.id)return e.material.id-t.material.id;else if(e.z!==t.z)return e.z-t.z;else return e.id-t.id}function Zh(e,t){if(e.groupOrder!==t.groupOrder)return e.groupOrder-t.groupOrder;else if(e.renderOrder!==t.renderOrder)return e.renderOrder-t.renderOrder;else if(e.z!==t.z)return t.z-e.z;else return e.id-t.id}function Jh(){let e=[],t=0,n=[],i=[],s=[];function r(){t=0,n.length=0,i.length=0,s.length=0}function a(u,d,m,_,x,f){let p=e[t];if(p===void 0)p={id:u.id,object:u,geometry:d,material:m,groupOrder:_,renderOrder:u.renderOrder,z:x,group:f},e[t]=p;else p.id=u.id,p.object=u,p.geometry=d,p.material=m,p.groupOrder=_,p.renderOrder=u.renderOrder,p.z=x,p.group=f;return t++,p}function o(u,d,m,_,x,f){let p=a(u,d,m,_,x,f);if(m.transmission>0)i.push(p);else if(m.transparent===!0)s.push(p);else n.push(p)}function l(u,d,m,_,x,f){let p=a(u,d,m,_,x,f);if(m.transmission>0)i.unshift(p);else if(m.transparent===!0)s.unshift(p);else n.unshift(p)}function c(u,d){if(n.length>1)n.sort(u||g0);if(i.length>1)i.sort(d||Zh);if(s.length>1)s.sort(d||Zh)}function h(){for(let u=t,d=e.length;u<d;u++){let m=e[u];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:n,transmissive:i,transparent:s,init:r,push:o,unshift:l,finish:h,sort:c}}function _0(){let e=new WeakMap;function t(i,s){let r=e.get(i),a;if(r===void 0)a=new Jh,e.set(i,[a]);else if(s>=r.length)a=new Jh,r.push(a);else a=r[s];return a}function n(){e=new WeakMap}return{get:t,dispose:n}}function x0(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case"DirectionalLight":n={direction:new D,color:new Se};break;case"SpotLight":n={position:new D,direction:new D,color:new Se,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new D,color:new Se,distance:0,decay:0};break;case"HemisphereLight":n={direction:new D,skyColor:new Se,groundColor:new Se};break;case"RectAreaLight":n={color:new Se,position:new D,halfWidth:new D,halfHeight:new D};break}return e[t.id]=n,n}}}function v0(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe,shadowCameraNear:1,shadowCameraFar:1000};break}return e[t.id]=n,n}}}var y0=0;function M0(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+(t.map?1:0)-(e.map?1:0)}function S0(e){let t=new x0,n=v0(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new D);let s=new D,r=new Be,a=new Be;function o(c){let h=0,u=0,d=0;for(let y=0;y<9;y++)i.probe[y].set(0,0,0);let m=0,_=0,x=0,f=0,p=0,A=0,b=0,T=0,I=0,E=0,P=0;c.sort(M0);for(let y=0,S=c.length;y<S;y++){let R=c[y],{color:k,intensity:X,distance:G}=R,K=null;if(R.shadow&&R.shadow.map)if(R.shadow.map.texture.format===ji)K=R.shadow.map.texture;else K=R.shadow.map.depthTexture||R.shadow.map.texture;if(R.isAmbientLight)h+=k.r*X,u+=k.g*X,d+=k.b*X;else if(R.isLightProbe){for(let H=0;H<9;H++)i.probe[H].addScaledVector(R.sh.coefficients[H],X);P++}else if(R.isDirectionalLight){let H=t.get(R);if(H.color.copy(R.color).multiplyScalar(R.intensity),R.castShadow){let O=R.shadow,Y=n.get(R);Y.shadowIntensity=O.intensity,Y.shadowBias=O.bias,Y.shadowNormalBias=O.normalBias,Y.shadowRadius=O.radius,Y.shadowMapSize=O.mapSize,i.directionalShadow[m]=Y,i.directionalShadowMap[m]=K,i.directionalShadowMatrix[m]=R.shadow.matrix,A++}i.directional[m]=H,m++}else if(R.isSpotLight){let H=t.get(R);H.position.setFromMatrixPosition(R.matrixWorld),H.color.copy(k).multiplyScalar(X),H.distance=G,H.coneCos=Math.cos(R.angle),H.penumbraCos=Math.cos(R.angle*(1-R.penumbra)),H.decay=R.decay,i.spot[x]=H;let O=R.shadow;if(R.map){if(i.spotLightMap[I]=R.map,I++,O.updateMatrices(R),R.castShadow)E++}if(i.spotLightMatrix[x]=O.matrix,R.castShadow){let Y=n.get(R);Y.shadowIntensity=O.intensity,Y.shadowBias=O.bias,Y.shadowNormalBias=O.normalBias,Y.shadowRadius=O.radius,Y.shadowMapSize=O.mapSize,i.spotShadow[x]=Y,i.spotShadowMap[x]=K,T++}x++}else if(R.isRectAreaLight){let H=t.get(R);H.color.copy(k).multiplyScalar(X),H.halfWidth.set(R.width*0.5,0,0),H.halfHeight.set(0,R.height*0.5,0),i.rectArea[f]=H,f++}else if(R.isPointLight){let H=t.get(R);if(H.color.copy(R.color).multiplyScalar(R.intensity),H.distance=R.distance,H.decay=R.decay,R.castShadow){let O=R.shadow,Y=n.get(R);Y.shadowIntensity=O.intensity,Y.shadowBias=O.bias,Y.shadowNormalBias=O.normalBias,Y.shadowRadius=O.radius,Y.shadowMapSize=O.mapSize,Y.shadowCameraNear=O.camera.near,Y.shadowCameraFar=O.camera.far,i.pointShadow[_]=Y,i.pointShadowMap[_]=K,i.pointShadowMatrix[_]=R.shadow.matrix,b++}i.point[_]=H,_++}else if(R.isHemisphereLight){let H=t.get(R);H.skyColor.copy(R.color).multiplyScalar(X),H.groundColor.copy(R.groundColor).multiplyScalar(X),i.hemi[p]=H,p++}}if(f>0)if(e.has("OES_texture_float_linear")===!0)i.rectAreaLTC1=ce.LTC_FLOAT_1,i.rectAreaLTC2=ce.LTC_FLOAT_2;else i.rectAreaLTC1=ce.LTC_HALF_1,i.rectAreaLTC2=ce.LTC_HALF_2;i.ambient[0]=h,i.ambient[1]=u,i.ambient[2]=d;let N=i.hash;if(N.directionalLength!==m||N.pointLength!==_||N.spotLength!==x||N.rectAreaLength!==f||N.hemiLength!==p||N.numDirectionalShadows!==A||N.numPointShadows!==b||N.numSpotShadows!==T||N.numSpotMaps!==I||N.numLightProbes!==P)i.directional.length=m,i.spot.length=x,i.rectArea.length=f,i.point.length=_,i.hemi.length=p,i.directionalShadow.length=A,i.directionalShadowMap.length=A,i.pointShadow.length=b,i.pointShadowMap.length=b,i.spotShadow.length=T,i.spotShadowMap.length=T,i.directionalShadowMatrix.length=A,i.pointShadowMatrix.length=b,i.spotLightMatrix.length=T+I-E,i.spotLightMap.length=I,i.numSpotLightShadowsWithMaps=E,i.numLightProbes=P,N.directionalLength=m,N.pointLength=_,N.spotLength=x,N.rectAreaLength=f,N.hemiLength=p,N.numDirectionalShadows=A,N.numPointShadows=b,N.numSpotShadows=T,N.numSpotMaps=I,N.numLightProbes=P,i.version=y0++}function l(c,h){let u=0,d=0,m=0,_=0,x=0,f=h.matrixWorldInverse;for(let p=0,A=c.length;p<A;p++){let b=c[p];if(b.isDirectionalLight){let T=i.directional[u];T.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(f),u++}else if(b.isSpotLight){let T=i.spot[m];T.position.setFromMatrixPosition(b.matrixWorld),T.position.applyMatrix4(f),T.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(f),m++}else if(b.isRectAreaLight){let T=i.rectArea[_];T.position.setFromMatrixPosition(b.matrixWorld),T.position.applyMatrix4(f),a.identity(),r.copy(b.matrixWorld),r.premultiply(f),a.extractRotation(r),T.halfWidth.set(b.width*0.5,0,0),T.halfHeight.set(0,b.height*0.5,0),T.halfWidth.applyMatrix4(a),T.halfHeight.applyMatrix4(a),_++}else if(b.isPointLight){let T=i.point[d];T.position.setFromMatrixPosition(b.matrixWorld),T.position.applyMatrix4(f),d++}else if(b.isHemisphereLight){let T=i.hemi[x];T.direction.setFromMatrixPosition(b.matrixWorld),T.direction.transformDirection(f),x++}}}return{setup:o,setupView:l,state:i}}function Kh(e){let t=new S0(e),n=[],i=[];function s(h){c.camera=h,n.length=0,i.length=0}function r(h){n.push(h)}function a(h){i.push(h)}function o(){t.setup(n)}function l(h){t.setupView(n,h)}let c={lightsArray:n,shadowsArray:i,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function b0(e){let t=new WeakMap;function n(s,r=0){let a=t.get(s),o;if(a===void 0)o=new Kh(e),t.set(s,[o]);else if(r>=a.length)o=new Kh(e),a.push(o);else o=a[r];return o}function i(){t=new WeakMap}return{get:n,dispose:i}}var T0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,A0=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,E0=[new D(1,0,0),new D(-1,0,0),new D(0,1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1)],w0=[new D(0,-1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1),new D(0,-1,0),new D(0,-1,0)],$h=new Be,Xs=new D,Sl=new D;function R0(e,t,n){let i=new Bs,s=new Oe,r=new Oe,a=new ct,o=new rl,l=new al,c={},h=n.maxTextureSize,u={[Wn]:Pt,[Pt]:Wn,[Kt]:Kt},d=new jt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Oe},radius:{value:4}},vertexShader:T0,fragmentShader:A0}),m=d.clone();m.defines.HORIZONTAL_PASS=1;let _=new wt;_.setAttribute("position",new yt(new Float32Array([-1,-1,0.5,3,-1,0.5,-1,3,0.5]),3));let x=new dt(_,d),f=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=As;let p=this.type;this.render=function(E,P,N){if(f.enabled===!1)return;if(f.autoUpdate===!1&&f.needsUpdate===!1)return;if(E.length===0)return;if(E.type===Nc)Me("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),E.type=As;let y=e.getRenderTarget(),S=e.getActiveCubeFace(),R=e.getActiveMipmapLevel(),k=e.state;if(k.setBlending(In),k.buffers.depth.getReversed()===!0)k.buffers.color.setClear(0,0,0,0);else k.buffers.color.setClear(1,1,1,1);k.buffers.depth.setTest(!0),k.setScissorTest(!1);let X=p!==this.type;if(X)P.traverse(function(G){if(G.material)if(Array.isArray(G.material))G.material.forEach((K)=>K.needsUpdate=!0);else G.material.needsUpdate=!0});for(let G=0,K=E.length;G<K;G++){let H=E[G],O=H.shadow;if(O===void 0){Me("WebGLShadowMap:",H,"has no shadow.");continue}if(O.autoUpdate===!1&&O.needsUpdate===!1)continue;s.copy(O.mapSize);let Y=O.getFrameExtents();if(s.multiply(Y),r.copy(O.mapSize),s.x>h||s.y>h){if(s.x>h)r.x=Math.floor(h/Y.x),s.x=r.x*Y.x,O.mapSize.x=r.x;if(s.y>h)r.y=Math.floor(h/Y.y),s.y=r.y*Y.y,O.mapSize.y=r.y}if(O.map===null||X===!0){if(O.map!==null){if(O.map.depthTexture!==null)O.map.depthTexture.dispose(),O.map.depthTexture=null;O.map.dispose()}if(this.type===qi){if(H.isPointLight){Me("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}O.map=new $t(s.x,s.y,{format:ji,type:Nn,minFilter:Tt,magFilter:Tt,generateMipmaps:!1}),O.map.texture.name=H.name+".shadowMap",O.map.depthTexture=new mi(s.x,s.y,Ln),O.map.depthTexture.name=H.name+".shadowMapDepth",O.map.depthTexture.format=ui,O.map.depthTexture.compareFunction=null,O.map.depthTexture.minFilter=on,O.map.depthTexture.magFilter=on}else{if(H.isPointLight)O.map=new $r(s.x),O.map.depthTexture=new il(s.x,qn);else O.map=new $t(s.x,s.y),O.map.depthTexture=new mi(s.x,s.y,qn);O.map.depthTexture.name=H.name+".shadowMap",O.map.depthTexture.format=ui;let ie=e.state.buffers.depth.getReversed();if(this.type===As)O.map.depthTexture.compareFunction=ie?Wr:Vr,O.map.depthTexture.minFilter=Tt,O.map.depthTexture.magFilter=Tt;else O.map.depthTexture.compareFunction=null,O.map.depthTexture.minFilter=on,O.map.depthTexture.magFilter=on}O.camera.updateProjectionMatrix()}let ee=O.map.isWebGLCubeRenderTarget?6:1;for(let ie=0;ie<ee;ie++){if(O.map.isWebGLCubeRenderTarget)e.setRenderTarget(O.map,ie),e.clear();else{if(ie===0)e.setRenderTarget(O.map),e.clear();let fe=O.getViewport(ie);a.set(r.x*fe.x,r.y*fe.y,r.x*fe.z,r.y*fe.w),k.viewport(a)}if(H.isPointLight){let{camera:fe,matrix:Pe}=O,ht=H.distance||fe.far;if(ht!==fe.far)fe.far=ht,fe.updateProjectionMatrix();Xs.setFromMatrixPosition(H.matrixWorld),fe.position.copy(Xs),Sl.copy(fe.position),Sl.add(E0[ie]),fe.up.copy(w0[ie]),fe.lookAt(Sl),fe.updateMatrixWorld(),Pe.makeTranslation(-Xs.x,-Xs.y,-Xs.z),$h.multiplyMatrices(fe.projectionMatrix,fe.matrixWorldInverse),O._frustum.setFromProjectionMatrix($h,fe.coordinateSystem,fe.reversedDepth)}else O.updateMatrices(H);i=O.getFrustum(),T(P,N,O.camera,H,this.type)}if(O.isPointLightShadow!==!0&&this.type===qi)A(O,N);O.needsUpdate=!1}p=this.type,f.needsUpdate=!1,e.setRenderTarget(y,S,R)};function A(E,P){let N=t.update(x);if(d.defines.VSM_SAMPLES!==E.blurSamples)d.defines.VSM_SAMPLES=E.blurSamples,m.defines.VSM_SAMPLES=E.blurSamples,d.needsUpdate=!0,m.needsUpdate=!0;if(E.mapPass===null)E.mapPass=new $t(s.x,s.y,{format:ji,type:Nn});d.uniforms.shadow_pass.value=E.map.depthTexture,d.uniforms.resolution.value=E.mapSize,d.uniforms.radius.value=E.radius,e.setRenderTarget(E.mapPass),e.clear(),e.renderBufferDirect(P,null,N,d,x,null),m.uniforms.shadow_pass.value=E.mapPass.texture,m.uniforms.resolution.value=E.mapSize,m.uniforms.radius.value=E.radius,e.setRenderTarget(E.map),e.clear(),e.renderBufferDirect(P,null,N,m,x,null)}function b(E,P,N,y){let S=null,R=N.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(R!==void 0)S=R;else if(S=N.isPointLight===!0?l:o,e.localClippingEnabled&&P.clipShadows===!0&&Array.isArray(P.clippingPlanes)&&P.clippingPlanes.length!==0||P.displacementMap&&P.displacementScale!==0||P.alphaMap&&P.alphaTest>0||P.map&&P.alphaTest>0||P.alphaToCoverage===!0){let k=S.uuid,X=P.uuid,G=c[k];if(G===void 0)G={},c[k]=G;let K=G[X];if(K===void 0)K=S.clone(),G[X]=K,P.addEventListener("dispose",I);S=K}if(S.visible=P.visible,S.wireframe=P.wireframe,y===qi)S.side=P.shadowSide!==null?P.shadowSide:P.side;else S.side=P.shadowSide!==null?P.shadowSide:u[P.side];if(S.alphaMap=P.alphaMap,S.alphaTest=P.alphaToCoverage===!0?0.5:P.alphaTest,S.map=P.map,S.clipShadows=P.clipShadows,S.clippingPlanes=P.clippingPlanes,S.clipIntersection=P.clipIntersection,S.displacementMap=P.displacementMap,S.displacementScale=P.displacementScale,S.displacementBias=P.displacementBias,S.wireframeLinewidth=P.wireframeLinewidth,S.linewidth=P.linewidth,N.isPointLight===!0&&S.isMeshDistanceMaterial===!0){let k=e.properties.get(S);k.light=N}return S}function T(E,P,N,y,S){if(E.visible===!1)return;if(E.layers.test(P.layers)&&(E.isMesh||E.isLine||E.isPoints)){if((E.castShadow||E.receiveShadow&&S===qi)&&(!E.frustumCulled||i.intersectsObject(E))){E.modelViewMatrix.multiplyMatrices(N.matrixWorldInverse,E.matrixWorld);let X=t.update(E),G=E.material;if(Array.isArray(G)){let K=X.groups;for(let H=0,O=K.length;H<O;H++){let Y=K[H],ee=G[Y.materialIndex];if(ee&&ee.visible){let ie=b(E,ee,y,S);E.onBeforeShadow(e,E,P,N,X,ie,Y),e.renderBufferDirect(N,null,X,ie,E,Y),E.onAfterShadow(e,E,P,N,X,ie,Y)}}}else if(G.visible){let K=b(E,G,y,S);E.onBeforeShadow(e,E,P,N,X,K,null),e.renderBufferDirect(N,null,X,K,E,null),E.onAfterShadow(e,E,P,N,X,K,null)}}}let k=E.children;for(let X=0,G=k.length;X<G;X++)T(k[X],P,N,y,S)}function I(E){E.target.removeEventListener("dispose",I);for(let N in c){let y=c[N],S=E.target.uuid;if(S in y)y[S].dispose(),delete y[S]}}}var C0={[wr]:Rr,[Cr]:Lr,[Ir]:Nr,[ws]:Pr,[Rr]:wr,[Lr]:Cr,[Nr]:Ir,[Pr]:ws};function I0(e,t){function n(){let C=!1,ae=new ct,ne=null,pe=new ct(0,0,0,0);return{setMask:function(Q){if(ne!==Q&&!C)e.colorMask(Q,Q,Q,Q),ne=Q},setLocked:function(Q){C=Q},setClear:function(Q,V,xe,Fe,ot){if(ot===!0)Q*=Fe,V*=Fe,xe*=Fe;if(ae.set(Q,V,xe,Fe),pe.equals(ae)===!1)e.clearColor(Q,V,xe,Fe),pe.copy(ae)},reset:function(){C=!1,ne=null,pe.set(-1,0,0,0)}}}function i(){let C=!1,ae=!1,ne=null,pe=null,Q=null;return{setReversed:function(V){if(ae!==V){let xe=t.get("EXT_clip_control");if(V)xe.clipControlEXT(xe.LOWER_LEFT_EXT,xe.ZERO_TO_ONE_EXT);else xe.clipControlEXT(xe.LOWER_LEFT_EXT,xe.NEGATIVE_ONE_TO_ONE_EXT);ae=V;let Fe=Q;Q=null,this.setClear(Fe)}},getReversed:function(){return ae},setTest:function(V){if(V)se(e.DEPTH_TEST);else Te(e.DEPTH_TEST)},setMask:function(V){if(ne!==V&&!C)e.depthMask(V),ne=V},setFunc:function(V){if(ae)V=C0[V];if(pe!==V){switch(V){case wr:e.depthFunc(e.NEVER);break;case Rr:e.depthFunc(e.ALWAYS);break;case Cr:e.depthFunc(e.LESS);break;case ws:e.depthFunc(e.LEQUAL);break;case Ir:e.depthFunc(e.EQUAL);break;case Pr:e.depthFunc(e.GEQUAL);break;case Lr:e.depthFunc(e.GREATER);break;case Nr:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}pe=V}},setLocked:function(V){C=V},setClear:function(V){if(Q!==V){if(ae)V=1-V;e.clearDepth(V),Q=V}},reset:function(){C=!1,ne=null,pe=null,Q=null,ae=!1}}}function s(){let C=!1,ae=null,ne=null,pe=null,Q=null,V=null,xe=null,Fe=null,ot=null;return{setTest:function(je){if(!C)if(je)se(e.STENCIL_TEST);else Te(e.STENCIL_TEST)},setMask:function(je){if(ae!==je&&!C)e.stencilMask(je),ae=je},setFunc:function(je,xn,vn){if(ne!==je||pe!==xn||Q!==vn)e.stencilFunc(je,xn,vn),ne=je,pe=xn,Q=vn},setOp:function(je,xn,vn){if(V!==je||xe!==xn||Fe!==vn)e.stencilOp(je,xn,vn),V=je,xe=xn,Fe=vn},setLocked:function(je){C=je},setClear:function(je){if(ot!==je)e.clearStencil(je),ot=je},reset:function(){C=!1,ae=null,ne=null,pe=null,Q=null,V=null,xe=null,Fe=null,ot=null}}}let r=new n,a=new i,o=new s,l=new WeakMap,c=new WeakMap,h={},u={},d=new WeakMap,m=[],_=null,x=!1,f=null,p=null,A=null,b=null,T=null,I=null,E=null,P=new Se(0,0,0),N=0,y=!1,S=null,R=null,k=null,X=null,G=null,K=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),H=!1,O=0,Y=e.getParameter(e.VERSION);if(Y.indexOf("WebGL")!==-1)O=parseFloat(/^WebGL (\d)/.exec(Y)[1]),H=O>=1;else if(Y.indexOf("OpenGL ES")!==-1)O=parseFloat(/^OpenGL ES (\d)/.exec(Y)[1]),H=O>=2;let ee=null,ie={},fe=e.getParameter(e.SCISSOR_BOX),Pe=e.getParameter(e.VIEWPORT),ht=new ct().fromArray(fe),$e=new ct().fromArray(Pe);function Z(C,ae,ne,pe){let Q=new Uint8Array(4),V=e.createTexture();e.bindTexture(C,V),e.texParameteri(C,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(C,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let xe=0;xe<ne;xe++)if(C===e.TEXTURE_3D||C===e.TEXTURE_2D_ARRAY)e.texImage3D(ae,0,e.RGBA,1,1,pe,0,e.RGBA,e.UNSIGNED_BYTE,Q);else e.texImage2D(ae+xe,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,Q);return V}let oe={};oe[e.TEXTURE_2D]=Z(e.TEXTURE_2D,e.TEXTURE_2D,1),oe[e.TEXTURE_CUBE_MAP]=Z(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),oe[e.TEXTURE_2D_ARRAY]=Z(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),oe[e.TEXTURE_3D]=Z(e.TEXTURE_3D,e.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),se(e.DEPTH_TEST),a.setFunc(ws),ut(!1),w(Ja),se(e.CULL_FACE),ke(In);function se(C){if(h[C]!==!0)e.enable(C),h[C]=!0}function Te(C){if(h[C]!==!1)e.disable(C),h[C]=!1}function Ee(C,ae){if(u[C]!==ae){if(e.bindFramebuffer(C,ae),u[C]=ae,C===e.DRAW_FRAMEBUFFER)u[e.FRAMEBUFFER]=ae;if(C===e.FRAMEBUFFER)u[e.DRAW_FRAMEBUFFER]=ae;return!0}return!1}function Le(C,ae){let ne=m,pe=!1;if(C){if(ne=d.get(ae),ne===void 0)ne=[],d.set(ae,ne);let Q=C.textures;if(ne.length!==Q.length||ne[0]!==e.COLOR_ATTACHMENT0){for(let V=0,xe=Q.length;V<xe;V++)ne[V]=e.COLOR_ATTACHMENT0+V;ne.length=Q.length,pe=!0}}else if(ne[0]!==e.BACK)ne[0]=e.BACK,pe=!0;if(pe)e.drawBuffers(ne)}function ft(C){if(_!==C)return e.useProgram(C),_=C,!0;return!1}let Ye={[Yi]:e.FUNC_ADD,[Uc]:e.FUNC_SUBTRACT,[Fc]:e.FUNC_REVERSE_SUBTRACT};Ye[Oc]=e.MIN,Ye[Bc]=e.MAX;let Je={[zc]:e.ZERO,[kc]:e.ONE,[Gc]:e.SRC_COLOR,[Vc]:e.SRC_ALPHA,[Jc]:e.SRC_ALPHA_SATURATE,[Yc]:e.DST_COLOR,[Xc]:e.DST_ALPHA,[Hc]:e.ONE_MINUS_SRC_COLOR,[Wc]:e.ONE_MINUS_SRC_ALPHA,[Zc]:e.ONE_MINUS_DST_COLOR,[qc]:e.ONE_MINUS_DST_ALPHA,[Kc]:e.CONSTANT_COLOR,[$c]:e.ONE_MINUS_CONSTANT_COLOR,[jc]:e.CONSTANT_ALPHA,[Qc]:e.ONE_MINUS_CONSTANT_ALPHA};function ke(C,ae,ne,pe,Q,V,xe,Fe,ot,je){if(C===In){if(x===!0)Te(e.BLEND),x=!1;return}if(x===!1)se(e.BLEND),x=!0;if(C!==Dc){if(C!==f||je!==y){if(p!==Yi||T!==Yi)e.blendEquation(e.FUNC_ADD),p=Yi,T=Yi;if(je)switch(C){case Es:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case Ka:e.blendFunc(e.ONE,e.ONE);break;case $a:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case ja:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:Ie("WebGLState: Invalid blending: ",C);break}else switch(C){case Es:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case Ka:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case $a:Ie("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case ja:Ie("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ie("WebGLState: Invalid blending: ",C);break}A=null,b=null,I=null,E=null,P.set(0,0,0),N=0,f=C,y=je}return}if(Q=Q||ae,V=V||ne,xe=xe||pe,ae!==p||Q!==T)e.blendEquationSeparate(Ye[ae],Ye[Q]),p=ae,T=Q;if(ne!==A||pe!==b||V!==I||xe!==E)e.blendFuncSeparate(Je[ne],Je[pe],Je[V],Je[xe]),A=ne,b=pe,I=V,E=xe;if(Fe.equals(P)===!1||ot!==N)e.blendColor(Fe.r,Fe.g,Fe.b,ot),P.copy(Fe),N=ot;f=C,y=!1}function Ce(C,ae){C.side===Kt?Te(e.CULL_FACE):se(e.CULL_FACE);let ne=C.side===Pt;if(ae)ne=!ne;ut(ne),C.blending===Es&&C.transparent===!1?ke(In):ke(C.blending,C.blendEquation,C.blendSrc,C.blendDst,C.blendEquationAlpha,C.blendSrcAlpha,C.blendDstAlpha,C.blendColor,C.blendAlpha,C.premultipliedAlpha),a.setFunc(C.depthFunc),a.setTest(C.depthTest),a.setMask(C.depthWrite),r.setMask(C.colorWrite);let pe=C.stencilWrite;if(o.setTest(pe),pe)o.setMask(C.stencilWriteMask),o.setFunc(C.stencilFunc,C.stencilRef,C.stencilFuncMask),o.setOp(C.stencilFail,C.stencilZFail,C.stencilZPass);Ue(C.polygonOffset,C.polygonOffsetFactor,C.polygonOffsetUnits),C.alphaToCoverage===!0?se(e.SAMPLE_ALPHA_TO_COVERAGE):Te(e.SAMPLE_ALPHA_TO_COVERAGE)}function ut(C){if(S!==C){if(C)e.frontFace(e.CW);else e.frontFace(e.CCW);S=C}}function w(C){if(C!==Pc){if(se(e.CULL_FACE),C!==R)if(C===Ja)e.cullFace(e.BACK);else if(C===Lc)e.cullFace(e.FRONT);else e.cullFace(e.FRONT_AND_BACK)}else Te(e.CULL_FACE);R=C}function xt(C){if(C!==k){if(H)e.lineWidth(C);k=C}}function Ue(C,ae,ne){if(C){if(se(e.POLYGON_OFFSET_FILL),X!==ae||G!==ne)e.polygonOffset(ae,ne),X=ae,G=ne}else Te(e.POLYGON_OFFSET_FILL)}function it(C){if(C)se(e.SCISSOR_TEST);else Te(e.SCISSOR_TEST)}function be(C){if(C===void 0)C=e.TEXTURE0+K-1;if(ee!==C)e.activeTexture(C),ee=C}function at(C,ae,ne){if(ne===void 0)if(ee===null)ne=e.TEXTURE0+K-1;else ne=ee;let pe=ie[ne];if(pe===void 0)pe={type:void 0,texture:void 0},ie[ne]=pe;if(pe.type!==C||pe.texture!==ae){if(ee!==ne)e.activeTexture(ne),ee=ne;e.bindTexture(C,ae||oe[C]),pe.type=C,pe.texture=ae}}function M(){let C=ie[ee];if(C!==void 0&&C.type!==void 0)e.bindTexture(C.type,null),C.type=void 0,C.texture=void 0}function g(){try{e.compressedTexImage2D(...arguments)}catch(C){Ie("WebGLState:",C)}}function F(){try{e.compressedTexImage3D(...arguments)}catch(C){Ie("WebGLState:",C)}}function q(){try{e.texSubImage2D(...arguments)}catch(C){Ie("WebGLState:",C)}}function J(){try{e.texSubImage3D(...arguments)}catch(C){Ie("WebGLState:",C)}}function W(){try{e.compressedTexSubImage2D(...arguments)}catch(C){Ie("WebGLState:",C)}}function ge(){try{e.compressedTexSubImage3D(...arguments)}catch(C){Ie("WebGLState:",C)}}function re(){try{e.texStorage2D(...arguments)}catch(C){Ie("WebGLState:",C)}}function Ae(){try{e.texStorage3D(...arguments)}catch(C){Ie("WebGLState:",C)}}function Ne(){try{e.texImage2D(...arguments)}catch(C){Ie("WebGLState:",C)}}function j(){try{e.texImage3D(...arguments)}catch(C){Ie("WebGLState:",C)}}function te(C){if(ht.equals(C)===!1)e.scissor(C.x,C.y,C.z,C.w),ht.copy(C)}function _e(C){if($e.equals(C)===!1)e.viewport(C.x,C.y,C.z,C.w),$e.copy(C)}function ve(C,ae){let ne=c.get(ae);if(ne===void 0)ne=new WeakMap,c.set(ae,ne);let pe=ne.get(C);if(pe===void 0)pe=e.getUniformBlockIndex(ae,C.name),ne.set(C,pe)}function ue(C,ae){let pe=c.get(ae).get(C);if(l.get(ae)!==pe)e.uniformBlockBinding(ae,pe,C.__bindingPointIndex),l.set(ae,pe)}function He(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),a.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),h={},ee=null,ie={},u={},d=new WeakMap,m=[],_=null,x=!1,f=null,p=null,A=null,b=null,T=null,I=null,E=null,P=new Se(0,0,0),N=0,y=!1,S=null,R=null,k=null,X=null,G=null,ht.set(0,0,e.canvas.width,e.canvas.height),$e.set(0,0,e.canvas.width,e.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:se,disable:Te,bindFramebuffer:Ee,drawBuffers:Le,useProgram:ft,setBlending:ke,setMaterial:Ce,setFlipSided:ut,setCullFace:w,setLineWidth:xt,setPolygonOffset:Ue,setScissorTest:it,activeTexture:be,bindTexture:at,unbindTexture:M,compressedTexImage2D:g,compressedTexImage3D:F,texImage2D:Ne,texImage3D:j,updateUBOMapping:ve,uniformBlockBinding:ue,texStorage2D:re,texStorage3D:Ae,texSubImage2D:q,texSubImage3D:J,compressedTexSubImage2D:W,compressedTexSubImage3D:ge,scissor:te,viewport:_e,reset:He}}function P0(e,t,n,i,s,r,a){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Oe,h=new WeakMap,u,d=new WeakMap,m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch(M){}function _(M,g){return m?new OffscreenCanvas(M,g):Vi("canvas")}function x(M,g,F){let q=1,J=at(M);if(J.width>F||J.height>F)q=F/Math.max(J.width,J.height);if(q<1)if(typeof HTMLImageElement<"u"&&M instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&M instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&M instanceof ImageBitmap||typeof VideoFrame<"u"&&M instanceof VideoFrame){let W=Math.floor(q*J.width),ge=Math.floor(q*J.height);if(u===void 0)u=_(W,ge);let re=g?_(W,ge):u;return re.width=W,re.height=ge,re.getContext("2d").drawImage(M,0,0,W,ge),Me("WebGLRenderer: Texture has been resized from ("+J.width+"x"+J.height+") to ("+W+"x"+ge+")."),re}else{if("data"in M)Me("WebGLRenderer: Image in DataTexture is too big ("+J.width+"x"+J.height+").");return M}return M}function f(M){return M.generateMipmaps}function p(M){e.generateMipmap(M)}function A(M){if(M.isWebGLCubeRenderTarget)return e.TEXTURE_CUBE_MAP;if(M.isWebGL3DRenderTarget)return e.TEXTURE_3D;if(M.isWebGLArrayRenderTarget||M.isCompressedArrayTexture)return e.TEXTURE_2D_ARRAY;return e.TEXTURE_2D}function b(M,g,F,q,J=!1){if(M!==null){if(e[M]!==void 0)return e[M];Me("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+M+"'")}let W=g;if(g===e.RED){if(F===e.FLOAT)W=e.R32F;if(F===e.HALF_FLOAT)W=e.R16F;if(F===e.UNSIGNED_BYTE)W=e.R8}if(g===e.RED_INTEGER){if(F===e.UNSIGNED_BYTE)W=e.R8UI;if(F===e.UNSIGNED_SHORT)W=e.R16UI;if(F===e.UNSIGNED_INT)W=e.R32UI;if(F===e.BYTE)W=e.R8I;if(F===e.SHORT)W=e.R16I;if(F===e.INT)W=e.R32I}if(g===e.RG){if(F===e.FLOAT)W=e.RG32F;if(F===e.HALF_FLOAT)W=e.RG16F;if(F===e.UNSIGNED_BYTE)W=e.RG8}if(g===e.RG_INTEGER){if(F===e.UNSIGNED_BYTE)W=e.RG8UI;if(F===e.UNSIGNED_SHORT)W=e.RG16UI;if(F===e.UNSIGNED_INT)W=e.RG32UI;if(F===e.BYTE)W=e.RG8I;if(F===e.SHORT)W=e.RG16I;if(F===e.INT)W=e.RG32I}if(g===e.RGB_INTEGER){if(F===e.UNSIGNED_BYTE)W=e.RGB8UI;if(F===e.UNSIGNED_SHORT)W=e.RGB16UI;if(F===e.UNSIGNED_INT)W=e.RGB32UI;if(F===e.BYTE)W=e.RGB8I;if(F===e.SHORT)W=e.RGB16I;if(F===e.INT)W=e.RGB32I}if(g===e.RGBA_INTEGER){if(F===e.UNSIGNED_BYTE)W=e.RGBA8UI;if(F===e.UNSIGNED_SHORT)W=e.RGBA16UI;if(F===e.UNSIGNED_INT)W=e.RGBA32UI;if(F===e.BYTE)W=e.RGBA8I;if(F===e.SHORT)W=e.RGBA16I;if(F===e.INT)W=e.RGBA32I}if(g===e.RGB){if(F===e.UNSIGNED_INT_5_9_9_9_REV)W=e.RGB9_E5;if(F===e.UNSIGNED_INT_10F_11F_11F_REV)W=e.R11F_G11F_B10F}if(g===e.RGBA){let ge=J?qo:We.getTransfer(q);if(F===e.FLOAT)W=e.RGBA32F;if(F===e.HALF_FLOAT)W=e.RGBA16F;if(F===e.UNSIGNED_BYTE)W=ge===rt?e.SRGB8_ALPHA8:e.RGBA8;if(F===e.UNSIGNED_SHORT_4_4_4_4)W=e.RGBA4;if(F===e.UNSIGNED_SHORT_5_5_5_1)W=e.RGB5_A1}if(W===e.R16F||W===e.R32F||W===e.RG16F||W===e.RG32F||W===e.RGBA16F||W===e.RGBA32F)t.get("EXT_color_buffer_float");return W}function T(M,g){let F;if(M){if(g===null||g===qn||g===$i)F=e.DEPTH24_STENCIL8;else if(g===Ln)F=e.DEPTH32F_STENCIL8;else if(g===Is)F=e.DEPTH24_STENCIL8,Me("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")}else if(g===null||g===qn||g===$i)F=e.DEPTH_COMPONENT24;else if(g===Ln)F=e.DEPTH_COMPONENT32F;else if(g===Is)F=e.DEPTH_COMPONENT16;return F}function I(M,g){if(f(M)===!0||M.isFramebufferTexture&&M.minFilter!==on&&M.minFilter!==Tt)return Math.log2(Math.max(g.width,g.height))+1;else if(M.mipmaps!==void 0&&M.mipmaps.length>0)return M.mipmaps.length;else if(M.isCompressedTexture&&Array.isArray(M.image))return g.mipmaps.length;else return 1}function E(M){let g=M.target;if(g.removeEventListener("dispose",E),N(g),g.isVideoTexture)h.delete(g)}function P(M){let g=M.target;g.removeEventListener("dispose",P),S(g)}function N(M){let g=i.get(M);if(g.__webglInit===void 0)return;let F=M.source,q=d.get(F);if(q){let J=q[g.__cacheKey];if(J.usedTimes--,J.usedTimes===0)y(M);if(Object.keys(q).length===0)d.delete(F)}i.remove(M)}function y(M){let g=i.get(M);e.deleteTexture(g.__webglTexture);let F=M.source,q=d.get(F);delete q[g.__cacheKey],a.memory.textures--}function S(M){let g=i.get(M);if(M.depthTexture)M.depthTexture.dispose(),i.remove(M.depthTexture);if(M.isWebGLCubeRenderTarget)for(let q=0;q<6;q++){if(Array.isArray(g.__webglFramebuffer[q]))for(let J=0;J<g.__webglFramebuffer[q].length;J++)e.deleteFramebuffer(g.__webglFramebuffer[q][J]);else e.deleteFramebuffer(g.__webglFramebuffer[q]);if(g.__webglDepthbuffer)e.deleteRenderbuffer(g.__webglDepthbuffer[q])}else{if(Array.isArray(g.__webglFramebuffer))for(let q=0;q<g.__webglFramebuffer.length;q++)e.deleteFramebuffer(g.__webglFramebuffer[q]);else e.deleteFramebuffer(g.__webglFramebuffer);if(g.__webglDepthbuffer)e.deleteRenderbuffer(g.__webglDepthbuffer);if(g.__webglMultisampledFramebuffer)e.deleteFramebuffer(g.__webglMultisampledFramebuffer);if(g.__webglColorRenderbuffer){for(let q=0;q<g.__webglColorRenderbuffer.length;q++)if(g.__webglColorRenderbuffer[q])e.deleteRenderbuffer(g.__webglColorRenderbuffer[q])}if(g.__webglDepthRenderbuffer)e.deleteRenderbuffer(g.__webglDepthRenderbuffer)}let F=M.textures;for(let q=0,J=F.length;q<J;q++){let W=i.get(F[q]);if(W.__webglTexture)e.deleteTexture(W.__webglTexture),a.memory.textures--;i.remove(F[q])}i.remove(M)}let R=0;function k(){R=0}function X(){let M=R;if(M>=s.maxTextures)Me("WebGLTextures: Trying to use "+M+" texture units while this GPU supports only "+s.maxTextures);return R+=1,M}function G(M){let g=[];return g.push(M.wrapS),g.push(M.wrapT),g.push(M.wrapR||0),g.push(M.magFilter),g.push(M.minFilter),g.push(M.anisotropy),g.push(M.internalFormat),g.push(M.format),g.push(M.type),g.push(M.generateMipmaps),g.push(M.premultiplyAlpha),g.push(M.flipY),g.push(M.unpackAlignment),g.push(M.colorSpace),g.join()}function K(M,g){let F=i.get(M);if(M.isVideoTexture)it(M);if(M.isRenderTargetTexture===!1&&M.isExternalTexture!==!0&&M.version>0&&F.__version!==M.version){let q=M.image;if(q===null)Me("WebGLRenderer: Texture marked for update but no image data found.");else if(q.complete===!1)Me("WebGLRenderer: Texture marked for update but image is incomplete");else{oe(F,M,g);return}}else if(M.isExternalTexture)F.__webglTexture=M.sourceTexture?M.sourceTexture:null;n.bindTexture(e.TEXTURE_2D,F.__webglTexture,e.TEXTURE0+g)}function H(M,g){let F=i.get(M);if(M.isRenderTargetTexture===!1&&M.version>0&&F.__version!==M.version){oe(F,M,g);return}else if(M.isExternalTexture)F.__webglTexture=M.sourceTexture?M.sourceTexture:null;n.bindTexture(e.TEXTURE_2D_ARRAY,F.__webglTexture,e.TEXTURE0+g)}function O(M,g){let F=i.get(M);if(M.isRenderTargetTexture===!1&&M.version>0&&F.__version!==M.version){oe(F,M,g);return}n.bindTexture(e.TEXTURE_3D,F.__webglTexture,e.TEXTURE0+g)}function Y(M,g){let F=i.get(M);if(M.isCubeDepthTexture!==!0&&M.version>0&&F.__version!==M.version){se(F,M,g);return}n.bindTexture(e.TEXTURE_CUBE_MAP,F.__webglTexture,e.TEXTURE0+g)}let ee={[Xn]:e.REPEAT,[Ji]:e.CLAMP_TO_EDGE,[Fr]:e.MIRRORED_REPEAT},ie={[on]:e.NEAREST,[Or]:e.NEAREST_MIPMAP_NEAREST,[hi]:e.NEAREST_MIPMAP_LINEAR,[Tt]:e.LINEAR,[Ki]:e.LINEAR_MIPMAP_NEAREST,[Pn]:e.LINEAR_MIPMAP_LINEAR},fe={[dh]:e.NEVER,[_h]:e.ALWAYS,[fh]:e.LESS,[Vr]:e.LEQUAL,[ph]:e.EQUAL,[Wr]:e.GEQUAL,[mh]:e.GREATER,[gh]:e.NOTEQUAL};function Pe(M,g){if(g.type===Ln&&t.has("OES_texture_float_linear")===!1&&(g.magFilter===Tt||g.magFilter===Ki||g.magFilter===hi||g.magFilter===Pn||g.minFilter===Tt||g.minFilter===Ki||g.minFilter===hi||g.minFilter===Pn))Me("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.");if(e.texParameteri(M,e.TEXTURE_WRAP_S,ee[g.wrapS]),e.texParameteri(M,e.TEXTURE_WRAP_T,ee[g.wrapT]),M===e.TEXTURE_3D||M===e.TEXTURE_2D_ARRAY)e.texParameteri(M,e.TEXTURE_WRAP_R,ee[g.wrapR]);if(e.texParameteri(M,e.TEXTURE_MAG_FILTER,ie[g.magFilter]),e.texParameteri(M,e.TEXTURE_MIN_FILTER,ie[g.minFilter]),g.compareFunction)e.texParameteri(M,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(M,e.TEXTURE_COMPARE_FUNC,fe[g.compareFunction]);if(t.has("EXT_texture_filter_anisotropic")===!0){if(g.magFilter===on)return;if(g.minFilter!==hi&&g.minFilter!==Pn)return;if(g.type===Ln&&t.has("OES_texture_float_linear")===!1)return;if(g.anisotropy>1||i.get(g).__currentAnisotropy){let F=t.get("EXT_texture_filter_anisotropic");e.texParameterf(M,F.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(g.anisotropy,s.getMaxAnisotropy())),i.get(g).__currentAnisotropy=g.anisotropy}}}function ht(M,g){let F=!1;if(M.__webglInit===void 0)M.__webglInit=!0,g.addEventListener("dispose",E);let q=g.source,J=d.get(q);if(J===void 0)J={},d.set(q,J);let W=G(g);if(W!==M.__cacheKey){if(J[W]===void 0)J[W]={texture:e.createTexture(),usedTimes:0},a.memory.textures++,F=!0;J[W].usedTimes++;let ge=J[M.__cacheKey];if(ge!==void 0){if(J[M.__cacheKey].usedTimes--,ge.usedTimes===0)y(g)}M.__cacheKey=W,M.__webglTexture=J[W].texture}return F}function $e(M,g,F){return Math.floor(Math.floor(M/F)/g)}function Z(M,g,F,q){let W=M.updateRanges;if(W.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,g.width,g.height,F,q,g.data);else{W.sort((j,te)=>j.start-te.start);let ge=0;for(let j=1;j<W.length;j++){let te=W[ge],_e=W[j],ve=te.start+te.count,ue=$e(_e.start,g.width,4),He=$e(te.start,g.width,4);if(_e.start<=ve+1&&ue===He&&$e(_e.start+_e.count-1,g.width,4)===ue)te.count=Math.max(te.count,_e.start+_e.count-te.start);else++ge,W[ge]=_e}W.length=ge+1;let re=e.getParameter(e.UNPACK_ROW_LENGTH),Ae=e.getParameter(e.UNPACK_SKIP_PIXELS),Ne=e.getParameter(e.UNPACK_SKIP_ROWS);e.pixelStorei(e.UNPACK_ROW_LENGTH,g.width);for(let j=0,te=W.length;j<te;j++){let _e=W[j],ve=Math.floor(_e.start/4),ue=Math.ceil(_e.count/4),He=ve%g.width,C=Math.floor(ve/g.width),ae=ue,ne=1;e.pixelStorei(e.UNPACK_SKIP_PIXELS,He),e.pixelStorei(e.UNPACK_SKIP_ROWS,C),n.texSubImage2D(e.TEXTURE_2D,0,He,C,ae,1,F,q,g.data)}M.clearUpdateRanges(),e.pixelStorei(e.UNPACK_ROW_LENGTH,re),e.pixelStorei(e.UNPACK_SKIP_PIXELS,Ae),e.pixelStorei(e.UNPACK_SKIP_ROWS,Ne)}}function oe(M,g,F){let q=e.TEXTURE_2D;if(g.isDataArrayTexture||g.isCompressedArrayTexture)q=e.TEXTURE_2D_ARRAY;if(g.isData3DTexture)q=e.TEXTURE_3D;let J=ht(M,g),W=g.source;n.bindTexture(q,M.__webglTexture,e.TEXTURE0+F);let ge=i.get(W);if(W.version!==ge.__version||J===!0){n.activeTexture(e.TEXTURE0+F);let re=We.getPrimaries(We.workingColorSpace),Ae=g.colorSpace===fi?null:We.getPrimaries(g.colorSpace),Ne=g.colorSpace===fi||re===Ae?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,g.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,g.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,g.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ne);let j=x(g.image,!1,s.maxTextureSize);j=be(g,j);let te=r.convert(g.format,g.colorSpace),_e=r.convert(g.type),ve=b(g.internalFormat,te,_e,g.colorSpace,g.isVideoTexture);Pe(q,g);let ue,He=g.mipmaps,C=g.isVideoTexture!==!0,ae=ge.__version===void 0||J===!0,ne=W.dataReady,pe=I(g,j);if(g.isDepthTexture){if(ve=T(g.format===di,g.type),ae)if(C)n.texStorage2D(e.TEXTURE_2D,1,ve,j.width,j.height);else n.texImage2D(e.TEXTURE_2D,0,ve,j.width,j.height,0,te,_e,null)}else if(g.isDataTexture)if(He.length>0){if(C&&ae)n.texStorage2D(e.TEXTURE_2D,pe,ve,He[0].width,He[0].height);for(let Q=0,V=He.length;Q<V;Q++)if(ue=He[Q],C){if(ne)n.texSubImage2D(e.TEXTURE_2D,Q,0,0,ue.width,ue.height,te,_e,ue.data)}else n.texImage2D(e.TEXTURE_2D,Q,ve,ue.width,ue.height,0,te,_e,ue.data);g.generateMipmaps=!1}else if(C){if(ae)n.texStorage2D(e.TEXTURE_2D,pe,ve,j.width,j.height);if(ne)Z(g,j,te,_e)}else n.texImage2D(e.TEXTURE_2D,0,ve,j.width,j.height,0,te,_e,j.data);else if(g.isCompressedTexture)if(g.isCompressedArrayTexture){if(C&&ae)n.texStorage3D(e.TEXTURE_2D_ARRAY,pe,ve,He[0].width,He[0].height,j.depth);for(let Q=0,V=He.length;Q<V;Q++)if(ue=He[Q],g.format!==un)if(te!==null)if(C){if(ne)if(g.layerUpdates.size>0){let xe=gl(ue.width,ue.height,g.format,g.type);for(let Fe of g.layerUpdates){let ot=ue.data.subarray(Fe*xe/ue.data.BYTES_PER_ELEMENT,(Fe+1)*xe/ue.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,Q,0,0,Fe,ue.width,ue.height,1,te,ot)}g.clearLayerUpdates()}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,Q,0,0,0,ue.width,ue.height,j.depth,te,ue.data)}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,Q,ve,ue.width,ue.height,j.depth,0,ue.data,0,0);else Me("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(C){if(ne)n.texSubImage3D(e.TEXTURE_2D_ARRAY,Q,0,0,0,ue.width,ue.height,j.depth,te,_e,ue.data)}else n.texImage3D(e.TEXTURE_2D_ARRAY,Q,ve,ue.width,ue.height,j.depth,0,te,_e,ue.data)}else{if(C&&ae)n.texStorage2D(e.TEXTURE_2D,pe,ve,He[0].width,He[0].height);for(let Q=0,V=He.length;Q<V;Q++)if(ue=He[Q],g.format!==un)if(te!==null)if(C){if(ne)n.compressedTexSubImage2D(e.TEXTURE_2D,Q,0,0,ue.width,ue.height,te,ue.data)}else n.compressedTexImage2D(e.TEXTURE_2D,Q,ve,ue.width,ue.height,0,ue.data);else Me("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(C){if(ne)n.texSubImage2D(e.TEXTURE_2D,Q,0,0,ue.width,ue.height,te,_e,ue.data)}else n.texImage2D(e.TEXTURE_2D,Q,ve,ue.width,ue.height,0,te,_e,ue.data)}else if(g.isDataArrayTexture)if(C){if(ae)n.texStorage3D(e.TEXTURE_2D_ARRAY,pe,ve,j.width,j.height,j.depth);if(ne)if(g.layerUpdates.size>0){let Q=gl(j.width,j.height,g.format,g.type);for(let V of g.layerUpdates){let xe=j.data.subarray(V*Q/j.data.BYTES_PER_ELEMENT,(V+1)*Q/j.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,V,j.width,j.height,1,te,_e,xe)}g.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,j.width,j.height,j.depth,te,_e,j.data)}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,ve,j.width,j.height,j.depth,0,te,_e,j.data);else if(g.isData3DTexture)if(C){if(ae)n.texStorage3D(e.TEXTURE_3D,pe,ve,j.width,j.height,j.depth);if(ne)n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,j.width,j.height,j.depth,te,_e,j.data)}else n.texImage3D(e.TEXTURE_3D,0,ve,j.width,j.height,j.depth,0,te,_e,j.data);else if(g.isFramebufferTexture){if(ae)if(C)n.texStorage2D(e.TEXTURE_2D,pe,ve,j.width,j.height);else{let Q=j.width,V=j.height;for(let xe=0;xe<pe;xe++)n.texImage2D(e.TEXTURE_2D,xe,ve,Q,V,0,te,_e,null),Q>>=1,V>>=1}}else if(He.length>0){if(C&&ae){let Q=at(He[0]);n.texStorage2D(e.TEXTURE_2D,pe,ve,Q.width,Q.height)}for(let Q=0,V=He.length;Q<V;Q++)if(ue=He[Q],C){if(ne)n.texSubImage2D(e.TEXTURE_2D,Q,0,0,te,_e,ue)}else n.texImage2D(e.TEXTURE_2D,Q,ve,te,_e,ue);g.generateMipmaps=!1}else if(C){if(ae){let Q=at(j);n.texStorage2D(e.TEXTURE_2D,pe,ve,Q.width,Q.height)}if(ne)n.texSubImage2D(e.TEXTURE_2D,0,0,0,te,_e,j)}else n.texImage2D(e.TEXTURE_2D,0,ve,te,_e,j);if(f(g))p(q);if(ge.__version=W.version,g.onUpdate)g.onUpdate(g)}M.__version=g.version}function se(M,g,F){if(g.image.length!==6)return;let q=ht(M,g),J=g.source;n.bindTexture(e.TEXTURE_CUBE_MAP,M.__webglTexture,e.TEXTURE0+F);let W=i.get(J);if(J.version!==W.__version||q===!0){n.activeTexture(e.TEXTURE0+F);let ge=We.getPrimaries(We.workingColorSpace),re=g.colorSpace===fi?null:We.getPrimaries(g.colorSpace),Ae=g.colorSpace===fi||ge===re?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,g.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,g.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,g.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ae);let Ne=g.isCompressedTexture||g.image[0].isCompressedTexture,j=g.image[0]&&g.image[0].isDataTexture,te=[];for(let V=0;V<6;V++){if(!Ne&&!j)te[V]=x(g.image[V],!0,s.maxCubemapSize);else te[V]=j?g.image[V].image:g.image[V];te[V]=be(g,te[V])}let _e=te[0],ve=r.convert(g.format,g.colorSpace),ue=r.convert(g.type),He=b(g.internalFormat,ve,ue,g.colorSpace),C=g.isVideoTexture!==!0,ae=W.__version===void 0||q===!0,ne=J.dataReady,pe=I(g,_e);Pe(e.TEXTURE_CUBE_MAP,g);let Q;if(Ne){if(C&&ae)n.texStorage2D(e.TEXTURE_CUBE_MAP,pe,He,_e.width,_e.height);for(let V=0;V<6;V++){Q=te[V].mipmaps;for(let xe=0;xe<Q.length;xe++){let Fe=Q[xe];if(g.format!==un)if(ve!==null)if(C){if(ne)n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+V,xe,0,0,Fe.width,Fe.height,ve,Fe.data)}else n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+V,xe,He,Fe.width,Fe.height,0,Fe.data);else Me("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()");else if(C){if(ne)n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+V,xe,0,0,Fe.width,Fe.height,ve,ue,Fe.data)}else n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+V,xe,He,Fe.width,Fe.height,0,ve,ue,Fe.data)}}}else{if(Q=g.mipmaps,C&&ae){if(Q.length>0)pe++;let V=at(te[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,pe,He,V.width,V.height)}for(let V=0;V<6;V++)if(j){if(C){if(ne)n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+V,0,0,0,te[V].width,te[V].height,ve,ue,te[V].data)}else n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+V,0,He,te[V].width,te[V].height,0,ve,ue,te[V].data);for(let xe=0;xe<Q.length;xe++){let ot=Q[xe].image[V].image;if(C){if(ne)n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+V,xe+1,0,0,ot.width,ot.height,ve,ue,ot.data)}else n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+V,xe+1,He,ot.width,ot.height,0,ve,ue,ot.data)}}else{if(C){if(ne)n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+V,0,0,0,ve,ue,te[V])}else n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+V,0,He,ve,ue,te[V]);for(let xe=0;xe<Q.length;xe++){let Fe=Q[xe];if(C){if(ne)n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+V,xe+1,0,0,ve,ue,Fe.image[V])}else n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+V,xe+1,He,ve,ue,Fe.image[V])}}}if(f(g))p(e.TEXTURE_CUBE_MAP);if(W.__version=J.version,g.onUpdate)g.onUpdate(g)}M.__version=g.version}function Te(M,g,F,q,J,W){let ge=r.convert(F.format,F.colorSpace),re=r.convert(F.type),Ae=b(F.internalFormat,ge,re,F.colorSpace),Ne=i.get(g),j=i.get(F);if(j.__renderTarget=g,!Ne.__hasExternalTextures){let te=Math.max(1,g.width>>W),_e=Math.max(1,g.height>>W);if(J===e.TEXTURE_3D||J===e.TEXTURE_2D_ARRAY)n.texImage3D(J,W,Ae,te,_e,g.depth,0,ge,re,null);else n.texImage2D(J,W,Ae,te,_e,0,ge,re,null)}if(n.bindFramebuffer(e.FRAMEBUFFER,M),Ue(g))o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,q,J,j.__webglTexture,0,xt(g));else if(J===e.TEXTURE_2D||J>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&J<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)e.framebufferTexture2D(e.FRAMEBUFFER,q,J,j.__webglTexture,W);n.bindFramebuffer(e.FRAMEBUFFER,null)}function Ee(M,g,F){if(e.bindRenderbuffer(e.RENDERBUFFER,M),g.depthBuffer){let q=g.depthTexture,J=q&&q.isDepthTexture?q.type:null,W=T(g.stencilBuffer,J),ge=g.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(Ue(g))o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,xt(g),W,g.width,g.height);else if(F)e.renderbufferStorageMultisample(e.RENDERBUFFER,xt(g),W,g.width,g.height);else e.renderbufferStorage(e.RENDERBUFFER,W,g.width,g.height);e.framebufferRenderbuffer(e.FRAMEBUFFER,ge,e.RENDERBUFFER,M)}else{let q=g.textures;for(let J=0;J<q.length;J++){let W=q[J],ge=r.convert(W.format,W.colorSpace),re=r.convert(W.type),Ae=b(W.internalFormat,ge,re,W.colorSpace);if(Ue(g))o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,xt(g),Ae,g.width,g.height);else if(F)e.renderbufferStorageMultisample(e.RENDERBUFFER,xt(g),Ae,g.width,g.height);else e.renderbufferStorage(e.RENDERBUFFER,Ae,g.width,g.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function Le(M,g,F){let q=g.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,M),!(g.depthTexture&&g.depthTexture.isDepthTexture))throw Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let J=i.get(g.depthTexture);if(J.__renderTarget=g,!J.__webglTexture||g.depthTexture.image.width!==g.width||g.depthTexture.image.height!==g.height)g.depthTexture.image.width=g.width,g.depthTexture.image.height=g.height,g.depthTexture.needsUpdate=!0;if(q){if(J.__webglInit===void 0)J.__webglInit=!0,g.depthTexture.addEventListener("dispose",E);if(J.__webglTexture===void 0){J.__webglTexture=e.createTexture(),n.bindTexture(e.TEXTURE_CUBE_MAP,J.__webglTexture),Pe(e.TEXTURE_CUBE_MAP,g.depthTexture);let Ne=r.convert(g.depthTexture.format),j=r.convert(g.depthTexture.type),te;if(g.depthTexture.format===ui)te=e.DEPTH_COMPONENT24;else if(g.depthTexture.format===di)te=e.DEPTH24_STENCIL8;for(let _e=0;_e<6;_e++)e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+_e,0,te,g.width,g.height,0,Ne,j,null)}}else K(g.depthTexture,0);let W=J.__webglTexture,ge=xt(g),re=q?e.TEXTURE_CUBE_MAP_POSITIVE_X+F:e.TEXTURE_2D,Ae=g.depthTexture.format===di?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(g.depthTexture.format===ui)if(Ue(g))o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,Ae,re,W,0,ge);else e.framebufferTexture2D(e.FRAMEBUFFER,Ae,re,W,0);else if(g.depthTexture.format===di)if(Ue(g))o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,Ae,re,W,0,ge);else e.framebufferTexture2D(e.FRAMEBUFFER,Ae,re,W,0);else throw Error("Unknown depthTexture format")}function ft(M){let g=i.get(M),F=M.isWebGLCubeRenderTarget===!0;if(g.__boundDepthTexture!==M.depthTexture){let q=M.depthTexture;if(g.__depthDisposeCallback)g.__depthDisposeCallback();if(q){let J=()=>{delete g.__boundDepthTexture,delete g.__depthDisposeCallback,q.removeEventListener("dispose",J)};q.addEventListener("dispose",J),g.__depthDisposeCallback=J}g.__boundDepthTexture=q}if(M.depthTexture&&!g.__autoAllocateDepthBuffer)if(F)for(let q=0;q<6;q++)Le(g.__webglFramebuffer[q],M,q);else{let q=M.texture.mipmaps;if(q&&q.length>0)Le(g.__webglFramebuffer[0],M,0);else Le(g.__webglFramebuffer,M,0)}else if(F){g.__webglDepthbuffer=[];for(let q=0;q<6;q++)if(n.bindFramebuffer(e.FRAMEBUFFER,g.__webglFramebuffer[q]),g.__webglDepthbuffer[q]===void 0)g.__webglDepthbuffer[q]=e.createRenderbuffer(),Ee(g.__webglDepthbuffer[q],M,!1);else{let J=M.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,W=g.__webglDepthbuffer[q];e.bindRenderbuffer(e.RENDERBUFFER,W),e.framebufferRenderbuffer(e.FRAMEBUFFER,J,e.RENDERBUFFER,W)}}else{let q=M.texture.mipmaps;if(q&&q.length>0)n.bindFramebuffer(e.FRAMEBUFFER,g.__webglFramebuffer[0]);else n.bindFramebuffer(e.FRAMEBUFFER,g.__webglFramebuffer);if(g.__webglDepthbuffer===void 0)g.__webglDepthbuffer=e.createRenderbuffer(),Ee(g.__webglDepthbuffer,M,!1);else{let J=M.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,W=g.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,W),e.framebufferRenderbuffer(e.FRAMEBUFFER,J,e.RENDERBUFFER,W)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function Ye(M,g,F){let q=i.get(M);if(g!==void 0)Te(q.__webglFramebuffer,M,M.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0);if(F!==void 0)ft(M)}function Je(M){let g=M.texture,F=i.get(M),q=i.get(g);M.addEventListener("dispose",P);let J=M.textures,W=M.isWebGLCubeRenderTarget===!0,ge=J.length>1;if(!ge){if(q.__webglTexture===void 0)q.__webglTexture=e.createTexture();q.__version=g.version,a.memory.textures++}if(W){F.__webglFramebuffer=[];for(let re=0;re<6;re++)if(g.mipmaps&&g.mipmaps.length>0){F.__webglFramebuffer[re]=[];for(let Ae=0;Ae<g.mipmaps.length;Ae++)F.__webglFramebuffer[re][Ae]=e.createFramebuffer()}else F.__webglFramebuffer[re]=e.createFramebuffer()}else{if(g.mipmaps&&g.mipmaps.length>0){F.__webglFramebuffer=[];for(let re=0;re<g.mipmaps.length;re++)F.__webglFramebuffer[re]=e.createFramebuffer()}else F.__webglFramebuffer=e.createFramebuffer();if(ge)for(let re=0,Ae=J.length;re<Ae;re++){let Ne=i.get(J[re]);if(Ne.__webglTexture===void 0)Ne.__webglTexture=e.createTexture(),a.memory.textures++}if(M.samples>0&&Ue(M)===!1){F.__webglMultisampledFramebuffer=e.createFramebuffer(),F.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,F.__webglMultisampledFramebuffer);for(let re=0;re<J.length;re++){let Ae=J[re];F.__webglColorRenderbuffer[re]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,F.__webglColorRenderbuffer[re]);let Ne=r.convert(Ae.format,Ae.colorSpace),j=r.convert(Ae.type),te=b(Ae.internalFormat,Ne,j,Ae.colorSpace,M.isXRRenderTarget===!0),_e=xt(M);e.renderbufferStorageMultisample(e.RENDERBUFFER,_e,te,M.width,M.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+re,e.RENDERBUFFER,F.__webglColorRenderbuffer[re])}if(e.bindRenderbuffer(e.RENDERBUFFER,null),M.depthBuffer)F.__webglDepthRenderbuffer=e.createRenderbuffer(),Ee(F.__webglDepthRenderbuffer,M,!0);n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(W){n.bindTexture(e.TEXTURE_CUBE_MAP,q.__webglTexture),Pe(e.TEXTURE_CUBE_MAP,g);for(let re=0;re<6;re++)if(g.mipmaps&&g.mipmaps.length>0)for(let Ae=0;Ae<g.mipmaps.length;Ae++)Te(F.__webglFramebuffer[re][Ae],M,g,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+re,Ae);else Te(F.__webglFramebuffer[re],M,g,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+re,0);if(f(g))p(e.TEXTURE_CUBE_MAP);n.unbindTexture()}else if(ge){for(let re=0,Ae=J.length;re<Ae;re++){let Ne=J[re],j=i.get(Ne),te=e.TEXTURE_2D;if(M.isWebGL3DRenderTarget||M.isWebGLArrayRenderTarget)te=M.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY;if(n.bindTexture(te,j.__webglTexture),Pe(te,Ne),Te(F.__webglFramebuffer,M,Ne,e.COLOR_ATTACHMENT0+re,te,0),f(Ne))p(te)}n.unbindTexture()}else{let re=e.TEXTURE_2D;if(M.isWebGL3DRenderTarget||M.isWebGLArrayRenderTarget)re=M.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY;if(n.bindTexture(re,q.__webglTexture),Pe(re,g),g.mipmaps&&g.mipmaps.length>0)for(let Ae=0;Ae<g.mipmaps.length;Ae++)Te(F.__webglFramebuffer[Ae],M,g,e.COLOR_ATTACHMENT0,re,Ae);else Te(F.__webglFramebuffer,M,g,e.COLOR_ATTACHMENT0,re,0);if(f(g))p(re);n.unbindTexture()}if(M.depthBuffer)ft(M)}function ke(M){let g=M.textures;for(let F=0,q=g.length;F<q;F++){let J=g[F];if(f(J)){let W=A(M),ge=i.get(J).__webglTexture;n.bindTexture(W,ge),p(W),n.unbindTexture()}}}let Ce=[],ut=[];function w(M){if(M.samples>0){if(Ue(M)===!1){let{textures:g,width:F,height:q}=M,J=e.COLOR_BUFFER_BIT,W=M.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,ge=i.get(M),re=g.length>1;if(re)for(let Ne=0;Ne<g.length;Ne++)n.bindFramebuffer(e.FRAMEBUFFER,ge.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+Ne,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,ge.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+Ne,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,ge.__webglMultisampledFramebuffer);let Ae=M.texture.mipmaps;if(Ae&&Ae.length>0)n.bindFramebuffer(e.DRAW_FRAMEBUFFER,ge.__webglFramebuffer[0]);else n.bindFramebuffer(e.DRAW_FRAMEBUFFER,ge.__webglFramebuffer);for(let Ne=0;Ne<g.length;Ne++){if(M.resolveDepthBuffer){if(M.depthBuffer)J|=e.DEPTH_BUFFER_BIT;if(M.stencilBuffer&&M.resolveStencilBuffer)J|=e.STENCIL_BUFFER_BIT}if(re){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,ge.__webglColorRenderbuffer[Ne]);let j=i.get(g[Ne]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,j,0)}if(e.blitFramebuffer(0,0,F,q,0,0,F,q,J,e.NEAREST),l===!0){if(Ce.length=0,ut.length=0,Ce.push(e.COLOR_ATTACHMENT0+Ne),M.depthBuffer&&M.resolveDepthBuffer===!1)Ce.push(W),ut.push(W),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,ut);e.invalidateFramebuffer(e.READ_FRAMEBUFFER,Ce)}}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),re)for(let Ne=0;Ne<g.length;Ne++){n.bindFramebuffer(e.FRAMEBUFFER,ge.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+Ne,e.RENDERBUFFER,ge.__webglColorRenderbuffer[Ne]);let j=i.get(g[Ne]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,ge.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+Ne,e.TEXTURE_2D,j,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,ge.__webglMultisampledFramebuffer)}else if(M.depthBuffer&&M.resolveDepthBuffer===!1&&l){let g=M.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[g])}}}function xt(M){return Math.min(s.maxSamples,M.samples)}function Ue(M){let g=i.get(M);return M.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&g.__useRenderToTexture!==!1}function it(M){let g=a.render.frame;if(h.get(M)!==g)h.set(M,g),M.update()}function be(M,g){let{colorSpace:F,format:q,type:J}=M;if(M.isCompressedTexture===!0||M.isVideoTexture===!0)return g;if(F!==Lt&&F!==fi)if(We.getTransfer(F)===rt){if(q!==un||J!==ln)Me("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.")}else Ie("WebGLTextures: Unsupported texture color space:",F);return g}function at(M){if(typeof HTMLImageElement<"u"&&M instanceof HTMLImageElement)c.width=M.naturalWidth||M.width,c.height=M.naturalHeight||M.height;else if(typeof VideoFrame<"u"&&M instanceof VideoFrame)c.width=M.displayWidth,c.height=M.displayHeight;else c.width=M.width,c.height=M.height;return c}this.allocateTextureUnit=X,this.resetTextureUnits=k,this.setTexture2D=K,this.setTexture2DArray=H,this.setTexture3D=O,this.setTextureCube=Y,this.rebindTextures=Ye,this.setupRenderTarget=Je,this.updateRenderTargetMipmap=ke,this.updateMultisampleRenderTarget=w,this.setupDepthRenderbuffer=ft,this.setupFrameBufferTexture=Te,this.useMultisampledRTT=Ue,this.isReversedDepthBuffer=function(){return n.buffers.depth.getReversed()}}function L0(e,t){function n(i,s=fi){let r,a=We.getTransfer(s);if(i===ln)return e.UNSIGNED_BYTE;if(i===ao)return e.UNSIGNED_SHORT_4_4_4_4;if(i===oo)return e.UNSIGNED_SHORT_5_5_5_1;if(i===rh)return e.UNSIGNED_INT_5_9_9_9_REV;if(i===ah)return e.UNSIGNED_INT_10F_11F_11F_REV;if(i===ih)return e.BYTE;if(i===sh)return e.SHORT;if(i===Is)return e.UNSIGNED_SHORT;if(i===ro)return e.INT;if(i===qn)return e.UNSIGNED_INT;if(i===Ln)return e.FLOAT;if(i===Nn)return e.HALF_FLOAT;if(i===oh)return e.ALPHA;if(i===lh)return e.RGB;if(i===un)return e.RGBA;if(i===ui)return e.DEPTH_COMPONENT;if(i===di)return e.DEPTH_STENCIL;if(i===ch)return e.RED;if(i===lo)return e.RED_INTEGER;if(i===ji)return e.RG;if(i===co)return e.RG_INTEGER;if(i===ho)return e.RGBA_INTEGER;if(i===Br||i===zr||i===kr||i===Gr)if(a===rt)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===Br)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===zr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===kr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Gr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===Br)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===zr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===kr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Gr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===uo||i===fo||i===po||i===mo)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===uo)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===fo)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===po)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===mo)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===go||i===_o||i===xo||i===vo||i===yo||i===Mo||i===So)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(i===go||i===_o)return a===rt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===xo)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===vo)return r.COMPRESSED_R11_EAC;if(i===yo)return r.COMPRESSED_SIGNED_R11_EAC;if(i===Mo)return r.COMPRESSED_RG11_EAC;if(i===So)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===bo||i===To||i===Ao||i===Eo||i===wo||i===Ro||i===Co||i===Io||i===Po||i===Lo||i===No||i===Do||i===Uo||i===Fo)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(i===bo)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===To)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Ao)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Eo)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===wo)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Ro)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Co)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Io)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Po)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Lo)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===No)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Do)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Uo)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Fo)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Oo||i===Bo||i===zo)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(i===Oo)return a===rt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Bo)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===zo)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===ko||i===Go||i===Ho||i===Vo)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(i===ko)return r.COMPRESSED_RED_RGTC1_EXT;if(i===Go)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Ho)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Vo)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;if(i===$i)return e.UNSIGNED_INT_24_8;return e[i]!==void 0?e[i]:null}return{convert:n}}var N0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,D0=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class lu{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new ia(e.texture);if(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)this.depthNear=e.depthNear,this.depthFar=e.depthFar;this.texture=n}}getMesh(e){if(this.texture!==null){if(this.mesh===null){let t=e.cameras[0].viewport,n=new jt({vertexShader:N0,fragmentShader:D0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new dt(new Hs(20,20),n)}}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class cu extends Yn{constructor(e,t){super();let n=this,i=null,s=1,r=null,a="local-floor",o=1,l=null,c=null,h=null,u=null,d=null,m=null,_=typeof XRWebGLBinding<"u",x=new lu,f={},p=t.getContextAttributes(),A=null,b=null,T=[],I=[],E=new Oe,P=null,N=new vt;N.viewport=new ct;let y=new vt;y.viewport=new ct;let S=[N,y],R=new fl,k=null,X=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Z){let oe=T[Z];if(oe===void 0)oe=new Ns,T[Z]=oe;return oe.getTargetRaySpace()},this.getControllerGrip=function(Z){let oe=T[Z];if(oe===void 0)oe=new Ns,T[Z]=oe;return oe.getGripSpace()},this.getHand=function(Z){let oe=T[Z];if(oe===void 0)oe=new Ns,T[Z]=oe;return oe.getHandSpace()};function G(Z){let oe=I.indexOf(Z.inputSource);if(oe===-1)return;let se=T[oe];if(se!==void 0)se.update(Z.inputSource,Z.frame,l||r),se.dispatchEvent({type:Z.type,data:Z.inputSource})}function K(){i.removeEventListener("select",G),i.removeEventListener("selectstart",G),i.removeEventListener("selectend",G),i.removeEventListener("squeeze",G),i.removeEventListener("squeezestart",G),i.removeEventListener("squeezeend",G),i.removeEventListener("end",K),i.removeEventListener("inputsourceschange",H);for(let Z=0;Z<T.length;Z++){let oe=I[Z];if(oe===null)continue;I[Z]=null,T[Z].disconnect(oe)}k=null,X=null,x.reset();for(let Z in f)delete f[Z];e.setRenderTarget(A),d=null,u=null,h=null,i=null,b=null,$e.stop(),n.isPresenting=!1,e.setPixelRatio(P),e.setSize(E.width,E.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Z){if(s=Z,n.isPresenting===!0)Me("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Z){if(a=Z,n.isPresenting===!0)Me("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||r},this.setReferenceSpace=function(Z){l=Z},this.getBaseLayer=function(){return u!==null?u:d},this.getBinding=function(){if(h===null&&_)h=new XRWebGLBinding(i,t);return h},this.getFrame=function(){return m},this.getSession=function(){return i},this.setSession=async function(Z){if(i=Z,i!==null){if(A=e.getRenderTarget(),i.addEventListener("select",G),i.addEventListener("selectstart",G),i.addEventListener("selectend",G),i.addEventListener("squeeze",G),i.addEventListener("squeezestart",G),i.addEventListener("squeezeend",G),i.addEventListener("end",K),i.addEventListener("inputsourceschange",H),p.xrCompatible!==!0)await t.makeXRCompatible();if(P=e.getPixelRatio(),e.getSize(E),!(_&&("createProjectionLayer"in XRWebGLBinding.prototype))){let se={antialias:p.antialias,alpha:!0,depth:p.depth,stencil:p.stencil,framebufferScaleFactor:s};d=new XRWebGLLayer(i,t,se),i.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),b=new $t(d.framebufferWidth,d.framebufferHeight,{format:un,type:ln,colorSpace:e.outputColorSpace,stencilBuffer:p.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{let se=null,Te=null,Ee=null;if(p.depth)Ee=p.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,se=p.stencil?di:ui,Te=p.stencil?$i:qn;let Le={colorFormat:t.RGBA8,depthFormat:Ee,scaleFactor:s};h=this.getBinding(),u=h.createProjectionLayer(Le),i.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),b=new $t(u.textureWidth,u.textureHeight,{format:un,type:ln,depthTexture:new mi(u.textureWidth,u.textureHeight,Te,void 0,void 0,void 0,void 0,void 0,void 0,se),stencilBuffer:p.stencil,colorSpace:e.outputColorSpace,samples:p.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1})}b.isXRRenderTarget=!0,this.setFoveation(o),l=null,r=await i.requestReferenceSpace(a),$e.setContext(i),$e.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return x.getDepthTexture()};function H(Z){for(let oe=0;oe<Z.removed.length;oe++){let se=Z.removed[oe],Te=I.indexOf(se);if(Te>=0)I[Te]=null,T[Te].disconnect(se)}for(let oe=0;oe<Z.added.length;oe++){let se=Z.added[oe],Te=I.indexOf(se);if(Te===-1){for(let Le=0;Le<T.length;Le++)if(Le>=I.length){I.push(se),Te=Le;break}else if(I[Le]===null){I[Le]=se,Te=Le;break}if(Te===-1)break}let Ee=T[Te];if(Ee)Ee.connect(se)}}let O=new D,Y=new D;function ee(Z,oe,se){O.setFromMatrixPosition(oe.matrixWorld),Y.setFromMatrixPosition(se.matrixWorld);let Te=O.distanceTo(Y),Ee=oe.projectionMatrix.elements,Le=se.projectionMatrix.elements,ft=Ee[14]/(Ee[10]-1),Ye=Ee[14]/(Ee[10]+1),Je=(Ee[9]+1)/Ee[5],ke=(Ee[9]-1)/Ee[5],Ce=(Ee[8]-1)/Ee[0],ut=(Le[8]+1)/Le[0],w=ft*Ce,xt=ft*ut,Ue=Te/(-Ce+ut),it=Ue*-Ce;if(oe.matrixWorld.decompose(Z.position,Z.quaternion,Z.scale),Z.translateX(it),Z.translateZ(Ue),Z.matrixWorld.compose(Z.position,Z.quaternion,Z.scale),Z.matrixWorldInverse.copy(Z.matrixWorld).invert(),Ee[10]===-1)Z.projectionMatrix.copy(oe.projectionMatrix),Z.projectionMatrixInverse.copy(oe.projectionMatrixInverse);else{let be=ft+Ue,at=Ye+Ue,M=w-it,g=xt+(Te-it),F=Je*Ye/at*be,q=ke*Ye/at*be;Z.projectionMatrix.makePerspective(M,g,F,q,be,at),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert()}}function ie(Z,oe){if(oe===null)Z.matrixWorld.copy(Z.matrix);else Z.matrixWorld.multiplyMatrices(oe.matrixWorld,Z.matrix);Z.matrixWorldInverse.copy(Z.matrixWorld).invert()}this.updateCamera=function(Z){if(i===null)return;let{near:oe,far:se}=Z;if(x.texture!==null){if(x.depthNear>0)oe=x.depthNear;if(x.depthFar>0)se=x.depthFar}if(R.near=y.near=N.near=oe,R.far=y.far=N.far=se,k!==R.near||X!==R.far)i.updateRenderState({depthNear:R.near,depthFar:R.far}),k=R.near,X=R.far;R.layers.mask=Z.layers.mask|6,N.layers.mask=R.layers.mask&3,y.layers.mask=R.layers.mask&5;let Te=Z.parent,Ee=R.cameras;ie(R,Te);for(let Le=0;Le<Ee.length;Le++)ie(Ee[Le],Te);if(Ee.length===2)ee(R,N,y);else R.projectionMatrix.copy(N.projectionMatrix);fe(Z,R,Te)};function fe(Z,oe,se){if(se===null)Z.matrix.copy(oe.matrixWorld);else Z.matrix.copy(se.matrixWorld),Z.matrix.invert(),Z.matrix.multiply(oe.matrixWorld);if(Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.updateMatrixWorld(!0),Z.projectionMatrix.copy(oe.projectionMatrix),Z.projectionMatrixInverse.copy(oe.projectionMatrixInverse),Z.isPerspectiveCamera)Z.fov=oi*2*Math.atan(1/Z.projectionMatrix.elements[5]),Z.zoom=1}this.getCamera=function(){return R},this.getFoveation=function(){if(u===null&&d===null)return;return o},this.setFoveation=function(Z){if(o=Z,u!==null)u.fixedFoveation=Z;if(d!==null&&d.fixedFoveation!==void 0)d.fixedFoveation=Z},this.hasDepthSensing=function(){return x.texture!==null},this.getDepthSensingMesh=function(){return x.getMesh(R)},this.getCameraTexture=function(Z){return f[Z]};let Pe=null;function ht(Z,oe){if(c=oe.getViewerPose(l||r),m=oe,c!==null){let se=c.views;if(d!==null)e.setRenderTargetFramebuffer(b,d.framebuffer),e.setRenderTarget(b);let Te=!1;if(se.length!==R.cameras.length)R.cameras.length=0,Te=!0;for(let Ye=0;Ye<se.length;Ye++){let Je=se[Ye],ke=null;if(d!==null)ke=d.getViewport(Je);else{let ut=h.getViewSubImage(u,Je);if(ke=ut.viewport,Ye===0)e.setRenderTargetTextures(b,ut.colorTexture,ut.depthStencilTexture),e.setRenderTarget(b)}let Ce=S[Ye];if(Ce===void 0)Ce=new vt,Ce.layers.enable(Ye),Ce.viewport=new ct,S[Ye]=Ce;if(Ce.matrix.fromArray(Je.transform.matrix),Ce.matrix.decompose(Ce.position,Ce.quaternion,Ce.scale),Ce.projectionMatrix.fromArray(Je.projectionMatrix),Ce.projectionMatrixInverse.copy(Ce.projectionMatrix).invert(),Ce.viewport.set(ke.x,ke.y,ke.width,ke.height),Ye===0)R.matrix.copy(Ce.matrix),R.matrix.decompose(R.position,R.quaternion,R.scale);if(Te===!0)R.cameras.push(Ce)}let Ee=i.enabledFeatures;if(Ee&&Ee.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&_){h=n.getBinding();let Ye=h.getDepthInformation(se[0]);if(Ye&&Ye.isValid&&Ye.texture)x.init(Ye,i.renderState)}if(Ee&&Ee.includes("camera-access")&&_){e.state.unbindTexture(),h=n.getBinding();for(let Ye=0;Ye<se.length;Ye++){let Je=se[Ye].camera;if(Je){let ke=f[Je];if(!ke)ke=new ia,f[Je]=ke;let Ce=h.getCameraImage(Je);ke.sourceTexture=Ce}}}}for(let se=0;se<T.length;se++){let Te=I[se],Ee=T[se];if(Te!==null&&Ee!==void 0)Ee.update(Te,oe,l||r)}if(Pe)Pe(Z,oe);if(oe.detectedPlanes)n.dispatchEvent({type:"planesdetected",data:oe});m=null}let $e=new jh;$e.setAnimationLoop(ht),this.setAnimationLoop=function(Z){Pe=Z},this.dispose=function(){}}}var yi=new Jt,U0=new Be;function F0(e,t){function n(f,p){if(f.matrixAutoUpdate===!0)f.updateMatrix();p.value.copy(f.matrix)}function i(f,p){if(p.color.getRGB(f.fogColor.value,tl(e)),p.isFog)f.fogNear.value=p.near,f.fogFar.value=p.far;else if(p.isFogExp2)f.fogDensity.value=p.density}function s(f,p,A,b,T){if(p.isMeshBasicMaterial)r(f,p);else if(p.isMeshLambertMaterial)r(f,p);else if(p.isMeshToonMaterial)r(f,p),u(f,p);else if(p.isMeshPhongMaterial)r(f,p),h(f,p);else if(p.isMeshStandardMaterial){if(r(f,p),d(f,p),p.isMeshPhysicalMaterial)m(f,p,T)}else if(p.isMeshMatcapMaterial)r(f,p),_(f,p);else if(p.isMeshDepthMaterial)r(f,p);else if(p.isMeshDistanceMaterial)r(f,p),x(f,p);else if(p.isMeshNormalMaterial)r(f,p);else if(p.isLineBasicMaterial){if(a(f,p),p.isLineDashedMaterial)o(f,p)}else if(p.isPointsMaterial)l(f,p,A,b);else if(p.isSpriteMaterial)c(f,p);else if(p.isShadowMaterial)f.color.value.copy(p.color),f.opacity.value=p.opacity;else if(p.isShaderMaterial)p.uniformsNeedUpdate=!1}function r(f,p){if(f.opacity.value=p.opacity,p.color)f.diffuse.value.copy(p.color);if(p.emissive)f.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity);if(p.map)f.map.value=p.map,n(p.map,f.mapTransform);if(p.alphaMap)f.alphaMap.value=p.alphaMap,n(p.alphaMap,f.alphaMapTransform);if(p.bumpMap){if(f.bumpMap.value=p.bumpMap,n(p.bumpMap,f.bumpMapTransform),f.bumpScale.value=p.bumpScale,p.side===Pt)f.bumpScale.value*=-1}if(p.normalMap){if(f.normalMap.value=p.normalMap,n(p.normalMap,f.normalMapTransform),f.normalScale.value.copy(p.normalScale),p.side===Pt)f.normalScale.value.negate()}if(p.displacementMap)f.displacementMap.value=p.displacementMap,n(p.displacementMap,f.displacementMapTransform),f.displacementScale.value=p.displacementScale,f.displacementBias.value=p.displacementBias;if(p.emissiveMap)f.emissiveMap.value=p.emissiveMap,n(p.emissiveMap,f.emissiveMapTransform);if(p.specularMap)f.specularMap.value=p.specularMap,n(p.specularMap,f.specularMapTransform);if(p.alphaTest>0)f.alphaTest.value=p.alphaTest;let A=t.get(p),{envMap:b,envMapRotation:T}=A;if(b){if(f.envMap.value=b,yi.copy(T),yi.x*=-1,yi.y*=-1,yi.z*=-1,b.isCubeTexture&&b.isRenderTargetTexture===!1)yi.y*=-1,yi.z*=-1;f.envMapRotation.value.setFromMatrix4(U0.makeRotationFromEuler(yi)),f.flipEnvMap.value=b.isCubeTexture&&b.isRenderTargetTexture===!1?-1:1,f.reflectivity.value=p.reflectivity,f.ior.value=p.ior,f.refractionRatio.value=p.refractionRatio}if(p.lightMap)f.lightMap.value=p.lightMap,f.lightMapIntensity.value=p.lightMapIntensity,n(p.lightMap,f.lightMapTransform);if(p.aoMap)f.aoMap.value=p.aoMap,f.aoMapIntensity.value=p.aoMapIntensity,n(p.aoMap,f.aoMapTransform)}function a(f,p){if(f.diffuse.value.copy(p.color),f.opacity.value=p.opacity,p.map)f.map.value=p.map,n(p.map,f.mapTransform)}function o(f,p){f.dashSize.value=p.dashSize,f.totalSize.value=p.dashSize+p.gapSize,f.scale.value=p.scale}function l(f,p,A,b){if(f.diffuse.value.copy(p.color),f.opacity.value=p.opacity,f.size.value=p.size*A,f.scale.value=b*0.5,p.map)f.map.value=p.map,n(p.map,f.uvTransform);if(p.alphaMap)f.alphaMap.value=p.alphaMap,n(p.alphaMap,f.alphaMapTransform);if(p.alphaTest>0)f.alphaTest.value=p.alphaTest}function c(f,p){if(f.diffuse.value.copy(p.color),f.opacity.value=p.opacity,f.rotation.value=p.rotation,p.map)f.map.value=p.map,n(p.map,f.mapTransform);if(p.alphaMap)f.alphaMap.value=p.alphaMap,n(p.alphaMap,f.alphaMapTransform);if(p.alphaTest>0)f.alphaTest.value=p.alphaTest}function h(f,p){f.specular.value.copy(p.specular),f.shininess.value=Math.max(p.shininess,0.0001)}function u(f,p){if(p.gradientMap)f.gradientMap.value=p.gradientMap}function d(f,p){if(f.metalness.value=p.metalness,p.metalnessMap)f.metalnessMap.value=p.metalnessMap,n(p.metalnessMap,f.metalnessMapTransform);if(f.roughness.value=p.roughness,p.roughnessMap)f.roughnessMap.value=p.roughnessMap,n(p.roughnessMap,f.roughnessMapTransform);if(p.envMap)f.envMapIntensity.value=p.envMapIntensity}function m(f,p,A){if(f.ior.value=p.ior,p.sheen>0){if(f.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),f.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap)f.sheenColorMap.value=p.sheenColorMap,n(p.sheenColorMap,f.sheenColorMapTransform);if(p.sheenRoughnessMap)f.sheenRoughnessMap.value=p.sheenRoughnessMap,n(p.sheenRoughnessMap,f.sheenRoughnessMapTransform)}if(p.clearcoat>0){if(f.clearcoat.value=p.clearcoat,f.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap)f.clearcoatMap.value=p.clearcoatMap,n(p.clearcoatMap,f.clearcoatMapTransform);if(p.clearcoatRoughnessMap)f.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,n(p.clearcoatRoughnessMap,f.clearcoatRoughnessMapTransform);if(p.clearcoatNormalMap){if(f.clearcoatNormalMap.value=p.clearcoatNormalMap,n(p.clearcoatNormalMap,f.clearcoatNormalMapTransform),f.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Pt)f.clearcoatNormalScale.value.negate()}}if(p.dispersion>0)f.dispersion.value=p.dispersion;if(p.iridescence>0){if(f.iridescence.value=p.iridescence,f.iridescenceIOR.value=p.iridescenceIOR,f.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],f.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap)f.iridescenceMap.value=p.iridescenceMap,n(p.iridescenceMap,f.iridescenceMapTransform);if(p.iridescenceThicknessMap)f.iridescenceThicknessMap.value=p.iridescenceThicknessMap,n(p.iridescenceThicknessMap,f.iridescenceThicknessMapTransform)}if(p.transmission>0){if(f.transmission.value=p.transmission,f.transmissionSamplerMap.value=A.texture,f.transmissionSamplerSize.value.set(A.width,A.height),p.transmissionMap)f.transmissionMap.value=p.transmissionMap,n(p.transmissionMap,f.transmissionMapTransform);if(f.thickness.value=p.thickness,p.thicknessMap)f.thicknessMap.value=p.thicknessMap,n(p.thicknessMap,f.thicknessMapTransform);f.attenuationDistance.value=p.attenuationDistance,f.attenuationColor.value.copy(p.attenuationColor)}if(p.anisotropy>0){if(f.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap)f.anisotropyMap.value=p.anisotropyMap,n(p.anisotropyMap,f.anisotropyMapTransform)}if(f.specularIntensity.value=p.specularIntensity,f.specularColor.value.copy(p.specularColor),p.specularColorMap)f.specularColorMap.value=p.specularColorMap,n(p.specularColorMap,f.specularColorMapTransform);if(p.specularIntensityMap)f.specularIntensityMap.value=p.specularIntensityMap,n(p.specularIntensityMap,f.specularIntensityMapTransform)}function _(f,p){if(p.matcap)f.matcap.value=p.matcap}function x(f,p){let A=t.get(p).light;f.referencePosition.value.setFromMatrixPosition(A.matrixWorld),f.nearDistance.value=A.shadow.camera.near,f.farDistance.value=A.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function O0(e,t,n,i){let s={},r={},a=[],o=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function l(A,b){let T=b.program;i.uniformBlockBinding(A,T)}function c(A,b){let T=s[A.id];if(T===void 0)_(A),T=h(A),s[A.id]=T,A.addEventListener("dispose",f);let I=b.program;i.updateUBOMapping(A,I);let E=t.render.frame;if(r[A.id]!==E)d(A),r[A.id]=E}function h(A){let b=u();A.__bindingPointIndex=b;let T=e.createBuffer(),{__size:I,usage:E}=A;return e.bindBuffer(e.UNIFORM_BUFFER,T),e.bufferData(e.UNIFORM_BUFFER,I,E),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,b,T),T}function u(){for(let A=0;A<o;A++)if(a.indexOf(A)===-1)return a.push(A),A;return Ie("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(A){let b=s[A.id],{uniforms:T,__cache:I}=A;e.bindBuffer(e.UNIFORM_BUFFER,b);for(let E=0,P=T.length;E<P;E++){let N=Array.isArray(T[E])?T[E]:[T[E]];for(let y=0,S=N.length;y<S;y++){let R=N[y];if(m(R,E,y,I)===!0){let k=R.__offset,X=Array.isArray(R.value)?R.value:[R.value],G=0;for(let K=0;K<X.length;K++){let H=X[K],O=x(H);if(typeof H==="number"||typeof H==="boolean")R.__data[0]=H,e.bufferSubData(e.UNIFORM_BUFFER,k+G,R.__data);else if(H.isMatrix3)R.__data[0]=H.elements[0],R.__data[1]=H.elements[1],R.__data[2]=H.elements[2],R.__data[3]=0,R.__data[4]=H.elements[3],R.__data[5]=H.elements[4],R.__data[6]=H.elements[5],R.__data[7]=0,R.__data[8]=H.elements[6],R.__data[9]=H.elements[7],R.__data[10]=H.elements[8],R.__data[11]=0;else H.toArray(R.__data,G),G+=O.storage/Float32Array.BYTES_PER_ELEMENT}e.bufferSubData(e.UNIFORM_BUFFER,k,R.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function m(A,b,T,I){let E=A.value,P=b+"_"+T;if(I[P]===void 0){if(typeof E==="number"||typeof E==="boolean")I[P]=E;else I[P]=E.clone();return!0}else{let N=I[P];if(typeof E==="number"||typeof E==="boolean"){if(N!==E)return I[P]=E,!0}else if(N.equals(E)===!1)return N.copy(E),!0}return!1}function _(A){let b=A.uniforms,T=0,I=16;for(let P=0,N=b.length;P<N;P++){let y=Array.isArray(b[P])?b[P]:[b[P]];for(let S=0,R=y.length;S<R;S++){let k=y[S],X=Array.isArray(k.value)?k.value:[k.value];for(let G=0,K=X.length;G<K;G++){let H=X[G],O=x(H),Y=T%I,ee=Y%O.boundary,ie=Y+ee;if(T+=ee,ie!==0&&I-ie<O.storage)T+=I-ie;k.__data=new Float32Array(O.storage/Float32Array.BYTES_PER_ELEMENT),k.__offset=T,T+=O.storage}}}let E=T%I;if(E>0)T+=I-E;return A.__size=T,A.__cache={},this}function x(A){let b={boundary:0,storage:0};if(typeof A==="number"||typeof A==="boolean")b.boundary=4,b.storage=4;else if(A.isVector2)b.boundary=8,b.storage=8;else if(A.isVector3||A.isColor)b.boundary=16,b.storage=12;else if(A.isVector4)b.boundary=16,b.storage=16;else if(A.isMatrix3)b.boundary=48,b.storage=48;else if(A.isMatrix4)b.boundary=64,b.storage=64;else if(A.isTexture)Me("WebGLRenderer: Texture samplers can not be part of an uniforms group.");else Me("WebGLRenderer: Unsupported uniform value type.",A);return b}function f(A){let b=A.target;b.removeEventListener("dispose",f);let T=a.indexOf(b.__bindingPointIndex);a.splice(T,1),e.deleteBuffer(s[b.id]),delete s[b.id],delete r[b.id]}function p(){for(let A in s)e.deleteBuffer(s[A]);a=[],s={},r={}}return{bind:l,update:c,dispose:p}}var B0=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),pn=null;function z0(){if(pn===null)pn=new Fs(B0,16,16,ji,Nn),pn.name="DFG_LUT",pn.minFilter=Tt,pn.magFilter=Tt,pn.wrapS=Ji,pn.wrapT=Ji,pn.generateMipmaps=!1,pn.needsUpdate=!0;return pn}class Al{constructor(e={}){let{canvas:t=xh(),context:n=null,depth:i=!0,stencil:s=!1,alpha:r=!1,antialias:a=!1,premultipliedAlpha:o=!0,preserveDrawingBuffer:l=!1,powerPreference:c="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:u=!1,outputBufferType:d=ln}=e;this.isWebGLRenderer=!0;let m;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=n.getContextAttributes().alpha}else m=r;let _=d,x=new Set([ho,co,lo]),f=new Set([ln,qn,Is,$i,ao,oo]),p=new Uint32Array(4),A=new Int32Array(4),b=null,T=null,I=[],E=[],P=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=an,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let N=this,y=!1;this._outputColorSpace=dn;let S=0,R=0,k=null,X=-1,G=null,K=new ct,H=new ct,O=null,Y=new Se(0),ee=0,{width:ie,height:fe}=t,Pe=1,ht=null,$e=null,Z=new ct(0,0,ie,fe),oe=new ct(0,0,ie,fe),se=!1,Te=new Bs,Ee=!1,Le=!1,ft=new Be,Ye=new D,Je=new ct,ke={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ce=!1;function ut(){return k===null?Pe:1}let w=n;function xt(v,L){return t.getContext(v,L)}try{let v={alpha:!0,depth:i,stencil:s,antialias:a,premultipliedAlpha:o,preserveDrawingBuffer:l,powerPreference:c,failIfMajorPerformanceCaveat:h};if("setAttribute"in t)t.setAttribute("data-engine",`three.js r${Ic}`);if(t.addEventListener("webglcontextlost",xe,!1),t.addEventListener("webglcontextrestored",Fe,!1),t.addEventListener("webglcontextcreationerror",ot,!1),w===null){if(w=xt("webgl2",v),w===null)if(xt("webgl2"))throw Error("Error creating WebGL context with your selected attributes.");else throw Error("Error creating WebGL context.")}}catch(v){throw Ie("WebGLRenderer: "+v.message),v}let Ue,it,be,at,M,g,F,q,J,W,ge,re,Ae,Ne,j,te,_e,ve,ue,He,C,ae,ne,pe;function Q(){if(Ue=new qm(w),Ue.init(),ae=new L0(w,Ue),it=new Om(w,Ue,e,ae),be=new I0(w,Ue),it.reversedDepthBuffer&&u)be.buffers.depth.setReversed(!0);at=new Jm(w),M=new m0,g=new P0(w,Ue,be,M,it,ae,at),F=new zm(N),q=new Xm(N),J=new jd(w),ne=new Um(w,J),W=new Ym(w,J,at,ne),ge=new $m(w,W,J,at),ue=new Km(w,it,g),te=new Bm(M),re=new p0(N,F,q,Ue,it,ne,te),Ae=new F0(N,M),Ne=new _0,j=new b0(Ue),ve=new Dm(N,F,q,be,ge,m,o),_e=new R0(N,ge,it),pe=new O0(w,at,it,be),He=new Fm(w,Ue,at),C=new Zm(w,Ue,at),at.programs=re.programs,N.capabilities=it,N.extensions=Ue,N.properties=M,N.renderLists=Ne,N.shadowMap=_e,N.state=be,N.info=at}if(Q(),_!==ln)P=new Qm(_,t.width,t.height,i,s);let V=new cu(N,w);this.xr=V,this.getContext=function(){return w},this.getContextAttributes=function(){return w.getContextAttributes()},this.forceContextLoss=function(){let v=Ue.get("WEBGL_lose_context");if(v)v.loseContext()},this.forceContextRestore=function(){let v=Ue.get("WEBGL_lose_context");if(v)v.restoreContext()},this.getPixelRatio=function(){return Pe},this.setPixelRatio=function(v){if(v===void 0)return;Pe=v,this.setSize(ie,fe,!1)},this.getSize=function(v){return v.set(ie,fe)},this.setSize=function(v,L,z=!0){if(V.isPresenting){Me("WebGLRenderer: Can't change size while VR device is presenting.");return}if(ie=v,fe=L,t.width=Math.floor(v*Pe),t.height=Math.floor(L*Pe),z===!0)t.style.width=v+"px",t.style.height=L+"px";if(P!==null)P.setSize(t.width,t.height);this.setViewport(0,0,v,L)},this.getDrawingBufferSize=function(v){return v.set(ie*Pe,fe*Pe).floor()},this.setDrawingBufferSize=function(v,L,z){ie=v,fe=L,Pe=z,t.width=Math.floor(v*z),t.height=Math.floor(L*z),this.setViewport(0,0,v,L)},this.setEffects=function(v){if(_===ln){console.error("THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(v){for(let L=0;L<v.length;L++)if(v[L].isOutputPass===!0){console.warn("THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}P.setEffects(v||[])},this.getCurrentViewport=function(v){return v.copy(K)},this.getViewport=function(v){return v.copy(Z)},this.setViewport=function(v,L,z,B){if(v.isVector4)Z.set(v.x,v.y,v.z,v.w);else Z.set(v,L,z,B);be.viewport(K.copy(Z).multiplyScalar(Pe).round())},this.getScissor=function(v){return v.copy(oe)},this.setScissor=function(v,L,z,B){if(v.isVector4)oe.set(v.x,v.y,v.z,v.w);else oe.set(v,L,z,B);be.scissor(H.copy(oe).multiplyScalar(Pe).round())},this.getScissorTest=function(){return se},this.setScissorTest=function(v){be.setScissorTest(se=v)},this.setOpaqueSort=function(v){ht=v},this.setTransparentSort=function(v){$e=v},this.getClearColor=function(v){return v.copy(ve.getClearColor())},this.setClearColor=function(){ve.setClearColor(...arguments)},this.getClearAlpha=function(){return ve.getClearAlpha()},this.setClearAlpha=function(){ve.setClearAlpha(...arguments)},this.clear=function(v=!0,L=!0,z=!0){let B=0;if(v){let U=!1;if(k!==null){let le=k.texture.format;U=x.has(le)}if(U){let le=k.texture.type,de=f.has(le),he=ve.getClearColor(),me=ve.getClearAlpha(),{r:ye,g:De,b:we}=he;if(de)p[0]=ye,p[1]=De,p[2]=we,p[3]=me,w.clearBufferuiv(w.COLOR,0,p);else A[0]=ye,A[1]=De,A[2]=we,A[3]=me,w.clearBufferiv(w.COLOR,0,A)}else B|=w.COLOR_BUFFER_BIT}if(L)B|=w.DEPTH_BUFFER_BIT;if(z)B|=w.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295);w.clear(B)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",xe,!1),t.removeEventListener("webglcontextrestored",Fe,!1),t.removeEventListener("webglcontextcreationerror",ot,!1),ve.dispose(),Ne.dispose(),j.dispose(),M.dispose(),F.dispose(),q.dispose(),ge.dispose(),ne.dispose(),pe.dispose(),re.dispose(),V.dispose(),V.removeEventListener("sessionstart",zl),V.removeEventListener("sessionend",kl),ti.stop()};function xe(v){v.preventDefault(),Ts("WebGLRenderer: Context Lost."),y=!0}function Fe(){Ts("WebGLRenderer: Context Restored."),y=!1;let v=at.autoReset,L=_e.enabled,z=_e.autoUpdate,B=_e.needsUpdate,U=_e.type;Q(),at.autoReset=v,_e.enabled=L,_e.autoUpdate=z,_e.needsUpdate=B,_e.type=U}function ot(v){Ie("WebGLRenderer: A WebGL context could not be created. Reason: ",v.statusMessage)}function je(v){let L=v.target;L.removeEventListener("dispose",je),xn(L)}function xn(v){vn(v),M.remove(v)}function vn(v){let L=M.get(v).programs;if(L!==void 0){if(L.forEach(function(z){re.releaseProgram(z)}),v.isShaderMaterial)re.releaseShaderCache(v)}}this.renderBufferDirect=function(v,L,z,B,U,le){if(L===null)L=ke;let de=U.isMesh&&U.matrixWorld.determinant()<0,he=Yu(v,L,z,B,U);be.setMaterial(B,de);let me=z.index,ye=1;if(B.wireframe===!0){if(me=W.getWireframeAttribute(z),me===void 0)return;ye=2}let De=z.drawRange,we=z.attributes.position,Ve=De.start*ye,nt=(De.start+De.count)*ye;if(le!==null)Ve=Math.max(Ve,le.start*ye),nt=Math.min(nt,(le.start+le.count)*ye);if(me!==null)Ve=Math.max(Ve,0),nt=Math.min(nt,me.count);else if(we!==void 0&&we!==null)Ve=Math.max(Ve,0),nt=Math.min(nt,we.count);let pt=nt-Ve;if(pt<0||pt===1/0)return;ne.setup(U,B,he,z,me);let mt,st=He;if(me!==null)mt=J.get(me),st=C,st.setIndex(mt);if(U.isMesh)if(B.wireframe===!0)be.setLineWidth(B.wireframeLinewidth*ut()),st.setMode(w.LINES);else st.setMode(w.TRIANGLES);else if(U.isLine){let Re=B.linewidth;if(Re===void 0)Re=1;if(be.setLineWidth(Re*ut()),U.isLineSegments)st.setMode(w.LINES);else if(U.isLineLoop)st.setMode(w.LINE_LOOP);else st.setMode(w.LINE_STRIP)}else if(U.isPoints)st.setMode(w.POINTS);else if(U.isSprite)st.setMode(w.TRIANGLES);if(U.isBatchedMesh)if(U._multiDrawInstances!==null)Xi("WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),st.renderMultiDrawInstances(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount,U._multiDrawInstances);else if(!Ue.get("WEBGL_multi_draw")){let{_multiDrawStarts:Re,_multiDrawCounts:Qe,_multiDrawCount:Ze}=U,Bt=me?J.get(me).bytesPerElement:1,bi=M.get(B).currentProgram.getUniforms();for(let zt=0;zt<Ze;zt++)bi.setValue(w,"_gl_DrawID",zt),st.render(Re[zt]/Bt,Qe[zt])}else st.renderMultiDraw(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount);else if(U.isInstancedMesh)st.renderInstances(Ve,pt,U.count);else if(z.isInstancedBufferGeometry){let Re=z._maxInstanceCount!==void 0?z._maxInstanceCount:1/0,Qe=Math.min(z.instanceCount,Re);st.renderInstances(Ve,pt,Qe)}else st.render(Ve,pt)};function Bl(v,L,z){if(v.transparent===!0&&v.side===Kt&&v.forceSinglePass===!1)v.side=Pt,v.needsUpdate=!0,$s(v,L,z),v.side=Wn,v.needsUpdate=!0,$s(v,L,z),v.side=Kt;else $s(v,L,z)}this.compile=function(v,L,z=null){if(z===null)z=v;if(T=j.get(z),T.init(L),E.push(T),z.traverseVisible(function(U){if(U.isLight&&U.layers.test(L.layers)){if(T.pushLight(U),U.castShadow)T.pushShadow(U)}}),v!==z)v.traverseVisible(function(U){if(U.isLight&&U.layers.test(L.layers)){if(T.pushLight(U),U.castShadow)T.pushShadow(U)}});T.setupLights();let B=new Set;return v.traverse(function(U){if(!(U.isMesh||U.isPoints||U.isLine||U.isSprite))return;let le=U.material;if(le)if(Array.isArray(le))for(let de=0;de<le.length;de++){let he=le[de];Bl(he,z,U),B.add(he)}else Bl(le,z,U),B.add(le)}),T=E.pop(),B},this.compileAsync=function(v,L,z=null){let B=this.compile(v,L,z);return new Promise((U)=>{function le(){if(B.forEach(function(de){if(M.get(de).currentProgram.isReady())B.delete(de)}),B.size===0){U(v);return}setTimeout(le,10)}if(Ue.get("KHR_parallel_shader_compile")!==null)le();else setTimeout(le,10)})};let xa=null;function qu(v){if(xa)xa(v)}function zl(){ti.stop()}function kl(){ti.start()}let ti=new jh;if(ti.setAnimationLoop(qu),typeof self<"u")ti.setContext(self);this.setAnimationLoop=function(v){xa=v,V.setAnimationLoop(v),v===null?ti.stop():ti.start()},V.addEventListener("sessionstart",zl),V.addEventListener("sessionend",kl),this.render=function(v,L){if(L!==void 0&&L.isCamera!==!0){Ie("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(y===!0)return;let z=V.enabled===!0&&V.isPresenting===!0,B=P!==null&&(k===null||z)&&P.begin(N,k);if(v.matrixWorldAutoUpdate===!0)v.updateMatrixWorld();if(L.parent===null&&L.matrixWorldAutoUpdate===!0)L.updateMatrixWorld();if(V.enabled===!0&&V.isPresenting===!0&&(P===null||P.isCompositing()===!1)){if(V.cameraAutoUpdate===!0)V.updateCamera(L);L=V.getCamera()}if(v.isScene===!0)v.onBeforeRender(N,v,L,k);if(T=j.get(v,E.length),T.init(L),E.push(T),ft.multiplyMatrices(L.projectionMatrix,L.matrixWorldInverse),Te.setFromProjectionMatrix(ft,Zo,L.reversedDepth),Le=this.localClippingEnabled,Ee=te.init(this.clippingPlanes,Le),b=Ne.get(v,I.length),b.init(),I.push(b),V.enabled===!0&&V.isPresenting===!0){let de=N.xr.getDepthSensingMesh();if(de!==null)va(de,L,-1/0,N.sortObjects)}if(va(v,L,0,N.sortObjects),b.finish(),N.sortObjects===!0)b.sort(ht,$e);if(Ce=V.enabled===!1||V.isPresenting===!1||V.hasDepthSensing()===!1,Ce)ve.addToRenderList(b,v);if(this.info.render.frame++,Ee===!0)te.beginShadows();let U=T.state.shadowsArray;if(_e.render(U,v,L),Ee===!0)te.endShadows();if(this.info.autoReset===!0)this.info.reset();if((B&&P.hasRenderPass())===!1){let de=b.opaque,he=b.transmissive;if(T.setupLights(),L.isArrayCamera){let me=L.cameras;if(he.length>0)for(let ye=0,De=me.length;ye<De;ye++){let we=me[ye];Hl(de,he,v,we)}if(Ce)ve.render(v);for(let ye=0,De=me.length;ye<De;ye++){let we=me[ye];Gl(b,v,we,we.viewport)}}else{if(he.length>0)Hl(de,he,v,L);if(Ce)ve.render(v);Gl(b,v,L)}}if(k!==null&&R===0)g.updateMultisampleRenderTarget(k),g.updateRenderTargetMipmap(k);if(B)P.end(N);if(v.isScene===!0)v.onAfterRender(N,v,L);if(ne.resetDefaultState(),X=-1,G=null,E.pop(),E.length>0){if(T=E[E.length-1],Ee===!0)te.setGlobalState(N.clippingPlanes,T.state.camera)}else T=null;if(I.pop(),I.length>0)b=I[I.length-1];else b=null};function va(v,L,z,B){if(v.visible===!1)return;if(v.layers.test(L.layers)){if(v.isGroup)z=v.renderOrder;else if(v.isLOD){if(v.autoUpdate===!0)v.update(L)}else if(v.isLight){if(T.pushLight(v),v.castShadow)T.pushShadow(v)}else if(v.isSprite){if(!v.frustumCulled||Te.intersectsSprite(v)){if(B)Je.setFromMatrixPosition(v.matrixWorld).applyMatrix4(ft);let de=ge.update(v),he=v.material;if(he.visible)b.push(v,de,he,z,Je.z,null)}}else if(v.isMesh||v.isLine||v.isPoints){if(!v.frustumCulled||Te.intersectsObject(v)){let de=ge.update(v),he=v.material;if(B){if(v.boundingSphere!==void 0){if(v.boundingSphere===null)v.computeBoundingSphere();Je.copy(v.boundingSphere.center)}else{if(de.boundingSphere===null)de.computeBoundingSphere();Je.copy(de.boundingSphere.center)}Je.applyMatrix4(v.matrixWorld).applyMatrix4(ft)}if(Array.isArray(he)){let me=de.groups;for(let ye=0,De=me.length;ye<De;ye++){let we=me[ye],Ve=he[we.materialIndex];if(Ve&&Ve.visible)b.push(v,de,Ve,z,Je.z,we)}}else if(he.visible)b.push(v,de,he,z,Je.z,null)}}}let le=v.children;for(let de=0,he=le.length;de<he;de++)va(le[de],L,z,B)}function Gl(v,L,z,B){let{opaque:U,transmissive:le,transparent:de}=v;if(T.setupLightsView(z),Ee===!0)te.setGlobalState(N.clippingPlanes,z);if(B)be.viewport(K.copy(B));if(U.length>0)Ks(U,L,z);if(le.length>0)Ks(le,L,z);if(de.length>0)Ks(de,L,z);be.buffers.depth.setTest(!0),be.buffers.depth.setMask(!0),be.buffers.color.setMask(!0),be.setPolygonOffset(!1)}function Hl(v,L,z,B){if((z.isScene===!0?z.overrideMaterial:null)!==null)return;if(T.state.transmissionRenderTarget[B.id]===void 0){let Ve=Ue.has("EXT_color_buffer_half_float")||Ue.has("EXT_color_buffer_float");T.state.transmissionRenderTarget[B.id]=new $t(1,1,{generateMipmaps:!0,type:Ve?Nn:ln,minFilter:Pn,samples:it.samples,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:We.workingColorSpace})}let le=T.state.transmissionRenderTarget[B.id],de=B.viewport||K;le.setSize(de.z*N.transmissionResolutionScale,de.w*N.transmissionResolutionScale);let he=N.getRenderTarget(),me=N.getActiveCubeFace(),ye=N.getActiveMipmapLevel();if(N.setRenderTarget(le),N.getClearColor(Y),ee=N.getClearAlpha(),ee<1)N.setClearColor(16777215,0.5);if(N.clear(),Ce)ve.render(z);let De=N.toneMapping;N.toneMapping=an;let we=B.viewport;if(B.viewport!==void 0)B.viewport=void 0;if(T.setupLightsView(B),Ee===!0)te.setGlobalState(N.clippingPlanes,B);if(Ks(v,z,B),g.updateMultisampleRenderTarget(le),g.updateRenderTargetMipmap(le),Ue.has("WEBGL_multisampled_render_to_texture")===!1){let Ve=!1;for(let nt=0,pt=L.length;nt<pt;nt++){let mt=L[nt],{object:st,geometry:Re,material:Qe,group:Ze}=mt;if(Qe.side===Kt&&st.layers.test(B.layers)){let Bt=Qe.side;Qe.side=Pt,Qe.needsUpdate=!0,Vl(st,z,B,Re,Qe,Ze),Qe.side=Bt,Qe.needsUpdate=!0,Ve=!0}}if(Ve===!0)g.updateMultisampleRenderTarget(le),g.updateRenderTargetMipmap(le)}if(N.setRenderTarget(he,me,ye),N.setClearColor(Y,ee),we!==void 0)B.viewport=we;N.toneMapping=De}function Ks(v,L,z){let B=L.isScene===!0?L.overrideMaterial:null;for(let U=0,le=v.length;U<le;U++){let de=v[U],{object:he,geometry:me,group:ye}=de,De=de.material;if(De.allowOverride===!0&&B!==null)De=B;if(he.layers.test(z.layers))Vl(he,L,z,me,De,ye)}}function Vl(v,L,z,B,U,le){if(v.onBeforeRender(N,L,z,B,U,le),v.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse,v.matrixWorld),v.normalMatrix.getNormalMatrix(v.modelViewMatrix),U.onBeforeRender(N,L,z,B,v,le),U.transparent===!0&&U.side===Kt&&U.forceSinglePass===!1)U.side=Pt,U.needsUpdate=!0,N.renderBufferDirect(z,L,B,U,v,le),U.side=Wn,U.needsUpdate=!0,N.renderBufferDirect(z,L,B,U,v,le),U.side=Kt;else N.renderBufferDirect(z,L,B,U,v,le);v.onAfterRender(N,L,z,B,U,le)}function $s(v,L,z){if(L.isScene!==!0)L=ke;let B=M.get(v),U=T.state.lights,le=T.state.shadowsArray,de=U.state.version,he=re.getParameters(v,U.state,le,L,z),me=re.getProgramCacheKey(he),ye=B.programs;if(B.environment=v.isMeshStandardMaterial?L.environment:null,B.fog=L.fog,B.envMap=(v.isMeshStandardMaterial?q:F).get(v.envMap||B.environment),B.envMapRotation=B.environment!==null&&v.envMap===null?L.environmentRotation:v.envMapRotation,ye===void 0)v.addEventListener("dispose",je),ye=new Map,B.programs=ye;let De=ye.get(me);if(De!==void 0){if(B.currentProgram===De&&B.lightsStateVersion===de)return Xl(v,he),De}else he.uniforms=re.getUniforms(v),v.onBeforeCompile(he,N),De=re.acquireProgram(he,me),ye.set(me,De),B.uniforms=he.uniforms;let we=B.uniforms;if(!v.isShaderMaterial&&!v.isRawShaderMaterial||v.clipping===!0)we.clippingPlanes=te.uniform;if(Xl(v,he),B.needsLights=Ju(v),B.lightsStateVersion=de,B.needsLights)we.ambientLightColor.value=U.state.ambient,we.lightProbe.value=U.state.probe,we.directionalLights.value=U.state.directional,we.directionalLightShadows.value=U.state.directionalShadow,we.spotLights.value=U.state.spot,we.spotLightShadows.value=U.state.spotShadow,we.rectAreaLights.value=U.state.rectArea,we.ltc_1.value=U.state.rectAreaLTC1,we.ltc_2.value=U.state.rectAreaLTC2,we.pointLights.value=U.state.point,we.pointLightShadows.value=U.state.pointShadow,we.hemisphereLights.value=U.state.hemi,we.directionalShadowMap.value=U.state.directionalShadowMap,we.directionalShadowMatrix.value=U.state.directionalShadowMatrix,we.spotShadowMap.value=U.state.spotShadowMap,we.spotLightMatrix.value=U.state.spotLightMatrix,we.spotLightMap.value=U.state.spotLightMap,we.pointShadowMap.value=U.state.pointShadowMap,we.pointShadowMatrix.value=U.state.pointShadowMatrix;return B.currentProgram=De,B.uniformsList=null,De}function Wl(v){if(v.uniformsList===null){let L=v.currentProgram.getUniforms();v.uniformsList=Ys.seqWithValue(L.seq,v.uniforms)}return v.uniformsList}function Xl(v,L){let z=M.get(v);z.outputColorSpace=L.outputColorSpace,z.batching=L.batching,z.batchingColor=L.batchingColor,z.instancing=L.instancing,z.instancingColor=L.instancingColor,z.instancingMorph=L.instancingMorph,z.skinning=L.skinning,z.morphTargets=L.morphTargets,z.morphNormals=L.morphNormals,z.morphColors=L.morphColors,z.morphTargetsCount=L.morphTargetsCount,z.numClippingPlanes=L.numClippingPlanes,z.numIntersection=L.numClipIntersection,z.vertexAlphas=L.vertexAlphas,z.vertexTangents=L.vertexTangents,z.toneMapping=L.toneMapping}function Yu(v,L,z,B,U){if(L.isScene!==!0)L=ke;g.resetTextureUnits();let le=L.fog,de=B.isMeshStandardMaterial?L.environment:null,he=k===null?N.outputColorSpace:k.isXRRenderTarget===!0?k.texture.colorSpace:Lt,me=(B.isMeshStandardMaterial?q:F).get(B.envMap||de),ye=B.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,De=!!z.attributes.tangent&&(!!B.normalMap||B.anisotropy>0),we=!!z.morphAttributes.position,Ve=!!z.morphAttributes.normal,nt=!!z.morphAttributes.color,pt=an;if(B.toneMapped){if(k===null||k.isXRRenderTarget===!0)pt=N.toneMapping}let mt=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,st=mt!==void 0?mt.length:0,Re=M.get(B),Qe=T.state.lights;if(Ee===!0){if(Le===!0||v!==G){let Ct=v===G&&B.id===X;te.setState(B,v,Ct)}}let Ze=!1;if(B.version===Re.__version){if(Re.needsLights&&Re.lightsStateVersion!==Qe.state.version)Ze=!0;else if(Re.outputColorSpace!==he)Ze=!0;else if(U.isBatchedMesh&&Re.batching===!1)Ze=!0;else if(!U.isBatchedMesh&&Re.batching===!0)Ze=!0;else if(U.isBatchedMesh&&Re.batchingColor===!0&&U.colorTexture===null)Ze=!0;else if(U.isBatchedMesh&&Re.batchingColor===!1&&U.colorTexture!==null)Ze=!0;else if(U.isInstancedMesh&&Re.instancing===!1)Ze=!0;else if(!U.isInstancedMesh&&Re.instancing===!0)Ze=!0;else if(U.isSkinnedMesh&&Re.skinning===!1)Ze=!0;else if(!U.isSkinnedMesh&&Re.skinning===!0)Ze=!0;else if(U.isInstancedMesh&&Re.instancingColor===!0&&U.instanceColor===null)Ze=!0;else if(U.isInstancedMesh&&Re.instancingColor===!1&&U.instanceColor!==null)Ze=!0;else if(U.isInstancedMesh&&Re.instancingMorph===!0&&U.morphTexture===null)Ze=!0;else if(U.isInstancedMesh&&Re.instancingMorph===!1&&U.morphTexture!==null)Ze=!0;else if(Re.envMap!==me)Ze=!0;else if(B.fog===!0&&Re.fog!==le)Ze=!0;else if(Re.numClippingPlanes!==void 0&&(Re.numClippingPlanes!==te.numPlanes||Re.numIntersection!==te.numIntersection))Ze=!0;else if(Re.vertexAlphas!==ye)Ze=!0;else if(Re.vertexTangents!==De)Ze=!0;else if(Re.morphTargets!==we)Ze=!0;else if(Re.morphNormals!==Ve)Ze=!0;else if(Re.morphColors!==nt)Ze=!0;else if(Re.toneMapping!==pt)Ze=!0;else if(Re.morphTargetsCount!==st)Ze=!0}else Ze=!0,Re.__version=B.version;let Bt=Re.currentProgram;if(Ze===!0)Bt=$s(B,L,U);let bi=!1,zt=!1,us=!1,lt=Bt.getUniforms(),Dt=Re.uniforms;if(be.useProgram(Bt.program))bi=!0,zt=!0,us=!0;if(B.id!==X)X=B.id,zt=!0;if(bi||G!==v){if(be.buffers.depth.getReversed()&&v.reversedDepth!==!0)v._reversedDepth=!0,v.updateProjectionMatrix();lt.setValue(w,"projectionMatrix",v.projectionMatrix),lt.setValue(w,"viewMatrix",v.matrixWorldInverse);let Ut=lt.map.cameraPosition;if(Ut!==void 0)Ut.setValue(w,Ye.setFromMatrixPosition(v.matrixWorld));if(it.logarithmicDepthBuffer)lt.setValue(w,"logDepthBufFC",2/(Math.log(v.far+1)/Math.LN2));if(B.isMeshPhongMaterial||B.isMeshToonMaterial||B.isMeshLambertMaterial||B.isMeshBasicMaterial||B.isMeshStandardMaterial||B.isShaderMaterial)lt.setValue(w,"isOrthographic",v.isOrthographicCamera===!0);if(G!==v)G=v,zt=!0,us=!0}if(Re.needsLights){if(Qe.state.directionalShadowMap.length>0)lt.setValue(w,"directionalShadowMap",Qe.state.directionalShadowMap,g);if(Qe.state.spotShadowMap.length>0)lt.setValue(w,"spotShadowMap",Qe.state.spotShadowMap,g);if(Qe.state.pointShadowMap.length>0)lt.setValue(w,"pointShadowMap",Qe.state.pointShadowMap,g)}if(U.isSkinnedMesh){lt.setOptional(w,U,"bindMatrix"),lt.setOptional(w,U,"bindMatrixInverse");let Ct=U.skeleton;if(Ct){if(Ct.boneTexture===null)Ct.computeBoneTexture();lt.setValue(w,"boneTexture",Ct.boneTexture,g)}}if(U.isBatchedMesh){if(lt.setOptional(w,U,"batchingTexture"),lt.setValue(w,"batchingTexture",U._matricesTexture,g),lt.setOptional(w,U,"batchingIdTexture"),lt.setValue(w,"batchingIdTexture",U._indirectTexture,g),lt.setOptional(w,U,"batchingColorTexture"),U._colorsTexture!==null)lt.setValue(w,"batchingColorTexture",U._colorsTexture,g)}let qt=z.morphAttributes;if(qt.position!==void 0||qt.normal!==void 0||qt.color!==void 0)ue.update(U,z,Bt);if(zt||Re.receiveShadow!==U.receiveShadow)Re.receiveShadow=U.receiveShadow,lt.setValue(w,"receiveShadow",U.receiveShadow);if(B.isMeshGouraudMaterial&&B.envMap!==null)Dt.envMap.value=me,Dt.flipEnvMap.value=me.isCubeTexture&&me.isRenderTargetTexture===!1?-1:1;if(B.isMeshStandardMaterial&&B.envMap===null&&L.environment!==null)Dt.envMapIntensity.value=L.environmentIntensity;if(Dt.dfgLUT!==void 0)Dt.dfgLUT.value=z0();if(zt){if(lt.setValue(w,"toneMappingExposure",N.toneMappingExposure),Re.needsLights)Zu(Dt,us);if(le&&B.fog===!0)Ae.refreshFogUniforms(Dt,le);Ae.refreshMaterialUniforms(Dt,B,Pe,fe,T.state.transmissionRenderTarget[v.id]),Ys.upload(w,Wl(Re),Dt,g)}if(B.isShaderMaterial&&B.uniformsNeedUpdate===!0)Ys.upload(w,Wl(Re),Dt,g),B.uniformsNeedUpdate=!1;if(B.isSpriteMaterial)lt.setValue(w,"center",U.center);if(lt.setValue(w,"modelViewMatrix",U.modelViewMatrix),lt.setValue(w,"normalMatrix",U.normalMatrix),lt.setValue(w,"modelMatrix",U.matrixWorld),B.isShaderMaterial||B.isRawShaderMaterial){let Ct=B.uniformsGroups;for(let Ut=0,ya=Ct.length;Ut<ya;Ut++){let ni=Ct[Ut];pe.update(ni,Bt),pe.bind(ni,Bt)}}return Bt}function Zu(v,L){v.ambientLightColor.needsUpdate=L,v.lightProbe.needsUpdate=L,v.directionalLights.needsUpdate=L,v.directionalLightShadows.needsUpdate=L,v.pointLights.needsUpdate=L,v.pointLightShadows.needsUpdate=L,v.spotLights.needsUpdate=L,v.spotLightShadows.needsUpdate=L,v.rectAreaLights.needsUpdate=L,v.hemisphereLights.needsUpdate=L}function Ju(v){return v.isMeshLambertMaterial||v.isMeshToonMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isShadowMaterial||v.isShaderMaterial&&v.lights===!0}this.getActiveCubeFace=function(){return S},this.getActiveMipmapLevel=function(){return R},this.getRenderTarget=function(){return k},this.setRenderTargetTextures=function(v,L,z){let B=M.get(v);if(B.__autoAllocateDepthBuffer=v.resolveDepthBuffer===!1,B.__autoAllocateDepthBuffer===!1)B.__useRenderToTexture=!1;M.get(v.texture).__webglTexture=L,M.get(v.depthTexture).__webglTexture=B.__autoAllocateDepthBuffer?void 0:z,B.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(v,L){let z=M.get(v);z.__webglFramebuffer=L,z.__useDefaultFramebuffer=L===void 0};let Ku=w.createFramebuffer();this.setRenderTarget=function(v,L=0,z=0){k=v,S=L,R=z;let B=null,U=!1,le=!1;if(v){let he=M.get(v);if(he.__useDefaultFramebuffer!==void 0){be.bindFramebuffer(w.FRAMEBUFFER,he.__webglFramebuffer),K.copy(v.viewport),H.copy(v.scissor),O=v.scissorTest,be.viewport(K),be.scissor(H),be.setScissorTest(O),X=-1;return}else if(he.__webglFramebuffer===void 0)g.setupRenderTarget(v);else if(he.__hasExternalTextures)g.rebindTextures(v,M.get(v.texture).__webglTexture,M.get(v.depthTexture).__webglTexture);else if(v.depthBuffer){let De=v.depthTexture;if(he.__boundDepthTexture!==De){if(De!==null&&M.has(De)&&(v.width!==De.image.width||v.height!==De.image.height))throw Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");g.setupDepthRenderbuffer(v)}}let me=v.texture;if(me.isData3DTexture||me.isDataArrayTexture||me.isCompressedArrayTexture)le=!0;let ye=M.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget){if(Array.isArray(ye[L]))B=ye[L][z];else B=ye[L];U=!0}else if(v.samples>0&&g.useMultisampledRTT(v)===!1)B=M.get(v).__webglMultisampledFramebuffer;else if(Array.isArray(ye))B=ye[z];else B=ye;K.copy(v.viewport),H.copy(v.scissor),O=v.scissorTest}else K.copy(Z).multiplyScalar(Pe).floor(),H.copy(oe).multiplyScalar(Pe).floor(),O=se;if(z!==0)B=Ku;if(be.bindFramebuffer(w.FRAMEBUFFER,B))be.drawBuffers(v,B);if(be.viewport(K),be.scissor(H),be.setScissorTest(O),U){let he=M.get(v.texture);w.framebufferTexture2D(w.FRAMEBUFFER,w.COLOR_ATTACHMENT0,w.TEXTURE_CUBE_MAP_POSITIVE_X+L,he.__webglTexture,z)}else if(le){let he=L;for(let me=0;me<v.textures.length;me++){let ye=M.get(v.textures[me]);w.framebufferTextureLayer(w.FRAMEBUFFER,w.COLOR_ATTACHMENT0+me,ye.__webglTexture,z,he)}}else if(v!==null&&z!==0){let he=M.get(v.texture);w.framebufferTexture2D(w.FRAMEBUFFER,w.COLOR_ATTACHMENT0,w.TEXTURE_2D,he.__webglTexture,z)}X=-1},this.readRenderTargetPixels=function(v,L,z,B,U,le,de,he=0){if(!(v&&v.isWebGLRenderTarget)){Ie("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let me=M.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&de!==void 0)me=me[de];if(me){be.bindFramebuffer(w.FRAMEBUFFER,me);try{let ye=v.textures[he],{format:De,type:we}=ye;if(!it.textureFormatReadable(De)){Ie("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!it.textureTypeReadable(we)){Ie("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}if(L>=0&&L<=v.width-B&&(z>=0&&z<=v.height-U)){if(v.textures.length>1)w.readBuffer(w.COLOR_ATTACHMENT0+he);w.readPixels(L,z,B,U,ae.convert(De),ae.convert(we),le)}}finally{let ye=k!==null?M.get(k).__webglFramebuffer:null;be.bindFramebuffer(w.FRAMEBUFFER,ye)}}},this.readRenderTargetPixelsAsync=async function(v,L,z,B,U,le,de,he=0){if(!(v&&v.isWebGLRenderTarget))throw Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let me=M.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&de!==void 0)me=me[de];if(me)if(L>=0&&L<=v.width-B&&(z>=0&&z<=v.height-U)){be.bindFramebuffer(w.FRAMEBUFFER,me);let ye=v.textures[he],{format:De,type:we}=ye;if(!it.textureFormatReadable(De))throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!it.textureTypeReadable(we))throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Ve=w.createBuffer();if(w.bindBuffer(w.PIXEL_PACK_BUFFER,Ve),w.bufferData(w.PIXEL_PACK_BUFFER,le.byteLength,w.STREAM_READ),v.textures.length>1)w.readBuffer(w.COLOR_ATTACHMENT0+he);w.readPixels(L,z,B,U,ae.convert(De),ae.convert(we),0);let nt=k!==null?M.get(k).__webglFramebuffer:null;be.bindFramebuffer(w.FRAMEBUFFER,nt);let pt=w.fenceSync(w.SYNC_GPU_COMMANDS_COMPLETE,0);return w.flush(),await vh(w,pt,4),w.bindBuffer(w.PIXEL_PACK_BUFFER,Ve),w.getBufferSubData(w.PIXEL_PACK_BUFFER,0,le),w.deleteBuffer(Ve),w.deleteSync(pt),le}else throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(v,L=null,z=0){let B=Math.pow(2,-z),U=Math.floor(v.image.width*B),le=Math.floor(v.image.height*B),de=L!==null?L.x:0,he=L!==null?L.y:0;g.setTexture2D(v,0),w.copyTexSubImage2D(w.TEXTURE_2D,z,0,0,de,he,U,le),be.unbindTexture()};let $u=w.createFramebuffer(),ju=w.createFramebuffer();if(this.copyTextureToTexture=function(v,L,z=null,B=null,U=0,le=null){if(le===null)if(U!==0)Xi("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),le=U,U=0;else le=0;let de,he,me,ye,De,we,Ve,nt,pt,mt=v.isCompressedTexture?v.mipmaps[le]:v.image;if(z!==null)de=z.max.x-z.min.x,he=z.max.y-z.min.y,me=z.isBox3?z.max.z-z.min.z:1,ye=z.min.x,De=z.min.y,we=z.isBox3?z.min.z:0;else{let qt=Math.pow(2,-U);if(de=Math.floor(mt.width*qt),he=Math.floor(mt.height*qt),v.isDataArrayTexture)me=mt.depth;else if(v.isData3DTexture)me=Math.floor(mt.depth*qt);else me=1;ye=0,De=0,we=0}if(B!==null)Ve=B.x,nt=B.y,pt=B.z;else Ve=0,nt=0,pt=0;let st=ae.convert(L.format),Re=ae.convert(L.type),Qe;if(L.isData3DTexture)g.setTexture3D(L,0),Qe=w.TEXTURE_3D;else if(L.isDataArrayTexture||L.isCompressedArrayTexture)g.setTexture2DArray(L,0),Qe=w.TEXTURE_2D_ARRAY;else g.setTexture2D(L,0),Qe=w.TEXTURE_2D;w.pixelStorei(w.UNPACK_FLIP_Y_WEBGL,L.flipY),w.pixelStorei(w.UNPACK_PREMULTIPLY_ALPHA_WEBGL,L.premultiplyAlpha),w.pixelStorei(w.UNPACK_ALIGNMENT,L.unpackAlignment);let Ze=w.getParameter(w.UNPACK_ROW_LENGTH),Bt=w.getParameter(w.UNPACK_IMAGE_HEIGHT),bi=w.getParameter(w.UNPACK_SKIP_PIXELS),zt=w.getParameter(w.UNPACK_SKIP_ROWS),us=w.getParameter(w.UNPACK_SKIP_IMAGES);w.pixelStorei(w.UNPACK_ROW_LENGTH,mt.width),w.pixelStorei(w.UNPACK_IMAGE_HEIGHT,mt.height),w.pixelStorei(w.UNPACK_SKIP_PIXELS,ye),w.pixelStorei(w.UNPACK_SKIP_ROWS,De),w.pixelStorei(w.UNPACK_SKIP_IMAGES,we);let lt=v.isDataArrayTexture||v.isData3DTexture,Dt=L.isDataArrayTexture||L.isData3DTexture;if(v.isDepthTexture){let qt=M.get(v),Ct=M.get(L),Ut=M.get(qt.__renderTarget),ya=M.get(Ct.__renderTarget);be.bindFramebuffer(w.READ_FRAMEBUFFER,Ut.__webglFramebuffer),be.bindFramebuffer(w.DRAW_FRAMEBUFFER,ya.__webglFramebuffer);for(let ni=0;ni<me;ni++){if(lt)w.framebufferTextureLayer(w.READ_FRAMEBUFFER,w.COLOR_ATTACHMENT0,M.get(v).__webglTexture,U,we+ni),w.framebufferTextureLayer(w.DRAW_FRAMEBUFFER,w.COLOR_ATTACHMENT0,M.get(L).__webglTexture,le,pt+ni);w.blitFramebuffer(ye,De,de,he,Ve,nt,de,he,w.DEPTH_BUFFER_BIT,w.NEAREST)}be.bindFramebuffer(w.READ_FRAMEBUFFER,null),be.bindFramebuffer(w.DRAW_FRAMEBUFFER,null)}else if(U!==0||v.isRenderTargetTexture||M.has(v)){let qt=M.get(v),Ct=M.get(L);be.bindFramebuffer(w.READ_FRAMEBUFFER,$u),be.bindFramebuffer(w.DRAW_FRAMEBUFFER,ju);for(let Ut=0;Ut<me;Ut++){if(lt)w.framebufferTextureLayer(w.READ_FRAMEBUFFER,w.COLOR_ATTACHMENT0,qt.__webglTexture,U,we+Ut);else w.framebufferTexture2D(w.READ_FRAMEBUFFER,w.COLOR_ATTACHMENT0,w.TEXTURE_2D,qt.__webglTexture,U);if(Dt)w.framebufferTextureLayer(w.DRAW_FRAMEBUFFER,w.COLOR_ATTACHMENT0,Ct.__webglTexture,le,pt+Ut);else w.framebufferTexture2D(w.DRAW_FRAMEBUFFER,w.COLOR_ATTACHMENT0,w.TEXTURE_2D,Ct.__webglTexture,le);if(U!==0)w.blitFramebuffer(ye,De,de,he,Ve,nt,de,he,w.COLOR_BUFFER_BIT,w.NEAREST);else if(Dt)w.copyTexSubImage3D(Qe,le,Ve,nt,pt+Ut,ye,De,de,he);else w.copyTexSubImage2D(Qe,le,Ve,nt,ye,De,de,he)}be.bindFramebuffer(w.READ_FRAMEBUFFER,null),be.bindFramebuffer(w.DRAW_FRAMEBUFFER,null)}else if(Dt)if(v.isDataTexture||v.isData3DTexture)w.texSubImage3D(Qe,le,Ve,nt,pt,de,he,me,st,Re,mt.data);else if(L.isCompressedArrayTexture)w.compressedTexSubImage3D(Qe,le,Ve,nt,pt,de,he,me,st,mt.data);else w.texSubImage3D(Qe,le,Ve,nt,pt,de,he,me,st,Re,mt);else if(v.isDataTexture)w.texSubImage2D(w.TEXTURE_2D,le,Ve,nt,de,he,st,Re,mt.data);else if(v.isCompressedTexture)w.compressedTexSubImage2D(w.TEXTURE_2D,le,Ve,nt,mt.width,mt.height,st,mt.data);else w.texSubImage2D(w.TEXTURE_2D,le,Ve,nt,de,he,st,Re,mt);if(w.pixelStorei(w.UNPACK_ROW_LENGTH,Ze),w.pixelStorei(w.UNPACK_IMAGE_HEIGHT,Bt),w.pixelStorei(w.UNPACK_SKIP_PIXELS,bi),w.pixelStorei(w.UNPACK_SKIP_ROWS,zt),w.pixelStorei(w.UNPACK_SKIP_IMAGES,us),le===0&&L.generateMipmaps)w.generateMipmap(Qe);be.unbindTexture()},this.initRenderTarget=function(v){if(M.get(v).__webglFramebuffer===void 0)g.setupRenderTarget(v)},this.initTexture=function(v){if(v.isCubeTexture)g.setTextureCube(v,0);else if(v.isData3DTexture)g.setTexture3D(v,0);else if(v.isDataArrayTexture||v.isCompressedArrayTexture)g.setTexture2DArray(v,0);else g.setTexture2D(v,0);be.unbindTexture()},this.resetState=function(){S=0,R=0,k=null,be.reset(),ne.reset()},typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Zo}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=We._getDrawingBufferColorSpace(e),t.unpackColorSpace=We._getUnpackColorSpace()}}function El(e,t){if(t===Xo)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),e;if(t===Qi||t===Ps){let n=e.getIndex();if(n===null){let a=[],o=e.getAttribute("position");if(o!==void 0){for(let l=0;l<o.count;l++)a.push(l);e.setIndex(a),n=e.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),e}let i=n.count-2,s=[];if(t===Qi)for(let a=1;a<=i;a++)s.push(n.getX(0)),s.push(n.getX(a)),s.push(n.getX(a+1));else for(let a=0;a<i;a++)if(a%2===0)s.push(n.getX(a)),s.push(n.getX(a+1)),s.push(n.getX(a+2));else s.push(n.getX(a+2)),s.push(n.getX(a+1)),s.push(n.getX(a));if(s.length/3!==i)console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");let r=e.clone();return r.setIndex(s),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",t),e}class Ll extends Fn{constructor(e){super(e);this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new _u(t)}),this.register(function(t){return new xu(t)}),this.register(function(t){return new wu(t)}),this.register(function(t){return new Ru(t)}),this.register(function(t){return new Cu(t)}),this.register(function(t){return new yu(t)}),this.register(function(t){return new Mu(t)}),this.register(function(t){return new Su(t)}),this.register(function(t){return new bu(t)}),this.register(function(t){return new gu(t)}),this.register(function(t){return new Tu(t)}),this.register(function(t){return new vu(t)}),this.register(function(t){return new Eu(t)}),this.register(function(t){return new Au(t)}),this.register(function(t){return new pu(t)}),this.register(function(t){return new Iu(t)}),this.register(function(t){return new Pu(t)})}load(e,t,n,i){let s=this,r;if(this.resourcePath!=="")r=this.resourcePath;else if(this.path!==""){let l=jn.extractUrlBase(e);r=jn.resolveURL(l,this.path)}else r=jn.extractUrlBase(e);this.manager.itemStart(e);let a=function(l){if(i)i(l);else console.error(l);s.manager.itemError(e),s.manager.itemEnd(e)},o=new Vs(this.manager);o.setPath(this.path),o.setResponseType("arraybuffer"),o.setRequestHeader(this.requestHeader),o.setWithCredentials(this.withCredentials),o.load(e,function(l){try{s.parse(l,r,function(c){t(c),s.manager.itemEnd(e)},a)}catch(c){a(c)}},n,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){if(this.pluginCallbacks.indexOf(e)===-1)this.pluginCallbacks.push(e);return this}unregister(e){if(this.pluginCallbacks.indexOf(e)!==-1)this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1);return this}parse(e,t,n,i){let s,r={},a={},o=new TextDecoder;if(typeof e==="string")s=JSON.parse(e);else if(e instanceof ArrayBuffer)if(o.decode(new Uint8Array(e,0,4))===Lu){try{r[qe.KHR_BINARY_GLTF]=new Nu(e)}catch(h){if(i)i(h);return}s=JSON.parse(r[qe.KHR_BINARY_GLTF].content)}else s=JSON.parse(o.decode(e));else s=e;if(s.asset===void 0||s.asset.version[0]<2){if(i)i(Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let l=new Bu(s,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});l.fileLoader.setRequestHeader(this.requestHeader);for(let c=0;c<this.pluginCallbacks.length;c++){let h=this.pluginCallbacks[c](l);if(!h.name)console.error("THREE.GLTFLoader: Invalid plugin found: missing name");a[h.name]=h,r[h.name]=!0}if(s.extensionsUsed)for(let c=0;c<s.extensionsUsed.length;++c){let h=s.extensionsUsed[c],u=s.extensionsRequired||[];switch(h){case qe.KHR_MATERIALS_UNLIT:r[h]=new mu;break;case qe.KHR_DRACO_MESH_COMPRESSION:r[h]=new Du(s,this.dracoLoader);break;case qe.KHR_TEXTURE_TRANSFORM:r[h]=new Uu;break;case qe.KHR_MESH_QUANTIZATION:r[h]=new Fu;break;default:if(u.indexOf(h)>=0&&a[h]===void 0)console.warn('THREE.GLTFLoader: Unknown extension "'+h+'".')}}l.setExtensions(r),l.setPlugins(a),l.parse(n,i)}parseAsync(e,t){let n=this;return new Promise(function(i,s){n.parse(e,t,i,s)})}}function k0(){let e={};return{get:function(t){return e[t]},add:function(t,n){e[t]=n},remove:function(t){delete e[t]},removeAll:function(){e={}}}}var qe={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class pu{constructor(e){this.parser=e,this.name=qe.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,i=t.length;n<i;n++){let s=t[n];if(s.extensions&&s.extensions[this.name]&&s.extensions[this.name].light!==void 0)e._addNodeRef(this.cache,s.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n="light:"+e,i=t.cache.get(n);if(i)return i;let s=t.json,o=((s.extensions&&s.extensions[this.name]||{}).lights||[])[e],l,c=new Se(16777215);if(o.color!==void 0)c.setRGB(o.color[0],o.color[1],o.color[2],Lt);let h=o.range!==void 0?o.range:0;switch(o.type){case"directional":l=new xi(c),l.target.position.set(0,0,-1),l.add(l.target);break;case"point":l=new rs(c),l.distance=h;break;case"spot":l=new ha(c),l.distance=h,o.spot=o.spot||{},o.spot.innerConeAngle=o.spot.innerConeAngle!==void 0?o.spot.innerConeAngle:0,o.spot.outerConeAngle=o.spot.outerConeAngle!==void 0?o.spot.outerConeAngle:Math.PI/4,l.angle=o.spot.outerConeAngle,l.penumbra=1-o.spot.innerConeAngle/o.spot.outerConeAngle,l.target.position.set(0,0,-1),l.add(l.target);break;default:throw Error("THREE.GLTFLoader: Unexpected light type: "+o.type)}if(l.position.set(0,0,0),gn(l,o),o.intensity!==void 0)l.intensity=o.intensity;return l.name=t.createUniqueName(o.name||"light_"+e),i=Promise.resolve(l),t.cache.add(n,i),i}getDependency(e,t){if(e!=="light")return;return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,s=n.json.nodes[e],a=(s.extensions&&s.extensions[this.name]||{}).light;if(a===void 0)return null;return this._loadLight(a).then(function(o){return n._getNodeRef(t.cache,a,o)})}}class mu{constructor(){this.name=qe.KHR_MATERIALS_UNLIT}getMaterialType(){return fn}extendParams(e,t,n){let i=[];e.color=new Se(1,1,1),e.opacity=1;let s=t.pbrMetallicRoughness;if(s){if(Array.isArray(s.baseColorFactor)){let r=s.baseColorFactor;e.color.setRGB(r[0],r[1],r[2],Lt),e.opacity=r[3]}if(s.baseColorTexture!==void 0)i.push(n.assignTexture(e,"map",s.baseColorTexture,dn))}return Promise.all(i)}}class gu{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=i.extensions[this.name].emissiveStrength;if(s!==void 0)t.emissiveIntensity=s;return Promise.resolve()}}class _u{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Wt}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[],r=i.extensions[this.name];if(r.clearcoatFactor!==void 0)t.clearcoat=r.clearcoatFactor;if(r.clearcoatTexture!==void 0)s.push(n.assignTexture(t,"clearcoatMap",r.clearcoatTexture));if(r.clearcoatRoughnessFactor!==void 0)t.clearcoatRoughness=r.clearcoatRoughnessFactor;if(r.clearcoatRoughnessTexture!==void 0)s.push(n.assignTexture(t,"clearcoatRoughnessMap",r.clearcoatRoughnessTexture));if(r.clearcoatNormalTexture!==void 0){if(s.push(n.assignTexture(t,"clearcoatNormalMap",r.clearcoatNormalTexture)),r.clearcoatNormalTexture.scale!==void 0){let a=r.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new Oe(a,a)}}return Promise.all(s)}}class xu{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_DISPERSION}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Wt}extendMaterialParams(e,t){let i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=i.extensions[this.name];return t.dispersion=s.dispersion!==void 0?s.dispersion:0,Promise.resolve()}}class vu{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Wt}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[],r=i.extensions[this.name];if(r.iridescenceFactor!==void 0)t.iridescence=r.iridescenceFactor;if(r.iridescenceTexture!==void 0)s.push(n.assignTexture(t,"iridescenceMap",r.iridescenceTexture));if(r.iridescenceIor!==void 0)t.iridescenceIOR=r.iridescenceIor;if(t.iridescenceThicknessRange===void 0)t.iridescenceThicknessRange=[100,400];if(r.iridescenceThicknessMinimum!==void 0)t.iridescenceThicknessRange[0]=r.iridescenceThicknessMinimum;if(r.iridescenceThicknessMaximum!==void 0)t.iridescenceThicknessRange[1]=r.iridescenceThicknessMaximum;if(r.iridescenceThicknessTexture!==void 0)s.push(n.assignTexture(t,"iridescenceThicknessMap",r.iridescenceThicknessTexture));return Promise.all(s)}}class yu{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_SHEEN}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Wt}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[];t.sheenColor=new Se(0,0,0),t.sheenRoughness=0,t.sheen=1;let r=i.extensions[this.name];if(r.sheenColorFactor!==void 0){let a=r.sheenColorFactor;t.sheenColor.setRGB(a[0],a[1],a[2],Lt)}if(r.sheenRoughnessFactor!==void 0)t.sheenRoughness=r.sheenRoughnessFactor;if(r.sheenColorTexture!==void 0)s.push(n.assignTexture(t,"sheenColorMap",r.sheenColorTexture,dn));if(r.sheenRoughnessTexture!==void 0)s.push(n.assignTexture(t,"sheenRoughnessMap",r.sheenRoughnessTexture));return Promise.all(s)}}class Mu{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Wt}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[],r=i.extensions[this.name];if(r.transmissionFactor!==void 0)t.transmission=r.transmissionFactor;if(r.transmissionTexture!==void 0)s.push(n.assignTexture(t,"transmissionMap",r.transmissionTexture));return Promise.all(s)}}class Su{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_VOLUME}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Wt}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[],r=i.extensions[this.name];if(t.thickness=r.thicknessFactor!==void 0?r.thicknessFactor:0,r.thicknessTexture!==void 0)s.push(n.assignTexture(t,"thicknessMap",r.thicknessTexture));t.attenuationDistance=r.attenuationDistance||1/0;let a=r.attenuationColor||[1,1,1];return t.attenuationColor=new Se().setRGB(a[0],a[1],a[2],Lt),Promise.all(s)}}class bu{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_IOR}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Wt}extendMaterialParams(e,t){let i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=i.extensions[this.name];return t.ior=s.ior!==void 0?s.ior:1.5,Promise.resolve()}}class Tu{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_SPECULAR}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Wt}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[],r=i.extensions[this.name];if(t.specularIntensity=r.specularFactor!==void 0?r.specularFactor:1,r.specularTexture!==void 0)s.push(n.assignTexture(t,"specularIntensityMap",r.specularTexture));let a=r.specularColorFactor||[1,1,1];if(t.specularColor=new Se().setRGB(a[0],a[1],a[2],Lt),r.specularColorTexture!==void 0)s.push(n.assignTexture(t,"specularColorMap",r.specularColorTexture,dn));return Promise.all(s)}}class Au{constructor(e){this.parser=e,this.name=qe.EXT_MATERIALS_BUMP}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Wt}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[],r=i.extensions[this.name];if(t.bumpScale=r.bumpFactor!==void 0?r.bumpFactor:1,r.bumpTexture!==void 0)s.push(n.assignTexture(t,"bumpMap",r.bumpTexture));return Promise.all(s)}}class Eu{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Wt}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[],r=i.extensions[this.name];if(r.anisotropyStrength!==void 0)t.anisotropy=r.anisotropyStrength;if(r.anisotropyRotation!==void 0)t.anisotropyRotation=r.anisotropyRotation;if(r.anisotropyTexture!==void 0)s.push(n.assignTexture(t,"anisotropyMap",r.anisotropyTexture));return Promise.all(s)}}class wu{constructor(e){this.parser=e,this.name=qe.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,i=n.textures[e];if(!i.extensions||!i.extensions[this.name])return null;let s=i.extensions[this.name],r=t.options.ktx2Loader;if(!r)if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");else return null;return t.loadTextureImage(e,s.source,r)}}class Ru{constructor(e){this.parser=e,this.name=qe.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,n=this.parser,i=n.json,s=i.textures[e];if(!s.extensions||!s.extensions[t])return null;let r=s.extensions[t],a=i.images[r.source],o=n.textureLoader;if(a.uri){let l=n.options.manager.getHandler(a.uri);if(l!==null)o=l}return n.loadTextureImage(e,r.source,o)}}class Cu{constructor(e){this.parser=e,this.name=qe.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,n=this.parser,i=n.json,s=i.textures[e];if(!s.extensions||!s.extensions[t])return null;let r=s.extensions[t],a=i.images[r.source],o=n.textureLoader;if(a.uri){let l=n.options.manager.getHandler(a.uri);if(l!==null)o=l}return n.loadTextureImage(e,r.source,o)}}class Iu{constructor(e){this.name=qe.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let i=n.extensions[this.name],s=this.parser.getDependency("buffer",i.buffer),r=this.parser.options.meshoptDecoder;if(!r||!r.supported)if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");else return null;return s.then(function(a){let o=i.byteOffset||0,l=i.byteLength||0,{count:c,byteStride:h}=i,u=new Uint8Array(a,o,l);if(r.decodeGltfBufferAsync)return r.decodeGltfBufferAsync(c,h,u,i.mode,i.filter).then(function(d){return d.buffer});else return r.ready.then(function(){let d=new ArrayBuffer(c*h);return r.decodeGltfBuffer(new Uint8Array(d),c,h,u,i.mode,i.filter),d})})}else return null}}class Pu{constructor(e){this.name=qe.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let i=t.meshes[n.mesh];for(let l of i.primitives)if(l.mode!==Qt.TRIANGLES&&l.mode!==Qt.TRIANGLE_STRIP&&l.mode!==Qt.TRIANGLE_FAN&&l.mode!==void 0)return null;let r=n.extensions[this.name].attributes,a=[],o={};for(let l in r)a.push(this.parser.getDependency("accessor",r[l]).then((c)=>(o[l]=c,o[l])));if(a.length<1)return null;return a.push(this.parser.createNodeMesh(e)),Promise.all(a).then((l)=>{let c=l.pop(),h=c.isGroup?c.children:[c],u=l[0].count,d=[];for(let m of h){let _=new Be,x=new D,f=new cn,p=new D(1,1,1),A=new is(m.geometry,m.material,u);for(let b=0;b<u;b++){if(o.TRANSLATION)x.fromBufferAttribute(o.TRANSLATION,b);if(o.ROTATION)f.fromBufferAttribute(o.ROTATION,b);if(o.SCALE)p.fromBufferAttribute(o.SCALE,b);A.setMatrixAt(b,_.compose(x,f,p))}for(let b in o)if(b==="_COLOR_0"){let T=o[b];A.instanceColor=new li(T.array,T.itemSize,T.normalized)}else if(b!=="TRANSLATION"&&b!=="ROTATION"&&b!=="SCALE")m.geometry.setAttribute(b,o[b]);tt.prototype.copy.call(A,m),this.parser.assignFinalMaterial(A),d.push(A)}if(c.isGroup)return c.clear(),c.add(...d),c;return d[0]})}}var Lu="glTF",Js=12,hu={JSON:1313821514,BIN:5130562};class Nu{constructor(e){this.name=qe.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,Js),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Lu)throw Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");else if(this.header.version<2)throw Error("THREE.GLTFLoader: Legacy binary file detected.");let i=this.header.length-Js,s=new DataView(e,Js),r=0;while(r<i){let a=s.getUint32(r,!0);r+=4;let o=s.getUint32(r,!0);if(r+=4,o===hu.JSON){let l=new Uint8Array(e,Js+r,a);this.content=n.decode(l)}else if(o===hu.BIN){let l=Js+r;this.body=e.slice(l,l+a)}r+=a}if(this.content===null)throw Error("THREE.GLTFLoader: JSON content not found.")}}class Du{constructor(e,t){if(!t)throw Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=qe.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,i=this.dracoLoader,s=e.extensions[this.name].bufferView,r=e.extensions[this.name].attributes,a={},o={},l={};for(let c in r){let h=Il[c]||c.toLowerCase();a[h]=r[c]}for(let c in e.attributes){let h=Il[c]||c.toLowerCase();if(r[c]!==void 0){let u=n.accessors[e.attributes[c]],d=ls[u.componentType];l[h]=d.name,o[h]=u.normalized===!0}}return t.getDependency("bufferView",s).then(function(c){return new Promise(function(h,u){i.decodeDracoFile(c,function(d){for(let m in d.attributes){let _=d.attributes[m],x=o[m];if(x!==void 0)_.normalized=x}h(d)},a,l,Lt,u)})})}}class Uu{constructor(){this.name=qe.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){if((t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0)return e;if(e=e.clone(),t.texCoord!==void 0)e.channel=t.texCoord;if(t.offset!==void 0)e.offset.fromArray(t.offset);if(t.rotation!==void 0)e.rotation=t.rotation;if(t.scale!==void 0)e.repeat.fromArray(t.scale);return e.needsUpdate=!0,e}}class Fu{constructor(){this.name=qe.KHR_MESH_QUANTIZATION}}class Nl extends Jn{constructor(e,t,n,i){super(e,t,n,i)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=e*i*3+i;for(let r=0;r!==i;r++)t[r]=n[s+r];return t}interpolate_(e,t,n,i){let s=this.resultBuffer,r=this.sampleValues,a=this.valueSize,o=a*2,l=a*3,c=i-t,h=(n-t)/c,u=h*h,d=u*h,m=e*l,_=m-l,x=-2*d+3*u,f=d-u,p=1-x,A=f-u+h;for(let b=0;b!==a;b++){let T=r[_+b+a],I=r[_+b+o]*c,E=r[m+b+a],P=r[m+b]*c;s[b]=p*T+A*I+x*E+f*P}return s}}var G0=new cn;class Ou extends Nl{interpolate_(e,t,n,i){let s=super.interpolate_(e,t,n,i);return G0.fromArray(s).normalize().toArray(s),s}}var Qt={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},ls={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},uu={9728:on,9729:Tt,9984:Or,9985:Ki,9986:hi,9987:Pn},du={33071:Ji,33648:Fr,10497:Xn},wl={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},Il={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},ei={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},H0={CUBICSPLINE:void 0,LINEAR:Hr,STEP:Wo},Rl={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function V0(e){if(e.DefaultMaterial===void 0)e.DefaultMaterial=new Dn({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Wn});return e.DefaultMaterial}function Si(e,t,n){for(let i in n.extensions)if(e[i]===void 0)t.userData.gltfExtensions=t.userData.gltfExtensions||{},t.userData.gltfExtensions[i]=n.extensions[i]}function gn(e,t){if(t.extras!==void 0)if(typeof t.extras==="object")Object.assign(e.userData,t.extras);else console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+t.extras)}function W0(e,t,n){let i=!1,s=!1,r=!1;for(let c=0,h=t.length;c<h;c++){let u=t[c];if(u.POSITION!==void 0)i=!0;if(u.NORMAL!==void 0)s=!0;if(u.COLOR_0!==void 0)r=!0;if(i&&s&&r)break}if(!i&&!s&&!r)return Promise.resolve(e);let a=[],o=[],l=[];for(let c=0,h=t.length;c<h;c++){let u=t[c];if(i){let d=u.POSITION!==void 0?n.getDependency("accessor",u.POSITION):e.attributes.position;a.push(d)}if(s){let d=u.NORMAL!==void 0?n.getDependency("accessor",u.NORMAL):e.attributes.normal;o.push(d)}if(r){let d=u.COLOR_0!==void 0?n.getDependency("accessor",u.COLOR_0):e.attributes.color;l.push(d)}}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(l)]).then(function(c){let h=c[0],u=c[1],d=c[2];if(i)e.morphAttributes.position=h;if(s)e.morphAttributes.normal=u;if(r)e.morphAttributes.color=d;return e.morphTargetsRelative=!0,e})}function X0(e,t){if(e.updateMorphTargets(),t.weights!==void 0)for(let n=0,i=t.weights.length;n<i;n++)e.morphTargetInfluences[n]=t.weights[n];if(t.extras&&Array.isArray(t.extras.targetNames)){let n=t.extras.targetNames;if(e.morphTargetInfluences.length===n.length){e.morphTargetDictionary={};for(let i=0,s=n.length;i<s;i++)e.morphTargetDictionary[n[i]]=i}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function q0(e){let t,n=e.extensions&&e.extensions[qe.KHR_DRACO_MESH_COMPRESSION];if(n)t="draco:"+n.bufferView+":"+n.indices+":"+Cl(n.attributes);else t=e.indices+":"+Cl(e.attributes)+":"+e.mode;if(e.targets!==void 0)for(let i=0,s=e.targets.length;i<s;i++)t+=":"+Cl(e.targets[i]);return t}function Cl(e){let t="",n=Object.keys(e).sort();for(let i=0,s=n.length;i<s;i++)t+=n[i]+":"+e[n[i]]+";";return t}function Pl(e){switch(e){case Int8Array:return 0.007874015748031496;case Uint8Array:return 0.00392156862745098;case Int16Array:return 0.00003051850947599719;case Uint16Array:return 0.000015259021896696422;default:throw Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function Y0(e){if(e.search(/\.jpe?g($|\?)/i)>0||e.search(/^data\:image\/jpeg/)===0)return"image/jpeg";if(e.search(/\.webp($|\?)/i)>0||e.search(/^data\:image\/webp/)===0)return"image/webp";if(e.search(/\.ktx2($|\?)/i)>0||e.search(/^data\:image\/ktx2/)===0)return"image/ktx2";return"image/png"}var Z0=new Be;class Bu{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new k0,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,i=-1,s=!1,r=-1;if(typeof navigator<"u"){let a=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(a)===!0;let o=a.match(/Version\/(\d+)/);i=n&&o?parseInt(o[1],10):-1,s=a.indexOf("Firefox")>-1,r=s?a.match(/Firefox\/([0-9]+)\./)[1]:-1}if(typeof createImageBitmap>"u"||n&&i<17||s&&r<98)this.textureLoader=new oa(this.options.manager);else this.textureLoader=new da(this.options.manager);if(this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Vs(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials")this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,i=this.json,s=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(r){return r._markDefs&&r._markDefs()}),Promise.all(this._invokeAll(function(r){return r.beforeRoot&&r.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(r){let a={scene:r[0][i.scene||0],scenes:r[0],animations:r[1],cameras:r[2],asset:i.asset,parser:n,userData:{}};return Si(s,a,i),gn(a,i),Promise.all(n._invokeAll(function(o){return o.afterRoot&&o.afterRoot(a)})).then(function(){for(let o of a.scenes)o.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let i=0,s=t.length;i<s;i++){let r=t[i].joints;for(let a=0,o=r.length;a<o;a++)e[r[a]].isBone=!0}for(let i=0,s=e.length;i<s;i++){let r=e[i];if(r.mesh!==void 0){if(this._addNodeRef(this.meshCache,r.mesh),r.skin!==void 0)n[r.mesh].isSkinnedMesh=!0}if(r.camera!==void 0)this._addNodeRef(this.cameraCache,r.camera)}}_addNodeRef(e,t){if(t===void 0)return;if(e.refs[t]===void 0)e.refs[t]=e.uses[t]=0;e.refs[t]++}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let i=n.clone(),s=(r,a)=>{let o=this.associations.get(r);if(o!=null)this.associations.set(a,o);for(let[l,c]of r.children.entries())s(c,a.children[l])};return s(n,i),i.name+="_instance_"+e.uses[t]++,i}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let i=e(t[n]);if(i)return i}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let i=0;i<t.length;i++){let s=e(t[i]);if(s)n.push(s)}return n}getDependency(e,t){let n=e+":"+t,i=this.cache.get(n);if(!i){switch(e){case"scene":i=this.loadScene(t);break;case"node":i=this._invokeOne(function(s){return s.loadNode&&s.loadNode(t)});break;case"mesh":i=this._invokeOne(function(s){return s.loadMesh&&s.loadMesh(t)});break;case"accessor":i=this.loadAccessor(t);break;case"bufferView":i=this._invokeOne(function(s){return s.loadBufferView&&s.loadBufferView(t)});break;case"buffer":i=this.loadBuffer(t);break;case"material":i=this._invokeOne(function(s){return s.loadMaterial&&s.loadMaterial(t)});break;case"texture":i=this._invokeOne(function(s){return s.loadTexture&&s.loadTexture(t)});break;case"skin":i=this.loadSkin(t);break;case"animation":i=this._invokeOne(function(s){return s.loadAnimation&&s.loadAnimation(t)});break;case"camera":i=this.loadCamera(t);break;default:if(i=this._invokeOne(function(s){return s!=this&&s.getDependency&&s.getDependency(e,t)}),!i)throw Error("Unknown type: "+e);break}this.cache.add(n,i)}return i}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,i=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(i.map(function(s,r){return n.getDependency(e,r)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[qe.KHR_BINARY_GLTF].body);let i=this.options;return new Promise(function(s,r){n.load(jn.resolveURL(t.uri,i.path),s,void 0,function(){r(Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){let i=t.byteLength||0,s=t.byteOffset||0;return n.slice(s,s+i)})}loadAccessor(e){let t=this,n=this.json,i=this.json.accessors[e];if(i.bufferView===void 0&&i.sparse===void 0){let r=wl[i.type],a=ls[i.componentType],o=i.normalized===!0,l=new a(i.count*r);return Promise.resolve(new yt(l,r,o))}let s=[];if(i.bufferView!==void 0)s.push(this.getDependency("bufferView",i.bufferView));else s.push(null);if(i.sparse!==void 0)s.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),s.push(this.getDependency("bufferView",i.sparse.values.bufferView));return Promise.all(s).then(function(r){let a=r[0],o=wl[i.type],l=ls[i.componentType],c=l.BYTES_PER_ELEMENT,h=c*o,u=i.byteOffset||0,d=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,m=i.normalized===!0,_,x;if(d&&d!==h){let f=Math.floor(u/d),p="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+f+":"+i.count,A=t.cache.get(p);if(!A)_=new l(a,f*d,i.count*d/c),A=new ns(_,d/c),t.cache.add(p,A);x=new Vn(A,o,u%d/c,m)}else{if(a===null)_=new l(i.count*o);else _=new l(a,u,i.count*o);x=new yt(_,o,m)}if(i.sparse!==void 0){let f=wl.SCALAR,p=ls[i.sparse.indices.componentType],A=i.sparse.indices.byteOffset||0,b=i.sparse.values.byteOffset||0,T=new p(r[1],A,i.sparse.count*f),I=new l(r[2],b,i.sparse.count*o);if(a!==null)x=new yt(x.array.slice(),x.itemSize,x.normalized);x.normalized=!1;for(let E=0,P=T.length;E<P;E++){let N=T[E];if(x.setX(N,I[E*o]),o>=2)x.setY(N,I[E*o+1]);if(o>=3)x.setZ(N,I[E*o+2]);if(o>=4)x.setW(N,I[E*o+3]);if(o>=5)throw Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}x.normalized=m}return x})}loadTexture(e){let t=this.json,n=this.options,s=t.textures[e].source,r=t.images[s],a=this.textureLoader;if(r.uri){let o=n.manager.getHandler(r.uri);if(o!==null)a=o}return this.loadTextureImage(e,s,a)}loadTextureImage(e,t,n){let i=this,s=this.json,r=s.textures[e],a=s.images[t],o=(a.uri||a.bufferView)+":"+r.sampler;if(this.textureCache[o])return this.textureCache[o];let l=this.loadImageSource(t,n).then(function(c){if(c.flipY=!1,c.name=r.name||a.name||"",c.name===""&&typeof a.uri==="string"&&a.uri.startsWith("data:image/")===!1)c.name=a.uri;let u=(s.samplers||{})[r.sampler]||{};return c.magFilter=uu[u.magFilter]||Tt,c.minFilter=uu[u.minFilter]||Pn,c.wrapS=du[u.wrapS]||Xn,c.wrapT=du[u.wrapT]||Xn,c.generateMipmaps=!c.isCompressedTexture&&c.minFilter!==on&&c.minFilter!==Tt,i.associations.set(c,{textures:e}),c}).catch(function(){return null});return this.textureCache[o]=l,l}loadImageSource(e,t){let n=this,i=this.json,s=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then((h)=>h.clone());let r=i.images[e],a=self.URL||self.webkitURL,o=r.uri||"",l=!1;if(r.bufferView!==void 0)o=n.getDependency("bufferView",r.bufferView).then(function(h){l=!0;let u=new Blob([h],{type:r.mimeType});return o=a.createObjectURL(u),o});else if(r.uri===void 0)throw Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");let c=Promise.resolve(o).then(function(h){return new Promise(function(u,d){let m=u;if(t.isImageBitmapLoader===!0)m=function(_){let x=new gt(_);x.needsUpdate=!0,u(x)};t.load(jn.resolveURL(h,s.path),m,void 0,d)})}).then(function(h){if(l===!0)a.revokeObjectURL(o);return gn(h,r),h.userData.mimeType=r.mimeType||Y0(r.uri),h}).catch(function(h){throw console.error("THREE.GLTFLoader: Couldn't load texture",o),h});return this.sourceCache[e]=c,c}assignTexture(e,t,n,i){let s=this;return this.getDependency("texture",n.index).then(function(r){if(!r)return null;if(n.texCoord!==void 0&&n.texCoord>0)r=r.clone(),r.channel=n.texCoord;if(s.extensions[qe.KHR_TEXTURE_TRANSFORM]){let a=n.extensions!==void 0?n.extensions[qe.KHR_TEXTURE_TRANSFORM]:void 0;if(a){let o=s.associations.get(r);r=s.extensions[qe.KHR_TEXTURE_TRANSFORM].extendTexture(r,a),s.associations.set(r,o)}}if(i!==void 0)r.colorSpace=i;return e[t]=r,r})}assignFinalMaterial(e){let{geometry:t,material:n}=e,i=t.attributes.tangent===void 0,s=t.attributes.color!==void 0,r=t.attributes.normal===void 0;if(e.isPoints){let a="PointsMaterial:"+n.uuid,o=this.cache.get(a);if(!o)o=new ks,Nt.prototype.copy.call(o,n),o.color.copy(n.color),o.map=n.map,o.sizeAttenuation=!1,this.cache.add(a,o);n=o}else if(e.isLine){let a="LineBasicMaterial:"+n.uuid,o=this.cache.get(a);if(!o)o=new zs,Nt.prototype.copy.call(o,n),o.color.copy(n.color),o.map=n.map,this.cache.add(a,o);n=o}if(i||s||r){let a="ClonedMaterial:"+n.uuid+":";if(i)a+="derivative-tangents:";if(s)a+="vertex-colors:";if(r)a+="flat-shading:";let o=this.cache.get(a);if(!o){if(o=n.clone(),s)o.vertexColors=!0;if(r)o.flatShading=!0;if(i){if(o.normalScale)o.normalScale.y*=-1;if(o.clearcoatNormalScale)o.clearcoatNormalScale.y*=-1}this.cache.add(a,o),this.associations.set(o,this.associations.get(n))}n=o}e.material=n}getMaterialType(){return Dn}loadMaterial(e){let t=this,n=this.json,i=this.extensions,s=n.materials[e],r,a={},o=s.extensions||{},l=[];if(o[qe.KHR_MATERIALS_UNLIT]){let h=i[qe.KHR_MATERIALS_UNLIT];r=h.getMaterialType(),l.push(h.extendParams(a,s,t))}else{let h=s.pbrMetallicRoughness||{};if(a.color=new Se(1,1,1),a.opacity=1,Array.isArray(h.baseColorFactor)){let u=h.baseColorFactor;a.color.setRGB(u[0],u[1],u[2],Lt),a.opacity=u[3]}if(h.baseColorTexture!==void 0)l.push(t.assignTexture(a,"map",h.baseColorTexture,dn));if(a.metalness=h.metallicFactor!==void 0?h.metallicFactor:1,a.roughness=h.roughnessFactor!==void 0?h.roughnessFactor:1,h.metallicRoughnessTexture!==void 0)l.push(t.assignTexture(a,"metalnessMap",h.metallicRoughnessTexture)),l.push(t.assignTexture(a,"roughnessMap",h.metallicRoughnessTexture));r=this._invokeOne(function(u){return u.getMaterialType&&u.getMaterialType(e)}),l.push(Promise.all(this._invokeAll(function(u){return u.extendMaterialParams&&u.extendMaterialParams(e,a)})))}if(s.doubleSided===!0)a.side=Kt;let c=s.alphaMode||Rl.OPAQUE;if(c===Rl.BLEND)a.transparent=!0,a.depthWrite=!1;else if(a.transparent=!1,c===Rl.MASK)a.alphaTest=s.alphaCutoff!==void 0?s.alphaCutoff:0.5;if(s.normalTexture!==void 0&&r!==fn){if(l.push(t.assignTexture(a,"normalMap",s.normalTexture)),a.normalScale=new Oe(1,1),s.normalTexture.scale!==void 0){let h=s.normalTexture.scale;a.normalScale.set(h,h)}}if(s.occlusionTexture!==void 0&&r!==fn){if(l.push(t.assignTexture(a,"aoMap",s.occlusionTexture)),s.occlusionTexture.strength!==void 0)a.aoMapIntensity=s.occlusionTexture.strength}if(s.emissiveFactor!==void 0&&r!==fn){let h=s.emissiveFactor;a.emissive=new Se().setRGB(h[0],h[1],h[2],Lt)}if(s.emissiveTexture!==void 0&&r!==fn)l.push(t.assignTexture(a,"emissiveMap",s.emissiveTexture,dn));return Promise.all(l).then(function(){let h=new r(a);if(s.name)h.name=s.name;if(gn(h,s),t.associations.set(h,{materials:e}),s.extensions)Si(i,h,s);return h})}createUniqueName(e){let t=Ke.sanitizeNodeName(e||"");if(t in this.nodeNamesUsed)return t+"_"+ ++this.nodeNamesUsed[t];else return this.nodeNamesUsed[t]=0,t}loadGeometries(e){let t=this,n=this.extensions,i=this.primitiveCache;function s(a){return n[qe.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(o){return fu(o,a,t)})}let r=[];for(let a=0,o=e.length;a<o;a++){let l=e[a],c=q0(l),h=i[c];if(h)r.push(h.promise);else{let u;if(l.extensions&&l.extensions[qe.KHR_DRACO_MESH_COMPRESSION])u=s(l);else u=fu(new wt,l,t);i[c]={primitive:l,promise:u},r.push(u)}}return Promise.all(r)}loadMesh(e){let t=this,n=this.json,i=this.extensions,s=n.meshes[e],r=s.primitives,a=[];for(let o=0,l=r.length;o<l;o++){let c=r[o].material===void 0?V0(this.cache):this.getDependency("material",r[o].material);a.push(c)}return a.push(t.loadGeometries(r)),Promise.all(a).then(function(o){let l=o.slice(0,o.length-1),c=o[o.length-1],h=[];for(let d=0,m=c.length;d<m;d++){let _=c[d],x=r[d],f,p=l[d];if(x.mode===Qt.TRIANGLES||x.mode===Qt.TRIANGLE_STRIP||x.mode===Qt.TRIANGLE_FAN||x.mode===void 0){if(f=s.isSkinnedMesh===!0?new Qr(_,p):new dt(_,p),f.isSkinnedMesh===!0)f.normalizeSkinWeights();if(x.mode===Qt.TRIANGLE_STRIP)f.geometry=El(f.geometry,Ps);else if(x.mode===Qt.TRIANGLE_FAN)f.geometry=El(f.geometry,Qi)}else if(x.mode===Qt.LINES)f=new ea(_,p);else if(x.mode===Qt.LINE_STRIP)f=new ss(_,p);else if(x.mode===Qt.LINE_LOOP)f=new ta(_,p);else if(x.mode===Qt.POINTS)f=new na(_,p);else throw Error("THREE.GLTFLoader: Primitive mode unsupported: "+x.mode);if(Object.keys(f.geometry.morphAttributes).length>0)X0(f,s);if(f.name=t.createUniqueName(s.name||"mesh_"+e),gn(f,s),x.extensions)Si(i,f,x);t.assignFinalMaterial(f),h.push(f)}for(let d=0,m=h.length;d<m;d++)t.associations.set(h[d],{meshes:e,primitives:d});if(h.length===1){if(s.extensions)Si(i,h[0],s);return h[0]}let u=new Zt;if(s.extensions)Si(i,u,s);t.associations.set(u,{meshes:e});for(let d=0,m=h.length;d<m;d++)u.add(h[d]);return u})}loadCamera(e){let t,n=this.json.cameras[e],i=n[n.type];if(!i){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}if(n.type==="perspective")t=new vt($o.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2000000);else if(n.type==="orthographic")t=new _i(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar);if(n.name)t.name=this.createUniqueName(n.name);return gn(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let i=0,s=t.joints.length;i<s;i++)n.push(this._loadNodeShallow(t.joints[i]));if(t.inverseBindMatrices!==void 0)n.push(this.getDependency("accessor",t.inverseBindMatrices));else n.push(null);return Promise.all(n).then(function(i){let s=i.pop(),r=i,a=[],o=[];for(let l=0,c=r.length;l<c;l++){let h=r[l];if(h){a.push(h);let u=new Be;if(s!==null)u.fromArray(s.array,l*16);o.push(u)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[l])}return new Os(a,o)})}loadAnimation(e){let t=this.json,n=this,i=t.animations[e],s=i.name?i.name:"animation_"+e,r=[],a=[],o=[],l=[],c=[];for(let h=0,u=i.channels.length;h<u;h++){let d=i.channels[h],m=i.samplers[d.sampler],_=d.target,x=_.node,f=i.parameters!==void 0?i.parameters[m.input]:m.input,p=i.parameters!==void 0?i.parameters[m.output]:m.output;if(_.node===void 0)continue;r.push(this.getDependency("node",x)),a.push(this.getDependency("accessor",f)),o.push(this.getDependency("accessor",p)),l.push(m),c.push(_)}return Promise.all([Promise.all(r),Promise.all(a),Promise.all(o),Promise.all(l),Promise.all(c)]).then(function(h){let u=h[0],d=h[1],m=h[2],_=h[3],x=h[4],f=[];for(let A=0,b=u.length;A<b;A++){let T=u[A],I=d[A],E=m[A],P=_[A],N=x[A];if(T===void 0)continue;if(T.updateMatrix)T.updateMatrix();let y=n._createAnimationTracks(T,I,E,P,N);if(y)for(let S=0;S<y.length;S++)f.push(y[S])}let p=new aa(s,void 0,f);return gn(p,i),p})}createNodeMesh(e){let t=this.json,n=this,i=t.nodes[e];if(i.mesh===void 0)return null;return n.getDependency("mesh",i.mesh).then(function(s){let r=n._getNodeRef(n.meshCache,i.mesh,s);if(i.weights!==void 0)r.traverse(function(a){if(!a.isMesh)return;for(let o=0,l=i.weights.length;o<l;o++)a.morphTargetInfluences[o]=i.weights[o]});return r})}loadNode(e){let t=this.json,n=this,i=t.nodes[e],s=n._loadNodeShallow(e),r=[],a=i.children||[];for(let l=0,c=a.length;l<c;l++)r.push(n.getDependency("node",a[l]));let o=i.skin===void 0?Promise.resolve(null):n.getDependency("skin",i.skin);return Promise.all([s,Promise.all(r),o]).then(function(l){let c=l[0],h=l[1],u=l[2];if(u!==null)c.traverse(function(d){if(!d.isSkinnedMesh)return;d.bind(u,Z0)});for(let d=0,m=h.length;d<m;d++)c.add(h[d]);return c})}_loadNodeShallow(e){let t=this.json,n=this.extensions,i=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let s=t.nodes[e],r=s.name?i.createUniqueName(s.name):"",a=[],o=i._invokeOne(function(l){return l.createNodeMesh&&l.createNodeMesh(e)});if(o)a.push(o);if(s.camera!==void 0)a.push(i.getDependency("camera",s.camera).then(function(l){return i._getNodeRef(i.cameraCache,s.camera,l)}));return i._invokeAll(function(l){return l.createNodeAttachment&&l.createNodeAttachment(e)}).forEach(function(l){a.push(l)}),this.nodeCache[e]=Promise.all(a).then(function(l){let c;if(s.isBone===!0)c=new Us;else if(l.length>1)c=new Zt;else if(l.length===1)c=l[0];else c=new tt;if(c!==l[0])for(let h=0,u=l.length;h<u;h++)c.add(l[h]);if(s.name)c.userData.name=s.name,c.name=r;if(gn(c,s),s.extensions)Si(n,c,s);if(s.matrix!==void 0){let h=new Be;h.fromArray(s.matrix),c.applyMatrix4(h)}else{if(s.translation!==void 0)c.position.fromArray(s.translation);if(s.rotation!==void 0)c.quaternion.fromArray(s.rotation);if(s.scale!==void 0)c.scale.fromArray(s.scale)}if(!i.associations.has(c))i.associations.set(c,{});else if(s.mesh!==void 0&&i.meshCache.refs[s.mesh]>1){let h=i.associations.get(c);i.associations.set(c,{...h})}return i.associations.get(c).nodes=e,c}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],i=this,s=new Zt;if(n.name)s.name=i.createUniqueName(n.name);if(gn(s,n),n.extensions)Si(t,s,n);let r=n.nodes||[],a=[];for(let o=0,l=r.length;o<l;o++)a.push(i.getDependency("node",r[o]));return Promise.all(a).then(function(o){for(let c=0,h=o.length;c<h;c++)s.add(o[c]);let l=(c)=>{let h=new Map;for(let[u,d]of i.associations)if(u instanceof Nt||u instanceof gt)h.set(u,d);return c.traverse((u)=>{let d=i.associations.get(u);if(d!=null)h.set(u,d)}),h};return i.associations=l(s),s})}_createAnimationTracks(e,t,n,i,s){let r=[],a=e.name?e.name:e.uuid,o=[];if(ei[s.path]===ei.weights)e.traverse(function(u){if(u.morphTargetInfluences)o.push(u.name?u.name:u.uuid)});else o.push(a);let l;switch(ei[s.path]){case ei.weights:l=Rn;break;case ei.rotation:l=Un;break;case ei.translation:case ei.scale:l=Cn;break;default:switch(n.itemSize){case 1:l=Rn;break;case 2:case 3:default:l=Cn;break}break}let c=i.interpolation!==void 0?H0[i.interpolation]:Hr,h=this._getArrayFromAccessor(n);for(let u=0,d=o.length;u<d;u++){let m=new l(o[u]+"."+ei[s.path],t.array,h,c);if(i.interpolation==="CUBICSPLINE")this._createCubicSplineTrackInterpolant(m);r.push(m)}return r}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let n=Pl(t.constructor),i=new Float32Array(t.length);for(let s=0,r=t.length;s<r;s++)i[s]=t[s]*n;t=i}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){return new(this instanceof Un?Ou:Nl)(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function J0(e,t,n){let i=t.attributes,s=new Ot;if(i.POSITION!==void 0){let o=n.json.accessors[i.POSITION],{min:l,max:c}=o;if(l!==void 0&&c!==void 0){if(s.set(new D(l[0],l[1],l[2]),new D(c[0],c[1],c[2])),o.normalized){let h=Pl(ls[o.componentType]);s.min.multiplyScalar(h),s.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let r=t.targets;if(r!==void 0){let o=new D,l=new D;for(let c=0,h=r.length;c<h;c++){let u=r[c];if(u.POSITION!==void 0){let d=n.json.accessors[u.POSITION],{min:m,max:_}=d;if(m!==void 0&&_!==void 0){if(l.setX(Math.max(Math.abs(m[0]),Math.abs(_[0]))),l.setY(Math.max(Math.abs(m[1]),Math.abs(_[1]))),l.setZ(Math.max(Math.abs(m[2]),Math.abs(_[2]))),d.normalized){let x=Pl(ls[d.componentType]);l.multiplyScalar(x)}o.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}s.expandByVector(o)}e.boundingBox=s;let a=new Vt;s.getCenter(a.center),a.radius=s.min.distanceTo(s.max)/2,e.boundingSphere=a}function fu(e,t,n){let i=t.attributes,s=[];function r(a,o){return n.getDependency("accessor",a).then(function(l){e.setAttribute(o,l)})}for(let a in i){let o=Il[a]||a.toLowerCase();if(o in e.attributes)continue;s.push(r(i[a],o))}if(t.indices!==void 0&&!e.index){let a=n.getDependency("accessor",t.indices).then(function(o){e.setIndex(o)});s.push(a)}if(We.workingColorSpace!==Lt&&"COLOR_0"in i)console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${We.workingColorSpace}" not supported.`);return gn(e,t),J0(e,t,n),Promise.all(s).then(function(){return t.targets!==void 0?W0(e,t.targets,n):e})}class Dl extends ts{constructor(){super();this.name="RoomEnvironment";let e=new Zn;e.deleteAttribute("uv");let t=new Dn({side:Pt}),n=new Dn,i=new rs(16777215,900,28,2);i.position.set(0.418,16.199,0.3),this.add(i);let s=new dt(e,t);s.position.set(-0.757,13.219,0.717),s.scale.set(31.713,28.305,28.591),this.add(s);let r=new is(e,n,6),a=new tt;a.position.set(-10.906,2.009,1.846),a.rotation.set(0,-0.195,0),a.scale.set(2.328,7.905,4.651),a.updateMatrix(),r.setMatrixAt(0,a.matrix),a.position.set(-5.607,-0.754,-0.758),a.rotation.set(0,0.994,0),a.scale.set(1.97,1.534,3.955),a.updateMatrix(),r.setMatrixAt(1,a.matrix),a.position.set(6.167,0.857,7.803),a.rotation.set(0,0.561,0),a.scale.set(3.927,6.285,3.687),a.updateMatrix(),r.setMatrixAt(2,a.matrix),a.position.set(-2.017,0.018,6.124),a.rotation.set(0,0.333,0),a.scale.set(2.002,4.566,2.064),a.updateMatrix(),r.setMatrixAt(3,a.matrix),a.position.set(2.291,-0.756,-2.621),a.rotation.set(0,-0.286,0),a.scale.set(1.546,1.552,1.496),a.updateMatrix(),r.setMatrixAt(4,a.matrix),a.position.set(-2.193,-0.369,-5.547),a.rotation.set(0,0.516,0),a.scale.set(3.875,3.487,2.986),a.updateMatrix(),r.setMatrixAt(5,a.matrix),this.add(r);let o=new dt(e,cs(50));o.position.set(-16.116,14.37,8.208),o.scale.set(0.1,2.428,2.739),this.add(o);let l=new dt(e,cs(50));l.position.set(-16.109,18.021,-8.207),l.scale.set(0.1,2.425,2.751),this.add(l);let c=new dt(e,cs(17));c.position.set(14.904,12.198,-1.832),c.scale.set(0.15,4.265,6.331),this.add(c);let h=new dt(e,cs(43));h.position.set(-0.462,8.89,14.52),h.scale.set(4.38,5.441,0.088),this.add(h);let u=new dt(e,cs(20));u.position.set(3.235,11.486,-12.541),u.scale.set(2.5,2,0.1),this.add(u);let d=new dt(e,cs(100));d.position.set(0,20,0),d.scale.set(1,0.1,1),this.add(d)}dispose(){let e=new Set;this.traverse((t)=>{if(t.isMesh)e.add(t.geometry),e.add(t.material)});for(let t of e)t.dispose()}}function cs(e){return new sa({color:0,emissive:16777215,emissiveIntensity:e})}function _n(e,t,n,i){if(!Number.isFinite(e))return Number.isFinite(t)?t:0;if(!Number.isFinite(t)||!(i>0))return e;return t+(e-t)*Math.exp(-Math.max(0,n)*i)}function zu(e,t){let n=-1,i=1/0;return e.forEach((s,r)=>{if(!(s.width>0)||!(s.height>0))return;if(s.top+s.height<0||s.top>t)return;let a=Math.abs(s.top+s.height/2-t/2);if(a<i)n=r,i=a}),n}function ku(e,t,n,i){let s=i>0&&e.height>0?e.height/i:1;return{x:e.left+e.width/2-t/2,y:n/2-(e.top+e.height),scale:s}}var _a=0.12;function Gu(e,t){let n=Number.isFinite(t)?t:0;switch(e){case"wave":return{armL:_a,armR:2.5+Math.sin(n*7)*0.32,headTilt:0.08+Math.sin(n*2)*0.03,headNod:0,bob:0.012,lean:0};case"think":return{armL:_a,armR:1.25,headTilt:-0.14,headNod:0.05,bob:0.006,lean:0};case"happy":return{armL:2.6+Math.sin(n*8)*0.15,armR:2.6+Math.sin(n*8+1)*0.15,headTilt:Math.sin(n*4)*0.06,headNod:-0.05,bob:0.03+Math.abs(Math.sin(n*5))*0.02,lean:0};default:return{armL:_a+Math.sin(n*1.2)*0.04,armR:_a+Math.sin(n*1.2+2)*0.04,headTilt:Math.sin(n*0.9)*0.04,headNod:0,bob:0.01,lean:0}}}function Hu(e,t=4.2,n=0.14){if(!Number.isFinite(e)||!(t>n)||!(n>0))return 1;let i=(e%t+t)%t;if(i>n)return 1;return 1-0.92*Math.sin(i/n*Math.PI)}function Ul(e){return Math.max(-1,Math.min(1,Number.isFinite(e)?e:0))}class Fl{limitMs;window;times=[];constructor(e,t){this.limitMs=e;this.window=t}add(e){if(!Number.isFinite(e)||e<=0)return!1;if(this.times.push(e),this.times.length>this.window)this.times.shift();if(this.times.length<this.window)return!1;return this.times.reduce((t,n)=>t+n,0)/this.times.length>this.limitMs}}var Ol=1400,K0=["body","head","earL","earR","eyeL","eyeR","armL","armR","legL","legR","scarf"];function $0(e,t){let n=document.createElement("canvas");n.width=n.height=e;let i=n.getContext("2d");if(i){let s=i.createRadialGradient(e/2,e/2,0,e/2,e/2,e/2);for(let[r,a]of t)s.addColorStop(r,a);i.fillStyle=s,i.fillRect(0,0,e,e)}return new Gs(n)}function j0(){let t=document.createElement("canvas");t.width=t.height=256;let n=t.getContext("2d");if(n){let s=n.createImageData(256,256);for(let r=0;r<s.data.length;r+=4){let a=110+Math.floor(Math.random()*90);s.data[r]=s.data[r+1]=s.data[r+2]=a,s.data[r+3]=255}n.putImageData(s,0,0)}let i=new Gs(t);return i.wrapS=i.wrapT=Xn,i.repeat.set(7,7),i}async function Vu(e){let{canvas:t}=e,n=new Al({canvas:t,antialias:!0,alpha:!0,powerPreference:"high-performance"});n.setClearColor(new Se("#ffffff"),0),n.outputColorSpace=dn,n.toneMapping=Rs,n.toneMappingExposure=1;let i=new ts,s=new vt(30,1,10,Ol*3);s.position.set(0,0,Ol);let r=new Zs(n);i.environment=r.fromScene(new Dl,0.04).texture,i.environmentIntensity=0.55,i.add(new ua(new Se("#ffffff"),0.35)),i.add(new la(new Se("#ffffff"),new Se("#cdd5df"),0.9));let a=new xi(new Se("#fff6ec"),2.3);a.position.set(-300,500,700),i.add(a);let o=new xi(new Se("#dbe8ff"),0.9);o.position.set(500,100,500),i.add(o);let c=(await new Ll().loadAsync(e.modelUrl)).scene,h=j0();c.traverse((O)=>{let Y=O;if(!Y.isMesh)return;let ee=Y.material;if(ee&&(ee.name==="fur"||ee.name==="fur_shade"))ee.bumpMap=h,ee.bumpScale=0.9,ee.needsUpdate=!0});let u={};for(let O of K0){let Y=c.getObjectByName(O);if(!Y)throw Error(`the model has no "${O}"`);u[O]=Y}let d={L:u.eyeL.position.clone(),R:u.eyeR.position.clone()},m=new Ot().setFromObject(c),_=Math.max(0.001,m.max.y-m.min.y);c.position.y-=m.min.y;let x=new Zt;x.add(c),i.add(x);let f=new jr(new Ds({map:$0(128,[[0,"rgba(20,28,40,0.34)"],[0.55,"rgba(20,28,40,0.14)"],[1,"rgba(20,28,40,0)"]]),transparent:!0,depthWrite:!1}));i.add(f);let p=()=>{let O=Math.max(1,t.clientWidth),Y=Math.max(1,t.clientHeight),ee=Math.min(window.devicePixelRatio||1,2);n.setPixelRatio(ee),n.setSize(O,Y,!1),s.aspect=O/Y,s.fov=2*Math.atan(Y/2/Ol)*180/Math.PI,s.updateProjectionMatrix()};p();let A=new ResizeObserver(p);A.observe(t);let b={x:0,y:0},T=(O)=>{b.x=O.clientX,b.y=O.clientY};window.addEventListener("pointermove",T,{passive:!0});let I=0,E=-10,P=(O)=>{if(O.target?.closest?.("[data-takumi-slot]"))I=performance.now()/1000+1.6,E=performance.now()/1000};window.addEventListener("pointerdown",P,{passive:!0});let N=new Fl(34,150),y={x:0,y:0,scale:1,armL:0.12,armR:0.12,headTilt:0,headNod:0,bob:0.01,lean:0,yaw:0},S=-1,R=!0,k=!0,X=performance.now(),G=X/1000,K=new D,H=(O)=>{if(!R)return;let Y=(O-X)/1000,ee=Math.min(0.1,Y);if(N.add(O-X)){R=!1,e.onSlow();return}X=O;let ie=O/1000-G,{innerWidth:fe,innerHeight:Pe}=window,$e=[...document.querySelectorAll("[data-takumi-slot]")].map((ke)=>{let Ce=ke.getBoundingClientRect();return{left:Ce.left,top:Ce.top,width:Ce.width,height:Ce.height,pose:ke.dataset.pose??"idle",side:ke.dataset.side??"center"}}),Z=zu($e,Pe);if(Z>=0){if(Z!==S){if(S>=0)E=O/1000;S=Z}let ke=$e[Z],Ce=ku(ke,fe,Pe,_),ut=k?1000:7;y.x=_n(y.x,Ce.x,ut,ee),y.y=_n(y.y,Ce.y,ut,ee),y.scale=_n(y.scale,Ce.scale,ut,ee);let w=ke.pose==="wave"&&ie>4.5?"idle":ke.pose,xt=O/1000<I?"happy":w,Ue=Gu(xt,ie);y.armL=_n(y.armL,Ue.armL,9,ee),y.armR=_n(y.armR,Ue.armR,9,ee),y.headTilt=_n(y.headTilt,Ue.headTilt,7,ee),y.headNod=_n(y.headNod,Ue.headNod,7,ee),y.bob=_n(y.bob,Ue.bob,5,ee);let it=ke.side==="left"?0.4:ke.side==="right"?-0.4:0;y.lean=_n(y.lean,it,5,ee)}let oe=y.x+fe/2,se=Pe/2-(y.y+y.scale*_*0.68),Te=Ul((b.x-oe)/(fe/2)),Ee=Ul((b.y-se)/(Pe/2)),Le=O/1000-E,ft=Le>=0&&Le<0.55?Math.sin(Le/0.55*Math.PI)*0.16:0,Ye=(Math.sin(ie*2.4)*y.bob+ft)*_*y.scale;x.position.set(y.x,y.y+Ye,0),x.scale.setScalar(y.scale),x.rotation.y=y.lean+Te*0.2,u.armL.rotation.z=-y.armL,u.armR.rotation.z=y.armR,u.head.rotation.z=y.headTilt,u.head.rotation.x=y.headNod+Ee*0.12,u.head.rotation.y=Te*0.22;let Je=Hu(ie);for(let ke of["L","R"]){let Ce=u[`eye${ke}`];Ce.scale.y=Je,Ce.position.x=d[ke].x+Te*0.035,Ce.position.y=d[ke].y-Ee*0.03}if(K.set(y.x,y.y-4,-5),f.position.copy(K),f.scale.set(_*y.scale*0.82,_*y.scale*0.13,1),f.material.opacity=Math.max(0.35,1-ft*2.2),n.render(i,s),k)k=!1,e.onReady();requestAnimationFrame(H)};return requestAnimationFrame(H),{stop(){R=!1,A.disconnect(),window.removeEventListener("pointermove",T),window.removeEventListener("pointerdown",P),n.dispose(),r.dispose()}}}var hs=document.documentElement,Wu=document.getElementById("stage"),Q0=typeof matchMedia==="function"&&matchMedia("(max-width: 599px), (max-height: 500px) and (pointer: coarse)").matches,e_=typeof matchMedia==="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;function t_(){try{let e=document.createElement("canvas");return!!(e.getContext("webgl2")||e.getContext("webgl"))}catch{return!1}}var Xu=null;async function n_(){if(!Wu||ql({phone:Q0,calm:e_,webgl:t_()})==="flat"){hs.classList.add("flat-only");return}try{Xu=await Vu({canvas:Wu,modelUrl:"/landing/takumi.glb",onReady:()=>hs.classList.add("scene-ready"),onSlow:()=>{hs.classList.remove("scene-ready"),hs.classList.add("flat-only"),Xu?.stop()}})}catch{hs.classList.remove("scene-ready"),hs.classList.add("flat-only")}}n_();})();
