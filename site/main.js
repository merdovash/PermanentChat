
var myCanvas;
var context;
var xmlhttp;
var controlPanel;
var hero;

var initGame = function () {
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
    var buttonLeft = new Button({x:10, y:70, width:50, heigth:50, name:"left"});
    function moveleft() {
        sendRequest("1000");
    }
    buttonLeft.setAction(moveleft);

    var buttonRight = new Button({x:130, y:70, width:50, heith:50, name:"right"});
    function moveright() {
        sendRequest("0001");
    }
    buttonRight.setAction(moveright);

    var buttonDown = new Button({x:70, y:70, width:50, heigth:50, name:"down"});
    function movedown() {
        sendRequest("0100");
        };        
    
    buttonDown.setAction(movedown);

    var buttonUp = new Button({x:70, y:10, width:50, heigth:50, name:"up"});
    function moveup() {
        sendRequest("0010");
        };         
    buttonUp.setAction(moveup);

    var buttonStart = new Button ({x:50,y:250,width:50,heigth:35, name:"start"});
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

    var controlPanel = new ControlPanel([buttonLeft, buttonUp, buttonDown, buttonRight, buttonStart]);
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
        ctx.fillStyle = "#101010";
        ctx.fillRect(this.boundX,this.boundY,this.boundWidth,this.boundHeight);
        
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
        this.checkBounds();
        updateScreen();
    };
    Hero.prototype.checkBounds = function()
    {
        if (this.x<this.boundX)
        {
            this.x=this.boundX+this.boundWidth-this.width;
            this.color="#FF00FF";
        }else if (this.x+this.width>this.boundX+this.boundWidth)
        {
            this.x=this.boundX;
            this.color="#FFFF00";            
        }
        if (this.y<this.boundY)
        {
            this.y=this.boundY+this.boundHeight-this.height;
            this.color="#00FFFF";            
        }else if (this.y+this.height>this.boundY+this.boundHeight)
        {
            this.y=this.boundY;
            this.color="#0000FF";            
        }
    };    

    return Hero;
}())

    