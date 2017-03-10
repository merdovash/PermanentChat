var ctx;

function sliderchage()
{
    window.getElementById("showsize").value=window.getElementById("size")
}

var width=0;
var height=0;
window.onload = function(){
    var canvas = document.getElementById("game");
    width=canvas.width;
    height=canvas.height;

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
                        if (field[i][j].intersect(e))
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
                    if (field[i][j].intersect(e))
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
    return true;
    //return (username==game.currentTurn)
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
function createGame()
{
    if (!game.create || game.finished)
    {
        size = parseInt(document.getElementById("size").value);
        if (size<14 && size>2)
        {
            game.create=true;
            game.finished=false;
            
            initPlace(ctx);
            updateFrame();
        }else{
            alert("size is unsupported")
        }

    }
    
};

var socket;
var name="111";

function sendData(i,j)
{
    socket.send(JSON.stringify({game:name,x:i,y:j}));
}

function readMsg(msg)
{
    if (msg.game==name)
    {
        field[msg.x][msg.y].select(turn?1:2);
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
    for (i=0;i<size;i++)
    {
        field[i]=[];
        for (j=0;j<size;j++)
        {
            c=Math.random();
            type=0;
            if (c<0.03) type=4;
            else if (c<0.06) type=5;
            field[i][j]=new Place({x:width/2+(i+j-size+1)*45, y:height/2+j*26-i*26,ctx,type:type});
        }
    }
    pathFinder = new PathFinder();
    field.forEach(x=>x.forEach(y=>y.draw()));
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
    ctx.fillStyle = "green";
    ctx.fillRect(0,0,width,height);

    ctx.fillStyle = "red";
    ctx.fillRect(0,height/2,width/2,height/2);

    ctx.fillStyle = "red";
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
        x:-30,
        y:0,
    },
    1:{
        x:-15,
        y:26
    },
    2:{
        x:15,
        y:26
    },
    3:{
        x:30,
        y:0
    },
    4:{
        x:15,
        y:-26
    },
    5:{
        x:-15,
        y:-26
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
        return (this.type==0  && (Math.pow(e.layerX-this.x,2)+Math.pow(e.layerY-this.y,2))<Math.pow(26,2)  )
    };

    Place.prototype.select = function(side)
    {
        if (this.owner==0)
        {
            if (side==1)
            {
                this.color="#30ff30";
            }else{
                this.color="#ff3030";
            }
            
            this.owner=side;
            return true;
        }else if (this.type==4){
            if (side==1)
            {
                this.color="#30ff80";
            }else{
                this.color="#ff3080";
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