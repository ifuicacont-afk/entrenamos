import { supabase, isConfigured } from "./supabase";

/* ============================================================
   Videos de los ejercicios.

   Los archivos viven en el depósito "videos" de Supabase, que es
   privado: no se puede llegar a ellos adivinando una dirección. Para
   reproducir uno, la app pide un enlace temporal que caduca en una
   hora.

   La tabla ejercicio_videos solo guarda qué archivo corresponde a
   qué ejercicio. Un ejercicio tiene un video como máximo: subir otro
   reemplaza el anterior y borra el archivo viejo, para no ir llenando
   el espacio con cosas que ya nadie mira.
   ============================================================ */

const DEPOSITO = "videos";

/* Devuelve { programa: { ejercicio_id: {...} } } en una sola consulta.

   Van agrupados por programa a propósito: los dos planes tienen un
   ejercicio con id "crunch" y son movimientos distintos. Si se
   devolviera una lista plana, el video de uno se mostraría en el
   ejercicio del otro. */
export async function listarVideos() {
  if (!isConfigured) return {};
  const { data, error } = await supabase
    .from("ejercicio_videos")
    .select("programa, ejercicio_id, ruta, nombre, peso, actualizado");
  if (error) throw error;

  const out = {};
  (data || []).forEach((v) => {
    (out[v.programa] ??= {})[v.ejercicio_id] = v;
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

/* Sube (o reemplaza) el video de un ejercicio.
   `onAvance` recibe 0-100 para poder mostrar la barra. */
export async function subirVideo({ programa, ejercicioId, archivo, onAvance }) {
  if (!isConfigured) throw new Error("Supabase no está configurado.");

  const { data: sesion } = await supabase.auth.getUser();
  const uid = sesion?.user?.id;

  const extension = (archivo.name.split(".").pop() || "mp4").toLowerCase();
  /* La marca de tiempo evita que el navegador siga mostrando el video
     viejo desde su caché cuando se reemplaza. */
  const ruta = `${programa}/${ejercicioId}-${Date.now()}.${extension}`;

  const anterior = await rutaGuardada(programa, ejercicioId);

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

  const { error: errFila } = await supabase.from("ejercicio_videos").upsert({
    programa,
    ejercicio_id: ejercicioId,
    ruta,
    nombre: archivo.name,
    peso: archivo.size,
    subido_por: uid,
    actualizado: new Date().toISOString(),
  }, { onConflict: "programa,ejercicio_id" });

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

export async function borrarVideo(programa, ejercicioId) {
  const ruta = await rutaGuardada(programa, ejercicioId);
  const { error } = await supabase
    .from("ejercicio_videos")
    .delete()
    .eq("programa", programa)
    .eq("ejercicio_id", ejercicioId);
  if (error) throw error;
  if (ruta) await supabase.storage.from(DEPOSITO).remove([ruta]).catch(() => {});
}

async function rutaGuardada(programa, ejercicioId) {
  const { data } = await supabase
    .from("ejercicio_videos")
    .select("ruta")
    .eq("programa", programa)
    .eq("ejercicio_id", ejercicioId)
    .maybeSingle();
  return data?.ruta ?? null;
}

export const pesoLegible = (bytes) =>
  bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
