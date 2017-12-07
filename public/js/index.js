var machine = {};
var currentGameRecord = {};

$(function() {
    // 监听启动事件
    $(".launch-btn").click(LaunchGameHandler);

    // 监听游戏失败事件
    $('.failed-btn').click(GameFailedHandler);

    $('#mac-label').text(getMacAddress());

    // 显示输入code界面
    $('#unlockGameModal').on('show.bs.modal', function(event) {
        var button = $(event.relatedTarget);
        var gameId = button.data('gameid');
        var gameName = button.parent().find('.card-title').text();
        var modal = $(this);
        modal.find('.modal-title').text(`请在充值后，输入Code继续进行游戏${gameName}`);
    });

    // 点击确定，向服务器发送code，验证code的有效性
    $('#btnConfirm').click(function() {
        var code = $('#inputCode').val();
        console.log('currentGameRecord:', currentGameRecord);
        // 验证code有效性
        axios.post('/services/check', { code: code, recordId: currentGameRecord._id }).then(function(response) {
            console.log('code 验证结果: ', response.data);
            if (response.data) {
                $('#unlockGameModal').modal('hide');
            } else {
                $('.col-form-label').text('Code invalid!').css("color", "red");
            }
        });
    });
});

// 机器启动游戏
function LaunchGameHandler(event) {
    if ($(".launch-btn").hasClass('btn-warning')) {
        window.location.href = "/";
    }

    machine = io('http://localhost:3000/machine');
    machine.on('connected', function(data) {
        console.log('Game launched successfully in machine: ', data);
        // 向服务器发送：机器消息，游戏信息，时间戳
        var launchData = {
            mac: $('#mac-label').text(),
            gameId: getGameID(event.target),
            gameName: getGameName(event.target),
            time: new Date().getTime()
        };
        console.log(launchData);
        machine.emit('launch', machine.id, launchData);
        $("#current-game").text(launchData.gameName);
        $('#launch-time').text(new Date(launchData.time));
        setGameStatus(event.target);
    });

    machine.on('registered', function(data) {
        console.log("此次游戏启动信息已注册：", data);
        currentGameRecord = data;
    });
}

// 游戏失败
function GameFailedHandler(event) {
    var $element = $(event.target).parent().parent();
    var gameId = $element.find(".gameId").text();
    machine.emit('game failed', {
        gameId: gameId,
        mac: $("#mac-label").text(),
        time: new Date().getTime(),
        _id: currentGameRecord._id
    });
}

// 获得机器mac地址
function getMacAddress() {
    var mockMacAddress = [
        '54:52:00:93:d6:97',
        '54:52:00:dc:ba:0a',
        '54:52:00:1e:d2:68'
    ];
    return mockMacAddress[0];
    // return randomMac();

}

// 获得当前游戏的名称
function getGameName(element) {
    return $(element).parent().find(".card-title").text();
}

// 获得当前游戏ID
function getGameID(element) {
    return $(element).parent().parent().find('.gameId').text();
}

// 设置卡片颜色
function setGameStatus(element) {
    var $card = $(element).parent().parent();
    $card.removeClass('bg-dark').addClass('bg-success');
    $card.find('.failed-btn').css('display', 'inline-block');
    $(element).text('关闭游戏').addClass('btn-warning').removeClass('btn-light');
    // $(element).append(`<button class="btn btn-warnning">游戏失败</button>`);
}

function randomMac(prefix) {
    var mac = prefix || '54:52:00';
    for (var i = 0; i < 6; i++) {
        if (i % 2 === 0) mac += ':';
        mac += Math.floor(Math.random() * 16).toString(16);
    }
    return mac;
}