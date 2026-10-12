# Manual

Dos personas juegan por turnos en el mismo dispositivo. Selecciona una pieza y un destino marcado. Los puntos indican movimiento; los círculos, captura. Volver a pulsar la pieza la deselecciona. El último movimiento y el rey amenazado quedan resaltados.

Usa ratón, toques o Tab y Enter/Espacio. **Girar tablero** cambia la orientación. **Nueva partida** pide confirmación si hay jugadas. El historial muestra pieza y casillas, no notación SAN/PGN completa.

## Movimientos especiales

- **Enroque:** mueve el rey dos casillas. Rey y torre deben conservar el derecho; el camino debe estar libre y el rey no puede estar en jaque ni atravesar o terminar en una casilla amenazada.
- **Captura al paso:** solo inmediatamente después de que el peón contrario avance dos casillas, y sin descubrir jaque contra el propio rey.
- **Coronación:** elige dama, torre, alfil o caballo. Esc cancela la selección antes de completar la jugada.

## Finales

Jaque mate si el rey está amenazado y no hay respuesta legal; ahogado si no hay movimiento legal y no hay jaque.

Tablas básicas por rey contra rey, un alfil/caballo contra rey, o solo alfiles del mismo color de casilla. También por triple repetición con idéntico turno y derechos, o 100 medias jugadas sin captura ni movimiento de peón.

Las tablas por repetición y 50 movimientos se declaran automáticamente, sin reclamación. No se detectan todas las posiciones muertas o fortificaciones. No es un árbitro de competición.

## Límites

Sin IA, juego en red, reloj, deshacer ni guardado. El estado se pierde al cerrar, recargar o si el sistema elimina la aplicación. La caché PWA guarda archivos, no partidas.
