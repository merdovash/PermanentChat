var chatCanvas;
var ctx;
var message;
var text
var stream;
var language={buttonName: "en"};
var languageButton;
var container;

var initChat = function(){
    chatCanvas = document.getElementById('chatCanvas');
    ctx = chatCanvas.getContext('2d');

    container = new Container();
    container.update();

    initControlPanel2();
    initWebSocket();
    

    window.addEventListener(
        "keyup",
        function (e)
        {
            if (alreadySignIn)
            {
                if (e.keyCode>47 && e.keyCode<223 || e.keyCode==32)
                {
                    container.add(username,getSymbol(e.keyCode));
                    updateFrame();
                    if (socket)
                    {
                        var message = {type:"add", name:document.getElementById("username").value, value:getSymbol(e.keyCode)};
                        message = JSON.stringify(message);
                        socket.send(message);
                    } 
                    
                }else if (e.keyCode==8)
                {
                    text.remove();
                    updateFrame();
                    if (socket) socket.send(JSON.stringify({type:"rmv", name:document.getElementById("username").value}));
                }
            }
        },
        true);
}

var alreadySignIn=false;
var username;
function logIn()
{
    if (!alreadySignIn)
    {
        username = document.getElementById("username").value;
        if (username.length<1 && !username[0]==' ')
        {
            alert("username should have at least 1 symbol");
            return;
        }
        text = new TextStream(username,"",ctx);
        container.new(text);
        alreadySignIn=true;
        updateFrame();
        if (socket && socket.state!="CLOSED") socket.send(JSON.stringify({type:"new",name:text.author}));
        document.getElementById("username").disabled = alreadySignIn;
        document.getElementById("loginButton").disabled=alreadySignIn;
        alert("new user "+username);
    }
}

function updateFrame()
{
    ctx.fillStyle="#160000";
    ctx.fillRect(0, 0, chatCanvas.width, chatCanvas.height)
    panel2.draw(ctx);
    container.update()
}

var panel2;

function initControlPanel2()
{
    //fill panel
    panel2 = new ControlPanel([
        new Button({
            x:10,
            y:10,
            width:50,
            heigth:50,
            name:"language",
            action: function()
                {
                    if (language.buttonName=="en") 
                    {
                        language.buttonName="rus";
                    }else if (language.buttonName=="rus")
                    {
                        language.buttonName="en";
                    } 
                },
            text : language
        }),
        new Button({
            x:chatCanvas.width-36,
            y:50,
            width:30,
            heigth:30,
            name: "downBtn",
            action : function()
            {
                container.moveUp();
            },
            text : 
            {
                buttonName:"∧"
            }
        }),
        new Button({
            x:chatCanvas.width-36,
            y:chatCanvas.height-50,
            width:30,
            heigth:30,
            name: "upBtn",
            action : function()
            {
                container.moveDown();
            },
            text :{
                buttonName:"∨"
            }
        })
    ]);

    //add listener
    chatCanvas.addEventListener("mousedown",function (e)
    {
        if (panel2.checkIntersect(e, true).mousepress) updateFrame();
    });
    chatCanvas.addEventListener("mousemove",function (e)
    {
        if (panel2.checkIntersect(e).mouseover) updateFrame();
    });

    updateFrame();
    
}


var socket;
function initWebSocket()
{
    socket = new WebSocket("ws://pechbich.fvds.ru/chat");
    socket.onopen = function() 
    {
        alert('Соединение установлено.');
    };

    socket.onclose = function(event) 
    {
    if (event.wasClean) 
    {
        alert('Соединение закрыто чисто');
    } 
    else 
    {
        alert('Обрыв соединения'); // например, "убит" процесс сервера
    }
        alert('Код: ' + event.code + ' причина: ' + event.reason);
    };

    socket.onmessage = function(event) 
    {
        msg = JSON.parse(event.data);
        alert(event.data);
        readMsg(msg.type, msg);
    };

    socket.onerror = function(error) 
    {
        alert("Ошибка " + error.message);
    };
}

