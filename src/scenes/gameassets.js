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
var tools_lbl_img;
var guess_lbl_img;
var guess_btn_img;
var nice_job_img;

var btn_game_img;
var btn_playground_img;
var btn_tutorial_img;
var comic_img;
var menu_grad_img;
var menu_logo_img;

var star_empty_img;
var star_filled_img;

var char_imgs;

var bg_imgs;
var bg_0_img;
var bg_1_img;
var bg_2_img;

var junk_imgs;
var junk_0_img;
var junk_1_img;
var junk_2_img;
var junk_3_img;
var junk_4_img;

var junk_big_imgs;
var junk_big_0_img;
var junk_big_1_img;

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
  var pin_img = new Image();

  pin_img.src = "assets/pin_n.png";
  guess_n_img = GenIcon(w,h);
  guess_n_img.context.drawImage(pin_img,w/4,0,w/2,h/2+7);
  /*
  guess_n_img.context.strokeStyle = "#000000";
  guess_n_img.context.beginPath();
  guess_n_img.context.arc(w/2,h/2,5,0,2*Math.PI);
  guess_n_img.context.stroke();
*/

  pin_img.src = "assets/pin_s.png";
  guess_s_img = GenIcon(w,h);
  guess_s_img.context.drawImage(pin_img,w/4,0,w/2,h/2+7);
  /*
  guess_s_img.context.strokeStyle = "#000000";
  guess_s_img.context.beginPath();
  guess_s_img.context.arc(w/2,h/2,5,0,2*Math.PI);
  guess_s_img.context.stroke();
  */

  sidebar_tools_img = new Image();
  sidebar_tools_img.src = "assets/sidebar_tools.png";
  sidebar_guess_img = new Image();
  sidebar_guess_img.src = "assets/sidebar_guess.png";
  guess_lbl_img = new Image();
  guess_lbl_img.src = "assets/guess_lbl.png";
  tools_lbl_img = new Image();
  tools_lbl_img.src = "assets/tools_lbl.png";
  guess_btn_img = new Image();
  guess_btn_img.src = "assets/guess_btn.png";

  nice_job_img = new Image();
  nice_job_img.src = "assets/nicejob.png";

  btn_game_img = new Image();
  btn_game_img.src = "assets/btn_game.png";
  btn_playground_img = new Image();
  btn_playground_img.src = "assets/btn_playground.png";
  btn_tutorial_img = new Image();
  btn_tutorial_img.src = "assets/btn_tutorial.png";
  comic_img = new Image();
  comic_img.src = "assets/comic.png";
  menu_grad_img = new Image();
  menu_grad_img.src = "assets/menu/menu_gradient.png";
  menu_logo_img = new Image();
  menu_logo_img.src = "assets/menu/menu_logo.png";

  star_empty_img = new Image();
  star_empty_img.src = "assets/star-empty.png";
  star_filled_img = new Image();
  star_filled_img.src = "assets/star-filled.png";

  char_imgs = [];
  for(var i = 0; i < 7; i++)
  {
    char_imgs[i] = new Image();
    char_imgs[i].src = "assets/chars/face/char_"+i+".png";
  }

  bg_imgs = [];
  bg_0_img = new Image(); bg_0_img.src = "assets/bg_0.png"; bg_imgs.push(bg_0_img);
  bg_1_img = new Image(); bg_1_img.src = "assets/bg_1.png"; bg_imgs.push(bg_1_img);
  bg_2_img = new Image(); bg_2_img.src = "assets/bg_2.png"; bg_imgs.push(bg_2_img);

  junk_imgs = [];
  junk_0_img = new Image(); junk_0_img.src = "assets/junk_0.png"; junk_imgs.push(junk_0_img);
  junk_1_img = new Image(); junk_1_img.src = "assets/junk_1.png"; junk_imgs.push(junk_1_img);
  junk_2_img = new Image(); junk_2_img.src = "assets/junk_2.png"; junk_imgs.push(junk_2_img);
  junk_3_img = new Image(); junk_3_img.src = "assets/junk_3.png"; junk_imgs.push(junk_3_img);
  junk_4_img = new Image(); junk_4_img.src = "assets/junk_4.png"; junk_imgs.push(junk_4_img);

  junk_big_imgs = [];
  junk_big_0_img = new Image(); junk_big_0_img.src = "assets/junk_big_0.png"; junk_big_imgs.push(junk_big_0_img);
  junk_big_1_img = new Image(); junk_big_1_img.src = "assets/junk_big_1.png"; junk_big_imgs.push(junk_big_1_img);
}

