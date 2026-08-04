#!/usr/bin/env node
/**
 * One-shot sync of SEO/USP locale keys across en + es,fr,de,ja,he,zh,ar,uk,ru.
 * Run: node scripts/sync-seo-locale-keys.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const langs = ['es', 'fr', 'de', 'ja', 'he', 'zh', 'ar', 'uk', 'ru'];

/** @type {Record<string, Record<string, unknown>>} */
const basePatches = {
  es: {
    'footer.tagline':
      'Modelo de Datos Humanos biomatemático — un modelo vivo de tu salud.',
    'footer.appsStatus':
      'Aún no hay apps nativas en App Store ni Google Play. Usa BioMath Core en el navegador o instala la app web (PWA).',
    'healthGuide.tagline': 'Orientación de doble modelo sobre tu Modelo de Datos Humanos',
    'home.seoTitle': 'Modelo de Datos Humanos biomatemático',
    'home.seoDescription':
      'BioMath Core construye un Modelo de Datos Humanos vivo — un modelo biomatemático de tu salud — y te orienta con el análisis dual de Health Guide.',
    'home.heroSubtitle':
      'Un modelo biomatemático que crece con cada evento de salud verificado — no un feed genérico de insights.',
    'home.modelSubtitle':
      'Un modelo biomatemático construido a partir de información de salud verificada.',
    'home.whatSubtitle':
      'Tu Modelo de Datos Humanos revela conexiones que permanecen ocultas cuando laboratorios, wearables e historial siguen separados.',
    'home.timelineSubtitle': 'Tu historial de salud, entendido en contexto biomatemático.',
    'home.changesSubtitle':
      'Cada evento de salud importante actualiza tu Modelo de Datos Humanos biomatemático de por vida.',
    'home.cta.title': '¿Listo para construir tu Modelo de Datos Humanos?',
    'home.cta.description':
      'Empieza con un plan que profundice tu contexto biomatemático. Health Guide ofrece orientación de doble modelo — no personalización genérica.',
    'about.subtitle':
      'Modelado biomatemático y biología computacional para un Modelo de Datos Humanos vivo — transparente, preventivo y centrado en las personas.',
    'investors.subtitle':
      'BioMath Core construye Modelos de Datos Humanos biomatemáticos y orientación de doble inteligencia con Health Guide.',
    'summary.healthIntelligence': 'Inteligencia de salud biomatemática',
    'summary.healthIntelligenceSub':
      'Navega con un Modelo de Datos Humanos vivo — primero la comprensión, después los gráficos.',
    'summary.advisorLead':
      'La forma principal de conocer BioMath Core — orientación de doble modelo antes de navegar.',
  },
  fr: {
    'footer.tagline':
      'Modèle de données humaines biomathématique — un modèle vivant de votre santé.',
    'footer.appsStatus':
      'Pas encore d’applications natives sur l’App Store ni Google Play. Utilisez BioMath Core dans le navigateur ou installez l’app web (PWA).',
    'healthGuide.tagline': 'Conseils à double modèle sur votre Modèle de données humaines',
    'home.seoTitle': 'Modèle de données humaines biomathématique',
    'home.seoDescription':
      'BioMath Core construit un Modèle de données humaines vivant — un modèle biomathématique de votre santé — et vous guide avec l’analyse duale de Health Guide.',
    'home.heroSubtitle':
      'Un modèle biomathématique qui grandit avec chaque événement de santé vérifié — pas un flux générique d’insights.',
    'home.modelSubtitle':
      'Un modèle biomathématique construit à partir d’informations de santé vérifiées.',
    'home.whatSubtitle':
      'Votre Modèle de données humaines révèle des liens invisibles lorsque laboratoires, wearables et historique restent séparés.',
    'home.timelineSubtitle': 'Votre historique de santé, compris dans un contexte biomathématique.',
    'home.changesSubtitle':
      'Chaque événement de santé important met à jour votre Modèle de données humaines biomathématique à vie.',
    'home.cta.title': 'Prêt à construire votre Modèle de données humaines ?',
    'home.cta.description':
      'Commencez par une offre qui approfondit votre contexte biomathématique. Health Guide fournit une orientation à double modèle — pas une personnalisation générique.',
    'about.subtitle':
      'Modélisation biomathématique et biologie computationnelle pour un Modèle de données humaines vivant — transparent, préventif, centré sur l’humain.',
    'investors.subtitle':
      'BioMath Core construit des Modèles de données humaines biomathématiques et une orientation à double intelligence via Health Guide.',
    'summary.healthIntelligence': 'Intelligence santé biomathématique',
    'summary.healthIntelligenceSub':
      'Naviguez avec un Modèle de données humaines vivant — la compréhension d’abord, les graphiques ensuite.',
    'summary.advisorLead':
      'La principale façon de rencontrer BioMath Core — orientation à double modèle avant la navigation.',
  },
  de: {
    'footer.tagline':
      'Biomathematisches Human Data Model — ein lebendiges Modell Ihrer Gesundheit.',
    'footer.appsStatus':
      'Noch keine nativen Apps im App Store oder bei Google Play. Nutzen Sie BioMath Core im Browser oder installieren Sie die Web-App (PWA).',
    'healthGuide.tagline': 'Doppelmodell-Guidance zu Ihrem Human Data Model',
    'home.seoTitle': 'Biomathematisches Human Data Model',
    'home.seoDescription':
      'BioMath Core baut ein lebendiges Human Data Model — ein biomathematisches Modell Ihrer Gesundheit — und führt Sie mit der Dualanalyse von Health Guide.',
    'home.heroSubtitle':
      'Ein biomathematisches Modell, das mit jedem verifizierten Gesundheitsereignis wächst — kein generischer Insight-Feed.',
    'home.modelSubtitle':
      'Ein biomathematisches Modell aus verifizierten Gesundheitsinformationen.',
    'home.whatSubtitle':
      'Ihr Human Data Model zeigt Zusammenhänge, die verborgen bleiben, wenn Labore, Wearables und Historie getrennt sind.',
    'home.timelineSubtitle': 'Ihre Gesundheitsgeschichte im biomathematischen Kontext.',
    'home.changesSubtitle':
      'Jedes wichtige Gesundheitsereignis aktualisiert Ihr lebenslanges biomathematisches Human Data Model.',
    'home.cta.title': 'Bereit, Ihr Human Data Model aufzubauen?',
    'home.cta.description':
      'Starten Sie mit einem Plan, der Ihren biomathematischen Kontext vertieft. Health Guide liefert Doppelmodell-Guidance — keine generische Personalisierung.',
    'about.subtitle':
      'Biomathematische Modellierung und Computational Biology für ein lebendiges Human Data Model — transparent, präventiv, menschenzentriert.',
    'investors.subtitle':
      'BioMath Core baut biomathematische Human Data Models und Dual-Intelligence-Guidance mit Health Guide.',
    'summary.healthIntelligence': 'Biomathematische Gesundheitsintelligenz',
    'summary.healthIntelligenceSub':
      'Navigieren Sie mit einem lebendigen Human Data Model — erst Verständnis, dann Diagramme.',
    'summary.advisorLead':
      'Der primäre Weg zu BioMath Core — Doppelmodell-Guidance vor der Navigation.',
  },
  ja: {
    'footer.tagline':
      '生物数学的なヒューマンデータモデル — あなたの健康の生きたモデル。',
    'footer.appsStatus':
      'App Store / Google Play のネイティブアプリはまだ公開していません。ブラウザで BioMath Core を使うか、ウェブアプリ（PWA）をインストールしてください。',
    'healthGuide.tagline': 'ヒューマンデータモデルに基づくデュアルモデル・ガイダンス',
    'home.seoTitle': '生物数学的ヒューマンデータモデル',
    'home.seoDescription':
      'BioMath Core は生きたヒューマンデータモデル — 健康の生物数学的モデル — を構築し、Health Guide のデュアル分析で導きます。',
    'home.heroSubtitle':
      '検証された健康イベントごとに成長する生物数学的モデル — 汎用的なインサイトフィードではありません。',
    'home.modelSubtitle': '検証された健康情報から構築される生物数学的モデル。',
    'home.whatSubtitle':
      '検査・ウェアラブル・履歴が分断されていると見えにくいつながりを、ヒューマンデータモデルが明らかにします。',
    'home.timelineSubtitle': '生物数学的な文脈で理解する健康履歴。',
    'home.changesSubtitle':
      '重要な健康イベントはすべて、生涯にわたる生物数学的ヒューマンデータモデルを更新します。',
    'home.cta.title': 'ヒューマンデータモデルを構築する準備はできましたか？',
    'home.cta.description':
      '生物数学的な文脈を深めるプランから始めましょう。Health Guide はデュアルモデルのガイダンスを提供します — 汎用的なパーソナライズではありません。',
    'about.subtitle':
      '生きたヒューマンデータモデルのための生物数学モデリングと計算生物学 — 透明で予防的、人中心。',
    'investors.subtitle':
      'BioMath Core は生物数学的ヒューマンデータモデルと、Health Guide によるデュアルインテリジェンス・ガイダンスを構築します。',
    'summary.healthIntelligence': '生物数学的ヘルスインテリジェンス',
    'summary.healthIntelligenceSub':
      '生きたヒューマンデータモデルでナビゲート — まず理解、グラフはその次。',
    'summary.advisorLead':
      'BioMath Core との主な接点 — ナビゲートの前にデュアルモデル・ガイダンス。',
  },
  he: {
    'footer.tagline':
      'מודל נתוני אדם ביו־מתמטי — מודל חי של הבריאות שלך.',
    'footer.appsStatus':
      'עדיין אין אפליקציות מקוריות ב־App Store או ב־Google Play. השתמשו ב־BioMath Core בדפדפן או התקינו את אפליקציית הווב (PWA).',
    'healthGuide.tagline': 'הכוונה במודל כפול על מודל נתוני האדם שלך',
    'home.seoTitle': 'מודל נתוני אדם ביו־מתמטי',
    'home.seoDescription':
      'BioMath Core בונה מודל נתוני אדם חי — מודל ביו־מתמטי של הבריאות שלך — ומנחה באמצעות ניתוח כפול של Health Guide.',
    'home.heroSubtitle':
      'מודל ביו־מתמטי שגדל עם כל אירוע בריאות מאומת — לא פיד תובנות גנרי.',
    'home.modelSubtitle': 'מודל ביו־מתמטי שנבנה ממידע בריאות מאומת.',
    'home.whatSubtitle':
      'מודל נתוני האדם חושף קשרים שנשארים סמויים כאשר מעבדות, לבישים והיסטוריה נשארים נפרדים.',
    'home.timelineSubtitle': 'היסטוריית הבריאות שלך, מובנת בהקשר ביו־מתמטי.',
    'home.changesSubtitle':
      'כל אירוע בריאות חשוב מעדכן את מודל נתוני האדם הביו־מתמטי לכל החיים.',
    'home.cta.title': 'מוכנים לבנות את מודל נתוני האדם שלכם?',
    'home.cta.description':
      'התחילו עם תוכנית שמעמיקה את ההקשר הביו־מתמטי. Health Guide מספק הכוונה במודל כפול — לא התאמה אישית גנרית.',
    'about.subtitle':
      'מידול ביו־מתמטי וביולוגיה חישובית למודל נתוני אדם חי — שקוף, מונע וממוקד באדם.',
    'investors.subtitle':
      'BioMath Core בונה מודלי נתוני אדם ביו־מתמטיים והכוונה באינטליגנציה כפולה דרך Health Guide.',
    'summary.healthIntelligence': 'אינטליגנציית בריאות ביו־מתמטית',
    'summary.healthIntelligenceSub':
      'נווטו עם מודל נתוני אדם חי — קודם הבנה, אחר כך גרפים.',
    'summary.advisorLead':
      'הדרך העיקרית לפגוש את BioMath Core — הכוונה במודל כפול לפני ניווט.',
  },
  zh: {
    'footer.tagline': '生物数学人体数据模型——您健康的活体模型。',
    'footer.appsStatus':
      '尚未上架 App Store 或 Google Play 原生应用。请在浏览器使用 BioMath Core，或安装网页应用（PWA）。',
    'healthGuide.tagline': '基于人体数据模型的双模型指引',
    'home.seoTitle': '生物数学人体数据模型',
    'home.seoDescription':
      'BioMath Core 构建活体人体数据模型——健康的生物数学模型——并通过 Health Guide 双分析为您指引。',
    'home.heroSubtitle': '随每条已验证健康事件成长的生物数学模型——而非泛化的洞察信息流。',
    'home.modelSubtitle': '基于已验证健康信息构建的生物数学模型。',
    'home.whatSubtitle': '当化验、可穿戴与病史彼此割裂时，人体数据模型揭示难以察觉的关联。',
    'home.timelineSubtitle': '在生物数学语境中理解您的健康史。',
    'home.changesSubtitle': '每一个重要健康事件都会更新您终身的生物数学人体数据模型。',
    'home.cta.title': '准备好构建您的人体数据模型了吗？',
    'home.cta.description':
      '从加深生物数学语境的方案开始。Health Guide 提供双模型指引——而非泛化的个性化。',
    'about.subtitle': '为活体人体数据模型而生的生物数学建模与计算生物学——透明、预防、以人为本。',
    'investors.subtitle': 'BioMath Core 构建生物数学人体数据模型，并通过 Health Guide 提供双智能指引。',
    'summary.healthIntelligence': '生物数学健康智能',
    'summary.healthIntelligenceSub': '用活体人体数据模型导航——先理解，再看图表。',
    'summary.advisorLead': '认识 BioMath Core 的主要方式——先双模型指引，再导航。',
  },
  ar: {
    'footer.tagline':
      'نموذج بيانات بشرية بيومرياضية — نموذج حي لصحتك.',
    'footer.appsStatus':
      'لا تتوفر بعد تطبيقات أصلية على App Store أو Google Play. استخدم BioMath Core في المتصفح أو ثبّت تطبيق الويب (PWA).',
    'healthGuide.tagline': 'إرشاد بنموذجين حول نموذج بياناتك البشرية',
    'home.seoTitle': 'نموذج بيانات بشرية بيومرياضي',
    'home.seoDescription':
      'يبني BioMath Core نموذج بيانات بشرية حيًا — نموذجًا بيومرياضيًا لصحتك — ويرشدك بتحليل Health Guide المزدوج.',
    'home.heroSubtitle':
      'نموذج بيومرياضي ينمو مع كل حدث صحي موثّق — وليس بث رؤى عامة.',
    'home.modelSubtitle': 'نموذج بيومرياضي مبني من معلومات صحية موثّقة.',
    'home.whatSubtitle':
      'يكشف نموذج بياناتك البشرية روابط تبقى مخفية عندما تظل التحاليل والأجهزة القابلة للارتداء والسجل منفصلة.',
    'home.timelineSubtitle': 'تاريخك الصحي، مفهومًا في سياق بيومرياضي.',
    'home.changesSubtitle':
      'كل حدث صحي مهم يحدّث نموذج بياناتك البشرية البيورياضية مدى الحياة.',
    'home.cta.title': 'هل أنت مستعد لبناء نموذج بياناتك البشرية؟',
    'home.cta.description':
      'ابدأ بخطة تعمّق سياقك البيورياضي. يقدّم Health Guide إرشادًا بنموذجين — وليس تخصيصًا عامًا.',
    'about.subtitle':
      'نمذجة بيومرياضية وأحياء حاسوبية لنموذج بيانات بشرية حي — شفاف ووقائي ومتمحور حول الإنسان.',
    'investors.subtitle':
      'يبني BioMath Core نماذج بيانات بشرية بيومرياضية وإرشادًا بذكاء مزدوج عبر Health Guide.',
    'summary.healthIntelligence': 'ذكاء صحي بيومرياضي',
    'summary.healthIntelligenceSub':
      'تنقّل بنموذج بيانات بشرية حي — الفهم أولًا، ثم الرسوم.',
    'summary.advisorLead':
      'الطريقة الأساسية للقاء BioMath Core — إرشاد بنموذجين قبل التنقل.',
  },
  uk: {
    'footer.tagline':
      'Біоматематична модель людських даних — жива модель вашого здоров’я.',
    'footer.appsStatus':
      'Нативних застосунків у App Store чи Google Play ще немає. Користуйтеся BioMath Core у браузері або встановіть вебзастосунок (PWA).',
    'healthGuide.tagline': 'Подвійне моделювання для вашої моделі людських даних',
    'home.seoTitle': 'Біоматематична модель людських даних',
    'home.seoDescription':
      'BioMath Core будує живу модель людських даних — біоматематичної моделі здоров’я — і спрямовує через подвійний аналіз Health Guide.',
    'home.heroSubtitle':
      'Біоматематична модель, що зростає з кожною перевіреною подією здоров’я — не загальна стрічка інсайтів.',
    'home.modelSubtitle':
      'Біоматематична модель, побудована з перевіреної інформації про здоров’я.',
    'home.whatSubtitle':
      'Ваша модель людських даних розкриває зв’язки, непомітні, коли аналізи, носимі пристрої та історія розділені.',
    'home.timelineSubtitle': 'Історія здоров’я в біоматематичному контексті.',
    'home.changesSubtitle':
      'Кожна важлива подія здоров’я оновлює вашу довічну біоматематичну модель людських даних.',
    'home.cta.title': 'Готові побудувати свою модель людських даних?',
    'home.cta.description':
      'Почніть із плану, що поглиблює біоматематичний контекст. Health Guide дає подвійну модельну навігацію — не загальну персоналізацію.',
    'about.subtitle':
      'Біоматематичне моделювання та обчислювальна біологія для живої моделі людських даних — прозоро, профілактично, людиноцентрично.',
    'investors.subtitle':
      'BioMath Core будує біоматематичні моделі людських даних і подвійний інтелект через Health Guide.',
    'summary.healthIntelligence': 'Біоматематичний інтелект здоров’я',
    'summary.healthIntelligenceSub':
      'Орієнтуйтеся з живою моделлю людських даних — спочатку розуміння, потім графіки.',
    'summary.advisorLead':
      'Головний спосіб познайомитися з BioMath Core — подвійна модельна навігація перед меню.',
  },
  ru: {
    'footer.tagline':
      'Биоматематическая модель человеческих данных — живая модель вашего здоровья.',
    'footer.appsStatus':
      'Нативных приложений в App Store и Google Play пока нет. Используйте BioMath Core в браузере или установите веб‑приложение (PWA).',
    'healthGuide.tagline': 'Двухмодельные рекомендации по вашей модели человеческих данных',
    'home.seoTitle': 'Биоматематическая модель человеческих данных',
    'home.seoDescription':
      'BioMath Core строит живую модель человеческих данных — биоматематической модели здоровья — и ведёт вас через двойной анализ Health Guide.',
    'home.heroSubtitle':
      'Биоматематическая модель, которая растёт с каждым проверенным событием здоровья — не лента общих инсайтов.',
    'home.modelSubtitle':
      'Биоматематическая модель на основе проверенной информации о здоровье.',
    'home.whatSubtitle':
      'Модель человеческих данных выявляет связи, которые остаются скрытыми, когда анализы, носимые устройства и история разделены.',
    'home.timelineSubtitle': 'История здоровья в биоматематическом контексте.',
    'home.changesSubtitle':
      'Каждое важное событие здоровья обновляет вашу пожизненную биоматематическую модель человеческих данных.',
    'home.cta.title': 'Готовы построить модель человеческих данных?',
    'home.cta.description':
      'Начните с плана, который углубляет биоматематический контекст. Health Guide даёт двухмодельные рекомендации — не общую персонализацию.',
    'about.subtitle':
      'Биоматематическое моделирование и вычислительная биология для живой модели человеческих данных — прозрачно, профилактически, по‑человечески.',
    'investors.subtitle':
      'BioMath Core строит биоматематические модели человеческих данных и двойной интеллект через Health Guide.',
    'summary.healthIntelligence': 'Биоматематический интеллект здоровья',
    'summary.healthIntelligenceSub':
      'Ориентируйтесь с живой моделью человеческих данных — сначала понимание, потом графики.',
    'summary.advisorLead':
      'Главный способ встретить BioMath Core — двухмодельные рекомендации до навигации.',
  },
};

