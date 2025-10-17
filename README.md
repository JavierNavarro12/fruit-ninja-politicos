# Fruit Ninja Políticos (Phaser 3 + TypeScript + Vite)

Juego tipo Fruit Ninja en 2D para la web, con políticos en lugar de frutas. Stack: Phaser 3, TypeScript y Vite.

## Requisitos
- Node.js LTS (18 o 20). En Windows, descarga e instala desde: https://nodejs.org/en/download
  - Tras instalar, abre una nueva ventana de PowerShell y verifica:
  ```powershell
  node -v
  npm -v
  ```

## Comandos
```bash
npm install        # instala dependencias
npm run dev        # servidor de desarrollo (abre http://localhost:5173)
npm run build      # build de producción en dist/
npm run preview    # previsualiza el build
```

## Estructura
```
.
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.ts
│   └── scenes/
│       ├── BootScene.ts
│       └── GameScene.ts
└── .gitignore
```

## Roadmap breve
- Reemplazar el placeholder "politician" por sprites reales (caras, cuerpos, etc.)
- Efecto de corte con mitades + partículas de "jugo" temático
- Sonidos (Howler) y vibración móvil
- Leaderboard (Supabase/Firebase)
- PWA para instalación en móvil

## Notas
- El corte actual usa una aproximación simple (trayectoria vs. círculos). Es suficiente para un prototipo; luego se puede mejorar a máscaras y slicing visual.

