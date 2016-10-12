(function () {
    var keepAlive;
    var webSocket = new WebSocket("ws://" + location.hostname + ":" + location.port + "/web/");
    webSocket.onopen = function (event) {
        keepAlive = setInterval(function () {
            webSocket.send("Keep-Alive");
        }, 299950);
    };
    webSocket.onclose = function (event) {
        clearInterval(keepAlive);
        alert("WebSocket connection closed")
    };

    var count = document.getElementById("sessioncount");
    webSocket.onmessage = function (event) {
        var json = JSON.parse(event.data);
        if (json.session_count == undefined) {
            count.innerHTML = "接続人数" + json.session_count_load + "人";
        } else {
            count.innerHTML = "接続人数" + json.session_count + "人";
            if (json.mode == "paint") {
                if (json.size == "AllClear") {
                    canvasClear();
                } else {
                    draw(json.size, json.color, json.alpha, json.x, json.y);
                }
            } else if (json.mode == "chat") {
                appendChat(json.text, false);
            }
        }
    };

    var canvas = document.getElementById("main_canvas");
    var ctx = canvas.getContext('2d');

    canvasClear();

    //初期値（サイズ、色、アルファ値、マウス）の決定
    var size = 7;
    var color = "#555555";
    var alpha = 1.0;

    canvas.addEventListener('mousemove', onMove, false);
    canvas.addEventListener('mousedown', onClick, false);

    function onMove(e) {
        if (e.buttons === 1 || e.witch === 1) {
            var rect = e.target.getBoundingClientRect();
            var X = ~~(e.clientX - rect.left);
            var Y = ~~(e.clientY - rect.top);
            sendDraw(size, color, alpha, X, Y);
            draw(size, color, alpha, X, Y);
        }
    };

    function onClick(e) {
        if (e.button === 0) {
            var rect = e.target.getBoundingClientRect();
            var X = ~~(e.clientX - rect.left);
            var Y = ~~(e.clientY - rect.top);
            sendDraw(size, color, alpha, X, Y);
            draw(size, color, alpha, X, Y);
        }
    };

    function draw(Size, Color, Alpha, X, Y) {
        ctx.beginPath();
        ctx.globalAlpha = Alpha;
        ctx.fillStyle = Color;
        ctx.arc(X, Y, Size, 0, Math.PI * 2, false);
        ctx.fill();
        /*
        ctx.lineTo(X, Y);
        //直線の角を「丸」、サイズと色を決める
        ctx.lineCap = "round";
        ctx.lineWidth = Size * 2;
        ctx.strokeStyle = Color;
        ctx.stroke();
        */
    };

    function sendDraw(Size, Color, Alpha, X, Y) {
        var json = new Object();
        json.mode = "paint";
        json.size = Size;
        json.color = Color;
        json.Alpha = alpha;
        json.x = X;
        json.y = Y;
        webSocket.send(JSON.stringify(json));
    }

    // chatの処理
    document.getElementById("chatsend").addEventListener("click", sendChat, false);

    var chatText = document.getElementById("chattext");
    function sendChat() {
        var o = new Object();
        o.mode = "chat";
        o.text = chatText.value;
        webSocket.send(JSON.stringify(o));
        appendChat(chatText.value, true);
        chatText.value = "";
    }

    var chat_list = document.getElementById("chatcontentlist");
    function appendChat(text, self) {
        var ele = document.createElement("article");
        ele.id = self ? "mychatcontent" : "chatcontent";
        ele.innerHTML = text;
        prependChild(chat_list, ele);
        // chat_list.appendChild(ele);
    }

    function prependChild(parent, newFirstChild) {
        parent.insertBefore(newFirstChild, parent.firstChild)
    }

    // キャンバスの初期化をする
    function canvasClear() {
        ctx.beginPath();
        ctx.fillStyle = "#f5f5f5";
        ctx.globalAlpha = 1.0;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // メニューの処理を追加
    var menuIcon = document.getElementsByClassName("menuicon");
    for (i = 0; i < menuIcon.length; i++) {
        menuIcon[i].addEventListener("click", canvasMenu, false)
    }

    // メニュー処理
    function canvasMenu() {
        var thisId = this.id;
        if (thisId.indexOf("size") + 1) {
            size = ~~this.id.slice(4, this.id.length);
        }
        if (thisId.indexOf("color") + 1) {
            color = "#" + this.id.slice(5, this.id.length);
        }
        if (thisId.indexOf("alpha") + 1) {
            alpha = (~~this.id.slice(5, this.id.length)) / 10;
        }
        if (thisId.indexOf("clear") + 1) {
            if (confirm("すべて消去しますか？")) {
                var o = new Object();
                o.mode = "paint";
                o.size = "AllClear";
                webSocket.send(JSON.stringify(o));
                canvasClear();
            }
        }
    }
})();