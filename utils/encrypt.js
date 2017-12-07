// const bcrypt = require('bcryptjs');
// const salt = bcrypt.genSaltSync();
// const time = new Date().getTime();
// console.log(time);
// const hash = bcrypt.hashSync(String(time), salt);
// console.log('hashed:', hash);

// const check = bcrypt.compareSync(String(new Date().getTime()), "$2a$10$pXeWf8uSgc.g0r5WhJkP5ejRq8nflc.f36z/ic0N7.g2BCNxX3alC");
// console.log('check result:', check);

const randomize = require('randomatic');
console.log(randomize('A0', 8));