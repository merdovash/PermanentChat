window.onload = function () {
    var myCanvas = document.getElementById('myCanvas'), context = myCanvas.getContext('2d');
    context.fillRect(0, 0, myCanvas.width, myCanvas.height);

    var xmlhttp = getXmlHttp()

    var controlPanel = initControlPanel(xmlhttp);
    
    controlPanel.draw(context);

    myCanvas.addEventListener("mousemove",function (e) {
        controlPanel.checkIntersect(e);
    })
    myCanvas.addEventListener("mousedown",function (e) {
        controlPanel.checkIntersect(e,true);
    })

};

function getXmlHttp(){
  var xmlhttp;
  try {
    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
  } catch (e) {
    try {
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } catch (E) {
      xmlhttp = false;
    }
  }
  if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
    xmlhttp = new XMLHttpRequest();
  }
  return xmlhttp;
}

function initControlPanel(xmlhttp) {
    var buttonLeft = new Button(60, 70, 50, 50);
    function moveleft() {
        xmlhttp.open("GET", "1000", true);
        xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if(xmlhttp.status == 200) {
            alert(xmlhttp.responseText);
                }
        }
        };
        xmlhttp.send(null);
    }
    buttonLeft.setAction(moveleft);

    var buttonRight = new Button(180, 70, 50, 50);
    function moveright() {
        xmlhttp.open("GET", "0001", true);
        xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if(xmlhttp.status == 200) {
            alert(xmlhttp.responseText);
                }
        }
        };
        xmlhttp.send(null);
    }
    buttonRight.setAction(moveright);

    var buttonDown = new Button(120, 70, 50, 50);
    function movedown() {
        xmlhttp.open("GET", "0100", true);
        xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if(xmlhttp.status == 200) {
            alert(xmlhttp.responseText);
                }
        }
        };
        xmlhttp.send(null);
    }
    buttonDown.setAction(movedown);

    var buttonUp = new Button(120, 10, 50, 50);
    function moveup() {
        xmlhttp.open("GET", "0010", true);
        xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if(xmlhttp.status == 200) {
            alert(xmlhttp.responseText);
                }
        }
        };
        xmlhttp.send(null);
    }
    buttonUp.setAction(moveup);
    var controlPanel = new ControlPanel(buttonLeft, buttonUp, buttonDown, buttonRight);
    return controlPanel;
}
var ControlPanel = (function () {
    function ControlPanel(left, up, down, right) {
        this.map = new Map();
        this.map.set('left', left);
        this.map.set('up', up);
        this.map.set('down', down);
        this.map.set('right', right);
    }
    ControlPanel.prototype.draw = function (canvasContext) {
        this.map.forEach(function (x) { return x.draw(canvasContext); });
    };
    ControlPanel.prototype.checkIntersect = function (e,type) {
        this.map.forEach(function (x) { return x.Intersect(e,type); });
    };
    return ControlPanel;
}());
var Button = (function () {
    function Button(x, y, height, width) {
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.mouseover=false;
    }
    Button.prototype.draw = function (canvasContext) {
        if (this.canvasContext===undefined || this.canvasContext===null)
        {
            this.canvasContext=canvasContext;
        }
        if (this.mouseover)
        {
            this.canvasContext.fillStyle="#ff00ff";
        }else
        {
            this.canvasContext.fillStyle="#00ff00";
        }
        
        this.canvasContext.fillRect(this.x, this.y, this.width, this.height);
    };
    Button.prototype.setAction = function (f) {
        this.action = f;
    };
    Button.prototype.Action = function () {
        this.action();
    };
    Button.prototype.Intersect = function (e,type) {
        if (e.clientX > this.x && e.clientX < (this.x + this.width) && e.clientY > this.y && e.clientY < (this.y + this.height)) {
            this.mouseover=true;
            if (type)
            {
                //this.Action();
                alert("button pressed");    
            }
        }else
        {
            this.mouseover=false
        }
        this.draw();
    };
    return Button;
}());
