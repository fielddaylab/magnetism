var circle;
var hcircle;

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

