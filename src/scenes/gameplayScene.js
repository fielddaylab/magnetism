var GamePlayScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;
  var canvas = dc.canvas;
  var ctx = dc.context;

  var ENUM = 0;
  var INPUT_RESUME = ENUM; ENUM++;
  var INPUT_PAUSE  = ENUM; ENUM++;
  var input_state;
  var n_ticks;

  var sidebar_w = 250;
  var sidebar_xb = 13;
  var sidebar_yb = 9;
  var res = 50;
  var res_w = 1*res;
  var res_h = 1*res;
  var earth_strength = 3;
  //jshax
  var tuple = {fx:0,fy:0,r:0,r2:0}; //global var to return from funcs without allocs #hax
  var compass_r = 30;
  var fieldview_s = 150;
  var charge_s = 20;
  var guess_s = 40;
  var btn_h = 60;
  var title_h = 30;

  var hit_ui;
  var dragger;
  var clicker;

  var fallback;
  var dom;

  var vfield;
  var ifvfield;
  var hdvfield;
  var charges;
  var magnets;
  var compasses;
  var fullview;
  var filings;
  var film;
  var nguess;
  var sguess;

  var ui_toggle;
  var guess_placed;
  var tools_toggle_btn;
  var guess_toggle_btn;
  var guess_btn;
  var earth;

  self.ready = function()
  {
    n_ticks = 0;

    dragger = new Dragger({source:stage.dispCanv.canvas});
    clicker = new Clicker({source:stage.dispCanv.canvas});

    dom = new CanvDom(dc);
    fallback = {x:0,y:0,w:dc.width,h:dc.height,click:function(evt){if(!hit_ui)dom.click(evt);}};

    vfield = new VecField(0,0,dc.width-sidebar_w,dc.height,res_w,res_h);
    ifvfield = new VecField(0,0,dc.width-sidebar_w,dc.height,res_w*3,res_h*3);
    hdvfield = new VecField(0,0,dc.width-sidebar_w,dc.height,res_w*2,res_h*2);
    var c;
    var m;
    charges = [];
      //c = new Charge(vfield.x+vfield.w/2+rand0()*100,vfield.y+vfield.h/2+rand0()*100,-1)
      //c.draggable = false;
      //dragger.register(c);
      //charges.push(c);
      //c = new Charge(vfield.x+vfield.w/2+rand0()*100,vfield.y+vfield.h/2+rand0()*100, 1)
      //c.draggable = false;
      //dragger.register(c);
      //charges.push(c);
    for(var i = 0; i < 0; i++)
    {
      c = new Charge(vfield.x+vfield.w/2,vfield.y+vfield.h/2,-1)
      dragger.register(c);
      charges.push(c);
    }
    magnets = [];
      m = new Magnet(vfield.x+vfield.w/2+rand0()*200,vfield.y+vfield.h/2+rand0()*200,vfield.x+vfield.w/2+rand0()*200,vfield.y+vfield.h/2+rand0()*200)
      m.draggable = false;
      dragger.register(m);
      magnets.push(m);
    for(var i = 0; i < 0; i++)
    {
      m = new Magnet(vfield.x+vfield.w/2-20,vfield.y+vfield.h/2-20,vfield.x+vfield.w/2+20,vfield.y+vfield.h/2+20)
      dragger.register(m);
      magnets.push(m);
    }
    compasses = [];
    var p = 20;
    for(var i = 0; i < 2; i++)
    {
      for(var j = 0; j < 3; j++)
      {
        c = new Compass(space(dc.width-sidebar_w+sidebar_xb,dc.width,compass_r*2,2,i),space(sidebar_yb+btn_h+title_h,300,compass_r*2,3,j));
        c.inert = true;
        dragger.register(c);
        compasses.push(c);
      }
    }

    fullview = new FieldView(0,0);
    fullview.w = dc.width-sidebar_w;
    fullview.h = dc.height;
    fullview.screenToF();
    fullview.draggble = false;
    filings = new FieldView(dc.width-sidebar_w+sidebar_xb+(sidebar_w-sidebar_xb)/2-fieldview_s/2,390);
    filings.blurred = true;
    filings.vec_l = 5;
    dragger.register(filings);
    film = new FieldView(dc.width-sidebar_w+sidebar_xb+(sidebar_w-sidebar_xb)/2-fieldview_s/2,615);
    film.colored = true;
    film.vec_l = 1;
    dragger.register(film);

    nguess = new Guess(dc.width-sidebar_w+p,btn_h+title_h+p);
    dragger.register(nguess);
    sguess = new Guess(dc.width-sidebar_w+p+guess_s+p,btn_h+title_h+p);
    dragger.register(sguess);

    ui_toggle = false;
    guess_placed = false;
    tools_toggle_btn = new ButtonBox(dc.width-sidebar_w+sidebar_xb                         ,sidebar_yb,(sidebar_w-sidebar_xb)/2,btn_h-sidebar_yb,function(evt){ui_toggle = false;});
    guess_toggle_btn = new ButtonBox(dc.width-sidebar_w+sidebar_xb+(sidebar_w-sidebar_xb)/2,sidebar_yb,(sidebar_w-sidebar_xb)/2,btn_h-sidebar_yb,function(evt){ui_toggle = true;});
    guess_btn        = new ButtonBox(dc.width-sidebar_w+p,btn_h+title_h+p+guess_s+p,sidebar_w-2*p,btn_h,function(evt){if(!ui_toggle || hit_ui) return; guess_placed = true; hit_ui = true;});
    clicker.register(tools_toggle_btn);
    clicker.register(guess_toggle_btn);
    clicker.register(guess_btn);
    earth = 0;

    clicker.register(fallback);
    hit_ui = false;

    input_state = INPUT_RESUME;

    //setTimeout(function(){displayMessage(["Hey there","This is great","This is really long let me keep writing I'm trying to test how quicly I can type and I'm finding out that I actually don't normally write out continuous sentences like this so have probably built up a bias towards burst typing and stuff but now I think that this is probably long enough.","one more"]);},100);
  };

  self.tick = function()
  {
    n_ticks++;

    var dirty = false;
    clicker.flush();
    dragger.flush();
    for(var i = 0; i < charges.length; i++)
    {
      dirty = (charges[i].dirty || dirty);
      charges[i].dirty = false;
    }
    for(var i = 0; i < magnets.length; i++)
    {
      dirty = (magnets[i].dirty || dirty);
      magnets[i].dirty = false;
    }

    if(filings.dirty || dirty) ifvfield.tick(filings,charges,magnets); filings.dirty = false;
    if(film.dirty    || dirty) hdvfield.tick(film,charges,magnets);  film.dirty = false;
    if(fullview.dirty || dirty) vfield.tick(fullview,charges,magnets); fullview.dirty = false;
    for(var i = 0; i < compasses.length; i++)
    {
      if(compasses[i].dirty || dirty) compasses[i].tick();
      compasses[i].dirty = false;
    }

    hit_ui = false;
  };

  self.draw = function()
  {
    //sidebar
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#90764A";
    ctx.lineWidth = 1;
    ctx.lineWidth = 1;
    ctx.drawImage(sidebar_img,dc.width-sidebar_w,0,sidebar_w,dc.height);

    var btn_overlap = 15;
    if(!ui_toggle) ctx.drawImage(tools_btn_img,dc.width-sidebar_w+sidebar_xb,sidebar_yb,sidebar_w-sidebar_xb,btn_h);
    else           ctx.drawImage(guess_btn_img,dc.width-sidebar_w+sidebar_xb,sidebar_yb,sidebar_w-sidebar_xb,btn_h);

    //tools_toggle_btn.draw(dc);
    //guess_toggle_btn.draw(dc);

    if(ui_toggle) guess_btn.draw(dc);

    //charges
    for(var i = 0; i < charges.length; i++)
      ctx.fillRect(charges[i].x,charges[i].y,charges[i].w,charges[i].h);
    //magnets
    for(var i = 0; i < magnets.length; i++)
      magnets[i].draw();
    //compasses
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "18px Open Sans";
    ctx.textAlign = "center";
    if(!ui_toggle) ctx.fillText("COMPASSES",dc.width-sidebar_w/2,btn_h+30);
    if(!ui_toggle) ctx.fillText("MAGNETIC FILM",dc.width-sidebar_w/2,film.default_y-30);
    if(!ui_toggle) ctx.fillText("IRON FILINGS",dc.width-sidebar_w/2,filings.default_y-30);
    if(ui_toggle) ctx.fillText("GUESSES",dc.width-sidebar_w/2,btn_h+30);
    ctx.fillStyle = "#000000";

    vfield.draw(fullview);
    if(!ui_toggle || !film.default) ctx.drawImage(mag_film_img,film.x,film.y,film.w,film.h);
    hdvfield.draw(film);
    if(!ui_toggle || !filings.default)
      if(filings.inert || filings.dragging) ctx.drawImage(iron_filings_img,filings.x,filings.y,filings.w,filings.h);
    ifvfield.draw(filings);
    for(var i = 0; i < compasses.length; i++)
      if(!ui_toggle || !compasses[i].default) compasses[i].draw();
    if(ui_toggle || !nguess.default) ctx.fillRect(nguess.x,nguess.y,nguess.w,nguess.h);
    if(ui_toggle || !sguess.default) ctx.fillRect(sguess.x,sguess.y,sguess.w,sguess.h);

    ctx.font = blurb_f+"px Open Sans";
    dom.draw(blurb_f,dc);
  };

  self.cleanup = function()
  {

  };

  var popForceTuple = function(fx,fy,charges,magnets)
  {
    var xd;
    var yd;
    var x;
    var y;
    var r2;
    var r;
    var f;
    tuple.fx = 0;
    tuple.fy = 0;
    for(var i = 0; i < charges.length; i++)
    {
      yd = charges[i].fy-fy;
      xd = charges[i].fx-fx;
      r2 = (xd*xd)+(yd*yd);
      if(r2 != 0)
      {
        f = charges[i].v/r2;
        r = sqrt(r2);
        tuple.fy += f*yd/r;
        tuple.fx += f*xd/r;
      }
    }
    for(var i = 0; i < magnets.length; i++)
    {
      var mag_d = 2;
      for(var j = 0; j < mag_d; j++)
      {
        x = lerp(magnets[i].nfx,magnets[i].sfx,j/(mag_d-1));
        y = lerp(magnets[i].nfy,magnets[i].sfy,j/(mag_d-1));

        yd = y-fy;
        xd = x-fx;
        r2 = (xd*xd)+(yd*yd);
        if(r2 != 0)
        {
          f = (j%2) ? (1/r2) : (-1/r2);
          r = sqrt(r2);
          tuple.fy += f*yd/r;
          tuple.fx += f*xd/r;
        }
      }
    }
    tuple.r2 = (tuple.fx*tuple.fx)+(tuple.fy*tuple.fy);
    tuple.r = sqrt(tuple.r2);
  }

  var VecField = function(x,y,w,h,dw,dh)
  {
    var self = this;
    self.x = x;
    self.y = y;
    self.w = w;
    self.h = h;

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
    //temp vars for tick/draw
    var x;
    var y;
    var fx;
    var fy;

    self.tick = function(view,charges,magnets)
    {
      var index;

      for(var i = 0; i < self.dh; i++)
      {
        fy = self.yIndexToFSpace(i);
        for(var j = 0; j < self.dw; j++)
        {
          index = self.iFor(j,i);
          fx = self.xIndexToFSpace(j);

          if(
              fx < view.fx-view.fw ||
              fx > view.fx+view.fw ||
              fy < view.fy-view.fh ||
              fy > view.fy+view.fh
            )
            continue;

          popForceTuple(fx,fy,charges,magnets);
          self.dx[index] = tuple.fx;
          self.dy[index] = tuple.fy;
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

    self.draw = function(view)
    {
      if(view.dragging) return;
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#000000";

      for(var i = 0; i < self.dh; i++)
      {
        for(var j = 0; j < self.dw; j++)
        {
          y = self.y + y_space*i+(y_space/2);
          x = self.x + x_space*j+(x_space/2);

          if(
              x < view.x        ||
              x > view.x+view.w ||
              y < view.y        ||
              y > view.y+view.h
            )
            continue;

          index = self.iFor(j,i);

          if(view.colored)
          {
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
            else              ctx.strokeStyle = "#880088";
          }

          if(view.blurred)
          {
            var dx = x-(view.x+view.w/2);
            var dy = y-(view.y+view.h/2);
            var a = 1-(sqrt(dx*dx+dy*dy)/(view.w/2))
            if(a < 0) a = 0;
            ctx.globalAlpha = a;
          }

          //ctx.fillStyle = ctx.strokeStyle;
          //ctx.fillRect(x-2,y-2,4,4);
          dc.drawLine(
            x-(self.dx[index]*view.vec_l/2),
            y-(self.dy[index]*view.vec_l/2),
            x+(self.dx[index]*view.vec_l/2),
            y+(self.dy[index]*view.vec_l/2)
          );

          ctx.globalAlpha = 1;
        }
      }

    }
  }

  var Charge = function(x,y,v)
  {
    var self = this;

    self.x = x;
    self.y = y;
    self.w = charge_s;
    self.h = charge_s;

    self.fx = vfield.xScreenToFSpace(self.x+self.w/2);
    self.fy = vfield.yScreenToFSpace(self.y+self.h/2);
    self.v = v;

    self.draggable = true;
    self.inert = false;

    self.dirty = true;

    self.dragging = false;
    self.dragStart = function(evt)
    {
      if(!self.draggable || hit_ui) return;
      self.dragging = true;
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      if(!self.dragging) return;
      self.x = evt.doX-self.w/2;
      self.y = evt.doY-self.h/2;
      self.fx = vfield.xScreenToFSpace(evt.doX);
      self.fy = vfield.yScreenToFSpace(evt.doY);
      self.dirty = true;
      hit_ui = true;
    }
    self.dragFinish = function()
    {
      self.dragging = false;
    }
  }

  var Magnet = function(nx,ny,sx,sy)
  {
    var self = this;

    self.nx = nx;
    self.ny = ny;
    self.nw = charge_s*2;
    self.nh = charge_s*2;

    self.nfx = vfield.xScreenToFSpace(self.nx+self.nw/2);
    self.nfy = vfield.yScreenToFSpace(self.ny+self.nh/2);

    self.sx = sx;
    self.sy = sy;
    self.sw = charge_s*2;
    self.sh = charge_s*2;

    self.sfx = vfield.xScreenToFSpace(self.sx+self.sw/2);
    self.sfy = vfield.yScreenToFSpace(self.sy+self.sh/2);

    self.x = 0;
    self.y = 0;
    self.w = 0;
    self.h = 0;
    self.calcBB = function()
    {
      self.x = min(self.nx,self.sx);
      self.y = min(self.ny,self.sy);
      self.w = abs(self.nx-self.sx)+self.sw;
      self.h = abs(self.ny-self.sy)+self.sh;
    }
    self.calcBB();

    self.draggable = true;
    self.inert = false;
    self.default = true;

    self.draw = function()
    {
      if(!guess_placed) return;
      ctx.save();
      ctx.translate(self.x+self.w/2,self.y+self.h/2);
      ctx.rotate(Math.atan2(self.nfy-self.sfy,self.nfx-self.sfx));
      var xdiff = self.nx-self.sx;
      var ydiff = self.ny-self.sy;
      var d = sqrt(xdiff*xdiff+ydiff*ydiff);
      var h = 20;
      var hw = 20;
      ctx.drawImage(mag_n_img,-d/2+hw-2,-h/2,d/2-hw+2,h);
      ctx.drawImage(mag_s_img,0,-h/2,d/2-hw+2,h);
      ctx.drawImage(mag_n_tip_img,-d/2,-h/2,hw,h);
      ctx.drawImage(mag_s_tip_img,d/2-hw,-h/2,hw,h);
      ctx.restore();
    }

    self.dirty = true;

    self.dragging = false;
    self.ndragging = false;
    self.sdragging = false;
    self.dragStart = function(evt)
    {
      if(!self.draggable || hit_ui) return;

      if(ptWithin(evt.doX,evt.doY,self.nx,self.ny,self.nw,self.nh))
        self.ndragging = true;
      else if(ptWithin(evt.doX,evt.doY,self.sx,self.sy,self.sw,self.sh))
        self.sdragging = true;
      else
      {
        var x0 = evt.doX;
        var y0 = evt.doY;
        var x1 = self.nx+self.nw/2;
        var y1 = self.ny+self.nh/2;
        var x2 = self.sx+self.sw/2;
        var y2 = self.sy+self.sh/2;
        //https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
        var dist =
          abs((y2-y1)*x0 - (x2-x1)*y0 + x2*y1 - y2*x1) /
          sqrt(pow((y2-y1),2) + pow((x2-x1),2));
        if(dist > 10) return;
        else self.dragging = true;
      }

      self.drag(evt);
    }
    self.drag = function(evt)
    {
      if(self.dragging)
      {
        if(self.nx < self.sx)
        {
          self.nx = evt.doX-self.w/2;
          self.sx = evt.doX+self.w/2-self.sw;
        }
        else
        {
          self.sx = evt.doX-self.w/2;
          self.nx = evt.doX+self.w/2-self.nw;
        }
        if(self.ny < self.sy)
        {
          self.ny = evt.doY-self.h/2;
          self.sy = evt.doY+self.h/2-self.sh;
        }
        else
        {
          self.sy = evt.doY-self.h/2;
          self.ny = evt.doY+self.h/2-self.nh;
        }

        self.nfx = vfield.xScreenToFSpace(self.nx+self.nw/2);
        self.nfy = vfield.yScreenToFSpace(self.ny+self.nh/2);
        self.sfx = vfield.xScreenToFSpace(self.sx+self.sw/2);
        self.sfy = vfield.yScreenToFSpace(self.sy+self.sh/2);
      }
      else if(self.ndragging)
      {
        self.nx = evt.doX-self.nw/2;
        self.ny = evt.doY-self.nh/2;
        self.nfx = vfield.xScreenToFSpace(evt.doX);
        self.nfy = vfield.yScreenToFSpace(evt.doY);
      }
      else if(self.sdragging)
      {
        self.sx = evt.doX-self.sw/2;
        self.sy = evt.doY-self.sh/2;
        self.sfx = vfield.xScreenToFSpace(evt.doX);
        self.sfy = vfield.yScreenToFSpace(evt.doY);
      }
      else return;

      self.calcBB();
      self.default = false;
      self.dirty = true;
      hit_ui = true;
    }
    self.dragFinish = function()
    {
      self.dragging = false;
      self.ndragging = false;
      self.sdragging = false;
    }
  }

  var Compass = function(x,y)
  {
    var self = this;

    self.default_x = x;
    self.default_y = y;

    self.x = x;
    self.y = y;
    self.w = 2*compass_r;
    self.h = 2*compass_r;
    self.r = compass_r;

    self.fx = vfield.xScreenToFSpace(self.x+self.w/2);
    self.fy = vfield.yScreenToFSpace(self.y+self.h/2);

    self.dx = 0;
    self.dy = 0;
    self.dr = 0;
    self.d2 = 0;

    self.default = true;
    self.draggable = true;
    self.inert = false;

    self.tick = function()
    {
      popForceTuple(self.fx,self.fy,charges,magnets);
      self.dx = tuple.fx;
      self.dy = tuple.fy;
      self.dr = tuple.r;
      self.d2 = tuple.r2;
    }

    self.draw = function()
    {
      ctx.lineWidth = 2;
      ctx.drawImage(compass_img,self.x,self.y,self.w,self.h);
      if(self.inert || self.dragging || self.dr < 0.001)
      {
        ctx.save();
        ctx.translate(self.x+self.w/2,self.y+self.h/2);
        ctx.rotate(halfpi+pi);
        ctx.drawImage(needle_img,-self.w/2,-self.h/2,self.w,self.h);
        ctx.restore();
        return;
      }

      ctx.save();
      ctx.translate(self.x+self.w/2,self.y+self.h/2);
      ctx.rotate(Math.atan2(self.dy,self.dx));
      ctx.drawImage(needle_img,-self.w/2,-self.h/2,self.w,self.h);
      ctx.restore();
    }

    self.dirty = true;

    self.dragging = false;
    self.dragStart = function(evt)
    {
      if(!self.draggable || hit_ui || (self.default && ui_toggle)) return;
      self.dragging = true;
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      if(!self.dragging) return;
      self.x = evt.doX-self.w/2;
      self.y = evt.doY-self.h/2;
      self.fx = vfield.xScreenToFSpace(evt.doX);
      self.fy = vfield.yScreenToFSpace(evt.doY);
      self.inert = (evt.doX > vfield.x+vfield.w);
      self.default = false;
      self.dirty = true;
      hit_ui = true;
    }
    self.dragFinish = function()
    {
      if(self.inert)
      {
        self.x = self.default_x;
        self.y = self.default_y;
        self.default = true
      }
      self.dragging = false;
    }
  }

  var FieldView = function(x,y)
  {
    var self = this;

    self.default_x = x;
    self.default_y = y;

    self.x = x;
    self.y = y;
    self.w = fieldview_s;
    self.h = fieldview_s;

    self.screenToF = function()
    {
      self.fx = vfield.xScreenToFSpace(self.x+self.w/2);
      self.fy = vfield.yScreenToFSpace(self.y+self.h/2);
      self.fw = vfield.xScreenToFSpace(self.x+self.w*1.5)-self.fx;
      self.fh = vfield.xScreenToFSpace(self.y+self.h*1.5)-self.fy;
    }
    self.screenToF();

    self.default = true;
    self.colored = false;
    self.blurred = false;
    self.draggable = true;
    self.inert = true;
    self.vec_l = 2;

    self.draw = function()
    {
      ctx.lineWidth = 2;
      ctx.strokeRect(self.x,self.y,self.w,self.h);
      if(self.inert) return;
    }

    self.dirty = true;

    self.dragging = false;
    self.dragStart = function(evt)
    {
      if(!self.draggable || hit_ui || (self.default && ui_toggle)) return;
      self.dragging = true;
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      if(!self.dragging) return;
      self.x = evt.doX-self.w/2;
      self.y = evt.doY-self.h/2;
      self.fx = vfield.xScreenToFSpace(evt.doX);
      self.fy = vfield.yScreenToFSpace(evt.doY);
      self.inert = (evt.doX > vfield.x+vfield.w);
      self.default = false;
      self.dirty = true;
      hit_ui = true;
    }
    self.dragFinish = function()
    {
      if(self.inert)
      {
        self.x = self.default_x;
        self.y = self.default_y;
        self.default = true;
      }
      self.dragging = false;
    }
  }

  var Guess = function(x,y,v)
  {
    var self = this;

    self.default_x = x;
    self.default_y = y;

    self.x = x;
    self.y = y;
    self.w = guess_s;
    self.h = guess_s;

    self.fx = vfield.xScreenToFSpace(self.x+self.w/2);
    self.fy = vfield.yScreenToFSpace(self.y+self.h/2);
    self.v = v;

    self.default = true;
    self.inert = false;
    self.draggable = true;

    self.dirty = true;

    self.dragging = false;
    self.dragStart = function(evt)
    {
      if(!self.draggable || hit_ui || (self.default && !ui_toggle)) return;
      self.dragging = true;
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      if(!self.dragging) return;
      self.x = evt.doX-self.w/2;
      self.y = evt.doY-self.h/2;
      self.fx = vfield.xScreenToFSpace(evt.doX);
      self.fy = vfield.yScreenToFSpace(evt.doY);
      self.inert = (evt.doX > vfield.x+vfield.w);
      self.default = false;
      self.dirty = true;
      hit_ui = true;
    }
    self.dragFinish = function()
    {
      if(self.inert)
      {
        self.x = self.default_x;
        self.y = self.default_y;
        self.default = true;
      }
      self.dragging = false;
    }
  }

  var blurb_f = 20;
  var blurb_x = 0;
  var blurb_y = dc.height-300;
  var blurb_w = dc.width-sidebar_w;
  var blurb_h = 300;
  var displayMessage = function(lines)
  {
    input_state = INPUT_PAUSE;
    if(lines.length > 1) dom.popDismissableMessage(textToLines(dc, blurb_f+"px Open Sans", blurb_w-20, lines[0]),blurb_x+10,blurb_y,blurb_w-20,blurb_h,function(){lines.splice(0,1); displayMessage(lines)});
    else                 dom.popDismissableMessage(textToLines(dc, blurb_f+"px Open Sans", blurb_w-20, lines[0]),blurb_x+10,blurb_y,blurb_w-20,blurb_h,function(){input_state = INPUT_RESUME;});
  }

};

