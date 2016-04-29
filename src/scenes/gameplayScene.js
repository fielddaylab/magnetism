var GamePlayScene = function(game, stage)
{
  var self = this;

  var canv = stage.drawCanv;
  var canvas = canv.canvas;
  var ctx = canv.context;

  var ENUM;

  ENUM = 0;
  var IGNORE_INPUT = ENUM; ENUM++;
  var RESUME_INPUT = ENUM; ENUM++;
  var input_state;

  ENUM = 0;
  var EXPOSITION_MODE = ENUM; ENUM++;
  var FIND_MODE       = ENUM; ENUM++;
  var mode;

  var dragger;
  var clicker;
  var domclicker;
  var dom;
  var bmwrangler;

  var cur_dragging;
  var cur_selected;

  var res = 60;
  var w = 2*res;
  var h = 1*res;

  var vfield;
  var charges;
  var mags;
  var nonmags;

  var hidden_mag;
  var guessed_pos;
  var guessed_neg;
  var wind;
  var comps;

  var new_pos_btn;
  var new_neg_btn;
  var new_magnet_btn;
  var phys_btn;
  var del_btn;
  var ready_btn; var ready_btn_clicked;

  var steps;
  var cur_step;
  var place_dead_compass_step;
  var first_guess_step;
  var place_dead_window_step;
  var second_guess_step;
  var reveal_step;

  self.ready = function()
  {
    input_state = RESUME_INPUT;
    mode = FIND_MODE;

    dragger = new Dragger({source:stage.dispCanv.canvas});
    clicker = new Clicker({source:stage.dispCanv.canvas});
    domclicker = new Clicker({source:stage.dispCanv.canvas});
    dom = new CanvDom(canv);
    bmwrangler = new BottomMessageWrangler();

    vfield = new VecField(0,0,canv.width,canv.height,w,h)
    charges = [];
    nonmags = [];
    mags = [];

    hidden_mag = genMagnet(
      -2,rand0()/2,rand0()/2,
       2,rand0()/2,rand0()/2
    );
    wind = new Window(30,30,200,200);
    comps = [];
    for(var i = 0; i < 5; i++)
    {
      comps[comps.length] = new Compass(0,0,30,vfield);
    }
    var nullNegCharge = new Charge(0,0,-1);
    var nullPosCharge = new Charge(0,0,1);
    guessed_neg = new Handle(nullNegCharge,vfield);
    guessed_neg.dragStart = function(evt)
    {
      if(
        cur_dragging ||
        (
          cur_step != first_guess_step &&
          cur_step != second_guess_step
        )
      )
        return;
      guessed_neg.dragging = true;
      guessed_neg.drag(evt);
    }
    guessed_pos = new Handle(nullPosCharge,vfield);
    guessed_pos.dragStart = function(evt)
    {
      if(
        cur_dragging ||
        (
          cur_step != first_guess_step &&
          cur_step != second_guess_step
        )
      )
        return;
      guessed_pos.dragging = true;
      guessed_pos.drag(evt);
    }

    new_pos_btn    = new ButtonBox(10, 10,20,20,function(){ if(mode != EXPOSITION_MODE) return; genHandle(rand0()/2.,rand0()/2., 1); });
    new_neg_btn    = new ButtonBox(10, 40,20,20,function(){ if(mode != EXPOSITION_MODE) return; genHandle(rand0()/2.,rand0()/2.,-1); });
    new_magnet_btn = new ButtonBox(10, 70,20,20,function(){ if(mode != EXPOSITION_MODE) return; genMagnet(-1,rand0()/2,rand0()/2,1,rand0()/2,rand0()/2); });
    phys_btn       = new ButtonBox(10,100,20,20,function(){ if(mode != EXPOSITION_MODE) return; if(cur_selected) cur_selected.physics = !cur_selected.physics; });
    del_btn        = new ButtonBox(10,130,20,20,function(){ if(mode != EXPOSITION_MODE) return; delMagnet(cur_selected); delHandle(cur_selected); });
    ready_btn      = new ButtonBox(10,160,20,20,function(){ ready_btn_clicked = true; });

    dragger.register(wind);
    for(var i = 0; i < comps.length; i++)
      dragger.register(comps[i]);
    dragger.register(guessed_neg);
    dragger.register(guessed_pos);

    clicker.register(new_pos_btn);
    clicker.register(new_neg_btn);
    clicker.register(new_magnet_btn);
    clicker.register(phys_btn);
    clicker.register(del_btn);
    clicker.register(ready_btn);

    //STEPS
    steps = [];


    //FIND
    steps.push(new Step(
      function(){
        //set up game
          //compasses
        for(var i = 0; i < comps.length; i++)
        {
          comps[i].fx = lerp(-0.5,0.5,i/(comps.length-1));
          comps[i].fy = -0.2;
          comps[i].x = vfield.xFSpaceToScreen(comps[i].fx)-comps[i].w/2;
          comps[i].y = vfield.yFSpaceToScreen(comps[i].fy)-comps[i].h/2;
        }

          //guessed
        guessed_pos.charge.x = -0.1;
        guessed_pos.charge.y = -0.2;
        guessed_pos.x = vfield.xFSpaceToScreen(guessed_pos.charge.x)-guessed_pos.w/2;
        guessed_pos.y = vfield.yFSpaceToScreen(guessed_pos.charge.y)-guessed_pos.h/2;

        guessed_neg.charge.x =  0.1;
        guessed_neg.charge.y = -0.2;
        guessed_neg.x = vfield.xFSpaceToScreen(guessed_neg.charge.x)-guessed_neg.w/2;
        guessed_neg.y = vfield.yFSpaceToScreen(guessed_neg.charge.y)-guessed_neg.h/2;

        //window
        wind.x = 20;
        wind.y = 20;

        //magnet
        if(hidden_mag)
        {
          delMagnet(hidden_mag.n);
          hidden_mag = genMagnet(
            -2,rand0()/2,rand0()/2,
             2,rand0()/2,rand0()/2
          );
        }

        pop([
        "Find The Magnet!",
        "Your first step is to place these <b>compasses</b> around the <b>magnetic field</b>.",
        "(Just place them all around- <b>don't worry if you don't understand what's going on right now</b>- you'll figure it out after a couple plays!)",
        "Click \"ready\" when you're satisfied with their placements.",
        ]);
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    place_dead_compass_step = steps.length;
    steps.push(new Step(
      noop,
      noop,
      noop,
      function() { return ready_btn_clicked; }
    ));
    steps.push(new Step(
      function(){
        pop([
        "Now that we're showing <b>where the compasses point</b>,",
        "place a guess <b>where you think the positive terminal of the magnet is located</b>,",
        "and <b>where you think the negative terminal of the magnet is located</b>.",
        "Click \"ready\" when you're satisfied with your guess.",
        ]);
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    first_guess_step = steps.length;
    steps.push(new Step(
      noop,
      noop,
      noop,
      function() { return ready_btn_clicked; }
    ));
    steps.push(new Step(
      function(){
        pop([
        "Now we'll give you a <b>window to visualize the magnetic field</b>.",
        "Place it where you think it will best help you <b>find the location of the magnet</b>.",
        "Click \"ready\" when you're satisfied with your placement.",
        ]);
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    place_dead_window_step = steps.length;
    steps.push(new Step(
      noop,
      noop,
      noop,
      function() { return ready_btn_clicked; }
    ));
    steps.push(new Step(
      function(){
        pop([
        "Now that you can see <b>a window into the magnetic field</b>,",
        "<b>update your guesses</b> of <b>where the positive and negative magnetic terminals are located</b>.",
        "Click \"ready\" when you're satisfied with your guess.",
        ]);
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    second_guess_step = steps.length;
    steps.push(new Step(
      noop,
      noop,
      noop,
      function() { return ready_btn_clicked; }
    ));
    steps.push(new Step(
      function(){
        pop([
        "Good guesses!",
        "Click \"ready\" to play again!",
        ]);
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    reveal_step = steps.length;
    steps.push(new Step(
      noop,
      noop,
      noop,
      function() {
        if(ready_btn_clicked)
        {
          cur_step = -1;
          return true;
        }
        return false; }
    ));

    //EXPOSITION
    steps.push(new Step(
      function(){
        pop([
        "Hey there!",
        "This is a magnetic field.",
        "It doesn't look very interesting right now.",
        ]);
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      noop,
      noop,
      noop,
      function() { return ready_btn_clicked; }
    ));
    steps.push(new Step(
      function(){
        genHandle(-0.1,0,-1);
        pop([
        "This is an *electric charge*.",
        "Electric charges *invisibly* affect the area around them.",
        "(Here, this effect is visualized by *directional lines*.)",
        "Click and drag it around to see how its affect moves with the charge.",
        ]);
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      noop,
      noop,
      noop,
      function() { return ready_btn_clicked; }
    ));
    steps.push(new Step(
      function(){
        genHandle(0.1,0,1);
        pop([
        "Here's another *electric charge*, but this one's *different*",
        "The first charge is a *negative charge*, but this one is a *positive charge*.",
        "See how they affect the surrounding visualized lines when they are *near* each other, and when they are *far away*.",
        ]);
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      noop,
      noop,
      noop,
      function() { return ready_btn_clicked; }
    ));
    steps.push(new Step(
      function(){
        genHandle(0,0,-1);
        cur_selected.physics = true;
        pop([
        "Here's one more *charge* (this one's positive), but this one is allowed to float freely.",
        "See how it is *attracted* to one of the charges, but *repelled* by another?",
        ]);
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      noop,
      noop,
      noop,
      function() { return ready_btn_clicked; }
    ));
    steps.push(new Step(
      function(){
        genHandle(0,0,-1);
        cur_selected.physics = true;
        pop([
        "",
        ]);
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    steps.push(new Step(
      noop,
      noop,
      noop,
      function() { return ready_btn_clicked; }
    ));

    cur_step = -1;
    self.nextStep();

  };
  self.nextStep = function()
  {
    cur_step = (cur_step+1)%steps.length;
    steps[cur_step].begin();
  }

  var genHandle = function(x,y,charge_v)
  {
    var c = new Charge(x,y,charge_v);
    var h = new Handle(c,vfield)
    charges[charges.length] = h.charge;
    dragger.register(h);
    cur_selected = h.charge;
    nonmags[nonmags.length] = h;
    return h;
  }
  var delHandle = function(charge)
  {
    for(var i = 0; i < nonmags.length; i++)
    {
      if(charge == nonmags[i].charge)
      {
        dragger.unregister(nonmags[i]);
        delCharge(charge);
        nonmags.splice(i,1);
      }
    }
  }
  var genMagnet = function(n,nx,ny,s,sx,sy)
  {
    var m = new Magnet(n,nx,ny,s,sx,sy,vfield)
    charges[charges.length] = m.n;
    charges[charges.length] = m.s;
    dragger.register(m.nhandle);
    dragger.register(m.shandle);
    cur_selected = m.nhandle.charge;
    mags[mags.length] = m;
    return m;
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
    if(input_state == IGNORE_INPUT)
    {
      dragger.ignore();
      clicker.ignore();
    }
    else
    {
      dragger.flush();
      clicker.flush();
    }
    bmwrangler.tick();

    if(mode == EXPOSITION_MODE)
      vfield.tick();
    else if(mode == FIND_MODE)
      vfield.tick(wind);

    var charge;
    for(var i = 0; i < charges.length; i++)
    {
      charge = charges[i];
      if(charge.physics)
      {
        if(charge.dragging)
        {
          charge.xv = 0;
          charge.yv = 0;
        }
        else
        {
          //gravity
          charge.yv += 0.001;

          //magnetism
          var ocharge;
          var yd;
          var xd;
          var r2;
          var f;
          var mind = 0.08;
          for(var j = 0; j < charges.length; j++)
          {
            ocharge = charges[j];
            if(charge == ocharge) continue;
            yd = ocharge.y-charge.y;
            xd = ocharge.x-charge.x;
            r2 = (xd*xd)+(yd*yd);
            if(r2 == 0)
            {
              ocharge.x += mind/2;
              charge.x  -= mind/2;
            }
            else
            {
              f = ((ocharge.v*charge.v)/r2)/10000;
              r = sqrt(r2);
              yd /= r;
              xd /= r;
              charge.yv -= f*yd;
              charge.xv -= f*xd;

              //collision
              if(r < mind)
              {
                charge.y -= (mind-r)*yd;
                charge.x -= (mind-r)*xd;

                var a = (charge.xv*xd)+(charge.yv*yd);
                a *= 0.99;
                charge.xv -= a*xd;
                charge.yv -= a*yd;
                ocharge.xv += a*xd;
                ocharge.yv += a*yd;
              }
            }
          }

          //clamp
          charge.xv = clamp(-0.02,0.02,charge.xv);
          charge.yv = clamp(-0.02,0.02,charge.yv);

          //propagate
          charge.x += charge.xv;
          charge.y += charge.yv;

          //box in
          if(charge.x < -0.5) { charge.x = -0.5; if(charge.xv < 0) charge.xv *= -1; }
          if(charge.x >  0.5) { charge.x =  0.5; if(charge.xv > 0) charge.xv *= -1; }
          if(charge.y < -0.5) { charge.y = -0.5; if(charge.yv < 0) charge.yv *= -1; }
          if(charge.y >  0.5) { charge.y =  0.5; if(charge.yv > 0) charge.yv *= -1; }

          //dampen
          charge.xv *= 0.9;
          charge.yv *= 0.9;
        }
      }
    }

    var nonmag;
    for(var i = 0; i < nonmags.length; i++)
    {
      nonmag = nonmags[i];
      nonmag.x = vfield.xFSpaceToScreen(nonmag.charge.x)-nonmag.w/2;
      nonmag.y = vfield.yFSpaceToScreen(nonmag.charge.y)-nonmag.h/2;
    }

    var mag;
    for(var i = 0; i < mags.length; i++)
    {
      mag = mags[i];
      mag.tick();
      mag.nhandle.x = vfield.xFSpaceToScreen(mag.nhandle.charge.x)-mag.nhandle.w/2;
      mag.nhandle.y = vfield.yFSpaceToScreen(mag.nhandle.charge.y)-mag.nhandle.h/2;
      mag.shandle.x = vfield.xFSpaceToScreen(mag.shandle.charge.x)-mag.shandle.w/2;
      mag.shandle.y = vfield.yFSpaceToScreen(mag.shandle.charge.y)-mag.shandle.h/2;
    }

    for(var i = 0; i < comps.length; i++)
    {
      comps[i].tick();
    }

    steps[cur_step].tick();
    if(steps[cur_step].test()) self.nextStep();
    ready_btn_clicked = false;
  };

  self.draw = function()
  {
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";
    var mag;
    for(var i = 0; i < mags.length; i++)
    {
      mag = mags[i];
      if(cur_step < reveal_step-1 && mag == hidden_mag) continue;
      ctx.lineWidth = 20;
      ctx.beginPath();
      ctx.moveTo(mag.nhandle.x+mag.nhandle.w/2,mag.nhandle.y+mag.nhandle.h/2);
      ctx.lineTo(mag.shandle.x+mag.shandle.w/2,mag.shandle.y+mag.shandle.h/2);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.fillStyle = "#000000";
      if(mag.nhandle.charge == cur_selected)
        ctx.drawImage(HCircle,mag.nhandle.x,mag.nhandle.y,mag.nhandle.w,mag.nhandle.h);
      ctx.drawImage(Circle,mag.nhandle.x,mag.nhandle.y,mag.nhandle.w,mag.nhandle.h);
      ctx.fillText("+",mag.shandle.x+5,mag.shandle.y+mag.shandle.h-5);
      if(mag.shandle.charge == cur_selected)
        ctx.drawImage(HCircle,mag.shandle.x,mag.shandle.y,mag.shandle.w,mag.shandle.h);
      ctx.drawImage(Circle,mag.shandle.x,mag.shandle.y,mag.shandle.w,mag.shandle.h);
      ctx.fillText("-",mag.nhandle.x+5,mag.nhandle.y+mag.nhandle.h-5);
    }
    var nonmag;
    for(var i = 0; i < nonmags.length; i++)
    {
      nonmag = nonmags[i];
      if(nonmag.charge == cur_selected)
        ctx.drawImage(HCircle,nonmag.x,nonmag.y,nonmag.w,nonmag.h);
      ctx.drawImage(Circle,nonmag.x,nonmag.y,nonmag.w,nonmag.h);
      ctx.fillStyle = "#000000";
      if(nonmag.charge.v > 0) ctx.fillText("+",nonmag.x+5,nonmag.y+nonmag.h-5);
      if(nonmag.charge.v < 0) ctx.fillText("-",nonmag.x+5,nonmag.y+nonmag.h-5);
    }

    if(mode == EXPOSITION_MODE)
    {
      vfield.draw();
      new_pos_btn.draw(canv);    ctx.fillStyle = "#000000"; ctx.fillText("create charge (+)",new_pos_btn.x+5,new_pos_btn.y+new_pos_btn.h-5);
      new_neg_btn.draw(canv);    ctx.fillStyle = "#000000"; ctx.fillText("create charge (-)",new_neg_btn.x+5,new_neg_btn.y+new_neg_btn.h-5);
      new_magnet_btn.draw(canv); ctx.fillStyle = "#000000"; ctx.fillText("create magnet",new_magnet_btn.x+5,new_magnet_btn.y+new_magnet_btn.h-5);
      phys_btn.draw(canv);       ctx.fillStyle = "#000000"; ctx.fillText("toggle physics for currently selected",phys_btn.x+5,phys_btn.y+phys_btn.h-5);
      del_btn.draw(canv);        ctx.fillStyle = "#000000"; ctx.fillText("delete currently selected",del_btn.x+5,del_btn.y+del_btn.h-5);
    }
    else if(mode == FIND_MODE)
    {
      if(cur_step >= second_guess_step-1)
        vfield.draw(wind);
      if(cur_step >= place_dead_window_step-1)
      {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.strokeRect(wind.x,wind.y,wind.w,wind.h);
      }

      var comp;
      for(var i = 0; i < comps.length; i++)
      {
        comp = comps[i];
        ctx.drawImage(Circle,comps[i].x,comps[i].y,comps[i].w,comps[i].h);
        if(cur_step >= first_guess_step-1)
        {
          var r = (comp.dx*comp.dx)+(comp.dy*comp.dy);
          if(r > 0.001)
          {
            r = sqrt(r);
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 2;
            canv.drawLine(
              comp.x+comp.w/2,
              comp.y+comp.h/2,
              comp.x+comp.w/2+(comp.dx/r)*comp.r,
              comp.y+comp.h/2+(comp.dy/r)*comp.r
            );
          }
        }
      }

      if(cur_step >= first_guess_step-1)
      {
        ctx.fillStyle = "#000000";
        ctx.drawImage(Circle,guessed_pos.x,guessed_pos.y,guessed_pos.w,guessed_pos.h);
        ctx.fillText("+?",guessed_pos.x+5,guessed_pos.y+guessed_pos.h-5);

        ctx.drawImage(Circle,guessed_neg.x,guessed_neg.y,guessed_neg.w,guessed_neg.h);
        ctx.fillText("-?",guessed_neg.x+5,guessed_neg.y+guessed_neg.h-5);
      }

    }
    ready_btn.draw(canv); ctx.fillStyle = "#000000"; ctx.fillText("ready",ready_btn.x+5,ready_btn.y+ready_btn.h-5);

    steps[cur_step].draw();
  };

  self.cleanup = function()
  {
  };

  var pop = function(msg,callback) { if(!callback) callback = dismissed; input_state = IGNORE_INPUT; bmwrangler.popMessage(msg,callback); }
  var dismissed = function() { input_state = RESUME_INPUT; }

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

    self.tick = function(wind)
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

      var wx;
      var wx;
      var ww;
      var wh;

      if(wind)
      {
        wx = self.xScreenToFSpace(wind.x);
        wy = self.yScreenToFSpace(wind.y);
        ww = self.xScreenToFSpace(wind.x+wind.w)-wx;
        wh = self.yScreenToFSpace(wind.y+wind.h)-wy;
      }

      for(var i = 0; i < self.dh; i++)
      {
        y = self.yIndexToFSpace(i);
        for(var j = 0; j < self.dw; j++)
        {
          index = self.iFor(j,i);
          x = self.xIndexToFSpace(j);

          if(wind &&
              (
                x < wx    ||
                x > wx+ww ||
                y < wy    ||
                y > wy+wh
              )
            )
            continue;

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

    self.draw = function(wind)
    {
      ctx.lineWidth = 1;

      for(var i = 0; i < self.dh; i++)
      {
        for(var j = 0; j < self.dw; j++)
        {

          y = self.y + y_space*i+(y_space/2);
          x = self.x + x_space*j+(x_space/2);

          if(wind &&
              (
                x < wind.x ||
                x > wind.x+wind.w ||
                y < wind.y ||
                y > wind.y+wind.h
              )
            )
            continue;

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
          canv.drawLine(
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
    this.physics = false;
    this.xv = 0;
    this.yv = 0;
    this.v = v;
  }

  var Handle = function(charge,field)
  {
    var self = this;
    self.charge = charge;

    self.w = 20;
    self.h = 20;
    self.x = field.xFSpaceToScreen(charge.x)-self.w/2;
    self.y = field.yFSpaceToScreen(charge.y)-self.h/2;

    self.dragging = false;
    self.dragStart = function(evt)
    {
      if(!cur_dragging)
      {
        self.dragging = true;
        self.charge.dragging = true;
      }
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
      self.charge.dragging = false;
    }
  }
  var Magnet = function(n,nx,ny,s,sx,sy,field)
  {
    var self = this;
    var dx = nx-sx;
    var dy = ny-sy;
    var allowed_d = sqrt(dx*dx+dy*dy);
    self.n = new Charge(nx,ny,n);
    self.s = new Charge(sx,sy,s);

    self.nhandle = new Handle(self.n,field);
    self.shandle = new Handle(self.s,field);
    self.nhandle.magnet = self;
    self.nhandle.ocharge = self.s;
    self.nhandle.ohandle = self.shandle;
    self.shandle.magnet = self;
    self.shandle.ocharge = self.n;
    self.shandle.ohandle = self.nhandle;

    var master;
    var servant;
    self.tick = function() //just holds magnet together
    {
      master = self.nhandle;
      servant = self.shandle;
      if(self.shandle.charge == cur_selected)
      {
        master = self.shandle;
        servant = self.nhandle;
      }

      var dx = servant.charge.x-master.charge.x;
      var dy = servant.charge.y-master.charge.y;
      var d = sqrt(dx*dx+dy*dy);
      if(d == 0){ dx = 1; dy = 0; d = 1; }
      servant.charge.x = master.charge.x+((dx/d)*allowed_d);
      servant.charge.y = master.charge.y+((dy/d)*allowed_d);
    }
  }

  var Window = function(x,y,w,h)
  {
    var self = this;
    self.x = x;
    self.y = y;
    self.w = w;
    self.h = h;

    self.dragging = false;
    self.dragStart = function(evt)
    {
      if(
        cur_dragging ||
        (
          cur_step != place_dead_window_step &&
          cur_step != reveal_step
        )
      )
        return;
      self.dragging = true;
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      if(!self.dragging) return;
      cur_dragging = true;
      self.x = evt.doX-self.w/2;
      self.y = evt.doY-self.h/2;
    }
    self.dragFinish = function()
    {
      if(self.dragging) cur_dragging = false;
      self.dragging = false;
    }
  }
  var Compass = function(x,y,r,field)
  {
    var self = this;

    self.fx = x;
    self.fy = y;

    self.w = 2*r;
    self.h = 2*r;
    self.r = r;

    self.x = vfield.xFSpaceToScreen(self.fx)-self.w/2;
    self.y = vfield.yFSpaceToScreen(self.fy)-self.h/2;

    self.dx = 0;
    self.dy = 0;

    self.tick = function()
    {
      var index;
      var xd;
      var yd;
      var r2;
      var r;
      var f;

      self.dy = 0;
      self.dx = 0;
      for(var k = 0; k < charges.length; k++)
      {
        yd = self.fy-charges[k].y;
        xd = self.fx-charges[k].x;
        r2 = (xd*xd)+(yd*yd);
        if(r2 != 0)
        {
          f = charges[k].v/r2;
          r = sqrt(r2);
          self.dy += f*yd/r;
          self.dx += f*xd/r;
        }
      }
    }

    self.dragging = false;
    self.dragStart = function(evt)
    {
      if(
        cur_dragging ||
        (
          cur_step != place_dead_compass_step &&
          cur_step != reveal_step
        )
      )
        return;
      self.dragging = true;
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      if(!self.dragging) return;
      cur_dragging = true;
      self.x = evt.doX-self.w/2;
      self.y = evt.doY-self.h/2;
      self.fx = field.xScreenToFSpace(evt.doX);
      self.fy = field.yScreenToFSpace(evt.doY);
    }
    self.dragFinish = function()
    {
      if(self.dragging) cur_dragging = false;
      self.dragging = false;
    }
  }

  var Step = function(begin,tick,draw,test)
  {
    this.begin = begin;
    this.tick = tick;
    this.draw = draw;
    this.test = test;
  }

  var Circle = GenIcon(100,100);
  Circle.context.strokeStyle = "#000000";
  Circle.context.lineWidth = 5;
  Circle.context.beginPath();
  Circle.context.arc(Circle.width/2,Circle.height/2,Circle.width/2,0,2*Math.PI);
  Circle.context.stroke();

  var HCircle = GenIcon(100,100);
  HCircle.context.fillStyle = "#FFFF00";
  HCircle.context.beginPath();
  HCircle.context.arc(HCircle.width/2,HCircle.height/2,HCircle.width/2,0,2*Math.PI);
  HCircle.context.fill();

};

