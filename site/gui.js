var ControlPanel = (function () {
    function ControlPanel(buttonList) {
        this.map=new Array();
        this.add(buttonList);
        
    }
    ControlPanel.prototype.draw = function (canvasContext) 
    {
        this.map.forEach(x=> x.draw(canvasContext));
    };
    ControlPanel.prototype.add = function (values)
    {
        
        for (var key in values)
        {
            this.map.push(values[key]);
        }
    };
    ControlPanel.prototype.remove = function(values)
    {
        for (var key in values)
        {
            this.map.pop();
        }
    };
    ControlPanel.prototype.checkIntersect = function (e,type) {
        this.map.forEach(x=> x.Intersect(e,type));
        return {
            mouseover:(this.map.some(x=>x.mouseoverChanges)),
            mousepress:(this.map.some(x=> x.actionChange==true))
        }
    };
    ControlPanel.prototype.setMouseActions = function(canvas,params)
    {
        canvas.addEventListener("mousedown",params.mousedown);
        canvas.addEventListener("mousmove",params.mousemove);
    };
    
    return ControlPanel;
}());

var Button = (function () {
    function Button(params) {
        this.x = params.x;
        this.y = params.y;
        this.height = params.height;
        this.width = params.width;
        this.name = params.name;
        this.mouseover=false;
        this.text=params.text;
        this.action = params.action;
    }
    Button.prototype.draw = function (canvasContext) {
        //check mouseover and change color
        canvasContext.fillStyle="#ffffff";

        //draw button
        canvasContext.fillRect(this.x, this.y, this.width, this.height);
        canvasContext.fillStyle="#101010";
        canvasContext.strokeRect(this.x, this.y, this.width, this.height);
        if (this.text.buttonName)
        {
            canvasContext.font="20px monospace";
            canvasContext.fillStyle="#000000";
            canvasContext.fillText(this.text.buttonName, this.x+this.width/2-(this.text.buttonName.length/2)*12,this.y+this.height/2+4);
        }
        if (this.mouseover)
        {
            ctx.beginPath();
            ctx.lineWidth="2";
            ctx.strokeStyle="#000000";
            ctx.rect(this.x+4,this.y+4,this.width-8,this.height-8); 
            ctx.stroke()   
        }
    };

    Button.prototype.setAction = function (f) {
        this.action = f;
    };

    Button.prototype.Intersect = function (e,type) {
        if (e.layerX > this.x && e.layerX < (this.x + this.width) && e.layerY > this.y && e.layerY < (this.y + this.height)) {
            if (!this.mouseover)
            {
                this.mouseover=true;
                this.mouseoverChanges=true;
            }else{
                this.mouseoverChanges=false;
            }
            if (type)
            {
                this.action();
                this.actionChange=true;  
            }else{
                this.actionChange=false;
            }
            return true;
        }else
        {
            if (this.mouseover)
            {
                this.mouseover=false;
                this.mouseoverChanges=true;
            }else{
                this.mouseoverChanges=false;
            }
            return false;
        }
    };

    Button.prototype.SetText = function(text)
    {
        this.text=text;
    };

    return Button;
}());

var Indicator = (function(){
    function Indicator(params)
    {
        this.centerX=params.centerX;
        this.centerY=params.centerY;
        this.radius=params.radius;
        this.color=params.color;
        this.text =params.text;
        this.condition = params.condition;
    }

    Indicator.prototype.draw = function (context)
    {
        context.beginPath();
        context.fillStyle = this.condition?this.color.true:this.color.false;
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        context.fill();
        context.lineWidth = 5;
        context.strokeStyle = '#003300';
        context.stroke();

        if (this.text)
        {
            context.font="20px monospace";
            context.fillStyle="#000000";
            context.fillText(this.text, this.x-this.text.length*7,this.y+this.radius);
        }
    };

    Indicator.prototype.Intersect = function(e,type)
    {
        
    };
    return Indicator;
}());

var HitBox = (function()
{
    function HitBox(params)
    {
        this.x=params.x;
        this.y=params.y;
        this.width=params.width;
        this.height=params.height;
        this.action=params.action;
        
    }
    HitBox.prototype.contains = function(e)
    {
        return e.centerX > this.x &&
            e.centerX < (this.x + this.width) &&
            e.centerY > this.y &&
            e.centerY < (this.y + this.height);
    };
    
    return HitBox;
}());

var MyDialog = (function()
{
    function MyDialog(params)
    {
        this.x=params.x;
        this.y=params.y;
        this.width=params.width;
        this.height=params.height;
        this.buttons={};
        this.status=true;
        
        var i=0;
        for (var button in params.texts)
        {
            this.buttons[i]=new Button(
                {
                    x:this.x,
                    y:this.y+i*this.height,
                    width:this.width,
                    height:this.height,
                    name:params.texts[button].name,
                    text:params.texts[button].text,
                    action:params.texts[button].action
                });
            i+=1;
        }
        this.ctx=params.ctx;
    }
    
    MyDialog.prototype.draw = function()
    {
        for (var key in this.buttons)
        {
            this.buttons[key].draw(this.ctx);
        }
    };
    MyDialog.prototype.contains = function(e)
    {
        for (var key in this.buttons)
        {
            if (this.buttons[key].Intersect(e)) return true;
        }
        return false;
    };

    return MyDialog;
}())