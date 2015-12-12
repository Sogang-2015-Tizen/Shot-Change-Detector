
    
var init = function() {
    // TODO:: Do your initialization job
    console.log("init() called");   
    var cnt = 0;
    var scnt = 0;    
    var snapshots = [];
    var sbdArr = [];    
    var preArr = new Array(256);
    var curArr = new Array(256);
    for (var i = 0; i < 256; i++) {
        preArr[i] = 0;
        curArr[i] = 0;
    }
    var mode = 0;
    var endts = 0;    
    var v = document.getElementById('v');    
    var canvas = document.getElementById('c');
    var context = canvas.getContext('2d');
    var back = document.createElement('canvas');
    var backcontext = back.getContext('2d');    
    var tempts=v.duration;
    var stop_play = 0;    
    v.width = 300;
    v.height = 200;
    v.loop = false;
   
    document.getElementById("buttonbar").style.display = "block";
    function setTime(tValue) {       
                if (tValue == 0) 
                    v.currentTime = tValue;
                else 
                    v.currentTime += tValue;                
     }      
   
    document.getElementById("stop").addEventListener("click", function(evt){
    	button = evt.target;
        if (stop_play % 2 == 0) {
        	v.pause();
            tempts = v.currentTime;
            button.textContent = "Restart";
            stop_play = 1;
        } else {
        	 mode = 1;
             v.load();
             v.currentTime = tempts;
             v.play();
             button.textContent = "  STOP  ";
             stop_play = 0;
        }
    }, false);
    
    (function localFileVideoPlayerInit(win) {
        var URL = win.URL || win.webkitURL,
            displayMessage = (function displayMessageInit() {
                var node = document.querySelector('#message');
                return function displayMessage(message, isError) {
                    node.innerHTML = message;
                    node.className = isError ? 'error' : 'info';
                };
            }()),
            playSelectedFile = function playSelectedFileInit(event) {
                var file = this.files[0];
                var type = file.type;
                var videoNode = document.querySelector('video');
                var fileURL = URL.createObjectURL(file);
                videoNode.src = fileURL;
                v.src = fileURL;
                if (type == "video/mp4") 
                	v.play();        
                else {
                	alert("ERROR : It's NOT MP4 FILE");
                	return false;
                }             
            },
            inputNode = document.querySelector('input');
        if (!URL) {
            displayMessage('Your browser is not ' +
                '<a href="http://caniuse.com/bloburls">supported</a>!', true);
            return;
        }
        inputNode.addEventListener('change', playSelectedFile, false);
    }(window));
    
    v.addEventListener('ended',function(){
    	v.controls = true;
    	var tempctx = snapshots[scnt-1].getContext('2d');
    	tempctx.fillText(v.duration.toFixed(2),60, 70);
	   }, false);
    
    v.addEventListener('pause',function(){
    	mode=0;
    	}, false);
    
    v.addEventListener('play', function() {
        console.log("play ");
        var cw = 128; 
        var ch = 64; 
        canvas.width = cw;
        canvas.height = ch;
        back.width = cw;
        back.height = ch;
       v.controls = false;
        v.addEventListener('timeupdate', function() {
            console.log("time updated");
            if (mode == 1) 
            	sectionPlay(v);
            else
                shotchangedetector(v, context, backcontext, cw, ch);            	
        }, false);
    }, false);

    function sectionPlay(v) {
    	v.controls= false;
        if (v.currentTime > endts) {
            v.pause();        	
            mode = 0;
            endts = v.duration;
        }
        setTimeout(sectionPlay, 20, v);
    }

    function shotchangedetector(v, c, bc, w, h) {
        if (v.paused || v.ended) return false;
        
        for (var i = 0; i < 256; i++) {
            preArr[i] = curArr[i];
            curArr[i] = 0;
        }
        
        bc.drawImage(v, 0, 0, w, h);
        var idata = bc.getImageData(0, 0, w, h);
        var data = idata.data;
        
        var sp = 0;
        
       	for (var j=0; j<data.length; j+=4) {
    	  	var r = data[j];
              var g = data[j + 1];
              var b = data[j+ 2];
              var brightness = (3 * r + 4 * g + b) >>> 3;
              curArr[brightness] = curArr[brightness]+1;
    	}
       	
        var a;
        
        if (cnt > 0) {
            var dist = 0;
            for (i = 0; i < 256; i++) {
                dist += Math.abs(curArr[i] - preArr[i]);
            }
            if (dist >  5000) {
            	   var tempctx = snapshots[scnt-1].getContext('2d');
              	   tempctx.fillText(v.currentTime.toFixed(2),65, 70);
                   myc = capture(v, scnt);
                   snapshots.push(myc);
                   snapshots[scnt].addEventListener("click", clickEvent(scnt, v));
                       for (i = 0; i < scnt+1 ; i++) {
                           output.appendChild(snapshots[i]);
                       }
                       sbdArr.push(v.currentTime);
                       scnt++;       	      	                   	  
               
            }
        } else {
            myc = capture(v, scnt);
            snapshots.push(myc);
            snapshots[scnt].addEventListener("click", clickEvent(scnt, v));
            for (i = 0; i < scnt + 1; i++) {
                output.appendChild(snapshots[i]);
            }
            sbdArr.push(v.currentTime);
            scnt++;
        }        
        cnt = cnt + 1;
        
        setTimeout(shotchangedetector, 20, v, c, bc, w, h);
    }

    function capture(video, num) {        
        var w = 95+10;
        var h = 60+20;
        var mycanvas = document.createElement('canvas');
        mycanvas.width = w;
        mycanvas.height = h;
        var ctx = mycanvas.getContext('2d');
        ctx.font = '10px Gulim';
        ctx.drawImage(video, 0, 0, w-10, h-20);
        if (num==0) 
        	ctx.fillText('0', 0, 70);
        else 
            ctx.fillText(video.currentTime.toFixed(2), 0, 70);
        ctx.fillText('~',40,70);
        return mycanvas;
    }

    function clickEvent(i, v) {
        return function() {
            if (i < scnt) {
                mode = 1;
                v.play();
                v.currentTime = sbdArr[i];
                endts = sbdArr[i + 1];
            } else {
                mode = 1;
                v.play();
                v.currentTime = sbdArr[i];
                endts = v.duration;
            }

        };
    }


};
// window.onload can work without <body onload="">
window.onload = init;
