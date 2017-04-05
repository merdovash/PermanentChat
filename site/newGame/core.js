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
        if (!online || isTurn())
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
                                if (online)
                                {
                                    sendData(i,j);
                                }
                                else
                                {
                                    step(i,j,turn?1:2)
                                }
                                
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


var online;
function offlineGame()
{
    online=false;
    turn=true;
    newGame();
}

function createGame(gameSize)
{
    if (online==undefined) online=true;
    turn=true;
    
    lobbyName=document.getElementById("lobbyName").value;
    newGame();

    if (!isWaitGame) sendMap();
};

function newGame()
{
    size = parseInt(document.getElementById('size').value);
    hexoidResize(size);
    game.create=true;
    game.finished=false;
    
    initPlace(ctx);
    updateFrame();  
    points={1:0,2:0};
}

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
        step(msg.x,msg.y,msg.side);
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

var pointCounter;

function initPlace(ctx)
{
    field=[];
    map = createMap(size);
    for (var i=0;i<size;i++)
    {
        field[i]=[];
        for (var j=0;j<size;j++)
        {
            field[i][j]=new Place({x:width/2+(i+j-size+1)*(1.5*hexoid.width), y:height/2+(j-i)*(hexoid.height),ctx,type:map[i][j]});
        }
    }
    pathFinder = new PathFinder();
    pointCounter=new PointCounter(field)
    field.forEach(x=>x.forEach(y=>y.draw()));
}

function createEmptyMap(size)
{
    var map=[];
    for (var i=0;i<size;i++)
    {
        map[i]=[];
        for (var j=0;j<size;j++)
        {
            map[i][j]=0;
        }
    }
    return map;
}

var k=5


function createMap(size)
{
    chaoses=[];

    

    var map = createEmptyMap(size);
    var placers =[];
    alert(document.getElementById('bomb').value);

    if (document.getElementById('bomb').checked) 
    {
        bombs = new BombHandler(field);
        placers.push(new BombPlacer(map));
    }
    if (document.getElementById('randomn').checked) placers.push(new ChaosPlacer(map));
    if (document.getElementById('stone').checked) placers.push(new StonePlacer(map));
    if (document.getElementById('portal').checked) placers.push(new PortalPlacer(map));

    for (i in placers)
    {
        placers[i].place();
    }
    return map;
}

function updateFrame()
{
    drawBackGround();

    drawCurrentSide();  

    drawPoints();  

    field.forEach(x=>x.forEach(y=>y.draw()));
    
}

function drawCurrentSide()
{
    ctx.fillStyle="black";
    ctx.fillRect(15,15,50,50);

    ctx.fillStyle = (turn==1?"blue":"red");
    ctx.fillRect(20,20,40,40);
}

function drawBackGround()
{
    ctx.fillStyle = "#5050a0";
    ctx.fillRect(0,0,width,height);

    ctx.fillStyle = "#d02020";
    ctx.fillRect(0,height/2,width/2,height/2);

    ctx.fillStyle = "#d02020";
    ctx.fillRect(width/2,0,width/2,height/2);
}

function drawPoints()
{
    ctx.fillStyle = "#ffffff";
    ctx.font= "30px Arial";
    ctx.fillText(points[1],50,150);
    ctx.fillText(points[2],width-150,150);
}


var bombs;
function step(i,j,side)
{
    field[i][j].select(side);
    if (lastStepPointer)  lastStepPointer.lastStep=false;
    lastStepPointer=field[i][j];
    lastStepPointer.lastStep=true;

    if (turn)
    {
        turn=false;
    }else{
        turn=true;
    }
    var newPoints = checkChaos(i,j);
    i=newPoints.x;
    j=newPoints.y;
    if (bombs) bombs.update(side);
    checkWin();
    points[side]+=pointCounter.count(newPoints.x,newPoints.y,side);
    updateFrame();
    
}

var points={
    1:0,
    2:0
}

