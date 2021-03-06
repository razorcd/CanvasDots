window.onload = function () {

    var theCanvas = document.getElementById("theCanvas");
    var ctx = theCanvas.getContext("2d");

    var initialDots = 400;  //number of dots
    var mouseMaxDist = 150; //mouse reject distance
    var rejectPercent = 50;  // rejecting sensitivity
    var vibration = 0;  //rejecting vibration [0-3]
    var maxDotRadius = 10; //maximum size of the dots
    var gradientChecked = false;  //activates gradient on dots
    var dots = [];
    //var dateOld,dateNew;
    
    window.requestAnimFrame = (function () {
            return window.requestAnimationFrame ||
                   window.webkitRequestAnimationFrame ||
                   window.mozRequestAnimationFrame ||
                   window.oRequestAnimationFrame ||
                   window.msRequestAnimationFrame ||
                   function (callback) {
                        window.setTimeout(callback, 1000 / 60);
                   };
    })();

    //initialize menu text
    document.getElementById("gradient").checked = gradientChecked;

    document.getElementById("gradient").onclick = function(){ 
        gradientChecked = document.getElementById("gradient").checked;
    };
    

    //Dot class
    function Dot() {
        this.radius = random(maxDotRadius, 30);
        this.x = random(theCanvas.width - 2 * this.radius) + this.radius;
        this.y = random(theCanvas.height - 2 * this.radius) + this.radius;
        this.newX;
        this.newY;
        this.dist;
        this.newXspeed;
        this.newYspeed;
        this.xSpeed = random(40)/10 - 2;
        this.ySpeed = random(40) / 10 - 2;;
        this.color = "rgb(" + random(255) + "," + random(255) + "," + random(255) + ")";
        

        function random(maxValue, lowPercentage) {
            if (!((lowPercentage < 100) && (lowPercentage > 0))) lowPercentage = 0;

            return Math.floor(
                (Math.random() * (maxValue * (100-lowPercentage) / 100)) + 
                (maxValue * lowPercentage / 100)
                );  //returns values between (lowPercentage% of maxvalue) and maxvalue
        }
    };
    

    //mouse class
    var mouse = { x:0, y:0, active:false};

    //creating the dots array
    for (var i = 0; i < initialDots; i++) {
        dots[i] = new Dot();
    }

    //adding mouse/touch events
    if (!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
        //mouse events
        theCanvas.onmouseout = function (event) {
            event.preventDefault();
            mouse.active = false;
            //console.log(mouse.x + "   " + mouse.y + "   " + mouse.active);
        }

        theCanvas.onmousemove = function (event) {
            event.preventDefault();
            if (event.hasOwnProperty("offsetX")) {
                mouse.x = event.offsetX;
                mouse.y = event.offsetY;
            } else {
                mouse.x = event.layerX - event.currentTarget.offsetLeft;
                mouse.y = event.layerY - event.currentTarget.offsetTop;
            }
            //console.log(mouse.x + "   " + mouse.y + "   " + mouse.active);
        };

        theCanvas.onmouseover = function (event) {
            event.preventDefault();
            mouse.active = true;
            //console.log(mouse.x + "   " + mouse.y + "   " + mouse.active);
        }
    } else { // mobile events
        gradientChecked = false;
        document.getElementById("gradient").checked = gradientChecked;

        theCanvas.addEventListener('touchend', function (event) {
            event.preventDefault();
            mouse.active = false;
            //document.getElementById("debug").innerHTML = "TOUCHEND";
        }, false);

        theCanvas.addEventListener('touchmove', function (event) {
                event.preventDefault();
                var touchobj = event.changedTouches[0]
                mouse.x = touchobj.clientX - event.currentTarget.offsetLeft;
                mouse.y = touchobj.clientY - event.currentTarget.offsetTop;
                //document.getElementById("debug").innerHTML = "TOUCHMOVE";
                //console.log(touchobj.offsetX + "   " + mouse.y + "   " + mouse.active);
        }, false);

        theCanvas.addEventListener('touchstart', function (event) {
            event.preventDefault();
            mouse.active = true;
            var touchobj = event.changedTouches[0]
            mouse.x = touchobj.clientX - event.currentTarget.offsetLeft;
            mouse.y = touchobj.clientY - event.currentTarget.offsetTop;
            //document.getElementById("debug").innerHTML = "TOUCHSTART";
        }, false);
    }

   
    //start animation
    animate();
    function animate() {
        requestAnimFrame(animate);
        render();
    };

   
    function render() {
        //dateOld = Date.now();
        
        //update
        for (var i = 0; i < initialDots; i++) {
            if ((dots[i].y + dots[i].radius > theCanvas.height) || (dots[i].y < 0 + dots[i].radius)) dots[i].ySpeed *= -1;
            if ((dots[i].x + dots[i].radius > theCanvas.width) || (dots[i].x < 0 + dots[i].radius)) dots[i].xSpeed *= -1;
            dots[i].x += dots[i].xSpeed;
            dots[i].y += dots[i].ySpeed;

            //calclating the mouse rejecting position
            if (mouse.active === true) {
                var distX = dots[i].x - mouse.x;
                var distY = dots[i].y - mouse.y;
                dots[i].dist = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2))

                if ((dots[i].dist < mouseMaxDist) && (Math.abs(dots[i].y - mouse.y))) {
                    var newMaxDist = mouseMaxDist - (mouseMaxDist - dots[i].dist)*(rejectPercent/100);
                    dots[i].newX = Math.max(0+dots[i].radius, Math.min(theCanvas.width - dots[i].radius, mouse.x + (distX * newMaxDist / dots[i].dist)));
                    dots[i].newY = Math.max(0 + dots[i].radius, Math.min(theCanvas.height - dots[i].radius, mouse.y + (distY * newMaxDist / dots[i].dist)));

                    //add vibrance
                    dots[i].newX = dots[i].newX + vibration * (Math.random() * 2 * (1 - dots[i].dist / mouseMaxDist) - (1 - dots[i].dist / mouseMaxDist));
                    dots[i].newY = dots[i].newY + vibration * (Math.random() * 2 * (1 - dots[i].dist / mouseMaxDist) - (1 - dots[i].dist / mouseMaxDist));

                    //set slower speed
                    dots[i].newXspeed = dots[i].xSpeed * ((dots[i].dist * 100 / mouseMaxDist)/100 * 1);
                    dots[i].x = dots[i].x - dots[i].xSpeed + dots[i].newXspeed;   //removing the normal speed and adding the slower speed
                    dots[i].newYspeed = dots[i].ySpeed * ((dots[i].dist * 100 / mouseMaxDist)/100 * 1);
                    dots[i].y = dots[i].y - dots[i].ySpeed + dots[i].newYspeed;   //removing the normal speed and adding the slower speed
                }
            }
        }
        
        //clear
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, theCanvas.width, theCanvas.height);

        //draw
        var gradX, grady, gradient;
        for (var i = 0; i < initialDots; i++) {
            ctx.beginPath();
            if ((mouse.active === true) && (dots[i].dist < mouseMaxDist)) {
                ctx.arc(dots[i].newX, dots[i].newY, dots[i].radius, 0, 2 * Math.PI, false);
                gradX = dots[i].newX - (Math.pow(dots[i].radius / 4, 2)) * (2 * dots[i].newX / theCanvas.width - 1);
                gradY = dots[i].newY - (Math.pow(dots[i].radius / 4, 2)) * (2 * dots[i].newY / theCanvas.height - 1);
                gradient = ctx.createRadialGradient(gradX, gradY, dots[i].radius / 20, dots[i].newX, dots[i].newY, dots[i].radius * 1.2);
                //ctx.fillStyle = "black";
                //ctx.fillText(Math.floor(dots[i].dist * 100 / mouseMaxDist), dots[i].newX, dots[i].newY, 10);
            } else {
                ctx.arc(dots[i].x, dots[i].y, dots[i].radius, 0, 2 * Math.PI, false);
                gradX = dots[i].x - (Math.pow(dots[i].radius/4,2)) * (2 * dots[i].x / theCanvas.width - 1);
                gradY = dots[i].y - (Math.pow(dots[i].radius/4,2)) * (2 * dots[i].y / theCanvas.height - 1);
                gradient = ctx.createRadialGradient(gradX, gradY, dots[i].radius / 20, dots[i].x, dots[i].y, dots[i].radius * 1.2);
            }
           
            gradient.addColorStop(0, "#fff");
            gradient.addColorStop(1, dots[i].color);

            if (gradientChecked) ctx.fillStyle = gradient;
            else ctx.fillStyle = dots[i].color;
            //dots[i].color;
            ctx.fill();
        }
        ////draw mouse arc stroke
        //if (mouse.active === true){
        //    ctx.beginPath();
        //    ctx.arc(mouse.x, mouse.y, mouseMaxDist, 0, 2 * Math.PI, false);
        //    ctx.stroke();
        //}

        //restart

        //dateNew = Date.now();
    } //end render();
   
};