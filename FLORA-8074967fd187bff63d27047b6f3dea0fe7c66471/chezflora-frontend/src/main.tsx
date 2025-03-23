import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AppInitializer } from './services/AppInitializer.js'

// Initialiser l'application avant de rendre les composants
AppInitializer.initialize();

createRoot(document.getElementById("root")!).render(<App />);