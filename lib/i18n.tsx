'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Lang = 'en' | 'fr' | 'ar'

export const RTL_LANGS: Lang[] = ['ar']

// ─────────────────────────────────────────────────────────────────
// TRANSLATIONS
// ─────────────────────────────────────────────────────────────────
export const translations = {
  en: {
    // Navbar
    nav: {
      platform: 'Platform',
      howItWorks: 'How It Works',
      product: 'Product',
      pricing: 'Pricing',
      demo: 'Demo',
      iotDemo: 'IoT Demo',
      contact: 'Contact',
      requestDemo: 'Request a Demo',
    },
    // Hero
    hero: {
      badge: 'AI-Powered Predictive Maintenance',
      title1: 'Stop Equipment',
      titleAccent: 'Failures',
      title2: 'Before They Happen',
      subtitle:
        'Mainteligence uses AI and real-time data to predict failures, estimate Remaining Useful Life (RUL), and optimize industrial maintenance — with or without existing IoT infrastructure.',
      cta1: 'Request a Demo',
      cta2: 'Start Live Demo',
      trust1: 'AI-powered',
      trust2: 'Industrial-grade',
      trust3: 'On-premise ready',
      dashboardLabel: 'mainteligence — dashboard',
      live: 'LIVE',
    },
    // Problem
    problem: {
      tag: 'The Problem',
      title1: 'Industrial Failures Are',
      titleAccent: 'Predictable.',
      title2: 'Yet They Keep Happening.',
      subtitle:
        'Every year, factories lose billions to failures that could have been foreseen. The root cause is not bad luck — it is the absence of real-time intelligence.',
      callout:
        'Industrial companies generate massive amounts of operational data but lack the tools to extract actionable maintenance intelligence from it in real time. Mainteligence was built to solve exactly this.',
      calloutBold: 'The core issue:',
      cards: [
        {
          stat: '$50B+',
          statLabel: 'lost annually',
          title: 'Unexpected Equipment Failures',
          description:
            'Unplanned downtime brings production to a halt without warning. In heavy industry, a single failure can cascade into days of lost output and costly emergency repairs.',
        },
        {
          stat: '30–40%',
          statLabel: 'of maintenance spend wasted',
          title: 'Excessive Maintenance Costs',
          description:
            'Over-scheduling preventive maintenance wastes labor and parts. Under-scheduling creates failures. Without data, your maintenance team is forced to guess.',
        },
        {
          stat: '0',
          statLabel: 'real-time visibility',
          title: 'No Real-Time Asset Visibility',
          description:
            'Operators rely on lagging indicators — periodic inspections, operator intuition, and manual logs. By the time a fault is detected, significant damage has often already occurred.',
        },
        {
          stat: '70%',
          statLabel: 'of factories lack IoT',
          title: 'No Existing IoT Infrastructure',
          description:
            'Most industrial facilities run on legacy equipment with zero connectivity. Deploying traditional IoT solutions requires costly overhauls that take years and significant CapEx.',
        },
      ],
    },
    // Solution
    solution: {
      tag: 'The Solution',
      title: 'Introducing',
      titleAccent: 'Mainteligence',
      subtitle:
        'An end-to-end predictive maintenance platform that combines proprietary IoT hardware with industrial-grade AI — deployable in days, not months.',
      quote: 'From raw sensor data to actionable maintenance decisions.',
      archLabel: 'Platform Architecture',
      pillars: [
        {
          title: 'Predictive AI Models',
          description:
            'Deep learning models trained on real industrial datasets predict failures before they occur, with configurable lead-time thresholds for each asset class.',
        },
        {
          title: 'Mainteligence Sense',
          description:
            'A ruggedized IoT gateway that retrofits onto legacy equipment in under an hour. No electrical overhaul required.',
        },
        {
          title: 'Unified Dashboard',
          description:
            'A single operational view covering RUL predictions, sensor health, alert triage, and maintenance scheduling — built for engineers.',
        },
        {
          title: 'On-Premise Deployment',
          description:
            'Your data never leaves your facility. Mainteligence runs fully on-premise, meeting the strictest industrial data governance requirements.',
        },
      ],
      archSteps: [
        { label: 'Legacy Machine', sub: 'Any equipment' },
        { label: 'Sense Device', sub: 'IoT gateway' },
        { label: 'Edge Processing', sub: 'Local compute' },
        { label: 'AI Engine', sub: 'RUL models' },
        { label: 'Dashboard', sub: 'Actionable insights' },
      ],
    },
    // How It Works
    howItWorks: {
      tag: 'How It Works',
      title1: 'From Machine to Decision in',
      titleAccent: '5 Steps',
      subtitle:
        'A fully integrated workflow that requires no prior IoT setup and minimal IT involvement.',
      lastStepNote: 'Failure prevented — production continues',
      steps: [
        {
          title: 'Install Mainteligence Sense',
          description:
            'Mount the ruggedized IoT device on any machine using standard industrial fittings. No production downtime, no electrical modifications.',
          tag: 'Hardware',
        },
        {
          title: 'Collect Real-Time Data',
          description:
            'The Sense device captures vibration, temperature, pressure, current draw, and acoustic signatures. Data is processed at the edge and transmitted securely.',
          tag: 'IoT',
        },
        {
          title: 'AI Analyzes Degradation',
          description:
            'Our deep learning models — trained on NASA turbofan and CMAPSS datasets — identify degradation patterns and estimate Remaining Useful Life.',
          tag: 'AI / ML',
        },
        {
          title: 'Dashboard Shows Insights',
          description:
            'Maintenance engineers see RUL forecasts, health scores, threshold alerts, and recommended actions — all in one interface.',
          tag: 'Software',
        },
        {
          title: 'Prevent Failures Before Breakdown',
          description:
            'Configurable lead-time alerts notify your team days or weeks before predicted failure — eliminating reactive emergencies and wasteful over-servicing.',
          tag: 'Action',
        },
      ],
    },
    // Value
    value: {
      tag: 'Why Mainteligence',
      title1: 'Measurable Value.',
      titleAccent: 'From Day One.',
      onPremiseTitle: 'On-Premise Deployment — Your Data Never Leaves Your Facility',
      onPremiseDesc:
        'For manufacturers, utilities, and defense contractors where data sovereignty is mandatory, Mainteligence offers a fully air-gapped deployment mode. No cloud connectivity required. No data leaves your network. Ever.',
      items: [
        { metric: 'Up to 35%', label: 'Reduction in Unplanned Downtime', description: 'Early failure detection eliminates emergency shutdowns that cost industrial facilities an average of $260,000 per hour.' },
        { metric: 'Weeks ahead', label: 'Failure Prediction Lead Time', description: 'Know about a developing fault days or weeks before breakdown — giving your team time to plan maintenance at the optimal window.' },
        { metric: '40–60%', label: 'Improvement in Maintenance Efficiency', description: 'Move from time-based to condition-based maintenance. Service assets when they need it — not before, not after.' },
        { metric: 'Zero', label: 'Existing IoT Infrastructure Required', description: 'The Mainteligence Sense device provides all the connectivity you need. Deploy on day one, regardless of your current setup.' },
        { metric: '100%', label: 'On-Premise Deployment Available', description: 'Full air-gapped deployment for facilities where data sovereignty is non-negotiable. Your operational data stays on your servers.' },
      ],
    },
    // Contact
    contact: {
      tag: 'Contact',
      title: "Let's Talk About Your Maintenance Challenge",
      subtitle:
        "Whether you're evaluating predictive maintenance for the first time or looking to replace an existing system, our team will scope a deployment that fits your facility.",
      labels: {
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Work Email',
        company: 'Company',
        role: 'Your Role',
        reason: 'What can we help you with?',
        message: 'Message (optional)',
        submit: 'Send Message',
        privacy: 'By submitting, you agree to our privacy policy. No spam, ever.',
      },
      placeholders: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@company.com',
        company: 'ACME Industrial',
        role: 'Maintenance Engineer',
        message: 'Tell us about your facility, machines, existing infrastructure, and maintenance challenges...',
      },
      reasons: [
        'Request a product demo',
        'Platform & pricing questions',
        'Mainteligence Sense hardware',
        'On-premise deployment inquiry',
        'Partnership / integration',
        'Other',
      ],
      success: {
        title: 'Message Received',
        body: 'Your request has been sent successfully. We will contact you shortly.',
        tryDemo: 'Try the Demo',
        viewPlatform: 'View Platform',
      },
      sidebar: {
        responseTitle: 'Response Time',
        responseSubtitle: 'Typical response on business days.',
        responseValue: '< 1 day',
        rows: [
          { label: 'Demo requests', time: 'Same day' },
          { label: 'Sales inquiries', time: '< 24 hours' },
          { label: 'Technical questions', time: '< 48 hours' },
        ],
        directTitle: 'Direct Contact',
        expectTitle: 'What to Expect',
        expectSteps: [
          'Initial discovery call (30 min)',
          'Facility & infrastructure assessment',
          'Custom deployment scope proposal',
          'Pilot program on 2–5 machines',
          'Full deployment with on-site support',
        ],
        notReadyTitle: 'Not ready to talk yet?',
        notReadyBody: 'Run the live LSTM demo on NASA turbofan data — no account required.',
        notReadyCta: 'Try the Demo',
      },
    },
    // CTA Footer
    cta: {
      tag: 'Get Started',
      title1: 'Transform Your',
      titleAccent: 'Maintenance Strategy',
      subtitle:
        'Join industrial operators who have already moved from reactive to predictive. Let us scope a deployment for your facility.',
      btn1: 'Request a Demo',
      btn2: 'Contact Our Team',
      footerLinks: {
        platform: 'Platform',
        company: 'Company',
        platformLinks: [
          { label: 'Platform Software', href: '/dashboard' },
          { label: 'Sense Hardware', href: '/product' },
          { label: 'Live Demo', href: '/demo' },
          { label: 'Pricing', href: '/pricing' },
        ],
        companyLinks: [
          { label: 'Product', href: '/product' },
          { label: 'Contact', href: '/contact' },
          { label: 'Security', href: '/contact' },
          { label: 'Request Demo', href: '/demo' },
        ],
      },
      copyright: 'Mainteligence. Industrial AI for the real world.',
    },
  },

  // ─────────────────────────────────────────────────────────────────
  // FRENCH
  // ─────────────────────────────────────────────────────────────────
  fr: {
    nav: {
      platform: 'Plateforme',
      howItWorks: 'Fonctionnement',
      product: 'Produit',
      pricing: 'Tarifs',
      demo: 'Démo',
      iotDemo: 'Démo IoT',
      contact: 'Contact',
      requestDemo: 'Demander une démo',
    },
    hero: {
      badge: 'Maintenance Prédictive Propulsée par l\'IA',
      title1: 'Anticipez les Pannes',
      titleAccent: 'Machines',
      title2: 'Avant Qu\'elles Surviennent',
      subtitle:
        'Mainteligence utilise l\'IA et les données en temps réel pour prédire les pannes, estimer la Durée de Vie Résiduelle (RUL) et optimiser la maintenance industrielle — avec ou sans infrastructure IoT existante.',
      cta1: 'Demander une démo',
      cta2: 'Démarrer la démo',
      trust1: 'Propulsé par l\'IA',
      trust2: 'Grade industriel',
      trust3: 'Déployable on-premise',
      dashboardLabel: 'mainteligence — tableau de bord',
      live: 'EN DIRECT',
    },
    problem: {
      tag: 'Le Problème',
      title1: 'Les Pannes Industrielles Sont',
      titleAccent: 'Prévisibles.',
      title2: 'Pourtant Elles Continuent.',
      subtitle:
        'Chaque année, les usines perdent des milliards à cause de pannes qui auraient pu être prévues. La cause n\'est pas la malchance — c\'est l\'absence d\'intelligence en temps réel.',
      callout:
        'Les entreprises industrielles génèrent d\'énormes volumes de données opérationnelles mais manquent d\'outils pour en extraire une intelligence maintenance actionnable en temps réel. Mainteligence a été conçu pour résoudre exactement ce problème.',
      calloutBold: 'Le problème fondamental :',
      cards: [
        {
          stat: '+50 Md$',
          statLabel: 'perdus chaque année',
          title: 'Pannes d\'équipement imprévues',
          description:
            'Un arrêt non planifié stoppe la production sans préavis. Dans l\'industrie lourde, une seule panne peut provoquer plusieurs jours de perte de production.',
        },
        {
          stat: '30–40%',
          statLabel: 'du budget maintenance gaspillé',
          title: 'Coûts de maintenance excessifs',
          description:
            'Une maintenance préventive trop fréquente gaspille main-d\'œuvre et pièces. Une maintenance insuffisante provoque des pannes. Sans données, votre équipe improvise.',
        },
        {
          stat: '0',
          statLabel: 'visibilité en temps réel',
          title: 'Aucune visibilité sur les actifs',
          description:
            'Les opérateurs se fient à des indicateurs retardataires — inspections périodiques, intuition et journaux manuels. Au moment où un défaut est détecté, des dommages importants ont souvent déjà eu lieu.',
        },
        {
          stat: '70%',
          statLabel: 'des usines sans IoT',
          title: 'Aucune infrastructure IoT existante',
          description:
            'La plupart des installations industrielles fonctionnent avec des équipements anciens sans connectivité. Le déploiement d\'IoT traditionnel exige des rénovations coûteuses.',
        },
      ],
    },
    solution: {
      tag: 'La Solution',
      title: 'Présentation de',
      titleAccent: 'Mainteligence',
      subtitle:
        'Une plateforme de maintenance prédictive de bout en bout combinant matériel IoT propriétaire et IA industrielle — déployable en jours, pas en mois.',
      quote: 'Des données brutes des capteurs aux décisions de maintenance.',
      archLabel: 'Architecture de la Plateforme',
      pillars: [
        {
          title: 'Modèles IA Prédictifs',
          description:
            'Des modèles de deep learning entraînés sur des données industrielles réelles prédisent les pannes avant qu\'elles ne surviennent.',
        },
        {
          title: 'Mainteligence Sense',
          description:
            'Un gateway IoT industriel qui s\'adapte aux équipements existants en moins d\'une heure. Aucune modification électrique requise.',
        },
        {
          title: 'Tableau de Bord Unifié',
          description:
            'Une vue opérationnelle complète couvrant les prédictions RUL, la santé des capteurs, les alertes et la planification maintenance.',
        },
        {
          title: 'Déploiement On-Premise',
          description:
            'Vos données ne quittent jamais vos locaux. Mainteligence fonctionne entièrement on-premise ou dans votre cloud privé.',
        },
      ],
      archSteps: [
        { label: 'Machine Existante', sub: 'Tout équipement' },
        { label: 'Capteur Sense', sub: 'Gateway IoT' },
        { label: 'Traitement Edge', sub: 'Calcul local' },
        { label: 'Moteur IA', sub: 'Modèles RUL' },
        { label: 'Tableau de Bord', sub: 'Insights actionnables' },
      ],
    },
    howItWorks: {
      tag: 'Fonctionnement',
      title1: 'De la Machine à la Décision en',
      titleAccent: '5 Étapes',
      subtitle:
        'Un flux de travail entièrement intégré ne nécessitant aucune configuration IoT préalable.',
      lastStepNote: 'Panne évitée — la production continue',
      steps: [
        {
          title: 'Installer Mainteligence Sense',
          description:
            'Montez le dispositif IoT sur n\'importe quelle machine avec des fixations industrielles standard. Aucun arrêt de production, aucune modification électrique.',
          tag: 'Matériel',
        },
        {
          title: 'Collecte de Données en Temps Réel',
          description:
            'Le capteur Sense capture vibrations, température, pression, consommation et signatures acoustiques. Les données sont traitées en local.',
          tag: 'IoT',
        },
        {
          title: 'L\'IA Analyse la Dégradation',
          description:
            'Nos modèles de deep learning — entraînés sur les jeux de données NASA CMAPSS — identifient les schémas de dégradation et estiment la Durée de Vie Résiduelle.',
          tag: 'IA / ML',
        },
        {
          title: 'Le Tableau de Bord Affiche les Insights',
          description:
            'Les ingénieurs de maintenance voient les prévisions RUL, scores de santé, alertes et actions recommandées — dans une interface unique.',
          tag: 'Logiciel',
        },
        {
          title: 'Prévenir les Pannes Avant l\'Arrêt',
          description:
            'Des alertes configurables notifient votre équipe des jours ou semaines avant une panne prédite — éliminant les urgences réactives.',
          tag: 'Action',
        },
      ],
    },
    value: {
      tag: 'Pourquoi Mainteligence',
      title1: 'Valeur Mesurable.',
      titleAccent: 'Dès le Premier Jour.',
      onPremiseTitle: 'Déploiement On-Premise — Vos Données Restent Chez Vous',
      onPremiseDesc:
        'Pour les fabricants, services publics et contractants de défense où la souveraineté des données est impérative, Mainteligence propose un déploiement entièrement isolé. Aucune connexion cloud requise.',
      items: [
        { metric: 'Jusqu\'à 35%', label: 'Réduction des Arrêts Non Planifiés', description: 'La détection précoce des défauts élimine les arrêts d\'urgence coûtant en moyenne 260 000 $/heure.' },
        { metric: 'Plusieurs semaines', label: 'Délai de Prédiction des Pannes', description: 'Soyez averti des jours ou semaines avant une panne — permettant à votre équipe de planifier la maintenance au moment optimal.' },
        { metric: '40–60%', label: 'Amélioration de l\'Efficacité Maintenance', description: 'Passez de la maintenance planifiée à la maintenance conditionnelle. Intervenez quand c\'est nécessaire.' },
        { metric: 'Zéro', label: 'Infrastructure IoT Existante Requise', description: 'Le dispositif Mainteligence Sense fournit toute la connectivité nécessaire. Déployez dès le premier jour.' },
        { metric: '100%', label: 'Déploiement On-Premise Disponible', description: 'Déploiement entièrement isolé pour les installations où la souveraineté des données est non négociable.' },
      ],
    },
    contact: {
      tag: 'Contact',
      title: 'Parlons de Votre Défi Maintenance',
      subtitle:
        'Que vous évaluiez la maintenance prédictive pour la première fois ou cherchiez à remplacer un système existant, notre équipe définira un déploiement adapté à votre installation.',
      labels: {
        firstName: 'Prénom',
        lastName: 'Nom',
        email: 'Email professionnel',
        company: 'Entreprise',
        role: 'Votre poste',
        reason: 'Comment pouvons-nous vous aider ?',
        message: 'Message (facultatif)',
        submit: 'Envoyer le message',
        privacy: 'En soumettant, vous acceptez notre politique de confidentialité. Aucun spam.',
      },
      placeholders: {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@entreprise.com',
        company: 'ACME Industriel',
        role: 'Ingénieur Maintenance',
        message: 'Parlez-nous de votre installation, machines, infrastructure existante et défis de maintenance...',
      },
      reasons: [
        'Demander une démo produit',
        'Questions plateforme & tarifs',
        'Matériel Mainteligence Sense',
        'Déploiement on-premise',
        'Partenariat / intégration',
        'Autre',
      ],
      success: {
        title: 'Message Reçu',
        body: 'Votre demande a été envoyée avec succès. Nous vous contacterons dans les plus brefs délais.',
        tryDemo: 'Essayer la démo',
        viewPlatform: 'Voir la plateforme',
      },
      sidebar: {
        responseTitle: 'Délai de Réponse',
        responseSubtitle: 'Délai typique les jours ouvrables.',
        responseValue: '< 1 jour',
        rows: [
          { label: 'Demandes de démo', time: 'Jour même' },
          { label: 'Demandes commerciales', time: '< 24 heures' },
          { label: 'Questions techniques', time: '< 48 heures' },
        ],
        directTitle: 'Contact Direct',
        expectTitle: 'À Quoi S\'Attendre',
        expectSteps: [
          'Appel de découverte initial (30 min)',
          'Évaluation de l\'installation et infrastructure',
          'Proposition de périmètre de déploiement',
          'Programme pilote sur 2–5 machines',
          'Déploiement complet avec support sur site',
        ],
        notReadyTitle: 'Pas encore prêt à échanger ?',
        notReadyBody: 'Lancez la démo LSTM en direct sur les données NASA — aucun compte requis.',
        notReadyCta: 'Essayer la démo',
      },
    },
    cta: {
      tag: 'Commencer',
      title1: 'Transformez Votre',
      titleAccent: 'Stratégie Maintenance',
      subtitle:
        'Rejoignez les opérateurs industriels qui sont passés de la maintenance réactive à la maintenance prédictive.',
      btn1: 'Demander une démo',
      btn2: 'Contacter l\'équipe',
      footerLinks: {
        platform: 'Plateforme',
        company: 'Entreprise',
        platformLinks: [
          { label: 'Logiciel plateforme', href: '/dashboard' },
          { label: 'Matériel Sense', href: '/product' },
          { label: 'Démo en direct', href: '/demo' },
          { label: 'Tarifs', href: '/pricing' },
        ],
        companyLinks: [
          { label: 'Produit', href: '/product' },
          { label: 'Contact', href: '/contact' },
          { label: 'Sécurité', href: '/contact' },
          { label: 'Demander une démo', href: '/demo' },
        ],
      },
      copyright: 'Mainteligence. L\'IA industrielle pour le monde réel.',
    },
  },

  // ─────────────────────────────────────────────────────────────────
  // ARABIC
  // ─────────────────────────────────────────────────────────────────
  ar: {
    nav: {
      platform: 'المنصة',
      howItWorks: 'آلية العمل',
      product: 'المنتج',
      pricing: 'الأسعار',
  demo: 'عرض تجريبي',
  iotDemo: 'عرض IoT',
  contact: 'اتصل بنا',
  requestDemo: 'طلب عرض تجريبي',
    },
    hero: {
      badge: 'صيانة تنبؤية مدعومة بالذكاء الاصطناعي',
      title1: 'أوقف أعطال المعدات',
      titleAccent: 'الأعطال',
      title2: 'قبل أن تقع',
      subtitle:
        'تستخدم Mainteligence الذكاء الاصطناعي والبيانات الآنية للتنبؤ بالأعطال، وتقدير العمر التشغيلي المتبقي (RUL)، وتحسين الصيانة الصناعية — مع أو بدون بنية تحتية إنترنت الأشياء الحالية.',
      cta1: 'طلب عرض تجريبي',
      cta2: 'ابدأ العرض المباشر',
      trust1: 'مدعوم بالذكاء الاصطناعي',
      trust2: 'درجة صناعية',
      trust3: 'جاهز للنشر المحلي',
      dashboardLabel: 'mainteligence — لوحة التحكم',
      live: 'مباشر',
    },
    problem: {
      tag: 'المشكلة',
      title1: 'الأعطال الصناعية',
      titleAccent: 'قابلة للتنبؤ.',
      title2: 'ومع ذلك تستمر في الحدوث.',
      subtitle:
        'كل عام، تخسر المصانع مليارات الدولارات بسبب أعطال كان يمكن التنبؤ بها. السبب الجذري ليس الحظ السيئ — بل غياب الذكاء الآني.',
      callout:
        'تولّد الشركات الصناعية كميات هائلة من البيانات التشغيلية، لكنها تفتقر إلى الأدوات اللازمة لاستخلاص استخبارات الصيانة القابلة للتنفيذ منها في الوقت الفعلي. صُمّمت Mainteligence لحل هذه المشكلة تحديداً.',
      calloutBold: 'الإشكالية الجوهرية:',
      cards: [
        {
          stat: '+50 مليار $',
          statLabel: 'خسائر سنوية',
          title: 'أعطال مفاجئة في المعدات',
          description:
            'يوقف التوقف غير المخطط الإنتاج دون إنذار. في الصناعات الثقيلة، قد تتحول خسارة واحدة إلى أيام من الإنتاج المفقود وإصلاحات طارئة مكلفة.',
        },
        {
          stat: '30–40%',
          statLabel: 'من ميزانية الصيانة مهدرة',
          title: 'تكاليف صيانة مفرطة',
          description:
            'الجدولة المفرطة للصيانة الوقائية تهدر العمالة والقطع. الجدولة غير الكافية تسبب الأعطال. بدون بيانات، فريقك مضطر إلى التخمين.',
        },
        {
          stat: '0',
          statLabel: 'رؤية آنية',
          title: 'غياب الرؤية الآنية للأصول',
          description:
            'يعتمد المشغّلون على مؤشرات متأخرة — عمليات التفتيش الدورية، والحدس، والسجلات اليدوية. بحلول وقت اكتشاف العطل، تكون الأضرار الجسيمة قد وقعت.',
        },
        {
          stat: '70%',
          statLabel: 'من المصانع تفتقر للإنترنت الصناعي',
          title: 'غياب بنية تحتية لإنترنت الأشياء',
          description:
            'تعمل معظم المنشآت الصناعية على معدات قديمة دون اتصال. يتطلب نشر حلول إنترنت الأشياء التقليدية تجديدات مكلفة تستغرق سنوات.',
        },
      ],
    },
    solution: {
      tag: 'الحل',
      title: 'نقدم لكم',
      titleAccent: 'Mainteligence',
      subtitle:
        'منصة صيانة تنبؤية متكاملة تجمع بين أجهزة إنترنت الأشياء الخاصة والذكاء الاصطناعي الصناعي — قابلة للنشر في أيام، لا أشهر.',
      quote: 'من البيانات الخام للمستشعرات إلى قرارات الصيانة القابلة للتنفيذ.',
      archLabel: 'هندسة المنصة',
      pillars: [
        {
          title: 'نماذج ذكاء اصطناعي تنبؤية',
          description:
            'نماذج تعلم عميق مدرّبة على بيانات صناعية حقيقية تتنبأ بالأعطال قبل حدوثها، مع حدود زمنية قابلة للتهيئة لكل فئة من الأصول.',
        },
        {
          title: 'Mainteligence Sense',
          description:
            'بوابة إنترنت أشياء متينة تُركّب على المعدات القديمة في أقل من ساعة. لا تعديلات كهربائية مطلوبة.',
        },
        {
          title: 'لوحة تحكم موحدة',
          description:
            'عرض تشغيلي شامل يغطي توقعات RUL، وصحة المستشعرات، وإدارة التنبيهات، وجدولة الصيانة.',
        },
        {
          title: 'النشر المحلي',
          description:
            'بياناتك لا تغادر منشأتك أبداً. يعمل Mainteligence بالكامل محلياً أو في سحابتك الخاصة.',
        },
      ],
      archSteps: [
        { label: 'الآلة القديمة', sub: 'أي معدة' },
        { label: 'جهاز Sense', sub: 'بوابة إنترنت الأشياء' },
        { label: 'معالجة الحافة', sub: 'حوسبة محلية' },
        { label: 'محرك الذكاء الاصطناعي', sub: 'نماذج RUL' },
        { label: 'لوحة التحكم', sub: 'رؤى قابلة للتنفيذ' },
      ],
    },
    howItWorks: {
      tag: 'آلية العمل',
      title1: 'من الآلة إلى القرار في',
      titleAccent: '5 خطوات',
      subtitle:
        'سير عمل متكامل لا يتطلب أي إعداد مسبق لإنترنت الأشياء وأدنى تدخل من تقنية المعلومات.',
      lastStepNote: 'تم تفادي العطل — الإنتاج مستمر',
      steps: [
        {
          title: 'تثبيت Mainteligence Sense',
          description:
            'ركّب الجهاز على أي آلة باستخدام تجهيزات صناعية قياسية. لا توقف للإنتاج، لا تعديلات كهربائية.',
          tag: 'الأجهزة',
        },
        {
          title: 'جمع البيانات الآنية',
          description:
            'يلتقط جهاز Sense الاهتزازات ودرجة الحرارة والضغط وسحب التيار والتوقيعات الصوتية. البيانات تُعالج محلياً.',
          tag: 'إنترنت الأشياء',
        },
        {
          title: 'الذكاء الاصطناعي يحلل التدهور',
          description:
            'نماذج التعلم العميق لدينا — المدرّبة على بيانات NASA CMAPSS — تحدد أنماط التدهور وتقدر العمر التشغيلي المتبقي.',
          tag: 'ذكاء اصطناعي',
        },
        {
          title: 'لوحة التحكم تعرض الرؤى',
          description:
            'يرى مهندسو الصيانة توقعات RUL، ودرجات الصحة، وتنبيهات العتبة، والإجراءات الموصى بها — كل ذلك في واجهة واحدة.',
          tag: 'البرمجيات',
        },
        {
          title: 'منع الأعطال قبل التوقف',
          description:
            'تنبيهات مسبقة قابلة للتهيئة تُخطر فريقك قبل أيام أو أسابيع من العطل المتوقع — للقضاء على حالات الطوارئ التفاعلية.',
          tag: 'الإجراء',
        },
      ],
    },
    value: {
      tag: 'لماذا Mainteligence',
      title1: 'قيمة قابلة للقياس.',
      titleAccent: 'منذ اليوم الأول.',
      onPremiseTitle: 'النشر المحلي — بياناتك لا تغادر منشأتك',
      onPremiseDesc:
        'للمصنّعين والمرافق والمتعاقدين الدفاعيين حيث السيادة على البيانات إلزامية، يقدم Mainteligence وضع نشر محلي معزول تماماً. لا يلزم اتصال بالسحابة. لا تغادر بياناتك شبكتك أبداً.',
      items: [
        { metric: 'حتى 35%', label: 'تقليل في التوقف غير المخطط', description: 'الكشف المبكر عن الأعطال يلغي حالات الإيقاف الطارئة التي تكلف المنشآت الصناعية ما يزيد على 260,000 دولار في الساعة.' },
        { metric: 'أسابيع مسبقاً', label: 'مهلة التنبؤ بالأعطال', description: 'اعلم بالعطل المحتمل قبل أيام أو أسابيع — مما يمنح فريقك وقتاً لتخطيط الصيانة في النافذة المثلى.' },
        { metric: '40–60%', label: 'تحسين كفاءة الصيانة', description: 'انتقل من الصيانة الزمنية إلى الصيانة المشروطة. صيانة الأصول عند الحاجة — لا قبلها ولا بعدها.' },
        { metric: 'صفر', label: 'بنية تحتية لإنترنت الأشياء مطلوبة', description: 'يوفر جهاز Mainteligence Sense كل الاتصالات اللازمة. ابدأ النشر فور التركيب.' },
        { metric: '100%', label: 'النشر المحلي متاح', description: 'نشر معزول تماماً للمنشآت التي تعتبر سيادة البيانات أمراً غير قابل للتفاوض.' },
      ],
    },
    contact: {
      tag: 'اتصل بنا',
      title: 'لنتحدث عن تحدي الصيانة لديك',
      subtitle:
        'سواء كنت تقيّم الصيانة التنبؤية لأول مرة أو تبحث عن استبدال نظام قائم، سيحدد فريقنا نشراً يناسب منشأتك.',
      labels: {
        firstName: 'الاسم الأول',
        lastName: 'اسم العائلة',
        email: 'البريد الإلكتروني للعمل',
        company: 'الشركة',
        role: 'منصبك',
        reason: 'كيف يمكننا مساعدتك؟',
        message: 'الرسالة (اختياري)',
        submit: 'إرسال الرسالة',
        privacy: 'بالإرسال، أنت توافق على سياسة الخصوصية. لا رسائل غير مرغوب فيها.',
      },
      placeholders: {
        firstName: 'أحمد',
        lastName: 'الخالد',
        email: 'ahmed@company.com',
        company: 'مصنع الخليج الصناعي',
        role: 'مهندس صيانة',
        message: 'أخبرنا عن منشأتك وآلاتك وبنيتك التحتية الحالية وتحديات الصيانة لديك...',
      },
      reasons: [
        'طلب عرض تجريبي للمنتج',
        'أسئلة المنصة والأسعار',
        'أجهزة Mainteligence Sense',
        'استفسار النشر المحلي',
        'الشراكة / التكامل',
        'أخرى',
      ],
      success: {
        title: 'تم استلام رسالتك',
        body: 'تم إرسال طلبك بنجاح. سنتواصل معك في أقرب وقت ممكن.',
        tryDemo: 'جرب العرض التجريبي',
        viewPlatform: 'عرض المنصة',
      },
      sidebar: {
        responseTitle: 'وقت الاستجابة',
        responseSubtitle: 'الاستجابة المعتادة في أيام العمل.',
        responseValue: 'أقل من يوم',
        rows: [
          { label: 'طلبات العرض التجريبي', time: 'نفس اليوم' },
          { label: 'استفسارات المبيعات', time: 'أقل من 24 ساعة' },
          { label: 'الأسئلة التقنية', time: 'أقل من 48 ساعة' },
        ],
        directTitle: 'التواصل المباشر',
        expectTitle: 'ما الذي تتوقعه',
        expectSteps: [
          'مكالمة اكتشاف أولية (30 دقيقة)',
          'تقييم المنشأة والبنية التحتية',
          'اقتراح نطاق النشر المخصص',
          'برنامج تجريبي على 2–5 آلات',
          'النشر الكامل مع الدعم الميداني',
        ],
        notReadyTitle: 'لست مستعداً بعد للتحدث؟',
        notReadyBody: 'شغّل العرض التجريبي LSTM المباشر على بيانات NASA — لا يتطلب تسجيل حساب.',
        notReadyCta: 'جرب العرض التجريبي',
      },
    },
    cta: {
      tag: 'ابدأ الآن',
      title1: 'حوّل استراتيجية',
      titleAccent: 'الصيانة لديك',
      subtitle:
        'انضم إلى المشغّلين الصناعيين الذين انتقلوا من الصيانة التفاعلية إلى التنبؤية. دعنا نحدد نشراً مناسباً لمنشأتك.',
      btn1: 'طلب عرض تجريبي',
      btn2: 'التواصل مع الفريق',
      footerLinks: {
        platform: 'المنصة',
        company: 'الشركة',
        platformLinks: [
          { label: 'برنامج المنصة', href: '/dashboard' },
          { label: 'أجهزة Sense', href: '/product' },
          { label: 'عرض مباشر', href: '/demo' },
          { label: 'الأسعار', href: '/pricing' },
        ],
        companyLinks: [
          { label: 'المنتج', href: '/product' },
          { label: 'اتصل بنا', href: '/contact' },
          { label: 'الأمان', href: '/contact' },
          { label: 'طلب عرض تجريبي', href: '/demo' },
        ],
      },
      copyright: 'Mainteligence. الذكاء الاصطناعي الصناعي للعالم الحقيقي.',
    },
  },
} as const

// ─────────────────────────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────────────────────────
type Translations = typeof translations['en']

interface I18nContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Translations
  isRTL: boolean
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  // Persist choice in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('maint_lang') as Lang | null
    if (saved && ['en', 'fr', 'ar'].includes(saved)) setLangState(saved)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('maint_lang', l)
  }

  const isRTL = RTL_LANGS.includes(lang)

  // Apply dir to <html>
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang, isRTL])

  return (
    <I18nContext.Provider value={{ lang, setLang, t: translations[lang] as Translations, isRTL }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
