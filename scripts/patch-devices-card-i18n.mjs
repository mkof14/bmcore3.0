#!/usr/bin/env node
/**
 * Adds per-device connect / syncs / tip fields + card status chrome to all devices.json packs,
 * and rephrases member demo-facing strings across member.json packs.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const langs = ['en', 'es', 'fr', 'de', 'ja', 'he', 'zh', 'ar', 'uk', 'ru'];

const enDeviceExtras = {
  apple_watch: {
    connect:
      'Wear your Apple Watch and open the Health app on your iPhone. In BioMath Core, choose Apple Watch and approve sharing for heart rate, sleep, activity, and related metrics.',
    syncs: 'Heart rate, HRV, sleep stages, SpO₂, ECG (where available), workouts, and activity load.',
    tip: 'Keep the watch on overnight so sleep staging and morning readiness have a full picture.',
  },
  samsung_galaxy_watch: {
    connect:
      'Pair the Galaxy Watch with Samsung Health on your phone. In BioMath Core, authorize Samsung Health for the metrics you want to share.',
    syncs: 'Heart rate, HRV, sleep, SpO₂, activity, ECG, and blood pressure on supported models.',
    tip: 'Complete any Samsung Health calibration steps for cuffless blood pressure before expecting those readings.',
  },
  garmin: {
    connect:
      'Sync your Garmin with Garmin Connect. In BioMath Core, link Garmin Connect and approve training, recovery, and sleep metrics.',
    syncs: 'Heart rate, HRV, sleep, activity, training load, recovery, and stress scores.',
    tip: 'Open Garmin Connect once after workouts so BioMath Core receives the latest training files.',
  },
  google_pixel_watch: {
    connect:
      'Keep Fitbit / Google Fit syncing on your phone. In BioMath Core, authorize Fitbit-backed metrics from your Pixel Watch.',
    syncs: 'Heart rate, sleep, activity, SpO₂, and everyday movement patterns.',
    tip: 'Charge before bed or keep overnight wear consistent so sleep trends stay comparable week to week.',
  },
  oura: {
    connect:
      'Wear the Oura Ring and open the Oura app. In BioMath Core, authorize Oura for sleep, readiness, and recovery metrics.',
    syncs: 'Sleep stages, HRV, resting heart rate, temperature trends, readiness, and activity.',
    tip: 'A snug overnight fit improves temperature and HRV quality for recovery insight.',
  },
  ultrahuman: {
    connect:
      'Pair the Ultrahuman Ring in its companion app. In BioMath Core, authorize Ultrahuman for sleep and recovery signals.',
    syncs: 'Sleep, HRV, heart rate, temperature, and recovery-oriented daily scores.',
    tip: 'Wear continuously for a few days so recovery baselines settle before comparing days.',
  },
  whoop: {
    connect:
      'Wear WHOOP and keep the WHOOP app synced. In BioMath Core, authorize WHOOP for strain, recovery, and sleep.',
    syncs: 'Strain, recovery, sleep performance, HRV, resting heart rate, and activity load.',
    tip: 'Leave the band on during workouts and overnight so strain and recovery stay aligned.',
  },
  dexcom_g7: {
    connect:
      'Follow Dexcom setup for sensor warm-up. In BioMath Core, authorize Dexcom to share continuous glucose readings you approve.',
    syncs: 'Continuous glucose curves and related time-in-range style trends for educational insight.',
    tip: 'Note meal times in your own routine so glucose swings are easier to interpret later.',
  },
  freestyle_libre: {
    connect:
      'Activate the FreeStyle Libre sensor in LibreLink / Libre app. In BioMath Core, authorize Libre glucose sharing.',
    syncs: 'Flash or continuous glucose readings for day-to-day metabolic awareness.',
    tip: 'Scan or keep the phone nearby as your Libre model requires so gaps stay short.',
  },
  omron: {
    connect:
      'Pair your Omron cuff with the Omron Connect app. In BioMath Core, authorize Omron for blood-pressure readings.',
    syncs: 'Systolic, diastolic, and pulse readings from home cuff measurements.',
    tip: 'Measure at a consistent time, seated and rested, for cleaner week-to-week trends.',
  },
  withings_bpm: {
    connect:
      'Connect Withings BPM in the Health Mate / Withings app. In BioMath Core, authorize Withings blood-pressure data.',
    syncs: 'Validated cuff blood-pressure readings and related pulse metrics.',
    tip: 'Use the same arm and posture each session so comparisons stay meaningful.',
  },
  withings_body: {
    connect:
      'Step on the Withings scale while it is linked in Health Mate. In BioMath Core, authorize weight and body-composition metrics.',
    syncs: 'Weight, BMI, and body-composition estimates such as fat and muscle trends.',
    tip: 'Weigh at a similar time of day, ideally mornings, for smoother trend lines.',
  },
  eight_sleep: {
    connect:
      'Keep the Eight Sleep Pod online in the Eight Sleep app. In BioMath Core, authorize sleep and overnight vitals.',
    syncs: 'Sleep stages, overnight heart rate, HRV, and bed temperature signals.',
    tip: 'Leave the cover powered and connected overnight so stages and vitals sync by morning.',
  },
  fitbit: {
    connect:
      'Sync your Fitbit with the Fitbit app. In BioMath Core, authorize Fitbit for sleep, heart rate, and activity.',
    syncs: 'Heart rate, HRV, sleep, activity, stress, and SpO₂ where the model supports them.',
    tip: 'Enable overnight sleep tracking in Fitbit settings so BioMath Core receives full nights.',
  },
  polar: {
    connect:
      'Pair Polar with Polar Flow. In BioMath Core, authorize Polar for heart rate, training, and recovery.',
    syncs: 'Heart rate, HRV, sleep, activity, training load, and recovery metrics.',
    tip: 'Sync Polar Flow after sessions so recovery and load update before morning guidance.',
  },
};

const cardChrome = {
  en: {
    cardStatus: {
      available: 'Available to connect',
      connected: 'Connected',
      notConnected: 'Not connected',
    },
    card: {
      howToConnect: 'How to connect',
      whatSyncs: 'What syncs',
      tip: 'Tip',
      showGuide: 'Connection guide',
      hideGuide: 'Hide guide',
    },
    emptyBrands:
      'Explore the full device guide above, then connect from Cabinet when you are signed in.',
  },
  es: {
    cardStatus: {
      available: 'Disponible para conectar',
      connected: 'Conectado',
      notConnected: 'No conectado',
    },
    card: {
      howToConnect: 'Cómo conectar',
      whatSyncs: 'Qué se sincroniza',
      tip: 'Consejo',
      showGuide: 'Guía de conexión',
      hideGuide: 'Ocultar guía',
    },
    emptyBrands:
      'Explora la guía de dispositivos arriba y conéctalos desde el Gabinete cuando hayas iniciado sesión.',
  },
  fr: {
    cardStatus: {
      available: 'Disponible à connecter',
      connected: 'Connecté',
      notConnected: 'Non connecté',
    },
    card: {
      howToConnect: 'Comment connecter',
      whatSyncs: 'Données synchronisées',
      tip: 'Conseil',
      showGuide: 'Guide de connexion',
      hideGuide: 'Masquer le guide',
    },
    emptyBrands:
      'Explorez le guide des appareils ci-dessus, puis connectez-les depuis le Cabinet une fois connecté.',
  },
  de: {
    cardStatus: {
      available: 'Bereit zur Verbindung',
      connected: 'Verbunden',
      notConnected: 'Nicht verbunden',
    },
    card: {
      howToConnect: 'So verbinden',
      whatSyncs: 'Was synchronisiert wird',
      tip: 'Tipp',
      showGuide: 'Verbindungsanleitung',
      hideGuide: 'Anleitung ausblenden',
    },
    emptyBrands:
      'Erkunden Sie den Geräteführer oben und verbinden Sie Geräte im Cabinet, wenn Sie angemeldet sind.',
  },
  ja: {
    cardStatus: {
      available: '接続可能',
      connected: '接続済み',
      notConnected: '未接続',
    },
    card: {
      howToConnect: '接続方法',
      whatSyncs: '同期されるデータ',
      tip: 'ヒント',
      showGuide: '接続ガイド',
      hideGuide: 'ガイドを隠す',
    },
    emptyBrands: '上のデバイスガイドを確認し、サインイン後にキャビネットから接続できます。',
  },
  he: {
    cardStatus: {
      available: 'זמין לחיבור',
      connected: 'מחובר',
      notConnected: 'לא מחובר',
    },
    card: {
      howToConnect: 'איך להתחבר',
      whatSyncs: 'מה מסונכרן',
      tip: 'טיפ',
      showGuide: 'מדריך חיבור',
      hideGuide: 'הסתר מדריך',
    },
    emptyBrands: 'עיינו במדריך המכשירים למעלה, ואז חברו מהקבינט לאחר ההתחברות.',
  },
  zh: {
    cardStatus: {
      available: '可连接',
      connected: '已连接',
      notConnected: '未连接',
    },
    card: {
      howToConnect: '如何连接',
      whatSyncs: '同步内容',
      tip: '提示',
      showGuide: '连接指南',
      hideGuide: '隐藏指南',
    },
    emptyBrands: '先浏览上方设备指南，登录后即可在工作台连接。',
  },
  ar: {
    cardStatus: {
      available: 'متاح للاتصال',
      connected: 'متصل',
      notConnected: 'غير متصل',
    },
    card: {
      howToConnect: 'طريقة الاتصال',
      whatSyncs: 'ما تتم مزامنته',
      tip: 'نصيحة',
      showGuide: 'دليل الاتصال',
      hideGuide: 'إخفاء الدليل',
    },
    emptyBrands: 'استكشف دليل الأجهزة أعلاه، ثم اتصل من الكابينت بعد تسجيل الدخول.',
  },
  uk: {
    cardStatus: {
      available: 'Доступно до підключення',
      connected: 'Підключено',
      notConnected: 'Не підключено',
    },
    card: {
      howToConnect: 'Як підключити',
      whatSyncs: 'Що синхронізується',
      tip: 'Порада',
      showGuide: 'Інструкція з підключення',
      hideGuide: 'Сховати інструкцію',
    },
    emptyBrands:
      'Перегляньте повний гід пристроїв вище, а потім підключіть їх у Кабінеті після входу.',
  },
  ru: {
    cardStatus: {
      available: 'Доступно к подключению',
      connected: 'Подключено',
      notConnected: 'Не подключено',
    },
    card: {
      howToConnect: 'Как подключить',
      whatSyncs: 'Что синхронизируется',
      tip: 'Совет',
      showGuide: 'Инструкция по подключению',
      hideGuide: 'Скрыть инструкцию',
    },
    emptyBrands:
      'Изучите полный гид по устройствам выше, затем подключите их в Кабинете после входа.',
  },
};

/** Per-lang translations for connect/syncs/tip — accurate, not English placeholders. */
const deviceExtrasByLang = {
  en: enDeviceExtras,
  es: {
    apple_watch: {
      connect:
        'Usa el Apple Watch y abre la app Salud en el iPhone. En BioMath Core, elige Apple Watch y autoriza frecuencia cardíaca, sueño, actividad y métricas relacionadas.',
      syncs: 'Frecuencia cardíaca, VFC, fases del sueño, SpO₂, ECG (si está disponible), entrenamientos y carga de actividad.',
      tip: 'Llévalo por la noche para que el sueño y la recuperación matutina tengan una imagen completa.',
    },
    samsung_galaxy_watch: {
      connect:
        'Empareja el Galaxy Watch con Samsung Health. En BioMath Core, autoriza Samsung Health para las métricas que quieras compartir.',
      syncs: 'Frecuencia cardíaca, VFC, sueño, SpO₂, actividad, ECG y presión arterial en modelos compatibles.',
      tip: 'Completa la calibración de Samsung Health para la presión sin manguito antes de esperar esas lecturas.',
    },
    garmin: {
      connect:
        'Sincroniza Garmin con Garmin Connect. En BioMath Core, vincula Garmin Connect y autoriza entrenamiento, recuperación y sueño.',
      syncs: 'Frecuencia cardíaca, VFC, sueño, actividad, carga de entrenamiento, recuperación y estrés.',
      tip: 'Abre Garmin Connect tras los entrenos para que lleguen los archivos más recientes.',
    },
    google_pixel_watch: {
      connect:
        'Mantén Fitbit / Google Fit sincronizado. En BioMath Core, autoriza las métricas de Fitbit del Pixel Watch.',
      syncs: 'Frecuencia cardíaca, sueño, actividad, SpO₂ y patrones de movimiento diarios.',
      tip: 'Carga antes de dormir o mantén un uso nocturno constante para comparar semanas.',
    },
    oura: {
      connect:
        'Usa el anillo Oura y abre la app Oura. En BioMath Core, autoriza sueño, readiness y recuperación.',
      syncs: 'Fases del sueño, VFC, FC en reposo, temperatura, readiness y actividad.',
      tip: 'Un ajuste cómodo por la noche mejora la calidad de temperatura y VFC.',
    },
    ultrahuman: {
      connect:
        'Empareja el Ultrahuman Ring en su app. En BioMath Core, autoriza señales de sueño y recuperación.',
      syncs: 'Sueño, VFC, frecuencia cardíaca, temperatura y puntuaciones diarias de recuperación.',
      tip: 'Úsalo varios días seguidos para estabilizar la línea base de recuperación.',
    },
    whoop: {
      connect:
        'Usa WHOOP y mantén la app sincronizada. En BioMath Core, autoriza strain, recuperación y sueño.',
      syncs: 'Strain, recuperación, sueño, VFC, FC en reposo y carga de actividad.',
      tip: 'Déjalo puesto en entrenos y por la noche para alinear strain y recuperación.',
    },
    dexcom_g7: {
      connect:
        'Configura Dexcom y espera el calentamiento del sensor. En BioMath Core, autoriza las lecturas de glucosa continua.',
      syncs: 'Curvas de glucosa continua y tendencias educativas de tiempo en rango.',
      tip: 'Anota horarios de comida en tu rutina para interpretar mejor las oscilaciones.',
    },
    freestyle_libre: {
      connect:
        'Activa el sensor FreeStyle Libre en LibreLink. En BioMath Core, autoriza el intercambio de glucosa Libre.',
      syncs: 'Lecturas flash o continuas de glucosa para conciencia metabólica diaria.',
      tip: 'Escanea o mantén el teléfono cerca según tu modelo para reducir huecos.',
    },
    omron: {
      connect:
        'Empareja el manguito Omron con Omron Connect. En BioMath Core, autoriza las lecturas de presión.',
      syncs: 'Sistólica, diastólica y pulso de mediciones en casa.',
      tip: 'Mide a la misma hora, sentado y en reposo, para tendencias más limpias.',
    },
    withings_bpm: {
      connect:
        'Conecta Withings BPM en Health Mate. En BioMath Core, autoriza los datos de presión Withings.',
      syncs: 'Lecturas validadas de presión y pulso relacionado.',
      tip: 'Usa el mismo brazo y postura en cada sesión.',
    },
    withings_body: {
      connect:
        'Súbete a la báscula Withings enlazada en Health Mate. En BioMath Core, autoriza peso y composición.',
      syncs: 'Peso, IMC y estimaciones de composición corporal.',
      tip: 'Pésate a una hora similar, idealmente por la mañana.',
    },
    eight_sleep: {
      connect:
        'Mantén el Pod Eight Sleep en línea en su app. En BioMath Core, autoriza sueño y vitales nocturnos.',
      syncs: 'Fases del sueño, FC nocturna, VFC y señales de temperatura de la cama.',
      tip: 'Deja la funda encendida y conectada por la noche para sincronizar al despertar.',
    },
    fitbit: {
      connect:
        'Sincroniza Fitbit con su app. En BioMath Core, autoriza sueño, frecuencia cardíaca y actividad.',
      syncs: 'Frecuencia cardíaca, VFC, sueño, actividad, estrés y SpO₂ según el modelo.',
      tip: 'Activa el seguimiento nocturno en Fitbit para noches completas.',
    },
    polar: {
      connect:
        'Empareja Polar con Polar Flow. En BioMath Core, autoriza FC, entrenamiento y recuperación.',
      syncs: 'Frecuencia cardíaca, VFC, sueño, actividad, carga de entrenamiento y recuperación.',
      tip: 'Sincroniza Polar Flow tras las sesiones antes de la guía matutina.',
    },
  },
  fr: {
    apple_watch: {
      connect:
        'Portez l’Apple Watch et ouvrez Santé sur l’iPhone. Dans BioMath Core, choisissez Apple Watch et autorisez les métriques souhaitées.',
      syncs: 'Fréquence cardiaque, VFC, phases de sommeil, SpO₂, ECG (si disponible), séances et charge d’activité.',
      tip: 'Gardez la montre la nuit pour un sommeil et une récupération plus complets.',
    },
    samsung_galaxy_watch: {
      connect:
        'Associez la Galaxy Watch à Samsung Health. Dans BioMath Core, autorisez Samsung Health pour les métriques à partager.',
      syncs: 'Fréquence cardiaque, VFC, sommeil, SpO₂, activité, ECG et tension sur modèles compatibles.',
      tip: 'Terminez la calibration Samsung Health pour la tension sans brassard avant d’attendre ces lectures.',
    },
    garmin: {
      connect:
        'Synchronisez Garmin avec Garmin Connect. Dans BioMath Core, liez Garmin Connect pour entraînement, récupération et sommeil.',
      syncs: 'Fréquence cardiaque, VFC, sommeil, activité, charge d’entraînement, récupération et stress.',
      tip: 'Ouvrez Garmin Connect après les séances pour recevoir les derniers fichiers.',
    },
    google_pixel_watch: {
      connect:
        'Gardez Fitbit / Google Fit synchronisé. Dans BioMath Core, autorisez les métriques Fitbit de la Pixel Watch.',
      syncs: 'Fréquence cardiaque, sommeil, activité, SpO₂ et mouvements quotidiens.',
      tip: 'Chargez avant le coucher ou portez la nuit de façon régulière pour comparer les semaines.',
    },
    oura: {
      connect:
        'Portez l’anneau Oura et ouvrez l’app Oura. Dans BioMath Core, autorisez sommeil, readiness et récupération.',
      syncs: 'Phases de sommeil, VFC, FC au repos, température, readiness et activité.',
      tip: 'Un ajustement confortable la nuit améliore température et VFC.',
    },
    ultrahuman: {
      connect:
        'Associez Ultrahuman Ring dans son app. Dans BioMath Core, autorisez sommeil et récupération.',
      syncs: 'Sommeil, VFC, fréquence cardiaque, température et scores de récupération.',
      tip: 'Portez-le plusieurs jours pour stabiliser la baseline de récupération.',
    },
    whoop: {
      connect:
        'Portez WHOOP et gardez l’app synchronisée. Dans BioMath Core, autorisez strain, récupération et sommeil.',
      syncs: 'Strain, récupération, sommeil, VFC, FC au repos et charge d’activité.',
      tip: 'Laissez le bracelet pendant les séances et la nuit pour aligner strain et récupération.',
    },
    dexcom_g7: {
      connect:
        'Configurez Dexcom et attendez le préchauffage du capteur. Dans BioMath Core, autorisez la glycémie continue.',
      syncs: 'Courbes de glycémie continue et tendances éducatives de temps dans la cible.',
      tip: 'Notez les horaires de repas pour mieux lire les variations.',
    },
    freestyle_libre: {
      connect:
        'Activez le capteur FreeStyle Libre dans LibreLink. Dans BioMath Core, autorisez le partage Libre.',
      syncs: 'Lectures flash ou continues de glycémie pour la conscience métabolique.',
      tip: 'Scannez ou gardez le téléphone à proximité selon votre modèle.',
    },
    omron: {
      connect:
        'Associez le brassard Omron à Omron Connect. Dans BioMath Core, autorisez la tension.',
      syncs: 'Systolique, diastolique et pouls des mesures à domicile.',
      tip: 'Mesurez à heure fixe, assis et au repos, pour des tendances plus propres.',
    },
    withings_bpm: {
      connect:
        'Connectez Withings BPM dans Health Mate. Dans BioMath Core, autorisez les données de tension Withings.',
      syncs: 'Lectures validées de tension et pouls associé.',
      tip: 'Utilisez le même bras et la même posture à chaque session.',
    },
    withings_body: {
      connect:
        'Montez sur la balance Withings liée à Health Mate. Dans BioMath Core, autorisez poids et composition.',
      syncs: 'Poids, IMC et estimations de composition corporelle.',
      tip: 'Pesez-vous à heure similaire, idéalement le matin.',
    },
    eight_sleep: {
      connect:
        'Gardez le Pod Eight Sleep en ligne dans son app. Dans BioMath Core, autorisez sommeil et vitaux nocturnes.',
      syncs: 'Phases de sommeil, FC nocturne, VFC et signaux de température du lit.',
      tip: 'Laissez la couverture alimentée la nuit pour une sync au réveil.',
    },
    fitbit: {
      connect:
        'Synchronisez Fitbit avec son app. Dans BioMath Core, autorisez sommeil, fréquence cardiaque et activité.',
      syncs: 'Fréquence cardiaque, VFC, sommeil, activité, stress et SpO₂ selon le modèle.',
      tip: 'Activez le suivi de sommeil nocturne dans Fitbit.',
    },
    polar: {
      connect:
        'Associez Polar à Polar Flow. Dans BioMath Core, autorisez FC, entraînement et récupération.',
      syncs: 'Fréquence cardiaque, VFC, sommeil, activité, charge d’entraînement et récupération.',
      tip: 'Synchronisez Polar Flow après les séances avant le guidage du matin.',
    },
  },
  de: {
    apple_watch: {
      connect:
        'Tragen Sie die Apple Watch und öffnen Sie die Health-App auf dem iPhone. In BioMath Core Apple Watch wählen und gewünschte Metriken freigeben.',
      syncs: 'Herzfrequenz, HRV, Schlafphasen, SpO₂, EKG (falls verfügbar), Workouts und Aktivitätslast.',
      tip: 'Über Nacht tragen, damit Schlaf und morgendliche Erholung vollständig sind.',
    },
    samsung_galaxy_watch: {
      connect:
        'Galaxy Watch mit Samsung Health koppeln. In BioMath Core Samsung Health für die gewünschten Metriken autorisieren.',
      syncs: 'Herzfrequenz, HRV, Schlaf, SpO₂, Aktivität, EKG und Blutdruck auf unterstützten Modellen.',
      tip: 'Samsung-Health-Kalibrierung für manschettenlosen Blutdruck abschließen.',
    },
    garmin: {
      connect:
        'Garmin mit Garmin Connect synchronisieren. In BioMath Core Garmin Connect für Training, Erholung und Schlaf verbinden.',
      syncs: 'Herzfrequenz, HRV, Schlaf, Aktivität, Trainingslast, Erholung und Stress.',
      tip: 'Garmin Connect nach Workouts öffnen, damit aktuelle Dateien ankommen.',
    },
    google_pixel_watch: {
      connect:
        'Fitbit / Google Fit synchron halten. In BioMath Core Fitbit-Metriken der Pixel Watch autorisieren.',
      syncs: 'Herzfrequenz, Schlaf, Aktivität, SpO₂ und alltägliche Bewegung.',
      tip: 'Vor dem Schlafen laden oder nächtliches Tragen konstant halten.',
    },
    oura: {
      connect:
        'Oura Ring tragen und Oura-App öffnen. In BioMath Core Schlaf, Readiness und Erholung autorisieren.',
      syncs: 'Schlafphasen, HRV, Ruhepuls, Temperaturtrends, Readiness und Aktivität.',
      tip: 'Bequemer Nachtsitz verbessert Temperatur- und HRV-Qualität.',
    },
    ultrahuman: {
      connect:
        'Ultrahuman Ring in der App koppeln. In BioMath Core Schlaf- und Erholungssignale autorisieren.',
      syncs: 'Schlaf, HRV, Herzfrequenz, Temperatur und tägliche Erholungswerte.',
      tip: 'Einige Tage durchgehend tragen, bis die Erholungs-Baseline stabil ist.',
    },
    whoop: {
      connect:
        'WHOOP tragen und App synchron halten. In BioMath Core Strain, Erholung und Schlaf autorisieren.',
      syncs: 'Strain, Erholung, Schlaf, HRV, Ruhepuls und Aktivitätslast.',
      tip: 'Beim Training und nachts tragen, damit Strain und Erholung zusammenpassen.',
    },
    dexcom_g7: {
      connect:
        'Dexcom einrichten und Sensor-Aufwärmung abwarten. In BioMath Core kontinuierliche Glukose freigeben.',
      syncs: 'Kontinuierliche Glukosekurven und Time-in-Range-Trends zur Orientierung.',
      tip: 'Mahlzeitenzeiten notieren, um Schwankungen besser einzuordnen.',
    },
    freestyle_libre: {
      connect:
        'FreeStyle-Libre-Sensor in LibreLink aktivieren. In BioMath Core Libre-Glukose freigeben.',
      syncs: 'Flash- oder kontinuierliche Glukosewerte für den Alltag.',
      tip: 'Scannen oder Telefon in Reichweite halten — je nach Modell.',
    },
    omron: {
      connect:
        'Omron-Manschette mit Omron Connect koppeln. In BioMath Core Blutdruckwerte autorisieren.',
      syncs: 'Systole, Diastole und Puls aus Heim-Messungen.',
      tip: 'Zur gleichen Zeit sitzend und ruhig messen für klarere Trends.',
    },
    withings_bpm: {
      connect:
        'Withings BPM in Health Mate verbinden. In BioMath Core Withings-Blutdruck autorisieren.',
      syncs: 'Validierte Manschetten-Blutdruckwerte und zugehöriger Puls.',
      tip: 'Jeden Durchgang denselben Arm und dieselbe Haltung nutzen.',
    },
    withings_body: {
      connect:
        'Auf die Withings-Waage steigen, die in Health Mate verknüpft ist. In BioMath Core Gewicht und Körperzusammensetzung autorisieren.',
      syncs: 'Gewicht, BMI und Schätzungen der Körperzusammensetzung.',
      tip: 'Zur ähnlichen Tageszeit wiegen, idealerweise morgens.',
    },
    eight_sleep: {
      connect:
        'Eight Sleep Pod in der App online halten. In BioMath Core Schlaf und nächtliche Vitalwerte autorisieren.',
      syncs: 'Schlafphasen, nächtliche Herzfrequenz, HRV und Bett-Temperatur.',
      tip: 'Cover nachts mit Strom und Verbindung lassen, damit morgens alles synct.',
    },
    fitbit: {
      connect:
        'Fitbit mit der Fitbit-App synchronisieren. In BioMath Core Schlaf, Herzfrequenz und Aktivität autorisieren.',
      syncs: 'Herzfrequenz, HRV, Schlaf, Aktivität, Stress und SpO₂ je nach Modell.',
      tip: 'Nacht-Schlaftracking in Fitbit aktivieren.',
    },
    polar: {
      connect:
        'Polar mit Polar Flow koppeln. In BioMath Core Herzfrequenz, Training und Erholung autorisieren.',
      syncs: 'Herzfrequenz, HRV, Schlaf, Aktivität, Trainingslast und Erholung.',
      tip: 'Polar Flow nach Sitzungen synchronisieren, bevor die Morgenführung startet.',
    },
  },
  ja: {
    apple_watch: {
      connect:
        'Apple Watch を装着し、iPhone のヘルスケアを開きます。BioMath Core で Apple Watch を選び、心拍・睡眠・活動などの共有を許可します。',
      syncs: '心拍数、HRV、睡眠ステージ、SpO₂、ECG（対応時）、ワークアウト、活動負荷。',
      tip: '夜間も装着すると、睡眠と朝の回復の把握が安定します。',
    },
    samsung_galaxy_watch: {
      connect:
        'Galaxy Watch を Samsung Health とペアリングします。BioMath Core で共有したい指標を許可します。',
      syncs: '心拍数、HRV、睡眠、SpO₂、活動、ECG、対応モデルでは血圧。',
      tip: 'カフレス血圧を使う前に Samsung Health の校正を完了してください。',
    },
    garmin: {
      connect:
        'Garmin を Garmin Connect と同期します。BioMath Core でトレーニング・回復・睡眠を許可します。',
      syncs: '心拍数、HRV、睡眠、活動、トレーニング負荷、回復、ストレス。',
      tip: '運動後に Garmin Connect を開き、最新ファイルを受け取ります。',
    },
    google_pixel_watch: {
      connect:
        'Fitbit / Google Fit の同期を維持します。BioMath Core で Pixel Watch の Fitbit 指標を許可します。',
      syncs: '心拍数、睡眠、活動、SpO₂、日常の動き。',
      tip: '就寝前に充電するか、夜間装着を一定に保ちます。',
    },
    oura: {
      connect:
        'Oura Ring を装着し Oura アプリを開きます。BioMath Core で睡眠・準備度・回復を許可します。',
      syncs: '睡眠ステージ、HRV、安静時心拍、体温傾向、準備度、活動。',
      tip: '夜間にしっかり装着すると体温と HRV の精度が上がります。',
    },
    ultrahuman: {
      connect:
        'Ultrahuman Ring をアプリでペアリングします。BioMath Core で睡眠と回復を許可します。',
      syncs: '睡眠、HRV、心拍、体温、回復スコア。',
      tip: '数日連続装着して回復の基準を安定させます。',
    },
    whoop: {
      connect:
        'WHOOP を装着しアプリを同期します。BioMath Core でストレイン・回復・睡眠を許可します。',
      syncs: 'ストレイン、回復、睡眠、HRV、安静時心拍、活動負荷。',
      tip: '運動中と夜間も装着し、負荷と回復を揃えます。',
    },
    dexcom_g7: {
      connect:
        'Dexcom のセットアップとセンサーウォームアップを完了します。BioMath Core で連続グルコースを許可します。',
      syncs: '連続グルコース曲線と学習用の目標範囲内時間の傾向。',
      tip: '食事の時間をメモすると変動を解釈しやすくなります。',
    },
    freestyle_libre: {
      connect:
        'LibreLink で FreeStyle Libre センサーを有効化します。BioMath Core で Libre の共有を許可します。',
      syncs: 'フラッシュ／連続グルコースによる日常の代謝把握。',
      tip: 'モデルに応じてスキャンするか、スマホを近くに置きます。',
    },
    omron: {
      connect:
        'Omron カフを Omron Connect とペアリングします。BioMath Core で血圧を許可します。',
      syncs: '家庭測定の収縮期・拡張期・脈拍。',
      tip: '同じ時間に座位・安静で測ると傾向が明確になります。',
    },
    withings_bpm: {
      connect:
        'Health Mate で Withings BPM を接続します。BioMath Core で血圧データを許可します。',
      syncs: '検証済みカフ血圧と関連する脈拍。',
      tip: '毎回同じ腕・同じ姿勢で測定します。',
    },
    withings_body: {
      connect:
        'Health Mate 連携済みの Withings 体重計に乗ります。BioMath Core で体重と体組成を許可します。',
      syncs: '体重、BMI、体組成の推定値。',
      tip: 'できれば毎朝など、同じ時間帯に計測します。',
    },
    eight_sleep: {
      connect:
        'Eight Sleep アプリで Pod をオンラインに保ちます。BioMath Core で睡眠と夜間バイタルを許可します。',
      syncs: '睡眠ステージ、夜間心拍、HRV、ベッド温度。',
      tip: '夜間はカバーの電源と接続を維持し、朝に同期します。',
    },
    fitbit: {
      connect:
        'Fitbit アプリと同期します。BioMath Core で睡眠・心拍・活動を許可します。',
      syncs: '心拍数、HRV、睡眠、活動、ストレス、対応時は SpO₂。',
      tip: 'Fitbit で夜間睡眠トラッキングを有効にします。',
    },
    polar: {
      connect:
        'Polar を Polar Flow とペアリングします。BioMath Core で心拍・トレーニング・回復を許可します。',
      syncs: '心拍数、HRV、睡眠、活動、トレーニング負荷、回復。',
      tip: 'セッション後に Polar Flow を同期してから朝のガイドを受けます。',
    },
  },
  he: {
    apple_watch: {
      connect:
        'ענו את Apple Watch ופתחו את אפליקציית הבריאות באייפון. ב‑BioMath Core בחרו Apple Watch ואשרו שיתוף מדדים.',
      syncs: 'דופק, HRV, שלבי שינה, SpO₂, ECG (אם זמין), אימונים ועומס פעילות.',
      tip: 'השאירו בלילה כדי לקבל תמונת שינה והתאוששות מלאה.',
    },
    samsung_galaxy_watch: {
      connect:
        'צמדו Galaxy Watch ל‑Samsung Health. ב‑BioMath Core אשרו את המדדים לשיתוף.',
      syncs: 'דופק, HRV, שינה, SpO₂, פעילות, ECG ולחץ דם בדגמים נתמכים.',
      tip: 'השלימו כיול Samsung Health ללחץ ללא שרוול לפני ציפייה לקריאות.',
    },
    garmin: {
      connect:
        'סנכרנו Garmin עם Garmin Connect. ב‑BioMath Core חברו אימון, התאוששות ושינה.',
      syncs: 'דופק, HRV, שינה, פעילות, עומס אימון, התאוששות ומתח.',
      tip: 'פתחו Garmin Connect אחרי אימונים לקבלת קבצים עדכניים.',
    },
    google_pixel_watch: {
      connect:
        'שמרו על סנכרון Fitbit / Google Fit. ב‑BioMath Core אשרו מדדי Fitbit מ‑Pixel Watch.',
      syncs: 'דופק, שינה, פעילות, SpO₂ ותנועה יומיומית.',
      tip: 'טענו לפני השינה או שמרו על ענידה לילית עקבית.',
    },
    oura: {
      connect:
        'ענו את טבעת Oura ופתחו את האפליקציה. ב‑BioMath Core אשרו שינה, מוכנות והתאוששות.',
      syncs: 'שלבי שינה, HRV, דופק מנוחה, מגמות טמפרטורה, מוכנות ופעילות.',
      tip: 'התאמה נוחה בלילה משפרת איכות טמפרטורה ו‑HRV.',
    },
    ultrahuman: {
      connect:
        'צמדו Ultrahuman Ring באפליקציה. ב‑BioMath Core אשרו אותות שינה והתאוששות.',
      syncs: 'שינה, HRV, דופק, טמפרטורה וציוני התאוששות יומיים.',
      tip: 'ענו כמה ימים ברצף לייצוב קו בסיס להתאוששות.',
    },
    whoop: {
      connect:
        'ענו WHOOP ושמרו על סנכרון האפליקציה. ב‑BioMath Core אשרו strain, התאוששות ושינה.',
      syncs: 'Strain, התאוששות, שינה, HRV, דופק מנוחה ועומס פעילות.',
      tip: 'השאירו באימונים ובלילה כדי ליישר strain והתאוששות.',
    },
    dexcom_g7: {
      connect:
        'השלימו הגדרת Dexcom והמתנת חימום חיישן. ב‑BioMath Core אשרו גלוקוז רציף.',
      syncs: 'עקומות גלוקוז רציף ומגמות זמן בטווח ללמידה.',
      tip: 'רשמו זמני ארוחות כדי לפרש תנודות טוב יותר.',
    },
    freestyle_libre: {
      connect:
        'הפעילו חיישן FreeStyle Libre ב‑LibreLink. ב‑BioMath Core אשרו שיתוף Libre.',
      syncs: 'קריאות פלאש או רציפות של גלוקוז למודעות מטבולית.',
      tip: 'סרקו או השאירו את הטלפון קרוב לפי הדגם.',
    },
    omron: {
      connect:
        'צמדו שרוול Omron ל‑Omron Connect. ב‑BioMath Core אשרו לחץ דם.',
      syncs: 'סיסטולי, דיאסטולי ודופק ממדידות ביתיות.',
      tip: 'מדדו באותה שעה בישיבה ובמנוחה למגמות נקיות יותר.',
    },
    withings_bpm: {
      connect:
        'חברו Withings BPM ב‑Health Mate. ב‑BioMath Core אשרו נתוני לחץ Withings.',
      syncs: 'קריאות לחץ מאומתות ודופק קשור.',
      tip: 'השתמשו באותה זרוע ואותה תנוחה בכל מדידה.',
    },
    withings_body: {
      connect:
        'עלו על משקל Withings המקושר ל‑Health Mate. ב‑BioMath Core אשרו משקל והרכב גוף.',
      syncs: 'משקל, BMI והערכות הרכב גוף.',
      tip: 'שקלו בשעה דומה, עדיף בבוקר.',
    },
    eight_sleep: {
      connect:
        'השאירו את Eight Sleep Pod מקוון באפליקציה. ב‑BioMath Core אשרו שינה וחיוניות לילה.',
      syncs: 'שלבי שינה, דופק לילי, HRV ואותות טמפרטורת מיטה.',
      tip: 'השאירו כיסוי מופעל ומחובר בלילה לסנכרון בבוקר.',
    },
    fitbit: {
      connect:
        'סנכרנו Fitbit עם האפליקציה. ב‑BioMath Core אשרו שינה, דופק ופעילות.',
      syncs: 'דופק, HRV, שינה, פעילות, לחץ ו‑SpO₂ לפי הדגם.',
      tip: 'הפעילו מעקב שינה לילי בהגדרות Fitbit.',
    },
    polar: {
      connect:
        'צמדו Polar ל‑Polar Flow. ב‑BioMath Core אשרו דופק, אימון והתאוששות.',
      syncs: 'דופק, HRV, שינה, פעילות, עומס אימון והתאוששות.',
      tip: 'סנכרנו Polar Flow אחרי מפגשים לפני ההכוונה בבוקר.',
    },
  },
  zh: {
    apple_watch: {
      connect: '佩戴 Apple Watch 并打开 iPhone 上的健康应用。在 BioMath Core 中选择 Apple Watch 并授权共享指标。',
      syncs: '心率、HRV、睡眠阶段、SpO₂、ECG（若可用）、锻炼与活动负荷。',
      tip: '夜间佩戴可获得更完整的睡眠与晨间恢复信息。',
    },
    samsung_galaxy_watch: {
      connect: '将 Galaxy Watch 与 Samsung Health 配对。在 BioMath Core 中授权要共享的指标。',
      syncs: '心率、HRV、睡眠、SpO₂、活动、ECG，以及支持机型上的血压。',
      tip: '使用无袖带血压前，请完成 Samsung Health 校准。',
    },
    garmin: {
      connect: '将 Garmin 与 Garmin Connect 同步。在 BioMath Core 中授权训练、恢复与睡眠。',
      syncs: '心率、HRV、睡眠、活动、训练负荷、恢复与压力。',
      tip: '运动后打开 Garmin Connect 以接收最新文件。',
    },
    google_pixel_watch: {
      connect: '保持 Fitbit / Google Fit 同步。在 BioMath Core 中授权 Pixel Watch 的 Fitbit 指标。',
      syncs: '心率、睡眠、活动、SpO₂ 与日常活动模式。',
      tip: '睡前充电，或保持夜间佩戴习惯以便周对比。',
    },
    oura: {
      connect: '佩戴 Oura 戒指并打开 Oura 应用。在 BioMath Core 中授权睡眠、准备度与恢复。',
      syncs: '睡眠阶段、HRV、静息心率、体温趋势、准备度与活动。',
      tip: '夜间贴合佩戴可提升体温与 HRV 质量。',
    },
    ultrahuman: {
      connect: '在配套应用中配对 Ultrahuman Ring。在 BioMath Core 中授权睡眠与恢复信号。',
      syncs: '睡眠、HRV、心率、体温与日常恢复评分。',
      tip: '连续佩戴数日，让恢复基线稳定。',
    },
    whoop: {
      connect: '佩戴 WHOOP 并保持应用同步。在 BioMath Core 中授权负荷、恢复与睡眠。',
      syncs: '负荷、恢复、睡眠、HRV、静息心率与活动负荷。',
      tip: '训练与夜间保持佩戴，使负荷与恢复对齐。',
    },
    dexcom_g7: {
      connect: '完成 Dexcom 设置并等待传感器预热。在 BioMath Core 中授权连续血糖。',
      syncs: '连续血糖曲线与教育性的目标范围内时间趋势。',
      tip: '记录进餐时间，便于解读波动。',
    },
    freestyle_libre: {
      connect: '在 LibreLink 中激活 FreeStyle Libre 传感器。在 BioMath Core 中授权 Libre 共享。',
      syncs: '闪测或连续血糖读数，用于日常代谢觉察。',
      tip: '按型号要求扫描或让手机保持在附近。',
    },
    omron: {
      connect: '将欧姆龙袖带与 Omron Connect 配对。在 BioMath Core 中授权血压读数。',
      syncs: '家庭测量的收缩压、舒张压与脉搏。',
      tip: '在固定时间、坐姿静息下测量，趋势更清晰。',
    },
    withings_bpm: {
      connect: '在 Health Mate 中连接 Withings BPM。在 BioMath Core 中授权血压数据。',
      syncs: '经验证的袖带血压与相关脉搏。',
      tip: '每次使用同一手臂与同一姿势。',
    },
    withings_body: {
      connect: '站上已在 Health Mate 关联的 Withings 体脂秤。在 BioMath Core 中授权体重与体成分。',
      syncs: '体重、BMI 与体成分估算。',
      tip: '尽量在相近时间测量，最好是早晨。',
    },
    eight_sleep: {
      connect: '在 Eight Sleep 应用中保持 Pod 在线。在 BioMath Core 中授权睡眠与夜间生命体征。',
      syncs: '睡眠阶段、夜间心率、HRV 与床温信号。',
      tip: '夜间保持罩垫供电与连接，以便早晨同步。',
    },
    fitbit: {
      connect: '将 Fitbit 与应用同步。在 BioMath Core 中授权睡眠、心率与活动。',
      syncs: '心率、HRV、睡眠、活动、压力，以及支持机型上的 SpO₂。',
      tip: '在 Fitbit 中启用夜间睡眠追踪。',
    },
    polar: {
      connect: '将 Polar 与 Polar Flow 配对。在 BioMath Core 中授权心率、训练与恢复。',
      syncs: '心率、HRV、睡眠、活动、训练负荷与恢复。',
      tip: '训练后同步 Polar Flow，再查看晨间指引。',
    },
  },
  ar: {
    apple_watch: {
      connect:
        'ارتدِ Apple Watch وافتح تطبيق صحتي على iPhone. في BioMath Core اختر Apple Watch ووافق على مشاركة المقاييس.',
      syncs: 'معدل القلب وHRV ومراحل النوم وSpO₂ وECG (إن توفّر) والتمارين وحمل النشاط.',
      tip: 'ارتدِه ليلاً لصورة أوضح للنوم والتعافي الصباحي.',
    },
    samsung_galaxy_watch: {
      connect:
        'اربط Galaxy Watch مع Samsung Health. في BioMath Core وافق على المقاييس التي تريد مشاركتها.',
      syncs: 'معدل القلب وHRV والنوم وSpO₂ والنشاط وECG وضغط الدم في الطرازات المدعومة.',
      tip: 'أكمل معايرة Samsung Health لضغط الدم بدون سوار قبل انتظار القراءات.',
    },
    garmin: {
      connect:
        'زامن Garmin مع Garmin Connect. في BioMath Core اربط التدريب والتعافي والنوم.',
      syncs: 'معدل القلب وHRV والنوم والنشاط وحمل التدريب والتعافي والتوتر.',
      tip: 'افتح Garmin Connect بعد التمارين لاستلام أحدث الملفات.',
    },
    google_pixel_watch: {
      connect:
        'حافظ على مزامنة Fitbit / Google Fit. في BioMath Core وافق على مقاييس Fitbit من Pixel Watch.',
      syncs: 'معدل القلب والنوم والنشاط وSpO₂ وأنماط الحركة اليومية.',
      tip: 'اشحن قبل النوم أو حافظ على ارتداء ليلي منتظم.',
    },
    oura: {
      connect:
        'ارتدِ خاتم Oura وافتح التطبيق. في BioMath Core وافق على النوم والجاهزية والتعافي.',
      syncs: 'مراحل النوم وHRV ومعدل الراحة واتجاهات الحرارة والجاهزية والنشاط.',
      tip: 'ملاءمة مريحة ليلاً تحسّن جودة الحرارة وHRV.',
    },
    ultrahuman: {
      connect:
        'اربط Ultrahuman Ring في تطبيقه. في BioMath Core وافق على إشارات النوم والتعافي.',
      syncs: 'النوم وHRV ومعدل القلب والحرارة ودرجات التعافي اليومية.',
      tip: 'ارتدِه أياماً متتالية لتثبيت خط أساس التعافي.',
    },
    whoop: {
      connect:
        'ارتدِ WHOOP وحافظ على مزامنة التطبيق. في BioMath Core وافق على الإجهاد والتعافي والنوم.',
      syncs: 'الإجهاد والتعافي والنوم وHRV ومعدل الراحة وحمل النشاط.',
      tip: 'اتركه أثناء التمارين والليل لمواءمة الإجهاد والتعافي.',
    },
    dexcom_g7: {
      connect:
        'أكمل إعداد Dexcom وانتظر تسخين المستشعر. في BioMath Core وافق على الجلوكوز المستمر.',
      syncs: 'منحنيات الجلوكوز المستمر واتجاهات الوقت ضمن النطاق للتعلّم.',
      tip: 'سجّل أوقات الوجبات لتفسير التقلبات بسهولة أكبر.',
    },
    freestyle_libre: {
      connect:
        'فعّل مستشعر FreeStyle Libre في LibreLink. في BioMath Core وافق على مشاركة Libre.',
      syncs: 'قراءات جلوكوز فورية أو مستمرة للوعي الأيضي اليومي.',
      tip: 'امسح أو أبقِ الهاتف قريباً حسب طرازك.',
    },
    omron: {
      connect:
        'اربط سوار Omron مع Omron Connect. في BioMath Core وافق على قراءات ضغط الدم.',
      syncs: 'الانقباضي والانبساطي والنبض من قياسات المنزل.',
      tip: 'قِس في وقت ثابت جالساً ومستريحاً لاتجاهات أوضح.',
    },
    withings_bpm: {
      connect:
        'اربط Withings BPM في Health Mate. في BioMath Core وافق على بيانات ضغط Withings.',
      syncs: 'قراءات ضغط معتمدة ونبض مرتبط.',
      tip: 'استخدم الذراع والوضعية نفسها في كل جلسة.',
    },
    withings_body: {
      connect:
        'قِف على ميزان Withings المرتبط بـ Health Mate. في BioMath Core وافق على الوزن وتركيب الجسم.',
      syncs: 'الوزن ومؤشر كتلة الجسم وتقديرات تركيب الجسم.',
      tip: 'زِن في وقت مشابه، ويفضّل صباحاً.',
    },
    eight_sleep: {
      connect:
        'أبقِ Eight Sleep Pod متصلاً في تطبيقه. في BioMath Core وافق على النوم والمؤشرات الليلية.',
      syncs: 'مراحل النوم ومعدل القلب الليلي وHRV وإشارات حرارة السرير.',
      tip: 'اترك الغطاء شغّالاً ومتصلاً ليلاً للمزامنة صباحاً.',
    },
    fitbit: {
      connect:
        'زامن Fitbit مع تطبيقه. في BioMath Core وافق على النوم ومعدل القلب والنشاط.',
      syncs: 'معدل القلب وHRV والنوم والنشاط والتوتر وSpO₂ حسب الطراز.',
      tip: 'فعّل تتبع النوم الليلي في إعدادات Fitbit.',
    },
    polar: {
      connect:
        'اربط Polar مع Polar Flow. في BioMath Core وافق على معدل القلب والتدريب والتعافي.',
      syncs: 'معدل القلب وHRV والنوم والنشاط وحمل التدريب والتعافي.',
      tip: 'زامن Polar Flow بعد الجلسات قبل إرشاد الصباح.',
    },
  },
  uk: {
    apple_watch: {
      connect:
        'Носіть Apple Watch і відкрийте «Здоров’я» на iPhone. У BioMath Core оберіть Apple Watch і дозвольте потрібні метрики.',
      syncs: 'Пульс, ВСР, стадії сну, SpO₂, ЕКГ (якщо є), тренування та навантаження.',
      tip: 'Носіть уночі, щоб сон і ранкове відновлення були повними.',
    },
    samsung_galaxy_watch: {
      connect:
        'Підключіть Galaxy Watch до Samsung Health. У BioMath Core дозвольте метрики для спільного доступу.',
      syncs: 'Пульс, ВСР, сон, SpO₂, активність, ЕКГ і тиск на підтримуваних моделях.',
      tip: 'Завершіть калібрування Samsung Health для безманжетного тиску перед очікуванням цих показників.',
    },
    garmin: {
      connect:
        'Синхронізуйте Garmin із Garmin Connect. У BioMath Core підключіть тренування, відновлення та сон.',
      syncs: 'Пульс, ВСР, сон, активність, тренувальне навантаження, відновлення та стрес.',
      tip: 'Відкрийте Garmin Connect після тренувань, щоб отримати свіжі файли.',
    },
    google_pixel_watch: {
      connect:
        'Підтримуйте синхронізацію Fitbit / Google Fit. У BioMath Core дозвольте метрики Fitbit з Pixel Watch.',
      syncs: 'Пульс, сон, активність, SpO₂ та щоденний рух.',
      tip: 'Заряджайте перед сном або тримайте нічне носіння стабільним.',
    },
    oura: {
      connect:
        'Носіть Oura Ring і відкрийте додаток Oura. У BioMath Core дозвольте сон, готовність і відновлення.',
      syncs: 'Стадії сну, ВСР, пульс спокою, температура, готовність і активність.',
      tip: 'Зручна посадка вночі покращує якість температури та ВСР.',
    },
    ultrahuman: {
      connect:
        'Підключіть Ultrahuman Ring у додатку. У BioMath Core дозвольте сигнали сну й відновлення.',
      syncs: 'Сон, ВСР, пульс, температура та щоденні оцінки відновлення.',
      tip: 'Носіть кілька днів поспіль, щоб стабілізувати базову лінію відновлення.',
    },
    whoop: {
      connect:
        'Носіть WHOOP і тримайте додаток синхронізованим. У BioMath Core дозвольте strain, відновлення та сон.',
      syncs: 'Strain, відновлення, сон, ВСР, пульс спокою та навантаження.',
      tip: 'Залишайте на тренуваннях і вночі, щоб вирівняти strain і відновлення.',
    },
    dexcom_g7: {
      connect:
        'Завершіть налаштування Dexcom і прогрівання сенсора. У BioMath Core дозвольте безперервну глюкозу.',
      syncs: 'Криві безперервної глюкози та навчальні тренди часу в діапазоні.',
      tip: 'Записуйте час їжі, щоб легше інтерпретувати коливання.',
    },
    freestyle_libre: {
      connect:
        'Активуйте сенсор FreeStyle Libre в LibreLink. У BioMath Core дозвольте обмін Libre.',
      syncs: 'Flash або безперервні показники глюкози для щоденної метаболічної уваги.',
      tip: 'Скануйте або тримайте телефон поруч — залежно від моделі.',
    },
    omron: {
      connect:
        'Підключіть манжету Omron до Omron Connect. У BioMath Core дозвольте показники тиску.',
      syncs: 'Систолічний, діастолічний тиск і пульс з домашніх вимірювань.',
      tip: 'Мірте в той самий час сидячи й у спокої для чистіших трендів.',
    },
    withings_bpm: {
      connect:
        'Підключіть Withings BPM у Health Mate. У BioMath Core дозвольте дані тиску Withings.',
      syncs: 'Валідовані манжетні показники тиску та пов’язаний пульс.',
      tip: 'Використовуйте ту саму руку й ту саму позу щоразу.',
    },
    withings_body: {
      connect:
        'Станьте на ваги Withings, пов’язані з Health Mate. У BioMath Core дозвольте вагу й склад тіла.',
      syncs: 'Вага, ІМТ та оцінки складу тіла.',
      tip: 'Зважуйтесь у схожий час, краще вранці.',
    },
    eight_sleep: {
      connect:
        'Тримайте Eight Sleep Pod онлайн у додатку. У BioMath Core дозвольте сон і нічні вітальні показники.',
      syncs: 'Стадії сну, нічний пульс, ВСР і сигнали температури ліжка.',
      tip: 'Залишайте чохол увімкненим і підключеним уночі для ранкової синхронізації.',
    },
    fitbit: {
      connect:
        'Синхронізуйте Fitbit із додатком. У BioMath Core дозвольте сон, пульс і активність.',
      syncs: 'Пульс, ВСР, сон, активність, стрес і SpO₂ залежно від моделі.',
      tip: 'Увімкніть нічний трекінг сну в налаштуваннях Fitbit.',
    },
    polar: {
      connect:
        'Підключіть Polar до Polar Flow. У BioMath Core дозвольте пульс, тренування й відновлення.',
      syncs: 'Пульс, ВСР, сон, активність, тренувальне навантаження й відновлення.',
      tip: 'Синхронізуйте Polar Flow після сесій перед ранковим гідом.',
    },
  },
  ru: {
    apple_watch: {
      connect:
        'Наденьте Apple Watch и откройте «Здоровье» на iPhone. В BioMath Core выберите Apple Watch и разрешите нужные метрики.',
      syncs: 'Пульс, ВСР, стадии сна, SpO₂, ЭКГ (если доступно), тренировки и нагрузка.',
      tip: 'Носите ночью, чтобы сон и утреннее восстановление были полными.',
    },
    samsung_galaxy_watch: {
      connect:
        'Подключите Galaxy Watch к Samsung Health. В BioMath Core разрешите метрики для обмена.',
      syncs: 'Пульс, ВСР, сон, SpO₂, активность, ЭКГ и давление на поддерживаемых моделях.',
      tip: 'Завершите калибровку Samsung Health для давления без манжеты перед ожиданием этих показаний.',
    },
    garmin: {
      connect:
        'Синхронизируйте Garmin с Garmin Connect. В BioMath Core подключите тренировки, восстановление и сон.',
      syncs: 'Пульс, ВСР, сон, активность, тренировочная нагрузка, восстановление и стресс.',
      tip: 'Откройте Garmin Connect после тренировок, чтобы получить свежие файлы.',
    },
    google_pixel_watch: {
      connect:
        'Поддерживайте синхронизацию Fitbit / Google Fit. В BioMath Core разрешите метрики Fitbit с Pixel Watch.',
      syncs: 'Пульс, сон, активность, SpO₂ и повседневное движение.',
      tip: 'Заряжайте перед сном или держите ночное ношение стабильным.',
    },
    oura: {
      connect:
        'Наденьте Oura Ring и откройте приложение Oura. В BioMath Core разрешите сон, готовность и восстановление.',
      syncs: 'Стадии сна, ВСР, пульс покоя, температура, готовность и активность.',
      tip: 'Удобная посадка ночью улучшает качество температуры и ВСР.',
    },
    ultrahuman: {
      connect:
        'Подключите Ultrahuman Ring в приложении. В BioMath Core разрешите сигналы сна и восстановления.',
      syncs: 'Сон, ВСР, пульс, температура и ежедневные оценки восстановления.',
      tip: 'Носите несколько дней подряд, чтобы стабилизировать базовую линию восстановления.',
    },
    whoop: {
      connect:
        'Наденьте WHOOP и держите приложение синхронизированным. В BioMath Core разрешите strain, восстановление и сон.',
      syncs: 'Strain, восстановление, сон, ВСР, пульс покоя и нагрузка.',
      tip: 'Оставляйте на тренировках и ночью, чтобы выровнять strain и восстановление.',
    },
    dexcom_g7: {
      connect:
        'Завершите настройку Dexcom и прогрев сенсора. В BioMath Core разрешите непрерывную глюкозу.',
      syncs: 'Кривые непрерывной глюкозы и обучающие тренды времени в диапазоне.',
      tip: 'Отмечайте время приёмов пищи, чтобы проще интерпретировать колебания.',
    },
    freestyle_libre: {
      connect:
        'Активируйте сенсор FreeStyle Libre в LibreLink. В BioMath Core разрешите обмен Libre.',
      syncs: 'Flash или непрерывные показатели глюкозы для повседневной метаболической ясности.',
      tip: 'Сканируйте или держите телефон рядом — в зависимости от модели.',
    },
    omron: {
      connect:
        'Подключите манжету Omron к Omron Connect. В BioMath Core разрешите показатели давления.',
      syncs: 'Систолическое, диастолическое давление и пульс с домашних измерений.',
      tip: 'Измеряйте в одно и то же время сидя и в покое для более чистых трендов.',
    },
    withings_bpm: {
      connect:
        'Подключите Withings BPM в Health Mate. В BioMath Core разрешите данные давления Withings.',
      syncs: 'Валидированные манжетные показатели давления и связанный пульс.',
      tip: 'Используйте одну и ту же руку и позу на каждой сессии.',
    },
    withings_body: {
      connect:
        'Встаньте на весы Withings, связанные с Health Mate. В BioMath Core разрешите вес и состав тела.',
      syncs: 'Вес, ИМТ и оценки состава тела.',
      tip: 'Взвешивайтесь в похожее время, лучше утром.',
    },
    eight_sleep: {
      connect:
        'Держите Eight Sleep Pod онлайн в приложении. В BioMath Core разрешите сон и ночные витальные показатели.',
      syncs: 'Стадии сна, ночной пульс, ВСР и сигналы температуры кровати.',
      tip: 'Оставляйте чехол включённым и подключённым ночью для утренней синхронизации.',
    },
    fitbit: {
      connect:
        'Синхронизируйте Fitbit с приложением. В BioMath Core разрешите сон, пульс и активность.',
      syncs: 'Пульс, ВСР, сон, активность, стресс и SpO₂ в зависимости от модели.',
      tip: 'Включите ночной трекинг сна в настройках Fitbit.',
    },
    polar: {
      connect:
        'Подключите Polar к Polar Flow. В BioMath Core разрешите пульс, тренировки и восстановление.',
      syncs: 'Пульс, ВСР, сон, активность, тренировочная нагрузка и восстановление.',
      tip: 'Синхронизируйте Polar Flow после сессий перед утренним гидом.',
    },
  },
};

