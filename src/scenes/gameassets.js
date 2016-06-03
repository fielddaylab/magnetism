var circle;
var hcircle;
var compass_img;
var compass_dot_img;
var compass_drop_img;
var needle_img;
var mag_n_tip_img;
var mag_n_img;
var mag_s_tip_img;
var mag_s_img;
var guess_n_img;
var guess_s_img;
var iron_filings_img;
var iron_filings_dot_img;
var iron_filings_drop_img;
var mag_film_img;
var mag_film_dot_img;
var mag_film_drop_img;
var sidebar_tools_img;
var sidebar_guess_img;
var tools_btn_img;
var guess_btn_img;

var bake = function()
{
  var w;
  var h;

  circle = GenIcon(100,100);
  circle.context.strokeStyle = "#000000";
  circle.context.lineWidth = 5;
  circle.context.beginPath();
  circle.context.arc(circle.width/2,circle.height/2,circle.width/2,0,2*Math.PI);
  circle.context.stroke();

  hcircle = GenIcon(100,100);
  hcircle.context.fillStyle = "#FFFF00";
  hcircle.context.beginPath();
  hcircle.context.arc(hcircle.width/2,hcircle.height/2,hcircle.width/2,0,2*Math.PI);
  hcircle.context.fill();

  compass_img = new Image();
  compass_img.src = "assets/compass.png";
  compass_dot_img = new Image();
  compass_dot_img.src = "assets/compass_dot.png";
  compass_drop_img = new Image();
  compass_drop_img.src = "assets/compass_drop.png";
  /*
  compass_img = GenIcon(200,200);
  compass_img.context.strokeStyle = "#1A7CAF"; //dark blue
  compass_img.context.fillStyle = "#DDF7FE"; //light blue
  compass_img.context.lineWidth = 10;
  compass_img.context.beginPath();
  compass_img.context.arc(compass_img.width/2,compass_img.height/2,compass_img.width/2-compass_img.context.lineWidth,0,2*Math.PI);
  compass_img.context.fill();
  compass_img.context.stroke();
  */

  var nw = 12;
  var cw = 6;
  needle_img = new Image();
  needle_img.src = "assets/needle.png";
  /*
  needle_img = GenIcon(200,200);
  needle_img.context.fillStyle = "#EF3236"; //light red
  needle_img.context.beginPath();
  needle_img.context.moveTo(needle_img.width,needle_img.height/2);
  needle_img.context.lineTo(needle_img.width/2,needle_img.height/2-nw);
  needle_img.context.lineTo(needle_img.width/2,needle_img.height/2);
  needle_img.context.closePath();
  needle_img.context.fill();
  needle_img.context.fillStyle = "#CC181E"; //dark red
  needle_img.context.beginPath();
  needle_img.context.moveTo(needle_img.width,needle_img.height/2);
  needle_img.context.lineTo(needle_img.width/2,needle_img.height/2+nw);
  needle_img.context.lineTo(needle_img.width/2,needle_img.height/2);
  needle_img.context.closePath();
  needle_img.context.fill();
  needle_img.context.fillStyle = "#DCD8D7"; //light gray
  needle_img.context.beginPath();
  needle_img.context.moveTo(0,needle_img.height/2);
  needle_img.context.lineTo(needle_img.width/2,needle_img.height/2-nw);
  needle_img.context.lineTo(needle_img.width/2,needle_img.height/2);
  needle_img.context.closePath();
  needle_img.context.fill();
  needle_img.context.fillStyle = "#A5A5A5"; //dark gray
  needle_img.context.beginPath();
  needle_img.context.moveTo(0,needle_img.height/2);
  needle_img.context.lineTo(needle_img.width/2,needle_img.height/2+nw);
  needle_img.context.lineTo(needle_img.width/2,needle_img.height/2);
  needle_img.context.closePath();
  needle_img.context.fill();
  needle_img.context.fillStyle = "#000000";
  needle_img.context.fillRect(needle_img.width/2-cw/2,needle_img.height/2-cw/2,cw,cw);
  */

  iron_filings_img = new Image();
  iron_filings_img.src = "assets/iron_filings.png";
  iron_filings_dot_img = new Image();
  iron_filings_dot_img.src = "assets/iron_filings_dot.png";
  iron_filings_drop_img = new Image();
  iron_filings_drop_img.src = "assets/iron_filings_drop.png";
  /*
  iron_filings_img = GenIcon(300,300);
  iron_filings_img.context.strokeStyle = "#1A7CAF"; //dark blue
  iron_filings_img.context.fillStyle = "#DDF7FE"; //light blue
  iron_filings_img.context.lineWidth = 10;
  iron_filings_img.context.beginPath();
  iron_filings_img.context.arc(iron_filings_img.width/2,iron_filings_img.height/2,iron_filings_img.width/2-iron_filings_img.context.lineWidth,0,2*Math.PI);
  iron_filings_img.context.fill();
  iron_filings_img.context.stroke();
  var t;
  var r;
  iron_filings_img.context.fillStyle = "#000000";
  iron_filings_img.context.globalAlpha = 0.2;
  for(var i = 0; i < 40000; i++)
  {
    t = Math.random()*twopi;
    r = Math.random();
    r *= r;
    r *= iron_filings_img.width/2.3;
    iron_filings_img.context.fillRect(iron_filings_img.width/2+cos(t)*r-1,iron_filings_img.height/2+sin(t)*r-1,2,2);
  }
  */

  mag_film_img = new Image();
  mag_film_img.src = "assets/mag_film.png";
  mag_film_dot_img = new Image();
  mag_film_dot_img.src = "assets/mag_film_dot.png";
  mag_film_drop_img = new Image();
  mag_film_drop_img.src = "assets/mag_film_drop.png";
  /*
  mag_film_img = GenIcon(300,300);
  mag_film_img.context.strokeStyle = "#2EBE85"; //dark green
  mag_film_img.context.fillStyle = "#7AE4AA"; //light green
  mag_film_img.context.lineWidth = 5;
  mag_film_img.context.fillRect(0,0,mag_film_img.width,mag_film_img.height);
  mag_film_img.context.strokeRect(mag_film_img.context.lineWidth/2,mag_film_img.context.lineWidth/2,mag_film_img.width-mag_film_img.context.lineWidth,mag_film_img.height-mag_film_img.context.lineWidth);
  */

  var bev = 10;
  mag_n_tip_img = new Image();
  mag_n_tip_img.src = "assets/mag_n.png";
  /*
  mag_n_tip_img = GenIcon(100,100);
  mag_n_tip_img.context.fillStyle = "#FF0000";
  mag_n_tip_img.context.fillRect(0,0,mag_n_tip_img.width,mag_n_tip_img.height);
  mag_n_tip_img.context.fillStyle = "#880000";
  mag_n_tip_img.context.fillRect(0,0,mag_n_tip_img.width,bev);
  mag_n_tip_img.context.fillRect(0,mag_n_tip_img.height-bev,mag_n_tip_img.width,bev);
  mag_n_tip_img.context.fillRect(0,0,bev,mag_n_tip_img.height);
  mag_n_tip_img.context.fillStyle = "#000000";
  mag_n_tip_img.context.font = "80px Arial"
  mag_n_tip_img.context.textAlign = "center";
  mag_n_tip_img.context.fillText("N",mag_n_tip_img.width/2,mag_n_tip_img.height*0.8);
  */

  mag_n_img = new Image();
  mag_n_img.src = "assets/mag_red.png";
  /*
  mag_n_img = GenIcon(100,100);
  mag_n_img.context.fillStyle = "#FF0000";
  mag_n_img.context.fillRect(0,0,mag_n_img.width,mag_n_img.height);
  mag_n_img.context.fillStyle = "#880000";
  mag_n_img.context.fillRect(0,0,mag_n_img.width,bev);
  mag_n_img.context.fillRect(0,mag_n_img.height-bev,mag_n_img.width,bev);
  */

  mag_s_tip_img = new Image();
  mag_s_tip_img.src = "assets/mag_s.png";
  /*
  mag_s_tip_img = GenIcon(100,100);
  mag_s_tip_img.context.fillStyle = "#00FF00";
  mag_s_tip_img.context.fillRect(0,0,mag_s_tip_img.width,mag_s_tip_img.height);
  mag_s_tip_img.context.fillStyle = "#008800";
  mag_s_tip_img.context.fillRect(0,0,mag_s_tip_img.width,bev);
  mag_s_tip_img.context.fillRect(0,mag_s_tip_img.height-bev,mag_s_tip_img.width,bev);
  mag_s_tip_img.context.fillRect(mag_s_tip_img.width-bev,0,bev,mag_s_tip_img.height);
  mag_s_tip_img.context.fillStyle = "#000000";
  mag_s_tip_img.context.font = "80px Arial"
  mag_s_tip_img.context.textAlign = "center";
  mag_s_tip_img.context.fillText("S",mag_s_tip_img.width/2,mag_s_tip_img.height*0.8);
  */

  mag_s_img = new Image();
  mag_s_img.src = "assets/mag_blue.png";
  /*
  mag_s_img = GenIcon(100,100);
  mag_s_img.context.fillStyle = "#00FF00";
  mag_s_img.context.fillRect(0,0,mag_s_img.width,mag_s_img.height);
  mag_s_img.context.fillStyle = "#008800";
  mag_s_img.context.fillRect(0,0,mag_s_img.width,bev);
  mag_s_img.context.fillRect(0,mag_s_img.height-bev,mag_s_img.width,bev);
  */

  w = 100;
  h = 100;
  guess_n_img = GenIcon(w,h);
  guess_n_img.context.fillStyle = "#FFFFFF";
  guess_n_img.context.beginPath();
  guess_n_img.context.arc(w/2,h/6,h/6,0,2*Math.PI);
  guess_n_img.context.fill();
  guess_n_img.context.beginPath();
  guess_n_img.context.moveTo(w/3,h/6);
  guess_n_img.context.lineTo(w/2,h/2);
  guess_n_img.context.lineTo(2*w/3,h/6);
  guess_n_img.context.fill();
  var b = 4;
  guess_n_img.context.fillStyle = "#000000";
  guess_n_img.context.beginPath();
  guess_n_img.context.arc(w/2,h/6,h/6-b,0,2*Math.PI);
  guess_n_img.context.fill();
  guess_n_img.context.beginPath();
  guess_n_img.context.moveTo(b+w/3,h/6);
  guess_n_img.context.lineTo(w/2,h/2-b);
  guess_n_img.context.lineTo(2*w/3-b,h/6);
  guess_n_img.context.fill();

  guess_s_img = GenIcon(w,h);
  guess_s_img.context.drawImage(guess_n_img,0,0,w,h);

  guess_n_img.context.fillStyle = "#FFFFFF";
  guess_n_img.context.textAlign = "center";
  guess_n_img.context.fillText("N",w/2,h/4);
  guess_s_img.context.fillStyle = "#FFFFFF";
  guess_s_img.context.textAlign = "center";
  guess_s_img.context.fillText("S",w/2,h/4);


  sidebar_tools_img = new Image();
  sidebar_tools_img.src = "assets/sidebar_tools.png";
  sidebar_guess_img = new Image();
  sidebar_guess_img.src = "assets/sidebar_guess.png";
  guess_btn_img = new Image();
  guess_btn_img.src = "assets/guess_btn.png";
  tools_btn_img = new Image();
  tools_btn_img.src = "assets/tools_btn.png";

  tall_img = new Image();
  tall_img.src = "assets/scout.png";
}