/** About pack partners/advisors + SEO/mission patches per lang */
const aboutPack = {
  es: {
    seoDescription:
      'BioMath Core construye un Modelo de Datos Humanos biomatemático — un modelo vivo de tu salud — con biología computacional y orientación dual de Health Guide. Desarrollado bajo Digital Invest Inc. y moldeado por la visión BioMath Life.',
    'mission.title': 'Inteligencia de bienestar biomatemática de confianza',
    'mission.body':
      'Construimos inteligencia de bienestar práctica en la intersección de la <b>biomatemática</b>, la <b>biología computacional</b> y la <b>IA</b>. BioMath Core ayuda a personas y profesionales a navegar preguntas complejas de salud con un <b>Modelo de Datos Humanos</b> vivo y orientación dual explicable — centrada en prevención, bienestar y resiliencia a largo plazo.',
    partners: {
      label: 'Confianza y alianzas',
      title: 'Empresas y reconocimiento',
      subtitle:
        'Afiliaciones verificables de nuestros materiales públicos — sin biografías inventadas del equipo.',
      items: [
        {
          name: 'Digital Invest Inc.',
          body: 'BioMath Core se desarrolla bajo Digital Invest Inc.',
          href: 'https://digitalinvest.com/#home',
        },
        {
          name: 'BioMath Life',
          body: 'Moldeado por la visión más amplia de BioMath Life: ciencia que escala hacia el cuidado preventivo cotidiano.',
          href: 'https://biomathlife.com/#',
        },
        {
          name: 'Healthcare Tech Outlook',
          body: 'Cobertura de Digital Invest Inc. y trabajo relacionado en tecnología de la salud.',
          href: 'https://www.healthcaretechoutlook.com/digital-invest-inc',
        },
      ],
    },
    advisors: {
      label: 'Asesores científicos',
      title: 'Lista de asesores',
      subtitle: 'Los asesores científicos nombrados se listarán aquí cuando se anuncien públicamente.',
      tba: 'Por anunciar',
    },
    'cta.description':
      'Vea cómo el modelado biomatemático y la doble inteligencia convierten señales de salud en orientación humana clara.',
  },
  fr: {
    seoDescription:
      'BioMath Core construit un Modèle de données humaines biomathématique — un modèle vivant de votre santé — grâce à la biologie computationnelle et aux conseils duals de Health Guide. Développé sous Digital Invest Inc. et façonné par la vision BioMath Life.',
    'mission.title': 'Intelligence bien-être biomathématique digne de confiance',
    'mission.body':
      'Nous construisons une intelligence bien-être pratique à l’intersection de la <b>biomathématique</b>, de la <b>biologie computationnelle</b> et de l’<b>IA</b>. BioMath Core aide les personnes et les professionnels à naviguer des questions de santé complexes avec un <b>Modèle de données humaines</b> vivant et des conseils duals explicables — axés sur la prévention, le bien-être et la résilience à long terme.',
    partners: {
      label: 'Confiance et partenariats',
      title: 'Entreprises et reconnaissance',
      subtitle:
        'Affiliations vérifiables issues de nos documents publics — aucune biographie d’équipe inventée.',
      items: [
        {
          name: 'Digital Invest Inc.',
          body: 'BioMath Core est développé sous Digital Invest Inc.',
          href: 'https://digitalinvest.com/#home',
        },
        {
          name: 'BioMath Life',
          body: 'Façonné par la vision plus large BioMath Life : une science qui passe à l’échelle des soins préventifs du quotidien.',
          href: 'https://biomathlife.com/#',
        },
        {
          name: 'Healthcare Tech Outlook',
          body: 'Couverture de Digital Invest Inc. et des travaux connexes en technologie de la santé.',
          href: 'https://www.healthcaretechoutlook.com/digital-invest-inc',
        },
      ],
    },
    advisors: {
      label: 'Conseillers scientifiques',
      title: 'Liste des conseillers',
      subtitle:
        'Les conseillers scientifiques nommés seront listés ici lorsqu’ils seront annoncés publiquement.',
      tba: 'À annoncer',
    },
    'cta.description':
      'Découvrez comment la modélisation biomathématique et la double intelligence transforment les signaux de santé en conseils humains clairs.',
  },
  de: {
    seoDescription:
      'BioMath Core baut ein biomathematisches Human Data Model — ein lebendiges Modell Ihrer Gesundheit — mit Computational Biology und Dual-Guidance von Health Guide. Entwickelt unter Digital Invest Inc. und geprägt von der Vision BioMath Life.',
    'mission.title': 'Vertrauenswürdige biomathematische Wellness-Intelligenz',
    'mission.body':
      'Wir bauen praktische Wellness-Intelligenz an der Schnittstelle von <b>Biomathematik</b>, <b>Computational Biology</b> und <b>KI</b>. BioMath Core hilft Menschen und Fachkräften, komplexe Gesundheitsfragen mit einem lebendigen <b>Human Data Model</b> und erklärbarer Doppelmodell-Guidance zu navigieren — mit Fokus auf Prävention, Wellness und langfristige Resilienz.',
    partners: {
      label: 'Vertrauen & Partnerschaften',
      title: 'Unternehmen und Anerkennung',
      subtitle:
        'Überprüfbare Affiliations aus unseren öffentlichen Materialien — keine erfundenen Team-Bios.',
      items: [
        {
          name: 'Digital Invest Inc.',
          body: 'BioMath Core wird unter Digital Invest Inc. entwickelt.',
          href: 'https://digitalinvest.com/#home',
        },
        {
          name: 'BioMath Life',
          body: 'Geprägt von der breiteren Vision BioMath Life: Wissenschaft, die in die tägliche Prävention skaliert.',
          href: 'https://biomathlife.com/#',
        },
        {
          name: 'Healthcare Tech Outlook',
          body: 'Berichterstattung über Digital Invest Inc. und verwandte Health-Technology-Arbeit.',
          href: 'https://www.healthcaretechoutlook.com/digital-invest-inc',
        },
      ],
    },
    advisors: {
      label: 'Wissenschaftliche Berater',
      title: 'Beraterliste',
      subtitle:
        'Benannte wissenschaftliche Berater werden hier aufgeführt, sobald sie öffentlich bekannt gegeben werden.',
      tba: 'Demnächst bekannt',
    },
    'cta.description':
      'Sehen Sie, wie biomathematische Modellierung und Dual Intelligence Gesundheitssignale in klare, menschliche Guidance verwandeln.',
  },
  ja: {
    seoDescription:
      'BioMath Core は生物数学的ヒューマンデータモデル — 健康の生きたモデル — を、計算生物学と Health Guide のデュアルガイダンスで構築します。Digital Invest Inc. の下で開発され、BioMath Life のビジョンに沿っています。',
    'mission.title': '信頼できる生物数学的ウェルネスインテリジェンス',
    'mission.body':
      '私たちは <b>生物数学</b>、<b>計算生物学</b>、<b>AI</b> の交差点で実践的なウェルネスインテリジェンスを構築します。BioMath Core は、生きた <b>ヒューマンデータモデル</b> と説明可能なデュアルモデル・ガイダンスで、複雑な健康の問いに向き合う人々と専門家を支えます — 予防、ウェルネス、長期的な回復力に焦点を当てます。',
    partners: {
      label: '信頼とパートナーシップ',
      title: '企業と認知',
      subtitle: '公開資料で確認できる提携のみ — 架空のチーム経歴は記載しません。',
      items: [
        {
          name: 'Digital Invest Inc.',
          body: 'BioMath Core は Digital Invest Inc. の下で開発されています。',
          href: 'https://digitalinvest.com/#home',
        },
        {
          name: 'BioMath Life',
          body: 'より広い BioMath Life のビジョンに沿っています：日常の予防ケアへ拡張する科学。',
          href: 'https://biomathlife.com/#',
        },
        {
          name: 'Healthcare Tech Outlook',
          body: 'Digital Invest Inc. と関連するヘルステック活動の報道。',
          href: 'https://www.healthcaretechoutlook.com/digital-invest-inc',
        },
      ],
    },
    advisors: {
      label: '科学アドバイザー',
      title: 'アドバイザー名簿',
      subtitle: '氏名付きの科学アドバイザーは公開発表後にここに掲載します。',
      tba: '近日発表',
    },
    'cta.description':
      '生物数学モデリングとデュアルインテリジェンスが、健康シグナルを明確で人間的なガイダンスに変える様子をご覧ください。',
  },
  he: {
    seoDescription:
      'BioMath Core בונה מודל נתוני אדם ביו־מתמטי — מודל חי של הבריאות שלך — באמצעות ביולוגיה חישובית והכוונה כפולה של Health Guide. מפותח תחת Digital Invest Inc. ומעוצב לפי חזון BioMath Life.',
    'mission.title': 'אינטליגנציית בריאות ביו־מתמטית אמינה',
    'mission.body':
      'אנו בונים אינטליגנציית בריאות מעשית במפגש בין <b>ביו־מתמטיקה</b>, <b>ביולוגיה חישובית</b> ו־<b>AI</b>. BioMath Core עוזר לאנשים ולאנשי מקצוע לנווט בשאלות בריאות מורכבות עם <b>מודל נתוני אדם</b> חי והכוונה כפולה שניתן להסביר — עם דגש על מניעה, רווחה וחוסן לטווח ארוך.',
    partners: {
      label: 'אמון ושותפויות',
      title: 'חברות והכרה',
      subtitle: 'שיוכים שניתן לאמת מחומרים ציבוריים — ללא ביוגרפיות צוות מומצאות.',
      items: [
        {
          name: 'Digital Invest Inc.',
          body: 'BioMath Core מפותח תחת Digital Invest Inc.',
          href: 'https://digitalinvest.com/#home',
        },
        {
          name: 'BioMath Life',
          body: 'מעוצב לפי חזון BioMath Life הרחב יותר: מדע שמתרחב לטיפול מונע יומיומי.',
          href: 'https://biomathlife.com/#',
        },
        {
          name: 'Healthcare Tech Outlook',
          body: 'סיקור של Digital Invest Inc. ועבודה קשורה בטכנולוגיית בריאות.',
          href: 'https://www.healthcaretechoutlook.com/digital-invest-inc',
        },
      ],
    },
    advisors: {
      label: 'יועצים מדעיים',
      title: 'רשימת יועצים',
      subtitle: 'יועצים מדעיים בשם יופיעו כאן לאחר הודעה פומבית.',
      tba: 'יפורסם בקרוב',
    },
    'cta.description':
      'ראו כיצד מידול ביו־מתמטי ואינטליגנציה כפולה הופכים אותות בריאות להכוונה אנושית ברורה.',
  },
  zh: {
    seoDescription:
      'BioMath Core 构建生物数学人体数据模型——健康的活体模型——依托计算生物学与 Health Guide 双模型指引。由 Digital Invest Inc. 开发，并受 BioMath Life 愿景塑造。',
    'mission.title': '可信的生物数学健康智能',
    'mission.body':
      '我们在 <b>生物数学</b>、<b>计算生物学</b> 与 <b>AI</b> 的交汇处构建实用健康智能。BioMath Core 帮助个人与专业人士以活体 <b>人体数据模型</b> 与可解释的双模型指引应对复杂健康问题——聚焦预防、健康与长期韧性。',
    partners: {
      label: '信任与合作',
      title: '公司与认可',
      subtitle: '仅列出公开材料中可核实的关联——不编造团队履历。',
      items: [
        {
          name: 'Digital Invest Inc.',
          body: 'BioMath Core 由 Digital Invest Inc. 开发。',
          href: 'https://digitalinvest.com/#home',
        },
        {
          name: 'BioMath Life',
          body: '受更广泛的 BioMath Life 愿景塑造：让科学扩展到日常预防护理。',
          href: 'https://biomathlife.com/#',
        },
        {
          name: 'Healthcare Tech Outlook',
          body: '对 Digital Invest Inc. 及相关健康科技工作的报道。',
          href: 'https://www.healthcaretechoutlook.com/digital-invest-inc',
        },
      ],
    },
    advisors: {
      label: '科学顾问',
      title: '顾问名单',
      subtitle: '具名科学顾问将在公开发布后列于此处。',
      tba: '即将公布',
    },
    'cta.description':
      '了解生物数学建模与双智能如何将健康信号转化为清晰、人本的指引。',
  },
  ar: {
    seoDescription:
      'يبني BioMath Core نموذج بيانات بشرية بيومرياضيًا — نموذجًا حيًا لصحتك — عبر الأحياء الحاسوبية وإرشاد Health Guide المزدوج. يُطوَّر تحت Digital Invest Inc. ويتشكّل برؤية BioMath Life.',
    'mission.title': 'ذكاء عافية بيومرياضي موثوق',
    'mission.body':
      'نبني ذكاء عافية عمليًا عند تقاطع <b>الرياضيات الحيوية</b> و<b>الأحياء الحاسوبية</b> و<b>الذكاء الاصطناعي</b>. يساعد BioMath Core الأفراد والمتخصصين على التنقل في أسئلة صحية معقدة عبر <b>نموذج بيانات بشرية</b> حي وإرشاد مزدوج قابل للتفسير — مع التركيز على الوقاية والعافية والمرونة طويلة الأمد.',
    partners: {
      label: 'الثقة والشراكات',
      title: 'شركات واعتراف',
      subtitle: 'انتماءات يمكن التحقق منها من موادنا العامة — بلا سير ذاتية ملفّقة للفريق.',
      items: [
        {
          name: 'Digital Invest Inc.',
          body: 'يُطوَّر BioMath Core تحت Digital Invest Inc.',
          href: 'https://digitalinvest.com/#home',
        },
        {
          name: 'BioMath Life',
          body: 'يتشكّل برؤية BioMath Life الأوسع: علم يمتد إلى الرعاية الوقائية اليومية.',
          href: 'https://biomathlife.com/#',
        },
        {
          name: 'Healthcare Tech Outlook',
          body: 'تغطية لـ Digital Invest Inc. والأعمال ذات الصلة في تقنيات الصحة.',
          href: 'https://www.healthcaretechoutlook.com/digital-invest-inc',
        },
      ],
    },
    advisors: {
      label: 'مستشارون علميون',
      title: 'قائمة المستشارين',
      subtitle: 'سيُدرج المستشارون العلميون بالاسم هنا عند الإعلان عنهم علنًا.',
      tba: 'سيُعلن لاحقًا',
    },
    'cta.description':
      'اطّلع على كيف يحوّل النمذجة البيورياضية والذكاء المزدوج إشارات الصحة إلى إرشاد بشري واضح.',
  },
  uk: {
    seoDescription:
      'BioMath Core будує біоматематичну модель людських даних — живої моделі здоров’я — через обчислювальну біологію та подвійну навігацію Health Guide. Розробляється під Digital Invest Inc. і формується баченням BioMath Life.',
    'mission.title': 'Надійний біоматематичний велнес-інтелект',
    'mission.body':
      'Ми будуємо практичний велнес-інтелект на перетині <b>біоматематики</b>, <b>обчислювальної біології</b> та <b>ШІ</b>. BioMath Core допомагає людям і фахівцям орієнтуватися в складних питаннях здоров’я за допомогою живої <b>моделі людських даних</b> та пояснюваної подвійної навігації — з фокусом на профілактику, велнес і довгострокову стійкість.',
    partners: {
      label: 'Довіра та партнерства',
      title: 'Компанії та визнання',
      subtitle:
        'Перевірювані афіліації з наших публічних матеріалів — без вигаданих біографій команди.',
      items: [
        {
          name: 'Digital Invest Inc.',
          body: 'BioMath Core розробляється під Digital Invest Inc.',
          href: 'https://digitalinvest.com/#home',
        },
        {
          name: 'BioMath Life',
          body: 'Формується ширшим баченням BioMath Life: наука, що масштабується в щоденну профілактику.',
          href: 'https://biomathlife.com/#',
        },
        {
          name: 'Healthcare Tech Outlook',
          body: 'Охоплення Digital Invest Inc. і пов’язаної роботи в health-технологіях.',
          href: 'https://www.healthcaretechoutlook.com/digital-invest-inc',
        },
      ],
    },
    advisors: {
      label: 'Наукові радники',
      title: 'Список радників',
      subtitle: 'Іменовані наукові радники з’являться тут після публічного оголошення.',
      tba: 'Буде оголошено',
    },
    'cta.description':
      'Подивіться, як біоматематичне моделювання та подвійний інтелект перетворюють сигнали здоров’я на зрозумілу людську навігацію.',
  },
  ru: {
    seoDescription:
      'BioMath Core строит биоматематическую модель человеческих данных — живой модели здоровья — через вычислительную биологию и двойные рекомендации Health Guide. Разрабатывается под Digital Invest Inc. и формируется видением BioMath Life.',
    'mission.title': 'Надёжный биоматематический велнес-интеллект',
    'mission.body':
      'Мы создаём практический велнес-интеллект на стыке <b>биоматематики</b>, <b>вычислительной биологии</b> и <b>ИИ</b>. BioMath Core помогает людям и специалистам ориентироваться в сложных вопросах здоровья с помощью живой <b>модели человеческих данных</b> и объяснимых двухмодельных рекомендаций — с фокусом на профилактику, велнес и долгосрочную устойчивость.',
    partners: {
      label: 'Доверие и партнёрства',
      title: 'Компании и признание',
      subtitle:
        'Проверяемые аффилиации из наших публичных материалов — без выдуманных биографий команды.',
      items: [
        {
          name: 'Digital Invest Inc.',
          body: 'BioMath Core разрабатывается под Digital Invest Inc.',
          href: 'https://digitalinvest.com/#home',
        },
        {
          name: 'BioMath Life',
          body: 'Формируется более широким видением BioMath Life: наука, которая масштабируется в повседневную профилактику.',
          href: 'https://biomathlife.com/#',
        },
        {
          name: 'Healthcare Tech Outlook',
          body: 'Освещение Digital Invest Inc. и связанной работы в health-технологиях.',
          href: 'https://www.healthcaretechoutlook.com/digital-invest-inc',
        },
      ],
    },
    advisors: {
      label: 'Научные советники',
      title: 'Список советников',
      subtitle: 'Именованные научные советники появятся здесь после публичного объявления.',
      tba: 'Будет объявлено',
    },
    'cta.description':
      'Посмотрите, как биоматематическое моделирование и двойной интеллект превращают сигналы здоровья в понятные человеческие рекомендации.',
  },
};

