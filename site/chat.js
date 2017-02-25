var chatCanvas;
var ctx;
var message;
var text
var stream;
var language={buttonName: "en"};
var languageButton;
var container;
var dialog;

//buttondown indicator
var ctrl=false; //cntrl
var shift=false;

var initChat = function(){
    chatCanvas = document.getElementById('chatCanvas');
    ctx = chatCanvas.getContext('2d');
    chatCanvas.width=format.width*format.length+70;

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
                    ctrl=true;    
                }
                if (e.keyCode==16)
                {
                    shift=true;
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
                    sendMsg("add",{code:e.keyCode, shift:shift, language:language.buttonName});
                    updateFrame();
                    
                }
                else if (e.keyCode==8)
                {
                    sendMsg("rmv", {full:ctrl})
                    updateFrame();
                }else if (e.keyCode==13)
                {
                    if (ctrl)
                    {
                        var command = getCommand(container.self.text);
                        if (command) 
                        {
                            sendMsg("set",command)
                        }
                    } 
                }
                if (e.keyCode==17)
                {
                    ctrl=false;
                }
                if (e.keyCode==16)
                {
                    shift=false;
                }
            }
        },
        true);
}

function sendMsg(type,value)
{
    var message = 
    {
        type:type,
        name:username,
        value:value
    };
    message = JSON.stringify(message);
    socket.send(message);
}

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
        case "set" :
        {
            container.changeParams(msg);
            break;
        }
    }
    updateFrame();
};

function getCommand(text)
{
    var tree = text.split(' ');
    if (tree[0] && tree[0][0]=='-')
    {
        if (tree[0]=='-set')
        {
            if (tree[1] && tree[1]=="color")
            {
                if (tree[2]) {
                    var regex = new RegExp('#[0-f]{6}','i');
                    if (regex.exec(tree[2])) return {color:tree[2]}
                }
            }
        }
    }
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
    
    container.update();
    panel2.draw(ctx);
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
        var mouseAction = panel2.checkIntersect(e,true);
        if (mouseAction.mousepress) 
        {
            updateFrame();
        }
        else
        {
            dialogHandler(e);
        }
    });
    chatCanvas.addEventListener("mousemove",function (e)
    {
        if (panel2.checkIntersect(e).mouseover) updateFrame();
    });

    updateFrame();
    
}

function dialogHandler(e)
{
    var createDialog = container.contains(e);
    if (createDialog)
    {
        dialog = new MyDialog({
            x:createDialog.x,
            y:createDialog.y,
            width:200,
            height:30,
            texts:
            createDialog.name==username?
            [
                {
                    name:"nothing",
                    text:{
                        buttonName:container.self.params.textAlign
                    },
                    action: function()
                    {
                        var next = container.self.params.textAlign!="left"?container.self.params.textAlign!="right"?"left":"center":"right";
                        sendMsg("set",{textAlign:next});
                    }
                }
            ]
            :
            [
                {
                    name:"to top",
                    text:{
                        buttonName:"to top"
                    },
                    action: function()
                    {
                        container.setToTop(createDialog.name);
                        updateFrame();
                    }
                }
            ],
            ctx: ctx
        })
        panel2.setDialog(dialog);
        updateFrame();
    }
    else{
        if (dialog && dialog.active && !dialog.Intersect(e))
        {
            dialog.active=false;    
            updateFrame();
        } 
    }
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

function decode(value)
{
    var dict;
    switch(value.language)
    {
        case "en":
        {
            dict=englishCode;
            break;
        }
        case "rus":   
        {
            dict=russianCode;
            break;
        }
    };
    return getSymbol(dict,value);
}

function getSymbol(dictionary, value)
{
    var char = dictionary[value.code];
    if (char)
    {
        if (value.shift) char = char.toUpperCase();
    }
    else 
    {
        char = symbolCode[value.shift][value.code];
    }
    return char;
}

var symbolCode=
{
     false:
     {
          192 :   "`",
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
     true:
     {
            192 :   "~",
            32  :   " " ,
            48	:	")"	,
            49	:	"!"	,
            50	:	"@"	,
            51	:	"#"	,
            52	:	"$"	,
            53	:	"%"	,
            54	:	"^"	,
            55	:	"&"	,
            56	:	"*"	,
            57	:	"(",
            191 :   "/",
            186 :   ":" ,
            188 :   "\<",
            190 :   ">" ,
            222 :   '\"' ,
            219 :   "\{" ,
            221 :   "\}",
            189 :   "_",
            107 :   "+",
            187 :   "+"
     }
};

var englishCode =
{
            65	:	"a"	,
            66	:	"b"	,
            67	:	"c"	,
            68	:	"d"	,
            69	:	"e"	,
            70	:	"f"	,
            71	:	"g"	,
            72	:	"h"	,
            73	:	"i"	,
            74	:	"j"	,
            75	:	"k"	,
            76	:	"l"	,
            77	:	"m"	,
            78	:	"n"	,
            79	:	"o"	,
            80	:	"p"	,
            81	:	"q"	,
            82	:	"r"	,
            83	:	"s"	,
            84	:	"t"	,
            85	:	"u"	,
            86	:	"v"	,
            87	:	"w"	,
            88	:	"x"	,
            89	:	"y"	,
            90	:	"z"	,
};

var russianCode=
{
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


