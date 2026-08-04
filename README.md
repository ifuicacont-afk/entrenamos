# Entrenamos

App privada de entrenamiento y alimentación para Ignacio y Linda.
Cada uno entra con su cuenta y ve solo sus propios datos.

- **Hoy** — la sesión que toca, ejercicio por ejercicio, con temporizador de descanso.
- **Comida** — las comidas y suplementos del día, con calorías y proteína.
- **Calendario** — un anillo por día con el porcentaje completado, resumen del mes e historial completo.
- **Progreso** — peso corporal, cardio y las últimas sesiones.

Funciona sin señal: todo se guarda primero en el teléfono y se sincroniza
cuando vuelve internet. Nada se pierde.

---

## Correrla en el computador

```bash
npm install
npm run dev
```

Sin `.env` configurado la app funciona igual, pero guarda todo **solo en ese
dispositivo**. Para sincronizar entre teléfonos hay que conectar Supabase.

---

## Conectar la base de datos (Supabase)

1. Crear un proyecto en [supabase.com](https://supabase.com) (plan gratis alcanza de sobra).
2. En el proyecto: **SQL Editor → New query**, pegar todo `supabase/schema.sql` y correrlo.
   Eso crea las tablas y deja activo el candado (RLS) que hace que cada cuenta
   vea solo lo suyo.
3. En **Project Settings → API**, copiar `Project URL` y la llave `anon public`.
4. Copiar `.env.example` a `.env` y pegar las dos:

   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   VITE_CODIGO_INVITACION=el-codigo-que-tu-elijas
   ```

5. Reiniciar `npm run dev`.

> La llave `anon public` es pública por diseño: no da acceso a nada por sí sola,
> porque las políticas de RLS filtran por usuario. La llave `service_role`
> **nunca** va en la app ni en el repositorio.

### Crear las cuentas

Con Supabase conectado, la app muestra la pantalla de entrada. Desde ahí,
**"Crear una cuenta nueva"** pide nombre, plan (Ignacio o Linda), correo,
contraseña y el **código de invitación**. El perfil se crea solo en la base
de datos.

El código es el que pusiste en `VITE_CODIGO_INVITACION`. Sirve para que
alguien que llegue al link por casualidad no pueda registrarse. Si lo dejas
vacío, el registro queda abierto.

> Es un candado de conveniencia, no de seguridad: lo que realmente protege
> los datos es el RLS de Supabase, que hace que cada cuenta vea solo lo suyo
> aunque otra persona se registre.

Si Supabase pide confirmar el correo y prefieres saltarte ese paso:
**Authentication → Providers → Email → desactivar "Confirm email"**.

---

## Publicarla en internet (Vercel)

1. Subir el proyecto a un repositorio de GitHub (privado).
2. En [vercel.com](https://vercel.com) → **Add New → Project** → elegir ese repositorio.
   Vercel detecta Vite solo; no hay que cambiar nada de la configuración.
3. En **Environment Variables**, agregar las mismas tres de `.env`:
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `VITE_CODIGO_INVITACION`.
4. **Deploy**.

Desde ahí, cada `git push` publica la nueva versión sola.

> Las variables se leen al momento de compilar. Si las cambias en Vercel,
> hay que volver a desplegar (**Deployments → ... → Redeploy**).

---

## Instalarla en el teléfono

Es una PWA: se abre en el navegador y se agrega a la pantalla de inicio.

- **iPhone (Safari):** Compartir → *Agregar a pantalla de inicio*.
- **Android (Chrome):** menú ⋮ → *Instalar aplicación*.

Queda con ícono propio y se abre sin barra del navegador.

---

## Cómo está armado

```
src/
  data/       planes de entrenamiento, comidas y colores
  lib/        supabase.js (cuentas), store.js (datos), stats.js (calendario)
  components/ una pantalla por archivo
supabase/
  schema.sql  las tablas, con RLS por usuario
```

**Los planes de entrenamiento y comida viven en `src/data/`.** Para cambiar un
ejercicio, un peso inicial o una comida, se edita ahí y listo.

> El plan de Linda lo entregó su entrenadora: no conviene modificarlo sin
> confirmarlo con ella.

### Cómo se guardan los datos

1. Todo se escribe primero en el teléfono (`localStorage`) — respuesta instantánea.
2. Se manda a Supabase enseguida. Si falla, queda en una bandeja de pendientes.
3. Al abrir la app: primero se suben los pendientes, después se trae lo del
   servidor y se **mezcla** con lo local. Nunca se reemplaza uno por otro.

Cada sesión y cada cardio llevan un id propio, así que reintentar un envío
nunca duplica un registro.
