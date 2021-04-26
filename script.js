   /* =======================START-SETUP======================= */
/* CONTROLS */
var keys = {};

/* ANIMATION */
var stopAnim = true, fallbackAnimInt = null;
var lastTick = 0;
var animFrame = window.requestAnimationFrame       ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame    ||
                window.oRequestAnimationFrame      ||
                window.msRequestAnimationFrame     ||
                null;
var pointerLock = 'pointerLockElement' in document ||
                   'mozPointerLockElement' in document ||
                   'webkitPointerLockElement' in document;

/* VIEW/CAMERA/WORLD */
var view = [];
view.height = 0;
view.width = 0;
view.vendor = {prefix:getBrowserVendor()};
view.vendor.style = {
  perspective:view.vendor.prefix.lowercase+"Perspective",
  transform:view.vendor.prefix.lowercase+"Transform",
  transformStyle:view.vendor.prefix.lowercase+"TransformStyle"};
view.port = "viewport";
view.camera = "camera";
view.world = "world";
view.perspective = 700;
view.dimensions = {height:480,length:160,width:80};
view.move = {x:0, y:0, z:0};
view.pan = {x:0, y:0, z:0, xAvg:[], yAvg:[]};
view.pos = {x:0, y:0, z:0};
view.direction = {x:0, y:0, z:0, maxX:90, maxY:270, maxZ:180};
view.speed = {x:0, y:0, z:0, maxX:540, maxY:240, maxZ:720};
view.fullscreen = false;
view.pointerLock = false;
view.mouse = {x:0, y:0, xOld:null, yOld:null};

var radians = Math.PI/180;
/* ========================END-SETUP======================== */

/* ==================START-EVENT-HANDLERS=================== */
/* LOAD-EVENT-LISTENER */
window.addEventListener("load", handleLoadEvent, false);

