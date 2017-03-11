var ctx;

function sliderchage()
{
    window.getElementById("showsize").value=window.getElementById("size")
}

var width=0;
var height=0;

var canvasOffset={
    x:0,
    y:0
};

function mousePosition(e)
{
    return {
       x : e.pageX - canvasOffset.x,
       y : e.pageY - canvasOffset.y
   };
}

window.onload = function(){
    var canvas = document.getElementById("game");
    width=canvas.width;
    height=canvas.height;

    canvasOffset={
        x:canvas.offsetLeft,
        y:canvas.offsetTop
    }

    ctx = canvas.getContext("2d");
    ctx.fillStyle="#cccccc";
    ctx.fillRect(0,0,width,height);

    initWebSocket();

    canvas.addEventListener("mousedown",function(e){
        if (isTurn())
        {
            if (gameIsOn())
            {
                game.start=true;
                for (i=0;i<size;i++)
                {
                    for (j=0;j<size;j++)
                    {
                        if (field[i][j].intersect(mousePosition(e)))
                        {
                            if (field[i][j].owner==0)
                            {
                                sendData(i,j);
                            }
                            return;
                        }
                    }           
                }
            }
            
        }
    },true);

    canvas.addEventListener("mousemove",function(e)
    {
        
        if (gameIsOn())
        {
            var up=false;
            for (i=0;i<size;i++)
            {
                for (j=0;j<size;j++)
                {
                    if (field[i][j].intersect(mousePosition(e)))
                    {
                        
                        if (!field[i][j].over)
                        {
                            field[i][j].over=true;
                            up=true;
                        }          
                    }else{
                        if (field[i][j].over) 
                        {
                            up=true;
                            field[i][j].over=false;
                        }
                    }
                }
            }
            if (up) updateFrame();
        }
        
    })
    
}

function isTurn()
{
    return (turn?1:2)==yourSide;
}

function gameIsOn()
{
    return game.create;
}

var game={
    create:false,
    finished:true,
    name:"",
    opponent:"",
    turn:1,
}

var turn=true;

var isWaitGame=false;

lobbyName="";
function waitGame()
{
    turn=false;
    isWaitGame=true;
    lobbyName=document.getElementById("lobbyName").value;
    yourSide=2;
}

function userRequestNewGame(size)
{
    if (!game.create || game.finished)
    {
        createGame(size);
    }
    
};

function createGame(gameSize)
{
    
    turn=true;
    
    lobbyName=document.getElementById("lobbyName").value;
    size = parseInt(gameSize);
    hexoidResize(size);
    game.create=true;
    game.finished=false;
    
    initPlace(ctx);
    updateFrame();

    if (!isWaitGame) sendMap();
};

function sendMap()
{
    yourSide=1;
    msg = {
        type:"map",
        lobbyName:lobbyName,
        size:field.length,
        value:field.map(x=>x.map(y=>y.type))
    }
    socket.send(JSON.stringify(msg));
}

var hexoid={
    width:20,
};

hexoid.height=hexoid.width*13/15;

function hexoidResize(value)
{
    hexoid.height=(height-10)/value/2;
    hexoid.width=hexoid.height*15/13;

    globalParams={
    0:{
        x:-hexoid.width,
        y:0,
    },
    1:{
        x:-hexoid.width/2,
        y:hexoid.height
    },
    2:{
        x:hexoid.width/2,
        y:hexoid.height
    },
    3:{
        x:hexoid.width,
        y:0
    },
    4:{
        x:hexoid.width/2,
        y:-hexoid.height
    },
    5:{
        x:-hexoid.width/2,
        y:-hexoid.height
    }
};
}

var socket;
var name="111";

function sendData(i,j)
{
    socket.send(JSON.stringify({type:"step",lobbyName:lobbyName,x:i,y:j,side:turn?1:2}));
}


var lastStepPointer;
function readMsg(msg)
{
    if (msg.type && msg.type=="map" && isWaitGame && lobbyName==msg.lobbyName)
    {
        size=msg.size;
        createGame(msg.size);

        for (i=0;i<size;i++)
        {
            for (j=0;j<size;j++)
            {
                field[i][j].type=msg.value[i][j];
            }
        }
        isWaitGame=false;
    }else if (msg.type=="step" && msg.lobbyName==lobbyName)
    {
        field[msg.x][msg.y].select(msg.side);
        if (lastStepPointer)  lastStepPointer.lastStep=false;
        lastStepPointer=field[msg.x][msg.y];
        lastStepPointer.lastStep=true;

        if (turn)
        {
            turn=false;
        }else{
            turn=true;
        }
    }
    checkWin();
    updateFrame();
}

