const os = require('os');
const fetch = require('node-fetch');
const robot = require('robotjs');

const hostname = os.hostname();
const INTERVAL = 3;

class Emulator {
    constructor({sid, startTime = 9, endTime = 18} = {}) {
        if (!sid) {
            console.info('\x1b[7m\x1b[31m', 'Не передан sid ');
            return process.exit();
        }

        this._sid = sid;
        this._startTime = startTime;
        this._endTime = endTime;
        this._cursorPos = robot.getMousePos().x + robot.getMousePos().y;
        this._noActivityStart = null;

        console.info(`Эмуляция активности с ${this._startTime} до ${this._endTime} для ${hostname}`);
    }

    /**
     * Проверка активности за компьютером
     */
    checkActivity = () => {
        if (!this.isWorkingTime()) return;

        // Нет активности
        if (this._cursorPos === robot.getMousePos().x + robot.getMousePos().y) {
            if (!this._noActivityStart) {
                this._noActivityStart = new Date();
            }
            this.emulateActivity();
            // Есть активность
        } else {
            if (this._noActivityStart) {
                console.info(`Отсутствие активности с ${this._noActivityStart.toLocaleTimeString()} до ${new Date().toLocaleTimeString()}`);
                this.pushAppActivity(this._noActivityStart, new Date())
                this._noActivityStart = null;
            }

            this._cursorPos = robot.getMousePos().x + robot.getMousePos().y;
        }
    }

    /**
     * Эмуляция активности. Шлет запрос для подтверждения, что пользователь за компьютером
     * @returns {Promise<void>}
     */
    async emulateActivity() {
        const body = JSON.stringify({
            jsonrpc: '2.0',
            method: 'Местоположение.Фиксация',
            params: {'Данные': `{"ВременнаяЗона":"3.00","ДанныеУстройства":"${hostname.toLowerCase()}"}`},
            protocol: 6,
            id: 0
        });

        fetch('https://online.sbis.ru/activity-write/service/', {
            method: 'POST',
            body,
            credentials: 'include',
            headers: {
                cookie: `sid=${this._sid}`
            }
        })
    }

    /**
     * Делаем вид, что во время эмуляции работали в указанном приложении
     * @param timeStart
     * @param timeEnd
     */
    pushAppActivity(timeStart, timeEnd) {
        const timeEndFixed = new Date(timeEnd);

        // Урезаем время конца, чтобы не получилось пересечение с настоящим трекингом
        timeEndFixed.setMinutes(timeEndFixed.getMinutes() - INTERVAL);

        const body = JSON.stringify({
            jsonrpc: '2.0',
            method: 'UnproductiveLog.Push',
            params: {
                Data: {
                    'f': 0,
                    'd': [[0, 'webstorm64', 'index.js - WebStorm', `${this.dateToSQLString(timeStart)}`, `${this.dateToSQLString(timeEndFixed)}`]],
                    's': [{'n': 'Type', 't': 'Число целое'},
                        {'n': 'Name', 't': 'Строка'},
                        {'n': 'Description', 't': 'Строка'},
                        {'n': 'DateTimeBegin', 't': {'n': 'Дата и время', 'tz': false}},
                        {'n': 'DateTimeEnd', 't': {'n': 'Дата и время', 'tz': false}}],
                    '_type': 'recordset'
                },
                Parameters: {
                    'f': 0,
                    'd': [59],
                    's': [{'n': 'Version', 't': 'Число целое'}],
                    '_type': 'record'
                }
            },
            protocol: 6,
            id: 0
        });

        fetch('https://online.sbis.ru/activity-write/service/', {
            method: 'POST',
            body,
            credentials: 'include',
            headers: {
                cookie: `sid=${this._sid}`
            }
        })
    }

    /**
     * Проверка времени. Нужно ли эмулировать активности или сейчас нерабочее время
     * @returns {boolean}
     */
    isWorkingTime() {
        const currentDate = new Date();

        if (currentDate.getDay() < 6 && currentDate.getDay() > 0) {
            return (currentDate.getHours() >= this._startTime && currentDate.getHours() < this._endTime)
        } else {
            return false;
        }
    }

    dateToSQLString(date) {
        return date.toISOString().replace('T', ' ').replace(/\.\w*/g, '');
    }

    /**
     * Старт эмулятора
     * Проверка раз в INTERVAL минут
     */
    run() {
        setInterval(this.checkActivity, 1000 * 60 * INTERVAL);
    }
}

const emulator = new Emulator({sid: process.argv[2], startTime: process.argv[3], endTime: process.argv[4]})

emulator.run();
