function mtxMatrix() {
    this.revive = function(json) {
        this.kind = json.kind;
        this.line1 = new mtxLine();
        this.line1.revive(json.line1);
        this.line2 = new mtxLine();
        this.line2.revive(json.line2);
        this.line3 = new mtxLine();
        this.line3.revive(json.line3);
    }
    this.init = function(scaleInPct) {
        var min = scaleInPct * 100;
        var max = 100 - min;
        this.kind = 'mtxMatrix';
        this.line1 = new mtxLine();
        this.line1.init(min,min,max,max, 'Up','Down'," text 1", " text 2");
        this.line1.thickness = 8;
        this.line2 = new mtxLine();
        this.line3 = new mtxLine();
        this.line2.init(min,50,max,50, 'Strange','Beauty'," text 1", " text 2 text 2 text 2 text 2 text 2");
        this.line3.init(min,max,max,min, 'Positive','Negative'," text 1", " text 2");
    }
    this.draw = function(canvas) {
        this.line1.draw(canvas);
        this.line2.draw(canvas);
        this.line3.draw(canvas);
    }
}
function mtxLine() {
    this.revive = function(json) {
        this.kind = json.kind;
        this.x1 = json.x1; this.x2 = json.x2; this.y1 = json.y1; this.y2 = json.y2;
        this.type = json.type;
        this.lineCap = json.lineCap;
        this.text1 = json.text1; this.text2 = json.text2;
        this.boxText1 = json.boxText1; this.boxText2 = json.boxText2;
        this.thickness = json.thickness;
    }
    this.init = function(x1, y1, x2, y2, text1, text2, boxText1, boxText2) {
        this.kind = 'mtxLine';
        this.x1 = x1; this.x2 = x2; this.y1 = y1; this.y2 = y2;
        this.type = 'line';
        this.lineCap = 'round';
        this.text1 = text1; this.text2 = text2;
        this.boxText1 = boxText1; this.boxText2 = boxText2;
        this.thickness = 4;
    }
    this.draw = function(canvas) {
        var x1 = this.x1, x2 = this.x2, y1 = this.y1, y2 = this.y2;
        var scaleX = canvas.width/100;
        var scaleY = canvas.height/100;
        var sx1 = this.x1 * scaleX; var sy1 = this.y1 * scaleY;
        var sx2 = this.x2 * scaleX; var sy2 = this.y2 * scaleY;
        var sthickness = this.thickness * scaleY;
        ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(sx1, sy1);
        ctx.lineTo(sx2, sy2);
        ctx.lineCap = 'round';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = sthickness;
        ctx.stroke();
        ctx.closePath();
        var slope = (sy1-sy2)/(sx1-sx2);
        var radians = Math.atan(slope);
        var xAdj = .25 * (x2 - x1); var yAdj = .25 * (y2 - y1);
        var t1 = new mtxText(x1+xAdj,y1+yAdj,radians,'center',this.text1);
        t1.calculateTextSizeFromThickness(scaleY, this.thickness);
        //alert("t1 is " + t1.__proto__.kind);
        t1.draw(canvas);
        var t2 = new mtxText(x2-xAdj,y2-yAdj,radians,'center',this.text2);
        t2.calculateTextSizeFromThickness(scaleY, this.thickness);
        t2.draw(canvas);
        var tb1 = new mtxTextBox(this.x1, this.y1, 15, this.thickness, this.boxText1);
        //alert("tb1 is " + tb1.__proto__.kind);
        //alert("tb1.proto is " + tb1.__proto__.kind);
        //alert("tb1.proto.proto is " + tb1.__proto__.__proto__.kind);
        tb1.calculateTextSizeFromThickness(scaleY, this.thickness);
        tb1.draw(canvas);
        var tb2 = new mtxTextBox(this.x2, this.y2, 15, this.thickness,this.boxText2);
        tb2.calculateTextSizeFromThickness(scaleY, this.thickness);
        tb2.draw(canvas );
    }
}
function mtxTextBox(x,y,w,h,text) {      // x,y are at center of box
    this.kind = 'mtxTextBox';
    this.w = w; this.h = h;
    this.x = x - this.w/2; this.y = y - this.h/2;
    this.text = text;
    this.draw = function(canvas) {
        var scaleX = canvas.width/100;
        var scaleY = canvas.height/100;
        var sx = this.x * scaleX; var sy = this.y * scaleY; var sw = this.w * scaleX;
        var sh = this.h * scaleY;
        var sborder = this.borderSize * scaleX;
        var spadding = this.paddingSize * scaleX;
        if (this.borderSize > 0 && sborder == 0) sborder = 1;
        if (this.paddingSize > 0 && spadding == 0) spadding = 1;
        // width will be kept fixed, and height will be adjusted. so sh is just the height of one line.
        ctx.font = this.textSize + " " + this.textFont;
        var boxY = wrapText(ctx,this.text, sx+sborder+spadding, sy+sborder-spadding, sw, sh, 1);
        ctx = canvas.getContext('2d');
        ctx.fillStyle = this.borderColor;
        ctx.fillRect(sx,sy,sw,boxY);
        //alert(this.color + "," + this.borderSize);
        ctx.fillStyle = this.color;
        ctx.fillRect(sx+sborder,sy+sborder,sw-2*sborder ,boxY-2*sborder);
        ctx.fillStyle = this.textColor;
        //ctx.fillText(this.text,sx+sborder,sy+sh-2*sborder);
        boxY = wrapText(ctx,this.text, sx+sborder+spadding, sy+sborder+spadding, sw, sh, 0);
    }
    function wrapText(context, text, x, y, maxWidth, lineHeight, pretend) {
        ctx.textBaseline = 'top';
        var words = text.split(' ');
        var line = '';
        var boxY = lineHeight;
        for(var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + ' ';
          var metrics = context.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            if (pretend != 1) context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight; boxY += lineHeight;
          }
          else {
            line = testLine;
          }
        }
        if (pretend != 1) context.fillText(line, x, y);
        //alert("y = " + y + " for text: " + text);
        return boxY ;
    }   
}

