var GamePlayScene = function(game, stage)
{
  var self = this;

  var canv = stage.drawCanv;
  var canvas = canv.canvas;
  var ctx = canv.context;

  var w = 30;
  var h = 30;

  var vfield;
  var charges;

  self.ready = function()
  {
    vfield = new VecField2d(w,h)
    charges = [];
    charges[0] = new Charge(0.4,0.5,-1);
    charges[1] = new Charge(0.6,0.5, 1);
  };

  self.tick = function()
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
    for(var i = 0; i < vfield.h; i++)
    {
      y = indexToSample(i,vfield.h);
      for(var j = 0; j < vfield.w; j++)
      {
        index = vfield.iFor(j,i);
        x = indexToSample(j,vfield.w);

        vfield.y.buff[index] = 0;
        vfield.x.buff[index] = 0;
        for(var k = 0; k < charges.length; k++)
        {
          yd = y-charges[k].y;
          xd = x-charges[k].x;
          r2 = (xd*xd)+(yd*yd);
          if(r2 == 0) f = 0;
          else        f = charges[k].v/r2;
          r = sqrt(r2);
          vfield.y.buff[index] += f*yd/r;
          vfield.x.buff[index] += f*xd/r;
        }

        //repurposing variables- just making sure vector is < some length
        yd = vfield.y.buff[index];
        xd = vfield.x.buff[index];
        r2 = (xd*xd)+(yd*yd);
        if(r2 > maxlen*maxlen)
        {
          r = sqrt(r2);
          vfield.y.buff[index] = yd/r*maxlen;
          vfield.x.buff[index] = xd/r*maxlen;
        }
      }
    }
  };

  self.draw = function()
  {
    var x_space;
    var y_space;
    var vec_length = 2;

    ctx.lineWidth = 1.0;
    ctx.strokeStyle = "#FF00FF";
    ctx.fillStyle = "#550055";

    x_space = canv.width / vfield.w;
    y_space = canv.height / vfield.h;
    for(var i = 0; i < vfield.h; i++)
    {
      for(var j = 0; j < vfield.w; j++)
      {
        y = y_space*i+(y_space/2);
        x = x_space*j+(x_space/2);
        index = vfield.iFor(j,i);
        if(abs(vfield.x.buff[index]) > 0.1 && abs(vfield.x.buff[index]) > 0.1)
        {
          ctx.fillRect(x-1,y-1,2,2);
          canv.drawLine(x,y,x+vfield.x.buff[index]*vec_length,y+vfield.y.buff[index]*vec_length);
        }
      }
    }
  };

  self.cleanup = function()
  {
  };

  //index:  0 refers to first, 1 refers to second, 0.5 refers to "the value between first and second"
  //sample: both 0 AND 1 refer to, identically, "the value between last and first", 0.5 refers to "the value between first and last"
  function indexToSample (i,n) { return   (i+0.5)/n;       }
  function indexToSampleW(i,n) { return (((i+0.5)/n)+1)%1; }
  function sampleToIndex (s,n) { return   (s*n)-0.5;       }
  function sampleToIndexW(s,n) { return (((s*n)-0.5)+n)%n; }

  //wrap inc/dec
  function decw(i,n) { return ((i-1)+n)%n; };
  function incw(i,n) { return (i+1)%n; };

  var HeightMap = function(w,h)
  {
    var self = this;
    self.w = w;
    self.h = h;
    self.buff = [];
    for(var i = 0; i < w*h; i++) self.buff[i] = 0;

    self.iFor = function(x,y) { return (y*w)+x; }
    self.sample_index = function(x,y)
    {
      return self.buff[self.iFor(x,y)];
    }
    self.sample = function(x,y)
    {
      x = sampleToIndexW(x,self.w);
      y = sampleToIndexW(y,self.h);
      var low_x  = floor(x);
      var high_x = ceil (x)%self.w;
      var low_y  = floor(y);
      var high_y = ceil (y)%self.h;

      var tl = self.buff[self.iFor( low_x, low_y)];
      var tr = self.buff[self.iFor(high_x, low_y)];
      var bl = self.buff[self.iFor( low_x,high_y)];
      var br = self.buff[self.iFor(high_x,high_y)];

      var t = lerp(tl,tr,x%1);
      var b = lerp(bl,br,x%1);
      return lerp(t,b,y%1);
    }
  }
  var VecField2d = function(w,h)
  {
    var self = this;
    self.w = w;
    self.h = h;
    self.x = new HeightMap(w,h);
    self.y = new HeightMap(w,h);

    self.sample = function(x,y)
    {
      return {x:self.x.sample(x,y),y:self.y.sample(x,y)};
    }
    self.sampleFill = function(x,y,obj)
    {
      obj.x = self.x.sample(x,y);
      obj.y = self.y.sample(x,y);
      return obj;
    }
    self.samplePolar = function(x,y)
    {
      var x_val = self.x.sample(x,y);
      var y_val = self.y.sample(x,y);

      var ret = {dir:0,len:0};
      ret.len = sqrt(x_val*x_val+y_val*y_val);
      x_val /= ret.len;
      y_val /= ret.len;
      if(ret.len < 0.001) ret.dir = 0;
      else ret.dir = atan2(y_val,x_val);

      return ret;
    }
    self.samplePolarFill = function(x,y,obj)
    {
      var x_val = self.x.sample(x,y);
      var y_val = self.y.sample(x,y);

      obj.len = sqrt(x_val*x_val+y_val*y_val);
      x_val /= obj.len;
      y_val /= obj.len;
      if(obj.len < 0.001) obj.dir = 0;
      else obj.dir = atan2(y_val,x_val);

      return obj;
    }
    self.polarAtIndex = function(i)
    {
      var x_val = self.x.data[i];
      var y_val = self.y.data[i];

      var ret = {dir:0,len:0};
      ret.len = sqrt(x_val*x_val+y_val*y_val);
      x_val /= ret.len;
      y_val /= ret.len;
      if(ret.len < 0.001) ret.dir = 0;
      else ret.dir = atan2(y_val,x_val);

      return ret;
    }
    self.polarAtIndexFill = function(i,obj)
    {
      var x_val = self.x.data[i];
      var y_val = self.y.data[i];

      obj.len = sqrt(x_val*x_val+y_val*y_val);
      x_val /= obj.len;
      y_val /= obj.len;
      if(obj.len < 0.001) obj.dir = 0;
      else obj.dir = atan2(y_val,x_val);

      return obj;
    }

    self.iFor = self.x.iFor;
  }

  var Charge = function(x,y,v)
  {
    this.x = x;
    this.y = y;
    this.v = v;
  }

};

