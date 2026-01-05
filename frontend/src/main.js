// Wails 綁定
import { FetchWeather, GetSystemStats, GetTodos, AddTodo, RemoveTodo, ToggleTodo, SetCity, GetCity, Quit, SetAlwaysOnTop } from '../wailsjs/go/main/App';

// ===== DOM 元素 =====
const dayLabel = document.getElementById('day-label');
const dateLabel = document.getElementById('date-label');
const timeLabel = document.getElementById('time-label');
const tempLabel = document.getElementById('temp-label');
const weatherIcon = document.getElementById('weather-icon');
const descLabel = document.getElementById('desc-label');
const locationLabel = document.getElementById('location-label');
const sunriseVal = document.getElementById('sunrise-val');
const sunsetVal = document.getElementById('sunset-val');
const rainVal = document.getElementById('rain-val');
const forecastArea = document.getElementById('forecast-area');
const refreshBtn = document.getElementById('refresh-btn');

// 系統監控
const cpuVal = document.getElementById('cpu-val');
const cpuBar = document.getElementById('cpu-bar');
const ramVal = document.getElementById('ram-val');
const ramBar = document.getElementById('ram-bar');
const diskVal = document.getElementById('disk-val');
const diskBar = document.getElementById('disk-bar');
const netDownVal = document.getElementById('net-down-val');
const netDownBar = document.getElementById('net-down-bar');
const netUpVal = document.getElementById('net-up-val');
const netUpBar = document.getElementById('net-up-bar');

// 待辦事項
const todoList = document.getElementById('todo-list');
const todoInput = document.getElementById('todo-input');

// 倒數計時
const clockPage = document.getElementById('clock-page');
const timerPage = document.getElementById('timer-page');
const timerDisplay = document.getElementById('timer-display');
const minInput = document.getElementById('min-input');
const secInput = document.getElementById('sec-input');
const startTimerBtn = document.getElementById('start-timer-btn');
const backBtn = document.getElementById('back-btn');

// 右鍵選單
const contextMenu = document.getElementById('context-menu');
const widgetContainer = document.getElementById('app');

// ===== 城市對照 =====
const cityNames = {
    'Taoyuan': 'TAOYUAN',
    'Taipei': 'TAIPEI',
    'Taichung': 'TAICHUNG',
    'Tainan': 'TAINAN',
    'Kaohsiung': 'KAOHSIUNG',
    'Hsinchu': 'HSINCHU'
};

// ===== 時間更新 =====
function updateTime() {
    const now = new Date();
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

    dayLabel.textContent = days[now.getDay()];
    dateLabel.textContent = `${months[now.getMonth()]} ${String(now.getDate()).padStart(2, '0')}, ${now.getFullYear()}`;
    timeLabel.textContent = now.toTimeString().split(' ')[0];
}

// ===== 天氣更新 =====
let retryCount = 0;
async function updateWeather(isRetry = false) {
    try {
        const data = await FetchWeather();
        if (!data) {
            if (isRetry && retryCount < 2) {
                retryCount++;
                console.log(`Weather fetch failed. Retrying (${retryCount}/2)...`);
                setTimeout(() => updateWeather(true), 2000);
            }
            return;
        }
        retryCount = 0;

        tempLabel.textContent = `${data.temp_c}°C`;
        weatherIcon.textContent = data.icon;
        descLabel.textContent = data.desc.toUpperCase();
        sunriseVal.textContent = data.sunrise;
        sunsetVal.textContent = data.sunset;
        rainVal.textContent = `${data.rain_chance}%`;

        // 預報
        forecastArea.innerHTML = '';
        data.forecast.forEach(day => {
            const card = document.createElement('div');
            card.className = 'forecast-card';
            card.innerHTML = `
                <span class="forecast-day">${day.day.toUpperCase()}</span>
                <span class="forecast-icon">${day.icon}</span>
                <span class="forecast-temp">${day.min}~${day.max}°C</span>
            `;
            forecastArea.appendChild(card);
        });

        // 更新城市名稱
        const city = await GetCity();
        locationLabel.textContent = cityNames[city] || city.toUpperCase();
    } catch (err) {
        console.error('Weather error:', err);
    }
}

// ===== 系統監控 =====
async function updateSystemStats() {
    try {
        const stats = await GetSystemStats();
        if (!stats) return;

        // CPU
        cpuVal.textContent = `${stats.cpu.toFixed(1)}%`;
        cpuBar.style.width = `${stats.cpu}%`;
        updateBarStatus(cpuBar, stats.cpu);

        // RAM
        ramVal.textContent = `${stats.ram.toFixed(1)}%`;
        ramBar.style.width = `${stats.ram}%`;
        updateBarStatus(ramBar, stats.ram);

        // Disk
        diskVal.textContent = `${stats.disk.toFixed(1)}%`;
        diskBar.style.width = `${stats.disk}%`;
        updateBarStatus(diskBar, stats.disk);

        // Network
        const dlKB = stats.net_down_kb;
        const upKB = stats.net_up_kb;

        netDownVal.textContent = dlKB < 1024 ? `${dlKB.toFixed(1)} KB/s` : `${(dlKB / 1024).toFixed(1)} MB/s`;
        netUpVal.textContent = upKB < 1024 ? `${upKB.toFixed(1)} KB/s` : `${(upKB / 1024).toFixed(1)} MB/s`;

        // 網路進度條 (參考: 10MB/s 下載, 2MB/s 上傳)
        netDownBar.style.width = `${Math.min(100, (dlKB / 10240) * 100)}%`;
        netUpBar.style.width = `${Math.min(100, (upKB / 2048) * 100)}%`;
    } catch (err) {
        console.error('System stats error:', err);
    }
}

