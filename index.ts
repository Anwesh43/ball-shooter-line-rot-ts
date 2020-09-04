const w : number = window.innerWidth
const h : number = window.innerHeight
const parts : number = 5
const scGap : number = 0.02 / parts
const strokeFactor : number = 90
const sizeFactor : number = 4.5
const rFactor : number = 6.9
const delay : number = 20
const colors : Array<string> = ["#4CAF50", "#F44336", "#FF9800", "#2196F3", "#009688"]
const backColor : string = "#bdbdbd"

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n
    }

    static sinify(scale : number) : number {
        return Math.sin(scale * Math.PI)
    }
}

class DrawingUtil {

    static drawLine(context : CanvasRenderingContext2D, x1 : number, y1 : number, x2 : number, y2 : number) {
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }

    static drawCircle(context : CanvasRenderingContext2D, x : number, y : number, r : number) {
        context.beginPath()
        context.arc(x, y, r, 0, 2 * Math.PI)
        context.fill()
    }

    static drawBallShooterRotLine(context : CanvasRenderingContext2D, scale : number) {
        const sf = ScaleUtil.sinify(scale)
        const sf1 : number = ScaleUtil.divideScale(sf, 0, parts)
        const sf2 : number = ScaleUtil.divideScale(sf, 1, parts)
        const sf3 : number = ScaleUtil.divideScale(sf, 2, parts)
        const sf4 : number = ScaleUtil.divideScale(sf, 3, parts)
        const r : number = Math.min(w, h) / rFactor
        const size : number = Math.min(w, h) / sizeFactor
        context.save()
        context.translate(w / 2, h / 2)
        context.rotate(sf3 * Math.PI / 2)
        for (var j = 0; j < 2; j++) {
            context.save()
            context.scale(1, 1 - 2 * j)
            DrawingUtil.drawLine(context, -size * sf1, r, size * sf1, r)
            context.restore()
        }
        context.save()
        DrawingUtil.drawCircle(context, (h / 2 - r) * sf4, 0, r * sf2)
        context.restore()
        context.restore()
    }

    static drawBSRLNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        context.strokeStyle = colors[i]
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor
        context.fillStyle = colors[i]
        DrawingUtil.drawBallShooterRotLine(context, scale)
    }
}

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {

    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += scGap * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {

    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, delay)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class BSLNode {

    prev : BSLNode
    next : BSLNode
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }
    addNeighbor() {
        if (this.i < colors.length - 1) {
            this.next = new BSLNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawBSRLNode(context, this.i, this.state.scale)
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : BSLNode {
        var curr : BSLNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class BallShooterLine {

    curr : BSLNode = new BSLNode(0)
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}

class Renderer {

    bsl : BallShooterLine = new BallShooterLine()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.bsl.draw(context)
    }

    handleTap(cb : Function) {
        this.bsl.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.bsl.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}
