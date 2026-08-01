import type { AppLanguage } from '../i18n/languages';

type Topic = 'energy' | 'sleep' | 'default';

const TOPIC_HINTS: Record<Topic, RegExp> = {
  energy:
    /energy|tired|fatigue|exhaust|энерг|устал|утом|втом|сил[аы]|cansad|energ|fatig|épuis|müde|erschöpft|疲れ|疲労|精力|تعب|طاقة|עייפ|אנרג/i,
  sleep:
    /sleep|insomnia|сон|спат|безсон|sueño|dormir|insomnio|sommeil|schlaf|眠|睡眠|نوم|שינה/i,
  default: /.*/,
};

const REPLIES: Record<AppLanguage, Record<Topic, string>> = {
  en: {
    energy:
      'Afternoon energy dips are common. They often relate to sleep, meals, and daily rhythm.\n\nTry a balanced lunch with protein, a short walk after eating, steady hydration, and a consistent wake time.\n\nIf you want two expert angles, turn on Second Opinion and ask again.',
    sleep:
      'Sleep quality usually improves with a few steady habits: a fixed wake time, a cooler bedroom, less bright screens before bed, and morning daylight.\n\nEnable Second Opinion if you want a deeper dual analysis.',
    default:
      'I am here to help with your wellness questions. Tell me a bit more about how you feel and what has changed recently.\n\nTip: turn on Second Opinion for two complementary perspectives.',
  },
  es: {
    energy:
      'Las bajadas de energía por la tarde son habituales. Suelen relacionarse con el sueño, las comidas y el ritmo del día.\n\nPrueba un almuerzo con proteína, un paseo corto después de comer, hidratación constante y un horario de despertar estable.\n\nSi quieres dos perspectivas, activa Segunda Opinión y vuelve a preguntar.',
    sleep:
      'La calidad del sueño suele mejorar con hábitos estables: hora fija de despertar, habitación fresca, menos pantallas brillantes por la noche y luz natural por la mañana.\n\nActiva Segunda Opinión para un análisis dual más profundo.',
    default:
      'Estoy aquí para ayudarte con tus preguntas de bienestar. Cuéntame un poco más cómo te sientes y qué ha cambiado.\n\nConsejo: activa Segunda Opinión para dos perspectivas complementarias.',
  },
  fr: {
    energy:
      'Les baisses d’énergie l’après-midi sont fréquentes. Elles tiennent souvent au sommeil, aux repas et au rythme quotidien.\n\nEssayez un déjeuner équilibré avec des protéines, une courte marche après le repas, une bonne hydratation et une heure de réveil stable.\n\nPour deux regards experts, activez Second Avis et reposez la question.',
    sleep:
      'Le sommeil s’améliore souvent avec des habitudes stables : heure de réveil fixe, chambre fraîche, moins d’écrans le soir, et lumière du matin.\n\nActivez Second Avis pour une analyse plus complète.',
    default:
      'Je suis là pour vos questions de bien-être. Dites-moi comment vous vous sentez et ce qui a changé récemment.\n\nAstuce : activez Second Avis pour deux perspectives complémentaires.',
  },
  de: {
    energy:
      'Nachmittagstiefs sind häufig. Oft hängen sie mit Schlaf, Mahlzeiten und dem Tagesrhythmus zusammen.\n\nHilfreich: ausgewogenes Mittagessen mit Protein, kurzer Spaziergang danach, regelmäßiges Trinken und eine stabile Aufstehzeit.\n\nFür zwei Expertensichten schalten Sie Zweite Meinung ein und fragen erneut.',
    sleep:
      'Schlafqualität verbessert sich oft mit festen Gewohnheiten: stabile Aufstehzeit, kühles Schlafzimmer, weniger helle Bildschirme abends und Tageslicht am Morgen.\n\nAktivieren Sie Zweite Meinung für eine tiefere Doppelanalyse.',
    default:
      'Ich helfe gerne bei Wellness-Fragen. Erzählen Sie etwas mehr, wie Sie sich fühlen und was sich verändert hat.\n\nTipp: Zweite Meinung für zwei ergänzende Perspektiven einschalten.',
  },
  ja: {
    energy:
      '午後のエネルギー低下はよくあります。睡眠・食事・一日のリズムと関係しやすいです。\n\nタンパク質のある昼食、食後の短い散歩、こまめな水分、決まった起床時間を試してみてください。\n\n二つの視点が欲しければ「セカンドオピニオン」をオンにして、もう一度聞いてください。',
    sleep:
      '睡眠の質は、決まった起床時間、少し涼しい寝室、就寝前の明るい画面を減らすこと、朝の光で改善しやすいです。\n\nより詳しい二重分析にはセカンドオピニオンを有効にしてください。',
    default:
      'ウェルネスの質問をお手伝いします。いまの体調や最近変わったことを、もう少し教えてください。\n\nヒント：セカンドオピニオンで二つの視点を比べられます。',
  },
  he: {
    energy:
      'ירידות אנרגיה אחר הצהריים שכיחות. לעיתים קרובות הן קשורות לשינה, לארוחות ולקצב היום.\n\nנסו ארוחת צהריים מאוזנת עם חלבון, הליכה קצרה אחרי האוכל, שתייה סדירה ושעת קימה קבועה.\n\nלשתי זוויות מומחים הפעילו חוות דעת שנייה ושאלו שוב.',
    sleep:
      'איכות שינה משתפרת לרוב עם הרגלים יציבים: שעת קימה קבועה, חדר קריר יותר, פחות מסכים בהירים לפני השינה ואור יום בבוקר.\n\nהפעילו חוות דעת שנייה לניתוח כפול מעמיק יותר.',
    default:
      'אני כאן לשאלות וולנס. ספרו לי קצת יותר איך אתם מרגישים ומה השתנה לאחרונה.\n\nטיפ: הפעילו חוות דעת שנייה לשתי פרספקטיבות משלימות.',
  },
  zh: {
    energy:
      '下午精力下降很常见，往往与睡眠、饮食和作息有关。\n\n可以试试含蛋白质的午餐、饭后短散步、稳定补水，以及固定起床时间。\n\n若需要两个专家视角，请打开“第二意见”后再问一次。',
    sleep:
      '睡眠质量通常会因稳定习惯而改善：固定起床时间、凉爽卧室、睡前减少亮屏，以及早晨接触日光。\n\n打开“第二意见”可获得更深入的双重视角分析。',
    default:
      '我可以协助您的健康与养生问题。请多告诉我一些您的感受和近期变化。\n\n提示：打开“第二意见”可获得两个互补视角。',
  },
  ar: {
    energy:
      'انخفاض الطاقة بعد الظهر شائع، وغالبًا يرتبط بالنوم والوجبات وإيقاع اليوم.\n\nجرّب غداء متوازنًا مع بروتين، ومشية قصيرة بعد الأكل، وترطيبًا منتظمًا، ووقت استيقاظ ثابت.\n\nللحصول على رأيين خبيرين، فعّل الرأي الثاني واسأل مجددًا.',
    sleep:
      'تتحسن جودة النوم عادة بعادات ثابتة: وقت استيقاظ ثابت، غرفة أبرد قليلًا، شاشات أقل سطوعًا قبل النوم، وضوء الصباح.\n\nفعّل الرأي الثاني لتحليل أعمق بوجهتي نظر.',
    default:
      'أنا هنا لأسئلتك حول العافية. أخبرني أكثر كيف تشعر وما الذي تغيّر مؤخرًا.\n\nنصيحة: فعّل الرأي الثاني لمنظورين متكاملين.',
  },
  uk: {
    energy:
      'Спади енергії після обіду трапляються часто. Зазвичай вони пов’язані зі сном, їжею та ритмом дня.\n\nСпробуйте збалансований обід із білком, коротку прогулянку після їжі, регулярне пиття та стабільний час підйому.\n\nДля двох експертних поглядів увімкніть Другу думку і запитайте знову.',
    sleep:
      'Якість сну часто покращується зі сталими звичками: фіксований час підйому, прохолодніша спальня, менше яскравих екранів увечері та денне світло вранці.\n\nУвімкніть Другу думку для глибшого подвійного аналізу.',
    default:
      'Я тут, щоб допомогти з питаннями про самопочуття. Розкажіть трохи більше, як ви себе відчуваєте і що змінилося.\n\nПорада: увімкніть Другу думку для двох взаємодоповнювальних перспектив.',
  },
  ru: {
    energy:
      'Спады энергии после обеда бывают часто. Обычно они связаны со сном, едой и ритмом дня.\n\nПопробуйте сбалансированный обед с белком, короткую прогулку после еды, регулярное питьё и стабильное время подъёма.\n\nДля двух экспертных взглядов включите Второе мнение и спросите снова.',
    sleep:
      'Качество сна часто улучшается при устойчивых привычках: фиксированное время подъёма, более прохладная спальня, меньше ярких экранов вечером и дневной свет утром.\n\nВключите Второе мнение для более глубокого двойного анализа.',
    default:
      'Я здесь, чтобы помочь с вопросами о самочувствии. Расскажите чуть больше, как вы себя чувствуете и что изменилось.\n\nПодсказка: включите Второе мнение — получите две взаимодополняющие перспективы.',
  },
};

