package main

import (
	"time"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/net"
)

// SystemStats 系統監控資料
type SystemStats struct {
	CPU       float64 `json:"cpu"`
	RAM       float64 `json:"ram"`
	Disk      float64 `json:"disk"`
	NetDownKB float64 `json:"net_down_kb"`
	NetUpKB   float64 `json:"net_up_kb"`
}

var lastNetIO *net.IOCountersStat
var lastNetTime time.Time

// GetSystemStats 取得系統監控資料
func (a *App) GetSystemStats() (*SystemStats, error) {
	// CPU 使用率
	cpuPercent, err := cpu.Percent(0, false)
	if err != nil || len(cpuPercent) == 0 {
		cpuPercent = []float64{0}
	}

	// RAM 使用率
	memInfo, err := mem.VirtualMemory()
	ramPercent := 0.0
	if err == nil {
		ramPercent = memInfo.UsedPercent
	}

	// Disk C: 使用率
	diskInfo, err := disk.Usage("C:/")
	diskPercent := 0.0
	if err == nil {
		diskPercent = diskInfo.UsedPercent
	}

	// 網路速度
	netIO, err := net.IOCounters(false)
	netDownKB := 0.0
	netUpKB := 0.0

	if err == nil && len(netIO) > 0 {
		now := time.Now()
		if lastNetIO != nil {
			interval := now.Sub(lastNetTime).Seconds()
			if interval > 0 {
				netDownKB = float64(netIO[0].BytesRecv-lastNetIO.BytesRecv) / interval / 1024
				netUpKB = float64(netIO[0].BytesSent-lastNetIO.BytesSent) / interval / 1024
			}
		}
		lastNetIO = &netIO[0]
		lastNetTime = now
	}

	return &SystemStats{
		CPU:       cpuPercent[0],
		RAM:       ramPercent,
		Disk:      diskPercent,
		NetDownKB: netDownKB,
		NetUpKB:   netUpKB,
	}, nil
}