const scienceHero = {
  es: {
    description:
      'Fundamento científico de BioMath Core: modelado biomatemático y un Modelo de Datos Humanos vivo — no insights personalizados genéricos ni paneles solo de biomarcadores.',
    body: 'BioMath Core se basa en décadas de investigación en biología de sistemas, biomatemática y modelado fisiológico — aplicadas como un Modelo de Datos Humanos vivo, un modelo biomatemático de tu salud.',
  },
  fr: {
    description:
      'Fondement scientifique de BioMath Core : modélisation biomathématique et Modèle de données humaines vivant — pas des insights personnalisés génériques ni des tableaux de biomarqueurs seuls.',
    body: 'BioMath Core s’appuie sur des décennies de recherche en biologie des systèmes, biomathématique et modélisation physiologique — appliquées comme un Modèle de données humaines vivant, un modèle biomathématique de votre santé.',
  },
  de: {
    description:
      'Wissenschaftliche Grundlage von BioMath Core: biomathematische Modellierung und ein lebendiges Human Data Model — keine generischen personalisierten Insights oder reine Biomarker-Dashboards.',
    body: 'BioMath Core basiert auf jahrzehntelanger Forschung in Systembiologie, Biomathematik und physiologischer Modellierung — umgesetzt als lebendiges Human Data Model, ein biomathematisches Modell Ihrer Gesundheit.',
  },
  ja: {
    description:
      'BioMath Core の科学的基盤：生物数学モデリングと生きたヒューマンデータモデル — 汎用的なパーソナライズド・インサイトやバイオマーカーだけのダッシュボードではありません。',
    body: 'BioMath Core はシステム生物学・生物数学・生理モデリングの長年の研究に基づき、生きたヒューマンデータモデル — 健康の生物数学的モデル — として応用されています。',
  },
  he: {
    description:
      'הבסיס המדעי של BioMath Core: מידול ביו־מתמטי ומודל נתוני אדם חי — לא תובנות מותאמות גנריות או לוחות סמנים ביולוגיים בלבד.',
    body: 'BioMath Core מבוסס על עשרות שנות מחקר בביולוגיית מערכות, ביו־מתמטיקה ומידול פיזיולוגי — מיושם כמודל נתוני אדם חי, מודל ביו־מתמטי של הבריאות שלך.',
  },
  zh: {
    description:
      'BioMath Core 的科学基础：生物数学建模与活体人体数据模型——而非泛化的个性化洞察或仅有生物标志物的仪表盘。',
    body: 'BioMath Core 建立在系统生物学、生物数学与生理建模数十年研究之上——以活体人体数据模型（健康的生物数学模型）形式应用。',
  },
  ar: {
    description:
      'الأساس العلمي لـ BioMath Core: نمذجة بيومرياضية ونموذج بيانات بشرية حي — وليس رؤى مخصصة عامة أو لوحات مؤشرات حيوية فقط.',
    body: 'يُبنى BioMath Core على عقود من البحث في بيولوجيا النظم والرياضيات الحيوية والنمذجة الفسيولوجية — مطبّقًا كنموذج بيانات بشرية حي، نموذج بيومرياضي لصحتك.',
  },
  uk: {
    description:
      'Наукова основа BioMath Core: біоматематичне моделювання та жива модель людських даних — не загальні персоналізовані інсайти й не дашборди лише біомаркерів.',
    body: 'BioMath Core побудовано на десятиліттях досліджень системної біології, біоматематики та фізіологічного моделювання — застосованих як жива модель людських даних, біоматематична модель здоров’я.',
  },
  ru: {
    description:
      'Научная основа BioMath Core: биоматематическое моделирование и живая модель человеческих данных — не общие персонализированные инсайты и не дашборды только биомаркеров.',
    body: 'BioMath Core опирается на десятилетия исследований системной биологии, биоматематики и физиологического моделирования — реализованных как живая модель человеческих данных, биоматематическая модель здоровья.',
  },
};

