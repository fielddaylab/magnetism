var GamePlayScene = function(game, stage)
{
  var self = this;

  var canv = stage.drawCanv;
  var canvas = canv.canvas;
  var ctx = canv.context;

  var dragger;
  var clicker;
  var cur_dragging;
  var cur_selected;

  var res = 30;
  var w = 2*res;
  var h = 1*res;

  var vfield;
  var charges;
  var mags;
  var sings;

  var new_pos_btn;
  var new_neg_btn;
  var new_magnet_btn;
  var phys_btn;
  var del_btn;

  self.ready = function()
  {
    dragger = new Dragger({source:stage.dispCanv.canvas});
    clicker = new Clicker({source:stage.dispCanv.canvas});

    vfield = new VecField(0,0,canv.width,canv.height,w,h)
    charges = [];
    sings = [];
    mags = [];

/*
    genMagnet();
    for(var i = 0; i < 2; i++)
    {
      //genSingle((randBool()-0.5)*2);
      genSingle((i-0.5)*2);
    }
*/

    new_pos_btn    = new ButtonBox(10, 10,20,20,function(){ genSingle(1); });
    new_neg_btn    = new ButtonBox(10, 40,20,20,function(){ genSingle(-1); });
    new_magnet_btn = new ButtonBox(10, 70,20,20,function(){ genMagnet(); });
    phys_btn       = new ButtonBox(10,100,20,20,function(){ if(cur_selected) cur_selected.physics = !cur_selected.physics; });
    del_btn        = new ButtonBox(10,130,20,20,function(){ delMagnet(cur_selected); delSingle(cur_selected); });

    clicker.register(new_pos_btn);
    clicker.register(new_neg_btn);
    clicker.register(new_magnet_btn);
    clicker.register(phys_btn);
    clicker.register(del_btn);
  };
  var genSingle = function(charge_v)
  {
    var s = new Singlet(rand0()/2.,rand0()/2.,charge_v,vfield)
    charges[charges.length] = s.charge;
    dragger.register(s);
    cur_selected = s.charge;
    sings[sings.length] = s;
  }
  var delSingle = function(charge)
  {
    for(var i = 0; i < sings.length; i++)
    {
      if(charge == sings[i].charge)
      {
        dragger.unregister(sings[i]);
        delCharge(charge);
        sings.splice(i,1);
      }
    }
  }
  var genMagnet = function()
  {
    var m = new Magnet(-0.1,0.,0.1,0.,vfield)
    charges[charges.length] = m.n;
    charges[charges.length] = m.s;
    dragger.register(m.nhandle);
    dragger.register(m.shandle);
    cur_selected = m.nhandle.charge;
    mags[mags.length] = m;
  }
  var delMagnet = function(charge)
  {
    for(var i = 0; i < mags.length; i++)
    {
      if(charge == mags[i].n || charge == mags[i].s)
      {
        dragger.unregister(mags[i].nhandle);
        dragger.unregister(mags[i].shandle);
        delCharge(mags[i].n);
        delCharge(mags[i].s);
        mags.splice(i,1);
      }
    }
  }
  var delCharge = function(charge)
  {
    for(var i = 0; i < charges.length; i++)
    {
      if(charge == charges[i])
        charges.splice(i,1);
    }
  }

  self.tick = function()
  {
    dragger.flush();
    clicker.flush();

    vfield.tick();

    var sing;
    for(var i = 0; i < sings.length; i++)
    {
      sing = sings[i];
      if(sing.charge.physics)
      {
        if(sing.dragging)
        {
          sing.charge.xv = 0;
          sing.charge.yv = 0;
        }
        else
        {
          //gravity
          //sing.charge.yv += 0.001;

          //magnetism
          var charge;
          var yd;
          var xd;
          var r2;
          var f;
          var mind = 0.1;
          for(var j = 0; j < charges.length; j++)
          {
            charge = charges[j];
            if(charge != sing.charge)
            {
              yd = charge.y-sing.charge.y;
              xd = charge.x-sing.charge.x;
              r2 = (xd*xd)+(yd*yd);
              if(r2 == 0)
              {
                charge.x      += mind/2;
                sing.charge.x -= mind/2;
              }
              else
              {
                f = ((charge.v*sing.charge.v)/r2)/10000;
                r = sqrt(r2);
                yd /= r;
                xd /= r;
                sing.charge.yv -= f*yd;
                sing.charge.xv -= f*xd;

                //collision
                if(r < mind)
                {
                  sing.charge.y -= (mind-r)*yd;
                  sing.charge.x -= (mind-r)*xd;

                  var a = (sing.charge.xv*xd)+(sing.charge.yv*yd);
                  a *= 0.99;
                  sing.charge.xv -= a*xd;
                  sing.charge.yv -= a*yd;
                  charge.xv += a*xd;
                  charge.yv += a*yd;
                }
              }
            }
          }

          //clamp
          sing.charge.xv = clamp(-0.02,0.02,sing.charge.xv);
          sing.charge.yv = clamp(-0.02,0.02,sing.charge.yv);

          //propagate
          sing.charge.x += sing.charge.xv;
          sing.charge.y += sing.charge.yv;

          //correct
          if(sing.charge.x < -0.5) { sing.charge.x = -0.5; if(sing.charge.xv < 0) sing.charge.xv *= -1; }
          if(sing.charge.x >  0.5) { sing.charge.x =  0.5; if(sing.charge.xv > 0) sing.charge.xv *= -1; }
          if(sing.charge.y < -0.5) { sing.charge.y = -0.5; if(sing.charge.yv < 0) sing.charge.yv *= -1; }
          if(sing.charge.y >  0.5) { sing.charge.y =  0.5; if(sing.charge.yv > 0) sing.charge.yv *= -1; }

          //dampen
          sing.charge.xv *= 0.9;
          sing.charge.yv *= 0.9;

          //translate
          sing.x = vfield.xFSpaceToScreen(sing.charge.x)-sing.w/2;
          sing.y = vfield.yFSpaceToScreen(sing.charge.y)-sing.h/2;
        }
      }
    }
  };

  self.draw = function()
  {
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";
    var mag;
    for(var i = 0; i < mags.length; i++)
    {
      mag = mags[i];
      ctx.lineWidth = 20;
      ctx.beginPath();
      ctx.moveTo(mag.nhandle.x+mag.nhandle.w/2,mag.nhandle.y+mag.nhandle.h/2);
      ctx.lineTo(mag.shandle.x+mag.shandle.w/2,mag.shandle.y+mag.shandle.h/2);
      ctx.stroke();
      ctx.lineWidth = 1;
      if(mag.nhandle.charge == cur_selected)
      {
        ctx.fillStyle = "#FFFF00";
        ctx.fillRect(mag.nhandle.x,mag.nhandle.y,mag.nhandle.w,mag.nhandle.h);
        ctx.fillStyle = "#000000";
      }
      ctx.strokeRect(mag.nhandle.x,mag.nhandle.y,mag.nhandle.w,mag.nhandle.h);
      ctx.fillText("+",mag.shandle.x+5,mag.shandle.y+mag.shandle.h-5);
      if(mag.shandle.charge == cur_selected)
      {
        ctx.fillStyle = "#FFFF00";
        ctx.fillRect(mag.shandle.x,mag.shandle.y,mag.shandle.w,mag.shandle.h);
        ctx.fillStyle = "#000000";
      }
      ctx.strokeRect(mag.shandle.x,mag.shandle.y,mag.shandle.w,mag.shandle.h);
      ctx.fillText("-",mag.nhandle.x+5,mag.nhandle.y+mag.nhandle.h-5);
    }
    var sing;
    for(var i = 0; i < sings.length; i++)
    {
      sing = sings[i];
      if(sing.charge == cur_selected)
      {
        ctx.fillStyle = "#FFFF00";
        ctx.fillRect(sing.x,sing.y,sing.w,sing.h);
        ctx.fillStyle = "#000000";
      }
      ctx.strokeRect(sing.x,sing.y,sing.w,sing.h);
      if(sing.charge.v > 0) ctx.fillText("+",sing.x+5,sing.y+sing.h-5);
      if(sing.charge.v < 0) ctx.fillText("-",sing.x+5,sing.y+sing.h-5);
    }
    vfield.draw();

    new_pos_btn.draw(canv);    ctx.fillStyle = "#000000"; ctx.fillText("+",new_pos_btn.x+5,new_pos_btn.y+new_pos_btn.h-5);
    new_neg_btn.draw(canv);    ctx.fillStyle = "#000000"; ctx.fillText("-",new_neg_btn.x+5,new_neg_btn.y+new_neg_btn.h-5);
    new_magnet_btn.draw(canv); ctx.fillStyle = "#000000"; ctx.fillText("m",new_magnet_btn.x+5,new_magnet_btn.y+new_magnet_btn.h-5);
    phys_btn.draw(canv);       ctx.fillStyle = "#000000"; ctx.fillText("p",phys_btn.x+5,phys_btn.y+phys_btn.h-5);
    del_btn.draw(canv);        ctx.fillStyle = "#000000"; ctx.fillText("d",del_btn.x+5,del_btn.y+del_btn.h-5);
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

    self.tick = function()
    {
      var index;
      var x;
      var y;
      var xd;
      var yd;
      var r2;
      var r;
      var f;
      var maxlen = 10;
      for(var i = 0; i < self.dh; i++)
      {
        y = self.yIndexToFSpace(i);
        for(var j = 0; j < self.dw; j++)
        {
          index = self.iFor(j,i);
          x = self.xIndexToFSpace(j);

          self.dy[index] = 0;
          self.dx[index] = 0;
          for(var k = 0; k < charges.length; k++)
          {
            yd = y-charges[k].y;
            xd = x-charges[k].x;
            r2 = (xd*xd)+(yd*yd);
            if(r2 != 0)
            {
              f = charges[k].v/r2;
              r = sqrt(r2);
              self.dy[index] += f*yd/r;
              self.dx[index] += f*xd/r;
            }
          }

          //repurposing variables- just making sure vector is < some length
          yd = self.dy[index];
          xd = self.dx[index];
          r2 = (xd*xd)+(yd*yd);
          if(r2 > maxlen*maxlen)
          {
            r = sqrt(r2);
            self.dy[index] = yd/r*maxlen;
            self.dx[index] = xd/r*maxlen;
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
          index = self.iFor(j,i);

          d2 = self.dx[index]*self.dx[index] + self.dy[index]*self.dy[index];
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
    this.physics = false;
    this.xv = 0;
    this.yv = 0;
    this.v = v;
  }

  var Handle = function(charge,allowed_d,field)
  {
    var self = this;

    self.w = 20;
    self.h = 20;
    self.x = field.xFSpaceToScreen(charge.x)-self.w/2;
    self.y = field.yFSpaceToScreen(charge.y)-self.h/2;

    self.magnet;
    self.charge = charge;
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
      cur_selected = self.charge;
      self.x = evt.doX-self.w/2;
      self.y = evt.doY-self.h/2;

      self.charge.x = field.xScreenToFSpace(evt.doX);
      self.charge.y = field.yScreenToFSpace(evt.doY);
      var dx = self.ocharge.x-self.charge.x;
      var dy = self.ocharge.y-self.charge.y;
      var d = sqrt(dx*dx+dy*dy);
      if(d == 0){ dx = 1; dy = 0; d = 1; }
      self.ocharge.x = self.charge.x+((dx/d)*allowed_d);
      self.ocharge.y = self.charge.y+((dy/d)*allowed_d);
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
    self.nhandle.magnet = self;
    self.nhandle.ocharge = self.s;
    self.nhandle.ohandle = self.shandle;
    self.shandle.magnet = self;
    self.shandle.ocharge = self.n;
    self.shandle.ohandle = self.nhandle;
  }
  var Singlet = function(x,y,v,field)
  {
    var self = this;
    self.charge = new Charge(x,y,v);

    self.w = 20;
    self.h = 20;
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
      cur_selected = self.charge;
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