function getSymbol(code)
{
    return key[language.buttonName][code];
}
var key =
{
    en: {   32  :   " " ,
            48	:	"0"	,
            49	:	"1"	,
            50	:	"2"	,
            51	:	"3"	,
            52	:	"4"	,
            53	:	"5"	,
            54	:	"6"	,
            55	:	"7"	,
            56	:	"8"	,
            57	:	"9"	,
            65	:	"A"	,
            66	:	"B"	,
            67	:	"C"	,
            68	:	"D"	,
            69	:	"E"	,
            70	:	"F"	,
            71	:	"G"	,
            72	:	"H"	,
            73	:	"I"	,
            74	:	"J"	,
            75	:	"K"	,
            76	:	"L"	,
            77	:	"M"	,
            78	:	"N"	,
            79	:	"O"	,
            80	:	"P"	,
            81	:	"Q"	,
            82	:	"R"	,
            83	:	"S"	,
            84	:	"T"	,
            85	:	"U"	,
            86	:	"V"	,
            87	:	"W"	,
            88	:	"X"	,
            89	:	"Y"	,
            90	:	"Z"	,
            186 :   ";" ,
            188 :   "," ,
            190 :   "." ,
            222 :   "'" ,
            219 :   "\[" ,
            221 :   "\]"
    },
    rus :{  
            32  :   " " ,
            48	:	"0"	,
            49	:	"1"	,
            50	:	"2"	,
            51	:	"3"	,
            52	:	"4"	,
            53	:	"5"	,
            54	:	"6"	,
            55	:	"7"	,
            56	:	"8"	,
            57	:	"9"	,
            65	:	"ф"	,
            66	:	"и"	,
            67	:	"с"	,
            68	:	"в"	,
            69	:	"у"	,
            70	:	"а"	,
            71	:	"п"	,
            72	:	"р"	,
            73	:	"ш"	,
            74	:	"о"	,
            75	:	"л"	,
            76	:	"д"	,
            77	:	"ь"	,
            78	:	"т"	,
            79	:	"щ"	,
            80	:	"з"	,
            81	:	"й"	,
            82	:	"к"	,
            83	:	"ы"	,
            84	:	"е"	,
            85	:	"г"	,
            86	:	"м"	,
            87	:	"ц"	,
            88	:	"ч"	,
            89	:	"н"	,
            90	:	"я"	,
            186 :   "ж" ,
            188 :   "б" ,
            190 :   "ю" ,
            222 :   "э" ,
            219 :   "х" ,
            221 :   "ъ"
    }
};

function readMsg(type,params)  
{
    switch (type)
    {
        case "new" :  container.new(new TextStream(params.name,"",ctx));
        case "add" :  container.add(params.name, params.value);
        case "rmv" :  container.remove(params.name);
    }
    updateFrame();
};

var Container = (function (){
    function Container (){
        this.list = new Array();
        this.start=0;
        this.end=0;
    }

    Container.prototype.update = function()
    {
        for (var i=this.start;i<this.end ;i++)
        {
            alert(i+ " "+this.list[i].author);
            this.list[i].draw(i-this.start);
        }
    };

    Container.prototype.new = function(text)
    {
        this.end=this.list.push(text);
    };

    Container.prototype.add = function (name, value)
    {
        this.list.find(x=>x.author==name).append(value);
    };

    Container.prototype.remove = function (name)
    {
        this.map.find(x=>x.author==name).remove();
    };

    Container.prototype.delete = function (name)
    {
        this.list=this.list.map(x=>x.author!=name);
    };

    Container.prototype.moveDown = function()
    {
        if (this.list.length-this.end>0)
        {
            this.start++;
            this.end++;
        }
    };
    Container.prototype.moveUp = function()
    {
        if (this.start>0)
        {
            this.start--;
            this.end--;
        }
    };

    return Container;
}()); 

var TextStream = (function(){
    function TextStream(author,text,ctx)
    {
        this.text=text;
        this.ctx=ctx;
        this.author=author;
    }
    TextStream.prototype.append = function(char)
    {
        if (this.text.length<35) this.text+=char;
    };
    TextStream.prototype.remove = function(char)
    {
        this.text=this.text.substring(0,this.text.length-1);
    };
    TextStream.prototype.draw = function(line)
    {
        this.ctx.font="20px monospace";
        this.ctx.fillStyle="#ffffff";
        this.ctx.fillText(this.author+":\\",10,75+line*25);

        this.ctx.fillStyle="#ffffff";
        this.ctx.fillText(this.text,10+(this.author.length+2)*12,75+line*25);
    };
    return TextStream;
}())