var PointCounter = (function()
{
    function PointCounter(field)
    {
        this.field = field
    }

    PointCounter.prototype.count = function(x,y,type)
    {
        this.path = [];
        this.counted=[];
        this.map = this.field.map(x=>x.map(y=>y.type));
        this.c=1;
        this.type=type;
        this.path.push({x:x,y:y});
        this.counted.push({x:x,y:y});
        this.next(x,y);
        return this.c;
    }

    PointCounter.prototype.next = function(x,y)
    {
        for (m in move)
        {
            nextX = move[m].x+x;
            nextY = move[m].y+y;
            if (nextX>=0 && nextX<this.field.length && nextY>=0 &&  nextY<this.field.length)
            {
                if (this.path.find(x=>(x.x==nextX && x.y==nextY)) || this.counted.find(x=>(x.x==nextX &&x.y==nextY)))
                {
                   
                }
                else{
                    if (this.map[nextX][nextY]==this.type || this.map[nextX][nextY]==5)
                    {
                        this.path.push({x:nextX,y:nextY});
                        this.counted.push({x:nextX,y:nextY})
                        this.next(nextX,nextY);
                        this.c+=1;
                    }
                }
            }
        }
        this.path.pop();
    }

    return PointCounter;
}());



var chaoses;

function checkChaos(x,y)
{
    chaoses=find(field,7)
    var radius=1;
    for (c in chaoses)
    {
        for (var i=-radius;i<=radius;i++)
        {
            for (var j=-radius;j<=radius;j++)
            {
                if (i*j<radius && !(i==0 && j==0))
                {
                    if (x==chaoses[c].x+i && y==chaoses[c].y+j)
                    {
                        return activateChaos(c,x,y);
                    }
                }
            }
        }
    }
    return {x:x,y:y};
}

function checkOwnerOfChaos(c,arr)
{
    var first=0;
    var second=0;
    for (var i=0;i<arr.length;i++)
    {
        if (arr[i]==1 || arr[i]==5)
        {
            first++;
        }
        if (arr[i]==2 || arr[i]==5)
        {
            second++;
        }
        if (first==4 && second!=4) field[chaoses[c].x][chaoses[c].y].type=1;
        else if (first!=4 && second==4) field[chaoses[c].x][chaoses[c].y].type=2;
    }
}

var clock=[2,3,4,5,6,1]

function activateChaos(с,x,y)
{
    var arr=[];
    var radius=1;
    var returnPointer=0;
    for (var m in move)
    {
        rx=move[m].x+chaoses[c].x;
        ry=move[m].y+chaoses[c].y;
        arr.push(field[rx][ry].type)
        if (x==rx && y==ry){
            returnPointer=arr.length;
        }
            
    }
    //checkOwnerOfChaos(c,arr);
    var k=0;
    
    for (var i=0;i<6;i++)
    {
        rx=move[clock[i]].x+chaoses[c].x;
        ry=move[clock[i]].y+chaoses[c].y;
        field[rx][ry].type=arr[k]
        k++;
        if (returnPointer==k) returnPointer={x:rx,y:ry}; 
    }

    return returnPointer;
}

function randomSort(arr)
{
    var newArr=new Array();
    for (var i =0;i<6;i++)
    {
        c=Math.round(Math.random()*(6-i));
        newArr.push(arr[c]);
        arr=remove(arr,c);
    }
    return newArr;
}

function clockSort(arr)
{
    var temp=arr[5];
    var temp2;
    for (var i=0;i<6;i++)
    {
        if (i==0){
            temp=arr[i];
            arr[i]=arr[5];
        }else{
            temp2=arr[i];
            arr[i]=temp;
            temp=temp2;
        }
    }
}

function find(field,type)
{
    var arr = new Array();
    for (var i=0;i<field.length;i++)
    {
        for (var j=0;j<field[i].length;j++)
        {
            if (field[i][j].type==type)
            {
                arr.push({x:i,y:j});
            }
        }
    }
    return arr;
}

function remove(arr, index){
    var newArr=new Array();
    for (var i=0;i<arr.length;i++)
    {
        if (i!=index){
            newArr.push(arr[i]);
        }
    }
    return newArr;
}

