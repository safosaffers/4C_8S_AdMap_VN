// database.js - Управление данными рекламных конструкций через PostgreSQL

class Database {
    constructor() {
        this.data = [];
        this.loaded = false;
        this.onDataChangeCallbacks = [];
        this.apiUrl = '/api/structures';
    }

    // Загрузка данных из API
    async loadData() {
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                throw new Error(`Ошибка загрузки данных: ${response.status}`);
            }
            
            this.data = await response.json();
            
            // Преобразуем данные для совместимости с существующим кодом
            this.data = this.data.map(item => ({
                ...item,
                id: item.id.toString(),
                "Адрес_Рк": item.address,
                "Вид_Рк": item.type,
                "Тип_Рк": item.subtype,
                "Размер_Рк": item.size,
                "Кол_во_сторон_Рк": item.sides,
                "Собст_или_владелец_Рк": item.owner,
                "Примечание": item.note,
                "Адрес_размещ_Рк": item.placement_address,
                latitude: parseFloat(item.latitude),
                longitude: parseFloat(item.longitude),
                occupied: item.occupied,
                imageUrl: item.image_url
            }));
            
            this.loaded = true;
            this.notifyDataChange();
            return this.data;
        } catch (error) {
            console.error("Ошибка загрузки или обработки данных:", error);
            return [];
        }
    }

    // Получить все данные
    getData() {
        return this.data;
    }

    // Получить данные по ID
    getItemById(id) {
        return this.data.find(item => item.id === id);
    }

    // Добавить новую рекламную конструкцию
    async addItem(item) {
        try {
            // Подготовка данных для отправки на сервер
            const formData = new FormData();
            formData.append('address', item["Адрес_Рк"] || '');
            formData.append('type', item["Вид_Рк"] || '');
            formData.append('subtype', item["Тип_Рк"] || '');
            formData.append('size', item["Размер_Рк"] || '');
            formData.append('sides', item["Кол_во_сторон_Рк"] || '1');
            formData.append('owner', item["Собст_или_владелец_Рк"] || '');
            formData.append('note', item["Примечание"] || '');
            formData.append('latitude', item.latitude || 0);
            formData.append('longitude', item.longitude || 0);
            formData.append('occupied', item.occupied || false);
            
            // Если есть изображение в виде Blob или File
            if (item.imageFile) {
                formData.append('image', item.imageFile);
            }
            
            // Отправка данных на сервер
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Ошибка при добавлении: ${response.status}`);
            }
            
            // Получаем данные с сервера
            const newItem = await response.json();
            
            // Преобразуем для совместимости
            const formattedItem = {
                ...newItem,
                id: newItem.id.toString(),
                "Адрес_Рк": newItem.address,
                "Вид_Рк": newItem.type,
                "Тип_Рк": newItem.subtype,
                "Размер_Рк": newItem.size,
                "Кол_во_сторон_Рк": newItem.sides,
                "Собст_или_владелец_Рк": newItem.owner,
                "Примечание": newItem.note,
                "Адрес_размещ_Рк": newItem.placement_address,
                latitude: parseFloat(newItem.latitude),
                longitude: parseFloat(newItem.longitude),
                occupied: newItem.occupied,
                imageUrl: newItem.image_url
            };
            
            // Добавляем в локальный массив
            this.data.push(formattedItem);
            this.notifyDataChange();
            
            return formattedItem;
        } catch (error) {
            console.error("Ошибка при добавлении рекламной конструкции:", error);
            throw error;
        }
    }

    // Удалить рекламную конструкцию по ID
    async removeItem(id) {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok && response.status !== 204) {
                throw new Error(`Ошибка при удалении: ${response.status}`);
            }
            
            // Удаляем из локального массива
            const index = this.data.findIndex(item => item.id === id);
            if (index !== -1) {
                this.data.splice(index, 1);
                this.notifyDataChange();
                return true;
            }
            
            return false;
        } catch (error) {
            console.error("Ошибка при удалении рекламной конструкции:", error);
            throw error;
        }
    }

    // Обновить данные рекламной конструкции
    async updateItem(id, updates) {
        try {
            // Подготовка данных для отправки на сервер
            const formData = new FormData();
            
            // Получаем текущий элемент
            const currentItem = this.getItemById(id);
            if (!currentItem) {
                throw new Error(`Элемент с ID ${id} не найден`);
            }
            
            // Добавляем обновленные данные
            formData.append('address', updates["Адрес_Рк"] || currentItem["Адрес_Рк"] || '');
            formData.append('type', updates["Вид_Рк"] || currentItem["Вид_Рк"] || '');
            formData.append('subtype', updates["Тип_Рк"] || currentItem["Тип_Рк"] || '');
            formData.append('size', updates["Размер_Рк"] || currentItem["Размер_Рк"] || '');
            formData.append('sides', updates["Кол_во_сторон_Рк"] || currentItem["Кол_во_сторон_Рк"] || '1');
            formData.append('owner', updates["Собст_или_владелец_Рк"] || currentItem["Собст_или_владелец_Рк"] || '');
            formData.append('note', updates["Примечание"] || currentItem["Примечание"] || '');
            formData.append('latitude', updates.latitude || currentItem.latitude || 0);
            formData.append('longitude', updates.longitude || currentItem.longitude || 0);
            formData.append('occupied', updates.occupied !== undefined ? updates.occupied : currentItem.occupied);
            
            // Если есть новое изображение
            if (updates.imageFile) {
                formData.append('image', updates.imageFile);
            }
            
            // Отправка данных на сервер
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'PUT',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Ошибка при обновлении: ${response.status}`);
            }
            
            // Получаем обновленные данные с сервера
            const updatedItem = await response.json();
            
            // Преобразуем для совместимости
            const formattedItem = {
                ...updatedItem,
                id: updatedItem.id.toString(),
                "Адрес_Рк": updatedItem.address,
                "Вид_Рк": updatedItem.type,
                "Тип_Рк": updatedItem.subtype,
                "Размер_Рк": updatedItem.size,
                "Кол_во_сторон_Рк": updatedItem.sides,
                "Собст_или_владелец_Рк": updatedItem.owner,
                "Примечание": updatedItem.note,
                "Адрес_размещ_Рк": updatedItem.placement_address,
                latitude: parseFloat(updatedItem.latitude),
                longitude: parseFloat(updatedItem.longitude),
                occupied: updatedItem.occupied,
                imageUrl: updatedItem.image_url
            };
            
            // Обновляем в локальном массиве
            const index = this.data.findIndex(item => item.id === id);
            if (index !== -1) {
                this.data[index] = formattedItem;
                this.notifyDataChange();
                return formattedItem;
            }
            
            return null;
        } catch (error) {
            console.error("Ошибка при обновлении рекламной конструкции:", error);
            throw error;
        }
    }

    // Изменить статус занятости
    async toggleOccupied(id) {
        try {
            const response = await fetch(`${this.apiUrl}/${id}/toggle-occupied`, {
                method: 'PATCH'
            });
            
            if (!response.ok) {
                throw new Error(`Ошибка при изменении статуса: ${response.status}`);
            }
            
            // Получаем обновленные данные с сервера
            const updatedItem = await response.json();
            
            // Преобразуем для совместимости
            const formattedItem = {
                ...updatedItem,
                id: updatedItem.id.toString(),
                "Адрес_Рк": updatedItem.address,
                "Вид_Рк": updatedItem.type,
                "Тип_Рк": updatedItem.subtype,
                "Размер_Рк": updatedItem.size,
                "Кол_во_сторон_Рк": updatedItem.sides,
                "Собст_или_владелец_Рк": updatedItem.owner,
                "Примечание": updatedItem.note,
                "Адрес_размещ_Рк": updatedItem.placement_address,
                latitude: parseFloat(updatedItem.latitude),
                longitude: parseFloat(updatedItem.longitude),
                occupied: updatedItem.occupied,
                imageUrl: updatedItem.image_url
            };
            
            // Обновляем в локальном массиве
            const index = this.data.findIndex(item => item.id === id);
            if (index !== -1) {
                this.data[index] = formattedItem;
                this.notifyDataChange();
                return formattedItem;
            }
            
            return null;
        } catch (error) {
            console.error("Ошибка при изменении статуса занятости:", error);
            throw error;
        }
    }

    // Подписка на изменения данных
    onDataChange(callback) {
        this.onDataChangeCallbacks.push(callback);
    }

    // Уведомление о изменении данных
    notifyDataChange() {
        this.onDataChangeCallbacks.forEach(callback => callback(this.data));
    }
}

// Создаем и экспортируем экземпляр базы данных
const db = new Database(); 