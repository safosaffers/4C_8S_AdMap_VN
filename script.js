// Инициализация карты при загрузке API Яндекс.Карт
ymaps.ready(init);

// Функция инициализации
async function init() {
    // Инициализируем авторизацию
    auth.init();
    
    // Инициализируем карту
    mapManager.initMap();
    
    // Инициализируем UI
    uiManager.init();
    
    // Загружаем данные из API
    await db.loadData();
    
    // Отображаем маркеры на карте
    displayMarkers();
    
    // Настраиваем обработчики событий для фильтров
    setupFilterHandlers();
}

// Функция для отображения маркеров на карте
function displayMarkers() {
    // Получаем данные из базы данных
    const data = db.getData();
    
    // Очищаем текущие маркеры
    mapManager.clearMarkers();
    
    // Добавляем маркеры на карту
    data.forEach(item => {
        mapManager.addMarker(item);
    });
    
    console.log(`Отображено ${data.length} маркеров на карте`);
}

// Функция для настройки обработчиков событий фильтров
function setupFilterHandlers() {
    // Обработчик для кнопки применения фильтров
    document.querySelector('#filter-form button').addEventListener('click', applyFilters);
}

// Функция для открытия/закрытия фильтров
function toggleFilters() {
    const filterSidebar = document.getElementById("filter-sidebar");
    // Проверяем, если сайдбар скрыт, то открываем его, если видим, то закрываем
    if (filterSidebar.style.transform === "translateX(0px)") {
        filterSidebar.style.transform = "translateX(-100%)";
    } else {
        filterSidebar.style.transform = "translateX(0)";
    }
}

// Функция для применения фильтров
function applyFilters() {
    // Получаем выбранные типы конструкций
    const checkedTypes = Array.from(document.querySelectorAll('#filter-form input[name="type"]:checked'))
        .map(checkbox => checkbox.value);
    
    // Получаем выбранные статусы занятости
    const checkedOccupancy = Array.from(document.querySelectorAll('#filter-form input[name="occupancy"]:checked'))
        .map(checkbox => checkbox.value);
    
    // Проверяем, выбраны ли свободные и занятые
    const showFree = checkedOccupancy.includes('free');
    const showOccupied = checkedOccupancy.includes('occupied');
    
    // Применяем фильтры через менеджер карты
    mapManager.applyFiltersWithOccupancy(checkedTypes, showFree, showOccupied);

    console.log("Применены фильтры по типам:", checkedTypes);
    console.log("Применены фильтры по занятости:", checkedOccupancy);
}

// Функция для сброса фильтров
function resetFilters() {
    document.querySelectorAll('#filter-form input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = true; // Отмечаем все галочки
    });

    // Показываем все маркеры
    const data = db.getData();
    data.forEach(item => {
        const markerInfo = mapManager.placemarks.find(m => m.id === item.id);
        if (markerInfo) {
            mapManager.map.geoObjects.add(markerInfo.placemark);
        }
    });

    console.log("Фильтры сброшены");
}
