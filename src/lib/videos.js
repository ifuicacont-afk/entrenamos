import { supabase, isConfigured } from "./supabase";

/* ============================================================
   Videos de las rutinas.

   Un video por día de entrenamiento, no por ejercicio: la
   entrenadora de Linda grabó la rutina completa de cada día. Son
   seis en total (lunes a viernes más el complemento de abdominales),
   así que cargarlos es cosa de una tarde y no de treinta y tres
   subidas.

   Los archivos viven en el depósito "videos" de Supabase, que es
   privado: no se llega a ellos adivinando una dirección. Para
   reproducir uno la app pide un enlace temporal que caduca en una
   hora.
   ============================================================ */

const DEPOSITO = "videos";
const TABLA = "rutina_videos";

/* Devuelve { programa: { dia_id: {...} } } en una sola consulta. */
export async function listarVideos() {
  if (!isConfigured) return {};
  const { data, error } = await supabase
    .from(TABLA)
    .select("programa, dia_id, ruta, nombre, peso, actualizado");
  if (error) throw error;

  const out = {};
  (data || []).forEach((v) => {
    (out[v.programa] ??= {})[v.dia_id] = v;
  });
  return out;
}

/* El enlace para reproducir. Dura una hora: más que suficiente para
   una sesión, y si caduca se pide otro sin que se note. */
export async function urlDeVideo(ruta) {
  const { data, error } = await supabase.storage
    .from(DEPOSITO)
    .createSignedUrl(ruta, 3600);
  if (error) throw error;
  return data.signedUrl;
}

/* Sube (o reemplaza) el video de una rutina.
   `onAvance` recibe 0-100 para poder mostrar la barra. */
export async function subirVideo({ programa, diaId, archivo, onAvance }) {
  if (!isConfigured) throw new Error("Supabase no está configurado.");

  const { data: sesion } = await supabase.auth.getUser();
  const uid = sesion?.user?.id;

  const extension = (archivo.name.split(".").pop() || "mp4").toLowerCase();
  /* La marca de tiempo evita que el navegador siga mostrando el video
     viejo desde su caché cuando se reemplaza. */
  const ruta = `${programa}/${diaId}-${Date.now()}.${extension}`;

  const anterior = await rutaGuardada(programa, diaId);

  const { error: errSubida } = await supabase.storage
    .from(DEPOSITO)
    .upload(ruta, archivo, {
      contentType: archivo.type || "video/mp4",
      upsert: false,
      onUploadProgress: onAvance
        ? (e) => onAvance(e.total ? Math.round((e.loaded / e.total) * 100) : 0)
        : undefined,
    });
  if (errSubida) throw errSubida;

  const { error: errFila } = await supabase.from(TABLA).upsert({
    programa,
    dia_id: diaId,
    ruta,
    nombre: archivo.name,
    peso: archivo.size,
    subido_por: uid,
    actualizado: new Date().toISOString(),
  }, { onConflict: "programa,dia_id" });

  if (errFila) {
    /* Si la fila no se pudo guardar, el archivo quedaría huérfano
       ocupando espacio sin que nada lo apunte. Se limpia. */
    await supabase.storage.from(DEPOSITO).remove([ruta]).catch(() => {});
    throw errFila;
  }

  if (anterior && anterior !== ruta) {
    await supabase.storage.from(DEPOSITO).remove([anterior]).catch(() => {});
  }
  return ruta;
}

export async function borrarVideo(programa, diaId) {
  const ruta = await rutaGuardada(programa, diaId);
  const { error } = await supabase
    .from(TABLA)
    .delete()
    .eq("programa", programa)
    .eq("dia_id", diaId);
  if (error) throw error;
  if (ruta) await supabase.storage.from(DEPOSITO).remove([ruta]).catch(() => {});
}

async function rutaGuardada(programa, diaId) {
  const { data } = await supabase
    .from(TABLA)
    .select("ruta")
    .eq("programa", programa)
    .eq("dia_id", diaId)
    .maybeSingle();
  return data?.ruta ?? null;
}

export const pesoLegible = (bytes) =>
  bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
