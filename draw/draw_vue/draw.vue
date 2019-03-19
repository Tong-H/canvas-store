<template>
  <div class="drawpage">
    <canvas v-show="shotDraw" id="captureimg" style="z-index:5"
      :width='shotsize.Width' :height='shotsize.Height'
      @mousedown="imgDown($event)"
      @mouseup="imgUp($event)"
      @mousemove="imgMove($event)"
      @touchstart="imgDown($event)" 
      @touchend="imgUp($event)"
      @touchmove="imgMove($event)">
    </canvas>
    <canvas id="canvasdraw" :width='canvaSize.Width' :height='canvaSize.Height'
        @mousedown="canvasDown($event)" 
        @mouseup="canvasUp($event)"
        @mousemove="canvasMove($event)"
        @touchstart="canvasDown($event)" 
        @touchend="canvasUp($event)"
        @touchmove="canvasMove($event)">
    </canvas>
    <div class="toolStyle scroll">
      <i @click="screenShoot()" class="iconfont icon-tool5" title="截图"></i>
      <i @click="drawShoot()" class="iconfont icon-zhaopianphoto177" title="保存画板" style=""></i>
      <div class="linewidth">
        <div @click="context.lineWidth = 1" style="height: 3px"></div>
        <div @click="context.lineWidth = 4" style="height: 5px;margin-top: 6px;"></div>
        <div @click="context.lineWidth = 8" style="height: 8px;margin-top: 6px;"></div>
      </div>
      <i @click="togglePen(item)" v-for="(item,index) in colors" :key="index" class="iconfont icon-qianbipencil86"
        :style="item === canvasState.colorp ? 'color:' + item + ';font-size:40px;' : 'color:' + item + ';font-size:32px;'" ></i>
      <i @click="togglePen('rgba(255, 235, 59, 0)')" :style="'rgba(255, 235, 59, 0)' === canvasState.colorp ? ';font-size:40px;' : ';font-size:32px;'" class="iconfont icon-xiangpica" title='橡皮檫'></i>
      <i @click="graphswitch(item[1])"  :style="canvasState.canvascursor === item[1] ? 'color: #efb336' : ''"
      v-for="(item,index) in graphArr" :key="index+10" :title='item[0]' :class="'iconfont icon-' + item[1]"></i>
      <i @click="controlCanvas('prev')" class="iconfont icon-ai207" title='撤销'></i>
      <i @click="controlCanvas('clear')" class="iconfont icon-shanchu1" title='清空'></i>
      <i @click="controlCanvas('restore')" class="iconfont icon-fanhui2" title='还原'></i>
    </div>
    <div class="drawimgStyle scroll">
      <img @click="restore('restore' + index)" v-for="(item, index) in drawimg" :key="index" :src="item" :class="'restore' + index"/>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      shotDraw: false,
      captureimg: {},
      screensize: [],
      colors: ["#000000", "#ff0000","#008000","#ffff00","#800080"],
      graphArr: [['线','line'], ['矩形','square'], ['圆','circle'], ['圆规','compass'], ['三角形','triangleone'], ['三角形','triangletwo']],
      shotsize: {
        Width: document.body.clientWidth,
        Height: document.body.clientHeight,
      },
      canvaSize: {
        Width: document.body.clientWidth,
        Height: document.body.clientHeight,
      },
      canvasState:{
        canvascursor: "crosshair",
        x: "",
        y: "",
        colorp: "#ffff00",
        time: -1,
        round: []
      },
      context: {},
      middleAry: [],
      saveimgdata: {},
      drawimg: [],
      imgtemporary: '',
    }
  },
  methods: {
    graphswitch(item) { // 图形工具切换
      this.context.strokeStyle ===  'rgba(255, 235, 59, 0)' ? this.togglePen('#ffff00') : ''
      this.canvasState.canvascursor = item
    },
    restore(name) { // 图片到画报上
      this.imgtemporary = document.getElementsByClassName(name)[0]
    },
    togglePen(item) { // 画笔切换
      this.canvasState.colorp === item || item === 'rgba(255, 235, 59, 0)' ? this.canvasState.canvascursor = 'crosshair' : ''
      this.canvasState.colorp = item
      this.context.strokeStyle = item
      this.context.shadowColor = item
    },
    drawShoot(data) { // 截图
      let canvas
      if (data) { // 判断是否是自由截图
        canvas = document.createElement('canvas')
        const shotcontext = canvas.getContext("2d")
        canvas.width = data.width
        canvas.height = data.height
        shotcontext.putImageData(data, 0, 0)
      } else {
        canvas = document.querySelector("#canvasdraw")
      }
      let base = canvas.toDataURL("image/png")
      this.drawimg.length === 10 ? this.drawimg.shift() : ''
      this.drawimg.push(base)
    },
    graphClearn() { // 绘画前数据清理
      this.context.beginPath()
      this.context.clearRect(0,0,this.canvaSize.Width,this.canvaSize.Height)
      this.context.putImageData(this.middleAry[this.middleAry.length - 1], 0, 0)
    },
    canvasMove (e) {
      let preX = e.clientX ? e.clientX : e.changedTouches[0].clientX
      let preY = e.clientY ? e.clientY : e.changedTouches[0].clientY
      if (this.canvasState.x) {
        if (this.imgtemporary) {
          this.graphClearn()
          this.context.drawImage(this.imgtemporary, this.canvasState.x , this.canvasState.y, preX - this.canvasState.x, preY - this.canvasState.y)
          this.context.stroke()
        } else {
          switch (this.canvasState.canvascursor) {
            case 'crosshair':
                let lineWidth = this.context.lineWidth * 10
                this.context.strokeStyle === 'rgba(255, 235, 59, 0)' ? this.context.clearRect(preX - lineWidth/2, preY - lineWidth/2, lineWidth, lineWidth) : ''
                this.context.lineTo(preX, preY)
                this.context.stroke()
              break
            case 'line':
                this.graphClearn()
                this.context.moveTo(this.canvasState.x , this.canvasState.y)
                this.context.lineTo(preX, preY)
                this.context.stroke()
              break
            case 'square':
                this.graphClearn()
                this.context.strokeRect(this.canvasState.x, this.canvasState.y, preX - this.canvasState.x, preY - this.canvasState.y)
                this.context.stroke()
              break
            case 'circle':
                this.graphClearn()
                let a = Math.sqrt((preX- this.canvasState.x) * (preX- this.canvasState.x) + (preY-this.canvasState.y) * (preY-this.canvasState.y))
                this.context.arc(this.canvasState.x, this.canvasState.y, a, 0, Math.PI * 2 ,false)
                this.context.stroke()
              break
            case 'compass':
                this.graphClearn()
                if (this.canvasState.round.length === 0) {
                  this.context.moveTo(this.canvasState.x , this.canvasState.y)
                  this.context.lineTo(preX, preY)
                  this.context.stroke()
                } else {
                  let b = (preY - this.canvasState.round[0]) / 10
                  this.context.arc(this.canvasState.x, this.canvasState.y, this.canvasState.round[1], 0, b, b<0)
                  this.context.stroke()
                }
              break
            case 'triangleone':
                this.graphClearn();
                this.context.moveTo(this.canvasState.x, this.canvasState.y)
                this.context.lineTo(preX, preY)
                this.context.lineTo(this.canvasState.x, preY)
                this.context.closePath()
                this.context.stroke()
              break
            case 'triangletwo':
                this.graphClearn();
                this.context.moveTo(this.canvasState.x, this.canvasState.y)	
                this.context.lineTo(preX, preY)
                this.context.lineTo(this.canvasState.x - (preX - this.canvasState.x), preY)
                this.context.closePath()
                this.context.stroke()
              break
          }
        }
      }
    },
    canvasUp (e) {
      let preX = e.clientX ? e.clientX : e.changedTouches[0].clientX
      let preY = e.clientY ? e.clientY : e.changedTouches[0].clientY
      this.context.beginPath()
      if (this.canvasState.canvascursor === "compass") {
        if (this.canvasState.round.length === 0) {
          this.canvasState.round = [preY, Math.sqrt((preX- this.canvasState.x)*(preX- this.canvasState.x) + (preY-this.canvasState.y)*(preY-this.canvasState.y))]
        } else {
          this.canvasState.round = []
          this.canvasState.x = ''
          this.canvasState.y = ''
        }
      } else {
        this.canvasState.x = ''
        this.canvasState.y = ''
      }
      this.imgtemporary = ''
    },
    canvasDown (e) {
      this.canvasSave()
      let preX = e.clientX ? e.clientX : e.changedTouches[0].clientX
      let preY = e.clientY ? e.clientY : e.changedTouches[0].clientY
      if (this.canvasState.round.length === 0) {
        this.canvasState.x = preX
        this.canvasState.y = preY
      }
      if (!this.imgtemporary) {
        this.context.moveTo(preX, preY)
        let lineWidth = this.context.lineWidth * 10
        this.context.strokeStyle ===  'rgba(255, 235, 59, 0)' ? this.context.clearRect(preX - lineWidth/2, preY - lineWidth/2, lineWidth, lineWidth) : ''
      }
    },
    screenShoot() { // 自由截图
      this.shotDraw = true
      this.captureimg.beginPath()
      this.captureimg.clearRect(0, 0, this.canvaSize.Width, this.canvaSize.Height)
      this.captureimg.fillRect(0, 0, this.canvaSize.Width, this.canvaSize.Height)
      this.captureimg.stroke()
    },
    imgDown(e) {
      let preX = e.clientX ? e.clientX : e.changedTouches[0].clientX
      let preY = e.clientY ? e.clientY : e.changedTouches[0].clientY
      this.screensize = [preX, preY]
    },
    imgMove(e) {
      if (this.screensize.length === 2) {
        let preX = e.clientX ? e.clientX : e.changedTouches[0].clientX
        let preY = e.clientY ? e.clientY : e.changedTouches[0].clientY
        this.captureimg.clearRect(0, 0, this.canvaSize.Width, this.canvaSize.Height)
        this.captureimg.beginPath()
        this.captureimg.fillRect(0, 0, this.canvaSize.Width, this.canvaSize.Height)
        this.captureimg.clearRect(this.screensize[0], this.screensize[1], preX - this.screensize[0], preY - this.screensize[1])
        this.captureimg.stroke()
      }
    },
    imgUp(e) {
      let size = this.screensize
      let width = (e.clientX ? e.clientX : e.changedTouches[0].clientX) - size[0]
      let height = (e.clientY ? e.clientY : e.changedTouches[0].clientY) - size[1]
      this.shotDraw = false
      this.screensize = []
      let data = this.context.getImageData(size[0], size[1], width, height)
      this.drawShoot(data)
    },
    canvasSave() {
      const preData = this.context.getImageData(0, 0, this.canvaSize.Width, this.canvaSize.Height)
      this.middleAry.length === 4 ? this.middleAry.shift() : ""
      this.canvasState.time = this.middleAry.length+1
      this.middleAry.push(preData)
    },
    controlCanvas(action) { // 撤销清空操作
      switch (action) {
        case "prev":
          if (this.canvasState.time !== 0) {
            this.canvasState.time --
            this.context.clearRect(0,0,this.canvaSize.Width,this.canvaSize.Height)
            this.context.putImageData(this.middleAry[this.canvasState.time], 0, 0)
            this.context.beginPath()
          }
          break
        case "next":
          if (this.canvasState.time !== this.middleAry.length-1) {
            this.canvasState.time++
            this.context.clearRect(0,0,this.canvaSize.Width,this.canvaSize.Height)
            this.context.putImageData(this.middleAry[this.canvasState.time], 0, 0)
            this.context.beginPath()
          }
          break
        case "clear":
          this.saveimgdata = this.context.getImageData(0, 0, this.canvaSize.Width, this.canvaSize.Height)
          this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height)
          this.context.beginPath()
          this.canvasSave()
          break
        case "restore":
          this.context.putImageData(this.saveimgdata, 0, 0)
          this.canvasSave()
          break
      }
    }
  },
  mounted() { 
    const canvasdraw = document.querySelector("#canvasdraw")
    this.context = canvasdraw.getContext("2d")
    const preData = this.context.getImageData(0, 0, this.canvaSize.Width, this.canvaSize.Height)
    this.middleAry.push(preData)
    this.context.lineWidth = 4
    this.context.shadowBlur = 1
    this.togglePen('#ffff00')

    const captureimg = document.querySelector("#captureimg")
    this.captureimg = captureimg.getContext("2d")
    this.captureimg.fillStyle = "rgba(0, 0, 0, 0.2)"
  }
}
</script>
<style lang="scss">
.drawpage {
  background-color: rgb(49, 51, 63);
  width: 100vw;
  height: 100vh;
  #captureimg, #canvasdraw {
    position: absolute;
    left: 0;
    top: 0;
    overflow: auto;
    cursor: crosshair;
  }
  .drawimgStyle, .toolStyle {
    position: absolute;
    z-index: 10;
    background: #1e202b;
    height: calc(100vh - 20px);
    padding: 10px;
  }
  .toolStyle {
    width: 44px;
    i {
      font-size: 40px;
      color: #cecece;
      padding: 4px;
      cursor: pointer;
      display: inline-block;
      width: 40px;
    }
    .linewidth{
      width: 100%;
      padding-top: 10px;
      div{
        cursor: pointer;
        background: #cecece;
      }
    }
  }
  .drawimgStyle{
    right: 0;
    width: 90px;
    img{
      width: 100%;
      cursor: pointer
    }
  }
}
.scroll{
  overflow: auto;
}
.scroll::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.scroll::-webkit-scrollbar-thumb {
  border-radius: 5px;
  background: rgba(0,0,0,0.2);
}
.scroll::-webkit-scrollbar-track {
  border-radius: 0;
  background: rgba(0,0,0,0.1);
}
</style>
