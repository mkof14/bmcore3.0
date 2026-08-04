#!/usr/bin/env node
/**
 * Merges the Connected Devices copy (devicesPage hero/live/flow/seo, deviceEducation,
 * deviceScenarios) into src/locales/{lang}/devices.json for all ten shipped languages.
 *
 * Existing keys that Devices.tsx already relies on (categories, items, capabilities,
 * recommendations, explain, authorize, success, footer, deviceHints) are preserved.
 *
 * Run with: node scripts/apply-devices-page-locales.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const LOCALES = ['en', 'es', 'fr', 'de', 'ja', 'he', 'zh', 'ar', 'uk', 'ru'];
const localesDir = join(process.cwd(), 'src/locales');

function mergeDeep(target, patch) {
  for (const [key, value] of Object.entries(patch)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) {
        target[key] = {};
      }
      mergeDeep(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

const PATCHES = {
  en: {
    devicesPage: {
      seo: {
        title: 'Connected Devices — Wearables & Sensors | BioMath Core',
        description:
          'Connect watches, rings, glucose sensors, blood-pressure cuffs, and smart scales. BioMath Core reads the trends and explains them in plain language for your reports and Health Guide.',
      },
      badge: 'Wearables & sensors',
      title: 'Connected Devices',
      subtitle:
        'Connect watches, rings, glucose sensors, and home health devices so BioMath Core can read trends and explain them in plain language.',
      signalsLabel: 'Signals',
      catalogLabel: 'Catalog',
      connectedLabel: 'Your gear',
      connectLabel: 'Connect',
      filterAll: 'All devices ({{count}})',
      catalogTitle: 'Every device we support',
      catalogIntro:
        'All connectable devices are listed here — nothing is hidden behind a filter. Each card shows the signals a device usually provides, so you can pick gear that matches your goals and connect a supported brand below.',
      hero: {
        ctaCatalog: 'Browse all devices',
        ctaConnect: 'Connect a device',
        ctaMember: 'Open Member Zone',
      },
      live: {
        label: 'Living signals',
        title: 'Your body sends quiet data all day',
        body: 'BioMath Core listens across {{categories}} categories and {{devices}} connectable devices — then turns trends into calm, practical guidance for reports and Health Guide.',
        chipSleep: 'Sleep stages',
        chipGlucose: 'Glucose curve',
        chipHrv: 'HRV recovery',
      },
      flow: {
        label: 'How connection works',
        title: 'Authorize, sync, understand',
        body: 'You grant access to metrics only. Trends flow into personal context for reports and Health Guide — educational guidance, not a diagnosis.',
        steps: {
          authorize: {
            title: 'Authorize metrics',
            body: 'Choose the manufacturer and approve which health metrics may be shared. We never receive your device login or password, and you can withdraw access at any time.',
          },
          sync: {
            title: 'Sync on your schedule',
            body: 'Daily, a few times a day, or near real-time where the device supports it. Syncing runs quietly in the background and you can change the rhythm whenever you like.',
          },
          guide: {
            title: 'Guide & reports',
            body: 'Trends appear in your reports and give Health Guide context for calm, practical suggestions. Everything stays educational — it is never a diagnosis.',
          },
        },
      },
    },
    deviceEducation: {
      whyDevicesMatter: {
        title: 'Why connected devices matter',
        description:
          'A single measurement is a snapshot; a device shows direction. When sleep, recovery, glucose, and load are followed over weeks, small shifts become visible long before they turn into complaints — and gentle adjustments are usually enough.',
      },
      realTimeBehavior: {
        title: 'How data behaves once a device is connected',
        description:
          'Metrics arrive on the schedule you choose and are compared with your own recent baseline, not with an average stranger. What you see is the direction of change: improving, steady, or drifting.',
        continuousMonitoring: {
          title: 'Continuous view:',
          description:
            'Between syncs nothing is lost — readings are collected in the background and summarized when you open BioMath Core, so you never have to log anything by hand.',
        },
      },
      dataInfluenceReports: {
        title: 'How device data shapes your reports',
        description:
          'Authorized metrics become part of the personal context behind every report. Instead of raw tables you get the trend, what likely influenced it, and a short list of practical next steps you can actually follow.',
      },
      dataInfluenceAI: {
        title: 'How device data reaches Health Guide',
        description:
          'Health Guide reads the same trends you see, so answers reflect your recent sleep, recovery, activity, and glucose patterns instead of generic advice. It explains; it does not diagnose.',
        secondOpinion: {
          title: 'Second Opinion:',
          description:
            'The same signals can be read two ways — a physiological explanation and a behavioral, lifestyle one. Seeing both helps you decide what fits your week instead of accepting a single verdict.',
        },
      },
      alertsNudges: {
        title: 'Alerts and gentle nudges',
        description:
          'Notifications stay rare and calm. You hear from us when a trend holds for several days, not when a single night looks unusual — and every message explains what it means and what to do next.',
        positiveReinforcement: {
          title: 'Progress counts too:',
          description:
            'Improvements are highlighted just as clearly as declines, because knowing what worked is the fastest way to keep it going.',
        },
      },
      userSettings: {
        title: 'You choose how often data is read',
        description:
          'Sync frequency is yours to set, device by device. Pick the rhythm that matches how you wear it — you can change it at any time without losing history.',
        onlyAtNight: {
          title: 'Only at night',
          description:
            'Best for rings and sleep systems. Data is read once after your night, so the day stays quiet.',
        },
        onlyInTheMorning: {
          title: 'Once each morning',
          description:
            'A single daily summary of sleep, recovery, and yesterday’s load. The calmest option for most people.',
        },
        everyFewHours: {
          title: 'Every few hours',
          description:
            'Useful during training blocks or busy weeks, when load and recovery shift within a single day.',
        },
        continuously: {
          title: 'Near real-time',
          description:
            'For continuous glucose sensors and recovery bands, where the shape of a curve matters more than a daily number.',
        },
        footer:
          'Whatever you choose, syncing stops the moment you disconnect a device, and past data stays in your history until you delete it.',
      },
      advancedBehaviorNote: {
        title: 'A note on how far this goes',
        description:
          'BioMath Core reads what your devices report and explains it in context. It does not control your device, does not replace clinical measurement, and never issues a diagnosis — use it as background for better conversations with your clinician.',
      },
      realScenarios: {
        title: 'What this looks like in practice',
        description:
          'Below are everyday situations built from real device data — what the numbers showed, how Health Guide explains them, and the tone we use. Read them to see how guidance stays calm, specific, and free of alarm.',
      },
    },
    deviceScenarios: {
      labels: {
        description: 'What the data showed:',
        healthGuide: 'Health Guide explains',
        secondOpinion: 'Second Opinion',
        behavior: 'What BioMath Core does:',
      },
      categories: {
        cgm: 'Glucose',
        sleep_hrv: 'Sleep & HRV',
        activity: 'Activity & load',
      },
      general: {
        title: 'How every scenario is handled',
        safeTitle: 'Safe by design:',
        safeBody:
          'Nothing here names a condition or predicts illness. Signals are described as patterns, and any reading outside a normal range is a reason to speak with a clinician, not a conclusion in itself.',
        trendsTitle: 'Trends, not single points:',
        trendsBody:
          'One restless night or one high reading changes nothing. A pattern is only mentioned once it holds across several days, which keeps guidance steady instead of reactive.',
        termsTitle: 'Words we use',
        terms: [
          'Trend',
          'Pattern',
          'Direction of change',
          'Your usual range',
          'Recovery',
          'Load',
          'Worth watching',
          'Worth discussing with a clinician',
        ],
        avoidTitle: 'Words we never use',
        avoided: [
          'Diagnosis',
          'Disease',
          'Pathology',
          'Abnormal',
          'Dangerous',
          'Critical',
          'Treatment',
          'Prescription',
          'Cure',
        ],
      },
      blocks: {
        cgm: {
          title: 'Continuous glucose sensors',
          body: 'A CGM shows how meals, movement, stress, and sleep shape your day. The value is in the shape of the curve — how high it climbs and how quickly it settles — not in any single number.',
          bullets: [
            'Compares each day’s curve with your own recent baseline',
            'Links rises and dips to meals, movement, and sleep',
            'Waits for a repeated pattern before suggesting anything',
            'Points you to a clinician if readings stay outside your usual range',
          ],
        },
        sleep_hrv: {
          title: 'Sleep and HRV',
          body: 'Sleep depth and heart-rate variability describe how well your nervous system recovers. Together they explain why an ordinary week can feel heavy and why an easy week can feel effortless.',
          bullets: [
            'Follows deep and REM balance across the week, not one night',
            'Reads HRV against your own baseline, never a population average',
            'Suggests lighter days when recovery drops for several nights',
            'Confirms what is working when recovery climbs back',
          ],
        },
        activity: {
          title: 'Activity and load',
          body: 'Steps, workouts, and strain only make sense next to recovery. The same training week can be a good stimulus or too much, depending on how your nights look.',
          bullets: [
            'Balances training load against sleep and HRV',
            'Notices a build-up of load before it turns into fatigue',
            'Recognises a well-matched week and says so',
            'Keeps suggestions small: one adjustment at a time',
          ],
        },
      },
      cards: {
        glucoseSpike: {
          title: 'A sharp rise after meals',
          description:
            'Glucose climbed quickly after lunch on several days this week and took longer than usual to settle back down.',
          response:
            'Your afternoon curve has been rising faster than your own baseline. This is a pattern worth understanding, not a warning. Meal composition and what follows the meal both matter — a short walk after eating often flattens this curve. Let us watch the next few days together.',
          secondOpinion:
            'Read behaviorally, the same curve often follows a rushed meal, a short night, or a stressful morning rather than the food alone. If your sleep has been light this week, the metabolic response is expected — restoring the nights may change the curve more than changing the plate.',
        },
        glucoseStable: {
          title: 'A steadier curve',
          description:
            'Glucose stayed within a narrow band for most of the week, with gentle rises after meals and a smooth return.',
          response:
            'Your curve has been calm and predictable — the rises are moderate and the returns are quick. Whatever your rhythm has been lately, it suits you. Keeping meals and movement in their current pattern is the simplest way to hold this.',
        },
        recoveryDown: {
          title: 'Recovery is trending down',
          description:
            'HRV has been below your usual range for four nights and deep sleep has shortened, though total time in bed has not changed.',
          response:
            'Your nervous system looks like it is carrying more than usual. Time in bed is fine, but the quality of recovery has dipped. This is a good week for lighter training, an earlier wind-down, and less late caffeine. If it persists beyond a week or two, it is worth mentioning to a clinician.',
          secondOpinion:
            'From a behavioral angle, this pattern often tracks life rather than physiology — a demanding stretch at work, later evenings, or travel. If any of that matches your week, treat the numbers as a signal to protect your evenings for a few days rather than a sign that something is wrong.',
        },
        recoveryUp: {
          title: 'Recovery is climbing back',
          description:
            'HRV has returned to your usual range and deep sleep has lengthened across the last several nights.',
          response:
            'Recovery is heading back to where it usually sits, and the change has held for several nights, so it is a real shift rather than noise. Whatever you changed recently is working — keeping the same bedtime for another week is the easiest way to make it stick.',
        },
        overload: {
          title: 'Load is outpacing recovery',
          description:
            'Training volume rose sharply this week while sleep stayed the same and recovery scores drifted lower each day.',
          response:
            'You have added load faster than your recovery has kept up. Nothing here is alarming — it is simply the point where more effort stops paying off. One easier session or one extra rest day this week usually resets the balance.',
        },
        balanced: {
          title: 'Load and recovery are matched',
          description:
            'Activity stayed consistent through the week and recovery scores held steady alongside it.',
          response:
            'Your load and your recovery are moving together, which is exactly what a sustainable week looks like. There is nothing to adjust — this is a good baseline to remember when you plan the next block.',
        },
        fatigue: {
          title: 'Quiet, unusual tiredness',
          description:
            'Activity dropped noticeably for several days, resting heart rate is slightly higher than usual, and sleep has been longer without feeling restful.',
          response:
            'Your body is asking for a slower stretch — lower activity with a higher resting heart rate usually means recovery is still in progress. Give it a few gentle days and watch whether things settle. If the tiredness continues for more than a couple of weeks, it is worth discussing with a clinician.',
        },
      },
    },
  },

  es: {
    devicesPage: {
      seo: {
        title: 'Dispositivos conectados — wearables y sensores | BioMath Core',
        description:
          'Conecta relojes, anillos, sensores de glucosa, tensiómetros y básculas inteligentes. BioMath Core lee las tendencias y las explica en lenguaje sencillo para tus informes y Health Guide.',
      },
      badge: 'Wearables y sensores',
      title: 'Dispositivos conectados',
      subtitle:
        'Conecta relojes, anillos, sensores de glucosa y dispositivos de salud en casa para que BioMath Core lea tendencias y las explique en lenguaje sencillo.',
      signalsLabel: 'Señales',
      catalogLabel: 'Catálogo',
      connectedLabel: 'Tu equipo',
      connectLabel: 'Conectar',
      filterAll: 'Todos los dispositivos ({{count}})',
      catalogTitle: 'Todos los dispositivos compatibles',
      catalogIntro:
        'Aquí aparecen todos los dispositivos que puedes conectar: nada queda oculto tras un filtro. Cada tarjeta muestra las señales que suele aportar el dispositivo, para que elijas según tus objetivos y conectes una marca compatible más abajo.',
      hero: {
        ctaCatalog: 'Ver todos los dispositivos',
        ctaConnect: 'Conectar un dispositivo',
        ctaMember: 'Abrir Zona de miembros',
      },
      live: {
        label: 'Señales vivas',
        title: 'Tu cuerpo envía datos discretos todo el día',
        body: 'BioMath Core escucha {{categories}} categorías y {{devices}} dispositivos conectables, y convierte las tendencias en orientación serena y práctica para informes y Health Guide.',
        chipSleep: 'Fases del sueño',
        chipGlucose: 'Curva de glucosa',
        chipHrv: 'Recuperación y VFC',
      },
      flow: {
        label: 'Cómo funciona la conexión',
        title: 'Autoriza, sincroniza, comprende',
        body: 'Solo concedes acceso a métricas. Las tendencias pasan al contexto personal de informes y Health Guide: orientación educativa, no un diagnóstico.',
        steps: {
          authorize: {
            title: 'Autoriza las métricas',
            body: 'Elige el fabricante y aprueba qué métricas de salud se comparten. Nunca recibimos el usuario ni la contraseña de tu dispositivo, y puedes retirar el acceso cuando quieras.',
          },
          sync: {
            title: 'Sincroniza a tu ritmo',
            body: 'A diario, varias veces al día o casi en tiempo real si el dispositivo lo permite. La sincronización se ejecuta en segundo plano y puedes cambiar el ritmo cuando quieras.',
          },
          guide: {
            title: 'Orientación e informes',
            body: 'Las tendencias aparecen en tus informes y dan a Health Guide contexto para sugerencias serenas y prácticas. Todo se mantiene educativo: nunca es un diagnóstico.',
          },
        },
      },
    },
    deviceEducation: {
      whyDevicesMatter: {
        title: 'Por qué importan los dispositivos conectados',
        description:
          'Una medición aislada es una foto; un dispositivo muestra la dirección. Cuando el sueño, la recuperación, la glucosa y la carga se siguen durante semanas, los pequeños cambios se ven mucho antes de convertirse en molestias, y suele bastar con ajustes suaves.',
      },
      realTimeBehavior: {
        title: 'Cómo se comportan los datos cuando conectas un dispositivo',
        description:
          'Las métricas llegan con la frecuencia que elijas y se comparan con tu propia línea base reciente, no con la media de un desconocido. Lo que ves es la dirección del cambio: mejora, estabilidad o deriva.',
        continuousMonitoring: {
          title: 'Visión continua:',
          description:
            'Entre sincronizaciones no se pierde nada: las lecturas se recogen en segundo plano y se resumen al abrir BioMath Core, así no tienes que anotar nada a mano.',
        },
      },
      dataInfluenceReports: {
        title: 'Cómo los datos del dispositivo dan forma a tus informes',
        description:
          'Las métricas autorizadas pasan a formar parte del contexto personal de cada informe. En lugar de tablas en bruto recibes la tendencia, lo que probablemente influyó en ella y una lista breve de próximos pasos que puedes aplicar de verdad.',
      },
      dataInfluenceAI: {
        title: 'Cómo llegan los datos del dispositivo a Health Guide',
        description:
          'Health Guide lee las mismas tendencias que ves tú, así que las respuestas reflejan tu sueño, recuperación, actividad y glucosa recientes en lugar de consejos genéricos. Explica; no diagnostica.',
        secondOpinion: {
          title: 'Segunda opinión:',
          description:
            'Las mismas señales admiten dos lecturas: una explicación fisiológica y otra conductual, de estilo de vida. Ver ambas te ayuda a decidir qué encaja en tu semana en vez de aceptar un único veredicto.',
        },
      },
      alertsNudges: {
        title: 'Avisos y recordatorios suaves',
        description:
          'Las notificaciones son escasas y tranquilas. Te escribimos cuando una tendencia se mantiene varios días, no cuando una sola noche parece rara, y cada mensaje explica qué significa y qué hacer después.',
        positiveReinforcement: {
          title: 'Los avances también cuentan:',
          description:
            'Las mejoras se señalan con la misma claridad que los descensos, porque saber qué funcionó es la forma más rápida de mantenerlo.',
        },
      },
      userSettings: {
        title: 'Tú eliges con qué frecuencia se leen los datos',
        description:
          'La frecuencia de sincronización la decides tú, dispositivo a dispositivo. Elige el ritmo que encaje con cómo lo llevas puesto; puedes cambiarlo cuando quieras sin perder el historial.',
        onlyAtNight: {
          title: 'Solo de noche',
          description:
            'Ideal para anillos y sistemas de sueño. Los datos se leen una vez al terminar la noche, así el día queda tranquilo.',
        },
        onlyInTheMorning: {
          title: 'Una vez cada mañana',
          description:
            'Un único resumen diario de sueño, recuperación y carga del día anterior. La opción más serena para la mayoría.',
        },
        everyFewHours: {
          title: 'Cada pocas horas',
          description:
            'Útil en bloques de entrenamiento o semanas intensas, cuando la carga y la recuperación cambian dentro del mismo día.',
        },
        continuously: {
          title: 'Casi en tiempo real',
          description:
            'Para sensores de glucosa continua y bandas de recuperación, donde la forma de la curva importa más que un número diario.',
        },
        footer:
          'Elijas lo que elijas, la sincronización se detiene en cuanto desconectas un dispositivo, y los datos anteriores permanecen en tu historial hasta que los borres.',
      },
      advancedBehaviorNote: {
        title: 'Una nota sobre hasta dónde llega esto',
        description:
          'BioMath Core lee lo que informan tus dispositivos y lo explica en contexto. No controla el dispositivo, no sustituye una medición clínica y nunca emite un diagnóstico: úsalo como base para mejores conversaciones con tu profesional sanitario.',
      },
      realScenarios: {
        title: 'Cómo se ve esto en la práctica',
        description:
          'Abajo tienes situaciones cotidianas construidas con datos reales de dispositivos: qué mostraron las cifras, cómo lo explica Health Guide y el tono que usamos. Sirven para ver cómo la orientación se mantiene tranquila, concreta y sin alarmismo.',
      },
    },
    deviceScenarios: {
      labels: {
        description: 'Qué mostraron los datos:',
        healthGuide: 'Health Guide lo explica',
        secondOpinion: 'Segunda opinión',
        behavior: 'Qué hace BioMath Core:',
      },
      categories: {
        cgm: 'Glucosa',
        sleep_hrv: 'Sueño y VFC',
        activity: 'Actividad y carga',
      },
      general: {
        title: 'Cómo se trata cada escenario',
        safeTitle: 'Seguro por diseño:',
        safeBody:
          'Nada de esto nombra una enfermedad ni predice un diagnóstico. Las señales se describen como patrones, y cualquier lectura fuera de un rango normal es un motivo para hablar con un profesional, no una conclusión en sí misma.',
        trendsTitle: 'Tendencias, no puntos sueltos:',
        trendsBody:
          'Una noche inquieta o una lectura alta no cambian nada. Un patrón solo se menciona cuando se mantiene varios días, lo que hace que la orientación sea estable en vez de reactiva.',
        termsTitle: 'Palabras que usamos',
        terms: [
          'Tendencia',
          'Patrón',
          'Dirección del cambio',
          'Tu rango habitual',
          'Recuperación',
          'Carga',
          'Conviene observarlo',
          'Conviene comentarlo con un profesional',
        ],
        avoidTitle: 'Palabras que nunca usamos',
        avoided: [
          'Diagnóstico',
          'Enfermedad',
          'Patología',
          'Anormal',
          'Peligroso',
          'Crítico',
          'Tratamiento',
          'Receta',
          'Cura',
        ],
      },
      blocks: {
        cgm: {
          title: 'Sensores de glucosa continua',
          body: 'Un MCG muestra cómo las comidas, el movimiento, el estrés y el sueño moldean tu día. El valor está en la forma de la curva —cuánto sube y con qué rapidez vuelve— y no en un número aislado.',
          bullets: [
            'Compara la curva de cada día con tu propia línea base reciente',
            'Relaciona subidas y bajadas con comidas, movimiento y sueño',
            'Espera a que un patrón se repita antes de sugerir nada',
            'Te remite a un profesional si las lecturas siguen fuera de tu rango habitual',
          ],
        },
        sleep_hrv: {
          title: 'Sueño y VFC',
          body: 'La profundidad del sueño y la variabilidad de la frecuencia cardíaca describen cómo se recupera tu sistema nervioso. Juntas explican por qué una semana normal puede pesar y por qué otra parece ligera.',
          bullets: [
            'Sigue el equilibrio de sueño profundo y REM durante la semana, no una noche',
            'Lee la VFC frente a tu propia línea base, nunca frente a una media poblacional',
            'Sugiere días más suaves cuando la recuperación baja varias noches seguidas',
            'Confirma lo que funciona cuando la recuperación vuelve a subir',
          ],
        },
        activity: {
          title: 'Actividad y carga',
          body: 'Los pasos, los entrenamientos y el esfuerzo solo tienen sentido junto a la recuperación. La misma semana de entrenamiento puede ser buen estímulo o demasiado, según cómo sean tus noches.',
          bullets: [
            'Equilibra la carga de entrenamiento con el sueño y la VFC',
            'Detecta la acumulación de carga antes de que se convierta en fatiga',
            'Reconoce una semana bien ajustada y te lo dice',
            'Mantiene las sugerencias pequeñas: un ajuste cada vez',
          ],
        },
      },
      cards: {
        glucoseSpike: {
          title: 'Subida marcada después de comer',
          description:
            'La glucosa subió rápido tras la comida varios días de esta semana y tardó más de lo habitual en volver a bajar.',
          response:
            'Tu curva de la tarde ha subido más rápido que tu propia línea base. Es un patrón que merece entenderse, no una advertencia. Influyen tanto la composición de la comida como lo que viene después: un paseo corto tras comer suele suavizar esta curva. Observemos juntos los próximos días.',
          secondOpinion:
            'Leída en clave conductual, esta misma curva suele seguir a una comida con prisa, una noche corta o una mañana estresante más que al plato en sí. Si has dormido poco esta semana, la respuesta metabólica es esperable: recuperar las noches puede cambiar la curva más que cambiar la comida.',
        },
        glucoseStable: {
          title: 'Una curva más estable',
          description:
            'La glucosa se mantuvo en una banda estrecha casi toda la semana, con subidas suaves tras las comidas y un regreso tranquilo.',
          response:
            'Tu curva ha sido tranquila y previsible: las subidas son moderadas y el retorno es rápido. Sea cual sea tu ritmo últimamente, te sienta bien. Mantener las comidas y el movimiento como están es la forma más sencilla de conservarlo.',
        },
        recoveryDown: {
          title: 'La recuperación tiende a la baja',
          description:
            'La VFC lleva cuatro noches por debajo de tu rango habitual y el sueño profundo se ha acortado, aunque el tiempo total en cama no ha cambiado.',
          response:
            'Tu sistema nervioso parece llevar más carga de lo habitual. El tiempo en cama está bien, pero la calidad de la recuperación ha bajado. Es una buena semana para entrenar más suave, cerrar el día antes y reducir la cafeína tardía. Si se mantiene más de una o dos semanas, conviene comentarlo con un profesional.',
          secondOpinion:
            'Desde un ángulo conductual, este patrón suele seguir a la vida más que a la fisiología: una etapa exigente en el trabajo, noches más largas o viajes. Si algo de eso encaja con tu semana, toma los números como una señal para proteger tus tardes unos días, no como un indicio de que algo va mal.',
        },
        recoveryUp: {
          title: 'La recuperación vuelve a subir',
          description:
            'La VFC ha regresado a tu rango habitual y el sueño profundo se ha alargado en las últimas noches.',
          response:
            'La recuperación vuelve a donde suele estar, y el cambio se ha mantenido varias noches, así que es real y no ruido. Lo que hayas cambiado últimamente funciona: mantener la misma hora de acostarte otra semana es la manera más fácil de fijarlo.',
        },
        overload: {
          title: 'La carga va por delante de la recuperación',
          description:
            'El volumen de entrenamiento subió con fuerza esta semana mientras el sueño se mantuvo igual y las puntuaciones de recuperación bajaron cada día.',
          response:
            'Has añadido carga más rápido de lo que tu recuperación ha podido seguir. Nada de esto es alarmante: es simplemente el punto en el que más esfuerzo deja de rendir. Una sesión más suave o un día extra de descanso esta semana suele reequilibrarlo.',
        },
        balanced: {
          title: 'Carga y recuperación equilibradas',
          description:
            'La actividad se mantuvo constante durante la semana y las puntuaciones de recuperación se sostuvieron a la par.',
          response:
            'Tu carga y tu recuperación se mueven juntas, que es justo el aspecto de una semana sostenible. No hay nada que ajustar: es una buena referencia para recordar cuando planifiques el siguiente bloque.',
        },
        fatigue: {
          title: 'Cansancio silencioso y poco habitual',
          description:
            'La actividad bajó de forma notable varios días, la frecuencia cardíaca en reposo está algo más alta de lo normal y el sueño ha sido más largo sin resultar reparador.',
          response:
            'Tu cuerpo pide una etapa más lenta: menos actividad con una frecuencia cardíaca en reposo más alta suele significar que la recuperación sigue en marcha. Dale unos días suaves y observa si se asienta. Si el cansancio dura más de un par de semanas, conviene comentarlo con un profesional.',
        },
      },
    },
  },

  fr: {
    devicesPage: {
      seo: {
        title: 'Appareils connectés — objets connectés et capteurs | BioMath Core',
        description:
          'Connectez montres, bagues, capteurs de glucose, tensiomètres et balances connectées. BioMath Core lit les tendances et les explique simplement pour vos rapports et Health Guide.',
      },
      badge: 'Objets connectés et capteurs',
      title: 'Appareils connectés',
      subtitle:
        'Connectez montres, bagues, capteurs de glucose et appareils de santé à domicile pour que BioMath Core lise les tendances et les explique simplement.',
      signalsLabel: 'Signaux',
      catalogLabel: 'Catalogue',
      connectedLabel: 'Votre matériel',
      connectLabel: 'Connecter',
      filterAll: 'Tous les appareils ({{count}})',
      catalogTitle: 'Tous les appareils pris en charge',
      catalogIntro:
        'Tous les appareils connectables figurent ici — rien n’est caché derrière un filtre. Chaque fiche indique les signaux qu’un appareil fournit habituellement, pour choisir selon vos objectifs puis connecter une marque prise en charge ci-dessous.',
      hero: {
        ctaCatalog: 'Voir tous les appareils',
        ctaConnect: 'Connecter un appareil',
        ctaMember: 'Ouvrir l’Espace membre',
      },
      live: {
        label: 'Signaux vivants',
        title: 'Votre corps envoie des données discrètes toute la journée',
        body: 'BioMath Core écoute {{categories}} catégories et {{devices}} appareils connectables, puis transforme les tendances en conseils calmes et concrets pour les rapports et Health Guide.',
        chipSleep: 'Phases de sommeil',
        chipGlucose: 'Courbe de glucose',
        chipHrv: 'Récupération et VFC',
      },
      flow: {
        label: 'Comment se fait la connexion',
        title: 'Autoriser, synchroniser, comprendre',
        body: 'Vous n’accordez l’accès qu’aux mesures. Les tendances alimentent le contexte personnel des rapports et de Health Guide : des repères pédagogiques, pas un diagnostic.',
        steps: {
          authorize: {
            title: 'Autoriser les mesures',
            body: 'Choisissez le fabricant et validez les mesures de santé partagées. Nous ne recevons jamais l’identifiant ni le mot de passe de votre appareil, et vous pouvez retirer l’accès à tout moment.',
          },
          sync: {
            title: 'Synchroniser à votre rythme',
            body: 'Chaque jour, plusieurs fois par jour, ou en quasi temps réel si l’appareil le permet. La synchronisation se fait discrètement en arrière-plan et le rythme se change quand vous voulez.',
          },
          guide: {
            title: 'Conseils et rapports',
            body: 'Les tendances apparaissent dans vos rapports et donnent à Health Guide le contexte nécessaire à des suggestions calmes et concrètes. Tout reste pédagogique : ce n’est jamais un diagnostic.',
          },
        },
      },
    },
    deviceEducation: {
      whyDevicesMatter: {
        title: 'Pourquoi les appareils connectés comptent',
        description:
          'Une mesure isolée est un instantané ; un appareil montre une direction. Lorsque le sommeil, la récupération, le glucose et la charge sont suivis pendant des semaines, les petits écarts deviennent visibles bien avant de se transformer en gêne, et des ajustements doux suffisent le plus souvent.',
      },
      realTimeBehavior: {
        title: 'Comment se comportent les données une fois l’appareil connecté',
        description:
          'Les mesures arrivent au rythme que vous choisissez et sont comparées à votre propre référence récente, pas à la moyenne d’un inconnu. Ce que vous voyez, c’est le sens du changement : amélioration, stabilité ou dérive.',
        continuousMonitoring: {
          title: 'Vue continue :',
          description:
            'Entre deux synchronisations rien n’est perdu : les relevés sont collectés en arrière-plan et résumés à l’ouverture de BioMath Core, vous n’avez donc jamais rien à saisir à la main.',
        },
      },
      dataInfluenceReports: {
        title: 'Comment les données d’appareil façonnent vos rapports',
        description:
          'Les mesures autorisées rejoignent le contexte personnel de chaque rapport. Au lieu de tableaux bruts, vous obtenez la tendance, ce qui l’a probablement influencée et une courte liste d’étapes concrètes réellement applicables.',
      },
      dataInfluenceAI: {
        title: 'Comment les données d’appareil parviennent à Health Guide',
        description:
          'Health Guide lit les mêmes tendances que vous : les réponses reflètent donc votre sommeil, votre récupération, votre activité et votre glucose récents plutôt que des conseils génériques. Il explique ; il ne diagnostique pas.',
        secondOpinion: {
          title: 'Second avis :',
          description:
            'Les mêmes signaux se lisent de deux façons : une explication physiologique et une explication comportementale, liée au mode de vie. Voir les deux aide à choisir ce qui convient à votre semaine plutôt qu’à accepter un verdict unique.',
        },
      },
      alertsNudges: {
        title: 'Alertes et rappels en douceur',
        description:
          'Les notifications restent rares et calmes. Nous vous écrivons lorsqu’une tendance tient plusieurs jours, pas lorsqu’une seule nuit paraît inhabituelle — et chaque message explique le sens et la suite.',
        positiveReinforcement: {
          title: 'Les progrès comptent aussi :',
          description:
            'Les améliorations sont signalées aussi clairement que les baisses, car savoir ce qui a fonctionné est le moyen le plus rapide de le maintenir.',
        },
      },
      userSettings: {
        title: 'Vous choisissez la fréquence de lecture des données',
        description:
          'La fréquence de synchronisation vous appartient, appareil par appareil. Choisissez le rythme qui correspond à votre usage : il se modifie à tout moment sans perdre l’historique.',
        onlyAtNight: {
          title: 'La nuit seulement',
          description:
            'Idéal pour les bagues et les systèmes de sommeil. Les données sont lues une fois la nuit terminée, la journée reste donc silencieuse.',
        },
        onlyInTheMorning: {
          title: 'Une fois chaque matin',
          description:
            'Un seul résumé quotidien du sommeil, de la récupération et de la charge de la veille. L’option la plus calme pour la plupart des personnes.',
        },
        everyFewHours: {
          title: 'Toutes les quelques heures',
          description:
            'Utile pendant les blocs d’entraînement ou les semaines chargées, quand charge et récupération évoluent au sein d’une même journée.',
        },
        continuously: {
          title: 'Quasi temps réel',
          description:
            'Pour les capteurs de glucose en continu et les bracelets de récupération, où la forme de la courbe compte plus qu’un chiffre quotidien.',
        },
        footer:
          'Quel que soit votre choix, la synchronisation s’arrête dès que vous déconnectez un appareil, et les données passées restent dans votre historique jusqu’à ce que vous les supprimiez.',
      },
      advancedBehaviorNote: {
        title: 'Une note sur les limites',
        description:
          'BioMath Core lit ce que vos appareils rapportent et l’explique en contexte. Il ne pilote pas votre appareil, ne remplace pas une mesure clinique et n’émet jamais de diagnostic : servez-vous-en comme base pour de meilleurs échanges avec votre professionnel de santé.',
      },
      realScenarios: {
        title: 'À quoi cela ressemble en pratique',
        description:
          'Voici des situations du quotidien construites à partir de données réelles : ce que les chiffres montraient, comment Health Guide les explique et le ton employé. Elles montrent comment les repères restent calmes, précis et sans alarmisme.',
      },
    },
    deviceScenarios: {
      labels: {
        description: 'Ce que les données montraient :',
        healthGuide: 'Health Guide explique',
        secondOpinion: 'Second avis',
        behavior: 'Ce que fait BioMath Core :',
      },
      categories: {
        cgm: 'Glucose',
        sleep_hrv: 'Sommeil et VFC',
        activity: 'Activité et charge',
      },
      general: {
        title: 'Comment chaque scénario est traité',
        safeTitle: 'Sûr par conception :',
        safeBody:
          'Rien ici ne nomme une maladie ni ne prédit un diagnostic. Les signaux sont décrits comme des tendances, et toute valeur hors d’une plage habituelle est une raison d’en parler à un professionnel, pas une conclusion en soi.',
        trendsTitle: 'Des tendances, pas des points isolés :',
        trendsBody:
          'Une nuit agitée ou une valeur élevée ne change rien. Une tendance n’est évoquée que lorsqu’elle tient plusieurs jours, ce qui garde les conseils stables plutôt que réactifs.',
        termsTitle: 'Les mots que nous employons',
        terms: [
          'Tendance',
          'Régularité',
          'Sens du changement',
          'Votre plage habituelle',
          'Récupération',
          'Charge',
          'À surveiller',
          'À évoquer avec un professionnel',
        ],
        avoidTitle: 'Les mots que nous n’employons jamais',
        avoided: [
          'Diagnostic',
          'Maladie',
          'Pathologie',
          'Anormal',
          'Dangereux',
          'Critique',
          'Traitement',
          'Ordonnance',
          'Guérison',
        ],
      },
      blocks: {
        cgm: {
          title: 'Capteurs de glucose en continu',
          body: 'Un capteur en continu montre comment les repas, le mouvement, le stress et le sommeil façonnent votre journée. La valeur tient à la forme de la courbe — jusqu’où elle monte et à quelle vitesse elle redescend — pas à un chiffre isolé.',
          bullets: [
            'Compare la courbe de chaque jour à votre propre référence récente',
            'Relie les hausses et les creux aux repas, au mouvement et au sommeil',
            'Attend qu’un schéma se répète avant de suggérer quoi que ce soit',
            'Vous oriente vers un professionnel si les valeurs restent hors de votre plage habituelle',
          ],
        },
        sleep_hrv: {
          title: 'Sommeil et VFC',
          body: 'La profondeur du sommeil et la variabilité de la fréquence cardiaque décrivent la qualité de récupération de votre système nerveux. Ensemble, elles expliquent pourquoi une semaine ordinaire peut peser et pourquoi une autre semble légère.',
          bullets: [
            'Suit l’équilibre sommeil profond / paradoxal sur la semaine, pas sur une nuit',
            'Lit la VFC par rapport à votre propre référence, jamais à une moyenne de population',
            'Propose des journées plus légères quand la récupération baisse plusieurs nuits',
            'Confirme ce qui fonctionne quand la récupération remonte',
          ],
        },
        activity: {
          title: 'Activité et charge',
          body: 'Les pas, les séances et l’effort n’ont de sens qu’en regard de la récupération. Une même semaine d’entraînement peut être un bon stimulus ou de trop, selon vos nuits.',
          bullets: [
            'Met en balance la charge d’entraînement avec le sommeil et la VFC',
            'Repère l’accumulation de charge avant qu’elle ne devienne de la fatigue',
            'Reconnaît une semaine bien dosée et le dit',
            'Garde des suggestions modestes : un ajustement à la fois',
          ],
        },
      },
      cards: {
        glucoseSpike: {
          title: 'Une montée marquée après les repas',
          description:
            'Le glucose est monté vite après le déjeuner plusieurs jours cette semaine et a mis plus de temps que d’habitude à redescendre.',
          response:
            'Votre courbe de l’après-midi monte plus vite que votre propre référence. C’est un schéma à comprendre, pas une alerte. La composition du repas et ce qui le suit comptent tous les deux : une courte marche après avoir mangé aplatit souvent cette courbe. Observons ensemble les prochains jours.',
          secondOpinion:
            'Lue sous l’angle du comportement, cette même courbe suit souvent un repas pris trop vite, une nuit courte ou une matinée stressante plutôt que l’aliment seul. Si votre sommeil a été léger cette semaine, la réponse métabolique est attendue : retrouver vos nuits peut changer la courbe davantage que changer l’assiette.',
        },
        glucoseStable: {
          title: 'Une courbe plus régulière',
          description:
            'Le glucose est resté dans une bande étroite la majeure partie de la semaine, avec des hausses douces après les repas et un retour progressif.',
          response:
            'Votre courbe est calme et prévisible : les hausses sont modérées et le retour est rapide. Quel que soit votre rythme récent, il vous convient. Conserver repas et mouvement tels quels est le plus simple pour maintenir cela.',
        },
        recoveryDown: {
          title: 'La récupération s’oriente à la baisse',
          description:
            'La VFC est sous votre plage habituelle depuis quatre nuits et le sommeil profond a raccourci, alors que le temps total au lit n’a pas changé.',
          response:
            'Votre système nerveux semble porter plus que d’ordinaire. Le temps au lit est correct, mais la qualité de la récupération a baissé. C’est une bonne semaine pour alléger l’entraînement, avancer la mise au calme du soir et limiter la caféine tardive. Si cela dure au-delà d’une ou deux semaines, cela vaut la peine d’en parler à un professionnel.',
          secondOpinion:
            'Sous l’angle du comportement, ce schéma suit souvent la vie plutôt que la physiologie : une période exigeante au travail, des soirées tardives ou des déplacements. Si cela correspond à votre semaine, voyez ces chiffres comme un signal de protéger vos soirées quelques jours, pas comme un signe que quelque chose ne va pas.',
        },
        recoveryUp: {
          title: 'La récupération remonte',
          description:
            'La VFC est revenue dans votre plage habituelle et le sommeil profond s’est allongé sur les dernières nuits.',
          response:
            'La récupération revient là où elle se situe d’ordinaire, et le changement tient depuis plusieurs nuits : c’est donc un vrai mouvement, pas du bruit. Ce que vous avez modifié récemment fonctionne — garder la même heure de coucher encore une semaine est le moyen le plus simple de l’ancrer.',
        },
        overload: {
          title: 'La charge dépasse la récupération',
          description:
            'Le volume d’entraînement a nettement augmenté cette semaine alors que le sommeil est resté identique et que les scores de récupération ont baissé chaque jour.',
          response:
            'Vous avez ajouté de la charge plus vite que votre récupération n’a suivi. Rien d’inquiétant ici : c’est simplement le point où l’effort supplémentaire cesse de payer. Une séance plus facile ou un jour de repos en plus cette semaine rétablit généralement l’équilibre.',
        },
        balanced: {
          title: 'Charge et récupération accordées',
          description:
            'L’activité est restée régulière toute la semaine et les scores de récupération se sont maintenus au même niveau.',
          response:
            'Votre charge et votre récupération avancent ensemble, ce qui est exactement l’allure d’une semaine tenable. Il n’y a rien à ajuster — c’est une bonne référence à garder en tête pour planifier le bloc suivant.',
        },
        fatigue: {
          title: 'Une fatigue discrète, inhabituelle',
          description:
            'L’activité a nettement baissé plusieurs jours, la fréquence cardiaque au repos est un peu plus haute que d’habitude et le sommeil est plus long sans être reposant.',
          response:
            'Votre corps demande une période plus lente : moins d’activité avec une fréquence cardiaque de repos plus élevée signifie souvent que la récupération est encore en cours. Accordez-vous quelques jours doux et observez si cela se stabilise. Si la fatigue persiste plus de deux semaines, il vaut mieux en parler à un professionnel.',
        },
      },
    },
  },

  de: {
    devicesPage: {
      seo: {
        title: 'Verbundene Geräte — Wearables & Sensoren | BioMath Core',
        description:
          'Verbinden Sie Uhren, Ringe, Glukosesensoren, Blutdruckmanschetten und smarte Waagen. BioMath Core liest die Trends und erklärt sie in klarer Sprache für Ihre Berichte und Health Guide.',
      },
      badge: 'Wearables & Sensoren',
      title: 'Verbundene Geräte',
      subtitle:
        'Verbinden Sie Uhren, Ringe, Glukosesensoren und Gesundheitsgeräte für zu Hause, damit BioMath Core Trends liest und sie in klarer Sprache erklärt.',
      signalsLabel: 'Signale',
      catalogLabel: 'Katalog',
      connectedLabel: 'Ihre Geräte',
      connectLabel: 'Verbinden',
      filterAll: 'Alle Geräte ({{count}})',
      catalogTitle: 'Alle unterstützten Geräte',
      catalogIntro:
        'Hier stehen alle verbindbaren Geräte — nichts verbirgt sich hinter einem Filter. Jede Karte zeigt die Signale, die ein Gerät üblicherweise liefert, damit Sie passend zu Ihren Zielen wählen und unten eine unterstützte Marke verbinden können.',
      hero: {
        ctaCatalog: 'Alle Geräte ansehen',
        ctaConnect: 'Gerät verbinden',
        ctaMember: 'Mitgliederbereich öffnen',
      },
      live: {
        label: 'Lebendige Signale',
        title: 'Ihr Körper sendet den ganzen Tag leise Daten',
        body: 'BioMath Core hört auf {{categories}} Kategorien und {{devices}} verbindbare Geräte — und macht aus Trends ruhige, praktische Hinweise für Berichte und Health Guide.',
        chipSleep: 'Schlafphasen',
        chipGlucose: 'Glukosekurve',
        chipHrv: 'HRV-Erholung',
      },
      flow: {
        label: 'So funktioniert die Verbindung',
        title: 'Freigeben, synchronisieren, verstehen',
        body: 'Sie geben ausschließlich Messwerte frei. Trends fließen in den persönlichen Kontext für Berichte und Health Guide — als Orientierung zur Aufklärung, nicht als Diagnose.',
        steps: {
          authorize: {
            title: 'Messwerte freigeben',
            body: 'Wählen Sie den Hersteller und bestätigen Sie, welche Gesundheitswerte geteilt werden. Wir erhalten nie Ihre Zugangsdaten, und Sie können die Freigabe jederzeit zurücknehmen.',
          },
          sync: {
            title: 'Im eigenen Rhythmus synchronisieren',
            body: 'Täglich, mehrmals täglich oder nahezu in Echtzeit, wenn das Gerät es unterstützt. Die Synchronisierung läuft unauffällig im Hintergrund, und Sie können den Rhythmus jederzeit ändern.',
          },
          guide: {
            title: 'Hinweise & Berichte',
            body: 'Trends erscheinen in Ihren Berichten und geben Health Guide den Kontext für ruhige, praktische Vorschläge. Alles bleibt aufklärend — nie eine Diagnose.',
          },
        },
      },
    },
    deviceEducation: {
      whyDevicesMatter: {
        title: 'Warum verbundene Geräte wichtig sind',
        description:
          'Eine einzelne Messung ist eine Momentaufnahme; ein Gerät zeigt die Richtung. Wenn Schlaf, Erholung, Glukose und Belastung über Wochen verfolgt werden, werden kleine Verschiebungen sichtbar, lange bevor daraus Beschwerden werden — und sanfte Anpassungen reichen meist aus.',
      },
      realTimeBehavior: {
        title: 'Wie sich Daten verhalten, sobald ein Gerät verbunden ist',
        description:
          'Messwerte kommen in dem Rhythmus, den Sie wählen, und werden mit Ihrer eigenen jüngsten Ausgangslage verglichen, nicht mit einem fremden Durchschnitt. Sichtbar wird die Richtung der Veränderung: besser, stabil oder abdriftend.',
        continuousMonitoring: {
          title: 'Durchgehender Blick:',
          description:
            'Zwischen den Synchronisierungen geht nichts verloren — Werte werden im Hintergrund gesammelt und beim Öffnen von BioMath Core zusammengefasst, Sie müssen nichts von Hand eintragen.',
        },
      },
      dataInfluenceReports: {
        title: 'Wie Gerätedaten Ihre Berichte prägen',
        description:
          'Freigegebene Messwerte werden Teil des persönlichen Kontexts hinter jedem Bericht. Statt Rohtabellen erhalten Sie den Trend, seine wahrscheinlichen Einflüsse und eine kurze Liste praktischer nächster Schritte, die sich wirklich umsetzen lassen.',
      },
      dataInfluenceAI: {
        title: 'Wie Gerätedaten zu Health Guide gelangen',
        description:
          'Health Guide liest dieselben Trends, die Sie sehen. Antworten spiegeln daher Ihren jüngsten Schlaf, Ihre Erholung, Aktivität und Glukose wider statt allgemeiner Ratschläge. Es erklärt; es diagnostiziert nicht.',
        secondOpinion: {
          title: 'Zweite Meinung:',
          description:
            'Dieselben Signale lassen sich auf zwei Arten lesen — physiologisch und verhaltensbezogen im Alltag. Beide Blickwinkel zu sehen hilft Ihnen zu entscheiden, was zu Ihrer Woche passt, statt ein einziges Urteil hinzunehmen.',
        },
      },
      alertsNudges: {
        title: 'Hinweise und sanfte Erinnerungen',
        description:
          'Benachrichtigungen bleiben selten und ruhig. Sie hören von uns, wenn ein Trend mehrere Tage hält, nicht wenn eine einzelne Nacht ungewöhnlich aussieht — und jede Nachricht erklärt, was sie bedeutet und was als Nächstes sinnvoll ist.',
        positiveReinforcement: {
          title: 'Fortschritt zählt ebenso:',
          description:
            'Verbesserungen werden genauso deutlich hervorgehoben wie Rückgänge, denn zu wissen, was gewirkt hat, ist der schnellste Weg, es beizubehalten.',
        },
      },
      userSettings: {
        title: 'Sie bestimmen, wie oft Daten gelesen werden',
        description:
          'Die Synchronisierungsfrequenz legen Sie fest, Gerät für Gerät. Wählen Sie den Rhythmus, der zu Ihrer Tragegewohnheit passt — änderbar jederzeit, ohne Verlauf zu verlieren.',
        onlyAtNight: {
          title: 'Nur nachts',
          description:
            'Ideal für Ringe und Schlafsysteme. Die Daten werden einmal nach der Nacht gelesen, der Tag bleibt still.',
        },
        onlyInTheMorning: {
          title: 'Einmal jeden Morgen',
          description:
            'Eine einzige tägliche Zusammenfassung von Schlaf, Erholung und der Belastung des Vortags. Für die meisten die ruhigste Option.',
        },
        everyFewHours: {
          title: 'Alle paar Stunden',
          description:
            'Hilfreich in Trainingsblöcken oder vollen Wochen, wenn sich Belastung und Erholung innerhalb eines Tages verschieben.',
        },
        continuously: {
          title: 'Nahezu in Echtzeit',
          description:
            'Für kontinuierliche Glukosesensoren und Erholungsbänder, bei denen der Verlauf einer Kurve mehr sagt als ein Tageswert.',
        },
        footer:
          'Was immer Sie wählen: Die Synchronisierung endet in dem Moment, in dem Sie ein Gerät trennen, und frühere Daten bleiben in Ihrem Verlauf, bis Sie sie löschen.',
      },
      advancedBehaviorNote: {
        title: 'Ein Hinweis zu den Grenzen',
        description:
          'BioMath Core liest, was Ihre Geräte melden, und erklärt es im Zusammenhang. Es steuert Ihr Gerät nicht, ersetzt keine klinische Messung und stellt nie eine Diagnose — nutzen Sie es als Grundlage für bessere Gespräche mit Ihrer Ärztin oder Ihrem Arzt.',
      },
      realScenarios: {
        title: 'Wie das in der Praxis aussieht',
        description:
          'Unten stehen alltägliche Situationen aus echten Gerätedaten: was die Zahlen zeigten, wie Health Guide sie erklärt und in welchem Ton. Daran sehen Sie, wie Hinweise ruhig, konkret und ohne Alarm bleiben.',
      },
    },
    deviceScenarios: {
      labels: {
        description: 'Was die Daten zeigten:',
        healthGuide: 'Health Guide erklärt',
        secondOpinion: 'Zweite Meinung',
        behavior: 'Was BioMath Core tut:',
      },
      categories: {
        cgm: 'Glukose',
        sleep_hrv: 'Schlaf & HRV',
        activity: 'Aktivität & Belastung',
      },
      general: {
        title: 'Wie jedes Szenario behandelt wird',
        safeTitle: 'Sicher angelegt:',
        safeBody:
          'Nichts hier benennt eine Erkrankung oder sagt eine Diagnose voraus. Signale werden als Muster beschrieben, und jeder Wert außerhalb des üblichen Bereichs ist ein Anlass für ein ärztliches Gespräch, nicht schon ein Ergebnis.',
        trendsTitle: 'Trends statt Einzelwerte:',
        trendsBody:
          'Eine unruhige Nacht oder ein hoher Wert ändert nichts. Ein Muster wird erst erwähnt, wenn es mehrere Tage hält — so bleiben Hinweise gelassen statt reaktiv.',
        termsTitle: 'Wörter, die wir verwenden',
        terms: [
          'Trend',
          'Muster',
          'Richtung der Veränderung',
          'Ihr üblicher Bereich',
          'Erholung',
          'Belastung',
          'Beobachtenswert',
          'Ärztlich besprechenswert',
        ],
        avoidTitle: 'Wörter, die wir nie verwenden',
        avoided: [
          'Diagnose',
          'Krankheit',
          'Pathologie',
          'Anormal',
          'Gefährlich',
          'Kritisch',
          'Therapie',
          'Verordnung',
          'Heilung',
        ],
      },
      blocks: {
        cgm: {
          title: 'Kontinuierliche Glukosesensoren',
          body: 'Ein CGM zeigt, wie Mahlzeiten, Bewegung, Stress und Schlaf Ihren Tag formen. Der Wert liegt in der Form der Kurve — wie hoch sie steigt und wie schnell sie sich beruhigt — nicht in einem einzelnen Zahlenwert.',
          bullets: [
            'Vergleicht die Kurve jedes Tages mit Ihrer eigenen jüngsten Ausgangslage',
            'Verknüpft Anstiege und Einbrüche mit Mahlzeiten, Bewegung und Schlaf',
            'Wartet auf ein wiederkehrendes Muster, bevor etwas vorgeschlagen wird',
            'Verweist an eine Ärztin oder einen Arzt, wenn Werte außerhalb Ihres üblichen Bereichs bleiben',
          ],
        },
        sleep_hrv: {
          title: 'Schlaf und HRV',
          body: 'Schlaftiefe und Herzratenvariabilität beschreiben, wie gut sich Ihr Nervensystem erholt. Zusammen erklären sie, warum sich eine gewöhnliche Woche schwer anfühlen kann und eine andere mühelos.',
          bullets: [
            'Verfolgt das Verhältnis von Tief- und REM-Schlaf über die Woche, nicht über eine Nacht',
            'Liest HRV gegen Ihre eigene Ausgangslage, nie gegen einen Bevölkerungsdurchschnitt',
            'Schlägt leichtere Tage vor, wenn die Erholung mehrere Nächte sinkt',
            'Bestätigt, was wirkt, sobald die Erholung zurückkommt',
          ],
        },
        activity: {
          title: 'Aktivität und Belastung',
          body: 'Schritte, Einheiten und Anstrengung ergeben nur neben der Erholung Sinn. Dieselbe Trainingswoche kann ein guter Reiz oder zu viel sein — je nachdem, wie Ihre Nächte aussehen.',
          bullets: [
            'Wägt Trainingsbelastung gegen Schlaf und HRV ab',
            'Bemerkt aufgebaute Belastung, bevor daraus Müdigkeit wird',
            'Erkennt eine gut abgestimmte Woche und sagt das auch',
            'Hält Vorschläge klein: eine Anpassung nach der anderen',
          ],
        },
      },
      cards: {
        glucoseSpike: {
          title: 'Ein steiler Anstieg nach den Mahlzeiten',
          description:
            'Die Glukose stieg an mehreren Tagen dieser Woche nach dem Mittagessen schnell und brauchte länger als üblich, um sich wieder zu senken.',
          response:
            'Ihre Nachmittagskurve steigt schneller als Ihre eigene Ausgangslage. Das ist ein Muster, das man verstehen darf — keine Warnung. Zusammensetzung der Mahlzeit und das, was danach kommt, wirken beides: Ein kurzer Spaziergang nach dem Essen flacht diese Kurve oft ab. Schauen wir uns die nächsten Tage gemeinsam an.',
          secondOpinion:
            'Aus Verhaltenssicht folgt dieselbe Kurve oft einer hastigen Mahlzeit, einer kurzen Nacht oder einem stressigen Morgen — nicht dem Essen allein. War Ihr Schlaf diese Woche leicht, ist die Stoffwechselantwort erwartbar: Die Nächte zu erholen verändert die Kurve häufig mehr als der Wechsel des Tellers.',
        },
        glucoseStable: {
          title: 'Eine ruhigere Kurve',
          description:
            'Die Glukose blieb den größten Teil der Woche in einem engen Band, mit sanften Anstiegen nach den Mahlzeiten und ruhiger Rückkehr.',
          response:
            'Ihre Kurve war ruhig und vorhersehbar — die Anstiege sind moderat, die Rückkehr ist schnell. Welcher Rhythmus zuletzt auch galt, er passt zu Ihnen. Mahlzeiten und Bewegung so zu belassen, wie sie sind, ist der einfachste Weg, das zu halten.',
        },
        recoveryDown: {
          title: 'Die Erholung geht zurück',
          description:
            'Die HRV liegt seit vier Nächten unter Ihrem üblichen Bereich und der Tiefschlaf ist kürzer geworden, obwohl die Zeit im Bett gleich geblieben ist.',
          response:
            'Ihr Nervensystem trägt offenbar mehr als sonst. Die Zeit im Bett stimmt, aber die Qualität der Erholung ist gesunken. Eine gute Woche für leichteres Training, ein früheres Herunterfahren am Abend und weniger späten Koffein. Hält es länger als ein bis zwei Wochen an, sollten Sie es ärztlich ansprechen.',
          secondOpinion:
            'Aus Verhaltenssicht folgt dieses Muster oft dem Leben statt der Physiologie — eine fordernde Phase im Beruf, spätere Abende oder Reisen. Passt das zu Ihrer Woche, nehmen Sie die Zahlen als Anlass, Ihre Abende für ein paar Tage zu schützen, nicht als Zeichen, dass etwas nicht stimmt.',
        },
        recoveryUp: {
          title: 'Die Erholung kommt zurück',
          description:
            'Die HRV ist in Ihren üblichen Bereich zurückgekehrt und der Tiefschlaf hat sich über die letzten Nächte verlängert.',
          response:
            'Die Erholung bewegt sich dorthin zurück, wo sie üblicherweise liegt, und die Veränderung hält seit mehreren Nächten — also eine echte Verschiebung und kein Rauschen. Was Sie zuletzt geändert haben, wirkt: Dieselbe Schlafenszeit noch eine Woche beizubehalten, ist der einfachste Weg, es zu festigen.',
        },
        overload: {
          title: 'Die Belastung überholt die Erholung',
          description:
            'Der Trainingsumfang stieg diese Woche deutlich, während der Schlaf gleich blieb und die Erholungswerte täglich weiter nachgaben.',
          response:
            'Sie haben Belastung schneller aufgebaut, als die Erholung mitkommt. Nichts davon ist beunruhigend — es ist schlicht der Punkt, an dem mehr Aufwand nicht mehr zahlt. Eine leichtere Einheit oder ein zusätzlicher Ruhetag in dieser Woche stellt das Gleichgewicht meist wieder her.',
        },
        balanced: {
          title: 'Belastung und Erholung passen zusammen',
          description:
            'Die Aktivität blieb über die Woche gleichmäßig und die Erholungswerte hielten sich parallel dazu stabil.',
          response:
            'Belastung und Erholung bewegen sich gemeinsam — genau so sieht eine tragfähige Woche aus. Es gibt nichts anzupassen; das ist eine gute Ausgangslage, an die Sie sich beim nächsten Block erinnern können.',
        },
        fatigue: {
          title: 'Stille, ungewohnte Müdigkeit',
          description:
            'Die Aktivität fiel mehrere Tage merklich ab, der Ruhepuls liegt etwas höher als üblich, und der Schlaf war länger, ohne erholsam zu wirken.',
          response:
            'Ihr Körper bittet um eine langsamere Phase — weniger Aktivität bei erhöhtem Ruhepuls bedeutet meist, dass die Erholung noch läuft. Gönnen Sie sich ein paar sanfte Tage und beobachten Sie, ob es sich einpendelt. Hält die Müdigkeit länger als zwei Wochen an, sollten Sie sie ärztlich besprechen.',
        },
      },
    },
  },

  ja: {
    devicesPage: {
      seo: {
        title: '連携デバイス — ウェアラブルとセンサー | BioMath Core',
        description:
          '時計、リング、血糖センサー、血圧計、スマート体重計を連携できます。BioMath Core が傾向を読み取り、レポートと Health Guide のためにわかりやすい言葉で説明します。',
      },
      badge: 'ウェアラブルとセンサー',
      title: '連携デバイス',
      subtitle:
        '時計、リング、血糖センサー、家庭用健康機器を連携すると、BioMath Core が傾向を読み取り、わかりやすい言葉で説明します。',
      signalsLabel: 'シグナル',
      catalogLabel: 'カタログ',
      connectedLabel: 'あなたの機器',
      connectLabel: '連携',
      filterAll: 'すべてのデバイス（{{count}}）',
      catalogTitle: '対応するすべてのデバイス',
      catalogIntro:
        '連携できるデバイスはすべてここに掲載しており、フィルターの奥に隠れているものはありません。各カードにはその機器がふだん示す信号を記載しています。目的に合う機材を選び、下で対応ブランドを連携してください。',
      hero: {
        ctaCatalog: 'すべてのデバイスを見る',
        ctaConnect: 'デバイスを連携する',
        ctaMember: 'メンバーゾーンを開く',
      },
      live: {
        label: '生きた信号',
        title: 'からだは一日中、静かなデータを送っています',
        body: 'BioMath Core は {{categories}} のカテゴリと {{devices}} 台の連携可能なデバイスに耳を傾け、傾向を落ち着いた実用的な案内に変えて、レポートと Health Guide に届けます。',
        chipSleep: '睡眠ステージ',
        chipGlucose: '血糖カーブ',
        chipHrv: 'HRVと回復',
      },
      flow: {
        label: '連携の流れ',
        title: '許可し、同期し、理解する',
        body: '許可するのは指標へのアクセスだけです。傾向はレポートと Health Guide の個人コンテキストに流れ込みます。教育的な案内であり、診断ではありません。',
        steps: {
          authorize: {
            title: '指標を許可する',
            body: 'メーカーを選び、共有してよい健康指標を承認します。デバイスのIDやパスワードを当社が受け取ることはなく、許可はいつでも取り消せます。',
          },
          sync: {
            title: '自分のペースで同期する',
            body: '毎日、1日に数回、または対応機器ならほぼリアルタイムで。同期はバックグラウンドで静かに実行され、リズムはいつでも変更できます。',
          },
          guide: {
            title: '案内とレポート',
            body: '傾向はレポートに反映され、Health Guide が落ち着いた実用的な提案を行うための文脈になります。すべて教育目的にとどまり、診断ではありません。',
          },
        },
      },
    },
    deviceEducation: {
      whyDevicesMatter: {
        title: 'デバイス連携が役立つ理由',
        description:
          '1回の測定は一枚の写真ですが、デバイスは向きを示します。睡眠、回復、血糖、負荷を数週間追うと、小さな変化が不調になるずっと前に見えてきます。多くの場合、必要なのは穏やかな調整だけです。',
      },
      realTimeBehavior: {
        title: 'デバイス連携後のデータの動き',
        description:
          '指標は選んだ頻度で届き、他人の平均ではなく、あなた自身の直近のベースラインと比べられます。見えるのは変化の向き、つまり改善か、横ばいか、緩やかなずれかです。',
        continuousMonitoring: {
          title: '途切れない視点：',
          description:
            '同期の合間も情報は失われません。数値はバックグラウンドで集められ、BioMath Core を開いたときにまとめて表示されるので、手入力は不要です。',
        },
      },
      dataInfluenceReports: {
        title: 'デバイスのデータがレポートに与える影響',
        description:
          '許可された指標は、すべてのレポートの背景にある個人コンテキストの一部になります。生の表ではなく、傾向、その背景にあると考えられる要因、そして実行できる短い次の一歩が示されます。',
      },
      dataInfluenceAI: {
        title: 'デバイスのデータが Health Guide に届くしくみ',
        description:
          'Health Guide はあなたと同じ傾向を読みます。そのため回答は一般論ではなく、最近の睡眠、回復、活動、血糖のパターンを踏まえたものになります。説明はしますが、診断はしません。',
        secondOpinion: {
          title: 'セカンドオピニオン：',
          description:
            '同じ信号は二通りに読めます。生理学的な説明と、行動や生活習慣からの説明です。両方を見ることで、ひとつの結論を受け入れるのではなく、その週の自分に合うほうを選べます。',
        },
      },
      alertsNudges: {
        title: '通知とやさしい後押し',
        description:
          '通知は控えめで落ち着いています。ある傾向が数日続いたときにお知らせし、一晩だけの珍しい値では通知しません。どのメッセージにも意味と次の一歩が添えられます。',
        positiveReinforcement: {
          title: '前進も同じように扱います：',
          description:
            '改善は低下と同じくらいはっきりお伝えします。何が効いたかを知ることが、それを続ける一番の近道だからです。',
        },
      },
      userSettings: {
        title: 'データを読む頻度はあなたが決めます',
        description:
          '同期の頻度はデバイスごとに設定できます。身につけ方に合うリズムを選んでください。履歴を失うことなく、いつでも変更できます。',
        onlyAtNight: {
          title: '夜だけ',
          description:
            'リングや睡眠システムに向いています。夜が明けてから一度だけ読み取るので、日中は静かなままです。',
        },
        onlyInTheMorning: {
          title: '毎朝1回',
          description:
            '睡眠、回復、前日の負荷を1日1回まとめて確認します。多くの方にとって最も穏やかな設定です。',
        },
        everyFewHours: {
          title: '数時間ごと',
          description:
            'トレーニング期や忙しい週など、負荷と回復が1日のうちに動くときに役立ちます。',
        },
        continuously: {
          title: 'ほぼリアルタイム',
          description:
            '連続血糖センサーや回復バンド向けです。1日の値よりもカーブの形が意味を持つ場面に適しています。',
        },
        footer:
          'どの設定でも、デバイスを解除した時点で同期は止まり、過去のデータは削除するまで履歴に残ります。',
      },
      advancedBehaviorNote: {
        title: 'できることの範囲について',
        description:
          'BioMath Core はデバイスが報告する内容を読み、文脈の中で説明します。デバイスを操作することはなく、臨床的な測定に代わるものでもなく、診断を出すこともありません。医療者との対話をより良くする材料としてお使いください。',
      },
      realScenarios: {
        title: '実際にはこう見えます',
        description:
          '以下は実際のデバイスデータをもとにした日常の場面です。数値が何を示したか、Health Guide がどう説明するか、どんな語り口かがわかります。案内が落ち着いて具体的で、不安をあおらないことを確かめてください。',
      },
    },
    deviceScenarios: {
      labels: {
        description: 'データが示したこと：',
        healthGuide: 'Health Guide の説明',
        secondOpinion: 'セカンドオピニオン',
        behavior: 'BioMath Core の動き：',
      },
      categories: {
        cgm: '血糖',
        sleep_hrv: '睡眠とHRV',
        activity: '活動と負荷',
      },
      general: {
        title: 'どのシナリオも扱い方は同じです',
        safeTitle: '設計から安全に：',
        safeBody:
          'ここでは病名を挙げることも、診断を予測することもありません。信号はパターンとして説明し、通常の範囲を外れた値は、それ自体が結論ではなく、医療者に相談する理由として扱います。',
        trendsTitle: '一点ではなく傾向で：',
        trendsBody:
          '眠りの浅い一晩や高めの一回で判断は変わりません。パターンは数日続いてはじめて言及されるので、案内は反射的にならず落ち着いています。',
        termsTitle: '使う言葉',
        terms: [
          '傾向',
          'パターン',
          '変化の向き',
          'いつもの範囲',
          '回復',
          '負荷',
          '見守る価値あり',
          '医療者に相談する価値あり',
        ],
        avoidTitle: '使わない言葉',
        avoided: [
          '診断',
          '疾患',
          '病理',
          '異常',
          '危険',
          '重篤',
          '治療',
          '処方',
          '完治',
        ],
      },
      blocks: {
        cgm: {
          title: '連続血糖センサー',
          body: 'CGM は食事、運動、ストレス、睡眠が一日をどう形づくるかを示します。大切なのはカーブの形、つまりどこまで上がりどれだけ早く落ち着くかであって、単独の数値ではありません。',
          bullets: [
            '毎日のカーブをあなた自身の直近のベースラインと比べます',
            '上昇と下降を食事、運動、睡眠と結びつけます',
            'パターンが繰り返されるまで、提案は控えます',
            '数値がいつもの範囲を外れ続ける場合は医療者への相談を促します',
          ],
        },
        sleep_hrv: {
          title: '睡眠とHRV',
          body: '睡眠の深さと心拍変動は、神経系がどれだけ回復しているかを表します。二つを合わせると、ふつうの一週間が重く感じる理由も、軽く感じる理由も見えてきます。',
          bullets: [
            '深睡眠とREMのバランスを一晩ではなく一週間で追います',
            'HRVは集団の平均ではなく、あなた自身の基準と比べます',
            '回復が数晩続けて下がったら、軽めの日を提案します',
            '回復が戻ったときは、うまくいっていることを確認します',
          ],
        },
        activity: {
          title: '活動と負荷',
          body: '歩数、運動、負担は回復と並べてはじめて意味を持ちます。同じ練習量でも、夜の過ごし方しだいで良い刺激にも過剰にもなります。',
          bullets: [
            'トレーニング負荷を睡眠とHRVと釣り合わせます',
            '疲労になる前に負荷の積み重なりに気づきます',
            'うまく釣り合った週はそう伝えます',
            '提案は小さく、一度にひとつの調整にとどめます',
          ],
        },
      },
      cards: {
        glucoseSpike: {
          title: '食後の急な上昇',
          description:
            '今週は数日、昼食後に血糖が速く上がり、落ち着くまでいつもより時間がかかりました。',
          response:
            '午後のカーブがあなた自身の基準より速く上がっています。これは警告ではなく、理解する価値のあるパターンです。食事の内容と食後の過ごし方の両方が効きます。食後の短い散歩でこのカーブはよく緩やかになります。数日、一緒に見ていきましょう。',
          secondOpinion:
            '行動の面から読むと、同じカーブは食べ物そのものより、急いだ食事、短い睡眠、緊張した朝のあとに現れがちです。今週の眠りが浅かったなら、この代謝の反応は自然なことです。皿の中身を変えるより、夜を整えるほうがカーブを大きく変えることもあります。',
        },
        glucoseStable: {
          title: '落ち着いたカーブ',
          description:
            '今週はほとんどの時間、血糖が狭い幅に収まり、食後の上昇も穏やかで、戻り方もなめらかでした。',
          response:
            'カーブは穏やかで見通しがよく、上昇は控えめ、戻りも早い状態です。最近のリズムが何であれ、あなたに合っています。食事と運動を今のかたちのまま保つのが、これを続ける一番簡単な方法です。',
        },
        recoveryDown: {
          title: '回復が下向きです',
          description:
            'HRVが4晩続けていつもの範囲を下回り、床に就いている時間は変わらないのに深睡眠が短くなっています。',
          response:
            '神経系がふだんより多くを抱えているようです。床に就く時間は十分ですが、回復の質が下がっています。今週は練習を軽めにし、夜の切り替えを早め、遅い時間のカフェインを控えるのに向いた週です。1〜2週間を超えて続くようなら、医療者に伝える価値があります。',
          secondOpinion:
            '行動の面から見ると、このパターンは生理よりも生活を映すことが多いものです。仕事の山、遅い夜、移動などです。心当たりがあれば、この数値は「何かがおかしい」しるしではなく、数日だけ夜を守るための合図として受け取ってください。',
        },
        recoveryUp: {
          title: '回復が戻ってきています',
          description:
            'HRVがいつもの範囲に戻り、ここ数晩は深睡眠も長くなっています。',
          response:
            '回復がふだんの位置へ戻りつつあり、その変化が数晩続いています。つまり揺らぎではなく本物の変化です。最近変えたことが効いています。同じ就寝時刻をもう一週間続けるのが、いちばん簡単な定着方法です。',
        },
        overload: {
          title: '負荷が回復を追い越しています',
          description:
            '今週は練習量が大きく増えた一方で睡眠は変わらず、回復スコアが日ごとに下がりました。',
          response:
            '回復が追いつく速さより早く負荷を足しています。心配な状態ではなく、これ以上の努力が実りにくくなる地点というだけです。今週、軽めのセッションを一つ入れるか休息日を一日足せば、たいていは釣り合いが戻ります。',
        },
        balanced: {
          title: '負荷と回復が釣り合っています',
          description:
            '週を通して活動量が安定し、回復スコアも同じように保たれました。',
          response:
            '負荷と回復が一緒に動いており、無理なく続く一週間の形そのものです。調整すべきところはありません。次の期間を計画するときの良い基準として覚えておいてください。',
        },
        fatigue: {
          title: '静かな、いつもと違う疲れ',
          description:
            '数日にわたり活動量が目立って落ち、安静時心拍はいつもよりやや高く、睡眠は長いのに休まった感じがありません。',
          response:
            'からだがゆっくりした期間を求めています。活動が減って安静時心拍が上がるときは、回復がまだ途中であることが多いのです。数日おだやかに過ごし、落ち着くかどうかを見てください。疲れが2週間ほどを超えて続くなら、医療者に相談する価値があります。',
        },
      },
    },
  },

  he: {
    devicesPage: {
      seo: {
        title: 'מכשירים מחוברים — מכשירים לבישים וחיישנים | BioMath Core',
        description:
          'חברו שעונים, טבעות, חיישני סוכר, מדי לחץ דם ומשקלים חכמים. BioMath Core קורא את המגמות ומסביר אותן בשפה פשוטה עבור הדוחות ו־Health Guide.',
      },
      badge: 'מכשירים לבישים וחיישנים',
      title: 'מכשירים מחוברים',
      subtitle:
        'חברו שעונים, טבעות, חיישני סוכר ומכשירי בריאות ביתיים כדי ש־BioMath Core יקרא מגמות ויסביר אותן בשפה פשוטה.',
      signalsLabel: 'אותות',
      catalogLabel: 'קטלוג',
      connectedLabel: 'הציוד שלכם',
      connectLabel: 'חיבור',
      filterAll: 'כל המכשירים ({{count}})',
      catalogTitle: 'כל המכשירים הנתמכים',
      catalogIntro:
        'כאן מופיעים כל המכשירים שניתן לחבר — שום דבר לא מוסתר מאחורי מסנן. בכל כרטיס מצוינים האותות שהמכשיר מספק בדרך כלל, כדי שתבחרו לפי המטרות שלכם ותחברו מותג נתמך למטה.',
      hero: {
        ctaCatalog: 'לכל המכשירים',
        ctaConnect: 'חיבור מכשיר',
        ctaMember: 'פתחו את אזור החברים',
      },
      live: {
        label: 'אותות חיים',
        title: 'הגוף שלכם משדר נתונים שקטים לאורך כל היום',
        body: 'BioMath Core מקשיב ל־{{categories}} קטגוריות ול־{{devices}} מכשירים שניתן לחבר, והופך מגמות להכוונה רגועה ומעשית עבור הדוחות ו־Health Guide.',
        chipSleep: 'שלבי שינה',
        chipGlucose: 'עקומת סוכר',
        chipHrv: 'התאוששות ו־HRV',
      },
      flow: {
        label: 'איך החיבור עובד',
        title: 'לאשר, לסנכרן, להבין',
        body: 'אתם מאשרים גישה למדדים בלבד. המגמות נכנסות להקשר האישי של הדוחות ושל Health Guide — הכוונה לימודית, לא אבחנה.',
        steps: {
          authorize: {
            title: 'אישור המדדים',
            body: 'בחרו יצרן ואשרו אילו מדדי בריאות ישותפו. איננו מקבלים לעולם שם משתמש או סיסמה של המכשיר, וניתן לבטל את הגישה בכל רגע.',
          },
          sync: {
            title: 'סנכרון בקצב שלכם',
            body: 'פעם ביום, כמה פעמים ביום, או כמעט בזמן אמת במכשירים שתומכים בכך. הסנכרון פועל ברקע בשקט, ואפשר לשנות את הקצב מתי שתרצו.',
          },
          guide: {
            title: 'הכוונה ודוחות',
            body: 'המגמות מופיעות בדוחות ונותנות ל־Health Guide הקשר להצעות רגועות ומעשיות. הכול נשאר לימודי — לעולם לא אבחנה.',
          },
        },
      },
    },
    deviceEducation: {
      whyDevicesMatter: {
        title: 'למה מכשירים מחוברים חשובים',
        description:
          'מדידה אחת היא תמונת רגע; מכשיר מראה כיוון. כששינה, התאוששות, סוכר ועומס נמדדים לאורך שבועות, שינויים קטנים נראים הרבה לפני שהם הופכים לתחושה לא נוחה — ולרוב די בהתאמות עדינות.',
      },
      realTimeBehavior: {
        title: 'איך הנתונים מתנהגים אחרי חיבור מכשיר',
        description:
          'המדדים מגיעים בקצב שבחרתם ומושווים לקו הבסיס האישי שלכם מהתקופה האחרונה, לא לממוצע של מישהו אחר. מה שרואים הוא כיוון השינוי: שיפור, יציבות או סטייה הדרגתית.',
        continuousMonitoring: {
          title: 'מבט רציף:',
          description:
            'בין סנכרונים שום דבר לא הולך לאיבוד — הקריאות נאספות ברקע ומסוכמות כשפותחים את BioMath Core, כך שאין צורך לרשום דבר ביד.',
        },
      },
      dataInfluenceReports: {
        title: 'איך נתוני המכשיר מעצבים את הדוחות',
        description:
          'המדדים שאישרתם הופכים לחלק מההקשר האישי שמאחורי כל דוח. במקום טבלאות גולמיות תקבלו את המגמה, מה כנראה השפיע עליה ורשימה קצרה של צעדים מעשיים שאפשר באמת ליישם.',
      },
      dataInfluenceAI: {
        title: 'איך נתוני המכשיר מגיעים ל־Health Guide',
        description:
          'Health Guide קורא את אותן מגמות שאתם רואים, ולכן התשובות משקפות את השינה, ההתאוששות, הפעילות והסוכר שלכם מהתקופה האחרונה במקום עצות כלליות. הוא מסביר; הוא אינו מאבחן.',
        secondOpinion: {
          title: 'חוות דעת שנייה:',
          description:
            'אפשר לקרוא את אותם אותות בשתי דרכים — הסבר פיזיולוגי והסבר התנהגותי שקשור לאורח החיים. לראות את שניהם עוזר לבחור מה מתאים לשבוע שלכם, במקום לקבל מסקנה אחת.',
        },
      },
      alertsNudges: {
        title: 'התראות ותזכורות עדינות',
        description:
          'ההתראות נדירות ורגועות. נפנה אליכם כשמגמה נמשכת כמה ימים, לא כשלילה אחת נראית חריגה — ובכל הודעה מוסבר מה המשמעות ומה כדאי לעשות אחר כך.',
        positiveReinforcement: {
          title: 'גם התקדמות נספרת:',
          description:
            'שיפורים מודגשים באותה בהירות כמו ירידות, כי לדעת מה עבד היא הדרך המהירה ביותר להמשיך בכך.',
        },
      },
      userSettings: {
        title: 'אתם בוחרים כל כמה זמן הנתונים נקראים',
        description:
          'תדירות הסנכרון נתונה לבחירתכם, לכל מכשיר בנפרד. בחרו את הקצב שמתאים לאופן שבו אתם עונדים אותו — אפשר לשנות בכל עת בלי לאבד היסטוריה.',
        onlyAtNight: {
          title: 'רק בלילה',
          description:
            'מתאים לטבעות ולמערכות שינה. הנתונים נקראים פעם אחת בסיום הלילה, כך שהיום נשאר שקט.',
        },
        onlyInTheMorning: {
          title: 'פעם בכל בוקר',
          description:
            'סיכום יומי אחד של שינה, התאוששות והעומס של אתמול. האפשרות הרגועה ביותר עבור רוב האנשים.',
        },
        everyFewHours: {
          title: 'כל כמה שעות',
          description:
            'שימושי בתקופות אימון או בשבועות עמוסים, כשהעומס וההתאוששות משתנים בתוך אותו יום.',
        },
        continuously: {
          title: 'כמעט בזמן אמת',
          description:
            'לחיישני סוכר רציפים ולצמידי התאוששות, שבהם צורת העקומה חשובה יותר ממספר יומי בודד.',
        },
        footer:
          'מה שלא תבחרו, הסנכרון נעצר ברגע שמנתקים מכשיר, והנתונים הקודמים נשארים בהיסטוריה עד שתמחקו אותם.',
      },
      advancedBehaviorNote: {
        title: 'הערה על גבולות המערכת',
        description:
          'BioMath Core קורא את מה שהמכשירים מדווחים ומסביר אותו בהקשר. הוא אינו שולט במכשיר, אינו מחליף מדידה קלינית ולעולם אינו נותן אבחנה — השתמשו בו כרקע לשיחות טובות יותר עם איש המקצוע הרפואי שלכם.',
      },
      realScenarios: {
        title: 'איך זה נראה בפועל',
        description:
          'לפניכם מצבים יומיומיים שנבנו מנתוני מכשירים אמיתיים: מה הראו המספרים, איך Health Guide מסביר אותם ובאיזו נימה. אפשר לראות שההכוונה נשארת רגועה, מדויקת וללא הפחדה.',
      },
    },
    deviceScenarios: {
      labels: {
        description: 'מה הנתונים הראו:',
        healthGuide: 'Health Guide מסביר',
        secondOpinion: 'חוות דעת שנייה',
        behavior: 'מה BioMath Core עושה:',
      },
      categories: {
        cgm: 'סוכר',
        sleep_hrv: 'שינה ו־HRV',
        activity: 'פעילות ועומס',
      },
      general: {
        title: 'איך מטופל כל תרחיש',
        safeTitle: 'בטוח מעצם התכנון:',
        safeBody:
          'שום דבר כאן אינו נוקב בשם מחלה ואינו חוזה אבחנה. האותות מתוארים כדפוסים, וכל קריאה שחורגת מהטווח הרגיל היא סיבה לשוחח עם איש מקצוע רפואי, לא מסקנה בפני עצמה.',
        trendsTitle: 'מגמות, לא נקודות בודדות:',
        trendsBody:
          'לילה חסר מנוחה אחד או קריאה גבוהה אחת אינם משנים דבר. דפוס מוזכר רק כשהוא נמשך כמה ימים, וכך ההכוונה נשארת יציבה במקום תגובתית.',
        termsTitle: 'המילים שאנחנו משתמשים בהן',
        terms: [
          'מגמה',
          'דפוס',
          'כיוון השינוי',
          'הטווח הרגיל שלכם',
          'התאוששות',
          'עומס',
          'כדאי לעקוב',
          'כדאי לשוחח עם איש מקצוע',
        ],
        avoidTitle: 'המילים שלעולם איננו משתמשים בהן',
        avoided: [
          'אבחנה',
          'מחלה',
          'פתולוגיה',
          'חריג',
          'מסוכן',
          'קריטי',
          'טיפול',
          'מרשם',
          'ריפוי',
        ],
      },
      blocks: {
        cgm: {
          title: 'חיישני סוכר רציפים',
          body: 'חיישן רציף מראה כיצד ארוחות, תנועה, מתח ושינה מעצבים את היום. הערך נמצא בצורת העקומה — עד כמה היא עולה ובאיזו מהירות היא נרגעת — ולא במספר בודד.',
          bullets: [
            'משווה את עקומת כל יום לקו הבסיס האישי שלכם מהתקופה האחרונה',
            'מקשר עליות וירידות לארוחות, לתנועה ולשינה',
            'ממתין לדפוס חוזר לפני שהוא מציע משהו',
            'מפנה לאיש מקצוע אם הקריאות נשארות מחוץ לטווח הרגיל שלכם',
          ],
        },
        sleep_hrv: {
          title: 'שינה ו־HRV',
          body: 'עומק השינה ושונות קצב הלב מתארים כמה טוב מתאוששת מערכת העצבים. יחד הם מסבירים למה שבוע רגיל יכול להרגיש כבד ולמה שבוע אחר מרגיש קל.',
          bullets: [
            'עוקב אחרי האיזון בין שינה עמוקה ל־REM לאורך השבוע, לא לילה אחד',
            'קורא HRV מול קו הבסיס שלכם, אף פעם לא מול ממוצע אוכלוסייה',
            'מציע ימים קלים יותר כשההתאוששות יורדת כמה לילות ברצף',
            'מאשר מה עובד כשההתאוששות חוזרת לעלות',
          ],
        },
        activity: {
          title: 'פעילות ועומס',
          body: 'צעדים, אימונים ומאמץ מקבלים משמעות רק לצד ההתאוששות. אותו שבוע אימונים יכול להיות גירוי טוב או יותר מדי, תלוי איך נראים הלילות שלכם.',
          bullets: [
            'מאזן בין עומס האימון לשינה ול־HRV',
            'מזהה הצטברות עומס לפני שהיא הופכת לעייפות',
            'מזהה שבוע מאוזן ואומר זאת',
            'שומר על הצעות קטנות: שינוי אחד בכל פעם',
          ],
        },
      },
      cards: {
        glucoseSpike: {
          title: 'עלייה חדה אחרי ארוחות',
          description:
            'הסוכר עלה מהר אחרי ארוחת הצהריים בכמה ימים השבוע, ולקח לו יותר זמן מהרגיל לחזור ולרדת.',
          response:
            'העקומה של אחר הצהריים עולה מהר יותר מקו הבסיס שלכם. זה דפוס שכדאי להבין, לא אזהרה. גם הרכב הארוחה וגם מה שבא אחריה משפיעים — הליכה קצרה אחרי האוכל מרככת לרוב את העקומה הזו. נעקוב יחד אחרי הימים הקרובים.',
          secondOpinion:
            'בקריאה התנהגותית, אותה עקומה מופיעה לעיתים קרובות אחרי ארוחה חפוזה, לילה קצר או בוקר לחוץ, ולא בגלל האוכל בלבד. אם השינה הייתה קלה השבוע, התגובה המטבולית צפויה — החזרת הלילות עשויה לשנות את העקומה יותר משינוי הצלחת.',
        },
        glucoseStable: {
          title: 'עקומה יציבה יותר',
          description:
            'הסוכר נשאר ברצועה צרה רוב השבוע, עם עליות מתונות אחרי ארוחות וחזרה חלקה.',
          response:
            'העקומה שלכם רגועה וצפויה — העליות מתונות והחזרה מהירה. תהיה אשר תהיה השגרה שלכם לאחרונה, היא מתאימה לכם. לשמור על הארוחות והתנועה כפי שהן היא הדרך הפשוטה ביותר לשמר את זה.',
        },
        recoveryDown: {
          title: 'ההתאוששות במגמת ירידה',
          description:
            'ה־HRV נמוך מהטווח הרגיל שלכם כבר ארבעה לילות והשינה העמוקה התקצרה, אף שהזמן הכולל במיטה לא השתנה.',
          response:
            'נראה שמערכת העצבים נושאת יותר מהרגיל. הזמן במיטה בסדר, אבל איכות ההתאוששות ירדה. זה שבוע טוב לאימון קל יותר, לסיום יום מוקדם יותר ולפחות קפאין בשעות מאוחרות. אם זה נמשך מעבר לשבוע־שבועיים, כדאי להזכיר זאת לאיש מקצוע רפואי.',
          secondOpinion:
            'מזווית התנהגותית, הדפוס הזה עוקב לרוב אחרי החיים ולא אחרי הפיזיולוגיה — תקופה תובענית בעבודה, ערבים מאוחרים או נסיעות. אם משהו מזה מתאים לשבוע שלכם, קראו את המספרים כאות לשמור על הערבים לכמה ימים, ולא כסימן שמשהו לא בסדר.',
        },
        recoveryUp: {
          title: 'ההתאוששות חוזרת לעלות',
          description:
            'ה־HRV חזר לטווח הרגיל שלכם והשינה העמוקה התארכה בלילות האחרונים.',
          response:
            'ההתאוששות חוזרת למקום שבו היא נמצאת בדרך כלל, והשינוי מחזיק כבר כמה לילות — כלומר מדובר בשינוי אמיתי ולא ברעש. מה ששיניתם לאחרונה עובד: לשמור על אותה שעת שינה עוד שבוע היא הדרך הקלה ביותר לקבע את זה.',
        },
        overload: {
          title: 'העומס מקדים את ההתאוששות',
          description:
            'נפח האימון עלה בחדות השבוע בעוד השינה נשארה זהה וציוני ההתאוששות ירדו מדי יום.',
          response:
            'הוספתם עומס מהר יותר משההתאוששות הספיקה להדביק. אין כאן שום דבר מדאיג — זו פשוט הנקודה שבה מאמץ נוסף מפסיק להשתלם. אימון קל אחד או יום מנוחה נוסף השבוע מחזירים בדרך כלל את האיזון.',
        },
        balanced: {
          title: 'עומס והתאוששות מאוזנים',
          description:
            'הפעילות נשמרה עקבית לאורך השבוע וציוני ההתאוששות נשארו יציבים לצידה.',
          response:
            'העומס וההתאוששות שלכם נעים יחד, וכך בדיוק נראה שבוע שאפשר להחזיק לאורך זמן. אין מה לשנות — זו נקודת ייחוס טובה לזכור כשמתכננים את התקופה הבאה.',
        },
        fatigue: {
          title: 'עייפות שקטה ולא אופיינית',
          description:
            'הפעילות ירדה בצורה ניכרת כמה ימים, דופק המנוחה גבוה מעט מהרגיל, והשינה ארוכה יותר בלי תחושת מנוחה.',
          response:
            'הגוף מבקש תקופה איטית יותר — פחות פעילות עם דופק מנוחה גבוה יותר מעידים לרוב על התאוששות שעדיין נמשכת. תנו לזה כמה ימים רגועים ובדקו אם הדברים מתייצבים. אם העייפות נמשכת יותר משבועיים, כדאי לשוחח על כך עם איש מקצוע רפואי.',
        },
      },
    },
  },

  zh: {
    devicesPage: {
      seo: {
        title: '已连接设备 — 可穿戴与传感器 | BioMath Core',
        description:
          '连接手表、戒指、血糖传感器、血压计和智能体脂秤。BioMath Core 读取趋势，并用通俗语言为报告与 Health Guide 作出解释。',
      },
      badge: '可穿戴与传感器',
      title: '已连接设备',
      subtitle:
        '连接手表、戒指、血糖传感器和家用健康设备，让 BioMath Core 读取趋势并用通俗语言解释。',
      signalsLabel: '信号',
      catalogLabel: '目录',
      connectedLabel: '你的设备',
      connectLabel: '连接',
      filterAll: '全部设备（{{count}}）',
      catalogTitle: '我们支持的全部设备',
      catalogIntro:
        '所有可连接的设备都列在这里，不会藏在筛选后面。每张卡片写明该设备通常提供的信号，方便你按目标挑选，然后在下方连接支持的品牌。',
      hero: {
        ctaCatalog: '浏览全部设备',
        ctaConnect: '连接设备',
        ctaMember: '打开会员区',
      },
      live: {
        label: '流动的信号',
        title: '你的身体整天都在安静地发送数据',
        body: 'BioMath Core 关注 {{categories}} 个类别、{{devices}} 款可连接设备，把趋势转化为平静实用的建议，用于报告与 Health Guide。',
        chipSleep: '睡眠阶段',
        chipGlucose: '血糖曲线',
        chipHrv: 'HRV 恢复',
      },
      flow: {
        label: '连接如何进行',
        title: '授权、同步、理解',
        body: '你只授权指标访问。趋势进入报告与 Health Guide 的个人背景信息——这是教育性指引，不是诊断。',
        steps: {
          authorize: {
            title: '授权指标',
            body: '选择厂商并确认可共享哪些健康指标。我们从不接收设备的账号或密码，你也可以随时收回授权。',
          },
          sync: {
            title: '按你的节奏同步',
            body: '每天一次、每天数次，或在设备支持时接近实时。同步在后台安静运行，节奏随时可改。',
          },
          guide: {
            title: '指引与报告',
            body: '趋势会出现在报告中，并为 Health Guide 提供背景，从而给出平静实用的建议。全部内容保持教育性质，绝不是诊断。',
          },
        },
      },
    },
    deviceEducation: {
      whyDevicesMatter: {
        title: '为什么连接设备值得',
        description:
          '一次测量只是一张快照，而设备显示的是方向。当睡眠、恢复、血糖和负荷被连续观察数周，细小的变化会在变成不适之前很久就显现出来，通常只需温和的调整即可。',
      },
      realTimeBehavior: {
        title: '设备连接后数据如何呈现',
        description:
          '指标按你选定的频率到达，并与你自己近期的基线比较，而不是与陌生人的平均值比较。你看到的是变化的方向：改善、持平，还是缓慢偏移。',
        continuousMonitoring: {
          title: '连续视角：',
          description:
            '两次同步之间不会丢失任何内容——数据在后台收集，打开 BioMath Core 时汇总呈现，你无需手动记录。',
        },
      },
      dataInfluenceReports: {
        title: '设备数据如何影响你的报告',
        description:
          '已授权的指标会成为每份报告背后个人背景的一部分。你得到的不是原始表格，而是趋势、可能的影响因素，以及一份真正可执行的简短后续步骤清单。',
      },
      dataInfluenceAI: {
        title: '设备数据如何进入 Health Guide',
        description:
          'Health Guide 读取的是你看到的同一批趋势，因此回应会反映你近期的睡眠、恢复、活动与血糖模式，而不是泛泛的建议。它负责解释，不作诊断。',
        secondOpinion: {
          title: '第二意见：',
          description:
            '同样的信号可以有两种读法：生理层面的解释，以及行为与生活方式层面的解释。看到两者，你可以选择更适合这一周的做法，而不是接受单一结论。',
        },
      },
      alertsNudges: {
        title: '提醒与温和提示',
        description:
          '通知保持稀少而平静。只有当某个趋势持续数天时我们才会提醒，而不是因为某一晚看起来异常；每条消息都会说明含义和下一步。',
        positiveReinforcement: {
          title: '进步同样重要：',
          description:
            '改善会与下降一样被清楚指出，因为知道什么起了作用，是把它坚持下去的最快方式。',
        },
      },
      userSettings: {
        title: '读取数据的频率由你决定',
        description:
          '同步频率可按设备分别设置。选择与你佩戴习惯相符的节奏——随时可改，且不会丢失历史。',
        onlyAtNight: {
          title: '仅夜间',
          description: '适合戒指和睡眠系统。一夜结束后读取一次，白天保持安静。',
        },
        onlyInTheMorning: {
          title: '每天早晨一次',
          description:
            '每天一次汇总睡眠、恢复与前一天的负荷。对大多数人来说最平静的选择。',
        },
        everyFewHours: {
          title: '每隔几小时',
          description: '适合训练周期或忙碌的一周，此时负荷与恢复会在一天之内变化。',
        },
        continuously: {
          title: '接近实时',
          description:
            '适合连续血糖传感器和恢复手环，此时曲线的形状比每日一个数字更有意义。',
        },
        footer:
          '无论选择哪种方式，一旦断开设备，同步立即停止；此前的数据会保留在历史记录中，直到你删除为止。',
      },
      advancedBehaviorNote: {
        title: '关于边界的说明',
        description:
          'BioMath Core 读取设备上报的内容，并在背景中加以解释。它不会控制你的设备，不能替代临床测量，也绝不给出诊断——请把它当作与医生更好交流的参考背景。',
      },
      realScenarios: {
        title: '实际中是什么样子',
        description:
          '以下是基于真实设备数据的日常情境：数字显示了什么、Health Guide 如何解释，以及我们使用的语气。你可以从中看到指引如何保持平静、具体且不制造恐慌。',
      },
    },
    deviceScenarios: {
      labels: {
        description: '数据显示了什么：',
        healthGuide: 'Health Guide 的解释',
        secondOpinion: '第二意见',
        behavior: 'BioMath Core 会做什么：',
      },
      categories: {
        cgm: '血糖',
        sleep_hrv: '睡眠与 HRV',
        activity: '活动与负荷',
      },
      general: {
        title: '每种情境的处理方式',
        safeTitle: '设计上就安全：',
        safeBody:
          '这里不会点名任何疾病，也不会预测诊断。信号以模式的方式描述；任何超出常规范围的读数都是与医生沟通的理由，而不是结论本身。',
        trendsTitle: '看趋势，而非单点：',
        trendsBody:
          '一个不安稳的夜晚或一次偏高的读数不会改变什么。只有当模式持续数天才会被提及，这样指引才稳定，而不是被动反应。',
        termsTitle: '我们使用的词',
        terms: [
          '趋势',
          '模式',
          '变化方向',
          '你的常规区间',
          '恢复',
          '负荷',
          '值得留意',
          '值得与医生讨论',
        ],
        avoidTitle: '我们从不使用的词',
        avoided: ['诊断', '疾病', '病理', '异常', '危险', '危重', '治疗', '处方', '治愈'],
      },
      blocks: {
        cgm: {
          title: '连续血糖传感器',
          body: 'CGM 展示饮食、运动、压力和睡眠如何塑造你的一天。价值在于曲线的形状——升到多高、多快回落——而不是某一个数字。',
          bullets: [
            '把每天的曲线与你自己近期的基线比较',
            '把升高与回落同饮食、运动和睡眠联系起来',
            '等模式重复出现后才提出建议',
            '若读数持续超出你的常规区间，会建议你咨询医生',
          ],
        },
        sleep_hrv: {
          title: '睡眠与 HRV',
          body: '睡眠深度与心率变异性共同描述神经系统的恢复情况。两者结合可以解释为什么平常的一周会觉得沉重，而另一周却轻松。',
          bullets: [
            '按周观察深睡与 REM 的平衡，而不是看单独一晚',
            '将 HRV 与你自己的基线比较，绝不与人群平均值比较',
            '当恢复连续数晚下降时，建议安排更轻松的日子',
            '当恢复回升时，确认哪些做法有效',
          ],
        },
        activity: {
          title: '活动与负荷',
          body: '步数、训练与消耗只有放在恢复旁边才有意义。同样的训练周，取决于你的夜晚状况，可能是良好刺激，也可能过量。',
          bullets: [
            '在睡眠与 HRV 之间平衡训练负荷',
            '在负荷累积转为疲劳之前先行察觉',
            '识别出安排得当的一周并明确告知',
            '建议保持小幅度：一次只做一个调整',
          ],
        },
      },
      cards: {
        glucoseSpike: {
          title: '餐后明显升高',
          description: '本周有几天午餐后血糖上升很快，回落所需的时间也比平时更长。',
          response:
            '你下午的曲线比自己的基线上升得更快。这是一个值得理解的模式，而不是警告。餐食构成与餐后行为都会影响：饭后短距离散步常常能让这条曲线变得平缓。我们一起观察接下来几天。',
          secondOpinion:
            '从行为角度看，同样的曲线往往跟随匆忙的一餐、短暂的睡眠或紧张的早晨，而不只是食物本身。如果这周睡得较浅，这种代谢反应是可以预期的——把夜晚恢复好，可能比改变盘子里的内容更能改变曲线。',
        },
        glucoseStable: {
          title: '更平稳的曲线',
          description: '本周大部分时间血糖保持在较窄区间内，餐后升幅温和，回落顺畅。',
          response:
            '你的曲线平静且可预期——升幅温和，回落迅速。无论你最近的节奏是什么，它都适合你。保持现有的饮食与活动方式，是维持这一状态最简单的办法。',
        },
        recoveryDown: {
          title: '恢复呈下降趋势',
          description:
            'HRV 已连续四晚低于你的常规区间，深睡时间缩短，但卧床总时长没有变化。',
          response:
            '你的神经系统似乎承担得比平时更多。卧床时间没问题，但恢复质量下降了。这一周适合减轻训练强度、更早进入放松状态，并减少晚间咖啡因。如果持续超过一两周，值得向医生提及。',
          secondOpinion:
            '从行为角度看，这种模式往往跟随生活而非生理——工作紧张阶段、更晚的夜晚，或是出差旅行。如果其中有符合你这一周的情况，请把这些数字当作接下来几天保护晚间时间的信号，而不是身体出问题的迹象。',
        },
        recoveryUp: {
          title: '恢复正在回升',
          description: 'HRV 已回到你的常规区间，最近几晚深睡时间也在延长。',
          response:
            '恢复正在回到它通常所在的位置，而且这一变化已经持续数晚，说明是真实的转变而非波动。你最近做出的改变正在起作用——再保持同样的入睡时间一周，是让它稳固下来最容易的方式。',
        },
        overload: {
          title: '负荷超过了恢复',
          description:
            '本周训练量明显上升，而睡眠保持不变，恢复评分逐日走低。',
          response:
            '你增加负荷的速度快过了恢复跟上的速度。这里没有什么令人担忧的地方——只是到了继续加码不再带来回报的位置。本周安排一次更轻松的训练或增加一天休息，通常就能让平衡回来。',
        },
        balanced: {
          title: '负荷与恢复相匹配',
          description: '整周活动量保持稳定，恢复评分也同步保持平稳。',
          response:
            '你的负荷与恢复在同步移动，这正是可持续一周该有的样子。没有需要调整的地方——把它记住，作为规划下一阶段的良好基准。',
        },
        fatigue: {
          title: '安静而不寻常的疲惫',
          description:
            '连续几天活动量明显下降，静息心率略高于平时，睡眠时间更长却没有休息够的感觉。',
          response:
            '身体在要求一段更慢的时间——活动减少同时静息心率升高，通常意味着恢复仍在进行中。给自己几天平缓的日子，看看是否稳定下来。如果疲惫持续超过两周左右，值得与医生讨论。',
        },
      },
    },
  },

  ar: {
    devicesPage: {
      seo: {
        title: 'الأجهزة المتصلة — الأجهزة القابلة للارتداء والمستشعرات | BioMath Core',
        description:
          'اربط الساعات والخواتم ومستشعرات الجلوكوز وأجهزة قياس ضغط الدم والموازين الذكية. يقرأ BioMath Core الاتجاهات ويشرحها بلغة بسيطة لتقاريرك ولـ Health Guide.',
      },
      badge: 'الأجهزة القابلة للارتداء والمستشعرات',
      title: 'الأجهزة المتصلة',
      subtitle:
        'اربط الساعات والخواتم ومستشعرات الجلوكوز وأجهزة الصحة المنزلية ليقرأ BioMath Core الاتجاهات ويشرحها بلغة بسيطة.',
      signalsLabel: 'الإشارات',
      catalogLabel: 'الدليل',
      connectedLabel: 'أجهزتك',
      connectLabel: 'الربط',
      filterAll: 'كل الأجهزة ({{count}})',
      catalogTitle: 'كل الأجهزة المدعومة',
      catalogIntro:
        'كل الأجهزة القابلة للربط مذكورة هنا، ولا شيء مخفي خلف عامل تصفية. تُبيّن كل بطاقة الإشارات التي يقدمها الجهاز عادةً، لتختار ما يناسب أهدافك ثم تربط علامة مدعومة أدناه.',
      hero: {
        ctaCatalog: 'تصفح كل الأجهزة',
        ctaConnect: 'اربط جهازًا',
        ctaMember: 'افتح منطقة الأعضاء',
      },
      live: {
        label: 'إشارات حيّة',
        title: 'جسدك يرسل بيانات هادئة طوال اليوم',
        body: 'ينصت BioMath Core إلى {{categories}} فئات و{{devices}} جهازًا قابلًا للربط، ثم يحوّل الاتجاهات إلى إرشاد هادئ وعملي للتقارير ولـ Health Guide.',
        chipSleep: 'مراحل النوم',
        chipGlucose: 'منحنى الجلوكوز',
        chipHrv: 'التعافي وتغيّر النبض',
      },
      flow: {
        label: 'كيف يتم الربط',
        title: 'الإذن ثم المزامنة ثم الفهم',
        body: 'أنت تمنح إذنًا للمقاييس فقط. تنتقل الاتجاهات إلى السياق الشخصي للتقارير ولـ Health Guide، وهي إرشادات تعليمية وليست تشخيصًا.',
        steps: {
          authorize: {
            title: 'اسمح بالمقاييس',
            body: 'اختر الشركة المصنّعة ووافق على المقاييس الصحية التي تُشارك. لا نستلم أبدًا اسم الدخول أو كلمة المرور الخاصة بجهازك، ويمكنك سحب الإذن في أي وقت.',
          },
          sync: {
            title: 'زامِن وفق إيقاعك',
            body: 'يوميًا أو عدة مرات في اليوم أو شبه فوري في الأجهزة التي تدعم ذلك. تعمل المزامنة بهدوء في الخلفية، ويمكنك تغيير الإيقاع متى شئت.',
          },
          guide: {
            title: 'الإرشاد والتقارير',
            body: 'تظهر الاتجاهات في تقاريرك وتمنح Health Guide سياقًا لاقتراحات هادئة وعملية. يبقى كل شيء تعليميًا ولا يكون تشخيصًا أبدًا.',
          },
        },
      },
    },
    deviceEducation: {
      whyDevicesMatter: {
        title: 'لماذا تهم الأجهزة المتصلة',
        description:
          'القياس الواحد لقطة عابرة، أما الجهاز فيُظهر الاتجاه. حين تُتابع مقاييس النوم والتعافي والجلوكوز والحمل على مدى أسابيع، تظهر التغيّرات الصغيرة قبل وقت طويل من تحوّلها إلى شكوى، وغالبًا تكفي تعديلات لطيفة.',
      },
      realTimeBehavior: {
        title: 'كيف تتصرف البيانات بعد ربط الجهاز',
        description:
          'تصل المقاييس بالوتيرة التي تختارها وتُقارن بخط الأساس الخاص بك في الفترة الأخيرة، لا بمتوسط شخص آخر. ما تراه هو اتجاه التغيّر: تحسّن أو ثبات أو انحراف تدريجي.',
        continuousMonitoring: {
          title: 'رؤية متصلة:',
          description:
            'بين المزامنات لا يضيع شيء؛ تُجمع القراءات في الخلفية وتُلخَّص عند فتح BioMath Core، فلا تحتاج إلى تدوين أي شيء يدويًا.',
        },
      },
      dataInfluenceReports: {
        title: 'كيف تشكّل بيانات الجهاز تقاريرك',
        description:
          'تصبح المقاييس المسموح بها جزءًا من السياق الشخصي وراء كل تقرير. وبدلًا من جداول خام تحصل على الاتجاه، وما رجّح حدوثه، وقائمة قصيرة من الخطوات العملية التي يمكنك تنفيذها فعلًا.',
      },
      dataInfluenceAI: {
        title: 'كيف تصل بيانات الجهاز إلى Health Guide',
        description:
          'يقرأ Health Guide الاتجاهات نفسها التي تراها، فتعكس الإجابات نومك وتعافيك ونشاطك وأنماط الجلوكوز لديك مؤخرًا بدل النصائح العامة. هو يشرح ولا يشخّص.',
        secondOpinion: {
          title: 'رأي ثانٍ:',
          description:
            'يمكن قراءة الإشارات نفسها بطريقتين: تفسير فسيولوجي وآخر سلوكي مرتبط بنمط الحياة. رؤية الاثنين تساعدك على اختيار ما يناسب أسبوعك بدل قبول حكم واحد.',
        },
      },
      alertsNudges: {
        title: 'التنبيهات والتذكيرات اللطيفة',
        description:
          'تبقى الإشعارات قليلة وهادئة. نراسلك حين يستمر اتجاه ما عدة أيام، لا حين تبدو ليلة واحدة غير معتادة، وكل رسالة تشرح المعنى والخطوة التالية.',
        positiveReinforcement: {
          title: 'التقدّم يُحتسب أيضًا:',
          description:
            'تُبرز التحسّنات بالوضوح نفسه الذي تُبرز به التراجعات، لأن معرفة ما نجح هي أسرع طريق للاستمرار فيه.',
        },
      },
      userSettings: {
        title: 'أنت تختار وتيرة قراءة البيانات',
        description:
          'وتيرة المزامنة قرارك، لكل جهاز على حدة. اختر الإيقاع الذي يناسب طريقة ارتدائك للجهاز، ويمكنك تغييره في أي وقت دون فقدان السجل.',
        onlyAtNight: {
          title: 'ليلًا فقط',
          description:
            'مناسب للخواتم وأنظمة النوم. تُقرأ البيانات مرة واحدة بعد انتهاء الليل، فيبقى النهار هادئًا.',
        },
        onlyInTheMorning: {
          title: 'مرة كل صباح',
          description:
            'ملخّص يومي واحد للنوم والتعافي وحمل الأمس. الخيار الأهدأ لمعظم الناس.',
        },
        everyFewHours: {
          title: 'كل بضع ساعات',
          description:
            'مفيد خلال فترات التدريب أو الأسابيع المزدحمة، حين يتغيّر الحمل والتعافي داخل اليوم نفسه.',
        },
        continuously: {
          title: 'شبه فوري',
          description:
            'لمستشعرات الجلوكوز المستمرة وأساور التعافي، حيث يكون شكل المنحنى أهم من رقم يومي واحد.',
        },
        footer:
          'مهما اخترت، تتوقف المزامنة لحظة فصل الجهاز، وتبقى البيانات السابقة في سجلّك إلى أن تحذفها.',
      },
      advancedBehaviorNote: {
        title: 'ملاحظة عن حدود ما نقدّمه',
        description:
          'يقرأ BioMath Core ما تبلّغ به أجهزتك ويشرحه في سياقه. لا يتحكم في جهازك، ولا يحل محل القياس السريري، ولا يصدر تشخيصًا أبدًا؛ استخدمه خلفية لحوار أفضل مع مختصّ الرعاية الصحية.',
      },
      realScenarios: {
        title: 'كيف يبدو هذا عمليًا',
        description:
          'في ما يلي مواقف يومية مبنية على بيانات أجهزة حقيقية: ما أظهرته الأرقام، وكيف يشرحها Health Guide، ونبرة الحديث المستخدمة. اقرأها لترى كيف يبقى الإرشاد هادئًا ومحددًا وبلا تهويل.',
      },
    },
    deviceScenarios: {
      labels: {
        description: 'ما أظهرته البيانات:',
        healthGuide: 'شرح Health Guide',
        secondOpinion: 'رأي ثانٍ',
        behavior: 'ما يفعله BioMath Core:',
      },
      categories: {
        cgm: 'الجلوكوز',
        sleep_hrv: 'النوم وتغيّر النبض',
        activity: 'النشاط والحمل',
      },
      general: {
        title: 'كيف نتعامل مع كل سيناريو',
        safeTitle: 'آمن بحكم التصميم:',
        safeBody:
          'لا شيء هنا يسمّي مرضًا ولا يتنبأ بتشخيص. تُوصف الإشارات بوصفها أنماطًا، وأي قراءة خارج النطاق المعتاد سبب للحديث مع مختصّ رعاية صحية، لا خلاصة بحد ذاتها.',
        trendsTitle: 'اتجاهات لا نقاط منفردة:',
        trendsBody:
          'ليلة واحدة مضطربة أو قراءة مرتفعة واحدة لا تغيّر شيئًا. لا يُذكر النمط إلا بعد أن يستمر عدة أيام، فيبقى الإرشاد ثابتًا لا انفعاليًا.',
        termsTitle: 'كلمات نستخدمها',
        terms: [
          'اتجاه',
          'نمط',
          'وجهة التغيّر',
          'نطاقك المعتاد',
          'تعافٍ',
          'حمل',
          'يستحق المتابعة',
          'يستحق مناقشته مع مختصّ',
        ],
        avoidTitle: 'كلمات لا نستخدمها أبدًا',
        avoided: [
          'تشخيص',
          'مرض',
          'حالة مرضية',
          'غير طبيعي',
          'خطير',
          'حرج',
          'علاج',
          'وصفة طبية',
          'شفاء',
        ],
      },
      blocks: {
        cgm: {
          title: 'مستشعرات الجلوكوز المستمرة',
          body: 'يُظهر المستشعر المستمر كيف تشكّل الوجبات والحركة والتوتر والنوم يومك. القيمة في شكل المنحنى: إلى أي ارتفاع يصعد وبأي سرعة يهدأ، لا في رقم منفرد.',
          bullets: [
            'يقارن منحنى كل يوم بخط الأساس الخاص بك في الفترة الأخيرة',
            'يربط الارتفاعات والانخفاضات بالوجبات والحركة والنوم',
            'ينتظر تكرار النمط قبل أن يقترح أي شيء',
            'يوجّهك إلى مختصّ إذا بقيت القراءات خارج نطاقك المعتاد',
          ],
        },
        sleep_hrv: {
          title: 'النوم وتغيّر النبض',
          body: 'يصف عمق النوم وتغيّر معدل ضربات القلب مدى تعافي الجهاز العصبي. ومعًا يفسّران لماذا قد يبدو أسبوع عادي ثقيلًا وأسبوع آخر خفيفًا.',
          bullets: [
            'يتابع توازن النوم العميق ونوم حركة العين السريعة على مدى الأسبوع لا ليلة واحدة',
            'يقرأ تغيّر النبض مقابل خط الأساس الخاص بك، لا مقابل متوسط عام',
            'يقترح أيامًا أخف حين ينخفض التعافي عدة ليالٍ',
            'يؤكد ما ينفع حين يعود التعافي إلى الارتفاع',
          ],
        },
        activity: {
          title: 'النشاط والحمل',
          body: 'الخطوات والتمارين والجهد لا معنى لها إلا بجانب التعافي. الأسبوع التدريبي نفسه قد يكون محفزًا جيدًا أو مبالغًا فيه، بحسب حال لياليك.',
          bullets: [
            'يوازن حمل التدريب مع النوم وتغيّر النبض',
            'ينتبه لتراكم الحمل قبل أن يتحول إلى إرهاق',
            'يتعرّف على الأسبوع المتوازن ويقول ذلك',
            'يبقي الاقتراحات صغيرة: تعديل واحد في كل مرة',
          ],
        },
      },
      cards: {
        glucoseSpike: {
          title: 'ارتفاع حاد بعد الوجبات',
          description:
            'ارتفع الجلوكوز سريعًا بعد الغداء في عدة أيام هذا الأسبوع، واستغرق وقتًا أطول من المعتاد ليعود وينخفض.',
          response:
            'منحنى فترة بعد الظهر يرتفع أسرع من خط الأساس الخاص بك. هذا نمط يستحق الفهم لا تحذيرًا. يؤثر تكوين الوجبة وما يليها معًا؛ فالمشي القصير بعد الأكل كثيرًا ما يجعل هذا المنحنى أكثر انبساطًا. لنتابع الأيام القليلة القادمة معًا.',
          secondOpinion:
            'بقراءة سلوكية، يتبع المنحنى نفسه غالبًا وجبة على عجل أو ليلة قصيرة أو صباحًا متوترًا أكثر مما يتبع الطعام وحده. إذا كان نومك خفيفًا هذا الأسبوع فالاستجابة الأيضية متوقعة، وقد يغيّر إصلاح لياليك المنحنى أكثر من تغيير الطبق.',
        },
        glucoseStable: {
          title: 'منحنى أكثر ثباتًا',
          description:
            'بقي الجلوكوز ضمن نطاق ضيق معظم الأسبوع، مع ارتفاعات لطيفة بعد الوجبات وعودة سلسة.',
          response:
            'كان منحناك هادئًا ويمكن توقّعه؛ الارتفاعات معتدلة والعودة سريعة. أيًا كان إيقاعك مؤخرًا فهو يناسبك. إبقاء الوجبات والحركة على حالها هو أبسط طريقة للحفاظ على ذلك.',
        },
        recoveryDown: {
          title: 'التعافي يتجه إلى الانخفاض',
          description:
            'ظل تغيّر النبض دون نطاقك المعتاد أربع ليالٍ وقصر النوم العميق، مع أن إجمالي الوقت في السرير لم يتغيّر.',
          response:
            'يبدو أن جهازك العصبي يحمل أكثر من المعتاد. الوقت في السرير جيد لكن جودة التعافي تراجعت. هذا أسبوع مناسب لتدريب أخف، ولبدء الاسترخاء مبكرًا، ولتقليل الكافيين المتأخر. وإن استمر أكثر من أسبوع أو أسبوعين فمن المفيد ذكره لمختصّ رعاية صحية.',
          secondOpinion:
            'من زاوية سلوكية، يتبع هذا النمط الحياة أكثر مما يتبع الفسيولوجيا: فترة عمل مرهقة أو أمسيات متأخرة أو سفر. إن وافق ذلك أسبوعك فاعتبر الأرقام إشارة لحماية أمسياتك بضعة أيام، لا علامة على وجود خلل.',
        },
        recoveryUp: {
          title: 'التعافي يعود إلى الارتفاع',
          description:
            'عاد تغيّر النبض إلى نطاقك المعتاد وازداد النوم العميق طولًا خلال الليالي الأخيرة.',
          response:
            'يعود التعافي إلى موضعه المعتاد، وقد ثبت التغيّر عدة ليالٍ، أي أنه تحوّل حقيقي لا تذبذب. ما غيّرته مؤخرًا ينفع؛ والحفاظ على موعد النوم نفسه أسبوعًا آخر هو أسهل طريقة لترسيخه.',
        },
        overload: {
          title: 'الحمل يسبق التعافي',
          description:
            'ارتفع حجم التدريب بحدة هذا الأسبوع بينما بقي النوم كما هو وتراجعت درجات التعافي يومًا بعد يوم.',
          response:
            'أضفت حملًا أسرع مما لحق به تعافيك. لا شيء هنا مقلق؛ إنها ببساطة النقطة التي يتوقف عندها الجهد الإضافي عن الإفادة. جلسة أخف واحدة أو يوم راحة إضافي هذا الأسبوع يعيدان التوازن عادةً.',
        },
        balanced: {
          title: 'الحمل والتعافي متوازنان',
          description:
            'بقي النشاط ثابتًا طوال الأسبوع وظلت درجات التعافي مستقرة إلى جانبه.',
          response:
            'يتحرك حملك وتعافيك معًا، وهذا تحديدًا شكل الأسبوع الذي يمكن الاستمرار عليه. لا شيء يحتاج تعديلًا، وهذه نقطة مرجعية جيدة تتذكرها عند التخطيط للمرحلة التالية.',
        },
        fatigue: {
          title: 'تعب هادئ وغير معتاد',
          description:
            'انخفض النشاط بوضوح عدة أيام، ومعدل ضربات القلب في الراحة أعلى قليلًا من المعتاد، وطال النوم دون إحساس بالراحة.',
          response:
            'يطلب جسدك فترة أبطأ؛ فانخفاض النشاط مع ارتفاع نبض الراحة يعني غالبًا أن التعافي ما زال جاريًا. امنح نفسك بضعة أيام لطيفة وراقب ما إذا استقرت الأمور. وإن استمر التعب أكثر من أسبوعين تقريبًا فمن المفيد مناقشته مع مختصّ رعاية صحية.',
        },
      },
    },
  },

  uk: {
    devicesPage: {
      seo: {
        title: "Під'єднані пристрої — носимі гаджети та сенсори | BioMath Core",
        description:
          'Підключайте годинники, кільця, сенсори глюкози, тонометри та розумні ваги. BioMath Core читає тренди й пояснює їх простою мовою для звітів і Health Guide.',
      },
      badge: 'Носимі пристрої та сенсори',
      title: "Під'єднані пристрої",
      subtitle:
        'Підключайте годинники, кільця, сенсори глюкози та домашні прилади, щоб BioMath Core читав тренди й пояснював їх простою мовою.',
      signalsLabel: 'Сигнали',
      catalogLabel: 'Каталог',
      connectedLabel: 'Ваша техніка',
      connectLabel: 'Підключення',
      filterAll: 'Усі пристрої ({{count}})',
      catalogTitle: 'Усі підтримувані пристрої',
      catalogIntro:
        'Тут перелічені всі пристрої, які можна підключити, — нічого не сховано за фільтром. На кожній картці вказано сигнали, які пристрій зазвичай дає, щоб ви обрали техніку під свої цілі й підключили підтримуваний бренд нижче.',
      hero: {
        ctaCatalog: 'Переглянути всі пристрої',
        ctaConnect: 'Підключити пристрій',
        ctaMember: 'Відкрити Зону учасника',
      },
      live: {
        label: 'Живі сигнали',
        title: 'Ваше тіло цілий день надсилає тихі дані',
        body: 'BioMath Core слухає {{categories}} категорій і {{devices}} пристроїв, доступних для підключення, і перетворює тренди на спокійні практичні поради для звітів і Health Guide.',
        chipSleep: 'Фази сну',
        chipGlucose: 'Крива глюкози',
        chipHrv: 'ВСР і відновлення',
      },
      flow: {
        label: 'Як відбувається підключення',
        title: 'Дозвіл, синхронізація, розуміння',
        body: 'Ви надаєте доступ лише до показників. Тренди потрапляють в особистий контекст звітів і Health Guide — це освітні орієнтири, а не діагноз.',
        steps: {
          authorize: {
            title: 'Дозвольте показники',
            body: 'Оберіть виробника й підтвердьте, які показники здоров’я можна передавати. Ми ніколи не отримуємо логін чи пароль пристрою, а дозвіл можна відкликати будь-коли.',
          },
          sync: {
            title: 'Синхронізація у вашому ритмі',
            body: 'Щодня, кілька разів на день або майже в реальному часі, якщо пристрій це підтримує. Синхронізація працює тихо у фоні, а ритм можна змінити будь-коли.',
          },
          guide: {
            title: 'Поради та звіти',
            body: 'Тренди з’являються у ваших звітах і дають Health Guide контекст для спокійних практичних пропозицій. Усе лишається освітнім — це ніколи не діагноз.',
          },
        },
      },
    },
    deviceEducation: {
      whyDevicesMatter: {
        title: 'Чому підключені пристрої мають значення',
        description:
          'Одне вимірювання — це знімок, а пристрій показує напрям. Коли сон, відновлення, глюкозу та навантаження відстежують тижнями, невеликі зміни стають помітними задовго до того, як перетворяться на скарги, і зазвичай достатньо м’яких коригувань.',
      },
      realTimeBehavior: {
        title: 'Як поводяться дані після підключення пристрою',
        description:
          'Показники надходять у вибраному вами ритмі й порівнюються з вашою власною недавньою базовою лінією, а не із середнім незнайомцем. Ви бачите напрям зміни: покращення, стабільність або поступовий дрейф.',
        continuousMonitoring: {
          title: 'Безперервний огляд:',
          description:
            'Між синхронізаціями нічого не втрачається — дані збираються у фоні й підсумовуються, коли ви відкриваєте BioMath Core, тож нічого не треба записувати вручну.',
        },
      },
      dataInfluenceReports: {
        title: 'Як дані пристроїв формують ваші звіти',
        description:
          'Дозволені показники стають частиною особистого контексту кожного звіту. Замість сирих таблиць ви отримуєте тренд, ймовірні причини та короткий перелік практичних кроків, які справді можна виконати.',
      },
      dataInfluenceAI: {
        title: 'Як дані пристроїв потрапляють у Health Guide',
        description:
          'Health Guide читає ті самі тренди, що й ви, тому відповіді враховують ваш недавній сон, відновлення, активність і глюкозу замість загальних порад. Він пояснює, але не діагностує.',
        secondOpinion: {
          title: 'Друга думка:',
          description:
            'Ті самі сигнали можна прочитати двома способами — фізіологічно та через поведінку й спосіб життя. Бачити обидва погляди допомагає обрати те, що пасує саме цьому тижню, замість приймати один вирок.',
        },
      },
      alertsNudges: {
        title: 'Сповіщення та м’які нагадування',
        description:
          'Сповіщення лишаються рідкісними й спокійними. Ми пишемо, коли тренд тримається кілька днів, а не коли одна ніч виглядає незвично, і кожне повідомлення пояснює значення та наступний крок.',
        positiveReinforcement: {
          title: 'Прогрес теж важливий:',
          description:
            'Покращення відзначаємо так само чітко, як і спади, бо знати, що спрацювало, — найшвидший спосіб це втримати.',
        },
      },
      userSettings: {
        title: 'Ви обираєте, як часто зчитувати дані',
        description:
          'Частоту синхронізації визначаєте ви, окремо для кожного пристрою. Оберіть ритм, що відповідає тому, як ви його носите; змінити можна будь-коли без втрати історії.',
        onlyAtNight: {
          title: 'Лише вночі',
          description:
            'Підходить для кілець і систем сну. Дані зчитуються один раз після ночі, тож день лишається тихим.',
        },
        onlyInTheMorning: {
          title: 'Раз щоранку',
          description:
            'Одне денне зведення сну, відновлення та вчорашнього навантаження. Для більшості людей це найспокійніший варіант.',
        },
        everyFewHours: {
          title: 'Кожні кілька годин',
          description:
            'Корисно в тренувальні періоди або насичені тижні, коли навантаження й відновлення змінюються протягом одного дня.',
        },
        continuously: {
          title: 'Майже в реальному часі',
          description:
            'Для сенсорів безперервного моніторингу глюкози та браслетів відновлення, де форма кривої важливіша за одне денне число.',
        },
        footer:
          'Хоч би що ви обрали, синхронізація зупиняється щойно ви від’єднаєте пристрій, а попередні дані лишаються в історії, доки ви їх не видалите.',
      },
      advancedBehaviorNote: {
        title: 'Кілька слів про межі',
        description:
          'BioMath Core читає те, що повідомляють ваші пристрої, і пояснює це в контексті. Він не керує пристроєм, не замінює клінічне вимірювання й ніколи не ставить діагноз — використовуйте його як підґрунтя для кращої розмови з лікарем.',
      },
      realScenarios: {
        title: 'Який це має вигляд на практиці',
        description:
          'Нижче — щоденні ситуації, побудовані на реальних даних пристроїв: що показали цифри, як їх пояснює Health Guide і якою мовою. Так видно, що поради лишаються спокійними, конкретними й без тривоги.',
      },
    },
    deviceScenarios: {
      labels: {
        description: 'Що показали дані:',
        healthGuide: 'Health Guide пояснює',
        secondOpinion: 'Друга думка',
        behavior: 'Що робить BioMath Core:',
      },
      categories: {
        cgm: 'Глюкоза',
        sleep_hrv: 'Сон і ВСР',
        activity: 'Активність і навантаження',
      },
      general: {
        title: 'Як опрацьовується кожен сценарій',
        safeTitle: 'Безпечно за задумом:',
        safeBody:
          'Тут не називають хвороб і не передбачають діагнозів. Сигнали описані як патерни, а будь-яке значення поза звичним діапазоном — це привід поговорити з лікарем, а не висновок сам по собі.',
        trendsTitle: 'Тренди, а не окремі точки:',
        trendsBody:
          'Одна неспокійна ніч чи одне високе значення нічого не змінюють. Патерн згадується лише тоді, коли тримається кілька днів, тож поради лишаються врівноваженими, а не реактивними.',
        termsTitle: 'Слова, які ми вживаємо',
        terms: [
          'Тренд',
          'Патерн',
          'Напрям зміни',
          'Ваш звичний діапазон',
          'Відновлення',
          'Навантаження',
          'Варто поспостерігати',
          'Варто обговорити з лікарем',
        ],
        avoidTitle: 'Слова, яких ми ніколи не вживаємо',
        avoided: [
          'Діагноз',
          'Хвороба',
          'Патологія',
          'Аномальний',
          'Небезпечний',
          'Критичний',
          'Лікування',
          'Призначення',
          'Зцілення',
        ],
      },
      blocks: {
        cgm: {
          title: 'Сенсори безперервного моніторингу глюкози',
          body: 'Такий сенсор показує, як їжа, рух, стрес і сон формують ваш день. Цінність — у формі кривої: наскільки високо вона піднімається і як швидко заспокоюється, а не в окремому числі.',
          bullets: [
            'Порівнює криву кожного дня з вашою власною недавньою базовою лінією',
            'Пов’язує підйоми та спади з їжею, рухом і сном',
            'Чекає на повторення патерну, перш ніж щось радити',
            'Радить звернутися до лікаря, якщо значення тримаються поза вашим звичним діапазоном',
          ],
        },
        sleep_hrv: {
          title: 'Сон і ВСР',
          body: 'Глибина сну та варіабельність серцевого ритму описують, наскільки добре відновлюється нервова система. Разом вони пояснюють, чому звичайний тиждень може відчуватися важким, а інший — легким.',
          bullets: [
            'Стежить за балансом глибокого та REM-сну протягом тижня, а не за однією ніччю',
            'Читає ВСР відносно вашої базової лінії, а не середнього по популяції',
            'Пропонує легші дні, коли відновлення знижується кілька ночей поспіль',
            'Підтверджує те, що працює, коли відновлення повертається',
          ],
        },
        activity: {
          title: 'Активність і навантаження',
          body: 'Кроки, тренування та зусилля мають сенс лише поруч із відновленням. Той самий тренувальний тиждень може бути добрим стимулом або надмірним — залежно від того, які у вас ночі.',
          bullets: [
            'Урівноважує тренувальне навантаження зі сном і ВСР',
            'Помічає накопичення навантаження, доки воно не стало втомою',
            'Розпізнає добре збалансований тиждень і говорить про це',
            'Тримає поради невеликими: одне коригування за раз',
          ],
        },
      },
      cards: {
        glucoseSpike: {
          title: 'Різкий підйом після їжі',
          description:
            'Цього тижня кілька днів глюкоза швидко зростала після обіду й довше за звичайне поверталася вниз.',
          response:
            'Ваша післяобідня крива піднімається швидше за вашу власну базову лінію. Це патерн, який варто зрозуміти, а не попередження. Важливі і склад страви, і те, що йде після неї: коротка прогулянка після їжі часто згладжує цю криву. Подивімося разом наступні кілька днів.',
          secondOpinion:
            'У поведінковому прочитанні та сама крива частіше йде за поспішним обідом, короткою ніччю чи напруженим ранком, ніж за самою стравою. Якщо цього тижня сон був поверхневим, така метаболічна відповідь очікувана: відновити ночі може змінити криву більше, ніж змінити тарілку.',
        },
        glucoseStable: {
          title: 'Спокійніша крива',
          description:
            'Більшу частину тижня глюкоза трималася у вузькому коридорі з м’якими підйомами після їжі та плавним поверненням.',
          response:
            'Ваша крива спокійна й передбачувана: підйоми помірні, повернення швидке. Хоч би який був ваш ритм останнім часом, він вам підходить. Залишити харчування й рух такими, як є, — найпростіший спосіб це втримати.',
        },
        recoveryDown: {
          title: 'Відновлення йде на спад',
          description:
            'ВСР чотири ночі нижча за ваш звичний діапазон, а глибокий сон скоротився, хоча загальний час у ліжку не змінився.',
          response:
            'Схоже, нервова система несе більше, ніж зазвичай. Часу в ліжку достатньо, але якість відновлення знизилася. Це добрий тиждень для легших тренувань, раннього завершення дня та меншої кількості пізньої кави. Якщо це триває понад тиждень-два, варто згадати про це лікарю.',
          secondOpinion:
            'З поведінкового боку цей патерн частіше йде за життям, а не за фізіологією: напружений період на роботі, пізні вечори чи поїздки. Якщо щось із цього збігається з вашим тижнем, сприймайте цифри як сигнал кілька днів берегти вечори, а не як ознаку, що щось не так.',
        },
        recoveryUp: {
          title: 'Відновлення повертається',
          description:
            'ВСР повернулася до вашого звичного діапазону, а глибокий сон подовжився за останні кілька ночей.',
          response:
            'Відновлення повертається туди, де воно зазвичай буває, і зміна тримається кілька ночей, тож це справжній зсув, а не шум. Те, що ви змінили нещодавно, працює: зберегти той самий час відходу до сну ще тиждень — найлегший спосіб це закріпити.',
        },
        overload: {
          title: 'Навантаження випереджає відновлення',
          description:
            'Цього тижня обсяг тренувань різко зріс, тоді як сон лишився таким самим, а показники відновлення щодня знижувалися.',
          response:
            'Ви додали навантаження швидше, ніж встигало відновлення. Тут немає нічого тривожного — це просто точка, де більші зусилля перестають окупатися. Одне легше заняття або додатковий день відпочинку цього тижня зазвичай відновлюють баланс.',
        },
        balanced: {
          title: 'Навантаження й відновлення врівноважені',
          description:
            'Активність протягом тижня була рівною, і показники відновлення трималися поряд із нею.',
          response:
            'Ваше навантаження й відновлення рухаються разом — саме так виглядає тиждень, який можна витримувати довго. Коригувати нічого не треба: це добрий орієнтир, який варто запам’ятати для наступного циклу.',
        },
        fatigue: {
          title: 'Тиха, незвична втома',
          description:
            'Активність помітно впала на кілька днів, пульс у спокої трохи вищий за звичний, а сон став довшим, але не відновлює.',
          response:
            'Тіло просить повільнішого періоду: менша активність із вищим пульсом у спокої зазвичай означає, що відновлення ще триває. Дайте собі кілька спокійних днів і подивіться, чи все вирівняється. Якщо втома триває понад два тижні, варто обговорити це з лікарем.',
        },
      },
    },
  },

  ru: {
    devicesPage: {
      seo: {
        title: 'Подключённые устройства — носимые гаджеты и сенсоры | BioMath Core',
        description:
          'Подключайте часы, кольца, сенсоры глюкозы, тонометры и умные весы. BioMath Core читает тренды и объясняет их простым языком для отчётов и Health Guide.',
      },
      badge: 'Носимые устройства и сенсоры',
      title: 'Подключённые устройства',
      subtitle:
        'Подключайте часы, кольца, сенсоры глюкозы и домашние приборы, чтобы BioMath Core читал тренды и объяснял их простым языком.',
      signalsLabel: 'Сигналы',
      catalogLabel: 'Каталог',
      connectedLabel: 'Ваша техника',
      connectLabel: 'Подключение',
      filterAll: 'Все устройства ({{count}})',
      catalogTitle: 'Все поддерживаемые устройства',
      catalogIntro:
        'Здесь перечислены все устройства, которые можно подключить, — ничего не спрятано за фильтром. На каждой карточке указаны сигналы, которые устройство обычно даёт, чтобы вы выбрали технику под свои цели и подключили поддерживаемый бренд ниже.',
      hero: {
        ctaCatalog: 'Смотреть все устройства',
        ctaConnect: 'Подключить устройство',
        ctaMember: 'Открыть Зону участника',
      },
      live: {
        label: 'Живые сигналы',
        title: 'Тело весь день посылает тихие данные',
        body: 'BioMath Core слушает {{categories}} категорий и {{devices}} устройств, доступных для подключения, и превращает тренды в спокойные практичные подсказки для отчётов и Health Guide.',
        chipSleep: 'Фазы сна',
        chipGlucose: 'Кривая глюкозы',
        chipHrv: 'ВСР и восстановление',
      },
      flow: {
        label: 'Как проходит подключение',
        title: 'Разрешить, синхронизировать, понять',
        body: 'Вы даёте доступ только к показателям. Тренды попадают в личный контекст отчётов и Health Guide — это образовательные ориентиры, а не диагноз.',
        steps: {
          authorize: {
            title: 'Разрешите показатели',
            body: 'Выберите производителя и подтвердите, какие показатели здоровья можно передавать. Мы никогда не получаем логин и пароль устройства, а доступ можно отозвать в любой момент.',
          },
          sync: {
            title: 'Синхронизация в вашем ритме',
            body: 'Ежедневно, несколько раз в день или почти в реальном времени, если устройство это поддерживает. Синхронизация идёт тихо в фоне, а ритм можно изменить когда угодно.',
          },
          guide: {
            title: 'Подсказки и отчёты',
            body: 'Тренды появляются в отчётах и дают Health Guide контекст для спокойных практичных предложений. Всё остаётся образовательным — это никогда не диагноз.',
          },
        },
      },
    },
    deviceEducation: {
      whyDevicesMatter: {
        title: 'Почему подключённые устройства важны',
        description:
          'Одно измерение — это снимок, а устройство показывает направление. Когда сон, восстановление, глюкозу и нагрузку отслеживают неделями, небольшие сдвиги видны задолго до того, как превратятся в жалобы, и обычно хватает мягких корректировок.',
      },
      realTimeBehavior: {
        title: 'Как ведут себя данные после подключения устройства',
        description:
          'Показатели приходят в выбранном вами ритме и сравниваются с вашей собственной недавней базовой линией, а не со средним незнакомцем. Видно направление изменения: улучшение, стабильность или медленный дрейф.',
        continuousMonitoring: {
          title: 'Непрерывный обзор:',
          description:
            'Между синхронизациями ничего не теряется — данные собираются в фоне и подводятся к итогу, когда вы открываете BioMath Core, так что вручную записывать ничего не нужно.',
        },
      },
      dataInfluenceReports: {
        title: 'Как данные устройств формируют ваши отчёты',
        description:
          'Разрешённые показатели становятся частью личного контекста каждого отчёта. Вместо сырых таблиц вы получаете тренд, вероятные причины и короткий список практичных шагов, которые действительно можно выполнить.',
      },
      dataInfluenceAI: {
        title: 'Как данные устройств попадают в Health Guide',
        description:
          'Health Guide читает те же тренды, что видите вы, поэтому ответы учитывают ваш недавний сон, восстановление, активность и глюкозу, а не общие советы. Он объясняет, но не ставит диагноз.',
        secondOpinion: {
          title: 'Второе мнение:',
          description:
            'Одни и те же сигналы можно прочитать двумя способами — физиологически и через поведение и образ жизни. Увидеть оба взгляда помогает выбрать то, что подходит именно этой неделе, вместо одного вердикта.',
        },
      },
      alertsNudges: {
        title: 'Уведомления и мягкие напоминания',
        description:
          'Уведомления остаются редкими и спокойными. Мы пишем, когда тренд держится несколько дней, а не когда одна ночь выглядит необычно, и каждое сообщение объясняет смысл и следующий шаг.',
        positiveReinforcement: {
          title: 'Прогресс тоже считается:',
          description:
            'Улучшения отмечаем так же ясно, как и спады, потому что знание того, что сработало, — самый быстрый способ это удержать.',
        },
      },
      userSettings: {
        title: 'Вы выбираете, как часто считывать данные',
        description:
          'Частоту синхронизации определяете вы, отдельно для каждого устройства. Выберите ритм под то, как вы его носите; менять можно в любой момент без потери истории.',
        onlyAtNight: {
          title: 'Только ночью',
          description:
            'Подходит для колец и систем сна. Данные считываются один раз после ночи, и день остаётся тихим.',
        },
        onlyInTheMorning: {
          title: 'Раз каждое утро',
          description:
            'Одна дневная сводка сна, восстановления и вчерашней нагрузки. Для большинства это самый спокойный вариант.',
        },
        everyFewHours: {
          title: 'Каждые несколько часов',
          description:
            'Полезно в тренировочные периоды или насыщенные недели, когда нагрузка и восстановление меняются внутри одного дня.',
        },
        continuously: {
          title: 'Почти в реальном времени',
          description:
            'Для сенсоров непрерывного мониторинга глюкозы и браслетов восстановления, где форма кривой важнее одного дневного числа.',
        },
        footer:
          'Что бы вы ни выбрали, синхронизация останавливается в момент отключения устройства, а прежние данные остаются в истории, пока вы их не удалите.',
      },
      advancedBehaviorNote: {
        title: 'Несколько слов о границах',
        description:
          'BioMath Core читает то, что сообщают ваши устройства, и объясняет это в контексте. Он не управляет устройством, не заменяет клиническое измерение и никогда не ставит диагноз — используйте его как основу для более содержательного разговора с врачом.',
      },
      realScenarios: {
        title: 'Как это выглядит на практике',
        description:
          'Ниже — повседневные ситуации на основе реальных данных устройств: что показали цифры, как их объясняет Health Guide и каким языком. По ним видно, что подсказки остаются спокойными, конкретными и без тревоги.',
      },
    },
    deviceScenarios: {
      labels: {
        description: 'Что показали данные:',
        healthGuide: 'Health Guide объясняет',
        secondOpinion: 'Второе мнение',
        behavior: 'Что делает BioMath Core:',
      },
      categories: {
        cgm: 'Глюкоза',
        sleep_hrv: 'Сон и ВСР',
        activity: 'Активность и нагрузка',
      },
      general: {
        title: 'Как разбирается каждый сценарий',
        safeTitle: 'Безопасно по замыслу:',
        safeBody:
          'Здесь не называют болезней и не предсказывают диагнозов. Сигналы описаны как паттерны, а любое значение вне привычного диапазона — повод поговорить с врачом, а не вывод сам по себе.',
        trendsTitle: 'Тренды, а не отдельные точки:',
        trendsBody:
          'Одна беспокойная ночь или одно высокое значение ничего не меняют. Паттерн упоминается только тогда, когда держится несколько дней, поэтому подсказки остаются ровными, а не реактивными.',
        termsTitle: 'Слова, которые мы используем',
        terms: [
          'Тренд',
          'Паттерн',
          'Направление изменения',
          'Ваш привычный диапазон',
          'Восстановление',
          'Нагрузка',
          'Стоит понаблюдать',
          'Стоит обсудить с врачом',
        ],
        avoidTitle: 'Слова, которые мы никогда не используем',
        avoided: [
          'Диагноз',
          'Болезнь',
          'Патология',
          'Аномальный',
          'Опасный',
          'Критический',
          'Лечение',
          'Назначение',
          'Излечение',
        ],
      },
      blocks: {
        cgm: {
          title: 'Сенсоры непрерывного мониторинга глюкозы',
          body: 'Такой сенсор показывает, как еда, движение, стресс и сон формируют ваш день. Ценность — в форме кривой: насколько высоко она поднимается и как быстро успокаивается, а не в отдельном числе.',
          bullets: [
            'Сравнивает кривую каждого дня с вашей собственной недавней базовой линией',
            'Связывает подъёмы и спады с едой, движением и сном',
            'Ждёт повторения паттерна, прежде чем что-то советовать',
            'Направляет к врачу, если значения держатся вне вашего привычного диапазона',
          ],
        },
        sleep_hrv: {
          title: 'Сон и ВСР',
          body: 'Глубина сна и вариабельность сердечного ритма описывают, насколько хорошо восстанавливается нервная система. Вместе они объясняют, почему обычная неделя может ощущаться тяжёлой, а другая — лёгкой.',
          bullets: [
            'Следит за балансом глубокого и REM-сна в течение недели, а не за одной ночью',
            'Читает ВСР относительно вашей базовой линии, а не среднего по популяции',
            'Предлагает более лёгкие дни, когда восстановление падает несколько ночей подряд',
            'Подтверждает то, что работает, когда восстановление возвращается',
          ],
        },
        activity: {
          title: 'Активность и нагрузка',
          body: 'Шаги, тренировки и усилие имеют смысл только рядом с восстановлением. Одна и та же тренировочная неделя может быть хорошим стимулом или перебором — в зависимости от того, какими были ваши ночи.',
          bullets: [
            'Уравновешивает тренировочную нагрузку со сном и ВСР',
            'Замечает накопление нагрузки, пока оно не стало усталостью',
            'Распознаёт хорошо сбалансированную неделю и говорит об этом',
            'Держит подсказки небольшими: одно изменение за раз',
          ],
        },
      },
      cards: {
        glucoseSpike: {
          title: 'Резкий подъём после еды',
          description:
            'На этой неделе несколько дней глюкоза быстро росла после обеда и дольше обычного возвращалась вниз.',
          response:
            'Ваша послеобеденная кривая поднимается быстрее вашей собственной базовой линии. Это паттерн, который стоит понять, а не предупреждение. Важны и состав блюда, и то, что идёт после него: короткая прогулка после еды часто сглаживает эту кривую. Посмотрим вместе на ближайшие несколько дней.',
          secondOpinion:
            'В поведенческом прочтении та же кривая чаще следует за торопливым обедом, короткой ночью или напряжённым утром, чем за самой едой. Если сон на этой неделе был поверхностным, такой метаболический ответ ожидаем: восстановить ночи может изменить кривую сильнее, чем изменить тарелку.',
        },
        glucoseStable: {
          title: 'Более ровная кривая',
          description:
            'Большую часть недели глюкоза держалась в узком коридоре с мягкими подъёмами после еды и плавным возвращением.',
          response:
            'Ваша кривая спокойна и предсказуема: подъёмы умеренные, возвращение быстрое. Каким бы ни был ваш ритм в последнее время, он вам подходит. Оставить питание и движение как есть — самый простой способ это удержать.',
        },
        recoveryDown: {
          title: 'Восстановление идёт на спад',
          description:
            'ВСР четыре ночи ниже вашего привычного диапазона, а глубокий сон стал короче, хотя общее время в постели не изменилось.',
          response:
            'Похоже, нервная система несёт больше обычного. Времени в постели достаточно, но качество восстановления снизилось. Это хорошая неделя для более лёгких тренировок, раннего завершения дня и меньшего количества позднего кофеина. Если это держится дольше недели-двух, стоит сказать об этом врачу.',
          secondOpinion:
            'С поведенческой стороны этот паттерн чаще следует за жизнью, а не за физиологией: напряжённый период на работе, поздние вечера или поездки. Если что-то из этого совпадает с вашей неделей, воспринимайте цифры как сигнал несколько дней беречь вечера, а не как признак, что что-то не так.',
        },
        recoveryUp: {
          title: 'Восстановление возвращается',
          description:
            'ВСР вернулась в ваш привычный диапазон, а глубокий сон стал длиннее за последние несколько ночей.',
          response:
            'Восстановление возвращается туда, где обычно находится, и изменение держится несколько ночей — значит, это настоящий сдвиг, а не шум. То, что вы изменили недавно, работает: сохранить то же время отхода ко сну ещё неделю — самый простой способ это закрепить.',
        },
        overload: {
          title: 'Нагрузка обгоняет восстановление',
          description:
            'На этой неделе объём тренировок резко вырос, сон остался прежним, а показатели восстановления снижались день за днём.',
          response:
            'Вы добавили нагрузку быстрее, чем успевало восстановление. Ничего тревожного здесь нет — это просто точка, где дополнительные усилия перестают окупаться. Одно более лёгкое занятие или дополнительный день отдыха на этой неделе обычно возвращают баланс.',
        },
        balanced: {
          title: 'Нагрузка и восстановление совпадают',
          description:
            'Активность держалась ровно всю неделю, и показатели восстановления оставались стабильными рядом с ней.',
          response:
            'Ваша нагрузка и восстановление движутся вместе — именно так выглядит неделя, которую можно выдерживать долго. Менять ничего не нужно: это хороший ориентир, который стоит запомнить при планировании следующего цикла.',
        },
        fatigue: {
          title: 'Тихая, непривычная усталость',
          description:
            'Активность заметно упала на несколько дней, пульс покоя немного выше обычного, а сон стал дольше, но не восстанавливает.',
          response:
            'Тело просит более медленного периода: меньшая активность при более высоком пульсе покоя обычно означает, что восстановление ещё идёт. Дайте себе несколько спокойных дней и посмотрите, выровняется ли всё. Если усталость держится дольше пары недель, это стоит обсудить с врачом.',
        },
      },
    },
  },
};

let changed = 0;
for (const lang of LOCALES) {
  const file = join(localesDir, lang, 'devices.json');
  const current = JSON.parse(readFileSync(file, 'utf8'));
  mergeDeep(current, PATCHES[lang]);
  writeFileSync(file, `${JSON.stringify(current, null, 2)}\n`, 'utf8');
  changed += 1;
  console.log(`updated src/locales/${lang}/devices.json`);
}

console.log(`\nDone — ${changed} locale packs updated.`);
