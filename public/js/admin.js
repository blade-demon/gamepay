var admin = io.connect('http://localhost:3000/admin');
admin.on('connected', function(data) {
    console.log('当前登录的机器数量是：', data);
    var machineNumberLabel = document.getElementById("machineNumber");
    machineNumberLabel.textContent = '当前登录的机器数量是：' + data;
});