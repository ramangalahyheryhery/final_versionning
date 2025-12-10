class WeatherApp {
    constructor() {
        this.API_BASE = 'http://localhost:3000/api';
        this.history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
        this.init();
    }

    init() {
        // Initialiser la date et heure
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 60000);
        
        // Événements
        document.getElementById('searchBtn').addEventListener('click', () => this.searchWeather());
        document.getElementById('cityInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchWeather();
        });
        document.getElementById('locationBtn').addEventListener('click', () => this.getLocationWeather());
        
        // Charger l'historique
        this.loadHistory();
        
        // Charger une ville par défaut
        this.searchWeather('Antananarivo');
    }

    updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        document.getElementById('currentDate').textContent = 
            now.toLocaleDateString('fr-FR', options);
    }

    async searchWeather(city = null) {
        const cityInput = document.getElementById('cityInput');
        const cityName = city || cityInput.value.trim();
        
        if (!cityName) {
            this.showError('Veuillez entrer le nom d\'une ville');
            return;
        }

        this.showLoading(true);
        this.hideError();

        try {
            // Récupérer données actuelles et prévisions
            const [currentData, forecastData] = await Promise.all([
                this.fetchWeather(cityName),
                this.fetchForecast(cityName)
            ]);
            
            // Mettre à jour l'interface
            this.updateWeatherUI(currentData);
            this.updateForecastUI(forecastData);
            
            // Ajouter à l'historique
            this.addToHistory(cityName);
            
            // Vider le champ de recherche
            cityInput.value = '';
            
            // Afficher le conteneur
            document.getElementById('weatherContainer').classList.remove('hidden');
        } catch (error) {
            this.showError(error.message || 'Erreur de chargement');
            document.getElementById('weatherContainer').classList.add('hidden');
        } finally {
            this.showLoading(false);
        }
    }

    async fetchWeather(city) {
        const response = await fetch(`${this.API_BASE}/weather/${encodeURIComponent(city)}`);
        const data = await response.json();
        
        if (!response.ok || data.cod === '404') {
            throw new Error(data.message || 'Ville non trouvée');
        }
        
        return data;
    }

    async fetchForecast(city) {
        const response = await fetch(`${this.API_BASE}/forecast/${encodeURIComponent(city)}`);
        const data = await response.json();
        
        if (!response.ok || data.cod === '404') {
            throw new Error('Impossible de charger les prévisions');
        }
        
        return data;
    }

    updateWeatherUI(data) {
        // Informations de base
        document.getElementById('cityName').textContent = data.name;
        document.getElementById('country').textContent = data.sys.country;
        
        // Température et description
        const temp = Math.round(data.main.temp);
        document.getElementById('currentTemp').textContent = temp;
        document.getElementById('weatherDescription').textContent = data.weather[0].description;
        
        // Détails
        document.getElementById('feelsLike').textContent = `${Math.round(data.main.feels_like)}°C`;
        document.getElementById('windSpeed').textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
        document.getElementById('humidity').textContent = `${data.main.humidity}%`;
        document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
        
        // Lever et coucher du soleil
        const sunrise = new Date(data.sys.sunrise * 1000);
        const sunset = new Date(data.sys.sunset * 1000);
        document.getElementById('sunrise').textContent = 
            sunrise.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        document.getElementById('sunset').textContent = 
            sunset.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        
        // Icône météo
        this.updateWeatherIcon(data.weather[0].id);
    }

    updateWeatherIcon(weatherId) {
        const iconMap = {
            // Ciel clair
            800: 'fas fa-sun',
            
            // Nuages
            801: 'fas fa-cloud-sun',
            802: 'fas fa-cloud',
            803: 'fas fa-cloud',
            804: 'fas fa-cloud',
            
            // Pluie
            500: 'fas fa-cloud-rain',
            501: 'fas fa-cloud-rain',
            502: 'fas fa-cloud-showers-heavy',
            503: 'fas fa-cloud-showers-heavy',
            504: 'fas fa-cloud-showers-heavy',
            
            // Orage
            200: 'fas fa-bolt',
            201: 'fas fa-bolt',
            202: 'fas fa-bolt',
            210: 'fas fa-bolt',
            211: 'fas fa-bolt',
            212: 'fas fa-bolt',
            
            // Neige
            600: 'fas fa-snowflake',
            601: 'fas fa-snowflake',
            602: 'fas fa-snowflake',
            611: 'fas fa-icicles',
            612: 'fas fa-icicles',
            613: 'fas fa-icicles',
            
            // Brouillard
            701: 'fas fa-smog',
            711: 'fas fa-smog',
            721: 'fas fa-smog',
            731: 'fas fa-smog',
            741: 'fas fa-smog'
        };
        
        const icon = iconMap[weatherId] || 'fas fa-cloud';
        document.getElementById('weatherIcon').innerHTML = `<i class="${icon}"></i>`;
    }

    updateForecastUI(data) {
        const container = document.getElementById('forecastContainer');
        container.innerHTML = '';
        
        // Prendre un point par jour (tous les 8 prévisions = 1 jour)
        const dailyForecasts = [];
        for (let i = 0; i < 40; i += 8) {
            if (data.list[i]) {
                dailyForecasts.push(data.list[i]);
            }
        }
        
        // Limiter à 5 jours
        dailyForecasts.slice(0, 5).forEach(forecast => {
            const date = new Date(forecast.dt * 1000);
            const day = date.toLocaleDateString('fr-FR', { weekday: 'short' });
            const dateStr = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
            
            const card = document.createElement('div');
            card.className = 'forecast-card';
            card.innerHTML = `
                <div class="day">${day}</div>
                <div class="date">${dateStr}</div>
                <div class="temp">${Math.round(forecast.main.temp)}°C</div>
                <div class="desc">${forecast.weather[0].description}</div>
            `;
            container.appendChild(card);
        });
    }

    async getLocationWeather() {
        if (!navigator.geolocation) {
            this.showError('La géolocalisation n\'est pas supportée par votre navigateur');
            return;
        }

        this.showLoading(true);
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const response = await fetch(`${this.API_BASE}/weather/coord/${latitude}/${longitude}`);
                    const data = await response.json();
                    
                    if (!response.ok) {
                        throw new Error('Impossible de récupérer la météo pour votre position');
                    }
                    
                    this.updateWeatherUI(data);
                    document.getElementById('cityInput').value = data.name;
                    document.getElementById('weatherContainer').classList.remove('hidden');
                    this.addToHistory(data.name);
                } catch (error) {
                    this.showError(error.message);
                } finally {
                    this.showLoading(false);
                }
            },
            (error) => {
                this.showLoading(false);
                this.showError('Impossible d\'obtenir votre position. Vérifiez les permissions.');
            }
        );
    }

    addToHistory(city) {
        if (!this.history.includes(city)) {
            this.history.unshift(city);
            if (this.history.length > 5) {
                this.history.pop();
            }
            localStorage.setItem('weatherHistory', JSON.stringify(this.history));
            this.loadHistory();
        }
    }

    loadHistory() {
        const container = document.getElementById('historyList');
        container.innerHTML = '';
        
        this.history.forEach(city => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.textContent = city;
            item.addEventListener('click', () => {
                document.getElementById('cityInput').value = city;
                this.searchWeather(city);
            });
            container.appendChild(item);
        });
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        if (show) {
            loading.classList.remove('hidden');
        } else {
            loading.classList.add('hidden');
        }
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        document.getElementById('errorText').textContent = message;
        errorElement.classList.remove('hidden');
        
        // Cacher après 5 secondes
        setTimeout(() => {
            errorElement.classList.add('hidden');
        }, 5000);
    }

    hideError() {
        document.getElementById('errorMessage').classList.add('hidden');
    }
}

// Démarrer l'application quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});
