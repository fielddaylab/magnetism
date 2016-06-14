var GamePlayScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;
  var canvas = dc.canvas;
  var ctx = dc.context;

  var ENUM;
  ENUM = 0;
  var INPUT_RESUME = ENUM; ENUM++;
  var INPUT_PAUSE  = ENUM; ENUM++;
  var input_state;

  ENUM = 0;
  var GAME_TUT        = ENUM; ENUM++;
  var GAME_PLAYGROUND = ENUM; ENUM++;
  var GAME_FIND       = ENUM; ENUM++;
  var game_mode;

  var n_ticks;

  var sidebar_w = 210;
  var sidebar_xb = 10;
  var sidebar_yb = 6;
  var res = 50;
  var res_w = 1*res;
  var res_h = 1*res;
  var earth_strength = 3;
  //jshax
  var tuple = {fx:0,fy:0,r:0,r2:0}; //global var to return from funcs without allocs #hax
  var compass_r = 30;
  var fieldview_s = 150;
  var charge_s = 20;
  var guess_s = 100;
  var btn_h = 60;
  var title_h = 10;

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
  var guess_n_d;
  var guess_s_d;
  var guess_d;
  var tools_toggle_btn;
  var guess_toggle_btn;
  var guess_btn;
  var retry_btn;
  var menu_btn;
  var message_bg_disp;
  var earth;

  var cur_tut;
  var tuts;
  var tutstart;
  var tutdo;
  var tutdraw;
  var tutests;

  self.ready = function()
  {
    n_ticks = 0;
    switch(game.start)
    {
      case 0: game_mode = GAME_TUT; break;
      case 1: game_mode = GAME_PLAYGROUND; break;
      case 2: game_mode = GAME_FIND; break;
    }

    dragger = new Dragger({source:stage.dispCanv.canvas});
    clicker = new Clicker({source:stage.dispCanv.canvas});

    dom = new CanvDom(dc);
    fallback = {x:0,y:0,w:dc.width,h:dc.height,click:function(evt){if(!hit_ui)dom.click(evt);}};

    vfield = new VecField(0,0,dc.width-sidebar_w,dc.height,res_w,res_h,0.05);
    ifvfield = new VecField(0,0,dc.width-sidebar_w,dc.height,res_w*3,res_h*3,0.02);
    hdvfield = new VecField(0,0,dc.width-sidebar_w,dc.height,res_w*4,res_h*4,0.01);
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
      m.draggable = (game_mode == GAME_PLAYGROUND || game_mode == GAME_TUT);
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
        c = new Compass(space(dc.width-sidebar_w+sidebar_xb,dc.width,compass_r*2,2,i),space(sidebar_yb+btn_h+title_h,270,compass_r*2,3,j));
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
    filings = new FieldView(dc.width-sidebar_w+sidebar_xb+(sidebar_w-sidebar_xb)/2-fieldview_s/2,310);
    filings.blurred = true;
    filings.vec_l = 5;
    dragger.register(filings);
    film = new FieldView(dc.width-sidebar_w+sidebar_xb+(sidebar_w-sidebar_xb)/2-fieldview_s/2,515);
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
    guess_btn        = new ButtonBox(dc.width-sidebar_w+p,btn_h+title_h+p+guess_s+p,sidebar_w-2*p,btn_h,
      function(evt)
      {
        if(!ui_toggle || hit_ui) return;
        if(nguess.default || sguess.default) return;
        guess_placed = true;
        var xd;
        var yd;
        xd = magnets[0].nfx-nguess.fx;
        yd = magnets[0].nfy-nguess.fy;
        guess_n_d = sqrt(xd*xd + yd*yd);
        xd = magnets[0].sfx-sguess.fx;
        yd = magnets[0].sfy-sguess.fy;
        guess_s_d = sqrt(xd*xd + yd*yd);
        guess_d = guess_n_d+guess_s_d;
        hit_ui = true;
        var comment;
        var stats;
        if(guess_d < 0.5) comment = "Nice Guess!";
        else              comment = "Let's see how you did:";
        stats = "You were "+fdisp(guess_n_d)+" away from the north pole, and "+fdisp(guess_s_d)+" away from the south pole. Your total score is "+fdisp(guess_d)+".";
        displayMessage([comment,stats,"Ok. Bye!"]);
        magnets[0].draggable = true;
        game_mode = GAME_PLAYGROUND;
      }
    );
    menu_btn = new ButtonBox(20,20,100,20,function(evt){game.setScene(2);});
    retry_btn = new ButtonBox(140,20,100,20,function(evt){if(!guess_placed) return; game.setScene(3);});
    clicker.register(tools_toggle_btn);
    clicker.register(guess_toggle_btn);
    clicker.register(guess_btn);
    clicker.register(menu_btn);
    clicker.register(retry_btn);
    earth = 0;
    message_bg_disp = 0;

    clicker.register(fallback);
    hit_ui = false;

    input_state = INPUT_RESUME;
    guess_n_d = 0;
    guess_s_d = 0;

    cur_tut = 0;
    var i = 0;
    tuts = [];
    tutstart = [];
    tutdo = [];
    tutdraw = [];
    tutests = [];

    tuts[i] = [];
    tutstart[i] = noop;
    tutdo[i] = noop;
    tutdraw[i] = noop;
    tutests[i] = tfunc;
    i++;

    tuts[i] = ["Hey!","I'm going to tell you about magnets.","See those black flakes on the table? Those are just small flakes of iron.","They'll always point toward the end of a magnet (if the magnet is close enough).","Why do they point toward the ends, and not the middle?","Well, the ends of a magnet is where its Poles are located- and it's also where the magnetic effect can be felt the strongest.","What are poles, then?","Well, to keep things simple, let's start by focusing on just the SOUTH end of the magnet..."];
    tutstart[i] = noop;
    tutdo[i] = noop;
    tutdraw[i] = noop;
    tutests[i] = tfunc;
    i++;

    tuts[i] = ["Now lets bring in a compass to test some things..."];
    tutstart[i] = function() {
      magnets[0].nfx = -100;
      magnets[0].nfy = -100;
      magnets[0].sfx = 0;
      magnets[0].sfy = 0;
      magnets[0].draggable = false;
      magnets[0].orientFromField();
    };
    tutdo[i] = noop;
    tutdraw[i] = noop;
    tutests[i] = tfunc;
    i++;

    tuts[i] = ["See how the compass also points toward the magnet's pole?","Well, *one* end of the compass points to the pole...","A compass is really just a little magnet that's able to rotate without resistance (sometimes it floats in water, or is hung on a string...)","This means it has two poles (North and South), just like every other magnet!","So, which pole is pointing toward the big magnet's South pole?","The answer is the compass' North pole (compasses often have a red needle to represent its north pole, and a white one to represent its south pole).","So, how does the compass decide which needle to point toward which pole?","There are a couple rules that magnets follow:","Rule 1: North attracts South, South attracts North (or, Opposites Attract)","Rule 2: North repels North, South repels South (or, Likes Repel)","Since the part of the magnet on the table is a South pole, it attracts the compass' North pole","Cool- so the North needle of the compass will point toward the South pole of another magnet","Now, let's mix things up."];
    tutstart[i] = function() {
      compasses[0].fx = 0.1;
      compasses[0].fy = -0.1;
      compasses[0].orientFromField();
      compasses[0].inert = false;
      compasses[0].default = false;
      compasses[0].draggable = false;
    };
    tutdo[i] = noop;
    tutdraw[i] = noop;
    tutests[i] = tfunc;
    i++;

    tuts[i] = ["Which direction would you expect the compass to point if it were placed where it is currently displayed?"];
    tutstart[i] = function(){
      magnets[0].nfx = -0.2;
      magnets[0].nfy = -0.2;
      magnets[0].sfx = 0.2;
      magnets[0].sfy = 0.2;
      magnets[0].orientFromField();

      compasses[0].fx = -0.3;
      compasses[0].fy = -0.3;
      compasses[0].orientFromField();
      compasses[0].inert = true;
    };
    tutdo[i] = noop;
    tutdraw[i] = noop;
    tutests[i] = tfunc;
    i++;

    tuts[i] = ["Hmmm... this is interesting.","The compass' North pole is pointing AWAY from the magnet's South pole!","But, it's also pointing away from the magnet's North pole...","So if it's supposed to point TOWARD South, and AWAY from North, but those are different directions... which way will it point?","This brings us to our final rule:","Rule 3: A magnet affects its surroundings inversely proportional to its distance- (or, the further away, the weaker the effect)","So the North pole of the compass does still want to point toward South,","but since it is closer to the North end of the magnet, it wants to point away from North even more! (Even if this means also pointing away from South!)","Ok. Let's do one more test."];
    tutstart[i] = function(){
      compasses[0].inert = false;
      compasses[0].dirty = true;
    };
    tutdo[i] = noop;
    tutdraw[i] = noop;
    tutests[i] = tfunc;
    i++;

    tuts[i] = ["Which direction would you expect the compass to point if it were placed where it is currently displayed?"];
    tutstart[i] = function(){
      compasses[0].fx = 0.2;
      compasses[0].fy = -0.2;
      compasses[0].orientFromField();
      compasses[0].inert = true;
    };
    tutdo[i] = noop;
    tutdraw[i] = noop;
    tutests[i] = tfunc;
    i++;

    tuts[i] = ["Its pointing parallel to the magnet!","Because the needle just as close to the North pole of the magnet as it is to the South pole,","It equally wants to point TOWARD South and AWAY from North!", "This illustrates an interesting relationship between compasses and iron filings...","If you pay close attention, the Compass will always point in the same direction as the iron filings!","It will just be pointing toward or away from the magnet depending on which poles are where!","Now, feel free to drag around some compasses to get a feel for how they interact with magnets.","Then, go find my magnets!"];
    tutstart[i] = function(){
      compasses[0].inert = false;
      compasses[0].dirty = true;
    };
    tutdo[i] = noop;
    tutdraw[i] = noop;
    tutests[i] = tfunc;
    i++;

    tuts[i] = [];
    tutstart[i] = function(){
      compasses[0].draggable = true;
      magnets[0].draggable = true;
    };
    tutdo[i] = noop;
    tutdraw[i] = noop;
    tutests[i] = ffunc;
    i++;

    if(game_mode == GAME_PLAYGROUND)
      displayMessage(["This is a playground.","Play around with the tools to see how they behave in the presence of a magnetic field."]);
    if(game_mode == GAME_FIND)
      displayMessage(["Find The Magnet!","You can place each tool somewhere on the dirt.","When ready, place a guess where you think the magnet is!"]);
  };

  self.tick = function()
  {
    n_ticks++;

    var dirty = false;
    clicker.flush();
    if(dragger)
    {
      if(input_state == INPUT_PAUSE) dragger.ignore();
      else dragger.flush();
    }
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
    if(game_mode == GAME_PLAYGROUND || game_mode == GAME_TUT) { if(fullview.dirty || dirty) vfield.tick(fullview,charges,magnets); fullview.dirty = false; }
    for(var i = 0; i < compasses.length; i++)
    {
      if(compasses[i].dirty || dirty) compasses[i].tick();
      compasses[i].dirty = false;
    }

    if(game_mode == GAME_TUT)
    {
      tutdo[cur_tut]();
      if(input_state == INPUT_RESUME && tutests[cur_tut]())
      {
        cur_tut = (cur_tut+1)%tuts.length;
        tutstart[cur_tut]();
        if(tuts[cur_tut] && tuts[cur_tut].length) displayMessage(tuts[cur_tut]);
      }
    }

    if(input_state == INPUT_PAUSE) message_bg_disp = lerp(message_bg_disp,1,0.1);
    else                           message_bg_disp = lerp(message_bg_disp,0,0.1);

    hit_ui = false;
  };

  self.draw = function()
  {
    //sidebar
    ctx.fillStyle = "#F2C87C";
    ctx.fillRect(0,0,dc.width,dc.height);

    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#90764A";
    ctx.lineWidth = 1;
    ctx.lineWidth = 1;
    if(!ui_toggle) ctx.drawImage(sidebar_tools_img,dc.width-sidebar_w,0,sidebar_w,dc.height);
    else           ctx.drawImage(sidebar_guess_img,dc.width-sidebar_w,0,sidebar_w,dc.height);

    var btn_overlap = 15;
    if(!ui_toggle) ctx.drawImage(tools_btn_img,dc.width-sidebar_w+sidebar_xb,sidebar_yb,sidebar_w-sidebar_xb,btn_h);
    else           ctx.drawImage(guess_btn_img,dc.width-sidebar_w+sidebar_xb,sidebar_yb,sidebar_w-sidebar_xb,btn_h);

    if(!guess_placed && ui_toggle)
    {
      guess_btn.draw(dc);
      ctx.fillStyle = "#000000";
      if(nguess.default && sguess.default) ctx.fillText("Place Your Guesses...",guess_btn.x+10,guess_btn.y+guess_btn.h-10);
      else if(nguess.default || nguess.dragging || sguess.default || sguess.dragging) ctx.fillText("Place Both Guesses...",guess_btn.x+10,guess_btn.y+guess_btn.h-10);
      else ctx.fillText("Click to Confirm Guess",guess_btn.x+10,guess_btn.y+guess_btn.h-10);
    }

    //charges
    for(var i = 0; i < charges.length; i++)
      ctx.fillRect(charges[i].x,charges[i].y,charges[i].w,charges[i].h);
    //magnets
    for(var i = 0; i < magnets.length; i++)
      if(game_mode == GAME_PLAYGROUND || game_mode == GAME_TUT || guess_placed) magnets[i].draw();
    //compasses
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "18px Open Sans";
    ctx.textAlign = "center";
    if(ui_toggle) ctx.fillText("GUESSES",dc.width-sidebar_w/2,btn_h+30);
    ctx.fillStyle = "#000000";

    if(game_mode == GAME_PLAYGROUND || game_mode == GAME_TUT) vfield.draw(fullview);
    //film
    if(!ui_toggle) ctx.drawImage(mag_film_dot_img,film.default_x,film.default_y,film.w,film.h);
    if((!ui_toggle && film.default) || (!film.default && (game_mode == GAME_PLAYGROUND || game_mode == GAME_TUT || !film.dragging))) ctx.drawImage(mag_film_img,film.x,film.y,film.w,film.h);
    if(game_mode == GAME_FIND && film.dragging) ctx.drawImage(mag_film_drop_img,film.x,film.y,film.w,film.h);
    if(game_mode == GAME_PLAYGROUND || game_mode == GAME_TUT || !film.dragging) hdvfield.draw(film);
    //filings
    if(!ui_toggle) ctx.drawImage(iron_filings_dot_img,filings.default_x,filings.default_y,filings.w,filings.h);
    if(!ui_toggle && filings.default) ctx.drawImage(iron_filings_img,filings.x,filings.y,filings.w,filings.h);
    if(filings.dragging) ctx.drawImage(iron_filings_drop_img,filings.x,filings.y,filings.w,filings.h);
    if(game_mode == GAME_PLAYGROUND || game_mode == GAME_TUT || !filings.dragging) ifvfield.draw(filings);
    //compasses
    for(var i = 0; i < compasses.length; i++)
    {
      if(!ui_toggle) ctx.drawImage(compass_dot_img,compasses[i].default_x,compasses[i].default_y,compasses[i].w,compasses[i].h);
      if((!ui_toggle && compasses[i].default) || (!compasses[i].default && (game_mode == GAME_PLAYGROUND || game_mode == GAME_TUT || !compasses[i].dragging))) compasses[i].draw(game_mode == GAME_FIND && compasses[i].dragging);
      if(game_mode == GAME_FIND && compasses[i].dragging) ctx.drawImage(compass_drop_img,compasses[i].x,compasses[i].y,compasses[i].w,compasses[i].h);
    }
    //guesses
    if(ui_toggle || !nguess.default) ctx.drawImage(guess_n_img,nguess.x,nguess.y,nguess.w,nguess.h);
    if(ui_toggle || !sguess.default) ctx.drawImage(guess_s_img,sguess.x,sguess.y,sguess.w,sguess.h);
    if(guess_n_d != 0 && guess_s_d != 0)
    {
      ctx.strokeStyle = "#FF0000";
      dc.drawLine(magnets[0].nx+magnets[0].nw/2,magnets[0].ny+magnets[0].nh/2,nguess.x+nguess.w/2,nguess.y+nguess.h/2);
      dc.drawLine(magnets[0].sx+magnets[0].sw/2,magnets[0].sy+magnets[0].sh/2,sguess.x+sguess.w/2,sguess.y+sguess.h/2);
    }

    ctx.font = blurb_f+"px Open Sans";

    var grad = ctx.createLinearGradient(
      0,dc.height+10+200-message_bg_disp*200,
      0,dc.height+10-message_bg_disp*200
    );
    grad.addColorStop(0,"rgba(0,0,0,1)");
    grad.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=grad;
    ctx.fillRect(0, dc.height+10-message_bg_disp*200, dc.width-sidebar_w, 200);
    ctx.drawImage(tall_img, 50, dc.height+10-message_bg_disp*200, 80, 200);

    ctx.fillStyle = "#FFFFFF";
    dom.draw(blurb_f,dc);

    menu_btn.draw(dc); ctx.fillStyle = "#000000"; ctx.fillText("Menu",menu_btn.x+10,menu_btn.y+menu_btn.h-10);
    if(guess_placed) { retry_btn.draw(dc); ctx.fillStyle = "#000000"; ctx.fillText("Retry",retry_btn.x+10,retry_btn.y+retry_btn.h-10); }

    if(game_mode == GAME_TUT)
    {
      tutdraw[cur_tut]();
    }
  };

  self.cleanup = function()
  {
    dragger.detach(); dragger = undefined;
    clicker.detach(); clicker = undefined;
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

  var VecField = function(x,y,w,h,dw,dh,o)
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
    self.ox = []; for(var i = 0; i < self.dw*self.dh; i++) self.ox[i] = rand0()*o; //offset to fix moire patterns
    self.oy = []; for(var i = 0; i < self.dw*self.dh; i++) self.oy[i] = rand0()*o; //offset to fix moire patterns
    self.dr = []; for(var i = 0; i < self.dw*self.dh; i++) self.dr[i] = 0;
    self.d2 = []; for(var i = 0; i < self.dw*self.dh; i++) self.d2[i] = 0;
    self.iFor = function(dx,dy) { return (dy*dw)+dx; }
    //sample window is 1x1 grid aspect fit into w/h
    self.xIndexToFSpace = function(i) { return (((i+0.5)/self.dw)-0.5)*self.xtransform; }
    self.yIndexToFSpace = function(i) { return (((i+0.5)/self.dh)-0.5)*self.ytransform; }
    self.xScreenToFSpace = function(x) { return (((x-self.x)/self.w)-0.5)*self.xtransform; };
    self.yScreenToFSpace = function(y) { return (((y-self.y)/self.h)-0.5)*self.ytransform; };
    self.wFSpaceToScreen = function(w) { return w*self.w/self.xtransform; };
    self.hFSpaceToScreen = function(h) { return h*self.h/self.ytransform; };
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
    var d;

    self.tick = function(view,charges,magnets)
    {
      var index;

      for(var i = 0; i < self.dh; i++)
      {
        for(var j = 0; j < self.dw; j++)
        {
          index = self.iFor(j,i);
          fy = self.yIndexToFSpace(i)+self.oy[index];
          fx = self.xIndexToFSpace(j)+self.ox[index];

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
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#000000";

      for(var i = 0; i < self.dh; i++)
      {
        for(var j = 0; j < self.dw; j++)
        {
          index = self.iFor(j,i);

          y = self.y + y_space*i+(y_space/2) + self.hFSpaceToScreen(self.oy[index]);
          x = self.x + x_space*j+(x_space/2) + self.wFSpaceToScreen(self.ox[index]);

          if(
              x < view.x        ||
              x > view.x+view.w ||
              y < view.y        ||
              y > view.y+view.h
            )
            continue;

          if(view.colored)
          {
            d = self.dr[index];
                 if(d > 10) ctx.strokeStyle = "#FF0000";
            else if(d >  9) ctx.strokeStyle = "#BB4400";
            else if(d >  8) ctx.strokeStyle = "#888800";
            else if(d >  7) ctx.strokeStyle = "#44BB00";
            else if(d >  6) ctx.strokeStyle = "#00FF00";
            else if(d >  5) ctx.strokeStyle = "#00BB44";
            else if(d >  4) ctx.strokeStyle = "#008888";
            else if(d >  3) ctx.strokeStyle = "#0044BB";
            else if(d >  2) ctx.strokeStyle = "#0000FF";
            else if(d >  1) ctx.strokeStyle = "#4400BB";
            else             ctx.strokeStyle = "#880088";
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

    self.orientFromField = function()
    {
      self.nx = vfield.xFSpaceToScreen(self.nfx)-self.nw/2;
      self.ny = vfield.yFSpaceToScreen(self.nfy)-self.nh/2;
      self.sx = vfield.xFSpaceToScreen(self.sfx)-self.sw/2;
      self.sy = vfield.yFSpaceToScreen(self.sfy)-self.sh/2;
      self.calcBB();
      self.dirty = true;
    }

    self.draggable = true;
    self.inert = false;
    self.default = true;

    self.draw = function()
    {
      ctx.save();
      ctx.translate(self.x+self.w/2,self.y+self.h/2);
      ctx.rotate(Math.atan2(self.nfy-self.sfy,self.nfx-self.sfx)+Math.PI);
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

    self.orientFromField = function()
    {
      self.x = vfield.xFSpaceToScreen(self.fx)-self.w/2;
      self.y = vfield.yFSpaceToScreen(self.fy)-self.h/2;
      self.dirty = true;
    }

    self.default = true;
    self.draggable = true;
    self.inert = false;
    self.placed = false;

    self.tick = function()
    {
      popForceTuple(self.fx,self.fy,charges,magnets);
      self.dx = tuple.fx;
      self.dy = tuple.fy;
      self.dr = tuple.r;
      self.d2 = tuple.r2;
    }

    self.draw = function(dead)
    {
      ctx.lineWidth = 2;
      ctx.drawImage(compass_img,self.x,self.y,self.w,self.h);
      if(self.inert || dead || self.dr < 0.001)
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
      if(game_mode == GAME_FIND && self.placed) return;
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
      else if(self.dragging)
      {
        self.placed = true;
        checkAllPlaced();
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
    self.placed = false;
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
      if(game_mode == GAME_FIND && self.placed) return;
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
      else if(self.dragging)
      {
        self.placed = true;
        checkAllPlaced();
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

  var checkAllPlaced = function()
  {
    if(game_mode != GAME_FIND) return;

    var placed = film.placed && filings.placed;
    for(var i = 0; i < compasses.length && placed; i++)
      placed = compasses[i].placed;

    if(placed) displayMessage(["Now that you've placed all your tools, go to the \"Guess\" tab, and place a guess!"]);
  }

  var blurb_f = 20;
  var blurb_x = 160;
  var blurb_h = 150;
  var blurb_y = dc.height-blurb_h;
  var blurb_w = dc.width-sidebar_w-blurb_x;
  var displayMessage = function(lines)
  {
    input_state = INPUT_PAUSE;
    if(lines.length > 1) dom.popDismissableMessage(textToLines(dc, blurb_f+"px Open Sans", blurb_w-20, lines[0]),blurb_x+10,blurb_y,blurb_w-20,blurb_h,function(){ lines.splice(0,1); displayMessage(lines); });
    else                 dom.popDismissableMessage(textToLines(dc, blurb_f+"px Open Sans", blurb_w-20, lines[0]),blurb_x+10,blurb_y,blurb_w-20,blurb_h,function(){ input_state = INPUT_RESUME; });
  }

};