const memberRephrase = {
  en: {
    devices: {
      demoBadge: '',
      linkAccountNote: 'Link your manufacturer account to sync the health metrics you authorize.',
      syncDemoNote: 'Sync updated. Latest metrics are ready.',
    },
    secondOpinion: {
      demoBadge: '',
      opinion1Body:
        'Based on current medical research and clinical guidelines, this opinion summarizes evidence-based health guidance for your question.',
      opinion2Body:
        'Considering your context and health history, this opinion offers personalized guidance drawn from your profile and patterns.',
    },
    system: {
      demoBadge: '',
      simulatedNote: 'Live process metrics for your workspace.',
    },
    healthGuide: {
      demoBadge: '',
      simulatedNote: 'Health Guide answers draw on your connected context and authorized signals.',
    },
  },
  es: {
    devices: {
      demoBadge: '',
      linkAccountNote: 'Vincula la cuenta del fabricante para sincronizar las métricas de salud que autorices.',
      syncDemoNote: 'Sincronización actualizada. Las métricas más recientes están listas.',
    },
    secondOpinion: {
      demoBadge: '',
      opinion1Body:
        'Según la investigación médica y las guías clínicas actuales, esta opinión resume orientación basada en evidencia para tu pregunta.',
      opinion2Body:
        'Teniendo en cuenta tu contexto e historial de salud, esta opinión ofrece orientación personalizada a partir de tu perfil y patrones.',
    },
    system: {
      demoBadge: '',
      simulatedNote: 'Métricas de procesos en vivo de tu espacio de trabajo.',
    },
    healthGuide: {
      demoBadge: '',
      simulatedNote: 'Las respuestas de Health Guide se basan en tu contexto conectado y señales autorizadas.',
    },
  },
  fr: {
    devices: {
      demoBadge: '',
      linkAccountNote: 'Liez le compte du fabricant pour synchroniser les métriques de santé que vous autorisez.',
      syncDemoNote: 'Synchronisation mise à jour. Les dernières métriques sont prêtes.',
    },
    secondOpinion: {
      demoBadge: '',
      opinion1Body:
        'Selon la recherche médicale et les recommandations cliniques actuelles, cet avis résume une guidance fondée sur les preuves.',
      opinion2Body:
        'Compte tenu de votre contexte et de votre historique de santé, cet avis offre une guidance personnalisée à partir de votre profil et de vos tendances.',
    },
    system: {
      demoBadge: '',
      simulatedNote: 'Métriques de processus en direct pour votre espace de travail.',
    },
    healthGuide: {
      demoBadge: '',
      simulatedNote: 'Les réponses de Health Guide s’appuient sur votre contexte connecté et vos signaux autorisés.',
    },
  },
  de: {
    devices: {
      demoBadge: '',
      linkAccountNote: 'Verknüpfen Sie Ihr Herstellerkonto, um die freigegebenen Gesundheitsmetriken zu synchronisieren.',
      syncDemoNote: 'Sync aktualisiert. Die neuesten Metriken sind bereit.',
    },
    secondOpinion: {
      demoBadge: '',
      opinion1Body:
        'Auf Basis aktueller medizinischer Forschung und Leitlinien fasst diese Meinung evidenzbasierte Gesundheitsführung zu Ihrer Frage zusammen.',
      opinion2Body:
        'Unter Berücksichtigung Ihres Kontexts und Ihrer Gesundheitsgeschichte bietet diese Meinung personalisierte Führung aus Profil und Mustern.',
    },
    system: {
      demoBadge: '',
      simulatedNote: 'Live-Prozessmetriken für Ihren Arbeitsbereich.',
    },
    healthGuide: {
      demoBadge: '',
      simulatedNote: 'Health-Guide-Antworten nutzen Ihren verbundenen Kontext und freigegebene Signale.',
    },
  },
  ja: {
    devices: {
      demoBadge: '',
      linkAccountNote: 'メーカーアカウントを連携し、許可した健康指標を同期します。',
      syncDemoNote: '同期を更新しました。最新の指標が準備できています。',
    },
    secondOpinion: {
      demoBadge: '',
      opinion1Body:
        '最新の医学研究と臨床ガイドラインに基づき、この意見は質問に対するエビデンス重視の健康ガイダンスをまとめます。',
      opinion2Body:
        'あなたの状況と健康歴を踏まえ、この意見はプロファイルとパターンに基づく個別ガイダンスを示します。',
    },
    system: {
      demoBadge: '',
      simulatedNote: 'ワークスペースのライブプロセス指標です。',
    },
    healthGuide: {
      demoBadge: '',
      simulatedNote: 'Health Guide の回答は、接続済みコンテキストと許可されたシグナルに基づきます。',
    },
  },
  he: {
    devices: {
      demoBadge: '',
      linkAccountNote: 'קשרו את חשבון היצרן כדי לסנכרן את מדדי הבריאות שתאשרו.',
      syncDemoNote: 'הסנכרון עודכן. המדדים העדכניים מוכנים.',
    },
    secondOpinion: {
      demoBadge: '',
      opinion1Body:
        'על בסיס מחקר רפואי והנחיות קליניות עדכניות, חוות דעת זו מסכמת הכוונה מבוססת ראיות לשאלתכם.',
      opinion2Body:
        'בהתחשב בהקשר ובהיסטוריית הבריאות שלכם, חוות דעת זו מציעה הכוונה מותאמת מפרופיל ודפוסים.',
    },
    system: {
      demoBadge: '',
      simulatedNote: 'מדדי תהליכים חיים לסביבת העבודה שלכם.',
    },
    healthGuide: {
      demoBadge: '',
      simulatedNote: 'תשובות Health Guide נשענות על ההקשר המחובר והאותות המורשים שלכם.',
    },
  },
  zh: {
    devices: {
      demoBadge: '',
      linkAccountNote: '关联制造商账户，以同步您授权的健康指标。',
      syncDemoNote: '同步已更新。最新指标已就绪。',
    },
    secondOpinion: {
      demoBadge: '',
      opinion1Body: '基于当前医学研究与临床指南，本意见汇总针对您问题的循证健康指引。',
      opinion2Body: '结合您的情境与健康史，本意见根据个人资料与模式提供个性化指引。',
    },
    system: {
      demoBadge: '',
      simulatedNote: '工作区的实时进程指标。',
    },
    healthGuide: {
      demoBadge: '',
      simulatedNote: 'Health Guide 的回答基于您已连接的情境与授权信号。',
    },
  },
  ar: {
    devices: {
      demoBadge: '',
      linkAccountNote: 'اربط حساب الشركة المصنّعة لمزامنة مقاييس الصحة التي تسمح بها.',
      syncDemoNote: 'تم تحديث المزامنة. أحدث المقاييس جاهزة.',
    },
    secondOpinion: {
      demoBadge: '',
      opinion1Body:
        'استناداً إلى البحث الطبي والإرشادات السريرية الحالية، يلخّص هذا الرأي توجيهاً صحياً مبنياً على الأدلة لسؤالك.',
      opinion2Body:
        'مع مراعاة سياقك وتاريخك الصحي، يقدّم هذا الرأي توجيهاً مخصصاً من ملفك وأنماطك.',
    },
    system: {
      demoBadge: '',
      simulatedNote: 'مقاييس عمليات مباشرة لمساحة عملك.',
    },
    healthGuide: {
      demoBadge: '',
      simulatedNote: 'تستند إجابات Health Guide إلى سياقك المتصل والإشارات المصرّح بها.',
    },
  },
  uk: {
    devices: {
      demoBadge: '',
      linkAccountNote: 'Прив’яжіть обліковий запис виробника, щоб синхронізувати дозволені метрики здоров’я.',
      syncDemoNote: 'Синхронізацію оновлено. Найновіші метрики готові.',
    },
    secondOpinion: {
      demoBadge: '',
      opinion1Body:
        'На основі поточних медичних досліджень і клінічних настанов ця думка підсумовує науково обґрунтовані поради щодо вашого запитання.',
      opinion2Body:
        'З урахуванням вашого контексту й історії здоров’я ця думка пропонує персоналізовані поради з профілю та патернів.',
    },
    system: {
      demoBadge: '',
      simulatedNote: 'Живі метрики процесів вашого робочого простору.',
    },
    healthGuide: {
      demoBadge: '',
      simulatedNote: 'Відповіді Health Guide спираються на ваш підключений контекст і дозволені сигнали.',
    },
  },
  ru: {
    devices: {
      demoBadge: '',
      linkAccountNote: 'Привяжите аккаунт производителя, чтобы синхронизировать разрешённые метрики здоровья.',
      syncDemoNote: 'Синхронизация обновлена. Актуальные метрики готовы.',
    },
    secondOpinion: {
      demoBadge: '',
      opinion1Body:
        'На основе актуальных медицинских исследований и клинических рекомендаций это мнение суммирует доказательную поддержку по вашему вопросу.',
      opinion2Body:
        'С учётом вашего контекста и истории здоровья это мнение предлагает персональные рекомендации на основе профиля и паттернов.',
    },
    system: {
      demoBadge: '',
      simulatedNote: 'Живые метрики процессов вашего рабочего пространства.',
    },
    healthGuide: {
      demoBadge: '',
      simulatedNote: 'Ответы Health Guide опираются на ваш подключённый контекст и разрешённые сигналы.',
    },
  },
};

