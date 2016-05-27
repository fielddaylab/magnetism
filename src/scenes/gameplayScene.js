var GamePlayScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;
  var canvas = dc.canvas;
  var ctx = dc.context;

  var sidebar_w = 200;
  var res = 30;
  var res_w = 2*res;
  var res_h = 1*res;
  var earth_strength = 3;
  //jshax
  var tuple = {x:0,y:0,r:0,r2:0}; //global var to return from funcs without allocs #hax

  var dragger;
  var clicker;
  var hit_ui;

  var fallback;
  var dom;

  var vfield;
  var charges;
  var earth;

  self.ready = function()
  {
    dragger = new Dragger({source:stage.dispCanv.canvas});
    clicker = new Clicker({source:stage.dispCanv.canvas});

    dom = new CanvDom(dc);
    fallback = {x:0,y:0,w:dc.width,h:dc.height,click:function(evt){if(!hit_ui)dom.click(evt);}};

    vfield = new VecField(0,0,dc.width-sidebar_w,dc.height,res_w,res_h);
    vfield.setWindow(0,0,dc.width-sidebar_w,dc.height);
    charges = []; charges.push(new Charge(0,0,-1));
    vfield.tick(charges);

    clicker.register(fallback);
    hit_ui = false;
  };

  self.tick = function()
  {

    hit_ui = false;
  };

  self.draw = function()
  {
    vfield.draw();
  };

  self.cleanup = function()
  {

  };

  var popTupleForCharges = function(x,y,charges)
  {
    var xd;
    var yd;
    var r2;
    var r;
    var f;
    tuple.x = 0;
    tuple.y = 0;
    for(var i = 0; i < charges.length; i++)
    {
      yd = charges[i].y-y;
      xd = charges[i].x-x;
      r2 = (xd*xd)+(yd*yd);
      if(r2 != 0)
      {
        f = charges[i].v/r2;
        r = sqrt(r2);
        tuple.y += f*yd/r;
        tuple.x += f*xd/r;
      }
    }
    tuple.r2 = (tuple.x*tuple.x)+(tuple.y*tuple.y);
    tuple.r = sqrt(tuple.r2);
  }

  var VecField = function(x,y,w,h,dw,dh)
  {
    var self = this;
    self.x = x;
    self.y = y;
    self.w = w;
    self.h = h;

    self.win_x = x;
    self.win_y = y;
    self.win_w = w;
    self.win_h = h;
    self.win_fx = -0.5;
    self.win_fy = -0.5;
    self.win_fw =  0.5;
    self.win_fh =  0.5;

    self.setWindow = function(x,y,w,h)
    {
      self.win_x = x;
      self.win_y = y;
      self.win_w = w;
      self.win_h = h;
      self.win_fx = self.xScreenToFSpace(x);
      self.win_fy = self.yScreenToFSpace(y);
      self.win_fw = self.xScreenToFSpace(x+w)-self.win_fx;
      self.win_fh = self.yScreenToFSpace(y+h)-self.win_fy;
    }

    //ratio
    self.xtransform = 1;
    self.ytransform = 1;
    if(self.h > self.w) self.ytransform = self.h/self.w;
    if(self.w > self.h) self.xtransform = self.w/self.h;

    //data
    self.dw = dw;
    self.dh = dh;
    self.dx = []; for(var i = 0; i < self.dw*self.dh; i++) self.dx[i] = 0;
    self.dy = []; for(var i = 0; i < self.dw*self.dh; i++) self.dy[i] = 0;
    self.dr = []; for(var i = 0; i < self.dw*self.dh; i++) self.dr[i] = 0;
    self.d2 = []; for(var i = 0; i < self.dw*self.dh; i++) self.d2[i] = 0;
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
    var max_length = 10;
    var vec_length = 10;
    //temp vars for tick/draw
    var x;
    var y;

    self.tick = function(charges)
    {
      var index;

      for(var i = 0; i < self.dh; i++)
      {
        y = self.yIndexToFSpace(i);
        for(var j = 0; j < self.dw; j++)
        {
          index = self.iFor(j,i);
          x = self.xIndexToFSpace(j);

          if(
              x < self.win_fx             ||
              x > self.win_fx+self.win_fw ||
              y < self.win_fy             ||
              y > self.win_fy+self.win_fh
            )
            continue;

          popTupleForCharges(x,y,charges);
          self.dx[index] = tuple.x;
          self.dy[index] = tuple.y;
          self.dr[index] = tuple.r;
          self.d2[index] = tuple.r2;

          if(earth) self.dy[index] -= earth_strength;

          if(self.dr[index] > max_length)
          {
            self.dy[index] *= max_length/self.dr[index];
            self.dx[index] *= max_length/self.dr[index];
            self.dr[index] = max_length;
            self.d2[index] = max_length*max_length;
          }
        }
      }
    }

    self.draw = function()
    {
      ctx.lineWidth = 1;

      for(var i = 0; i < self.dh; i++)
      {
        for(var j = 0; j < self.dw; j++)
        {

          y = self.y + y_space*i+(y_space/2);
          x = self.x + x_space*j+(x_space/2);

          if(
              x < self.win_x            ||
              x > self.win_x+self.win_w ||
              y < self.win_y            ||
              y > self.win_y+self.win_h
            )
            continue;

          index = self.iFor(j,i);

          d2 = self.d2[index];
               if(d2 > 100) ctx.strokeStyle = "#FF0000";
          else if(d2 >  90) ctx.strokeStyle = "#BB4400";
          else if(d2 >  80) ctx.strokeStyle = "#888800";
          else if(d2 >  70) ctx.strokeStyle = "#44BB00";
          else if(d2 >  60) ctx.strokeStyle = "#00FF00";
          else if(d2 >  50) ctx.strokeStyle = "#00BB44";
          else if(d2 >  40) ctx.strokeStyle = "#008888";
          else if(d2 >  30) ctx.strokeStyle = "#0044BB";
          else if(d2 >  20) ctx.strokeStyle = "#0000FF";
          else if(d2 >  10) ctx.strokeStyle = "#4400BB";
          else             ctx.strokeStyle = "#880088";
          ctx.fillStyle = ctx.strokeStyle;
          //ctx.fillRect(x-1,y-1,2,2);
          dc.drawLine(
            x-(self.dx[index]*vec_length/2),
            y-(self.dy[index]*vec_length/2),
            x+(self.dx[index]*vec_length/2),
            y+(self.dy[index]*vec_length/2)
          );

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


};
