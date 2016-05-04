var ChooseScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;

  var clicker;

  var btn_playground;
  var btn_find_game;
  var btn_time_game;

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});

    btn_playground = new ButtonBox(10,10,dc.width/2-15,30,function(evt){ game.start = 0; game.setScene(3); });
    btn_find_game  = new ButtonBox(10,50,dc.width/2-15,30,function(evt){ game.start = 1; game.setScene(3); });
    btn_time_game  = new ButtonBox(10,90,dc.width/2-15,30,function(evt){ game.start = 2; game.setScene(3); });

    clicker.register(btn_playground);
    clicker.register(btn_find_game);
    clicker.register(btn_time_game);
  };

  self.tick = function()
  {
    clicker.flush();
  };

  self.draw = function()
  {
    dc.context.textAlign = "left";
    btn_playground.draw(dc); dc.context.fillStyle = "#000000"; dc.context.fillText("Playground",btn_playground.x+8,btn_playground.y+btn_playground.h-4);
    btn_find_game.draw(dc);  dc.context.fillStyle = "#000000"; dc.context.fillText("Find Game",btn_find_game.x+8,btn_find_game.y+btn_find_game.h-4);
    btn_time_game.draw(dc);  dc.context.fillStyle = "#000000"; dc.context.fillText("Time Game",btn_time_game.x+8,btn_time_game.y+btn_time_game.h-4);
  };

  self.cleanup = function()
  {
    clicker.detach();
    clicker = undefined;
  };
};

