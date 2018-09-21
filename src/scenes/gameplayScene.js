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

  ENUM = 0;
  var CHAR_BABY  = ENUM; ENUM++;
  var CHAR_ANNOY = ENUM; ENUM++;
  var CHAR_AXE   = ENUM; ENUM++;
  var CHAR_GIRL  = ENUM; ENUM++;
  var CHAR_TALL  = ENUM; ENUM++;
  var CHAR_BOY   = ENUM; ENUM++;
  var CHAR_DAD   = ENUM; ENUM++;

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
  var guess_s = 80;
  var btn_h = 53;
  var title_h = 10;

  var hit_ui;
  var end_screen;
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
  var menu_btn;
  var modal_retry_btn;
  var modal_menu_btn;
  var message_bg_disp;
  var char_disp;
  var earth;

  var cur_tut;
  var cur_subtut;
  var tuts;
  var tutchar;
  var tutstate;
  var tutstart;
  var tutdo;
  var tutdraw;
  var tutests;

  var junks;
  var bigjunks;

  //logging variables
  var mySlog;
  
  var dragStartTime;
  var dragEndTime;
  var numToolsUsed = 0;
  var dragLocation = {x:null, y:null};
  var numPoleDrags = 0;
  var guessScore = {northDist:null, southDist:null};
  var numCompasses = 0;
  var ironFilingsUsed = false;
  var magnetFilmUsed = false;
  var levelStartTime;
  var levelEndTime;
  var numLevels = 0;
  var numDrags = 0;

  //log functions
  var log_drag_tool = function(type, time, loc, num)
  {
    var log_data =
    {
      level:game_mode,
      event:"CUSTOM",
      event_custom:1,
      event_data_complex:{
        event_custom:"DRAG_TOOL",
        toolType:type,
        dragTime:time,
        location:loc,
        toolNum:num
      }
    };
    
    log_data.event_data_complex = JSON.stringify(log_data.event_data_complex);
    mySlog.log(log_data);
    //console.log(log_data);
  }

  var log_drag_pole = function(pole, time, loc, num, dist, numTools)
  {
    var log_data =
    {
      level:game_mode,
      event:"CUSTOM",
      event_custom:2,
      event_data_complex:{
        event_custom:"DRAG_POLE",
        poleType:pole,
        dragTime:time,
        location:loc,
        numTimesMoved:num,
        distToPole:dist,
        numToolsUsed:numTools
      }
    };
    
    log_data.event_data_complex = JSON.stringify(log_data.event_data_complex);
    mySlog.log(log_data);
    //console.log(log_data);
  }

  var log_level_complete = function(score, numComp, filingsUsed, filmUsed, time, numlvls, numPoleMoves)
  {
    var log_data =
    {
      level:game_mode,
      event:"COMPLETE",
      event_data_complex:{
        guessScore:score,
        numCompasses:numComp,
        ironFilingsUsed:filingsUsed,
        magneticFilmUsed:filmUsed,
        levelTime:time,
        numLevels:numlvls,
        numTimesPolesMoved:numPoleMoves
      }
    };
    
    log_data.event_data_complex = JSON.stringify(log_data.event_data_complex);
    mySlog.log(log_data);
    //console.log(log_data);
  }

  var log_playground_exit = function(time, numDrags)
  {
    var log_data =
    {
      level:game_mode,
      event:"CUSTOM",
      event_custom:3,
      event_data_complex:{
        event_custom:"PLAYGROUND_EXIT",
        timeSpent:time,
        numThingsDragged:numDrags
      }
    };
    
    log_data.event_data_complex = JSON.stringify(log_data.event_data_complex);
    mySlog.log(log_data);
    //console.log(log_data);
  }

  var log_tutorial_exit = function(time)
  {
    var log_data =
    {
      level:game_mode,
      event:"CUSTOM",
      event_custom:4,
      event_data_complex:{
        event_custom:"TUTORIAL_EXIT",
        timeSpent:time,
      }
    };
    
    log_data.event_data_complex = JSON.stringify(log_data.event_data_complex);
    mySlog.log(log_data);
    //console.log(log_data);
  }

  self.ready = function()
  {
    n_ticks = 0;
    levelStartTime = new Date().getTime();
    switch(game.start)
    {
      case 0: game_mode = GAME_TUT; break;
      case 1: game_mode = GAME_PLAYGROUND; break;
      case 2: game_mode = GAME_FIND; break;
    }

    dragger = new Dragger({source:stage.dispCanv.canvas});
    clicker = new Clicker({source:stage.dispCanv.canvas});
    mySlog = new slog("MAGNET", 1);

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
    film = new FieldView(dc.width-sidebar_w+sidebar_xb+(sidebar_w-sidebar_xb)/2-fieldview_s/2,506);
    film.colored = true;
    film.vec_l = 1;
    dragger.register(film);

    nguess = new Guess(dc.width-sidebar_w+p,btn_h+title_h+60+p);
    dragger.register(nguess);
    sguess = new Guess(dc.width-p-guess_s,btn_h+title_h+60+p);
    dragger.register(sguess);

    ui_toggle = false;
    guess_placed = false;
    tools_toggle_btn = new ButtonBox(dc.width-sidebar_w+sidebar_xb                         ,sidebar_yb,(sidebar_w-sidebar_xb)/2,btn_h-sidebar_yb,function(evt){ui_toggle = false;});
    guess_toggle_btn = new ButtonBox(dc.width-sidebar_w+sidebar_xb+(sidebar_w-sidebar_xb)/2,sidebar_yb,(sidebar_w-sidebar_xb)/2,btn_h-sidebar_yb,function(evt){if(game_mode != GAME_FIND) return; ui_toggle = true;});
    guess_btn        = new ButtonBox(dc.width-sidebar_w+2*p,btn_h+title_h+20+p+guess_s+p,sidebar_w-4*p,btn_h*2/3,
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
        var cm = guess_d*22;
        var stats = "You were "+fdisp(guess_n_d*22)+"cm away from the north pole, and "+fdisp(guess_s_d*22)+"cm away from the south pole. Your total score is "+fdisp(cm)+"cm.";
        var stars = 1;
        if (cm <= 15) stars++; // 2 stars
        if (cm <= 11) stars++; // 3 stars
        if (cm <=  4) stars++; // 4 stars
        if (cm <=  1) stars++; // 5 stars
        if(stars >= 3) stats = 'Nice guess! ' + stats;
        displayMessage([stats,"END_SCREEN",stars]);
        ga('send', 'event', 'magnetism_level', 'complete', 1, stars);
        magnets[0].draggable = true;

        numLevels++;
        levelEndTime = new Date().getTime();
        guessScore.northDist = guess_n_d*22;
        guessScore.southDist = guess_s_d*22;
        log_level_complete(guessScore, numCompasses, filings.placed, film.placed, (levelEndTime - levelStartTime) / 1000, numLevels, numPoleDrags);
        numToolsUsed = 0;
        numPoleDrags = 0;
        numCompasses = 0;

        game_mode = GAME_PLAYGROUND;
      }
    );
    menu_btn = new ButtonBox(10,10,100,30,function(evt){ 
      levelEndTime = new Date().getTime();
      if (game_mode == GAME_TUT) {
        log_tutorial_exit((levelEndTime - levelStartTime) / 1000);
      } else if (game_mode == GAME_PLAYGROUND) {
        log_playground_exit((levelEndTime - levelStartTime) / 1000, numDrags);
      }
      numDrags = 0;
      game.setScene(3);
    });
    modal_menu_btn = new ButtonBox(500,475,160,40,function(evt){if(!end_screen) return; game.setScene(3);});
    modal_retry_btn = new ButtonBox(220,475,160,40,function(evt){if(!end_screen) return; if(!guess_placed) return; game.setScene(4);});
    clicker.register(tools_toggle_btn);
    clicker.register(guess_toggle_btn);
    clicker.register(guess_btn);
    clicker.register(menu_btn);
    clicker.register(modal_menu_btn);
    clicker.register(modal_retry_btn);
    earth = 0;
    message_bg_disp = 0;
    char_disp = [];
    for(var i = 0; i < char_imgs.length; i++)
      char_disp[i] = 0;

    clicker.register(fallback);
    hit_ui = false;
    end_screen = false;

    input_state = INPUT_RESUME;
    guess_n_d = 0;
    guess_s_d = 0;

    cur_tut = 0;
    cur_subtut = 0;
    var i = 0;
    tuts = [];
    tutchar = [];
    tutstate = [];
    tutstart = [];
    tutdo = [];
    tutdraw = [];
    tutests = [];

    tuts[i] = [];
    tutchar[i] = [];
    tutstate[i] = {};
    tutstart[i] = noop;
    tutdo[i] = noop;
    tutdraw[i] = noop;
    tutests[i] = tfunc;
    i++;

    tuts[i] = [
      "We gotta find those magnets, before Mr. Hart flips out!",
      "Yeah... I could use a break from digging my pit.",
      "Oh, and guess what! You're gonna love this. Mr. Hart gave me his magnet detector kit!",
      "Yes!! Magnet detector kit!!!",
      "Wait... what's a magnet detector kit?",
      "It's a bunch of tools that can help us find the magnets Max and Honey buried.",
      "Luckily, Honey helped us figure out her map... sort of...",
      "Awesome!",
      "So what are all those black things all over the dirt?",
      "That's our first tool!",
      "Um... a bunch of little black flecks? How's that gonna help?",
      "Haha man... wait 'til you see this. Try moving the magnet around a little.",
    ];
    tutchar[i] = [
      CHAR_BOY,
      CHAR_AXE,
      CHAR_BOY,
      CHAR_AXE,
      CHAR_AXE,
      CHAR_BOY,
      CHAR_BOY,
      CHAR_AXE,
      CHAR_AXE,
      CHAR_BOY,
      CHAR_AXE,
      CHAR_BOY,
    ];
    tutstate[i] = {mag_nx:0,mag_ny:0,mag_sx:0,mag_sy:0,};
    tutstart[i] = function()
    {
      tutstate[cur_tut].mag_nx = magnets[0].nx;
      tutstate[cur_tut].mag_ny = magnets[0].ny;
      tutstate[cur_tut].mag_sx = magnets[0].sx;
      tutstate[cur_tut].mag_sy = magnets[0].sy;
    };
    tutdo[i] = noop;
    tutdraw[i] = function(){
      if (input_state != INPUT_RESUME) return;
      ctx.fillStyle = 'white';
      ctx.fillRect((dc.width - sidebar_w - 300) / 2, dc.height - 55, 300, 40);
      ctx.font = "18px Open Sans";
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.fillText('Try moving the magnet!', (dc.width - sidebar_w) / 2, dc.height - 30);
    };
    tutests[i] = function() {
      var m = magnets[0];
      var r =
        !m.dragging && !m.ndragging && !m.sdragging &&
        (
          tutstate[cur_tut].mag_nx != m.nx ||
          tutstate[cur_tut].mag_ny != m.ny ||
          tutstate[cur_tut].mag_sx != m.sx ||
          tutstate[cur_tut].mag_sy != m.sy
        );
      return r;
    };
    i++;

    tuts[i] = [
      "WHOA! What just happened?",
      "Those black flecks are actually iron filings.",
      "They line up with the magnetic field around the magnet!",
      "That's awesome!",
      "Yeah, it's pretty sweet. Magnetic fields are invisible...",
      "But the iron filings let us see exactly what the magnetic field looks like!",
      "Wow... seeing invisible stuff? That's like superhero-level coolness.",
      "Why do the filings look like they're pointing at the tips of the magnet?",
      "Magnetic fields loop from one end of the magnet to another.",
      "So it kinda looks like the filings are pointing at the poles, but that's just cuz they line up with the magnetic field.",
      "Poles? What are poles??",
      "The poles are where the magnetic field is strongest- the ends of the magnet.",
      "Cool!!",
      "Iron filings, check. Do we get any other superhero tools??",
      "Totally! There's a whole bunch of compasses.",
    ];
    tutchar[i] = [
      CHAR_AXE,
      CHAR_BOY,
      CHAR_BOY,
      CHAR_AXE,
      CHAR_BOY,
      CHAR_BOY,
      CHAR_AXE,
      CHAR_AXE,
      CHAR_BOY,
      CHAR_BOY,
      CHAR_AXE,
      CHAR_BOY,
      CHAR_AXE,
      CHAR_AXE,
      CHAR_BOY,
    ];
    tutstate[i] = {};
    tutstart[i] = noop;
    tutdo[i] = noop;
    tutdraw[i] = noop;
    tutests[i] = tfunc;
    i++;

    tuts[i] = [
      "Let's look at the south pole of the magnet and I'll show ya how they work.",
      "Can you grab a compass for me?",
      "Sure!",
      ];
    tutchar[i] = [
      CHAR_BOY,
      CHAR_BOY,
      CHAR_AXE,
    ];
    tutstate[i] = {};
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
    tutests[i] = function() {
      for(var i = 0; i < compasses.length; i++)
      {
        if(!compasses[i].dragging && !compasses[i].default) return true;
      }
      return false;
    };
    i++;

    tuts[i] = [
      "So, a compass is just a tiny magnet that's allowed to spin freely.",
      "A compass is a magnet?? Does that mean the compass has poles, too?",
      "Yeah, it does!",
      "The north pole is red, and the south pole is blue.",
      "Take a look. Which pole of the compass is pointing at our magnet?",
      "Hmm... the red side, so that means... the north pole!",
      "Right!",
      "How does the compass decide which way to point?",
      "Basically, magnets are good sports. They always follow a few simple rules and they never cheat.",
      "Rule 1: North attracts south, and south attracts north.",
      "Attract? What's that mean?",
      "It means they move as close to each other as they can. Mr. Hart called it \"opposites attract\".",
      "And rule 2: North repels north, and south repels south.",
      "Repels? What's that?",
      "North and north really don't like each other and push each other away.",
      "Same thing with south and south.",
      "Wow... I didn't know poles had archenemies!",
      ];
    tutchar[i] = [
      CHAR_BOY,
      CHAR_AXE,
      CHAR_BOY,
      CHAR_BOY,
      CHAR_BOY,
      CHAR_AXE,
      CHAR_BOY,
      CHAR_AXE,
      CHAR_BOY,
      CHAR_BOY,
      CHAR_AXE,
      CHAR_BOY,
      CHAR_BOY,
      CHAR_AXE,
      CHAR_BOY,
      CHAR_BOY,
      CHAR_AXE,
    ]
    tutstate[i] = {};
    tutstart[i] = function() {
      var c;
      c = compasses[0];
      c.fx = 0.1;
      c.fy = -0.1;
      c.orientFromField();
      c.inert = false;
      c.default = false;
      c.draggable = false;
      for(var i = 1; i < compasses.length; i++)
      {
        c = compasses[i];
        c.x = c.default_x;
        c.y = c.default_y;
        c.inert = true;
        c.default = true;
      }
    };
    tutdo[i] = noop;
    tutdraw[i] = noop;
    tutests[i] = tfunc;
    i++;

    tuts[i] = [
      "So what happens if I put the compass up here?",
    ];
    tutchar[i] = [
      CHAR_AXE,
    ]
    tutstate[i] = {};
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

    tuts[i] = [
      "Oh man... the compass's north pole got as FAR AWAY as it could from the magnet's north pole!",
      "They really do hate each other.",
      "But wait... now the compass's north pole is pointing AWAY from the magnet's south pole.",
      "I thought north and south were supposed to attract! What gives?",
      "That's why there's a third rule.",
      "Rule 3: The farther away, the weaker the effect.",
      "The north pole of the compass is super close to the magnet's north pole.",
      "So it wants to get AWAY from north even more.",
      "Ohhhh... I get it!",
    ];
    tutchar[i] = [
      CHAR_AXE,
      CHAR_AXE,
      CHAR_AXE,
      CHAR_AXE,
      CHAR_BOY,
      CHAR_BOY,
      CHAR_BOY,
      CHAR_BOY,
      CHAR_AXE,
    ]
    tutstate[i] = {};
    tutstart[i] = function(){
      compasses[0].inert = false;
      compasses[0].dirty = true;
    };
    tutdo[i] = noop;
    tutdraw[i] = noop;
    tutests[i] = tfunc;
    i++;

    tuts[i] = [
      "So what happens if I put the compass right here?",
      ];
    tutchar[i] = [
      CHAR_AXE,
    ]
    tutstate[i] = {};
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

    tuts[i] = [
      "The compass just follows the magnetic field- it doesn't point at north or south.",
      "It's right in the middle, so it can't decide!",
      "See how the iron filings and the compass line up?",
      "That's because they both just depend on the magnet's poles",
      "Wow, those poles ARE pretty strong.",
      "Can we practice now??",
      "Sure! Drag around some compasses to see how they work.",
      "Ok, so what's our last superpower??",
      "It looks like... a green square thingy?",
      "Haha, good try. That's magnetic film!",
      "Drag it out onto the yard and see what happens.",
    ];
    tutchar[i] = [
      CHAR_BOY,
      CHAR_BOY,
      CHAR_BOY,
      CHAR_BOY,
      CHAR_AXE,
      CHAR_AXE,
      CHAR_BOY,
      CHAR_AXE,
      CHAR_AXE,
      CHAR_BOY,
      CHAR_BOY,
    ];
    tutstate[i] = {};
    tutstart[i] = function(){
      compasses[0].inert = false;
      compasses[0].dirty = true;
    };
    tutdo[i] = noop;
    tutdraw[i] = noop;
    tutests[i] = function() { return !film.dragging && !film.inert; }
    i++;

    tuts[i] = [
      "The film shows the magnetic field. It changes color as we get closer to the magnet!",
      "Yes!! We can use the iron filings, the compasses, and the magnetic film to find BURIED TREASURE!!!",
      "Wait, buried treasure?",
      "Oh... um, I mean, Mr. Hart's magnets. Why, what'd I say?",
      "Never mind...",
    ];
    tutchar[i] = [
      CHAR_BOY,
      CHAR_AXE,
      CHAR_BOY,
      CHAR_AXE,
      CHAR_BOY,
    ];
    tutstate[i] = {};
    tutstart[i] = noop;
    tutdo[i] = noop;
    tutdraw[i] = noop;
    tutests[i] = tfunc;
    i++;

    tuts[i] = [];
    tutchar[i] = [];
    tutstate[i] = {};
    tutstart[i] = function(){
      compasses[0].draggable = true;
      magnets[0].draggable = true;
    };
    tutdo[i] = noop;
    tutdraw[i] = noop;
    tutests[i] = ffunc;
    i++;

    if(game_mode == GAME_PLAYGROUND)
      displayMessage([
        "Time to practice our superpowers!",
        "Play around with the tools and see how they act around the magnetic field.",
        "You can move the magnet, too!",
      ]);
    if(game_mode == GAME_FIND)
      displayMessage([
        "Honey said there was a magnet somewhere around here!",
        "You can place each tool somewhere in the dirt. Then guess where you think the magnet is!",
        ]);

    var h = dc.height;
    var w = dc.width-sidebar_w;
    junks = [];
    for(var i = 0; i < 5; i++)
    {
      var t = Math.random()*twopi;
      junks[i] = {
        id:randIntBelow(5),
        x:w/2 + cos(t)*(w/2)+rand0()*100-15,
        y:h/2 + sin(t)*(h/2)+rand0()*100-15,
      };
    }
    bigjunks = [];
    for(var i = 0; i < 2; i++)
    {
      var t = Math.random()*twopi;
      bigjunks[i] = {
        id:i,
        x:w/2 + cos(t)*(w/2)+rand0()*100-50,
        y:h/2 + sin(t)*(h/2)+rand0()*100-50,
      };
    }

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
        cur_subtut = 0;
        tutstart[cur_tut]();
        if(cur_tut == tuts.length-1) ga('send', 'event', 'magnetism_level', 'complete', 0, 0);
        if(tuts[cur_tut] && tuts[cur_tut].length) displayMessage(tuts[cur_tut]);
      }
    }

    if(input_state == INPUT_PAUSE)
    {
      message_bg_disp = lerp(message_bg_disp,1,0.2);
      for(var i = 0; i < char_disp.length; i++)
      {
        if(
          (tutchar[cur_tut][cur_subtut] == undefined && i == CHAR_BOY) ||
          i == tutchar[cur_tut][cur_subtut]
          )
          char_disp[i] = lerp(char_disp[i],1,0.2);
        else
          char_disp[i] = lerp(char_disp[i],0,0.2);
      }
    }
    else
    {
      message_bg_disp = lerp(message_bg_disp,0,0.2);
      for(var i = 0; i < char_disp.length; i++)
        char_disp[i] = lerp(char_disp[i],0,0.2);
    }

    hit_ui = false;
  };

  self.draw = function()
  {
    ctx.drawImage(bg_0_img,0,0,dc.width,dc.height);
    ctx.drawImage(bg_1_img,0,0,dc.width,dc.height);
    ctx.drawImage(bg_2_img,0,0,dc.width,dc.height);

    var s;
    s = 50;
    //for(var i = 0; i < junks.length; i++)
      //ctx.drawImage(junk_imgs[junks[i].id],junks[i].x-s/2,junks[i].y-s/2,s,s);
    s = 200;
    for(var i = 0; i < bigjunks.length; i++)
      ctx.drawImage(junk_big_imgs[bigjunks[i].id],bigjunks[i].x-s/2,bigjunks[i].y-s/2,s,s);

    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#90764A";
    ctx.lineWidth = 1;
    ctx.lineWidth = 1;
    if(!ui_toggle) ctx.drawImage(sidebar_tools_img,dc.width-sidebar_w,0,sidebar_w,dc.height);
    else           ctx.drawImage(sidebar_guess_img,dc.width-sidebar_w,0,sidebar_w,dc.height);

    var btn_overlap = 15;
    if(!ui_toggle) ctx.drawImage(tools_lbl_img,dc.width-sidebar_w+sidebar_xb,sidebar_yb,sidebar_w-sidebar_xb,btn_h);
    else           ctx.drawImage(guess_lbl_img,dc.width-sidebar_w+sidebar_xb,sidebar_yb,sidebar_w-sidebar_xb,btn_h);

    if(!guess_placed && ui_toggle)
    {
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "12px Open Sans";
      if(nguess.default && sguess.default)                                            { ctx.fillText("Place Your Guesses..." ,guess_btn.x+10,guess_btn.y+guess_btn.h+20); ctx.globalAlpha = 0.5; }
      else if(nguess.default || nguess.dragging || sguess.default || sguess.dragging) { ctx.fillText("Place Both Guesses..." ,guess_btn.x+10,guess_btn.y+guess_btn.h+20); ctx.globalAlpha = 0.5; }
      else                                                                            { ctx.fillText("Click to Confirm Guess",guess_btn.x+10,guess_btn.y+guess_btn.h+20); ctx.globalAlpha = 1; }
      ctx.drawImage(guess_btn_img,guess_btn.x,guess_btn.y,guess_btn.w,guess_btn.h);
      ctx.globalAlpha = 1;
    }

    //charges
    for(var i = 0; i < charges.length; i++)
      ctx.fillRect(charges[i].x,charges[i].y,charges[i].w,charges[i].h);
    //magnets
    for(var i = 0; i < magnets.length; i++)
      if(game_mode == GAME_PLAYGROUND || game_mode == GAME_TUT || guess_placed) magnets[i].draw();
    //compasses
    ctx.font = "18px Open Sans";
    ctx.textAlign = "center";
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

    var s = 300;
    var grad = ctx.createLinearGradient(
      0,dc.height+10+s-message_bg_disp*s,
      0,dc.height+10-message_bg_disp*s
    );
    grad.addColorStop(0,"rgba(99,228,248,1)");
    grad.addColorStop(1,"rgba(99,228,248,0)");
    ctx.fillStyle=grad;
    ctx.fillRect(0, dc.height+10-message_bg_disp*s, dc.width-sidebar_w+5, s);
    for(var i = 0; i < char_imgs.length; i++)
      ctx.drawImage(char_imgs[i], 20, dc.height+10-char_disp[i]*200, 200, 200*(710/396));

    if(input_state == INPUT_PAUSE)
    {
      ctx.fillStyle = "#FFFFFF";
      dc.fillRoundRect(blurb_x-5,blurb_y-5,blurb_w+10,100+10,10);
      ctx.beginPath();
      ctx.moveTo(blurb_x+1 ,blurb_y+30);
      ctx.lineTo(blurb_x-15,blurb_y+50);
      ctx.lineTo(blurb_x+1 ,blurb_y+50);
      ctx.fill();
      ctx.fillStyle = "#000000";
    }
    dom.draw(blurb_f,dc);
    ctx.fillStyle = "#FFFFFF";
    dc.fillRoundRect(menu_btn.x+10,menu_btn.y,menu_btn.w-20,menu_btn.h,15);
    ctx.fillStyle = "#000000";
    ctx.fillText("MENU",menu_btn.x+20,menu_btn.y+menu_btn.h-8);

    if(game_mode == GAME_TUT)
    {
      tutdraw[cur_tut]();
    }

    if (end_screen) {
      var w = 520;
      var h = 300;
      var img_w = 340;
      var img_h = img_w * 858 / 924;

      ctx.fillStyle = "rgba(50,100,255,0.4)";
      ctx.fillRect(0, 0, dc.width, dc.height);
      ctx.fillStyle = "white";
      ctx.fillRect((dc.width - w) / 2, (dc.height - h) / 2 + 70, w, h);
      ctx.drawImage(nice_job_img, (dc.width - img_w) / 2, 25, img_w, img_h);

      ctx.textAlign = "center";
      ctx.font = "25px Open Sans";
      ctx.fillStyle = "black";
      ctx.fillText("Nice guess!", dc.width / 2, 380);
      ctx.font = "20px Open Sans";
      // end_screen is a number 1 through 5
      ctx.drawImage(end_screen >= 1 ? star_filled_img : star_empty_img, dc.width / 2 - 100 - 13, 408, 26, 26);
      ctx.drawImage(end_screen >= 2 ? star_filled_img : star_empty_img, dc.width / 2 -  50 - 13, 408, 26, 26);
      ctx.drawImage(end_screen >= 3 ? star_filled_img : star_empty_img, dc.width / 2       - 13, 408, 26, 26);
      ctx.drawImage(end_screen >= 4 ? star_filled_img : star_empty_img, dc.width / 2 +  50 - 13, 408, 26, 26);
      ctx.drawImage(end_screen >= 5 ? star_filled_img : star_empty_img, dc.width / 2 + 100 - 13, 408, 26, 26);

      ctx.fillStyle = "rgb(86,160,171)";
      ctx.fillRect(modal_menu_btn.x, modal_menu_btn.y + 7, modal_menu_btn.w, modal_menu_btn.h);
      ctx.fillRect(modal_retry_btn.x, modal_retry_btn.y + 7, modal_retry_btn.w, modal_retry_btn.h);
      ctx.fillStyle = "rgb(140,216,226)";
      ctx.fillRect(modal_menu_btn.x, modal_menu_btn.y, modal_menu_btn.w, modal_menu_btn.h);
      ctx.fillRect(modal_retry_btn.x, modal_retry_btn.y, modal_retry_btn.w, modal_retry_btn.h);

      ctx.fillStyle = "white";
      ctx.fillText("Play Again!", modal_retry_btn.x + modal_retry_btn.w / 2, modal_retry_btn.y + 28);
      ctx.fillText("Back to Menu", modal_menu_btn.x + modal_menu_btn.w / 2, modal_menu_btn.y + 28);
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
      numDrags++;
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
      dragStartTime = new Date().getTime();
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
        if(game_mode == GAME_FIND && !self.placed) {
          numToolsUsed++;
          numCompasses++;
          numDrags++;
          dragEndTime = new Date().getTime();
          dragLocation.x = self.x;
          dragLocation.y = self.y;
          log_drag_tool("COMPASS", (dragEndTime - dragStartTime) / 1000, dragLocation, numToolsUsed);
        } else {
          numDrags++;
        }
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
      dragStartTime = new Date().getTime();
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
        if(game_mode == GAME_FIND && !self.placed) {
          numToolsUsed++;
          dragEndTime = new Date().getTime();
          dragLocation.x = self.x;
          dragLocation.y = self.y;
          if (self === filings) {
            log_drag_tool("IRON_FILINGS", (dragEndTime - dragStartTime) / 1000, dragLocation, numToolsUsed);
          } else if (self === film) {
            log_drag_tool("MAGNETIC_FILM", (dragEndTime - dragStartTime) / 1000, dragLocation, numToolsUsed);
          }
        } else {
          numDrags++;
        }
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
      dragStartTime = new Date().getTime();
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
      } else {
        if(game_mode == GAME_FIND && ui_toggle) {
          numPoleDrags++;
          dragEndTime = new Date().getTime();
          dragLocation.x = self.x;
          dragLocation.y = self.y;
          var xd;
          var yd;
          var dist;
          if (self === nguess) {
            xd = magnets[0].nfx-nguess.fx;
            yd = magnets[0].nfy-nguess.fy;
            dist = sqrt(xd*xd + yd*yd);
            log_drag_pole("POLE_NORTH", (dragEndTime - dragStartTime) / 1000, dragLocation, numPoleDrags, dist, numToolsUsed);
          } else if (self === sguess) {
            xd = magnets[0].sfx-sguess.fx;
            yd = magnets[0].sfy-sguess.fy;
            dist = sqrt(xd*xd + yd*yd);
            log_drag_pole("POLE_SOUTH", (dragEndTime - dragStartTime) / 1000, dragLocation, numPoleDrags, dist, numToolsUsed);
          }
        } else {
          numDrags++;
        }
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

    if(placed) {
      displayMessage(["Now that you've placed all your tools, make your guess where the magnet is!"]);
      ui_toggle = true;
    }
  }

  var blurb_f = 20;
  var blurb_x = 190;
  var blurb_h = 120;
  var blurb_y = dc.height-blurb_h;
  var blurb_w = dc.width-sidebar_w-blurb_x-20;
  var displayMessage = function(lines)
  {
    if (lines[cur_subtut] === 'END_SCREEN') {
      end_screen = lines[cur_subtut+1];
      input_state = INPUT_RESUME;
      return;
    }

    input_state = INPUT_PAUSE;
    if(cur_subtut < lines.length-1)
      dom.popDismissableMessage(textToLines(dc, blurb_f+"px Open Sans", blurb_w-20, lines[cur_subtut]),blurb_x+10,blurb_y,blurb_w-20,blurb_h,function(){ cur_subtut++; displayMessage(lines); });
    else
      dom.popDismissableMessage(textToLines(dc, blurb_f+"px Open Sans", blurb_w-20, lines[cur_subtut]),blurb_x+10,blurb_y,blurb_w-20,blurb_h,function(){ cur_subtut = 0; input_state = INPUT_RESUME; });
  }

};

