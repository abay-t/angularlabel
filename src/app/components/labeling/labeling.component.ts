import { Component, OnInit } from '@angular/core';
import { RestService } from './rest.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'app-labeling',
  templateUrl: './labeling.component.html',
  styleUrls: ['./labeling.component.css']
})
export class LabelingComponent implements OnInit {
  datas: any;
  drawing = true;
  points = [];
  lastpoint;
  polygons: any = [];
  name = "";
  attributes = "";
  canvas: any;
  ctx: any;
  zoomCounter = 0;
  imageCounter = 0;
  contrastValue = 0;

  imageDimension = { x: 0, y: 0 };
  imageCanvas: any;
  imageCanvasWidth = 500;
  imageCanvasHeight = 500;
  imagectx: any;
  firstLoad = true;
  imageSource = 'assets/img/test.JPG';
  image = new Image();

  constructor(private service: RestService) { }

  ngOnInit() {
    this.getDatas();
  }

  ngAfterViewInit() {
    this.canvas = document.getElementById("canvasMain");
    this.canvas.height = this.imageCanvasHeight;
    this.canvas.width = this.imageCanvasWidth;
    this.ctx = this.canvas.getContext("2d");
    this.imageCanvas = document.getElementById("canvasImage");
    this.imageCanvas.height = this.imageCanvasHeight;
    this.imageCanvas.width = this.imageCanvasWidth;

    this.imageDimension.x = this.imageCanvas.width;

  }

  getDatas() {
    this.service.getDatas().subscribe((datas) => {
      this.datas = datas;
      this.imageDraw();
      this.firstLoad = false;
      this.polygons = this.datas[this.imageCounter].data.polygons;
      console.log(this.datas);
    });
  }

  imageDraw() {
    if (!this.firstLoad) {
      this.imagectx.clearRect(1, 1, this.imageCanvas.width, this.imageCanvas.height)
    }
    let self = this;
    self.imagectx = this.imageCanvas.getContext("2d")


    this.image.src = this.datas[this.imageCounter].data.imgsrc;
    this.fillPolygon(this.datas[this.imageCounter].data.polygons)

    this.image.onload = function () {
      self.drawImage(self.image);
    }
  }

  drawImage(image) {
    var width;
    var height;
    if (image.width > image.height) {
      width = this.imageCanvas.width;
      height = image.height * this.imageCanvas.width / image.width
    }
    else {
      height = this.imageCanvas.height;
      width = image.width * this.imageCanvas.height / image.height
    }
    this.imagectx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
  }

  redrawImage() {
    this.drawImage(this.image);
  }

  zoomin() {
    this.canvas.height *= 1.1;
    this.canvas.width *= 1.1;
    this.imageCanvas.height *= 1.1;
    this.imageCanvas.width *= 1.1;
    this.imageDraw();
    this.zoomPolygon(true);
    this.fillPolygon(this.polygons);
    this.zoomCounter += 1;
  }

  zoomout() {
    if (this.zoomCounter != 0) {
      this.canvas.height /= 1.1;
      this.canvas.width /= 1.1;
      this.imageCanvas.height /= 1.1;
      this.imageCanvas.width /= 1.1;
      this.imageDraw();
      this.zoomPolygon(false);
      this.fillPolygon(this.polygons);
      this.zoomCounter -= 1;
    }

  }

  drawPolygon() {
    this.drawing = true;
  }

