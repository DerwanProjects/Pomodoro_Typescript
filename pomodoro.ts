import './css/style.scss';

/*--------------------------------*/
/* Pomodoro Clock                 */
/*--------------------------------*/
/* by Stephen Bau                 */
/*--------------------------------*/

// var display: HTMLHeadingElement = document.querySelector("#display");
const displayTime: HTMLSpanElement = document.querySelector("#time-left");
const timerLabel: HTMLLabelElement = document.querySelector("#timer-label");
const displaySession: HTMLSpanElement = document.querySelector("#session-length");
const displayBreak: HTMLSpanElement = document.querySelector("#break-length");
const startStopButton: HTMLButtonElement = document.querySelector("#start_stop");
const resetButton: HTMLButtonElement = document.querySelector("#reset");
const buttons: NodeListOf<HTMLButtonElement> = document.querySelectorAll(".button");
const alarm: HTMLMediaElement = document.querySelector("#beep");



enum modeEnum {
  Session = 'session',
  Break = 'break'
}
enum statusEnum {
  NotStarted = 0,
  InProgress = 1
}
let sessionLength: number = 25;
let breakLength: number = 5;
let time: number = 0;
let status: statusEnum;
let mode: modeEnum;
let minutes: number = sessionLength;
let seconds: number = 0;
let display: string = updateDisplay();
let countdown;



init();

function init(): void {

  status = statusEnum.NotStarted;
  mode = modeEnum.Session;

  for (var i = 0; i < buttons.length; i++) {
    var button = buttons[i];
    button.addEventListener("click", function( event ) {
      getInput(this);
    });
  }
  keyboard();
}




function getInputType(button): string {
  return button.id;
}


enum getInputEnum {
  Start_stop = "start_stop",
  Reset = "reset",
  SessionIncrement = "session-increment",
  SessionDecrement = "session-decrement",
  BreakIncrement = "break-increment",
  BreakDecrement = "break-decrement"
}

function getInput(button): void {
  switch (getInputType(button)) {
    case getInputEnum.Start_stop:
      startStop();
      break;
    case getInputEnum.Reset:
      reset();
      break;
    case getInputEnum.SessionIncrement:
      changeSession(1);
      break;
    case getInputEnum.SessionDecrement:
      changeSession(-1);
      break;
    case getInputEnum.BreakIncrement:
      changeBreak(1);
      break;
    case getInputEnum.BreakDecrement:
      changeBreak(-1);
  }
}

function keyboard(): void {
  keyboardEvents("keydown");
  keyboardEvents("keyup");
}

function keyboardEvents(keyEvent): void {
  document.addEventListener(keyEvent, function (event) {
    if (event.defaultPrevented) {
      return;
    }
    var key = event.key || event.keyCode;

    for (var i = 0; i < buttons.length; i++) {
      let button = buttons[i];
      if (button.dataset.key == key) {
        handleKeyboardEvent(button, keyEvent);
      }
    }
  });
}

function handleKeyboardEvent(button, keyEvent): void {
  if (keyEvent == "keydown") {
    button.classList.add("select");
    getInput(button);
  }
  if (keyEvent == "keyup") {
    button.classList.remove("select");
  }
}

function startStop(): void {
  if (status === statusEnum.InProgress) {
    timerSwitch(0);
  } else if (status === statusEnum.NotStarted) {
    timerSwitch(1);
  }
}

function timerSwitch(on): void {
  if (minutes == 0 && seconds == 0) {
    return;
  }
  if (on == 1) {
    countdown = setInterval(timer, 1000);
    status = statusEnum.InProgress;
    startStopButton.innerText = "Stop";
    startStopButton.classList.remove('start');
    startStopButton.classList.add('stop');
    console.log("Timer started");
  } else {
    clearInterval(countdown);
    status = statusEnum.NotStarted;
    startStopButton.innerText = "Start";
    startStopButton.classList.remove('stop');
    startStopButton.classList.add('start');
    console.log("Timer stopped");
  }
}

function timer(): void {
  if (minutes == 0 && seconds == 0) {
    updateDisplay();
    return zero();
  }
  if (minutes >= 0) {
    if (seconds > 0) {
      seconds -= 1;
      updateDisplay()
    } else {
      minutes -= 1;
      seconds = 59;
      updateDisplay()
    }
  }
}

function zero(): void {
  alarm.play();
  modeSwitch();
}

function modeSwitch(): void {
  if (modeEnum.Session) {
    console.log("Session finished");
    timerLabel.innerText = "Break";
    minutes = breakLength;
    updateDisplay();
    modeEnum.Break;
    return;
  } else {
    console.log("Break finished");
    timerLabel.innerText = "Session";
    minutes = sessionLength;
    updateDisplay();
    modeEnum.Session;
    return;
  }
}

function updateDisplay(): string {
  display = minutes + ":" + formatSeconds(seconds);
  displayTime.innerText = display;
  console.log(display);
  return display;
}

function formatSeconds(num): string {
  var str = num.toString();
  if (str.length == 1) {
    str = "0" + str;
  }
  return str;
}

function reset(): void {
  if (statusEnum.InProgress) {
    timerSwitch(0);
  }
  modeEnum.Session;
  timerLabel.innerText = "Session";
  minutes = sessionLength;
  seconds = 0;
  updateDisplay();
}

function changeSession(value): number {
  if (sessionLength + value > 0 && sessionLength + value <= 60) {
    sessionLength += value;
    if (modeEnum.Session) {
      minutes = sessionLength;
      updateDisplay();
    }
    displaySession.innerText = String(sessionLength);
  }
  return sessionLength;
}

function changeBreak(value): number {
  if (breakLength + value > 0 && breakLength + value <= 60) {
    breakLength += value;
    if (modeEnum.Break) {
      minutes = breakLength;
      updateDisplay();
    }
    displayBreak.innerText = String(breakLength);
  }
  return breakLength;
}

function debugClock() {
  console.log("mode: " + modeEnum);
  console.log("time: " + time);
  console.log("display: " + display);
  console.log("status: " + statusEnum);
}