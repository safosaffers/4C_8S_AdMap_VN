// mapManager.js - Управление картой и маркерами

class MapManager {
    constructor(mapElementId) {
        this.mapElementId = mapElementId;
        this.map = null;
        this.layer = null;
        this.placemarks = [];
        this.markerImages = {};
        this.initMarkerImages();
    }

    // Инициализация карты
    initMap(center = [58.5215, 31.2755], zoom = 14) {
        this.map = new ymaps.Map(this.mapElementId, {
            center: center,
            zoom: zoom,
            controls: ['fullscreenControl']
        });
        // ----------------------------------------------------------------------------
        // Создаем пользовательский макет для кнопки полноэкранного режима
        const FullscreenControlLayout = ymaps.templateLayoutFactory.createClass(
            '<div class="custom-fullscreen-control">' +
            '<span class="icon">+</span>' + // Здесь можно использовать свою иконку
            '</div>', {
                build: function () {
                    FullscreenControlLayout.superclass.build.call(this);
                    this._$element = $('.custom-fullscreen-control', this.getParentElement());
                    this._$element.on('click', this._onClick.bind(this));
                },
                clear: function () {
                    this._$element.off('click');
                    FullscreenControlLayout.superclass.clear.call(this);
                },
                _onClick: function () {
                    alert('Кнопка полноэкранного режима нажата!');
                }
            }
        );

        // Добавляем кнопку с пользовательским макетом
        const fullscreenControl = new ymaps.control.FullscreenControl({
            layout: FullscreenControlLayout
        });
        this.map.controls.add(fullscreenControl);
        // ----------------------------------------------------------------------------
        return this.map;
    }

    // Инициализация изображений для разных типов маркеров
    initMarkerImages() {
        // Цвета для разных типов конструкций
        const typeColors = {
            'ОН': '#FF0000',       // Красный
            'Билборд': '#0000FF',  // Синий
            'Экран': '#00FF00',    // Зеленый
            'Стенд': '#FFA500',    // Оранжевый
            'Пиллар': '#800080',   // Фиолетовый
            'Стела': '#FFFF00',    // Желтый
            'Стела АЗС': '#00FFFF', // Голубой
            'Сити-формат': '#FF00FF', // Розовый
            'Призма': '#008000',   // Темно-зеленый
            'Флагшток': '#800000', // Бордовый
            'ОП': '#000080'        // Темно-синий
        };

        // Создаем изображения для каждого типа
        Object.entries(typeColors).forEach(([type, color]) => {
            this.markerImages[type] = {
                free: {
                    iconLayout: 'default#image',
                    iconImageHref: this.createMarkerImage(color, false),
                    iconImageSize: [24, 24],
                    iconImageOffset: [-12, -12]
                },
                occupied: {
                    iconLayout: 'default#image',
                    iconImageHref: this.createMarkerImage(color, true),
                    iconImageSize: [24, 24],
                    iconImageOffset: [-12, -12]
                }
            };
        });
    }

