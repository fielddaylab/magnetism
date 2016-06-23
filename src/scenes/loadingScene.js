var LoadingScene = function(game, stage)
{
  var self = this;

  var canv = stage.drawCanv;
  var canvas = canv.canvas;
  var ctx = canv.context;

  var pad;
  var barw;
  var progress;
  var canv = stage.drawCanv;

  var imagesloaded = 0;
  var img_srcs = [];
  var images = [];

  var imageLoaded = function()
  {
    imagesloaded++;
  };

  self.ready = function()
  {
    pad = 20;
    barw = (canv.width-(2*pad));
    progress = 0;
    canv.context.fillStyle = "#000000";
    canv.context.fillText(".",0,0);// funky way to encourage any custom font to load

    //put strings in 'img_srcs' as separate array to get "static" count
    img_srcs.push("assets/mag_n.png");
    img_srcs.push("assets/mag_s.png");
    img_srcs.push("assets/pin_n.png");
    img_srcs.push("assets/pin_s.png");
    img_srcs.push("assets/mag_red.png");
    img_srcs.push("assets/mag_blue.png");
    img_srcs.push("assets/compass.png");
    img_srcs.push("assets/compass_dot.png");
    img_srcs.push("assets/compass_drop.png");
    img_srcs.push("assets/needle.png");
    img_srcs.push("assets/iron_filings.png");
    img_srcs.push("assets/iron_filings_dot.png");
    img_srcs.push("assets/iron_filings_drop.png");
    img_srcs.push("assets/mag_film.png");
    img_srcs.push("assets/mag_film_dot.png");
    img_srcs.push("assets/mag_film_drop.png");
    img_srcs.push("assets/sidebar_tools.png");
    img_srcs.push("assets/sidebar_guess.png");
    img_srcs.push("assets/guess_lbl.png");
    img_srcs.push("assets/tools_lbl.png");
    img_srcs.push("assets/guess_btn.png");
    img_srcs.push("assets/scout.png");
    img_srcs.push("assets/bg_0.png");
    img_srcs.push("assets/bg_1.png");
    img_srcs.push("assets/bg_2.png");
    img_srcs.push("assets/junk_0.png");
    img_srcs.push("assets/junk_1.png");
    img_srcs.push("assets/junk_2.png");
    img_srcs.push("assets/junk_3.png");
    img_srcs.push("assets/junk_4.png");
    img_srcs.push("assets/junk_big_0.png");
    img_srcs.push("assets/junk_big_1.png");
    for(var i = 0; i < 7; i++)
      img_srcs.push("assets/chars/face/char_"+i+".png");
    for(var i = 0; i < img_srcs.length; i++)
    {
      images[i] = new Image();
      images[i].onload = imageLoaded;
      images[i].src = img_srcs[i];
    }
    imageLoaded(); //call once to prevent 0/0 != 100% bug
  };

  self.tick = function()
  {
    var p = imagesloaded/(img_srcs.length+1);
    if(progress <= p) progress += 0.01;
    if(p >= 1.0) { bake(); game.nextScene(); }
  };

  self.draw = function()
  {
    canv.context.fillRect(pad,canv.height/2,progress*barw,1);
    canv.context.strokeRect(pad-1,(canv.height/2)-1,barw+2,3);
  };

  self.cleanup = function()
  {
    progress = 0;
    imagesloaded = 0;
    images = [];//just used them to cache assets in browser; let garbage collector handle 'em.
    canv.context.fillStyle = "#FFFFFF";
    canv.context.fillRect(0,0,canv.width,canv.height);
  };
};