const DUAL_SPEAK: Record<AppLanguage, (a: string, b: string) => string> = {
  en: (a, b) => `${a} Another view: ${b}`,
  es: (a, b) => `${a} Otra perspectiva: ${b}`,
  fr: (a, b) => `${a} Autre point de vue : ${b}`,
  de: (a, b) => `${a} Andere Sicht: ${b}`,
  ja: (a, b) => `${a} 別の見方：${b}`,
  he: (a, b) => `${a} נקודת מבט נוספת: ${b}`,
  zh: (a, b) => `${a} 另一种看法：${b}`,
  ar: (a, b) => `${a} وجهة نظر أخرى: ${b}`,
  uk: (a, b) => `${a} Інший погляд: ${b}`,
  ru: (a, b) => `${a} Другой взгляд: ${b}`,
};

function detectTopic(input: string): Topic {
  if (TOPIC_HINTS.energy.test(input)) return 'energy';
  if (TOPIC_HINTS.sleep.test(input)) return 'sleep';
  return 'default';
}

export function healthGuideReply(input: string, lang: AppLanguage): string {
  const topic = detectTopic(input);
  return REPLIES[lang]?.[topic] ?? REPLIES.en[topic];
}

export function healthGuideDualSpeak(
  lang: AppLanguage,
  summaryA: string,
  summaryB: string,
): string {
  return (DUAL_SPEAK[lang] ?? DUAL_SPEAK.en)(summaryA, summaryB);
}