function handleLoadEvent(e){
  /* INITIAL-VIEW-SETUP */
  view.port = document.getElementById(view.port);
  view.camera = document.getElementById(view.camera);
  view.world = document.getElementById(view.world);
  handleResizeEvent(e);
  view.pos.y = view.dimensions.height;
  view.pos.z = -2340;
  view.pos.x = -840;
  
  /* ADD-EVENT-LISTENERS */
  window.addEventListener("resize", handleResizeEvent, false);
  window.addEventListener("mousemove", handleMouseMoveEvent, false);
  window.addEventListener("mousedown", handleMouseDownEvent, false);
  window.addEventListener("mouseup", handleMouseUpEvent, false);
  window.addEventListener("click", handleMouseClickEvent, false);
  window.addEventListener("dblclick", handleMouseDblClickEvent, false);
  window.addEventListener("mousewheel", handleMouseWheelEvent, false);
  window.addEventListener("wheel", handleMouseWheelEvent, false);
  window.addEventListener("contextmenu", handleContextMenu, false);
  window.addEventListener("keydown", handleKeyDownEvent, false);
  window.addEventListener("keyup", handleKeyUpEvent, false);
  if(window.ondeviceorientation !== undefined){
    window.addEventListener("deviceorientation", handleGyro, false);
  }
  document.getElementById("start").addEventListener("click", function(){
    if(view.pointerLock){
      view.port.requestPointerLock();
    }
    document.getElementById("overlay").setAttribute("style","display:none;");
    view.camera.setAttribute("class","object");
    view.world.setAttribute("class","object");
    stopAnim = false;
    startAnimation();
  }, false);
  document.getElementById("fullscreen").addEventListener("click", function(){
    /*var state = document.fullscreenEnabled  ||
              document.mozFullScreenEnabled ||
             document.webkitFullscreenEnabled;
    */
    if(view.fullscreen){
      if(document.exitFullscreen) {
        document.exitFullscreen();
      } else if(document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if(document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      this.setAttribute("style","background:rgb(200,200,200);");
    } else {
      if(view.port.requestFullscreen) {
        view.port.requestFullscreen();
      } else if(view.port.mozRequestFullScreen) {
        view.port.mozRequestFullScreen();
      } else if(view.port.webkitRequestFullscreen) {
        view.port.webkitRequestFullscreen();
      } else if(view.port.msRequestFullscreen) {
        view.port.msRequestFullscreen();
      }
      this.setAttribute("style","background:#54c76a;");
    }
  }, false);
  document.getElementById("pointerlock").addEventListener("click", function(){
    if(!view.pointerLock){
      if(pointerLock){
        view.pointerLock = true;
        document.addEventListener('pointerlockchange', handlePointerLockChange, false);
        document.addEventListener('mozpointerlockchange', handlePointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', handlePointerLockChange, false);
        view.port.requestPointerLock = view.port.requestPointerLock ||
                                      view.port.mozRequestPointerLock ||
                                      view.port.webkitRequestPointerLock;
        this.setAttribute("style","background:#54c76a;");
      }
    } else {
      view.pointerLock = false;
      this.setAttribute("style","background:rgb(200,200,200);");
    }
  }, false);
}

function handleResizeEvent(e){
  view.height = window.innerHeight;
  view.width = window.innerWidth;
}

function handleMouseMoveEvent(e){
  if(view.pointerLocked){
    view.mouse.x = e.movementX ||
                e.mozMovementX ||
             e.webkitMovementX ||
    0;
    view.mouse.y = e.movementY ||
                e.mozMovementY ||
             e.webkitMovementY ||
    0;
  } else {
    if(view.mouse.xOld == null){
      view.mouse.xOld = e.clientX;
    }
    if(view.mouse.yOld == null){
      view.mouse.yOld = e.clientY;
    }
    var x = e.clientX - view.mouse.xOld;
    var y = e.clientY - view.mouse.yOld;
    if (x !== 0){
      view.mouse.x = x; 
    }
    if (y !== 0){
      view.mouse.y = y; 
    }
    view.mouse.xOld = e.clientX;
    view.mouse.yOld = e.clientY;
  }
}

function handleMouseDownEvent(e){
  //console.log(e);
}

function handleMouseUpEvent(e){
  //console.log(e);
}

function handleMouseClickEvent(e){
  //console.log(e);
}

function handleMouseDblClickEvent(e){
  e.preventDefault();
  document.getElementById("overlay").setAttribute("style","display:block;");
  stopAnimation();
}

function handleMouseWheelEvent(e){
  e.preventDefault();
}

function handleContextMenu(e){
  e.preventDefault();
  document.getElementById("overlay").setAttribute("style","display:block;");
  stopAnimation();
}

function handleKeyDownEvent(e){
  if(!stopAnim){
    var key = e.which;
    switch(key){
      case 87: //'w' UP
        if(!keys[key]){
          view.move.z = 1;
        }
        break;
      case 83: //'s' DOWN
        if(!keys[key]){
          view.move.z = -1;
        }
        break;
      case 65: //'a' LEFT
        if(!keys[key]){
          view.move.x = 1;
        }
        break;
      case 68: //'d' RIGHT
        if(!keys[key]){
          view.move.x = -1;
        }
        break;
        case 16: //'shift' down
       
          
          if(!keys[16]){
            view.move.y = -1;
          } 

        
        break;
      case 32: //'space'
        if(!keys[key]){
          if(keys[16]){
            view.move.y = -1;
          } else {
            view.move.y = 1;
          }
        }
        break;
      default:
        break;
    }
    keys[key] = true;
  }
}

function handleKeyUpEvent(e){
  var key = e.which;
  switch(key){
    case 87: //'w' UP
      view.move.z = 0;
      break;
    case 83: //'s' DOWN
      view.move.z = 0;
      break;
    case 65: //'a' LEFT
      view.move.x = 0;
      break;
    case 68: //'d' RIGHT
      view.move.x = 0;
      break;
      case 16: //'shift'
        view.move.y -= 0;
      break;
    case 32: //'space'
        view.move.y = 0;
      break;
    default:
      break;
      
  }
  keys[key] = false;
}

function handlePointerLockChange(e){
  if(document.pointerLockElement === view.port     ||
      document.mozPointerLockElement === view.port ||
      document.webkitPointerLockElement === view.port) {
    view.pointerLocked = true;
    view.mouse.x = 0;
    view.mouse.y = 0;
  } else {
    document.getElementById("pointerlock").setAttribute("style","background:rgb(200,200,200)");
    view.pointerLocked = true;
    view.mouse.xOld = null;
    view.mouse.yOld = null;
    //this.unlockHook(this.element);
  }
}

function handleGyro(e){
  //view.direction.x = e.beta - 90;
  //view.direction.y = e.gamma * -1;
  //view.direction.z = e.alpha * -1;
}
/* ===================END-EVENT-HANDLERS=================== */

/* ===============START-ANIMATION-RENDERING=============== */
var recursiveAnim = function() {
	if(!stopAnim){
		mainLoop();
		animFrame(recursiveAnim);
	}
};

function startAnimation(){
  if(!stopAnim){
	  if(animFrame !== null) {	// start the mainloop with requestAnimationFrame
		  animFrame(recursiveAnim);
	  } else {					// start the mainloop with fallback setInterval
		  fallbackAnimInt = setInterval(mainLoop,(1000/60));
	  }
    lastTick = new Date().getTime();
  }
}

function stopAnimation(){
	stopAnim = true;
	if(fallbackAnimInt !== null){
		clearInterval(fallbackAnimInt);
	}
  lastTick = 0;
  calcFPS();
}

function calcFPS(){
  var tempTick = lastTick;
  var newTick = new Date().getTime();
  lastTick = newTick;
  var timeSince = +newTick - +tempTick;
  var frameRate = Math.round(1000/timeSince);
  return timeSince/1000;
}

function mainLoop(){
  var timeDelta = calcFPS();
  
  /* SET-CAMERA */
  if(view.mouse.x != 0 || view.mouse.y != 0){
    view.pan.x = view.pan.x + (view.mouse.x * .5);
    view.pan.y = view.pan.y - (view.mouse.y * .5);
    view.mouse.x = 0;
    view.mouse.y = 0;
    view.pan.xAvg.push(view.pan.x);
    var xAvg = getAvg(view.pan.xAvg);
    if(view.pan.xAvg.length >= 9){
      view.pan.xAvg.shift();
    }
    view.pan.yAvg.push(view.pan.y);
    var yAvg = getAvg(view.pan.yAvg);
    if(view.pan.yAvg.length >= 9){
      view.pan.yAvg.shift();
    }
    if(yAvg > view.direction.maxX){
      yAvg = view.direction.maxX;
    } else if(yAvg < -view.direction.maxX){
      yAvg = -view.direction.maxX;
    }
    view.direction.x = yAvg;
    view.direction.y = xAvg;
    view.direction.z = view.pan.z;
    var finalRotate = "translateZ(" + roundTwo(view.perspective) + "px) rotateX(" + roundTwo(view.direction.x) + "deg) rotateY(" + roundTwo(view.direction.y) + "deg) rotateZ(" + roundTwo(view.direction.z) + "deg)";
    view.camera.style[view.vendor.style.transform] = finalRotate;
  }
  
  /* SET-WORLD */
  if(view.speed.x != 0 || view.move.x != 0 || view.speed.y != 0 || view.move.y != 0 || view.speed.z != 0 || view.move.z != 0){
    view.speed.x = view.move.x * (view.speed.maxX * timeDelta);
    view.speed.y = view.move.y * (view.speed.maxY * timeDelta);
    view.speed.z = view.move.z * (view.speed.maxZ * timeDelta);
    view.pos.x += (Math.cos((view.direction.y) * radians) * view.speed.x) - (Math.sin(view.direction.y * radians) * view.speed.z);
    view.pos.y += (view.speed.y);
    view.pos.z += (Math.cos(view.direction.y * radians) * view.speed.z) + (Math.sin((view.direction.y) * radians) * view.speed.x);
    var finalTranslate = "translateX(" + roundTwo(view.pos.x) + "px) translateY(" + roundTwo(view.pos.y) + "px) translateZ(" + roundTwo(view.pos.z) + "px)";
    view.world.style[view.vendor.style.transform] = finalTranslate;
  }
}
/* ================END-ANIMATION-RENDERING================ */

/* ================START-HELPER-FUNCTIONS================= */
/* (AUG 7th 2014) FOUND AT: http://davidwalsh.name/vendor-prefix || w/Reference:https://github.com/x-tag/x-tag */
function getBrowserVendor(){
  var styles = window.getComputedStyle(document.documentElement, ''),
    pre = (Array.prototype.slice
      .call(styles)
      .join('') 
      .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
    )[1],
    dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
  return {
    dom: dom,
    lowercase: pre,
    css: '-' + pre + '-',
    js: pre[0].toUpperCase() + pre.substr(1)
  };
}

function roundTwo(num){
  return Math.round(num * 100) / 100;
}
function getAvg(nums){
  var sum = 0;
  for(var i = 0; i < nums.length; i++){
    sum += nums[i];
  }
  return (sum / nums.length);
}
/* ==================END-HELPER-FUNCTIONS================= */

/* TO-DO
--toggle crosshair in center when in pointer lock
--3d interactive map
--collision(horizontal and vertical[step up])
--lighting(colored)/shadows
--real physics and velocity:
  -jumping
  -when moving, velocity start slow and gain speed
--touchscreen controls
--gyroscope/accelerometer support
--clean up main loop calculations
--loading state (loads all textures first, build scene, choose options...)
--proper startup/loading/paused overlay
--have all controls calibration options
--sounds
--infinite loading ground/sky
--3d support, dual updating viewports
--web workers (if supported) for offthread loop calculation
--websocket for multiplayer or iphone controlled
*/
//me have a lot to work on it XD
