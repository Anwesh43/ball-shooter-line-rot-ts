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
