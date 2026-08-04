import React, { useState, useEffect } from "react";
import { Dumbbell, UtensilsCrossed, CalendarDays, TrendingUp } from "lucide-react";
import { C, LANES } from "./data/theme";
import { PROGRAMS } from "./data/programs";
import { supabase, isConfigured, signOut, getProfile } from "./lib/supabase";
import {
  readLocal, writeLocal, pullRemote, mergeData, flushPendientes, todayKey, nuevoId,
  pushSession, pushWeight, pushBodyWeight, pushCardio, pushChecks,
} from "./lib/store";

import Auth from "./components/Auth";
import Home from "./components/Home";
import Runner from "./components/Runner";
import Food from "./components/Food";
import Calendar from "./components/Calendar";
import Progress from "./components/Progress";

/* Perfil de respaldo cuando Supabase no está configurado todavía,
   para poder desarrollar la app sin cuenta. */
const LOCAL_PROFILE = { id: null, name: "Local", program: "ignacio" };

export default function App() {
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("hoy");

  /* --- sesión --- */
  useEffect(() => {
    if (!isConfigured) {
      setProfile(LOCAL_PROFILE);
      setBooting(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setBooting(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) { setProfile(null); setData(null); }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  /* --- perfil --- */
  useEffect(() => {
    if (!session?.user) return;
    getProfile(session.user.id)
      .then(setProfile)
      .catch(() => setProfile({ id: session.user.id, name: "", program: "ignacio" }));
  }, [session]);

  /* --- datos: local primero, remoto después --- */
  useEffect(() => {
    if (!profile) return;
    const uid = profile.id;
    setData(readLocal(uid, profile.program));
    if (!isConfigured || !uid) return;

    /* Primero se sube lo que quedó pendiente sin señal, y recién
       después se trae lo del servidor para mezclarlo con lo de acá. */
    flushPendientes(uid)
      .then(() => pullRemote(uid, profile.program))
      .then((remote) => {
        if (!remote) return;
        setData((local) => {
          const merged = mergeData(local, remote);
          writeLocal(uid, merged);
          return merged;
        });
      })
      .catch(() => { /* sin señal: seguimos con lo local */ });
  }, [profile]);

  if (booting) return <Splash />;
  if (isConfigured && !session) return <Auth />;
  if (!profile || !data) return <Splash />;

  const uid = profile.id;
  const lane = LANES[profile.program] ?? LANES.ignacio;

  const save = (patch) => {
    setData((prev) => {
      const next = { ...prev, ...patch };
      writeLocal(uid, next);
      return next;
    });
  };

  /* --- acciones --- */

  const startSession = (dayId) => {
    save({
      active: {
        dayId, i: 0,
        logged: PROGRAMS[profile.program][dayId].ex.map(() => []),
        started: Date.now(),
      },
    });
  };

  const updateRunner = (patch, weightChange) => {
    if (weightChange) {
      const weights = { ...data.weights, [weightChange.exerciseId]: weightChange.kg };
      save({ ...patch, weights });
      pushWeight(uid, weightChange.exerciseId, weightChange.kg).catch(() => {});
    } else {
      save(patch);
    }
  };

  const finishSession = () => {
    const a = data.active;
    const day = PROGRAMS[profile.program][a.dayId];
    const session = {
      id: nuevoId(),
      date: todayKey(),
      dayId: a.dayId,
      name: day.name,
      mins: Math.max(1, Math.round((Date.now() - a.started) / 60000)),
      ex: day.ex.map((e, i) => ({ id: e.id, name: e.name, sets: a.logged[i] })),
    };
    save({ active: null, sessions: [session, ...data.sessions].slice(0, 500) });
    pushSession(uid, session).catch(() => {});
  };

  const addWeight = (v) => {
    const date = todayKey();
    const weightLog = [{ date, kg: v }, ...data.weightLog.filter((w) => w.date !== date)]
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    save({ weightLog });
    pushBodyWeight(uid, date, v).catch(() => {});
  };

  const addRide = (mins) => {
    const ride = { id: nuevoId(), date: todayKey(), mins };
    save({ rides: [ride, ...data.rides].slice(0, 300) });
    pushCardio(uid, ride).catch(() => {});
  };

  const toggle = (kind) => (id) => {
    const date = todayKey();
    const cur = data[kind][date] || {};
    const updated = { ...cur, [id]: !cur[id] };
    const next = { ...data[kind], [date]: updated };
    save({ [kind]: next });
    const meals = kind === "meals" ? updated : data.meals[date] || {};
    const supps = kind === "supps" ? updated : data.supps[date] || {};
    pushChecks(uid, date, meals, supps).catch(() => {});
  };

  const leave = async () => {
    if (isConfigured) await signOut();
  };

  return (
    <div style={{ background: C.bg, color: C.text }} className="min-h-screen w-full">
      <div className="mx-auto max-w-md pb-24 pt-5">
        {data.active ? (
          <Runner program={profile.program} data={data} active={data.active} lane={lane}
                  onUpdate={updateRunner} onFinish={finishSession}
                  onQuit={() => save({ active: null })} />
        ) : (
          <>
            {tab === "hoy" && (
              <Home program={profile.program} data={data} lane={lane} onStart={startSession} />
            )}
            {tab === "comida" && (
              <Food program={profile.program} data={data} lane={lane}
                    onToggleMeal={toggle("meals")} onToggleSupp={toggle("supps")} />
            )}
            {tab === "calendario" && (
              <Calendar program={profile.program} data={data} lane={lane} />
            )}
            {tab === "progreso" && (
              <Progress profile={profile} data={data} lane={lane}
                        onAddWeight={addWeight} onAddRide={addRide} onSignOut={leave} />
            )}
          </>
        )}
      </div>

      {!data.active && (
        <nav className="fixed bottom-0 left-0 right-0"
             style={{ background: C.surface, borderTop: `1px solid ${C.border}` }}>
          <div className="mx-auto max-w-md grid grid-cols-4">
            {[
              { k: "hoy", label: "Hoy", Icon: Dumbbell },
              { k: "comida", label: "Comida", Icon: UtensilsCrossed },
              { k: "calendario", label: "Calendario", Icon: CalendarDays },
              { k: "progreso", label: "Progreso", Icon: TrendingUp },
            ].map(({ k, label, Icon }) => (
              <button key={k} onClick={() => setTab(k)} className="py-3 flex flex-col items-center gap-1"
                      style={{ color: tab === k ? lane.accent : C.faint }}>
                <Icon size={19} strokeWidth={2} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}

function Splash() {
  return (
    <div style={{ background: C.bg, color: C.faint }}
         className="min-h-screen flex items-center justify-center text-sm">
      Cargando…
    </div>
  );
}
