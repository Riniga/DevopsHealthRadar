var average_all = []
var all_answeres= [];
var scale = 54;

for (var i=0;i<16;i++) all_answeres.push([0,0,0,0,0]);


function DrawResults()
{
  average_all = []
  all_answeres= [];
  for (var i=0;i<16;i++) all_answeres.push([0,0,0,0,0]);
  
  var areaFilter = document.getElementById("area");
  //var roleFilter = document.getElementById("role");
  var area= areaFilter.options[areaFilter.selectedIndex].value;
  //var role = roleFilter.options[roleFilter.selectedIndex].value

  DrawResultsFiltered(area, '');
  console.log(average_all);
  printAllAnsweres();
}

function printAllAnsweres()
{
  for (var i=0;i<16;i++) all_answeres.push([0,0,0,0,0]);
  console.log(all_answeres);
}
function DrawResultsFiltered(area, role)
{
    ClearCanvas();
    DrawBackground();
    fetch(GetAllHealthRadarResultsUrl, { method: 'GET'})
    .then(response => response.json())
    .then(data => {
      data.forEach(record =>
        {
          if ((area) && (record.area==area)) AddToAllAnsweres(record);
          else if ((role) && (record.role==role)) AddToAllAnsweres(record)
          else if ((!area) && (!role)) AddToAllAnsweres(record)
        } );
      CalculateAverages();
      AddAveragePerSector();
      DrawRedDots();
      DrawBlackDots();
    });
}
function ClearCanvas()
{
  var canvas = document.getElementById("thecanvas");
  var context = canvas.getContext("2d");
  context.clearRect(0,0,800, 800)
}

function DrawResultsDummy()
{
  DrawBackground();
  var data = [];
  for (var i=0;i<10;i++)
    data.push({id:"", area:"HR", role:"team", answers:[ Math.ceil(Math.random() * 5),Math.ceil(Math.random() * 5),Math.ceil(Math.random() * 5),Math.ceil(Math.random() * 5),Math.ceil(Math.random() * 5),Math.ceil(Math.random() * 5),Math.ceil(Math.random() * 5),Math.ceil(Math.random() * 5),Math.ceil(Math.random() * 5),Math.ceil(Math.random() * 5),Math.ceil(Math.random() * 5),Math.ceil(Math.random() * 5),Math.ceil(Math.random() * 5),Math.ceil(Math.random() * 5),Math.ceil(Math.random() * 5),Math.ceil(Math.random() * 5)]});
  data.forEach(record => AddToAllAnsweres(record));
  CalculateAverages();
  AddAveragePerSector();
  DrawRedDots();
  DrawBlackDots();
}

function AddToAllAnsweres(record)
{
  for (var i=0;i<16;i++)
  {
    all_answeres[i][record.answers[i]-1]+=1;
  }
}

function CalculateAverages()
{
  for (var i=0;i<16;i++)
  {
    count = 0;
    sum =0;
    for (var j=0;j<5;j++)
    {
      count+=all_answeres[i][j];
      sum += all_answeres[i][j]*(j+1);
    }
    
    average_all[i] = sum/count;
  }
}
function AddAveragePerSector()
{
  var average_area = []
  average_area[0] = (average_all[0]+average_all[1]+average_all[2]+average_all[3])/4;
  average_area[1] = (average_all[4]+average_all[5]+average_all[6]+average_all[7])/4;
  average_area[2] = (average_all[8]+average_all[9]+average_all[10]+average_all[11])/4;
  average_area[3] = (average_all[12]+average_all[13]+average_all[14]+average_all[15])/4;

  average_all.splice(4,0,average_area[0]);
  average_all.splice(9,0,average_area[1]);
  average_all.splice(14,0,average_area[2]);
  average_all.splice(19,0,average_area[3]);

}

function DrawBackground()
{
  var image = new Image();
  image.onload = function () 
  { 
    var canvas = document.getElementById("thecanvas");
    var context = canvas.getContext("2d");
    context.drawImage(image, 0, 0,800,800);
    context.lineWidth = "1";
    context.strokeStyle = "#ccc"; 
    context.beginPath();
    for (var i=1;i<6;i++) 
    {
      context.arc(400 , 400, scale*i, 0, Math.PI * 2, true);
      context.stroke();
    }
  };
  image.src = '/images/HealtRadarBackground.png';
}

function DrawRedDots()
{
  var dx=400;
  var dy=400;
  var dAngle = 0.1*Math.PI
  var angle = dAngle/2-Math.PI/2;

  var canvas = document.getElementById("thecanvas");
  var context = canvas.getContext("2d");
  context.fillStyle = "#f00";
  context.lineWidth = "2";
  context.strokeStyle = "#f00"; 

  for (var i =0;i<average_all.length;i++)
  {
      var x1 = scale * average_all[i] * Math.cos(angle);
      var y1 = scale * average_all[i] * Math.sin(angle);
      var x2 = scale * average_all[(i+1)%average_all.length] * Math.cos(angle+dAngle);
      var y2 = scale * average_all[(i+1)%average_all.length] * Math.sin(angle+dAngle);

      context.beginPath();
      context.arc(x1+dx , y1+dy, 4, 0, Math.PI * 2, true);
      context.fill();

      context.beginPath();
      context.moveTo(x1+dx, y1+dy);
      context.lineTo(x2+dx, y2+dy);
      context.stroke();
      angle += dAngle;
  }
}

function DrawBlackDots()
{
  var dx=400;
  var dy=400;
  var dAngle = 0.1*Math.PI;
  var angle = 0.0-Math.PI/2;

  var canvas = document.getElementById("thecanvas");
  var context = canvas.getContext("2d");
  context.fillStyle = "#000";

  for (var i=0;i<16;i++) 
  {
    for (var j=0;j<5;j++) 
    {
      var magnitude = scale*(j+1);
      var count = all_answeres[i][j]
      var dAngle2 = 0.1*Math.PI/(count+1);
      for (var k=0;k<count;k++)
      {
        var x1 = magnitude * Math.cos(angle+(k+1)*dAngle2);
        var y1 = magnitude * Math.sin(angle+(k+1)*dAngle2);
        context.beginPath();
        context.arc(x1+dx , y1+dy, 2, 0, Math.PI * 2, true);
        context.fill();
      }
    }
    angle += dAngle;
    if(i%4==3) angle += dAngle;
  }
}

var areaFilter = document.getElementById("area")
areaFilter.addEventListener('change',DrawResults);

// var roleFilter = document.getElementById("role")
// roleFilter.addEventListener('change',DrawResults);

DrawResults();


