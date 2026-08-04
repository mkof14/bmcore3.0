#!/usr/bin/env node
/**
 * Expand device + health-record content across all 10 locales.
 *
 * Touches four packs per language: faq, learning, howItWorks, member.
 * Re-runnable: sections and appended FAQ items are rebuilt, never duplicated.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const LANGS = ['en', 'es', 'fr', 'de', 'ja', 'he', 'zh', 'ar', 'uk', 'ru'];
const localesDir = join(process.cwd(), 'src/locales');

const DEVICE_FAQ_IDS = [
  'supported-devices',
  'device-categories',
  'connect-device',
  'what-data-flows',
  'feeds-health-guide',
  'store-data',
  'syncing-stops',
  'disable-sharing',
];

const RECORD_FAQ_IDS = [
  'upload-labs-dna',
  'supported-formats',
  'scan-camera',
  'how-insights-work',
  'copy-print-insights',
  'feeds-reports-guide',
  'voice-health-guide',
  'dna-privacy',
];

/** Catalog ids shown in Member Zone; `cgm` stays as a legacy alias for older rows. */
const DEVICE_TYPES = {
  apple_watch: 'Apple Watch',
  samsung_galaxy_watch: 'Samsung Galaxy Watch',
  garmin: 'Garmin',
  google_pixel_watch: 'Google Pixel Watch',
  fitbit: 'Fitbit',
  polar: 'Polar',
  oura: 'Oura Ring',
  ultrahuman: 'Ultrahuman Ring',
  whoop: 'WHOOP',
  dexcom_g7: 'Dexcom G7',
  freestyle_libre: 'FreeStyle Libre',
  omron: 'Omron',
  withings_bpm: 'Withings BPM',
  withings_body: 'Withings Body+',
  eight_sleep: 'Eight Sleep',
  cgm: 'CGM (Dexcom/Libre)',
};

const WATCH_BRANDS = ['Apple Watch', 'Samsung Galaxy Watch', 'Garmin', 'Google Pixel Watch', 'Fitbit', 'Polar'];
const RING_BRANDS = ['Oura Ring', 'Ultrahuman Ring', 'WHOOP'];
const SENSOR_BRANDS = ['Dexcom G7', 'FreeStyle Libre', 'Omron', 'Withings BPM', 'Withings Body+', 'Eight Sleep'];

const SEPARATORS = { ja: '、', zh: '、', ar: '، ' };

function brandList(lang, brands) {
  return brands.join(SEPARATORS[lang] || ', ');
}

/** Shared nouns per language so every string uses the same in-product wording. */
const TERMS = {
  en: {
    zone: 'Member Zone',
    dev: 'Connected Devices',
    rec: 'Health Records & DNA',
    cats:
      'smartwatches (Apple Watch, Samsung Galaxy Watch, Garmin, Google Pixel Watch, Fitbit, Polar), smart rings (Oura Ring, Ultrahuman Ring), recovery bands (WHOOP), continuous glucose sensors (Dexcom G7, FreeStyle Libre), blood pressure monitors (Omron, Withings BPM), smart scales (Withings Body+), and home sleep systems (Eight Sleep)',
    catsShort:
      'smartwatches, smart rings, recovery bands, continuous glucose sensors, blood pressure monitors, smart scales, and home sleep systems',
  },
  es: {
    zone: 'Zona de Miembros',
    dev: 'Dispositivos conectados',
    rec: 'Historial de salud y ADN',
    cats:
      'smartwatches (Apple Watch, Samsung Galaxy Watch, Garmin, Google Pixel Watch, Fitbit, Polar), anillos inteligentes (Oura Ring, Ultrahuman Ring), bandas de recuperación (WHOOP), sensores de glucosa continua (Dexcom G7, FreeStyle Libre), monitores de presión arterial (Omron, Withings BPM), básculas inteligentes (Withings Body+) y sistemas de sueño en casa (Eight Sleep)',
    catsShort:
      'smartwatches, anillos inteligentes, bandas de recuperación, sensores de glucosa continua, monitores de presión arterial, básculas inteligentes y sistemas de sueño en casa',
  },
  fr: {
    zone: 'Espace Membre',
    dev: 'Appareils connectés',
    rec: 'Dossiers santé & ADN',
    cats:
      'montres connectées (Apple Watch, Samsung Galaxy Watch, Garmin, Google Pixel Watch, Fitbit, Polar), bagues intelligentes (Oura Ring, Ultrahuman Ring), bracelets de récupération (WHOOP), capteurs de glucose en continu (Dexcom G7, FreeStyle Libre), tensiomètres (Omron, Withings BPM), balances connectées (Withings Body+) et systèmes de sommeil à domicile (Eight Sleep)',
    catsShort:
      'montres connectées, bagues intelligentes, bracelets de récupération, capteurs de glucose en continu, tensiomètres, balances connectées et systèmes de sommeil à domicile',
  },
  de: {
    zone: 'Mitgliederbereich',
    dev: 'Verbundene Geräte',
    rec: 'Gesundheitsakten & DNA',
    cats:
      'Smartwatches (Apple Watch, Samsung Galaxy Watch, Garmin, Google Pixel Watch, Fitbit, Polar), Smart Rings (Oura Ring, Ultrahuman Ring), Erholungsbänder (WHOOP), Sensoren für kontinuierliche Glukose (Dexcom G7, FreeStyle Libre), Blutdruckmessgeräte (Omron, Withings BPM), smarte Waagen (Withings Body+) und Heim-Schlafsysteme (Eight Sleep)',
    catsShort:
      'Smartwatches, Smart Rings, Erholungsbänder, Sensoren für kontinuierliche Glukose, Blutdruckmessgeräte, smarte Waagen und Heim-Schlafsysteme',
  },
  ja: {
    zone: 'メンバーゾーン',
    dev: '接続済みデバイス',
    rec: '健康記録とDNA',
    cats:
      'スマートウォッチ（Apple Watch、Samsung Galaxy Watch、Garmin、Google Pixel Watch、Fitbit、Polar）、スマートリング（Oura Ring、Ultrahuman Ring）、リカバリーバンド（WHOOP）、持続血糖センサー（Dexcom G7、FreeStyle Libre）、血圧計（Omron、Withings BPM）、スマートスケール（Withings Body+）、家庭用睡眠システム（Eight Sleep）',
    catsShort:
      'スマートウォッチ、スマートリング、リカバリーバンド、持続血糖センサー、血圧計、スマートスケール、家庭用睡眠システム',
  },
  he: {
    zone: 'אזור החברים',
    dev: 'מכשירים מחוברים',
    rec: 'רשומות בריאות ו־DNA',
    cats:
      'שעונים חכמים (Apple Watch, Samsung Galaxy Watch, Garmin, Google Pixel Watch, Fitbit, Polar), טבעות חכמות (Oura Ring, Ultrahuman Ring), סרטי התאוששות (WHOOP), חיישני סוכר רציף (Dexcom G7, FreeStyle Libre), מדדי לחץ דם (Omron, Withings BPM), משקלים חכמים (Withings Body+) ומערכות שינה ביתיות (Eight Sleep)',
    catsShort:
      'שעונים חכמים, טבעות חכמות, סרטי התאוששות, חיישני סוכר רציף, מדדי לחץ דם, משקלים חכמים ומערכות שינה ביתיות',
  },
  zh: {
    zone: '会员专区',
    dev: '已连接设备',
    rec: '健康档案与DNA',
    cats:
      '智能手表（Apple Watch、Samsung Galaxy Watch、Garmin、Google Pixel Watch、Fitbit、Polar）、智能戒指（Oura Ring、Ultrahuman Ring）、恢复手环（WHOOP）、连续血糖传感器（Dexcom G7、FreeStyle Libre）、血压计（Omron、Withings BPM）、智能秤（Withings Body+）和居家睡眠系统（Eight Sleep）',
    catsShort: '智能手表、智能戒指、恢复手环、连续血糖传感器、血压计、智能秤和居家睡眠系统',
  },
  ar: {
    zone: 'منطقة الأعضاء',
    dev: 'الأجهزة المتصلة',
    rec: 'السجلات الصحية والحمض النووي',
    cats:
      'ساعات ذكية (Apple Watch، Samsung Galaxy Watch، Garmin، Google Pixel Watch، Fitbit، Polar)، وخواتم ذكية (Oura Ring، Ultrahuman Ring)، وأساور تعافٍ (WHOOP)، ومستشعرات جلوكوز مستمر (Dexcom G7، FreeStyle Libre)، وأجهزة ضغط الدم (Omron، Withings BPM)، وموازين ذكية (Withings Body+)، وأنظمة نوم منزلية (Eight Sleep)',
    catsShort:
      'ساعات ذكية، وخواتم ذكية، وأساور تعافٍ، ومستشعرات جلوكوز مستمر، وأجهزة ضغط الدم، وموازين ذكية، وأنظمة نوم منزلية',
  },
  uk: {
    zone: 'Зона учасника',
    dev: 'Підключені пристрої',
    rec: 'Медкарта та ДНК',
    cats:
      'розумні годинники (Apple Watch, Samsung Galaxy Watch, Garmin, Google Pixel Watch, Fitbit, Polar), розумні кільця (Oura Ring, Ultrahuman Ring), браслети відновлення (WHOOP), сенсори безперервної глюкози (Dexcom G7, FreeStyle Libre), монітори тиску (Omron, Withings BPM), розумні ваги (Withings Body+) та домашні системи сну (Eight Sleep)',
    catsShort:
      'розумні годинники, розумні кільця, браслети відновлення, сенсори безперервної глюкози, монітори тиску, розумні ваги та домашні системи сну',
  },
  ru: {
    zone: 'Зона участника',
    dev: 'Подключённые устройства',
    rec: 'Медкарта и ДНК',
    cats:
      'умные часы (Apple Watch, Samsung Galaxy Watch, Garmin, Google Pixel Watch, Fitbit, Polar), умные кольца (Oura Ring, Ultrahuman Ring), браслеты восстановления (WHOOP), сенсоры непрерывной глюкозы (Dexcom G7, FreeStyle Libre), тонометры (Omron, Withings BPM), умные весы (Withings Body+) и домашние системы сна (Eight Sleep)',
    catsShort:
      'умные часы, умные кольца, браслеты восстановления, сенсоры непрерывной глюкозы, тонометры, умные весы и домашние системы сна',
  },
};

