var socketIOURL = window.location.protocol + '//' + window.location.hostname + '/admin';
var admin = io.connect(socketIOURL);

$(function() {
    var htmlStr = ``;
    admin.on('connected', function(MachinesList) {
        // console.log('当前登录的机器是：', data);
        MachinesList.map((machine, index) => {
            htmlStr += `
            <tr>
              <th scope="row">${index + 1}</th>
              <td>${machine.mac}</td>
              <td>${machine.gameName}</td>
              <td>${machine.time}</td>
            </tr>
          `;
        });
        $("table tbody").html(htmlStr);
    });
});