function initWebSocket()
{
    socket = new WebSocket("ws://pechbich.fvds.ru:3000/chat");
    socket.onopen = function() 
    {

    };

    socket.onclose = function(event) 
    {
    if (event.wasClean) 
    {
        alert('Connection closed');
    } 
    else 
    {
        alert('Connection break'); // например, "убит" процесс сервера
    }
        alert('Code: ' + event.code + 'reason: ' + event.reason);
    };

    socket.onmessage = function(event) 
    {
        msg = JSON.parse(event.data);
        readMsg(msg);
    };

    socket.onerror = function(error) 
    {
        alert("Error " + error.message);
    };
}

var size=10;

var field =[];

var pathFinder;

var turn=true;

function initPlace(ctx)
{
    field=[];
    for (var i=0;i<size;i++)
    {
        field[i]=[];
        for (var j=0;j<size;j++)
        {
            type=getTypeOfPlace(i,j);
            field[i][j]=new Place({x:width/2+(i+j-size+1)*(1.5*hexoid.width), y:height/2+(j-i)*(hexoid.height),ctx,type:type});
        }
    }
    pathFinder = new PathFinder();
    field.forEach(x=>x.forEach(y=>y.draw()));
}

function getTypeOfPlace(x,y)
{
    var type=0;

    r=Math.sqrt(Math.random()*Math.random());
    if (r<0.03 && haveNoOther(4,x,y,2)) type=4;
    else if (r<0.06 && haveNoOther(5,x,y,1)) type=5;

    return type;
}

function haveNoOther(type,x,y,radius)
{
    for (var i=-radius;i<=radius;i++)
    {
        for (var j=-radius;j<=radius;j++)
        {
            rx=x+i;
            ry=y+j;
            if (rx>=0 && ry>=0 && rx<size && ry<size && field.length>rx && field[rx].length>ry)
            {
                //alert(rx+" "+ry+" "+field.length+" "+ field[rx].length);
                if (field[x+i][y+j].type==type) return false;
            }
            
        }
    }
    return true;
}

function updateFrame()
{
    drawBackGround();

    drawCurrentSide();    

    field.forEach(x=>x.forEach(y=>y.draw()));
    
}

function drawCurrentSide()
{
    ctx.fillStyle="black";
    ctx.fillRect(15,15,50,50);

    ctx.fillStyle = (turn==1?"green":"red");
    ctx.fillRect(20,20,40,40);
}

function drawBackGround()
{
    ctx.fillStyle = "#204520";
    ctx.fillRect(0,0,width,height);

    ctx.fillStyle = "#d02020";
    ctx.fillRect(0,height/2,width/2,height/2);

    ctx.fillStyle = "#d02020";
    ctx.fillRect(width/2,0,width/2,height/2);
}

function checkWin()
{
    var tempField=field.map(x=>x.map(y=>{if (y.owner==0){return  y.type} else{ return y.owner}}));
    pathFinder.setMap(tempField);
    pathFinder.findWay(1);
    if (pathFinder.complete==1) 
    {
        alert("1 win");
        game.finished=true;
        createGame(Math.round(Math.random()*27+3))
    }
    pathFinder.findWay(2);
    if (pathFinder.complete==2)
    {
        alert("2 win");
        game.finished=true;
    } 

}





var globalParams={
    0:{
        x:-hexoid.width,
        y:0,
    },
    1:{
        x:-hexoid.width/2,
        y:hexoid.height
    },
    2:{
        x:hexoid.width/2,
        y:hexoid.height
    },
    3:{
        x:hexoid.width,
        y:0
    },
    4:{
        x:hexoid.width/2,
        y:-hexoid.height
    },
    5:{
        x:-hexoid.width/2,
        y:-hexoid.height
    }
};

