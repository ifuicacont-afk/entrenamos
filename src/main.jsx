import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.jsx";
import "./index.css";

/* ============================================================
   Actualización automática.

   La app queda instalada en el teléfono, así que sin esto seguiría
   mostrando la versión del día que se instaló: el service worker
   guarda todo en caché y no vuelve a preguntar.

   Acá busca versión nueva al abrir y cada media hora. Cuando la
   encuentra, toma el control y la pantalla se recarga una vez sola.

   Recargar es seguro: la sesión en curso se guarda en el dispositivo
   con cada serie, así que si estabas entrenando vuelves justo donde
   ibas, sin perder nada.
   ============================================================ */

registerSW({
  immediate: true,
  onRegisteredSW(_url, registro) {
    if (registro) setInterval(() => registro.update(), 30 * 60 * 1000);
  },
});

let recargando = false;
navigator.serviceWorker?.addEventListener("controllerchange", () => {
  if (recargando) return;
  recargando = true;
  location.reload();
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
