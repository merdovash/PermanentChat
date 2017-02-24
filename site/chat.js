var chatCanvas;
var ctx;
var message;
var text
var stream;
var language={buttonName: "en"};
var languageButton;
var container;
var dialog;
var fullClear=false;

var initChat = function(){
    chatCanvas = document.getElementById('chatCanvas');
    ctx = chatCanvas.getContext('2d');

    container = new Container();
    container.update();

    initControlPanel2();
    initWebSocket();
    
    window.addEventListener(
        "keydown",
        function (e)
        {
            if (alreadySignIn)
            {
                if (e.keyCode==17)
                {
                    fullClear=true;    
                }
            }
        },
        true
    );

    window.addEventListener(
        "keyup",
        function (e)
        {
            if (alreadySignIn)
            {
                if (e.keyCode>47 && e.keyCode<223 || e.keyCode==32)
                {                    
                    if (socket)
                    {
                        var message = 
                        {
                            type:"add",
                            name:username,
                            value:
                            {
                                language:language.buttonName,
                                code:e.keyCode
                            }
                        };
                        message = JSON.stringify(message);
                        socket.send(message);
                    } 
                    updateFrame();
                    
                }else if (e.keyCode==8)
                {
                    updateFrame();
                    if (socket)
                    {
                        var msg=
                        {
                            type:"rmv",
                            name:username,
                            value:
                            {
                                full:fullClear
                            }
                        }
                        socket.send(JSON.stringify(msg));
                    } 
                }
                if (e.keyCode==17)
                {
                    fullClear=false;
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
        //text = new TextStream(username,"",ctx);
        //container.new(text);
        alreadySignIn=true;
        updateFrame();
        if (socket && socket.state!="CLOSED") socket.send(JSON.stringify({type:"new",name:username}));
        document.getElementById("username").disabled = alreadySignIn;
        document.getElementById("loginButton").disabled=alreadySignIn;
    }
}

function updateFrame()
{
    ctx.fillStyle="#160000";
    ctx.fillRect(0, 0, chatCanvas.width, chatCanvas.height)
    panel2.draw(ctx);
    container.update()
    if (dialog && dialog.status) dialog.draw();
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
            height:50,
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
            height:30,
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
            height:30,
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
        if (panel2.checkIntersect(e, true).mousepress) 
        {
            updateFrame();
        }
        else
        {
            var createDialog = container.contains(e);
            if (createDialog)
            {
                dialog = new MyDialog({
                    x:createDialog.x,
                    y:createDialog.y,
                    width:200,
                    height:30,
                    texts:[
                        {
                            name:"null",
                            text:{
                                buttonName:"nothing"
                            },
                            action: function()
                            {
                                container.add(username, "&")
                            }
                        },
                        {
                            name:"null2",
                            text:{
                                buttonName:"hello"
                            },
                            action: function()
                            {
                                container.add(username, "$")
                            }
                        }],
                    ctx: ctx
                })
                panel2.add(dialog.buttons);
                updateFrame();
            }
            else{
                if (dialog && dialog.status && !dialog.contains(e))
                {
                    dialog.status=false;
                    panel2.remove(dialog.buttons);
                    updateFrame();
                } 
            }            
        }
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

function getSymbol(value)
{
    var temp;
    if (key[value.language]) temp = key[value.language][value.code];
    if (!temp)
    {
        temp = key.symbol[value.code]
    }
    return temp;
}
var key =
{
    symbol:
    {
            192 : "`",
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
            191 :   "/",
            186 :   ";" ,
            188 :   "," ,
            190 :   "." ,
            222 :   "'" ,
            219 :   "\[" ,
            221 :   "\]",
            189 :   "-",
            107 :   "+",
            187 :   "="
    },
    en: {   
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
    },
    rus :{  
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

function readMsg(msg)  
{
    switch (msg.type)
    {
        case "new" :  
        {
            container.new(new TextStream(msg.name,"",ctx));
            break; 
        }
        case "add" :  
        {
            container.add(msg);
            break;
        }
        case "rmv" :  
        {
            container.remove(msg);
            break;
        }
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
        if (this.list.length>0) {
            this.list.find(x=>x.author==username).draw(0);
            for (var i=this.start+1;i<this.end ;i++)
            {
                this.list[i].draw(i-this.start);
            }
        }
    };

    Container.prototype.new = function(text)
    {
        if (!this.list.find(x=>x.author==text.author)) this.end=this.list.push(text);
    };

    Container.prototype.add = function (msg)
    {
        if(!this.list.find(x=>x.author==msg.name)) 
        {
            this.new(new TextStream(msg.name, "", ctx));
        }

        var char = getSymbol(msg.value);
        this.list.find(x=>x.author==msg.name).append(char);
    };

    Container.prototype.remove = function (name, value)
    {
        this.list.find(x=>x.author==name).remove(value);
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
    Container.prototype.contains =function (e)
    {
        for (var i=0;i<this.list.length ;i++)
        {
            var params={   
                x:10,
                y:75+i*25,
                width:(this.list[i].author.length+2)*12,
                height:20
            };
            if(e.layerX > params.x && e.layerX < (params.x+params.width) && e.layerY > (params.y-params.height) && e.layerY < (params.y))
            {
                return params;   
            }
        }    
    }
    

    return Container;
}()); 

var TextStream = (function(){
    function TextStream(author,text,ctx)
    {
        this.text=text+"";
        this.ctx=ctx;
        this.author=author;
    }
    TextStream.prototype.append = function(char)
    {
        if (this.text.length<35) this.text+=char;
    };
    TextStream.prototype.remove = function(type)
    {
        if (type.full)
        {
            this.text="";
        }
        else 
        {
            this.text=this.text.substring(0,this.text.length-1);
        }
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