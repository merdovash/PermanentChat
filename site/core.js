
var Container = (function (){
    function Container (params){
        this.list = new Array();
        this.self;
        this.empty = new TextStream("","",params.ctx);
        this.empty.setColor("#8080ff");
        this.start=0;
        this.end=0;
        this.size=10;
        this.ctx=params.ctx;
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
        }else if (this.empty)
        {
             this.empty.draw(0);
        }
    };

    Container.prototype.new = function(text)
    {
        if (!this.self && (text.author==username))
        {
            this.self=text;
            this.self.setColor("#ff4040");
            this.self.self=true;
            delete this.empty;
        }
        else if (!this.list.find(x=>x.author==text.author))
        {
            this.list.unshift(text);
            if (!(this.start==0)) this.start+=1;
        }
        

    };

    Container.prototype.add = function (msg)
    {
        var char = decode(msg.value);
        if (msg.name && msg.name==username && this.self) 
        {
            this.self.append(char);
        }
        else if (msg.name)
        {
            if(!this.list.find(x=>x.author==msg.name)) 
            {
                this.new(new TextStream(msg.name, "", ctx));
            }
            this.list.find(x=>x.author==msg.name).append(char);
        }else 
        {
            this.empty.append(char);
        }
    };

    Container.prototype.remove = function (msg)
    {
        if (msg.name && msg.name==username)
        {
            this.self.remove(msg.value);
        }
        else if(msg.name)
        {
            this.list.find(x=>x.author==msg.name).remove(msg.value);
        }else {
            this.empty.remove(msg.value);
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
        for (var count=0;count+this.start<this.list.length+(this.self?1:0) && count<this.size;count++)
        {
            var params={   
                x:format.xAlign,
                y:format.yAlign+count*format.height,
                width:((count==0?this.self:this.list[count+this.start-1]).author.length+2)*format.width,
                height:format.height,
                name:(count>0?this.list[count+this.start-1].author:username)
            };
            if(e.layerX > params.x && e.layerX < (params.x+params.width) && e.layerY > (params.y-params.height) && e.layerY < (params.y))
            {
                return params;   
            }
        }    
    };
    Container.prototype.setToTop = function(name)
    {
        if (name && name.length!="")
        {
            var temp=this.list.find(x=>x.author==name);
            this.list=this.list.filter(x=>x.author!=name);
            this.list.unshift(temp);
        }
    };
    Container.prototype.changeParams = function (params)
    {
        if (this.self)
        {
            if (params.name==this.self.author) this.self.setProperties(params.value);
            else this.list.find(x=>x.author==params.name).setProperties(params.value);
        }
    };

    

    return Container;
}()); 

var format=
{
    length:64,
    height:25,
    width:11,
    yAlign:85,
    xAlign:10,
    size:20

}

var TextStream = (function(){
    function TextStream(author,text,ctx)
    {
        this.text=text+"";
        this.ctx=ctx;
        this.author=author?author:"";
        this.color="#ffffff";
          
        this.params=
        {
            textAlign:"left",
            color:"#ffffff",
            size:20
        }
        this.width=format.length-this.author.length;   
    }
    TextStream.prototype.append = function(char)
    {
        if (this.text.length<this.width) this.text+=char;
    };
    TextStream.prototype.setColor = function (color)
    {
        this.color=color;
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
    TextStream.prototype.setProperties =function (params) 
    {
        for (var key in params)
        {
            if (this.params[key]) this.params[key]=params[key];
        }
    };
    TextStream.prototype.charWidth = function()
    {
        return this.params.size/format.size*format.width;
    };
    TextStream.prototype.draw = function(line)
    {
        if (this.self)
        {
            this.ctx.fillStyle="#232323";
            this.ctx.fillRect(0,format.yAlign-format.height+5+line*format.height,(format.length+3)*format.width,format.height);
        }
        this.ctx.font="20px monospace";
        this.ctx.fillStyle=this.color;
        this.ctx.fillText(this.author+":\\",format.xAlign,format.yAlign+line*format.height);

        this.ctx.font=this.params.size+"px monospace";
        this.ctx.fillStyle=this.params.color;
        switch (this.params.textAlign)
        {
            case "left":
            {
                this.ctx.fillText(this.text,format.xAlign+(this.author.length+2)*format.width,format.yAlign+line*format.height);
                break;
            }
            case "right":
            {
                this.ctx.fillText(this.text,format.xAlign+(format.length+2)*format.width-(this.text.length*this.charWidth()),format.yAlign+line*format.height);
                break;
            }
            case "center":
            {
                this.ctx.fillText(this.text,format.xAlign+(this.author.length+2 +this.width/2)*format.width-this.text.length*(this.charWidth()/2),format.yAlign+line*format.height);
            }

        }
        
    };
    
    return TextStream;
}())