    // Создание SVG изображения маркера с заданным цветом
    createMarkerImage(color, occupied) {
        // Создаем SVG маркер с заданным цветом
        // Для занятых маркеров добавляем внутренний круг
        const svg = occupied 
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                <circle cx="12" cy="12" r="10" fill="${color}" stroke="black" stroke-width="1"/>
                <circle cx="12" cy="12" r="5" fill="black"/>
               </svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                <circle cx="12" cy="12" r="10" fill="${color}" stroke="black" stroke-width="1"/>
               </svg>`;
        
        // Конвертируем SVG в Data URL
        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    }

    // Добавление маркера на карту
    addMarker(item) {
        // Проверяем наличие координат
        if (!item.latitude || !item.longitude) {
            console.error("Ошибка: нет координат для маркера", item);
            return null;
        }

        // Определяем тип конструкции и статус занятости
        const type = item["Вид_Рк"] || "ОН"; // По умолчанию ОН, если тип не указан
        const status = item.occupied ? 'occupied' : 'free';
        
        // Получаем соответствующее изображение маркера
        const markerOptions = this.markerImages[type] 
            ? this.markerImages[type][status] 
            : this.markerImages["ОН"][status]; // Используем ОН как запасной вариант
        
        // Создаем содержимое балуна с учетом прав доступа
        const balloonContent = this.createBalloonContent(item);

        // Создаем маркер
        const placemark = new ymaps.Placemark(
            [item.latitude, item.longitude],
            {
                balloonContent: balloonContent,
                hintContent: `${item["Вид_Рк"]} - ${item.occupied ? "Занята" : "Свободна"}`
            },
            markerOptions
        );
        
        // Добавляем обработчик события открытия балуна
        placemark.events.add('balloonopen', () => {
            this.setupBalloonEventListeners(item.id);
        });

        // Добавляем маркер на карту
        this.map.geoObjects.add(placemark);
        
        // Сохраняем информацию о маркере
        const markerInfo = { 
            placemark, 
            type: item["Вид_Рк"], 
            id: item.id,
            occupied: item.occupied
        };
        
        this.placemarks.push(markerInfo);
        return markerInfo;
    }
    
    // Создание содержимого балуна с учетом прав доступа
    createBalloonContent(item) {
        const isAdmin = auth && auth.isAdmin();
        
        // Базовая информация, доступная всем
        let content = `
            <div class="marker-balloon">
                <h3>${item["Адрес_Рк"] || "Без адреса"}</h3>
                <p><strong>Вид:</strong> ${item["Вид_Рк"] || "Не указан"}</p>
                <p><strong>Тип:</strong> ${item["Тип_Рк"] || "Не указан"}</p>
                <p><strong>Размер:</strong> ${item["Размер_Рк"] || "Не указан"}</p>
                <p><strong>Статус:</strong> ${item.occupied ? "Занята" : "Свободна"}</p>
                <p><strong>Примечание:</strong> ${item["Примечание"] || "Нет примечания"}</p>
                <p><strong>Адрес размещения:</strong> ${item["Адрес_размещ_Рк"] || "Не указан"}</p>
                <p><strong>Собственник:</strong> ${item["Собст_или_владелец_Рк"] || "Не указан"}</p>
                ${item.imageUrl ? `<img src="${item.imageUrl}" alt="Изображение РК" style="max-width:100%;margin-top:10px;">` : ''}
        `;
        
        // Добавляем кнопки управления только для администратора
        if (isAdmin) {
            content += `
                <div class="marker-actions">
                    <button class="toggle-occupied" data-id="${item.id}" onclick="uiManager.handleToggleOccupied('${item.id}')">
                        ${item.occupied ? "Освободить" : "Занять"}
                    </button>
                    <button class="delete-marker" data-id="${item.id}" onclick="uiManager.handleDeleteMarker('${item.id}')">Удалить</button>
                </div>
            `;
        }
        
        content += `</div>`;
        return content;
    }
    
    // Настройка обработчиков событий для кнопок в балуне
    setupBalloonEventListeners(id) {
        // Проверяем, является ли пользователь администратором
        const isAdmin = auth && auth.isAdmin();
        
        if (isAdmin) {
            // Даем немного времени для отрисовки DOM
            setTimeout(() => {
                // Находим кнопки в открытом балуне
                const toggleBtn = document.querySelector(`.toggle-occupied[data-id="${id}"]`);
                const deleteBtn = document.querySelector(`.delete-marker[data-id="${id}"]`);
                
                // Добавляем обработчики событий
                if (toggleBtn) {
                    // Удаляем старые обработчики, чтобы избежать дублирования
                    toggleBtn.replaceWith(toggleBtn.cloneNode(true));
                    const newToggleBtn = document.querySelector(`.toggle-occupied[data-id="${id}"]`);
                    
                    newToggleBtn.addEventListener('click', () => {
                        console.log('Toggle button clicked for ID:', id);
                        uiManager.handleToggleOccupied(id);
                    });
                }
                
                if (deleteBtn) {
                    // Удаляем старые обработчики, чтобы избежать дублирования
                    deleteBtn.replaceWith(deleteBtn.cloneNode(true));
                    const newDeleteBtn = document.querySelector(`.delete-marker[data-id="${id}"]`);
                    
                    newDeleteBtn.addEventListener('click', () => {
                        console.log('Delete button clicked for ID:', id);
                        uiManager.handleDeleteMarker(id);
                    });
                }
            }, 100); // Небольшая задержка для уверенности, что DOM обновился
        }
    }

    // Обновление маркера
    updateMarker(id, updates) {
        const markerIndex = this.placemarks.findIndex(marker => marker.id === id);
        if (markerIndex === -1) return null;

        const marker = this.placemarks[markerIndex];
        
        // Если изменился статус занятости или тип, обновляем иконку
        if (updates.occupied !== undefined && updates.occupied !== marker.occupied || 
            updates.type !== undefined && updates.type !== marker.type) {
            
            // Удаляем старый маркер с карты
            this.map.geoObjects.remove(marker.placemark);
            
            // Обновляем данные маркера
            const updatedMarker = {
                ...marker,
                occupied: updates.occupied !== undefined ? updates.occupied : marker.occupied,
                type: updates.type !== undefined ? updates.type : marker.type
            };
            
            // Получаем данные о маркере из базы данных
            const itemData = db.getItemById(id);
            if (!itemData) return null;
            
            // Обновляем данные в itemData
            itemData.occupied = updatedMarker.occupied;
            if (updates.type !== undefined) {
                itemData["Вид_Рк"] = updates.type;
            }
            
            // Создаем новый маркер с обновленными данными
            const type = updatedMarker.type;
            const status = updatedMarker.occupied ? 'occupied' : 'free';
            
            // Получаем соответствующее изображение маркера
            const markerOptions = this.markerImages[type] 
                ? this.markerImages[type][status] 
                : this.markerImages["ОН"][status];
            
            // Создаем обновленное содержимое балуна
            const balloonContent = this.createBalloonContent(itemData);
            
            // Обновляем маркер
            updatedMarker.placemark = new ymaps.Placemark(
                marker.placemark.geometry.getCoordinates(),
                {
                    balloonContent: balloonContent,
                    hintContent: `${type} - ${updatedMarker.occupied ? "Занята" : "Свободна"}`
                },
                markerOptions
            );
            
            // Добавляем обработчик события открытия балуна
            updatedMarker.placemark.events.add('balloonopen', () => {
                this.setupBalloonEventListeners(id);
            });
            
            // Добавляем обновленный маркер на карту
            this.map.geoObjects.add(updatedMarker.placemark);
            
            // Обновляем информацию в массиве
            this.placemarks[markerIndex] = updatedMarker;
            
            return updatedMarker;
        }
        
        return marker;
    }

    // Удаление маркера
    removeMarker(id) {
        const markerIndex = this.placemarks.findIndex(marker => marker.id === id);
        if (markerIndex === -1) return false;
        
        // Удаляем маркер с карты
        this.map.geoObjects.remove(this.placemarks[markerIndex].placemark);
        
        // Удаляем из массива
        this.placemarks.splice(markerIndex, 1);
        
        return true;
    }

    // Применение фильтров
    applyFilters(selectedTypes) {
        this.placemarks.forEach(({ placemark, type }) => {
            if (selectedTypes.includes(type)) {
                this.map.geoObjects.add(placemark); // Показываем маркер
            } else {
                this.map.geoObjects.remove(placemark); // Скрываем маркер
            }
        });
    }
    
    // Применение фильтров с учетом статуса занятости
    applyFiltersWithOccupancy(selectedTypes, showFree, showOccupied) {
        this.placemarks.forEach(({ placemark, type, occupied }) => {
            // Проверяем, соответствует ли маркер выбранному типу и статусу занятости
            const typeMatches = selectedTypes.includes(type);
            const occupancyMatches = (occupied && showOccupied) || (!occupied && showFree);
            
            if (typeMatches && occupancyMatches) {
                this.map.geoObjects.add(placemark); // Показываем маркер
            } else {
                this.map.geoObjects.remove(placemark); // Скрываем маркер
            }
        });
    }

    // Очистка всех маркеров
    clearMarkers() {
        this.placemarks.forEach(({ placemark }) => {
            this.map.geoObjects.remove(placemark);
        });
        this.placemarks = [];
    }
}

// Создаем и экспортируем экземпляр менеджера карты
const mapManager = new MapManager("map"); 