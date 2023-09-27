new Vue({
    el: '#gameApp',
    data: {
        gameField: null,
        widthGameField: parseInt(localStorage.getItem('widthGameField')),
        heightGameField: parseInt(localStorage.getItem('heightGamefield')),
        cellsCount: null,
        gameFieldCellWidth: 80 * 1.2,
        gameFieldCellHeight: 40 * 1.2,
        gapGameFieldCells: 0,
        bombsOnFieldPercentage: parseInt(localStorage.getItem('bombsOnFieldPercentage')),
        bombsCount: null,
        cells: [],
        closedCount: null,
        flagsCount: null,
        bombs: [],
        isDragging: false,
        isGameOver: false,
        flagsCounter: null,
        milliseconds: 0,
        timer: null,
        longpress: false,
        presstimer: null,
        preventClick: false,

        currentX: null,
        currentY: null,
        initialX: null,
        initialY: null,
        xOffset: 0,
        yOffset: 0,
        multipluingSpeed: 1.1,
    },
    mounted() {
        this.gameField = document.querySelector('.GameField');
        this.flagsCounter = document.querySelector('.FlagsCounter');
        this.StartGame();

        let gameFieldContainer = document.querySelector('.GameFieldContainer');
        gameFieldContainer.addEventListener('mousedown', this.dragStart);
        gameFieldContainer.addEventListener('mouseup', this.dragEnd);
        gameFieldContainer.addEventListener('mousemove', this.drag);
        gameFieldContainer.addEventListener("touchstart", this.startTouch, false);
        gameFieldContainer.addEventListener("touchmove", this.touching, false);
        gameFieldContainer.addEventListener("touchend", this.touchEnd, false);

        // Привязка функций к соответствующим событиям
        document.addEventListener("click", this.click); // Обработка события клика
        document.addEventListener("contextmenu", this.rightClick); // Обработка события правого клика
        document.addEventListener("touchstart", this.touchStart); // Обработка события начала касания
        document.addEventListener("touchend", this.cancelPressing); // Обработка события окончания касания
        document.addEventListener("touchleave", this.cancelPressing); // Обработка события покидания элемента при касании
        document.addEventListener("touchcancel", this.cancelPressing); // Обработка события отмены касания

        this.FollowingToCursorFlagCounter();
        this.StartTimer();
    },
    methods: {
        dragStart(event) {
            if (event.button === 1) {
                event.preventDefault();
                this.initialX = event.clientX - this.xOffset;
                this.initialY = event.clientY - this.yOffset;
                this.isDragging = true;
            }
        },
        drag(event) {
            if (this.isDragging) {
                event.preventDefault();
                this.currentX = event.clientX - this.initialX;
                this.currentY = event.clientY - this.initialY;
                this.xOffset = this.currentX;
                this.yOffset = this.currentY;
                this.setTranslate(this.currentX, this.currentY, this.gameField);
            }
        },
        dragEnd(event) {
            this.initialX = this.currentX;
            this.initialY = this.currentY;
            this.isDragging = false;
        },
        startTouch(event) {
            if (event.changedTouches && event.changedTouches.length > 0) {
                this.initialX = event.changedTouches[0].clientX - this.xOffset;
                this.initialY = event.changedTouches[0].clientY - this.yOffset;
            }
        },
        touching(event) {
            if (event.touches && event.touches.length > 0) {
                this.currentX = event.touches[0].clientX - this.initialX;
                this.currentY = event.touches[0].clientY - this.initialY;

                const dx = this.currentX - this.initialX;
                const dy = this.currentY - this.initialY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 100) {
                    this.isDragging = true;
                }

                if (this.isDragging) {
                    event.preventDefault();
                    this.xOffset = this.currentX;
                    this.yOffset = this.currentY;
                    this.setTranslate(this.currentX * this.multipluingSpeed, this.currentY * this.multipluingSpeed, this.gameField);
                }
            }
        },
        touchEnd(event) {
            this.isDragging = false;
        },
        setTranslate(xPos, yPos, el) {
            el.style.transform = 'skew(-45deg) translate3d(' + xPos + 'px, ' + yPos + 'px, 0)';
        },
        
        StartGame() { // начало игры
            this.cellsCount = this.widthGameField * this.heightGameField;
            this.bombsCount = Math.floor(this.cellsCount * (this.bombsOnFieldPercentage / 100));
            this.closedCount = this.cellsCount;
            this.flagsCount = this.bombsCount;

            this.gameField.style.setProperty('--widthGameField', this.widthGameField); // установка стилей
            this.gameField.style.width = this.widthGameField * (this.gameFieldCellWidth + this.gapGameFieldCells) - this.gapGameFieldCells + 'px';
            this.gameField.style.setProperty('--gameFieldCellWidth', `${this.gameFieldCellWidth}px`);
            this.gameField.style.setProperty('--gameFieldCellHeight', `${this.gameFieldCellHeight}px`);
            this.gameField.style.setProperty('--gapGameFieldCells', `${this.gapGameFieldCells}px`);

            for (let i = 0; i < this.cellsCount; i++) { // создание ячеек в поле
                const cell = document.createElement('button');
                cell.classList.add('GameFieldCell', 'notDisabled');
                this.cells.push(cell);
            }

            this.gameField.append(...this.cells); // добавление на игровое поле всех ячеек по отдельности

            this.bombs = [...Array(this.cellsCount).keys()]
                .sort(() => Math.random() - 0.5)
                .slice(0, this.bombsCount); // список, содержащий индексы бомб
            
            {
                // Массив с источниками аудиофайлов
                const audioSources = [
                    "assets/mediaFiles/audio/BackgroundMusic/BackgroundSound.mp3",
                    "assets/mediaFiles/audio/BackgroundMusic/BackgroundSound1.mp3",
                    "assets/mediaFiles/audio/BackgroundMusic/BackgroundSound2.mp3",
                    "assets/mediaFiles/audio/BackgroundMusic/BackgroundSound3.mp3",
                    "assets/mediaFiles/audio/BackgroundMusic/BackgroundSound4.mp3"
                ];
                
                // Функция для перемешивания массива
                const shuffleArray = (array) => {
                    for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                    }
                };
                
                // Перемешивание массива с источниками аудиофайлов
                shuffleArray(audioSources);
                
                // Получение ссылки на элемент аудио
                let backgroundMusic = document.querySelector("#BackgroundMusic");
                
                // Установка начального источника аудио
                backgroundMusic.src = audioSources[Math.floor(Math.random() * audioSources.length)];
                
                // Счетчик для отслеживания текущей композиции
                let currentTrack = audioSources.indexOf(backgroundMusic.src);
                
                // Функция для переключения на следующую композицию
                const nextTrack = () => {
                    // Увеличение счетчика
                    currentTrack++;
                    // Проверка достижения конца массива
                    if (currentTrack >= audioSources.length) {
                    currentTrack = 0;
                    shuffleArray(audioSources);
                    // Проверка совпадения последнего и первого треков
                    while (audioSources[0] === backgroundMusic.src) {
                        shuffleArray(audioSources);
                    }
                    }
                    // Установка нового источника аудио
                    backgroundMusic.src = audioSources[currentTrack];
                };
                
                // Добавление обработчика события окончания воспроизведения аудио
                backgroundMusic.addEventListener("ended", nextTrack);
        
            
                backgroundMusic.volume = 0.2;
                backgroundMusic.play();
                // приостановка воспроизведения музыки при потере фокуса окном
                window.addEventListener('blur', () => {
                    backgroundMusic.pause();
                });
                // возобновление воспроизведения музыки при получении фокуса окном
                window.addEventListener('focus', () => {
                    backgroundMusic.play();
                });
            }
        },

        // Функция предотвращающая долгое нажатие и следовательно установку флага
        cancelPressing() {
            if (this.isGameOver) return; // Если игра окончена, выходим из функции
            if (this.presstimer !== null) {
                clearTimeout(this.presstimer); // Очищаем таймер
                this.presstimer = null; // Сбрасываем значение таймера
            }
        },
        // Функция для обработки события клика
        click(event) {
            if (this.isGameOver) return; // Если игра окончена, выходим из функции
            if (this.presstimer !== null) {
                clearTimeout(this.presstimer); // Очищаем таймер
                this.presstimer = null; // Сбрасываем значение таймера
            }

            // Проверка типа события и кнопки мыши
            if (event.type === "click" && event.button !== 0) {
                return; // Если событие не является кликом левой кнопкой мыши, выходим из функции
            }

            if (this.longpress || this.preventClick) {
                this.preventClick = false; // Сбрасываем флаг предотвращения клика
                return; // Если произошло долгое нажатие или клик был предотвращен, выходим из функции
            }

            // Проверка наличия флажка в ячейке
            if (event.target.classList.contains("Flagged")) return; // Если ячейка содержит флажок, выходим из функции

            // Определение индекса нажатой ячейки
            const index = this.cells.indexOf(event.target);
            // Определение столбца и строки нажатой ячейки
            const column = index % this.widthGameField;
            const row = Math.floor(index / this.widthGameField);
            // Открытие ячейки
            this.OpenCell(row, column);
        },
        // Функция для обработки события начала касания
        touchStart(event) {
            // Проверка типа события и кнопки мыши
            if (event.type === "mousedown" || this.isGameOver) {
                return; // Если событие является нажатием кнопки мыши или игра окончена, выходим из функции
            }

            this.longpress = false; // Устанавливаем флаг долгого нажатия в false

            this.presstimer = setTimeout(() => {
                if (this.isDragging) return; // Если происходит перетаскивание, выходим из функции
                this.SetUnsetFlag(event); // Установка или снятие флажка
                this.longpress = true; // Устанавливаем флаг долгого нажатия в true
                this.preventClick = true; // Устанавливаем флаг предотвращения клика в true
            }, 150);

            return false; // Возвращаем false, чтобы предотвратить дальнейшую обработку события
        },
        // Функция для обработки события правого клика
        rightClick(event) {
            event.preventDefault(); // Предотвращаем стандартное контекстное меню

            // Если игра окончена или ячейка не содержит класс 'GameFieldCell', выходим из функции
            if (this.isGameOver || !event.target.classList.contains('GameFieldCell')) return;

            this.SetUnsetFlag(event); // Установка или снятие флажка
        },

        // Функция для открытия ячейки
        OpenCell(row, column) {
            // Определение индекса ячейки
            const index = row * this.widthGameField + column;
            // Получение ссылки на элемент ячейки
            const cell = this.cells[index];
            // Проверка условий для выхода из функции
            if (!this.isValid(row, column) || cell.classList.contains('disabled')) return;
            // Изменение классов элемента ячейки
            cell.classList.add('disabled');
            cell.classList.remove('notDisabled');
            // Уменьшение количества закрытых ячеек
            this.closedCount--;
            // Воспроизведение звука копания
            const digSounds = [
                document.querySelector('#digSound1'),
                document.querySelector('#digSound2')
            ];
            const randomIndex = Math.floor(Math.random() * digSounds.length);
            const digSound = digSounds[randomIndex];
            digSound.play();
            // Проверка наличия бомбы в ячейке
            if (this.isBomb(row, column)) {
                // Если в ячейке есть бомба, вызов функции GameOver
                this.GameOver(cell);
                return;
            }
            // Проверка условия победы
            if (this.closedCount <= this.bombsCount) {
                this.stopTimer();
                document.querySelector('.GameTimer').classList.add('WonGame');
                return;
            }
            // Определение количества бомб вокруг ячейки
            const bombsCountAroundCell = this.GetBombCountAroundCell(row, column);
            if (bombsCountAroundCell !== 0) {
                // Если вокруг ячейки есть бомбы, отображение их количества на ячейке
                cell.textContent = bombsCountAroundCell;
                return;
            } else {
                cell.textContent = "";
            }
            // Открытие всех пустых ячеек вокруг текущей ячейки
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    this.OpenCell(row + y, column + x);
                }
            }
        },
        // Функция для завершения игры (проигрыш)
        GameOver(cell) {
            this.stopTimer();
            this.isGameOver = true;
            // Создание и добавление изображения бомбы в ячейку
            const bombImg = document.createElement('img');
            bombImg.src = 'assets/mediaFiles/images/buttons/redButton.png';
            bombImg.classList.add('ButtonForLaunch');
            cell.appendChild(bombImg);

            // Анимация проигрыша
            setTimeout(() => {
                bombImg.src = 'assets/mediaFiles/images/buttons/pressedRedButton.png';

                const fallingBombImg = document.createElement('img');
                fallingBombImg.src = 'assets/mediaFiles/images/bombs/NuclearBomb.png';
                fallingBombImg.classList.add('NuclearBomb');
                document.querySelector('.BombContainer').appendChild(fallingBombImg);

                const BassBoostSound = document.querySelector('#BassBoost');
                BassBoostSound.play();

                setTimeout(() => {
                    const whiteOverlay = document.createElement('div');
                    whiteOverlay.classList.add('WhiteOverlay');
                    document.body.appendChild(whiteOverlay);

                    const BoomSound = document.querySelector('#Boom');
                    BoomSound.play();

                    setTimeout(() => {
                        window.location.href = "GameField.html";
                    }, 1000);
                }, 1000);
            }, 700);
        },
        // Функция возвращает true, если координаты ячейки находятся в пределах игрового поля (это значит ячейка дествительная)
        isValid(row, column) {
            return row >= 0 &&
                row < this.heightGameField &&
                column >= 0 &&
                column < this.widthGameField;
        },
        // Функция для определения количества бомб вокруг ячейки
        GetBombCountAroundCell(row, column) {
            let count = 0;
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    if (this.isBomb(row + y, column + x)) {
                        count++;
                    }
                }
            }
            return count;
        },
        // Функция для проверки наличия бомбы в ячейке
        isBomb(row, column) {
            if (!this.isValid(row, column)) return false;

            const index = row * this.widthGameField + column;
            return this.bombs.includes(index);
        },

        StartTimer() {
            // Запуск интервала с заданным временем в миллисекундах
            this.timer = setInterval(() => {
                // Увеличение количества миллисекунд на 10
                this.milliseconds += 10;
                // Вычисление общего количества секунд
                const totalSeconds = Math.floor(this.milliseconds / 1000);
                // Вычисление количества часов, минут и секунд
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;
                // Форматирование времени в виде строки
                const formattedTime = hours.toString().padStart(2, '0') + ':' +
                    minutes.toString().padStart(2, '0') + ':' +
                    seconds.toString().padStart(2, '0') + ':' +
                    (this.milliseconds % 1000).toString().padStart(3, '0');
                // Обновление отображения времени игры на странице
                document.querySelector('.GameTimer').textContent = formattedTime;
            }, 10);
        },
        // остановка таймера игры
        stopTimer() {
            clearInterval(this.timer);
        },
        
        // Функция для установки и удаления флажков
        SetUnsetFlag(event) {
            // Получение ссылки на элемент ячейки
            const cell = event.target;
            // Проверка условий для выхода из функции
            if(cell.classList.contains('disabled') || this.isGameOver) return;
            // Проверка наличия флажка в ячейке
            if (cell.classList.contains('Flagged')) {
                // Если флажок есть, удаление его из ячейки
                cell.removeChild(cell.querySelector('.Flag'));
                cell.classList.remove('Flagged');
                // Увеличение количества доступных флажков
                this.flagsCount++;
                return;
            }
            // Проверка количества доступных флажков
            if(this.flagsCount <= 0) return;
        
            // Создание и добавление изображения флажка в ячейку
            const flagImg = document.createElement('img');
            flagImg.src = 'assets/mediaFiles/images/flags/redFlag2.png';
            flagImg.classList.add('Flag');
            cell.appendChild(flagImg);
            cell.classList.add('Flagged');
            // Уменьшение количества доступных флажков
            this.flagsCount--;
        
            // Воспроизведение звука установки флажка
            const settingFlagSounds = [
                document.querySelector('#flagSound1'),
                document.querySelector('#flagSound2')
            ];
            const randomIndex = Math.floor(Math.random() * settingFlagSounds.length);
            const setFlagSound = settingFlagSounds[randomIndex];
            setFlagSound.play();
        },
        // Функция для отслеживания перемещения курсора мыши и перемещения счетчика флажков за ним
        FollowingToCursorFlagCounter() {
            document.addEventListener('mousemove', (event) => {
                let x = event.clientX + 5;
                let y = event.clientY;
                if (x + this.flagsCounter.offsetWidth > window.innerWidth) {
                    x = window.innerWidth - this.flagsCounter.offsetWidth;
                }
                if (y + this.flagsCounter.offsetHeight > window.innerHeight) {
                    y = window.innerHeight - this.flagsCounter.offsetHeight;
                }
                this.flagsCounter.style.left = x + 'px';
                this.flagsCounter.style.top = y + 'px';
            });
        },

        GoToMenu() {
            this.ClickButtonSound();
            this.GoToPage('index.html');
        },
        RestartGame() {
            this.ClickButtonSound();
            this.GoToPage('GameField.html');
        },
        ClickButtonSound() {
            document.querySelector('#clickOnButton').play();
        },
        GoToPage(pageDirectory) {
            setTimeout(() => {
                window.location.href = pageDirectory;
            }, 100)
        },
    }
})