
var myCanvas;
var context;
var xmlhttp;
var controlPanel;
var hero;

window.onload = function () {
    myCanvas = document.getElementById('myCanvas');
    context = myCanvas.getContext('2d');
    
    xmlhttp = getXmlHttp()

    controlPanel = initControlPanel(xmlhttp);
    hero = new Hero(50,50,10,10);

    myCanvas.addEventListener("mousemove",function (e) {
        controlPanel.checkIntersect(e);
    })
    myCanvas.addEventListener("mousedown",function (e) {
        controlPanel.checkIntersect(e,true);
    })

    updateScreen();
        
};

var paused = true;
function Spin() {
	var id = setInterval(frame, 100);
	function frame() {
        if (!paused)
        {
		    sendRequestXY("OLOLO");
        }
	}
}	
document.addEventListener("DOMContentLoaded", Spin);

function updateScreen()
{
    context.fillStyle = "#000000";
    context.fillRect(0, 0, myCanvas.width, myCanvas.height);
    controlPanel.draw(context);
    hero.drawBounds(context);
    hero.draw(context);
}

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

function initControlPanel() {
    var buttonLeft = new Button(10, 70, 50, 50);
    function moveleft() {
        sendRequest("1000");
    }
    buttonLeft.setAction(moveleft);

    var buttonRight = new Button(130, 70, 50, 50);
    function moveright() {
        sendRequest("0001");
    }
    buttonRight.setAction(moveright);

    var buttonDown = new Button(70, 70, 50, 50);
    function movedown() {
        sendRequest("0100");
        };        
    
    buttonDown.setAction(movedown);

    var buttonUp = new Button(70, 10, 50, 50);
    function moveup() {
        sendRequest("0010");
        };         
    buttonUp.setAction(moveup);

    var buttonStart = new Button (50,250,250,50);
    buttonStart.setAction(function(){
        if (!paused)
        {
            paused=!paused;
            this.SetText("pause")
        }else
        {
            paused=!paused;
            this.SetText("start")
        }
        
    });
    buttonStart.SetText("start");

    var controlPanel = new ControlPanel(buttonLeft, buttonUp, buttonDown, buttonRight, buttonStart);
    return controlPanel;
}

function sendRequest(control)
{
    xmlhttp.open("GET", "http://pechbich.fvds.ru/go/"+control, true);
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4) {
                if(xmlhttp.status == 200) {
                                     
                }
            }
        }
        xmlhttp.send(null);
}
function sendRequestXY(control)
{
    xmlhttp.open("GET", "http://pechbich.fvds.ru/go/"+control, true);
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4) {
                if(xmlhttp.status == 200) {
                    applyResponse(xmlhttp.responseText);                    
                }
            }
        }
        xmlhttp.send(null);
}

function applyResponse(response)
{
    response = response.split(';');
    hero.move(parseInt( response[0]),parseInt(response[1]));
}

var ControlPanel = (function () {
    function ControlPanel(left, up, down, right,start) {
        this.map = new Map();
        this.map.set('left', left);
        this.map.set('up', up);
        this.map.set('down', down);
        this.map.set('right', right);
        this.map.set('start',start);
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
        this.text="";
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
        if (this.text!="")
        {
            this.canvasContext.font="20px Georgia";
            this.canvasContext.fillText(this.text, this.x,this.y);
        }
    };
    Button.prototype.setAction = function (f) {
        this.action = f;
    };
    Button.prototype.Action = function () {
        this.action();
    };
    Button.prototype.Intersect = function (e,type) {
        if (e.clientX > this.x && e.clientX < (this.x + this.width) && e.clientY > this.y && e.clientY < (this.y + this.height)) {
            if (!this.mouseover)
            {
                this.mouseover=true;
                updateScreen();
            }
            if (type)
            {
                this.Action();  
            }
        }else
        {
            if (this.mouseover)
            {
                this.mouseover=false;
                updateScreen();
            }
        }
    };
    Button.prototype.SetText =function(text)
    {
        this.text=text;
    }
    return Button;
}());

var Hero = (function() {
    function Hero(x,y,width,height)
    {
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;  
        this.color="#00ffff";  

        this.boundX=150;
        this.boundY=150;
        this.boundWidth=250;
        this.boundHeight=250;
        this.checkBounds();
    }

    Hero.prototype.draw = function(canvasContext)
    {
        canvasContext.fillStyle=this.color;
        canvasContext.fillRect(this.x,this.y,this.width,this.height);
    };
    Hero.prototype.drawBounds = function(ctx)
    {
        ctx.beginPath();
        ctx.lineWidth="1";
        ctx.strokeStyle="#ffff00";
        ctx.rect(this.boundX,this.boundY,this.boundWidth,this.boundHeight); 
        ctx.stroke()
    };
    Hero.prototype.setColor = function(color)
    {
        this.color=color;
    };
    Hero.prototype.move = function(dx,dy)
    {
        this.x=dx*10;
        this.y=dy*10;
        //this.checkBounds();
        updateScreen();
    };
    Hero.prototype.checkBounds = function()
    {
        if (this.x<this.boundX)
        {
            this.x=this.boundX+this.boundWidth-this.width;
        }else if (this.x+this.width>this.boundX+this.boundWidth)
        {
            this.x=this.boundX;
        }
        if (this.y<this.boundY)
        {
            this.y=this.boundY+this.boundHeight-this.height;
        }else if (this.y+this.height>this.boundY+this.boundHeight)
        {
            this.y=this.boundY;
        }
    };
    

    return Hero;
}())

    