function mtxText(x,y,radians,alignment,text) {
    this.kind = 'mtxText';
    this.x = x; this.y = y; this.radians = radians; this.alignment = alignment; this.text = text;
    this.borderSize = .2;
    this.paddingSize = .2;
    this.textColor = 'red';
    this.textFont = 'Calibri';
    this.textSize = '16px';     // in Pixels!
    this.draw = function(canvas) {
        //alert('Color is ' + this.color);
        var scaleX = canvas.width/100;
        var scaleY = canvas.height/100;
        var sx = this.x * scaleX; var sy = this.y * scaleY; 
        ctx = canvas.getContext('2d');
        ctx.save();
        ctx.translate(sx,sy);
        ctx.rotate(this.radians);
        ctx.textAlign = this.alignment;
        ctx.fillStyle = this.textColor;
        ctx.font = this.textSize + " " + this.textFont;
        //alert(ctx.font);   
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text,0,0);
        ctx.restore();
    }
    this.calculateTextSizeFromThickness = function(scaleY, thickness) {
        var temp =thickness - 2 * this.borderSize - 2 * this.paddingSize; 
        //alert(this.thickness + "," + scaleY + "," + temp);   
        this.textSize = Math.floor(temp * scaleY) + "px";
    }
    this.revive = function(mtxTextData) {
        this.x = mtxTextData.x;        
    }
}
function mtxWidget() {
    this.kind='mtxWidget';
    this.color =  'yellow';
    this.borderColor = 'blue';
}
var mtxTypes = {};          // Registry of types
mtxTypes.mtxText = mtxText;
mtxTypes.mtxTextBox = mtxTextBox;
mtxTypes.mtxLine = mtxLine;
mtxTypes.mtxMatrix = mtxMatrix;

mtxText.prototype = new mtxWidget();
mtxTextBox.prototype = new mtxText();
mtxLine.prototype = new mtxWidget();
mtxMatrix.protoype = new mtxWidget();