  fillPolygon(polygons) {
    this.drawing = true;
    this.ctx.clearRect(1, 1, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    this.ctx.beginPath();
    polygons.forEach((polygon) => {
      let points = polygon.points;
      points.forEach((point, index) => {
        if (index == 0) {
          this.ctx.moveTo(point.offsetX, point.offsetY);
        }
        else {
          this.ctx.lineTo(points[index].offsetX, points[index].offsetY);
        }
      })

    });
    this.ctx.closePath();
    this.ctx.fill();
  }

  zoomPolygon(zoomin) {
    this.polygons.forEach((polygon) => {
      let points = polygon.points;
      points.forEach((point, index) => {
        if (zoomin) {
          point.offsetX *= 1.1;
          point.offsetY *= 1.1;
        }
        else {
          point.offsetX /= 1.1;
          point.offsetY /= 1.1;
        }

      })
    });


  }

  canvasClick(e) {

    if (!this.drawing) {
      return
    }
    let coords = { offsetY: e.offsetY, offsetX: e.offsetX }
    if (this.points.length == 0) {
      this.ctx.beginPath();
      this.ctx.arc(coords.offsetX, coords.offsetY, 5, 0, 2 * Math.PI);
      this.ctx.fillStyle = "green";
      this.ctx.fill();
      this.ctx.stroke();
    }
    else {
      this.ctx.beginPath();
      this.ctx.moveTo(this.points[this.points.length - 1].offsetX, this.points[this.points.length - 1].offsetY);
      this.ctx.lineTo(coords.offsetX, coords.offsetY);
      this.ctx.stroke();
      if ((coords.offsetX >= this.points[0].offsetX - 5 && coords.offsetX <= this.points[0].offsetX + 5) && (coords.offsetY >= this.points[0].offsetY - 5 && coords.offsetY <= this.points[0].offsetY + 5)) {

        let polygonObject = { name: null, attributes: null, points: this.points };
        this.polygons.push(polygonObject);
        this.fillPolygon(this.polygons);
        var infoDiv = document.getElementById("infoDiv");
        infoDiv.setAttribute(
          "style", "position: absolute; visibility: visible; top: " + this.points[0].offsetY + "px; left:" + (this.points[0].offsetX - 23) + "px;");

        this.lastpoint = coords;

        return
      }
    }
    this.points.push(coords);

  }

  undoPolygon() {
    if (this.points.length < 1) {
      return;
    }
    this.ctx.clearRect(1, 1, this.canvas.width, this.canvas.height);
    this.fillPolygon(this.polygons);
    this.points.pop()
    this.points.forEach((point, index) => {
      if (index == 0) {
        this.ctx.beginPath();
        this.ctx.arc(point.offsetX, point.offsetY, 5, 0, 2 * Math.PI);
        this.ctx.fillStyle = "green";
        this.ctx.fill();
        this.ctx.stroke();
      }
      else {
        this.ctx.beginPath();
        this.ctx.moveTo(this.points[index - 1].offsetX, this.points[index - 1].offsetY);
        this.ctx.lineTo(point.offsetX, point.offsetY);
        this.ctx.stroke();
      }
    })

  }

  hideInfoDiv() {
    var attributesText = <HTMLInputElement>document.getElementById('attributesText');
    var objectText = <HTMLInputElement>document.getElementById('objectText');
    objectText.value = '';
    attributesText.value = '';
    var infoDiv = document.getElementById("infoDiv");
    infoDiv.style.visibility = 'hidden';
  }

  undoInfoDiv() {

    this.hideInfoDiv();
    this.points.push(this.lastpoint);
    this.polygons.pop();
    console.log(this.polygons);
    this.undoPolygon();

  }

  deleteInfoDiv() {
    this.hideInfoDiv();
    this.points = [];
    this.polygons.pop();
    this.fillPolygon(this.polygons);
  }

  doneInfoDiv() {


    if (this.name == '') {
      alert('Please enter name');
      return
    }
    let lastPolygon = this.polygons[this.polygons.length - 1];
    let zoomedPolygons = this.polygons;
    lastPolygon.name = this.name;
    lastPolygon.attributes = this.attributes;
    this.name = '';
    this.attributes = '';

    if (this.zoomCounter != 0) {

      for (var i = 0; i < this.zoomCounter; i++) {

        this.polygons.forEach((polygon) => {
          let points = polygon.points;
          points.forEach((point, index) => {
            point.offsetX /= 1.1;
            point.offsetY /= 1.1;

          })
        });
      }

    }
    this.datas[this.imageCounter].data.polygons = this.polygons;
    this.updateData();
    this.hideInfoDiv();
    this.polygons = zoomedPolygons;
    this.points = [];
  }

  updateData(): void {
    var id = this.datas[this.imageCounter].id;
    let data = this.datas.find(item => {
      return item.id == id;
    })
    this.service.updateData(data, id)
      .subscribe();
  }



  mcontrast() {
    this.redrawImage();
    this.image.crossOrigin = "Anonymous";
    var imageData = this.imagectx.getImageData(0, 0, this.imageCanvas.width, this.imageCanvas.height);

    this.contrastValue -= 5;
    this.applyContrast(
      imageData.data, this.contrastValue);
    this.imagectx.putImageData(imageData, 0, 0);
  }

  pcontrast() {
    this.redrawImage();
    this.image.crossOrigin = "Anonymous";
    var imageData = this.imagectx.getImageData(0, 0, this.imageCanvas.width, this.imageCanvas.height);

    this.contrastValue += 5;
    this.applyContrast(
      imageData.data, this.contrastValue);
    this.imagectx.putImageData(imageData, 0, 0);
  }


  truncateColor(value) {
    if (value < 0) {
      value = 0;
    } else if (value > 255) {
      value = 255;
    }

    return value;
  }

  applyContrast(data, contrast) {
    var factor = (259.0 * (contrast + 255.0)) / (255.0 * (259.0 - contrast));

    for (var i = 0; i < data.length; i += 4) {
      data[i] = this.truncateColor(factor * (data[i] - 128.0) + 128.0);
      data[i + 1] = this.truncateColor(factor * (data[i + 1] - 128.0) + 128.0);
      data[i + 2] = this.truncateColor(factor * (data[i + 2] - 128.0) + 128.0);
    }
  }


  prevImage() {
    if (this.imageCounter != 0) {
      this.firstLoad = false;
      this.imageCounter -= 1;
      this.imageDraw();
      this.polygons = this.datas[this.imageCounter].data.polygons;
    }
  }

  nextImage() {

    if (this.imageCounter + 1 != this.datas.length) {
      this.firstLoad = false;
      this.imageCounter += 1;
      this.imageDraw();
      this.polygons = this.datas[this.imageCounter].data.polygons;
    }
  }

  fillYellowPolygon(polygon) {
    this.drawing = true;

    this.ctx.fillStyle = "yellow";
    this.ctx.beginPath();
    let points = polygon.points;
    points.forEach((point, index) => {
      if (index == 0) {
        this.ctx.moveTo(point.offsetX, point.offsetY);
      }
      else {
        this.ctx.lineTo(points[index].offsetX, points[index].offsetY);
      }
    })

    this.ctx.closePath();
    this.ctx.fill();
  }

  polygonHover(polygon) {
    this.fillYellowPolygon(polygon);
  }

  hoverOut() {
    this.fillPolygon(this.polygons);
  }
  deletePolygon(name, index) {
    if (confirm("Are you sure to delete polygon " + name)) {
      this.polygons.splice(index, 1);
      this.datas[this.imageCounter].data.polygons = this.polygons;
      this.updateData();
      this.fillPolygon(this.polygons);
    }

  }
}