const CONTENT = {
  en: (T) => ({
    faqDevices: {
      title: 'Devices & monitoring',
      items: [
        {
          question: 'Which devices are supported?',
          answer: `Seven categories: ${T.cats}.`,
        },
        {
          question: 'What do the device categories cover?',
          answer:
            'Smartwatches give all-day heart rate, sleep, and activity, and often ECG or SpO₂. Smart rings track sleep, HRV, and temperature around the clock. Recovery bands focus on strain and readiness. Continuous glucose sensors show day-long glucose curves. Blood pressure monitors and smart scales add reliable readings at home. Home sleep systems capture overnight vitals without anything on your wrist.',
        },
        {
          question: 'How do I connect a device?',
          answer: `Open ${T.zone} → ${T.dev}, choose your brand, and follow the guided authorization flow. Each connection is a step-by-step consent screen, and you can add or remove devices at any time.`,
        },
        {
          question: 'What data flows in after I connect?',
          answer:
            'Only the metrics you authorize: heart rate and HRV, sleep stages, activity and strain, SpO₂, temperature, glucose, blood pressure, weight, and body composition. Updates arrive on the schedule you choose, and near real-time where the brand supports it.',
        },
        {
          question: 'How do devices feed reports and Health Guide?',
          answer:
            'Interpreted trends from your devices become part of your Human Data Model, so reports and Health Guide can explain patterns in plain language. Guidance stays educational and is not a diagnosis.',
        },
        {
          question: 'Do you store raw health data?',
          answer:
            'No. We interpret metrics and keep the trends that matter — we do not need to store raw sensor streams.',
        },
        {
          question: 'What if syncing stops?',
          answer: `You'll see a reminder in ${T.dev} when a link expires or a token needs renewal, and you can reconnect in one click. Earlier data stays in place.`,
        },
        {
          question: 'Can I disable data sharing?',
          answer:
            'Yes — instantly. Disconnect a single device or turn off sharing for all of them in settings; new readings stop right away.',
        },
      ],
    },
    faqRecords: {
      title: 'Health records & DNA',
      items: [
        {
          question: 'Can I upload lab tests and DNA data?',
          answer: `Yes. In ${T.zone} → ${T.rec} you can upload or scan labs, imaging, DNA report PDFs, and raw DNA files. They become part of your health profile alongside the questionnaire and your connected devices.`,
        },
        {
          question: 'Which file formats are supported?',
          answer:
            'PDF, JPG, PNG, WEBP, CSV, TXT, VCF, and common raw DNA text exports (including 23andMe- or Ancestry-style files).',
        },
        {
          question: 'Can I scan a paper result with my camera?',
          answer:
            'Yes. On mobile you can capture a page directly with the camera when the browser allows it — handy for printed lab sheets. Take one photo per page and choose the record type before saving.',
        },
        {
          question: 'What happens after I upload a file?',
          answer:
            'Each item moves from Received to In review to Insights ready. When ready you get an educational explanation, conclusions, and recommendations. This is structured intake with insight templates — not a full genomic analysis pipeline.',
        },
        {
          question: 'Can I copy, print, or save an insight?',
          answer:
            'Yes. Every ready insight has Copy, Print, and Download TXT, so you can keep a copy or bring it to an appointment.',
        },
        {
          question: 'How do uploads affect reports and Health Guide?',
          answer:
            'Uploads contribute high-level personal context: counts by type, whether DNA is on file, and the latest lab date. Reports and Health Guide use those signals together with your questionnaire and device trends. Full raw DNA content is never pasted into AI prompts.',
        },
        {
          question: 'Can I ask Health Guide about a record out loud?',
          answer:
            'Yes. Select a record and ask Health Guide about it by text or voice. Answers come back in plain language, which helps when your hands are busy.',
        },
        {
          question: 'Is raw DNA kept private from AI prompts?',
          answer:
            'Yes. Health Guide and report prefaces only receive a yes/no “raw DNA on file” flag plus educational templates — never the full genetic file.',
        },
      ],
    },
    learning: {
      healthRecordsBody: `In ${T.zone} → ${T.rec} you can upload or scan labs, imaging, DNA report PDFs, and raw DNA files (PDF, images, CSV, TXT, VCF). On mobile you can capture a printed page with the camera. Files move from Received to In review to Insights ready. Insights explain the record, list conclusions and recommendations, and stay educational — not a diagnosis. You can Copy, Print, or Download TXT any ready insight, or ask Health Guide about the selected record by text or voice. Counts and a DNA-on-file flag feed personal context for reports and Health Guide; raw DNA content is never pasted into AI prompts.`,
      devicesTitle: T.dev,
      devicesBody: `${T.zone} → ${T.dev} covers seven categories: ${T.cats}. You authorize each brand yourself, and only the metrics you approve sync — on the schedule you choose, near real-time where the brand supports it. Interpreted trends feed your reports and let Health Guide explain patterns in plain language; raw sensor streams are not stored.`,
      openDevices: `Open ${T.dev} →`,
    },
    howItWorks: {
      connectTitle: 'Connect your health devices',
      connectSummary: `BioMath Core links with the devices people actually wear: ${T.catsShort}. You can also bring labs and DNA into ${T.zone} the same way you complete the questionnaire.`,
      connectPointsHeading: 'Seven device categories',
      connectPoints: [
        { title: 'Watches & bands', body: brandList('en', WATCH_BRANDS) },
        { title: 'Rings & recovery', body: brandList('en', RING_BRANDS) },
        { title: 'Sensors & home devices', body: brandList('en', SENSOR_BRANDS) },
        { title: 'Labs & DNA', body: `Upload or scan labs, imaging, DNA reports, and raw DNA in ${T.rec}` },
      ],
      connectChecklist: [
        `Guided authorization in ${T.zone} → ${T.dev}`,
        'Metrics you approve sync on the schedule you choose — near real-time where the brand supports it',
        'Manual upload or camera scan for labs, imaging, DNA reports, and raw DNA files',
      ],
      recordsSummary: `${T.rec} in ${T.zone} accepts PDF, images, CSV, TXT, and VCF. We structure each upload, return educational insights you can Copy, Print, or Download, and link high-level signals (not raw DNA content) into reports and Health Guide.`,
      recordsLastCheck:
        'Ask Health Guide about the selected record by text or voice for a plain-language explanation',
      faqItems: [
        {
          question: 'Which device categories can I connect?',
          answer: `Seven: ${T.cats}. You authorize each brand yourself, and only the metrics you approve sync.`,
        },
        {
          question: 'How do lab results and DNA files work with Health Guide?',
          answer: `Upload or scan them in ${T.rec}. Each record returns an educational insight you can Copy, Print, or Download, and you can ask Health Guide about it by text or voice. Health Guide receives high-level context only — counts, the latest lab date, and a yes/no DNA-on-file flag — never your raw genetic file.`,
        },
      ],
    },
    member: {
      catalogNote: `All supported categories are listed here: ${T.catsShort}.`,
      emptyBody:
        'Connect a smartwatch, smart ring, recovery band, glucose sensor, blood pressure monitor, smart scale, or home sleep system to start tracking health data automatically.',
    },
  }),

  es: (T) => ({
    faqDevices: {
      title: 'Dispositivos y monitorización',
      items: [
        {
          question: '¿Qué dispositivos son compatibles?',
          answer: `Siete categorías: ${T.cats}.`,
        },
        {
          question: '¿Qué mide cada categoría de dispositivos?',
          answer:
            'Los smartwatches registran frecuencia cardíaca todo el día, sueño y actividad, y a menudo ECG o SpO₂. Los anillos inteligentes siguen sueño, VFC y temperatura las 24 horas. Las bandas de recuperación se centran en la carga y la disposición para entrenar. Los sensores de glucosa continua muestran curvas de glucosa a lo largo del día. Los monitores de presión arterial y las básculas inteligentes añaden mediciones fiables en casa. Los sistemas de sueño en casa captan constantes nocturnas sin llevar nada en la muñeca.',
        },
        {
          question: '¿Cómo conecto un dispositivo?',
          answer: `Abre ${T.zone} → ${T.dev}, elige tu marca y sigue el flujo de autorización guiado. Cada conexión es una pantalla de consentimiento paso a paso, y puedes añadir o quitar dispositivos cuando quieras.`,
        },
        {
          question: '¿Qué datos llegan después de conectar?',
          answer:
            'Solo las métricas que autorizas: frecuencia cardíaca y VFC, fases del sueño, actividad y carga, SpO₂, temperatura, glucosa, presión arterial, peso y composición corporal. Las actualizaciones llegan con la frecuencia que elijas y casi en tiempo real cuando la marca lo permite.',
        },
        {
          question: '¿Cómo alimentan los dispositivos los informes y Health Guide?',
          answer:
            'Las tendencias interpretadas de tus dispositivos pasan a formar parte de tu Human Data Model, para que los informes y Health Guide expliquen los patrones en lenguaje claro. La orientación es educativa y no es un diagnóstico.',
        },
        {
          question: '¿Guardan datos de salud sin procesar?',
          answer:
            'No. Interpretamos las métricas y conservamos las tendencias que importan: no necesitamos almacenar los flujos de sensores sin procesar.',
        },
        {
          question: '¿Y si se detiene la sincronización?',
          answer: `Verás un aviso en ${T.dev} cuando un enlace caduque o haya que renovar un token, y podrás reconectar en un clic. Los datos anteriores se mantienen.`,
        },
        {
          question: '¿Puedo desactivar el envío de datos?',
          answer:
            'Sí, al instante. Desconecta un dispositivo concreto o desactiva el envío de todos en los ajustes; las nuevas lecturas se detienen de inmediato.',
        },
      ],
    },
    faqRecords: {
      title: 'Historial de salud y ADN',
      items: [
        {
          question: '¿Puedo subir análisis y datos de ADN?',
          answer: `Sí. En ${T.zone} → ${T.rec} puedes subir o escanear análisis, imágenes, PDF de informes de ADN y archivos de ADN sin procesar. Pasan a formar parte de tu perfil junto al cuestionario y tus dispositivos conectados.`,
        },
        {
          question: '¿Qué formatos de archivo se admiten?',
          answer:
            'PDF, JPG, PNG, WEBP, CSV, TXT, VCF y las exportaciones de texto de ADN sin procesar más habituales (incluido el estilo 23andMe o Ancestry).',
        },
        {
          question: '¿Puedo escanear un resultado en papel con la cámara?',
          answer:
            'Sí. En el móvil puedes fotografiar una página directamente con la cámara cuando el navegador lo permite, práctico para hojas de laboratorio impresas. Haz una foto por página y elige el tipo de registro antes de guardar.',
        },
        {
          question: '¿Qué ocurre después de subir un archivo?',
          answer:
            'Cada elemento pasa de Recibido a En revisión y a Insights listos. Cuando está listo recibes una explicación educativa, conclusiones y recomendaciones. Es una recepción estructurada con plantillas de insights, no un análisis genómico completo.',
        },
        {
          question: '¿Puedo copiar, imprimir o guardar un insight?',
          answer:
            'Sí. Cada insight listo tiene Copiar, Imprimir y Descargar TXT, para guardar una copia o llevarla a la consulta.',
        },
        {
          question: '¿Cómo influyen las subidas en los informes y Health Guide?',
          answer:
            'Las subidas aportan contexto personal de alto nivel: recuentos por tipo, si hay ADN archivado y la fecha del último análisis. Los informes y Health Guide usan esas señales junto con tu cuestionario y las tendencias de tus dispositivos. El contenido completo del ADN sin procesar nunca se pega en los prompts de IA.',
        },
        {
          question: '¿Puedo preguntar a Health Guide sobre un registro por voz?',
          answer:
            'Sí. Selecciona un registro y pregunta a Health Guide por texto o por voz. Las respuestas llegan en lenguaje claro, útil cuando quieres una explicación con las manos ocupadas.',
        },
        {
          question: '¿El ADN sin procesar queda fuera de los prompts de IA?',
          answer:
            'Sí. Health Guide y los prefacios de los informes solo reciben un indicador sí/no de «ADN sin procesar archivado» y plantillas educativas, nunca el archivo genético completo.',
        },
      ],
    },
    learning: {
      healthRecordsBody: `En ${T.zone} → ${T.rec} puedes subir o escanear análisis, imágenes, PDF de informes de ADN y archivos de ADN sin procesar (PDF, imágenes, CSV, TXT, VCF). En el móvil puedes fotografiar una hoja impresa con la cámara. Los archivos pasan de Recibido a En revisión y a Insights listos. Los insights explican el registro, enumeran conclusiones y recomendaciones y son educativos, no un diagnóstico. Puedes Copiar, Imprimir o Descargar TXT cualquier insight listo, o preguntar a Health Guide sobre el registro seleccionado por texto o voz. Los recuentos y el indicador de ADN archivado aportan contexto personal a los informes y a Health Guide; el contenido del ADN sin procesar nunca se pega en los prompts de IA.`,
      devicesTitle: T.dev,
      devicesBody: `${T.zone} → ${T.dev} cubre siete categorías: ${T.cats}. Tú autorizas cada marca y solo se sincronizan las métricas que apruebas, con la frecuencia que elijas y casi en tiempo real cuando la marca lo permite. Las tendencias interpretadas alimentan tus informes y permiten que Health Guide explique los patrones en lenguaje claro; los flujos de sensores sin procesar no se almacenan.`,
      openDevices: `Abrir ${T.dev} →`,
    },
    howItWorks: {
      connectTitle: 'Conecta tus dispositivos de salud',
      connectSummary: `BioMath Core se conecta con los dispositivos que la gente usa de verdad: ${T.catsShort}. También puedes añadir análisis y ADN en la ${T.zone} igual que completas el cuestionario.`,
      connectPointsHeading: 'Siete categorías de dispositivos',
      connectPoints: [
        { title: 'Relojes y pulseras', body: brandList('es', WATCH_BRANDS) },
        { title: 'Anillos y recuperación', body: brandList('es', RING_BRANDS) },
        { title: 'Sensores y dispositivos del hogar', body: brandList('es', SENSOR_BRANDS) },
        {
          title: 'Análisis y ADN',
          body: `Sube o escanea análisis, imágenes, informes de ADN y ADN sin procesar en ${T.rec}`,
        },
      ],
      connectChecklist: [
        `Autorización guiada en ${T.zone} → ${T.dev}`,
        'Las métricas que apruebas se sincronizan con la frecuencia que elijas, casi en tiempo real cuando la marca lo permite',
        'Subida manual o escaneo con cámara para análisis, imágenes, informes de ADN y archivos de ADN sin procesar',
      ],
      recordsSummary: `${T.rec} en la ${T.zone} acepta PDF, imágenes, CSV, TXT y VCF. Estructuramos cada subida, devolvemos insights educativos que puedes Copiar, Imprimir o Descargar, y vinculamos señales de alto nivel (no el contenido del ADN sin procesar) a los informes y a Health Guide.`,
      recordsLastCheck:
        'Pregunta a Health Guide sobre el registro seleccionado por texto o voz para una explicación en lenguaje claro',
      faqItems: [
        {
          question: '¿Qué categorías de dispositivos puedo conectar?',
          answer: `Siete: ${T.cats}. Tú autorizas cada marca y solo se sincronizan las métricas que apruebas.`,
        },
        {
          question: '¿Cómo funcionan los análisis y el ADN con Health Guide?',
          answer: `Súbelos o escanéalos en ${T.rec}. Cada registro devuelve un insight educativo que puedes Copiar, Imprimir o Descargar, y puedes preguntar por él a Health Guide por texto o voz. Health Guide solo recibe contexto de alto nivel —recuentos, la fecha del último análisis y un indicador sí/no de ADN archivado—, nunca tu archivo genético completo.`,
        },
      ],
    },
    member: {
      catalogNote: `Aquí aparecen todas las categorías compatibles: ${T.catsShort}.`,
      emptyBody:
        'Conecta un smartwatch, un anillo inteligente, una banda de recuperación, un sensor de glucosa, un monitor de presión arterial, una báscula inteligente o un sistema de sueño en casa para registrar datos de salud automáticamente.',
    },
  }),

  fr: (T) => ({
    faqDevices: {
      title: 'Appareils et suivi',
      items: [
        {
          question: 'Quels appareils sont compatibles ?',
          answer: `Sept catégories : ${T.cats}.`,
        },
        {
          question: "Que couvrent les catégories d'appareils ?",
          answer:
            "Les montres connectées suivent la fréquence cardiaque en continu, le sommeil et l'activité, et souvent l'ECG ou la SpO₂. Les bagues intelligentes suivent sommeil, VFC et température 24 h/24. Les bracelets de récupération se concentrent sur la charge et la disponibilité. Les capteurs de glucose en continu montrent les courbes de glycémie sur la journée. Les tensiomètres et balances connectées ajoutent des mesures fiables à domicile. Les systèmes de sommeil à domicile captent les constantes nocturnes sans rien au poignet.",
        },
        {
          question: 'Comment connecter un appareil ?',
          answer: `Ouvrez ${T.zone} → ${T.dev}, choisissez votre marque et suivez le parcours d'autorisation guidé. Chaque connexion est un écran de consentement étape par étape, et vous pouvez ajouter ou retirer des appareils à tout moment.`,
        },
        {
          question: 'Quelles données arrivent après la connexion ?',
          answer:
            'Uniquement les mesures que vous autorisez : fréquence cardiaque et VFC, phases de sommeil, activité et charge, SpO₂, température, glycémie, tension artérielle, poids et composition corporelle. Les mises à jour arrivent au rythme que vous choisissez, et quasiment en temps réel lorsque la marque le permet.',
        },
        {
          question: 'Comment les appareils alimentent-ils les rapports et Health Guide ?',
          answer:
            "Les tendances interprétées de vos appareils rejoignent votre Human Data Model, pour que les rapports et Health Guide expliquent les schémas en langage clair. Les conseils restent éducatifs et ne constituent pas un diagnostic.",
        },
        {
          question: 'Conservez-vous les données de santé brutes ?',
          answer:
            "Non. Nous interprétons les mesures et gardons les tendances utiles : nous n'avons pas besoin de stocker les flux bruts des capteurs.",
        },
        {
          question: "Et si la synchronisation s'arrête ?",
          answer: `Un rappel apparaît dans ${T.dev} lorsqu'une liaison expire ou qu'un jeton doit être renouvelé, et vous pouvez reconnecter en un clic. Les données antérieures restent en place.`,
        },
        {
          question: 'Puis-je désactiver le partage de données ?',
          answer:
            "Oui — immédiatement. Déconnectez un appareil ou coupez le partage pour tous dans les réglages ; les nouvelles mesures s'arrêtent aussitôt.",
        },
      ],
    },
    faqRecords: {
      title: 'Dossiers santé & ADN',
      items: [
        {
          question: 'Puis-je importer des analyses et des données ADN ?',
          answer: `Oui. Dans ${T.zone} → ${T.rec}, vous pouvez importer ou scanner analyses, imagerie, PDF de rapports ADN et fichiers ADN bruts. Ils rejoignent votre profil, aux côtés du questionnaire et de vos appareils connectés.`,
        },
        {
          question: 'Quels formats de fichiers sont acceptés ?',
          answer:
            "PDF, JPG, PNG, WEBP, CSV, TXT, VCF et les exports texte d'ADN brut courants (y compris de type 23andMe ou Ancestry).",
        },
        {
          question: "Puis-je scanner un résultat papier avec l'appareil photo ?",
          answer:
            "Oui. Sur mobile, vous pouvez photographier une page directement quand le navigateur l'autorise — pratique pour les feuilles de laboratoire imprimées. Une photo par page, et choisissez le type de dossier avant d'enregistrer.",
        },
        {
          question: "Que se passe-t-il après l'import ?",
          answer:
            "Chaque élément passe de Reçu à En revue puis Insights prêts. Vous recevez alors une explication éducative, des conclusions et des recommandations. C'est une réception structurée avec des modèles d'insights — pas une analyse génomique complète.",
        },
        {
          question: 'Puis-je copier, imprimer ou enregistrer un insight ?',
          answer:
            "Oui. Chaque insight prêt propose Copier, Imprimer et Télécharger TXT, pour en garder une copie ou l'apporter en consultation.",
        },
        {
          question: 'Comment les imports influencent-ils les rapports et Health Guide ?',
          answer:
            "Les imports apportent un contexte personnel de haut niveau : nombres par type, présence d'ADN au dossier et date des dernières analyses. Les rapports et Health Guide utilisent ces signaux avec votre questionnaire et les tendances de vos appareils. Le contenu ADN brut complet n'est jamais collé dans les prompts d'IA.",
        },
        {
          question: 'Puis-je interroger Health Guide à la voix sur un dossier ?',
          answer:
            'Oui. Sélectionnez un dossier et interrogez Health Guide par texte ou à la voix. Les réponses arrivent en langage clair — utile quand vous avez les mains occupées.',
        },
        {
          question: "L'ADN brut reste-t-il hors des prompts d'IA ?",
          answer:
            'Oui. Health Guide et les préambules de rapports reçoivent seulement un indicateur oui/non « ADN brut au dossier » et des modèles éducatifs — jamais le fichier génétique complet.',
        },
      ],
    },
    learning: {
      healthRecordsBody: `Dans ${T.zone} → ${T.rec}, vous pouvez importer ou scanner analyses, imagerie, PDF de rapports ADN et fichiers ADN bruts (PDF, images, CSV, TXT, VCF). Sur mobile, l'appareil photo permet de capturer une feuille imprimée. Les fichiers passent de Reçu à En revue puis Insights prêts. Les insights expliquent le dossier, listent conclusions et recommandations et restent éducatifs — pas un diagnostic. Vous pouvez copier, imprimer ou télécharger en TXT tout insight prêt, ou interroger Health Guide sur le dossier sélectionné par texte ou à la voix. Les nombres et l'indicateur d'ADN au dossier alimentent le contexte personnel des rapports et de Health Guide ; le contenu ADN brut n'est jamais collé dans les prompts d'IA.`,
      devicesTitle: T.dev,
      devicesBody: `${T.zone} → ${T.dev} couvre sept catégories : ${T.cats}. Vous autorisez chaque marque vous-même et seules les mesures approuvées se synchronisent — au rythme que vous choisissez, quasiment en temps réel lorsque la marque le permet. Les tendances interprétées alimentent vos rapports et permettent à Health Guide d'expliquer les schémas en langage clair ; les flux bruts des capteurs ne sont pas stockés.`,
      openDevices: `Ouvrir ${T.dev} →`,
    },
    howItWorks: {
      connectTitle: 'Connectez vos appareils de santé',
      connectSummary: `BioMath Core se connecte aux appareils que l'on porte vraiment : ${T.catsShort}. Vous pouvez aussi importer analyses et ADN dans l'${T.zone}, comme pour le questionnaire.`,
      connectPointsHeading: "Sept catégories d'appareils",
      connectPoints: [
        { title: 'Montres et bracelets', body: brandList('fr', WATCH_BRANDS) },
        { title: 'Bagues et récupération', body: brandList('fr', RING_BRANDS) },
        { title: 'Capteurs et appareils domestiques', body: brandList('fr', SENSOR_BRANDS) },
        {
          title: 'Analyses & ADN',
          body: `Importez ou scannez analyses, imagerie, rapports ADN et ADN brut dans ${T.rec}`,
        },
      ],
      connectChecklist: [
        `Autorisation guidée dans ${T.zone} → ${T.dev}`,
        'Les mesures approuvées se synchronisent au rythme que vous choisissez — quasiment en temps réel lorsque la marque le permet',
        'Import manuel ou scan par appareil photo pour analyses, imagerie, rapports ADN et fichiers ADN bruts',
      ],
      recordsSummary: `${T.rec} dans l'${T.zone} accepte PDF, images, CSV, TXT et VCF. Nous structurons chaque import, renvoyons des insights éducatifs que vous pouvez copier, imprimer ou télécharger, et relions des signaux de haut niveau (jamais le contenu ADN brut) aux rapports et à Health Guide.`,
      recordsLastCheck:
        'Interrogez Health Guide sur le dossier sélectionné, par texte ou à la voix, pour une explication en langage clair',
      faqItems: [
        {
          question: "Quelles catégories d'appareils puis-je connecter ?",
          answer: `Sept : ${T.cats}. Vous autorisez chaque marque vous-même et seules les mesures approuvées se synchronisent.`,
        },
        {
          question: 'Comment les analyses et fichiers ADN fonctionnent-ils avec Health Guide ?',
          answer: `Importez-les ou scannez-les dans ${T.rec}. Chaque dossier renvoie un insight éducatif à copier, imprimer ou télécharger, et vous pouvez interroger Health Guide par texte ou à la voix. Health Guide ne reçoit qu'un contexte de haut niveau — nombres, date des dernières analyses et indicateur oui/non d'ADN au dossier — jamais votre fichier génétique brut.`,
        },
      ],
    },
    member: {
      catalogNote: `Toutes les catégories compatibles sont listées ici : ${T.catsShort}.`,
      emptyBody:
        'Connectez une montre connectée, une bague intelligente, un bracelet de récupération, un capteur de glucose, un tensiomètre, une balance connectée ou un système de sommeil à domicile pour suivre automatiquement vos données de santé.',
    },
  }),

  de: (T) => ({
    faqDevices: {
      title: 'Geräte & Monitoring',
      items: [
        {
          question: 'Welche Geräte werden unterstützt?',
          answer: `Sieben Kategorien: ${T.cats}.`,
        },
        {
          question: 'Was decken die Gerätekategorien ab?',
          answer:
            'Smartwatches liefern Herzfrequenz über den Tag, Schlaf und Aktivität, häufig auch EKG oder SpO₂. Smart Rings erfassen Schlaf, HRV und Temperatur rund um die Uhr. Erholungsbänder konzentrieren sich auf Belastung und Erholungsbereitschaft. Sensoren für kontinuierliche Glukose zeigen Glukoseverläufe über den ganzen Tag. Blutdruckmessgeräte und smarte Waagen ergänzen verlässliche Messungen zu Hause. Heim-Schlafsysteme erfassen nächtliche Vitalwerte ohne Gerät am Handgelenk.',
        },
        {
          question: 'Wie verbinde ich ein Gerät?',
          answer: `Öffnen Sie ${T.zone} → ${T.dev}, wählen Sie Ihre Marke und folgen Sie der geführten Autorisierung. Jede Verbindung ist ein Schritt-für-Schritt-Einwilligungsdialog; Geräte lassen sich jederzeit hinzufügen oder entfernen.`,
        },
        {
          question: 'Welche Daten kommen nach dem Verbinden an?',
          answer:
            'Nur die Werte, die Sie freigeben: Herzfrequenz und HRV, Schlafphasen, Aktivität und Belastung, SpO₂, Temperatur, Glukose, Blutdruck, Gewicht und Körperzusammensetzung. Updates kommen im Rhythmus, den Sie wählen — nahezu in Echtzeit, wenn die Marke es unterstützt.',
        },
        {
          question: 'Wie fließen Geräte in Berichte und Health Guide ein?',
          answer:
            'Interpretierte Trends Ihrer Geräte werden Teil Ihres Human Data Model, damit Berichte und Health Guide Muster in klarer Sprache erklären. Die Hinweise bleiben edukativ und sind keine Diagnose.',
        },
        {
          question: 'Speichern Sie rohe Gesundheitsdaten?',
          answer:
            'Nein. Wir interpretieren Messwerte und behalten die relevanten Trends — rohe Sensordatenströme müssen wir nicht speichern.',
        },
        {
          question: 'Was, wenn die Synchronisierung stoppt?',
          answer: `In ${T.dev} erscheint ein Hinweis, wenn eine Verbindung abläuft oder ein Token erneuert werden muss; ein Klick genügt zum Neuverbinden. Frühere Daten bleiben erhalten.`,
        },
        {
          question: 'Kann ich die Datenfreigabe abschalten?',
          answer:
            'Ja — sofort. Trennen Sie ein einzelnes Gerät oder deaktivieren Sie die Freigabe für alle in den Einstellungen; neue Messwerte stoppen umgehend.',
        },
      ],
    },
    faqRecords: {
      title: 'Gesundheitsakten & DNA',
      items: [
        {
          question: 'Kann ich Laborwerte und DNA-Daten hochladen?',
          answer: `Ja. In ${T.zone} → ${T.rec} laden oder scannen Sie Laborwerte, Bildgebung, DNA-Berichts-PDFs und rohe DNA-Dateien. Sie werden Teil Ihres Profils — neben Fragebogen und verbundenen Geräten.`,
        },
        {
          question: 'Welche Dateiformate werden unterstützt?',
          answer:
            'PDF, JPG, PNG, WEBP, CSV, TXT, VCF sowie verbreitete Textexporte roher DNA (auch im Stil von 23andMe oder Ancestry).',
        },
        {
          question: 'Kann ich einen Papierbefund mit der Kamera scannen?',
          answer:
            'Ja. Auf dem Smartphone können Sie eine Seite direkt mit der Kamera aufnehmen, wenn der Browser es erlaubt — praktisch für gedruckte Laborbögen. Ein Foto pro Seite, und vor dem Speichern den Aktentyp wählen.',
        },
        {
          question: 'Was passiert nach dem Upload?',
          answer:
            'Jeder Eintrag wandert von Empfangen über In Prüfung zu Insights bereit. Danach erhalten Sie eine edukative Erklärung, Schlussfolgerungen und Empfehlungen. Das ist strukturierte Aufnahme mit Insight-Vorlagen — keine vollständige Genomanalyse.',
        },
        {
          question: 'Kann ich ein Insight kopieren, drucken oder speichern?',
          answer:
            'Ja. Jedes fertige Insight bietet Kopieren, Drucken und TXT herunterladen — für Ihre Unterlagen oder den Arztbesuch.',
        },
        {
          question: 'Wie wirken Uploads auf Berichte und Health Guide?',
          answer:
            'Uploads liefern übergeordneten persönlichen Kontext: Anzahl je Typ, ob DNA hinterlegt ist, und das Datum der letzten Laborwerte. Berichte und Health Guide nutzen diese Signale zusammen mit Ihrem Fragebogen und den Gerätetrends. Vollständige rohe DNA-Inhalte werden nie in KI-Prompts eingefügt.',
        },
        {
          question: 'Kann ich Health Guide per Sprache zu einer Akte fragen?',
          answer:
            'Ja. Wählen Sie eine Akte und fragen Sie Health Guide per Text oder Sprache. Antworten kommen in klarer Sprache — hilfreich, wenn die Hände gerade nicht frei sind.',
        },
        {
          question: 'Bleibt rohe DNA aus KI-Prompts heraus?',
          answer:
            'Ja. Health Guide und Berichtseinleitungen erhalten nur ein Ja/Nein-Kennzeichen „rohe DNA hinterlegt“ plus edukative Vorlagen — niemals die vollständige Gendatei.',
        },
      ],
    },
    learning: {
      healthRecordsBody: `In ${T.zone} → ${T.rec} laden oder scannen Sie Laborwerte, Bildgebung, DNA-Berichts-PDFs und rohe DNA-Dateien (PDF, Bilder, CSV, TXT, VCF). Auf dem Smartphone lässt sich ein gedruckter Bogen mit der Kamera aufnehmen. Dateien wandern von Empfangen über In Prüfung zu Insights bereit. Insights erklären die Akte, nennen Schlussfolgerungen und Empfehlungen und bleiben edukativ — keine Diagnose. Fertige Insights können Sie kopieren, drucken oder als TXT herunterladen oder Health Guide per Text oder Sprache zur gewählten Akte fragen. Anzahl und das Kennzeichen „DNA hinterlegt“ liefern persönlichen Kontext für Berichte und Health Guide; rohe DNA-Inhalte werden nie in KI-Prompts eingefügt.`,
      devicesTitle: T.dev,
      devicesBody: `${T.zone} → ${T.dev} deckt sieben Kategorien ab: ${T.cats}. Sie autorisieren jede Marke selbst, und es synchronisieren nur die Werte, die Sie freigeben — im gewählten Rhythmus, nahezu in Echtzeit, wenn die Marke es unterstützt. Interpretierte Trends fließen in Ihre Berichte, damit Health Guide Muster in klarer Sprache erklären kann; rohe Sensordatenströme werden nicht gespeichert.`,
      openDevices: `${T.dev} öffnen →`,
    },
    howItWorks: {
      connectTitle: 'Verbinden Sie Ihre Gesundheitsgeräte',
      connectSummary: `BioMath Core verbindet sich mit den Geräten, die Menschen wirklich tragen: ${T.catsShort}. Laborwerte und DNA bringen Sie genauso in den ${T.zone} wie den Fragebogen.`,
      connectPointsHeading: 'Sieben Gerätekategorien',
      connectPoints: [
        { title: 'Uhren & Bänder', body: brandList('de', WATCH_BRANDS) },
        { title: 'Ringe & Erholung', body: brandList('de', RING_BRANDS) },
        { title: 'Sensoren & Heimgeräte', body: brandList('de', SENSOR_BRANDS) },
        {
          title: 'Labor & DNA',
          body: `Laborwerte, Bildgebung, DNA-Berichte und rohe DNA in ${T.rec} hochladen oder scannen`,
        },
      ],
      connectChecklist: [
        `Geführte Autorisierung in ${T.zone} → ${T.dev}`,
        'Freigegebene Werte synchronisieren im gewählten Rhythmus — nahezu in Echtzeit, wo die Marke es unterstützt',
        'Manueller Upload oder Kamerascan für Laborwerte, Bildgebung, DNA-Berichte und rohe DNA-Dateien',
      ],
      recordsSummary: `${T.rec} im ${T.zone} akzeptiert PDF, Bilder, CSV, TXT und VCF. Wir strukturieren jeden Upload, geben edukative Insights zurück, die Sie kopieren, drucken oder herunterladen können, und verknüpfen übergeordnete Signale (nicht rohe DNA-Inhalte) mit Berichten und Health Guide.`,
      recordsLastCheck:
        'Health Guide per Text oder Sprache zur gewählten Akte fragen — für eine Erklärung in klarer Sprache',
      faqItems: [
        {
          question: 'Welche Gerätekategorien kann ich verbinden?',
          answer: `Sieben: ${T.cats}. Sie autorisieren jede Marke selbst, und nur die freigegebenen Werte synchronisieren.`,
        },
        {
          question: 'Wie arbeiten Laborwerte und DNA-Dateien mit Health Guide?',
          answer: `Laden oder scannen Sie sie in ${T.rec}. Jede Akte liefert ein edukatives Insight zum Kopieren, Drucken oder Herunterladen, und Sie können Health Guide per Text oder Sprache dazu fragen. Health Guide erhält nur übergeordneten Kontext — Anzahl, Datum der letzten Laborwerte und ein Ja/Nein-Kennzeichen zu hinterlegter DNA — niemals Ihre rohe Gendatei.`,
        },
      ],
    },
    member: {
      catalogNote: `Hier sind alle unterstützten Kategorien aufgeführt: ${T.catsShort}.`,
      emptyBody:
        'Verbinden Sie eine Smartwatch, einen Smart Ring, ein Erholungsband, einen Glukosesensor, ein Blutdruckmessgerät, eine smarte Waage oder ein Heim-Schlafsystem, um Gesundheitsdaten automatisch zu erfassen.',
    },
  }),

  ja: (T) => ({
    faqDevices: {
      title: 'デバイスとモニタリング',
      items: [
        {
          question: '対応しているデバイスは？',
          answer: `7つのカテゴリーに対応しています：${T.cats}。`,
        },
        {
          question: '各デバイスカテゴリーは何を測れますか？',
          answer:
            'スマートウォッチは終日の心拍、睡眠、活動量を記録し、多くの機種で心電図やSpO₂にも対応します。スマートリングは睡眠、HRV、体温を24時間記録します。リカバリーバンドは負荷と回復度に特化しています。持続血糖センサーは一日を通した血糖の変化を示します。血圧計とスマートスケールは自宅での信頼できる測定値を加えます。家庭用睡眠システムは手首に何も着けずに夜間のバイタルを記録します。',
        },
        {
          question: 'デバイスはどう接続しますか？',
          answer: `${T.zone} → ${T.dev}を開き、ブランドを選んで案内に沿って認証します。接続は段階的な同意画面で進み、デバイスの追加・解除はいつでも可能です。`,
        },
        {
          question: '接続後、どのデータが届きますか？',
          answer:
            '許可した指標のみです：心拍とHRV、睡眠段階、活動量と負荷、SpO₂、体温、血糖、血圧、体重と体組成。更新はご自身で選んだ頻度で届き、ブランドが対応している場合はほぼリアルタイムです。',
        },
        {
          question: 'デバイスはレポートやHealth Guideにどう活かされますか？',
          answer:
            '解釈された傾向がHuman Data Modelの一部となり、レポートとHealth Guideがパターンを分かりやすく説明します。内容は教育目的であり、診断ではありません。',
        },
        {
          question: '生の健康データを保存しますか？',
          answer:
            'いいえ。指標を解釈し、意味のある傾向を保持します。センサーの生データストリームを保存する必要はありません。',
        },
        {
          question: '同期が止まったらどうなりますか？',
          answer: `連携の期限切れやトークン更新が必要なときは${T.dev}に通知が表示され、ワンクリックで再接続できます。過去のデータはそのまま残ります。`,
        },
        {
          question: 'データ共有を停止できますか？',
          answer:
            'はい、すぐに可能です。設定で個別のデバイスを解除する、またはすべての共有をオフにできます。新しい測定値の取得は直ちに停止します。',
        },
      ],
    },
    faqRecords: {
      title: '健康記録とDNA',
      items: [
        {
          question: '検査結果やDNAデータをアップロードできますか？',
          answer: `はい。${T.zone} → ${T.rec}で、検査結果、画像診断、DNAレポートのPDF、生のDNAファイルをアップロードまたはスキャンできます。問診票や接続済みデバイスと並んでプロフィールの一部になります。`,
        },
        {
          question: '対応するファイル形式は？',
          answer:
            'PDF、JPG、PNG、WEBP、CSV、TXT、VCF、および一般的な生DNAのテキスト書き出し（23andMeやAncestry形式を含む）に対応します。',
        },
        {
          question: '紙の検査結果をカメラで読み取れますか？',
          answer:
            'はい。ブラウザが許可すれば、スマートフォンのカメラでページを直接撮影できます。印刷された検査用紙に便利です。1ページずつ撮影し、保存前に記録の種類を選んでください。',
        },
        {
          question: 'アップロード後は何が起きますか？',
          answer:
            '各項目は受付済み → 確認中 → インサイト準備完了と進みます。準備できると、教育的な説明、結論、推奨が届きます。これはインサイトのテンプレートを用いた構造化された受付であり、完全なゲノム解析ではありません。',
        },
        {
          question: 'インサイトをコピー・印刷・保存できますか？',
          answer:
            'はい。準備完了のインサイトにはコピー、印刷、TXTダウンロードがあり、控えを残したり受診時に持参できます。',
        },
        {
          question: 'アップロードはレポートやHealth Guideにどう影響しますか？',
          answer:
            'アップロードは高レベルの個人的文脈を加えます：種類ごとの件数、DNAが保存されているか、直近の検査日です。レポートとHealth Guideはこれらのシグナルを問診票やデバイスの傾向と併せて使います。生DNAの全内容がAIプロンプトに貼り付けられることはありません。',
        },
        {
          question: '記録について音声でHealth Guideに質問できますか？',
          answer:
            'はい。記録を選び、テキストまたは音声でHealth Guideに質問できます。回答は分かりやすい言葉で返るため、手がふさがっているときにも役立ちます。',
        },
        {
          question: '生DNAはAIプロンプトから守られますか？',
          answer:
            'はい。Health Guideとレポートの前文が受け取るのは「生DNAあり」の有無フラグと教育用テンプレートだけで、完全な遺伝データファイルは渡されません。',
        },
      ],
    },
    learning: {
      healthRecordsBody: `${T.zone} → ${T.rec}では、検査結果、画像診断、DNAレポートのPDF、生のDNAファイル（PDF、画像、CSV、TXT、VCF）をアップロードまたはスキャンできます。スマートフォンではカメラで印刷物を撮影できます。ファイルは受付済み → 確認中 → インサイト準備完了と進みます。インサイトは記録を説明し、結論と推奨を示しますが、あくまで教育目的で診断ではありません。準備完了のインサイトはコピー、印刷、TXTダウンロードが可能で、選択した記録についてテキストまたは音声でHealth Guideに質問できます。件数とDNA保存の有無はレポートとHealth Guideの個人的文脈として使われ、生DNAの内容がAIプロンプトに貼り付けられることはありません。`,
      devicesTitle: T.dev,
      devicesBody: `${T.zone} → ${T.dev}は7つのカテゴリーに対応します：${T.cats}。ブランドごとにご自身で認証し、承認した指標のみが同期されます。頻度はご自身で選べ、ブランドが対応していればほぼリアルタイムです。解釈された傾向がレポートに反映され、Health Guideがパターンを分かりやすく説明します。センサーの生データストリームは保存しません。`,
      openDevices: `${T.dev}を開く →`,
    },
    howItWorks: {
      connectTitle: '健康デバイスを接続する',
      connectSummary: `BioMath Coreは実際に使われているデバイスとつながります：${T.catsShort}。問診票と同じように、検査結果やDNAも${T.zone}に取り込めます。`,
      connectPointsHeading: '7つのデバイスカテゴリー',
      connectPoints: [
        { title: 'ウォッチとバンド', body: brandList('ja', WATCH_BRANDS) },
        { title: 'リングとリカバリー', body: brandList('ja', RING_BRANDS) },
        { title: 'センサーと家庭用機器', body: brandList('ja', SENSOR_BRANDS) },
        {
          title: '検査結果とDNA',
          body: `${T.rec}で検査結果、画像診断、DNAレポート、生のDNAをアップロードまたはスキャン`,
        },
      ],
      connectChecklist: [
        `${T.zone} → ${T.dev}で案内に沿って認証`,
        '承認した指標は選んだ頻度で同期され、ブランドが対応していればほぼリアルタイム',
        '検査結果、画像診断、DNAレポート、生DNAファイルは手動アップロードまたはカメラでスキャン',
      ],
      recordsSummary: `${T.zone}の${T.rec}はPDF、画像、CSV、TXT、VCFに対応します。アップロードを構造化し、コピー・印刷・ダウンロードできる教育的インサイトを返し、高レベルのシグナル（生DNAの内容ではありません）をレポートとHealth Guideに連携します。`,
      recordsLastCheck: '選択した記録についてテキストまたは音声でHealth Guideに質問し、分かりやすい説明を受け取る',
      faqItems: [
        {
          question: 'どのデバイスカテゴリーを接続できますか？',
          answer: `7つです：${T.cats}。ブランドごとにご自身で認証し、承認した指標のみが同期されます。`,
        },
        {
          question: '検査結果やDNAファイルはHealth Guideとどう連携しますか？',
          answer: `${T.rec}でアップロードまたはスキャンします。各記録にはコピー・印刷・ダウンロードできる教育的インサイトが返り、テキストまたは音声でHealth Guideに質問できます。Health Guideが受け取るのは件数、直近の検査日、DNA保存の有無といった高レベルの文脈のみで、生の遺伝データファイルは渡されません。`,
        },
      ],
    },
    member: {
      catalogNote: `対応するすべてのカテゴリーを掲載しています：${T.catsShort}。`,
      emptyBody:
        'スマートウォッチ、スマートリング、リカバリーバンド、血糖センサー、血圧計、スマートスケール、家庭用睡眠システムを接続すると、健康データの自動追跡が始まります。',
    },
  }),

  he: (T) => ({
    faqDevices: {
      title: 'מכשירים וניטור',
      items: [
        {
          question: 'אילו מכשירים נתמכים?',
          answer: `שבע קטגוריות: ${T.cats}.`,
        },
        {
          question: 'מה כוללת כל קטגוריית מכשירים?',
          answer:
            'שעונים חכמים מודדים דופק לאורך היום, שינה ופעילות, ולעיתים גם אק"ג או ריווי חמצן. טבעות חכמות עוקבות אחר שינה, HRV וטמפרטורה מסביב לשעון. סרטי התאוששות מתמקדים בעומס ובמוכנות. חיישני סוכר רציף מציגים את עקומת הסוכר לאורך היום. מדדי לחץ דם ומשקלים חכמים מוסיפים מדידות ביתיות אמינות. מערכות שינה ביתיות אוספות מדדים במהלך הלילה בלי מכשיר על היד.',
        },
        {
          question: 'איך מחברים מכשיר?',
          answer: `פתחו ${T.zone} → ${T.dev}, בחרו את המותג ועברו על תהליך ההרשאה המודרך. כל חיבור מוצג כמסך הסכמה צעד אחר צעד, ואפשר להוסיף או להסיר מכשירים בכל רגע.`,
        },
        {
          question: 'אילו נתונים מגיעים לאחר החיבור?',
          answer:
            'רק המדדים שאישרתם: דופק ו־HRV, שלבי שינה, פעילות ועומס, ריווי חמצן, טמפרטורה, סוכר, לחץ דם, משקל והרכב גוף. העדכונים מגיעים בתדירות שתבחרו, וכמעט בזמן אמת כשהמותג תומך בכך.',
        },
        {
          question: 'איך המכשירים מזינים דוחות ו־Health Guide?',
          answer:
            'מגמות מפוענחות מהמכשירים הופכות לחלק מה־Human Data Model, כך שהדוחות ו־Health Guide מסבירים תבניות בשפה פשוטה. ההסברים חינוכיים ואינם אבחנה.',
        },
        {
          question: 'האם אתם שומרים נתוני בריאות גולמיים?',
          answer:
            'לא. אנחנו מפרשים מדדים ושומרים את המגמות החשובות — אין צורך לשמור זרמי חיישנים גולמיים.',
        },
        {
          question: 'מה קורה אם הסנכרון נפסק?',
          answer: `ב${T.dev} תופיע תזכורת כשחיבור פג או כשצריך לחדש הרשאה, ואפשר להתחבר מחדש בלחיצה אחת. הנתונים הקודמים נשמרים.`,
        },
        {
          question: 'אפשר לבטל שיתוף נתונים?',
          answer:
            'כן — מיד. אפשר לנתק מכשיר בודד או לכבות שיתוף לכל המכשירים דרך ההגדרות; איסוף המדידות החדשות נפסק מיד.',
        },
      ],
    },
    faqRecords: {
      title: 'רשומות בריאות ו־DNA',
      items: [
        {
          question: 'אפשר להעלות בדיקות מעבדה ו־DNA?',
          answer: `כן. ב${T.zone} → ${T.rec} אפשר להעלות או לסרוק בדיקות, הדמיה, PDF של דוחות DNA ו־DNA גולמי. הם הופכים לחלק מהפרופיל, לצד השאלון והמכשירים המחוברים.`,
        },
        {
          question: 'אילו פורמטים נתמכים?',
          answer:
            'PDF, JPG, PNG, WEBP, CSV, TXT, VCF וייצואי טקסט נפוצים של DNA גולמי (כולל סגנון 23andMe או Ancestry).',
        },
        {
          question: 'אפשר לסרוק תוצאה מודפסת עם המצלמה?',
          answer:
            'כן. בנייד אפשר לצלם עמוד ישירות כשהדפדפן מאפשר — נוח לדפי מעבדה מודפסים. צלמו תמונה אחת לכל עמוד ובחרו את סוג הרשומה לפני השמירה.',
        },
        {
          question: 'מה קורה אחרי ההעלאה?',
          answer:
            'כל פריט עובר מהתקבל לבבדיקה ולתובנות מוכנות. כשמוכן מקבלים הסבר חינוכי, מסקנות והמלצות. זו קליטה מובנית עם תבניות תובנה — לא צינור גנומי מלא.',
        },
        {
          question: 'אפשר להעתיק, להדפיס או לשמור תובנה?',
          answer:
            'כן. לכל תובנה מוכנה יש העתקה, הדפסה והורדת TXT, כדי לשמור עותק או להביא אותו לפגישה.',
        },
        {
          question: 'איך העלאות משפיעות על דוחות ו־Health Guide?',
          answer:
            'העלאות מוסיפות הקשר אישי ברמה גבוהה: ספירות לפי סוג, האם יש DNA בארכיון ותאריך הבדיקה האחרונה. הדוחות ו־Health Guide משתמשים באותות האלה יחד עם השאלון ומגמות המכשירים. תוכן DNA גולמי מלא לעולם אינו מודבק לפרומפטים של AI.',
        },
        {
          question: 'אפשר לשאול את Health Guide על רשומה בקול?',
          answer:
            'כן. בחרו רשומה ושאלו את Health Guide בטקסט או בקול. התשובות מגיעות בשפה פשוטה — נוח כשהידיים עסוקות.',
        },
        {
          question: 'האם DNA גולמי נשמר מחוץ לפרומפטי AI?',
          answer:
            'כן. Health Guide והקדמות הדוחות מקבלים רק דגל כן/לא “DNA גולמי בארכיון” ותבניות חינוכיות — לעולם לא את הקובץ הגנטי המלא.',
        },
      ],
    },
    learning: {
      healthRecordsBody: `ב${T.zone} → ${T.rec} אפשר להעלות או לסרוק בדיקות, הדמיה, PDF של דוחות DNA ו־DNA גולמי (PDF, תמונות, CSV, TXT, VCF). בנייד אפשר לצלם דף מודפס עם המצלמה. הקבצים עוברים מהתקבל לבבדיקה ולתובנות מוכנות. התובנות מסבירות את הרשומה, מציגות מסקנות והמלצות ונשארות חינוכיות — לא אבחנה. כל תובנה מוכנה זמינה להעתקה, הדפסה או הורדת TXT, ואפשר לשאול את Health Guide על הרשומה שנבחרה בטקסט או בקול. ספירות ודגל DNA בארכיון מזינים הקשר אישי לדוחות ול־Health Guide; תוכן DNA גולמי לעולם אינו מודבק לפרומפטים של AI.`,
      devicesTitle: T.dev,
      devicesBody: `${T.zone} → ${T.dev} מכסה שבע קטגוריות: ${T.cats}. אתם מאשרים כל מותג בעצמכם, ורק המדדים שאישרתם מסתנכרנים — בתדירות שתבחרו, וכמעט בזמן אמת כשהמותג תומך בכך. המגמות המפוענחות מזינות את הדוחות ומאפשרות ל־Health Guide להסביר תבניות בשפה פשוטה; זרמי חיישנים גולמיים אינם נשמרים.`,
      openDevices: `פתיחת ${T.dev} →`,
    },
    howItWorks: {
      connectTitle: 'חברו את מכשירי הבריאות שלכם',
      connectSummary: `BioMath Core מתחבר למכשירים שאנשים באמת עונדים: ${T.catsShort}. אפשר גם להביא בדיקות מעבדה ו־DNA ל${T.zone}, בדיוק כמו מילוי השאלון.`,
      connectPointsHeading: 'שבע קטגוריות מכשירים',
      connectPoints: [
        { title: 'שעונים וסרטים', body: brandList('he', WATCH_BRANDS) },
        { title: 'טבעות והתאוששות', body: brandList('he', RING_BRANDS) },
        { title: 'חיישנים ומכשירים ביתיים', body: brandList('he', SENSOR_BRANDS) },
        {
          title: 'מעבדה ו־DNA',
          body: `העלו או סרקו בדיקות, הדמיה, דוחות DNA ו־DNA גולמי ב${T.rec}`,
        },
      ],
      connectChecklist: [
        `הרשאה מודרכת ב${T.zone} → ${T.dev}`,
        'המדדים שאישרתם מסתנכרנים בתדירות שתבחרו — וכמעט בזמן אמת כשהמותג תומך בכך',
        'העלאה ידנית או סריקה במצלמה לבדיקות, הדמיה, דוחות DNA וקבצי DNA גולמי',
      ],
      recordsSummary: `${T.rec} ב${T.zone} מקבלות PDF, תמונות, CSV, TXT ו־VCF. אנחנו מבנים כל העלאה, מחזירים תובנות חינוכיות שניתן להעתיק, להדפיס או להוריד, ומקשרים אותות ברמה גבוהה (לא תוכן DNA גולמי) לדוחות ול־Health Guide.`,
      recordsLastCheck: 'שאלו את Health Guide על הרשומה שנבחרה בטקסט או בקול, לקבלת הסבר בשפה פשוטה',
      faqItems: [
        {
          question: 'אילו קטגוריות מכשירים אפשר לחבר?',
          answer: `שבע: ${T.cats}. אתם מאשרים כל מותג בעצמכם, ורק המדדים שאישרתם מסתנכרנים.`,
        },
        {
          question: 'איך תוצאות מעבדה וקבצי DNA עובדים עם Health Guide?',
          answer: `העלו או סרקו אותם ב${T.rec}. כל רשומה מחזירה תובנה חינוכית שניתן להעתיק, להדפיס או להוריד, ואפשר לשאול עליה את Health Guide בטקסט או בקול. Health Guide מקבל רק הקשר ברמה גבוהה — ספירות, תאריך הבדיקה האחרונה ודגל כן/לא של DNA בארכיון — ולעולם לא את הקובץ הגנטי הגולמי.`,
        },
      ],
    },
    member: {
      catalogNote: `כל הקטגוריות הנתמכות מופיעות כאן: ${T.catsShort}.`,
      emptyBody:
        'חברו שעון חכם, טבעת חכמה, סרט התאוששות, חיישן סוכר, מד לחץ דם, משקל חכם או מערכת שינה ביתית כדי לעקוב אחר נתוני בריאות אוטומטית.',
    },
  }),

  zh: (T) => ({
    faqDevices: {
      title: '设备与监测',
      items: [
        {
          question: '支持哪些设备？',
          answer: `共七类：${T.cats}。`,
        },
        {
          question: '各设备类别分别测什么？',
          answer:
            '智能手表提供全天心率、睡眠和活动数据，多数机型还支持心电图或血氧。智能戒指全天候记录睡眠、HRV 和体温。恢复手环侧重训练负荷与恢复度。连续血糖传感器展示全天血糖曲线。血压计与智能秤补充可靠的家用测量。居家睡眠系统无需手腕设备即可记录夜间体征。',
        },
        {
          question: '如何连接设备？',
          answer: `打开${T.zone} → ${T.dev}，选择品牌并按引导完成授权。每次连接都是分步的授权确认页面，您可以随时添加或移除设备。`,
        },
        {
          question: '连接后会同步哪些数据？',
          answer:
            '只同步您授权的指标：心率与 HRV、睡眠阶段、活动与负荷、血氧、体温、血糖、血压、体重与身体成分。更新按您选择的频率到达；品牌支持时可接近实时。',
        },
        {
          question: '设备如何为报告和 Health Guide 提供依据？',
          answer:
            '设备趋势经解读后成为您 Human Data Model 的一部分，报告和 Health Guide 便能用通俗语言解释这些规律。相关内容用于健康教育，不构成诊断。',
        },
        {
          question: '你们会保存原始健康数据吗？',
          answer: '不会。我们解读指标并保留有意义的趋势——无需存储原始传感器数据流。',
        },
        {
          question: '如果同步中断怎么办？',
          answer: `当授权过期或需要刷新令牌时，${T.dev}页面会提示您，一键即可重新连接。此前的数据仍会保留。`,
        },
        {
          question: '可以关闭数据共享吗？',
          answer:
            '可以，且立即生效。在设置中断开单个设备，或关闭全部共享；新的读数会立刻停止上传。',
        },
      ],
    },
    faqRecords: {
      title: '健康档案与DNA',
      items: [
        {
          question: '可以上传化验结果和 DNA 数据吗？',
          answer: `可以。在${T.zone} → ${T.rec}中，您可以上传或扫描化验单、影像、DNA 报告 PDF 和原始 DNA 文件。它们会与问卷和已连接设备一起构成您的健康档案。`,
        },
        {
          question: '支持哪些文件格式？',
          answer:
            '支持 PDF、JPG、PNG、WEBP、CSV、TXT、VCF，以及常见的原始 DNA 文本导出（包括 23andMe 或 Ancestry 格式）。',
        },
        {
          question: '可以用相机扫描纸质报告吗？',
          answer:
            '可以。在手机上，浏览器允许时可直接用相机拍摄页面，适合打印的化验单。每页拍一张，保存前选择档案类型。',
        },
        {
          question: '上传后会发生什么？',
          answer:
            '每个条目会依次经过已接收、审核中、洞察已就绪。就绪后您会看到科普性的解释、结论与建议。这是带洞察模板的结构化归档，并非完整的基因组分析流程。',
        },
        {
          question: '可以复制、打印或保存洞察吗？',
          answer:
            '可以。每条已就绪的洞察都提供复制、打印和下载 TXT，方便留存或带去就诊。',
        },
        {
          question: '上传如何影响报告和 Health Guide？',
          answer:
            '上传只提供概要性的个人背景：各类型数量、是否已存有 DNA、最近一次化验日期。报告和 Health Guide 会结合问卷与设备趋势使用这些信号。原始 DNA 的完整内容绝不会被放入 AI 提示词。',
        },
        {
          question: '可以用语音向 Health Guide 询问某份档案吗？',
          answer:
            '可以。选择一份档案后，用文字或语音向 Health Guide 提问。回答会用通俗语言给出，双手不便时尤其实用。',
        },
        {
          question: '原始 DNA 会被排除在 AI 提示词之外吗？',
          answer:
            '是的。Health Guide 和报告前言只会收到“是否已存有原始 DNA”的标记以及科普模板，绝不会收到完整的基因文件。',
        },
      ],
    },
    learning: {
      healthRecordsBody: `在${T.zone} → ${T.rec}中，您可以上传或扫描化验单、影像、DNA 报告 PDF 和原始 DNA 文件（PDF、图片、CSV、TXT、VCF）。在手机上可用相机拍摄打印页面。文件会依次经过已接收、审核中、洞察已就绪。洞察会解释这份档案，列出结论与建议，内容用于健康教育，不构成诊断。任何已就绪的洞察都可复制、打印或下载 TXT，也可以用文字或语音就所选档案询问 Health Guide。各类型数量与是否存有 DNA 的标记会作为个人背景用于报告和 Health Guide；原始 DNA 内容绝不会被放入 AI 提示词。`,
      devicesTitle: T.dev,
      devicesBody: `${T.zone} → ${T.dev}涵盖七类：${T.cats}。每个品牌都由您自行授权，只有您批准的指标才会同步——频率由您选择，品牌支持时可接近实时。解读后的趋势会进入报告，让 Health Guide 用通俗语言解释其中的规律；原始传感器数据流不会被存储。`,
      openDevices: `打开${T.dev} →`,
    },
    howItWorks: {
      connectTitle: '连接您的健康设备',
      connectSummary: `BioMath Core 可连接人们日常真正使用的设备：${T.catsShort}。您也可以像填写问卷那样，把化验单和 DNA 带入${T.zone}。`,
      connectPointsHeading: '七类设备',
      connectPoints: [
        { title: '手表与手环', body: brandList('zh', WATCH_BRANDS) },
        { title: '戒指与恢复', body: brandList('zh', RING_BRANDS) },
        { title: '传感器与家用设备', body: brandList('zh', SENSOR_BRANDS) },
        { title: '化验与DNA', body: `在${T.rec}中上传或扫描化验单、影像、DNA 报告和原始 DNA` },
      ],
      connectChecklist: [
        `在${T.zone} → ${T.dev}中按引导完成授权`,
        '您批准的指标按所选频率同步，品牌支持时可接近实时',
        '化验单、影像、DNA 报告和原始 DNA 文件可手动上传或用相机扫描',
      ],
      recordsSummary: `${T.zone}的${T.rec}支持 PDF、图片、CSV、TXT 和 VCF。我们会结构化每次上传，返回可复制、打印或下载的科普洞察，并把概要性信号（而非原始 DNA 内容）关联到报告和 Health Guide。`,
      recordsLastCheck: '用文字或语音就所选档案询问 Health Guide，获得通俗易懂的解释',
      faqItems: [
        {
          question: '我可以连接哪些设备类别？',
          answer: `共七类：${T.cats}。每个品牌由您自行授权，只有您批准的指标才会同步。`,
        },
        {
          question: '化验结果和 DNA 文件如何与 Health Guide 配合？',
          answer: `在${T.rec}中上传或扫描即可。每份档案都会返回可复制、打印或下载的科普洞察，您也可以用文字或语音向 Health Guide 询问。Health Guide 只会收到概要背景——数量、最近化验日期以及是否存有 DNA 的标记——绝不会收到您的原始基因文件。`,
        },
      ],
    },
    member: {
      catalogNote: `这里列出了所有支持的类别：${T.catsShort}。`,
      emptyBody:
        '连接智能手表、智能戒指、恢复手环、血糖传感器、血压计、智能秤或居家睡眠系统，即可自动追踪健康数据。',
    },
  }),

  ar: (T) => ({
    faqDevices: {
      title: 'الأجهزة والمتابعة',
      items: [
        {
          question: 'ما الأجهزة المدعومة؟',
          answer: `سبع فئات: ${T.cats}.`,
        },
        {
          question: 'ماذا تغطي فئات الأجهزة؟',
          answer:
            'الساعات الذكية تقيس النبض طوال اليوم والنوم والنشاط، وغالبًا تخطيط القلب أو تشبّع الأكسجين. الخواتم الذكية تتابع النوم وتغيّر النبض ودرجة الحرارة على مدار الساعة. أساور التعافي تركّز على الحِمل والجاهزية. مستشعرات الجلوكوز المستمر تُظهر منحنى السكر طوال اليوم. أجهزة ضغط الدم والموازين الذكية تضيف قياسات منزلية موثوقة. أنظمة النوم المنزلية ترصد المؤشرات الليلية دون جهاز على المعصم.',
        },
        {
          question: 'كيف أوصّل جهازًا؟',
          answer: `افتحوا ${T.zone} → ${T.dev}، واختاروا العلامة التجارية، واتبعوا مسار التفويض الموجّه. كل اتصال شاشة موافقة خطوة بخطوة، ويمكنكم إضافة الأجهزة أو إزالتها في أي وقت.`,
        },
        {
          question: 'ما البيانات التي تصل بعد التوصيل؟',
          answer:
            'فقط المؤشرات التي تسمحون بها: النبض وتغيّره، ومراحل النوم، والنشاط والحِمل، وتشبّع الأكسجين، ودرجة الحرارة، والجلوكوز، وضغط الدم، والوزن وتركيب الجسم. تصل التحديثات بالوتيرة التي تختارونها، وشبه فورية عندما تدعم العلامة التجارية ذلك.',
        },
        {
          question: 'كيف تُغذّي الأجهزة التقارير وHealth Guide؟',
          answer:
            'تصبح الاتجاهات المُفسَّرة من أجهزتكم جزءًا من Human Data Model، لتشرح التقارير وHealth Guide الأنماط بلغة واضحة. المحتوى تعليمي وليس تشخيصًا.',
        },
        {
          question: 'هل تخزّنون البيانات الصحية الخام؟',
          answer:
            'لا. نفسّر المؤشرات ونحفظ الاتجاهات المهمة — ولا نحتاج إلى تخزين تدفقات المستشعرات الخام.',
        },
        {
          question: 'ماذا لو توقفت المزامنة؟',
          answer: `سيظهر تنبيه في ${T.dev} عند انتهاء الربط أو الحاجة إلى تحديث التفويض، ويمكن إعادة الاتصال بنقرة واحدة. تبقى البيانات السابقة كما هي.`,
        },
        {
          question: 'هل يمكنني إيقاف مشاركة البيانات؟',
          answer:
            'نعم — فورًا. افصلوا جهازًا واحدًا أو أوقفوا المشاركة لكل الأجهزة من الإعدادات؛ تتوقف القراءات الجديدة على الفور.',
        },
      ],
    },
    faqRecords: {
      title: 'السجلات الصحية والحمض النووي',
      items: [
        {
          question: 'هل يمكنني رفع تحاليل وبيانات DNA؟',
          answer: `نعم. في ${T.zone} → ${T.rec} يمكنكم رفع أو مسح التحاليل والتصوير وملفات PDF لتقارير DNA وDNA الخام. تصبح جزءًا من ملفكم إلى جانب الاستبيان والأجهزة المتصلة.`,
        },
        {
          question: 'ما صيغ الملفات المدعومة؟',
          answer:
            'PDF وJPG وPNG وWEBP وCSV وTXT وVCF وتصديرات نص DNA الخام الشائعة (بما في ذلك أسلوب 23andMe أو Ancestry).',
        },
        {
          question: 'هل يمكنني مسح نتيجة ورقية بالكاميرا؟',
          answer:
            'نعم. على الجوال يمكنكم تصوير الصفحة مباشرة بالكاميرا عندما يسمح المتصفح — مفيد لأوراق التحاليل المطبوعة. صوّروا صفحة واحدة في كل مرة واختاروا نوع السجل قبل الحفظ.',
        },
        {
          question: 'ماذا يحدث بعد الرفع؟',
          answer:
            'ينتقل كل عنصر من مُستلم إلى قيد المراجعة إلى الرؤى جاهزة. عند الجاهزية تحصلون على شرح تعليمي واستنتاجات وتوصيات. هذا استقبال منظّم بقوالب رؤى — وليس خط تحليل جينومي كامل.',
        },
        {
          question: 'هل يمكنني نسخ الرؤية أو طباعتها أو حفظها؟',
          answer:
            'نعم. لكل رؤية جاهزة أزرار نسخ وطباعة وتنزيل TXT، لحفظ نسخة أو أخذها إلى الموعد الطبي.',
        },
        {
          question: 'كيف تؤثر الملفات المرفوعة على التقارير وHealth Guide؟',
          answer:
            'تضيف الملفات المرفوعة سياقًا شخصيًا عالي المستوى: عدد العناصر حسب النوع، وما إذا كان DNA محفوظًا، وتاريخ آخر تحليل. تستخدم التقارير وHealth Guide هذه الإشارات مع الاستبيان واتجاهات الأجهزة. لا يُلصق محتوى DNA الخام الكامل أبدًا في مطالبات الذكاء الاصطناعي.',
        },
        {
          question: 'هل يمكنني سؤال Health Guide صوتيًا عن سجل؟',
          answer:
            'نعم. اختاروا سجلًا واسألوا Health Guide كتابةً أو صوتًا. تأتي الإجابات بلغة واضحة — وهو أمر مفيد حين تكون يداكم مشغولة.',
        },
        {
          question: 'هل يبقى DNA الخام بعيدًا عن مطالبات الذكاء الاصطناعي؟',
          answer:
            'نعم. يتلقى Health Guide ومقدمات التقارير علامة نعم/لا «DNA خام محفوظ» وقوالب تعليمية فقط — وليس الملف الجيني الكامل أبدًا.',
        },
      ],
    },
    learning: {
      healthRecordsBody: `في ${T.zone} → ${T.rec} يمكنكم رفع أو مسح التحاليل والتصوير وملفات PDF لتقارير DNA وDNA الخام (PDF وصور وCSV وTXT وVCF). على الجوال يمكن تصوير ورقة مطبوعة بالكاميرا. تنتقل الملفات من مُستلم إلى قيد المراجعة إلى الرؤى جاهزة. تشرح الرؤى السجل وتذكر الاستنتاجات والتوصيات وتبقى تعليمية — وليست تشخيصًا. يمكنكم نسخ أي رؤية جاهزة أو طباعتها أو تنزيلها TXT، أو سؤال Health Guide عن السجل المحدد كتابةً أو صوتًا. تُغذّي العدّادات وعلامة وجود DNA السياق الشخصي للتقارير وHealth Guide؛ ولا يُلصق محتوى DNA الخام أبدًا في مطالبات الذكاء الاصطناعي.`,
      devicesTitle: T.dev,
      devicesBody: `تغطي ${T.zone} → ${T.dev} سبع فئات: ${T.cats}. تمنحون التفويض لكل علامة تجارية بأنفسكم، ولا تُزامَن سوى المؤشرات التي توافقون عليها — بالوتيرة التي تختارونها، وشبه فورية عندما تدعم العلامة ذلك. تدخل الاتجاهات المُفسَّرة في تقاريركم وتتيح لـHealth Guide شرح الأنماط بلغة واضحة؛ ولا تُخزَّن تدفقات المستشعرات الخام.`,
      openDevices: `فتح ${T.dev} →`,
    },
    howItWorks: {
      connectTitle: 'وصّلوا أجهزتكم الصحية',
      connectSummary: `يتصل BioMath Core بالأجهزة التي يستخدمها الناس فعلًا: ${T.catsShort}. ويمكنكم أيضًا إدخال التحاليل وDNA إلى ${T.zone} كما تُكملون الاستبيان.`,
      connectPointsHeading: 'سبع فئات من الأجهزة',
      connectPoints: [
        { title: 'الساعات والأساور', body: brandList('ar', WATCH_BRANDS) },
        { title: 'الخواتم والتعافي', body: brandList('ar', RING_BRANDS) },
        { title: 'المستشعرات والأجهزة المنزلية', body: brandList('ar', SENSOR_BRANDS) },
        {
          title: 'التحاليل وDNA',
          body: `ارفعوا أو امسحوا التحاليل والتصوير وتقارير DNA وDNA الخام في ${T.rec}`,
        },
      ],
      connectChecklist: [
        `تفويض موجّه في ${T.zone} → ${T.dev}`,
        'تُزامَن المؤشرات التي توافقون عليها بالوتيرة التي تختارونها — وشبه فورية حيث تدعم العلامة ذلك',
        'رفع يدوي أو مسح بالكاميرا للتحاليل والتصوير وتقارير DNA وملفات DNA الخام',
      ],
      recordsSummary: `تقبل ${T.rec} في ${T.zone} ملفات PDF والصور وCSV وTXT وVCF. ننظّم كل ملف مرفوع، ونعيد رؤى تعليمية يمكنكم نسخها أو طباعتها أو تنزيلها، ونربط إشارات عالية المستوى (لا محتوى DNA الخام) بالتقارير وHealth Guide.`,
      recordsLastCheck: 'اسألوا Health Guide عن السجل المحدد كتابةً أو صوتًا للحصول على شرح بلغة واضحة',
      faqItems: [
        {
          question: 'ما فئات الأجهزة التي يمكنني توصيلها؟',
          answer: `سبع: ${T.cats}. تمنحون التفويض لكل علامة تجارية بأنفسكم، ولا تُزامَن سوى المؤشرات التي توافقون عليها.`,
        },
        {
          question: 'كيف تعمل نتائج التحاليل وملفات DNA مع Health Guide؟',
          answer: `ارفعوها أو امسحوها في ${T.rec}. يعيد كل سجل رؤية تعليمية يمكن نسخها أو طباعتها أو تنزيلها، ويمكنكم سؤال Health Guide عنها كتابةً أو صوتًا. يتلقى Health Guide سياقًا عالي المستوى فقط — العدّادات وتاريخ آخر تحليل وعلامة نعم/لا لوجود DNA — وليس ملفكم الجيني الخام أبدًا.`,
        },
      ],
    },
    member: {
      catalogNote: `جميع الفئات المدعومة مذكورة هنا: ${T.catsShort}.`,
      emptyBody:
        'اربطوا ساعة ذكية أو خاتمًا ذكيًا أو سوار تعافٍ أو مستشعر جلوكوز أو جهاز ضغط دم أو ميزانًا ذكيًا أو نظام نوم منزلي لتتبع بيانات الصحة تلقائيًا.',
    },
  }),

  uk: (T) => ({
    faqDevices: {
      title: 'Пристрої та моніторинг',
      items: [
        {
          question: 'Які пристрої підтримуються?',
          answer: `Сім категорій: ${T.cats}.`,
        },
        {
          question: 'Що охоплює кожна категорія пристроїв?',
          answer:
            'Розумні годинники дають пульс протягом дня, сон і активність, а часто ЕКГ або SpO₂. Розумні кільця відстежують сон, ВСР і температуру цілодобово. Браслети відновлення зосереджені на навантаженні та готовності. Сенсори безперервної глюкози показують криву глюкози протягом дня. Монітори тиску та розумні ваги додають надійні домашні вимірювання. Домашні системи сну фіксують нічні показники без пристрою на зап’ястку.',
        },
        {
          question: 'Як підключити пристрій?',
          answer: `Відкрийте ${T.zone} → ${T.dev}, виберіть бренд і пройдіть покроковий сценарій авторизації. Кожне підключення — це екран згоди крок за кроком; пристрої можна додавати або відʼєднувати будь-коли.`,
        },
        {
          question: 'Які дані надходять після підключення?',
          answer:
            'Лише показники, які ви дозволили: пульс і ВСР, фази сну, активність і навантаження, SpO₂, температуру, глюкозу, тиск, вагу та склад тіла. Оновлення надходять із вибраною вами частотою, а майже в реальному часі — там, де бренд це підтримує.',
        },
        {
          question: 'Як пристрої живлять звіти та Health Guide?',
          answer:
            'Інтерпретовані тренди з ваших пристроїв стають частиною Human Data Model, тому звіти та Health Guide пояснюють закономірності простою мовою. Це освітні пояснення, а не діагноз.',
        },
        {
          question: 'Чи зберігаєте ви необроблені дані здоровʼя?',
          answer:
            'Ні. Ми інтерпретуємо показники й зберігаємо важливі тренди — зберігати необроблені потоки сенсорів не потрібно.',
        },
        {
          question: 'Що робити, якщо синхронізація припинилася?',
          answer: `У ${T.dev} зʼявиться нагадування, коли зв’язок втратить чинність або токен потребує оновлення, і ви підключитеся знову в один клік. Попередні дані залишаються.`,
        },
        {
          question: 'Чи можна вимкнути передавання даних?',
          answer:
            'Так — миттєво. Відʼєднайте окремий пристрій або вимкніть передавання для всіх у налаштуваннях; нові показники перестають надходити відразу.',
        },
      ],
    },
    faqRecords: {
      title: 'Медкарта та ДНК',
      items: [
        {
          question: 'Чи можна завантажувати аналізи та дані ДНК?',
          answer: `Так. У ${T.zone} → ${T.rec} можна завантажувати або сканувати аналізи, знімки, PDF ДНК-звітів і файли сирої ДНК. Вони входять до профілю разом з анкетою та підключеними пристроями.`,
        },
        {
          question: 'Які формати файлів підтримуються?',
          answer:
            'PDF, JPG, PNG, WEBP, CSV, TXT, VCF і поширені текстові експорти сирої ДНК (зокрема у стилі 23andMe або Ancestry).',
        },
        {
          question: 'Чи можна сканувати паперовий результат камерою?',
          answer:
            'Так. На мобільному можна сфотографувати сторінку камерою, якщо браузер це дозволяє — зручно для роздрукованих бланків аналізів. Робіть по одному фото на сторінку та виберіть тип запису перед збереженням.',
        },
        {
          question: 'Що відбувається після завантаження?',
          answer:
            'Кожен елемент проходить статуси Отримано → На перевірці → Insights готові. Коли готово, ви отримуєте освітнє пояснення, висновки та рекомендації. Це структурований прийом із шаблонами insights — не повний геномний конвеєр.',
        },
        {
          question: 'Чи можна скопіювати, надрукувати або зберегти insight?',
          answer:
            'Так. Для кожного готового insight є Копіювати, Друк і Завантажити TXT — щоб зберегти копію або взяти її на прийом.',
        },
        {
          question: 'Як завантаження впливають на звіти та Health Guide?',
          answer:
            'Завантаження додають персональний контекст високого рівня: кількість за типами, чи є ДНК у файлі та дату останніх аналізів. Звіти та Health Guide використовують ці сигнали разом з анкетою й трендами пристроїв. Повний вміст сирої ДНК ніколи не вставляється в AI-промпти.',
        },
        {
          question: 'Чи можна запитати Health Guide про запис голосом?',
          answer:
            'Так. Виберіть запис і запитайте Health Guide текстом або голосом. Відповіді звучать простою мовою — зручно, коли руки зайняті.',
        },
        {
          question: 'Чи захищена сира ДНК від AI-промптів?',
          answer:
            'Так. Health Guide і передмови звітів отримують лише позначку так/ні «сира ДНК у файлі» та освітні шаблони — ніколи повний генетичний файл.',
        },
      ],
    },
    learning: {
      healthRecordsBody: `У ${T.zone} → ${T.rec} можна завантажувати або сканувати аналізи, знімки, PDF ДНК-звітів і файли сирої ДНК (PDF, зображення, CSV, TXT, VCF). На мобільному роздрукований бланк можна сфотографувати камерою. Файли проходять статуси Отримано → На перевірці → Insights готові. Insights пояснюють запис, наводять висновки й рекомендації та залишаються освітніми — це не діагноз. Будь-який готовий insight можна Копіювати, Друкувати або Завантажити TXT, а також запитати Health Guide про вибраний запис текстом чи голосом. Кількості та позначка про ДНК у файлі формують персональний контекст для звітів і Health Guide; вміст сирої ДНК ніколи не вставляється в AI-промпти.`,
      devicesTitle: T.dev,
      devicesBody: `${T.zone} → ${T.dev} охоплює сім категорій: ${T.cats}. Ви самі авторизуєте кожен бренд, і синхронізуються лише показники, які ви дозволили — з вибраною частотою, а майже в реальному часі там, де бренд це підтримує. Інтерпретовані тренди живлять ваші звіти й дають Health Guide змогу пояснювати закономірності простою мовою; необроблені потоки сенсорів не зберігаються.`,
      openDevices: `Відкрити ${T.dev} →`,
    },
    howItWorks: {
      connectTitle: 'Підключіть свої пристрої здоровʼя',
      connectSummary: `BioMath Core працює з пристроями, якими люди справді користуються: ${T.catsShort}. Аналізи й ДНК можна внести до ${T.zone} так само, як ви заповнюєте анкету.`,
      connectPointsHeading: 'Сім категорій пристроїв',
      connectPoints: [
        { title: 'Годинники та браслети', body: brandList('uk', WATCH_BRANDS) },
        { title: 'Кільця та відновлення', body: brandList('uk', RING_BRANDS) },
        { title: 'Сенсори та домашні пристрої', body: brandList('uk', SENSOR_BRANDS) },
        {
          title: 'Аналізи та ДНК',
          body: `Завантажте або скануйте аналізи, знімки, ДНК-звіти й сиру ДНК у ${T.rec}`,
        },
      ],
      connectChecklist: [
        `Покрокова авторизація у ${T.zone} → ${T.dev}`,
        'Дозволені показники синхронізуються з вибраною частотою — майже в реальному часі, де бренд це підтримує',
        'Ручне завантаження або сканування камерою для аналізів, знімків, ДНК-звітів і файлів сирої ДНК',
      ],
      recordsSummary: `${T.rec} у ${T.zone} приймає PDF, зображення, CSV, TXT і VCF. Ми структуруємо кожне завантаження, повертаємо освітні insights, які можна копіювати, друкувати або завантажити, і звʼязуємо сигнали високого рівня (не вміст сирої ДНК) зі звітами та Health Guide.`,
      recordsLastCheck:
        'Запитайте Health Guide про вибраний запис текстом або голосом — для пояснення простою мовою',
      faqItems: [
        {
          question: 'Які категорії пристроїв можна підключити?',
          answer: `Сім: ${T.cats}. Ви самі авторизуєте кожен бренд, і синхронізуються лише дозволені показники.`,
        },
        {
          question: 'Як аналізи та файли ДНК працюють з Health Guide?',
          answer: `Завантажте або скануйте їх у ${T.rec}. Кожен запис повертає освітній insight, який можна копіювати, друкувати або завантажити, і про нього можна запитати Health Guide текстом чи голосом. Health Guide отримує лише контекст високого рівня — кількості, дату останніх аналізів і позначку так/ні про ДНК у файлі — і ніколи ваш сирий генетичний файл.`,
        },
      ],
    },
    member: {
      catalogNote: `Тут перелічені всі підтримувані категорії: ${T.catsShort}.`,
      emptyBody:
        'Підключіть розумний годинник, розумне кільце, браслет відновлення, сенсор глюкози, монітор тиску, розумні ваги або домашню систему сну, щоб автоматично відстежувати дані здоровʼя.',
    },
  }),

  ru: (T) => ({
    faqDevices: {
      title: 'Устройства и наблюдение',
      items: [
        {
          question: 'Какие устройства поддерживаются?',
          answer: `Семь категорий: ${T.cats}.`,
        },
        {
          question: 'Что охватывает каждая категория устройств?',
          answer:
            'Умные часы дают пульс в течение дня, сон и активность, часто ЭКГ или SpO₂. Умные кольца отслеживают сон, ВСР и температуру круглосуточно. Браслеты восстановления сосредоточены на нагрузке и готовности. Сенсоры непрерывной глюкозы показывают кривую глюкозы в течение дня. Тонометры и умные весы добавляют надёжные домашние измерения. Домашние системы сна фиксируют ночные показатели без устройства на руке.',
        },
        {
          question: 'Как подключить устройство?',
          answer: `Откройте ${T.zone} → ${T.dev}, выберите бренд и пройдите пошаговый сценарий авторизации. Каждое подключение — это экран согласия шаг за шагом; устройства можно добавлять и отключать в любой момент.`,
        },
        {
          question: 'Какие данные поступают после подключения?',
          answer:
            'Только те показатели, которые вы разрешили: пульс и ВСР, фазы сна, активность и нагрузку, SpO₂, температуру, глюкозу, давление, вес и состав тела. Обновления приходят с выбранной вами частотой, а почти в реальном времени — там, где бренд это поддерживает.',
        },
        {
          question: 'Как устройства питают отчёты и Health Guide?',
          answer:
            'Интерпретированные тренды с ваших устройств становятся частью Human Data Model, поэтому отчёты и Health Guide объясняют закономерности простыми словами. Это образовательные пояснения, а не диагноз.',
        },
        {
          question: 'Храните ли вы необработанные данные о здоровье?',
          answer:
            'Нет. Мы интерпретируем показатели и сохраняем важные тренды — хранить необработанные потоки датчиков не нужно.',
        },
        {
          question: 'Что делать, если синхронизация прервалась?',
          answer: `В ${T.dev} появится напоминание, когда связь истечёт или потребуется обновить токен, и вы подключитесь заново в один клик. Прежние данные остаются на месте.`,
        },
        {
          question: 'Можно ли отключить передачу данных?',
          answer:
            'Да — мгновенно. Отключите отдельное устройство или выключите передачу для всех в настройках; новые показатели перестают поступать сразу.',
        },
      ],
    },
    faqRecords: {
      title: 'Медкарта и ДНК',
      items: [
        {
          question: 'Можно ли загружать анализы и ДНК?',
          answer: `Да. В ${T.zone} → ${T.rec} можно загружать или сканировать анализы, снимки, PDF ДНК-отчётов и файлы сырой ДНК. Они входят в профиль вместе с анкетой и подключёнными устройствами.`,
        },
        {
          question: 'Какие форматы поддерживаются?',
          answer:
            'PDF, JPG, PNG, WEBP, CSV, TXT, VCF и распространённые текстовые экспорты сырой ДНК (в том числе в стиле 23andMe или Ancestry).',
        },
        {
          question: 'Можно ли отсканировать бумажный результат камерой?',
          answer:
            'Да. На мобильном можно сфотографировать страницу камерой, если браузер это разрешает — удобно для распечатанных бланков анализов. Делайте по одному снимку на страницу и выберите тип записи перед сохранением.',
        },
        {
          question: 'Что происходит после загрузки?',
          answer:
            'Каждый элемент проходит статусы Получено → На проверке → Insights готовы. Когда готово, вы получаете образовательное объяснение, выводы и рекомендации. Это структурированный приём с шаблонами insights — не полный геномный конвейер.',
        },
        {
          question: 'Можно ли скопировать, распечатать или сохранить insight?',
          answer:
            'Да. У каждого готового insight есть Копировать, Печать и Скачать TXT — чтобы сохранить копию или взять её на приём.',
        },
        {
          question: 'Как загрузки влияют на отчёты и Health Guide?',
          answer:
            'Загрузки дают персональный контекст высокого уровня: количество по типам, есть ли ДНК в файле и дата последних анализов. Отчёты и Health Guide используют эти сигналы вместе с анкетой и трендами устройств. Полное содержимое сырой ДНК никогда не вставляется в AI-промпты.',
        },
        {
          question: 'Можно ли спросить Health Guide о записи голосом?',
          answer:
            'Да. Выберите запись и спросите Health Guide текстом или голосом. Ответы звучат простыми словами — удобно, когда руки заняты.',
        },
        {
          question: 'Сырая ДНК скрыта от AI-промптов?',
          answer:
            'Да. Health Guide и предисловия отчётов получают только флаг да/нет «сырая ДНК в файле» и образовательные шаблоны — никогда полный генетический файл.',
        },
      ],
    },
    learning: {
      healthRecordsBody: `В ${T.zone} → ${T.rec} можно загружать или сканировать анализы, снимки, PDF ДНК-отчётов и файлы сырой ДНК (PDF, изображения, CSV, TXT, VCF). На мобильном распечатанный бланк можно сфотографировать камерой. Файлы проходят статусы Получено → На проверке → Insights готовы. Insights объясняют запись, приводят выводы и рекомендации и остаются образовательными — это не диагноз. Любой готовый insight можно Копировать, Печатать или Скачать TXT, а также спросить Health Guide о выбранной записи текстом или голосом. Количество записей и флаг наличия ДНК формируют персональный контекст для отчётов и Health Guide; содержимое сырой ДНК никогда не вставляется в AI-промпты.`,
      devicesTitle: T.dev,
      devicesBody: `${T.zone} → ${T.dev} охватывает семь категорий: ${T.cats}. Каждый бренд вы авторизуете сами, и синхронизируются только те показатели, которые вы разрешили — с выбранной частотой, а почти в реальном времени там, где бренд это поддерживает. Интерпретированные тренды питают ваши отчёты и позволяют Health Guide объяснять закономерности простыми словами; необработанные потоки датчиков не сохраняются.`,
      openDevices: `Открыть ${T.dev} →`,
    },
    howItWorks: {
      connectTitle: 'Подключите устройства здоровья',
      connectSummary: `BioMath Core работает с устройствами, которыми люди действительно пользуются: ${T.catsShort}. Анализы и ДНК можно внести в ${T.zone} так же, как вы заполняете анкету.`,
      connectPointsHeading: 'Семь категорий устройств',
      connectPoints: [
        { title: 'Часы и браслеты', body: brandList('ru', WATCH_BRANDS) },
        { title: 'Кольца и восстановление', body: brandList('ru', RING_BRANDS) },
        { title: 'Сенсоры и домашние приборы', body: brandList('ru', SENSOR_BRANDS) },
        {
          title: 'Анализы и ДНК',
          body: `Загрузите или отсканируйте анализы, снимки, ДНК-отчёты и сырую ДНК в ${T.rec}`,
        },
      ],
      connectChecklist: [
        `Пошаговая авторизация в ${T.zone} → ${T.dev}`,
        'Разрешённые показатели синхронизируются с выбранной частотой — почти в реальном времени там, где бренд это поддерживает',
        'Ручная загрузка или сканирование камерой для анализов, снимков, ДНК-отчётов и файлов сырой ДНК',
      ],
      recordsSummary: `${T.rec} в ${T.zone} принимает PDF, изображения, CSV, TXT и VCF. Мы структурируем каждую загрузку, возвращаем образовательные insights, которые можно копировать, печатать или скачать, и связываем сигналы высокого уровня (не содержимое сырой ДНК) с отчётами и Health Guide.`,
      recordsLastCheck:
        'Спросите Health Guide о выбранной записи текстом или голосом — получите объяснение простыми словами',
      faqItems: [
        {
          question: 'Какие категории устройств можно подключить?',
          answer: `Семь: ${T.cats}. Каждый бренд вы авторизуете сами, и синхронизируются только разрешённые показатели.`,
        },
        {
          question: 'Как анализы и файлы ДНК работают с Health Guide?',
          answer: `Загрузите или отсканируйте их в ${T.rec}. Каждая запись возвращает образовательный insight, который можно копировать, печатать или скачать, и о нём можно спросить Health Guide текстом или голосом. Health Guide получает только контекст высокого уровня — количество, дату последних анализов и флаг да/нет о наличии ДНК — и никогда ваш сырой генетический файл.`,
        },
      ],
    },
    member: {
      catalogNote: `Здесь перечислены все поддерживаемые категории: ${T.catsShort}.`,
      emptyBody:
        'Подключите умные часы, умное кольцо, браслет восстановления, сенсор глюкозы, тонометр, умные весы или домашнюю систему сна, чтобы автоматически отслеживать данные здоровья.',
    },
  }),
};

