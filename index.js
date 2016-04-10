// пример многоугольников
var examples = {
  first: [
    { x: 60,  y: 60  },
    { x: 180, y: 0   },
    { x: 300, y: 60  },
    { x: 300, y: 300 },
    { x: 240, y: 180 },
    { x: 210, y: 180 },
    { x: 180, y: 240 },
    { x: 150, y: 180 },
    { x: 120, y: 180 },
    { x: 60,  y: 300 },
  ],
  second: [
    { x: 30,  y: 240 },
    { x: 330, y: 240 },
    { x: 330, y: 210 },
    { x: 270, y: 90  },
    { x: 210, y: 270 },
    { x: 210, y: 90  },
    { x: 180, y: 60  },
    { x: 150, y: 90  },
    { x: 150, y: 270 },
    { x: 90,  y: 90  },
    { x: 30,  y: 210 }
  ]


};

function drawPath(data, container, color) {
  var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  var str = 'M' + data[0].x + ',' + data[0].y+' ';
  str += data.slice(1).map(function (point) {
    return 'L' + point.x + ',' + point.y;
  }).join(' ');
  str += 'L' + data[0].x + ',' + data[0].y+' ';
  path.setAttribute('d', str);
  path.style.fill = color;
  container.appendChild(path);
}

function drawPathRed(data, container, color) {
  var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  var str = 'M' + data[0].x + ',' + data[0].y+' ';
  str += data.slice(1).map(function (point) {
    return 'L' + point.x + ',' + point.y;
  }).join(' ');
  str += 'L' + data[0].x + ',' + data[0].y+' ';
  path.setAttribute('d', str);
  path.style.fill = color;
  path.style.stroke = 'red';
  container.appendChild(path);
}



var one = examples.first;
var two = examples.second;

console.log(one);
console.log(two);

drawPath(one, document.querySelector('svg.base'), 'navy');
drawPath(two, document.querySelector('svg.base'), 'yellow');
var int = intersect(one, two)
console.log(int);
int.forEach(function (p) {
  drawPath(p, document.querySelector('svg.intersections'), 'red');
});

