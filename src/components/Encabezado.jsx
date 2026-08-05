import React from "react";
import { C } from "../data/theme";
import { Isotipo } from "./Logo";
import { Cara } from "./Logo";

/* ============================================================
   Barra superior.

   Dos cosas y nada más: la marca a la izquierda, siempre visible, y
   tu cara a la derecha, que abre el menú.

   Se queda pegada arriba al desplazar. Ocupa poco alto a propósito:
   en un teléfono cada píxel que se lleva el encabezado es uno menos
   para lo que importa, que es el entrenamiento.

   No aparece durante la sesión: ahí la pantalla es para la serie que
   estás haciendo y nada más.
   ============================================================ */

export default function Encabezado({ program, onAbrirMenu }) {
  return (
    <header
      className="sticky top-0 z-30"
      style={{
        background: "var(--bg-velo)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.borderSoft}`,
      }}
    >
      <div className="mx-auto max-w-md px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Isotipo size={30} />
          <span className="display leading-none" style={{ fontSize: 19, letterSpacing: "0.04em" }}>
            ENTRENAMOS
          </span>
        </div>

        <button
          onClick={onAbrirMenu}
          aria-label="Abrir menú"
          className="rounded-2xl active:scale-95"
          style={{ transition: "transform 0.12s ease" }}
        >
          <Cara quien={program} size={36} anillo="var(--accent)" />
        </button>
      </div>
    </header>
  );
}
