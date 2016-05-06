var ChooseScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;

  var clicker;

  var btn_playground;
  var btn_find_game;
  var btn_time_game;
  var btn_orient_game;
  var btn_secret_game;

  var bignum = 999999;
  var lilnum = -bignum;

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});

    btn_playground  = new ButtonBox(10, 10,dc.width/2-15,30,function(evt){ game.start = 0; game.setScene(3); });
    btn_find_game   = new ButtonBox(10, 90,dc.width/2-15,30,function(evt){ game.start = 1; game.setScene(3); });
    btn_time_game   = new ButtonBox(10,130,dc.width/2-15,30,function(evt){ game.start = 2; game.setScene(3); });
    btn_orient_game = new ButtonBox(10, 50,dc.width/2-15,30,function(evt){ game.start = 3; game.setScene(3); });
    btn_secret_game = new ButtonBox(10,170,dc.width/2-15,30,function(evt){ game.start = 4; game.setScene(3); });

    clicker.register(btn_playground);
    clicker.register(btn_find_game);
    clicker.register(btn_time_game);
    clicker.register(btn_orient_game);
    clicker.register(btn_secret_game);
  };

  self.tick = function()
  {
    clicker.flush();
  };

  self.draw = function()
  {
    dc.context.textAlign = "left";
    btn_playground.draw(dc);  dc.context.fillStyle = "#000000"; dc.context.fillText("Playground",btn_playground.x+8,btn_playground.y+btn_playground.h-4);
    btn_find_game.draw(dc);   dc.context.fillStyle = "#000000"; dc.context.fillText("Find Game",btn_find_game.x+8,btn_find_game.y+btn_find_game.h-4);
    if(game.best_closeness !== undefined && game.best_closeness != lilnum) dc.context.fillText("Best Score:"+round(game.best_closeness*100),btn_find_game.x+8+btn_find_game.w/2,btn_find_game.y+btn_find_game.h-4);
    btn_time_game.draw(dc);   dc.context.fillStyle = "#000000"; dc.context.fillText("Timed Game",btn_time_game.x+8,btn_time_game.y+btn_time_game.h-4);
    if(game.best_time !== undefined && game.best_time != lilnum) dc.context.fillText("Best Score:"+round(game.best_time*100),btn_time_game.x+8+btn_time_game.w/2,btn_time_game.y+btn_time_game.h-4);
    btn_orient_game.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("Compass Game",btn_orient_game.x+8,btn_orient_game.y+btn_orient_game.h-4);
    if(game.best_orient !== undefined && game.best_orient != lilnum) dc.context.fillText("Best Score:"+round(game.best_orient*100),btn_orient_game.x+8+btn_orient_game.w/2,btn_orient_game.y+btn_orient_game.h-4);
  };

  self.cleanup = function()
  {
    clicker.detach();
    clicker = undefined;
  };
};

