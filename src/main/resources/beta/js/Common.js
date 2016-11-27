function toPNGBinary(canvas) {
    var type = 'image/png';
    var bin = atob(canvas.toDataURL(type).split(',')[1]);
    var binary = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) {
        binary[i] = bin.charCodeAt(i);
    }
    return binary;
}

function openCanvasPng() {
    window.open(window.URL.createObjectURL(new Blob([toPNGBinary(mainCanvas).buffer], {type: 'image/png'})));
}

function fillCanvas(context2D, width, height, color, alpha) {
    context2D.beginPath();
    context2D.fillStyle = color;
    context2D.globalAlpha = alpha;
    context2D.fillRect(0, 0, width, height);
}

function ellipse(context2D, cx, cy, w, h) {
    var lx = cx - w / 2;
    var rx = cx + w / 2;
    var ty = cy - h / 2;
    var by = cy + h / 2;
    var magic = 0.551784;
    var xmagic = magic * w / 2;
    var ymagic = h * magic / 2;
    context2D.moveTo(cx, ty);
    context2D.bezierCurveTo(cx + xmagic, ty, rx, cy - ymagic, rx, cy);
    context2D.bezierCurveTo(rx, cy + ymagic, cx + xmagic, by, cx, by);
    context2D.bezierCurveTo(cx - xmagic, by, lx, cy + ymagic, lx, cy);
    context2D.bezierCurveTo(lx, cy - ymagic, cx - xmagic, ty, cx, ty);
}

function MouseEvent(canvas, downFunc, moveFunc) {
    canvas.addEventListener('mousedown', function (e) {
        if (e.button === 0) {
            var rect = e.target.getBoundingClientRect();
            downFunc(~~(e.clientX - rect.left), ~~(e.clientY - rect.top));
        }
    }, false);
    canvas.addEventListener('mousemove', function (e) {
        if (e.buttons === 1 || e.witch === 1) {
            var rect = e.target.getBoundingClientRect();
            moveFunc(~~(e.clientX - rect.left), ~~(e.clientY - rect.top));
        }
    }, false);
}

function TouchEvent(canvas, startFunc, moveFunc) {
    canvas.addEventListener("touchstart", function (e) {
        var touches = e.touches.item(0);
        var rect = e.target.getBoundingClientRect();
        startFunc(~~(touches.clientX - rect.left), ~~(touches.clientY - rect.top));
    }, false);
    canvas.addEventListener("touchmove", function (e) {
        e.preventDefault();
        var touches = e.touches.item(0);
        var rect = e.target.getBoundingClientRect();
        moveFunc(~~(touches.clientX - rect.left), ~~(touches.clientY - rect.top));
    }, false);
}