const whyTwo = {
  es: {
    description:
      'BioMath Core usa dos modelos independientes — biomatemático y clínico — sobre tu Modelo de Datos Humanos. El análisis dual es lo opuesto a una puntuación genérica de personalización.',
    body: 'BioMath Core ejecuta dos análisis independientes sobre tu Modelo de Datos Humanos — uno biomatemático y otro clínico — y compara los resultados. Cuando coinciden, la confianza es alta. Cuando difieren, destaca áreas que merecen más atención.',
  },
  fr: {
    description:
      'BioMath Core utilise deux modèles indépendants — biomathématique et clinique — sur votre Modèle de données humaines. L’analyse duale est l’opposé d’un score de personnalisation générique.',
    body: 'BioMath Core lance deux analyses indépendantes sur votre Modèle de données humaines — l’une biomathématique, l’autre clinique — et compare les résultats. Quand elles s’accordent, la confiance est élevée. Quand elles divergent, cela met en évidence les zones à surveiller.',
  },
  de: {
    description:
      'BioMath Core nutzt zwei unabhängige Modelle — biomathematisch und klinisch — auf Ihrem Human Data Model. Dualanalyse ist das Gegenteil eines generischen Personalisierungsscores.',
    body: 'BioMath Core führt zwei unabhängige Analysen auf Ihrem Human Data Model durch — eine biomathematische, eine klinische — und vergleicht die Ergebnisse. Bei Übereinstimmung ist die Sicherheit hoch. Bei Abweichungen werden Bereiche hervorgehoben, die mehr Aufmerksamkeit verdienen.',
  },
  ja: {
    description:
      'BioMath Core はヒューマンデータモデル上で独立した二つのモデル — 生物数学と臨床 — を用います。デュアル分析は汎用パーソナライズスコアの対極です。',
    body: 'BioMath Core はヒューマンデータモデルに対して、生物数学と臨床の二つの独立した分析を実行し、結果を比較します。一致すれば確信度は高く、相違すれば注目すべき領域が浮かび上がります。',
  },
  he: {
    description:
      'BioMath Core משתמש בשני מודלים עצמאיים — ביו־מתמטי וקליני — על מודל נתוני האדם שלך. ניתוח כפול הוא ההפך מציון התאמה אישית גנרי.',
    body: 'BioMath Core מריץ שני ניתוחים עצמאיים על מודל נתוני האדם שלך — אחד ביו־מתמטי ואחד קליני — ומשווה את התוצאות. כשהם מסכימים, הביטחון גבוה. כשהם נבדלים, זה מדגיש אזורים שדורשים תשומת לב.',
  },
  zh: {
    description:
      'BioMath Core 在您的人体数据模型上使用两个独立模型——生物数学与临床。双分析与单一泛化个性化分数截然不同。',
    body: 'BioMath Core 对您的人体数据模型运行两个独立分析——生物数学与临床——并比较结果。一致时信心更高；分歧时则标出值得关注的领域。',
  },
  ar: {
    description:
      'يستخدم BioMath Core نموذجين مستقلين — بيومرياضي وسريري — على نموذج بياناتك البشرية. التحليل المزدوج نقيض درجة تخصيص عامة.',
    body: 'يشغّل BioMath Core تحليلين مستقلين على نموذج بياناتك البشرية — أحدهما بيومرياضي والآخر سريري — ويقارن النتائج. عند الاتفاق تكون الثقة عالية. وعند الاختلاف يبرز ما يستحق انتباهاً أكبر.',
  },
  uk: {
    description:
      'BioMath Core використовує дві незалежні моделі — біоматематичну та клінічну — на вашій моделі людських даних. Подвійний аналіз — протилежність загальному балу персоналізації.',
    body: 'BioMath Core виконує два незалежні аналізи на вашій моделі людських даних — біоматематичний і клінічний — і порівнює результати. Коли вони збігаються, впевненість висока. Коли різняться — підсвічує зони, що потребують уваги.',
  },
  ru: {
    description:
      'BioMath Core использует две независимые модели — биоматематическую и клиническую — на вашей модели человеческих данных. Двойной анализ — противоположность общему баллу персонализации.',
    body: 'BioMath Core выполняет два независимых анализа вашей модели человеческих данных — биоматематический и клинический — и сравнивает результаты. Когда они совпадают, уверенность высока. Когда расходятся — выделяет зоны, требующие внимания.',
  },
};