function hexRadiusAction(radius,x,y,action)
{
    for (i=-radius;i<=radius;i++)
    {
        for (j=-radius;j<=radius;j++)
        {
            if (i*j<radius)
            {
                action(x+i,y+j)
            }
        }
    }
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
        createGame(Math.round(Math.random()*27+3))
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

var BombHandler = (function()
{
    function BombHandler(field)
    {
        this.field = field;
        this.explodeRadius=2;
        this.stepRadius=1;
    }

    BombHandler.prototype.update = function(side)
    {
        var bombs=find(this.field,6)
        for (bomb in bombs)
        {
            for (i=-this.stepRadius;i<=this.stepRadius;i++)
            {
                for (j=-this.stepRadius;j<=this.stepRadius;j++)
                {
                    if (i*j<this.stepRadius)
                    {
                        if (this.field[bombs[bomb].x+i][bombs[bomb].y+j].type==1 
                        || this.field[bombs[bomb].x+i][bombs[bomb].y+j].type==2)
                        {
                            this.explode(bombs,bomb,side)
                            return this.field;
                        }
                    }
                }
            }
        }
    };

    BombHandler.prototype.explode = function(bombs,bomb,side)
    {
        
        for (i=-this.explodeRadius;i<=this.explodeRadius;i++)
        {
            for (j=-this.explodeRadius;j<=this.explodeRadius;j++)
            {
                if (i*j<this.explodeRadius)
                {
                    var x=bombs[bomb].x+i;
                    var y=bombs[bomb].y+j;
                    if (x>=0 && x<size && y>=0 && y<size)
                    {
                        if (this.field[x][y].type==1 || this.field[x][y].type==2) 
                        {
                            points[side]+=1;
                        }
                        this.field[x][y].type=0;
                        this.field[x][y].owner=0;
                    }
                }
            }
        }
        this.field[bombs[bomb].x][bombs[bomb].y].type=5;
        bombs = remove(bombs,bomb);    
    };

    return BombHandler;
}())

var ChaosPlacer = (function()
{
    function ChaosPlacer(map)
    {
        this.map=map;
        this.count=Math.round(map.length**2/80);
        this.radius=1;
    }

    ChaosPlacer.prototype.place = function()
    {
        var i=0;
        var stop=0;
        while(i<this.count && stop<5)
        {
            var x=Math.round(Math.random()*this.map.length);
            var y=Math.round(Math.random()*this.map.length);
            if (this.isAbleToPlace(x,y))
            {
                this.map[x][y]=7;
                i++;
                stop=0;
                chaoses.push({x:x,y:y});
            }else{
                stop++;
            }
        }
    }

    ChaosPlacer.prototype.isAbleToPlace = function(x,y)
    {
        for (i=-this.radius;i<=this.radius;i++)
        {
            for (j=-this.radius;j<=this.radius;j++)
            {
                if (i*j<this.radius)
                {
                    if (x<=1|| x>=this.map.length-2 || y<=1 || y>=this.map.length-2 || 
                    (x+i>0 && x+i<this.map.length && y+j>0&& y+j<this.map.length && this.map[x+i][y+j]==7)) return false;
                }
            }
        }
        return true;
    }

    return ChaosPlacer;
}());


var PortalPlacer = (function()
{
    function PortalPlacer(map)
    {
        this.map=map;
        this.count=Math.round(map.length**2/20);
        this.radius=3;
    }

    PortalPlacer.prototype.place = function()
    {
        var i=0;
        var stop=0;
        while(i<this.count && stop<5)
        {
            var x=Math.round(Math.random()*this.map.length);
            var y=Math.round(Math.random()*this.map.length);
            if (this.isAbleToPlace(x,y))
            {
                this.map[x][y]=5;
                i++;
                stop=0;
            }else{
                stop++;
            }
        }
    }

    PortalPlacer.prototype.isAbleToPlace = function(x,y)
    {
        for (i=-this.radius;i<=this.radius;i++)
        {
            for (j=-this.radius;j<=this.radius;j++)
            {
                if (i*j<this.radius)
                {
                    if (x<=1|| x>=this.map.length-2 || y<=1 || y>=this.map.length-2 || 
                    (x+i>0 && x+i<this.map.length && y+j>0&& y+j<this.map.length && this.map[x+i][y+j]==5)) return false;
                }
            }
        }
        return true;
    }

    return PortalPlacer;
}())


var StonePlacer = (function()
{
    function StonePlacer(map)
    {
        this.map=map;
        this.count=Math.round(map.length**2/33);
        this.radius=3;
    }

    StonePlacer.prototype.place = function()
    {
        var i=0;
        var stop=0;
        while(i<this.count&& stop<5)
        {   
            var x=Math.round(Math.random()*this.map.length);
            var y=Math.round(Math.random()*this.map.length);
            if (this.isAbleToPlace(x,y))
            {
                this.map[x][y]=4;
                i++;
                stop=0;
            }else{
                stop++;
            }
        }
    }

    StonePlacer.prototype.isAbleToPlace = function(x,y)
    {
        for (i=-this.radius;i<=this.radius;i++)
        {
            for (j=-this.radius;j<=this.radius;j++)
            {
                if (i*j<this.radius)
                {
                    if (x<=1|| x>=this.map.length-2 || y<=1 || y>=this.map.length-2 || 
                    (x+i>0 && x+i<this.map.length && y+j>0&& y+j<this.map.length && this.map[x+i][y+j]==4)) return false;
                }
            }
        }
        return true;
    }

    return StonePlacer;
}());

var BombPlacer = (function()
{
    function BombPlacer(map)
    {
        this.map=map;
        this.count=Math.round(map.length**2/160);
        this.radius=4
    }

    BombPlacer.prototype.place = function()
    {
        var i=0;
        var stop=0;
        while(i<this.count && stop<5)
        {
            var x=Math.round(Math.random()*this.map.length);
            var y=Math.round(Math.random()*this.map.length);
            if (this.isAbleToPlace(x,y))
            {
                this.map[x][y]=6;
                i++;
                stop=0;
            }else{
                stop++;
            }
        }
    };

    BombPlacer.prototype.isAbleToPlace = function(x,y)
    {
        for (i=-this.radius;i<=this.radius;i++)
        {
            for (j=-this.radius;j<=this.radius;j++)
            {
                if (i*j<this.radius)
                {
                    if (x<=1|| x>=this.map.length-2 || y<=1 || y>=this.map.length-2 ||  
                    (x+i>0 && x+i<this.map.length && y+j>0&& y+j<this.map.length && this.map[x+i][y+j]==6)) return false;
                }
            }
        }
        return true;
    }

    return BombPlacer;
}())

hex=
{
    0:new Image(),
    1:new Image(),
    2:new Image(),
    3:new Image(),
    4:new Image(),
    5:new Image(),
    6:new Image(),
    7:new Image()
}

hex[0].src='std.png';
hex[5].src='portal.png';
hex[4].src='stone.png';
hex[1].src='blue.png'
hex[2].src='red.png';
hex[6].src='bomb.png';
hex[7].src='chaos.png';

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
        this.ctx.beginPath(); 
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
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();   
    };

    Place.prototype.drawImg= function()
    {
        this.ctx.drawImage(hex[this.type],this.x-hexoid.width,this.y-hexoid.height,hexoid.width*2,hexoid.height*2);
    }

    Place.prototype.draw = function()
    {
        this.drawImg();
        
        if (this.lastStep)
        {
            if (this.owner==1)
            {
                this.ctx.fillStyle = "rgba(50,50,200,0.4)"
            }else 
            {
                this.ctx.fillStyle = "rgba(200,100,50,0.4)"
            }
            this.draw6();
        }

        if (this.over)
        {
            this.ctx.fillStyle = "rgba(100,100,100,0.4)"
            this.draw6();
        }
    };

    Place.prototype.intersect = function(e)
    {
        return (this.type==0  && (Math.pow(e.x-this.x,2)+Math.pow(e.y-this.y,2))<Math.pow(hexoid.height,2)  )
    };

    Place.prototype.select = function(side)
    {
        if (this.type==0)
        {
            this.type=side;
            return true;
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
        x:0,
        y:1
    },
    3:{
        x:-1,
        y:1
    },
    4:{
        x:-1,
        y:0
    },
    5:{
        x:0,
        y:-1
    },
    6:{
        x:1,
        y:-1
    }
};

var move2=
{
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
    },
    7:{
        x:-2,
        y:0
    },
    8:{
        x:-1,
        y:-1,
    },
    9:{
        x:0,
        y:-2
    },
    10:{
        x:1,
        y:-2
    },
    11:{
        x:2,
        y:-2
    },
    12:{
        x:2,
        y:-1
    },
    13:{
        x:2,
        y:0,
    },
    14:{
        x:1,
        y:1
    },
    15:{
        x:0,
        y:2
    },
    16:{
        x:-1,
        y:2
    },
    17:{
        x:-2,
        y:2,
    },
    18:{
        x:-2,
        y:1
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