function packPath(lang, pack) {
  return join(localesDir, lang, `${pack}.json`);
}

function readPack(lang, pack) {
  return JSON.parse(readFileSync(packPath(lang, pack), 'utf8'));
}

function writePack(lang, pack, data) {
  writeFileSync(packPath(lang, pack), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

/** Rebuild an object with `newKey` placed directly after `afterKey` (append if absent). */
function withKeyAfter(source, afterKey, newKey, value) {
  const out = {};
  let placed = false;
  for (const [key, val] of Object.entries(source)) {
    if (key === newKey) continue;
    out[key] = val;
    if (key === afterKey) {
      out[newKey] = value;
      placed = true;
    }
  }
  if (!placed) out[newKey] = value;
  return out;
}

function buildFaqSection(id, title, ids, items) {
  return {
    id,
    title,
    items: ids.map((itemId, index) => ({
      id: itemId,
      question: items[index].question,
      answer: items[index].answer,
    })),
  };
}

function applyFaq(lang, content) {
  const data = readPack(lang, 'faq');
  const sections = data.faq.sections;
  const devicesIndex = sections.findIndex((section) => section.id === 'devices');
  const recordsIndex = sections.findIndex((section) => section.id === 'health-records-dna');
  if (devicesIndex === -1) throw new Error(`${lang}/faq.json: missing "devices" section`);
  if (recordsIndex === -1) throw new Error(`${lang}/faq.json: missing "health-records-dna" section`);

  sections[devicesIndex] = buildFaqSection(
    'devices',
    content.faqDevices.title,
    DEVICE_FAQ_IDS,
    content.faqDevices.items,
  );
  sections[recordsIndex] = buildFaqSection(
    'health-records-dna',
    content.faqRecords.title,
    RECORD_FAQ_IDS,
    content.faqRecords.items,
  );

  writePack(lang, 'faq', data);
}

function applyLearning(lang, content) {
  const data = readPack(lang, 'learning');
  const learning = data.learning;
  if (!learning.sections?.healthRecords) {
    throw new Error(`${lang}/learning.json: missing sections.healthRecords`);
  }

  learning.sections.healthRecords.body = content.learning.healthRecordsBody;
  learning.sections = withKeyAfter(learning.sections, 'healthRecords', 'devices', {
    title: content.learning.devicesTitle,
    body: content.learning.devicesBody,
  });

  data.learning = withKeyAfter(learning, 'goToMember', 'openDevices', content.learning.openDevices);

  writePack(lang, 'learning', data);
}

function applyHowItWorks(lang, content) {
  const data = readPack(lang, 'howItWorks');
  const steps = data.howItWorks.steps;

  steps.connect = {
    title: content.howItWorks.connectTitle,
    summary: content.howItWorks.connectSummary,
    pointsHeading: content.howItWorks.connectPointsHeading,
    points: content.howItWorks.connectPoints,
    checklist: content.howItWorks.connectChecklist,
  };

  steps.records.summary = content.howItWorks.recordsSummary;
  steps.records.checklist[steps.records.checklist.length - 1] = content.howItWorks.recordsLastCheck;

  const faq = data.howItWorks.faq;
  faq.items = [...faq.items.slice(0, 6), ...content.howItWorks.faqItems];

  writePack(lang, 'howItWorks', data);
}

function applyMember(lang, content) {
  const data = readPack(lang, 'member');
  const devices = data.member.devices;

  devices.deviceTypes = { ...DEVICE_TYPES };
  devices.emptyBody = content.member.emptyBody;
  data.member.devices = withKeyAfter(devices, 'supportedDevices', 'catalogNote', content.member.catalogNote);

  writePack(lang, 'member', data);
}

function verify(lang) {
  const problems = [];

  const faq = readPack(lang, 'faq').faq;
  const devices = faq.sections.find((section) => section.id === 'devices');
  const records = faq.sections.find((section) => section.id === 'health-records-dna');
  const deviceIds = devices.items.map((item) => item.id).join(',');
  const recordIds = records.items.map((item) => item.id).join(',');
  if (deviceIds !== DEVICE_FAQ_IDS.join(',')) problems.push(`faq devices ids: ${deviceIds}`);
  if (recordIds !== RECORD_FAQ_IDS.join(',')) problems.push(`faq records ids: ${recordIds}`);
  for (const item of [...devices.items, ...records.items]) {
    if (!item.question || !item.answer) problems.push(`faq empty item: ${item.id}`);
  }

  const learning = readPack(lang, 'learning').learning;
  if (!learning.sections.devices?.title || !learning.sections.devices?.body) {
    problems.push('learning.sections.devices incomplete');
  }
  if (!learning.openDevices) problems.push('learning.openDevices missing');

  const howItWorks = readPack(lang, 'howItWorks').howItWorks;
  if (howItWorks.steps.connect.points.length !== 4) problems.push('connect.points !== 4');
  if (howItWorks.steps.connect.checklist.length !== 3) problems.push('connect.checklist !== 3');
  if (howItWorks.steps.records.checklist.length !== 4) problems.push('records.checklist !== 4');
  if (howItWorks.faq.items.length !== 8) problems.push(`howItWorks.faq.items === ${howItWorks.faq.items.length}`);

  const memberDevices = readPack(lang, 'member').member.devices;
  const typeKeys = Object.keys(memberDevices.deviceTypes);
  if (typeKeys.length !== Object.keys(DEVICE_TYPES).length) {
    problems.push(`deviceTypes count === ${typeKeys.length}`);
  }
  if (!memberDevices.deviceTypes.cgm) problems.push('deviceTypes.cgm alias missing');
  if (!memberDevices.catalogNote) problems.push('member.devices.catalogNote missing');

  return problems;
}

const touched = [];
const failures = [];

for (const lang of LANGS) {
  const build = CONTENT[lang];
  if (!build) throw new Error(`No content defined for ${lang}`);
  const content = build(TERMS[lang]);

  applyFaq(lang, content);
  applyLearning(lang, content);
  applyHowItWorks(lang, content);
  applyMember(lang, content);
  touched.push(
    `src/locales/${lang}/faq.json`,
    `src/locales/${lang}/learning.json`,
    `src/locales/${lang}/howItWorks.json`,
    `src/locales/${lang}/member.json`,
  );

  const problems = verify(lang);
  if (problems.length > 0) failures.push(`${lang}: ${problems.join('; ')}`);
}

console.log(`Updated ${touched.length} files across ${LANGS.length} languages:`);
for (const file of touched) console.log(`  ${file}`);

if (failures.length > 0) {
  console.error('\nVerification problems:');
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

console.log('\nVerification passed: FAQ item ids, learning keys, How It Works shape, member device catalog.');
