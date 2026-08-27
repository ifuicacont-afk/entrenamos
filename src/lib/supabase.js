import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;

/* La llave pública del proyecto. Supabase la llama "publishable key"
   (sb_publishable_...); las antiguas se llamaban "anon" y siguen sirviendo,
   así que se aceptan los dos nombres de variable. */
const key = import.meta.env.VITE_SUPABASE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

/* La app corre sin Supabase configurado: en ese caso guarda solo en el
   dispositivo. Así se puede desarrollar y probar antes de crear el proyecto. */
export const isConfigured = Boolean(url && key && !url.includes("xxxxxxxxxxxx"));

export const supabase = isConfigured
  ? createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

export async function signUp({ email, password, name, program }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, program } },
  });
  if (error) throw error;
  return data;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

/* Manda el correo con el link para poner una contraseña nueva. El link
   vuelve a la app: al abrirlo, Supabase deja abierta una sesión especial
   de recuperación y App muestra la pantalla para escribirla.

   No avisa si el correo existe o no — a propósito. Así nadie puede usar
   esta pantalla para averiguar quién tiene cuenta. */
export async function pedirRecuperacion(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });
  if (error) throw error;
}

/* Cambia la contraseña de quien tiene la sesión abierta. Sirve igual
   viniendo del link del correo o desde el menú, ya estando adentro. */
export async function cambiarClave(password) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, program")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

/* Mensajes de error en español. Supabase los devuelve en inglés. */
export function authError(e) {
  const m = String(e?.message || "");
  if (m.includes("Invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (m.includes("already registered")) return "Ese correo ya tiene una cuenta.";
  if (m.includes("Password should be")) return "La contraseña necesita al menos 6 caracteres.";
  if (m.includes("Unable to validate email")) return "Ese correo no parece válido.";
  if (m.includes("Email not confirmed")) return "Confirma tu correo antes de entrar.";
  if (m.includes("should be different")) return "La contraseña nueva tiene que ser distinta de la anterior.";
  if (m.includes("Auth session missing") || m.includes("session_not_found"))
    return "El link del correo ya venció. Pide uno nuevo.";
  if (m.includes("rate limit") || m.includes("Too many")) return "Demasiados intentos. Espera un momento.";
  return "No se pudo completar. Intenta de nuevo.";
}
