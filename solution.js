(function () {
  var List = {
    createPoint: function (x, y) {
      return {
        x: x,
        y: y,
        isBelong: false,
        intersect: null,
        next: null,
        prev: null
      }
    },

    createList: function (polygon) {
      var list = {
        len: 0,
        head: null,
        current: null,
        tail: null

      };
      for (var i = 0; i < polygon.length; i++) {
        var item = this.createPoint(polygon[i].x, polygon[i].y);

        if (list.head == null) {
          list.head = item;
          list.current = item;
        } else {
          item.prev = list.current;
          list.current.next = item;
          list.current = list.current.next;

        }
        list.len++;
      }
      list.tail = list.current;
      list.current = list.head;
      list.tail.next = list.head;
      list.head.prev = list.tail;

      return list;
    },

    printList: function (list) {
      list.current = list.head;
      do {
        if (list.current.intersect != null) {
//          console.log("(%d, %d) -> %d -|-> (%d, %d)",list.current.x, list.current.y,
//           list.current.isBelong, list.current.intersect.x, list.current.intersect.y);
        } else {
//          console.log("(%d, %d) -> %d",list.current.x, list.current.y,
//            list.current.isBelong);
        }

        list.current = list.current.next;
      } while (list.current != list.head);
      list.current = list.head;
    },

    printListR: function printListR(list) {
      list.current = list.tail;
      do {
        if (list.current.intersect != null) {
//          console.log("(%d, %d) -> %d -|-> (%d, %d)",list.current.x, list.current.y,
//            list.current.isBelong, list.current.intersect.x, list.current.intersect.y);
        } else {
//          console.log("(%d, %d) -> %d",list.current.x, list.current.y,
//            list.current.isBelong);
        }

        list.current = list.current.prev;
      } while (list.current != list.tail);
      list.current = list.head;
    }
  };

  var PolygonNormalizer = {
    _splitToSimplePolygons: function (pol) {
      var polygons = [];
      var poly = [];

      var list = List.createList(pol);
      var current = list.head;

      var newIter = false;

      do {
        var newIter = false;
        poly.push(current);

        var innerCurrent = current.next;
        var s1 = {p1: current, p2: current.next};
//         console.log('=================================')
        do {
          var s2 = {p1: innerCurrent, p2: innerCurrent.next};
//           console.log('--------------------------');
//           console.log('checking intersection');
//           console.log('section A (', s1.p1.x, s1.p1.y, ') (', s1.p2.x, s1.p2.y, ')');
//           console.log('section B (', s2.p1.x, s2.p1.y, ') (', s2.p2.x, s2.p2.y, ')');

          var intersection = isCrossingSections(s1, s2);
          if (intersection) {
            poly.push({x: intersection.x, y: intersection.y});

            var curr = innerCurrent.next;
            while (curr != poly[0]) {
              poly.push(curr);
              curr = curr.next;
            }

            polygons.push(poly);
            poly = [];

            var newPoint = List.createPoint(intersection.x, intersection.y);
            newPoint.next = current.next;
            newPoint.prev = innerCurrent;

            newPoint.next.prev = newPoint;
            newPoint.prev.next = newPoint;


            list.head = newPoint;
            list.tail = newPoint.prev;

            current.next = newPoint;

            newIter = true;

            break;
          }

          innerCurrent = innerCurrent.next;
        } while (innerCurrent != current);
        current = current.next;
      } while ((current != list.head) || newIter);

      polygons.push(poly);

      return polygons;

    },

    _normalizePolygons: function (polygons) {
      for (var i = 0; i < polygons.length; i++) {
        if (this.findSquare(polygons[i]) < 0) {
          polygons[i] = polygons[i].reverse();
        }
      }
      return polygons;
    },

    _printSimplePolys: function (simplePolys) {
      for (var i = 0; i < simplePolys.length; i++) {
        var simple = simplePolys[i];

        var points = simple.map(function (point) {
          return "(" + point.x + ", " + point.y + ")";
        });

//         console.log('poly ', i, points.join(' -> '), 'with square', findSquare(simple));
      }
    },

    findSquare: function (polygon) {
      //must be simple polygon (without intersections)
      var square = 0;

      var polygonLength = polygon.length;

      for (var i = 0; i < polygonLength; i++) {
        var s = Sections.getSections(polygon)[i];
        square = square + (s.p1.x * s.p2.y - s.p2.x * s.p1.y) / 2;
      }
      //если площадь вышла отрицательной - то многоугольник закручен против часовой стрелки
      return square;
    },

    splitToSimple: function (polygon) {
      return this._normalizePolygons(this._splitToSimplePolygons(polygon));
    }
  };

  var Sections = {
    isSectionHorizontal: function (section) {
      return section.p1.y == section.p2.y;
    },

    isSectionDownward: function (section) {
      return section.p1.y < section.p2.y;
    },

    isSectionUpward: function (section) {
      return section.p1.y > section.p2.y;
    },

    getSections: function (polygon) {
      var sections = [];
      var polygonLength = polygon.length;
      for (var i = 0; i < polygonLength - 1; i++) {
        sections.push({p1: polygon[i], p2: polygon[i + 1]});
      }
      sections.push({p1: polygon[i], p2: polygon[0]});
      return sections;
    }
  };

  function isOverlap(p1, p2) {
    var x1 = p1.x;
    var x2 = p2.x;
    var y1 = p1.y;
    var y2 = p2.y;

    if ((x1 == x2) && (y1 == y2)) {
      return true;
    }
    return false;
  }


  function isCrossingVectors(s1, s2) {

    var x1 = s1.p1.x;
    var x2 = s1.p2.x;
    var x3 = s2.p1.x;
    var x4 = s2.p2.x;

    var y1 = s1.p1.y;
    var y2 = s1.p2.y;
    var y3 = s2.p1.y;
    var y4 = s2.p2.y;

    //optimization

    var maxX1 = (x1 >= x2) ? x1 : x2;
    var minX2 = (x1 < x2) ? x1 : x2;
    var maxX3 = (x3 >= x4) ? x3 : x4;
    var minX4 = (x3 < x4) ? x3 : x4;

    var maxY1 = (y1 >= y2) ? y1 : y2;
    var minY2 = (y1 < y2) ? y1 : y2;
    var maxY3 = (y3 >= y4) ? y3 : y4;
    var minY4 = (y3 < y4) ? y3 : y4;

    if ((minX2 > maxX3) || (minY2 > maxY3)) {
      return null;
    }

    var d = (y1 - y2) * (x4 - x3) - (y3 - y4) * (x2 - x1);

    if ((d < 0.00001) && (d > -0.00001)) {
//     console.log("isCrossingVectors: sections in parallel");
      return null;
    }

    var x = -(( x1 * y2 - x2 * y1) * (x4 - x3) - ( x3 * y4 - x4 * y3 ) * (x2 - x1)) / d;
    var y = (( y1 * x2 - y2 * x1) * (y4 - y3) - ( y3 * x4 - y4 * x3 ) * (y2 - y1)) / d;


    if ((x >= minX2) && (x <= maxX1) && (x >= minX4) && (x <= maxX3) &&
      ((y >= minY2) && (y <= maxY1) && (y >= minY4) && (y <= maxY3))) {
//     console.log("isCrossingVectors:", {x: x, y: y});
      return {x: x, y: y};
    }
//   console.log("isCrossingVectors:null");
    return null;

  }

  function isCrossingSections(s1, s2) {

    if (((s1.p2.x == s2.p2.x) && (s1.p2.y == s2.p2.y)) ||
      ((s1.p2.x == s2.p1.x) && (s1.p2.y == s2.p1.y)) ||
      ((s1.p1.x == s2.p2.x) && (s1.p1.y == s2.p2.y)) ||
      ((s1.p1.x == s2.p1.x) && (s1.p1.y == s2.p1.y))) {
//       console.log("isCrossingSections: sections in touch");
      return false;
    }

    var x1 = s1.p1.x;
    var x2 = s1.p2.x;
    var x3 = s2.p1.x;
    var x4 = s2.p2.x;

    var y1 = s1.p1.y;
    var y2 = s1.p2.y;
    var y3 = s2.p1.y;
    var y4 = s2.p2.y;

    //optimization


    var maxX1 = (x1 >= x2) ? x1 : x2;
    var minX2 = (x1 < x2) ? x1 : x2;
    var maxX3 = (x3 >= x4) ? x3 : x4;
    var minX4 = (x3 < x4) ? x3 : x4;

    var maxY1 = (y1 >= y2) ? y1 : y2;
    var minY2 = (y1 < y2) ? y1 : y2;
    var maxY3 = (y3 >= y4) ? y3 : y4;
    var minY4 = (y3 < y4) ? y3 : y4;


//   if ((minX2 > maxX3) || (minY2 > maxY3)) {
//     return null;
//   }

    var d = (y1 - y2) * (x4 - x3) - (y3 - y4) * (x2 - x1);

    if (d == 0) {
//       console.log("isCrossingSections: sections in parallel");
      return null;
    }


    var x = -(( x1 * y2 - x2 * y1) * (x4 - x3) - ( x3 * y4 - x4 * y3 ) * (x2 - x1)) / d;
    var y = (( y1 * x2 - y2 * x1) * (y4 - y3) - ( y3 * x4 - y4 * x3 ) * (y2 - y1)) / d;

    x = +x.toFixed(3);
    y = +y.toFixed(3);

    if ((x == x1) && (y == y1) ||
      (x == x2) && (y == y2) ||
      (x == x3) && (y == y3) ||
      (x == x4) && (y == y4)) {

//       console.log('lay on bound', x, y);
      return false;
    }


    if (
      ((x >= minX2) && (x <= maxX1) && (x >= minX4) && (x <= maxX3))
      &&
      ((y >= minY2) && (y <= maxY1) && (y >= minY4) && (y <= maxY3))
    ) {
//       console.log("isCrossingSections:", {x: x, y: y});
      return {x: x, y: y};
    }

//     console.log(x, y, 'not in max-min bound');


//   console.log("isCrossingSections:null");
    return null;
  }

  function isLayPointOnSection(p, s) {
    var x1 = s.p1.x;
    var y1 = s.p1.y;

    var x2 = s.p2.x;
    var y2 = s.p2.y;

    var x = p.x;
    var y = p.y;

    if (x > Math.max(x1, x2) || x < Math.min(x1, x2)) {
      return false;
    }

    if (y > Math.max(y1, y2) || y < Math.min(y1, y2)) {
      return false;
    }

    if (((x == x2) && (y == y2)) ||
      ((x == x1) && (y == y1))) {
      return false;
    }
    if ((x - x2) * (y1 - y2) == (y - y2) * (x1 - x2)) {
      return true;
    }
    return false;
  }

  function isPointInPolygon(p, polygonList) {

//   console.log(`Checking point (${p.x}, ${p.y})`);

    var ray = {
      p1: p,
      p2: {
        x: 1000,
        y: p.y
      }
    };

    var intersectionsCount = 0;

    polygonList.current = polygonList.head;
    do {
      var currentSection = {p1: polygonList.current, p2: polygonList.current.next};
      var isHorizontal = Sections.isSectionHorizontal(currentSection);
      var isDownward = Sections.isSectionDownward(currentSection);
      var isUpward = Sections.isSectionUpward(currentSection);
//       var type = (isHorizontal ? 'horizontal' : (isDownward ? 'downward' : 'upward'));
//     console.log(`-> Checking with (${currentSection.p1.x}, ${currentSection.p1.y}) -> (${currentSection.p2.x}, ${currentSection.p2.y})`, type);
      var crossingPoint = isCrossingVectors(currentSection, ray);
      if (crossingPoint) {
        if (crossingPoint.x == p.x && crossingPoint.y == p.y) {
          return true;
        }
//       console.log(`--> Intersect at (${crossingPoint.x}, ${crossingPoint.y})`);
        if (!isHorizontal) { // exclude horizontal
          if (
            (!isOverlap(crossingPoint, currentSection.p1) && isDownward)
            ||
            (!isOverlap(crossingPoint, currentSection.p2) && isUpward)
          ) {
            if (p.x < crossingPoint.x && p.y == crossingPoint.y) {
//             console.log('---> including');
              intersectionsCount++;
            } else {
//             console.log('---> intersect point not at right of current point');
            }

          } else {
            if (isDownward) {
//             console.log('---> point at start of downward, excluding');
            } else {
//             console.log('---> point at end of upward, excluding');
            }
          }
        } else {
//         console.log('---> section is horizontal, excluding');
        }
      } else {
//       console.log(`--> No intersections`);
      }


      polygonList.current = polygonList.current.next;
    } while (polygonList.current != polygonList.head);

//   console.log('--> Intersections:', intersectionsCount);
//   console.log('-------------------------->');

    return intersectionsCount % 2;
  }

  function isCrossingFourVectorsIntoOneVertex(s1, s2, s3, s4) {

    if ((s1.p2.x != s2.p1.x) || (s1.p2.y != s2.p1.y) ||
      (s3.p2.x != s4.p1.x) || (s3.p2.y != s4.p1.y)) {
//     console.log("isCrossingFourVectorsIntoOneVertex: Error input data");
      return null;
    }

    var S1dx = s1.p1.x - s1.p2.x;
    var S1dy = s1.p1.y - s1.p2.y;
    var S3dx = s3.p1.x - s3.p2.x;
    var S3dy = s3.p1.y - s3.p2.y;

    var S2dx = s2.p2.x - s2.p1.x;
    var S2dy = s2.p2.y - s2.p1.y;
    var S4dx = s4.p2.x - s4.p1.x;
    var S4dy = s4.p2.y - s4.p1.y;

    var angleS1 = getAngle(S1dx, S1dy);
    var angleS2 = getAngle(S2dx, S2dy);
    var angleS3 = getAngle(S3dx, S3dy);
    var angleS4 = getAngle(S4dx, S4dy);
//   console.log("isCrossingFourVectorsIntoOneVertex:");
//   console.log("For point (%d, %d)", s1.p2.x, s1.p2.y);
//   console.log("Angle 1: %d" , angleS1);
//   console.log("Angle 2: %d" , angleS2);
//   console.log("Angle 3: %d" , angleS3);
//   console.log("Angle 4: %d" , angleS4);

    //solving problem of existing intersection in the touching point

    if (((angleS2 - angleS4) == 0) || (Math.abs(angleS1 - angleS4) == Math.PI)) {
      return false;
    }

    var minAngleS1 = (angleS1 < angleS2) ? angleS1 : angleS2;
    var maxAngleS2 = (angleS1 >= angleS2) ? angleS1 : angleS2;

    if (((maxAngleS2 >= angleS3) && (angleS3 >= minAngleS1) &&
      (maxAngleS2 >= angleS4) && (angleS4 >= minAngleS1)) ||
      (((maxAngleS2 <= angleS3) || (angleS3 <= minAngleS1)) &&
      ((maxAngleS2 <= angleS4) || (angleS4 <= minAngleS1)))) {

      return false;
    }
    return true;

//return true/false;
  }

  function findClockWiseWay(s, s1, s2) {

    if ((s.p2.x != s1.p1.x) || (s.p2.y != s1.p1.y) ||
      (s.p2.x != s2.p1.x) || (s.p2.y != s2.p1.y)) {
//       console.log("isCrossingFourVectorsIntoOneVertex: Error input data");
      return null;
    }


    var Sdx = s.p1.x - s.p2.x;
    var Sdy = s.p1.y - s.p2.y;
    var S1dx = s1.p2.x - s1.p1.x;
    var S1dy = s1.p2.y - s1.p1.y;

    var S2dx = s2.p2.x - s2.p1.x;
    var S2dy = s2.p2.y - s2.p1.y;


    var angleS = getAngle(Sdx, Sdy);
    var angleS1 = getAngle(S1dx, S1dy);
    var angleS2 = getAngle(S2dx, S2dy);

//   console.log("Angle  : %d" , angleS);
//   console.log("Angle 1: %d" , angleS1);
//   console.log("Angle 2: %d" , angleS2);

    angleS1 = angleS1 - angleS;
    angleS2 = angleS2 - angleS;

//     console.log("-----------------------");
//     console.log("Angle 1: %d" , angleS1);
//     console.log("Angle 2: %d" , angleS2);

    if (angleS1 < 0) {
      angleS1 = angleS1 + 2 * Math.PI;
    }
    if (angleS2 < 0) {
      angleS2 = angleS2 + 2 * Math.PI;
    }

//     console.log("-----------------------");
//     console.log("Angle 1: %d" , angleS1);
//     console.log("Angle 2: %d" , angleS2);

    return (angleS1 > angleS2) ? s1 : s2;
  }

  function getAngle(dx, dy) {
    var angle = null;
    var k = 0; // it's meen on border
    if (dx == 0 && dy == 0) {
//       console.log("isVertexGoClockwise: points is overlap");
    }
    if (dx > 0 && dy > 0) {
      k = 1;
    }
    if (dx > 0 && dy < 0) {
      k = 4;
    }
    if (dx < 0 && dy > 0) {
      k = 2;
    }
    if (dx < 0 && dy < 0) {
      k = 3;
    }
    if (dx == 0) {
      angle = (dy > 0) ? (Math.PI / 2) : (Math.PI * 3 / 2);
    }
    if (dy == 0) {
      angle = (dx > 0) ? 0 : Math.PI;
    }

    if ((k != 0) && ((k == 1) || (k == 3))) {
      angle = Math.atan(Math.abs(dy / dx)) + (k - 1) * Math.PI / 2;
      return angle;
    }

    if (k != 0) {
      angle = Math.atan(Math.abs(dx / dy)) + (k - 1) * Math.PI / 2;
    }
    return angle;
  }

  function isSamePoly(poly1, poly2) {

    if (poly1.length != poly2.length) {
      return false;
    }

    var common = false;
    for (var i = 0; i < poly1.length; i++) {
      common = false;
      for (var j = 0; poly2.length; j++) {
        var p = poly1[i];
        if (p.x == poly2[j].x && p.y == poly2[j].y) {
          common = true;
        }
      }
      if (!common) {
        return false;
      }
    }
    return true;
  }

  function getIntersection(polA, polB) {
    //This is imlementation of Weiler–Atherton algorithm
    //Fig1 and fig2 must be simple polygon
    //Weiler-Atherton Polygon Clipping Algorithm
    //polA = fixVertexGoClockwise(polA);
    //polB = fixVertexGoClockwise(polB);

    var arrIntersections = [];

    //findIntersectionsOfPolygonsSection

    //item {
    //     x: 150,
    //     y: 210,
    //     isBelong: true/false,
    //     intersect: link,
    //     next: link
    //    }

    //1. List the vertices of the clipping-region polygon A and those of the subject polygon B.
    var listA = List.createList(polA);
    var listB = List.createList(polB);

    //2. Label the listed vertices of subject polygon B as either inside or outside of clipping region A.
    listB.current = listB.head;
    do {
      //console.log("---> Checking LisB:", listB.current.x, listB.current.y);
      if (isPointInPolygon(listB.current, listA)) {
        listB.current.isBelong = true;
      }

      listB.current = listB.current.next;
    } while (listB.current != listB.head);
    listB.current = listB.head;

    listA.current = listA.head;
    do {
      //console.log("---> Checking LisA:", listA.current.x, listA.current.y);
      if (isPointInPolygon(listA.current, listB)) {
        listA.current.isBelong = true;
      }

      listA.current = listA.current.next;
    } while (listA.current != listA.head);
    listA.current = listA.head;


    // 3. Find all the polygon intersections and insert them into both lists,
    // linking the lists at the intersections.
    var intersectCounter = 0;

    // point to point =================================
    listA.current = listA.head;
    do {
      listB.current = listB.head;
      do {
        //3.1 Find overlap vertices, check it for intersect, and then set them as Intersect.
        if (isOverlap(listA.current, listB.current)) {
//           console.log('point-to-point');
//           console.log('-> a', listA.current.x, listA.current.y);
//           console.log('-> b', listB.current.x, listB.current.y);

          var s1 = {p1: listB.current.prev, p2: listB.current};
          var s2 = {p1: listB.current, p2: listB.current.next};
          var s3 = {p1: listA.current.prev, p2: listA.current};
          var s4 = {p1: listA.current, p2: listA.current.next};

          if (isCrossingFourVectorsIntoOneVertex(s1, s2, s3, s4)) {
//             console.log('-> mark as intersection');
            intersectCounter++;
            listB.current.intersect = listA.current;
            listA.current.intersect = listB.current;
          } else {
//             console.log('-> NOT an intersection');
          }

          listB.current = listB.current.next;
          continue;
        }

        listB.current = listB.current.next;
      } while (listB.current != listB.head);
      listA.current = listA.current.next;
    } while (listA.current != listA.head);
    // =================================

    // point to section  =================================
    listA.current = listA.head;
    do {
      listB.current = listB.head;
      do {
        var sectionA = {
          p1: listA.current,
          p2: listA.current.next
        };
        var sectionB = {
          p1: listB.current,
          p2: listB.current.next
        };


        //3.2 Find vertices overlap with sections of enother polygon (without end-points of section),
        // check it for intersect, and then add them in the list and set them as Intersect.
        if (isLayPointOnSection(listB.current, sectionA)) {
          //pointOnA
//           console.log('point B on section A');
//           console.log(listB.current.x, listB.current.y);

          var s1 = {p1: listB.current.prev, p2: listB.current};
          var s2 = {p1: listB.current, p2: listB.current.next};
          var s3 = {p1: listA.current, p2: listB.current};
          var s4 = {p1: listB.current, p2: listA.current.next};

          if (isCrossingFourVectorsIntoOneVertex(s1, s2, s3, s4)) {
//             console.log('-> mark as intersection');
            intersectCounter++;
            var newPoint = List.createPoint(listB.current.x, listB.current.y);

            //   add crossing point on A
            listB.current.intersect = newPoint;
            newPoint.intersect = listB.current;
            newPoint.isBelong = true;
            // add to listA after listA.current
            newPoint.next = listA.current.next;
            newPoint.next.prev = newPoint;

            newPoint.prev = listA.current;///
            listA.current.next = newPoint;
//           listA.current = newPoint;

            listA.len++;///
          } else {
//             console.log('-> NOT an intersection');
          }


          listB.current = listB.current.next;
          continue;
        }


        if (isLayPointOnSection(listA.current, sectionB)) {
          //pointOnB
//           console.log('point A on section B');
//           console.log('point', listA.current.x, listA.current.y);
//           console.log('section', sectionB.p1.x, sectionB.p1.y, sectionB.p2.x, sectionB.p2.y);

          var s1 = {p1: listA.current.prev, p2: listA.current};
          var s2 = {p1: listA.current, p2: listA.current.next};
          var s3 = {p1: listB.current, p2: listA.current};
          var s4 = {p1: listA.current, p2: listB.current.next};

          if (isCrossingFourVectorsIntoOneVertex(s1, s2, s3, s4)) {
//             console.log('-> mark as intersection');
            intersectCounter++;
            var newPoint = List.createPoint(listA.current.x, listA.current.y);
            //   add crossing point on B
            listA.current.intersect = newPoint;
            newPoint.intersect = listA.current;
            newPoint.isBelong = true;
            // add to listB after listB.current

            newPoint.next = listB.current.next;
            newPoint.next.prev = newPoint;

            newPoint.prev = listB.current;///
            listB.current.next = newPoint;
//           listB.current = newPoint;

            listB.len++;///
          } else {
//             console.log('-> NOT an intersection');
          }
          listB.current = listB.current.next;
          continue;
        }

        listB.current = listB.current.next;
      } while (listB.current != listB.head);
      listA.current = listA.current.next;
    } while (listA.current != listA.head);
    // =================================

    // section to section  =================================
    listA.current = listA.head;
    do {
      listB.current = listB.head;
      do {
        var sectionA = {
          p1: listA.current,
          p2: listA.current.next
        };
        var sectionB = {
          p1: listB.current,
          p2: listB.current.next
        };

//         console.log('checking intersection');
//         console.log('section A (', sectionA.p1.x, sectionA.p1.y, ') (', sectionA.p2.x, sectionA.p2.y, ')');
//         console.log('section B (', sectionB.p1.x, sectionB.p1.y, ') (', sectionB.p2.x, sectionB.p2.y, ')');

        //3.3 Find intersections of sections (without end-points of section),
        // add them in both lists, and then set them as Intersect
        var intersection = isCrossingSections(sectionA, sectionB);

//       if (intersection) {
//         console.log('section A (', sectionA.p1.x, sectionA.p1.y, ') (', sectionA.p2.x, sectionA.p2.y, ')');
//         console.log('section B (', sectionB.p1.x, sectionB.p1.y, ') (', sectionB.p2.x, sectionB.p2.y, ')');
//       }

        if (intersection) {

          intersectCounter++;

          //  section - section
//           console.log('inserting for both lists', intersection);

          var newPointA = List.createPoint(intersection.x, intersection.y);
          var newPointB = List.createPoint(intersection.x, intersection.y);

          newPointA.intersect = newPointB;
          newPointB.intersect = newPointA;
          newPointA.isBelong = true;
          newPointB.isBelong = true;

          newPointA.next = listA.current.next;
          newPointA.next.prev = newPointA;

          newPointA.prev = listA.current;///
          listA.current.next = newPointA;
          listA.len++;///

          newPointB.next = listB.current.next;
          newPointB.next.prev = newPointB;

          newPointB.prev = listB.current;///
          listB.current.next = newPointB;
          listB.len++;///

        }
//         console.log('------------------------------ inc B');
        listB.current = listB.current.next;
      } while (listB.current != listB.head);
//       console.log('============================== inc A');
      listA.current = listA.current.next;
    } while (listA.current != listA.head);
    // =================================


//     console.log("ListA");
//     List.printList(listA);
//
//     console.log("ListB");
//     List.printList(listB);


//     console.log("IntersectCounter: ", intersectCounter);

    if (intersectCounter == 0) {
      //4 If intesections not found

      //// 4.1. A is inside B – return A.
      // all points of A isBelong B
      var isAllBelong = true;
      listA.current = listA.head;
      do {
        if (!listA.current.isBelong) {
          isAllBelong = false;
          break;
        }
        listA.current = listA.current.next;
      } while (listA.current != listA.head);

      if (isAllBelong) {
        return [
          polA
        ]
      }

      //// 4.2. B is inside A – return B.
      // all points of B isBelong A
      var isAllBelong = true;
      listB.current = listB.head;
      do {
        if (!listB.current.isBelong) {
          isAllBelong = false;
          break;
        }
        listB.current = listB.current.next;
      } while (listB.current != listB.head);

      if (isAllBelong) {
        return [
          polB
        ]
      }

      //// 4.3. A and B do not overlap – return None.
      // every point isBelong = null
      return [];
    }

    // 4. Generate a list of "inbound" intersections – the intersections where
    // the vector from the intersection to the subsequent vertex of subject polygon B
    var listInboundIntersections = [];
    // begins inside the clipping region.
    listB.current = listB.head;
    do {
//     console.log('checking listB.current', listB.current.x, listB.current.y);
//     console.log('-> is intersect', !!listB.current.intersect);
//     console.log('-> is prev belong', listB.current.prev.isBelong, listB.current.prev.x, listB.current.prev.y);
//     console.log('-> is next belong', listB.current.next.isBelong, listB.current.next.x, listB.current.next.y);
      if (listB.current.intersect && !listB.current.prev.isBelong) {
        listInboundIntersections.push(listB.current);
      }

      listB.current = listB.current.next;
    } while (listB.current != listB.head);


    // 5. Follow each intersection clockwise around the linked lists until the start position is found.

//     console.log(listInboundIntersections);
    //return ;

    for (var i = 0; i < listInboundIntersections.length; i++) {
      var intersection = listInboundIntersections[i];
      arrIntersections[i] = [];

      var current = intersection;
      var currentPrev = current.prev;
      var iter = 0;
      do {
        arrIntersections[i].push({x: current.x, y: current.y});
//         console.log("=======================================================");
//         console.log('-> current point (', current.x, current.y, ')');

        if (current.intersect) {
          var s = {p1: currentPrev, p2: current};
          var s1 = {p1: current, p2: current.next};
          var s2 = {p1: current, p2: current.intersect.next};

//           console.log('-> variant 1 point (', current.next.x, current.next.y, ')');
//           console.log('-> variant 2 point (', current.intersect.next.x, current.intersect.next.y, ')');
//         console.log(current,current.next.x,current.intersect.next);
          var currentPrev = current;
          current = findClockWiseWay(s, s1, s2).p2;
        } else {
//           console.log('-> only one varialt');
          var currentPrev = current;
          current = current.next; //<- It's magic!
        }

//         console.log('-> selected point (', current.x, current.y, ')');

//       if (iter++ == 8) {
//         return ;
//       }

      } while (intersection !== current && intersection !== current.intersect);

    }

    var filtered = [];

    var isUnique = true;
    for (var i = 0; i < arrIntersections.length; i++) {
      isUnique = true;
      for (var j = i + 1; j < arrIntersections; j++) {
        if (isSamePoly(arrIntersections[i], arrIntersections[j])) {
          isUnique = false;
          break;
        }
      }

      if (isUnique && PolygonNormalizer.findSquare(arrIntersections[i]) > 0.0001) { // and filter square
        filtered.push(arrIntersections[i]);
      }
    }

    return filtered;
  }

  window.intersect = function (A, B) {

    // 0. Reverse wrong oriented.
    if (PolygonNormalizer.findSquare(A) < 0) {
      A = A.reverse();
    }

    if (PolygonNormalizer.findSquare(B) < 0) {
      B = B.reverse();
    }

    // 1. split into simple
    var simplePolysA = PolygonNormalizer.splitToSimple(A);
    var simplePolysB = PolygonNormalizer.splitToSimple(B);


    // 2. merge all the results of intersection areas
    var intersectionsAreas = [];
    for (var i = 0; i < simplePolysA.length; i++) {
      for (var j = 0; j < simplePolysB.length; j++) {
        var inter = getIntersection(simplePolysA[i], simplePolysB[j]);
        inter.forEach(function (p) {
          intersectionsAreas.push(p);
        });
      }
    }

    // 3. Return all areas
    return intersectionsAreas;
  }

})();

