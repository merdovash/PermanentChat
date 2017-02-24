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
                    if (socket)  sendMsg("add",e.keyCode);
                    updateFrame();
                    
                }
                else if (e.keyCode==8)
                {
                    if (socket) sendMsg("rmv")
                    updateFrame();
                }
                if (e.keyCode==17)
                {
                    fullClear=false;
                }
            }
        },
        true);
}

function sendMsg(type,keyCode)
{
    var message = 
    {
        type:type,
        name:username,
        value:
        type=="add"?
        {
            language:language.buttonName,
            code:keyCode
        }:type=="new"?
        {

        }:{
            full:fullClear
        }
    };
    message = JSON.stringify(message);
    socket.send(message);
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
        if (socket && socket.state!="CLOSED") sendMsg("new");
        document.getElementById("username").disabled = alreadySignIn;
        document.getElementById("loginButton").disabled=alreadySignIn;
    }
}

function updateFrame()
{
    ctx.fillStyle="#160000";
    ctx.fillRect(0, 0, chatCanvas.width, chatCanvas.height)
    panel2.draw(ctx);
    container.update();
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
                updateFrame();
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
                updateFrame();
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
            container.new(new TextStream(msg.name,"",ctx,msg.name==username?true:false));
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
        this.self;
        this.start=0;
        this.end=0;
        this.size=10;
    }

    Container.prototype.update = function()
    {
        if (this.list.length>0 || this.self) {
            if (this.self) 
            {
                this.self.draw(0);
            }
            for (var count=0;count+this.start<this.list.length && count<this.size;count++)
            {
                this.list[count+this.start].draw(count+1);
            }
        }
    };

    Container.prototype.new = function(text)
    {
        if (!this.self && text.author==username)
        {
            this.self=text;
        }
        else if (!this.list.find(x=>x.author==text.author))
        {
            this.list.unshift(text);
            if (!(this.start==0)) this.start+=1;
        }
        

    };

    Container.prototype.add = function (msg)
    {
        var char = getSymbol(msg.value);
        if (msg.name==username) 
        {
            this.self.append(char);
        }
        else
        {
            if(!this.list.find(x=>x.author==msg.name)) 
            {
                this.new(new TextStream(msg.name, "", ctx));
            }
            this.list.find(x=>x.author==msg.name).append(char);
        }
    };

    Container.prototype.remove = function (msg)
    {
        if (msg.name==username)
        {
            this.self.remove(msg.value);
        }
        else 
        {
            this.list.find(x=>x.author==msg.name).remove(msg.value);
        }
    };

    Container.prototype.delete = function (name)
    {
        this.list=this.list.map(x=>x.author!=name);
    };

    Container.prototype.moveDown = function()
    {
        if (this.list.length-this.size>this.start)
        {
            this.start++;
        }
    };
    Container.prototype.moveUp = function()
    {
        if (this.start>0)
        {
            this.start--;
        }
    };
    Container.prototype.contains =function (e)
    {
        for (var count=0;count+this.start<this.list.length && count<this.size;i.count++)
        {
            var params={   
                x:10,
                y:75+i*25,
                width:(this.list[count+this.start].author.length+2)*12,
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
    function TextStream(author,text,ctx,self)
    {
        this.text=text+"";
        this.ctx=ctx;
        this.author=author;
        this.self=self?true:false;        
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