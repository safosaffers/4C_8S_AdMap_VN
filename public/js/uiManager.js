// uiManager.js - Управление пользовательским интерфейсом

class UIManager {
    constructor() {
        this.addStructureFormVisible = false;
        this.legendVisible = false;
    }

    // Инициализация UI
    init() {
        this.createAddStructureButton();
        this.createAddStructureForm();
        this.createLegend();
        this.setupEventListeners();
        
        // Обновляем UI в зависимости от статуса авторизации
        this.updateUIBasedOnAuth();
    }

createAddStructureButton() {
    const button = document.createElement('button');
    button.id = 'add-structure-btn';
    button.className = 'add-structure-btn';
    button.textContent = 'Добавить РК';
    button.onclick = () => this.toggleAddStructureForm();

    // Устанавливаем стили для позиционирования
    button.style.position = 'absolute'; // или 'fixed', если нужно фиксированное положение
    button.style.top = '140px';
    button.style.right = '200px';

    // По умолчанию скрываем кнопку, она будет показана только администраторам
    button.style.display = 'none';

    document.body.appendChild(button);
}

    // Создание формы для добавления новой конструкции
    createAddStructureForm() {
        const formContainer = document.createElement('div');
        formContainer.id = 'add-structure-form';
        formContainer.className = 'add-structure-form';
        formContainer.style.display = 'none';

        formContainer.innerHTML = `
            <div class="form-content">
                <h2>Добавить рекламную конструкцию</h2>
                <form id="structure-form">
                    <div class="form-group">
                        <label for="address">Адрес РК:</label>
                        <input type="text" id="address" name="address" required>
                    </div>
                    <div class="form-group">
                        <label for="type">Вид РК:</label>
                        <select id="type" name="type" required>
                            <option value="ОН">ОН</option>
                            <option value="Билборд">Билборд</option>
                            <option value="Экран">Экран</option>
                            <option value="Стенд">Стенд</option>
                            <option value="Пиллар">Пиллар</option>
                            <option value="Стела">Стела</option>
                            <option value="Стела АЗС">Стела АЗС</option>
                            <option value="Сити-формат">Сити-формат</option>
                            <option value="Призма">Призма</option>
                            <option value="Флагшток">Флагшток</option>
                            <option value="ОП">ОП</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="subtype">Тип РК:</label>
                        <input type="text" id="subtype" name="subtype">
                    </div>
                    <div class="form-group">
                        <label for="size">Размер РК:</label>
                        <input type="text" id="size" name="size" placeholder="например, 3x6">
                    </div>
                    <div class="form-group">
                        <label for="sides">Количество сторон:</label>
                        <input type="number" id="sides" name="sides" min="1" value="1">
                    </div>
                    <div class="form-group">
                        <label for="owner">Собственник:</label>
                        <input type="text" id="owner" name="owner">
                    </div>
                    <div class="form-group">
                        <label for="note">Примечание:</label>
                        <textarea id="note" name="note"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="image">Изображение РК:</label>
                        <input type="file" id="image" name="image" accept="image/*">
                    </div>
                    <div class="form-group">
                        <label>Координаты:</label>
                        <p>Кликните на карте, чтобы выбрать местоположение или введите вручную:</p>
                        <div class="coordinates-inputs">
                            <input type="text" id="latitude" name="latitude" placeholder="Широта" required>
                            <input type="text" id="longitude" name="longitude" placeholder="Долгота" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="occupied" name="occupied">
                            Конструкция занята
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="submit">Добавить</button>
                        <button type="button" id="cancel-add">Отмена</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(formContainer);
    }

    // Создание легенды для типов конструкций
    createLegend() {
        const legend = document.createElement('div');
        legend.id = 'map-legend';
        legend.className = 'map-legend';
        
        // Определяем типы и цвета
        const types = {
            'ОН': '#FF0000',
            'Билборд': '#0000FF',
            'Экран': '#00FF00',
            'Стенд': '#FFA500',
            'Пиллар': '#800080',
            'Стела': '#FFFF00',
            'Стела АЗС': '#00FFFF',
            'Сити-формат': '#FF00FF',
            'Призма': '#008000',
            'Флагшток': '#800000',
            'ОП': '#000080'
        };
        
        // Создаем заголовок и кнопку для скрытия/показа
        const legendHeader = document.createElement('div');
        legendHeader.className = 'legend-header';
        legendHeader.innerHTML = `
            <h3>Легенда</h3>
            <button id="toggle-legend">▼</button>
        `;
        legend.appendChild(legendHeader);
        
        // Создаем содержимое легенды
        const legendContent = document.createElement('div');
        legendContent.className = 'legend-content';
        
        // Добавляем элементы для каждого типа
        Object.entries(types).forEach(([type, color]) => {
            const item = document.createElement('div');
            item.className = 'legend-item';
            item.innerHTML = `
                <span class="legend-color" style="background-color: ${color}"></span>
                <span class="legend-label">${type}</span>
            `;
            legendContent.appendChild(item);
        });
        
        // Добавляем пояснение для занятых/свободных
        const statusLegend = document.createElement('div');
        statusLegend.className = 'status-legend';
        statusLegend.innerHTML = `
            <div class="legend-item">
                <span class="legend-marker free"></span>
                <span class="legend-label">Свободна</span>
            </div>
            <div class="legend-item">
                <span class="legend-marker occupied"></span>
                <span class="legend-label">Занята</span>
            </div>
        `;
        legendContent.appendChild(statusLegend);
        
        legend.appendChild(legendContent);
        document.body.appendChild(legend);
        
        // По умолчанию скрываем содержимое
        legendContent.style.display = 'none';
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Обработчик для формы добавления конструкции
        document.getElementById('structure-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddStructure();
        });

        // Обработчик для кнопки отмены
        document.getElementById('cancel-add').addEventListener('click', () => {
            this.toggleAddStructureForm();
        });

        // Обработчик для переключения легенды
        document.getElementById('toggle-legend').addEventListener('click', () => {
            this.toggleLegend();
        });

        // Обработчик для клика на карте (выбор координат)
        mapManager.map.events.add('click', (e) => {
            if (this.addStructureFormVisible) {
                const coords = e.get('coords');
                document.getElementById('latitude').value = coords[0].toFixed(6);
                document.getElementById('longitude').value = coords[1].toFixed(6);
            }
        });

        // Делегирование событий для кнопок в балунах маркеров
        document.addEventListener('click', (e) => {
            // Обработка кнопки "Занять/Освободить"
            if (e.target.classList.contains('toggle-occupied')) {
                const id = e.target.dataset.id;
                this.handleToggleOccupied(id);
            }
            
            // Обработка кнопки "Удалить"
            if (e.target.classList.contains('delete-marker')) {
                const id = e.target.dataset.id;
                this.handleDeleteMarker(id);
            }
        });
    }

    // Переключение отображения формы добавления конструкции
    toggleAddStructureForm() {
        const form = document.getElementById('add-structure-form');
        this.addStructureFormVisible = !this.addStructureFormVisible;
        form.style.display = this.addStructureFormVisible ? 'block' : 'none';
        
        // Сбрасываем форму при закрытии
        if (!this.addStructureFormVisible) {
            document.getElementById('structure-form').reset();
        }
    }

    // Переключение отображения легенды
    toggleLegend() {
        const legendContent = document.querySelector('.legend-content');
        const toggleButton = document.getElementById('toggle-legend');
        
        this.legendVisible = !this.legendVisible;
        legendContent.style.display = this.legendVisible ? 'block' : 'none';
        toggleButton.textContent = this.legendVisible ? '▲' : '▼';
    }

    // Обновление UI в зависимости от статуса авторизации
    updateUIBasedOnAuth() {
        const isAdmin = auth && auth.isAdmin();
        
        // Обновляем видимость кнопки добавления РК
        const addBtn = document.getElementById('add-structure-btn');
        if (addBtn) {
            addBtn.style.display = isAdmin ? 'block' : 'none';
        }
    }

    // Обработка добавления новой конструкции
    async handleAddStructure() {
        try {
            // Проверяем, является ли пользователь администратором
            if (!auth || !auth.isAdmin()) {
                alert('У вас нет прав для добавления рекламных конструкций');
                return;
            }
            
            const form = document.getElementById('structure-form');
            const formData = new FormData(form);
            
            // Получаем файл изображения
            const imageFile = formData.get('image');
            
            // Создаем объект с данными новой конструкции
            const newStructure = {
                "Адрес_Рк": formData.get('address'),
                "Вид_Рк": formData.get('type'),
                "Тип_Рк": formData.get('subtype'),
                "Размер_Рк": formData.get('size'),
                "Кол_во_сторон_Рк": formData.get('sides'),
                "Собст_или_владелец_Рк": formData.get('owner'),
                "Примечание": formData.get('note'),
                latitude: parseFloat(formData.get('latitude')),
                longitude: parseFloat(formData.get('longitude')),
                occupied: formData.get('occupied') === 'on',
                imageFile: imageFile.size > 0 ? imageFile : null
            };
            
            // Добавляем в базу данных
            const addedItem = await db.addItem(newStructure);
            
            // Добавляем маркер на карту
            mapManager.addMarker(addedItem);
            
            // Закрываем форму
            this.toggleAddStructureForm();
            
            // Уведомляем пользователя
            alert('Рекламная конструкция успешно добавлена!');
        } catch (error) {
            console.error('Ошибка при добавлении конструкции:', error);
            alert('Произошла ошибка при добавлении конструкции. Пожалуйста, попробуйте снова.');
        }
    }

    // Обработка переключения статуса занятости
    async handleToggleOccupied(id) {
        try {
            // Проверяем, является ли пользователь администратором
            if (!auth || !auth.isAdmin()) {
                alert('У вас нет прав для изменения статуса рекламных конструкций');
                return;
            }
            
            console.log('Переключение статуса занятости для ID:', id);
            
            // Обновляем в базе данных
            const updatedItem = await db.toggleOccupied(id);
            
            if (updatedItem) {
                // Обновляем маркер на карте
                mapManager.updateMarker(id, { occupied: updatedItem.occupied });
                
                // Закрываем балун
                mapManager.map.balloon.close();
                
                // Уведомляем пользователя
                alert(`Статус конструкции изменен на: ${updatedItem.occupied ? "Занята" : "Свободна"}`);
            }
        } catch (error) {
            console.error('Ошибка при изменении статуса занятости:', error);
            alert('Произошла ошибка при изменении статуса. Пожалуйста, попробуйте снова.');
        }
    }

    // Обработка удаления маркера
    async handleDeleteMarker(id) {
        // Проверяем, является ли пользователь администратором
        if (!auth || !auth.isAdmin()) {
            alert('У вас нет прав для удаления рекламных конструкций');
            return;
        }
        
        console.log('Удаление маркера с ID:', id);
        
        if (confirm('Вы уверены, что хотите удалить эту рекламную конструкцию?')) {
            try {
                // Удаляем из базы данных
                await db.removeItem(id);
                
                // Удаляем маркер с карты
                mapManager.removeMarker(id);
                
                // Закрываем балун
                mapManager.map.balloon.close();
                
                // Уведомляем пользователя
                alert('Рекламная конструкция успешно удалена');
            } catch (error) {
                console.error('Ошибка при удалении конструкции:', error);
                alert('Произошла ошибка при удалении конструкции. Пожалуйста, попробуйте снова.');
            }
        }
    }
}

// Создаем экземпляр менеджера UI
const uiManager = new UIManager(); 