let robot = require("robotjs");

let cursorPostition = robot.getMousePos().x + robot.getMousePos().y;
let startHour = process.argv[2] || 9;
let endHour = process.argv[3] || 18;

console.log(`Эмуляция активности с ${startHour} до ${endHour}`);

function isWorkingTime() {
   let time = new Date();

   if (time.getDay() < 6 && time.getDay() > 0) {
      if (time.getHours() >= startHour && time.getHours() < endHour) {
         return true;
      } else {
         return false;
      }
   } else {
      return false;
   }
}

function checkCursorPosition() {
   if (isWorkingTime()) {
      let currentCursorPosition = robot.getMousePos().x + robot.getMousePos().y;

      if (currentCursorPosition != cursorPostition) {
         cursorPostition = currentCursorPosition;
      } else {
         emulateActivity();
         cursorPostition = robot.getMousePos().x + robot.getMousePos().y;
      }
   }
}

function emulateActivity() {

   function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
   }

   let max = 200;
   let min = -200;
   let shift = getRandomInt(min, max);

   robot.keyTap("tab", "alt");
   robot.moveMouseSmooth(robot.getMousePos().x + shift, robot.getMousePos().y + shift);
   robot.mouseClick();
   robot.keyTap("tab", "alt");
   robot.mouseClick();
}

var updater = setInterval(checkCursorPosition, 1000 * 60 * 2);
