# Карта рекламных конструкций

Интерактивная карта рекламных конструкций с использованием Яндекс.Карт API и PostgreSQL.

## Функциональность

- Отображение рекламных конструкций на карте
- Цветовая дифференциация маркеров по типу конструкции
- Фильтрация конструкций по типу
- Добавление новых рекламных конструкций
- Удаление существующих конструкций
- Изменение статуса занятости конструкции
- Загрузка изображений для рекламных конструкций
- Сохранение данных в PostgreSQL базе данных

## Запуск проекта с использованием Docker

### Предварительные требования

- Установленный Docker: [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)
- Установленный Docker Compose: [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/)

### Шаги для запуска

1. Клонируйте репозиторий:
   ```
   git clone <url-репозитория>
   cd <директория-проекта>
   ```

2. Запустите контейнеры с помощью Docker Compose:
   ```
   docker-compose up -d
   ```

3. Инициализируйте базу данных (при первом запуске):
   ```
   docker-compose exec web npm run init-db
   ```

4. Откройте приложение в браузере:
   ```
   http://localhost:8080
   ```

### Остановка контейнеров

```
docker-compose down
```

### Просмотр логов

```
docker-compose logs -f
```

## Запуск проекта локально (без Docker)

### Предварительные требования

- Node.js: [https://nodejs.org/](https://nodejs.org/)
- PostgreSQL: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)

### Шаги для запуска

1. Клонируйте репозиторий:
   ```
   git clone <url-репозитория>
   cd <директория-проекта>
   ```

2. Установите зависимости:
   ```
   npm install
   ```

3. Создайте базу данных в PostgreSQL:
   ```
   createdb adstructures
   ```

4. Инициализируйте схему базы данных:
   ```
   psql -d adstructures -f init-db.sql
   ```

5. Загрузите данные в базу:
   ```
   npm run init-db
   ```

6. Запустите сервер:
   ```
   npm start
   ```

7. Откройте приложение в браузере:
   ```
   http://localhost:8080
   ```

## Структура проекта

- `index.html` - Основной HTML файл
- `style.css` - Стили проекта
- `script.js` - Основной JavaScript файл
- `database.js` - Модуль для работы с данными
- `mapManager.js` - Модуль для управления картой и маркерами
- `uiManager.js` - Модуль для управления пользовательским интерфейсом
- `server.js` - Серверная часть приложения (Express)
- `init-db.sql` - SQL-скрипт для инициализации базы данных
- `scripts/init-db.js` - Скрипт для загрузки данных в базу
- `Dockerfile` - Конфигурация Docker для веб-приложения
- `docker-compose.yml` - Конфигурация Docker Compose для запуска всех сервисов
- `full_geo_data_with_lat_lon.json` - JSON файл с исходными данными о рекламных конструкциях

## Технологии

- Frontend: HTML, CSS, JavaScript, Яндекс.Карты API
- Backend: Node.js, Express
- База данных: PostgreSQL
- Контейнеризация: Docker, Docker Compose

## Примечания

- Для работы с API Яндекс.Карт требуется подключение к интернету
- Изображения рекламных конструкций сохраняются в директории `uploads`
- Данные сохраняются в PostgreSQL, что обеспечивает их сохранность между перезапусками 