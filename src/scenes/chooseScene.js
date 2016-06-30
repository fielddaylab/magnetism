var ChooseScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;

  var clicker;

  var btn_tut_game;
  var btn_playground;
  var btn_real_game;

  var bignum = 999999;
  var lilnum = -bignum;

  var btn_s;
  var btn_y;
  var btn_x;

  var section_line_0_y;
  var section_line_1_y;
  var title_y;
  var subtitle_y;

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});

    var n_btns = 3;
    btn_s = dc.width/(n_btns+2);
    btn_y = (3*dc.height/4)-btn_s/2;
    btn_x = [];
    for(var i = 0; i < n_btns; i++)
      btn_x[i] = btn_s/2+ ( btn_s+ (btn_s/(n_btns-1)))*i;

    section_line_0_y = dc.height/3;
    section_line_1_y = dc.height/3+120;
    title_y = dc.height/2-30;
    subtitle_y = btn_y-40;

    btn_tut_game   = new ButtonBox(btn_x[0],btn_y,btn_s,btn_s,function(evt){ game.start = 0; game.setScene(4); });
    btn_playground = new ButtonBox(btn_x[1],btn_y,btn_s,btn_s,function(evt){ game.start = 1; game.setScene(4); });
    btn_real_game  = new ButtonBox(btn_x[2],btn_y,btn_s,btn_s,function(evt){ game.start = 2; game.setScene(4); });

    clicker.register(btn_tut_game);
    clicker.register(btn_playground);
    clicker.register(btn_real_game);
  };

  self.tick = function()
  {
    clicker.flush();
  };

  var space = String.fromCharCode(8202)+String.fromCharCode(8202);
  self.draw = function()
  {
  /*
    dc.context.textAlign = "left";
    btn_tut_game.draw(dc);   dc.context.fillStyle = "#000000"; dc.context.fillText("Tutorial",btn_tut_game.x+8,btn_tut_game.y+btn_tut_game.h-4);
    btn_playground.draw(dc);  dc.context.fillStyle = "#000000"; dc.context.fillText("Playground",btn_playground.x+8,btn_playground.y+btn_playground.h-4);
    btn_real_game.draw(dc);   dc.context.fillStyle = "#000000"; dc.context.fillText("Real Game",btn_real_game.x+8,btn_real_game.y+btn_real_game.h-4);
*/

    dc.context.fillStyle = "#FFFFFF";
    dc.fillRoundRect(0,0,dc.width,dc.height,5);
    dc.context.fillStyle = "#000000";

    dc.context.fillStyle = "#00FF00";//blue;
    //dc.roundRectOptions(btn_tutorial.x,btn_tutorial.y,btn_tutorial.w,btn_tutorial.h,5,1,1,0,0,0,1)
    //dc.context.drawImage(crystal_img,dc.width-section_line_0_y,0,section_line_0_y,section_line_0_y);
    //dc.context.drawImage(tutorial_img,50,50,220,section_line_0_y-50);

    dc.context.fillStyle = "#333333";
    dc.context.font = "25px Open Sans";
    dc.context.fillText("The Magnetism Game".split("").join(space),dc.width/2-100,100);
    dc.context.font = "Bold 16px Open Sans";
    dc.context.fillStyle = "#FFFFFF";
    dc.fillRoundRect(dc.width/2-110,120,175,30,20);
    dc.context.fillStyle = "#333333";
    dc.context.fillText("There's a lot of unnecessary text on this screen",dc.width/2-100,140);
    //dc.context.drawImage(arrow_img,dc.width/2+25,127,30,15);
    dc.context.font = "12px Open Sans";

    dc.context.lineWidth = 0.5;
    dc.context.strokeStyle = "#666666";
    dc.drawLine(0,section_line_0_y,dc.width,section_line_0_y);
    dc.drawLine(0,section_line_1_y,dc.width,section_line_1_y);

    dc.context.textAlign = "center";
    rectBtn(btn_tut_game,"Tutorial");
    rectBtn(btn_playground,"Playground");
    rectBtn(btn_real_game,"Game");

    dc.context.font = "40px Open Sans";
    dc.context.fillText("MAGNETISM".split("").join(space+space),dc.width/2,title_y);


  };
  var rectBtn = function(btn,lbl)
  {
    dc.context.fillStyle = "#FFFFFF";
    dc.fillRoundRect(btn.x,btn.y,btn.w,btn.h,5);
    dc.context.strokeStyle = "#000000";
    dc.strokeRoundRect(btn.x,btn.y,btn.w,btn.h,5);
    dc.context.fillStyle = "#000000";
    dc.context.fillText(lbl,btn.x+btn.w/2,btn.y+btn.h+20);
  }

  self.cleanup = function()
  {
    clicker.detach();
    clicker = undefined;
  };
};

