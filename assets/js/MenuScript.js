new Vue({
    el: '#menuApp',
    data: {
        maxFieldArea: 354 * 354,
        selectedFieldSize: localStorage.getItem('fieldSize') || 'small',
        widthGameField: parseInt(localStorage.getItem('widthGameField')) || 10,
        heightGameField: parseInt(localStorage.getItem('heightGamefield')) || 10,

        difficulty: localStorage.getItem('difficulties') || 'easy',
        bombsOnFieldPercentage: localStorage.getItem('bombsOnFieldPercentage') || 15,

        textOnStartGameButton: 'начать игру',
        inputFieldTextColor: 'black',
    },
    methods: {
        // Функция запуска игры
        StartGame() {
            // Проверка, не превышает ли площадь поля максимально допустимое значение
            if(this.widthGameField * this.heightGameField > this.maxFieldArea){
                this.GetLargeFieldSizeError();
                return;
            }
            
            // Сохранение текущих значений ширины, высоты, процента бомб на поле, размера поля и сложности игры в локальное хранилище
            localStorage.setItem('fieldSize', this.selectedFieldSize);
            localStorage.setItem('widthGameField', this.widthGameField);
            localStorage.setItem('heightGamefield', this.heightGameField);
            localStorage.setItem('difficulties', this.difficulty);
            localStorage.setItem('bombsOnFieldPercentage', this.bombsOnFieldPercentage);
            

            document.querySelector('#clickOnButton').play();
            setTimeout(() => {
                window.location.href = 'GameField.html';
            }, 100);
        },

        // Функция изменения размера поля в соответствии с выбранным значением
        ChangeFieldSize() {
            switch (this.selectedFieldSize) {
                case "small":
                    this.ShowGameFieldSize(10, 10);
                    break;
                case "medium":
                    this.ShowGameFieldSize(20, 20);
                    break;
                case "large":
                    this.ShowGameFieldSize(30, 30);
                    break;
                case "custom":
                    this.ShowGameFieldSize(0, 0);
                    break;
            }
        },
        // Функция установки значения "custom" в элемент выбора размера поля
        SetCustomInSelect() {
            this.selectedFieldSize = "custom";
        },
        // Функция отображения заданного размера поля в элементах ввода ширины и высоты
        ShowGameFieldSize(width, height) {
            this.widthGameField = width;
            this.heightGameField = height;
        },

        // Функция изменения сложности игры в соответствии с выбранным значением
        ChangeDifficult() {
            switch (this.difficulty) {
                case "easy":
                    this.bombsOnFieldPercentage = 15;
                    break;
                case "hard":
                    this.bombsOnFieldPercentage = 35;
                    break;
                case "impossible":
                    this.bombsOnFieldPercentage = 55;
                    break;
            }
        },

        // Функция отображения ошибки при выборе слишком большого размера поля
        GetLargeFieldSizeError() {
            // Изменение текста кнопки на "сенпай, он слишком большой"
            this.textOnStartGameButton = "сенпай, он слишком большой";
            // Установка таймера на 1 секунду для возврата текста кнопки к исходному значению
            setTimeout(() => {
                this.textOnStartGameButton = "начать игру";
            }, 1000);
            // Воспроизведение звука ошибки
            document.getElementById("LargeFieldSizeError").play();
            // Изменение цвета текста элементов ввода ширины и высоты поля на красный
            this.inputFieldTextColor = "red";
            // Установка таймера на 1 секунду для возврата цвета текста элементов ввода к исходному значению
            setTimeout(() => {
                this.inputFieldTextColor = "black";
            }, 1000);
        }
    }
})