function updateBarStatus(bar, percent) {
    bar.classList.remove('warning', 'critical');
    if (percent >= 90) {
        bar.classList.add('critical');
    } else if (percent >= 70) {
        bar.classList.add('warning');
    }
}

// ===== 待辦事項 =====
async function refreshTodos() {
    try {
        const todos = await GetTodos();
        todoList.innerHTML = '';

        todos.forEach((todo, index) => {
            const item = document.createElement('div');
            item.className = `todo-item${todo.done ? ' done' : ''}`;
            item.innerHTML = `
                <span class="todo-text">${todo.text}</span>
                <button class="todo-del-btn">×</button>
            `;

            // 點擊切換完成狀態
            item.querySelector('.todo-text').addEventListener('click', async () => {
                await ToggleTodo(index);
                refreshTodos();
            });

            // 刪除
            item.querySelector('.todo-del-btn').addEventListener('click', async () => {
                await RemoveTodo(index);
                refreshTodos();
            });

            todoList.appendChild(item);
        });

        // 填充空位保持高度
        for (let i = todos.length; i < 5; i++) {
            const spacer = document.createElement('div');
            spacer.className = 'todo-item';
            spacer.innerHTML = '&nbsp;';
            todoList.appendChild(spacer);
        }
    } catch (err) {
        console.error('Todos error:', err);
    }
}

todoInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const text = todoInput.value.trim();
        if (text) {
            const success = await AddTodo(text);
            if (success) {
                todoInput.value = '';
                refreshTodos();
            } else {
                todoInput.placeholder = 'Limit reached (5)';
            }
        }
    }
});

// ===== 倒數計時 =====
let remainingSeconds = 0;
let timerInterval = null;
let flashInterval = null;

timeLabel.addEventListener('click', () => {
    clockPage.classList.remove('active');
    timerPage.classList.add('active');
});

backBtn.addEventListener('click', switchToClockPage);

function switchToClockPage() {
    stopTimer();
    timerPage.classList.remove('active');
    clockPage.classList.add('active');
}

startTimerBtn.addEventListener('click', () => {
    if (timerInterval) {
        stopTimer();
    } else {
        startTimer();
    }
});

function startTimer() {
    const mins = parseInt(minInput.value) || 0;
    const secs = parseInt(secInput.value) || 0;
    remainingSeconds = mins * 60 + secs;

    if (remainingSeconds > 0) {
        minInput.style.display = 'none';
        secInput.style.display = 'none';
        startTimerBtn.textContent = 'Stop';

        timerInterval = setInterval(() => {
            if (remainingSeconds > 0) {
                remainingSeconds--;
                updateTimerDisplay();
            } else {
                stopTimer();
                startFlash();
            }
        }, 1000);

        updateTimerDisplay();
    }
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    stopFlash();
    startTimerBtn.textContent = 'Start';
    minInput.style.display = 'block';
    secInput.style.display = 'block';
}

function updateTimerDisplay() {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function startFlash() {
    widgetContainer.classList.add('flash');
    flashInterval = setTimeout(() => {
        stopFlash();
    }, 10000); // 閃爍 10 秒後自動停止
}

function stopFlash() {
    widgetContainer.classList.remove('flash');
    if (flashInterval) {
        clearTimeout(flashInterval);
        flashInterval = null;
    }
}

// ===== 視窗拖曳由 CSS --wails-draggable:drag 控制 =====

// ===== 右鍵選單 =====
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();

    // 先顯示選單以取得尺寸
    contextMenu.style.left = '0px';
    contextMenu.style.top = '0px';
    contextMenu.classList.add('show');

    const menuWidth = contextMenu.offsetWidth;
    const menuHeight = contextMenu.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // 計算最佳位置
    let left = e.clientX;
    let top = e.clientY;

    // 如果選單會超出右邊界，往左顯示
    if (left + menuWidth > windowWidth) {
        left = e.clientX - menuWidth;
    }

    // 如果選單會超出下邊界，往上顯示
    if (top + menuHeight > windowHeight) {
        top = e.clientY - menuHeight;
    }

    // 確保不會超出左邊界或上邊界
    left = Math.max(0, left);
    top = Math.max(0, top);

    contextMenu.style.left = `${left}px`;
    contextMenu.style.top = `${top}px`;
});

