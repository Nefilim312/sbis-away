# SBIS-AWAY

SBIS-AWAY это скрипт для эмуляции активности за компьютером.

## Warning
Скрипт предоставляется как есть и автор не несет ответственности за его использование.

## Installation
Склонируй себе репозиторий.
Используй [npm](https://www.npmjs.com/) для установки.

```bash
npm install
```

## Usage
Для работы нужно узнать свой *sid*, который прописан в cookie на [online.sbis.ru](https://online.sbis.ru/). Для этого (на примере Chrome) открой инструменты разработчика, открой вкладку **Application** и там найди строку *sid*.

Открой терминал и выполни:

```bash
$ node away %sid%
```

Так же можно указать время работы скрипта в часах (по-умолчанию с 9 до 18):

```bash
$ node away %sid% 11 20
```

## Contributing
Пулл реквесты приветствуются.

## License
[MIT](https://choosealicense.com/licenses/mit/)