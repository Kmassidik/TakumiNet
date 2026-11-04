(()=>{function ac(e){return e.phone||e.calm||!e.webgl?"poster":"live"}var Wc="182";var Xc=0,uo=1,qc=2;var Ps=1,Yc=2,Ji=3,Yn=0,Dt=1,jt=2,ln=0,Ls=1,ui=2,fo=3,po=4,Zc=5,Ki=100,Jc=101,Kc=102,$c=103,jc=104,Qc=200,eh=201,th=202,nh=203,ih=204,sh=205,rh=206,ah=207,oh=208,lh=209,ch=210,hh=211,uh=212,dh=213,fh=214,Hr=0,Vr=1,Wr=2,Ns=3,Xr=4,qr=5,Yr=6,Zr=7,ph=0,mh=1,gh=2,cn=0,Ds=1,Us=2,Fs=3,di=4,Os=5,Bs=6,zs=7;var $i=301,fi=302,Jr=303,Kr=304,ks=306,ji=1000,Qi=1001,$r=1002,hn=1003,jr=1004;var pi=1005;var Ct=1006,es=1007;var Ln=1008;var un=1009,_h=1010,xh=1011,Gs=1012,mo=1013,Zn=1014,Nn=1015,Ut=1016,go=1017,_o=1018,ts=1020,vh=35902,yh=35899,Mh=1021,Sh=1022,mn=1023,mi=1026,gi=1027,bh=1028,xo=1029,ns=1030,vo=1031;var yo=1033,Qr=33776,ea=33777,ta=33778,na=33779,Mo=35840,So=35841,bo=35842,To=35843,Ao=36196,Eo=37492,wo=37496,Co=37488,Ro=37489,Io=37490,Po=37491,Lo=37808,No=37809,Do=37810,Uo=37811,Fo=37812,Oo=37813,Bo=37814,zo=37815,ko=37816,Go=37817,Ho=37818,Vo=37819,Wo=37820,Xo=37821,qo=36492,Yo=36494,Zo=36495,Jo=36283,Ko=36284,$o=36285,jo=36286;var Qo=2300,ia=2301;var el=0,Hs=1,is=2;var Th=0,Ah=1,_i="",gn="srgb",Ft="srgb-linear",tl="linear",et="srgb";var Eh=512,wh=513,Ch=514,sa=515,Rh=516,Ih=517,ra=518,Ph=519;var nl="300 es",il=2000;function sl(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function xd(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function qi(e){return document.createElementNS("http://www.w3.org/1999/xhtml",e)}function Lh(){let e=qi("canvas");return e.style.display="block",e}var oc={},Yi=null;function Is(...e){let t="THREE."+e.shift();if(Yi)Yi("log",t,...e);else console.log(t,...e)}function be(...e){let t="THREE."+e.shift();if(Yi)Yi("warn",t,...e);else console.warn(t,...e)}function Re(...e){let t="THREE."+e.shift();if(Yi)Yi("error",t,...e);else console.error(t,...e)}function Zi(...e){let t=e.join(" ");if(t in oc)return;oc[t]=!0,be(...e)}function Nh(e,t,n){return new Promise(function(i,s){function r(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:s();break;case e.TIMEOUT_EXPIRED:setTimeout(r,n);break;default:i()}}setTimeout(r,n)})}class Jn{addEventListener(e,t){if(this._listeners===void 0)this._listeners={};let n=this._listeners;if(n[e]===void 0)n[e]=[];if(n[e].indexOf(t)===-1)n[e].push(t)}hasEventListener(e,t){let n=this._listeners;if(n===void 0)return!1;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let i=n[e];if(i!==void 0){let s=i.indexOf(t);if(s!==-1)i.splice(s,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let i=n.slice(0);for(let s=0,r=i.length;s<r;s++)i[s].call(this,e);e.target=null}}}var Rt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],lc=1234567,Cs=Math.PI/180,ci=180/Math.PI;function on(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Rt[e&255]+Rt[e>>8&255]+Rt[e>>16&255]+Rt[e>>24&255]+"-"+Rt[t&255]+Rt[t>>8&255]+"-"+Rt[t>>16&15|64]+Rt[t>>24&255]+"-"+Rt[n&63|128]+Rt[n>>8&255]+"-"+Rt[n>>16&255]+Rt[n>>24&255]+Rt[i&255]+Rt[i>>8&255]+Rt[i>>16&255]+Rt[i>>24&255]).toLowerCase()}function We(e,t,n){return Math.max(t,Math.min(n,e))}function rl(e,t){return(e%t+t)%t}function vd(e,t,n,i,s){return i+(e-t)*(s-i)/(n-t)}function yd(e,t,n){if(e!==t)return(n-e)/(t-e);else return 0}function Rs(e,t,n){return(1-n)*e+n*t}function Md(e,t,n,i){return Rs(e,t,1-Math.exp(-n*i))}function Sd(e,t=1){return t-Math.abs(rl(e,t*2)-t)}function bd(e,t,n){if(e<=t)return 0;if(e>=n)return 1;return e=(e-t)/(n-t),e*e*(3-2*e)}function Td(e,t,n){if(e<=t)return 0;if(e>=n)return 1;return e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10)}function Ad(e,t){return e+Math.floor(Math.random()*(t-e+1))}function Ed(e,t){return e+Math.random()*(t-e)}function wd(e){return e*(0.5-Math.random())}function Cd(e){if(e!==void 0)lc=e;let t=lc+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Rd(e){return e*Cs}function Id(e){return e*ci}function Pd(e){return(e&e-1)===0&&e!==0}function Ld(e){return Math.pow(2,Math.ceil(Math.log(e)/Math.LN2))}function Nd(e){return Math.pow(2,Math.floor(Math.log(e)/Math.LN2))}function Dd(e,t,n,i,s){let{cos:r,sin:a}=Math,o=r(n/2),l=a(n/2),c=r((t+i)/2),h=a((t+i)/2),u=r((t-i)/2),d=a((t-i)/2),m=r((i-t)/2),_=a((i-t)/2);switch(s){case"XYX":e.set(o*h,l*u,l*d,o*c);break;case"YZY":e.set(l*d,o*h,l*u,o*c);break;case"ZXZ":e.set(l*u,l*d,o*h,o*c);break;case"XZX":e.set(o*h,l*_,l*m,o*c);break;case"YXY":e.set(l*m,o*h,l*_,o*c);break;case"ZYZ":e.set(l*_,l*m,o*h,o*c);break;default:be("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function an(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error("Invalid component type.")}}function je(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error("Invalid component type.")}}var al={DEG2RAD:Cs,RAD2DEG:ci,generateUUID:on,clamp:We,euclideanModulo:rl,mapLinear:vd,inverseLerp:yd,lerp:Rs,damp:Md,pingpong:Sd,smoothstep:bd,smootherstep:Td,randInt:Ad,randFloat:Ed,randFloatSpread:wd,seededRandom:Cd,degToRad:Rd,radToDeg:Id,isPowerOfTwo:Pd,ceilPowerOfTwo:Ld,floorPowerOfTwo:Nd,setQuaternionFromProperEuler:Dd,normalize:je,denormalize:an};class Me{constructor(e=0,t=0){Me.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(We(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(We(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),i=Math.sin(t),s=this.x-e.x,r=this.y-e.y;return this.x=s*n-r*i+e.x,this.y=s*i+r*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class dn{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,s,r,a){let o=n[i+0],l=n[i+1],c=n[i+2],h=n[i+3],u=s[r+0],d=s[r+1],m=s[r+2],_=s[r+3];if(a<=0){e[t+0]=o,e[t+1]=l,e[t+2]=c,e[t+3]=h;return}if(a>=1){e[t+0]=u,e[t+1]=d,e[t+2]=m,e[t+3]=_;return}if(h!==_||o!==u||l!==d||c!==m){let x=o*u+l*d+c*m+h*_;if(x<0)u=-u,d=-d,m=-m,_=-_,x=-x;let f=1-a;if(x<0.9995){let p=Math.acos(x),A=Math.sin(p);f=Math.sin(f*p)/A,a=Math.sin(a*p)/A,o=o*f+u*a,l=l*f+d*a,c=c*f+m*a,h=h*f+_*a}else{o=o*f+u*a,l=l*f+d*a,c=c*f+m*a,h=h*f+_*a;let p=1/Math.sqrt(o*o+l*l+c*c+h*h);o*=p,l*=p,c*=p,h*=p}}e[t]=o,e[t+1]=l,e[t+2]=c,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,i,s,r){let a=n[i],o=n[i+1],l=n[i+2],c=n[i+3],h=s[r],u=s[r+1],d=s[r+2],m=s[r+3];return e[t]=a*m+c*h+o*d-l*u,e[t+1]=o*m+c*u+l*h-a*d,e[t+2]=l*m+c*d+a*u-o*h,e[t+3]=c*m-a*h-o*u-l*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let{_x:n,_y:i,_z:s,_order:r}=e,{cos:a,sin:o}=Math,l=a(n/2),c=a(i/2),h=a(s/2),u=o(n/2),d=o(i/2),m=o(s/2);switch(r){case"XYZ":this._x=u*c*h+l*d*m,this._y=l*d*h-u*c*m,this._z=l*c*m+u*d*h,this._w=l*c*h-u*d*m;break;case"YXZ":this._x=u*c*h+l*d*m,this._y=l*d*h-u*c*m,this._z=l*c*m-u*d*h,this._w=l*c*h+u*d*m;break;case"ZXY":this._x=u*c*h-l*d*m,this._y=l*d*h+u*c*m,this._z=l*c*m+u*d*h,this._w=l*c*h-u*d*m;break;case"ZYX":this._x=u*c*h-l*d*m,this._y=l*d*h+u*c*m,this._z=l*c*m-u*d*h,this._w=l*c*h+u*d*m;break;case"YZX":this._x=u*c*h+l*d*m,this._y=l*d*h+u*c*m,this._z=l*c*m-u*d*h,this._w=l*c*h-u*d*m;break;case"XZY":this._x=u*c*h-l*d*m,this._y=l*d*h-u*c*m,this._z=l*c*m+u*d*h,this._w=l*c*h+u*d*m;break;default:be("Quaternion: .setFromEuler() encountered an unknown order: "+r)}if(t===!0)this._onChangeCallback();return this}setFromAxisAngle(e,t){let n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],i=t[4],s=t[8],r=t[1],a=t[5],o=t[9],l=t[2],c=t[6],h=t[10],u=n+a+h;if(u>0){let d=0.5/Math.sqrt(u+1);this._w=0.25/d,this._x=(c-o)*d,this._y=(s-l)*d,this._z=(r-i)*d}else if(n>a&&n>h){let d=2*Math.sqrt(1+n-a-h);this._w=(c-o)/d,this._x=0.25*d,this._y=(i+r)/d,this._z=(s+l)/d}else if(a>h){let d=2*Math.sqrt(1+a-n-h);this._w=(s-l)/d,this._x=(i+r)/d,this._y=0.25*d,this._z=(o+c)/d}else{let d=2*Math.sqrt(1+h-n-a);this._w=(r-i)/d,this._x=(s+l)/d,this._y=(o+c)/d,this._z=0.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;if(n<0.00000001)if(n=0,Math.abs(e.x)>Math.abs(e.z))this._x=-e.y,this._y=e.x,this._z=0,this._w=n;else this._x=0,this._y=-e.z,this._z=e.y,this._w=n;else this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n;return this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(We(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();if(e===0)this._x=0,this._y=0,this._z=0,this._w=1;else e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e;return this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let{_x:n,_y:i,_z:s,_w:r}=e,{_x:a,_y:o,_z:l,_w:c}=t;return this._x=n*c+r*a+i*l-s*o,this._y=i*c+r*o+s*a-n*l,this._z=s*c+r*l+n*o-i*a,this._w=r*c-n*a-i*o-s*l,this._onChangeCallback(),this}slerp(e,t){if(t<=0)return this;if(t>=1)return this.copy(e);let{_x:n,_y:i,_z:s,_w:r}=e,a=this.dot(e);if(a<0)n=-n,i=-i,s=-s,r=-r,a=-a;let o=1-t;if(a<0.9995){let l=Math.acos(a),c=Math.sin(l);o=Math.sin(o*l)/c,t=Math.sin(t*l)/c,this._x=this._x*o+n*t,this._y=this._y*o+i*t,this._z=this._z*o+s*t,this._w=this._w*o+r*t,this._onChangeCallback()}else this._x=this._x*o+n*t,this._y=this._y*o+i*t,this._z=this._z*o+s*t,this._w=this._w*o+r*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class L{constructor(e=0,t=0,n=0){L.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){if(n===void 0)n=this.z;return this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(cc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(cc.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*i,this.y=s[1]*t+s[4]*n+s[7]*i,this.z=s[2]*t+s[5]*n+s[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,s=e.elements,r=1/(s[3]*t+s[7]*n+s[11]*i+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*i+s[12])*r,this.y=(s[1]*t+s[5]*n+s[9]*i+s[13])*r,this.z=(s[2]*t+s[6]*n+s[10]*i+s[14])*r,this}applyQuaternion(e){let t=this.x,n=this.y,i=this.z,{x:s,y:r,z:a,w:o}=e,l=2*(r*i-a*n),c=2*(a*t-s*i),h=2*(s*n-r*t);return this.x=t+o*l+r*h-a*c,this.y=n+o*c+a*l-s*h,this.z=i+o*h+s*c-r*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*i,this.y=s[1]*t+s[5]*n+s[9]*i,this.z=s[2]*t+s[6]*n+s[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this.z=We(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this.z=We(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(We(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let{x:n,y:i,z:s}=e,{x:r,y:a,z:o}=t;return this.x=i*o-s*a,this.y=s*r-n*o,this.z=n*a-i*r,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Oa.copy(this).projectOnVector(e),this.sub(Oa)}reflect(e){return this.sub(Oa.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(We(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}var Oa=new L,cc=new dn;class Oe{constructor(e,t,n,i,s,r,a,o,l){if(Oe.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0)this.set(e,t,n,i,s,r,a,o,l)}set(e,t,n,i,s,r,a,o,l){let c=this.elements;return c[0]=e,c[1]=i,c[2]=a,c[3]=t,c[4]=s,c[5]=o,c[6]=n,c[7]=r,c[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,s=this.elements,r=n[0],a=n[3],o=n[6],l=n[1],c=n[4],h=n[7],u=n[2],d=n[5],m=n[8],_=i[0],x=i[3],f=i[6],p=i[1],A=i[4],M=i[7],b=i[2],R=i[5],E=i[8];return s[0]=r*_+a*p+o*b,s[3]=r*x+a*A+o*R,s[6]=r*f+a*M+o*E,s[1]=l*_+c*p+h*b,s[4]=l*x+c*A+h*R,s[7]=l*f+c*M+h*E,s[2]=u*_+d*p+m*b,s[5]=u*x+d*A+m*R,s[8]=u*f+d*M+m*E,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],r=e[4],a=e[5],o=e[6],l=e[7],c=e[8];return t*r*c-t*a*l-n*s*c+n*a*o+i*s*l-i*r*o}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],r=e[4],a=e[5],o=e[6],l=e[7],c=e[8],h=c*r-a*l,u=a*o-c*s,d=l*s-r*o,m=t*h+n*u+i*d;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/m;return e[0]=h*_,e[1]=(i*l-c*n)*_,e[2]=(a*n-i*r)*_,e[3]=u*_,e[4]=(c*t-i*o)*_,e[5]=(i*s-a*t)*_,e[6]=d*_,e[7]=(n*o-l*t)*_,e[8]=(r*t-n*s)*_,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,s,r,a){let o=Math.cos(s),l=Math.sin(s);return this.set(n*o,n*l,-n*(o*r+l*a)+r+e,-i*l,i*o,-i*(-l*r+o*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(Ba.makeScale(e,t)),this}rotate(e){return this.premultiply(Ba.makeRotation(-e)),this}translate(e,t){return this.premultiply(Ba.makeTranslation(e,t)),this}makeTranslation(e,t){if(e.isVector2)this.set(1,0,e.x,0,1,e.y,0,0,1);else this.set(1,0,e,0,1,t,0,0,1);return this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}var Ba=new Oe,hc=new Oe().set(0.4123908,0.3575843,0.1804808,0.212639,0.7151687,0.0721923,0.0193308,0.1191948,0.9505322),uc=new Oe().set(3.2409699,-1.5373832,-0.4986108,-0.9692436,1.8759675,0.0415551,0.0556301,-0.203977,1.0569715);function Ud(){let e={enabled:!0,workingColorSpace:"srgb-linear",spaces:{},convert:function(s,r,a){if(this.enabled===!1||r===a||!r||!a)return s;if(this.spaces[r].transfer==="srgb")s.r=Rn(s.r),s.g=Rn(s.g),s.b=Rn(s.b);if(this.spaces[r].primaries!==this.spaces[a].primaries)s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ);if(this.spaces[a].transfer==="srgb")s.r=Xi(s.r),s.g=Xi(s.g),s.b=Xi(s.b);return s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){if(s==="")return"linear";return this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Zi("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),e.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Zi("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),e.colorSpaceToWorking(s,r)}},t=[0.64,0.33,0.3,0.6,0.15,0.06],n=[0.2126,0.7152,0.0722],i=[0.3127,0.329];return e.define({["srgb-linear"]:{primaries:t,whitePoint:i,transfer:"linear",toXYZ:hc,fromXYZ:uc,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:"srgb"},outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}},["srgb"]:{primaries:t,whitePoint:i,transfer:"srgb",toXYZ:hc,fromXYZ:uc,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}}}),e}var Ge=Ud();function Rn(e){return e<0.04045?e*0.0773993808:Math.pow(e*0.9478672986+0.0521327014,2.4)}function Xi(e){return e<0.0031308?e*12.92:1.055*Math.pow(e,0.41666)-0.055}var wi;class ol{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src))return e.src;if(typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{if(wi===void 0)wi=qi("canvas");wi.width=e.width,wi.height=e.height;let i=wi.getContext("2d");if(e instanceof ImageData)i.putImageData(e,0,0);else i.drawImage(e,0,0,e.width,e.height);n=wi}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=qi("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let i=n.getImageData(0,0,e.width,e.height),s=i.data;for(let r=0;r<s.length;r++)s[r]=Rn(s[r]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)if(t instanceof Uint8Array||t instanceof Uint8ClampedArray)t[n]=Math.floor(Rn(t[n]/255)*255);else t[n]=Rn(t[n]);return{data:t,width:e.width,height:e.height}}else return be("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}var Fd=0;class Vs{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Fd++}),this.uuid=on(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;if(typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement)e.set(t.videoWidth,t.videoHeight,0);else if(typeof VideoFrame<"u"&&t instanceof VideoFrame)e.set(t.displayHeight,t.displayWidth,0);else if(t!==null)e.set(t.width,t.height,t.depth||0);else e.set(0,0,0);return e}set needsUpdate(e){if(e===!0)this.version++}toJSON(e){let t=e===void 0||typeof e==="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let s;if(Array.isArray(i)){s=[];for(let r=0,a=i.length;r<a;r++)if(i[r].isDataTexture)s.push(za(i[r].image));else s.push(za(i[r]))}else s=za(i);n.url=s}if(!t)e.images[this.uuid]=n;return n}}function za(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap)return ol.getDataURL(e);else if(e.data)return{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name};else return be("Texture: Unable to serialize Texture."),{}}var Od=0,ka=new L;class pt extends Jn{constructor(e=pt.DEFAULT_IMAGE,t=pt.DEFAULT_MAPPING,n=1001,i=1001,s=1006,r=1008,a=1023,o=1009,l=pt.DEFAULT_ANISOTROPY,c=""){super();this.isTexture=!0,Object.defineProperty(this,"id",{value:Od++}),this.uuid=on(),this.name="",this.source=new Vs(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=s,this.minFilter=r,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=o,this.offset=new Me(0,0),this.repeat=new Me(1,1),this.center=new Me(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Oe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=c,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=e&&e.depth&&e.depth>1?!0:!1,this.pmremVersion=0}get width(){return this.source.getSize(ka).x}get height(){return this.source.getSize(ka).y}get depth(){return this.source.getSize(ka).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){be(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let i=this[t];if(i===void 0){be(`Texture.setValues(): property '${t}' does not exist.`);continue}if(i&&n&&(i.isVector2&&n.isVector2))i.copy(n);else if(i&&n&&(i.isVector3&&n.isVector3))i.copy(n);else if(i&&n&&(i.isMatrix3&&n.isMatrix3))i.copy(n);else this[t]=n}}toJSON(e){let t=e===void 0||typeof e==="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};if(Object.keys(this.userData).length>0)n.userData=this.userData;if(!t)e.textures[this.uuid]=n;return n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case 1000:e.x=e.x-Math.floor(e.x);break;case 1001:e.x=e.x<0?0:1;break;case 1002:if(Math.abs(Math.floor(e.x)%2)===1)e.x=Math.ceil(e.x)-e.x;else e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case 1000:e.y=e.y-Math.floor(e.y);break;case 1001:e.y=e.y<0?0:1;break;case 1002:if(Math.abs(Math.floor(e.y)%2)===1)e.y=Math.ceil(e.y)-e.y;else e.y=e.y-Math.floor(e.y);break}if(this.flipY)e.y=1-e.y;return e}set needsUpdate(e){if(e===!0)this.version++,this.source.needsUpdate=!0}set needsPMREMUpdate(e){if(e===!0)this.pmremVersion++}}pt.DEFAULT_IMAGE=null;pt.DEFAULT_MAPPING=300;pt.DEFAULT_ANISOTROPY=1;class ct{constructor(e=0,t=0,n=0,i=1){ct.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,s=this.w,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*i+r[12]*s,this.y=r[1]*t+r[5]*n+r[9]*i+r[13]*s,this.z=r[2]*t+r[6]*n+r[10]*i+r[14]*s,this.w=r[3]*t+r[7]*n+r[11]*i+r[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);if(t<0.0001)this.x=1,this.y=0,this.z=0;else this.x=e.x/t,this.y=e.y/t,this.z=e.z/t;return this}setAxisAngleFromRotationMatrix(e){let t,n,i,s,r=0.01,a=0.1,o=e.elements,l=o[0],c=o[4],h=o[8],u=o[1],d=o[5],m=o[9],_=o[2],x=o[6],f=o[10];if(Math.abs(c-u)<0.01&&Math.abs(h-_)<0.01&&Math.abs(m-x)<0.01){if(Math.abs(c+u)<0.1&&Math.abs(h+_)<0.1&&Math.abs(m+x)<0.1&&Math.abs(l+d+f-3)<0.1)return this.set(1,0,0,0),this;t=Math.PI;let A=(l+1)/2,M=(d+1)/2,b=(f+1)/2,R=(c+u)/4,E=(h+_)/4,P=(m+x)/4;if(A>M&&A>b)if(A<0.01)n=0,i=0.707106781,s=0.707106781;else n=Math.sqrt(A),i=R/n,s=E/n;else if(M>b)if(M<0.01)n=0.707106781,i=0,s=0.707106781;else i=Math.sqrt(M),n=R/i,s=P/i;else if(b<0.01)n=0.707106781,i=0.707106781,s=0;else s=Math.sqrt(b),n=E/s,i=P/s;return this.set(n,i,s,t),this}let p=Math.sqrt((x-m)*(x-m)+(h-_)*(h-_)+(u-c)*(u-c));if(Math.abs(p)<0.001)p=1;return this.x=(x-m)/p,this.y=(h-_)/p,this.z=(u-c)/p,this.w=Math.acos((l+d+f-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this.z=We(this.z,e.z,t.z),this.w=We(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this.z=We(this.z,e,t),this.w=We(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(We(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class ll extends Jn{constructor(e=1,t=1,n={}){super();n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:1006,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new ct(0,0,e,t),this.scissorTest=!1,this.viewport=new ct(0,0,e,t);let i={width:e,height:t,depth:n.depth},s=new pt(i);this.textures=[];let r=n.count;for(let a=0;a<r;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){let t={minFilter:1006,generateMipmaps:!1,flipY:!1,internalFormat:null};if(e.mapping!==void 0)t.mapping=e.mapping;if(e.wrapS!==void 0)t.wrapS=e.wrapS;if(e.wrapT!==void 0)t.wrapT=e.wrapT;if(e.wrapR!==void 0)t.wrapR=e.wrapR;if(e.magFilter!==void 0)t.magFilter=e.magFilter;if(e.minFilter!==void 0)t.minFilter=e.minFilter;if(e.format!==void 0)t.format=e.format;if(e.type!==void 0)t.type=e.type;if(e.anisotropy!==void 0)t.anisotropy=e.anisotropy;if(e.colorSpace!==void 0)t.colorSpace=e.colorSpace;if(e.flipY!==void 0)t.flipY=e.flipY;if(e.generateMipmaps!==void 0)t.generateMipmaps=e.generateMipmaps;if(e.internalFormat!==void 0)t.internalFormat=e.internalFormat;for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){if(this._depthTexture!==null)this._depthTexture.renderTarget=null;if(e!==null)e.renderTarget=this;this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,s=this.textures.length;i<s;i++)if(this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n,this.textures[i].isData3DTexture!==!0)this.textures[i].isArrayTexture=this.textures[i].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let i=Object.assign({},e.textures[t].image);this.textures[t].source=new Vs(i)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null)this.depthTexture=e.depthTexture.clone();return this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Et extends ll{constructor(e=1,t=1,n={}){super(e,t,n);this.isWebGLRenderTarget=!0}}class aa extends pt{constructor(e=null,t=1,n=1,i=1){super(null);this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class cl extends pt{constructor(e=null,t=1,n=1,i=1){super(null);this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Qt{constructor(e=new L(1/0,1/0,1/0),t=new L(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(nn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(nn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=nn.copy(t).multiplyScalar(0.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(0.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let r=0,a=s.count;r<a;r++){if(e.isMesh===!0)e.getVertexPosition(r,nn);else nn.fromBufferAttribute(s,r);nn.applyMatrix4(e.matrixWorld),this.expandByPoint(nn)}else{if(e.boundingBox!==void 0){if(e.boundingBox===null)e.computeBoundingBox();fr.copy(e.boundingBox)}else{if(n.boundingBox===null)n.computeBoundingBox();fr.copy(n.boundingBox)}fr.applyMatrix4(e.matrixWorld),this.union(fr)}}let i=e.children;for(let s=0,r=i.length;s<r;s++)this.expandByObject(i[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,nn),nn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;if(e.normal.x>0)t=e.normal.x*this.min.x,n=e.normal.x*this.max.x;else t=e.normal.x*this.max.x,n=e.normal.x*this.min.x;if(e.normal.y>0)t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y;else t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y;if(e.normal.z>0)t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z;else t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z;return t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(xs),pr.subVectors(this.max,xs),Ci.subVectors(e.a,xs),Ri.subVectors(e.b,xs),Ii.subVectors(e.c,xs),kn.subVectors(Ri,Ci),Gn.subVectors(Ii,Ri),ri.subVectors(Ci,Ii);let t=[0,-kn.z,kn.y,0,-Gn.z,Gn.y,0,-ri.z,ri.y,kn.z,0,-kn.x,Gn.z,0,-Gn.x,ri.z,0,-ri.x,-kn.y,kn.x,0,-Gn.y,Gn.x,0,-ri.y,ri.x,0];if(!Ga(t,Ci,Ri,Ii,pr))return!1;if(t=[1,0,0,0,1,0,0,0,1],!Ga(t,Ci,Ri,Ii,pr))return!1;return mr.crossVectors(kn,Gn),t=[mr.x,mr.y,mr.z],Ga(t,Ci,Ri,Ii,pr)}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,nn).distanceTo(e)}getBoundingSphere(e){if(this.isEmpty())e.makeEmpty();else this.getCenter(e.center),e.radius=this.getSize(nn).length()*0.5;return e}intersect(e){if(this.min.max(e.min),this.max.min(e.max),this.isEmpty())this.makeEmpty();return this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){if(this.isEmpty())return this;return Sn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Sn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Sn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Sn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Sn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Sn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Sn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Sn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Sn),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}var Sn=[new L,new L,new L,new L,new L,new L,new L,new L],nn=new L,fr=new Qt,Ci=new L,Ri=new L,Ii=new L,kn=new L,Gn=new L,ri=new L,xs=new L,pr=new L,mr=new L,ai=new L;function Ga(e,t,n,i,s){for(let r=0,a=e.length-3;r<=a;r+=3){ai.fromArray(e,r);let o=s.x*Math.abs(ai.x)+s.y*Math.abs(ai.y)+s.z*Math.abs(ai.z),l=t.dot(ai),c=n.dot(ai),h=i.dot(ai);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var Bd=new Qt,vs=new L,Ha=new L;class qt{constructor(e=new L,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;if(t!==void 0)n.copy(t);else Bd.setFromPoints(e).getCenter(n);let i=0;for(let s=0,r=e.length;s<r;s++)i=Math.max(i,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);if(t.copy(e),n>this.radius*this.radius)t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center);return t}getBoundingBox(e){if(this.isEmpty())return e.makeEmpty(),e;return e.set(this.center,this.center),e.expandByScalar(this.radius),e}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;vs.subVectors(e,this.center);let t=vs.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),i=(n-this.radius)*0.5;this.center.addScaledVector(vs,i/n),this.radius+=i}return this}union(e){if(e.isEmpty())return this;if(this.isEmpty())return this.copy(e),this;if(this.center.equals(e.center)===!0)this.radius=Math.max(this.radius,e.radius);else Ha.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(vs.copy(e.center).add(Ha)),this.expandByPoint(vs.copy(e.center).sub(Ha));return this}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}var bn=new L,Va=new L,gr=new L,Hn=new L,Wa=new L,_r=new L,Xa=new L;class ss{constructor(e=new L,t=new L(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,bn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);if(n<0)return t.copy(this.origin);return t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=bn.subVectors(e,this.origin).dot(this.direction);if(t<0)return this.origin.distanceToSquared(e);return bn.copy(this.origin).addScaledVector(this.direction,t),bn.distanceToSquared(e)}distanceSqToSegment(e,t,n,i){Va.copy(e).add(t).multiplyScalar(0.5),gr.copy(t).sub(e).normalize(),Hn.copy(this.origin).sub(Va);let s=e.distanceTo(t)*0.5,r=-this.direction.dot(gr),a=Hn.dot(this.direction),o=-Hn.dot(gr),l=Hn.lengthSq(),c=Math.abs(1-r*r),h,u,d,m;if(c>0)if(h=r*o-a,u=r*a-o,m=s*c,h>=0)if(u>=-m)if(u<=m){let _=1/c;h*=_,u*=_,d=h*(h+r*u+2*a)+u*(r*h+u+2*o)+l}else u=s,h=Math.max(0,-(r*u+a)),d=-h*h+u*(u+2*o)+l;else u=-s,h=Math.max(0,-(r*u+a)),d=-h*h+u*(u+2*o)+l;else if(u<=-m)h=Math.max(0,-(-r*s+a)),u=h>0?-s:Math.min(Math.max(-s,-o),s),d=-h*h+u*(u+2*o)+l;else if(u<=m)h=0,u=Math.min(Math.max(-s,-o),s),d=u*(u+2*o)+l;else h=Math.max(0,-(r*s+a)),u=h>0?s:Math.min(Math.max(-s,-o),s),d=-h*h+u*(u+2*o)+l;else u=r>0?-s:s,h=Math.max(0,-(r*u+a)),d=-h*h+u*(u+2*o)+l;if(n)n.copy(this.origin).addScaledVector(this.direction,h);if(i)i.copy(Va).addScaledVector(gr,u);return d}intersectSphere(e,t){bn.subVectors(e.center,this.origin);let n=bn.dot(this.direction),i=bn.dot(bn)-n*n,s=e.radius*e.radius;if(i>s)return null;let r=Math.sqrt(s-i),a=n-r,o=n+r;if(o<0)return null;if(a<0)return this.at(o,t);return this.at(a,t)}intersectsSphere(e){if(e.radius<0)return!1;return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0){if(e.distanceToPoint(this.origin)===0)return 0;return null}let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);if(n===null)return null;return this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);if(t===0)return!0;if(e.normal.dot(this.direction)*t<0)return!0;return!1}intersectBox(e,t){let n,i,s,r,a,o,l=1/this.direction.x,c=1/this.direction.y,h=1/this.direction.z,u=this.origin;if(l>=0)n=(e.min.x-u.x)*l,i=(e.max.x-u.x)*l;else n=(e.max.x-u.x)*l,i=(e.min.x-u.x)*l;if(c>=0)s=(e.min.y-u.y)*c,r=(e.max.y-u.y)*c;else s=(e.max.y-u.y)*c,r=(e.min.y-u.y)*c;if(n>r||s>i)return null;if(s>n||isNaN(n))n=s;if(r<i||isNaN(i))i=r;if(h>=0)a=(e.min.z-u.z)*h,o=(e.max.z-u.z)*h;else a=(e.max.z-u.z)*h,o=(e.min.z-u.z)*h;if(n>o||a>i)return null;if(a>n||n!==n)n=a;if(o<i||i!==i)i=o;if(i<0)return null;return this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,bn)!==null}intersectTriangle(e,t,n,i,s){Wa.subVectors(t,e),_r.subVectors(n,e),Xa.crossVectors(Wa,_r);let r=this.direction.dot(Xa),a;if(r>0){if(i)return null;a=1}else if(r<0)a=-1,r=-r;else return null;Hn.subVectors(this.origin,e);let o=a*this.direction.dot(_r.crossVectors(Hn,_r));if(o<0)return null;let l=a*this.direction.dot(Wa.cross(Hn));if(l<0)return null;if(o+l>r)return null;let c=-a*Hn.dot(Xa);if(c<0)return null;return this.at(c/r,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Fe{constructor(e,t,n,i,s,r,a,o,l,c,h,u,d,m,_,x){if(Fe.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0)this.set(e,t,n,i,s,r,a,o,l,c,h,u,d,m,_,x)}set(e,t,n,i,s,r,a,o,l,c,h,u,d,m,_,x){let f=this.elements;return f[0]=e,f[4]=t,f[8]=n,f[12]=i,f[1]=s,f[5]=r,f[9]=a,f[13]=o,f[2]=l,f[6]=c,f[10]=h,f[14]=u,f[3]=d,f[7]=m,f[11]=_,f[15]=x,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Fe().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){if(this.determinant()===0)return e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this;return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinant()===0)return this.identity();let t=this.elements,n=e.elements,i=1/Pi.setFromMatrixColumn(e,0).length(),s=1/Pi.setFromMatrixColumn(e,1).length(),r=1/Pi.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*r,t[9]=n[9]*r,t[10]=n[10]*r,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,{x:n,y:i,z:s}=e,r=Math.cos(n),a=Math.sin(n),o=Math.cos(i),l=Math.sin(i),c=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){let u=r*c,d=r*h,m=a*c,_=a*h;t[0]=o*c,t[4]=-o*h,t[8]=l,t[1]=d+m*l,t[5]=u-_*l,t[9]=-a*o,t[2]=_-u*l,t[6]=m+d*l,t[10]=r*o}else if(e.order==="YXZ"){let u=o*c,d=o*h,m=l*c,_=l*h;t[0]=u+_*a,t[4]=m*a-d,t[8]=r*l,t[1]=r*h,t[5]=r*c,t[9]=-a,t[2]=d*a-m,t[6]=_+u*a,t[10]=r*o}else if(e.order==="ZXY"){let u=o*c,d=o*h,m=l*c,_=l*h;t[0]=u-_*a,t[4]=-r*h,t[8]=m+d*a,t[1]=d+m*a,t[5]=r*c,t[9]=_-u*a,t[2]=-r*l,t[6]=a,t[10]=r*o}else if(e.order==="ZYX"){let u=r*c,d=r*h,m=a*c,_=a*h;t[0]=o*c,t[4]=m*l-d,t[8]=u*l+_,t[1]=o*h,t[5]=_*l+u,t[9]=d*l-m,t[2]=-l,t[6]=a*o,t[10]=r*o}else if(e.order==="YZX"){let u=r*o,d=r*l,m=a*o,_=a*l;t[0]=o*c,t[4]=_-u*h,t[8]=m*h+d,t[1]=h,t[5]=r*c,t[9]=-a*c,t[2]=-l*c,t[6]=d*h+m,t[10]=u-_*h}else if(e.order==="XZY"){let u=r*o,d=r*l,m=a*o,_=a*l;t[0]=o*c,t[4]=-h,t[8]=l*c,t[1]=u*h+_,t[5]=r*c,t[9]=d*h-m,t[2]=m*h-d,t[6]=a*c,t[10]=_*h+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(zd,e,kd)}lookAt(e,t,n){let i=this.elements;if(Vt.subVectors(e,t),Vt.lengthSq()===0)Vt.z=1;if(Vt.normalize(),Vn.crossVectors(n,Vt),Vn.lengthSq()===0){if(Math.abs(n.z)===1)Vt.x+=0.0001;else Vt.z+=0.0001;Vt.normalize(),Vn.crossVectors(n,Vt)}return Vn.normalize(),xr.crossVectors(Vt,Vn),i[0]=Vn.x,i[4]=xr.x,i[8]=Vt.x,i[1]=Vn.y,i[5]=xr.y,i[9]=Vt.y,i[2]=Vn.z,i[6]=xr.z,i[10]=Vt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,s=this.elements,r=n[0],a=n[4],o=n[8],l=n[12],c=n[1],h=n[5],u=n[9],d=n[13],m=n[2],_=n[6],x=n[10],f=n[14],p=n[3],A=n[7],M=n[11],b=n[15],R=i[0],E=i[4],P=i[8],N=i[12],T=i[1],S=i[5],C=i[9],k=i[13],X=i[2],G=i[6],K=i[10],H=i[14],O=i[3],Y=i[7],te=i[11],ie=i[15];return s[0]=r*R+a*T+o*X+l*O,s[4]=r*E+a*S+o*G+l*Y,s[8]=r*P+a*C+o*K+l*te,s[12]=r*N+a*k+o*H+l*ie,s[1]=c*R+h*T+u*X+d*O,s[5]=c*E+h*S+u*G+d*Y,s[9]=c*P+h*C+u*K+d*te,s[13]=c*N+h*k+u*H+d*ie,s[2]=m*R+_*T+x*X+f*O,s[6]=m*E+_*S+x*G+f*Y,s[10]=m*P+_*C+x*K+f*te,s[14]=m*N+_*k+x*H+f*ie,s[3]=p*R+A*T+M*X+b*O,s[7]=p*E+A*S+M*G+b*Y,s[11]=p*P+A*C+M*K+b*te,s[15]=p*N+A*k+M*H+b*ie,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],i=e[8],s=e[12],r=e[1],a=e[5],o=e[9],l=e[13],c=e[2],h=e[6],u=e[10],d=e[14],m=e[3],_=e[7],x=e[11],f=e[15],p=o*d-l*u,A=a*d-l*h,M=a*u-o*h,b=r*d-l*c,R=r*u-o*c,E=r*h-a*c;return t*(_*p-x*A+f*M)-n*(m*p-x*b+f*R)+i*(m*A-_*b+f*E)-s*(m*M-_*R+x*E)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let i=this.elements;if(e.isVector3)i[12]=e.x,i[13]=e.y,i[14]=e.z;else i[12]=e,i[13]=t,i[14]=n;return this}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],r=e[4],a=e[5],o=e[6],l=e[7],c=e[8],h=e[9],u=e[10],d=e[11],m=e[12],_=e[13],x=e[14],f=e[15],p=h*x*l-_*u*l+_*o*d-a*x*d-h*o*f+a*u*f,A=m*u*l-c*x*l-m*o*d+r*x*d+c*o*f-r*u*f,M=c*_*l-m*h*l+m*a*d-r*_*d-c*a*f+r*h*f,b=m*h*o-c*_*o-m*a*u+r*_*u+c*a*x-r*h*x,R=t*p+n*A+i*M+s*b;if(R===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let E=1/R;return e[0]=p*E,e[1]=(_*u*s-h*x*s-_*i*d+n*x*d+h*i*f-n*u*f)*E,e[2]=(a*x*s-_*o*s+_*i*l-n*x*l-a*i*f+n*o*f)*E,e[3]=(h*o*s-a*u*s-h*i*l+n*u*l+a*i*d-n*o*d)*E,e[4]=A*E,e[5]=(c*x*s-m*u*s+m*i*d-t*x*d-c*i*f+t*u*f)*E,e[6]=(m*o*s-r*x*s-m*i*l+t*x*l+r*i*f-t*o*f)*E,e[7]=(r*u*s-c*o*s+c*i*l-t*u*l-r*i*d+t*o*d)*E,e[8]=M*E,e[9]=(m*h*s-c*_*s-m*n*d+t*_*d+c*n*f-t*h*f)*E,e[10]=(r*_*s-m*a*s+m*n*l-t*_*l-r*n*f+t*a*f)*E,e[11]=(c*a*s-r*h*s-c*n*l+t*h*l+r*n*d-t*a*d)*E,e[12]=b*E,e[13]=(c*_*i-m*h*i+m*n*u-t*_*u-c*n*x+t*h*x)*E,e[14]=(m*a*i-r*_*i-m*n*o+t*_*o+r*n*x-t*a*x)*E,e[15]=(r*h*i-c*a*i+c*n*o-t*h*o-r*n*u+t*a*u)*E,this}scale(e){let t=this.elements,{x:n,y:i,z:s}=e;return t[0]*=n,t[4]*=i,t[8]*=s,t[1]*=n,t[5]*=i,t[9]*=s,t[2]*=n,t[6]*=i,t[10]*=s,t[3]*=n,t[7]*=i,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){if(e.isVector3)this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1);else this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1);return this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),i=Math.sin(t),s=1-n,{x:r,y:a,z:o}=e,l=s*r,c=s*a;return this.set(l*r+n,l*a-i*o,l*o+i*a,0,l*a+i*o,c*a+n,c*o-i*r,0,l*o-i*a,c*o+i*r,s*o*o+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,s,r){return this.set(1,n,s,0,e,1,r,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){let i=this.elements,{_x:s,_y:r,_z:a,_w:o}=t,l=s+s,c=r+r,h=a+a,u=s*l,d=s*c,m=s*h,_=r*c,x=r*h,f=a*h,p=o*l,A=o*c,M=o*h,{x:b,y:R,z:E}=n;return i[0]=(1-(_+f))*b,i[1]=(d+M)*b,i[2]=(m-A)*b,i[3]=0,i[4]=(d-M)*R,i[5]=(1-(u+f))*R,i[6]=(x+p)*R,i[7]=0,i[8]=(m+A)*E,i[9]=(x-p)*E,i[10]=(1-(u+_))*E,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){let i=this.elements;if(e.x=i[12],e.y=i[13],e.z=i[14],this.determinant()===0)return n.set(1,1,1),t.identity(),this;let s=Pi.set(i[0],i[1],i[2]).length(),r=Pi.set(i[4],i[5],i[6]).length(),a=Pi.set(i[8],i[9],i[10]).length();if(this.determinant()<0)s=-s;sn.copy(this);let l=1/s,c=1/r,h=1/a;return sn.elements[0]*=l,sn.elements[1]*=l,sn.elements[2]*=l,sn.elements[4]*=c,sn.elements[5]*=c,sn.elements[6]*=c,sn.elements[8]*=h,sn.elements[9]*=h,sn.elements[10]*=h,t.setFromRotationMatrix(sn),n.x=s,n.y=r,n.z=a,this}makePerspective(e,t,n,i,s,r,a=2000,o=!1){let l=this.elements,c=2*s/(t-e),h=2*s/(n-i),u=(t+e)/(t-e),d=(n+i)/(n-i),m,_;if(o)m=s/(r-s),_=r*s/(r-s);else if(a===2000)m=-(r+s)/(r-s),_=-2*r*s/(r-s);else if(a===2001)m=-r/(r-s),_=-r*s/(r-s);else throw Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=m,l[14]=_,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,i,s,r,a=2000,o=!1){let l=this.elements,c=2/(t-e),h=2/(n-i),u=-(t+e)/(t-e),d=-(n+i)/(n-i),m,_;if(o)m=1/(r-s),_=r/(r-s);else if(a===2000)m=-2/(r-s),_=-(r+s)/(r-s);else if(a===2001)m=-1/(r-s),_=-s/(r-s);else throw Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=0,l[12]=u,l[1]=0,l[5]=h,l[9]=0,l[13]=d,l[2]=0,l[6]=0,l[10]=m,l[14]=_,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}var Pi=new L,sn=new Fe,zd=new L(0,0,0),kd=new L(1,1,1),Vn=new L,xr=new L,Vt=new L,dc=new Fe,fc=new dn;class $t{constructor(e=0,t=0,n=0,i=$t.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let i=e.elements,s=i[0],r=i[4],a=i[8],o=i[1],l=i[5],c=i[9],h=i[2],u=i[6],d=i[10];switch(t){case"XYZ":if(this._y=Math.asin(We(a,-1,1)),Math.abs(a)<0.9999999)this._x=Math.atan2(-c,d),this._z=Math.atan2(-r,s);else this._x=Math.atan2(u,l),this._z=0;break;case"YXZ":if(this._x=Math.asin(-We(c,-1,1)),Math.abs(c)<0.9999999)this._y=Math.atan2(a,d),this._z=Math.atan2(o,l);else this._y=Math.atan2(-h,s),this._z=0;break;case"ZXY":if(this._x=Math.asin(We(u,-1,1)),Math.abs(u)<0.9999999)this._y=Math.atan2(-h,d),this._z=Math.atan2(-r,l);else this._y=0,this._z=Math.atan2(o,s);break;case"ZYX":if(this._y=Math.asin(-We(h,-1,1)),Math.abs(h)<0.9999999)this._x=Math.atan2(u,d),this._z=Math.atan2(o,s);else this._x=0,this._z=Math.atan2(-r,l);break;case"YZX":if(this._z=Math.asin(We(o,-1,1)),Math.abs(o)<0.9999999)this._x=Math.atan2(-c,l),this._y=Math.atan2(-h,s);else this._x=0,this._y=Math.atan2(a,d);break;case"XZY":if(this._z=Math.asin(-We(r,-1,1)),Math.abs(r)<0.9999999)this._x=Math.atan2(u,l),this._y=Math.atan2(a,s);else this._x=Math.atan2(-c,d),this._y=0;break;default:be("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}if(this._order=t,n===!0)this._onChangeCallback();return this}setFromQuaternion(e,t,n){return dc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(dc,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return fc.setFromEuler(this),this.setFromQuaternion(fc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){if(this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0)this._order=e[3];return this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}$t.DEFAULT_ORDER="XYZ";class oa{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}var Gd=0,pc=new L,Li=new dn,Tn=new Fe,vr=new L,ys=new L,Hd=new L,Vd=new dn,mc=new L(1,0,0),gc=new L(0,1,0),_c=new L(0,0,1),xc={type:"added"},Wd={type:"removed"},Ni={type:"childadded",child:null},qa={type:"childremoved",child:null};class Qe extends Jn{constructor(){super();this.isObject3D=!0,Object.defineProperty(this,"id",{value:Gd++}),this.uuid=on(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Qe.DEFAULT_UP.clone();let e=new L,t=new $t,n=new dn,i=new L(1,1,1);function s(){n.setFromEuler(t,!1)}function r(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(r),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Fe},normalMatrix:{value:new Oe}}),this.matrix=new Fe,this.matrixWorld=new Fe,this.matrixAutoUpdate=Qe.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Qe.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new oa,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){if(this.matrixAutoUpdate)this.updateMatrix();this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Li.setFromAxisAngle(e,t),this.quaternion.multiply(Li),this}rotateOnWorldAxis(e,t){return Li.setFromAxisAngle(e,t),this.quaternion.premultiply(Li),this}rotateX(e){return this.rotateOnAxis(mc,e)}rotateY(e){return this.rotateOnAxis(gc,e)}rotateZ(e){return this.rotateOnAxis(_c,e)}translateOnAxis(e,t){return pc.copy(e).applyQuaternion(this.quaternion),this.position.add(pc.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(mc,e)}translateY(e){return this.translateOnAxis(gc,e)}translateZ(e){return this.translateOnAxis(_c,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Tn.copy(this.matrixWorld).invert())}lookAt(e,t,n){if(e.isVector3)vr.copy(e);else vr.set(e,t,n);let i=this.parent;if(this.updateWorldMatrix(!0,!1),ys.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight)Tn.lookAt(ys,vr,this.up);else Tn.lookAt(vr,ys,this.up);if(this.quaternion.setFromRotationMatrix(Tn),i)Tn.extractRotation(i.matrixWorld),Li.setFromRotationMatrix(Tn),this.quaternion.premultiply(Li.invert())}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}if(e===this)return Re("Object3D.add: object can't be added as a child of itself.",e),this;if(e&&e.isObject3D)e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(xc),Ni.child=e,this.dispatchEvent(Ni),Ni.child=null;else Re("Object3D.add: object not an instance of THREE.Object3D.",e);return this}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);if(t!==-1)e.parent=null,this.children.splice(t,1),e.dispatchEvent(Wd),qa.child=e,this.dispatchEvent(qa),qa.child=null;return this}removeFromParent(){let e=this.parent;if(e!==null)e.remove(this);return this}clear(){return this.remove(...this.children)}attach(e){if(this.updateWorldMatrix(!0,!1),Tn.copy(this.matrixWorld).invert(),e.parent!==null)e.parent.updateWorldMatrix(!0,!1),Tn.multiply(e.parent.matrixWorld);return e.applyMatrix4(Tn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(xc),Ni.child=e,this.dispatchEvent(Ni),Ni.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}return}getObjectsByProperty(e,t,n=[]){if(this[e]===t)n.push(this);let i=this.children;for(let s=0,r=i.length;s<r;s++)i[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ys,e,Hd),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ys,Vd,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;if(t!==null)e(t),t.traverseAncestors(e)}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldNeedsUpdate||e){if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);this.matrixWorldNeedsUpdate=!1,e=!0}let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null)n.updateWorldMatrix(!0,!1);if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);if(t===!0){let i=this.children;for(let s=0,r=i.length;s<r;s++)i[s].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e==="string",n={};if(t)e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"};let i={};if(i.uuid=this.uuid,i.type=this.type,this.name!=="")i.name=this.name;if(this.castShadow===!0)i.castShadow=!0;if(this.receiveShadow===!0)i.receiveShadow=!0;if(this.visible===!1)i.visible=!1;if(this.frustumCulled===!1)i.frustumCulled=!1;if(this.renderOrder!==0)i.renderOrder=this.renderOrder;if(Object.keys(this.userData).length>0)i.userData=this.userData;if(i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1)i.matrixAutoUpdate=!1;if(this.isInstancedMesh){if(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null)i.instanceColor=this.instanceColor.toJSON()}if(this.isBatchedMesh){if(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map((a)=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map((a)=>({...a})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(e),i.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null)i.colorsTexture=this._colorsTexture.toJSON(e);if(this.boundingSphere!==null)i.boundingSphere=this.boundingSphere.toJSON();if(this.boundingBox!==null)i.boundingBox=this.boundingBox.toJSON()}function s(a,o){if(a[o.uuid]===void 0)a[o.uuid]=o.toJSON(e);return o.uuid}if(this.isScene){if(this.background){if(this.background.isColor)i.background=this.background.toJSON();else if(this.background.isTexture)i.background=this.background.toJSON(e).uuid}if(this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0)i.environment=this.environment.toJSON(e).uuid}else if(this.isMesh||this.isLine||this.isPoints){i.geometry=s(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let o=a.shapes;if(Array.isArray(o))for(let l=0,c=o.length;l<c;l++){let h=o[l];s(e.shapes,h)}else s(e.shapes,o)}}if(this.isSkinnedMesh){if(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0)s(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid}if(this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let o=0,l=this.material.length;o<l;o++)a.push(s(e.materials,this.material[o]));i.material=a}else i.material=s(e.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){let o=this.animations[a];i.animations.push(s(e.animations,o))}}if(t){let a=r(e.geometries),o=r(e.materials),l=r(e.textures),c=r(e.images),h=r(e.shapes),u=r(e.skeletons),d=r(e.animations),m=r(e.nodes);if(a.length>0)n.geometries=a;if(o.length>0)n.materials=o;if(l.length>0)n.textures=l;if(c.length>0)n.images=c;if(h.length>0)n.shapes=h;if(u.length>0)n.skeletons=u;if(d.length>0)n.animations=d;if(m.length>0)n.nodes=m}return n.object=i,n;function r(a){let o=[];for(let l in a){let c=a[l];delete c.metadata,o.push(c)}return o}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let i=e.children[n];this.add(i.clone())}return this}}Qe.DEFAULT_UP=new L(0,1,0);Qe.DEFAULT_MATRIX_AUTO_UPDATE=!0;Qe.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var rn=new L,An=new L,Ya=new L,En=new L,Di=new L,Ui=new L,vc=new L,Za=new L,Ja=new L,Ka=new L,$a=new ct,ja=new ct,Qa=new ct;class Xt{constructor(e=new L,t=new L,n=new L){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),rn.subVectors(e,t),i.cross(rn);let s=i.lengthSq();if(s>0)return i.multiplyScalar(1/Math.sqrt(s));return i.set(0,0,0)}static getBarycoord(e,t,n,i,s){rn.subVectors(i,t),An.subVectors(n,t),Ya.subVectors(e,t);let r=rn.dot(rn),a=rn.dot(An),o=rn.dot(Ya),l=An.dot(An),c=An.dot(Ya),h=r*l-a*a;if(h===0)return s.set(0,0,0),null;let u=1/h,d=(l*o-a*c)*u,m=(r*c-a*o)*u;return s.set(1-d-m,m,d)}static containsPoint(e,t,n,i){if(this.getBarycoord(e,t,n,i,En)===null)return!1;return En.x>=0&&En.y>=0&&En.x+En.y<=1}static getInterpolation(e,t,n,i,s,r,a,o){if(this.getBarycoord(e,t,n,i,En)===null){if(o.x=0,o.y=0,"z"in o)o.z=0;if("w"in o)o.w=0;return null}return o.setScalar(0),o.addScaledVector(s,En.x),o.addScaledVector(r,En.y),o.addScaledVector(a,En.z),o}static getInterpolatedAttribute(e,t,n,i,s,r){return $a.setScalar(0),ja.setScalar(0),Qa.setScalar(0),$a.fromBufferAttribute(e,t),ja.fromBufferAttribute(e,n),Qa.fromBufferAttribute(e,i),r.setScalar(0),r.addScaledVector($a,s.x),r.addScaledVector(ja,s.y),r.addScaledVector(Qa,s.z),r}static isFrontFacing(e,t,n,i){return rn.subVectors(n,t),An.subVectors(e,t),rn.cross(An).dot(i)<0?!0:!1}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return rn.subVectors(this.c,this.b),An.subVectors(this.a,this.b),rn.cross(An).length()*0.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(0.3333333333333333)}getNormal(e){return Xt.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Xt.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,s){return Xt.getInterpolation(e,this.a,this.b,this.c,t,n,i,s)}containsPoint(e){return Xt.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Xt.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,i=this.b,s=this.c,r,a;Di.subVectors(i,n),Ui.subVectors(s,n),Za.subVectors(e,n);let o=Di.dot(Za),l=Ui.dot(Za);if(o<=0&&l<=0)return t.copy(n);Ja.subVectors(e,i);let c=Di.dot(Ja),h=Ui.dot(Ja);if(c>=0&&h<=c)return t.copy(i);let u=o*h-c*l;if(u<=0&&o>=0&&c<=0)return r=o/(o-c),t.copy(n).addScaledVector(Di,r);Ka.subVectors(e,s);let d=Di.dot(Ka),m=Ui.dot(Ka);if(m>=0&&d<=m)return t.copy(s);let _=d*l-o*m;if(_<=0&&l>=0&&m<=0)return a=l/(l-m),t.copy(n).addScaledVector(Ui,a);let x=c*m-d*h;if(x<=0&&h-c>=0&&d-m>=0)return vc.subVectors(s,i),a=(h-c)/(h-c+(d-m)),t.copy(i).addScaledVector(vc,a);let f=1/(x+_+u);return r=_*f,a=u*f,t.copy(n).addScaledVector(Di,r).addScaledVector(Ui,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}var Dh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Wn={h:0,s:0,l:0},yr={h:0,s:0,l:0};function eo(e,t,n){if(n<0)n+=1;if(n>1)n-=1;if(n<0.16666666666666666)return e+(t-e)*6*n;if(n<0.5)return t;if(n<0.6666666666666666)return e+(t-e)*6*(0.6666666666666666-n);return e}class pe{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let i=e;if(i&&i.isColor)this.copy(i);else if(typeof i==="number")this.setHex(i);else if(typeof i==="string")this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t="srgb"){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ge.colorSpaceToWorking(this,t),this}setRGB(e,t,n,i=Ge.workingColorSpace){return this.r=e,this.g=t,this.b=n,Ge.colorSpaceToWorking(this,i),this}setHSL(e,t,n,i=Ge.workingColorSpace){if(e=rl(e,1),t=We(t,0,1),n=We(n,0,1),t===0)this.r=this.g=this.b=n;else{let s=n<=0.5?n*(1+t):n+t-n*t,r=2*n-s;this.r=eo(r,s,e+0.3333333333333333),this.g=eo(r,s,e),this.b=eo(r,s,e-0.3333333333333333)}return Ge.colorSpaceToWorking(this,i),this}setStyle(e,t="srgb"){function n(s){if(s===void 0)return;if(parseFloat(s)<1)be("Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,r=i[1],a=i[2];switch(r){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:be("Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=i[1],r=s.length;if(r===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);else if(r===6)return this.setHex(parseInt(s,16),t);else be("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t="srgb"){let n=Dh[e.toLowerCase()];if(n!==void 0)this.setHex(n,t);else be("Color: Unknown color "+e);return this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Rn(e.r),this.g=Rn(e.g),this.b=Rn(e.b),this}copyLinearToSRGB(e){return this.r=Xi(e.r),this.g=Xi(e.g),this.b=Xi(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e="srgb"){return Ge.workingToColorSpace(It.copy(this),e),Math.round(We(It.r*255,0,255))*65536+Math.round(We(It.g*255,0,255))*256+Math.round(We(It.b*255,0,255))}getHexString(e="srgb"){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ge.workingColorSpace){Ge.workingToColorSpace(It.copy(this),t);let{r:n,g:i,b:s}=It,r=Math.max(n,i,s),a=Math.min(n,i,s),o,l,c=(a+r)/2;if(a===r)o=0,l=0;else{let h=r-a;switch(l=c<=0.5?h/(r+a):h/(2-r-a),r){case n:o=(i-s)/h+(i<s?6:0);break;case i:o=(s-n)/h+2;break;case s:o=(n-i)/h+4;break}o/=6}return e.h=o,e.s=l,e.l=c,e}getRGB(e,t=Ge.workingColorSpace){return Ge.workingToColorSpace(It.copy(this),t),e.r=It.r,e.g=It.g,e.b=It.b,e}getStyle(e="srgb"){Ge.workingToColorSpace(It.copy(this),e);let{r:t,g:n,b:i}=It;if(e!=="srgb")return`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`;return`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(Wn),this.setHSL(Wn.h+e,Wn.s+t,Wn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Wn),e.getHSL(yr);let n=Rs(Wn.h,yr.h,t),i=Rs(Wn.s,yr.s,t),s=Rs(Wn.l,yr.l,t);return this.setHSL(n,i,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,i=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*i,this.g=s[1]*t+s[4]*n+s[7]*i,this.b=s[2]*t+s[5]*n+s[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}var It=new pe;pe.NAMES=Dh;var Xd=0;class Ot extends Jn{constructor(){super();this.isMaterial=!0,Object.defineProperty(this,"id",{value:Xd++}),this.uuid=on(),this.name="",this.type="Material",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new pe(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=7680,this.stencilZFail=7680,this.stencilZPass=7680,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){if(this._alphaTest>0!==e>0)this.version++;this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e===void 0)return;for(let t in e){let n=e[t];if(n===void 0){be(`Material: parameter '${t}' has value of undefined.`);continue}let i=this[t];if(i===void 0){be(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}if(i&&i.isColor)i.set(n);else if(i&&i.isVector3&&(n&&n.isVector3))i.copy(n);else this[t]=n}}toJSON(e){let t=e===void 0||typeof e==="string";if(t)e={textures:{},images:{}};let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};if(n.uuid=this.uuid,n.type=this.type,this.name!=="")n.name=this.name;if(this.color&&this.color.isColor)n.color=this.color.getHex();if(this.roughness!==void 0)n.roughness=this.roughness;if(this.metalness!==void 0)n.metalness=this.metalness;if(this.sheen!==void 0)n.sheen=this.sheen;if(this.sheenColor&&this.sheenColor.isColor)n.sheenColor=this.sheenColor.getHex();if(this.sheenRoughness!==void 0)n.sheenRoughness=this.sheenRoughness;if(this.emissive&&this.emissive.isColor)n.emissive=this.emissive.getHex();if(this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1)n.emissiveIntensity=this.emissiveIntensity;if(this.specular&&this.specular.isColor)n.specular=this.specular.getHex();if(this.specularIntensity!==void 0)n.specularIntensity=this.specularIntensity;if(this.specularColor&&this.specularColor.isColor)n.specularColor=this.specularColor.getHex();if(this.shininess!==void 0)n.shininess=this.shininess;if(this.clearcoat!==void 0)n.clearcoat=this.clearcoat;if(this.clearcoatRoughness!==void 0)n.clearcoatRoughness=this.clearcoatRoughness;if(this.clearcoatMap&&this.clearcoatMap.isTexture)n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid;if(this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture)n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid;if(this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture)n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray();if(this.sheenColorMap&&this.sheenColorMap.isTexture)n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid;if(this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture)n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid;if(this.dispersion!==void 0)n.dispersion=this.dispersion;if(this.iridescence!==void 0)n.iridescence=this.iridescence;if(this.iridescenceIOR!==void 0)n.iridescenceIOR=this.iridescenceIOR;if(this.iridescenceThicknessRange!==void 0)n.iridescenceThicknessRange=this.iridescenceThicknessRange;if(this.iridescenceMap&&this.iridescenceMap.isTexture)n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid;if(this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture)n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid;if(this.anisotropy!==void 0)n.anisotropy=this.anisotropy;if(this.anisotropyRotation!==void 0)n.anisotropyRotation=this.anisotropyRotation;if(this.anisotropyMap&&this.anisotropyMap.isTexture)n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid;if(this.map&&this.map.isTexture)n.map=this.map.toJSON(e).uuid;if(this.matcap&&this.matcap.isTexture)n.matcap=this.matcap.toJSON(e).uuid;if(this.alphaMap&&this.alphaMap.isTexture)n.alphaMap=this.alphaMap.toJSON(e).uuid;if(this.lightMap&&this.lightMap.isTexture)n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity;if(this.aoMap&&this.aoMap.isTexture)n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity;if(this.bumpMap&&this.bumpMap.isTexture)n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale;if(this.normalMap&&this.normalMap.isTexture)n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray();if(this.displacementMap&&this.displacementMap.isTexture)n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias;if(this.roughnessMap&&this.roughnessMap.isTexture)n.roughnessMap=this.roughnessMap.toJSON(e).uuid;if(this.metalnessMap&&this.metalnessMap.isTexture)n.metalnessMap=this.metalnessMap.toJSON(e).uuid;if(this.emissiveMap&&this.emissiveMap.isTexture)n.emissiveMap=this.emissiveMap.toJSON(e).uuid;if(this.specularMap&&this.specularMap.isTexture)n.specularMap=this.specularMap.toJSON(e).uuid;if(this.specularIntensityMap&&this.specularIntensityMap.isTexture)n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid;if(this.specularColorMap&&this.specularColorMap.isTexture)n.specularColorMap=this.specularColorMap.toJSON(e).uuid;if(this.envMap&&this.envMap.isTexture){if(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0)n.combine=this.combine}if(this.envMapRotation!==void 0)n.envMapRotation=this.envMapRotation.toArray();if(this.envMapIntensity!==void 0)n.envMapIntensity=this.envMapIntensity;if(this.reflectivity!==void 0)n.reflectivity=this.reflectivity;if(this.refractionRatio!==void 0)n.refractionRatio=this.refractionRatio;if(this.gradientMap&&this.gradientMap.isTexture)n.gradientMap=this.gradientMap.toJSON(e).uuid;if(this.transmission!==void 0)n.transmission=this.transmission;if(this.transmissionMap&&this.transmissionMap.isTexture)n.transmissionMap=this.transmissionMap.toJSON(e).uuid;if(this.thickness!==void 0)n.thickness=this.thickness;if(this.thicknessMap&&this.thicknessMap.isTexture)n.thicknessMap=this.thicknessMap.toJSON(e).uuid;if(this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0)n.attenuationDistance=this.attenuationDistance;if(this.attenuationColor!==void 0)n.attenuationColor=this.attenuationColor.getHex();if(this.size!==void 0)n.size=this.size;if(this.shadowSide!==null)n.shadowSide=this.shadowSide;if(this.sizeAttenuation!==void 0)n.sizeAttenuation=this.sizeAttenuation;if(this.blending!==1)n.blending=this.blending;if(this.side!==0)n.side=this.side;if(this.vertexColors===!0)n.vertexColors=!0;if(this.opacity<1)n.opacity=this.opacity;if(this.transparent===!0)n.transparent=!0;if(this.blendSrc!==204)n.blendSrc=this.blendSrc;if(this.blendDst!==205)n.blendDst=this.blendDst;if(this.blendEquation!==100)n.blendEquation=this.blendEquation;if(this.blendSrcAlpha!==null)n.blendSrcAlpha=this.blendSrcAlpha;if(this.blendDstAlpha!==null)n.blendDstAlpha=this.blendDstAlpha;if(this.blendEquationAlpha!==null)n.blendEquationAlpha=this.blendEquationAlpha;if(this.blendColor&&this.blendColor.isColor)n.blendColor=this.blendColor.getHex();if(this.blendAlpha!==0)n.blendAlpha=this.blendAlpha;if(this.depthFunc!==3)n.depthFunc=this.depthFunc;if(this.depthTest===!1)n.depthTest=this.depthTest;if(this.depthWrite===!1)n.depthWrite=this.depthWrite;if(this.colorWrite===!1)n.colorWrite=this.colorWrite;if(this.stencilWriteMask!==255)n.stencilWriteMask=this.stencilWriteMask;if(this.stencilFunc!==519)n.stencilFunc=this.stencilFunc;if(this.stencilRef!==0)n.stencilRef=this.stencilRef;if(this.stencilFuncMask!==255)n.stencilFuncMask=this.stencilFuncMask;if(this.stencilFail!==7680)n.stencilFail=this.stencilFail;if(this.stencilZFail!==7680)n.stencilZFail=this.stencilZFail;if(this.stencilZPass!==7680)n.stencilZPass=this.stencilZPass;if(this.stencilWrite===!0)n.stencilWrite=this.stencilWrite;if(this.rotation!==void 0&&this.rotation!==0)n.rotation=this.rotation;if(this.polygonOffset===!0)n.polygonOffset=!0;if(this.polygonOffsetFactor!==0)n.polygonOffsetFactor=this.polygonOffsetFactor;if(this.polygonOffsetUnits!==0)n.polygonOffsetUnits=this.polygonOffsetUnits;if(this.linewidth!==void 0&&this.linewidth!==1)n.linewidth=this.linewidth;if(this.dashSize!==void 0)n.dashSize=this.dashSize;if(this.gapSize!==void 0)n.gapSize=this.gapSize;if(this.scale!==void 0)n.scale=this.scale;if(this.dithering===!0)n.dithering=!0;if(this.alphaTest>0)n.alphaTest=this.alphaTest;if(this.alphaHash===!0)n.alphaHash=!0;if(this.alphaToCoverage===!0)n.alphaToCoverage=!0;if(this.premultipliedAlpha===!0)n.premultipliedAlpha=!0;if(this.forceSinglePass===!0)n.forceSinglePass=!0;if(this.allowOverride===!1)n.allowOverride=!1;if(this.wireframe===!0)n.wireframe=!0;if(this.wireframeLinewidth>1)n.wireframeLinewidth=this.wireframeLinewidth;if(this.wireframeLinecap!=="round")n.wireframeLinecap=this.wireframeLinecap;if(this.wireframeLinejoin!=="round")n.wireframeLinejoin=this.wireframeLinejoin;if(this.flatShading===!0)n.flatShading=!0;if(this.visible===!1)n.visible=!1;if(this.toneMapped===!1)n.toneMapped=!1;if(this.fog===!1)n.fog=!1;if(Object.keys(this.userData).length>0)n.userData=this.userData;function i(s){let r=[];for(let a in s){let o=s[a];delete o.metadata,r.push(o)}return r}if(t){let s=i(e.textures),r=i(e.images);if(s.length>0)n.textures=s;if(r.length>0)n.images=r}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let i=t.length;n=Array(i);for(let s=0;s!==i;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){if(e===!0)this.version++}}class kt extends Ot{constructor(e){super();this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new pe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new $t,this.combine=0,this.reflectivity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}var _t=new L,Mr=new Me,qd=0;class Mt{constructor(e,t,n=!1){if(Array.isArray(e))throw TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:qd++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=35044,this.updateRanges=[],this.gpuType=1015,this.version=0}onUploadCallback(){}set needsUpdate(e){if(e===!0)this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,s=this.itemSize;i<s;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Mr.fromBufferAttribute(this,t),Mr.applyMatrix3(e),this.setXY(t,Mr.x,Mr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)_t.fromBufferAttribute(this,t),_t.applyMatrix3(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)_t.fromBufferAttribute(this,t),_t.applyMatrix4(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)_t.fromBufferAttribute(this,t),_t.applyNormalMatrix(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)_t.fromBufferAttribute(this,t),_t.transformDirection(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];if(this.normalized)n=an(n,this.array);return n}setComponent(e,t,n){if(this.normalized)n=je(n,this.array);return this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];if(this.normalized)t=an(t,this.array);return t}setX(e,t){if(this.normalized)t=je(t,this.array);return this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];if(this.normalized)t=an(t,this.array);return t}setY(e,t){if(this.normalized)t=je(t,this.array);return this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];if(this.normalized)t=an(t,this.array);return t}setZ(e,t){if(this.normalized)t=je(t,this.array);return this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];if(this.normalized)t=an(t,this.array);return t}setW(e,t){if(this.normalized)t=je(t,this.array);return this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){if(e*=this.itemSize,this.normalized)t=je(t,this.array),n=je(n,this.array);return this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){if(e*=this.itemSize,this.normalized)t=je(t,this.array),n=je(n,this.array),i=je(i,this.array);return this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,s){if(e*=this.itemSize,this.normalized)t=je(t,this.array),n=je(n,this.array),i=je(i,this.array),s=je(s,this.array);return this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};if(this.name!=="")e.name=this.name;if(this.usage!==35044)e.usage=this.usage;return e}}class la extends Mt{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class ca extends Mt{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class xt extends Mt{constructor(e,t,n){super(new Float32Array(e),t,n)}}var Yd=0,Kt=new Fe,to=new Qe,Fi=new L,Wt=new Qt,Ms=new Qt,At=new L;class St extends Jn{constructor(){super();this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Yd++}),this.uuid=on(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){if(Array.isArray(e))this.index=new((sl(e))?ca:la)(e,1);else this.index=e;return this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;if(t!==void 0)t.applyMatrix4(e),t.needsUpdate=!0;let n=this.attributes.normal;if(n!==void 0){let s=new Oe().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}let i=this.attributes.tangent;if(i!==void 0)i.transformDirection(e),i.needsUpdate=!0;if(this.boundingBox!==null)this.computeBoundingBox();if(this.boundingSphere!==null)this.computeBoundingSphere();return this}applyQuaternion(e){return Kt.makeRotationFromQuaternion(e),this.applyMatrix4(Kt),this}rotateX(e){return Kt.makeRotationX(e),this.applyMatrix4(Kt),this}rotateY(e){return Kt.makeRotationY(e),this.applyMatrix4(Kt),this}rotateZ(e){return Kt.makeRotationZ(e),this.applyMatrix4(Kt),this}translate(e,t,n){return Kt.makeTranslation(e,t,n),this.applyMatrix4(Kt),this}scale(e,t,n){return Kt.makeScale(e,t,n),this.applyMatrix4(Kt),this}lookAt(e){return to.lookAt(e),to.updateMatrix(),this.applyMatrix4(to.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Fi).negate(),this.translate(Fi.x,Fi.y,Fi.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let i=0,s=e.length;i<s;i++){let r=e[i];n.push(r.x,r.y,r.z||0)}this.setAttribute("position",new xt(n,3))}else{let n=Math.min(e.length,t.count);for(let i=0;i<n;i++){let s=e[i];t.setXYZ(i,s.x,s.y,s.z||0)}if(e.length>t.count)be("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.");t.needsUpdate=!0}return this}computeBoundingBox(){if(this.boundingBox===null)this.boundingBox=new Qt;let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Re("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new L(-1/0,-1/0,-1/0),new L(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){let s=t[n];if(Wt.setFromBufferAttribute(s),this.morphTargetsRelative)At.addVectors(this.boundingBox.min,Wt.min),this.boundingBox.expandByPoint(At),At.addVectors(this.boundingBox.max,Wt.max),this.boundingBox.expandByPoint(At);else this.boundingBox.expandByPoint(Wt.min),this.boundingBox.expandByPoint(Wt.max)}}else this.boundingBox.makeEmpty();if(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))Re('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){if(this.boundingSphere===null)this.boundingSphere=new qt;let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Re("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new L,1/0);return}if(e){let n=this.boundingSphere.center;if(Wt.setFromBufferAttribute(e),t)for(let s=0,r=t.length;s<r;s++){let a=t[s];if(Ms.setFromBufferAttribute(a),this.morphTargetsRelative)At.addVectors(Wt.min,Ms.min),Wt.expandByPoint(At),At.addVectors(Wt.max,Ms.max),Wt.expandByPoint(At);else Wt.expandByPoint(Ms.min),Wt.expandByPoint(Ms.max)}Wt.getCenter(n);let i=0;for(let s=0,r=e.count;s<r;s++)At.fromBufferAttribute(e,s),i=Math.max(i,n.distanceToSquared(At));if(t)for(let s=0,r=t.length;s<r;s++){let a=t[s],o=this.morphTargetsRelative;for(let l=0,c=a.count;l<c;l++){if(At.fromBufferAttribute(a,l),o)Fi.fromBufferAttribute(e,l),At.add(Fi);i=Math.max(i,n.distanceToSquared(At))}}if(this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius))Re('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Re("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let{position:n,normal:i,uv:s}=t;if(this.hasAttribute("tangent")===!1)this.setAttribute("tangent",new Mt(new Float32Array(4*n.count),4));let r=this.getAttribute("tangent"),a=[],o=[];for(let P=0;P<n.count;P++)a[P]=new L,o[P]=new L;let l=new L,c=new L,h=new L,u=new Me,d=new Me,m=new Me,_=new L,x=new L;function f(P,N,T){l.fromBufferAttribute(n,P),c.fromBufferAttribute(n,N),h.fromBufferAttribute(n,T),u.fromBufferAttribute(s,P),d.fromBufferAttribute(s,N),m.fromBufferAttribute(s,T),c.sub(l),h.sub(l),d.sub(u),m.sub(u);let S=1/(d.x*m.y-m.x*d.y);if(!isFinite(S))return;_.copy(c).multiplyScalar(m.y).addScaledVector(h,-d.y).multiplyScalar(S),x.copy(h).multiplyScalar(d.x).addScaledVector(c,-m.x).multiplyScalar(S),a[P].add(_),a[N].add(_),a[T].add(_),o[P].add(x),o[N].add(x),o[T].add(x)}let p=this.groups;if(p.length===0)p=[{start:0,count:e.count}];for(let P=0,N=p.length;P<N;++P){let T=p[P],{start:S,count:C}=T;for(let k=S,X=S+C;k<X;k+=3)f(e.getX(k+0),e.getX(k+1),e.getX(k+2))}let A=new L,M=new L,b=new L,R=new L;function E(P){b.fromBufferAttribute(i,P),R.copy(b);let N=a[P];A.copy(N),A.sub(b.multiplyScalar(b.dot(N))).normalize(),M.crossVectors(R,N);let S=M.dot(o[P])<0?-1:1;r.setXYZW(P,A.x,A.y,A.z,S)}for(let P=0,N=p.length;P<N;++P){let T=p[P],{start:S,count:C}=T;for(let k=S,X=S+C;k<X;k+=3)E(e.getX(k+0)),E(e.getX(k+1)),E(e.getX(k+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Mt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let u=0,d=n.count;u<d;u++)n.setXYZ(u,0,0,0);let i=new L,s=new L,r=new L,a=new L,o=new L,l=new L,c=new L,h=new L;if(e)for(let u=0,d=e.count;u<d;u+=3){let m=e.getX(u+0),_=e.getX(u+1),x=e.getX(u+2);i.fromBufferAttribute(t,m),s.fromBufferAttribute(t,_),r.fromBufferAttribute(t,x),c.subVectors(r,s),h.subVectors(i,s),c.cross(h),a.fromBufferAttribute(n,m),o.fromBufferAttribute(n,_),l.fromBufferAttribute(n,x),a.add(c),o.add(c),l.add(c),n.setXYZ(m,a.x,a.y,a.z),n.setXYZ(_,o.x,o.y,o.z),n.setXYZ(x,l.x,l.y,l.z)}else for(let u=0,d=t.count;u<d;u+=3)i.fromBufferAttribute(t,u+0),s.fromBufferAttribute(t,u+1),r.fromBufferAttribute(t,u+2),c.subVectors(r,s),h.subVectors(i,s),c.cross(h),n.setXYZ(u+0,c.x,c.y,c.z),n.setXYZ(u+1,c.x,c.y,c.z),n.setXYZ(u+2,c.x,c.y,c.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)At.fromBufferAttribute(e,t),At.normalize(),e.setXYZ(t,At.x,At.y,At.z)}toNonIndexed(){function e(a,o){let{array:l,itemSize:c,normalized:h}=a,u=new l.constructor(o.length*c),d=0,m=0;for(let _=0,x=o.length;_<x;_++){if(a.isInterleavedBufferAttribute)d=o[_]*a.data.stride+a.offset;else d=o[_]*c;for(let f=0;f<c;f++)u[m++]=l[d++]}return new Mt(u,c,h)}if(this.index===null)return be("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new St,n=this.index.array,i=this.attributes;for(let a in i){let o=i[a],l=e(o,n);t.setAttribute(a,l)}let s=this.morphAttributes;for(let a in s){let o=[],l=s[a];for(let c=0,h=l.length;c<h;c++){let u=l[c],d=e(u,n);o.push(d)}t.morphAttributes[a]=o}t.morphTargetsRelative=this.morphTargetsRelative;let r=this.groups;for(let a=0,o=r.length;a<o;a++){let l=r[a];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!=="")e.name=this.name;if(Object.keys(this.userData).length>0)e.userData=this.userData;if(this.parameters!==void 0){let o=this.parameters;for(let l in o)if(o[l]!==void 0)e[l]=o[l];return e}e.data={attributes:{}};let t=this.index;if(t!==null)e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)};let n=this.attributes;for(let o in n){let l=n[o];e.data.attributes[o]=l.toJSON(e.data)}let i={},s=!1;for(let o in this.morphAttributes){let l=this.morphAttributes[o],c=[];for(let h=0,u=l.length;h<u;h++){let d=l[h];c.push(d.toJSON(e.data))}if(c.length>0)i[o]=c,s=!0}if(s)e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative;let r=this.groups;if(r.length>0)e.data.groups=JSON.parse(JSON.stringify(r));let a=this.boundingSphere;if(a!==null)e.data.boundingSphere=a.toJSON();return e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;if(n!==null)this.setIndex(n.clone());let i=e.attributes;for(let l in i){let c=i[l];this.setAttribute(l,c.clone(t))}let s=e.morphAttributes;for(let l in s){let c=[],h=s[l];for(let u=0,d=h.length;u<d;u++)c.push(h[u].clone(t));this.morphAttributes[l]=c}this.morphTargetsRelative=e.morphTargetsRelative;let r=e.groups;for(let l=0,c=r.length;l<c;l++){let h=r[l];this.addGroup(h.start,h.count,h.materialIndex)}let a=e.boundingBox;if(a!==null)this.boundingBox=a.clone();let o=e.boundingSphere;if(o!==null)this.boundingSphere=o.clone();return this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}var yc=new Fe,oi=new ss,Sr=new qt,Mc=new L,br=new L,Tr=new L,Ar=new L,no=new L,Er=new L,Sc=new L,wr=new L;class nt extends Qe{constructor(e=new St,t=new kt){super();this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){if(super.copy(e,t),e.morphTargetInfluences!==void 0)this.morphTargetInfluences=e.morphTargetInfluences.slice();if(e.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary);return this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,r=i.length;s<r;s++){let a=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){let n=this.geometry,i=n.attributes.position,s=n.morphAttributes.position,r=n.morphTargetsRelative;t.fromBufferAttribute(i,e);let a=this.morphTargetInfluences;if(s&&a){Er.set(0,0,0);for(let o=0,l=s.length;o<l;o++){let c=a[o],h=s[o];if(c===0)continue;if(no.fromBufferAttribute(h,e),r)Er.addScaledVector(no,c);else Er.addScaledVector(no.sub(t),c)}t.add(Er)}return t}raycast(e,t){let n=this.geometry,i=this.material,s=this.matrixWorld;if(i===void 0)return;if(n.boundingSphere===null)n.computeBoundingSphere();if(Sr.copy(n.boundingSphere),Sr.applyMatrix4(s),oi.copy(e.ray).recast(e.near),Sr.containsPoint(oi.origin)===!1){if(oi.intersectSphere(Sr,Mc)===null)return;if(oi.origin.distanceToSquared(Mc)>(e.far-e.near)**2)return}if(yc.copy(s).invert(),oi.copy(e.ray).applyMatrix4(yc),n.boundingBox!==null){if(oi.intersectsBox(n.boundingBox)===!1)return}this._computeIntersections(e,t,oi)}_computeIntersections(e,t,n){let i,s=this.geometry,r=this.material,a=s.index,o=s.attributes.position,l=s.attributes.uv,c=s.attributes.uv1,h=s.attributes.normal,{groups:u,drawRange:d}=s;if(a!==null)if(Array.isArray(r))for(let m=0,_=u.length;m<_;m++){let x=u[m],f=r[x.materialIndex],p=Math.max(x.start,d.start),A=Math.min(a.count,Math.min(x.start+x.count,d.start+d.count));for(let M=p,b=A;M<b;M+=3){let R=a.getX(M),E=a.getX(M+1),P=a.getX(M+2);if(i=Cr(this,f,e,n,l,c,h,R,E,P),i)i.faceIndex=Math.floor(M/3),i.face.materialIndex=x.materialIndex,t.push(i)}}else{let m=Math.max(0,d.start),_=Math.min(a.count,d.start+d.count);for(let x=m,f=_;x<f;x+=3){let p=a.getX(x),A=a.getX(x+1),M=a.getX(x+2);if(i=Cr(this,r,e,n,l,c,h,p,A,M),i)i.faceIndex=Math.floor(x/3),t.push(i)}}else if(o!==void 0)if(Array.isArray(r))for(let m=0,_=u.length;m<_;m++){let x=u[m],f=r[x.materialIndex],p=Math.max(x.start,d.start),A=Math.min(o.count,Math.min(x.start+x.count,d.start+d.count));for(let M=p,b=A;M<b;M+=3){let R=M,E=M+1,P=M+2;if(i=Cr(this,f,e,n,l,c,h,R,E,P),i)i.faceIndex=Math.floor(M/3),i.face.materialIndex=x.materialIndex,t.push(i)}}else{let m=Math.max(0,d.start),_=Math.min(o.count,d.start+d.count);for(let x=m,f=_;x<f;x+=3){let p=x,A=x+1,M=x+2;if(i=Cr(this,r,e,n,l,c,h,p,A,M),i)i.faceIndex=Math.floor(x/3),t.push(i)}}}}function Zd(e,t,n,i,s,r,a,o){let l;if(t.side===1)l=i.intersectTriangle(a,r,s,!0,o);else l=i.intersectTriangle(s,r,a,t.side===0,o);if(l===null)return null;wr.copy(o),wr.applyMatrix4(e.matrixWorld);let c=n.ray.origin.distanceTo(wr);if(c<n.near||c>n.far)return null;return{distance:c,point:wr.clone(),object:e}}function Cr(e,t,n,i,s,r,a,o,l,c){e.getVertexPosition(o,br),e.getVertexPosition(l,Tr),e.getVertexPosition(c,Ar);let h=Zd(e,t,n,i,br,Tr,Ar,Sc);if(h){let u=new L;if(Xt.getBarycoord(Sc,br,Tr,Ar,u),s)h.uv=Xt.getInterpolatedAttribute(s,o,l,c,u,new Me);if(r)h.uv1=Xt.getInterpolatedAttribute(r,o,l,c,u,new Me);if(a){if(h.normal=Xt.getInterpolatedAttribute(a,o,l,c,u,new L),h.normal.dot(i.direction)>0)h.normal.multiplyScalar(-1)}let d={a:o,b:l,c,normal:new L,materialIndex:0};Xt.getNormal(br,Tr,Ar,d.normal),h.face=d,h.barycoord=u}return h}class Kn extends St{constructor(e=1,t=1,n=1,i=1,s=1,r=1){super();this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:s,depthSegments:r};let a=this;i=Math.floor(i),s=Math.floor(s),r=Math.floor(r);let o=[],l=[],c=[],h=[],u=0,d=0;m("z","y","x",-1,-1,n,t,e,r,s,0),m("z","y","x",1,-1,n,t,-e,r,s,1),m("x","z","y",1,1,e,n,t,i,r,2),m("x","z","y",1,-1,e,n,-t,i,r,3),m("x","y","z",1,-1,e,t,n,i,s,4),m("x","y","z",-1,-1,e,t,-n,i,s,5),this.setIndex(o),this.setAttribute("position",new xt(l,3)),this.setAttribute("normal",new xt(c,3)),this.setAttribute("uv",new xt(h,2));function m(_,x,f,p,A,M,b,R,E,P,N){let T=M/E,S=b/P,C=M/2,k=b/2,X=R/2,G=E+1,K=P+1,H=0,O=0,Y=new L;for(let te=0;te<K;te++){let ie=te*S-k;for(let ge=0;ge<G;ge++){let Ue=ge*T-C;Y[_]=Ue*p,Y[x]=ie*A,Y[f]=X,l.push(Y.x,Y.y,Y.z),Y[_]=0,Y[x]=0,Y[f]=R>0?1:-1,c.push(Y.x,Y.y,Y.z),h.push(ge/E),h.push(1-te/P),H+=1}}for(let te=0;te<P;te++)for(let ie=0;ie<E;ie++){let ge=u+ie+G*te,Ue=u+ie+G*(te+1),ut=u+(ie+1)+G*(te+1),it=u+(ie+1)+G*te;o.push(ge,Ue,it),o.push(Ue,ut,it),O+=6}a.addGroup(d,O,N),d+=O,u+=H}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Kn(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function xi(e){let t={};for(let n in e){t[n]={};for(let i in e[n]){let s=e[n][i];if(s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion))if(s.isRenderTargetTexture)be("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[n][i]=null;else t[n][i]=s.clone();else if(Array.isArray(s))t[n][i]=s.slice();else t[n][i]=s}}return t}function Pt(e){let t={};for(let n=0;n<e.length;n++){let i=xi(e[n]);for(let s in i)t[s]=i[s]}return t}function Jd(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function hl(e){let t=e.getRenderTarget();if(t===null)return e.outputColorSpace;if(t.isXRRenderTarget===!0)return t.texture.colorSpace;return Ge.workingColorSpace}var Dn={clone:xi,merge:Pt},Kd=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,$d=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class vt extends Ot{constructor(e){super();if(this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Kd,this.fragmentShader=$d,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0)this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=xi(e.uniforms),this.uniformsGroups=Jd(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let i in this.uniforms){let r=this.uniforms[i].value;if(r&&r.isTexture)t.uniforms[i]={type:"t",value:r.toJSON(e).uuid};else if(r&&r.isColor)t.uniforms[i]={type:"c",value:r.getHex()};else if(r&&r.isVector2)t.uniforms[i]={type:"v2",value:r.toArray()};else if(r&&r.isVector3)t.uniforms[i]={type:"v3",value:r.toArray()};else if(r&&r.isVector4)t.uniforms[i]={type:"v4",value:r.toArray()};else if(r&&r.isMatrix3)t.uniforms[i]={type:"m3",value:r.toArray()};else if(r&&r.isMatrix4)t.uniforms[i]={type:"m4",value:r.toArray()};else t.uniforms[i]={value:r}}if(Object.keys(this.defines).length>0)t.defines=this.defines;t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let i in this.extensions)if(this.extensions[i]===!0)n[i]=!0;if(Object.keys(n).length>0)t.extensions=n;return t}}class ha extends Qe{constructor(){super();this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Fe,this.projectionMatrix=new Fe,this.projectionMatrixInverse=new Fe,this.coordinateSystem=2000,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}var Xn=new L,bc=new Me,Tc=new Me;class yt extends ha{constructor(e=50,t=1,n=0.1,i=2000){super();this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=0.5*this.getFilmHeight()/e;this.fov=ci*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Cs*0.5*this.fov);return 0.5*this.getFilmHeight()/e}getEffectiveFOV(){return ci*2*Math.atan(Math.tan(Cs*0.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Xn.set(-1,-1,0.5).applyMatrix4(this.projectionMatrixInverse),t.set(Xn.x,Xn.y).multiplyScalar(-e/Xn.z),Xn.set(1,1,0.5).applyMatrix4(this.projectionMatrixInverse),n.set(Xn.x,Xn.y).multiplyScalar(-e/Xn.z)}getViewSize(e,t){return this.getViewBounds(e,bc,Tc),t.subVectors(Tc,bc)}setViewOffset(e,t,n,i,s,r){if(this.aspect=e/t,this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Cs*0.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,s=-0.5*i,r=this.view;if(this.view!==null&&this.view.enabled){let{fullWidth:o,fullHeight:l}=r;s+=r.offsetX*i/o,t-=r.offsetY*n/l,i*=r.width/o,n*=r.height/l}let a=this.filmOffset;if(a!==0)s+=e*a/this.getFilmWidth();this.projectionMatrix.makePerspective(s,s+i,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);if(t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null)t.object.view=Object.assign({},this.view);return t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}var Oi=-90,Bi=1;class ul extends Qe{constructor(e,t,n){super();this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let i=new yt(Oi,Bi,e,t);i.layers=this.layers,this.add(i);let s=new yt(Oi,Bi,e,t);s.layers=this.layers,this.add(s);let r=new yt(Oi,Bi,e,t);r.layers=this.layers,this.add(r);let a=new yt(Oi,Bi,e,t);a.layers=this.layers,this.add(a);let o=new yt(Oi,Bi,e,t);o.layers=this.layers,this.add(o);let l=new yt(Oi,Bi,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,i,s,r,a,o]=t;for(let l of t)this.remove(l);if(e===2000)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),r.up.set(0,0,1),r.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),o.up.set(0,1,0),o.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),r.up.set(0,0,-1),r.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),o.up.set(0,-1,0),o.lookAt(0,0,-1);else throw Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){if(this.parent===null)this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:i}=this;if(this.coordinateSystem!==e.coordinateSystem)this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem();let[s,r,a,o,l,c]=this.children,h=e.getRenderTarget(),u=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;let _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,i),e.render(t,s),e.setRenderTarget(n,1,i),e.render(t,r),e.setRenderTarget(n,2,i),e.render(t,a),e.setRenderTarget(n,3,i),e.render(t,o),e.setRenderTarget(n,4,i),e.render(t,l),n.texture.generateMipmaps=_,e.setRenderTarget(n,5,i),e.render(t,c),e.setRenderTarget(h,u,d),e.xr.enabled=m,n.texture.needsPMREMUpdate=!0}}class ua extends pt{constructor(e=[],t=301,n,i,s,r,a,o,l,c){super(e,t,n,i,s,r,a,o,l,c);this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class da extends Et{constructor(e=1,t={}){super(e,e,t);this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new ua(i),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},i=new Kn(5,5,5),s=new vt({name:"CubemapFromEquirect",uniforms:xi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});s.uniforms.tEquirect.value=t;let r=new nt(i,s),a=t.minFilter;if(t.minFilter===1008)t.minFilter=1006;return new ul(1,10,this).update(e,r),t.minFilter=a,r.geometry.dispose(),r.material.dispose(),this}clear(e,t=!0,n=!0,i=!0){let s=e.getRenderTarget();for(let r=0;r<6;r++)e.setRenderTarget(this,r),e.clear(t,n,i);e.setRenderTarget(s)}}class fn extends Qe{constructor(){super();this.isGroup=!0,this.type="Group"}}var jd={type:"move"};class Ws{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){if(this._hand===null)this._hand=new fn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1};return this._hand}getTargetRaySpace(){if(this._targetRay===null)this._targetRay=new fn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new L,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new L;return this._targetRay}getGripSpace(){if(this._grip===null)this._grip=new fn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new L,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new L;return this._grip}dispatchEvent(e){if(this._targetRay!==null)this._targetRay.dispatchEvent(e);if(this._grip!==null)this._grip.dispatchEvent(e);if(this._hand!==null)this._hand.dispatchEvent(e);return this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){if(this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null)this._targetRay.visible=!1;if(this._grip!==null)this._grip.visible=!1;if(this._hand!==null)this._hand.visible=!1;return this}update(e,t,n){let i=null,s=null,r=null,a=this._targetRay,o=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){r=!0;for(let _ of e.hand.values()){let x=t.getJointPose(_,n),f=this._getHandJoint(l,_);if(x!==null)f.matrix.fromArray(x.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=x.radius;f.visible=x!==null}let c=l.joints["index-finger-tip"],h=l.joints["thumb-tip"],u=c.position.distanceTo(h.position),d=0.02,m=0.005;if(l.inputState.pinching&&u>d+m)l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this});else if(!l.inputState.pinching&&u<=d-m)l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this})}else if(o!==null&&e.gripSpace){if(s=t.getPose(e.gripSpace,n),s!==null){if(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity)o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity);else o.hasLinearVelocity=!1;if(s.angularVelocity)o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity);else o.hasAngularVelocity=!1}}if(a!==null){if(i=t.getPose(e.targetRaySpace,n),i===null&&s!==null)i=s;if(i!==null){if(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,i.linearVelocity)a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity);else a.hasLinearVelocity=!1;if(i.angularVelocity)a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity);else a.hasAngularVelocity=!1;this.dispatchEvent(jd)}}}if(a!==null)a.visible=i!==null;if(o!==null)o.visible=s!==null;if(l!==null)l.visible=r!==null;return this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new fn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}class Xs{constructor(e,t=1,n=1000){this.isFog=!0,this.name="",this.color=new pe(e),this.near=t,this.far=n}clone(){return new Xs(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class rs extends Qe{constructor(){super();if(this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new $t,this.environmentIntensity=1,this.environmentRotation=new $t,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){if(super.copy(e,t),e.background!==null)this.background=e.background.clone();if(e.environment!==null)this.environment=e.environment.clone();if(e.fog!==null)this.fog=e.fog.clone();if(this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null)this.overrideMaterial=e.overrideMaterial.clone();return this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);if(this.fog!==null)t.object.fog=this.fog.toJSON();if(this.backgroundBlurriness>0)t.object.backgroundBlurriness=this.backgroundBlurriness;if(this.backgroundIntensity!==1)t.object.backgroundIntensity=this.backgroundIntensity;if(t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1)t.object.environmentIntensity=this.environmentIntensity;return t.object.environmentRotation=this.environmentRotation.toArray(),t}}class as{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=35044,this.updateRanges=[],this.version=0,this.uuid=on()}onUploadCallback(){}set needsUpdate(e){if(e===!0)this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,s=this.stride;i<s;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){if(e.arrayBuffers===void 0)e.arrayBuffers={};if(this.array.buffer._uuid===void 0)this.array.buffer._uuid=on();if(e.arrayBuffers[this.array.buffer._uuid]===void 0)e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer;let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){if(e.arrayBuffers===void 0)e.arrayBuffers={};if(this.array.buffer._uuid===void 0)this.array.buffer._uuid=on();if(e.arrayBuffers[this.array.buffer._uuid]===void 0)e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer));return{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}var Nt=new L;class qn{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Nt.fromBufferAttribute(this,t),Nt.applyMatrix4(e),this.setXYZ(t,Nt.x,Nt.y,Nt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Nt.fromBufferAttribute(this,t),Nt.applyNormalMatrix(e),this.setXYZ(t,Nt.x,Nt.y,Nt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Nt.fromBufferAttribute(this,t),Nt.transformDirection(e),this.setXYZ(t,Nt.x,Nt.y,Nt.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];if(this.normalized)n=an(n,this.array);return n}setComponent(e,t,n){if(this.normalized)n=je(n,this.array);return this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){if(this.normalized)t=je(t,this.array);return this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){if(this.normalized)t=je(t,this.array);return this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){if(this.normalized)t=je(t,this.array);return this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){if(this.normalized)t=je(t,this.array);return this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];if(this.normalized)t=an(t,this.array);return t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];if(this.normalized)t=an(t,this.array);return t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];if(this.normalized)t=an(t,this.array);return t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];if(this.normalized)t=an(t,this.array);return t}setXY(e,t,n){if(e=e*this.data.stride+this.offset,this.normalized)t=je(t,this.array),n=je(n,this.array);return this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){if(e=e*this.data.stride+this.offset,this.normalized)t=je(t,this.array),n=je(n,this.array),i=je(i,this.array);return this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,s){if(e=e*this.data.stride+this.offset,this.normalized)t=je(t,this.array),n=je(n,this.array),i=je(i,this.array),s=je(s,this.array);return this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=s,this}clone(e){if(e===void 0){Is("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[i+s])}return new Mt(new this.array.constructor(t),this.itemSize,this.normalized)}else{if(e.interleavedBuffers===void 0)e.interleavedBuffers={};if(e.interleavedBuffers[this.data.uuid]===void 0)e.interleavedBuffers[this.data.uuid]=this.data.clone(e);return new qn(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}}toJSON(e){if(e===void 0){Is("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[i+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else{if(e.interleavedBuffers===void 0)e.interleavedBuffers={};if(e.interleavedBuffers[this.data.uuid]===void 0)e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e);return{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}}class qs extends Ot{constructor(e){super();this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new pe(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}var zi,Ss=new L,ki=new L,Gi=new L,Hi=new Me,bs=new Me,Uh=new Fe,Rr=new L,Ts=new L,Ir=new L,Ac=new Me,io=new Me,Ec=new Me;class fa extends Qe{constructor(e=new qs){super();if(this.isSprite=!0,this.type="Sprite",zi===void 0){zi=new St;let t=new Float32Array([-0.5,-0.5,0,0,0,0.5,-0.5,0,1,0,0.5,0.5,0,1,1,-0.5,0.5,0,0,1]),n=new as(t,5);zi.setIndex([0,1,2,0,2,3]),zi.setAttribute("position",new qn(n,3,0,!1)),zi.setAttribute("uv",new qn(n,2,3,!1))}this.geometry=zi,this.material=e,this.center=new Me(0.5,0.5),this.count=1}raycast(e,t){if(e.camera===null)Re('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.');if(ki.setFromMatrixScale(this.matrixWorld),Uh.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Gi.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1)ki.multiplyScalar(-Gi.z);let n=this.material.rotation,i,s;if(n!==0)s=Math.cos(n),i=Math.sin(n);let r=this.center;Pr(Rr.set(-0.5,-0.5,0),Gi,r,ki,i,s),Pr(Ts.set(0.5,-0.5,0),Gi,r,ki,i,s),Pr(Ir.set(0.5,0.5,0),Gi,r,ki,i,s),Ac.set(0,0),io.set(1,0),Ec.set(1,1);let a=e.ray.intersectTriangle(Rr,Ts,Ir,!1,Ss);if(a===null){if(Pr(Ts.set(-0.5,0.5,0),Gi,r,ki,i,s),io.set(0,1),a=e.ray.intersectTriangle(Rr,Ir,Ts,!1,Ss),a===null)return}let o=e.ray.origin.distanceTo(Ss);if(o<e.near||o>e.far)return;t.push({distance:o,point:Ss.clone(),uv:Xt.getInterpolation(Ss,Rr,Ts,Ir,Ac,io,Ec,new Me),face:null,object:this})}copy(e,t){if(super.copy(e,t),e.center!==void 0)this.center.copy(e.center);return this.material=e.material,this}}function Pr(e,t,n,i,s,r){if(Hi.subVectors(e,n).addScalar(0.5).multiply(i),s!==void 0)bs.x=r*Hi.x-s*Hi.y,bs.y=s*Hi.x+r*Hi.y;else bs.copy(Hi);e.copy(t),e.x+=bs.x,e.y+=bs.y,e.applyMatrix4(Uh)}var wc=new L,Cc=new ct,Rc=new ct,Qd=new L,Ic=new Fe,Lr=new L,so=new qt,Pc=new Fe,ro=new ss;class pa extends nt{constructor(e,t){super(e,t);this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode="attached",this.bindMatrix=new Fe,this.bindMatrixInverse=new Fe,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;if(this.boundingBox===null)this.boundingBox=new Qt;this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Lr),this.boundingBox.expandByPoint(Lr)}computeBoundingSphere(){let e=this.geometry;if(this.boundingSphere===null)this.boundingSphere=new qt;this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Lr),this.boundingSphere.expandByPoint(Lr)}copy(e,t){if(super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null)this.boundingBox=e.boundingBox.clone();if(e.boundingSphere!==null)this.boundingSphere=e.boundingSphere.clone();return this}raycast(e,t){let n=this.material,i=this.matrixWorld;if(n===void 0)return;if(this.boundingSphere===null)this.computeBoundingSphere();if(so.copy(this.boundingSphere),so.applyMatrix4(i),e.ray.intersectsSphere(so)===!1)return;if(Pc.copy(i).invert(),ro.copy(e.ray).applyMatrix4(Pc),this.boundingBox!==null){if(ro.intersectsBox(this.boundingBox)===!1)return}this._computeIntersections(e,t,ro)}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){if(this.skeleton=e,t===void 0)this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld;this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new ct,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);let s=1/e.manhattanLength();if(s!==1/0)e.multiplyScalar(s);else e.set(1,0,0,0);t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){if(super.updateMatrixWorld(e),this.bindMode==="attached")this.bindMatrixInverse.copy(this.matrixWorld).invert();else if(this.bindMode==="detached")this.bindMatrixInverse.copy(this.bindMatrix).invert();else be("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,i=this.geometry;Cc.fromBufferAttribute(i.attributes.skinIndex,e),Rc.fromBufferAttribute(i.attributes.skinWeight,e),wc.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let s=0;s<4;s++){let r=Rc.getComponent(s);if(r!==0){let a=Cc.getComponent(s);Ic.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(Qd.copy(wc).applyMatrix4(Ic),r)}}return t.applyMatrix4(this.bindMatrixInverse)}}class Ys extends Qe{constructor(){super();this.isBone=!0,this.type="Bone"}}class Zs extends pt{constructor(e=null,t=1,n=1,i,s,r,a,o,l=1003,c=1003,h,u){super(null,r,a,o,l,c,i,s,h,u);this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}var Lc=new Fe,ef=new Fe;class Js{constructor(e=[],t=[]){this.uuid=on(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.previousBoneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){be("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new Fe)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new Fe;if(this.bones[e])n.copy(this.bones[e].matrixWorld).invert();this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];if(n)n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];if(n){if(n.parent&&n.parent.isBone)n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld);else n.matrix.copy(n.matrixWorld);n.matrix.decompose(n.position,n.quaternion,n.scale)}}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let s=0,r=e.length;s<r;s++){let a=e[s]?e[s].matrixWorld:ef;Lc.multiplyMatrices(a,t[s]),Lc.toArray(n,s*16)}if(i!==null)i.needsUpdate=!0}clone(){return new Js(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new Zs(t,e,e,1023,1015);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let i=this.bones[t];if(i.name===e)return i}return}dispose(){if(this.boneTexture!==null)this.boneTexture.dispose(),this.boneTexture=null}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){let s=e.bones[n],r=t[s];if(r===void 0)be("Skeleton: No bone found with UUID:",s),r=new Ys;this.bones.push(r),this.boneInverses.push(new Fe().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let i=0,s=t.length;i<s;i++){let r=t[i];e.bones.push(r.uuid);let a=n[i];e.boneInverses.push(a.toArray())}return e}}class hi extends Mt{constructor(e,t,n,i=1){super(e,t,n);this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}var Vi=new Fe,Nc=new Fe,Nr=[],Dc=new Qt,tf=new Fe,As=new nt,Es=new qt;class os extends nt{constructor(e,t,n){super(e,t);this.isInstancedMesh=!0,this.instanceMatrix=new hi(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,tf)}computeBoundingBox(){let e=this.geometry,t=this.count;if(this.boundingBox===null)this.boundingBox=new Qt;if(e.boundingBox===null)e.computeBoundingBox();this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Vi),Dc.copy(e.boundingBox).applyMatrix4(Vi),this.boundingBox.union(Dc)}computeBoundingSphere(){let e=this.geometry,t=this.count;if(this.boundingSphere===null)this.boundingSphere=new qt;if(e.boundingSphere===null)e.computeBoundingSphere();this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Vi),Es.copy(e.boundingSphere).applyMatrix4(Vi),this.boundingSphere.union(Es)}copy(e,t){if(super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null)this.morphTexture=e.morphTexture.clone();if(e.instanceColor!==null)this.instanceColor=e.instanceColor.clone();if(this.count=e.count,e.boundingBox!==null)this.boundingBox=e.boundingBox.clone();if(e.boundingSphere!==null)this.boundingSphere=e.boundingSphere.clone();return this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,i=this.morphTexture.source.data.data,s=n.length+1,r=e*s+1;for(let a=0;a<n.length;a++)n[a]=i[r+a]}raycast(e,t){let n=this.matrixWorld,i=this.count;if(As.geometry=this.geometry,As.material=this.material,As.material===void 0)return;if(this.boundingSphere===null)this.computeBoundingSphere();if(Es.copy(this.boundingSphere),Es.applyMatrix4(n),e.ray.intersectsSphere(Es)===!1)return;for(let s=0;s<i;s++){this.getMatrixAt(s,Vi),Nc.multiplyMatrices(n,Vi),As.matrixWorld=Nc,As.raycast(e,Nr);for(let r=0,a=Nr.length;r<a;r++){let o=Nr[r];o.instanceId=s,o.object=this,t.push(o)}Nr.length=0}}setColorAt(e,t){if(this.instanceColor===null)this.instanceColor=new hi(new Float32Array(this.instanceMatrix.count*3).fill(1),3);t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let n=t.morphTargetInfluences,i=n.length+1;if(this.morphTexture===null)this.morphTexture=new Zs(new Float32Array(i*this.count),i,this.count,1028,1015);let s=this.morphTexture.source.data.data,r=0;for(let l=0;l<n.length;l++)r+=n[l];let a=this.geometry.morphTargetsRelative?1:1-r,o=i*e;s[o]=a,s.set(n,o+1)}updateMorphTargets(){}dispose(){if(this.dispatchEvent({type:"dispose"}),this.morphTexture!==null)this.morphTexture.dispose(),this.morphTexture=null}}var ao=new L,nf=new L,sf=new Oe;class Cn{constructor(e=new L(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let i=ao.subVectors(n,t).cross(nf.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(ao),i=this.normal.dot(n);if(i===0){if(this.distanceToPoint(e.start)===0)return t.copy(e.start);return null}let s=-(e.start.dot(this.normal)+this.constant)/i;if(s<0||s>1)return null;return t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||sf.getNormalMatrix(e),i=this.coplanarPoint(ao).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}var li=new qt,rf=new Me(0.5,0.5),Dr=new L;class Ks{constructor(e=new Cn,t=new Cn,n=new Cn,i=new Cn,s=new Cn,r=new Cn){this.planes=[e,t,n,i,s,r]}set(e,t,n,i,s,r){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(i),a[4].copy(s),a[5].copy(r),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=2000,n=!1){let i=this.planes,s=e.elements,r=s[0],a=s[1],o=s[2],l=s[3],c=s[4],h=s[5],u=s[6],d=s[7],m=s[8],_=s[9],x=s[10],f=s[11],p=s[12],A=s[13],M=s[14],b=s[15];if(i[0].setComponents(l-r,d-c,f-m,b-p).normalize(),i[1].setComponents(l+r,d+c,f+m,b+p).normalize(),i[2].setComponents(l+a,d+h,f+_,b+A).normalize(),i[3].setComponents(l-a,d-h,f-_,b-A).normalize(),n)i[4].setComponents(o,u,x,M).normalize(),i[5].setComponents(l-o,d-u,f-x,b-M).normalize();else if(i[4].setComponents(l-o,d-u,f-x,b-M).normalize(),t===2000)i[5].setComponents(l+o,d+u,f+x,b+M).normalize();else if(t===2001)i[5].setComponents(o,u,x,M).normalize();else throw Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0){if(e.boundingSphere===null)e.computeBoundingSphere();li.copy(e.boundingSphere).applyMatrix4(e.matrixWorld)}else{let t=e.geometry;if(t.boundingSphere===null)t.computeBoundingSphere();li.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(li)}intersectsSprite(e){li.center.set(0,0,0);let t=rf.distanceTo(e.center);return li.radius=0.7071067811865476+t,li.applyMatrix4(e.matrixWorld),this.intersectsSphere(li)}intersectsSphere(e){let t=this.planes,n=e.center,i=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let i=t[n];if(Dr.x=i.normal.x>0?e.max.x:e.min.x,Dr.y=i.normal.y>0?e.max.y:e.min.y,Dr.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(Dr)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class $s extends Ot{constructor(e){super();this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new pe(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}var kr=new L,Gr=new L,Uc=new Fe,ws=new ss,Ur=new qt,oo=new L,Fc=new L;class ls extends Qe{constructor(e=new St,t=new $s){super();this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let i=1,s=t.count;i<s;i++)kr.fromBufferAttribute(t,i-1),Gr.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=kr.distanceTo(Gr);e.setAttribute("lineDistance",new xt(n,1))}else be("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let n=this.geometry,i=this.matrixWorld,s=e.params.Line.threshold,r=n.drawRange;if(n.boundingSphere===null)n.computeBoundingSphere();if(Ur.copy(n.boundingSphere),Ur.applyMatrix4(i),Ur.radius+=s,e.ray.intersectsSphere(Ur)===!1)return;Uc.copy(i).invert(),ws.copy(e.ray).applyMatrix4(Uc);let a=s/((this.scale.x+this.scale.y+this.scale.z)/3),o=a*a,l=this.isLineSegments?2:1,c=n.index,u=n.attributes.position;if(c!==null){let d=Math.max(0,r.start),m=Math.min(c.count,r.start+r.count);for(let _=d,x=m-1;_<x;_+=l){let f=c.getX(_),p=c.getX(_+1),A=Fr(this,e,ws,o,f,p,_);if(A)t.push(A)}if(this.isLineLoop){let _=c.getX(m-1),x=c.getX(d),f=Fr(this,e,ws,o,_,x,m-1);if(f)t.push(f)}}else{let d=Math.max(0,r.start),m=Math.min(u.count,r.start+r.count);for(let _=d,x=m-1;_<x;_+=l){let f=Fr(this,e,ws,o,_,_+1,_);if(f)t.push(f)}if(this.isLineLoop){let _=Fr(this,e,ws,o,m-1,d,m-1);if(_)t.push(_)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,r=i.length;s<r;s++){let a=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}function Fr(e,t,n,i,s,r,a){let o=e.geometry.attributes.position;if(kr.fromBufferAttribute(o,s),Gr.fromBufferAttribute(o,r),n.distanceSqToSegment(kr,Gr,oo,Fc)>i)return;oo.applyMatrix4(e.matrixWorld);let c=t.ray.origin.distanceTo(oo);if(c<t.near||c>t.far)return;return{distance:c,point:Fc.clone().applyMatrix4(e.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:e}}var Oc=new L,Bc=new L;class ma extends ls{constructor(e,t){super(e,t);this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let i=0,s=t.count;i<s;i+=2)Oc.fromBufferAttribute(t,i),Bc.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+Oc.distanceTo(Bc);e.setAttribute("lineDistance",new xt(n,1))}else be("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class ga extends ls{constructor(e,t){super(e,t);this.isLineLoop=!0,this.type="LineLoop"}}class js extends Ot{constructor(e){super();this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new pe(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}var zc=new Fe,ho=new ss,Or=new qt,Br=new L;class _a extends Qe{constructor(e=new St,t=new js){super();this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let n=this.geometry,i=this.matrixWorld,s=e.params.Points.threshold,r=n.drawRange;if(n.boundingSphere===null)n.computeBoundingSphere();if(Or.copy(n.boundingSphere),Or.applyMatrix4(i),Or.radius+=s,e.ray.intersectsSphere(Or)===!1)return;zc.copy(i).invert(),ho.copy(e.ray).applyMatrix4(zc);let a=s/((this.scale.x+this.scale.y+this.scale.z)/3),o=a*a,l=n.index,h=n.attributes.position;if(l!==null){let u=Math.max(0,r.start),d=Math.min(l.count,r.start+r.count);for(let m=u,_=d;m<_;m++){let x=l.getX(m);Br.fromBufferAttribute(h,x),kc(Br,x,o,i,e,t,this)}}else{let u=Math.max(0,r.start),d=Math.min(h.count,r.start+r.count);for(let m=u,_=d;m<_;m++)Br.fromBufferAttribute(h,m),kc(Br,m,o,i,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,r=i.length;s<r;s++){let a=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}function kc(e,t,n,i,s,r,a){let o=ho.distanceSqToPoint(e);if(o<n){let l=new L;ho.closestPointToPoint(e,l),l.applyMatrix4(i);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:a})}}class xa extends pt{constructor(e,t,n,i,s,r,a,o,l){super(e,t,n,i,s,r,a,o,l);this.isCanvasTexture=!0,this.needsUpdate=!0}}class vi extends pt{constructor(e,t,n=1014,i,s,r,a=1003,o=1003,l,c=1026,h=1){if(c!==1026&&c!==1027)throw Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:e,height:t,depth:h};super(u,i,s,r,a,o,c,n,l);this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Vs(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);if(this.compareFunction!==null)t.compareFunction=this.compareFunction;return t}}class dl extends vi{constructor(e,t=1014,n=301,i,s,r=1003,a=1003,o,l=1026){let c={width:e,height:e,depth:1},h=[c,c,c,c,c,c];super(e,e,t,n,i,s,r,a,o,l);this.image=h,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class va extends pt{constructor(e=null){super();this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Qs extends St{constructor(e=1,t=1,n=1,i=1){super();this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};let s=e/2,r=t/2,a=Math.floor(n),o=Math.floor(i),l=a+1,c=o+1,h=e/a,u=t/o,d=[],m=[],_=[],x=[];for(let f=0;f<c;f++){let p=f*u-r;for(let A=0;A<l;A++){let M=A*h-s;m.push(M,-p,0),_.push(0,0,1),x.push(A/a),x.push(1-f/o)}}for(let f=0;f<o;f++)for(let p=0;p<a;p++){let A=p+l*f,M=p+l*(f+1),b=p+1+l*(f+1),R=p+1+l*f;d.push(A,M,R),d.push(M,b,R)}this.setIndex(d),this.setAttribute("position",new xt(m,3)),this.setAttribute("normal",new xt(_,3)),this.setAttribute("uv",new xt(x,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Qs(e.width,e.height,e.widthSegments,e.heightSegments)}}class er extends St{constructor(e=1,t=32,n=16,i=0,s=Math.PI*2,r=0,a=Math.PI){super();this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:i,phiLength:s,thetaStart:r,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let o=Math.min(r+a,Math.PI),l=0,c=[],h=new L,u=new L,d=[],m=[],_=[],x=[];for(let f=0;f<=n;f++){let p=[],A=f/n,M=0;if(f===0&&r===0)M=0.5/t;else if(f===n&&o===Math.PI)M=-0.5/t;for(let b=0;b<=t;b++){let R=b/t;h.x=-e*Math.cos(i+R*s)*Math.sin(r+A*a),h.y=e*Math.cos(r+A*a),h.z=e*Math.sin(i+R*s)*Math.sin(r+A*a),m.push(h.x,h.y,h.z),u.copy(h).normalize(),_.push(u.x,u.y,u.z),x.push(R+M,1-A),p.push(l++)}c.push(p)}for(let f=0;f<n;f++)for(let p=0;p<t;p++){let A=c[f][p+1],M=c[f][p],b=c[f+1][p],R=c[f+1][p+1];if(f!==0||r>0)d.push(A,M,R);if(f!==n-1||o<Math.PI)d.push(M,b,R)}this.setIndex(d),this.setAttribute("position",new xt(m,3)),this.setAttribute("normal",new xt(_,3)),this.setAttribute("uv",new xt(x,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new er(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class tr extends vt{constructor(e){super(e);this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Un extends Ot{constructor(e){super();this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new pe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new pe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new Me(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new $t,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Yt extends Un{constructor(e){super();this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Me(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return We(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+0.4*t)/(1-0.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new pe(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new pe(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new pe(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){if(this._anisotropy>0!==e>0)this.version++;this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){if(this._clearcoat>0!==e>0)this.version++;this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){if(this._iridescence>0!==e>0)this.version++;this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){if(this._dispersion>0!==e>0)this.version++;this._dispersion=e}get sheen(){return this._sheen}set sheen(e){if(this._sheen>0!==e>0)this.version++;this._sheen=e}get transmission(){return this._transmission}set transmission(e){if(this._transmission>0!==e>0)this.version++;this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class ya extends Ot{constructor(e){super();this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new pe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new pe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new Me(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new $t,this.combine=0,this.reflectivity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class fl extends Ot{constructor(e){super();this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class pl extends Ot{constructor(e){super();this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}function zr(e,t){if(!e||e.constructor===t)return e;if(typeof t.BYTES_PER_ELEMENT==="number")return new t(e);return Array.prototype.slice.call(e)}function af(e){function t(s,r){return e[s]-e[r]}let n=e.length,i=Array(n);for(let s=0;s!==n;++s)i[s]=s;return i.sort(t),i}function Gc(e,t,n){let i=e.length,s=new e.constructor(i);for(let r=0,a=0;a!==i;++r){let o=n[r]*t;for(let l=0;l!==t;++l)s[a++]=e[o+l]}return s}function Fh(e,t,n,i){let s=1,r=e[0];while(r!==void 0&&r[i]===void 0)r=e[s++];if(r===void 0)return;let a=r[i];if(a===void 0)return;if(Array.isArray(a))do{if(a=r[i],a!==void 0)t.push(r.time),n.push(...a);r=e[s++]}while(r!==void 0);else if(a.toArray!==void 0)do{if(a=r[i],a!==void 0)t.push(r.time),a.toArray(n,n.length);r=e[s++]}while(r!==void 0);else do{if(a=r[i],a!==void 0)t.push(r.time),n.push(a);r=e[s++]}while(r!==void 0)}class $n{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,i=t[n],s=t[n-1];n:{e:{let r;t:{i:if(!(e<i)){for(let a=n+2;;){if(i===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(s=i,i=t[++n],e<i)break e}r=t.length;break t}if(!(e>=s)){let a=t[1];if(e<a)n=2,s=a;for(let o=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===o)break;if(i=s,s=t[--n-1],e>=s)break e}r=n,n=0;break t}break n}while(n<r){let a=n+r>>>1;if(e<t[a])r=a;else n=a+1}if(i=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,i)}return this.interpolate_(n,s,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=e*i;for(let r=0;r!==i;++r)t[r]=n[s+r];return t}interpolate_(){throw Error("call to abstract method")}intervalChanged_(){}}class ml extends $n{constructor(e,t,n,i){super(e,t,n,i);this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:2400,endingEnd:2400}}intervalChanged_(e,t,n){let i=this.parameterPositions,s=e-2,r=e+1,a=i[s],o=i[r];if(a===void 0)switch(this.getSettings_().endingStart){case 2401:s=e,a=2*t-n;break;case 2402:s=i.length-2,a=t+i[s]-i[s+1];break;default:s=e,a=n}if(o===void 0)switch(this.getSettings_().endingEnd){case 2401:r=e,o=2*n-t;break;case 2402:r=1,o=n+i[1]-i[0];break;default:r=e-1,o=t}let l=(n-t)*0.5,c=this.valueSize;this._weightPrev=l/(t-a),this._weightNext=l/(o-n),this._offsetPrev=s*c,this._offsetNext=r*c}interpolate_(e,t,n,i){let s=this.resultBuffer,r=this.sampleValues,a=this.valueSize,o=e*a,l=o-a,c=this._offsetPrev,h=this._offsetNext,u=this._weightPrev,d=this._weightNext,m=(n-t)/(i-t),_=m*m,x=_*m,f=-u*x+2*u*_-u*m,p=(1+u)*x+(-1.5-2*u)*_+(-0.5+u)*m+1,A=(-1-d)*x+(1.5+d)*_+0.5*m,M=d*x-d*_;for(let b=0;b!==a;++b)s[b]=f*r[c+b]+p*r[l+b]+A*r[o+b]+M*r[h+b];return s}}class gl extends $n{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let s=this.resultBuffer,r=this.sampleValues,a=this.valueSize,o=e*a,l=o-a,c=(n-t)/(i-t),h=1-c;for(let u=0;u!==a;++u)s[u]=r[l+u]*h+r[o+u]*c;return s}}class _l extends $n{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}}class Zt{constructor(e,t,n,i){if(e===void 0)throw Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=zr(t,this.TimeBufferType),this.values=zr(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:zr(e.times,Array),values:zr(e.values,Array)};let i=e.getInterpolation();if(i!==e.DefaultInterpolation)n.interpolation=i}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new _l(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new gl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new ml(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case 2300:t=this.InterpolantFactoryMethodDiscrete;break;case 2301:t=this.InterpolantFactoryMethodLinear;break;case 2302:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(n);return be("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return 2300;case this.InterpolantFactoryMethodLinear:return 2301;case this.InterpolantFactoryMethodSmooth:return 2302}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){let n=this.times,i=n.length,s=0,r=i-1;while(s!==i&&n[s]<e)++s;while(r!==-1&&n[r]>t)--r;if(++r,s!==0||r!==i){if(s>=r)r=Math.max(r,1),s=r-1;let a=this.getValueSize();this.times=n.slice(s,r),this.values=this.values.slice(s*a,r*a)}return this}validate(){let e=!0,t=this.getValueSize();if(t-Math.floor(t)!==0)Re("KeyframeTrack: Invalid value size in track.",this),e=!1;let n=this.times,i=this.values,s=n.length;if(s===0)Re("KeyframeTrack: Track is empty.",this),e=!1;let r=null;for(let a=0;a!==s;a++){let o=n[a];if(typeof o==="number"&&isNaN(o)){Re("KeyframeTrack: Time is not a valid number.",this,a,o),e=!1;break}if(r!==null&&r>o){Re("KeyframeTrack: Out of order keys.",this,a,o,r),e=!1;break}r=o}if(i!==void 0){if(xd(i))for(let a=0,o=i.length;a!==o;++a){let l=i[a];if(isNaN(l)){Re("KeyframeTrack: Value is not a valid number.",this,a,l),e=!1;break}}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===2302,s=e.length-1,r=1;for(let a=1;a<s;++a){let o=!1,l=e[a],c=e[a+1];if(l!==c&&(a!==1||l!==e[0]))if(!i){let h=a*n,u=h-n,d=h+n;for(let m=0;m!==n;++m){let _=t[h+m];if(_!==t[u+m]||_!==t[d+m]){o=!0;break}}}else o=!0;if(o){if(a!==r){e[r]=e[a];let h=a*n,u=r*n;for(let d=0;d!==n;++d)t[u+d]=t[h+d]}++r}}if(s>0){e[r]=e[s];for(let a=s*n,o=r*n,l=0;l!==n;++l)t[o+l]=t[a+l];++r}if(r!==e.length)this.times=e.slice(0,r),this.values=t.slice(0,r*n);else this.times=e,this.values=t;return this}clone(){let e=this.times.slice(),t=this.values.slice(),i=new this.constructor(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}}Zt.prototype.ValueTypeName="";Zt.prototype.TimeBufferType=Float32Array;Zt.prototype.ValueBufferType=Float32Array;Zt.prototype.DefaultInterpolation=2301;class jn extends Zt{constructor(e,t,n){super(e,t,n)}}jn.prototype.ValueTypeName="bool";jn.prototype.ValueBufferType=Array;jn.prototype.DefaultInterpolation=2300;jn.prototype.InterpolantFactoryMethodLinear=void 0;jn.prototype.InterpolantFactoryMethodSmooth=void 0;class Ma extends Zt{constructor(e,t,n,i){super(e,t,n,i)}}Ma.prototype.ValueTypeName="color";class In extends Zt{constructor(e,t,n,i){super(e,t,n,i)}}In.prototype.ValueTypeName="number";class xl extends $n{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let s=this.resultBuffer,r=this.sampleValues,a=this.valueSize,o=(n-t)/(i-t),l=e*a;for(let c=l+a;l!==c;l+=4)dn.slerpFlat(s,0,r,l-a,r,l,o);return s}}class Fn extends Zt{constructor(e,t,n,i){super(e,t,n,i)}InterpolantFactoryMethodLinear(e){return new xl(this.times,this.values,this.getValueSize(),e)}}Fn.prototype.ValueTypeName="quaternion";Fn.prototype.InterpolantFactoryMethodSmooth=void 0;class Qn extends Zt{constructor(e,t,n){super(e,t,n)}}Qn.prototype.ValueTypeName="string";Qn.prototype.ValueBufferType=Array;Qn.prototype.DefaultInterpolation=2300;Qn.prototype.InterpolantFactoryMethodLinear=void 0;Qn.prototype.InterpolantFactoryMethodSmooth=void 0;class Pn extends Zt{constructor(e,t,n,i){super(e,t,n,i)}}Pn.prototype.ValueTypeName="vector";class Sa{constructor(e="",t=-1,n=[],i=2500){if(this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=on(),this.userData={},this.duration<0)this.resetDuration()}static parse(e){let t=[],n=e.tracks,i=1/(e.fps||1);for(let r=0,a=n.length;r!==a;++r)t.push(lf(n[r]).scale(i));let s=new this(e.name,e.duration,t,e.blendMode);return s.uuid=e.uuid,s.userData=JSON.parse(e.userData||"{}"),s}static toJSON(e){let t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let s=0,r=n.length;s!==r;++s)t.push(Zt.toJSON(n[s]));return i}static CreateFromMorphTargetSequence(e,t,n,i){let s=t.length,r=[];for(let a=0;a<s;a++){let o=[],l=[];o.push((a+s-1)%s,a,(a+1)%s),l.push(0,1,0);let c=af(o);if(o=Gc(o,1,c),l=Gc(l,1,c),!i&&o[0]===0)o.push(s),l.push(l[0]);r.push(new In(".morphTargetInfluences["+t[a].name+"]",o,l).scale(1/n))}return new this(e,-1,r)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let i={},s=/^([\w-]*?)([\d]+)$/;for(let a=0,o=e.length;a<o;a++){let l=e[a],c=l.name.match(s);if(c&&c.length>1){let h=c[1],u=i[h];if(!u)i[h]=u=[];u.push(l)}}let r=[];for(let a in i)r.push(this.CreateFromMorphTargetSequence(a,i[a],t,n));return r}static parseAnimation(e,t){if(be("AnimationClip: parseAnimation() is deprecated and will be removed with r185"),!e)return Re("AnimationClip: No animation in JSONLoader data."),null;let n=function(h,u,d,m,_){if(d.length!==0){let x=[],f=[];if(Fh(d,x,f,m),x.length!==0)_.push(new h(u,x,f))}},i=[],s=e.name||"default",r=e.fps||30,a=e.blendMode,o=e.length||-1,l=e.hierarchy||[];for(let h=0;h<l.length;h++){let u=l[h].keys;if(!u||u.length===0)continue;if(u[0].morphTargets){let d={},m;for(m=0;m<u.length;m++)if(u[m].morphTargets)for(let _=0;_<u[m].morphTargets.length;_++)d[u[m].morphTargets[_]]=-1;for(let _ in d){let x=[],f=[];for(let p=0;p!==u[m].morphTargets.length;++p){let A=u[m];x.push(A.time),f.push(A.morphTarget===_?1:0)}i.push(new In(".morphTargetInfluence["+_+"]",x,f))}o=d.length*r}else{let d=".bones["+t[h].name+"]";n(Pn,d+".position",u,"pos",i),n(Fn,d+".quaternion",u,"rot",i),n(Pn,d+".scale",u,"scl",i)}}if(i.length===0)return null;return new this(s,o,i,a)}resetDuration(){let e=this.tracks,t=0;for(let n=0,i=e.length;n!==i;++n){let s=this.tracks[n];t=Math.max(t,s.times[s.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}}function of(e){switch(e.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return In;case"vector":case"vector2":case"vector3":case"vector4":return Pn;case"color":return Ma;case"quaternion":return Fn;case"bool":case"boolean":return jn;case"string":return Qn}throw Error("THREE.KeyframeTrack: Unsupported typeName: "+e)}function lf(e){if(e.type===void 0)throw Error("THREE.KeyframeTrack: track type undefined, can not parse");let t=of(e.type);if(e.times===void 0){let n=[],i=[];Fh(e.keys,n,i,"value"),e.times=n,e.values=i}if(t.parse!==void 0)return t.parse(e);else return new t(e.name,e.times,e.values,e.interpolation)}var pn={enabled:!1,files:{},add:function(e,t){if(this.enabled===!1)return;this.files[e]=t},get:function(e){if(this.enabled===!1)return;return this.files[e]},remove:function(e){delete this.files[e]},clear:function(){this.files={}}};class vl{constructor(e,t,n){let i=this,s=!1,r=0,a=0,o=void 0,l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(c){if(a++,s===!1){if(i.onStart!==void 0)i.onStart(c,r,a)}s=!0},this.itemEnd=function(c){if(r++,i.onProgress!==void 0)i.onProgress(c,r,a);if(r===a){if(s=!1,i.onLoad!==void 0)i.onLoad()}},this.itemError=function(c){if(i.onError!==void 0)i.onError(c)},this.resolveURL=function(c){if(o)return o(c);return c},this.setURLModifier=function(c){return o=c,this},this.addHandler=function(c,h){return l.push(c,h),this},this.removeHandler=function(c){let h=l.indexOf(c);if(h!==-1)l.splice(h,2);return this},this.getHandler=function(c){for(let h=0,u=l.length;h<u;h+=2){let d=l[h],m=l[h+1];if(d.global)d.lastIndex=0;if(d.test(c))return m}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){if(!this._abortController)this._abortController=new AbortController;return this._abortController}}var Oh=new vl;class On{constructor(e){this.manager=e!==void 0?e:Oh,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(i,s){n.load(e,i,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}}On.DEFAULT_MATERIAL_NAME="__DEFAULT";var wn={};class Bh extends Error{constructor(e,t){super(e);this.response=t}}class nr extends On{constructor(e){super(e);this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,i){if(e===void 0)e="";if(this.path!==void 0)e=this.path+e;e=this.manager.resolveURL(e);let s=pn.get(`file:${e}`);if(s!==void 0)return this.manager.itemStart(e),setTimeout(()=>{if(t)t(s);this.manager.itemEnd(e)},0),s;if(wn[e]!==void 0){wn[e].push({onLoad:t,onProgress:n,onError:i});return}wn[e]=[],wn[e].push({onLoad:t,onProgress:n,onError:i});let r=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any==="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),a=this.mimeType,o=this.responseType;fetch(r).then((l)=>{if(l.status===200||l.status===0){if(l.status===0)be("FileLoader: HTTP Status 0 received.");if(typeof ReadableStream>"u"||l.body===void 0||l.body.getReader===void 0)return l;let c=wn[e],h=l.body.getReader(),u=l.headers.get("X-File-Size")||l.headers.get("Content-Length"),d=u?parseInt(u):0,m=d!==0,_=0,x=new ReadableStream({start(f){p();function p(){h.read().then(({done:A,value:M})=>{if(A)f.close();else{_+=M.byteLength;let b=new ProgressEvent("progress",{lengthComputable:m,loaded:_,total:d});for(let R=0,E=c.length;R<E;R++){let P=c[R];if(P.onProgress)P.onProgress(b)}f.enqueue(M),p()}},(A)=>{f.error(A)})}}});return new Response(x)}else throw new Bh(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`,l)}).then((l)=>{switch(o){case"arraybuffer":return l.arrayBuffer();case"blob":return l.blob();case"document":return l.text().then((c)=>new DOMParser().parseFromString(c,a));case"json":return l.json();default:if(a==="")return l.text();else{let h=/charset="?([^;"\s]*)"?/i.exec(a),u=h&&h[1]?h[1].toLowerCase():void 0,d=new TextDecoder(u);return l.arrayBuffer().then((m)=>d.decode(m))}}}).then((l)=>{pn.add(`file:${e}`,l);let c=wn[e];delete wn[e];for(let h=0,u=c.length;h<u;h++){let d=c[h];if(d.onLoad)d.onLoad(l)}}).catch((l)=>{let c=wn[e];if(c===void 0)throw this.manager.itemError(e),l;delete wn[e];for(let h=0,u=c.length;h<u;h++){let d=c[h];if(d.onError)d.onError(l)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}var Wi=new WeakMap;class yl extends On{constructor(e){super(e)}load(e,t,n,i){if(this.path!==void 0)e=this.path+e;e=this.manager.resolveURL(e);let s=this,r=pn.get(`image:${e}`);if(r!==void 0){if(r.complete===!0)s.manager.itemStart(e),setTimeout(function(){if(t)t(r);s.manager.itemEnd(e)},0);else{let h=Wi.get(r);if(h===void 0)h=[],Wi.set(r,h);h.push({onLoad:t,onError:i})}return r}let a=qi("img");function o(){if(c(),t)t(this);let h=Wi.get(this)||[];for(let u=0;u<h.length;u++){let d=h[u];if(d.onLoad)d.onLoad(this)}Wi.delete(this),s.manager.itemEnd(e)}function l(h){if(c(),i)i(h);pn.remove(`image:${e}`);let u=Wi.get(this)||[];for(let d=0;d<u.length;d++){let m=u[d];if(m.onError)m.onError(h)}Wi.delete(this),s.manager.itemError(e),s.manager.itemEnd(e)}function c(){a.removeEventListener("load",o,!1),a.removeEventListener("error",l,!1)}if(a.addEventListener("load",o,!1),a.addEventListener("error",l,!1),e.slice(0,5)!=="data:"){if(this.crossOrigin!==void 0)a.crossOrigin=this.crossOrigin}return pn.add(`image:${e}`,a),s.manager.itemStart(e),a.src=e,a}}class ba extends On{constructor(e){super(e)}load(e,t,n,i){let s=new pt,r=new yl(this.manager);return r.setCrossOrigin(this.crossOrigin),r.setPath(this.path),r.load(e,function(a){if(s.image=a,s.needsUpdate=!0,t!==void 0)t(s)},n,i),s}}class cs extends Qe{constructor(e,t=1){super();this.isLight=!0,this.type="Light",this.color=new pe(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}class Ta extends cs{constructor(e,t,n){super(e,n);this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Qe.DEFAULT_UP),this.updateMatrix(),this.groundColor=new pe(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}}var lo=new Fe,Hc=new L,Vc=new L;class Aa{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Me(512,512),this.mapType=1009,this.map=null,this.mapPass=null,this.matrix=new Fe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ks,this._frameExtents=new Me(1,1),this._viewportCount=1,this._viewports=[new ct(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;if(Hc.setFromMatrixPosition(e.matrixWorld),t.position.copy(Hc),Vc.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Vc),t.updateMatrixWorld(),lo.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(lo,t.coordinateSystem,t.reversedDepth),t.reversedDepth)n.set(0.5,0,0,0.5,0,0.5,0,0.5,0,0,1,0,0,0,0,1);else n.set(0.5,0,0,0.5,0,0.5,0,0.5,0,0,0.5,0.5,0,0,0,1);n.multiply(lo)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){if(this.map)this.map.dispose();if(this.mapPass)this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};if(this.intensity!==1)e.intensity=this.intensity;if(this.bias!==0)e.bias=this.bias;if(this.normalBias!==0)e.normalBias=this.normalBias;if(this.radius!==1)e.radius=this.radius;if(this.mapSize.x!==512||this.mapSize.y!==512)e.mapSize=this.mapSize.toArray();return e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class zh extends Aa{constructor(){super(new yt(50,1,0.5,500));this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=ci*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height*this.aspect,s=e.distance||t.far;if(n!==t.fov||i!==t.aspect||s!==t.far)t.fov=n,t.aspect=i,t.far=s,t.updateProjectionMatrix();super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class Ea extends cs{constructor(e,t,n=0,i=Math.PI/3,s=0,r=2){super(e,t);this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Qe.DEFAULT_UP),this.updateMatrix(),this.target=new Qe,this.distance=n,this.angle=i,this.penumbra=s,this.decay=r,this.map=null,this.shadow=new zh}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);if(t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture)t.object.map=this.map.toJSON(e).uuid;return t.object.shadow=this.shadow.toJSON(),t}}class kh extends Aa{constructor(){super(new yt(90,1,0.5,500));this.isPointLightShadow=!0}}class Bn extends cs{constructor(e,t,n=0,i=2){super(e,t);this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new kh}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}}class zn extends ha{constructor(e=-1,t=1,n=1,i=-1,s=0.1,r=2000){super();this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=s,this.far=r,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,s,r){if(this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2,s=n-e,r=n+e,a=i+t,o=i-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,c=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=l*this.view.offsetX,r=s+l*this.view.width,a-=c*this.view.offsetY,o=a-c*this.view.height}this.projectionMatrix.makeOrthographic(s,r,a,o,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);if(t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null)t.object.view=Object.assign({},this.view);return t}}class Gh extends Aa{constructor(){super(new zn(-5,5,5,-5,0.5,500));this.isDirectionalLightShadow=!0}}class hs extends cs{constructor(e,t){super(e,t);this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Qe.DEFAULT_UP),this.updateMatrix(),this.target=new Qe,this.shadow=new Gh}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}class ei{static extractUrlBase(e){let t=e.lastIndexOf("/");if(t===-1)return"./";return e.slice(0,t+1)}static resolveURL(e,t){if(typeof e!=="string"||e==="")return"";if(/^https?:\/\//i.test(t)&&/^\//.test(e))t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1");if(/^(https?:)?\/\//i.test(e))return e;if(/^data:.*,.*$/i.test(e))return e;if(/^blob:.*$/i.test(e))return e;return t+e}}var co=new WeakMap;class wa extends On{constructor(e){super(e);if(this.isImageBitmapLoader=!0,typeof createImageBitmap>"u")be("ImageBitmapLoader: createImageBitmap() not supported.");if(typeof fetch>"u")be("ImageBitmapLoader: fetch() not supported.");this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,i){if(e===void 0)e="";if(this.path!==void 0)e=this.path+e;e=this.manager.resolveURL(e);let s=this,r=pn.get(`image-bitmap:${e}`);if(r!==void 0){if(s.manager.itemStart(e),r.then){r.then((l)=>{if(co.has(r)===!0){if(i)i(co.get(r));s.manager.itemError(e),s.manager.itemEnd(e)}else{if(t)t(l);return s.manager.itemEnd(e),l}});return}return setTimeout(function(){if(t)t(r);s.manager.itemEnd(e)},0),r}let a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader,a.signal=typeof AbortSignal.any==="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let o=fetch(e,a).then(function(l){return l.blob()}).then(function(l){return createImageBitmap(l,Object.assign(s.options,{colorSpaceConversion:"none"}))}).then(function(l){if(pn.add(`image-bitmap:${e}`,l),t)t(l);return s.manager.itemEnd(e),l}).catch(function(l){if(i)i(l);co.set(o,l),pn.remove(`image-bitmap:${e}`),s.manager.itemError(e),s.manager.itemEnd(e)});pn.add(`image-bitmap:${e}`,o),s.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}class Ml extends yt{constructor(e=[]){super();this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}class Ca{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let t=performance.now();e=(t-this.oldTime)/1000,this.oldTime=t,this.elapsedTime+=e}return e}}var Sl="\\[\\]\\.:\\/",cf=new RegExp("["+Sl+"]","g"),bl="[^"+Sl+"]",hf="[^"+Sl.replace("\\.","")+"]",uf=/((?:WC+[\/:])*)/.source.replace("WC",bl),df=/(WCOD+)?/.source.replace("WCOD",hf),ff=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",bl),pf=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",bl),mf=new RegExp("^"+uf+df+ff+pf+"$"),gf=["material","materials","bones","map"];class Hh{constructor(e,t,n){let i=n||Ze.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,i=this._bindings[n];if(i!==void 0)i.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,s=n.length;i!==s;++i)n[i].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class Ze{constructor(e,t,n){this.path=t,this.parsedPath=n||Ze.parseTrackName(t),this.node=Ze.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){if(!(e&&e.isAnimationObjectGroup))return new Ze(e,t,n);else return new Ze.Composite(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(cf,"")}static parseTrackName(e){let t=mf.exec(e);if(t===null)throw Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){let s=n.nodeName.substring(i+1);if(gf.indexOf(s)!==-1)n.nodeName=n.nodeName.substring(0,i),n.objectName=s}if(n.propertyName===null||n.propertyName.length===0)throw Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(s){for(let r=0;r<s.length;r++){let a=s[r];if(a.name===t||a.uuid===t)return a;let o=n(a.children);if(o)return o}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,{objectName:n,propertyName:i,propertyIndex:s}=t;if(!e)e=Ze.findNode(this.rootNode,t.nodeName),this.node=e;if(this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){be("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=t.objectIndex;switch(n){case"materials":if(!e.material){Re("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Re("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Re("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let c=0;c<e.length;c++)if(e[c].name===l){l=c;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Re("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Re("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){Re("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(l!==void 0){if(e[l]===void 0){Re("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}let r=e[i];if(r===void 0){let l=t.nodeName;Re("PropertyBinding: Trying to update property for track: "+l+"."+i+" but it wasn't found.",e);return}let a=this.Versioning.None;if(this.targetObject=e,e.isMaterial===!0)a=this.Versioning.NeedsUpdate;else if(e.isObject3D===!0)a=this.Versioning.MatrixWorldNeedsUpdate;let o=this.BindingType.Direct;if(s!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){Re("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Re("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}if(e.morphTargetDictionary[s]!==void 0)s=e.morphTargetDictionary[s]}o=this.BindingType.ArrayElement,this.resolvedProperty=r,this.propertyIndex=s}else if(r.fromArray!==void 0&&r.toArray!==void 0)o=this.BindingType.HasFromToArray,this.resolvedProperty=r;else if(Array.isArray(r))o=this.BindingType.EntireArray,this.resolvedProperty=r;else this.propertyName=i;this.getValue=this.GetterByBindingType[o],this.setValue=this.SetterByBindingTypeAndVersioning[o][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}Ze.Composite=Hh;Ze.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Ze.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Ze.prototype.GetterByBindingType=[Ze.prototype._getValue_direct,Ze.prototype._getValue_array,Ze.prototype._getValue_arrayElement,Ze.prototype._getValue_toArray];Ze.prototype.SetterByBindingTypeAndVersioning=[[Ze.prototype._setValue_direct,Ze.prototype._setValue_direct_setNeedsUpdate,Ze.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Ze.prototype._setValue_array,Ze.prototype._setValue_array_setNeedsUpdate,Ze.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Ze.prototype._setValue_arrayElement,Ze.prototype._setValue_arrayElement_setNeedsUpdate,Ze.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Ze.prototype._setValue_fromArray,Ze.prototype._setValue_fromArray_setNeedsUpdate,Ze.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var T0=new Float32Array(1);function Tl(e,t,n,i){let s=_f(i);switch(n){case 1021:return e*t;case 1028:return e*t/s.components*s.byteLength;case 1029:return e*t/s.components*s.byteLength;case 1030:return e*t*2/s.components*s.byteLength;case 1031:return e*t*2/s.components*s.byteLength;case 1022:return e*t*3/s.components*s.byteLength;case 1023:return e*t*4/s.components*s.byteLength;case 1033:return e*t*4/s.components*s.byteLength;case 33776:case 33777:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case 33778:case 33779:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case 35841:case 35843:return Math.max(e,16)*Math.max(t,8)/4;case 35840:case 35842:return Math.max(e,8)*Math.max(t,8)/2;case 36196:case 37492:case 37488:case 37489:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case 37496:case 37490:case 37491:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case 37808:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case 37809:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case 37810:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case 37811:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case 37812:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case 37813:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case 37814:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case 37815:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case 37816:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case 37817:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case 37818:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case 37819:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case 37820:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case 37821:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case 36492:case 36494:case 36495:return Math.ceil(e/4)*Math.ceil(t/4)*16;case 36283:case 36284:return Math.ceil(e/4)*Math.ceil(t/4)*8;case 36285:case 36286:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function _f(e){switch(e){case 1009:case 1010:return{byteLength:1,components:1};case 1012:case 1011:case 1016:return{byteLength:2,components:1};case 1017:case 1018:return{byteLength:2,components:4};case 1014:case 1013:case 1015:return{byteLength:4,components:1};case 35902:case 35899:return{byteLength:4,components:3}}throw Error(`Unknown texture type ${e}.`)}if(typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"182"}}));if(typeof window<"u")if(window.__THREE__)be("WARNING: Multiple instances of Three.js being imported.");else window.__THREE__="182";function uu(){let e=null,t=!1,n=null,i=null;function s(r,a){n(r,a),i=e.requestAnimationFrame(s)}return{start:function(){if(t===!0)return;if(n===null)return;i=e.requestAnimationFrame(s),t=!0},stop:function(){e.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(r){n=r},setContext:function(r){e=r}}}function xf(e){let t=new WeakMap;function n(o,l){let{array:c,usage:h}=o,u=c.byteLength,d=e.createBuffer();e.bindBuffer(l,d),e.bufferData(l,c,h),o.onUploadCallback();let m;if(c instanceof Float32Array)m=e.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)m=e.HALF_FLOAT;else if(c instanceof Uint16Array)if(o.isFloat16BufferAttribute)m=e.HALF_FLOAT;else m=e.UNSIGNED_SHORT;else if(c instanceof Int16Array)m=e.SHORT;else if(c instanceof Uint32Array)m=e.UNSIGNED_INT;else if(c instanceof Int32Array)m=e.INT;else if(c instanceof Int8Array)m=e.BYTE;else if(c instanceof Uint8Array)m=e.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)m=e.UNSIGNED_BYTE;else throw Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:m,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function i(o,l,c){let{array:h,updateRanges:u}=l;if(e.bindBuffer(c,o),u.length===0)e.bufferSubData(c,0,h);else{u.sort((m,_)=>m.start-_.start);let d=0;for(let m=1;m<u.length;m++){let _=u[d],x=u[m];if(x.start<=_.start+_.count+1)_.count=Math.max(_.count,x.start+x.count-_.start);else++d,u[d]=x}u.length=d+1;for(let m=0,_=u.length;m<_;m++){let x=u[m];e.bufferSubData(c,x.start*h.BYTES_PER_ELEMENT,h,x.start,x.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){if(o.isInterleavedBufferAttribute)o=o.data;return t.get(o)}function r(o){if(o.isInterleavedBufferAttribute)o=o.data;let l=t.get(o);if(l)e.deleteBuffer(l.buffer),t.delete(o)}function a(o,l){if(o.isInterleavedBufferAttribute)o=o.data;if(o.isGLBufferAttribute){let h=t.get(o);if(!h||h.version<o.version)t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=t.get(o);if(c===void 0)t.set(o,n(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var vf=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,yf=`#ifdef USE_ALPHAHASH
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
#endif`,Mf=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Sf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,bf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Tf=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Af=`#ifdef USE_AOMAP
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
#endif`,Ef=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,wf=`#ifdef USE_BATCHING
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
#endif`,Cf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Rf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,If=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Pf=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Lf=`#ifdef USE_IRIDESCENCE
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
#endif`,Nf=`#ifdef USE_BUMPMAP
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
#endif`,Df=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Uf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Ff=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Of=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Bf=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,zf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,kf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Gf=`#if defined( USE_COLOR_ALPHA )
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
#endif`,Hf=`#define PI 3.141592653589793
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
} // validated`,Vf=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Wf=`vec3 transformedNormal = objectNormal;
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
#endif`,Xf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,qf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Yf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Zf=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Jf="gl_FragColor = linearToOutputTexel( gl_FragColor );",Kf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,$f=`#ifdef USE_ENVMAP
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
#endif`,jf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Qf=`#ifdef USE_ENVMAP
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
#endif`,ep=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,tp=`#ifdef USE_ENVMAP
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
#endif`,np=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,ip=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,sp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,rp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,ap=`#ifdef USE_GRADIENTMAP
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
}`,op=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lp=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,cp=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,hp=`uniform bool receiveShadow;
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
#endif`,up=`#ifdef USE_ENVMAP
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
#endif`,dp=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,fp=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,pp=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,mp=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,gp=`PhysicalMaterial material;
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
#endif`,_p=`uniform sampler2D dfgLUT;
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
}`,xp=`
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
#endif`,vp=`#if defined( RE_IndirectDiffuse )
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
#endif`,yp=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Mp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Sp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,bp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Tp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Ap=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Ep=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,wp=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Cp=`#if defined( USE_POINTS_UV )
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
#endif`,Rp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Ip=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Pp=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Lp=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Np=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Dp=`#ifdef USE_MORPHTARGETS
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
#endif`,Up=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Fp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Op=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Bp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,zp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,kp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Gp=`#ifdef USE_NORMALMAP
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
#endif`,Hp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Vp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Wp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Xp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,qp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Yp=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Zp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Jp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Kp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,$p=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,jp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Qp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,em=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,tm=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,nm=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,im=`float getShadowMask() {
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
}`,sm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,rm=`#ifdef USE_SKINNING
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
#endif`,am=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,om=`#ifdef USE_SKINNING
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
#endif`,lm=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,cm=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,hm=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,um=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,dm=`#ifdef USE_TRANSMISSION
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
#endif`,fm=`#ifdef USE_TRANSMISSION
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
#endif`,pm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,mm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,gm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,_m=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,xm=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,vm=`uniform sampler2D t2D;
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
}`,ym=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Mm=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Sm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,bm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Tm=`#include <common>
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
}`,Am=`#if DEPTH_PACKING == 3200
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
}`,Em=`#define DISTANCE
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
}`,wm=`#define DISTANCE
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
}`,Cm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Rm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Im=`uniform float scale;
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
}`,Pm=`uniform vec3 diffuse;
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
}`,Lm=`#include <common>
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
}`;var Nm=`uniform vec3 diffuse;
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
}`,Dm=`#define LAMBERT
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
}`,Um=`#define LAMBERT
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
}`,Fm=`#define MATCAP
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
}`,Om=`#define MATCAP
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
}`,Bm=`#define NORMAL
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
}`,zm=`#define NORMAL
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
}`,km=`#define PHONG
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
}`,Gm=`#define PHONG
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
}`,Hm=`#define STANDARD
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
}`,Vm=`#define STANDARD
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
}`,Wm=`#define TOON
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
}`,Xm=`#define TOON
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
}`,qm=`uniform float size;
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
}`,Ym=`uniform vec3 diffuse;
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
}`,Zm=`#include <common>
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
}`,Jm=`uniform vec3 color;
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
}`,Km=`uniform float rotation;
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
}`,$m=`uniform vec3 diffuse;
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
}`,Be={alphahash_fragment:vf,alphahash_pars_fragment:yf,alphamap_fragment:Mf,alphamap_pars_fragment:Sf,alphatest_fragment:bf,alphatest_pars_fragment:Tf,aomap_fragment:Af,aomap_pars_fragment:Ef,batching_pars_vertex:wf,batching_vertex:Cf,begin_vertex:Rf,beginnormal_vertex:If,bsdfs:Pf,iridescence_fragment:Lf,bumpmap_pars_fragment:Nf,clipping_planes_fragment:Df,clipping_planes_pars_fragment:Uf,clipping_planes_pars_vertex:Ff,clipping_planes_vertex:Of,color_fragment:Bf,color_pars_fragment:zf,color_pars_vertex:kf,color_vertex:Gf,common:Hf,cube_uv_reflection_fragment:Vf,defaultnormal_vertex:Wf,displacementmap_pars_vertex:Xf,displacementmap_vertex:qf,emissivemap_fragment:Yf,emissivemap_pars_fragment:Zf,colorspace_fragment:Jf,colorspace_pars_fragment:Kf,envmap_fragment:$f,envmap_common_pars_fragment:jf,envmap_pars_fragment:Qf,envmap_pars_vertex:ep,envmap_physical_pars_fragment:up,envmap_vertex:tp,fog_vertex:np,fog_pars_vertex:ip,fog_fragment:sp,fog_pars_fragment:rp,gradientmap_pars_fragment:ap,lightmap_pars_fragment:op,lights_lambert_fragment:lp,lights_lambert_pars_fragment:cp,lights_pars_begin:hp,lights_toon_fragment:dp,lights_toon_pars_fragment:fp,lights_phong_fragment:pp,lights_phong_pars_fragment:mp,lights_physical_fragment:gp,lights_physical_pars_fragment:_p,lights_fragment_begin:xp,lights_fragment_maps:vp,lights_fragment_end:yp,logdepthbuf_fragment:Mp,logdepthbuf_pars_fragment:Sp,logdepthbuf_pars_vertex:bp,logdepthbuf_vertex:Tp,map_fragment:Ap,map_pars_fragment:Ep,map_particle_fragment:wp,map_particle_pars_fragment:Cp,metalnessmap_fragment:Rp,metalnessmap_pars_fragment:Ip,morphinstance_vertex:Pp,morphcolor_vertex:Lp,morphnormal_vertex:Np,morphtarget_pars_vertex:Dp,morphtarget_vertex:Up,normal_fragment_begin:Fp,normal_fragment_maps:Op,normal_pars_fragment:Bp,normal_pars_vertex:zp,normal_vertex:kp,normalmap_pars_fragment:Gp,clearcoat_normal_fragment_begin:Hp,clearcoat_normal_fragment_maps:Vp,clearcoat_pars_fragment:Wp,iridescence_pars_fragment:Xp,opaque_fragment:qp,packing:Yp,premultiplied_alpha_fragment:Zp,project_vertex:Jp,dithering_fragment:Kp,dithering_pars_fragment:$p,roughnessmap_fragment:jp,roughnessmap_pars_fragment:Qp,shadowmap_pars_fragment:em,shadowmap_pars_vertex:tm,shadowmap_vertex:nm,shadowmask_pars_fragment:im,skinbase_vertex:sm,skinning_pars_vertex:rm,skinning_vertex:am,skinnormal_vertex:om,specularmap_fragment:lm,specularmap_pars_fragment:cm,tonemapping_fragment:hm,tonemapping_pars_fragment:um,transmission_fragment:dm,transmission_pars_fragment:fm,uv_pars_fragment:pm,uv_pars_vertex:mm,uv_vertex:gm,worldpos_vertex:_m,background_vert:xm,background_frag:vm,backgroundCube_vert:ym,backgroundCube_frag:Mm,cube_vert:Sm,cube_frag:bm,depth_vert:Tm,depth_frag:Am,distance_vert:Em,distance_frag:wm,equirect_vert:Cm,equirect_frag:Rm,linedashed_vert:Im,linedashed_frag:Pm,meshbasic_vert:Lm,meshbasic_frag:Nm,meshlambert_vert:Dm,meshlambert_frag:Um,meshmatcap_vert:Fm,meshmatcap_frag:Om,meshnormal_vert:Bm,meshnormal_frag:zm,meshphong_vert:km,meshphong_frag:Gm,meshphysical_vert:Hm,meshphysical_frag:Vm,meshtoon_vert:Wm,meshtoon_frag:Xm,points_vert:qm,points_frag:Ym,shadow_vert:Zm,shadow_frag:Jm,sprite_vert:Km,sprite_frag:$m},ce={common:{diffuse:{value:new pe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Oe},alphaMap:{value:null},alphaMapTransform:{value:new Oe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Oe}},envmap:{envMap:{value:null},envMapRotation:{value:new Oe},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:0.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Oe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Oe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Oe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Oe},normalScale:{value:new Me(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Oe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Oe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Oe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Oe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:0.00025},fogNear:{value:1},fogFar:{value:2000},fogColor:{value:new pe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new pe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Oe},alphaTest:{value:0},uvTransform:{value:new Oe}},sprite:{diffuse:{value:new pe(16777215)},opacity:{value:1},center:{value:new Me(0.5,0.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Oe},alphaMap:{value:null},alphaMapTransform:{value:new Oe},alphaTest:{value:0}}},xn={basic:{uniforms:Pt([ce.common,ce.specularmap,ce.envmap,ce.aomap,ce.lightmap,ce.fog]),vertexShader:Be.meshbasic_vert,fragmentShader:Be.meshbasic_frag},lambert:{uniforms:Pt([ce.common,ce.specularmap,ce.envmap,ce.aomap,ce.lightmap,ce.emissivemap,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.fog,ce.lights,{emissive:{value:new pe(0)}}]),vertexShader:Be.meshlambert_vert,fragmentShader:Be.meshlambert_frag},phong:{uniforms:Pt([ce.common,ce.specularmap,ce.envmap,ce.aomap,ce.lightmap,ce.emissivemap,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.fog,ce.lights,{emissive:{value:new pe(0)},specular:{value:new pe(1118481)},shininess:{value:30}}]),vertexShader:Be.meshphong_vert,fragmentShader:Be.meshphong_frag},standard:{uniforms:Pt([ce.common,ce.envmap,ce.aomap,ce.lightmap,ce.emissivemap,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.roughnessmap,ce.metalnessmap,ce.fog,ce.lights,{emissive:{value:new pe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Be.meshphysical_vert,fragmentShader:Be.meshphysical_frag},toon:{uniforms:Pt([ce.common,ce.aomap,ce.lightmap,ce.emissivemap,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.gradientmap,ce.fog,ce.lights,{emissive:{value:new pe(0)}}]),vertexShader:Be.meshtoon_vert,fragmentShader:Be.meshtoon_frag},matcap:{uniforms:Pt([ce.common,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.fog,{matcap:{value:null}}]),vertexShader:Be.meshmatcap_vert,fragmentShader:Be.meshmatcap_frag},points:{uniforms:Pt([ce.points,ce.fog]),vertexShader:Be.points_vert,fragmentShader:Be.points_frag},dashed:{uniforms:Pt([ce.common,ce.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Be.linedashed_vert,fragmentShader:Be.linedashed_frag},depth:{uniforms:Pt([ce.common,ce.displacementmap]),vertexShader:Be.depth_vert,fragmentShader:Be.depth_frag},normal:{uniforms:Pt([ce.common,ce.bumpmap,ce.normalmap,ce.displacementmap,{opacity:{value:1}}]),vertexShader:Be.meshnormal_vert,fragmentShader:Be.meshnormal_frag},sprite:{uniforms:Pt([ce.sprite,ce.fog]),vertexShader:Be.sprite_vert,fragmentShader:Be.sprite_frag},background:{uniforms:{uvTransform:{value:new Oe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Be.background_vert,fragmentShader:Be.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Oe}},vertexShader:Be.backgroundCube_vert,fragmentShader:Be.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Be.cube_vert,fragmentShader:Be.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Be.equirect_vert,fragmentShader:Be.equirect_frag},distance:{uniforms:Pt([ce.common,ce.displacementmap,{referencePosition:{value:new L},nearDistance:{value:1},farDistance:{value:1000}}]),vertexShader:Be.distance_vert,fragmentShader:Be.distance_frag},shadow:{uniforms:Pt([ce.lights,ce.fog,{color:{value:new pe(0)},opacity:{value:1}}]),vertexShader:Be.shadow_vert,fragmentShader:Be.shadow_frag}};xn.physical={uniforms:Pt([xn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Oe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Oe},clearcoatNormalScale:{value:new Me(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Oe},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Oe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Oe},sheen:{value:0},sheenColor:{value:new pe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Oe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Oe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Oe},transmissionSamplerSize:{value:new Me},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Oe},attenuationDistance:{value:0},attenuationColor:{value:new pe(0)},specularColor:{value:new pe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Oe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Oe},anisotropyVector:{value:new Me},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Oe}}]),vertexShader:Be.meshphysical_vert,fragmentShader:Be.meshphysical_frag};var Ra={r:0,b:0,g:0},yi=new $t,jm=new Fe;function Qm(e,t,n,i,s,r,a){let o=new pe(0),l=r===!0?0:1,c,h,u=null,d=0,m=null;function _(M){let b=M.isScene===!0?M.background:null;if(b&&b.isTexture)b=(M.backgroundBlurriness>0?n:t).get(b);return b}function x(M){let b=!1,R=_(M);if(R===null)p(o,l);else if(R&&R.isColor)p(R,1),b=!0;let E=e.xr.getEnvironmentBlendMode();if(E==="additive")i.buffers.color.setClear(0,0,0,1,a);else if(E==="alpha-blend")i.buffers.color.setClear(0,0,0,0,a);if(e.autoClear||b)i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil)}function f(M,b){let R=_(b);if(R&&(R.isCubeTexture||R.mapping===ks)){if(h===void 0)h=new nt(new Kn(1,1,1),new vt({name:"BackgroundCubeMaterial",uniforms:xi(xn.backgroundCube.uniforms),vertexShader:xn.backgroundCube.vertexShader,fragmentShader:xn.backgroundCube.fragmentShader,side:Dt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(E,P,N){this.matrixWorld.copyPosition(N.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h);if(yi.copy(b.backgroundRotation),yi.x*=-1,yi.y*=-1,yi.z*=-1,R.isCubeTexture&&R.isRenderTargetTexture===!1)yi.y*=-1,yi.z*=-1;if(h.material.uniforms.envMap.value=R,h.material.uniforms.flipEnvMap.value=R.isCubeTexture&&R.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(jm.makeRotationFromEuler(yi)),h.material.toneMapped=Ge.getTransfer(R.colorSpace)!==et,u!==R||d!==R.version||m!==e.toneMapping)h.material.needsUpdate=!0,u=R,d=R.version,m=e.toneMapping;h.layers.enableAll(),M.unshift(h,h.geometry,h.material,0,0,null)}else if(R&&R.isTexture){if(c===void 0)c=new nt(new Qs(2,2),new vt({name:"BackgroundMaterial",uniforms:xi(xn.background.uniforms),vertexShader:xn.background.vertexShader,fragmentShader:xn.background.fragmentShader,side:Yn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c);if(c.material.uniforms.t2D.value=R,c.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,c.material.toneMapped=Ge.getTransfer(R.colorSpace)!==et,R.matrixAutoUpdate===!0)R.updateMatrix();if(c.material.uniforms.uvTransform.value.copy(R.matrix),u!==R||d!==R.version||m!==e.toneMapping)c.material.needsUpdate=!0,u=R,d=R.version,m=e.toneMapping;c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null)}}function p(M,b){M.getRGB(Ra,hl(e)),i.buffers.color.setClear(Ra.r,Ra.g,Ra.b,b,a)}function A(){if(h!==void 0)h.geometry.dispose(),h.material.dispose(),h=void 0;if(c!==void 0)c.geometry.dispose(),c.material.dispose(),c=void 0}return{getClearColor:function(){return o},setClearColor:function(M,b=1){o.set(M),l=b,p(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(M){l=M,p(o,l)},render:x,addToRenderList:f,dispose:A}}function eg(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),i={},s=d(null),r=s,a=!1;function o(S,C,k,X,G){let K=!1,H=u(X,k,C);if(r!==H)r=H,c(r.object);if(K=m(S,X,k,G),K)_(S,X,k,G);if(G!==null)t.update(G,e.ELEMENT_ARRAY_BUFFER);if(K||a){if(a=!1,b(S,C,k,X),G!==null)e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(G).buffer)}}function l(){return e.createVertexArray()}function c(S){return e.bindVertexArray(S)}function h(S){return e.deleteVertexArray(S)}function u(S,C,k){let X=k.wireframe===!0,G=i[S.id];if(G===void 0)G={},i[S.id]=G;let K=G[C.id];if(K===void 0)K={},G[C.id]=K;let H=K[X];if(H===void 0)H=d(l()),K[X]=H;return H}function d(S){let C=[],k=[],X=[];for(let G=0;G<n;G++)C[G]=0,k[G]=0,X[G]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:C,enabledAttributes:k,attributeDivisors:X,object:S,attributes:{},index:null}}function m(S,C,k,X){let G=r.attributes,K=C.attributes,H=0,O=k.getAttributes();for(let Y in O)if(O[Y].location>=0){let ie=G[Y],ge=K[Y];if(ge===void 0){if(Y==="instanceMatrix"&&S.instanceMatrix)ge=S.instanceMatrix;if(Y==="instanceColor"&&S.instanceColor)ge=S.instanceColor}if(ie===void 0)return!0;if(ie.attribute!==ge)return!0;if(ge&&ie.data!==ge.data)return!0;H++}if(r.attributesNum!==H)return!0;if(r.index!==X)return!0;return!1}function _(S,C,k,X){let G={},K=C.attributes,H=0,O=k.getAttributes();for(let Y in O)if(O[Y].location>=0){let ie=K[Y];if(ie===void 0){if(Y==="instanceMatrix"&&S.instanceMatrix)ie=S.instanceMatrix;if(Y==="instanceColor"&&S.instanceColor)ie=S.instanceColor}let ge={};if(ge.attribute=ie,ie&&ie.data)ge.data=ie.data;G[Y]=ge,H++}r.attributes=G,r.attributesNum=H,r.index=X}function x(){let S=r.newAttributes;for(let C=0,k=S.length;C<k;C++)S[C]=0}function f(S){p(S,0)}function p(S,C){let k=r.newAttributes,X=r.enabledAttributes,G=r.attributeDivisors;if(k[S]=1,X[S]===0)e.enableVertexAttribArray(S),X[S]=1;if(G[S]!==C)e.vertexAttribDivisor(S,C),G[S]=C}function A(){let S=r.newAttributes,C=r.enabledAttributes;for(let k=0,X=C.length;k<X;k++)if(C[k]!==S[k])e.disableVertexAttribArray(k),C[k]=0}function M(S,C,k,X,G,K,H){if(H===!0)e.vertexAttribIPointer(S,C,k,G,K);else e.vertexAttribPointer(S,C,k,X,G,K)}function b(S,C,k,X){x();let G=X.attributes,K=k.getAttributes(),H=C.defaultAttributeValues;for(let O in K){let Y=K[O];if(Y.location>=0){let te=G[O];if(te===void 0){if(O==="instanceMatrix"&&S.instanceMatrix)te=S.instanceMatrix;if(O==="instanceColor"&&S.instanceColor)te=S.instanceColor}if(te!==void 0){let ie=te.normalized,ge=te.itemSize,Ue=t.get(te);if(Ue===void 0)continue;let{buffer:ut,type:it,bytesPerElement:Z}=Ue,le=it===e.INT||it===e.UNSIGNED_INT||te.gpuType===mo;if(te.isInterleavedBufferAttribute){let re=te.data,Ce=re.stride,Ie=te.offset;if(re.isInstancedInterleavedBuffer){for(let Ne=0;Ne<Y.locationSize;Ne++)p(Y.location+Ne,re.meshPerAttribute);if(S.isInstancedMesh!==!0&&X._maxInstanceCount===void 0)X._maxInstanceCount=re.meshPerAttribute*re.count}else for(let Ne=0;Ne<Y.locationSize;Ne++)f(Y.location+Ne);e.bindBuffer(e.ARRAY_BUFFER,ut);for(let Ne=0;Ne<Y.locationSize;Ne++)M(Y.location+Ne,ge/Y.locationSize,it,ie,Ce*Z,(Ie+ge/Y.locationSize*Ne)*Z,le)}else{if(te.isInstancedBufferAttribute){for(let re=0;re<Y.locationSize;re++)p(Y.location+re,te.meshPerAttribute);if(S.isInstancedMesh!==!0&&X._maxInstanceCount===void 0)X._maxInstanceCount=te.meshPerAttribute*te.count}else for(let re=0;re<Y.locationSize;re++)f(Y.location+re);e.bindBuffer(e.ARRAY_BUFFER,ut);for(let re=0;re<Y.locationSize;re++)M(Y.location+re,ge/Y.locationSize,it,ie,ge*Z,ge/Y.locationSize*re*Z,le)}}else if(H!==void 0){let ie=H[O];if(ie!==void 0)switch(ie.length){case 2:e.vertexAttrib2fv(Y.location,ie);break;case 3:e.vertexAttrib3fv(Y.location,ie);break;case 4:e.vertexAttrib4fv(Y.location,ie);break;default:e.vertexAttrib1fv(Y.location,ie)}}}}A()}function R(){N();for(let S in i){let C=i[S];for(let k in C){let X=C[k];for(let G in X)h(X[G].object),delete X[G];delete C[k]}delete i[S]}}function E(S){if(i[S.id]===void 0)return;let C=i[S.id];for(let k in C){let X=C[k];for(let G in X)h(X[G].object),delete X[G];delete C[k]}delete i[S.id]}function P(S){for(let C in i){let k=i[C];if(k[S.id]===void 0)continue;let X=k[S.id];for(let G in X)h(X[G].object),delete X[G];delete k[S.id]}}function N(){if(T(),a=!0,r===s)return;r=s,c(r.object)}function T(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:N,resetDefaultState:T,dispose:R,releaseStatesOfGeometry:E,releaseStatesOfProgram:P,initAttributes:x,enableAttribute:f,disableUnusedAttributes:A}}function tg(e,t,n){let i;function s(c){i=c}function r(c,h){e.drawArrays(i,c,h),n.update(h,i,1)}function a(c,h,u){if(u===0)return;e.drawArraysInstanced(i,c,h,u),n.update(h,i,u)}function o(c,h,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,h,0,u);let m=0;for(let _=0;_<u;_++)m+=h[_];n.update(m,i,1)}function l(c,h,u,d){if(u===0)return;let m=t.get("WEBGL_multi_draw");if(m===null)for(let _=0;_<c.length;_++)a(c[_],h[_],d[_]);else{m.multiDrawArraysInstancedWEBGL(i,c,0,h,0,d,0,u);let _=0;for(let x=0;x<u;x++)_+=h[x]*d[x];n.update(_,i,1)}}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function ng(e,t,n,i){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let P=t.get("EXT_texture_filter_anisotropic");s=e.getParameter(P.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(P){if(P!==mn&&i.convert(P)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))return!1;return!0}function o(P){let N=P===Ut&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));if(P!==un&&i.convert(P)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&P!==Nn&&!N)return!1;return!0}function l(P){if(P==="highp"){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return"highp";P="mediump"}if(P==="mediump"){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0)return"mediump"}return"lowp"}let c=n.precision!==void 0?n.precision:"highp",h=l(c);if(h!==c)be("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h;let u=n.logarithmicDepthBuffer===!0,d=n.reversedDepthBuffer===!0&&t.has("EXT_clip_control"),m=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),_=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=e.getParameter(e.MAX_TEXTURE_SIZE),f=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),p=e.getParameter(e.MAX_VERTEX_ATTRIBS),A=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),M=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),R=e.getParameter(e.MAX_SAMPLES),E=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:m,maxVertexTextures:_,maxTextureSize:x,maxCubemapSize:f,maxAttributes:p,maxVertexUniforms:A,maxVaryings:M,maxFragmentUniforms:b,maxSamples:R,samples:E}}function ig(e){let t=this,n=null,i=0,s=!1,r=!1,a=new Cn,o=new Oe,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let m=u.length!==0||d||i!==0||s;return s=d,i=u.length,m},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){n=h(u,d,0)},this.setState=function(u,d,m){let{clippingPlanes:_,clipIntersection:x,clipShadows:f}=u,p=e.get(u);if(!s||_===null||_.length===0||r&&!f)if(r)h(null);else c();else{let A=r?0:i,M=A*4,b=p.clippingState||null;l.value=b,b=h(_,d,M,m);for(let R=0;R!==M;++R)b[R]=n[R];p.clippingState=b,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=A}};function c(){if(l.value!==n)l.value=n,l.needsUpdate=i>0;t.numPlanes=i,t.numIntersection=0}function h(u,d,m,_){let x=u!==null?u.length:0,f=null;if(x!==0){if(f=l.value,_!==!0||f===null){let p=m+x*4,A=d.matrixWorldInverse;if(o.getNormalMatrix(A),f===null||f.length<p)f=new Float32Array(p);for(let M=0,b=m;M!==x;++M,b+=4)a.copy(u[M]).applyMatrix4(A,o),a.normal.toArray(f,b),f[b+3]=a.constant}l.value=f,l.needsUpdate=!0}return t.numPlanes=x,t.numIntersection=0,f}}function sg(e){let t=new WeakMap;function n(a,o){if(o===Jr)a.mapping=$i;else if(o===Kr)a.mapping=fi;return a}function i(a){if(a&&a.isTexture){let o=a.mapping;if(o===Jr||o===Kr)if(t.has(a)){let l=t.get(a).texture;return n(l,a.mapping)}else{let l=a.image;if(l&&l.height>0){let c=new da(l.height);return c.fromEquirectangularTexture(e,a),t.set(a,c),a.addEventListener("dispose",s),n(c.texture,a.mapping)}else return null}}return a}function s(a){let o=a.target;o.removeEventListener("dispose",s);let l=t.get(o);if(l!==void 0)t.delete(o),l.dispose()}function r(){t=new WeakMap}return{get:i,dispose:r}}var ti=4,Vh=[0.125,0.215,0.35,0.446,0.526,0.582],Si=20,rg=256,ir=new zn,Wh=new pe,Al=null,El=0,wl=0,Cl=!1,ag=new L;class or{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=0.1,i=100,s={}){let{size:r=256,position:a=ag}=s;Al=this._renderer.getRenderTarget(),El=this._renderer.getActiveCubeFace(),wl=this._renderer.getActiveMipmapLevel(),Cl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(r);let o=this._allocateTargets();if(o.depthBuffer=!0,this._sceneToCubeUV(e,n,i,o,a),t>0)this._blur(o,0,0,t);return this._applyPMREM(o),this._cleanup(o),o}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){if(this._cubemapMaterial===null)this._cubemapMaterial=Yh(),this._compileMaterial(this._cubemapMaterial)}compileEquirectangularShader(){if(this._equirectMaterial===null)this._equirectMaterial=qh(),this._compileMaterial(this._equirectMaterial)}dispose(){if(this._dispose(),this._cubemapMaterial!==null)this._cubemapMaterial.dispose();if(this._equirectMaterial!==null)this._equirectMaterial.dispose();if(this._backgroundBox!==null)this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){if(this._blurMaterial!==null)this._blurMaterial.dispose();if(this._ggxMaterial!==null)this._ggxMaterial.dispose();if(this._pingPongRenderTarget!==null)this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Al,El,wl),this._renderer.xr.enabled=Cl,e.scissorTest=!1,us(e,0,0,e.width,e.height)}_fromTexture(e,t){if(e.mapping===$i||e.mapping===fi)this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width);else this._setSize(e.image.width/4);Al=this._renderer.getRenderTarget(),El=this._renderer.getActiveCubeFace(),wl=this._renderer.getActiveMipmapLevel(),Cl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Ct,minFilter:Ct,generateMipmaps:!1,type:Ut,format:mn,colorSpace:Ft,depthBuffer:!1},i=Xh(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){if(this._pingPongRenderTarget!==null)this._dispose();this._pingPongRenderTarget=Xh(e,t,n);let{_lodMax:s}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=og(s)),this._blurMaterial=cg(s,e,t),this._ggxMaterial=lg(s,e,t)}return i}_compileMaterial(e){let t=new nt(new St,e);this._renderer.compile(t,ir)}_sceneToCubeUV(e,t,n,i,s){let o=new yt(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,{autoClear:u,toneMapping:d}=h;if(h.getClearColor(Wh),h.toneMapping=cn,h.autoClear=!1,h.state.buffers.depth.getReversed())h.setRenderTarget(i),h.clearDepth(),h.setRenderTarget(null);if(this._backgroundBox===null)this._backgroundBox=new nt(new Kn,new kt({name:"PMREM.Background",side:Dt,depthWrite:!1,depthTest:!1}));let _=this._backgroundBox,x=_.material,f=!1,p=e.background;if(p){if(p.isColor)x.color.copy(p),e.background=null,f=!0}else x.color.copy(Wh),f=!0;for(let A=0;A<6;A++){let M=A%3;if(M===0)o.up.set(0,l[A],0),o.position.set(s.x,s.y,s.z),o.lookAt(s.x+c[A],s.y,s.z);else if(M===1)o.up.set(0,0,l[A]),o.position.set(s.x,s.y,s.z),o.lookAt(s.x,s.y+c[A],s.z);else o.up.set(0,l[A],0),o.position.set(s.x,s.y,s.z),o.lookAt(s.x,s.y,s.z+c[A]);let b=this._cubeSize;if(us(i,M*b,A>2?b:0,b,b),h.setRenderTarget(i),f)h.render(_,o);h.render(e,o)}h.toneMapping=d,h.autoClear=u,e.background=p}_textureToCubeUV(e,t){let n=this._renderer,i=e.mapping===$i||e.mapping===fi;if(i){if(this._cubemapMaterial===null)this._cubemapMaterial=Yh();this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1}else if(this._equirectMaterial===null)this._equirectMaterial=qh();let s=i?this._cubemapMaterial:this._equirectMaterial,r=this._lodMeshes[0];r.material=s;let a=s.uniforms;a.envMap.value=e;let o=this._cubeSize;us(t,0,0,3*o,2*o),n.setRenderTarget(t),n.render(r,ir)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let i=this._lodMeshes.length;for(let s=1;s<i;s++)this._applyGGXFilter(e,s-1,s);t.autoClear=n}_applyGGXFilter(e,t,n){let i=this._renderer,s=this._pingPongRenderTarget,r=this._ggxMaterial,a=this._lodMeshes[n];a.material=r;let o=r.uniforms,l=n/(this._lodMeshes.length-1),c=t/(this._lodMeshes.length-1),h=Math.sqrt(l*l-c*c),u=0+l*1.25,d=h*u,{_lodMax:m}=this,_=this._sizeLods[n],x=3*_*(n>m-ti?n-m+ti:0),f=4*(this._cubeSize-_);o.envMap.value=e.texture,o.roughness.value=d,o.mipInt.value=m-t,us(s,x,f,3*_,2*_),i.setRenderTarget(s),i.render(a,ir),o.envMap.value=s.texture,o.roughness.value=0,o.mipInt.value=m-n,us(e,x,f,3*_,2*_),i.setRenderTarget(e),i.render(a,ir)}_blur(e,t,n,i,s){let r=this._pingPongRenderTarget;this._halfBlur(e,r,t,n,i,"latitudinal",s),this._halfBlur(r,e,n,n,i,"longitudinal",s)}_halfBlur(e,t,n,i,s,r,a){let o=this._renderer,l=this._blurMaterial;if(r!=="latitudinal"&&r!=="longitudinal")Re("blur direction must be either latitudinal or longitudinal!");let c=3,h=this._lodMeshes[i];h.material=l;let u=l.uniforms,d=this._sizeLods[n]-1,m=isFinite(s)?Math.PI/(2*d):2*Math.PI/(2*Si-1),_=s/m,x=isFinite(s)?1+Math.floor(c*_):Si;if(x>Si)be(`sigmaRadians, ${s}, is too large and will clip, as it requested ${x} samples when the maximum is set to ${Si}`);let f=[],p=0;for(let E=0;E<Si;++E){let P=E/_,N=Math.exp(-P*P/2);if(f.push(N),E===0)p+=N;else if(E<x)p+=2*N}for(let E=0;E<f.length;E++)f[E]=f[E]/p;if(u.envMap.value=e.texture,u.samples.value=x,u.weights.value=f,u.latitudinal.value=r==="latitudinal",a)u.poleAxis.value=a;let{_lodMax:A}=this;u.dTheta.value=m,u.mipInt.value=A-n;let M=this._sizeLods[i],b=3*M*(i>A-ti?i-A+ti:0),R=4*(this._cubeSize-M);us(t,b,R,3*M,2*M),o.setRenderTarget(t),o.render(h,ir)}}function og(e){let t=[],n=[],i=[],s=e,r=e-ti+1+Vh.length;for(let a=0;a<r;a++){let o=Math.pow(2,s);t.push(o);let l=1/o;if(a>e-ti)l=Vh[a-e+ti-1];else if(a===0)l=0;n.push(l);let c=1/(o-2),h=-c,u=1+c,d=[h,h,u,h,u,u,h,h,u,u,h,u],m=6,_=6,x=3,f=2,p=1,A=new Float32Array(x*_*m),M=new Float32Array(f*_*m),b=new Float32Array(p*_*m);for(let E=0;E<m;E++){let P=E%3*2/3-1,N=E>2?0:-1,T=[P,N,0,P+0.6666666666666666,N,0,P+0.6666666666666666,N+1,0,P,N,0,P+0.6666666666666666,N+1,0,P,N+1,0];A.set(T,x*_*E),M.set(d,f*_*E);let S=[E,E,E,E,E,E];b.set(S,p*_*E)}let R=new St;if(R.setAttribute("position",new Mt(A,x)),R.setAttribute("uv",new Mt(M,f)),R.setAttribute("faceIndex",new Mt(b,p)),i.push(new nt(R,null)),s>ti)s--}return{lodMeshes:i,sizeLods:t,sigmas:n}}function Xh(e,t,n){let i=new Et(e,t,n);return i.texture.mapping=ks,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function us(e,t,n,i,s){e.viewport.set(t,n,i,s),e.scissor.set(t,n,i,s)}function lg(e,t,n){return new vt({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:rg,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Pa(),fragmentShader:`

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
		`,blending:ln,depthTest:!1,depthWrite:!1})}function cg(e,t,n){let i=new Float32Array(Si),s=new L(0,1,0);return new vt({name:"SphericalGaussianBlur",defines:{n:Si,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Pa(),fragmentShader:`

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
		`,blending:ln,depthTest:!1,depthWrite:!1})}function qh(){return new vt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Pa(),fragmentShader:`

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
		`,blending:ln,depthTest:!1,depthWrite:!1})}function Yh(){return new vt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Pa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:ln,depthTest:!1,depthWrite:!1})}function Pa(){return`

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
	`}function hg(e){let t=new WeakMap,n=null;function i(o){if(o&&o.isTexture){let l=o.mapping,c=l===Jr||l===Kr,h=l===$i||l===fi;if(c||h){let u=t.get(o),d=u!==void 0?u.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==d){if(n===null)n=new or(e);return u=c?n.fromEquirectangular(o,u):n.fromCubemap(o,u),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),u.texture}else if(u!==void 0)return u.texture;else{let m=o.image;if(c&&m&&m.height>0||h&&m&&s(m)){if(n===null)n=new or(e);return u=c?n.fromEquirectangular(o):n.fromCubemap(o),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),o.addEventListener("dispose",r),u.texture}else return null}}}return o}function s(o){let l=0,c=6;for(let h=0;h<c;h++)if(o[h]!==void 0)l++;return l===c}function r(o){let l=o.target;l.removeEventListener("dispose",r);let c=t.get(l);if(c!==void 0)t.delete(l),c.dispose()}function a(){if(t=new WeakMap,n!==null)n.dispose(),n=null}return{get:i,dispose:a}}function ug(e){let t={};function n(i){if(t[i]!==void 0)return t[i];let s=e.getExtension(i);return t[i]=s,s}return{has:function(i){return n(i)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(i){let s=n(i);if(s===null)Zi("WebGLRenderer: "+i+" extension not supported.");return s}}}function dg(e,t,n,i){let s={},r=new WeakMap;function a(u){let d=u.target;if(d.index!==null)t.remove(d.index);for(let _ in d.attributes)t.remove(d.attributes[_]);d.removeEventListener("dispose",a),delete s[d.id];let m=r.get(d);if(m)t.remove(m),r.delete(d);if(i.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0)delete d._maxInstanceCount;n.memory.geometries--}function o(u,d){if(s[d.id]===!0)return d;return d.addEventListener("dispose",a),s[d.id]=!0,n.memory.geometries++,d}function l(u){let d=u.attributes;for(let m in d)t.update(d[m],e.ARRAY_BUFFER)}function c(u){let d=[],m=u.index,_=u.attributes.position,x=0;if(m!==null){let A=m.array;x=m.version;for(let M=0,b=A.length;M<b;M+=3){let R=A[M+0],E=A[M+1],P=A[M+2];d.push(R,E,E,P,P,R)}}else if(_!==void 0){let A=_.array;x=_.version;for(let M=0,b=A.length/3-1;M<b;M+=3){let R=M+0,E=M+1,P=M+2;d.push(R,E,E,P,P,R)}}else return;let f=new((sl(d))?ca:la)(d,1);f.version=x;let p=r.get(u);if(p)t.remove(p);r.set(u,f)}function h(u){let d=r.get(u);if(d){let m=u.index;if(m!==null){if(d.version<m.version)c(u)}}else c(u);return r.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function fg(e,t,n){let i;function s(d){i=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function l(d,m){e.drawElements(i,m,r,d*a),n.update(m,i,1)}function c(d,m,_){if(_===0)return;e.drawElementsInstanced(i,m,r,d*a,_),n.update(m,i,_)}function h(d,m,_){if(_===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,m,0,r,d,0,_);let f=0;for(let p=0;p<_;p++)f+=m[p];n.update(f,i,1)}function u(d,m,_,x){if(_===0)return;let f=t.get("WEBGL_multi_draw");if(f===null)for(let p=0;p<d.length;p++)c(d[p]/a,m[p],x[p]);else{f.multiDrawElementsInstancedWEBGL(i,m,0,r,d,0,x,0,_);let p=0;for(let A=0;A<_;A++)p+=m[A]*x[A];n.update(p,i,1)}}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function pg(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,a,o){switch(n.calls++,a){case e.TRIANGLES:n.triangles+=o*(r/3);break;case e.LINES:n.lines+=o*(r/2);break;case e.LINE_STRIP:n.lines+=o*(r-1);break;case e.LINE_LOOP:n.lines+=o*r;break;case e.POINTS:n.points+=o*r;break;default:Re("WebGLInfo: Unknown draw mode:",a);break}}function s(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:s,update:i}}function mg(e,t,n){let i=new WeakMap,s=new ct;function r(a,o,l){let c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0,d=i.get(o);if(d===void 0||d.count!==u){let T=function(){P.dispose(),i.delete(o),o.removeEventListener("dispose",T)};if(d!==void 0)d.texture.dispose();let m=o.morphAttributes.position!==void 0,_=o.morphAttributes.normal!==void 0,x=o.morphAttributes.color!==void 0,f=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],A=o.morphAttributes.color||[],M=0;if(m===!0)M=1;if(_===!0)M=2;if(x===!0)M=3;let b=o.attributes.position.count*M,R=1;if(b>t.maxTextureSize)R=Math.ceil(b/t.maxTextureSize),b=t.maxTextureSize;let E=new Float32Array(b*R*4*u),P=new aa(E,b,R,u);P.type=Nn,P.needsUpdate=!0;let N=M*4;for(let S=0;S<u;S++){let C=f[S],k=p[S],X=A[S],G=b*R*4*S;for(let K=0;K<C.count;K++){let H=K*N;if(m===!0)s.fromBufferAttribute(C,K),E[G+H+0]=s.x,E[G+H+1]=s.y,E[G+H+2]=s.z,E[G+H+3]=0;if(_===!0)s.fromBufferAttribute(k,K),E[G+H+4]=s.x,E[G+H+5]=s.y,E[G+H+6]=s.z,E[G+H+7]=0;if(x===!0)s.fromBufferAttribute(X,K),E[G+H+8]=s.x,E[G+H+9]=s.y,E[G+H+10]=s.z,E[G+H+11]=X.itemSize===4?s.w:1}}d={count:u,texture:P,size:new Me(b,R)},i.set(o,d),o.addEventListener("dispose",T)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(e,"morphTexture",a.morphTexture,n);else{let m=0;for(let x=0;x<c.length;x++)m+=c[x];let _=o.morphTargetsRelative?1:1-m;l.getUniforms().setValue(e,"morphTargetBaseInfluence",_),l.getUniforms().setValue(e,"morphTargetInfluences",c)}l.getUniforms().setValue(e,"morphTargetsTexture",d.texture,n),l.getUniforms().setValue(e,"morphTargetsTextureSize",d.size)}return{update:r}}function gg(e,t,n,i){let s=new WeakMap;function r(l){let c=i.render.frame,h=l.geometry,u=t.get(l,h);if(s.get(u)!==c)t.update(u),s.set(u,c);if(l.isInstancedMesh){if(l.hasEventListener("dispose",o)===!1)l.addEventListener("dispose",o);if(s.get(l)!==c){if(n.update(l.instanceMatrix,e.ARRAY_BUFFER),l.instanceColor!==null)n.update(l.instanceColor,e.ARRAY_BUFFER);s.set(l,c)}}if(l.isSkinnedMesh){let d=l.skeleton;if(s.get(d)!==c)d.update(),s.set(d,c)}return u}function a(){s=new WeakMap}function o(l){let c=l.target;if(c.removeEventListener("dispose",o),n.remove(c.instanceMatrix),c.instanceColor!==null)n.remove(c.instanceColor)}return{update:r,dispose:a}}var _g={[Ds]:"LINEAR_TONE_MAPPING",[Us]:"REINHARD_TONE_MAPPING",[Fs]:"CINEON_TONE_MAPPING",[di]:"ACES_FILMIC_TONE_MAPPING",[Bs]:"AGX_TONE_MAPPING",[zs]:"NEUTRAL_TONE_MAPPING",[Os]:"CUSTOM_TONE_MAPPING"};function xg(e,t,n,i,s){let r=new Et(t,n,{type:e,depthBuffer:i,stencilBuffer:s}),a=new Et(t,n,{type:Ut,depthBuffer:!1,stencilBuffer:!1}),o=new St;o.setAttribute("position",new xt([-1,3,0,-1,-1,0,3,-1,0],3)),o.setAttribute("uv",new xt([0,2,0,0,2,0],2));let l=new tr({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),c=new nt(o,l),h=new zn(-1,1,1,-1,0,1),u=null,d=null,m=!1,_,x=null,f=[],p=!1;this.setSize=function(A,M){r.setSize(A,M),a.setSize(A,M);for(let b=0;b<f.length;b++){let R=f[b];if(R.setSize)R.setSize(A,M)}},this.setEffects=function(A){f=A,p=f.length>0&&f[0].isRenderPass===!0;let{width:M,height:b}=r;for(let R=0;R<f.length;R++){let E=f[R];if(E.setSize)E.setSize(M,b)}},this.begin=function(A,M){if(m)return!1;if(A.toneMapping===cn&&f.length===0)return!1;if(x=M,M!==null){let{width:b,height:R}=M;if(r.width!==b||r.height!==R)this.setSize(b,R)}if(p===!1)A.setRenderTarget(r);return _=A.toneMapping,A.toneMapping=cn,!0},this.hasRenderPass=function(){return p},this.end=function(A,M){A.toneMapping=_,m=!0;let b=r,R=a;for(let E=0;E<f.length;E++){let P=f[E];if(P.enabled===!1)continue;if(P.render(A,R,b,M),P.needsSwap!==!1){let N=b;b=R,R=N}}if(u!==A.outputColorSpace||d!==A.toneMapping){if(u=A.outputColorSpace,d=A.toneMapping,l.defines={},Ge.getTransfer(u)===et)l.defines.SRGB_TRANSFER="";let E=_g[d];if(E)l.defines[E]="";l.needsUpdate=!0}l.uniforms.tDiffuse.value=b.texture,A.setRenderTarget(x),A.render(c,h),x=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){r.dispose(),a.dispose(),o.dispose(),l.dispose()}}var du=new pt,Pl=new vi(1,1),fu=new aa,pu=new cl,mu=new ua,Zh=[],Jh=[],Kh=new Float32Array(16),$h=new Float32Array(9),jh=new Float32Array(4);function ds(e,t,n){let i=e[0];if(i<=0||i>0)return e;let s=t*n,r=Zh[s];if(r===void 0)r=new Float32Array(s),Zh[s]=r;if(t!==0){i.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=n,e[a].toArray(r,o)}return r}function bt(e,t){if(e.length!==t.length)return!1;for(let n=0,i=e.length;n<i;n++)if(e[n]!==t[n])return!1;return!0}function Tt(e,t){for(let n=0,i=t.length;n<i;n++)e[n]=t[n]}function La(e,t){let n=Jh[t];if(n===void 0)n=new Int32Array(t),Jh[t]=n;for(let i=0;i!==t;++i)n[i]=e.allocateTextureUnit();return n}function vg(e,t){let n=this.cache;if(n[0]===t)return;e.uniform1f(this.addr,t),n[0]=t}function yg(e,t){let n=this.cache;if(t.x!==void 0){if(n[0]!==t.x||n[1]!==t.y)e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y}else{if(bt(n,t))return;e.uniform2fv(this.addr,t),Tt(n,t)}}function Mg(e,t){let n=this.cache;if(t.x!==void 0){if(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z}else if(t.r!==void 0){if(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b}else{if(bt(n,t))return;e.uniform3fv(this.addr,t),Tt(n,t)}}function Sg(e,t){let n=this.cache;if(t.x!==void 0){if(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w}else{if(bt(n,t))return;e.uniform4fv(this.addr,t),Tt(n,t)}}function bg(e,t){let n=this.cache,i=t.elements;if(i===void 0){if(bt(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),Tt(n,t)}else{if(bt(n,i))return;jh.set(i),e.uniformMatrix2fv(this.addr,!1,jh),Tt(n,i)}}function Tg(e,t){let n=this.cache,i=t.elements;if(i===void 0){if(bt(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),Tt(n,t)}else{if(bt(n,i))return;$h.set(i),e.uniformMatrix3fv(this.addr,!1,$h),Tt(n,i)}}function Ag(e,t){let n=this.cache,i=t.elements;if(i===void 0){if(bt(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),Tt(n,t)}else{if(bt(n,i))return;Kh.set(i),e.uniformMatrix4fv(this.addr,!1,Kh),Tt(n,i)}}function Eg(e,t){let n=this.cache;if(n[0]===t)return;e.uniform1i(this.addr,t),n[0]=t}function wg(e,t){let n=this.cache;if(t.x!==void 0){if(n[0]!==t.x||n[1]!==t.y)e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y}else{if(bt(n,t))return;e.uniform2iv(this.addr,t),Tt(n,t)}}function Cg(e,t){let n=this.cache;if(t.x!==void 0){if(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z}else{if(bt(n,t))return;e.uniform3iv(this.addr,t),Tt(n,t)}}function Rg(e,t){let n=this.cache;if(t.x!==void 0){if(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w}else{if(bt(n,t))return;e.uniform4iv(this.addr,t),Tt(n,t)}}function Ig(e,t){let n=this.cache;if(n[0]===t)return;e.uniform1ui(this.addr,t),n[0]=t}function Pg(e,t){let n=this.cache;if(t.x!==void 0){if(n[0]!==t.x||n[1]!==t.y)e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y}else{if(bt(n,t))return;e.uniform2uiv(this.addr,t),Tt(n,t)}}function Lg(e,t){let n=this.cache;if(t.x!==void 0){if(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z}else{if(bt(n,t))return;e.uniform3uiv(this.addr,t),Tt(n,t)}}function Ng(e,t){let n=this.cache;if(t.x!==void 0){if(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w}else{if(bt(n,t))return;e.uniform4uiv(this.addr,t),Tt(n,t)}}function Dg(e,t,n){let i=this.cache,s=n.allocateTextureUnit();if(i[0]!==s)e.uniform1i(this.addr,s),i[0]=s;let r;if(this.type===e.SAMPLER_2D_SHADOW)Pl.compareFunction=n.isReversedDepthBuffer()?ra:sa,r=Pl;else r=du;n.setTexture2D(t||r,s)}function Ug(e,t,n){let i=this.cache,s=n.allocateTextureUnit();if(i[0]!==s)e.uniform1i(this.addr,s),i[0]=s;n.setTexture3D(t||pu,s)}function Fg(e,t,n){let i=this.cache,s=n.allocateTextureUnit();if(i[0]!==s)e.uniform1i(this.addr,s),i[0]=s;n.setTextureCube(t||mu,s)}function Og(e,t,n){let i=this.cache,s=n.allocateTextureUnit();if(i[0]!==s)e.uniform1i(this.addr,s),i[0]=s;n.setTexture2DArray(t||fu,s)}function Bg(e){switch(e){case 5126:return vg;case 35664:return yg;case 35665:return Mg;case 35666:return Sg;case 35674:return bg;case 35675:return Tg;case 35676:return Ag;case 5124:case 35670:return Eg;case 35667:case 35671:return wg;case 35668:case 35672:return Cg;case 35669:case 35673:return Rg;case 5125:return Ig;case 36294:return Pg;case 36295:return Lg;case 36296:return Ng;case 35678:case 36198:case 36298:case 36306:case 35682:return Dg;case 35679:case 36299:case 36307:return Ug;case 35680:case 36300:case 36308:case 36293:return Fg;case 36289:case 36303:case 36311:case 36292:return Og}}function zg(e,t){e.uniform1fv(this.addr,t)}function kg(e,t){let n=ds(t,this.size,2);e.uniform2fv(this.addr,n)}function Gg(e,t){let n=ds(t,this.size,3);e.uniform3fv(this.addr,n)}function Hg(e,t){let n=ds(t,this.size,4);e.uniform4fv(this.addr,n)}function Vg(e,t){let n=ds(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function Wg(e,t){let n=ds(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function Xg(e,t){let n=ds(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function qg(e,t){e.uniform1iv(this.addr,t)}function Yg(e,t){e.uniform2iv(this.addr,t)}function Zg(e,t){e.uniform3iv(this.addr,t)}function Jg(e,t){e.uniform4iv(this.addr,t)}function Kg(e,t){e.uniform1uiv(this.addr,t)}function $g(e,t){e.uniform2uiv(this.addr,t)}function jg(e,t){e.uniform3uiv(this.addr,t)}function Qg(e,t){e.uniform4uiv(this.addr,t)}function e_(e,t,n){let i=this.cache,s=t.length,r=La(n,s);if(!bt(i,r))e.uniform1iv(this.addr,r),Tt(i,r);let a;if(this.type===e.SAMPLER_2D_SHADOW)a=Pl;else a=du;for(let o=0;o!==s;++o)n.setTexture2D(t[o]||a,r[o])}function t_(e,t,n){let i=this.cache,s=t.length,r=La(n,s);if(!bt(i,r))e.uniform1iv(this.addr,r),Tt(i,r);for(let a=0;a!==s;++a)n.setTexture3D(t[a]||pu,r[a])}function n_(e,t,n){let i=this.cache,s=t.length,r=La(n,s);if(!bt(i,r))e.uniform1iv(this.addr,r),Tt(i,r);for(let a=0;a!==s;++a)n.setTextureCube(t[a]||mu,r[a])}function i_(e,t,n){let i=this.cache,s=t.length,r=La(n,s);if(!bt(i,r))e.uniform1iv(this.addr,r),Tt(i,r);for(let a=0;a!==s;++a)n.setTexture2DArray(t[a]||fu,r[a])}function s_(e){switch(e){case 5126:return zg;case 35664:return kg;case 35665:return Gg;case 35666:return Hg;case 35674:return Vg;case 35675:return Wg;case 35676:return Xg;case 5124:case 35670:return qg;case 35667:case 35671:return Yg;case 35668:case 35672:return Zg;case 35669:case 35673:return Jg;case 5125:return Kg;case 36294:return $g;case 36295:return jg;case 36296:return Qg;case 35678:case 36198:case 36298:case 36306:case 35682:return e_;case 35679:case 36299:case 36307:return t_;case 35680:case 36300:case 36308:case 36293:return n_;case 36289:case 36303:case 36311:case 36292:return i_}}class gu{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Bg(t.type)}}class _u{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=s_(t.type)}}class xu{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let i=this.seq;for(let s=0,r=i.length;s!==r;++s){let a=i[s];a.setValue(e,t[a.id],n)}}}var Rl=/(\w+)(\])?(\[|\.)?/g;function Qh(e,t){e.seq.push(t),e.map[t.id]=t}function r_(e,t,n){let i=e.name,s=i.length;Rl.lastIndex=0;while(!0){let r=Rl.exec(i),a=Rl.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l)o=o|0;if(c===void 0||c==="["&&a+2===s){Qh(n,c===void 0?new gu(o,e,t):new _u(o,e,t));break}else{let u=n.map[o];if(u===void 0)u=new xu(o),Qh(n,u);n=u}}}class ar{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let a=e.getActiveUniform(t,r),o=e.getUniformLocation(t,a.name);r_(a,o,this)}let i=[],s=[];for(let r of this.seq)if(r.type===e.SAMPLER_2D_SHADOW||r.type===e.SAMPLER_CUBE_SHADOW||r.type===e.SAMPLER_2D_ARRAY_SHADOW)i.push(r);else s.push(r);if(i.length>0)this.seq=i.concat(s)}setValue(e,t,n,i){let s=this.map[t];if(s!==void 0)s.setValue(e,n,i)}setOptional(e,t,n){let i=t[n];if(i!==void 0)this.setValue(e,n,i)}static upload(e,t,n,i){for(let s=0,r=t.length;s!==r;++s){let a=t[s],o=n[a.id];if(o.needsUpdate!==!1)a.setValue(e,o.value,i)}}static seqWithValue(e,t){let n=[];for(let i=0,s=e.length;i!==s;++i){let r=e[i];if(r.id in t)n.push(r)}return n}}function eu(e,t,n){let i=e.createShader(t);return e.shaderSource(i,n),e.compileShader(i),i}var a_=37297,o_=0;function l_(e,t){let n=e.split(`
`),i=[],s=Math.max(t-6,0),r=Math.min(t+6,n.length);for(let a=s;a<r;a++){let o=a+1;i.push(`${o===t?">":" "} ${o}: ${n[a]}`)}return i.join(`
`)}var tu=new Oe;function c_(e){Ge._getMatrix(tu,Ge.workingColorSpace,e);let t=`mat3( ${tu.elements.map((n)=>n.toFixed(4))} )`;switch(Ge.getTransfer(e)){case tl:return[t,"LinearTransferOETF"];case et:return[t,"sRGBTransferOETF"];default:return be("WebGLProgram: Unsupported color space: ",e),[t,"LinearTransferOETF"]}}function nu(e,t,n){let i=e.getShaderParameter(t,e.COMPILE_STATUS),r=(e.getShaderInfoLog(t)||"").trim();if(i&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return n.toUpperCase()+`

`+r+`

`+l_(e.getShaderSource(t),o)}else return r}function h_(e,t){let n=c_(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,"}"].join(`
`)}var u_={[Ds]:"Linear",[Us]:"Reinhard",[Fs]:"Cineon",[di]:"ACESFilmic",[Bs]:"AgX",[zs]:"Neutral",[Os]:"Custom"};function d_(e,t){let n=u_[t];if(n===void 0)return be("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+e+"( vec3 color ) { return LinearToneMapping( color ); }";return"vec3 "+e+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}var Ia=new L;function f_(){Ge.getLuminanceCoefficients(Ia);let e=Ia.x.toFixed(4),t=Ia.y.toFixed(4),n=Ia.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${e}, ${t}, ${n} );`,"\treturn dot( weights, rgb );","}"].join(`
`)}function p_(e){return[e.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",e.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(rr).join(`
`)}function m_(e){let t=[];for(let n in e){let i=e[n];if(i===!1)continue;t.push("#define "+n+" "+i)}return t.join(`
`)}function g_(e,t){let n={},i=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let r=e.getActiveAttrib(t,s),a=r.name,o=1;if(r.type===e.FLOAT_MAT2)o=2;if(r.type===e.FLOAT_MAT3)o=3;if(r.type===e.FLOAT_MAT4)o=4;n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function rr(e){return e!==""}function iu(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function su(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var __=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ll(e){return e.replace(__,v_)}var x_=new Map;function v_(e,t){let n=Be[t];if(n===void 0){let i=x_.get(t);if(i!==void 0)n=Be[i],be('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw Error("Can not resolve #include <"+t+">")}return Ll(n)}var y_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function ru(e){return e.replace(y_,M_)}function M_(e,t,n,i){let s="";for(let r=parseInt(t);r<parseInt(n);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function au(e){let t=`precision ${e.precision} float;
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
#define LOW_PRECISION`;return t}var S_={[Ps]:"SHADOWMAP_TYPE_PCF",[Ji]:"SHADOWMAP_TYPE_VSM"};function b_(e){return S_[e.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var T_={[$i]:"ENVMAP_TYPE_CUBE",[fi]:"ENVMAP_TYPE_CUBE",[ks]:"ENVMAP_TYPE_CUBE_UV"};function A_(e){if(e.envMap===!1)return"ENVMAP_TYPE_CUBE";return T_[e.envMapMode]||"ENVMAP_TYPE_CUBE"}var E_={[fi]:"ENVMAP_MODE_REFRACTION"};function w_(e){if(e.envMap===!1)return"ENVMAP_MODE_REFLECTION";return E_[e.envMapMode]||"ENVMAP_MODE_REFLECTION"}var C_={[ph]:"ENVMAP_BLENDING_MULTIPLY",[mh]:"ENVMAP_BLENDING_MIX",[gh]:"ENVMAP_BLENDING_ADD"};function R_(e){if(e.envMap===!1)return"ENVMAP_BLENDING_NONE";return C_[e.combine]||"ENVMAP_BLENDING_NONE"}function I_(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,n),112)),texelHeight:i,maxMip:n}}function P_(e,t,n,i){let s=e.getContext(),{defines:r,vertexShader:a,fragmentShader:o}=n,l=b_(n),c=A_(n),h=w_(n),u=R_(n),d=I_(n),m=p_(n),_=m_(r),x=s.createProgram(),f,p,A=n.glslVersion?"#version "+n.glslVersion+`
`:"";if(n.isRawShaderMaterial){if(f=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,_].filter(rr).join(`
`),f.length>0)f+=`
`;if(p=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,_].filter(rr).join(`
`),p.length>0)p+=`
`}else f=[au(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,_,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+h:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","\tattribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","\tattribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","\tuniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","\tattribute vec2 uv1;","#endif","#ifdef USE_UV2","\tattribute vec2 uv2;","#endif","#ifdef USE_UV3","\tattribute vec2 uv3;","#endif","#ifdef USE_TANGENT","\tattribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","\tattribute vec4 color;","#elif defined( USE_COLOR )","\tattribute vec3 color;","#endif","#ifdef USE_SKINNING","\tattribute vec4 skinIndex;","\tattribute vec4 skinWeight;","#endif",`
`].filter(rr).join(`
`),p=[au(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,_,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+c:"",n.envMap?"#define "+h:"",n.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor||n.batchingColor?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==cn?"#define TONE_MAPPING":"",n.toneMapping!==cn?Be.tonemapping_pars_fragment:"",n.toneMapping!==cn?d_("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",Be.colorspace_pars_fragment,h_("linearToOutputTexel",n.outputColorSpace),f_(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(rr).join(`
`);if(a=Ll(a),a=iu(a,n),a=su(a,n),o=Ll(o),o=iu(o,n),o=su(o,n),a=ru(a),o=ru(o),n.isRawShaderMaterial!==!0)A=`#version 300 es
`,f=[m,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+f,p=["#define varying in",n.glslVersion===nl?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===nl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p;let M=A+f+a,b=A+p+o,R=eu(s,s.VERTEX_SHADER,M),E=eu(s,s.FRAGMENT_SHADER,b);if(s.attachShader(x,R),s.attachShader(x,E),n.index0AttributeName!==void 0)s.bindAttribLocation(x,0,n.index0AttributeName);else if(n.morphTargets===!0)s.bindAttribLocation(x,0,"position");s.linkProgram(x);function P(C){if(e.debug.checkShaderErrors){let k=s.getProgramInfoLog(x)||"",X=s.getShaderInfoLog(R)||"",G=s.getShaderInfoLog(E)||"",K=k.trim(),H=X.trim(),O=G.trim(),Y=!0,te=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(Y=!1,typeof e.debug.onShaderError==="function")e.debug.onShaderError(s,x,R,E);else{let ie=nu(s,R,"vertex"),ge=nu(s,E,"fragment");Re("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+`

Material Name: `+C.name+`
Material Type: `+C.type+`

Program Info Log: `+K+`
`+ie+`
`+ge)}else if(K!=="")be("WebGLProgram: Program Info Log:",K);else if(H===""||O==="")te=!1;if(te)C.diagnostics={runnable:Y,programLog:K,vertexShader:{log:H,prefix:f},fragmentShader:{log:O,prefix:p}}}s.deleteShader(R),s.deleteShader(E),N=new ar(s,x),T=g_(s,x)}let N;this.getUniforms=function(){if(N===void 0)P(this);return N};let T;this.getAttributes=function(){if(T===void 0)P(this);return T};let S=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){if(S===!1)S=s.getProgramParameter(x,a_);return S},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=o_++,this.cacheKey=t,this.usedTimes=1,this.program=x,this.vertexShader=R,this.fragmentShader=E,this}var L_=0;class vu{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let{vertexShader:t,fragmentShader:n}=e,i=this._getShaderStage(t),s=this._getShaderStage(n),r=this._getShaderCacheForMaterial(e);if(r.has(i)===!1)r.add(i),i.usedTimes++;if(r.has(s)===!1)r.add(s),s.usedTimes++;return this}remove(e){let t=this.materialCache.get(e);for(let n of t)if(n.usedTimes--,n.usedTimes===0)this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);if(n===void 0)n=new Set,t.set(e,n);return n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);if(n===void 0)n=new yu(e),t.set(e,n);return n}}class yu{constructor(e){this.id=L_++,this.code=e,this.usedTimes=0}}function N_(e,t,n,i,s,r,a){let o=new oa,l=new vu,c=new Set,h=[],u=new Map,{logarithmicDepthBuffer:d,precision:m}=s,_={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(T){if(c.add(T),T===0)return"uv";return`uv${T}`}function f(T,S,C,k,X){let G=k.fog,K=X.geometry,H=T.isMeshStandardMaterial?k.environment:null,O=(T.isMeshStandardMaterial?n:t).get(T.envMap||H),Y=!!O&&O.mapping===ks?O.image.height:null,te=_[T.type];if(T.precision!==null){if(m=s.getMaxPrecision(T.precision),m!==T.precision)be("WebGLProgram.getParameters:",T.precision,"not supported, using",m,"instead.")}let ie=K.morphAttributes.position||K.morphAttributes.normal||K.morphAttributes.color,ge=ie!==void 0?ie.length:0,Ue=0;if(K.morphAttributes.position!==void 0)Ue=1;if(K.morphAttributes.normal!==void 0)Ue=2;if(K.morphAttributes.color!==void 0)Ue=3;let ut,it,Z,le;if(te){let Ke=xn[te];ut=Ke.vertexShader,it=Ke.fragmentShader}else ut=T.vertexShader,it=T.fragmentShader,l.update(T),Z=l.getVertexShaderID(T),le=l.getFragmentShaderID(T);let re=e.getRenderTarget(),Ce=e.state.buffers.depth.getReversed(),Ie=X.isInstancedMesh===!0,Ne=X.isBatchedMesh===!0,mt=!!T.map,qe=!!T.matcap,Je=!!O,st=!!T.aoMap,He=!!T.lightMap,gt=!!T.bumpMap,w=!!T.normalMap,wt=!!T.displacementMap,ze=!!T.emissiveMap,ht=!!T.metalnessMap,Te=!!T.roughnessMap,at=T.anisotropy>0,y=T.clearcoat>0,g=T.dispersion>0,F=T.iridescence>0,q=T.sheen>0,J=T.transmission>0,W=at&&!!T.anisotropyMap,_e=y&&!!T.clearcoatMap,se=y&&!!T.clearcoatNormalMap,Ae=y&&!!T.clearcoatRoughnessMap,Pe=F&&!!T.iridescenceMap,j=F&&!!T.iridescenceThicknessMap,ee=q&&!!T.sheenColorMap,xe=q&&!!T.sheenRoughnessMap,ye=!!T.specularMap,ue=!!T.specularColorMap,ke=!!T.specularIntensityMap,I=J&&!!T.transmissionMap,ae=J&&!!T.thicknessMap,ne=!!T.gradientMap,fe=!!T.alphaMap,Q=T.alphaTest>0,V=!!T.alphaHash,ve=!!T.extensions,De=cn;if(T.toneMapped){if(re===null||re.isXRRenderTarget===!0)De=e.toneMapping}let ot={shaderID:te,shaderType:T.type,shaderName:T.name,vertexShader:ut,fragmentShader:it,defines:T.defines,customVertexShaderID:Z,customFragmentShaderID:le,isRawShaderMaterial:T.isRawShaderMaterial===!0,glslVersion:T.glslVersion,precision:m,batching:Ne,batchingColor:Ne&&X._colorsTexture!==null,instancing:Ie,instancingColor:Ie&&X.instanceColor!==null,instancingMorph:Ie&&X.morphTexture!==null,outputColorSpace:re===null?e.outputColorSpace:re.isXRRenderTarget===!0?re.texture.colorSpace:Ft,alphaToCoverage:!!T.alphaToCoverage,map:mt,matcap:qe,envMap:Je,envMapMode:Je&&O.mapping,envMapCubeUVHeight:Y,aoMap:st,lightMap:He,bumpMap:gt,normalMap:w,displacementMap:wt,emissiveMap:ze,normalMapObjectSpace:w&&T.normalMapType===Ah,normalMapTangentSpace:w&&T.normalMapType===Th,metalnessMap:ht,roughnessMap:Te,anisotropy:at,anisotropyMap:W,clearcoat:y,clearcoatMap:_e,clearcoatNormalMap:se,clearcoatRoughnessMap:Ae,dispersion:g,iridescence:F,iridescenceMap:Pe,iridescenceThicknessMap:j,sheen:q,sheenColorMap:ee,sheenRoughnessMap:xe,specularMap:ye,specularColorMap:ue,specularIntensityMap:ke,transmission:J,transmissionMap:I,thicknessMap:ae,gradientMap:ne,opaque:T.transparent===!1&&T.blending===Ls&&T.alphaToCoverage===!1,alphaMap:fe,alphaTest:Q,alphaHash:V,combine:T.combine,mapUv:mt&&x(T.map.channel),aoMapUv:st&&x(T.aoMap.channel),lightMapUv:He&&x(T.lightMap.channel),bumpMapUv:gt&&x(T.bumpMap.channel),normalMapUv:w&&x(T.normalMap.channel),displacementMapUv:wt&&x(T.displacementMap.channel),emissiveMapUv:ze&&x(T.emissiveMap.channel),metalnessMapUv:ht&&x(T.metalnessMap.channel),roughnessMapUv:Te&&x(T.roughnessMap.channel),anisotropyMapUv:W&&x(T.anisotropyMap.channel),clearcoatMapUv:_e&&x(T.clearcoatMap.channel),clearcoatNormalMapUv:se&&x(T.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ae&&x(T.clearcoatRoughnessMap.channel),iridescenceMapUv:Pe&&x(T.iridescenceMap.channel),iridescenceThicknessMapUv:j&&x(T.iridescenceThicknessMap.channel),sheenColorMapUv:ee&&x(T.sheenColorMap.channel),sheenRoughnessMapUv:xe&&x(T.sheenRoughnessMap.channel),specularMapUv:ye&&x(T.specularMap.channel),specularColorMapUv:ue&&x(T.specularColorMap.channel),specularIntensityMapUv:ke&&x(T.specularIntensityMap.channel),transmissionMapUv:I&&x(T.transmissionMap.channel),thicknessMapUv:ae&&x(T.thicknessMap.channel),alphaMapUv:fe&&x(T.alphaMap.channel),vertexTangents:!!K.attributes.tangent&&(w||at),vertexColors:T.vertexColors,vertexAlphas:T.vertexColors===!0&&!!K.attributes.color&&K.attributes.color.itemSize===4,pointsUvs:X.isPoints===!0&&!!K.attributes.uv&&(mt||fe),fog:!!G,useFog:T.fog===!0,fogExp2:!!G&&G.isFogExp2,flatShading:T.flatShading===!0&&T.wireframe===!1,sizeAttenuation:T.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:Ce,skinning:X.isSkinnedMesh===!0,morphTargets:K.morphAttributes.position!==void 0,morphNormals:K.morphAttributes.normal!==void 0,morphColors:K.morphAttributes.color!==void 0,morphTargetsCount:ge,morphTextureStride:Ue,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:T.dithering,shadowMapEnabled:e.shadowMap.enabled&&C.length>0,shadowMapType:e.shadowMap.type,toneMapping:De,decodeVideoTexture:mt&&T.map.isVideoTexture===!0&&Ge.getTransfer(T.map.colorSpace)===et,decodeVideoTextureEmissive:ze&&T.emissiveMap.isVideoTexture===!0&&Ge.getTransfer(T.emissiveMap.colorSpace)===et,premultipliedAlpha:T.premultipliedAlpha,doubleSided:T.side===jt,flipSided:T.side===Dt,useDepthPacking:T.depthPacking>=0,depthPacking:T.depthPacking||0,index0AttributeName:T.index0AttributeName,extensionClipCullDistance:ve&&T.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ve&&T.extensions.multiDraw===!0||Ne)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:T.customProgramCacheKey()};return ot.vertexUv1s=c.has(1),ot.vertexUv2s=c.has(2),ot.vertexUv3s=c.has(3),c.clear(),ot}function p(T){let S=[];if(T.shaderID)S.push(T.shaderID);else S.push(T.customVertexShaderID),S.push(T.customFragmentShaderID);if(T.defines!==void 0)for(let C in T.defines)S.push(C),S.push(T.defines[C]);if(T.isRawShaderMaterial===!1)A(S,T),M(S,T),S.push(e.outputColorSpace);return S.push(T.customProgramCacheKey),S.join()}function A(T,S){T.push(S.precision),T.push(S.outputColorSpace),T.push(S.envMapMode),T.push(S.envMapCubeUVHeight),T.push(S.mapUv),T.push(S.alphaMapUv),T.push(S.lightMapUv),T.push(S.aoMapUv),T.push(S.bumpMapUv),T.push(S.normalMapUv),T.push(S.displacementMapUv),T.push(S.emissiveMapUv),T.push(S.metalnessMapUv),T.push(S.roughnessMapUv),T.push(S.anisotropyMapUv),T.push(S.clearcoatMapUv),T.push(S.clearcoatNormalMapUv),T.push(S.clearcoatRoughnessMapUv),T.push(S.iridescenceMapUv),T.push(S.iridescenceThicknessMapUv),T.push(S.sheenColorMapUv),T.push(S.sheenRoughnessMapUv),T.push(S.specularMapUv),T.push(S.specularColorMapUv),T.push(S.specularIntensityMapUv),T.push(S.transmissionMapUv),T.push(S.thicknessMapUv),T.push(S.combine),T.push(S.fogExp2),T.push(S.sizeAttenuation),T.push(S.morphTargetsCount),T.push(S.morphAttributeCount),T.push(S.numDirLights),T.push(S.numPointLights),T.push(S.numSpotLights),T.push(S.numSpotLightMaps),T.push(S.numHemiLights),T.push(S.numRectAreaLights),T.push(S.numDirLightShadows),T.push(S.numPointLightShadows),T.push(S.numSpotLightShadows),T.push(S.numSpotLightShadowsWithMaps),T.push(S.numLightProbes),T.push(S.shadowMapType),T.push(S.toneMapping),T.push(S.numClippingPlanes),T.push(S.numClipIntersection),T.push(S.depthPacking)}function M(T,S){if(o.disableAll(),S.instancing)o.enable(0);if(S.instancingColor)o.enable(1);if(S.instancingMorph)o.enable(2);if(S.matcap)o.enable(3);if(S.envMap)o.enable(4);if(S.normalMapObjectSpace)o.enable(5);if(S.normalMapTangentSpace)o.enable(6);if(S.clearcoat)o.enable(7);if(S.iridescence)o.enable(8);if(S.alphaTest)o.enable(9);if(S.vertexColors)o.enable(10);if(S.vertexAlphas)o.enable(11);if(S.vertexUv1s)o.enable(12);if(S.vertexUv2s)o.enable(13);if(S.vertexUv3s)o.enable(14);if(S.vertexTangents)o.enable(15);if(S.anisotropy)o.enable(16);if(S.alphaHash)o.enable(17);if(S.batching)o.enable(18);if(S.dispersion)o.enable(19);if(S.batchingColor)o.enable(20);if(S.gradientMap)o.enable(21);if(T.push(o.mask),o.disableAll(),S.fog)o.enable(0);if(S.useFog)o.enable(1);if(S.flatShading)o.enable(2);if(S.logarithmicDepthBuffer)o.enable(3);if(S.reversedDepthBuffer)o.enable(4);if(S.skinning)o.enable(5);if(S.morphTargets)o.enable(6);if(S.morphNormals)o.enable(7);if(S.morphColors)o.enable(8);if(S.premultipliedAlpha)o.enable(9);if(S.shadowMapEnabled)o.enable(10);if(S.doubleSided)o.enable(11);if(S.flipSided)o.enable(12);if(S.useDepthPacking)o.enable(13);if(S.dithering)o.enable(14);if(S.transmission)o.enable(15);if(S.sheen)o.enable(16);if(S.opaque)o.enable(17);if(S.pointsUvs)o.enable(18);if(S.decodeVideoTexture)o.enable(19);if(S.decodeVideoTextureEmissive)o.enable(20);if(S.alphaToCoverage)o.enable(21);T.push(o.mask)}function b(T){let S=_[T.type],C;if(S){let k=xn[S];C=Dn.clone(k.uniforms)}else C=T.uniforms;return C}function R(T,S){let C=u.get(S);if(C!==void 0)++C.usedTimes;else C=new P_(e,S,T,r),h.push(C),u.set(S,C);return C}function E(T){if(--T.usedTimes===0){let S=h.indexOf(T);h[S]=h[h.length-1],h.pop(),u.delete(T.cacheKey),T.destroy()}}function P(T){l.remove(T)}function N(){l.dispose()}return{getParameters:f,getProgramCacheKey:p,getUniforms:b,acquireProgram:R,releaseProgram:E,releaseShaderCache:P,programs:h,dispose:N}}function D_(){let e=new WeakMap;function t(a){return e.has(a)}function n(a){let o=e.get(a);if(o===void 0)o={},e.set(a,o);return o}function i(a){e.delete(a)}function s(a,o,l){e.get(a)[o]=l}function r(){e=new WeakMap}return{has:t,get:n,remove:i,update:s,dispose:r}}function U_(e,t){if(e.groupOrder!==t.groupOrder)return e.groupOrder-t.groupOrder;else if(e.renderOrder!==t.renderOrder)return e.renderOrder-t.renderOrder;else if(e.material.id!==t.material.id)return e.material.id-t.material.id;else if(e.z!==t.z)return e.z-t.z;else return e.id-t.id}function ou(e,t){if(e.groupOrder!==t.groupOrder)return e.groupOrder-t.groupOrder;else if(e.renderOrder!==t.renderOrder)return e.renderOrder-t.renderOrder;else if(e.z!==t.z)return t.z-e.z;else return e.id-t.id}function lu(){let e=[],t=0,n=[],i=[],s=[];function r(){t=0,n.length=0,i.length=0,s.length=0}function a(u,d,m,_,x,f){let p=e[t];if(p===void 0)p={id:u.id,object:u,geometry:d,material:m,groupOrder:_,renderOrder:u.renderOrder,z:x,group:f},e[t]=p;else p.id=u.id,p.object=u,p.geometry=d,p.material=m,p.groupOrder=_,p.renderOrder=u.renderOrder,p.z=x,p.group=f;return t++,p}function o(u,d,m,_,x,f){let p=a(u,d,m,_,x,f);if(m.transmission>0)i.push(p);else if(m.transparent===!0)s.push(p);else n.push(p)}function l(u,d,m,_,x,f){let p=a(u,d,m,_,x,f);if(m.transmission>0)i.unshift(p);else if(m.transparent===!0)s.unshift(p);else n.unshift(p)}function c(u,d){if(n.length>1)n.sort(u||U_);if(i.length>1)i.sort(d||ou);if(s.length>1)s.sort(d||ou)}function h(){for(let u=t,d=e.length;u<d;u++){let m=e[u];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:n,transmissive:i,transparent:s,init:r,push:o,unshift:l,finish:h,sort:c}}function F_(){let e=new WeakMap;function t(i,s){let r=e.get(i),a;if(r===void 0)a=new lu,e.set(i,[a]);else if(s>=r.length)a=new lu,r.push(a);else a=r[s];return a}function n(){e=new WeakMap}return{get:t,dispose:n}}function O_(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case"DirectionalLight":n={direction:new L,color:new pe};break;case"SpotLight":n={position:new L,direction:new L,color:new pe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new L,color:new pe,distance:0,decay:0};break;case"HemisphereLight":n={direction:new L,skyColor:new pe,groundColor:new pe};break;case"RectAreaLight":n={color:new pe,position:new L,halfWidth:new L,halfHeight:new L};break}return e[t.id]=n,n}}}function B_(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Me};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Me};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Me,shadowCameraNear:1,shadowCameraFar:1000};break}return e[t.id]=n,n}}}var z_=0;function k_(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+(t.map?1:0)-(e.map?1:0)}function G_(e){let t=new O_,n=B_(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new L);let s=new L,r=new Fe,a=new Fe;function o(c){let h=0,u=0,d=0;for(let T=0;T<9;T++)i.probe[T].set(0,0,0);let m=0,_=0,x=0,f=0,p=0,A=0,M=0,b=0,R=0,E=0,P=0;c.sort(k_);for(let T=0,S=c.length;T<S;T++){let C=c[T],{color:k,intensity:X,distance:G}=C,K=null;if(C.shadow&&C.shadow.map)if(C.shadow.map.texture.format===ns)K=C.shadow.map.texture;else K=C.shadow.map.depthTexture||C.shadow.map.texture;if(C.isAmbientLight)h+=k.r*X,u+=k.g*X,d+=k.b*X;else if(C.isLightProbe){for(let H=0;H<9;H++)i.probe[H].addScaledVector(C.sh.coefficients[H],X);P++}else if(C.isDirectionalLight){let H=t.get(C);if(H.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){let O=C.shadow,Y=n.get(C);Y.shadowIntensity=O.intensity,Y.shadowBias=O.bias,Y.shadowNormalBias=O.normalBias,Y.shadowRadius=O.radius,Y.shadowMapSize=O.mapSize,i.directionalShadow[m]=Y,i.directionalShadowMap[m]=K,i.directionalShadowMatrix[m]=C.shadow.matrix,A++}i.directional[m]=H,m++}else if(C.isSpotLight){let H=t.get(C);H.position.setFromMatrixPosition(C.matrixWorld),H.color.copy(k).multiplyScalar(X),H.distance=G,H.coneCos=Math.cos(C.angle),H.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),H.decay=C.decay,i.spot[x]=H;let O=C.shadow;if(C.map){if(i.spotLightMap[R]=C.map,R++,O.updateMatrices(C),C.castShadow)E++}if(i.spotLightMatrix[x]=O.matrix,C.castShadow){let Y=n.get(C);Y.shadowIntensity=O.intensity,Y.shadowBias=O.bias,Y.shadowNormalBias=O.normalBias,Y.shadowRadius=O.radius,Y.shadowMapSize=O.mapSize,i.spotShadow[x]=Y,i.spotShadowMap[x]=K,b++}x++}else if(C.isRectAreaLight){let H=t.get(C);H.color.copy(k).multiplyScalar(X),H.halfWidth.set(C.width*0.5,0,0),H.halfHeight.set(0,C.height*0.5,0),i.rectArea[f]=H,f++}else if(C.isPointLight){let H=t.get(C);if(H.color.copy(C.color).multiplyScalar(C.intensity),H.distance=C.distance,H.decay=C.decay,C.castShadow){let O=C.shadow,Y=n.get(C);Y.shadowIntensity=O.intensity,Y.shadowBias=O.bias,Y.shadowNormalBias=O.normalBias,Y.shadowRadius=O.radius,Y.shadowMapSize=O.mapSize,Y.shadowCameraNear=O.camera.near,Y.shadowCameraFar=O.camera.far,i.pointShadow[_]=Y,i.pointShadowMap[_]=K,i.pointShadowMatrix[_]=C.shadow.matrix,M++}i.point[_]=H,_++}else if(C.isHemisphereLight){let H=t.get(C);H.skyColor.copy(C.color).multiplyScalar(X),H.groundColor.copy(C.groundColor).multiplyScalar(X),i.hemi[p]=H,p++}}if(f>0)if(e.has("OES_texture_float_linear")===!0)i.rectAreaLTC1=ce.LTC_FLOAT_1,i.rectAreaLTC2=ce.LTC_FLOAT_2;else i.rectAreaLTC1=ce.LTC_HALF_1,i.rectAreaLTC2=ce.LTC_HALF_2;i.ambient[0]=h,i.ambient[1]=u,i.ambient[2]=d;let N=i.hash;if(N.directionalLength!==m||N.pointLength!==_||N.spotLength!==x||N.rectAreaLength!==f||N.hemiLength!==p||N.numDirectionalShadows!==A||N.numPointShadows!==M||N.numSpotShadows!==b||N.numSpotMaps!==R||N.numLightProbes!==P)i.directional.length=m,i.spot.length=x,i.rectArea.length=f,i.point.length=_,i.hemi.length=p,i.directionalShadow.length=A,i.directionalShadowMap.length=A,i.pointShadow.length=M,i.pointShadowMap.length=M,i.spotShadow.length=b,i.spotShadowMap.length=b,i.directionalShadowMatrix.length=A,i.pointShadowMatrix.length=M,i.spotLightMatrix.length=b+R-E,i.spotLightMap.length=R,i.numSpotLightShadowsWithMaps=E,i.numLightProbes=P,N.directionalLength=m,N.pointLength=_,N.spotLength=x,N.rectAreaLength=f,N.hemiLength=p,N.numDirectionalShadows=A,N.numPointShadows=M,N.numSpotShadows=b,N.numSpotMaps=R,N.numLightProbes=P,i.version=z_++}function l(c,h){let u=0,d=0,m=0,_=0,x=0,f=h.matrixWorldInverse;for(let p=0,A=c.length;p<A;p++){let M=c[p];if(M.isDirectionalLight){let b=i.directional[u];b.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(f),u++}else if(M.isSpotLight){let b=i.spot[m];b.position.setFromMatrixPosition(M.matrixWorld),b.position.applyMatrix4(f),b.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(f),m++}else if(M.isRectAreaLight){let b=i.rectArea[_];b.position.setFromMatrixPosition(M.matrixWorld),b.position.applyMatrix4(f),a.identity(),r.copy(M.matrixWorld),r.premultiply(f),a.extractRotation(r),b.halfWidth.set(M.width*0.5,0,0),b.halfHeight.set(0,M.height*0.5,0),b.halfWidth.applyMatrix4(a),b.halfHeight.applyMatrix4(a),_++}else if(M.isPointLight){let b=i.point[d];b.position.setFromMatrixPosition(M.matrixWorld),b.position.applyMatrix4(f),d++}else if(M.isHemisphereLight){let b=i.hemi[x];b.direction.setFromMatrixPosition(M.matrixWorld),b.direction.transformDirection(f),x++}}}return{setup:o,setupView:l,state:i}}function cu(e){let t=new G_(e),n=[],i=[];function s(h){c.camera=h,n.length=0,i.length=0}function r(h){n.push(h)}function a(h){i.push(h)}function o(){t.setup(n)}function l(h){t.setupView(n,h)}let c={lightsArray:n,shadowsArray:i,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function H_(e){let t=new WeakMap;function n(s,r=0){let a=t.get(s),o;if(a===void 0)o=new cu(e),t.set(s,[o]);else if(r>=a.length)o=new cu(e),a.push(o);else o=a[r];return o}function i(){t=new WeakMap}return{get:n,dispose:i}}var V_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,W_=`uniform sampler2D shadow_pass;
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
}`,X_=[new L(1,0,0),new L(-1,0,0),new L(0,1,0),new L(0,-1,0),new L(0,0,1),new L(0,0,-1)],q_=[new L(0,-1,0),new L(0,-1,0),new L(0,0,1),new L(0,0,-1),new L(0,-1,0),new L(0,-1,0)],hu=new Fe,sr=new L,Il=new L;function Y_(e,t,n){let i=new Ks,s=new Me,r=new Me,a=new ct,o=new fl,l=new pl,c={},h=n.maxTextureSize,u={[Yn]:Dt,[Dt]:Yn,[jt]:jt},d=new vt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Me},radius:{value:4}},vertexShader:V_,fragmentShader:W_}),m=d.clone();m.defines.HORIZONTAL_PASS=1;let _=new St;_.setAttribute("position",new Mt(new Float32Array([-1,-1,0.5,3,-1,0.5,-1,3,0.5]),3));let x=new nt(_,d),f=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ps;let p=this.type;this.render=function(E,P,N){if(f.enabled===!1)return;if(f.autoUpdate===!1&&f.needsUpdate===!1)return;if(E.length===0)return;if(E.type===Yc)be("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),E.type=Ps;let T=e.getRenderTarget(),S=e.getActiveCubeFace(),C=e.getActiveMipmapLevel(),k=e.state;if(k.setBlending(ln),k.buffers.depth.getReversed()===!0)k.buffers.color.setClear(0,0,0,0);else k.buffers.color.setClear(1,1,1,1);k.buffers.depth.setTest(!0),k.setScissorTest(!1);let X=p!==this.type;if(X)P.traverse(function(G){if(G.material)if(Array.isArray(G.material))G.material.forEach((K)=>K.needsUpdate=!0);else G.material.needsUpdate=!0});for(let G=0,K=E.length;G<K;G++){let H=E[G],O=H.shadow;if(O===void 0){be("WebGLShadowMap:",H,"has no shadow.");continue}if(O.autoUpdate===!1&&O.needsUpdate===!1)continue;s.copy(O.mapSize);let Y=O.getFrameExtents();if(s.multiply(Y),r.copy(O.mapSize),s.x>h||s.y>h){if(s.x>h)r.x=Math.floor(h/Y.x),s.x=r.x*Y.x,O.mapSize.x=r.x;if(s.y>h)r.y=Math.floor(h/Y.y),s.y=r.y*Y.y,O.mapSize.y=r.y}if(O.map===null||X===!0){if(O.map!==null){if(O.map.depthTexture!==null)O.map.depthTexture.dispose(),O.map.depthTexture=null;O.map.dispose()}if(this.type===Ji){if(H.isPointLight){be("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}O.map=new Et(s.x,s.y,{format:ns,type:Ut,minFilter:Ct,magFilter:Ct,generateMipmaps:!1}),O.map.texture.name=H.name+".shadowMap",O.map.depthTexture=new vi(s.x,s.y,Nn),O.map.depthTexture.name=H.name+".shadowMapDepth",O.map.depthTexture.format=mi,O.map.depthTexture.compareFunction=null,O.map.depthTexture.minFilter=hn,O.map.depthTexture.magFilter=hn}else{if(H.isPointLight)O.map=new da(s.x),O.map.depthTexture=new dl(s.x,Zn);else O.map=new Et(s.x,s.y),O.map.depthTexture=new vi(s.x,s.y,Zn);O.map.depthTexture.name=H.name+".shadowMap",O.map.depthTexture.format=mi;let ie=e.state.buffers.depth.getReversed();if(this.type===Ps)O.map.depthTexture.compareFunction=ie?ra:sa,O.map.depthTexture.minFilter=Ct,O.map.depthTexture.magFilter=Ct;else O.map.depthTexture.compareFunction=null,O.map.depthTexture.minFilter=hn,O.map.depthTexture.magFilter=hn}O.camera.updateProjectionMatrix()}let te=O.map.isWebGLCubeRenderTarget?6:1;for(let ie=0;ie<te;ie++){if(O.map.isWebGLCubeRenderTarget)e.setRenderTarget(O.map,ie),e.clear();else{if(ie===0)e.setRenderTarget(O.map),e.clear();let ge=O.getViewport(ie);a.set(r.x*ge.x,r.y*ge.y,r.x*ge.z,r.y*ge.w),k.viewport(a)}if(H.isPointLight){let{camera:ge,matrix:Ue}=O,ut=H.distance||ge.far;if(ut!==ge.far)ge.far=ut,ge.updateProjectionMatrix();sr.setFromMatrixPosition(H.matrixWorld),ge.position.copy(sr),Il.copy(ge.position),Il.add(X_[ie]),ge.up.copy(q_[ie]),ge.lookAt(Il),ge.updateMatrixWorld(),Ue.makeTranslation(-sr.x,-sr.y,-sr.z),hu.multiplyMatrices(ge.projectionMatrix,ge.matrixWorldInverse),O._frustum.setFromProjectionMatrix(hu,ge.coordinateSystem,ge.reversedDepth)}else O.updateMatrices(H);i=O.getFrustum(),b(P,N,O.camera,H,this.type)}if(O.isPointLightShadow!==!0&&this.type===Ji)A(O,N);O.needsUpdate=!1}p=this.type,f.needsUpdate=!1,e.setRenderTarget(T,S,C)};function A(E,P){let N=t.update(x);if(d.defines.VSM_SAMPLES!==E.blurSamples)d.defines.VSM_SAMPLES=E.blurSamples,m.defines.VSM_SAMPLES=E.blurSamples,d.needsUpdate=!0,m.needsUpdate=!0;if(E.mapPass===null)E.mapPass=new Et(s.x,s.y,{format:ns,type:Ut});d.uniforms.shadow_pass.value=E.map.depthTexture,d.uniforms.resolution.value=E.mapSize,d.uniforms.radius.value=E.radius,e.setRenderTarget(E.mapPass),e.clear(),e.renderBufferDirect(P,null,N,d,x,null),m.uniforms.shadow_pass.value=E.mapPass.texture,m.uniforms.resolution.value=E.mapSize,m.uniforms.radius.value=E.radius,e.setRenderTarget(E.map),e.clear(),e.renderBufferDirect(P,null,N,m,x,null)}function M(E,P,N,T){let S=null,C=N.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(C!==void 0)S=C;else if(S=N.isPointLight===!0?l:o,e.localClippingEnabled&&P.clipShadows===!0&&Array.isArray(P.clippingPlanes)&&P.clippingPlanes.length!==0||P.displacementMap&&P.displacementScale!==0||P.alphaMap&&P.alphaTest>0||P.map&&P.alphaTest>0||P.alphaToCoverage===!0){let k=S.uuid,X=P.uuid,G=c[k];if(G===void 0)G={},c[k]=G;let K=G[X];if(K===void 0)K=S.clone(),G[X]=K,P.addEventListener("dispose",R);S=K}if(S.visible=P.visible,S.wireframe=P.wireframe,T===Ji)S.side=P.shadowSide!==null?P.shadowSide:P.side;else S.side=P.shadowSide!==null?P.shadowSide:u[P.side];if(S.alphaMap=P.alphaMap,S.alphaTest=P.alphaToCoverage===!0?0.5:P.alphaTest,S.map=P.map,S.clipShadows=P.clipShadows,S.clippingPlanes=P.clippingPlanes,S.clipIntersection=P.clipIntersection,S.displacementMap=P.displacementMap,S.displacementScale=P.displacementScale,S.displacementBias=P.displacementBias,S.wireframeLinewidth=P.wireframeLinewidth,S.linewidth=P.linewidth,N.isPointLight===!0&&S.isMeshDistanceMaterial===!0){let k=e.properties.get(S);k.light=N}return S}function b(E,P,N,T,S){if(E.visible===!1)return;if(E.layers.test(P.layers)&&(E.isMesh||E.isLine||E.isPoints)){if((E.castShadow||E.receiveShadow&&S===Ji)&&(!E.frustumCulled||i.intersectsObject(E))){E.modelViewMatrix.multiplyMatrices(N.matrixWorldInverse,E.matrixWorld);let X=t.update(E),G=E.material;if(Array.isArray(G)){let K=X.groups;for(let H=0,O=K.length;H<O;H++){let Y=K[H],te=G[Y.materialIndex];if(te&&te.visible){let ie=M(E,te,T,S);E.onBeforeShadow(e,E,P,N,X,ie,Y),e.renderBufferDirect(N,null,X,ie,E,Y),E.onAfterShadow(e,E,P,N,X,ie,Y)}}}else if(G.visible){let K=M(E,G,T,S);E.onBeforeShadow(e,E,P,N,X,K,null),e.renderBufferDirect(N,null,X,K,E,null),E.onAfterShadow(e,E,P,N,X,K,null)}}}let k=E.children;for(let X=0,G=k.length;X<G;X++)b(k[X],P,N,T,S)}function R(E){E.target.removeEventListener("dispose",R);for(let N in c){let T=c[N],S=E.target.uuid;if(S in T)T[S].dispose(),delete T[S]}}}var Z_={[Hr]:Vr,[Wr]:Yr,[Xr]:Zr,[Ns]:qr,[Vr]:Hr,[Yr]:Wr,[Zr]:Xr,[qr]:Ns};function J_(e,t){function n(){let I=!1,ae=new ct,ne=null,fe=new ct(0,0,0,0);return{setMask:function(Q){if(ne!==Q&&!I)e.colorMask(Q,Q,Q,Q),ne=Q},setLocked:function(Q){I=Q},setClear:function(Q,V,ve,De,ot){if(ot===!0)Q*=De,V*=De,ve*=De;if(ae.set(Q,V,ve,De),fe.equals(ae)===!1)e.clearColor(Q,V,ve,De),fe.copy(ae)},reset:function(){I=!1,ne=null,fe.set(-1,0,0,0)}}}function i(){let I=!1,ae=!1,ne=null,fe=null,Q=null;return{setReversed:function(V){if(ae!==V){let ve=t.get("EXT_clip_control");if(V)ve.clipControlEXT(ve.LOWER_LEFT_EXT,ve.ZERO_TO_ONE_EXT);else ve.clipControlEXT(ve.LOWER_LEFT_EXT,ve.NEGATIVE_ONE_TO_ONE_EXT);ae=V;let De=Q;Q=null,this.setClear(De)}},getReversed:function(){return ae},setTest:function(V){if(V)re(e.DEPTH_TEST);else Ce(e.DEPTH_TEST)},setMask:function(V){if(ne!==V&&!I)e.depthMask(V),ne=V},setFunc:function(V){if(ae)V=Z_[V];if(fe!==V){switch(V){case Hr:e.depthFunc(e.NEVER);break;case Vr:e.depthFunc(e.ALWAYS);break;case Wr:e.depthFunc(e.LESS);break;case Ns:e.depthFunc(e.LEQUAL);break;case Xr:e.depthFunc(e.EQUAL);break;case qr:e.depthFunc(e.GEQUAL);break;case Yr:e.depthFunc(e.GREATER);break;case Zr:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}fe=V}},setLocked:function(V){I=V},setClear:function(V){if(Q!==V){if(ae)V=1-V;e.clearDepth(V),Q=V}},reset:function(){I=!1,ne=null,fe=null,Q=null,ae=!1}}}function s(){let I=!1,ae=null,ne=null,fe=null,Q=null,V=null,ve=null,De=null,ot=null;return{setTest:function(Ke){if(!I)if(Ke)re(e.STENCIL_TEST);else Ce(e.STENCIL_TEST)},setMask:function(Ke){if(ae!==Ke&&!I)e.stencilMask(Ke),ae=Ke},setFunc:function(Ke,yn,Mn){if(ne!==Ke||fe!==yn||Q!==Mn)e.stencilFunc(Ke,yn,Mn),ne=Ke,fe=yn,Q=Mn},setOp:function(Ke,yn,Mn){if(V!==Ke||ve!==yn||De!==Mn)e.stencilOp(Ke,yn,Mn),V=Ke,ve=yn,De=Mn},setLocked:function(Ke){I=Ke},setClear:function(Ke){if(ot!==Ke)e.clearStencil(Ke),ot=Ke},reset:function(){I=!1,ae=null,ne=null,fe=null,Q=null,V=null,ve=null,De=null,ot=null}}}let r=new n,a=new i,o=new s,l=new WeakMap,c=new WeakMap,h={},u={},d=new WeakMap,m=[],_=null,x=!1,f=null,p=null,A=null,M=null,b=null,R=null,E=null,P=new pe(0,0,0),N=0,T=!1,S=null,C=null,k=null,X=null,G=null,K=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),H=!1,O=0,Y=e.getParameter(e.VERSION);if(Y.indexOf("WebGL")!==-1)O=parseFloat(/^WebGL (\d)/.exec(Y)[1]),H=O>=1;else if(Y.indexOf("OpenGL ES")!==-1)O=parseFloat(/^OpenGL ES (\d)/.exec(Y)[1]),H=O>=2;let te=null,ie={},ge=e.getParameter(e.SCISSOR_BOX),Ue=e.getParameter(e.VIEWPORT),ut=new ct().fromArray(ge),it=new ct().fromArray(Ue);function Z(I,ae,ne,fe){let Q=new Uint8Array(4),V=e.createTexture();e.bindTexture(I,V),e.texParameteri(I,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(I,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let ve=0;ve<ne;ve++)if(I===e.TEXTURE_3D||I===e.TEXTURE_2D_ARRAY)e.texImage3D(ae,0,e.RGBA,1,1,fe,0,e.RGBA,e.UNSIGNED_BYTE,Q);else e.texImage2D(ae+ve,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,Q);return V}let le={};le[e.TEXTURE_2D]=Z(e.TEXTURE_2D,e.TEXTURE_2D,1),le[e.TEXTURE_CUBE_MAP]=Z(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),le[e.TEXTURE_2D_ARRAY]=Z(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),le[e.TEXTURE_3D]=Z(e.TEXTURE_3D,e.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),re(e.DEPTH_TEST),a.setFunc(Ns),gt(!1),w(uo),re(e.CULL_FACE),st(ln);function re(I){if(h[I]!==!0)e.enable(I),h[I]=!0}function Ce(I){if(h[I]!==!1)e.disable(I),h[I]=!1}function Ie(I,ae){if(u[I]!==ae){if(e.bindFramebuffer(I,ae),u[I]=ae,I===e.DRAW_FRAMEBUFFER)u[e.FRAMEBUFFER]=ae;if(I===e.FRAMEBUFFER)u[e.DRAW_FRAMEBUFFER]=ae;return!0}return!1}function Ne(I,ae){let ne=m,fe=!1;if(I){if(ne=d.get(ae),ne===void 0)ne=[],d.set(ae,ne);let Q=I.textures;if(ne.length!==Q.length||ne[0]!==e.COLOR_ATTACHMENT0){for(let V=0,ve=Q.length;V<ve;V++)ne[V]=e.COLOR_ATTACHMENT0+V;ne.length=Q.length,fe=!0}}else if(ne[0]!==e.BACK)ne[0]=e.BACK,fe=!0;if(fe)e.drawBuffers(ne)}function mt(I){if(_!==I)return e.useProgram(I),_=I,!0;return!1}let qe={[Ki]:e.FUNC_ADD,[Jc]:e.FUNC_SUBTRACT,[Kc]:e.FUNC_REVERSE_SUBTRACT};qe[$c]=e.MIN,qe[jc]=e.MAX;let Je={[Qc]:e.ZERO,[eh]:e.ONE,[th]:e.SRC_COLOR,[ih]:e.SRC_ALPHA,[ch]:e.SRC_ALPHA_SATURATE,[oh]:e.DST_COLOR,[rh]:e.DST_ALPHA,[nh]:e.ONE_MINUS_SRC_COLOR,[sh]:e.ONE_MINUS_SRC_ALPHA,[lh]:e.ONE_MINUS_DST_COLOR,[ah]:e.ONE_MINUS_DST_ALPHA,[hh]:e.CONSTANT_COLOR,[uh]:e.ONE_MINUS_CONSTANT_COLOR,[dh]:e.CONSTANT_ALPHA,[fh]:e.ONE_MINUS_CONSTANT_ALPHA};function st(I,ae,ne,fe,Q,V,ve,De,ot,Ke){if(I===ln){if(x===!0)Ce(e.BLEND),x=!1;return}if(x===!1)re(e.BLEND),x=!0;if(I!==Zc){if(I!==f||Ke!==T){if(p!==Ki||b!==Ki)e.blendEquation(e.FUNC_ADD),p=Ki,b=Ki;if(Ke)switch(I){case Ls:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case ui:e.blendFunc(e.ONE,e.ONE);break;case fo:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case po:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:Re("WebGLState: Invalid blending: ",I);break}else switch(I){case Ls:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case ui:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case fo:Re("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case po:Re("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Re("WebGLState: Invalid blending: ",I);break}A=null,M=null,R=null,E=null,P.set(0,0,0),N=0,f=I,T=Ke}return}if(Q=Q||ae,V=V||ne,ve=ve||fe,ae!==p||Q!==b)e.blendEquationSeparate(qe[ae],qe[Q]),p=ae,b=Q;if(ne!==A||fe!==M||V!==R||ve!==E)e.blendFuncSeparate(Je[ne],Je[fe],Je[V],Je[ve]),A=ne,M=fe,R=V,E=ve;if(De.equals(P)===!1||ot!==N)e.blendColor(De.r,De.g,De.b,ot),P.copy(De),N=ot;f=I,T=!1}function He(I,ae){I.side===jt?Ce(e.CULL_FACE):re(e.CULL_FACE);let ne=I.side===Dt;if(ae)ne=!ne;gt(ne),I.blending===Ls&&I.transparent===!1?st(ln):st(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),a.setFunc(I.depthFunc),a.setTest(I.depthTest),a.setMask(I.depthWrite),r.setMask(I.colorWrite);let fe=I.stencilWrite;if(o.setTest(fe),fe)o.setMask(I.stencilWriteMask),o.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),o.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass);ze(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?re(e.SAMPLE_ALPHA_TO_COVERAGE):Ce(e.SAMPLE_ALPHA_TO_COVERAGE)}function gt(I){if(S!==I){if(I)e.frontFace(e.CW);else e.frontFace(e.CCW);S=I}}function w(I){if(I!==Xc){if(re(e.CULL_FACE),I!==C)if(I===uo)e.cullFace(e.BACK);else if(I===qc)e.cullFace(e.FRONT);else e.cullFace(e.FRONT_AND_BACK)}else Ce(e.CULL_FACE);C=I}function wt(I){if(I!==k){if(H)e.lineWidth(I);k=I}}function ze(I,ae,ne){if(I){if(re(e.POLYGON_OFFSET_FILL),X!==ae||G!==ne)e.polygonOffset(ae,ne),X=ae,G=ne}else Ce(e.POLYGON_OFFSET_FILL)}function ht(I){if(I)re(e.SCISSOR_TEST);else Ce(e.SCISSOR_TEST)}function Te(I){if(I===void 0)I=e.TEXTURE0+K-1;if(te!==I)e.activeTexture(I),te=I}function at(I,ae,ne){if(ne===void 0)if(te===null)ne=e.TEXTURE0+K-1;else ne=te;let fe=ie[ne];if(fe===void 0)fe={type:void 0,texture:void 0},ie[ne]=fe;if(fe.type!==I||fe.texture!==ae){if(te!==ne)e.activeTexture(ne),te=ne;e.bindTexture(I,ae||le[I]),fe.type=I,fe.texture=ae}}function y(){let I=ie[te];if(I!==void 0&&I.type!==void 0)e.bindTexture(I.type,null),I.type=void 0,I.texture=void 0}function g(){try{e.compressedTexImage2D(...arguments)}catch(I){Re("WebGLState:",I)}}function F(){try{e.compressedTexImage3D(...arguments)}catch(I){Re("WebGLState:",I)}}function q(){try{e.texSubImage2D(...arguments)}catch(I){Re("WebGLState:",I)}}function J(){try{e.texSubImage3D(...arguments)}catch(I){Re("WebGLState:",I)}}function W(){try{e.compressedTexSubImage2D(...arguments)}catch(I){Re("WebGLState:",I)}}function _e(){try{e.compressedTexSubImage3D(...arguments)}catch(I){Re("WebGLState:",I)}}function se(){try{e.texStorage2D(...arguments)}catch(I){Re("WebGLState:",I)}}function Ae(){try{e.texStorage3D(...arguments)}catch(I){Re("WebGLState:",I)}}function Pe(){try{e.texImage2D(...arguments)}catch(I){Re("WebGLState:",I)}}function j(){try{e.texImage3D(...arguments)}catch(I){Re("WebGLState:",I)}}function ee(I){if(ut.equals(I)===!1)e.scissor(I.x,I.y,I.z,I.w),ut.copy(I)}function xe(I){if(it.equals(I)===!1)e.viewport(I.x,I.y,I.z,I.w),it.copy(I)}function ye(I,ae){let ne=c.get(ae);if(ne===void 0)ne=new WeakMap,c.set(ae,ne);let fe=ne.get(I);if(fe===void 0)fe=e.getUniformBlockIndex(ae,I.name),ne.set(I,fe)}function ue(I,ae){let fe=c.get(ae).get(I);if(l.get(ae)!==fe)e.uniformBlockBinding(ae,fe,I.__bindingPointIndex),l.set(ae,fe)}function ke(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),a.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),h={},te=null,ie={},u={},d=new WeakMap,m=[],_=null,x=!1,f=null,p=null,A=null,M=null,b=null,R=null,E=null,P=new pe(0,0,0),N=0,T=!1,S=null,C=null,k=null,X=null,G=null,ut.set(0,0,e.canvas.width,e.canvas.height),it.set(0,0,e.canvas.width,e.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:re,disable:Ce,bindFramebuffer:Ie,drawBuffers:Ne,useProgram:mt,setBlending:st,setMaterial:He,setFlipSided:gt,setCullFace:w,setLineWidth:wt,setPolygonOffset:ze,setScissorTest:ht,activeTexture:Te,bindTexture:at,unbindTexture:y,compressedTexImage2D:g,compressedTexImage3D:F,texImage2D:Pe,texImage3D:j,updateUBOMapping:ye,uniformBlockBinding:ue,texStorage2D:se,texStorage3D:Ae,texSubImage2D:q,texSubImage3D:J,compressedTexSubImage2D:W,compressedTexSubImage3D:_e,scissor:ee,viewport:xe,reset:ke}}function K_(e,t,n,i,s,r,a){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Me,h=new WeakMap,u,d=new WeakMap,m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch(y){}function _(y,g){return m?new OffscreenCanvas(y,g):qi("canvas")}function x(y,g,F){let q=1,J=at(y);if(J.width>F||J.height>F)q=F/Math.max(J.width,J.height);if(q<1)if(typeof HTMLImageElement<"u"&&y instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&y instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&y instanceof ImageBitmap||typeof VideoFrame<"u"&&y instanceof VideoFrame){let W=Math.floor(q*J.width),_e=Math.floor(q*J.height);if(u===void 0)u=_(W,_e);let se=g?_(W,_e):u;return se.width=W,se.height=_e,se.getContext("2d").drawImage(y,0,0,W,_e),be("WebGLRenderer: Texture has been resized from ("+J.width+"x"+J.height+") to ("+W+"x"+_e+")."),se}else{if("data"in y)be("WebGLRenderer: Image in DataTexture is too big ("+J.width+"x"+J.height+").");return y}return y}function f(y){return y.generateMipmaps}function p(y){e.generateMipmap(y)}function A(y){if(y.isWebGLCubeRenderTarget)return e.TEXTURE_CUBE_MAP;if(y.isWebGL3DRenderTarget)return e.TEXTURE_3D;if(y.isWebGLArrayRenderTarget||y.isCompressedArrayTexture)return e.TEXTURE_2D_ARRAY;return e.TEXTURE_2D}function M(y,g,F,q,J=!1){if(y!==null){if(e[y]!==void 0)return e[y];be("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+y+"'")}let W=g;if(g===e.RED){if(F===e.FLOAT)W=e.R32F;if(F===e.HALF_FLOAT)W=e.R16F;if(F===e.UNSIGNED_BYTE)W=e.R8}if(g===e.RED_INTEGER){if(F===e.UNSIGNED_BYTE)W=e.R8UI;if(F===e.UNSIGNED_SHORT)W=e.R16UI;if(F===e.UNSIGNED_INT)W=e.R32UI;if(F===e.BYTE)W=e.R8I;if(F===e.SHORT)W=e.R16I;if(F===e.INT)W=e.R32I}if(g===e.RG){if(F===e.FLOAT)W=e.RG32F;if(F===e.HALF_FLOAT)W=e.RG16F;if(F===e.UNSIGNED_BYTE)W=e.RG8}if(g===e.RG_INTEGER){if(F===e.UNSIGNED_BYTE)W=e.RG8UI;if(F===e.UNSIGNED_SHORT)W=e.RG16UI;if(F===e.UNSIGNED_INT)W=e.RG32UI;if(F===e.BYTE)W=e.RG8I;if(F===e.SHORT)W=e.RG16I;if(F===e.INT)W=e.RG32I}if(g===e.RGB_INTEGER){if(F===e.UNSIGNED_BYTE)W=e.RGB8UI;if(F===e.UNSIGNED_SHORT)W=e.RGB16UI;if(F===e.UNSIGNED_INT)W=e.RGB32UI;if(F===e.BYTE)W=e.RGB8I;if(F===e.SHORT)W=e.RGB16I;if(F===e.INT)W=e.RGB32I}if(g===e.RGBA_INTEGER){if(F===e.UNSIGNED_BYTE)W=e.RGBA8UI;if(F===e.UNSIGNED_SHORT)W=e.RGBA16UI;if(F===e.UNSIGNED_INT)W=e.RGBA32UI;if(F===e.BYTE)W=e.RGBA8I;if(F===e.SHORT)W=e.RGBA16I;if(F===e.INT)W=e.RGBA32I}if(g===e.RGB){if(F===e.UNSIGNED_INT_5_9_9_9_REV)W=e.RGB9_E5;if(F===e.UNSIGNED_INT_10F_11F_11F_REV)W=e.R11F_G11F_B10F}if(g===e.RGBA){let _e=J?tl:Ge.getTransfer(q);if(F===e.FLOAT)W=e.RGBA32F;if(F===e.HALF_FLOAT)W=e.RGBA16F;if(F===e.UNSIGNED_BYTE)W=_e===et?e.SRGB8_ALPHA8:e.RGBA8;if(F===e.UNSIGNED_SHORT_4_4_4_4)W=e.RGBA4;if(F===e.UNSIGNED_SHORT_5_5_5_1)W=e.RGB5_A1}if(W===e.R16F||W===e.R32F||W===e.RG16F||W===e.RG32F||W===e.RGBA16F||W===e.RGBA32F)t.get("EXT_color_buffer_float");return W}function b(y,g){let F;if(y){if(g===null||g===Zn||g===ts)F=e.DEPTH24_STENCIL8;else if(g===Nn)F=e.DEPTH32F_STENCIL8;else if(g===Gs)F=e.DEPTH24_STENCIL8,be("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")}else if(g===null||g===Zn||g===ts)F=e.DEPTH_COMPONENT24;else if(g===Nn)F=e.DEPTH_COMPONENT32F;else if(g===Gs)F=e.DEPTH_COMPONENT16;return F}function R(y,g){if(f(y)===!0||y.isFramebufferTexture&&y.minFilter!==hn&&y.minFilter!==Ct)return Math.log2(Math.max(g.width,g.height))+1;else if(y.mipmaps!==void 0&&y.mipmaps.length>0)return y.mipmaps.length;else if(y.isCompressedTexture&&Array.isArray(y.image))return g.mipmaps.length;else return 1}function E(y){let g=y.target;if(g.removeEventListener("dispose",E),N(g),g.isVideoTexture)h.delete(g)}function P(y){let g=y.target;g.removeEventListener("dispose",P),S(g)}function N(y){let g=i.get(y);if(g.__webglInit===void 0)return;let F=y.source,q=d.get(F);if(q){let J=q[g.__cacheKey];if(J.usedTimes--,J.usedTimes===0)T(y);if(Object.keys(q).length===0)d.delete(F)}i.remove(y)}function T(y){let g=i.get(y);e.deleteTexture(g.__webglTexture);let F=y.source,q=d.get(F);delete q[g.__cacheKey],a.memory.textures--}function S(y){let g=i.get(y);if(y.depthTexture)y.depthTexture.dispose(),i.remove(y.depthTexture);if(y.isWebGLCubeRenderTarget)for(let q=0;q<6;q++){if(Array.isArray(g.__webglFramebuffer[q]))for(let J=0;J<g.__webglFramebuffer[q].length;J++)e.deleteFramebuffer(g.__webglFramebuffer[q][J]);else e.deleteFramebuffer(g.__webglFramebuffer[q]);if(g.__webglDepthbuffer)e.deleteRenderbuffer(g.__webglDepthbuffer[q])}else{if(Array.isArray(g.__webglFramebuffer))for(let q=0;q<g.__webglFramebuffer.length;q++)e.deleteFramebuffer(g.__webglFramebuffer[q]);else e.deleteFramebuffer(g.__webglFramebuffer);if(g.__webglDepthbuffer)e.deleteRenderbuffer(g.__webglDepthbuffer);if(g.__webglMultisampledFramebuffer)e.deleteFramebuffer(g.__webglMultisampledFramebuffer);if(g.__webglColorRenderbuffer){for(let q=0;q<g.__webglColorRenderbuffer.length;q++)if(g.__webglColorRenderbuffer[q])e.deleteRenderbuffer(g.__webglColorRenderbuffer[q])}if(g.__webglDepthRenderbuffer)e.deleteRenderbuffer(g.__webglDepthRenderbuffer)}let F=y.textures;for(let q=0,J=F.length;q<J;q++){let W=i.get(F[q]);if(W.__webglTexture)e.deleteTexture(W.__webglTexture),a.memory.textures--;i.remove(F[q])}i.remove(y)}let C=0;function k(){C=0}function X(){let y=C;if(y>=s.maxTextures)be("WebGLTextures: Trying to use "+y+" texture units while this GPU supports only "+s.maxTextures);return C+=1,y}function G(y){let g=[];return g.push(y.wrapS),g.push(y.wrapT),g.push(y.wrapR||0),g.push(y.magFilter),g.push(y.minFilter),g.push(y.anisotropy),g.push(y.internalFormat),g.push(y.format),g.push(y.type),g.push(y.generateMipmaps),g.push(y.premultiplyAlpha),g.push(y.flipY),g.push(y.unpackAlignment),g.push(y.colorSpace),g.join()}function K(y,g){let F=i.get(y);if(y.isVideoTexture)ht(y);if(y.isRenderTargetTexture===!1&&y.isExternalTexture!==!0&&y.version>0&&F.__version!==y.version){let q=y.image;if(q===null)be("WebGLRenderer: Texture marked for update but no image data found.");else if(q.complete===!1)be("WebGLRenderer: Texture marked for update but image is incomplete");else{le(F,y,g);return}}else if(y.isExternalTexture)F.__webglTexture=y.sourceTexture?y.sourceTexture:null;n.bindTexture(e.TEXTURE_2D,F.__webglTexture,e.TEXTURE0+g)}function H(y,g){let F=i.get(y);if(y.isRenderTargetTexture===!1&&y.version>0&&F.__version!==y.version){le(F,y,g);return}else if(y.isExternalTexture)F.__webglTexture=y.sourceTexture?y.sourceTexture:null;n.bindTexture(e.TEXTURE_2D_ARRAY,F.__webglTexture,e.TEXTURE0+g)}function O(y,g){let F=i.get(y);if(y.isRenderTargetTexture===!1&&y.version>0&&F.__version!==y.version){le(F,y,g);return}n.bindTexture(e.TEXTURE_3D,F.__webglTexture,e.TEXTURE0+g)}function Y(y,g){let F=i.get(y);if(y.isCubeDepthTexture!==!0&&y.version>0&&F.__version!==y.version){re(F,y,g);return}n.bindTexture(e.TEXTURE_CUBE_MAP,F.__webglTexture,e.TEXTURE0+g)}let te={[ji]:e.REPEAT,[Qi]:e.CLAMP_TO_EDGE,[$r]:e.MIRRORED_REPEAT},ie={[hn]:e.NEAREST,[jr]:e.NEAREST_MIPMAP_NEAREST,[pi]:e.NEAREST_MIPMAP_LINEAR,[Ct]:e.LINEAR,[es]:e.LINEAR_MIPMAP_NEAREST,[Ln]:e.LINEAR_MIPMAP_LINEAR},ge={[Eh]:e.NEVER,[Ph]:e.ALWAYS,[wh]:e.LESS,[sa]:e.LEQUAL,[Ch]:e.EQUAL,[ra]:e.GEQUAL,[Rh]:e.GREATER,[Ih]:e.NOTEQUAL};function Ue(y,g){if(g.type===Nn&&t.has("OES_texture_float_linear")===!1&&(g.magFilter===Ct||g.magFilter===es||g.magFilter===pi||g.magFilter===Ln||g.minFilter===Ct||g.minFilter===es||g.minFilter===pi||g.minFilter===Ln))be("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.");if(e.texParameteri(y,e.TEXTURE_WRAP_S,te[g.wrapS]),e.texParameteri(y,e.TEXTURE_WRAP_T,te[g.wrapT]),y===e.TEXTURE_3D||y===e.TEXTURE_2D_ARRAY)e.texParameteri(y,e.TEXTURE_WRAP_R,te[g.wrapR]);if(e.texParameteri(y,e.TEXTURE_MAG_FILTER,ie[g.magFilter]),e.texParameteri(y,e.TEXTURE_MIN_FILTER,ie[g.minFilter]),g.compareFunction)e.texParameteri(y,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(y,e.TEXTURE_COMPARE_FUNC,ge[g.compareFunction]);if(t.has("EXT_texture_filter_anisotropic")===!0){if(g.magFilter===hn)return;if(g.minFilter!==pi&&g.minFilter!==Ln)return;if(g.type===Nn&&t.has("OES_texture_float_linear")===!1)return;if(g.anisotropy>1||i.get(g).__currentAnisotropy){let F=t.get("EXT_texture_filter_anisotropic");e.texParameterf(y,F.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(g.anisotropy,s.getMaxAnisotropy())),i.get(g).__currentAnisotropy=g.anisotropy}}}function ut(y,g){let F=!1;if(y.__webglInit===void 0)y.__webglInit=!0,g.addEventListener("dispose",E);let q=g.source,J=d.get(q);if(J===void 0)J={},d.set(q,J);let W=G(g);if(W!==y.__cacheKey){if(J[W]===void 0)J[W]={texture:e.createTexture(),usedTimes:0},a.memory.textures++,F=!0;J[W].usedTimes++;let _e=J[y.__cacheKey];if(_e!==void 0){if(J[y.__cacheKey].usedTimes--,_e.usedTimes===0)T(g)}y.__cacheKey=W,y.__webglTexture=J[W].texture}return F}function it(y,g,F){return Math.floor(Math.floor(y/F)/g)}function Z(y,g,F,q){let W=y.updateRanges;if(W.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,g.width,g.height,F,q,g.data);else{W.sort((j,ee)=>j.start-ee.start);let _e=0;for(let j=1;j<W.length;j++){let ee=W[_e],xe=W[j],ye=ee.start+ee.count,ue=it(xe.start,g.width,4),ke=it(ee.start,g.width,4);if(xe.start<=ye+1&&ue===ke&&it(xe.start+xe.count-1,g.width,4)===ue)ee.count=Math.max(ee.count,xe.start+xe.count-ee.start);else++_e,W[_e]=xe}W.length=_e+1;let se=e.getParameter(e.UNPACK_ROW_LENGTH),Ae=e.getParameter(e.UNPACK_SKIP_PIXELS),Pe=e.getParameter(e.UNPACK_SKIP_ROWS);e.pixelStorei(e.UNPACK_ROW_LENGTH,g.width);for(let j=0,ee=W.length;j<ee;j++){let xe=W[j],ye=Math.floor(xe.start/4),ue=Math.ceil(xe.count/4),ke=ye%g.width,I=Math.floor(ye/g.width),ae=ue,ne=1;e.pixelStorei(e.UNPACK_SKIP_PIXELS,ke),e.pixelStorei(e.UNPACK_SKIP_ROWS,I),n.texSubImage2D(e.TEXTURE_2D,0,ke,I,ae,1,F,q,g.data)}y.clearUpdateRanges(),e.pixelStorei(e.UNPACK_ROW_LENGTH,se),e.pixelStorei(e.UNPACK_SKIP_PIXELS,Ae),e.pixelStorei(e.UNPACK_SKIP_ROWS,Pe)}}function le(y,g,F){let q=e.TEXTURE_2D;if(g.isDataArrayTexture||g.isCompressedArrayTexture)q=e.TEXTURE_2D_ARRAY;if(g.isData3DTexture)q=e.TEXTURE_3D;let J=ut(y,g),W=g.source;n.bindTexture(q,y.__webglTexture,e.TEXTURE0+F);let _e=i.get(W);if(W.version!==_e.__version||J===!0){n.activeTexture(e.TEXTURE0+F);let se=Ge.getPrimaries(Ge.workingColorSpace),Ae=g.colorSpace===_i?null:Ge.getPrimaries(g.colorSpace),Pe=g.colorSpace===_i||se===Ae?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,g.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,g.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,g.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,Pe);let j=x(g.image,!1,s.maxTextureSize);j=Te(g,j);let ee=r.convert(g.format,g.colorSpace),xe=r.convert(g.type),ye=M(g.internalFormat,ee,xe,g.colorSpace,g.isVideoTexture);Ue(q,g);let ue,ke=g.mipmaps,I=g.isVideoTexture!==!0,ae=_e.__version===void 0||J===!0,ne=W.dataReady,fe=R(g,j);if(g.isDepthTexture){if(ye=b(g.format===gi,g.type),ae)if(I)n.texStorage2D(e.TEXTURE_2D,1,ye,j.width,j.height);else n.texImage2D(e.TEXTURE_2D,0,ye,j.width,j.height,0,ee,xe,null)}else if(g.isDataTexture)if(ke.length>0){if(I&&ae)n.texStorage2D(e.TEXTURE_2D,fe,ye,ke[0].width,ke[0].height);for(let Q=0,V=ke.length;Q<V;Q++)if(ue=ke[Q],I){if(ne)n.texSubImage2D(e.TEXTURE_2D,Q,0,0,ue.width,ue.height,ee,xe,ue.data)}else n.texImage2D(e.TEXTURE_2D,Q,ye,ue.width,ue.height,0,ee,xe,ue.data);g.generateMipmaps=!1}else if(I){if(ae)n.texStorage2D(e.TEXTURE_2D,fe,ye,j.width,j.height);if(ne)Z(g,j,ee,xe)}else n.texImage2D(e.TEXTURE_2D,0,ye,j.width,j.height,0,ee,xe,j.data);else if(g.isCompressedTexture)if(g.isCompressedArrayTexture){if(I&&ae)n.texStorage3D(e.TEXTURE_2D_ARRAY,fe,ye,ke[0].width,ke[0].height,j.depth);for(let Q=0,V=ke.length;Q<V;Q++)if(ue=ke[Q],g.format!==mn)if(ee!==null)if(I){if(ne)if(g.layerUpdates.size>0){let ve=Tl(ue.width,ue.height,g.format,g.type);for(let De of g.layerUpdates){let ot=ue.data.subarray(De*ve/ue.data.BYTES_PER_ELEMENT,(De+1)*ve/ue.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,Q,0,0,De,ue.width,ue.height,1,ee,ot)}g.clearLayerUpdates()}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,Q,0,0,0,ue.width,ue.height,j.depth,ee,ue.data)}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,Q,ye,ue.width,ue.height,j.depth,0,ue.data,0,0);else be("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(I){if(ne)n.texSubImage3D(e.TEXTURE_2D_ARRAY,Q,0,0,0,ue.width,ue.height,j.depth,ee,xe,ue.data)}else n.texImage3D(e.TEXTURE_2D_ARRAY,Q,ye,ue.width,ue.height,j.depth,0,ee,xe,ue.data)}else{if(I&&ae)n.texStorage2D(e.TEXTURE_2D,fe,ye,ke[0].width,ke[0].height);for(let Q=0,V=ke.length;Q<V;Q++)if(ue=ke[Q],g.format!==mn)if(ee!==null)if(I){if(ne)n.compressedTexSubImage2D(e.TEXTURE_2D,Q,0,0,ue.width,ue.height,ee,ue.data)}else n.compressedTexImage2D(e.TEXTURE_2D,Q,ye,ue.width,ue.height,0,ue.data);else be("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(I){if(ne)n.texSubImage2D(e.TEXTURE_2D,Q,0,0,ue.width,ue.height,ee,xe,ue.data)}else n.texImage2D(e.TEXTURE_2D,Q,ye,ue.width,ue.height,0,ee,xe,ue.data)}else if(g.isDataArrayTexture)if(I){if(ae)n.texStorage3D(e.TEXTURE_2D_ARRAY,fe,ye,j.width,j.height,j.depth);if(ne)if(g.layerUpdates.size>0){let Q=Tl(j.width,j.height,g.format,g.type);for(let V of g.layerUpdates){let ve=j.data.subarray(V*Q/j.data.BYTES_PER_ELEMENT,(V+1)*Q/j.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,V,j.width,j.height,1,ee,xe,ve)}g.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,j.width,j.height,j.depth,ee,xe,j.data)}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,ye,j.width,j.height,j.depth,0,ee,xe,j.data);else if(g.isData3DTexture)if(I){if(ae)n.texStorage3D(e.TEXTURE_3D,fe,ye,j.width,j.height,j.depth);if(ne)n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,j.width,j.height,j.depth,ee,xe,j.data)}else n.texImage3D(e.TEXTURE_3D,0,ye,j.width,j.height,j.depth,0,ee,xe,j.data);else if(g.isFramebufferTexture){if(ae)if(I)n.texStorage2D(e.TEXTURE_2D,fe,ye,j.width,j.height);else{let Q=j.width,V=j.height;for(let ve=0;ve<fe;ve++)n.texImage2D(e.TEXTURE_2D,ve,ye,Q,V,0,ee,xe,null),Q>>=1,V>>=1}}else if(ke.length>0){if(I&&ae){let Q=at(ke[0]);n.texStorage2D(e.TEXTURE_2D,fe,ye,Q.width,Q.height)}for(let Q=0,V=ke.length;Q<V;Q++)if(ue=ke[Q],I){if(ne)n.texSubImage2D(e.TEXTURE_2D,Q,0,0,ee,xe,ue)}else n.texImage2D(e.TEXTURE_2D,Q,ye,ee,xe,ue);g.generateMipmaps=!1}else if(I){if(ae){let Q=at(j);n.texStorage2D(e.TEXTURE_2D,fe,ye,Q.width,Q.height)}if(ne)n.texSubImage2D(e.TEXTURE_2D,0,0,0,ee,xe,j)}else n.texImage2D(e.TEXTURE_2D,0,ye,ee,xe,j);if(f(g))p(q);if(_e.__version=W.version,g.onUpdate)g.onUpdate(g)}y.__version=g.version}function re(y,g,F){if(g.image.length!==6)return;let q=ut(y,g),J=g.source;n.bindTexture(e.TEXTURE_CUBE_MAP,y.__webglTexture,e.TEXTURE0+F);let W=i.get(J);if(J.version!==W.__version||q===!0){n.activeTexture(e.TEXTURE0+F);let _e=Ge.getPrimaries(Ge.workingColorSpace),se=g.colorSpace===_i?null:Ge.getPrimaries(g.colorSpace),Ae=g.colorSpace===_i||_e===se?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,g.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,g.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,g.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ae);let Pe=g.isCompressedTexture||g.image[0].isCompressedTexture,j=g.image[0]&&g.image[0].isDataTexture,ee=[];for(let V=0;V<6;V++){if(!Pe&&!j)ee[V]=x(g.image[V],!0,s.maxCubemapSize);else ee[V]=j?g.image[V].image:g.image[V];ee[V]=Te(g,ee[V])}let xe=ee[0],ye=r.convert(g.format,g.colorSpace),ue=r.convert(g.type),ke=M(g.internalFormat,ye,ue,g.colorSpace),I=g.isVideoTexture!==!0,ae=W.__version===void 0||q===!0,ne=J.dataReady,fe=R(g,xe);Ue(e.TEXTURE_CUBE_MAP,g);let Q;if(Pe){if(I&&ae)n.texStorage2D(e.TEXTURE_CUBE_MAP,fe,ke,xe.width,xe.height);for(let V=0;V<6;V++){Q=ee[V].mipmaps;for(let ve=0;ve<Q.length;ve++){let De=Q[ve];if(g.format!==mn)if(ye!==null)if(I){if(ne)n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+V,ve,0,0,De.width,De.height,ye,De.data)}else n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+V,ve,ke,De.width,De.height,0,De.data);else be("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()");else if(I){if(ne)n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+V,ve,0,0,De.width,De.height,ye,ue,De.data)}else n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+V,ve,ke,De.width,De.height,0,ye,ue,De.data)}}}else{if(Q=g.mipmaps,I&&ae){if(Q.length>0)fe++;let V=at(ee[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,fe,ke,V.width,V.height)}for(let V=0;V<6;V++)if(j){if(I){if(ne)n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+V,0,0,0,ee[V].width,ee[V].height,ye,ue,ee[V].data)}else n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+V,0,ke,ee[V].width,ee[V].height,0,ye,ue,ee[V].data);for(let ve=0;ve<Q.length;ve++){let ot=Q[ve].image[V].image;if(I){if(ne)n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+V,ve+1,0,0,ot.width,ot.height,ye,ue,ot.data)}else n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+V,ve+1,ke,ot.width,ot.height,0,ye,ue,ot.data)}}else{if(I){if(ne)n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+V,0,0,0,ye,ue,ee[V])}else n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+V,0,ke,ye,ue,ee[V]);for(let ve=0;ve<Q.length;ve++){let De=Q[ve];if(I){if(ne)n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+V,ve+1,0,0,ye,ue,De.image[V])}else n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+V,ve+1,ke,ye,ue,De.image[V])}}}if(f(g))p(e.TEXTURE_CUBE_MAP);if(W.__version=J.version,g.onUpdate)g.onUpdate(g)}y.__version=g.version}function Ce(y,g,F,q,J,W){let _e=r.convert(F.format,F.colorSpace),se=r.convert(F.type),Ae=M(F.internalFormat,_e,se,F.colorSpace),Pe=i.get(g),j=i.get(F);if(j.__renderTarget=g,!Pe.__hasExternalTextures){let ee=Math.max(1,g.width>>W),xe=Math.max(1,g.height>>W);if(J===e.TEXTURE_3D||J===e.TEXTURE_2D_ARRAY)n.texImage3D(J,W,Ae,ee,xe,g.depth,0,_e,se,null);else n.texImage2D(J,W,Ae,ee,xe,0,_e,se,null)}if(n.bindFramebuffer(e.FRAMEBUFFER,y),ze(g))o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,q,J,j.__webglTexture,0,wt(g));else if(J===e.TEXTURE_2D||J>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&J<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)e.framebufferTexture2D(e.FRAMEBUFFER,q,J,j.__webglTexture,W);n.bindFramebuffer(e.FRAMEBUFFER,null)}function Ie(y,g,F){if(e.bindRenderbuffer(e.RENDERBUFFER,y),g.depthBuffer){let q=g.depthTexture,J=q&&q.isDepthTexture?q.type:null,W=b(g.stencilBuffer,J),_e=g.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(ze(g))o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,wt(g),W,g.width,g.height);else if(F)e.renderbufferStorageMultisample(e.RENDERBUFFER,wt(g),W,g.width,g.height);else e.renderbufferStorage(e.RENDERBUFFER,W,g.width,g.height);e.framebufferRenderbuffer(e.FRAMEBUFFER,_e,e.RENDERBUFFER,y)}else{let q=g.textures;for(let J=0;J<q.length;J++){let W=q[J],_e=r.convert(W.format,W.colorSpace),se=r.convert(W.type),Ae=M(W.internalFormat,_e,se,W.colorSpace);if(ze(g))o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,wt(g),Ae,g.width,g.height);else if(F)e.renderbufferStorageMultisample(e.RENDERBUFFER,wt(g),Ae,g.width,g.height);else e.renderbufferStorage(e.RENDERBUFFER,Ae,g.width,g.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function Ne(y,g,F){let q=g.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,y),!(g.depthTexture&&g.depthTexture.isDepthTexture))throw Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let J=i.get(g.depthTexture);if(J.__renderTarget=g,!J.__webglTexture||g.depthTexture.image.width!==g.width||g.depthTexture.image.height!==g.height)g.depthTexture.image.width=g.width,g.depthTexture.image.height=g.height,g.depthTexture.needsUpdate=!0;if(q){if(J.__webglInit===void 0)J.__webglInit=!0,g.depthTexture.addEventListener("dispose",E);if(J.__webglTexture===void 0){J.__webglTexture=e.createTexture(),n.bindTexture(e.TEXTURE_CUBE_MAP,J.__webglTexture),Ue(e.TEXTURE_CUBE_MAP,g.depthTexture);let Pe=r.convert(g.depthTexture.format),j=r.convert(g.depthTexture.type),ee;if(g.depthTexture.format===mi)ee=e.DEPTH_COMPONENT24;else if(g.depthTexture.format===gi)ee=e.DEPTH24_STENCIL8;for(let xe=0;xe<6;xe++)e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+xe,0,ee,g.width,g.height,0,Pe,j,null)}}else K(g.depthTexture,0);let W=J.__webglTexture,_e=wt(g),se=q?e.TEXTURE_CUBE_MAP_POSITIVE_X+F:e.TEXTURE_2D,Ae=g.depthTexture.format===gi?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(g.depthTexture.format===mi)if(ze(g))o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,Ae,se,W,0,_e);else e.framebufferTexture2D(e.FRAMEBUFFER,Ae,se,W,0);else if(g.depthTexture.format===gi)if(ze(g))o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,Ae,se,W,0,_e);else e.framebufferTexture2D(e.FRAMEBUFFER,Ae,se,W,0);else throw Error("Unknown depthTexture format")}function mt(y){let g=i.get(y),F=y.isWebGLCubeRenderTarget===!0;if(g.__boundDepthTexture!==y.depthTexture){let q=y.depthTexture;if(g.__depthDisposeCallback)g.__depthDisposeCallback();if(q){let J=()=>{delete g.__boundDepthTexture,delete g.__depthDisposeCallback,q.removeEventListener("dispose",J)};q.addEventListener("dispose",J),g.__depthDisposeCallback=J}g.__boundDepthTexture=q}if(y.depthTexture&&!g.__autoAllocateDepthBuffer)if(F)for(let q=0;q<6;q++)Ne(g.__webglFramebuffer[q],y,q);else{let q=y.texture.mipmaps;if(q&&q.length>0)Ne(g.__webglFramebuffer[0],y,0);else Ne(g.__webglFramebuffer,y,0)}else if(F){g.__webglDepthbuffer=[];for(let q=0;q<6;q++)if(n.bindFramebuffer(e.FRAMEBUFFER,g.__webglFramebuffer[q]),g.__webglDepthbuffer[q]===void 0)g.__webglDepthbuffer[q]=e.createRenderbuffer(),Ie(g.__webglDepthbuffer[q],y,!1);else{let J=y.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,W=g.__webglDepthbuffer[q];e.bindRenderbuffer(e.RENDERBUFFER,W),e.framebufferRenderbuffer(e.FRAMEBUFFER,J,e.RENDERBUFFER,W)}}else{let q=y.texture.mipmaps;if(q&&q.length>0)n.bindFramebuffer(e.FRAMEBUFFER,g.__webglFramebuffer[0]);else n.bindFramebuffer(e.FRAMEBUFFER,g.__webglFramebuffer);if(g.__webglDepthbuffer===void 0)g.__webglDepthbuffer=e.createRenderbuffer(),Ie(g.__webglDepthbuffer,y,!1);else{let J=y.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,W=g.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,W),e.framebufferRenderbuffer(e.FRAMEBUFFER,J,e.RENDERBUFFER,W)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function qe(y,g,F){let q=i.get(y);if(g!==void 0)Ce(q.__webglFramebuffer,y,y.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0);if(F!==void 0)mt(y)}function Je(y){let g=y.texture,F=i.get(y),q=i.get(g);y.addEventListener("dispose",P);let J=y.textures,W=y.isWebGLCubeRenderTarget===!0,_e=J.length>1;if(!_e){if(q.__webglTexture===void 0)q.__webglTexture=e.createTexture();q.__version=g.version,a.memory.textures++}if(W){F.__webglFramebuffer=[];for(let se=0;se<6;se++)if(g.mipmaps&&g.mipmaps.length>0){F.__webglFramebuffer[se]=[];for(let Ae=0;Ae<g.mipmaps.length;Ae++)F.__webglFramebuffer[se][Ae]=e.createFramebuffer()}else F.__webglFramebuffer[se]=e.createFramebuffer()}else{if(g.mipmaps&&g.mipmaps.length>0){F.__webglFramebuffer=[];for(let se=0;se<g.mipmaps.length;se++)F.__webglFramebuffer[se]=e.createFramebuffer()}else F.__webglFramebuffer=e.createFramebuffer();if(_e)for(let se=0,Ae=J.length;se<Ae;se++){let Pe=i.get(J[se]);if(Pe.__webglTexture===void 0)Pe.__webglTexture=e.createTexture(),a.memory.textures++}if(y.samples>0&&ze(y)===!1){F.__webglMultisampledFramebuffer=e.createFramebuffer(),F.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,F.__webglMultisampledFramebuffer);for(let se=0;se<J.length;se++){let Ae=J[se];F.__webglColorRenderbuffer[se]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,F.__webglColorRenderbuffer[se]);let Pe=r.convert(Ae.format,Ae.colorSpace),j=r.convert(Ae.type),ee=M(Ae.internalFormat,Pe,j,Ae.colorSpace,y.isXRRenderTarget===!0),xe=wt(y);e.renderbufferStorageMultisample(e.RENDERBUFFER,xe,ee,y.width,y.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+se,e.RENDERBUFFER,F.__webglColorRenderbuffer[se])}if(e.bindRenderbuffer(e.RENDERBUFFER,null),y.depthBuffer)F.__webglDepthRenderbuffer=e.createRenderbuffer(),Ie(F.__webglDepthRenderbuffer,y,!0);n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(W){n.bindTexture(e.TEXTURE_CUBE_MAP,q.__webglTexture),Ue(e.TEXTURE_CUBE_MAP,g);for(let se=0;se<6;se++)if(g.mipmaps&&g.mipmaps.length>0)for(let Ae=0;Ae<g.mipmaps.length;Ae++)Ce(F.__webglFramebuffer[se][Ae],y,g,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+se,Ae);else Ce(F.__webglFramebuffer[se],y,g,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+se,0);if(f(g))p(e.TEXTURE_CUBE_MAP);n.unbindTexture()}else if(_e){for(let se=0,Ae=J.length;se<Ae;se++){let Pe=J[se],j=i.get(Pe),ee=e.TEXTURE_2D;if(y.isWebGL3DRenderTarget||y.isWebGLArrayRenderTarget)ee=y.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY;if(n.bindTexture(ee,j.__webglTexture),Ue(ee,Pe),Ce(F.__webglFramebuffer,y,Pe,e.COLOR_ATTACHMENT0+se,ee,0),f(Pe))p(ee)}n.unbindTexture()}else{let se=e.TEXTURE_2D;if(y.isWebGL3DRenderTarget||y.isWebGLArrayRenderTarget)se=y.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY;if(n.bindTexture(se,q.__webglTexture),Ue(se,g),g.mipmaps&&g.mipmaps.length>0)for(let Ae=0;Ae<g.mipmaps.length;Ae++)Ce(F.__webglFramebuffer[Ae],y,g,e.COLOR_ATTACHMENT0,se,Ae);else Ce(F.__webglFramebuffer,y,g,e.COLOR_ATTACHMENT0,se,0);if(f(g))p(se);n.unbindTexture()}if(y.depthBuffer)mt(y)}function st(y){let g=y.textures;for(let F=0,q=g.length;F<q;F++){let J=g[F];if(f(J)){let W=A(y),_e=i.get(J).__webglTexture;n.bindTexture(W,_e),p(W),n.unbindTexture()}}}let He=[],gt=[];function w(y){if(y.samples>0){if(ze(y)===!1){let{textures:g,width:F,height:q}=y,J=e.COLOR_BUFFER_BIT,W=y.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,_e=i.get(y),se=g.length>1;if(se)for(let Pe=0;Pe<g.length;Pe++)n.bindFramebuffer(e.FRAMEBUFFER,_e.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+Pe,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,_e.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+Pe,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,_e.__webglMultisampledFramebuffer);let Ae=y.texture.mipmaps;if(Ae&&Ae.length>0)n.bindFramebuffer(e.DRAW_FRAMEBUFFER,_e.__webglFramebuffer[0]);else n.bindFramebuffer(e.DRAW_FRAMEBUFFER,_e.__webglFramebuffer);for(let Pe=0;Pe<g.length;Pe++){if(y.resolveDepthBuffer){if(y.depthBuffer)J|=e.DEPTH_BUFFER_BIT;if(y.stencilBuffer&&y.resolveStencilBuffer)J|=e.STENCIL_BUFFER_BIT}if(se){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,_e.__webglColorRenderbuffer[Pe]);let j=i.get(g[Pe]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,j,0)}if(e.blitFramebuffer(0,0,F,q,0,0,F,q,J,e.NEAREST),l===!0){if(He.length=0,gt.length=0,He.push(e.COLOR_ATTACHMENT0+Pe),y.depthBuffer&&y.resolveDepthBuffer===!1)He.push(W),gt.push(W),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,gt);e.invalidateFramebuffer(e.READ_FRAMEBUFFER,He)}}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),se)for(let Pe=0;Pe<g.length;Pe++){n.bindFramebuffer(e.FRAMEBUFFER,_e.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+Pe,e.RENDERBUFFER,_e.__webglColorRenderbuffer[Pe]);let j=i.get(g[Pe]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,_e.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+Pe,e.TEXTURE_2D,j,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,_e.__webglMultisampledFramebuffer)}else if(y.depthBuffer&&y.resolveDepthBuffer===!1&&l){let g=y.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[g])}}}function wt(y){return Math.min(s.maxSamples,y.samples)}function ze(y){let g=i.get(y);return y.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&g.__useRenderToTexture!==!1}function ht(y){let g=a.render.frame;if(h.get(y)!==g)h.set(y,g),y.update()}function Te(y,g){let{colorSpace:F,format:q,type:J}=y;if(y.isCompressedTexture===!0||y.isVideoTexture===!0)return g;if(F!==Ft&&F!==_i)if(Ge.getTransfer(F)===et){if(q!==mn||J!==un)be("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.")}else Re("WebGLTextures: Unsupported texture color space:",F);return g}function at(y){if(typeof HTMLImageElement<"u"&&y instanceof HTMLImageElement)c.width=y.naturalWidth||y.width,c.height=y.naturalHeight||y.height;else if(typeof VideoFrame<"u"&&y instanceof VideoFrame)c.width=y.displayWidth,c.height=y.displayHeight;else c.width=y.width,c.height=y.height;return c}this.allocateTextureUnit=X,this.resetTextureUnits=k,this.setTexture2D=K,this.setTexture2DArray=H,this.setTexture3D=O,this.setTextureCube=Y,this.rebindTextures=qe,this.setupRenderTarget=Je,this.updateRenderTargetMipmap=st,this.updateMultisampleRenderTarget=w,this.setupDepthRenderbuffer=mt,this.setupFrameBufferTexture=Ce,this.useMultisampledRTT=ze,this.isReversedDepthBuffer=function(){return n.buffers.depth.getReversed()}}function $_(e,t){function n(i,s=_i){let r,a=Ge.getTransfer(s);if(i===un)return e.UNSIGNED_BYTE;if(i===go)return e.UNSIGNED_SHORT_4_4_4_4;if(i===_o)return e.UNSIGNED_SHORT_5_5_5_1;if(i===vh)return e.UNSIGNED_INT_5_9_9_9_REV;if(i===yh)return e.UNSIGNED_INT_10F_11F_11F_REV;if(i===_h)return e.BYTE;if(i===xh)return e.SHORT;if(i===Gs)return e.UNSIGNED_SHORT;if(i===mo)return e.INT;if(i===Zn)return e.UNSIGNED_INT;if(i===Nn)return e.FLOAT;if(i===Ut)return e.HALF_FLOAT;if(i===Mh)return e.ALPHA;if(i===Sh)return e.RGB;if(i===mn)return e.RGBA;if(i===mi)return e.DEPTH_COMPONENT;if(i===gi)return e.DEPTH_STENCIL;if(i===bh)return e.RED;if(i===xo)return e.RED_INTEGER;if(i===ns)return e.RG;if(i===vo)return e.RG_INTEGER;if(i===yo)return e.RGBA_INTEGER;if(i===Qr||i===ea||i===ta||i===na)if(a===et)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===Qr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===ea)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===ta)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===na)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===Qr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===ea)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===ta)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===na)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Mo||i===So||i===bo||i===To)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Mo)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===So)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===bo)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===To)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Ao||i===Eo||i===wo||i===Co||i===Ro||i===Io||i===Po)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Ao||i===Eo)return a===et?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===wo)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===Co)return r.COMPRESSED_R11_EAC;if(i===Ro)return r.COMPRESSED_SIGNED_R11_EAC;if(i===Io)return r.COMPRESSED_RG11_EAC;if(i===Po)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===Lo||i===No||i===Do||i===Uo||i===Fo||i===Oo||i===Bo||i===zo||i===ko||i===Go||i===Ho||i===Vo||i===Wo||i===Xo)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(i===Lo)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===No)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Do)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Uo)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Fo)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Oo)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Bo)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===zo)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===ko)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Go)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Ho)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Vo)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Wo)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Xo)return a===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===qo||i===Yo||i===Zo)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(i===qo)return a===et?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Yo)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Zo)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Jo||i===Ko||i===$o||i===jo)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(i===Jo)return r.COMPRESSED_RED_RGTC1_EXT;if(i===Ko)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===$o)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===jo)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;if(i===ts)return e.UNSIGNED_INT_24_8;return e[i]!==void 0?e[i]:null}return{convert:n}}var j_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Q_=`
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

}`;class Mu{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new va(e.texture);if(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)this.depthNear=e.depthNear,this.depthFar=e.depthFar;this.texture=n}}getMesh(e){if(this.texture!==null){if(this.mesh===null){let t=e.cameras[0].viewport,n=new vt({vertexShader:j_,fragmentShader:Q_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new nt(new Qs(20,20),n)}}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Su extends Jn{constructor(e,t){super();let n=this,i=null,s=1,r=null,a="local-floor",o=1,l=null,c=null,h=null,u=null,d=null,m=null,_=typeof XRWebGLBinding<"u",x=new Mu,f={},p=t.getContextAttributes(),A=null,M=null,b=[],R=[],E=new Me,P=null,N=new yt;N.viewport=new ct;let T=new yt;T.viewport=new ct;let S=[N,T],C=new Ml,k=null,X=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Z){let le=b[Z];if(le===void 0)le=new Ws,b[Z]=le;return le.getTargetRaySpace()},this.getControllerGrip=function(Z){let le=b[Z];if(le===void 0)le=new Ws,b[Z]=le;return le.getGripSpace()},this.getHand=function(Z){let le=b[Z];if(le===void 0)le=new Ws,b[Z]=le;return le.getHandSpace()};function G(Z){let le=R.indexOf(Z.inputSource);if(le===-1)return;let re=b[le];if(re!==void 0)re.update(Z.inputSource,Z.frame,l||r),re.dispatchEvent({type:Z.type,data:Z.inputSource})}function K(){i.removeEventListener("select",G),i.removeEventListener("selectstart",G),i.removeEventListener("selectend",G),i.removeEventListener("squeeze",G),i.removeEventListener("squeezestart",G),i.removeEventListener("squeezeend",G),i.removeEventListener("end",K),i.removeEventListener("inputsourceschange",H);for(let Z=0;Z<b.length;Z++){let le=R[Z];if(le===null)continue;R[Z]=null,b[Z].disconnect(le)}k=null,X=null,x.reset();for(let Z in f)delete f[Z];e.setRenderTarget(A),d=null,u=null,h=null,i=null,M=null,it.stop(),n.isPresenting=!1,e.setPixelRatio(P),e.setSize(E.width,E.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Z){if(s=Z,n.isPresenting===!0)be("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Z){if(a=Z,n.isPresenting===!0)be("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||r},this.setReferenceSpace=function(Z){l=Z},this.getBaseLayer=function(){return u!==null?u:d},this.getBinding=function(){if(h===null&&_)h=new XRWebGLBinding(i,t);return h},this.getFrame=function(){return m},this.getSession=function(){return i},this.setSession=async function(Z){if(i=Z,i!==null){if(A=e.getRenderTarget(),i.addEventListener("select",G),i.addEventListener("selectstart",G),i.addEventListener("selectend",G),i.addEventListener("squeeze",G),i.addEventListener("squeezestart",G),i.addEventListener("squeezeend",G),i.addEventListener("end",K),i.addEventListener("inputsourceschange",H),p.xrCompatible!==!0)await t.makeXRCompatible();if(P=e.getPixelRatio(),e.getSize(E),!(_&&("createProjectionLayer"in XRWebGLBinding.prototype))){let re={antialias:p.antialias,alpha:!0,depth:p.depth,stencil:p.stencil,framebufferScaleFactor:s};d=new XRWebGLLayer(i,t,re),i.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),M=new Et(d.framebufferWidth,d.framebufferHeight,{format:mn,type:un,colorSpace:e.outputColorSpace,stencilBuffer:p.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{let re=null,Ce=null,Ie=null;if(p.depth)Ie=p.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,re=p.stencil?gi:mi,Ce=p.stencil?ts:Zn;let Ne={colorFormat:t.RGBA8,depthFormat:Ie,scaleFactor:s};h=this.getBinding(),u=h.createProjectionLayer(Ne),i.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),M=new Et(u.textureWidth,u.textureHeight,{format:mn,type:un,depthTexture:new vi(u.textureWidth,u.textureHeight,Ce,void 0,void 0,void 0,void 0,void 0,void 0,re),stencilBuffer:p.stencil,colorSpace:e.outputColorSpace,samples:p.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1})}M.isXRRenderTarget=!0,this.setFoveation(o),l=null,r=await i.requestReferenceSpace(a),it.setContext(i),it.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return x.getDepthTexture()};function H(Z){for(let le=0;le<Z.removed.length;le++){let re=Z.removed[le],Ce=R.indexOf(re);if(Ce>=0)R[Ce]=null,b[Ce].disconnect(re)}for(let le=0;le<Z.added.length;le++){let re=Z.added[le],Ce=R.indexOf(re);if(Ce===-1){for(let Ne=0;Ne<b.length;Ne++)if(Ne>=R.length){R.push(re),Ce=Ne;break}else if(R[Ne]===null){R[Ne]=re,Ce=Ne;break}if(Ce===-1)break}let Ie=b[Ce];if(Ie)Ie.connect(re)}}let O=new L,Y=new L;function te(Z,le,re){O.setFromMatrixPosition(le.matrixWorld),Y.setFromMatrixPosition(re.matrixWorld);let Ce=O.distanceTo(Y),Ie=le.projectionMatrix.elements,Ne=re.projectionMatrix.elements,mt=Ie[14]/(Ie[10]-1),qe=Ie[14]/(Ie[10]+1),Je=(Ie[9]+1)/Ie[5],st=(Ie[9]-1)/Ie[5],He=(Ie[8]-1)/Ie[0],gt=(Ne[8]+1)/Ne[0],w=mt*He,wt=mt*gt,ze=Ce/(-He+gt),ht=ze*-He;if(le.matrixWorld.decompose(Z.position,Z.quaternion,Z.scale),Z.translateX(ht),Z.translateZ(ze),Z.matrixWorld.compose(Z.position,Z.quaternion,Z.scale),Z.matrixWorldInverse.copy(Z.matrixWorld).invert(),Ie[10]===-1)Z.projectionMatrix.copy(le.projectionMatrix),Z.projectionMatrixInverse.copy(le.projectionMatrixInverse);else{let Te=mt+ze,at=qe+ze,y=w-ht,g=wt+(Ce-ht),F=Je*qe/at*Te,q=st*qe/at*Te;Z.projectionMatrix.makePerspective(y,g,F,q,Te,at),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert()}}function ie(Z,le){if(le===null)Z.matrixWorld.copy(Z.matrix);else Z.matrixWorld.multiplyMatrices(le.matrixWorld,Z.matrix);Z.matrixWorldInverse.copy(Z.matrixWorld).invert()}this.updateCamera=function(Z){if(i===null)return;let{near:le,far:re}=Z;if(x.texture!==null){if(x.depthNear>0)le=x.depthNear;if(x.depthFar>0)re=x.depthFar}if(C.near=T.near=N.near=le,C.far=T.far=N.far=re,k!==C.near||X!==C.far)i.updateRenderState({depthNear:C.near,depthFar:C.far}),k=C.near,X=C.far;C.layers.mask=Z.layers.mask|6,N.layers.mask=C.layers.mask&3,T.layers.mask=C.layers.mask&5;let Ce=Z.parent,Ie=C.cameras;ie(C,Ce);for(let Ne=0;Ne<Ie.length;Ne++)ie(Ie[Ne],Ce);if(Ie.length===2)te(C,N,T);else C.projectionMatrix.copy(N.projectionMatrix);ge(Z,C,Ce)};function ge(Z,le,re){if(re===null)Z.matrix.copy(le.matrixWorld);else Z.matrix.copy(re.matrixWorld),Z.matrix.invert(),Z.matrix.multiply(le.matrixWorld);if(Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.updateMatrixWorld(!0),Z.projectionMatrix.copy(le.projectionMatrix),Z.projectionMatrixInverse.copy(le.projectionMatrixInverse),Z.isPerspectiveCamera)Z.fov=ci*2*Math.atan(1/Z.projectionMatrix.elements[5]),Z.zoom=1}this.getCamera=function(){return C},this.getFoveation=function(){if(u===null&&d===null)return;return o},this.setFoveation=function(Z){if(o=Z,u!==null)u.fixedFoveation=Z;if(d!==null&&d.fixedFoveation!==void 0)d.fixedFoveation=Z},this.hasDepthSensing=function(){return x.texture!==null},this.getDepthSensingMesh=function(){return x.getMesh(C)},this.getCameraTexture=function(Z){return f[Z]};let Ue=null;function ut(Z,le){if(c=le.getViewerPose(l||r),m=le,c!==null){let re=c.views;if(d!==null)e.setRenderTargetFramebuffer(M,d.framebuffer),e.setRenderTarget(M);let Ce=!1;if(re.length!==C.cameras.length)C.cameras.length=0,Ce=!0;for(let qe=0;qe<re.length;qe++){let Je=re[qe],st=null;if(d!==null)st=d.getViewport(Je);else{let gt=h.getViewSubImage(u,Je);if(st=gt.viewport,qe===0)e.setRenderTargetTextures(M,gt.colorTexture,gt.depthStencilTexture),e.setRenderTarget(M)}let He=S[qe];if(He===void 0)He=new yt,He.layers.enable(qe),He.viewport=new ct,S[qe]=He;if(He.matrix.fromArray(Je.transform.matrix),He.matrix.decompose(He.position,He.quaternion,He.scale),He.projectionMatrix.fromArray(Je.projectionMatrix),He.projectionMatrixInverse.copy(He.projectionMatrix).invert(),He.viewport.set(st.x,st.y,st.width,st.height),qe===0)C.matrix.copy(He.matrix),C.matrix.decompose(C.position,C.quaternion,C.scale);if(Ce===!0)C.cameras.push(He)}let Ie=i.enabledFeatures;if(Ie&&Ie.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&_){h=n.getBinding();let qe=h.getDepthInformation(re[0]);if(qe&&qe.isValid&&qe.texture)x.init(qe,i.renderState)}if(Ie&&Ie.includes("camera-access")&&_){e.state.unbindTexture(),h=n.getBinding();for(let qe=0;qe<re.length;qe++){let Je=re[qe].camera;if(Je){let st=f[Je];if(!st)st=new va,f[Je]=st;let He=h.getCameraImage(Je);st.sourceTexture=He}}}}for(let re=0;re<b.length;re++){let Ce=R[re],Ie=b[re];if(Ce!==null&&Ie!==void 0)Ie.update(Ce,le,l||r)}if(Ue)Ue(Z,le);if(le.detectedPlanes)n.dispatchEvent({type:"planesdetected",data:le});m=null}let it=new uu;it.setAnimationLoop(ut),this.setAnimationLoop=function(Z){Ue=Z},this.dispose=function(){}}}var Mi=new $t,e0=new Fe;function t0(e,t){function n(f,p){if(f.matrixAutoUpdate===!0)f.updateMatrix();p.value.copy(f.matrix)}function i(f,p){if(p.color.getRGB(f.fogColor.value,hl(e)),p.isFog)f.fogNear.value=p.near,f.fogFar.value=p.far;else if(p.isFogExp2)f.fogDensity.value=p.density}function s(f,p,A,M,b){if(p.isMeshBasicMaterial)r(f,p);else if(p.isMeshLambertMaterial)r(f,p);else if(p.isMeshToonMaterial)r(f,p),u(f,p);else if(p.isMeshPhongMaterial)r(f,p),h(f,p);else if(p.isMeshStandardMaterial){if(r(f,p),d(f,p),p.isMeshPhysicalMaterial)m(f,p,b)}else if(p.isMeshMatcapMaterial)r(f,p),_(f,p);else if(p.isMeshDepthMaterial)r(f,p);else if(p.isMeshDistanceMaterial)r(f,p),x(f,p);else if(p.isMeshNormalMaterial)r(f,p);else if(p.isLineBasicMaterial){if(a(f,p),p.isLineDashedMaterial)o(f,p)}else if(p.isPointsMaterial)l(f,p,A,M);else if(p.isSpriteMaterial)c(f,p);else if(p.isShadowMaterial)f.color.value.copy(p.color),f.opacity.value=p.opacity;else if(p.isShaderMaterial)p.uniformsNeedUpdate=!1}function r(f,p){if(f.opacity.value=p.opacity,p.color)f.diffuse.value.copy(p.color);if(p.emissive)f.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity);if(p.map)f.map.value=p.map,n(p.map,f.mapTransform);if(p.alphaMap)f.alphaMap.value=p.alphaMap,n(p.alphaMap,f.alphaMapTransform);if(p.bumpMap){if(f.bumpMap.value=p.bumpMap,n(p.bumpMap,f.bumpMapTransform),f.bumpScale.value=p.bumpScale,p.side===Dt)f.bumpScale.value*=-1}if(p.normalMap){if(f.normalMap.value=p.normalMap,n(p.normalMap,f.normalMapTransform),f.normalScale.value.copy(p.normalScale),p.side===Dt)f.normalScale.value.negate()}if(p.displacementMap)f.displacementMap.value=p.displacementMap,n(p.displacementMap,f.displacementMapTransform),f.displacementScale.value=p.displacementScale,f.displacementBias.value=p.displacementBias;if(p.emissiveMap)f.emissiveMap.value=p.emissiveMap,n(p.emissiveMap,f.emissiveMapTransform);if(p.specularMap)f.specularMap.value=p.specularMap,n(p.specularMap,f.specularMapTransform);if(p.alphaTest>0)f.alphaTest.value=p.alphaTest;let A=t.get(p),{envMap:M,envMapRotation:b}=A;if(M){if(f.envMap.value=M,Mi.copy(b),Mi.x*=-1,Mi.y*=-1,Mi.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1)Mi.y*=-1,Mi.z*=-1;f.envMapRotation.value.setFromMatrix4(e0.makeRotationFromEuler(Mi)),f.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,f.reflectivity.value=p.reflectivity,f.ior.value=p.ior,f.refractionRatio.value=p.refractionRatio}if(p.lightMap)f.lightMap.value=p.lightMap,f.lightMapIntensity.value=p.lightMapIntensity,n(p.lightMap,f.lightMapTransform);if(p.aoMap)f.aoMap.value=p.aoMap,f.aoMapIntensity.value=p.aoMapIntensity,n(p.aoMap,f.aoMapTransform)}function a(f,p){if(f.diffuse.value.copy(p.color),f.opacity.value=p.opacity,p.map)f.map.value=p.map,n(p.map,f.mapTransform)}function o(f,p){f.dashSize.value=p.dashSize,f.totalSize.value=p.dashSize+p.gapSize,f.scale.value=p.scale}function l(f,p,A,M){if(f.diffuse.value.copy(p.color),f.opacity.value=p.opacity,f.size.value=p.size*A,f.scale.value=M*0.5,p.map)f.map.value=p.map,n(p.map,f.uvTransform);if(p.alphaMap)f.alphaMap.value=p.alphaMap,n(p.alphaMap,f.alphaMapTransform);if(p.alphaTest>0)f.alphaTest.value=p.alphaTest}function c(f,p){if(f.diffuse.value.copy(p.color),f.opacity.value=p.opacity,f.rotation.value=p.rotation,p.map)f.map.value=p.map,n(p.map,f.mapTransform);if(p.alphaMap)f.alphaMap.value=p.alphaMap,n(p.alphaMap,f.alphaMapTransform);if(p.alphaTest>0)f.alphaTest.value=p.alphaTest}function h(f,p){f.specular.value.copy(p.specular),f.shininess.value=Math.max(p.shininess,0.0001)}function u(f,p){if(p.gradientMap)f.gradientMap.value=p.gradientMap}function d(f,p){if(f.metalness.value=p.metalness,p.metalnessMap)f.metalnessMap.value=p.metalnessMap,n(p.metalnessMap,f.metalnessMapTransform);if(f.roughness.value=p.roughness,p.roughnessMap)f.roughnessMap.value=p.roughnessMap,n(p.roughnessMap,f.roughnessMapTransform);if(p.envMap)f.envMapIntensity.value=p.envMapIntensity}function m(f,p,A){if(f.ior.value=p.ior,p.sheen>0){if(f.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),f.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap)f.sheenColorMap.value=p.sheenColorMap,n(p.sheenColorMap,f.sheenColorMapTransform);if(p.sheenRoughnessMap)f.sheenRoughnessMap.value=p.sheenRoughnessMap,n(p.sheenRoughnessMap,f.sheenRoughnessMapTransform)}if(p.clearcoat>0){if(f.clearcoat.value=p.clearcoat,f.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap)f.clearcoatMap.value=p.clearcoatMap,n(p.clearcoatMap,f.clearcoatMapTransform);if(p.clearcoatRoughnessMap)f.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,n(p.clearcoatRoughnessMap,f.clearcoatRoughnessMapTransform);if(p.clearcoatNormalMap){if(f.clearcoatNormalMap.value=p.clearcoatNormalMap,n(p.clearcoatNormalMap,f.clearcoatNormalMapTransform),f.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Dt)f.clearcoatNormalScale.value.negate()}}if(p.dispersion>0)f.dispersion.value=p.dispersion;if(p.iridescence>0){if(f.iridescence.value=p.iridescence,f.iridescenceIOR.value=p.iridescenceIOR,f.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],f.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap)f.iridescenceMap.value=p.iridescenceMap,n(p.iridescenceMap,f.iridescenceMapTransform);if(p.iridescenceThicknessMap)f.iridescenceThicknessMap.value=p.iridescenceThicknessMap,n(p.iridescenceThicknessMap,f.iridescenceThicknessMapTransform)}if(p.transmission>0){if(f.transmission.value=p.transmission,f.transmissionSamplerMap.value=A.texture,f.transmissionSamplerSize.value.set(A.width,A.height),p.transmissionMap)f.transmissionMap.value=p.transmissionMap,n(p.transmissionMap,f.transmissionMapTransform);if(f.thickness.value=p.thickness,p.thicknessMap)f.thicknessMap.value=p.thicknessMap,n(p.thicknessMap,f.thicknessMapTransform);f.attenuationDistance.value=p.attenuationDistance,f.attenuationColor.value.copy(p.attenuationColor)}if(p.anisotropy>0){if(f.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap)f.anisotropyMap.value=p.anisotropyMap,n(p.anisotropyMap,f.anisotropyMapTransform)}if(f.specularIntensity.value=p.specularIntensity,f.specularColor.value.copy(p.specularColor),p.specularColorMap)f.specularColorMap.value=p.specularColorMap,n(p.specularColorMap,f.specularColorMapTransform);if(p.specularIntensityMap)f.specularIntensityMap.value=p.specularIntensityMap,n(p.specularIntensityMap,f.specularIntensityMapTransform)}function _(f,p){if(p.matcap)f.matcap.value=p.matcap}function x(f,p){let A=t.get(p).light;f.referencePosition.value.setFromMatrixPosition(A.matrixWorld),f.nearDistance.value=A.shadow.camera.near,f.farDistance.value=A.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function n0(e,t,n,i){let s={},r={},a=[],o=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function l(A,M){let b=M.program;i.uniformBlockBinding(A,b)}function c(A,M){let b=s[A.id];if(b===void 0)_(A),b=h(A),s[A.id]=b,A.addEventListener("dispose",f);let R=M.program;i.updateUBOMapping(A,R);let E=t.render.frame;if(r[A.id]!==E)d(A),r[A.id]=E}function h(A){let M=u();A.__bindingPointIndex=M;let b=e.createBuffer(),{__size:R,usage:E}=A;return e.bindBuffer(e.UNIFORM_BUFFER,b),e.bufferData(e.UNIFORM_BUFFER,R,E),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,M,b),b}function u(){for(let A=0;A<o;A++)if(a.indexOf(A)===-1)return a.push(A),A;return Re("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(A){let M=s[A.id],{uniforms:b,__cache:R}=A;e.bindBuffer(e.UNIFORM_BUFFER,M);for(let E=0,P=b.length;E<P;E++){let N=Array.isArray(b[E])?b[E]:[b[E]];for(let T=0,S=N.length;T<S;T++){let C=N[T];if(m(C,E,T,R)===!0){let k=C.__offset,X=Array.isArray(C.value)?C.value:[C.value],G=0;for(let K=0;K<X.length;K++){let H=X[K],O=x(H);if(typeof H==="number"||typeof H==="boolean")C.__data[0]=H,e.bufferSubData(e.UNIFORM_BUFFER,k+G,C.__data);else if(H.isMatrix3)C.__data[0]=H.elements[0],C.__data[1]=H.elements[1],C.__data[2]=H.elements[2],C.__data[3]=0,C.__data[4]=H.elements[3],C.__data[5]=H.elements[4],C.__data[6]=H.elements[5],C.__data[7]=0,C.__data[8]=H.elements[6],C.__data[9]=H.elements[7],C.__data[10]=H.elements[8],C.__data[11]=0;else H.toArray(C.__data,G),G+=O.storage/Float32Array.BYTES_PER_ELEMENT}e.bufferSubData(e.UNIFORM_BUFFER,k,C.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function m(A,M,b,R){let E=A.value,P=M+"_"+b;if(R[P]===void 0){if(typeof E==="number"||typeof E==="boolean")R[P]=E;else R[P]=E.clone();return!0}else{let N=R[P];if(typeof E==="number"||typeof E==="boolean"){if(N!==E)return R[P]=E,!0}else if(N.equals(E)===!1)return N.copy(E),!0}return!1}function _(A){let M=A.uniforms,b=0,R=16;for(let P=0,N=M.length;P<N;P++){let T=Array.isArray(M[P])?M[P]:[M[P]];for(let S=0,C=T.length;S<C;S++){let k=T[S],X=Array.isArray(k.value)?k.value:[k.value];for(let G=0,K=X.length;G<K;G++){let H=X[G],O=x(H),Y=b%R,te=Y%O.boundary,ie=Y+te;if(b+=te,ie!==0&&R-ie<O.storage)b+=R-ie;k.__data=new Float32Array(O.storage/Float32Array.BYTES_PER_ELEMENT),k.__offset=b,b+=O.storage}}}let E=b%R;if(E>0)b+=R-E;return A.__size=b,A.__cache={},this}function x(A){let M={boundary:0,storage:0};if(typeof A==="number"||typeof A==="boolean")M.boundary=4,M.storage=4;else if(A.isVector2)M.boundary=8,M.storage=8;else if(A.isVector3||A.isColor)M.boundary=16,M.storage=12;else if(A.isVector4)M.boundary=16,M.storage=16;else if(A.isMatrix3)M.boundary=48,M.storage=48;else if(A.isMatrix4)M.boundary=64,M.storage=64;else if(A.isTexture)be("WebGLRenderer: Texture samplers can not be part of an uniforms group.");else be("WebGLRenderer: Unsupported uniform value type.",A);return M}function f(A){let M=A.target;M.removeEventListener("dispose",f);let b=a.indexOf(M.__bindingPointIndex);a.splice(b,1),e.deleteBuffer(s[M.id]),delete s[M.id],delete r[M.id]}function p(){for(let A in s)e.deleteBuffer(s[A]);a=[],s={},r={}}return{bind:l,update:c,dispose:p}}var i0=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),_n=null;function s0(){if(_n===null)_n=new Zs(i0,16,16,ns,Ut),_n.name="DFG_LUT",_n.minFilter=Ct,_n.magFilter=Ct,_n.wrapS=Qi,_n.wrapT=Qi,_n.generateMipmaps=!1,_n.needsUpdate=!0;return _n}class Nl{constructor(e={}){let{canvas:t=Lh(),context:n=null,depth:i=!0,stencil:s=!1,alpha:r=!1,antialias:a=!1,premultipliedAlpha:o=!0,preserveDrawingBuffer:l=!1,powerPreference:c="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:u=!1,outputBufferType:d=un}=e;this.isWebGLRenderer=!0;let m;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=n.getContextAttributes().alpha}else m=r;let _=d,x=new Set([yo,vo,xo]),f=new Set([un,Zn,Gs,ts,go,_o]),p=new Uint32Array(4),A=new Int32Array(4),M=null,b=null,R=[],E=[],P=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=cn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let N=this,T=!1;this._outputColorSpace=gn;let S=0,C=0,k=null,X=-1,G=null,K=new ct,H=new ct,O=null,Y=new pe(0),te=0,{width:ie,height:ge}=t,Ue=1,ut=null,it=null,Z=new ct(0,0,ie,ge),le=new ct(0,0,ie,ge),re=!1,Ce=new Ks,Ie=!1,Ne=!1,mt=new Fe,qe=new L,Je=new ct,st={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},He=!1;function gt(){return k===null?Ue:1}let w=n;function wt(v,D){return t.getContext(v,D)}try{let v={alpha:!0,depth:i,stencil:s,antialias:a,premultipliedAlpha:o,preserveDrawingBuffer:l,powerPreference:c,failIfMajorPerformanceCaveat:h};if("setAttribute"in t)t.setAttribute("data-engine",`three.js r${Wc}`);if(t.addEventListener("webglcontextlost",ve,!1),t.addEventListener("webglcontextrestored",De,!1),t.addEventListener("webglcontextcreationerror",ot,!1),w===null){if(w=wt("webgl2",v),w===null)if(wt("webgl2"))throw Error("Error creating WebGL context with your selected attributes.");else throw Error("Error creating WebGL context.")}}catch(v){throw Re("WebGLRenderer: "+v.message),v}let ze,ht,Te,at,y,g,F,q,J,W,_e,se,Ae,Pe,j,ee,xe,ye,ue,ke,I,ae,ne,fe;function Q(){if(ze=new ug(w),ze.init(),ae=new $_(w,ze),ht=new ng(w,ze,e,ae),Te=new J_(w,ze),ht.reversedDepthBuffer&&u)Te.buffers.depth.setReversed(!0);at=new pg(w),y=new D_,g=new K_(w,ze,Te,y,ht,ae,at),F=new sg(N),q=new hg(N),J=new xf(w),ne=new eg(w,J),W=new dg(w,J,at,ne),_e=new gg(w,W,J,at),ue=new mg(w,ht,g),ee=new ig(y),se=new N_(N,F,q,ze,ht,ne,ee),Ae=new t0(N,y),Pe=new F_,j=new H_(ze),ye=new Qm(N,F,q,Te,_e,m,o),xe=new Y_(N,_e,ht),fe=new n0(w,at,ht,Te),ke=new tg(w,ze,at),I=new fg(w,ze,at),at.programs=se.programs,N.capabilities=ht,N.extensions=ze,N.properties=y,N.renderLists=Pe,N.shadowMap=xe,N.state=Te,N.info=at}if(Q(),_!==un)P=new xg(_,t.width,t.height,i,s);let V=new Su(N,w);this.xr=V,this.getContext=function(){return w},this.getContextAttributes=function(){return w.getContextAttributes()},this.forceContextLoss=function(){let v=ze.get("WEBGL_lose_context");if(v)v.loseContext()},this.forceContextRestore=function(){let v=ze.get("WEBGL_lose_context");if(v)v.restoreContext()},this.getPixelRatio=function(){return Ue},this.setPixelRatio=function(v){if(v===void 0)return;Ue=v,this.setSize(ie,ge,!1)},this.getSize=function(v){return v.set(ie,ge)},this.setSize=function(v,D,z=!0){if(V.isPresenting){be("WebGLRenderer: Can't change size while VR device is presenting.");return}if(ie=v,ge=D,t.width=Math.floor(v*Ue),t.height=Math.floor(D*Ue),z===!0)t.style.width=v+"px",t.style.height=D+"px";if(P!==null)P.setSize(t.width,t.height);this.setViewport(0,0,v,D)},this.getDrawingBufferSize=function(v){return v.set(ie*Ue,ge*Ue).floor()},this.setDrawingBufferSize=function(v,D,z){ie=v,ge=D,Ue=z,t.width=Math.floor(v*z),t.height=Math.floor(D*z),this.setViewport(0,0,v,D)},this.setEffects=function(v){if(_===un){console.error("THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(v){for(let D=0;D<v.length;D++)if(v[D].isOutputPass===!0){console.warn("THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}P.setEffects(v||[])},this.getCurrentViewport=function(v){return v.copy(K)},this.getViewport=function(v){return v.copy(Z)},this.setViewport=function(v,D,z,B){if(v.isVector4)Z.set(v.x,v.y,v.z,v.w);else Z.set(v,D,z,B);Te.viewport(K.copy(Z).multiplyScalar(Ue).round())},this.getScissor=function(v){return v.copy(le)},this.setScissor=function(v,D,z,B){if(v.isVector4)le.set(v.x,v.y,v.z,v.w);else le.set(v,D,z,B);Te.scissor(H.copy(le).multiplyScalar(Ue).round())},this.getScissorTest=function(){return re},this.setScissorTest=function(v){Te.setScissorTest(re=v)},this.setOpaqueSort=function(v){ut=v},this.setTransparentSort=function(v){it=v},this.getClearColor=function(v){return v.copy(ye.getClearColor())},this.setClearColor=function(){ye.setClearColor(...arguments)},this.getClearAlpha=function(){return ye.getClearAlpha()},this.setClearAlpha=function(){ye.setClearAlpha(...arguments)},this.clear=function(v=!0,D=!0,z=!0){let B=0;if(v){let U=!1;if(k!==null){let oe=k.texture.format;U=x.has(oe)}if(U){let oe=k.texture.type,de=f.has(oe),he=ye.getClearColor(),me=ye.getClearAlpha(),{r:Se,g:Le,b:Ee}=he;if(de)p[0]=Se,p[1]=Le,p[2]=Ee,p[3]=me,w.clearBufferuiv(w.COLOR,0,p);else A[0]=Se,A[1]=Le,A[2]=Ee,A[3]=me,w.clearBufferiv(w.COLOR,0,A)}else B|=w.COLOR_BUFFER_BIT}if(D)B|=w.DEPTH_BUFFER_BIT;if(z)B|=w.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295);w.clear(B)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",ve,!1),t.removeEventListener("webglcontextrestored",De,!1),t.removeEventListener("webglcontextcreationerror",ot,!1),ye.dispose(),Pe.dispose(),j.dispose(),y.dispose(),F.dispose(),q.dispose(),_e.dispose(),ne.dispose(),fe.dispose(),se.dispose(),V.dispose(),V.removeEventListener("sessionstart",Ql),V.removeEventListener("sessionend",ec),ii.stop()};function ve(v){v.preventDefault(),Is("WebGLRenderer: Context Lost."),T=!0}function De(){Is("WebGLRenderer: Context Restored."),T=!1;let v=at.autoReset,D=xe.enabled,z=xe.autoUpdate,B=xe.needsUpdate,U=xe.type;Q(),at.autoReset=v,xe.enabled=D,xe.autoUpdate=z,xe.needsUpdate=B,xe.type=U}function ot(v){Re("WebGLRenderer: A WebGL context could not be created. Reason: ",v.statusMessage)}function Ke(v){let D=v.target;D.removeEventListener("dispose",Ke),yn(D)}function yn(v){Mn(v),y.remove(v)}function Mn(v){let D=y.get(v).programs;if(D!==void 0){if(D.forEach(function(z){se.releaseProgram(z)}),v.isShaderMaterial)se.releaseShaderCache(v)}}this.renderBufferDirect=function(v,D,z,B,U,oe){if(D===null)D=st;let de=U.isMesh&&U.matrixWorld.determinant()<0,he=dd(v,D,z,B,U);Te.setMaterial(B,de);let me=z.index,Se=1;if(B.wireframe===!0){if(me=W.getWireframeAttribute(z),me===void 0)return;Se=2}let Le=z.drawRange,Ee=z.attributes.position,Ve=Le.start*Se,tt=(Le.start+Le.count)*Se;if(oe!==null)Ve=Math.max(Ve,oe.start*Se),tt=Math.min(tt,(oe.start+oe.count)*Se);if(me!==null)Ve=Math.max(Ve,0),tt=Math.min(tt,me.count);else if(Ee!==void 0&&Ee!==null)Ve=Math.max(Ve,0),tt=Math.min(tt,Ee.count);let dt=tt-Ve;if(dt<0||dt===1/0)return;ne.setup(U,B,he,z,me);let ft,rt=ke;if(me!==null)ft=J.get(me),rt=I,rt.setIndex(ft);if(U.isMesh)if(B.wireframe===!0)Te.setLineWidth(B.wireframeLinewidth*gt()),rt.setMode(w.LINES);else rt.setMode(w.TRIANGLES);else if(U.isLine){let we=B.linewidth;if(we===void 0)we=1;if(Te.setLineWidth(we*gt()),U.isLineSegments)rt.setMode(w.LINES);else if(U.isLineLoop)rt.setMode(w.LINE_LOOP);else rt.setMode(w.LINE_STRIP)}else if(U.isPoints)rt.setMode(w.POINTS);else if(U.isSprite)rt.setMode(w.TRIANGLES);if(U.isBatchedMesh)if(U._multiDrawInstances!==null)Zi("WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),rt.renderMultiDrawInstances(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount,U._multiDrawInstances);else if(!ze.get("WEBGL_multi_draw")){let{_multiDrawStarts:we,_multiDrawCounts:$e,_multiDrawCount:Ye}=U,Gt=me?J.get(me).bytesPerElement:1,Ei=y.get(B).currentProgram.getUniforms();for(let Ht=0;Ht<Ye;Ht++)Ei.setValue(w,"_gl_DrawID",Ht),rt.render(we[Ht]/Gt,$e[Ht])}else rt.renderMultiDraw(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount);else if(U.isInstancedMesh)rt.renderInstances(Ve,dt,U.count);else if(z.isInstancedBufferGeometry){let we=z._maxInstanceCount!==void 0?z._maxInstanceCount:1/0,$e=Math.min(z.instanceCount,we);rt.renderInstances(Ve,dt,$e)}else rt.render(Ve,dt)};function jl(v,D,z){if(v.transparent===!0&&v.side===jt&&v.forceSinglePass===!1)v.side=Dt,v.needsUpdate=!0,dr(v,D,z),v.side=Yn,v.needsUpdate=!0,dr(v,D,z),v.side=jt;else dr(v,D,z)}this.compile=function(v,D,z=null){if(z===null)z=v;if(b=j.get(z),b.init(D),E.push(b),z.traverseVisible(function(U){if(U.isLight&&U.layers.test(D.layers)){if(b.pushLight(U),U.castShadow)b.pushShadow(U)}}),v!==z)v.traverseVisible(function(U){if(U.isLight&&U.layers.test(D.layers)){if(b.pushLight(U),U.castShadow)b.pushShadow(U)}});b.setupLights();let B=new Set;return v.traverse(function(U){if(!(U.isMesh||U.isPoints||U.isLine||U.isSprite))return;let oe=U.material;if(oe)if(Array.isArray(oe))for(let de=0;de<oe.length;de++){let he=oe[de];jl(he,z,U),B.add(he)}else jl(oe,z,U),B.add(oe)}),b=E.pop(),B},this.compileAsync=function(v,D,z=null){let B=this.compile(v,D,z);return new Promise((U)=>{function oe(){if(B.forEach(function(de){if(y.get(de).currentProgram.isReady())B.delete(de)}),B.size===0){U(v);return}setTimeout(oe,10)}if(ze.get("KHR_parallel_shader_compile")!==null)oe();else setTimeout(oe,10)})};let Da=null;function ud(v){if(Da)Da(v)}function Ql(){ii.stop()}function ec(){ii.start()}let ii=new uu;if(ii.setAnimationLoop(ud),typeof self<"u")ii.setContext(self);this.setAnimationLoop=function(v){Da=v,V.setAnimationLoop(v),v===null?ii.stop():ii.start()},V.addEventListener("sessionstart",Ql),V.addEventListener("sessionend",ec),this.render=function(v,D){if(D!==void 0&&D.isCamera!==!0){Re("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(T===!0)return;let z=V.enabled===!0&&V.isPresenting===!0,B=P!==null&&(k===null||z)&&P.begin(N,k);if(v.matrixWorldAutoUpdate===!0)v.updateMatrixWorld();if(D.parent===null&&D.matrixWorldAutoUpdate===!0)D.updateMatrixWorld();if(V.enabled===!0&&V.isPresenting===!0&&(P===null||P.isCompositing()===!1)){if(V.cameraAutoUpdate===!0)V.updateCamera(D);D=V.getCamera()}if(v.isScene===!0)v.onBeforeRender(N,v,D,k);if(b=j.get(v,E.length),b.init(D),E.push(b),mt.multiplyMatrices(D.projectionMatrix,D.matrixWorldInverse),Ce.setFromProjectionMatrix(mt,il,D.reversedDepth),Ne=this.localClippingEnabled,Ie=ee.init(this.clippingPlanes,Ne),M=Pe.get(v,R.length),M.init(),R.push(M),V.enabled===!0&&V.isPresenting===!0){let de=N.xr.getDepthSensingMesh();if(de!==null)Ua(de,D,-1/0,N.sortObjects)}if(Ua(v,D,0,N.sortObjects),M.finish(),N.sortObjects===!0)M.sort(ut,it);if(He=V.enabled===!1||V.isPresenting===!1||V.hasDepthSensing()===!1,He)ye.addToRenderList(M,v);if(this.info.render.frame++,Ie===!0)ee.beginShadows();let U=b.state.shadowsArray;if(xe.render(U,v,D),Ie===!0)ee.endShadows();if(this.info.autoReset===!0)this.info.reset();if((B&&P.hasRenderPass())===!1){let de=M.opaque,he=M.transmissive;if(b.setupLights(),D.isArrayCamera){let me=D.cameras;if(he.length>0)for(let Se=0,Le=me.length;Se<Le;Se++){let Ee=me[Se];nc(de,he,v,Ee)}if(He)ye.render(v);for(let Se=0,Le=me.length;Se<Le;Se++){let Ee=me[Se];tc(M,v,Ee,Ee.viewport)}}else{if(he.length>0)nc(de,he,v,D);if(He)ye.render(v);tc(M,v,D)}}if(k!==null&&C===0)g.updateMultisampleRenderTarget(k),g.updateRenderTargetMipmap(k);if(B)P.end(N);if(v.isScene===!0)v.onAfterRender(N,v,D);if(ne.resetDefaultState(),X=-1,G=null,E.pop(),E.length>0){if(b=E[E.length-1],Ie===!0)ee.setGlobalState(N.clippingPlanes,b.state.camera)}else b=null;if(R.pop(),R.length>0)M=R[R.length-1];else M=null};function Ua(v,D,z,B){if(v.visible===!1)return;if(v.layers.test(D.layers)){if(v.isGroup)z=v.renderOrder;else if(v.isLOD){if(v.autoUpdate===!0)v.update(D)}else if(v.isLight){if(b.pushLight(v),v.castShadow)b.pushShadow(v)}else if(v.isSprite){if(!v.frustumCulled||Ce.intersectsSprite(v)){if(B)Je.setFromMatrixPosition(v.matrixWorld).applyMatrix4(mt);let de=_e.update(v),he=v.material;if(he.visible)M.push(v,de,he,z,Je.z,null)}}else if(v.isMesh||v.isLine||v.isPoints){if(!v.frustumCulled||Ce.intersectsObject(v)){let de=_e.update(v),he=v.material;if(B){if(v.boundingSphere!==void 0){if(v.boundingSphere===null)v.computeBoundingSphere();Je.copy(v.boundingSphere.center)}else{if(de.boundingSphere===null)de.computeBoundingSphere();Je.copy(de.boundingSphere.center)}Je.applyMatrix4(v.matrixWorld).applyMatrix4(mt)}if(Array.isArray(he)){let me=de.groups;for(let Se=0,Le=me.length;Se<Le;Se++){let Ee=me[Se],Ve=he[Ee.materialIndex];if(Ve&&Ve.visible)M.push(v,de,Ve,z,Je.z,Ee)}}else if(he.visible)M.push(v,de,he,z,Je.z,null)}}}let oe=v.children;for(let de=0,he=oe.length;de<he;de++)Ua(oe[de],D,z,B)}function tc(v,D,z,B){let{opaque:U,transmissive:oe,transparent:de}=v;if(b.setupLightsView(z),Ie===!0)ee.setGlobalState(N.clippingPlanes,z);if(B)Te.viewport(K.copy(B));if(U.length>0)ur(U,D,z);if(oe.length>0)ur(oe,D,z);if(de.length>0)ur(de,D,z);Te.buffers.depth.setTest(!0),Te.buffers.depth.setMask(!0),Te.buffers.color.setMask(!0),Te.setPolygonOffset(!1)}function nc(v,D,z,B){if((z.isScene===!0?z.overrideMaterial:null)!==null)return;if(b.state.transmissionRenderTarget[B.id]===void 0){let Ve=ze.has("EXT_color_buffer_half_float")||ze.has("EXT_color_buffer_float");b.state.transmissionRenderTarget[B.id]=new Et(1,1,{generateMipmaps:!0,type:Ve?Ut:un,minFilter:Ln,samples:ht.samples,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ge.workingColorSpace})}let oe=b.state.transmissionRenderTarget[B.id],de=B.viewport||K;oe.setSize(de.z*N.transmissionResolutionScale,de.w*N.transmissionResolutionScale);let he=N.getRenderTarget(),me=N.getActiveCubeFace(),Se=N.getActiveMipmapLevel();if(N.setRenderTarget(oe),N.getClearColor(Y),te=N.getClearAlpha(),te<1)N.setClearColor(16777215,0.5);if(N.clear(),He)ye.render(z);let Le=N.toneMapping;N.toneMapping=cn;let Ee=B.viewport;if(B.viewport!==void 0)B.viewport=void 0;if(b.setupLightsView(B),Ie===!0)ee.setGlobalState(N.clippingPlanes,B);if(ur(v,z,B),g.updateMultisampleRenderTarget(oe),g.updateRenderTargetMipmap(oe),ze.has("WEBGL_multisampled_render_to_texture")===!1){let Ve=!1;for(let tt=0,dt=D.length;tt<dt;tt++){let ft=D[tt],{object:rt,geometry:we,material:$e,group:Ye}=ft;if($e.side===jt&&rt.layers.test(B.layers)){let Gt=$e.side;$e.side=Dt,$e.needsUpdate=!0,ic(rt,z,B,we,$e,Ye),$e.side=Gt,$e.needsUpdate=!0,Ve=!0}}if(Ve===!0)g.updateMultisampleRenderTarget(oe),g.updateRenderTargetMipmap(oe)}if(N.setRenderTarget(he,me,Se),N.setClearColor(Y,te),Ee!==void 0)B.viewport=Ee;N.toneMapping=Le}function ur(v,D,z){let B=D.isScene===!0?D.overrideMaterial:null;for(let U=0,oe=v.length;U<oe;U++){let de=v[U],{object:he,geometry:me,group:Se}=de,Le=de.material;if(Le.allowOverride===!0&&B!==null)Le=B;if(he.layers.test(z.layers))ic(he,D,z,me,Le,Se)}}function ic(v,D,z,B,U,oe){if(v.onBeforeRender(N,D,z,B,U,oe),v.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse,v.matrixWorld),v.normalMatrix.getNormalMatrix(v.modelViewMatrix),U.onBeforeRender(N,D,z,B,v,oe),U.transparent===!0&&U.side===jt&&U.forceSinglePass===!1)U.side=Dt,U.needsUpdate=!0,N.renderBufferDirect(z,D,B,U,v,oe),U.side=Yn,U.needsUpdate=!0,N.renderBufferDirect(z,D,B,U,v,oe),U.side=jt;else N.renderBufferDirect(z,D,B,U,v,oe);v.onAfterRender(N,D,z,B,U,oe)}function dr(v,D,z){if(D.isScene!==!0)D=st;let B=y.get(v),U=b.state.lights,oe=b.state.shadowsArray,de=U.state.version,he=se.getParameters(v,U.state,oe,D,z),me=se.getProgramCacheKey(he),Se=B.programs;if(B.environment=v.isMeshStandardMaterial?D.environment:null,B.fog=D.fog,B.envMap=(v.isMeshStandardMaterial?q:F).get(v.envMap||B.environment),B.envMapRotation=B.environment!==null&&v.envMap===null?D.environmentRotation:v.envMapRotation,Se===void 0)v.addEventListener("dispose",Ke),Se=new Map,B.programs=Se;let Le=Se.get(me);if(Le!==void 0){if(B.currentProgram===Le&&B.lightsStateVersion===de)return rc(v,he),Le}else he.uniforms=se.getUniforms(v),v.onBeforeCompile(he,N),Le=se.acquireProgram(he,me),Se.set(me,Le),B.uniforms=he.uniforms;let Ee=B.uniforms;if(!v.isShaderMaterial&&!v.isRawShaderMaterial||v.clipping===!0)Ee.clippingPlanes=ee.uniform;if(rc(v,he),B.needsLights=pd(v),B.lightsStateVersion=de,B.needsLights)Ee.ambientLightColor.value=U.state.ambient,Ee.lightProbe.value=U.state.probe,Ee.directionalLights.value=U.state.directional,Ee.directionalLightShadows.value=U.state.directionalShadow,Ee.spotLights.value=U.state.spot,Ee.spotLightShadows.value=U.state.spotShadow,Ee.rectAreaLights.value=U.state.rectArea,Ee.ltc_1.value=U.state.rectAreaLTC1,Ee.ltc_2.value=U.state.rectAreaLTC2,Ee.pointLights.value=U.state.point,Ee.pointLightShadows.value=U.state.pointShadow,Ee.hemisphereLights.value=U.state.hemi,Ee.directionalShadowMap.value=U.state.directionalShadowMap,Ee.directionalShadowMatrix.value=U.state.directionalShadowMatrix,Ee.spotShadowMap.value=U.state.spotShadowMap,Ee.spotLightMatrix.value=U.state.spotLightMatrix,Ee.spotLightMap.value=U.state.spotLightMap,Ee.pointShadowMap.value=U.state.pointShadowMap,Ee.pointShadowMatrix.value=U.state.pointShadowMatrix;return B.currentProgram=Le,B.uniformsList=null,Le}function sc(v){if(v.uniformsList===null){let D=v.currentProgram.getUniforms();v.uniformsList=ar.seqWithValue(D.seq,v.uniforms)}return v.uniformsList}function rc(v,D){let z=y.get(v);z.outputColorSpace=D.outputColorSpace,z.batching=D.batching,z.batchingColor=D.batchingColor,z.instancing=D.instancing,z.instancingColor=D.instancingColor,z.instancingMorph=D.instancingMorph,z.skinning=D.skinning,z.morphTargets=D.morphTargets,z.morphNormals=D.morphNormals,z.morphColors=D.morphColors,z.morphTargetsCount=D.morphTargetsCount,z.numClippingPlanes=D.numClippingPlanes,z.numIntersection=D.numClipIntersection,z.vertexAlphas=D.vertexAlphas,z.vertexTangents=D.vertexTangents,z.toneMapping=D.toneMapping}function dd(v,D,z,B,U){if(D.isScene!==!0)D=st;g.resetTextureUnits();let oe=D.fog,de=B.isMeshStandardMaterial?D.environment:null,he=k===null?N.outputColorSpace:k.isXRRenderTarget===!0?k.texture.colorSpace:Ft,me=(B.isMeshStandardMaterial?q:F).get(B.envMap||de),Se=B.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,Le=!!z.attributes.tangent&&(!!B.normalMap||B.anisotropy>0),Ee=!!z.morphAttributes.position,Ve=!!z.morphAttributes.normal,tt=!!z.morphAttributes.color,dt=cn;if(B.toneMapped){if(k===null||k.isXRRenderTarget===!0)dt=N.toneMapping}let ft=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,rt=ft!==void 0?ft.length:0,we=y.get(B),$e=b.state.lights;if(Ie===!0){if(Ne===!0||v!==G){let Lt=v===G&&B.id===X;ee.setState(B,v,Lt)}}let Ye=!1;if(B.version===we.__version){if(we.needsLights&&we.lightsStateVersion!==$e.state.version)Ye=!0;else if(we.outputColorSpace!==he)Ye=!0;else if(U.isBatchedMesh&&we.batching===!1)Ye=!0;else if(!U.isBatchedMesh&&we.batching===!0)Ye=!0;else if(U.isBatchedMesh&&we.batchingColor===!0&&U.colorTexture===null)Ye=!0;else if(U.isBatchedMesh&&we.batchingColor===!1&&U.colorTexture!==null)Ye=!0;else if(U.isInstancedMesh&&we.instancing===!1)Ye=!0;else if(!U.isInstancedMesh&&we.instancing===!0)Ye=!0;else if(U.isSkinnedMesh&&we.skinning===!1)Ye=!0;else if(!U.isSkinnedMesh&&we.skinning===!0)Ye=!0;else if(U.isInstancedMesh&&we.instancingColor===!0&&U.instanceColor===null)Ye=!0;else if(U.isInstancedMesh&&we.instancingColor===!1&&U.instanceColor!==null)Ye=!0;else if(U.isInstancedMesh&&we.instancingMorph===!0&&U.morphTexture===null)Ye=!0;else if(U.isInstancedMesh&&we.instancingMorph===!1&&U.morphTexture!==null)Ye=!0;else if(we.envMap!==me)Ye=!0;else if(B.fog===!0&&we.fog!==oe)Ye=!0;else if(we.numClippingPlanes!==void 0&&(we.numClippingPlanes!==ee.numPlanes||we.numIntersection!==ee.numIntersection))Ye=!0;else if(we.vertexAlphas!==Se)Ye=!0;else if(we.vertexTangents!==Le)Ye=!0;else if(we.morphTargets!==Ee)Ye=!0;else if(we.morphNormals!==Ve)Ye=!0;else if(we.morphColors!==tt)Ye=!0;else if(we.toneMapping!==dt)Ye=!0;else if(we.morphTargetsCount!==rt)Ye=!0}else Ye=!0,we.__version=B.version;let Gt=we.currentProgram;if(Ye===!0)Gt=dr(B,D,U);let Ei=!1,Ht=!1,_s=!1,lt=Gt.getUniforms(),Bt=we.uniforms;if(Te.useProgram(Gt.program))Ei=!0,Ht=!0,_s=!0;if(B.id!==X)X=B.id,Ht=!0;if(Ei||G!==v){if(Te.buffers.depth.getReversed()&&v.reversedDepth!==!0)v._reversedDepth=!0,v.updateProjectionMatrix();lt.setValue(w,"projectionMatrix",v.projectionMatrix),lt.setValue(w,"viewMatrix",v.matrixWorldInverse);let zt=lt.map.cameraPosition;if(zt!==void 0)zt.setValue(w,qe.setFromMatrixPosition(v.matrixWorld));if(ht.logarithmicDepthBuffer)lt.setValue(w,"logDepthBufFC",2/(Math.log(v.far+1)/Math.LN2));if(B.isMeshPhongMaterial||B.isMeshToonMaterial||B.isMeshLambertMaterial||B.isMeshBasicMaterial||B.isMeshStandardMaterial||B.isShaderMaterial)lt.setValue(w,"isOrthographic",v.isOrthographicCamera===!0);if(G!==v)G=v,Ht=!0,_s=!0}if(we.needsLights){if($e.state.directionalShadowMap.length>0)lt.setValue(w,"directionalShadowMap",$e.state.directionalShadowMap,g);if($e.state.spotShadowMap.length>0)lt.setValue(w,"spotShadowMap",$e.state.spotShadowMap,g);if($e.state.pointShadowMap.length>0)lt.setValue(w,"pointShadowMap",$e.state.pointShadowMap,g)}if(U.isSkinnedMesh){lt.setOptional(w,U,"bindMatrix"),lt.setOptional(w,U,"bindMatrixInverse");let Lt=U.skeleton;if(Lt){if(Lt.boneTexture===null)Lt.computeBoneTexture();lt.setValue(w,"boneTexture",Lt.boneTexture,g)}}if(U.isBatchedMesh){if(lt.setOptional(w,U,"batchingTexture"),lt.setValue(w,"batchingTexture",U._matricesTexture,g),lt.setOptional(w,U,"batchingIdTexture"),lt.setValue(w,"batchingIdTexture",U._indirectTexture,g),lt.setOptional(w,U,"batchingColorTexture"),U._colorsTexture!==null)lt.setValue(w,"batchingColorTexture",U._colorsTexture,g)}let Jt=z.morphAttributes;if(Jt.position!==void 0||Jt.normal!==void 0||Jt.color!==void 0)ue.update(U,z,Gt);if(Ht||we.receiveShadow!==U.receiveShadow)we.receiveShadow=U.receiveShadow,lt.setValue(w,"receiveShadow",U.receiveShadow);if(B.isMeshGouraudMaterial&&B.envMap!==null)Bt.envMap.value=me,Bt.flipEnvMap.value=me.isCubeTexture&&me.isRenderTargetTexture===!1?-1:1;if(B.isMeshStandardMaterial&&B.envMap===null&&D.environment!==null)Bt.envMapIntensity.value=D.environmentIntensity;if(Bt.dfgLUT!==void 0)Bt.dfgLUT.value=s0();if(Ht){if(lt.setValue(w,"toneMappingExposure",N.toneMappingExposure),we.needsLights)fd(Bt,_s);if(oe&&B.fog===!0)Ae.refreshFogUniforms(Bt,oe);Ae.refreshMaterialUniforms(Bt,B,Ue,ge,b.state.transmissionRenderTarget[v.id]),ar.upload(w,sc(we),Bt,g)}if(B.isShaderMaterial&&B.uniformsNeedUpdate===!0)ar.upload(w,sc(we),Bt,g),B.uniformsNeedUpdate=!1;if(B.isSpriteMaterial)lt.setValue(w,"center",U.center);if(lt.setValue(w,"modelViewMatrix",U.modelViewMatrix),lt.setValue(w,"normalMatrix",U.normalMatrix),lt.setValue(w,"modelMatrix",U.matrixWorld),B.isShaderMaterial||B.isRawShaderMaterial){let Lt=B.uniformsGroups;for(let zt=0,Fa=Lt.length;zt<Fa;zt++){let si=Lt[zt];fe.update(si,Gt),fe.bind(si,Gt)}}return Gt}function fd(v,D){v.ambientLightColor.needsUpdate=D,v.lightProbe.needsUpdate=D,v.directionalLights.needsUpdate=D,v.directionalLightShadows.needsUpdate=D,v.pointLights.needsUpdate=D,v.pointLightShadows.needsUpdate=D,v.spotLights.needsUpdate=D,v.spotLightShadows.needsUpdate=D,v.rectAreaLights.needsUpdate=D,v.hemisphereLights.needsUpdate=D}function pd(v){return v.isMeshLambertMaterial||v.isMeshToonMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isShadowMaterial||v.isShaderMaterial&&v.lights===!0}this.getActiveCubeFace=function(){return S},this.getActiveMipmapLevel=function(){return C},this.getRenderTarget=function(){return k},this.setRenderTargetTextures=function(v,D,z){let B=y.get(v);if(B.__autoAllocateDepthBuffer=v.resolveDepthBuffer===!1,B.__autoAllocateDepthBuffer===!1)B.__useRenderToTexture=!1;y.get(v.texture).__webglTexture=D,y.get(v.depthTexture).__webglTexture=B.__autoAllocateDepthBuffer?void 0:z,B.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(v,D){let z=y.get(v);z.__webglFramebuffer=D,z.__useDefaultFramebuffer=D===void 0};let md=w.createFramebuffer();this.setRenderTarget=function(v,D=0,z=0){k=v,S=D,C=z;let B=null,U=!1,oe=!1;if(v){let he=y.get(v);if(he.__useDefaultFramebuffer!==void 0){Te.bindFramebuffer(w.FRAMEBUFFER,he.__webglFramebuffer),K.copy(v.viewport),H.copy(v.scissor),O=v.scissorTest,Te.viewport(K),Te.scissor(H),Te.setScissorTest(O),X=-1;return}else if(he.__webglFramebuffer===void 0)g.setupRenderTarget(v);else if(he.__hasExternalTextures)g.rebindTextures(v,y.get(v.texture).__webglTexture,y.get(v.depthTexture).__webglTexture);else if(v.depthBuffer){let Le=v.depthTexture;if(he.__boundDepthTexture!==Le){if(Le!==null&&y.has(Le)&&(v.width!==Le.image.width||v.height!==Le.image.height))throw Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");g.setupDepthRenderbuffer(v)}}let me=v.texture;if(me.isData3DTexture||me.isDataArrayTexture||me.isCompressedArrayTexture)oe=!0;let Se=y.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget){if(Array.isArray(Se[D]))B=Se[D][z];else B=Se[D];U=!0}else if(v.samples>0&&g.useMultisampledRTT(v)===!1)B=y.get(v).__webglMultisampledFramebuffer;else if(Array.isArray(Se))B=Se[z];else B=Se;K.copy(v.viewport),H.copy(v.scissor),O=v.scissorTest}else K.copy(Z).multiplyScalar(Ue).floor(),H.copy(le).multiplyScalar(Ue).floor(),O=re;if(z!==0)B=md;if(Te.bindFramebuffer(w.FRAMEBUFFER,B))Te.drawBuffers(v,B);if(Te.viewport(K),Te.scissor(H),Te.setScissorTest(O),U){let he=y.get(v.texture);w.framebufferTexture2D(w.FRAMEBUFFER,w.COLOR_ATTACHMENT0,w.TEXTURE_CUBE_MAP_POSITIVE_X+D,he.__webglTexture,z)}else if(oe){let he=D;for(let me=0;me<v.textures.length;me++){let Se=y.get(v.textures[me]);w.framebufferTextureLayer(w.FRAMEBUFFER,w.COLOR_ATTACHMENT0+me,Se.__webglTexture,z,he)}}else if(v!==null&&z!==0){let he=y.get(v.texture);w.framebufferTexture2D(w.FRAMEBUFFER,w.COLOR_ATTACHMENT0,w.TEXTURE_2D,he.__webglTexture,z)}X=-1},this.readRenderTargetPixels=function(v,D,z,B,U,oe,de,he=0){if(!(v&&v.isWebGLRenderTarget)){Re("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let me=y.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&de!==void 0)me=me[de];if(me){Te.bindFramebuffer(w.FRAMEBUFFER,me);try{let Se=v.textures[he],{format:Le,type:Ee}=Se;if(!ht.textureFormatReadable(Le)){Re("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ht.textureTypeReadable(Ee)){Re("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}if(D>=0&&D<=v.width-B&&(z>=0&&z<=v.height-U)){if(v.textures.length>1)w.readBuffer(w.COLOR_ATTACHMENT0+he);w.readPixels(D,z,B,U,ae.convert(Le),ae.convert(Ee),oe)}}finally{let Se=k!==null?y.get(k).__webglFramebuffer:null;Te.bindFramebuffer(w.FRAMEBUFFER,Se)}}},this.readRenderTargetPixelsAsync=async function(v,D,z,B,U,oe,de,he=0){if(!(v&&v.isWebGLRenderTarget))throw Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let me=y.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&de!==void 0)me=me[de];if(me)if(D>=0&&D<=v.width-B&&(z>=0&&z<=v.height-U)){Te.bindFramebuffer(w.FRAMEBUFFER,me);let Se=v.textures[he],{format:Le,type:Ee}=Se;if(!ht.textureFormatReadable(Le))throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ht.textureTypeReadable(Ee))throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Ve=w.createBuffer();if(w.bindBuffer(w.PIXEL_PACK_BUFFER,Ve),w.bufferData(w.PIXEL_PACK_BUFFER,oe.byteLength,w.STREAM_READ),v.textures.length>1)w.readBuffer(w.COLOR_ATTACHMENT0+he);w.readPixels(D,z,B,U,ae.convert(Le),ae.convert(Ee),0);let tt=k!==null?y.get(k).__webglFramebuffer:null;Te.bindFramebuffer(w.FRAMEBUFFER,tt);let dt=w.fenceSync(w.SYNC_GPU_COMMANDS_COMPLETE,0);return w.flush(),await Nh(w,dt,4),w.bindBuffer(w.PIXEL_PACK_BUFFER,Ve),w.getBufferSubData(w.PIXEL_PACK_BUFFER,0,oe),w.deleteBuffer(Ve),w.deleteSync(dt),oe}else throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(v,D=null,z=0){let B=Math.pow(2,-z),U=Math.floor(v.image.width*B),oe=Math.floor(v.image.height*B),de=D!==null?D.x:0,he=D!==null?D.y:0;g.setTexture2D(v,0),w.copyTexSubImage2D(w.TEXTURE_2D,z,0,0,de,he,U,oe),Te.unbindTexture()};let gd=w.createFramebuffer(),_d=w.createFramebuffer();if(this.copyTextureToTexture=function(v,D,z=null,B=null,U=0,oe=null){if(oe===null)if(U!==0)Zi("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),oe=U,U=0;else oe=0;let de,he,me,Se,Le,Ee,Ve,tt,dt,ft=v.isCompressedTexture?v.mipmaps[oe]:v.image;if(z!==null)de=z.max.x-z.min.x,he=z.max.y-z.min.y,me=z.isBox3?z.max.z-z.min.z:1,Se=z.min.x,Le=z.min.y,Ee=z.isBox3?z.min.z:0;else{let Jt=Math.pow(2,-U);if(de=Math.floor(ft.width*Jt),he=Math.floor(ft.height*Jt),v.isDataArrayTexture)me=ft.depth;else if(v.isData3DTexture)me=Math.floor(ft.depth*Jt);else me=1;Se=0,Le=0,Ee=0}if(B!==null)Ve=B.x,tt=B.y,dt=B.z;else Ve=0,tt=0,dt=0;let rt=ae.convert(D.format),we=ae.convert(D.type),$e;if(D.isData3DTexture)g.setTexture3D(D,0),$e=w.TEXTURE_3D;else if(D.isDataArrayTexture||D.isCompressedArrayTexture)g.setTexture2DArray(D,0),$e=w.TEXTURE_2D_ARRAY;else g.setTexture2D(D,0),$e=w.TEXTURE_2D;w.pixelStorei(w.UNPACK_FLIP_Y_WEBGL,D.flipY),w.pixelStorei(w.UNPACK_PREMULTIPLY_ALPHA_WEBGL,D.premultiplyAlpha),w.pixelStorei(w.UNPACK_ALIGNMENT,D.unpackAlignment);let Ye=w.getParameter(w.UNPACK_ROW_LENGTH),Gt=w.getParameter(w.UNPACK_IMAGE_HEIGHT),Ei=w.getParameter(w.UNPACK_SKIP_PIXELS),Ht=w.getParameter(w.UNPACK_SKIP_ROWS),_s=w.getParameter(w.UNPACK_SKIP_IMAGES);w.pixelStorei(w.UNPACK_ROW_LENGTH,ft.width),w.pixelStorei(w.UNPACK_IMAGE_HEIGHT,ft.height),w.pixelStorei(w.UNPACK_SKIP_PIXELS,Se),w.pixelStorei(w.UNPACK_SKIP_ROWS,Le),w.pixelStorei(w.UNPACK_SKIP_IMAGES,Ee);let lt=v.isDataArrayTexture||v.isData3DTexture,Bt=D.isDataArrayTexture||D.isData3DTexture;if(v.isDepthTexture){let Jt=y.get(v),Lt=y.get(D),zt=y.get(Jt.__renderTarget),Fa=y.get(Lt.__renderTarget);Te.bindFramebuffer(w.READ_FRAMEBUFFER,zt.__webglFramebuffer),Te.bindFramebuffer(w.DRAW_FRAMEBUFFER,Fa.__webglFramebuffer);for(let si=0;si<me;si++){if(lt)w.framebufferTextureLayer(w.READ_FRAMEBUFFER,w.COLOR_ATTACHMENT0,y.get(v).__webglTexture,U,Ee+si),w.framebufferTextureLayer(w.DRAW_FRAMEBUFFER,w.COLOR_ATTACHMENT0,y.get(D).__webglTexture,oe,dt+si);w.blitFramebuffer(Se,Le,de,he,Ve,tt,de,he,w.DEPTH_BUFFER_BIT,w.NEAREST)}Te.bindFramebuffer(w.READ_FRAMEBUFFER,null),Te.bindFramebuffer(w.DRAW_FRAMEBUFFER,null)}else if(U!==0||v.isRenderTargetTexture||y.has(v)){let Jt=y.get(v),Lt=y.get(D);Te.bindFramebuffer(w.READ_FRAMEBUFFER,gd),Te.bindFramebuffer(w.DRAW_FRAMEBUFFER,_d);for(let zt=0;zt<me;zt++){if(lt)w.framebufferTextureLayer(w.READ_FRAMEBUFFER,w.COLOR_ATTACHMENT0,Jt.__webglTexture,U,Ee+zt);else w.framebufferTexture2D(w.READ_FRAMEBUFFER,w.COLOR_ATTACHMENT0,w.TEXTURE_2D,Jt.__webglTexture,U);if(Bt)w.framebufferTextureLayer(w.DRAW_FRAMEBUFFER,w.COLOR_ATTACHMENT0,Lt.__webglTexture,oe,dt+zt);else w.framebufferTexture2D(w.DRAW_FRAMEBUFFER,w.COLOR_ATTACHMENT0,w.TEXTURE_2D,Lt.__webglTexture,oe);if(U!==0)w.blitFramebuffer(Se,Le,de,he,Ve,tt,de,he,w.COLOR_BUFFER_BIT,w.NEAREST);else if(Bt)w.copyTexSubImage3D($e,oe,Ve,tt,dt+zt,Se,Le,de,he);else w.copyTexSubImage2D($e,oe,Ve,tt,Se,Le,de,he)}Te.bindFramebuffer(w.READ_FRAMEBUFFER,null),Te.bindFramebuffer(w.DRAW_FRAMEBUFFER,null)}else if(Bt)if(v.isDataTexture||v.isData3DTexture)w.texSubImage3D($e,oe,Ve,tt,dt,de,he,me,rt,we,ft.data);else if(D.isCompressedArrayTexture)w.compressedTexSubImage3D($e,oe,Ve,tt,dt,de,he,me,rt,ft.data);else w.texSubImage3D($e,oe,Ve,tt,dt,de,he,me,rt,we,ft);else if(v.isDataTexture)w.texSubImage2D(w.TEXTURE_2D,oe,Ve,tt,de,he,rt,we,ft.data);else if(v.isCompressedTexture)w.compressedTexSubImage2D(w.TEXTURE_2D,oe,Ve,tt,ft.width,ft.height,rt,ft.data);else w.texSubImage2D(w.TEXTURE_2D,oe,Ve,tt,de,he,rt,we,ft);if(w.pixelStorei(w.UNPACK_ROW_LENGTH,Ye),w.pixelStorei(w.UNPACK_IMAGE_HEIGHT,Gt),w.pixelStorei(w.UNPACK_SKIP_PIXELS,Ei),w.pixelStorei(w.UNPACK_SKIP_ROWS,Ht),w.pixelStorei(w.UNPACK_SKIP_IMAGES,_s),oe===0&&D.generateMipmaps)w.generateMipmap($e);Te.unbindTexture()},this.initRenderTarget=function(v){if(y.get(v).__webglFramebuffer===void 0)g.setupRenderTarget(v)},this.initTexture=function(v){if(v.isCubeTexture)g.setTextureCube(v,0);else if(v.isData3DTexture)g.setTexture3D(v,0);else if(v.isDataArrayTexture||v.isCompressedArrayTexture)g.setTexture2DArray(v,0);else g.setTexture2D(v,0);Te.unbindTexture()},this.resetState=function(){S=0,C=0,k=null,Te.reset(),ne.reset()},typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return il}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Ge._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ge._getUnpackColorSpace()}}function Dl(e,t){if(t===el)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),e;if(t===is||t===Hs){let n=e.getIndex();if(n===null){let a=[],o=e.getAttribute("position");if(o!==void 0){for(let l=0;l<o.count;l++)a.push(l);e.setIndex(a),n=e.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),e}let i=n.count-2,s=[];if(t===is)for(let a=1;a<=i;a++)s.push(n.getX(0)),s.push(n.getX(a)),s.push(n.getX(a+1));else for(let a=0;a<i;a++)if(a%2===0)s.push(n.getX(a)),s.push(n.getX(a+1)),s.push(n.getX(a+2));else s.push(n.getX(a+2)),s.push(n.getX(a+1)),s.push(n.getX(a));if(s.length/3!==i)console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");let r=e.clone();return r.setIndex(s),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",t),e}class kl extends On{constructor(e){super(e);this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new Iu(t)}),this.register(function(t){return new Pu(t)}),this.register(function(t){return new ku(t)}),this.register(function(t){return new Gu(t)}),this.register(function(t){return new Hu(t)}),this.register(function(t){return new Nu(t)}),this.register(function(t){return new Du(t)}),this.register(function(t){return new Uu(t)}),this.register(function(t){return new Fu(t)}),this.register(function(t){return new Ru(t)}),this.register(function(t){return new Ou(t)}),this.register(function(t){return new Lu(t)}),this.register(function(t){return new zu(t)}),this.register(function(t){return new Bu(t)}),this.register(function(t){return new wu(t)}),this.register(function(t){return new Vu(t)}),this.register(function(t){return new Wu(t)})}load(e,t,n,i){let s=this,r;if(this.resourcePath!=="")r=this.resourcePath;else if(this.path!==""){let l=ei.extractUrlBase(e);r=ei.resolveURL(l,this.path)}else r=ei.extractUrlBase(e);this.manager.itemStart(e);let a=function(l){if(i)i(l);else console.error(l);s.manager.itemError(e),s.manager.itemEnd(e)},o=new nr(this.manager);o.setPath(this.path),o.setResponseType("arraybuffer"),o.setRequestHeader(this.requestHeader),o.setWithCredentials(this.withCredentials),o.load(e,function(l){try{s.parse(l,r,function(c){t(c),s.manager.itemEnd(e)},a)}catch(c){a(c)}},n,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){if(this.pluginCallbacks.indexOf(e)===-1)this.pluginCallbacks.push(e);return this}unregister(e){if(this.pluginCallbacks.indexOf(e)!==-1)this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1);return this}parse(e,t,n,i){let s,r={},a={},o=new TextDecoder;if(typeof e==="string")s=JSON.parse(e);else if(e instanceof ArrayBuffer)if(o.decode(new Uint8Array(e,0,4))===Xu){try{r[Xe.KHR_BINARY_GLTF]=new qu(e)}catch(h){if(i)i(h);return}s=JSON.parse(r[Xe.KHR_BINARY_GLTF].content)}else s=JSON.parse(o.decode(e));else s=e;if(s.asset===void 0||s.asset.version[0]<2){if(i)i(Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let l=new $u(s,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});l.fileLoader.setRequestHeader(this.requestHeader);for(let c=0;c<this.pluginCallbacks.length;c++){let h=this.pluginCallbacks[c](l);if(!h.name)console.error("THREE.GLTFLoader: Invalid plugin found: missing name");a[h.name]=h,r[h.name]=!0}if(s.extensionsUsed)for(let c=0;c<s.extensionsUsed.length;++c){let h=s.extensionsUsed[c],u=s.extensionsRequired||[];switch(h){case Xe.KHR_MATERIALS_UNLIT:r[h]=new Cu;break;case Xe.KHR_DRACO_MESH_COMPRESSION:r[h]=new Yu(s,this.dracoLoader);break;case Xe.KHR_TEXTURE_TRANSFORM:r[h]=new Zu;break;case Xe.KHR_MESH_QUANTIZATION:r[h]=new Ju;break;default:if(u.indexOf(h)>=0&&a[h]===void 0)console.warn('THREE.GLTFLoader: Unknown extension "'+h+'".')}}l.setExtensions(r),l.setPlugins(a),l.parse(n,i)}parseAsync(e,t){let n=this;return new Promise(function(i,s){n.parse(e,t,i,s)})}}function r0(){let e={};return{get:function(t){return e[t]},add:function(t,n){e[t]=n},remove:function(t){delete e[t]},removeAll:function(){e={}}}}var Xe={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class wu{constructor(e){this.parser=e,this.name=Xe.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,i=t.length;n<i;n++){let s=t[n];if(s.extensions&&s.extensions[this.name]&&s.extensions[this.name].light!==void 0)e._addNodeRef(this.cache,s.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n="light:"+e,i=t.cache.get(n);if(i)return i;let s=t.json,o=((s.extensions&&s.extensions[this.name]||{}).lights||[])[e],l,c=new pe(16777215);if(o.color!==void 0)c.setRGB(o.color[0],o.color[1],o.color[2],Ft);let h=o.range!==void 0?o.range:0;switch(o.type){case"directional":l=new hs(c),l.target.position.set(0,0,-1),l.add(l.target);break;case"point":l=new Bn(c),l.distance=h;break;case"spot":l=new Ea(c),l.distance=h,o.spot=o.spot||{},o.spot.innerConeAngle=o.spot.innerConeAngle!==void 0?o.spot.innerConeAngle:0,o.spot.outerConeAngle=o.spot.outerConeAngle!==void 0?o.spot.outerConeAngle:Math.PI/4,l.angle=o.spot.outerConeAngle,l.penumbra=1-o.spot.innerConeAngle/o.spot.outerConeAngle,l.target.position.set(0,0,-1),l.add(l.target);break;default:throw Error("THREE.GLTFLoader: Unexpected light type: "+o.type)}if(l.position.set(0,0,0),vn(l,o),o.intensity!==void 0)l.intensity=o.intensity;return l.name=t.createUniqueName(o.name||"light_"+e),i=Promise.resolve(l),t.cache.add(n,i),i}getDependency(e,t){if(e!=="light")return;return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,s=n.json.nodes[e],a=(s.extensions&&s.extensions[this.name]||{}).light;if(a===void 0)return null;return this._loadLight(a).then(function(o){return n._getNodeRef(t.cache,a,o)})}}class Cu{constructor(){this.name=Xe.KHR_MATERIALS_UNLIT}getMaterialType(){return kt}extendParams(e,t,n){let i=[];e.color=new pe(1,1,1),e.opacity=1;let s=t.pbrMetallicRoughness;if(s){if(Array.isArray(s.baseColorFactor)){let r=s.baseColorFactor;e.color.setRGB(r[0],r[1],r[2],Ft),e.opacity=r[3]}if(s.baseColorTexture!==void 0)i.push(n.assignTexture(e,"map",s.baseColorTexture,gn))}return Promise.all(i)}}class Ru{constructor(e){this.parser=e,this.name=Xe.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=i.extensions[this.name].emissiveStrength;if(s!==void 0)t.emissiveIntensity=s;return Promise.resolve()}}class Iu{constructor(e){this.parser=e,this.name=Xe.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Yt}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[],r=i.extensions[this.name];if(r.clearcoatFactor!==void 0)t.clearcoat=r.clearcoatFactor;if(r.clearcoatTexture!==void 0)s.push(n.assignTexture(t,"clearcoatMap",r.clearcoatTexture));if(r.clearcoatRoughnessFactor!==void 0)t.clearcoatRoughness=r.clearcoatRoughnessFactor;if(r.clearcoatRoughnessTexture!==void 0)s.push(n.assignTexture(t,"clearcoatRoughnessMap",r.clearcoatRoughnessTexture));if(r.clearcoatNormalTexture!==void 0){if(s.push(n.assignTexture(t,"clearcoatNormalMap",r.clearcoatNormalTexture)),r.clearcoatNormalTexture.scale!==void 0){let a=r.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new Me(a,a)}}return Promise.all(s)}}class Pu{constructor(e){this.parser=e,this.name=Xe.KHR_MATERIALS_DISPERSION}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Yt}extendMaterialParams(e,t){let i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=i.extensions[this.name];return t.dispersion=s.dispersion!==void 0?s.dispersion:0,Promise.resolve()}}class Lu{constructor(e){this.parser=e,this.name=Xe.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Yt}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[],r=i.extensions[this.name];if(r.iridescenceFactor!==void 0)t.iridescence=r.iridescenceFactor;if(r.iridescenceTexture!==void 0)s.push(n.assignTexture(t,"iridescenceMap",r.iridescenceTexture));if(r.iridescenceIor!==void 0)t.iridescenceIOR=r.iridescenceIor;if(t.iridescenceThicknessRange===void 0)t.iridescenceThicknessRange=[100,400];if(r.iridescenceThicknessMinimum!==void 0)t.iridescenceThicknessRange[0]=r.iridescenceThicknessMinimum;if(r.iridescenceThicknessMaximum!==void 0)t.iridescenceThicknessRange[1]=r.iridescenceThicknessMaximum;if(r.iridescenceThicknessTexture!==void 0)s.push(n.assignTexture(t,"iridescenceThicknessMap",r.iridescenceThicknessTexture));return Promise.all(s)}}class Nu{constructor(e){this.parser=e,this.name=Xe.KHR_MATERIALS_SHEEN}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Yt}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[];t.sheenColor=new pe(0,0,0),t.sheenRoughness=0,t.sheen=1;let r=i.extensions[this.name];if(r.sheenColorFactor!==void 0){let a=r.sheenColorFactor;t.sheenColor.setRGB(a[0],a[1],a[2],Ft)}if(r.sheenRoughnessFactor!==void 0)t.sheenRoughness=r.sheenRoughnessFactor;if(r.sheenColorTexture!==void 0)s.push(n.assignTexture(t,"sheenColorMap",r.sheenColorTexture,gn));if(r.sheenRoughnessTexture!==void 0)s.push(n.assignTexture(t,"sheenRoughnessMap",r.sheenRoughnessTexture));return Promise.all(s)}}class Du{constructor(e){this.parser=e,this.name=Xe.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Yt}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[],r=i.extensions[this.name];if(r.transmissionFactor!==void 0)t.transmission=r.transmissionFactor;if(r.transmissionTexture!==void 0)s.push(n.assignTexture(t,"transmissionMap",r.transmissionTexture));return Promise.all(s)}}class Uu{constructor(e){this.parser=e,this.name=Xe.KHR_MATERIALS_VOLUME}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Yt}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[],r=i.extensions[this.name];if(t.thickness=r.thicknessFactor!==void 0?r.thicknessFactor:0,r.thicknessTexture!==void 0)s.push(n.assignTexture(t,"thicknessMap",r.thicknessTexture));t.attenuationDistance=r.attenuationDistance||1/0;let a=r.attenuationColor||[1,1,1];return t.attenuationColor=new pe().setRGB(a[0],a[1],a[2],Ft),Promise.all(s)}}class Fu{constructor(e){this.parser=e,this.name=Xe.KHR_MATERIALS_IOR}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Yt}extendMaterialParams(e,t){let i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=i.extensions[this.name];return t.ior=s.ior!==void 0?s.ior:1.5,Promise.resolve()}}class Ou{constructor(e){this.parser=e,this.name=Xe.KHR_MATERIALS_SPECULAR}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Yt}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[],r=i.extensions[this.name];if(t.specularIntensity=r.specularFactor!==void 0?r.specularFactor:1,r.specularTexture!==void 0)s.push(n.assignTexture(t,"specularIntensityMap",r.specularTexture));let a=r.specularColorFactor||[1,1,1];if(t.specularColor=new pe().setRGB(a[0],a[1],a[2],Ft),r.specularColorTexture!==void 0)s.push(n.assignTexture(t,"specularColorMap",r.specularColorTexture,gn));return Promise.all(s)}}class Bu{constructor(e){this.parser=e,this.name=Xe.EXT_MATERIALS_BUMP}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Yt}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[],r=i.extensions[this.name];if(t.bumpScale=r.bumpFactor!==void 0?r.bumpFactor:1,r.bumpTexture!==void 0)s.push(n.assignTexture(t,"bumpMap",r.bumpTexture));return Promise.all(s)}}class zu{constructor(e){this.parser=e,this.name=Xe.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Yt}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[],r=i.extensions[this.name];if(r.anisotropyStrength!==void 0)t.anisotropy=r.anisotropyStrength;if(r.anisotropyRotation!==void 0)t.anisotropyRotation=r.anisotropyRotation;if(r.anisotropyTexture!==void 0)s.push(n.assignTexture(t,"anisotropyMap",r.anisotropyTexture));return Promise.all(s)}}class ku{constructor(e){this.parser=e,this.name=Xe.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,i=n.textures[e];if(!i.extensions||!i.extensions[this.name])return null;let s=i.extensions[this.name],r=t.options.ktx2Loader;if(!r)if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");else return null;return t.loadTextureImage(e,s.source,r)}}class Gu{constructor(e){this.parser=e,this.name=Xe.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,n=this.parser,i=n.json,s=i.textures[e];if(!s.extensions||!s.extensions[t])return null;let r=s.extensions[t],a=i.images[r.source],o=n.textureLoader;if(a.uri){let l=n.options.manager.getHandler(a.uri);if(l!==null)o=l}return n.loadTextureImage(e,r.source,o)}}class Hu{constructor(e){this.parser=e,this.name=Xe.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,n=this.parser,i=n.json,s=i.textures[e];if(!s.extensions||!s.extensions[t])return null;let r=s.extensions[t],a=i.images[r.source],o=n.textureLoader;if(a.uri){let l=n.options.manager.getHandler(a.uri);if(l!==null)o=l}return n.loadTextureImage(e,r.source,o)}}class Vu{constructor(e){this.name=Xe.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let i=n.extensions[this.name],s=this.parser.getDependency("buffer",i.buffer),r=this.parser.options.meshoptDecoder;if(!r||!r.supported)if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");else return null;return s.then(function(a){let o=i.byteOffset||0,l=i.byteLength||0,{count:c,byteStride:h}=i,u=new Uint8Array(a,o,l);if(r.decodeGltfBufferAsync)return r.decodeGltfBufferAsync(c,h,u,i.mode,i.filter).then(function(d){return d.buffer});else return r.ready.then(function(){let d=new ArrayBuffer(c*h);return r.decodeGltfBuffer(new Uint8Array(d),c,h,u,i.mode,i.filter),d})})}else return null}}class Wu{constructor(e){this.name=Xe.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let i=t.meshes[n.mesh];for(let l of i.primitives)if(l.mode!==en.TRIANGLES&&l.mode!==en.TRIANGLE_STRIP&&l.mode!==en.TRIANGLE_FAN&&l.mode!==void 0)return null;let r=n.extensions[this.name].attributes,a=[],o={};for(let l in r)a.push(this.parser.getDependency("accessor",r[l]).then((c)=>(o[l]=c,o[l])));if(a.length<1)return null;return a.push(this.parser.createNodeMesh(e)),Promise.all(a).then((l)=>{let c=l.pop(),h=c.isGroup?c.children:[c],u=l[0].count,d=[];for(let m of h){let _=new Fe,x=new L,f=new dn,p=new L(1,1,1),A=new os(m.geometry,m.material,u);for(let M=0;M<u;M++){if(o.TRANSLATION)x.fromBufferAttribute(o.TRANSLATION,M);if(o.ROTATION)f.fromBufferAttribute(o.ROTATION,M);if(o.SCALE)p.fromBufferAttribute(o.SCALE,M);A.setMatrixAt(M,_.compose(x,f,p))}for(let M in o)if(M==="_COLOR_0"){let b=o[M];A.instanceColor=new hi(b.array,b.itemSize,b.normalized)}else if(M!=="TRANSLATION"&&M!=="ROTATION"&&M!=="SCALE")m.geometry.setAttribute(M,o[M]);Qe.prototype.copy.call(A,m),this.parser.assignFinalMaterial(A),d.push(A)}if(c.isGroup)return c.clear(),c.add(...d),c;return d[0]})}}var Xu="glTF",lr=12,bu={JSON:1313821514,BIN:5130562};class qu{constructor(e){this.name=Xe.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,lr),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Xu)throw Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");else if(this.header.version<2)throw Error("THREE.GLTFLoader: Legacy binary file detected.");let i=this.header.length-lr,s=new DataView(e,lr),r=0;while(r<i){let a=s.getUint32(r,!0);r+=4;let o=s.getUint32(r,!0);if(r+=4,o===bu.JSON){let l=new Uint8Array(e,lr+r,a);this.content=n.decode(l)}else if(o===bu.BIN){let l=lr+r;this.body=e.slice(l,l+a)}r+=a}if(this.content===null)throw Error("THREE.GLTFLoader: JSON content not found.")}}class Yu{constructor(e,t){if(!t)throw Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=Xe.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,i=this.dracoLoader,s=e.extensions[this.name].bufferView,r=e.extensions[this.name].attributes,a={},o={},l={};for(let c in r){let h=Bl[c]||c.toLowerCase();a[h]=r[c]}for(let c in e.attributes){let h=Bl[c]||c.toLowerCase();if(r[c]!==void 0){let u=n.accessors[e.attributes[c]],d=fs[u.componentType];l[h]=d.name,o[h]=u.normalized===!0}}return t.getDependency("bufferView",s).then(function(c){return new Promise(function(h,u){i.decodeDracoFile(c,function(d){for(let m in d.attributes){let _=d.attributes[m],x=o[m];if(x!==void 0)_.normalized=x}h(d)},a,l,Ft,u)})})}}class Zu{constructor(){this.name=Xe.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){if((t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0)return e;if(e=e.clone(),t.texCoord!==void 0)e.channel=t.texCoord;if(t.offset!==void 0)e.offset.fromArray(t.offset);if(t.rotation!==void 0)e.rotation=t.rotation;if(t.scale!==void 0)e.repeat.fromArray(t.scale);return e.needsUpdate=!0,e}}class Ju{constructor(){this.name=Xe.KHR_MESH_QUANTIZATION}}class Gl extends $n{constructor(e,t,n,i){super(e,t,n,i)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=e*i*3+i;for(let r=0;r!==i;r++)t[r]=n[s+r];return t}interpolate_(e,t,n,i){let s=this.resultBuffer,r=this.sampleValues,a=this.valueSize,o=a*2,l=a*3,c=i-t,h=(n-t)/c,u=h*h,d=u*h,m=e*l,_=m-l,x=-2*d+3*u,f=d-u,p=1-x,A=f-u+h;for(let M=0;M!==a;M++){let b=r[_+M+a],R=r[_+M+o]*c,E=r[m+M+a],P=r[m+M]*c;s[M]=p*b+A*R+x*E+f*P}return s}}var a0=new dn;class Ku extends Gl{interpolate_(e,t,n,i){let s=super.interpolate_(e,t,n,i);return a0.fromArray(s).normalize().toArray(s),s}}var en={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},fs={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Tu={9728:hn,9729:Ct,9984:jr,9985:es,9986:pi,9987:Ln},Au={33071:Qi,33648:$r,10497:ji},Ul={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},Bl={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},ni={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},o0={CUBICSPLINE:void 0,LINEAR:ia,STEP:Qo},Fl={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function l0(e){if(e.DefaultMaterial===void 0)e.DefaultMaterial=new Un({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Yn});return e.DefaultMaterial}function bi(e,t,n){for(let i in n.extensions)if(e[i]===void 0)t.userData.gltfExtensions=t.userData.gltfExtensions||{},t.userData.gltfExtensions[i]=n.extensions[i]}function vn(e,t){if(t.extras!==void 0)if(typeof t.extras==="object")Object.assign(e.userData,t.extras);else console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+t.extras)}function c0(e,t,n){let i=!1,s=!1,r=!1;for(let c=0,h=t.length;c<h;c++){let u=t[c];if(u.POSITION!==void 0)i=!0;if(u.NORMAL!==void 0)s=!0;if(u.COLOR_0!==void 0)r=!0;if(i&&s&&r)break}if(!i&&!s&&!r)return Promise.resolve(e);let a=[],o=[],l=[];for(let c=0,h=t.length;c<h;c++){let u=t[c];if(i){let d=u.POSITION!==void 0?n.getDependency("accessor",u.POSITION):e.attributes.position;a.push(d)}if(s){let d=u.NORMAL!==void 0?n.getDependency("accessor",u.NORMAL):e.attributes.normal;o.push(d)}if(r){let d=u.COLOR_0!==void 0?n.getDependency("accessor",u.COLOR_0):e.attributes.color;l.push(d)}}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(l)]).then(function(c){let h=c[0],u=c[1],d=c[2];if(i)e.morphAttributes.position=h;if(s)e.morphAttributes.normal=u;if(r)e.morphAttributes.color=d;return e.morphTargetsRelative=!0,e})}function h0(e,t){if(e.updateMorphTargets(),t.weights!==void 0)for(let n=0,i=t.weights.length;n<i;n++)e.morphTargetInfluences[n]=t.weights[n];if(t.extras&&Array.isArray(t.extras.targetNames)){let n=t.extras.targetNames;if(e.morphTargetInfluences.length===n.length){e.morphTargetDictionary={};for(let i=0,s=n.length;i<s;i++)e.morphTargetDictionary[n[i]]=i}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function u0(e){let t,n=e.extensions&&e.extensions[Xe.KHR_DRACO_MESH_COMPRESSION];if(n)t="draco:"+n.bufferView+":"+n.indices+":"+Ol(n.attributes);else t=e.indices+":"+Ol(e.attributes)+":"+e.mode;if(e.targets!==void 0)for(let i=0,s=e.targets.length;i<s;i++)t+=":"+Ol(e.targets[i]);return t}function Ol(e){let t="",n=Object.keys(e).sort();for(let i=0,s=n.length;i<s;i++)t+=n[i]+":"+e[n[i]]+";";return t}function zl(e){switch(e){case Int8Array:return 0.007874015748031496;case Uint8Array:return 0.00392156862745098;case Int16Array:return 0.00003051850947599719;case Uint16Array:return 0.000015259021896696422;default:throw Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function d0(e){if(e.search(/\.jpe?g($|\?)/i)>0||e.search(/^data\:image\/jpeg/)===0)return"image/jpeg";if(e.search(/\.webp($|\?)/i)>0||e.search(/^data\:image\/webp/)===0)return"image/webp";if(e.search(/\.ktx2($|\?)/i)>0||e.search(/^data\:image\/ktx2/)===0)return"image/ktx2";return"image/png"}var f0=new Fe;class $u{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new r0,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,i=-1,s=!1,r=-1;if(typeof navigator<"u"){let a=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(a)===!0;let o=a.match(/Version\/(\d+)/);i=n&&o?parseInt(o[1],10):-1,s=a.indexOf("Firefox")>-1,r=s?a.match(/Firefox\/([0-9]+)\./)[1]:-1}if(typeof createImageBitmap>"u"||n&&i<17||s&&r<98)this.textureLoader=new ba(this.options.manager);else this.textureLoader=new wa(this.options.manager);if(this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new nr(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials")this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,i=this.json,s=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(r){return r._markDefs&&r._markDefs()}),Promise.all(this._invokeAll(function(r){return r.beforeRoot&&r.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(r){let a={scene:r[0][i.scene||0],scenes:r[0],animations:r[1],cameras:r[2],asset:i.asset,parser:n,userData:{}};return bi(s,a,i),vn(a,i),Promise.all(n._invokeAll(function(o){return o.afterRoot&&o.afterRoot(a)})).then(function(){for(let o of a.scenes)o.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let i=0,s=t.length;i<s;i++){let r=t[i].joints;for(let a=0,o=r.length;a<o;a++)e[r[a]].isBone=!0}for(let i=0,s=e.length;i<s;i++){let r=e[i];if(r.mesh!==void 0){if(this._addNodeRef(this.meshCache,r.mesh),r.skin!==void 0)n[r.mesh].isSkinnedMesh=!0}if(r.camera!==void 0)this._addNodeRef(this.cameraCache,r.camera)}}_addNodeRef(e,t){if(t===void 0)return;if(e.refs[t]===void 0)e.refs[t]=e.uses[t]=0;e.refs[t]++}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let i=n.clone(),s=(r,a)=>{let o=this.associations.get(r);if(o!=null)this.associations.set(a,o);for(let[l,c]of r.children.entries())s(c,a.children[l])};return s(n,i),i.name+="_instance_"+e.uses[t]++,i}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let i=e(t[n]);if(i)return i}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let i=0;i<t.length;i++){let s=e(t[i]);if(s)n.push(s)}return n}getDependency(e,t){let n=e+":"+t,i=this.cache.get(n);if(!i){switch(e){case"scene":i=this.loadScene(t);break;case"node":i=this._invokeOne(function(s){return s.loadNode&&s.loadNode(t)});break;case"mesh":i=this._invokeOne(function(s){return s.loadMesh&&s.loadMesh(t)});break;case"accessor":i=this.loadAccessor(t);break;case"bufferView":i=this._invokeOne(function(s){return s.loadBufferView&&s.loadBufferView(t)});break;case"buffer":i=this.loadBuffer(t);break;case"material":i=this._invokeOne(function(s){return s.loadMaterial&&s.loadMaterial(t)});break;case"texture":i=this._invokeOne(function(s){return s.loadTexture&&s.loadTexture(t)});break;case"skin":i=this.loadSkin(t);break;case"animation":i=this._invokeOne(function(s){return s.loadAnimation&&s.loadAnimation(t)});break;case"camera":i=this.loadCamera(t);break;default:if(i=this._invokeOne(function(s){return s!=this&&s.getDependency&&s.getDependency(e,t)}),!i)throw Error("Unknown type: "+e);break}this.cache.add(n,i)}return i}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,i=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(i.map(function(s,r){return n.getDependency(e,r)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[Xe.KHR_BINARY_GLTF].body);let i=this.options;return new Promise(function(s,r){n.load(ei.resolveURL(t.uri,i.path),s,void 0,function(){r(Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){let i=t.byteLength||0,s=t.byteOffset||0;return n.slice(s,s+i)})}loadAccessor(e){let t=this,n=this.json,i=this.json.accessors[e];if(i.bufferView===void 0&&i.sparse===void 0){let r=Ul[i.type],a=fs[i.componentType],o=i.normalized===!0,l=new a(i.count*r);return Promise.resolve(new Mt(l,r,o))}let s=[];if(i.bufferView!==void 0)s.push(this.getDependency("bufferView",i.bufferView));else s.push(null);if(i.sparse!==void 0)s.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),s.push(this.getDependency("bufferView",i.sparse.values.bufferView));return Promise.all(s).then(function(r){let a=r[0],o=Ul[i.type],l=fs[i.componentType],c=l.BYTES_PER_ELEMENT,h=c*o,u=i.byteOffset||0,d=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,m=i.normalized===!0,_,x;if(d&&d!==h){let f=Math.floor(u/d),p="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+f+":"+i.count,A=t.cache.get(p);if(!A)_=new l(a,f*d,i.count*d/c),A=new as(_,d/c),t.cache.add(p,A);x=new qn(A,o,u%d/c,m)}else{if(a===null)_=new l(i.count*o);else _=new l(a,u,i.count*o);x=new Mt(_,o,m)}if(i.sparse!==void 0){let f=Ul.SCALAR,p=fs[i.sparse.indices.componentType],A=i.sparse.indices.byteOffset||0,M=i.sparse.values.byteOffset||0,b=new p(r[1],A,i.sparse.count*f),R=new l(r[2],M,i.sparse.count*o);if(a!==null)x=new Mt(x.array.slice(),x.itemSize,x.normalized);x.normalized=!1;for(let E=0,P=b.length;E<P;E++){let N=b[E];if(x.setX(N,R[E*o]),o>=2)x.setY(N,R[E*o+1]);if(o>=3)x.setZ(N,R[E*o+2]);if(o>=4)x.setW(N,R[E*o+3]);if(o>=5)throw Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}x.normalized=m}return x})}loadTexture(e){let t=this.json,n=this.options,s=t.textures[e].source,r=t.images[s],a=this.textureLoader;if(r.uri){let o=n.manager.getHandler(r.uri);if(o!==null)a=o}return this.loadTextureImage(e,s,a)}loadTextureImage(e,t,n){let i=this,s=this.json,r=s.textures[e],a=s.images[t],o=(a.uri||a.bufferView)+":"+r.sampler;if(this.textureCache[o])return this.textureCache[o];let l=this.loadImageSource(t,n).then(function(c){if(c.flipY=!1,c.name=r.name||a.name||"",c.name===""&&typeof a.uri==="string"&&a.uri.startsWith("data:image/")===!1)c.name=a.uri;let u=(s.samplers||{})[r.sampler]||{};return c.magFilter=Tu[u.magFilter]||Ct,c.minFilter=Tu[u.minFilter]||Ln,c.wrapS=Au[u.wrapS]||ji,c.wrapT=Au[u.wrapT]||ji,c.generateMipmaps=!c.isCompressedTexture&&c.minFilter!==hn&&c.minFilter!==Ct,i.associations.set(c,{textures:e}),c}).catch(function(){return null});return this.textureCache[o]=l,l}loadImageSource(e,t){let n=this,i=this.json,s=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then((h)=>h.clone());let r=i.images[e],a=self.URL||self.webkitURL,o=r.uri||"",l=!1;if(r.bufferView!==void 0)o=n.getDependency("bufferView",r.bufferView).then(function(h){l=!0;let u=new Blob([h],{type:r.mimeType});return o=a.createObjectURL(u),o});else if(r.uri===void 0)throw Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");let c=Promise.resolve(o).then(function(h){return new Promise(function(u,d){let m=u;if(t.isImageBitmapLoader===!0)m=function(_){let x=new pt(_);x.needsUpdate=!0,u(x)};t.load(ei.resolveURL(h,s.path),m,void 0,d)})}).then(function(h){if(l===!0)a.revokeObjectURL(o);return vn(h,r),h.userData.mimeType=r.mimeType||d0(r.uri),h}).catch(function(h){throw console.error("THREE.GLTFLoader: Couldn't load texture",o),h});return this.sourceCache[e]=c,c}assignTexture(e,t,n,i){let s=this;return this.getDependency("texture",n.index).then(function(r){if(!r)return null;if(n.texCoord!==void 0&&n.texCoord>0)r=r.clone(),r.channel=n.texCoord;if(s.extensions[Xe.KHR_TEXTURE_TRANSFORM]){let a=n.extensions!==void 0?n.extensions[Xe.KHR_TEXTURE_TRANSFORM]:void 0;if(a){let o=s.associations.get(r);r=s.extensions[Xe.KHR_TEXTURE_TRANSFORM].extendTexture(r,a),s.associations.set(r,o)}}if(i!==void 0)r.colorSpace=i;return e[t]=r,r})}assignFinalMaterial(e){let{geometry:t,material:n}=e,i=t.attributes.tangent===void 0,s=t.attributes.color!==void 0,r=t.attributes.normal===void 0;if(e.isPoints){let a="PointsMaterial:"+n.uuid,o=this.cache.get(a);if(!o)o=new js,Ot.prototype.copy.call(o,n),o.color.copy(n.color),o.map=n.map,o.sizeAttenuation=!1,this.cache.add(a,o);n=o}else if(e.isLine){let a="LineBasicMaterial:"+n.uuid,o=this.cache.get(a);if(!o)o=new $s,Ot.prototype.copy.call(o,n),o.color.copy(n.color),o.map=n.map,this.cache.add(a,o);n=o}if(i||s||r){let a="ClonedMaterial:"+n.uuid+":";if(i)a+="derivative-tangents:";if(s)a+="vertex-colors:";if(r)a+="flat-shading:";let o=this.cache.get(a);if(!o){if(o=n.clone(),s)o.vertexColors=!0;if(r)o.flatShading=!0;if(i){if(o.normalScale)o.normalScale.y*=-1;if(o.clearcoatNormalScale)o.clearcoatNormalScale.y*=-1}this.cache.add(a,o),this.associations.set(o,this.associations.get(n))}n=o}e.material=n}getMaterialType(){return Un}loadMaterial(e){let t=this,n=this.json,i=this.extensions,s=n.materials[e],r,a={},o=s.extensions||{},l=[];if(o[Xe.KHR_MATERIALS_UNLIT]){let h=i[Xe.KHR_MATERIALS_UNLIT];r=h.getMaterialType(),l.push(h.extendParams(a,s,t))}else{let h=s.pbrMetallicRoughness||{};if(a.color=new pe(1,1,1),a.opacity=1,Array.isArray(h.baseColorFactor)){let u=h.baseColorFactor;a.color.setRGB(u[0],u[1],u[2],Ft),a.opacity=u[3]}if(h.baseColorTexture!==void 0)l.push(t.assignTexture(a,"map",h.baseColorTexture,gn));if(a.metalness=h.metallicFactor!==void 0?h.metallicFactor:1,a.roughness=h.roughnessFactor!==void 0?h.roughnessFactor:1,h.metallicRoughnessTexture!==void 0)l.push(t.assignTexture(a,"metalnessMap",h.metallicRoughnessTexture)),l.push(t.assignTexture(a,"roughnessMap",h.metallicRoughnessTexture));r=this._invokeOne(function(u){return u.getMaterialType&&u.getMaterialType(e)}),l.push(Promise.all(this._invokeAll(function(u){return u.extendMaterialParams&&u.extendMaterialParams(e,a)})))}if(s.doubleSided===!0)a.side=jt;let c=s.alphaMode||Fl.OPAQUE;if(c===Fl.BLEND)a.transparent=!0,a.depthWrite=!1;else if(a.transparent=!1,c===Fl.MASK)a.alphaTest=s.alphaCutoff!==void 0?s.alphaCutoff:0.5;if(s.normalTexture!==void 0&&r!==kt){if(l.push(t.assignTexture(a,"normalMap",s.normalTexture)),a.normalScale=new Me(1,1),s.normalTexture.scale!==void 0){let h=s.normalTexture.scale;a.normalScale.set(h,h)}}if(s.occlusionTexture!==void 0&&r!==kt){if(l.push(t.assignTexture(a,"aoMap",s.occlusionTexture)),s.occlusionTexture.strength!==void 0)a.aoMapIntensity=s.occlusionTexture.strength}if(s.emissiveFactor!==void 0&&r!==kt){let h=s.emissiveFactor;a.emissive=new pe().setRGB(h[0],h[1],h[2],Ft)}if(s.emissiveTexture!==void 0&&r!==kt)l.push(t.assignTexture(a,"emissiveMap",s.emissiveTexture,gn));return Promise.all(l).then(function(){let h=new r(a);if(s.name)h.name=s.name;if(vn(h,s),t.associations.set(h,{materials:e}),s.extensions)bi(i,h,s);return h})}createUniqueName(e){let t=Ze.sanitizeNodeName(e||"");if(t in this.nodeNamesUsed)return t+"_"+ ++this.nodeNamesUsed[t];else return this.nodeNamesUsed[t]=0,t}loadGeometries(e){let t=this,n=this.extensions,i=this.primitiveCache;function s(a){return n[Xe.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(o){return Eu(o,a,t)})}let r=[];for(let a=0,o=e.length;a<o;a++){let l=e[a],c=u0(l),h=i[c];if(h)r.push(h.promise);else{let u;if(l.extensions&&l.extensions[Xe.KHR_DRACO_MESH_COMPRESSION])u=s(l);else u=Eu(new St,l,t);i[c]={primitive:l,promise:u},r.push(u)}}return Promise.all(r)}loadMesh(e){let t=this,n=this.json,i=this.extensions,s=n.meshes[e],r=s.primitives,a=[];for(let o=0,l=r.length;o<l;o++){let c=r[o].material===void 0?l0(this.cache):this.getDependency("material",r[o].material);a.push(c)}return a.push(t.loadGeometries(r)),Promise.all(a).then(function(o){let l=o.slice(0,o.length-1),c=o[o.length-1],h=[];for(let d=0,m=c.length;d<m;d++){let _=c[d],x=r[d],f,p=l[d];if(x.mode===en.TRIANGLES||x.mode===en.TRIANGLE_STRIP||x.mode===en.TRIANGLE_FAN||x.mode===void 0){if(f=s.isSkinnedMesh===!0?new pa(_,p):new nt(_,p),f.isSkinnedMesh===!0)f.normalizeSkinWeights();if(x.mode===en.TRIANGLE_STRIP)f.geometry=Dl(f.geometry,Hs);else if(x.mode===en.TRIANGLE_FAN)f.geometry=Dl(f.geometry,is)}else if(x.mode===en.LINES)f=new ma(_,p);else if(x.mode===en.LINE_STRIP)f=new ls(_,p);else if(x.mode===en.LINE_LOOP)f=new ga(_,p);else if(x.mode===en.POINTS)f=new _a(_,p);else throw Error("THREE.GLTFLoader: Primitive mode unsupported: "+x.mode);if(Object.keys(f.geometry.morphAttributes).length>0)h0(f,s);if(f.name=t.createUniqueName(s.name||"mesh_"+e),vn(f,s),x.extensions)bi(i,f,x);t.assignFinalMaterial(f),h.push(f)}for(let d=0,m=h.length;d<m;d++)t.associations.set(h[d],{meshes:e,primitives:d});if(h.length===1){if(s.extensions)bi(i,h[0],s);return h[0]}let u=new fn;if(s.extensions)bi(i,u,s);t.associations.set(u,{meshes:e});for(let d=0,m=h.length;d<m;d++)u.add(h[d]);return u})}loadCamera(e){let t,n=this.json.cameras[e],i=n[n.type];if(!i){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}if(n.type==="perspective")t=new yt(al.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2000000);else if(n.type==="orthographic")t=new zn(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar);if(n.name)t.name=this.createUniqueName(n.name);return vn(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let i=0,s=t.joints.length;i<s;i++)n.push(this._loadNodeShallow(t.joints[i]));if(t.inverseBindMatrices!==void 0)n.push(this.getDependency("accessor",t.inverseBindMatrices));else n.push(null);return Promise.all(n).then(function(i){let s=i.pop(),r=i,a=[],o=[];for(let l=0,c=r.length;l<c;l++){let h=r[l];if(h){a.push(h);let u=new Fe;if(s!==null)u.fromArray(s.array,l*16);o.push(u)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[l])}return new Js(a,o)})}loadAnimation(e){let t=this.json,n=this,i=t.animations[e],s=i.name?i.name:"animation_"+e,r=[],a=[],o=[],l=[],c=[];for(let h=0,u=i.channels.length;h<u;h++){let d=i.channels[h],m=i.samplers[d.sampler],_=d.target,x=_.node,f=i.parameters!==void 0?i.parameters[m.input]:m.input,p=i.parameters!==void 0?i.parameters[m.output]:m.output;if(_.node===void 0)continue;r.push(this.getDependency("node",x)),a.push(this.getDependency("accessor",f)),o.push(this.getDependency("accessor",p)),l.push(m),c.push(_)}return Promise.all([Promise.all(r),Promise.all(a),Promise.all(o),Promise.all(l),Promise.all(c)]).then(function(h){let u=h[0],d=h[1],m=h[2],_=h[3],x=h[4],f=[];for(let A=0,M=u.length;A<M;A++){let b=u[A],R=d[A],E=m[A],P=_[A],N=x[A];if(b===void 0)continue;if(b.updateMatrix)b.updateMatrix();let T=n._createAnimationTracks(b,R,E,P,N);if(T)for(let S=0;S<T.length;S++)f.push(T[S])}let p=new Sa(s,void 0,f);return vn(p,i),p})}createNodeMesh(e){let t=this.json,n=this,i=t.nodes[e];if(i.mesh===void 0)return null;return n.getDependency("mesh",i.mesh).then(function(s){let r=n._getNodeRef(n.meshCache,i.mesh,s);if(i.weights!==void 0)r.traverse(function(a){if(!a.isMesh)return;for(let o=0,l=i.weights.length;o<l;o++)a.morphTargetInfluences[o]=i.weights[o]});return r})}loadNode(e){let t=this.json,n=this,i=t.nodes[e],s=n._loadNodeShallow(e),r=[],a=i.children||[];for(let l=0,c=a.length;l<c;l++)r.push(n.getDependency("node",a[l]));let o=i.skin===void 0?Promise.resolve(null):n.getDependency("skin",i.skin);return Promise.all([s,Promise.all(r),o]).then(function(l){let c=l[0],h=l[1],u=l[2];if(u!==null)c.traverse(function(d){if(!d.isSkinnedMesh)return;d.bind(u,f0)});for(let d=0,m=h.length;d<m;d++)c.add(h[d]);return c})}_loadNodeShallow(e){let t=this.json,n=this.extensions,i=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let s=t.nodes[e],r=s.name?i.createUniqueName(s.name):"",a=[],o=i._invokeOne(function(l){return l.createNodeMesh&&l.createNodeMesh(e)});if(o)a.push(o);if(s.camera!==void 0)a.push(i.getDependency("camera",s.camera).then(function(l){return i._getNodeRef(i.cameraCache,s.camera,l)}));return i._invokeAll(function(l){return l.createNodeAttachment&&l.createNodeAttachment(e)}).forEach(function(l){a.push(l)}),this.nodeCache[e]=Promise.all(a).then(function(l){let c;if(s.isBone===!0)c=new Ys;else if(l.length>1)c=new fn;else if(l.length===1)c=l[0];else c=new Qe;if(c!==l[0])for(let h=0,u=l.length;h<u;h++)c.add(l[h]);if(s.name)c.userData.name=s.name,c.name=r;if(vn(c,s),s.extensions)bi(n,c,s);if(s.matrix!==void 0){let h=new Fe;h.fromArray(s.matrix),c.applyMatrix4(h)}else{if(s.translation!==void 0)c.position.fromArray(s.translation);if(s.rotation!==void 0)c.quaternion.fromArray(s.rotation);if(s.scale!==void 0)c.scale.fromArray(s.scale)}if(!i.associations.has(c))i.associations.set(c,{});else if(s.mesh!==void 0&&i.meshCache.refs[s.mesh]>1){let h=i.associations.get(c);i.associations.set(c,{...h})}return i.associations.get(c).nodes=e,c}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],i=this,s=new fn;if(n.name)s.name=i.createUniqueName(n.name);if(vn(s,n),n.extensions)bi(t,s,n);let r=n.nodes||[],a=[];for(let o=0,l=r.length;o<l;o++)a.push(i.getDependency("node",r[o]));return Promise.all(a).then(function(o){for(let c=0,h=o.length;c<h;c++)s.add(o[c]);let l=(c)=>{let h=new Map;for(let[u,d]of i.associations)if(u instanceof Ot||u instanceof pt)h.set(u,d);return c.traverse((u)=>{let d=i.associations.get(u);if(d!=null)h.set(u,d)}),h};return i.associations=l(s),s})}_createAnimationTracks(e,t,n,i,s){let r=[],a=e.name?e.name:e.uuid,o=[];if(ni[s.path]===ni.weights)e.traverse(function(u){if(u.morphTargetInfluences)o.push(u.name?u.name:u.uuid)});else o.push(a);let l;switch(ni[s.path]){case ni.weights:l=In;break;case ni.rotation:l=Fn;break;case ni.translation:case ni.scale:l=Pn;break;default:switch(n.itemSize){case 1:l=In;break;case 2:case 3:default:l=Pn;break}break}let c=i.interpolation!==void 0?o0[i.interpolation]:ia,h=this._getArrayFromAccessor(n);for(let u=0,d=o.length;u<d;u++){let m=new l(o[u]+"."+ni[s.path],t.array,h,c);if(i.interpolation==="CUBICSPLINE")this._createCubicSplineTrackInterpolant(m);r.push(m)}return r}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let n=zl(t.constructor),i=new Float32Array(t.length);for(let s=0,r=t.length;s<r;s++)i[s]=t[s]*n;t=i}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){return new(this instanceof Fn?Ku:Gl)(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function p0(e,t,n){let i=t.attributes,s=new Qt;if(i.POSITION!==void 0){let o=n.json.accessors[i.POSITION],{min:l,max:c}=o;if(l!==void 0&&c!==void 0){if(s.set(new L(l[0],l[1],l[2]),new L(c[0],c[1],c[2])),o.normalized){let h=zl(fs[o.componentType]);s.min.multiplyScalar(h),s.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let r=t.targets;if(r!==void 0){let o=new L,l=new L;for(let c=0,h=r.length;c<h;c++){let u=r[c];if(u.POSITION!==void 0){let d=n.json.accessors[u.POSITION],{min:m,max:_}=d;if(m!==void 0&&_!==void 0){if(l.setX(Math.max(Math.abs(m[0]),Math.abs(_[0]))),l.setY(Math.max(Math.abs(m[1]),Math.abs(_[1]))),l.setZ(Math.max(Math.abs(m[2]),Math.abs(_[2]))),d.normalized){let x=zl(fs[d.componentType]);l.multiplyScalar(x)}o.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}s.expandByVector(o)}e.boundingBox=s;let a=new qt;s.getCenter(a.center),a.radius=s.min.distanceTo(s.max)/2,e.boundingSphere=a}function Eu(e,t,n){let i=t.attributes,s=[];function r(a,o){return n.getDependency("accessor",a).then(function(l){e.setAttribute(o,l)})}for(let a in i){let o=Bl[a]||a.toLowerCase();if(o in e.attributes)continue;s.push(r(i[a],o))}if(t.indices!==void 0&&!e.index){let a=n.getDependency("accessor",t.indices).then(function(o){e.setIndex(o)});s.push(a)}if(Ge.workingColorSpace!==Ft&&"COLOR_0"in i)console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${Ge.workingColorSpace}" not supported.`);return vn(e,t),p0(e,t,n),Promise.all(s).then(function(){return t.targets!==void 0?c0(e,t.targets,n):e})}class Hl extends rs{constructor(){super();this.name="RoomEnvironment";let e=new Kn;e.deleteAttribute("uv");let t=new Un({side:Dt}),n=new Un,i=new Bn(16777215,900,28,2);i.position.set(0.418,16.199,0.3),this.add(i);let s=new nt(e,t);s.position.set(-0.757,13.219,0.717),s.scale.set(31.713,28.305,28.591),this.add(s);let r=new os(e,n,6),a=new Qe;a.position.set(-10.906,2.009,1.846),a.rotation.set(0,-0.195,0),a.scale.set(2.328,7.905,4.651),a.updateMatrix(),r.setMatrixAt(0,a.matrix),a.position.set(-5.607,-0.754,-0.758),a.rotation.set(0,0.994,0),a.scale.set(1.97,1.534,3.955),a.updateMatrix(),r.setMatrixAt(1,a.matrix),a.position.set(6.167,0.857,7.803),a.rotation.set(0,0.561,0),a.scale.set(3.927,6.285,3.687),a.updateMatrix(),r.setMatrixAt(2,a.matrix),a.position.set(-2.017,0.018,6.124),a.rotation.set(0,0.333,0),a.scale.set(2.002,4.566,2.064),a.updateMatrix(),r.setMatrixAt(3,a.matrix),a.position.set(2.291,-0.756,-2.621),a.rotation.set(0,-0.286,0),a.scale.set(1.546,1.552,1.496),a.updateMatrix(),r.setMatrixAt(4,a.matrix),a.position.set(-2.193,-0.369,-5.547),a.rotation.set(0,0.516,0),a.scale.set(3.875,3.487,2.986),a.updateMatrix(),r.setMatrixAt(5,a.matrix),this.add(r);let o=new nt(e,ps(50));o.position.set(-16.116,14.37,8.208),o.scale.set(0.1,2.428,2.739),this.add(o);let l=new nt(e,ps(50));l.position.set(-16.109,18.021,-8.207),l.scale.set(0.1,2.425,2.751),this.add(l);let c=new nt(e,ps(17));c.position.set(14.904,12.198,-1.832),c.scale.set(0.15,4.265,6.331),this.add(c);let h=new nt(e,ps(43));h.position.set(-0.462,8.89,14.52),h.scale.set(4.38,5.441,0.088),this.add(h);let u=new nt(e,ps(20));u.position.set(3.235,11.486,-12.541),u.scale.set(2.5,2,0.1),this.add(u);let d=new nt(e,ps(100));d.position.set(0,20,0),d.scale.set(1,0.1,1),this.add(d)}dispose(){let e=new Set;this.traverse((t)=>{if(t.isMesh)e.add(t.geometry),e.add(t.material)});for(let t of e)t.dispose()}}function ps(e){return new ya({color:0,emissive:16777215,emissiveIntensity:e})}var ms={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class tn{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}var m0=new zn(-1,1,1,-1,0,1);class ju extends St{constructor(){super();this.setAttribute("position",new xt([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new xt([0,2,0,0,2,0],2))}}var g0=new ju;class Ti{constructor(e){this._mesh=new nt(g0,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,m0)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class Vl extends tn{constructor(e,t="tDiffuse"){super();if(this.textureID=t,this.uniforms=null,this.material=null,e instanceof vt)this.uniforms=e.uniforms,this.material=e;else if(e)this.uniforms=Dn.clone(e.uniforms),this.material=new vt({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader});this._fsQuad=new Ti(this.material)}render(e,t,n){if(this.uniforms[this.textureID])this.uniforms[this.textureID].value=n.texture;if(this._fsQuad.material=this.material,this.renderToScreen)e.setRenderTarget(null),this._fsQuad.render(e);else{if(e.setRenderTarget(t),this.clear)e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil);this._fsQuad.render(e)}}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class Na extends tn{constructor(e,t){super();this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let i=e.getContext(),s=e.state;s.buffers.color.setMask(!1),s.buffers.depth.setMask(!1),s.buffers.color.setLocked(!0),s.buffers.depth.setLocked(!0);let r,a;if(this.inverse)r=0,a=1;else r=1,a=0;if(s.buffers.stencil.setTest(!0),s.buffers.stencil.setOp(i.REPLACE,i.REPLACE,i.REPLACE),s.buffers.stencil.setFunc(i.ALWAYS,r,4294967295),s.buffers.stencil.setClear(a),s.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear)e.clear();if(e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear)e.clear();e.render(this.scene,this.camera),s.buffers.color.setLocked(!1),s.buffers.depth.setLocked(!1),s.buffers.color.setMask(!0),s.buffers.depth.setMask(!0),s.buffers.stencil.setLocked(!1),s.buffers.stencil.setFunc(i.EQUAL,1,4294967295),s.buffers.stencil.setOp(i.KEEP,i.KEEP,i.KEEP),s.buffers.stencil.setLocked(!0)}}class Wl extends tn{constructor(){super();this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class Xl{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new Me);this._width=n.width,this._height=n.height,t=new Et(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Ut}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Vl(ms),this.copyPass.material.blending=ln,this.clock=new Ca}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);if(t!==-1)this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){if(e===void 0)e=this.clock.getDelta();let t=this.renderer.getRenderTarget(),n=!1;for(let i=0,s=this.passes.length;i<s;i++){let r=this.passes[i];if(r.enabled===!1)continue;if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(i),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),r.needsSwap){if(n){let a=this.renderer.getContext(),o=this.renderer.state.buffers.stencil;o.setFunc(a.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),o.setFunc(a.EQUAL,1,4294967295)}this.swapBuffers()}if(Na!==void 0){if(r instanceof Na)n=!0;else if(r instanceof Wl)n=!1}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new Me);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,i=this._height*this._pixelRatio;this.renderTarget1.setSize(n,i),this.renderTarget2.setSize(n,i);for(let s=0;s<this.passes.length;s++)this.passes[s].setSize(n,i)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class ql extends tn{constructor(e,t,n=null,i=null,s=null){super();this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=i,this.clearAlpha=s,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new pe}render(e,t,n){let i=e.autoClear;e.autoClear=!1;let s,r;if(this.overrideMaterial!==null)r=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial;if(this.clearColor!==null)e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha());if(this.clearAlpha!==null)s=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha);if(this.clearDepth==!0)e.clearDepth();if(e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0)e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil);if(e.render(this.scene,this.camera),this.clearColor!==null)e.setClearColor(this._oldClearColor);if(this.clearAlpha!==null)e.setClearAlpha(s);if(this.overrideMaterial!==null)this.scene.overrideMaterial=r;e.autoClear=i}}var Qu={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new pe(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class Ai extends tn{constructor(e,t=1,n,i){super();this.strength=t,this.radius=n,this.threshold=i,this.resolution=e!==void 0?new Me(e.x,e.y):new Me(256,256),this.clearColor=new pe(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let s=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);this.renderTargetBright=new Et(s,r,{type:Ut}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let c=0;c<this.nMips;c++){let h=new Et(s,r,{type:Ut});h.texture.name="UnrealBloomPass.h"+c,h.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(h);let u=new Et(s,r,{type:Ut});u.texture.name="UnrealBloomPass.v"+c,u.texture.generateMipmaps=!1,this.renderTargetsVertical.push(u),s=Math.round(s/2),r=Math.round(r/2)}let a=Qu;this.highPassUniforms=Dn.clone(a.uniforms),this.highPassUniforms.luminosityThreshold.value=i,this.highPassUniforms.smoothWidth.value=0.01,this.materialHighPassFilter=new vt({uniforms:this.highPassUniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),this.separableBlurMaterials=[];let o=[6,10,14,18,22];s=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);for(let c=0;c<this.nMips;c++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(o[c])),this.separableBlurMaterials[c].uniforms.invSize.value=new Me(1/s,1/r),s=Math.round(s/2),r=Math.round(r/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=0.1;let l=[1,0.8,0.6,0.4,0.2];this.compositeMaterial.uniforms.bloomFactors.value=l,this.bloomTintColors=[new L(1,1,1),new L(1,1,1),new L(1,1,1),new L(1,1,1),new L(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=Dn.clone(ms.uniforms),this.blendMaterial=new vt({uniforms:this.copyUniforms,vertexShader:ms.vertexShader,fragmentShader:ms.fragmentShader,premultipliedAlpha:!0,blending:ui,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new pe,this._oldClearAlpha=1,this._basic=new kt,this._fsQuad=new Ti(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),i=Math.round(t/2);this.renderTargetBright.setSize(n,i);for(let s=0;s<this.nMips;s++)this.renderTargetsHorizontal[s].setSize(n,i),this.renderTargetsVertical[s].setSize(n,i),this.separableBlurMaterials[s].uniforms.invSize.value=new Me(1/n,1/i),n=Math.round(n/2),i=Math.round(i/2)}render(e,t,n,i,s){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();let r=e.autoClear;if(e.autoClear=!1,e.setClearColor(this.clearColor,0),s)e.state.buffers.stencil.setTest(!1);if(this.renderToScreen)this._fsQuad.material=this._basic,this._basic.map=n.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e);this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let a=this.renderTargetBright;for(let o=0;o<this.nMips;o++)this._fsQuad.material=this.separableBlurMaterials[o],this.separableBlurMaterials[o].uniforms.colorTexture.value=a.texture,this.separableBlurMaterials[o].uniforms.direction.value=Ai.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[o]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[o].uniforms.colorTexture.value=this.renderTargetsHorizontal[o].texture,this.separableBlurMaterials[o].uniforms.direction.value=Ai.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[o]),e.clear(),this._fsQuad.render(e),a=this.renderTargetsVertical[o];if(this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,s)e.state.buffers.stencil.setTest(!0);if(this.renderToScreen)e.setRenderTarget(null),this._fsQuad.render(e);else e.setRenderTarget(n),this._fsQuad.render(e);e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=r}_getSeparableBlurMaterial(e){let t=[],n=e/3;for(let i=0;i<e;i++)t.push(0.39894*Math.exp(-0.5*i*i/(n*n))/n);return new vt({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new Me(0.5,0.5)},direction:{value:new Me(0.5,0.5)},gaussianCoefficients:{value:t}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {

					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;

					for ( int i = 1; i < KERNEL_RADIUS; i ++ ) {

						float x = float( i );
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * w;

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new vt({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}}Ai.BlurDirectionX=new Me(1,0);Ai.BlurDirectionY=new Me(0,1);var cr={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

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

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class Yl extends tn{constructor(){super();this.isOutputPass=!0,this.uniforms=Dn.clone(cr.uniforms),this.material=new tr({name:cr.name,uniforms:this.uniforms,vertexShader:cr.vertexShader,fragmentShader:cr.fragmentShader}),this._fsQuad=new Ti(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){if(this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping){if(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},Ge.getTransfer(this._outputColorSpace)===et)this.material.defines.SRGB_TRANSFER="";if(this._toneMapping===Ds)this.material.defines.LINEAR_TONE_MAPPING="";else if(this._toneMapping===Us)this.material.defines.REINHARD_TONE_MAPPING="";else if(this._toneMapping===Fs)this.material.defines.CINEON_TONE_MAPPING="";else if(this._toneMapping===di)this.material.defines.ACES_FILMIC_TONE_MAPPING="";else if(this._toneMapping===Bs)this.material.defines.AGX_TONE_MAPPING="";else if(this._toneMapping===zs)this.material.defines.NEUTRAL_TONE_MAPPING="";else if(this._toneMapping===Os)this.material.defines.CUSTOM_TONE_MAPPING="";this.material.needsUpdate=!0}if(this.renderToScreen===!0)e.setRenderTarget(null),this._fsQuad.render(e);else{if(e.setRenderTarget(t),this.clear)e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil);this._fsQuad.render(e)}}dispose(){this.material.dispose(),this._fsQuad.dispose()}}var Zl=(e,t,n)=>e+(t-e)*n,Jl=(e,t,n)=>({x:Zl(e.x,t.x,n),y:Zl(e.y,t.y,n),z:Zl(e.z,t.z,n)}),ed=(e,t)=>Math.hypot(t.x-e.x,t.y-e.y,t.z-e.z),_0=(e)=>e*e*(3-2*e),td=(e)=>Number.isFinite(e)?Math.min(1,Math.max(0,e)):0;function nd(e){let t=0;for(let n=1;n<e.length;n++)t+=ed(e[n-1],e[n]);return t}function id(e,t){if(e.length===0)return{x:0,y:0,z:0};if(e.length===1||!(t>0))return e[0];let n=t;for(let i=1;i<e.length;i++){let s=e[i-1],r=e[i],a=ed(s,r);if(n<=a)return a===0?s:Jl(s,r,n/a);n-=a}return e[e.length-1]}function sd(e,t,n,i){if(!(n>0)||!(t>0))return 0;let s=n/t,r=(e%(s+i)+(s+i))%(s+i);return Math.min(n,r*t)}function rd(e,t){if(e.length===0)return{position:{x:0,y:0,z:10},look:{x:0,y:0,z:0}};let n=td(t),i=e[0];if(n<=i.at)return{position:i.position,look:i.look};for(let r=1;r<e.length;r++){let a=e[r-1],o=e[r];if(n<=o.at){let l=_0((n-a.at)/(o.at-a.at));return{position:Jl(a.position,o.position,l),look:Jl(a.look,o.look,l)}}}let s=e[e.length-1];return{position:s.position,look:s.look}}function ad(e,t,n){let i=t-n;return i>0?td(e/i):0}class Kl{limitMs;window;times=[];constructor(e,t){this.limitMs=e;this.window=t}add(e){if(!Number.isFinite(e)||e<=0)return!1;if(this.times.push(e),this.times.length>this.window)this.times.shift();if(this.times.length<this.window)return!1;return this.times.reduce((t,n)=>t+n,0)/this.times.length>this.limitMs}}var $l=(e)=>getComputedStyle(document.documentElement).getPropertyValue(e).trim(),hr=(e,t,n)=>({x:e,y:n,z:-t}),od=[hr(-9,3,0.55),hr(-4.5,0,0.55),hr(0,-3,0.55),hr(4.5,0,0.55),hr(9,3,0.55)],x0=[{at:0,position:{x:8,y:14,z:21},look:{x:-6.6,y:0,z:0.5}},{at:0.25,position:{x:-8.5,y:3.4,z:5.2},look:{x:-5.4,y:0.4,z:-0.6}},{at:0.5,position:{x:3.2,y:3.6,z:9.5},look:{x:0.2,y:0.4,z:2.2}},{at:0.75,position:{x:0,y:15.5,z:6},look:{x:0,y:0,z:0}},{at:1,position:{x:0,y:9,z:19},look:{x:0,y:0.2,z:-1}}];async function ld(e){let{canvas:t}=e,n=new Nl({canvas:t,antialias:!0,alpha:!1,powerPreference:"high-performance"});n.outputColorSpace=gn,n.toneMapping=di,n.toneMappingExposure=1.05;let i=new pe($l("--stage")||"#05080d"),s=new rs;s.background=i,s.fog=new Xs(i,28,62);let r=new yt(36,1,0.1,120),a=new or(n);s.environment=a.fromScene(new Hl,0.04).texture,s.environmentIntensity=0.2,s.add(new Ta(new pe("#9db8e8"),i,0.35));let o=new hs(new pe("#cfe0ff"),2.1);o.position.set(-6,12,8),s.add(o);let l=new Bn(new pe($l("--packet")||"#e8590c"),16,26,1.8);l.position.set(9,6,-7),s.add(l);let c=await new kl().loadAsync(e.modelUrl);s.add(c.scene),c.scene.traverse((O)=>{let Y=O;if(!Y.isMesh)return;if(Y.name==="floor"){let te=Y.material;te.color.multiplyScalar(0.3),te.roughness=0.75,te.metalness=0.1}});let h=new pe($l("--packet")||"#e8590c"),u=new nt(new er(0.26,24,16),new kt({color:h.clone().multiplyScalar(3.2)})),d=document.createElement("canvas");d.width=d.height=128;let m=d.getContext("2d");if(m){let O=m.createRadialGradient(64,64,0,64,64,64);O.addColorStop(0,"rgba(255,255,255,0.95)"),O.addColorStop(0.18,"rgba(255,255,255,0.45)"),O.addColorStop(0.5,"rgba(255,255,255,0.1)"),O.addColorStop(1,"rgba(255,255,255,0)"),m.fillStyle=O,m.fillRect(0,0,128,128)}let _=new fa(new qs({map:new xa(d),color:h,blending:ui,depthWrite:!1,transparent:!0}));_.scale.set(3.4,3.4,1),u.add(_),s.add(u);let x=new Bn(h,14,7,1.8);u.add(x);let f=new Xl(n);f.addPass(new ql(s,r));let p=new Ai(new Me(1,1),0.5,0.55,0.72);f.addPass(p),f.addPass(new Yl);let A=()=>{let O=Math.max(1,t.clientWidth),Y=Math.max(1,t.clientHeight),te=Math.min(window.devicePixelRatio||1,2);n.setPixelRatio(te),n.setSize(O,Y,!1),f.setPixelRatio(te),f.setSize(O,Y),r.aspect=O/Y,r.updateProjectionMatrix()};A();let M=new ResizeObserver(A);M.observe(t);let b={x:0,y:0},R=(O)=>{b.x=(O.clientX/window.innerWidth-0.5)*2,b.y=(O.clientY/window.innerHeight-0.5)*2};window.addEventListener("pointermove",R,{passive:!0});let E=nd(od),P=new Kl(34,150),N=new L,T=new L,S=0,C=0,k=!0,X=performance.now(),G=X,K=!0,H=(O)=>{if(!k)return;let Y=Math.min(0.1,(O-X)/1000);if(P.add(O-X)){k=!1,e.onSlow();return}X=O,S=ad(window.scrollY,document.documentElement.scrollHeight,window.innerHeight),C+=(S-C)*Math.min(1,Y*5);let te=rd(x0,C);N.set(te.position.x+b.x*0.5,te.position.y-b.y*0.3,te.position.z),T.set(te.look.x,te.look.y,te.look.z),r.position.copy(N),r.lookAt(T);let ie=id(od,sd((O-G)/1000,2.6,E,1.4));if(u.position.set(ie.x,ie.y,ie.z),f.render(),K)K=!1,e.onReady();requestAnimationFrame(H)};return requestAnimationFrame(H),{stop(){k=!1,M.disconnect(),window.removeEventListener("pointermove",R),f.dispose(),n.dispose(),a.dispose()}}}var gs=document.documentElement,cd=document.getElementById("stage"),v0=typeof matchMedia==="function"&&matchMedia("(max-width: 599px), (max-height: 500px) and (pointer: coarse)").matches,y0=typeof matchMedia==="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;function M0(){try{let e=document.createElement("canvas");return!!(e.getContext("webgl2")||e.getContext("webgl"))}catch{return!1}}var hd=null;async function S0(){if(!cd||ac({phone:v0,calm:y0,webgl:M0()})==="poster"){gs.classList.add("poster-only");return}try{hd=await ld({canvas:cd,modelUrl:"/landing/network.glb",onReady:()=>gs.classList.add("scene-ready"),onSlow:()=>{gs.classList.remove("scene-ready"),gs.classList.add("poster-only"),hd?.stop()}})}catch{gs.classList.remove("scene-ready"),gs.classList.add("poster-only")}}S0();})();