const summaryPlansBody = {
  en: 'A base subscription with deeper add-ons — progress through experience, not locked features.',
  es: 'Una suscripción base con complementos más profundos — avance por la experiencia, no por funciones bloqueadas.',
  fr: 'Un abonnement de base avec des modules plus approfondis — progressez par l’expérience, pas par des fonctions verrouillées.',
  de: 'Ein Basisabonnement mit tieferen Add-ons — Fortschritt durch Erfahrung, nicht durch gesperrte Funktionen.',
  ja: '基本プランに深いアドオンを追加 — ロックされた機能ではなく体験で進みます。',
  he: 'מנוי בסיס עם תוספות מעמיקות — התקדמות דרך החוויה, לא דרך תכונות נעולות.',
  zh: '基础订阅配合更深层次的附加功能 — 通过体验推进，而非锁定功能。',
  ar: 'اشتراك أساسي مع إضافات أعمق — تقدّم عبر التجربة لا عبر ميزات مقفلة.',
  uk: 'Базова підписка з глибшими додатками — прогрес через досвід, а не через заблоковані функції.',
  ru: 'Базовая подписка с более глубокими дополнениями — прогресс через опыт, а не через заблокированные функции.',
};

for (const lang of langs) {
  const devicesPath = path.join(root, 'src/locales', lang, 'devices.json');
  const devices = JSON.parse(fs.readFileSync(devicesPath, 'utf8'));
  const page = devices.devicesPage;
  const chrome = cardChrome[lang];
  page.cardStatus = chrome.cardStatus;
  page.card = chrome.card;
  page.emptyBrands = chrome.emptyBrands;

  const extras = deviceExtrasByLang[lang];
  for (const [id, fields] of Object.entries(extras)) {
    if (!page.items[id]) page.items[id] = { name: id, blurb: '' };
    Object.assign(page.items[id], fields);
  }
  fs.writeFileSync(devicesPath, `${JSON.stringify(devices, null, 2)}\n`);

  const memberPath = path.join(root, 'src/locales', lang, 'member.json');
  const member = JSON.parse(fs.readFileSync(memberPath, 'utf8'));
  const r = memberRephrase[lang];
  Object.assign(member.member.devices, r.devices);
  Object.assign(member.member.secondOpinion, r.secondOpinion);
  Object.assign(member.member.system, r.system);
  Object.assign(member.member.healthGuide, r.healthGuide);
  fs.writeFileSync(memberPath, `${JSON.stringify(member, null, 2)}\n`);

  const summaryPath = path.join(root, 'src/locales', lang, 'summary.json');
  if (fs.existsSync(summaryPath)) {
    const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    if (summary?.summaryPage?.plans?.body) {
      summary.summaryPage.plans.body = summaryPlansBody[lang] || summaryPlansBody.en;
      fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
    }
  }
}

console.log('Patched devices + member + summary for', langs.join(', '));
