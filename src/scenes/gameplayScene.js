var GamePlayScene = function(game, stage)
{
  var self = this;

  var canv = stage.drawCanv;
  var canvas = canv.canvas;
  var ctx = canv.context;

  var dragger;
  var cur_dragging;

  var w = 60;
  var h = 30;

  var vfield;
  var charges;
  var mag;
  var sings = [];

  self.ready = function()
  {
    dragger = new Dragger({source:stage.dispCanv.canvas});

    vfield = new VecField(0,0,canv.width,canv.height,w,h)
    charges = [];

    mag = new Magnet(-0.1,0.,0.1,0.,vfield);
    charges[0] = mag.n;
    charges[1] = mag.s;
    for(var i = 0; i < 2; i++)
    {
      //sings[sings.length] = new Singlet(rand0()/2.,rand0()/2.,(randBool()-0.5)*2,vfield);
      sings[sings.length] = new Singlet(rand0()/2.,rand0()/2.,(i-0.5)*2,vfield);
      charges[charges.length] = sings[sings.length-1].charge;
      dragger.register(sings[sings.length-1]);
    }

    dragger.register(mag.nhandle);
    dragger.register(mag.shandle);
  };

  self.tick = function()
  {
    dragger.flush();

    var index;
    var x;
    var y;
    var xd;
    var yd;
    var r2;
    var r;
    var f;
    var maxlen = 10;
    for(var i = 0; i < vfield.dh; i++)
    {
      y = vfield.yIndexToFSpace(i);
      for(var j = 0; j < vfield.dw; j++)
      {
        index = vfield.iFor(j,i);
        x = vfield.xIndexToFSpace(j);

        vfield.dy[index] = 0;
        vfield.dx[index] = 0;
        for(var k = 0; k < charges.length; k++)
        {
          yd = y-charges[k].y;
          xd = x-charges[k].x;
          r2 = (xd*xd)+(yd*yd);
          if(r2 == 0) f = 0;
          else        f = charges[k].v/r2;
          r = sqrt(r2);
          vfield.dy[index] += f*yd/r;
          vfield.dx[index] += f*xd/r;
        }

        //repurposing variables- just making sure vector is < some length
        yd = vfield.dy[index];
        xd = vfield.dx[index];
        r2 = (xd*xd)+(yd*yd);
        if(r2 > maxlen*maxlen)
        {
          r = sqrt(r2);
          vfield.dy[index] = yd/r*maxlen;
          vfield.dx[index] = xd/r*maxlen;
        }
      }
    }
  };

  self.draw = function()
  {
    vfield.draw();
    ctx.strokeRect(mag.nhandle.x,mag.nhandle.y,mag.nhandle.w,mag.nhandle.h);
    ctx.strokeRect(mag.shandle.x,mag.shandle.y,mag.shandle.w,mag.shandle.h);
    for(var i = 0; i < sings.length; i++)
      ctx.strokeRect(sings[i].x,sings[i].y,sings[i].w,sings[i].h);
  };

  self.cleanup = function()
  {
  };

  var VecField = function(x,y,w,h,dw,dh)
  {
    var self = this;
    self.x = x;
    self.y = y;
    self.w = w;
    self.h = h;

    //"the number
    self.xtransform = 1;
    self.ytransform = 1;
    if(self.h > self.w) self.ytransform = self.h/self.w;
    if(self.w > self.h) self.xtransform = self.w/self.h;

    //data
    self.dw = dw;
    self.dh = dh;
    self.dx = []; for(var i = 0; i < self.dw*self.dh; i++) self.dx[i] = 0;
    self.dy = []; for(var i = 0; i < self.dw*self.dh; i++) self.dy[i] = 0;
    self.iFor = function(dx,dy) { return (dy*dw)+dx; }
    //sample window is 1x1 grid aspect fit into w/h
    self.xIndexToFSpace = function(i) { return (((i+0.5)/self.dw)-0.5)*self.xtransform; }
    self.yIndexToFSpace = function(i) { return (((i+0.5)/self.dh)-0.5)*self.ytransform; }
    self.xScreenToFSpace = function(x) { return (((x-self.x)/self.w)-0.5)*self.xtransform; };
    self.yScreenToFSpace = function(y) { return (((y-self.y)/self.h)-0.5)*self.ytransform; };
    self.xFSpaceToScreen = function(x) { return (((x/self.xtransform)+0.5)*self.w)+self.x; };
    self.yFSpaceToScreen = function(y) { return (((y/self.ytransform)+0.5)*self.h)+self.y; };
    //self.sampleToIndex(s,n) { return (s*n)-0.5; }

    var x_space = self.w/self.dw;
    var y_space = self.h/self.dh;
    var vec_length = 2;
    //temp vars for drawing
    var x;
    var y;
    var d2;

    self.draw = function()
    {
      ctx.lineWidth = 1.0;

      for(var i = 0; i < self.dh; i++)
      {
        for(var j = 0; j < self.dw; j++)
        {
          y = self.y + y_space*i+(y_space/2);
          x = self.x + x_space*j+(x_space/2);
          index = self.iFor(j,i);

          d2 = self.dx[index]*self.dx[index] + self.dy[index]*self.dy[index];
               if(d2 > 100) ctx.strokeStyle = "#FF0000";
          else if(d2 >  81) ctx.strokeStyle = "#BB4400";
          else if(d2 >  72) ctx.strokeStyle = "#888800";
          else if(d2 >  63) ctx.strokeStyle = "#44BB00";
          else if(d2 >  54) ctx.strokeStyle = "#00FF00";
          else if(d2 >  45) ctx.strokeStyle = "#00BB44";
          else if(d2 >  36) ctx.strokeStyle = "#008888";
          else if(d2 >  27) ctx.strokeStyle = "#0044BB";
          else if(d2 >  18) ctx.strokeStyle = "#0000FF";
          else if(d2 >   9) ctx.strokeStyle = "#4400BB";
          else             ctx.strokeStyle = "#880088";
          ctx.fillStyle = ctx.strokeStyle;
          ctx.fillRect(x-1,y-1,2,2);
          canv.drawLine(x,y,x+self.dx[index]*vec_length,y+self.dy[index]*vec_length);
        }
      }

    }
  }

  var Charge = function(x,y,v)
  {
    this.x = x;
    this.y = y;
    this.v = v;
  }

  var Handle = function(charge,allowed_d,field)
  {
    var self = this;

    self.w = 10;
    self.h = 10;
    self.x = field.xFSpaceToScreen(charge.x)-self.w/2;
    self.y = field.yFSpaceToScreen(charge.y)-self.h/2;

    self.ohandle;
    self.ocharge;

    self.dragging = false;
    self.dragStart = function(evt)
    {
      if(!cur_dragging) self.dragging = true;
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      if(!self.dragging) return;
      cur_dragging = true;
      self.x = evt.doX-self.w/2;
      self.y = evt.doY-self.h/2;

      charge.x = field.xScreenToFSpace(evt.doX);
      charge.y = field.yScreenToFSpace(evt.doY);
      var dx = self.ocharge.x-charge.x;
      var dy = self.ocharge.y-charge.y;
      var d = sqrt(dx*dx+dy*dy);
      if(d == 0){ dx = 1; dy = 0; d = 1; }
      self.ocharge.x = charge.x+((dx/d)*allowed_d);
      self.ocharge.y = charge.y+((dy/d)*allowed_d);
      self.ohandle.x = field.xFSpaceToScreen(self.ocharge.x)-self.ohandle.w/2;
      self.ohandle.y = field.yFSpaceToScreen(self.ocharge.y)-self.ohandle.h/2;
    }
    self.dragFinish = function()
    {
      if(self.dragging) cur_dragging = false;
      self.dragging = false;
    }
  }
  var Magnet = function(nx,ny,sx,sy,field)
  {
    var self = this;
    var dx = nx-sx;
    var dy = ny-sy;
    var d = sqrt(dx*dx+dy*dy);
    self.n = new Charge(nx,ny,-1);
    self.s = new Charge(sx,sy, 1);

    self.nhandle = new Handle(self.n,d,field);
    self.shandle = new Handle(self.s,d,field);
    self.nhandle.ocharge = self.s;
    self.nhandle.ohandle = self.shandle;
    self.shandle.ocharge = self.n;
    self.shandle.ohandle = self.nhandle;
  }
  var Singlet = function(x,y,v,field)
  {
    var self = this;
    self.charge = new Charge(x,y,v);

    self.w = 10;
    self.h = 10;
    self.x = field.xFSpaceToScreen(self.charge.x)-self.w/2;
    self.y = field.yFSpaceToScreen(self.charge.y)-self.h/2;

    self.dragging = false;
    self.dragStart = function(evt)
    {
      if(!cur_dragging) self.dragging = true;
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      if(!self.dragging) return;
      cur_dragging = true;
      self.x = evt.doX-self.w/2;
      self.y = evt.doY-self.h/2;

      self.charge.x = field.xScreenToFSpace(evt.doX);
      self.charge.y = field.yScreenToFSpace(evt.doY);
    }
    self.dragFinish = function()
    {
      if(self.dragging) cur_dragging = false;
      self.dragging = false;
    }
  }
};