var Place = (function()
{
    function Place(params)
    {
        this.x=params.x;
        this.y=params.y;
        this.ctx = params.ctx;
        this.color="#606060"
        this.side=params.side;
        this.owner=0;
        this.type=params.type;
        this.lastStep=false;
    }

    Place.prototype.setColor =function()
    {
        if (this.type!=4)
        {
            switch (this.type)
            {
                default:{           
                    this.ctx.fillStyle=this.color;
                    break;
                };
                case 5:{
                    this.ctx.fillStyle="#d0d0d0";
                    break;
                }
            }
            
        }else{
            this.ctx.fillStyle="#000000";
        }
    };

    Place.prototype.draw6 = function()
    {
        var first=true;

        for(place in globalParams)
        {
            if (first)
            {
                first=false;
                this.ctx.moveTo(this.x+globalParams[place].x,this.y+globalParams[place].y);
            }else{
                this.ctx.lineTo(this.x+globalParams[place].x,this.y+globalParams[place].y);
            }
        }
        this.ctx.closePath(); //заканчиваем рисовать многоугольник
        this.ctx.fill();
        this.ctx.stroke(); //выводим наши художества  
    };

    Place.prototype.draw = function()
    {
        this.ctx.beginPath(); 
        
        
        this.setColor();
        if (this.type==3) {
            this.draw1half();
            this.draw2half();
        }
        else this.draw6();
        
        if (this.lastStep)
        {
            if (this.owner==1)
            {
                this.ctx.fillStyle = "rgba(30,255,30,0.25)"
            }else 
            {
                this.ctx.fillStyle = "rgba(255,30,30,0.4)"
            }
            
            this.draw6();
        }

        if (this.over)
        {
            this.ctx.fillStyle = "rgba(0,0,0,0.4)"
            this.draw6();
        }
        
    };

    Place.prototype.applyOver = function(color)
    {
        if (this.over)
        {
            this.ctx.fillStyle=color;
        }else{
            this.ctx.fillStyle=color;
        }
    }

    Place.prototype.intersect = function(e)
    {
        return (this.type==0  && (Math.pow(e.x-this.x,2)+Math.pow(e.y-this.y,2))<Math.pow(hexoid.height,2)  )
    };

    Place.prototype.select = function(side)
    {
        if (this.owner==0)
        {
            if (side==1)
            {
                this.color="#204520";
            }else{
                this.color="#dd2020";
            }
            
            this.owner=side;
            return true;
        }else if (this.type==4){
            if (side==1)
            {
                this.color="#30dd80";
            }else{
                this.color="#dd3080";
            }
            this.owner=side;
        }
        return false;
        
    };

    return Place;
}());

move={
    1:{
        x:1,
        y:0
    },
    2:{
        x:-1,
        y:0
    },
    3:{
        x:0,
        y:-1
    },
    4:{
        x:0,
        y:1
    },
    5:{
        x:-1,
        y:1
    },
    6:{
        x:1,
        y:-1
    }
};

var PathFinder = (function()
{
    function PathFinder(params)
    {
        this.trace=new Array();
    }

    PathFinder.prototype.setMap = function(map)
    {
        this.map = map;
    };

    PathFinder.prototype.findWay = function(team)
    {
        this.trace=new Array();
        this.complete=false;
        switch (team)
        {
            case 1:
            {
                j=0;
                for (i=0;i<this.map.length;i++)
                {
                    if (this.map[i][j]==team || this.map[i][j]==5) this.goNext(i,j,team);
                }
                break;
            }
            case 2:
            {
                i=0;
                for (j=0;j<this.map.length;j++)
                {
                    if (this.map[i][j]==team || this.map[i][j]==5) this.goNext(i,j,team);
                }
                break;
            }
        }
        
    };

    PathFinder.prototype.goNext = function(x,y,team)
    {
        
        c=(team==1?y:x);
        if (c==this.map.length-1 || 5==this.map.length-1) 
        {
            this.complete=team;
        }

        this.trace.push(x+y*size);

        for (var key in move)
        {
            var newX=x+move[key].x;
            var newY=y+move[key].y;
            if (newX>=0 && newY>=0 && newX<this.map.length && newY<this.map.length)
            {
                if (this.map[newX][newY]==team || this.map[newX][newY]==5) 
                {
                    if (!(this.trace.find(k=>k==newX+newY*size)))
                    {
                        this.goNext(newX,newY,team);
                    }
                }
            }
        }
        this.trace.pop()
    };

    return PathFinder;
}());