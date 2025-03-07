// auth.js - Управление авторизацией

class Auth {
    constructor() {
        this.isLoggedIn = false;
        this.user = null;
        this.loginFormVisible = false;
        
        // Проверяем, есть ли сохраненная сессия
        this.checkSession();
    }
    
    // Инициализация UI для авторизации
    init() {
        this.createLoginButton();
        this.createLoginForm();
        this.setupEventListeners();
    }
    
    // Создание кнопки для входа/выхода
    createLoginButton() {
        const button = document.createElement('button');
        button.id = 'login-btn';
        button.className = 'login-btn';
        button.textContent = this.isLoggedIn ? 'Выйти' : 'Войти';
        button.onclick = () => this.isLoggedIn ? this.logout() : this.toggleLoginForm();
        document.body.appendChild(button);
    }
    
    // Создание формы для входа
    createLoginForm() {
        const formContainer = document.createElement('div');
        formContainer.id = 'login-form';
        formContainer.className = 'login-form';
        formContainer.style.display = 'none';
        
        formContainer.innerHTML = `
            <div class="login-content">
                <h2>Вход в систему</h2>
                <form id="auth-form">
                    <div class="login-group">
                        <label for="username">Имя пользователя:</label>
                        <input type="text" id="username" name="username" required>
                    </div>
                    <div class="login-group">
                        <label for="password">Пароль:</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <div class="login-actions">
                        <button type="submit">Войти</button>
                        <button type="button" id="cancel-login">Отмена</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(formContainer);
    }
    
    // Настройка обработчиков событий
    setupEventListeners() {
        // Обработчик для формы входа
        document.getElementById('auth-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        // Обработчик для кнопки отмены
        document.getElementById('cancel-login').addEventListener('click', () => {
            this.toggleLoginForm();
        });
    }
    
    // Переключение отображения формы входа
    toggleLoginForm() {
        const form = document.getElementById('login-form');
        this.loginFormVisible = !this.loginFormVisible;
        form.style.display = this.loginFormVisible ? 'flex' : 'none';
        
        // Сбрасываем форму при закрытии
        if (!this.loginFormVisible) {
            document.getElementById('auth-form').reset();
        }
    }
    
    // Обработка входа в систему
    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Проверка учетных данных администратора
        // В реальном приложении это должно быть безопасное хеширование и проверка на сервере
        if (username === 'admin' && password === 'admin123') {
            this.isLoggedIn = true;
            this.user = { username, role: 'admin' };
            
            // Сохраняем сессию
            this.saveSession();
            
            // Обновляем UI
            this.updateUI();
            
            // Закрываем форму входа
            this.toggleLoginForm();
            
            // Уведомляем пользователя
            alert('Вы успешно вошли в систему как администратор');
        } else {
            alert('Неверное имя пользователя или пароль');
        }
    }
    
    // Выход из системы
    logout() {
        this.isLoggedIn = false;
        this.user = null;
        
        // Удаляем сессию
        this.clearSession();
        
        // Обновляем UI
        this.updateUI();
        
        // Уведомляем пользователя
        alert('Вы вышли из системы');
    }
    
    // Обновление UI в зависимости от статуса авторизации
    updateUI() {
        console.log('Обновление UI, статус авторизации:', this.isLoggedIn);
        
        // Обновляем текст кнопки
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.textContent = this.isLoggedIn ? 'Выйти' : 'Войти';
            loginBtn.onclick = () => this.isLoggedIn ? this.logout() : this.toggleLoginForm();
        }
        
        // Обновляем видимость кнопки добавления РК
        const addBtn = document.getElementById('add-structure-btn');
        if (addBtn) {
            addBtn.style.display = this.isLoggedIn ? 'block' : 'none';
        }
        
        // Если есть открытый балун, закрываем его, чтобы обновить содержимое
        if (mapManager && mapManager.map && mapManager.map.balloon.isOpen()) {
            mapManager.map.balloon.close();
        }
        
        // Если пользователь вышел из системы, перезагружаем маркеры
        if (!this.isLoggedIn && mapManager && typeof displayMarkers === 'function') {
            displayMarkers();
        }
    }
    
    // Обновление кнопок в балунах маркеров
    updateMarkerButtons() {
        // Эта функция будет вызываться при открытии балуна маркера
        // Реализация в mapManager.js
    }
    
    // Проверка, является ли пользователь администратором
    isAdmin() {
        return this.isLoggedIn && this.user && this.user.role === 'admin';
    }
    
    // Сохранение сессии в localStorage
    saveSession() {
        localStorage.setItem('auth', JSON.stringify({
            isLoggedIn: this.isLoggedIn,
            user: this.user
        }));
    }
    
    // Проверка сохраненной сессии
    checkSession() {
        const savedAuth = localStorage.getItem('auth');
        if (savedAuth) {
            const { isLoggedIn, user } = JSON.parse(savedAuth);
            this.isLoggedIn = isLoggedIn;
            this.user = user;
        }
    }
    
    // Удаление сессии
    clearSession() {
        localStorage.removeItem('auth');
    }
}

// Создаем и экспортируем экземпляр авторизации
const auth = new Auth(); 