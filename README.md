# Ajedrez sencillo

Un tablero en español para **dos personas en el mismo dispositivo**. Funciona sin conexión y no necesita instalación, cuentas ni bibliotecas externas.

## Jugar

1. Descarga el repositorio con **Code → Download ZIP** y descomprímelo, o clónalo.
2. Abre `index.html` con un navegador moderno (Chrome, Edge, Firefox o Safari).
3. Selecciona una pieza y pulsa un destino marcado. Empiezan las blancas.

Los puntos indican movimientos y los círculos, capturas. El historial conserva las jugadas de la partida actual. **Girar tablero** cambia la orientación; **Nueva partida** pide confirmación cuando ya has jugado. También puedes seleccionar casillas con Tab y Enter. En móvil se juega con toques.

## Reglas incluidas

- Movimientos legales, turnos y protección del rey.
- Jaque, jaque mate y ahogado.
- Enroque corto y largo, con comprobación de amenazas y derechos.
- Captura al paso y coronación a dama, torre, alfil o caballo.
- Tablas por triple repetición, 50 movimientos sin capturas ni movimientos de peón y material insuficiente básico (rey contra rey, rey y alfil/caballo contra rey, o solo alfiles del mismo color de casilla).

Para simplificar el juego, las tablas por repetición y 50 movimientos son **automáticas**, sin reclamación. No es un árbitro completo para torneos: no detecta todas las posiciones muertas o fortificaciones. No incluye oponente automático, partidas en red, reloj, deshacer ni almacenamiento; al recargar o cerrar se pierde la partida. El historial usa pieza y casillas de origen/destino, no notación SAN/PGN completa.

## Desarrollo y comprobaciones

La aplicación usa HTML, CSS y JavaScript, sin compilación ni dependencias. Solo para ejecutar las pruebas necesitas Node.js 18 o posterior:

```sh
node --test tests/*.test.js
```

También puedes usar `npm test`; no hace falta `npm install`. Las pruebas comprueban movimientos, jaques, finales, reglas especiales y los recuentos perft de la posición inicial, Kiwipete y un final con capturas al paso. Perft enumera todas las secuencias legales hasta una profundidad dada.

- `index.html`: interfaz y diálogos.
- `styles.css`: diseño adaptable.
- `app.js`: interacción e historial.
- `chess.js`: motor independiente de la interfaz.
- `tests/chess.test.js`: pruebas del motor.

No se envían datos, no se cargan recursos externos y no hay claves ni configuración privada.
