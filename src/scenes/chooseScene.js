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

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});

    btn_tut_game    = new ButtonBox(10,10,dc.width/2-15,30,function(evt){ game.start = 0; game.setScene(3); });
    btn_playground  = new ButtonBox(10,50,dc.width/2-15,30,function(evt){ game.start = 1; game.setScene(3); });
    btn_real_game   = new ButtonBox(10,90,dc.width/2-15,30,function(evt){ game.start = 2; game.setScene(3); });

    clicker.register(btn_tut_game);
    clicker.register(btn_playground);
    clicker.register(btn_real_game);
  };

  self.tick = function()
  {
    clicker.flush();
  };

  self.draw = function()
  {
    dc.context.textAlign = "left";
    btn_tut_game.draw(dc);   dc.context.fillStyle = "#000000"; dc.context.fillText("Tutorial",btn_tut_game.x+8,btn_tut_game.y+btn_tut_game.h-4);
    btn_playground.draw(dc);  dc.context.fillStyle = "#000000"; dc.context.fillText("Playground",btn_playground.x+8,btn_playground.y+btn_playground.h-4);
    btn_real_game.draw(dc);   dc.context.fillStyle = "#000000"; dc.context.fillText("Real Game",btn_real_game.x+8,btn_real_game.y+btn_real_game.h-4);
  };

  self.cleanup = function()
  {
    clicker.detach();
    clicker = undefined;
  };
};

