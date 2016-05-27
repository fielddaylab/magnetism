var GamePlayScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;
  var canvas = dc.canvas;
  var ctx = dc.context;

  var bignum = 999999;
  var lilnum = -bignum;

  var ENUM;

  ENUM = 0;
  var IGNORE_INPUT = ENUM; ENUM++;
  var RESUME_INPUT = ENUM; ENUM++;
  var input_state;

  ENUM = 0;
  var REAL_MAGNET_MODE    = ENUM; ENUM++;
  var FIND_MAGNET_MODE    = ENUM; ENUM++;
  var TIME_MAGNET_MODE    = ENUM; ENUM++;
  var ORIENT_COMPASS_MODE = ENUM; ENUM++;
  var EXPOSITION_MODE     = ENUM; ENUM++;
  var PLAYGROUND_MODE     = ENUM; ENUM++;
  var mode;

  //UI
  var dragger;
  var clicker;
  var domclicker;
  var dom;
  var fallback_click;
    //ui state
  var cur_dragging; //the thing currently dragging
  var cur_selected; //the charge (or compass!) currently selected
  var hit_ui;

  //CONFIG
  var res = 30;
  var w = 2*res;
  var h = 1*res;
  var earth_strength = 3;

  //OBJECTS
  var vdvfield;
  var hdvfield;
  var sdvfield;
  var ldvfield;
  var vfield;
  var charges;
  var mags;
  var nonmags;
  var comps;
  var wind;
  var special_mag;
  var inert_mag;

  //STATE
  var earth;
  var closeness;
  var time;
  var orient;

  //BUTTONS
  var menu_btn;
  var vd_btn;
  var hd_btn;
  var sd_btn;
  var ld_btn;
  var new_pos_btn;
  var new_neg_btn;
  var new_magnet_btn;
  var new_compass_btn;
  var phys_btn;
  var del_btn;
  var earth_btn;
  var ready_btn; var ready_btn_clicked;

  //STEPS
  var steps;
  var cur_step;
    //real
  var real_begin_step;
    //find
  var find_begin_step;
  var find_place_dead_compass_step;
  var find_first_guess_step;
  var find_place_dead_window_step;
  var find_second_guess_step;
  var find_reveal_step;
    //time
  var time_begin_step;
  var time_first_guess_step;
  var time_second_guess_step;
  var time_reveal_step;
    //orient
  var orient_begin_step;
  var orient_first_guess_step;
  var orient_reveal_step;
    //playground
  var playground_step;
    //secret
  var secret_step;

  self.ready = function()
  {
    input_state = RESUME_INPUT;
    mode = REAL_MAGNET_MODE;

    dragger = new Dragger({source:stage.dispCanv.canvas});
    clicker = new Clicker({source:stage.dispCanv.canvas});
    domclicker = new Clicker({source:stage.dispCanv.canvas});
    dom = new CanvDom(dc);
    fallback_click = {x:0,y:0,w:dc.width,h:dc.height,click:function(evt){if(!hit_ui)dom.click(evt);}};
    domclicker.register(fallback_click);

    vdvfield = new VecField(0,0,dc.width,dc.height,w*4,h*4)
    hdvfield = new VecField(0,0,dc.width,dc.height,w*2,h*2)
    sdvfield = new VecField(0,0,dc.width,dc.height,w,h)
    ldvfield = new VecField(0,0,dc.width,dc.height,w/2,h/2)
    vfield = sdvfield;
    charges = [];
    nonmags = [];
    mags = [];

    wind = new Window(30,30,200,200);
    comps = [];

    menu_btn        = new ButtonBox(dc.width-30, 10,20,20,function(){ game.setScene(2); });
    vd_btn          = new ButtonBox(dc.width-30,130,20,20,function(){ vfield = vdvfield; });
    hd_btn          = new ButtonBox(dc.width-30, 40,20,20,function(){ vfield = hdvfield; });
    sd_btn          = new ButtonBox(dc.width-30, 70,20,20,function(){ vfield = sdvfield; });
    ld_btn          = new ButtonBox(dc.width-30,100,20,20,function(){ vfield = ldvfield; });
    new_pos_btn     = new ButtonBox(10, 10,20,20,function(){ if(mode != PLAYGROUND_MODE) return; genHandle(rand0()*0.8,rand0()/2*0.8, 1); });
    new_neg_btn     = new ButtonBox(10, 40,20,20,function(){ if(mode != PLAYGROUND_MODE) return; genHandle(rand0()*0.8,rand0()/2*0.8,-1); });
    new_magnet_btn  = new ButtonBox(10, 70,20,20,function(){ if(mode != PLAYGROUND_MODE) return; genMagnet(-1,rand0()*0.8,rand0()/2*0.8,1,rand0()*0.8,rand0()/2*0.8); });
    new_compass_btn = new ButtonBox(10,100,20,20,function(){ if(mode != PLAYGROUND_MODE) return; genComp(); });
    phys_btn        = new ButtonBox(10,130,20,20,function(){ if(mode != PLAYGROUND_MODE) return; if(cur_selected && !cur_selected.sdx) cur_selected.physics = !cur_selected.physics; });
    del_btn         = new ButtonBox(10,160,20,20,function(){ if(mode != PLAYGROUND_MODE) return; delMagnet(cur_selected); delHandle(cur_selected); delComp(cur_selected); });
    earth_btn       = new ButtonBox(10,190,20,20,function(){ if(mode != PLAYGROUND_MODE) return; earth = !earth; });
    ready_btn       = new ButtonBox(10,220,20,20,function(){ if(mode == PLAYGROUND_MODE) return; wind.dragFinish(); /* <- hack */ ready_btn_clicked = true; });

    dragger.register(wind);

    clicker.register(menu_btn);
    clicker.register(vd_btn);
    clicker.register(hd_btn);
    clicker.register(sd_btn);
    clicker.register(ld_btn);
    clicker.register(new_pos_btn);
    clicker.register(new_neg_btn);
    clicker.register(new_magnet_btn);
    clicker.register(new_compass_btn);
    clicker.register(phys_btn);
    clicker.register(del_btn);
    clicker.register(earth_btn);
    clicker.register(ready_btn);

    //STEPS
    steps = [];

    //REAL
    real_begin_step = steps.length;
    steps.push(new Step(
      function(){
        //set up game
        mode = REAL_MAGNET_MODE;
          //compasses
        for(var i = 0; i < 5; i++)
        {
          if(!comps[i]) genComp();
          comps[i].fx = lerp(-0.5,0.5,i/(5-1));
          comps[i].fy = -0.2;
          comps[i].x = vfield.xFSpaceToScreen(comps[i].fx)-comps[i].w/2;
          comps[i].y = vfield.yFSpaceToScreen(comps[i].fy)-comps[i].h/2;
        }
        //window
        wind.x = 60;
        wind.y = 20;
        //magnet
        genSpecialMagnet();
        genInertMagnet();
        if(!game.real_witnessed_instructs)
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

    //FIND
    find_begin_step = steps.length;
    steps.push(new Step(
      function(){
        //set up game
        mode = FIND_MAGNET_MODE;
          //compasses
        for(var i = 0; i < 5; i++)
        {
          if(!comps[i]) genComp();
          comps[i].fx = lerp(-0.5,0.5,i/(5-1));
          comps[i].fy = -0.2;
          comps[i].x = vfield.xFSpaceToScreen(comps[i].fx)-comps[i].w/2;
          comps[i].y = vfield.yFSpaceToScreen(comps[i].fy)-comps[i].h/2;
        }
        //window
        wind.x = 60;
        wind.y = 20;
        //magnet
        genSpecialMagnet();
        genInertMagnet();
        if(!game.find_witnessed_instructs)
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
    find_place_dead_compass_step = steps.length;
    steps.push(new Step(
      noop,
      noop,
      function() {
        ctx.fillStyle = "#000000";
        dc.outlineText("Place the compasses where you think they'll be most useful!",20,50);
        dc.outlineText("When ready, hit the \"ready\" button below.",20,70);
      },
      function() { return ready_btn_clicked; }
    ));
    steps.push(new Step(
      function(){
        if(!game.find_witnessed_instructs)
        pop([
        "Now that we're showing <b>where the compasses point</b>,",
        "place a guess <b>where you think the North terminal of the magnet is located</b>,",
        "and <b>where you think the South terminal of the magnet is located</b>.",
        "Click \"ready\" when you're satisfied with your guess.",
        ]);
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    find_first_guess_step = steps.length;
    steps.push(new Step(
      noop,
      noop,
      function() {
        ctx.fillStyle = "#000000";
        dc.outlineText("Drag the N and S guesses to the place you think",20,50);
        dc.outlineText("corresponds with the magnet's N and S terminals.",20,70);
        dc.outlineText("When ready, hit the \"ready\" button below.",20,90);
      },
      function() { return ready_btn_clicked; }
    ));
    steps.push(new Step(
      function(){
        if(!game.find_witnessed_instructs)
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
    find_place_dead_window_step = steps.length;
    steps.push(new Step(
      noop,
      noop,
      function() {
        ctx.fillStyle = "#000000";
        dc.outlineText("Drag the window to where you think it'll be most useful!",20,50);
        dc.outlineText("When ready, hit the \"ready\" button below.",20,70);
      },
      function() { return ready_btn_clicked; }
    ));
    steps.push(new Step(
      function(){
        if(!game.find_witnessed_instructs)
        pop([
        "Now that you can see <b>a window into the magnetic field</b>,",
        "<b>update your guesses</b> of <b>where the North and South magnetic terminals are located</b>.",
        "Click \"ready\" when you're satisfied with your guess.",
        ]);
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    find_second_guess_step = steps.length;
    steps.push(new Step(
      noop,
      noop,
      function() {
        ctx.fillStyle = "#000000";
        dc.outlineText("Update your guesses of where you think the",20,50);
        dc.outlineText("magnet's N and S terminals are located!",20,70);
        dc.outlineText("When ready, hit the \"ready\" button below.",20,90);
      },
      function() { return ready_btn_clicked; }
    ));
    steps.push(new Step(
      function(){
        var sdist = tldist(inert_mag.shandle,special_mag.shandle)/dc.height;
        var ndist = tldist(inert_mag.nhandle,special_mag.nhandle)/dc.height;
        closeness = ndist+sdist;
        var score = (4-closeness)/4;
        if(score > game.best_closeness) game.best_closeness = score;
        pop([
        "Your score: "+round(score*100),
        score > 0.85 ? "Good guess!" : "Better luck next time!",
        "Click \"ready\" to play again!",
        ]);
        game.find_witnessed_instructs = true;
      },
      noop,
      function()
      {
        drawConnectingInert();
      },
      function() { return input_state == RESUME_INPUT; }
    ));
    find_reveal_step = steps.length;
    steps.push(new Step(
      noop,
      noop,
      function() {
        ctx.fillStyle = "#000000";
        dc.outlineText("Feel free to drag around the compasses, the window,",20,50);
        dc.outlineText("or even the magnet's terminals!",20,70);
        dc.outlineText("When ready to play again, hit the \"ready\" button below.",20,90);
      },
      function() {
        if(ready_btn_clicked)
        {
          cur_step = find_begin_step-1;
          return true;
        }
        return false; }
    ));

    //TIME
    time_begin_step = steps.length;
    steps.push(new Step(
      function(){
        //set up game
        mode = TIME_MAGNET_MODE;
          //compasses
        for(var i = 0; i < 10; i++)
        {
          if(!comps[i]) genComp();
          var tooclose = true;
          while(tooclose)
          {
            comps[i].fx = rand0()*0.8;
            comps[i].fy = rand0()/2.*0.8;
            tooclose = false;
            for(var j = 0; j < i; j++)
            {
              if(fdistsqr(comps[i].fx,comps[i].fy,comps[j].fx,comps[j].fy) < 0.1) tooclose = true;
            }
          }
          comps[i].x = vfield.xFSpaceToScreen(comps[i].fx)-comps[i].w/2;
          comps[i].y = vfield.yFSpaceToScreen(comps[i].fy)-comps[i].h/2;
        }
        //magnet
        genSpecialMagnet();
        genInertMagnet();
        if(!game.time_witnessed_instructs)
        pop([
        "Your goal is to <b>place the magnet</b> in a spot that reflects <b>the displayed orientation of the compasses</b>.",
        "Your first step is to simply place your best guess.",
        "(<b>Don't worry if you don't understand what's going on right now</b>- just place it wherever, and you'll figure it out after a couple plays!)",
        "Click \"ready\" when you're satisfied with your placement.",
        ]);
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    time_first_guess_step = steps.length;
    steps.push(new Step(
      noop,
      noop,
      function() {
        ctx.fillStyle = "#000000";
        dc.outlineText("Place a guess where you think the magnet will need to be located",20,50);
        dc.outlineText("to have the displayed effect on the compasses.",20,70);
        dc.outlineText("When ready, hit the \"ready\" button below.",20,90);
      },
      function() { return ready_btn_clicked; }
    ));
    steps.push(new Step(
      function(){
        if(!game.time_witnessed_instructs)
        pop([
        "Now, we'll show the displayed effect of <b>your guess</b>-",
        "Update your guess to <b>match the compass needles</b>.",
        "Try to get <b>as close as you can</b>, <b>as fast as possible</b>.",
        "Hit <b>submit</b> when you're satisfied with your guess.",
        "Click \"continue\" to begin the timer.",
        ]);
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    time_second_guess_step = steps.length;
    steps.push(new Step(
      function() { time = 0; },
      function() { time++; },
      function()
      {
        ctx.fillStyle = "#000000";
        dc.outlineText("Place the magnet to match the shown compass needles.",20,50);
        dc.outlineText("Get as close as you can, as fast as you can.",20,70);
        dc.outlineText("Hit \"submit\" when you're satisfied with your guess.",20,90);
        dc.outlineText("Current time:"+time,20,110);
      },
      function()
      {
        return ready_btn_clicked;
      }
    ));
    steps.push(new Step(
      function(){
        var sdist = tldist(inert_mag.shandle,special_mag.shandle)/dc.height;
        var ndist = tldist(inert_mag.nhandle,special_mag.nhandle)/dc.height;
        closeness = ndist+sdist;
        var cscore = (4-closeness)/4;
        var score = max(cscore-min(time/10000,4),0);
        if(score > game.best_time) game.best_time = score;
        pop([
        "Closeness rating: "+round(cscore*100)+"<br />"+
        "Time: "+time+"<br />"+
        "Score: "+round(score*100),
        score > 0.85 ? "Good guess!" : "Better luck next time!",
        "Click \"ready\" to play again!",
        ]);
        game.time_witnessed_instructs = true;
      },
      noop,
      function()
      {
        drawConnectingInert();
      },
      function() { return input_state == RESUME_INPUT; }
    ));
    time_reveal_step = steps.length;
    steps.push(new Step(
      noop,
      noop,
      function() {
        ctx.fillStyle = "#000000";
        dc.outlineText("Feel free to drag around the compasses or magnets.",20,50);
        dc.outlineText("When ready to play again, hit the \"ready\" button below.",20,70);
      },
      function() {
        if(ready_btn_clicked)
        {
          cur_step = time_begin_step-1;
          return true;
        }
        return false; }
    ));

    //ORIENT
    orient_begin_step = steps.length;
    steps.push(new Step(
      function(){
        //set up game
        mode = ORIENT_COMPASS_MODE;
          //compasses
        for(var i = 0; i < 5; i++)
        {
          if(!comps[i]) genComp();
          var tooclose = true;
          while(tooclose)
          {
            comps[i].fx = rand0()*0.8;
            comps[i].fy = rand0()/2.*0.8;
            tooclose = false;
            for(var j = 0; j < i; j++)
            {
              if(fdistsqr(comps[i].fx,comps[i].fy,comps[j].fx,comps[j].fy) < 0.1) tooclose = true;
            }
          }
          comps[i].x = vfield.xFSpaceToScreen(comps[i].fx)-comps[i].w/2;
          comps[i].y = vfield.yFSpaceToScreen(comps[i].fy)-comps[i].h/2;
          comps[i].sdx = 0;
          comps[i].sdy = -1;
        }
        //magnet
        genInertMagnet();
        if(!game.orient_witnessed_instructs)
        pop([
        "Your goal is to <b>drag the compass needles</b> to their <b>correct orientation</b> given the position of the shown magnet.<br />(You should assume the compasses are not affected by any disturbances of the magnetic field other than by the shown magnet)",
        "Click \"ready\" when you're satisfied with your decided orientation!",
        ]);
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    orient_first_guess_step = steps.length;
    steps.push(new Step(
      noop,
      noop,
      function() {
        ctx.fillStyle = "#000000";
        dc.outlineText("Drag each compass needle to where you expect it ought point.",20,50);
        dc.outlineText("When ready, hit the \"ready\" button below.",20,70);
      },
      function() { return ready_btn_clicked; }
    ));
    steps.push(new Step(
      function(){
        var dx;
        var dx;
        var sdx;
        var sdx;
        var r;
        var closeness = 0;
        for(var i = 0; i < comps.length; i++)
        {
          dx = comps[i].dx;
          dy = comps[i].dy;
          r = sqrt((dx*dx)+(dy*dy));
          if(r == 0) { dx = 0; dy = 0; }
          else { dx /= r; dy /= r; }
          sdx = comps[i].sdx;
          sdy = comps[i].sdy;
          r = sqrt((sdx*sdx)+(sdy*sdy));
          if(r == 0) { sdx = 0; sdy = 0; }
          else { sdx /= r; sdy /= r; }
          closeness += abs(dx-sdx)+abs(dy-sdy);
        }
        var score = 1-(closeness/10);
        if(score > game.best_orient) game.best_orient = score;
        pop([
        "Score: "+round(score*100),
        score > 0.85 ? "Good guess!" : "Better luck next time!",
        "Click \"ready\" to play again!",
        ]);
        game.orient_witnessed_instructs = true;
      },
      noop,
      noop,
      function() { return input_state == RESUME_INPUT; }
    ));
    orient_reveal_step = steps.length;
    steps.push(new Step(
      noop,
      noop,
      function() {
        ctx.fillStyle = "#000000";
        dc.outlineText("Feel free to drag around the compasses.",20,50);
        dc.outlineText("When ready to play again, hit the \"ready\" button below.",20,70);
      },
      function() {
        if(ready_btn_clicked)
        {
          cur_step = orient_begin_step-1;
          return true;
        }
        return false; }
    ));

    //EXPOSITION
    steps.push(new Step(
      function(){
        mode = EXPOSITION_MODE;
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

    //PLAYGROUND
    playground_step = steps.length;
    steps.push(new Step(
      function()
      {
        /*
        var x;
        var y;
        var t;
        var n_cs = 20;
        var c = 1/n_cs;
        for(var i = 0; i < n_cs; i++)
        {
          //only allow endpoints
          //if(i != 0 && i != n_cs-1) continue;

          //gen horseshoe
          t = (i/(n_cs-1))*pi;
          x = cos(t)/4;
          y = -sin(t)/3+1/6;

          //gen bar
          //t = (i/(n_cs-1));
          //x = lerp(-1,1,t)/4;
          //y = 0;

          //alternating charges
          //genHandle(x,y,(i%2 ? 1*c : -1*c));

          //split charges
          genHandle(x,y,(i<n_cs/2 ? 1*c : -1*c));
        }
        */
        mode = PLAYGROUND_MODE;
      },
      noop,
      noop,
      ffunc
    ));

    //SECRET
    secret_step = steps.length;
    steps.push(new Step(
      function()
      {
        var nx = 12;
        var ny = 7;
        for(var i = 0; i < nx; i++)
        {
          for(var j = 0; j < ny; j++)
          {
            if(!comps[i*ny+j]) genComp();
            comps[i*ny+j].fx = lerp(-1,1,i/(nx-1));
            comps[i*ny+j].fy = lerp(-0.5,0.5,j/(ny-1));
            comps[i*ny+j].x = vfield.xFSpaceToScreen(comps[i*ny+j].fx)-comps[i*ny+j].w/2;
            comps[i*ny+j].y = vfield.yFSpaceToScreen(comps[i*ny+j].fy)-comps[i*ny+j].h/2;
          }
        }
        mode = PLAYGROUND_MODE;
      },
      noop,
      noop,
      ffunc
    ));

    if(game.best_closeness === undefined) game.best_closeness = lilnum;
    if(game.best_time === undefined)      game.best_time = lilnum;
    if(game.best_orient === undefined)    game.best_orient = lilnum;
    if(game.real_witnessed_instructs === undefined)   game.real_witnessed_instructs = false;
    if(game.find_witnessed_instructs === undefined)   game.find_witnessed_instructs = false;
    if(game.time_witnessed_instructs === undefined)   game.time_witnessed_instructs = false;
    if(game.orient_witnessed_instructs === undefined) game.orient_witnessed_instructs = false;

    earth = false;

    switch(game.start)
    {
      case 0: cur_step = playground_step-1; break;
      case 1: cur_step = real_begin_step-1; break;
      case 2: cur_step = find_begin_step-1; break;
      case 3: cur_step = time_begin_step-1; break;
      case 4: cur_step = orient_begin_step-1; break;
      case 5: cur_step = secret_step-1; break;
    }

    self.nextStep();
    hit_ui = false;
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
  var genComp = function()
  {
    var c = new Compass(0,0,30,vfield);
    dragger.register(c);
    cur_selected = c;
    comps[comps.length] = c;
  }
  var delComp = function(c)
  {
    for(var i = 0; i < comps.length; i++)
    {
      if(c == comps[i])
      {
        dragger.unregister(c);
        comps.splice(i,1);
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
    dragger.register(m);
    cur_selected = m.nhandle.charge;
    mags[mags.length] = m;
    return m;
  }
  var genInertMagnet = function()
  {
    if(inert_mag) delMagnet(inert_mag.n);
    var nx = rand0()*0.8;
    var ny = rand0()/2*0.8;
    var sx = rand0()*0.8;
    var sy = rand0()/2*0.8;
    while((nx-sx)*(nx-sx)+(ny-sy)*(ny-sy) < 0.01)
    {
      sx = rand0()*0.8;
      sy = rand0()/2*0.8;
    }
    inert_mag = genMagnet(
      -1,nx,ny,
       1,sx,sy
    );
    inert_mag.dragStart = function(evt)
    {
      if(cur_dragging) return;
      if(
        mode == REAL_MAGNET_MODE &&
        cur_step != real_begin_step
      ) return;
      if(
        mode == FIND_MAGNET_MODE &&
        cur_step != find_first_guess_step &&
        cur_step != find_second_guess_step
      ) return;
      if(
        mode == TIME_MAGNET_MODE &&
        cur_step != time_first_guess_step &&
        cur_step != time_second_guess_step &&
        cur_step != time_reveal_step
      ) return;
      if(mode == ORIENT_COMPASS_MODE) return;
      if(mode == PLAYGROUND_MODE) return;

      var x0 = evt.doX;
      var y0 = evt.doY;
      var x1 = inert_mag.nhandle.x+inert_mag.nhandle.w/2;
      var y1 = inert_mag.nhandle.y+inert_mag.nhandle.h/2;
      var x2 = inert_mag.shandle.x+inert_mag.shandle.w/2;
      var y2 = inert_mag.shandle.y+inert_mag.shandle.h/2;
      //https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
      var dist =
        abs((y2-y1)*x0 - (x2-x1)*y0 + x2*y1 - y2*x1) /
        sqrt(pow((y2-y1),2) + pow((x2-x1),2));
      if(dist > 10) return;

      inert_mag.dragging = true;
      inert_mag.grabbed_x = evt.doX;
      inert_mag.grabbed_y = evt.doY;
      inert_mag.drag(evt);
    }
    inert_mag.nhandle.dragStart = function(evt)
    {
      if(cur_dragging) return;
      if(
        mode == REAL_MAGNET_MODE &&
        cur_step != real_begin_step
      ) return;
      if(
        mode == FIND_MAGNET_MODE &&
        cur_step != find_first_guess_step &&
        cur_step != find_second_guess_step
      ) return;
      if(
        mode == TIME_MAGNET_MODE &&
        cur_step != time_first_guess_step &&
        cur_step != time_second_guess_step &&
        cur_step != time_reveal_step
      ) return;
      if(mode == ORIENT_COMPASS_MODE) return;
      if(mode == PLAYGROUND_MODE) return;

      inert_mag.nhandle.dragging = true;
      inert_mag.nhandle.charge.dragging = true;
      inert_mag.nhandle.drag(evt);
    }
    inert_mag.shandle.dragStart = function(evt)
    {
      if(cur_dragging) return;
      if(
        mode == REAL_MAGNET_MODE &&
        cur_step != real_begin_step
      ) return;
      if(
        mode == FIND_MAGNET_MODE &&
        cur_step != find_first_guess_step &&
        cur_step != find_second_guess_step
      ) return;
      if(
        mode == TIME_MAGNET_MODE &&
        cur_step != time_first_guess_step &&
        cur_step != time_second_guess_step &&
        cur_step != time_reveal_step
      ) return;
      if(mode == ORIENT_COMPASS_MODE) return;
      if(mode == PLAYGROUND_MODE) return;

      inert_mag.shandle.dragging = true;
      inert_mag.shandle.charge.dragging = true;
      inert_mag.shandle.drag(evt);
    }
  }
  var genSpecialMagnet = function()
  {
    if(special_mag) delMagnet(special_mag.n);
    var nx = rand0()*0.8;
    var ny = rand0()/2*0.8;
    var sx = rand0()*0.8;
    var sy = rand0()/2*0.8;
    while((nx-sx)*(nx-sx)+(ny-sy)*(ny-sy) < 0.01)
    {
      sx = rand0()*0.8;
      sy = rand0()/2*0.8;
    }
    special_mag = genMagnet(
      -1,nx,ny,
       1,sx,sy
    );
    special_mag.dragStart = function(evt)
    {
      if(
        mode == REAL_MAGNET_MODE &&
        cur_step < real_begin_step
      ) return;
      if(
        mode == FIND_MAGNET_MODE &&
        cur_step < find_reveal_step
      ) return;
      if(
        mode == TIME_MAGNET_MODE &&
        cur_step < time_reveal_step
      ) return;
      if(mode == PLAYGROUND_MODE) return;
      if(cur_dragging) return;

      var x0 = evt.doX;
      var y0 = evt.doY;
      var x1 = special_mag.nhandle.x+special_mag.nhandle.w/2;
      var y1 = special_mag.nhandle.y+special_mag.nhandle.h/2;
      var x2 = special_mag.shandle.x+special_mag.shandle.w/2;
      var y2 = special_mag.shandle.y+special_mag.shandle.h/2;
      //https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
      var dist =
        abs((y2-y1)*x0 - (x2-x1)*y0 + x2*y1 - y2*x1) /
        sqrt(pow((y2-y1),2) + pow((x2-x1),2));
      if(dist > 10) return;

      special_mag.dragging = true;
      special_mag.grabbed_x = evt.doX;
      special_mag.grabbed_y = evt.doY;
      special_mag.drag(evt);
    }
    special_mag.nhandle.dragStart = function(evt)
    {
      if(
        mode == REAL_MAGNET_MODE &&
        cur_step < real_begin_step
      ) return;
      if(
        mode == FIND_MAGNET_MODE &&
        cur_step < find_reveal_step
      ) return;
      if(
        mode == TIME_MAGNET_MODE &&
        cur_step < time_reveal_step
      ) return;
      if(mode == PLAYGROUND_MODE) return;
      if(cur_dragging) return;

      special_mag.nhandle.dragging = true;
      special_mag.nhandle.charge.dragging = true;
      special_mag.nhandle.drag(evt);
    }
    special_mag.shandle.dragStart = function(evt)
    {
      if(
        mode == REAL_MAGNET_MODE &&
        cur_step < real_begin_step
      ) return;
      if(
        mode == FIND_MAGNET_MODE &&
        cur_step < find_reveal_step
      ) return;
      if(
        mode == TIME_MAGNET_MODE &&
        cur_step < time_reveal_step
      ) return;
      if(mode == PLAYGROUND_MODE) return;
      if(cur_dragging) return;

      special_mag.shandle.dragging = true;
      special_mag.shandle.charge.dragging = true;
      special_mag.shandle.drag(evt);
    }

  }
  var delMagnet = function(charge)
  {
    for(var i = 0; i < mags.length; i++)
    {
      if(charge == mags[i].n || charge == mags[i].s)
      {
        dragger.unregister(mags[i]);
        dragger.unregister(mags[i].shandle);
        dragger.unregister(mags[i].nhandle);
        delCharge(mags[i].s);
        delCharge(mags[i].n);
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
    domclicker.flush();

    if(mode == EXPOSITION_MODE || mode == PLAYGROUND_MODE)
      vfield.tick();
    else if(mode == REAL_MAGNET_MODE)
      vfield.tick(wind);
    else if(mode == FIND_MAGNET_MODE)
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
          if(charge.x < -1.0) { charge.x = -1.0; if(charge.xv < 0) charge.xv *= -1; }
          if(charge.x >  1.0) { charge.x =  1.0; if(charge.xv > 0) charge.xv *= -1; }
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
      comps[i].tick();

    steps[cur_step].tick();
    if(steps[cur_step].test()) self.nextStep();
    ready_btn_clicked = false;
    hit_ui = false;
  };

  self.draw = function()
  {
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";
    var mag;
    for(var i = 0; i < mags.length; i++)
    {
      mag = mags[i];
      if(mode == REAL_MAGNET_MODE)
      {
        if(cur_step < real_begin_step-1 && mag == special_mag) continue;
      }
      if(mode == FIND_MAGNET_MODE)
      {
        if(cur_step < find_reveal_step-1 && mag == special_mag) continue;
        if(cur_step < find_first_guess_step && mag == inert_mag) continue;
      }
      if(mode == TIME_MAGNET_MODE)
      {
        if(cur_step < time_reveal_step-1 && mag == special_mag) continue;
      }
      ctx.lineWidth = 20;
      dc.drawLine(
        mag.nhandle.x+mag.nhandle.w/2,mag.nhandle.y+mag.nhandle.h/2,
        mag.shandle.x+mag.shandle.w/2,mag.shandle.y+mag.shandle.h/2
      );
      ctx.lineWidth = 1;
      ctx.fillStyle = "#000000";
      if(mag.nhandle.charge == cur_selected)
        ctx.drawImage(HCircle,mag.nhandle.x,mag.nhandle.y,mag.nhandle.w,mag.nhandle.h);
      ctx.drawImage(Circle,mag.nhandle.x,mag.nhandle.y,mag.nhandle.w,mag.nhandle.h);
      dc.outlineText("N",mag.nhandle.x+5,mag.nhandle.y+mag.nhandle.h-5,"#FFFFFF","#000000");
      if(mag.shandle.charge == cur_selected)
        ctx.drawImage(HCircle,mag.shandle.x,mag.shandle.y,mag.shandle.w,mag.shandle.h);
      ctx.drawImage(Circle,mag.shandle.x,mag.shandle.y,mag.shandle.w,mag.shandle.h);
      dc.outlineText("S",mag.shandle.x+5,mag.shandle.y+mag.shandle.h-5,"#FFFFFF","#000000");
    }
    var nonmag;
    for(var i = 0; i < nonmags.length; i++)
    {
      nonmag = nonmags[i];
      if(nonmag.charge == cur_selected)
        ctx.drawImage(HCircle,nonmag.x,nonmag.y,nonmag.w,nonmag.h);
      ctx.drawImage(Circle,nonmag.x,nonmag.y,nonmag.w,nonmag.h);
      ctx.fillStyle = "#000000";
      if(nonmag.charge.v < 0) dc.outlineText("N",nonmag.x+5,nonmag.y+nonmag.h-5);
      if(nonmag.charge.v > 0) dc.outlineText("S",nonmag.x+5,nonmag.y+nonmag.h-5);
    }

    if(mode == PLAYGROUND_MODE || mode == EXPOSITION_MODE)
    {
      if(game.start != 4) vfield.draw();
    }
    if(mode == REAL_MAGNET_MODE) //wut
    {
      ;
    }
    if(mode == FIND_MAGNET_MODE)
    {
      if(cur_step >= find_second_guess_step-1)
        vfield.draw(wind);
      if(cur_step >= find_place_dead_window_step-1)
      {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.strokeRect(wind.x,wind.y,wind.w,wind.h);
      }
    }
    if(mode != PLAYGROUND_MODE)
    {
      ready_btn.draw(dc); ctx.fillStyle = "#000000"; dc.outlineText("ready",ready_btn.x+5,ready_btn.y+ready_btn.h-5);
    }
    if(mode != EXPOSITION_MODE)
    {
      for(var i = 0; i < comps.length; i++)
        comps[i].draw();
    }

    ctx.lineWidth = 1;
    menu_btn.draw(dc); ctx.fillStyle = "#000000"; dc.outlineText("Menu",menu_btn.x+5,menu_btn.y+menu_btn.h-5);
    if((mode == PLAYGROUND_MODE && game.start != 4) || (mode == FIND_MAGNET_MODE && cur_step >= find_second_guess_step))
    {
      hd_btn.draw(dc); ctx.fillStyle = "#000000"; dc.outlineText("HD",hd_btn.x+5,hd_btn.y+hd_btn.h-5);
      sd_btn.draw(dc); ctx.fillStyle = "#000000"; dc.outlineText("SD",sd_btn.x+5,sd_btn.y+sd_btn.h-5);
      ld_btn.draw(dc); ctx.fillStyle = "#000000"; dc.outlineText("LD",ld_btn.x+5,ld_btn.y+ld_btn.h-5);
    }
    if(mode == EXPOSITION_MODE || mode == PLAYGROUND_MODE)
    {
      new_pos_btn.draw(dc);     ctx.fillStyle = "#000000"; dc.outlineText("create charge (S)",new_pos_btn.x+5,new_pos_btn.y+new_pos_btn.h-5);
      new_neg_btn.draw(dc);     ctx.fillStyle = "#000000"; dc.outlineText("create charge (N)",new_neg_btn.x+5,new_neg_btn.y+new_neg_btn.h-5);
      new_magnet_btn.draw(dc);  ctx.fillStyle = "#000000"; dc.outlineText("create magnet",new_magnet_btn.x+5,new_magnet_btn.y+new_magnet_btn.h-5);
      new_compass_btn.draw(dc); ctx.fillStyle = "#000000"; dc.outlineText("create compass",new_compass_btn.x+5,new_compass_btn.y+new_compass_btn.h-5);
      phys_btn.draw(dc);        ctx.fillStyle = "#000000"; dc.outlineText("toggle physics for currently selected",phys_btn.x+5,phys_btn.y+phys_btn.h-5);
      del_btn.draw(dc);         ctx.fillStyle = "#000000"; dc.outlineText("delete currently selected",del_btn.x+5,del_btn.y+del_btn.h-5);
      earth_btn.draw(dc);       ctx.fillStyle = "#000000";
      if(earth)
      {
        dc.outlineText("✔ toggle earth's field",earth_btn.x+5,earth_btn.y+earth_btn.h-5);
        ctx.lineWidth = 5;
        drawArrow(dc,dc.width-50,50,dc.width-50,20,10);
        dc.outlineText("N",dc.width-53,40);
      }
      else dc.outlineText("toggle earth's field",earth_btn.x+5,earth_btn.y+earth_btn.h-5);
    }

    if(mode == FIND_MAGNET_MODE)
    {
      if(game.best_closeness > lilnum) dc.outlineText("best score:"+round(game.best_closeness*100),dc.width/2,20);
    }
    if(mode == TIME_MAGNET_MODE)
    {
      if(game.best_time > lilnum) dc.outlineText("best score:"+round(game.best_time*100),dc.width/2,20);
    }
    if(mode == ORIENT_COMPASS_MODE)
    {
      if(game.best_orient > lilnum) dc.outlineText("best score:"+round(game.best_orient*100),dc.width/2,20);
    }

    dom.x = 200;
    dom.y = 200;
    dom.w = 200;
    dom.h = 200;
    dom.draw(dc);

    steps[cur_step].draw();
  };

  self.cleanup = function()
  {
    for(var i = mags.length-1; i >= 0; i--)
      delMagnet(mags[i].n);
    for(var i = nonmags.length-1; i >= 0; i--)
      delHandle(nonmags[i].charge);
    for(var i = comps.length-1; i >= 0; i--)
      delComp(comps[i]);
    dragger.detach(); dragger = undefined;
    clicker.detach(); clicker = undefined;
    domclicker.detach(); domclicker = undefined;
  };

  var pop = function(msg,callback)
  {
    if(!callback) callback = dismissed;
    input_state = IGNORE_INPUT;
    dom.popDismissableMessage(msg,200,200,200,200,callback);
  }
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

      var inert_c0;
      var inert_c1;
      if(inert_mag)
      {
        inert_c0 = inert_mag.n;
        inert_c1 = inert_mag.s;
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
            if(
              charges[k] == inert_c0 ||
              charges[k] == inert_c1
            ) continue;
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

          if(earth) self.dy[index] -= earth_strength;

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
      if(cur_dragging) return;
      self.dragging = true;
      self.charge.dragging = true;
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      if(!self.dragging) return;
      cur_dragging = self;
      cur_selected = self.charge;
      self.x = evt.doX-self.w/2;
      self.y = evt.doY-self.h/2;

      self.charge.x = field.xScreenToFSpace(evt.doX);
      self.charge.y = field.yScreenToFSpace(evt.doY);
    }
    self.dragFinish = function()
    {
      if(self.dragging) cur_dragging = undefined;
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

    self.x = 0;
    self.y = 0;
    self.w = 0;
    self.h = 0;

    self.stretchable = true;
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
      if(!self.stretchable)
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

      self.x = min(self.nhandle.x,self.shandle.x);
      self.y = min(self.nhandle.y,self.shandle.y);
      self.w = (max(self.nhandle.x,self.shandle.x)+self.nhandle.w)-self.x;
      self.h = (max(self.nhandle.y,self.shandle.y)+self.nhandle.w)-self.y;
    }

    self.dragging = false;
    self.grabbed_x;
    self.grabbed_y;
    self.dragStart = function(evt)
    {
      if(cur_dragging) return;

      var x0 = evt.doX;
      var y0 = evt.doY;
      var x1 = self.nhandle.x+self.nhandle.w/2;
      var y1 = self.nhandle.y+self.nhandle.h/2;
      var x2 = self.shandle.x+self.shandle.w/2;
      var y2 = self.shandle.y+self.shandle.h/2;
      //https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
      var dist =
        abs((y2-y1)*x0 - (x2-x1)*y0 + x2*y1 - y2*x1) /
        sqrt(pow((y2-y1),2) + pow((x2-x1),2));
      if(dist > 10) return;

      self.dragging = true;
      self.grabbed_x = evt.doX;
      self.grabbed_y = evt.doY;
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      if(!self.dragging) return;
      cur_dragging = self;
      cur_selected = self.nhandle.charge;
      self.nhandle.charge.dragging = true;
      self.shandle.charge.dragging = true;

      var dx = evt.doX-self.grabbed_x;
      var dy = evt.doY-self.grabbed_y;

      self.nhandle.x += dx;
      self.nhandle.y += dy;
      self.nhandle.charge.x = field.xScreenToFSpace(self.nhandle.x+self.nhandle.w/2);
      self.nhandle.charge.y = field.yScreenToFSpace(self.nhandle.y+self.nhandle.h/2);
      self.shandle.x += dx;
      self.shandle.y += dy;
      self.shandle.charge.x = field.xScreenToFSpace(self.shandle.x+self.shandle.w/2);
      self.shandle.charge.y = field.yScreenToFSpace(self.shandle.y+self.shandle.h/2);

      self.grabbed_x = evt.doX;
      self.grabbed_y = evt.doY;
    }
    self.dragFinish = function()
    {
      if(self.dragging) cur_dragging = undefined;
      self.dragging = false;
      self.nhandle.charge.dragging = false;
      self.shandle.charge.dragging = false;
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
      if(mode != FIND_MAGNET_MODE) return;
      if(cur_dragging) return;
      if(
        cur_step != find_place_dead_window_step &&
        cur_step < find_reveal_step
      ) return;
      self.dragging = true;
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      if(!self.dragging) return;
      cur_dragging = self;
      self.x = evt.doX-self.w/2;
      self.y = evt.doY-self.h/2;
    }
    self.dragFinish = function()
    {
      if(self.dragging) cur_dragging = undefined;
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
    self.sdx = 0;
    self.sdy = 0;

    self.tick = function()
    {
      var xd;
      var yd;
      var r2;
      var r;
      var f;

      var inert_c0;
      var inert_c1;
      if(inert_mag)
      {
        inert_c0 = inert_mag.n;
        inert_c1 = inert_mag.s;
      }

      self.dy = 0;
      self.dx = 0;
      if(mode == TIME_MAGNET_MODE)
      {
        self.sdy = 0;
        self.sdx = 0;
      }
      for(var k = 0; k < charges.length; k++)
      {
        yd = self.fy-charges[k].y;
        xd = self.fx-charges[k].x;
        r2 = (xd*xd)+(yd*yd);
        if(r2 != 0)
        {
          f = charges[k].v/r2;
          r = sqrt(r2);
          if(
            charges[k] == inert_c0 ||
            charges[k] == inert_c1
          )
          {
            if(mode == TIME_MAGNET_MODE)
            {
              self.sdy -= f*yd/r;
              self.sdx -= f*xd/r;
            }
            if(mode != ORIENT_COMPASS_MODE)
              continue;
          }
          self.dy -= f*yd/r;
          self.dx -= f*xd/r;
        }
      }
      if(earth) self.dy -= earth_strength;
    }

    self.draw = function()
    {
      ctx.lineWidth = 2;
      ctx.drawImage(Circle,self.x,self.y,self.w,self.h);
      if(mode == FIND_MAGNET_MODE && cur_step < find_first_guess_step-1) return;

      if(mode != ORIENT_COMPASS_MODE || cur_step >= orient_reveal_step-1)
      {
        var r = (self.dx*self.dx)+(self.dy*self.dy);
        if(r > 0.001)
        {
          r = sqrt(r);
          ctx.strokeStyle = "#440000";
          drawArrow(
            dc,
            self.x+self.w/2,
            self.y+self.h/2,
            self.x+self.w/2+(self.dx/r)*self.r,
            self.y+self.h/2+(self.dy/r)*self.r,
            5
          );
        }
      }

      if(
        (mode == TIME_MAGNET_MODE && cur_step > time_second_guess_step-1) ||
        (mode == ORIENT_COMPASS_MODE)
      )
      {
        r = (self.sdx*self.sdx)+(self.sdy*self.sdy);
        if(r > 0.001)
        {
          r = sqrt(r);
          ctx.strokeStyle = "#FF0000";
          drawArrow(
            dc,
            self.x+self.w/2,
            self.y+self.h/2,
            self.x+self.w/2+(self.sdx/r)*self.r,
            self.y+self.h/2+(self.sdy/r)*self.r,
            5
          );
        }
      }
    }

    self.dragging = false;
    self.dragStart = function(evt)
    {
      if(
        mode == FIND_MAGNET_MODE &&
        cur_step != find_place_dead_compass_step &&
        cur_step < find_reveal_step
      ) return;
      if(mode == TIME_MAGNET_MODE &&
        cur_step < time_reveal_step
      ) return;
      if(mode == PLAYGROUND_MODE &&
        game.start == 4
      ) return;
      if(cur_dragging) return;
      self.dragging = true;
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      if(!self.dragging) return;
      cur_dragging = self;
      cur_selected = self;
      if(mode == ORIENT_COMPASS_MODE && cur_step < orient_reveal_step)
      {
        self.sdx = field.xScreenToFSpace(evt.doX)-self.fx;
        self.sdy = field.yScreenToFSpace(evt.doY)-self.fy;
      }
      else
      {
        self.x = evt.doX-self.w/2;
        self.y = evt.doY-self.h/2;
        self.fx = field.xScreenToFSpace(evt.doX);
        self.fy = field.yScreenToFSpace(evt.doY);
      }
    }
    self.dragFinish = function()
    {
      if(self.dragging) cur_dragging = undefined;
      self.dragging = false;
    }
  }

  var drawConnectingInert = function()
  {
    ctx.strokeStyle = "#FF0000";
    ctx.lineWidth = 2;
    dc.drawLine(
      inert_mag.shandle.x+inert_mag.shandle.w/2,inert_mag.shandle.y+inert_mag.shandle.h/2,
      special_mag.shandle.x+special_mag.shandle.w/2,special_mag.shandle.y+special_mag.shandle.h/2
    );
    dc.drawLine(
      inert_mag.nhandle.x+inert_mag.nhandle.w/2,inert_mag.nhandle.y+inert_mag.nhandle.h/2,
      special_mag.nhandle.x+special_mag.nhandle.w/2,special_mag.nhandle.y+special_mag.nhandle.h/2
    );
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

