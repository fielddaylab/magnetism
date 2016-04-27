var GamePlayScene = function(game, stage)
{
  var self = this;

  var canv = stage.drawCanv;
  var canvas = canv.canvas;
  var ctx = canv.context;

  var dragger;

  var w = 30;
  var h = 30;

  var vfield;
  var charges;
  var mag;

  self.ready = function()
  {
    dragger = new Dragger({source:stage.dispCanv.canvas});

    vfield = new VecField(0,0,canv.width,canv.height,w,h)
    mag = new Magnet(-0.1,0.,0.1,0.,vfield);
    charges = [];
    charges[0] = mag.n;
    charges[1] = mag.s;

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

    self.draw = function()
    {
      ctx.lineWidth = 1.0;
      ctx.strokeStyle = "#FF00FF";
      ctx.fillStyle = "#550055";

      for(var i = 0; i < self.dh; i++)
      {
        for(var j = 0; j < self.dw; j++)
        {
          y = self.y + y_space*i+(y_space/2);
          x = self.x + x_space*j+(x_space/2);
          index = self.iFor(j,i);
          if(abs(self.dx[index]) > 0.1 && abs(self.dy[index]) > 0.1)
          {
            ctx.fillRect(x-1,y-1,2,2);
            canv.drawLine(x,y,x+self.dx[index]*vec_length,y+self.dy[index]*vec_length);
          }
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
      if(!self.ohandle.dragging)
        self.dragging = true;
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      if(!self.dragging) return;
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
};

