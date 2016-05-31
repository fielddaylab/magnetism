var circle;
var hcircle;
var mag_n_tip;
var mag_n;
var mag_s_tip;
var mag_s;

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

var bev = 10;
mag_n_tip = GenIcon(100,100);
mag_n_tip.context.fillStyle = "#FF0000";
mag_n_tip.context.fillRect(0,0,mag_n_tip.width,mag_n_tip.height);
mag_n_tip.context.fillStyle = "#880000";
mag_n_tip.context.fillRect(0,0,mag_n_tip.width,bev);
mag_n_tip.context.fillRect(0,mag_n_tip.height-bev,mag_n_tip.width,bev);
mag_n_tip.context.fillRect(0,0,bev,mag_n_tip.height);
mag_n_tip.context.fillStyle = "#000000";
mag_n_tip.context.font = "80px Arial"
mag_n_tip.context.textAlign = "center";
mag_n_tip.context.fillText("N",mag_n_tip.width/2,mag_n_tip.height*0.8);

mag_n = GenIcon(100,100);
mag_n.context.fillStyle = "#FF0000";
mag_n.context.fillRect(0,0,mag_n.width,mag_n.height);
mag_n.context.fillStyle = "#880000";
mag_n.context.fillRect(0,0,mag_n.width,bev);
mag_n.context.fillRect(0,mag_n.height-bev,mag_n.width,bev);

mag_s_tip = GenIcon(100,100);
mag_s_tip.context.fillStyle = "#00FF00";
mag_s_tip.context.fillRect(0,0,mag_s_tip.width,mag_s_tip.height);
mag_s_tip.context.fillStyle = "#008800";
mag_s_tip.context.fillRect(0,0,mag_s_tip.width,bev);
mag_s_tip.context.fillRect(0,mag_s_tip.height-bev,mag_s_tip.width,bev);
mag_s_tip.context.fillRect(mag_s_tip.width-bev,0,bev,mag_s_tip.height);
mag_s_tip.context.fillStyle = "#000000";
mag_s_tip.context.font = "80px Arial"
mag_s_tip.context.textAlign = "center";
mag_s_tip.context.fillText("S",mag_s_tip.width/2,mag_s_tip.height*0.8);

mag_s = GenIcon(100,100);
mag_s.context.fillStyle = "#00FF00";
mag_s.context.fillRect(0,0,mag_s.width,mag_s.height);
mag_s.context.fillStyle = "#008800";
mag_s.context.fillRect(0,0,mag_s.width,bev);
mag_s.context.fillRect(0,mag_s.height-bev,mag_s.width,bev);