function setPath(obj, dotted, value) {
  const parts = dotted.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

function writeJson(file, data) {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

for (const lang of langs) {
  const baseFile = path.join(root, 'src/locales', `${lang}.json`);
  const base = JSON.parse(fs.readFileSync(baseFile, 'utf8'));
  for (const [k, v] of Object.entries(basePatches[lang])) {
    setPath(base, k, v);
  }
  writeJson(baseFile, base);

  const aboutFile = path.join(root, 'src/locales', lang, 'about.json');
  const about = JSON.parse(fs.readFileSync(aboutFile, 'utf8'));
  const ap = aboutPack[lang];
  about.about.seoDescription = ap.seoDescription;
  about.about.mission.title = ap['mission.title'];
  about.about.mission.body = ap['mission.body'];
  about.about.partners = ap.partners;
  about.about.advisors = ap.advisors;
  about.about.cta.description = ap['cta.description'];
  writeJson(aboutFile, about);

  const scienceFile = path.join(root, 'src/locales', lang, 'science.json');
  const science = JSON.parse(fs.readFileSync(scienceFile, 'utf8'));
  science.science.seo.description = scienceHero[lang].description;
  science.science.hero.body = scienceHero[lang].body;
  writeJson(scienceFile, science);

  const whyFile = path.join(root, 'src/locales', lang, 'whyTwoModels.json');
  const why = JSON.parse(fs.readFileSync(whyFile, 'utf8'));
  why.whyTwoModels.seo.description = whyTwo[lang].description;
  why.whyTwoModels.hero.body = whyTwo[lang].body;
  writeJson(whyFile, why);

  console.log(`synced ${lang}`);
}

console.log('done');
