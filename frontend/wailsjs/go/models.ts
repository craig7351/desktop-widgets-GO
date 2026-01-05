export namespace main {
	
	export class ForecastData {
	    day: string;
	    max: string;
	    min: string;
	    desc: string;
	    icon: string;
	
	    static createFrom(source: any = {}) {
	        return new ForecastData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.day = source["day"];
	        this.max = source["max"];
	        this.min = source["min"];
	        this.desc = source["desc"];
	        this.icon = source["icon"];
	    }
	}
	export class SystemStats {
	    cpu: number;
	    ram: number;
	    disk: number;
	    net_down_kb: number;
	    net_up_kb: number;
	
	    static createFrom(source: any = {}) {
	        return new SystemStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.cpu = source["cpu"];
	        this.ram = source["ram"];
	        this.disk = source["disk"];
	        this.net_down_kb = source["net_down_kb"];
	        this.net_up_kb = source["net_up_kb"];
	    }
	}
	export class TodoItem {
	    text: string;
	    done: boolean;
	
	    static createFrom(source: any = {}) {
	        return new TodoItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.text = source["text"];
	        this.done = source["done"];
	    }
	}
	export class WeatherData {
	    temp_c: string;
	    desc: string;
	    icon: string;
	    sunrise: string;
	    sunset: string;
	    rain_chance: string;
	    forecast: ForecastData[];
	
	    static createFrom(source: any = {}) {
	        return new WeatherData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.temp_c = source["temp_c"];
	        this.desc = source["desc"];
	        this.icon = source["icon"];
	        this.sunrise = source["sunrise"];
	        this.sunset = source["sunset"];
	        this.rain_chance = source["rain_chance"];
	        this.forecast = this.convertValues(source["forecast"], ForecastData);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

