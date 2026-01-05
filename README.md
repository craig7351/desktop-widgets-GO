# Desktop Widget (Go + Wails)

一個精美的桌面小工具，使用 Go + Wails 框架開發，提供天氣資訊、系統監控、待辦事項等功能。

## 功能特色

### 🌤️ 天氣資訊
- 即時溫度與天氣狀態圖示
- 三日天氣預報
- 日出/日落時間與降雨機率
- 支援多城市切換 (桃園、台北、台中、台南、高雄、新竹)

### 📊 系統監控
- CPU 使用率 (三段式狀態色)
- RAM 使用率
- Disk C: 使用率
- 網路上下傳速度

### ✅ 待辦事項
- 最多 5 項任務
- 點擊標記完成/未完成
- 資料持久化 (關閉重開不消失)

### ⏱️ 倒數計時器
- 點擊時鐘進入計時模式
- 計時結束紅色閃爍提醒

### 🎨 視覺設計
- 玻璃擬態 (Glassmorphism)
- 無邊框透明視窗
- 動態狀態顏色 (正常綠、警告橙、危險紅)

## 技術架構

| 層級 | 技術 |
|-----|-----|
| 後端 | Go 1.21+ |
| 框架 | Wails v2 |
| 前端 | HTML + CSS + JavaScript |
| 系統監控 | gopsutil |
| 天氣 API | wttr.in |

## 📊 與 Python 版本比較

本專案是從原本的 Python (PyQt6) 版本遷移而來。以下是兩個版本的對比：

| 項目 | Go + Wails 版 | Python + PyQt6 版 |
|------|--------------|-------------------|
| **單檔大小** | ~10 MB (exe) | ~50 MB (PyInstaller 打包) |
| **啟動速度** | ⚡ 極快 (<1秒) | 一般 (2-3秒) |
| **記憶體使用** | ~30 MB | ~80 MB |
| **部署方式** | 單一 exe | 需要 Python 環境或打包 |
| **原始碼大小** | ~15 KB | ~40 KB |
| **跨平台** | ✅ 原生支援 | ✅ 需各平台打包 |
| **維護難度** | 中等 | 低 |

### 主要差異

**Go + Wails 優勢：**
- 🚀 單檔 exe，不需安裝 Python 環境
- 📦 檔案大小僅 Python 版的 1/5
- ⚡ 啟動速度更快，記憶體佔用更低
- 🎨 使用標準 Web 技術 (HTML/CSS/JS)，UI 更容易自訂

**Python + PyQt6 優勢：**
- 📝 程式碼更簡潔易讀
- 🔧 開發速度快，適合快速原型
- 📚 Python 生態系豐富

## 快速開始

### 前置需求
- Go 1.21+
- Wails CLI v2 (`go install github.com/wailsapp/wails/v2/cmd/wails@latest`)
- Node.js 16+

### 開發模式
```bash
cd desktop_widget-GO
wails dev
```

### 建置執行檔
```bash
wails build
```
輸出位置：`build/bin/desktop-widget.exe`

## 操作說明

| 操作 | 功能 |
|-----|-----|
| 左鍵拖曳 | 移動視窗位置 |
| 右鍵 | 開啟選單 (切換城市、結束) |
| 點擊時鐘 | 進入倒數計時模式 |
| 點擊 ↻ | 手動重新整理天氣 |

## 專案結構

```
desktop_widget-GO/
├── main.go              # Wails 進入點
├── app.go               # 應用邏輯、待辦事項
├── weather.go           # 天氣 API 服務
├── system_monitor.go    # 系統監控
├── wails.json           # Wails 配置
├── go.mod / go.sum
└── frontend/
    ├── index.html       # UI 結構
    └── src/
        ├── style.css    # 樣式
        └── main.js      # 前端邏輯
```

## 授權

MIT License
