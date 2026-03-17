# Closet IA 👔

Tu asesor de imagen personal con inteligencia artificial. Gestioná tu guardarropa, recibí sugerencias de outfits diarias con razonamiento real de moda, y llevá el control de qué prendas están disponibles o a lavar.

## Stack

- **React** — frontend
- **Firebase Auth + Firestore** — autenticación y base de datos
- **Claude AI (Anthropic)** — motor de razonamiento de moda
- **Open-Meteo API** — clima en tiempo real (La Plata, sin API key)

---

## Setup local

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/tu-usuario/closet-ia.git
cd closet-ia
npm install
```

### 2. Configurar Firebase

1. Ir a [console.firebase.google.com](https://console.firebase.google.com)
2. Crear un nuevo proyecto
3. Activar **Authentication** → Email/Password
4. Crear una base de datos **Firestore** en modo producción
5. Copiar las credenciales del proyecto

### 3. Variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales reales:

```
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...

REACT_APP_ANTHROPIC_API_KEY=sk-ant-...
```

> ⚠️ **Nunca subas el archivo `.env` al repositorio.** Ya está en `.gitignore`.

### 4. Reglas de Firestore

En la consola de Firebase → Firestore → Reglas, pegar:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Correr localmente

```bash
npm start
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Estructura del proyecto

```
src/
├── components/
│   ├── Header.js          # Header con clima
│   ├── GarmentCard.js     # Tarjeta de prenda individual
│   └── AddGarmentModal.js # Modal para agregar prendas
├── hooks/
│   ├── useAuth.js         # Contexto de autenticación Firebase
│   └── useWeather.js      # Hook clima Open-Meteo
├── lib/
│   ├── firebase.js        # Inicialización Firebase
│   ├── firestore.js       # CRUD guardarropa e historial
│   ├── anthropic.js       # Llamadas a Claude API
│   └── outfitEngine.js    # Lógica de combinaciones (sin IA)
├── pages/
│   ├── LoginPage.js       # Login / Registro
│   ├── TodayTab.js        # Outfit del día
│   ├── WardrobeTab.js     # Gestión del guardarropa
│   └── HistoryTab.js      # Historial de outfits
├── App.js                 # Componente raíz + routing
└── index.css              # Estilos globales
```

## Funcionalidades

- **Outfit del día**: sugiere una combinación de prendas disponibles evitando repeticiones recientes, con razonamiento detallado de moda generado por Claude IA
- **Clima integrado**: la IA considera la temperatura y condición climática de La Plata al justificar el outfit
- **Motor de compatibilidad cromática**: el `outfitEngine.js` usa una tabla de colores compatibles para pre-filtrar combinaciones antes de enviarlas a la IA
- **Estado de prendas**: cada prenda puede estar `available` (disponible) o `dirty` (a lavar), con cambio de estado con un click
- **Historial**: registro de todos los outfits usados con fecha y razonamiento colapsable
- **Auth segura**: cada usuario tiene su propio espacio en Firestore aislado por UID

## Deploy en Vercel

```bash
npm run build
# Subir la carpeta /build a Vercel o usar Vercel CLI
vercel --prod
```

Agregar las mismas variables de entorno en el dashboard de Vercel.