document.addEventListener('click', () => {
    contextMenu.classList.remove('show');
});

// 城市切換
document.querySelectorAll('.menu-item[data-city]').forEach(item => {
    item.addEventListener('click', async () => {
        const city = item.dataset.city;
        await SetCity(city);
        locationLabel.textContent = cityNames[city] || city.toUpperCase();
        updateWeather();
    });
});

// 結束
document.getElementById('menu-quit').addEventListener('click', () => {
    Quit();
});

// ===== 視窗層級控制 =====
let isOnTop = true;
const menuOnTop = document.getElementById('menu-ontop');
const menuNormal = document.getElementById('menu-normal');

function updateLayerMenu() {
    if (isOnTop) {
        menuOnTop.textContent = '📌 最上層 (目前)';
        menuNormal.textContent = '📋 一般層級';
    } else {
        menuOnTop.textContent = '📌 最上層';
        menuNormal.textContent = '📋 一般層級 (目前)';
    }
}

menuOnTop.addEventListener('click', () => {
    if (!isOnTop) {
        isOnTop = true;
        SetAlwaysOnTop(true);
        updateLayerMenu();
    }
});

menuNormal.addEventListener('click', () => {
    if (isOnTop) {
        isOnTop = false;
        SetAlwaysOnTop(false);
        updateLayerMenu();
    }
});

// ===== 重新整理按鈕 =====
refreshBtn.addEventListener('click', () => {
    updateWeather();
});

// ===== 啟動 =====
updateTime();
setInterval(updateTime, 1000);

// 延遲 2 秒後抓取天氣
setTimeout(() => updateWeather(true), 2000);

// 系統監控 5 秒更新
updateSystemStats();
setInterval(updateSystemStats, 5000);

// 天氣 30 分鐘更新
setInterval(updateWeather, 30 * 60 * 1000);

// 載入待辦事項
refreshTodos();

// ===== 外觀設定 =====
const bgSubmenu = document.getElementById('bg-submenu');
const textSubmenu = document.getElementById('text-submenu');
const bgColorPicker = document.getElementById('bg-color-picker');
const textColorPicker = document.getElementById('text-color-picker');

// 當前樣式狀態
let currentBgColor = { r: 0, g: 0, b: 0 };
let currentBgAlpha = 0.78;
let currentTextColor = { r: 255, g: 255, b: 255 };
let currentTextAlpha = 1.0;

// 更新 CSS 變數
function updateStyles() {
    const root = document.documentElement;
    root.style.setProperty('--bg-color', `rgba(${currentBgColor.r}, ${currentBgColor.g}, ${currentBgColor.b}, ${currentBgAlpha})`);
    root.style.setProperty('--text-color', `rgba(${currentTextColor.r}, ${currentTextColor.g}, ${currentTextColor.b}, ${currentTextAlpha})`);
    root.style.setProperty('--text-muted', `rgba(${currentTextColor.r}, ${currentTextColor.g}, ${currentTextColor.b}, ${currentTextAlpha * 0.6})`);
}

// 隱藏所有子選單
function hideAllSubmenus() {
    bgSubmenu.classList.remove('show');
    textSubmenu.classList.remove('show');
}

// 子選單切換
document.querySelectorAll('.submenu-toggle').forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        const submenuId = item.dataset.submenu;
        const submenu = document.getElementById(submenuId);

        // 先隱藏其他子選單
        hideAllSubmenus();

        // 計算位置
        const rect = item.getBoundingClientRect();
        submenu.style.left = `${rect.right + 5}px`;
        submenu.style.top = `${rect.top}px`;
        submenu.classList.add('show');
    });
});

// 背景顏色選擇
document.getElementById('bg-color-pick').addEventListener('click', (e) => {
    e.stopPropagation();
    bgColorPicker.click();
});

bgColorPicker.addEventListener('input', (e) => {
    const hex = e.target.value;
    currentBgColor = hexToRgb(hex);
    updateStyles();
    hideAllSubmenus();
    contextMenu.classList.remove('show');
});

// 文字顏色選擇
document.getElementById('text-color-pick').addEventListener('click', (e) => {
    e.stopPropagation();
    textColorPicker.click();
});

textColorPicker.addEventListener('input', (e) => {
    const hex = e.target.value;
    currentTextColor = hexToRgb(hex);
    updateStyles();
    hideAllSubmenus();
    contextMenu.classList.remove('show');
});

// 背景透明度
document.querySelectorAll('[data-bg-alpha]').forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        currentBgAlpha = parseFloat(item.dataset.bgAlpha);
        updateStyles();
        hideAllSubmenus();
        contextMenu.classList.remove('show');
    });
});

// 文字透明度
document.querySelectorAll('[data-text-alpha]').forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        currentTextAlpha = parseFloat(item.dataset.textAlpha);
        updateStyles();
        hideAllSubmenus();
        contextMenu.classList.remove('show');
    });
});

// HEX 轉 RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

// 點擊其他地方時隱藏子選單
document.addEventListener('click', () => {
    hideAllSubmenus();
});

