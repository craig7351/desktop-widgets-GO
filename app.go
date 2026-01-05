package main

import (
	"context"
	"encoding/json"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// TodoItem 待辦事項結構
type TodoItem struct {
	Text string `json:"text"`
	Done bool   `json:"done"`
}

// App struct
type App struct {
	ctx         context.Context
	CurrentCity string
	Todos       []TodoItem
	todoFile    string
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		CurrentCity: "Taoyuan",
		Todos:       []TodoItem{},
	}
}

// startup is called when the app starts
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// 設定 todo.json 路徑 (與執行檔同目錄)
	exe, _ := os.Executable()
	a.todoFile = filepath.Join(filepath.Dir(exe), "todo.json")

	// 載入待辦事項
	a.loadTodos()
}

// loadTodos 載入待辦事項
func (a *App) loadTodos() {
	data, err := os.ReadFile(a.todoFile)
	if err != nil {
		return
	}
	json.Unmarshal(data, &a.Todos)
}

// saveTodos 儲存待辦事項
func (a *App) saveTodos() {
	data, _ := json.MarshalIndent(a.Todos, "", "  ")
	os.WriteFile(a.todoFile, data, 0644)
}

// GetTodos 取得所有待辦事項
func (a *App) GetTodos() []TodoItem {
	return a.Todos
}

// AddTodo 新增待辦事項
func (a *App) AddTodo(text string) bool {
	if text == "" || len(a.Todos) >= 5 {
		return false
	}
	a.Todos = append(a.Todos, TodoItem{Text: text, Done: false})
	a.saveTodos()
	return true
}

// RemoveTodo 刪除待辦事項
func (a *App) RemoveTodo(index int) bool {
	if index < 0 || index >= len(a.Todos) {
		return false
	}
	a.Todos = append(a.Todos[:index], a.Todos[index+1:]...)
	a.saveTodos()
	return true
}

// ToggleTodo 切換完成狀態
func (a *App) ToggleTodo(index int) bool {
	if index < 0 || index >= len(a.Todos) {
		return false
	}
	a.Todos[index].Done = !a.Todos[index].Done
	a.saveTodos()
	return true
}

// SetCity 設定城市
func (a *App) SetCity(city string) {
	a.CurrentCity = city
}

// GetCity 取得目前城市
func (a *App) GetCity() string {
	return a.CurrentCity
}

// Quit 結束程式
func (a *App) Quit() {
	runtime.Quit(a.ctx)
}

// SetAlwaysOnTop 設定視窗是否置頂
func (a *App) SetAlwaysOnTop(onTop bool) {
	runtime.WindowSetAlwaysOnTop(a.ctx, onTop)
}
