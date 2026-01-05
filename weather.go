package main

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"
)

// WeatherData 天氣資料結構
type WeatherData struct {
	TempC      string         `json:"temp_c"`
	Desc       string         `json:"desc"`
	Icon       string         `json:"icon"`
	Sunrise    string         `json:"sunrise"`
	Sunset     string         `json:"sunset"`
	RainChance string         `json:"rain_chance"`
	Forecast   []ForecastData `json:"forecast"`
}

// ForecastData 預報資料
type ForecastData struct {
	Day  string `json:"day"`
	Max  string `json:"max"`
	Min  string `json:"min"`
	Desc string `json:"desc"`
	Icon string `json:"icon"`
}

// wttrResponse API 回應結構
type wttrResponse struct {
	CurrentCondition []struct {
		TempC       string `json:"temp_C"`
		WeatherDesc []struct {
			Value string `json:"value"`
		} `json:"weatherDesc"`
	} `json:"current_condition"`
	Weather []struct {
		Date      string `json:"date"`
		MaxTempC  string `json:"maxtempC"`
		MinTempC  string `json:"mintempC"`
		Astronomy []struct {
			Sunrise string `json:"sunrise"`
			Sunset  string `json:"sunset"`
		} `json:"astronomy"`
		Hourly []struct {
			ChanceOfRain string `json:"chanceofrain"`
			WeatherDesc  []struct {
				Value string `json:"value"`
			} `json:"weatherDesc"`
		} `json:"hourly"`
	} `json:"weather"`
}

// getWeatherIcon 根據天氣描述回傳對應圖示
func getWeatherIcon(desc string) string {
	d := strings.ToLower(desc)
	switch {
	case strings.Contains(d, "sunny") || strings.Contains(d, "clear"):
		return "☀️"
	case strings.Contains(d, "partly cloudy"):
		return "⛅"
	case strings.Contains(d, "cloudy") || strings.Contains(d, "overcast"):
		return "☁️"
	case strings.Contains(d, "rain") || strings.Contains(d, "drizzle") || strings.Contains(d, "patchy"):
		return "🌧️"
	case strings.Contains(d, "thunder") || strings.Contains(d, "storm"):
		return "⛈️"
	case strings.Contains(d, "snow") || strings.Contains(d, "sleet"):
		return "❄️"
	case strings.Contains(d, "fog") || strings.Contains(d, "mist"):
		return "🌫️"
	default:
		return "✨"
	}
}

// FetchWeather 取得天氣資料
func (a *App) FetchWeather() (*WeatherData, error) {
	url := "https://wttr.in/" + a.CurrentCity + "?format=j1"

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var data wttrResponse
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, err
	}

	if len(data.CurrentCondition) == 0 || len(data.Weather) == 0 {
		return nil, nil
	}

	current := data.CurrentCondition[0]
	desc := ""
	if len(current.WeatherDesc) > 0 {
		desc = current.WeatherDesc[0].Value
	}

	// 計算目前時段的降雨機率
	hour := time.Now().Hour() / 3
	rainChance := "0"
	if len(data.Weather[0].Hourly) > hour {
		rainChance = data.Weather[0].Hourly[hour].ChanceOfRain
	}

	result := &WeatherData{
		TempC:      current.TempC,
		Desc:       desc,
		Icon:       getWeatherIcon(desc),
		Sunrise:    data.Weather[0].Astronomy[0].Sunrise,
		Sunset:     data.Weather[0].Astronomy[0].Sunset,
		RainChance: rainChance,
		Forecast:   make([]ForecastData, 0),
	}

	// 取得 3 天預報
	for i := 0; i < 3 && i < len(data.Weather); i++ {
		day := data.Weather[i]
		t, _ := time.Parse("2006-01-02", day.Date)

		fDesc := ""
		if len(day.Hourly) > 4 && len(day.Hourly[4].WeatherDesc) > 0 {
			fDesc = day.Hourly[4].WeatherDesc[0].Value
		}

		result.Forecast = append(result.Forecast, ForecastData{
			Day:  t.Format("Mon"),
			Max:  day.MaxTempC,
			Min:  day.MinTempC,
			Desc: fDesc,
			Icon: getWeatherIcon(fDesc),
		})
	}

	return result, nil
}
