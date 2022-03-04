import './css/style.scss';

/*--------------------------------*/
/* Pomodoro Clock                 */
/*--------------------------------*/
/* by Stephen Bau                 */
/*--------------------------------*/




interface IPomodoro {
  keyboard(),
  keyboardEvents(keyEvent): void,
  handleKeyboardEvent(button, keyEvent): void,
  getInputType(button): string,
  getInput(button): void,
  startStop(): void,
  timerSwitch(on): void,
  timer(): void,
  zero(): void,
  modeSwitch(): void,
  updateDisplay(): string,
  formatSeconds(num): string,
  reset(): void,
  changeSession(value): number,
  changeBreak(value): number
}



enum modeEnum {
  Session = 'session',
  Break = 'break'
}

enum statusEnum {
  NotStarted = 0,
  InProgress = 1
}
enum getInputEnum {
  Start_stop = "start_stop",
  Reset = "reset",
  SessionIncrement = "session-increment",
  SessionDecrement = "session-decrement",
  BreakIncrement = "break-increment",
  BreakDecrement = "break-decrement"
}


class Pomodoro implements IPomodoro {
  public displayTime: HTMLSpanElement = document.querySelector("#time-left");
  public timerLabel: HTMLLabelElement = document.querySelector("#timer-label");
  public displaySession: HTMLSpanElement = document.querySelector("#session-length");
  public displayBreak: HTMLSpanElement = document.querySelector("#break-length");
  public startStopButton: HTMLButtonElement = document.querySelector("#start_stop");
  public resetButton: HTMLButtonElement = document.querySelector("#reset");
  public buttons: NodeListOf<HTMLButtonElement> = document.querySelectorAll(".button");
  public alarm: HTMLMediaElement = document.querySelector("#beep");
  // zmienne
  public sessionLength: number;
  public breakLength: number;
  public time: number;
  public appStatus: statusEnum;
  public mode: modeEnum;
  public minutes: number;
  public seconds: number;
  public display: string;
  public countdown;

  constructor(sessionLength, breakLength, time, appStatus, mode, minutes, seconds) {
    this.sessionLength = sessionLength;
    this.breakLength = breakLength;
    this.time = time;
    this.appStatus = appStatus;
    this.mode = mode;
    this.minutes = minutes;
    this.seconds = seconds;
    this.init();
    this.display = this.updateDisplay();
  }


  init() {
    for (let i = 0; i < this.buttons.length; i++) {
      let button = this.buttons[i];
      button.addEventListener("click", function( event ) {
        getInput(event);
      });
    }
    this.keyboard();
  }

  getInputType(button): string {
    return button.id;
  }

  getInput(button): void {
    switch (this.getInputType(button)) {
      case getInputEnum.Start_stop:
        this.startStop();
        break;
      case getInputEnum.Reset:
        this.reset();
        break;
      case getInputEnum.SessionIncrement:
        this.changeSession(1);
        break;
      case getInputEnum.SessionDecrement:
        this.changeSession(-1);
        break;
      case getInputEnum.BreakIncrement:
        this.changeBreak(1);
        break;
      case getInputEnum.BreakDecrement:
      this.changeBreak(-1);
    }
  }

  keyboard(): void {
    this.keyboardEvents("keydown");
    this.keyboardEvents("keyup");
  }

  keyboardEvents(keyEvent): void {
    document.addEventListener(keyEvent, (event) => {
      if (event.defaultPrevented) {
        return;
      }
      var key = event.key || event.keyCode;

      for (var i = 0; i < this.buttons.length; i++) {
        let button = this.buttons[i];
        if (button.dataset.key == key) {
          this.handleKeyboardEvent(button, keyEvent);
        }
      }
    });
  }

  handleKeyboardEvent(button, keyEvent): void {
    if (keyEvent == "keydown") {
      button.classList.add("select");
      this.getInput(button);
    }
    if (keyEvent == "keyup") {
      button.classList.remove("select");
    }
  }

  startStop(): void {
    if (this.appStatus === statusEnum.InProgress) {
      this.timerSwitch(0);
    } else if (this.appStatus === statusEnum.NotStarted) {
      this.timerSwitch(1);
    }
  }

  timerSwitch(on): void {
    if (this.minutes == 0 && this.seconds == 0) {
      return;
    }
    if (on == 1) {
      this.countdown = setInterval(this.timer, 1000);
      this.appStatus = statusEnum.InProgress;
      this.startStopButton.innerText = "Stop";
      this.startStopButton.classList.remove('start');
      this.startStopButton.classList.add('stop');
      console.log("Timer started");
    } else {
      clearInterval(this.countdown);
      this.appStatus = statusEnum.NotStarted;
      this.startStopButton.innerText = "Start";
      this.startStopButton.classList.remove('stop');
      this.startStopButton.classList.add('start');
      console.log("Timer stopped");
    }
  }

  timer(): void {
    if (this.minutes == 0 && this.seconds == 0) {
      this.updateDisplay();
      return this.zero();
    }
    if (this.minutes >= 0) {
      if (this.seconds > 0) {
        this.seconds -= 1;
        this.updateDisplay()
      } else {
        this.minutes -= 1;
        this.seconds = 59;
        this.updateDisplay()
      }
    }
  }

  zero(): void {
    this.alarm.play();
    this.modeSwitch();
  }

  modeSwitch(): void {
    if (modeEnum.Session) {
      console.log("Session finished");
      this.timerLabel.innerText = "Break";
      this.minutes = this.breakLength;
      this.updateDisplay();
      modeEnum.Break;
      return;
    } else {
      console.log("Break finished");
      this.timerLabel.innerText = "Session";
      this.minutes = this.sessionLength;
      this.updateDisplay();
      modeEnum.Session;
      return;
    }
  }

  updateDisplay(): string {
    this.display = this.minutes + ":" + this.formatSeconds(this.seconds);
    this.displayTime.innerText = this.display;
    console.log(this.display);
    return this.display;
  }

  formatSeconds(num): string {
    var str = num.toString();
    if (str.length == 1) {
      str = "0" + str;
    }
    return str;
  }

  reset(): void {
    if (statusEnum.InProgress) {
      this.timerSwitch(0);
    }
    modeEnum.Session;
    this.timerLabel.innerText = "Session";
    this.minutes = this.sessionLength;
    this.seconds = 0;
    this.updateDisplay();
  }

  changeSession(value): number {
    if (this.sessionLength + value > 0 && this.sessionLength + value <= 60) {
      this.sessionLength += value;
      if (modeEnum.Session) {
        this.minutes = this.sessionLength;
        this.updateDisplay();
      }
      this.displaySession.innerText = String(this.sessionLength);
    }
    return this.sessionLength;
  }

  changeBreak(value): number {
    if (this.breakLength + value > 0 && this.breakLength + value <= 60) {
      this.breakLength += value;
      if (modeEnum.Break) {
        this.minutes = this.breakLength;
        this.updateDisplay();
      }
      this.displayBreak.innerText = String(this.breakLength);
    }
    return this.breakLength;
  }
}


let pomodoro = new Pomodoro(25,5,0,statusEnum.NotStarted, modeEnum.Session, 25, 0);















