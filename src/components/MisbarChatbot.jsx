import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, User, FileText, AlertCircle, CheckCircle, 
  TrendingUp, Download, Eye, MapPin, Satellite, 
  Calendar, Clock, Zap, Shield, Search, RefreshCw,
  BarChart3, PieChart, Activity, Droplets, Leaf, X,
  MessageSquare, Settings, HelpCircle, Lightbulb
} from 'lucide-react';

const MisbarChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [showDetailedReport, setShowDetailedReport] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // بيانات المزارع المحسنة
  const farmData = {
    'الأحساء': {
      location: 'الأحساء',
      area: '12000 هكتار',
      ndvi: 0.68,
      waterUsage: 85,
      violations: 2,
      complaints: 1,
      lastUpdate: '2024-05-28',
      crops: 'نخيل التمر',
      coordinates: { lat: 25.4295, lng: 49.6200 },
      issues: ['استهلاك مياه مرتفع', 'عدم وجود تراخيص للتوسع الجديد'],
      monthlyData: {
        ndvi: [0.45, 0.52, 0.61, 0.68, 0.72],
        water: [65, 72, 78, 85, 82],
        violations: [0, 1, 1, 2, 2]
      }
    },
    'الخرج': {
      location: 'الخرج',
      area: '8500 هكتار',
      ndvi: 0.54,
      waterUsage: 72,
      violations: 0,
      complaints: 3,
      lastUpdate: '2024-05-28',
      crops: 'أعلاف وقمح',
      coordinates: { lat: 24.1333, lng: 47.3000 },
      issues: ['شكوى من المزارعين المجاورين حول جودة المياه'],
      monthlyData: {
        ndvi: [0.42, 0.48, 0.51, 0.54, 0.58],
        water: [68, 70, 71, 72, 69],
        violations: [0, 0, 0, 0, 0]
      }
    },
    'الجوف': {
      location: 'الجوف',
      area: '15200 هكتار',
      ndvi: 0.72,
      waterUsage: 68,
      violations: 1,
      complaints: 0,
      lastUpdate: '2024-05-28',
      crops: 'زيتون وفواكه',
      coordinates: { lat: 29.7859, lng: 40.2087 },
      issues: ['تأخير في تجديد التراخيص'],
      monthlyData: {
        ndvi: [0.65, 0.68, 0.70, 0.72, 0.74],
        water: [65, 66, 67, 68, 66],
        violations: [0, 0, 1, 1, 1]
      }
    },
    'تبوك': {
      location: 'تبوك',
      area: '9800 هكتار',
      ndvi: 0.45,
      waterUsage: 91,
      violations: 4,
      complaints: 2,
      lastUpdate: '2024-05-28',
      crops: 'قمح وشعير',
      coordinates: { lat: 28.3838, lng: 36.5553 },
      issues: ['تجاوز في استهلاك المياه', 'عدم الالتزام بالمواعيد المحددة للري', 'شكاوى حول التلوث'],
      monthlyData: {
        ndvi: [0.40, 0.42, 0.43, 0.45, 0.44],
        water: [85, 87, 89, 91, 93],
        violations: [2, 3, 3, 4, 4]
      }
    }
  };

  // قاعدة معرفة الذكاء الاصطناعي
  const knowledgeBase = {
    patterns: {
      // أنماط التقارير
      reports: [
        /تقرير|إحصائيات|بيانات|معلومات|تحليل/,
        /report|statistics|data|analysis/i,
        /(مزرعة|مزارع|منطقة|إقليم)/
      ],
      // أنماط الشكاوي
      complaints: [
        /شكوى|شكاوى|بلاغ|مخالفة|مشكلة|تظلم/,
        /complaint|violation|issue|problem/i,
        /(مياه|تلوث|ضوضاء|قانون|ترخيص)/
      ],
      // أنماط الاستعلامات
      inquiries: [
        /كيف|ماذا|متى|أين|لماذا|هل/,
        /how|what|when|where|why|is/i,
        /(عمل|يعمل|استخدام|طريقة)/
      ],
      // أنماط المساعدة
      help: [
        /مساعدة|help|ساعدني|أحتاج/,
        /كيف أستطيع|كيف يمكنني/,
        /لا أعرف|لا أفهم/
      ]
    },
    
    responses: {
      greetings: [
        'مرحباً بك! أنا المساعد الذكي لمنصة مِسْبَار. كيف يمكنني مساعدتك اليوم؟',
        'أهلاً وسهلاً! أنا هنا لمساعدتك في مراقبة المزارع وإنشاء التقارير.',
        'السلام عليكم! أنا جاهز لمساعدتك في أي استفسار حول النظام.'
      ],
      
      reportHelp: [
        'يمكنني إنشاء تقارير شاملة عن أي منطقة زراعية. فقط اذكر اسم المنطقة مثل "الأحساء" أو "الخرج".',
        'للحصول على تقرير مفصل، اكتب "تقرير" متبوعاً باسم المنطقة التي تريد تحليلها.',
        'أستطيع تحليل بيانات NDVI، استهلاك المياه، والمخالفات لأي منطقة زراعية في المملكة.'
      ],
      
      complaintHelp: [
        'لتحليل شكوى، اكتب تفاصيل الشكوى وسأقوم بتصنيفها وتحديد مستوى الأولوية.',
        'يمكنني فحص الشكاوي المتعلقة بالمياه، التلوث، المخالفات القانونية، والمشاكل البيئية.',
        'أستخدم الذكاء الاصطناعي لتحليل الشكاوي وربطها بالمزارع ذات الصلة.'
      ],
      
      generalHelp: [
        'أستطيع مساعدتك في: إنشاء التقارير، تحليل الشكاوي، مراقبة المخالفات، وتحليل البيانات الزراعية.',
        'يمكنني الإجابة على أسئلتك حول النظام، البيانات، والإجراءات المتبعة.',
        'للحصول على أفضل النتائج، كن محدداً في أسئلتك واذكر المنطقة أو نوع المعلومات المطلوبة.'
      ]
    }
  };

  // رسائل ترحيبية
  const welcomeMessages = [
    {
      id: 1,
      type: 'bot',
      content: 'مرحباً بك في مِسْبَار - المساعد الذكي للمراقبة الزراعية! 🌱🛰️',
      timestamp: new Date(),
      features: ['تحليل ذكي للبيانات', 'تقارير شاملة', 'فحص الشكاوي', 'مراقبة المخالفات']
    },
    {
      id: 2,
      type: 'bot',
      content: 'أنا مدرب على فهم استفساراتك وتحليل البيانات الزراعية. جرب الأمثلة التالية:',
      timestamp: new Date(),
      options: [
        'إنشاء تقرير شامل لمزارع الأحساء',
        'تحليل شكوى حول استهلاك المياه في الخرج',
        'ما هو مؤشر NDVI وكيف يُحسب؟',
        'عرض إحصائيات المخالفات في تبوك',
        'كيف يعمل نظام مراقبة المزارع؟'
      ]
    }
  ];

  useEffect(() => {
    setMessages(welcomeMessages);
  }, []);

  // الذكاء الاصطناعي المطور لفهم النص
  const analyzeUserInput = (input) => {
    const analysis = {
      intent: 'unknown',
      entities: [],
      confidence: 0,
      location: null,
      type: null,
      specificQuery: null
    };

    const lowerInput = input.toLowerCase();
    
    // تحديد الاستفسارات المحددة أولاً (أولوية عالية)
    if (lowerInput.includes('ndvi') || lowerInput.includes('مؤشر نباتي') || lowerInput.includes('غطاء نباتي')) {
      analysis.intent = 'ndvi_inquiry';
      analysis.specificQuery = 'ndvi';
      analysis.confidence = 0.95;
    } else if (lowerInput.includes('مياه') && (lowerInput.includes('إحصائيات') || lowerInput.includes('استهلاك') || lowerInput.includes('بيانات'))) {
      analysis.intent = 'water_stats';
      analysis.specificQuery = 'water';
      analysis.confidence = 0.9;
    } else if (lowerInput.includes('مخالفات') && (lowerInput.includes('إحصائيات') || lowerInput.includes('عدد') || lowerInput.includes('نوع'))) {
      analysis.intent = 'violations_stats';
      analysis.specificQuery = 'violations';
      analysis.confidence = 0.9;
    } else if (lowerInput.includes('كيف') && lowerInput.includes('عمل')) {
      analysis.intent = 'how_it_works';
      analysis.specificQuery = 'system';
      analysis.confidence = 0.85;
    } else if (lowerInput.includes('شكوى') || lowerInput.includes('شكاوى') || lowerInput.includes('بلاغ')) {
      analysis.intent = 'complaint';
      analysis.confidence = 0.8;
    } else if ((lowerInput.includes('تقرير') || lowerInput.includes('تحليل')) && Object.keys(farmData).some(loc => lowerInput.includes(loc.toLowerCase()))) {
      analysis.intent = 'report';
      analysis.confidence = 0.85;
    } else if (lowerInput.includes('مساعدة') || lowerInput.includes('help')) {
      analysis.intent = 'help';
      analysis.confidence = 0.7;
    } else if (lowerInput.includes('مرحبا') || lowerInput.includes('السلام') || lowerInput.includes('أهلا')) {
      analysis.intent = 'greeting';
      analysis.confidence = 0.8;
    } else if (lowerInput.includes('إحصائيات') || lowerInput.includes('بيانات') || lowerInput.includes('معلومات')) {
      analysis.intent = 'general_stats';
      analysis.confidence = 0.7;
    }

    // استخراج الموقع
    Object.keys(farmData).forEach(location => {
      if (lowerInput.includes(location.toLowerCase())) {
        analysis.location = location;
        analysis.confidence += 0.1;
      }
    });

    // استخراج الكيانات
    const entities = ['ndvi', 'مياه', 'مخالفات', 'شكاوى', 'تقرير', 'تحليل', 'إحصائيات'];
    entities.forEach(entity => {
      if (lowerInput.includes(entity)) {
        analysis.entities.push(entity);
      }
    });

    return analysis;
  };

    const generateSmartResponse = async (input, analysis) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    let response = '';

    switch (analysis.intent) {
      case 'ndvi_inquiry':
        response = `📊 مؤشر NDVI - دليل شامل:

🔬 التعريف:
مؤشر NDVI (Normalized Difference Vegetation Index) هو مقياس علمي يحسب صحة وكثافة الغطاء النباتي باستخدام بيانات الأقمار الصناعية.

🧮 المعادلة:
NDVI = (NIR - Red) / (NIR + Red)
• NIR = الأشعة تحت الحمراء القريبة
• Red = الضوء الأحمر المرئي

📈 تفسير القيم:
• 0.8 - 1.0: نباتات كثيفة وصحية جداً 🌿
• 0.6 - 0.8: نباتات صحية ومتوسطة الكثافة 🌱
• 0.4 - 0.6: نباتات خفيفة أو متضررة ⚠️
• 0.2 - 0.4: نباتات قليلة أو تربة مكشوفة 🏜️
• أقل من 0.2: لا توجد نباتات (مياه، مباني، صحراء)

📊 إحصائيات المناطق السعودية:
• الجوف: 0.720 (الأعلى - زيتون صحي)
• الأحساء: 0.680 (ممتاز - نخيل كثيف)
• الخرج: 0.540 (جيد - أعلاف وقمح)
• تبوك: 0.450 (يحتاج تحسين - قمح وشعير)

🛰️ مصادر البيانات:
• Landsat 8/9 (دقة 30م، كل 16 يوم)
• Sentinel-2 (دقة 10م، كل 5 أيام)
• MODIS (دقة 250م، يومياً)`;
        break;

      case 'water_stats':
        const totalWaterUsage = Object.values(farmData).reduce((sum, farm) => sum + farm.waterUsage, 0);
        const avgWaterUsage = totalWaterUsage / Object.keys(farmData).length;
        const highConsumption = Object.values(farmData).filter(farm => farm.waterUsage > 80);
        
        response = `💧 إحصائيات استهلاك المياه - تحليل شامل:

📊 الإحصائيات العامة:
• متوسط الاستهلاك: ${avgWaterUsage.toFixed(1)}%
• إجمالي المناطق: ${Object.keys(farmData).length}
• مناطق استهلاك عالي: ${highConsumption.length} (أكثر من 80%)

🏆 ترتيب المناطق حسب الاستهلاك:
${Object.entries(farmData)
  .sort(([,a], [,b]) => b.waterUsage - a.waterUsage)
  .map(([name, data], index) => {
    const status = data.waterUsage > 80 ? '🔴 مرتفع' : data.waterUsage > 60 ? '🟡 متوسط' : '🟢 مقبول';
    return `${index + 1}. ${name}: ${data.waterUsage}% ${status}`;
  }).join('\n')}

📈 تحليل الاتجاهات:
• الزيادة الشهرية: +2.3% في المتوسط
• الذروة: أبريل-مايو (موسم النمو)
• أقل استهلاك: يناير-فبراير

⚠️ التنبيهات:
${highConsumption.map(farm => `• ${farm.location}: يتطلب مراجعة فورية`).join('\n')}

💡 التوصيات:
• تركيب أنظمة ري ذكية
• مراقبة رطوبة التربة بالاستشعار`;
        break;

      case 'violations_stats':
        const totalViolations = Object.values(farmData).reduce((sum, farm) => sum + farm.violations, 0);
        const violationsbyRegion = Object.entries(farmData).filter(([,data]) => data.violations > 0);
        
        response = `⚠️ إحصائيات المخالفات - تقرير تفصيلي:

📊 الإحصائيات العامة:
• إجمالي المخالفات: ${totalViolations}
• المناطق المخالفة: ${violationsbyRegion.length}/${Object.keys(farmData).length}
• متوسط المخالفات: ${(totalViolations / Object.keys(farmData).length).toFixed(1)} لكل منطقة

🔴 المناطق الأكثر مخالفة:
${violationsbyRegion
  .sort(([,a], [,b]) => b.violations - a.violations)
  .map(([name, data], index) => {
    const severity = data.violations > 3 ? '🚨 خطير' : data.violations > 1 ? '⚠️ متوسط' : '🟡 بسيط';
    return `${index + 1}. ${name}: ${data.violations} مخالفات ${severity}`;
  }).join('\n')}

📋 أنواع المخالفات:
• مخالفات المياه: ${Math.round(totalViolations * 0.6)} (60%)
• مخالفات التراخيص: ${Math.round(totalViolations * 0.3)} (30%)
• مخالفات بيئية: ${Math.round(totalViolations * 0.1)} (10%)

📈 الاتجاه الشهري:
• يناير: 2 مخالفات
• فبراير: 3 مخالفات  
• مارس: 4 مخالفات
• أبريل: 6 مخالفات (ذروة)
• مايو: 5 مخالفات

🎯 خطة العمل:
• متابعة فورية للمناطق عالية المخالفات
• برامج تدريبية للمزارعين
• تشديد المراقبة في موسم الذروة`;
        break;

      case 'how_it_works':
        response = `🛰️ كيف يعمل نظام مِسْبَار - الدليل التقني:

🔄 دورة العمل الكاملة:

1️⃣ جمع البيانات (24/7):
• أقمار Landsat: صور كل 16 يوم بدقة 30م
• أقمار Sentinel-2: صور كل 5 أيام بدقة 10م
• محطات الطقس: بيانات مناخية مباشرة
• أجهزة الاستشعار: قياس رطوبة التربة

2️⃣ المعالجة والتحليل:
• خوارزميات الذكاء الاصطناعي تحلل الصور
• حساب مؤشر NDVI لصحة النباتات
• تتبع استهلاك المياه والتغيرات
• مقارنة البيانات بالمعايير المسموحة

3️⃣ الكشف والتنبيه:
• رصد المخالفات تلقائياً
• إرسال تنبيهات فورية للجهات المختصة
• تصنيف الشكاوي باستخدام معالجة اللغة الطبيعية
• تقدير مستوى الخطورة والأولوية

4️⃣ الإجراءات والمتابعة:
• ربط مباشر مع الأنظمة الحكومية
• إرسال التقارير للجهات المسؤولة
• متابعة تنفيذ الإجراءات التصحيحية
• تحديث قاعدة البيانات

🎯 المخرجات:
✅ تقارير آلية شاملة
✅ كشف مبكر للمشاكل
✅ توفير 70% من وقت المراقبة
✅ دقة 95% في التحليل`;
        break;

      case 'general_stats':
        const totalArea = Object.values(farmData).reduce((sum, farm) => 
          sum + parseInt(farm.area.replace(/[^\d]/g, '')), 0);
        const avgNDVI = Object.values(farmData).reduce((sum, farm) => sum + farm.ndvi, 0) / Object.keys(farmData).length;
        
        response = `📊 الإحصائيات العامة للقطاع الزراعي:

🌾 نظرة عامة:
• إجمالي المساحة المراقبة: ${totalArea.toLocaleString()} هكتار
• عدد المناطق: ${Object.keys(farmData).length} منطقة رئيسية
• متوسط مؤشر NDVI: ${avgNDVI.toFixed(3)}
• متوسط استهلاك المياه: ${avgWaterUsage.toFixed(1)}%

🏆 الأداء حسب المؤشرات:

أفضل المناطق (NDVI):
${Object.entries(farmData)
  .sort(([,a], [,b]) => b.ndvi - a.ndvi)
  .slice(0, 2)
  .map(([name, data]) => `• ${name}: ${data.ndvi.toFixed(3)} (${data.crops})`)
  .join('\n')}

كفاءة المياه:
${Object.entries(farmData)
  .sort(([,a], [,b]) => a.waterUsage - b.waterUsage)
  .slice(0, 2)
  .map(([name, data]) => `• ${name}: ${data.waterUsage}% (ممتاز)`)
  .join('\n')}

📈 اتجاهات السوق:
• نمو المساحة المزروعة: +5.2% سنوياً
• تحسن كفاءة المياه: +12% خلال العام
• انخفاض المخالفات: -15% مقارنة بالعام الماضي

🎯 الأهداف 2025:
• زيادة الكفاءة 20%
• تقليل المخالفات 50%
• تحسين متوسط NDVI إلى 0.65`;
        break;

      case 'complaint':
        await analyzeComplaint(input);
        return;

      case 'report':
        if (analysis.location) {
          await generateReport(analysis.location);
          return;
        } else {
          response = 'أحتاج لمعرفة المنطقة لإنشاء التقرير. المناطق المتاحة: الأحساء، الخرج، الجوف، تبوك. أي منطقة تريد تحليلها؟';
        }
        break;

      case 'greeting':
        response = `مرحباً بك في مِسْبَار! 👋

أنا المساعد الذكي المتخصص في مراقبة القطاع الزراعي. يمكنني مساعدتك في:

🔍 الاستعلامات:
• شرح المؤشرات التقنية (NDVI، استهلاك المياه)
• إحصائيات شاملة للمناطق الزراعية
• معلومات عن كيفية عمل النظام

📊 التقارير:
• تقارير مفصلة لأي منطقة زراعية
• تحليل الأداء والمقارنات
• توقعات واتجاهات

⚖️ إدارة الشكاوي:
• تحليل وتصنيف الشكاوي
• تحديد الأولويات والإجراءات
• متابعة الحلول

جرب سؤالي أي شيء! 🚀`;
        break;

      case 'help':
        response = `🆘 مركز المساعدة - دليلك للاستفادة الكاملة:

💡 أمثلة للأسئلة الذكية:

📊 للإحصائيات:
• "إحصائيات NDVI للمناطق"
• "بيانات استهلاك المياه"
• "عدد المخالفات في كل منطقة"

📋 للتقارير:
• "تقرير شامل لمزارع الأحساء"
• "تحليل أداء منطقة الخرج"

🔍 للاستفسارات:
• "ما هو مؤشر NDVI؟"
• "كيف يعمل نظام المراقبة؟"
• "أنواع المخالفات المرصودة"

⚖️ للشكاوي:
• "شكوى حول استهلاك مياه مرتفع في مزرعة X"
• "بلاغ عن تلوث بيئي"

🎯 نصائح للحصول على أفضل النتائج:
✅ كن محدد في السؤال
✅ اذكر اسم المنطقة إذا كان مطلوباً
✅ استخدم الكلمات المفتاحية المناسبة`;
        break;

      default:
        // تحليل أذكى للاستفسارات غير المصنفة
        if (input.includes('؟')) {
          response = `🤔 سؤال ممتاز! دعني أحلل استفسارك:

"${input}"

يبدو أنك تسأل عن موضوع مثير للاهتمام. يمكنني مساعدتك بشكل أفضل إذا كان سؤالك يتعلق بـ:

🔹 المؤشرات التقنية (NDVI، المياه، الإنتاجية)
🔹 التقارير والإحصائيات (أداء المناطق، المقارنات)  
🔹 النظام والتقنيات (كيف يعمل، المصادر، الأقمار)
🔹 الشكاوي والمخالفات (التحليل، التصنيف، المتابعة)

هل يمكنك إعادة صياغة السؤال ليكون أكثر تحديداً؟ 🎯`;
        } else {
          response = `أعتذر، لم أتمكن من فهم طلبك بالضبط: "${input}"

💡 اقتراحات لمساعدتك بشكل أفضل:

إذا كنت تريد معلومات عامة:
• "إحصائيات عامة للقطاع الزراعي"
• "معلومات عن نظام مسبار"

إذا كنت تريد تقرير:
• "تقرير مفصل عن [اسم المنطقة]"

إذا كان لديك استفسار تقني:
• "شرح مؤشر NDVI"
• "كيف يتم قياس استهلاك المياه"

جرب إعادة كتابة طلبك بوضوح أكثر وسأكون سعيد لمساعدتك! 😊`;
        }
    }

    const botMessage = {
      id: Date.now(),
      type: 'bot',
      content: response,
      timestamp: new Date(),
      confidence: analysis.confidence
    };

    setIsTyping(false);
    setMessages(prev => [...prev, botMessage]);
  };

  const generateReport = async (location) => {
    setIsGeneratingReport(true);
    setIsTyping(true);

    // محاكاة تأخير التحليل
    await new Promise(resolve => setTimeout(resolve, 3000));

    const data = farmData[location] || farmData['الأحساء'];
    
    const report = {
      id: Date.now(),
      type: 'report',
      location: data.location,
      generatedAt: new Date(),
      summary: {
        area: data.area,
        ndvi: data.ndvi,
        waterUsage: data.waterUsage,
        violations: data.violations,
        complaints: data.complaints,
        status: data.violations > 2 ? 'يحتاج متابعة' : data.violations > 0 ? 'مقبول' : 'ممتاز'
      },
      details: {
        crops: data.crops,
        coordinates: data.coordinates,
        issues: data.issues,
        recommendations: generateRecommendations(data)
      },
      charts: {
        ndviTrend: data.monthlyData.ndvi.map((val, idx) => ({
          month: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو'][idx],
          value: val
        })),
        waterUsage: data.monthlyData.water.map((val, idx) => ({
          month: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو'][idx],
          usage: val
        })),
        violationsHistory: [
          { type: 'مياه', count: Math.floor(data.violations * 0.6) },
          { type: 'تراخيص', count: Math.floor(data.violations * 0.3) },
          { type: 'بيئية', count: Math.floor(data.violations * 0.1) }
        ]
      }
    };

    setCurrentAnalysis(report);
    setIsGeneratingReport(false);
    setIsTyping(false);

    const botMessage = {
      id: Date.now(),
      type: 'bot',
      content: `✅ تم إنشاء التقرير الشامل لمنطقة ${location} بنجاح!
      
📊 ملخص سريع:
• المساحة: ${data.area}
• مؤشر NDVI: ${data.ndvi} (${data.ndvi > 0.6 ? 'ممتاز' : data.ndvi > 0.4 ? 'جيد' : 'يحتاج تحسين'})
• استهلاك المياه: ${data.waterUsage}% (${data.waterUsage > 80 ? 'مرتفع' : 'مقبول'})
• المخالفات: ${data.violations} (${data.violations === 0 ? 'ممتاز' : data.violations < 3 ? 'مقبول' : 'يحتاج متابعة'})

💡 التوصيات الرئيسية:
${generateRecommendations(data).slice(0, 2).map(rec => `• ${rec}`).join('\n')}`,
      timestamp: new Date(),
      report: report
    };

    setMessages(prev => [...prev, botMessage]);
  };

  const generateRecommendations = (data) => {
    const recommendations = [];
    
    if (data.waterUsage > 80) {
      recommendations.push('تحسين كفاءة أنظمة الري لتقليل استهلاك المياه');
      recommendations.push('تركيب أجهزة استشعار ذكية لمراقبة رطوبة التربة');
    }
    
    if (data.ndvi < 0.5) {
      recommendations.push('فحص صحة النباتات وتحسين برامج التسميد');
      recommendations.push('مراجعة أنظمة الري والصرف لضمان الكفاءة');
    }
    
    if (data.violations > 0) {
      recommendations.push('متابعة فورية للمخالفات المسجلة وتصحيح الأوضاع');
      recommendations.push('تدريب الفرق الفنية على الالتزام بالقوانين البيئية');
    }
    
    if (data.complaints > 0) {
      recommendations.push('معالجة الشكاوي المقدمة والتواصل مع المجتمع المحلي');
      recommendations.push('تحسين نظام إدارة الشكاوي والاستجابة السريعة');
    }

    if (recommendations.length === 0) {
      recommendations.push('الأداء ضمن المعايير المطلوبة - الاستمرار في المراقبة');
      recommendations.push('تطبيق أفضل الممارسات الزراعية المستدامة');
    }

    return recommendations;
  };

  const analyzeComplaint = async (complaintText) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 2500));

    const analysis = {
      id: Date.now(),
      text: complaintText,
      severity: determineSeverity(complaintText),
      category: getComplaintCategory(complaintText),
      location: extractLocation(complaintText),
      actionRequired: Math.random() > 0.2,
      estimatedTime: getEstimatedTime(complaintText),
      relatedFarms: getRelatedFarms(complaintText),
      priority: getPriority(complaintText),
      suggestedActions: getSuggestedActions(complaintText)
    };

    setIsTyping(false);

    const response = {
      id: Date.now(),
      type: 'bot',
      content: `🔍 تم تحليل الشكوى بنجاح باستخدام الذكاء الاصطناعي:

📋 تفاصيل التحليل:
• التصنيف: ${analysis.category}
• مستوى الخطورة: ${analysis.severity}
• الأولوية: ${analysis.priority}
• الموقع: ${analysis.location}
• الوقت المقدر للحل: ${analysis.estimatedTime}
• يتطلب إجراء فوري: ${analysis.actionRequired ? 'نعم ✅' : 'لا ❌'}

🎯 الإجراءات المقترحة:
${analysis.suggestedActions.map(action => `• ${action}`).join('\n')}`,
      timestamp: new Date(),
      analysis: analysis
    };

    setMessages(prev => [...prev, response]);
  };

  const determineSeverity = (text) => {
    const highSeverityKeywords = ['تلوث شديد', 'خطر', 'عاجل', 'طوارئ', 'كارثة'];
    const mediumSeverityKeywords = ['مشكلة', 'تجاوز', 'مخالفة', 'شكوى'];
    
    if (highSeverityKeywords.some(keyword => text.includes(keyword))) return 'عالية';
    if (mediumSeverityKeywords.some(keyword => text.includes(keyword))) return 'متوسطة';
    return 'منخفضة';
  };

  const getComplaintCategory = (text) => {
    if (text.includes('مياه') || text.includes('ري') || text.includes('استهلاك')) return 'إدارة المياه';
    if (text.includes('تلوث') || text.includes('بيئة') || text.includes('هواء')) return 'التلوث البيئي';
    if (text.includes('ترخيص') || text.includes('قانون') || text.includes('مخالفة')) return 'المخالفات القانونية';
    if (text.includes('ضوضاء') || text.includes('صوت') || text.includes('إزعاج')) return 'التلوث السمعي';
    if (text.includes('نباتات') || text.includes('محاصيل') || text.includes('زراعة')) return 'الإنتاج الزراعي';
    return 'شكوى عامة';
  };

  const extractLocation = (text) => {
    const locations = Object.keys(farmData);
    for (let location of locations) {
      if (text.includes(location)) return location;
    }
    
    // البحث عن مناطق أخرى
    const otherLocations = ['الرياض', 'جدة', 'الدمام', 'المدينة', 'مكة', 'القصيم', 'حائل', 'الباحة', 'جازان', 'نجران', 'عسير'];
    for (let location of otherLocations) {
      if (text.includes(location)) return location;
    }
    
    return 'غير محدد';
  };

  const getEstimatedTime = (text) => {
    const severity = determineSeverity(text);
    if (severity === 'عالية') return '24-48 ساعة';
    if (severity === 'متوسطة') return '2-5 أيام عمل';
    return '5-10 أيام عمل';
  };

  const getPriority = (text) => {
    const severity = determineSeverity(text);
    if (severity === 'عالية') return 'عاجل';
    if (severity === 'متوسطة') return 'مهم';
    return 'عادي';
  };

  const getSuggestedActions = (text) => {
    const actions = [];
    const category = getComplaintCategory(text);
    
    switch (category) {
      case 'إدارة المياه':
        actions.push('فحص أنظمة الري وقياس استهلاك المياه');
        actions.push('تركيب أجهزة مراقبة ذكية للمياه');
        actions.push('تطبيق غرامات في حالة التجاوز');
        break;
      case 'التلوث البيئي':
        actions.push('إجراء فحص بيئي شامل للمنطقة');
        actions.push('تطبيق معايير البيئة والسلامة');
        actions.push('متابعة مع الجهات البيئية المختصة');
        break;
      case 'المخالفات القانونية':
        actions.push('مراجعة التراخيص والوثائق القانونية');
        actions.push('إرسال إنذار رسمي للمخالف');
        actions.push('تطبيق العقوبات المناسبة');
        break;
      default:
        actions.push('التحقق من صحة الشكوى');
        actions.push('زيارة ميدانية للموقع');
        actions.push('التواصل مع الأطراف المعنية');
    }
    
    return actions;
  };

  const getRelatedFarms = (text) => {
    const location = extractLocation(text);
    if (location !== 'غير محدد' && farmData[location]) {
      return [farmData[location]];
    }
    return [];
  };

  // تحميل PDF
  const downloadPDF = (report) => {
    const pdfContent = `
تقرير مِسْبَار - ${report.location}
تاريخ الإنشاء: ${report.generatedAt.toLocaleDateString('ar-SA')}

الملخص التنفيذي:
================
المساحة: ${report.summary.area}
مؤشر NDVI: ${report.summary.ndvi}
استهلاك المياه: ${report.summary.waterUsage}%
المخالفات: ${report.summary.violations}
الشكاوي: ${report.summary.complaints}
الحالة العامة: ${report.summary.status}

التفاصيل:
=========
المحاصيل: ${report.details.crops}
الإحداثيات: ${report.details.coordinates.lat}, ${report.details.coordinates.lng}

المشاكل المحددة:
${report.details.issues.map(issue => `• ${issue}`).join('\n')}

التوصيات:
${report.details.recommendations.map(rec => `• ${rec}`).join('\n')}

البيانات الشهرية:
${report.charts.ndviTrend.map(item => `${item.month}: ${item.value}`).join('\n')}
    `;

    const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير_مسبار_${report.location}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // رسالة تأكيد
    const confirmMessage = {
      id: Date.now(),
      type: 'bot',
      content: `✅ تم تحميل التقرير بنجاح! 📄\n\nاسم الملف: تقرير_مسبار_${report.location}_${new Date().toISOString().slice(0, 10)}.txt`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, confirmMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');

    // تحليل المدخل بالذكاء الاصطناعي
    const analysis = analyzeUserInput(currentInput);
    await generateSmartResponse(currentInput, analysis);
  };

  const QuickActions = () => (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
      marginBottom: '1rem'
    }}>
      {[
        { text: 'تقرير شامل للأحساء', icon: <FileText size={16} /> },
        { text: 'تحليل شكوى مياه', icon: <Droplets size={16} /> },
        { text: 'إحصائيات NDVI', icon: <TrendingUp size={16} /> },
        { text: 'مراقبة المخالفات', icon: <AlertCircle size={16} /> }
      ].map((action, index) => (
        <button
          key={index}
          onClick={() => setInputMessage(action.text)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#60a5fa',
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(59, 130, 246, 0.2)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(59, 130, 246, 0.1)'}
        >
          {action.icon}
          {action.text}
        </button>
      ))}
    </div>
  );

  const ReportCard = ({ report }) => (
    <div style={{
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 78, 59, 0.1))',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      borderRadius: '1rem',
      padding: '1.5rem',
      marginTop: '1rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1rem',
        gap: '0.75rem'
      }}>
        <FileText size={24} color="#10b981" />
        <h3 style={{
          color: '#10b981',
          fontSize: '1.25rem',
          fontWeight: 'bold',
          margin: 0
        }}>
          تقرير {report.location}
        </h3>
        <span style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '50px',
          fontSize: '0.75rem',
          background: report.summary.status === 'ممتاز' ? 'rgba(16, 185, 129, 0.2)' : 
                     report.summary.status === 'مقبول' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          color: report.summary.status === 'ممتاز' ? '#10b981' : 
                 report.summary.status === 'مقبول' ? '#f59e0b' : '#ef4444'
        }}>
          {report.summary.status}
        </span>
      </div>

      {/* الملخص السريع */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#6ee7b7', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {report.summary.area}
          </div>
          <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>المساحة</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#60a5fa', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {report.summary.ndvi.toFixed(3)}
          </div>
          <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>مؤشر NDVI</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#f59e0b', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {report.summary.waterUsage}%
          </div>
          <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>استهلاك المياه</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            color: report.summary.violations > 0 ? '#ef4444' : '#10b981', 
            fontSize: '1.5rem', 
            fontWeight: 'bold' 
          }}>
            {report.summary.violations}
          </div>
          <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>المخالفات</div>
        </div>
      </div>

      {/* أزرار العمل - محسنة */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={() => downloadPDF(report)}
          style={{
            padding: '0.75rem 1.25rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981',
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(16, 185, 129, 0.2)';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(16, 185, 129, 0.1)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <Download size={16} />
          تحميل PDF
        </button>
        <button 
          onClick={() => setShowDetailedReport(report)}
          style={{
            padding: '0.75rem 1.25rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#60a5fa',
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(59, 130, 246, 0.2)';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(59, 130, 246, 0.1)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <Eye size={16} />
          عرض تفصيلي
        </button>
        <button 
          onClick={() => setInputMessage(`تحليل إضافي لمنطقة ${report.location}`)}
          style={{
            padding: '0.75rem 1.25rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            background: 'rgba(168, 85, 247, 0.1)',
            color: '#a855f7',
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(168, 85, 247, 0.2)';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(168, 85, 247, 0.1)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <BarChart3 size={16} />
          تحليل إضافي
        </button>
      </div>
    </div>
  );

  const AnalysisCard = ({ analysis }) => (
    <div style={{
      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(91, 33, 182, 0.1))',
      border: '1px solid rgba(168, 85, 247, 0.3)',
      borderRadius: '1rem',
      padding: '1.5rem',
      marginTop: '1rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1rem',
        gap: '0.75rem'
      }}>
        <Shield size={24} color="#a855f7" />
        <h3 style={{
          color: '#a855f7',
          fontSize: '1.25rem',
          fontWeight: 'bold',
          margin: 0
        }}>
          تحليل الشكوى #{analysis.id.toString().slice(-4)}
        </h3>
        <span style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '50px',
          fontSize: '0.75rem',
          background: analysis.severity === 'عالية' ? 'rgba(239, 68, 68, 0.2)' : 
                     analysis.severity === 'متوسطة' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
          color: analysis.severity === 'عالية' ? '#ef4444' : 
                 analysis.severity === 'متوسطة' ? '#f59e0b' : '#10b981'
        }}>
          {analysis.priority}
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        color: '#d1d5db',
        fontSize: '0.875rem',
        marginBottom: '1rem'
      }}>
        <div>
          <strong style={{ color: '#c084fc' }}>التصنيف:</strong> {analysis.category}
        </div>
        <div>
          <strong style={{ color: '#c084fc' }}>الموقع:</strong> {analysis.location}
        </div>
        <div>
          <strong style={{ color: '#c084fc' }}>الوقت المقدر:</strong> {analysis.estimatedTime}
        </div>
        <div>
          <strong style={{ color: '#c084fc' }}>يتطلب إجراء:</strong> {analysis.actionRequired ? 'نعم ✅' : 'لا ❌'}
        </div>
      </div>

      {analysis.relatedFarms.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ color: '#a855f7', fontSize: '1rem', marginBottom: '0.5rem' }}>
            المزارع ذات الصلة:
          </h4>
          {analysis.relatedFarms.map((farm, index) => (
            <div key={index} style={{
              padding: '0.75rem',
              borderRadius: '0.5rem',
              background: 'rgba(168, 85, 247, 0.1)',
              border: '1px solid rgba(168, 85, 247, 0.2)',
              color: '#d1d5db',
              fontSize: '0.875rem'
            }}>
              <strong>{farm.location}</strong> - {farm.area} - المحاصيل: {farm.crops}
            </div>
          ))}
        </div>
      )}

      {/* أزرار إجراء للشكوى */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap'
      }}>
        <button style={{
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          background: 'rgba(16, 185, 129, 0.1)',
          color: '#10b981',
          fontSize: '0.875rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle size={16} />
          قبول الشكوى
        </button>
        <button style={{
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          background: 'rgba(245, 158, 11, 0.1)',
          color: '#f59e0b',
          fontSize: '0.875rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Clock size={16} />
          تأجيل
        </button>
        <button style={{
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          background: 'rgba(59, 130, 246, 0.1)',
          color: '#60a5fa',
          fontSize: '0.875rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Search size={16} />
          تحقق إضافي
        </button>
      </div>
    </div>
  );

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #374151 100%)',
      minHeight: '100vh',
      direction: 'rtl',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '1rem 2rem'
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem'
          }}>
            <img src="/logo.png" alt="شعار" width={120} />
            <div style={{ color: 'white' }}>
              <h1 style={{
                fontSize: '1.875rem',
                fontWeight: 'bold',
                margin: '0 0 0.25rem 0'
              }}>المساعد الذكي المطور</h1>
              <p style={{
                color: '#bfdbfe',
                fontSize: '1rem',
                margin: 0
              }}>تقارير آلية وفحص ذكي للشكاوي مع الذكاء الاصطناعي</p>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              backdropFilter: 'blur(4px)',
              padding: '0.5rem 1rem',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Bot size={20} color="#10b981" />
              <span style={{ color: '#10b981', fontWeight: '600' }}>AI نشط</span>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10b981',
                animation: 'pulse 2s infinite'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: '2rem',
        height: 'calc(100vh - 140px)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Messages Area */}
        <div style={{
          flex: 1,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(16px)',
          borderRadius: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '1.5rem',
          overflowY: 'auto',
          marginBottom: '1rem'
        }}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                justifyContent: message.type === 'user' ? 'flex-start' : 'flex-end',
                marginBottom: '1.5rem',
                animation: 'fadeIn 0.3s ease-out'
              }}
            >
              <div style={{
                maxWidth: '75%',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                flexDirection: message.type === 'user' ? 'row' : 'row-reverse'
              }}>
                {/* Avatar */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: message.type === 'user' 
                    ? 'linear-gradient(135deg, #3b82f6, #1e40af)'
                    : 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}>
                  {message.type === 'user' ? 
                    <User size={20} color="white" /> : 
                    <Bot size={20} color="white" />
                  }
                </div>

                {/* Message Content */}
                <div>
                  <div style={{
                    background: message.type === 'user' 
                      ? 'rgba(59, 130, 246, 0.2)'
                      : 'rgba(16, 185, 129, 0.2)',
                    border: `1px solid ${message.type === 'user' 
                      ? 'rgba(59, 130, 246, 0.3)'
                      : 'rgba(16, 185, 129, 0.3)'}`,
                    borderRadius: '1rem',
                    padding: '1rem 1.25rem',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ 
                      margin: 0, 
                      lineHeight: '1.6',
                      whiteSpace: 'pre-line'
                    }}>
                      {message.content}
                    </div>

                    {/* Features List */}
                    {message.features && (
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        flexWrap: 'wrap',
                        marginTop: '0.75rem'
                      }}>
                        {message.features.map((feature, index) => (
                          <span
                            key={index}
                            style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '50px',
                              fontSize: '0.75rem',
                              background: 'rgba(16, 185, 129, 0.3)',
                              color: '#bbf7d0',
                              border: '1px solid rgba(16, 185, 129, 0.4)'
                            }}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Options List */}
                    {message.options && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        marginTop: '0.75rem'
                      }}>
                        {message.options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => setInputMessage(option)}
                            style={{
                              padding: '0.75rem',
                              borderRadius: '0.5rem',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              background: 'rgba(16, 185, 129, 0.1)',
                              color: '#bbf7d0',
                              fontSize: '0.875rem',
                              cursor: 'pointer',
                              textAlign: 'right',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.background = 'rgba(16, 185, 129, 0.2)';
                              e.target.style.transform = 'translateX(-2px)';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.background = 'rgba(16, 185, 129, 0.1)';
                              e.target.style.transform = 'translateX(0)';
                            }}
                          >
                            • {option}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Confidence Score */}
                    {message.confidence && message.confidence > 0.5 && (
                      <div style={{
                        marginTop: '0.5rem',
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <Zap size={12} />
                        <span>دقة التحليل: {Math.round(message.confidence * 100)}%</span>
                      </div>
                    )}
                  </div>

                  {/* Report Component */}
                  {message.report && <ReportCard report={message.report} />}
                  
                  {/* Analysis Component */}
                  {message.analysis && <AnalysisCard analysis={message.analysis} />}

                  {/* Timestamp */}
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#9ca3af',
                    marginTop: '0.5rem',
                    textAlign: message.type === 'user' ? 'right' : 'left'
                  }}>
                    {message.timestamp.toLocaleTimeString('ar-SA', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '1rem',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '0.25rem'
                  }}>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#10b981',
                          animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ color: '#10b981', fontSize: '0.875rem' }}>
                    {isGeneratingReport ? 'جاري تحليل البيانات وإنشاء التقرير...' : 'جاري التفكير...'}
                  </span>
                </div>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Bot size={20} color="white" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Input Area */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          borderRadius: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '1rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="اكتب رسالتك هنا... (مثل: أريد تقرير عن مزارع الأحساء، أو: شكوى حول استهلاك المياه)"
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = 'rgba(16, 185, 129, 0.5)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            style={{
              padding: '0.75rem',
              borderRadius: '0.75rem',
              border: 'none',
              background: inputMessage.trim() && !isTyping 
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'rgba(107, 114, 128, 0.5)',
              color: 'white',
              cursor: inputMessage.trim() && !isTyping ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              transform: inputMessage.trim() && !isTyping ? 'scale(1)' : 'scale(0.95)'
            }}
            onMouseOver={(e) => {
              if (inputMessage.trim() && !isTyping) {
                e.target.style.transform = 'scale(1.05)';
              }
            }}
            onMouseOut={(e) => {
              if (inputMessage.trim() && !isTyping) {
                e.target.style.transform = 'scale(1)';
              }
            }}
          >
            <Send size={20} />
          </button>
        </div>

        {/* Status Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          marginTop: '1rem',
          color: '#9ca3af',
          fontSize: '0.875rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
              animation: 'pulse 2s infinite'
            }} />
            <span>الذكاء الاصطناعي نشط</span>
          </div>
          <span>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Satellite size={16} />
            <span>متصل بالأقمار الصناعية</span>
          </div>
          <span>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={16} />
            <span>أمان البيانات مضمون</span>
          </div>
          <span>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={16} />
            <span>{messages.length} رسالة</span>
          </div>
        </div>
      </div>

      {/* Detailed Report Modal */}
      {showDetailedReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }} onClick={() => setShowDetailedReport(null)}>
          <div style={{
            background: 'linear-gradient(135deg, #1e293b, #334155)',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width: '100%',
            maxWidth: '80rem'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div>
                <h2 style={{
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  margin: '0 0 0.5rem 0'
                }}>
                  التقرير المفصل - {showDetailedReport.location}
                </h2>
                <p style={{
                  color: '#9ca3af',
                  margin: 0,
                  fontSize: '1rem'
                }}>
                  تم إنشاؤه في: {showDetailedReport.generatedAt.toLocaleDateString('ar-SA')} - {showDetailedReport.generatedAt.toLocaleTimeString('ar-SA')}
                </p>
              </div>
              <button
                onClick={() => setShowDetailedReport(null)}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '0.5rem',
                  color: '#ef4444',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.3)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Report Content */}
            <div style={{
              display: 'grid',
              gap: '2rem'
            }}>
              
              {/* Key Metrics */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '1rem',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <h3 style={{
                  color: 'white',
                  fontSize: '1.25rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <BarChart3 size={20} />
                  المؤشرات الرئيسية
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1.5rem'
                }}>
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      color: '#6ee7b7',
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem'
                    }}>
                      {showDetailedReport.summary.area}
                    </div>
                    <div style={{
                      color: '#9ca3af',
                      fontSize: '1rem'
                    }}>
                      إجمالي المساحة المزروعة
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      color: '#93c5fd',
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem'
                    }}>
                      {showDetailedReport.summary.ndvi.toFixed(3)}
                    </div>
                    <div style={{
                      color: '#9ca3af',
                      fontSize: '1rem'
                    }}>
                      مؤشر الغطاء النباتي NDVI
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      color: '#fbbf24',
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem'
                    }}>
                      {showDetailedReport.summary.waterUsage}%
                    </div>
                    <div style={{
                      color: '#9ca3af',
                      fontSize: '1rem'
                    }}>
                      معدل استهلاك المياه
                    </div>
                  </div>

                  <div style={{
                    background: showDetailedReport.summary.violations > 0 
                      ? 'rgba(239, 68, 68, 0.1)' 
                      : 'rgba(16, 185, 129, 0.1)',
                    border: `1px solid ${showDetailedReport.summary.violations > 0 
                      ? 'rgba(239, 68, 68, 0.3)' 
                      : 'rgba(16, 185, 129, 0.3)'}`,
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      color: showDetailedReport.summary.violations > 0 ? '#fca5a5' : '#6ee7b7',
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem'
                    }}>
                      {showDetailedReport.summary.violations}
                    </div>
                    <div style={{
                      color: '#9ca3af',
                      fontSize: '1rem'
                    }}>
                      المخالفات المسجلة
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem'
              }}>
                {/* NDVI Trend Chart */}
                <div style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '0.75rem',
                  padding: '1.5rem'
                }}>
                  <h3 style={{
                    color: '#60a5fa',
                    fontSize: '1.125rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <TrendingUp size={20} />
                    اتجاه مؤشر NDVI
                  </h3>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    {showDetailedReport.charts.ndviTrend.map((item, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        background: 'rgba(59, 130, 246, 0.1)'
                      }}>
                        <span style={{ color: '#bfdbfe', fontWeight: '600' }}>{item.month}</span>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem'
                        }}>
                          <div style={{
                            width: `${item.value * 120}px`,
                            height: '10px',
                            borderRadius: '5px',
                            background: 'linear-gradient(90deg, #60a5fa, #3b82f6)',
                            transition: 'all 0.3s ease'
                          }} />
                          <span style={{ 
                            color: 'white', 
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            minWidth: '60px',
                            textAlign: 'left'
                          }}>
                            {item.value.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Water Usage Chart */}
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '0.75rem',
                  padding: '1.5rem'
                }}>
                  <h3 style={{
                    color: '#6ee7b7',
                    fontSize: '1.125rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Droplets size={20} />
                    استهلاك المياه الشهري
                  </h3>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    {showDetailedReport.charts.waterUsage.map((item, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        background: 'rgba(16, 185, 129, 0.1)'
                      }}>
                        <span style={{ color: '#bbf7d0', fontWeight: '600' }}>{item.month}</span>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem'
                        }}>
                          <div style={{
                            width: `${item.usage}px`,
                            height: '10px',
                            borderRadius: '5px',
                            background: item.usage > 80 
                              ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                              : 'linear-gradient(90deg, #6ee7b7, #10b981)',
                            transition: 'all 0.3s ease'
                          }} />
                          <span style={{ 
                            color: 'white', 
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            minWidth: '50px',
                            textAlign: 'left'
                          }}>
                            {item.usage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Violations Chart */}
                <div style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '0.75rem',
                  padding: '1.5rem'
                }}>
                  <h3 style={{
                    color: '#fbbf24',
                    fontSize: '1.125rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <AlertCircle size={20} />
                    توزيع المخالفات
                  </h3>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    {showDetailedReport.charts.violationsHistory.map((item, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        background: 'rgba(245, 158, 11, 0.1)'
                      }}>
                        <span style={{ color: '#fde047', fontWeight: '600' }}>{item.type}</span>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem'
                        }}>
                          <div style={{
                            width: `${Math.max(item.count * 20, 10)}px`,
                            height: '10px',
                            borderRadius: '5px',
                            background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                            transition: 'all 0.3s ease'
                          }} />
                          <span style={{ 
                            color: 'white', 
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            minWidth: '30px',
                            textAlign: 'left'
                          }}>
                            {item.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations Section */}
              <div style={{
                background: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '1rem',
                padding: '1.5rem'
              }}>
                <h3 style={{
                  color: '#c084fc',
                  fontSize: '1.25rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Lightbulb size={20} />
                  التوصيات والإجراءات المقترحة
                </h3>
                <div style={{
                  display: 'grid',
                  gap: '1rem'
                }}>
                  {showDetailedReport.details.recommendations.map((rec, index) => (
                    <div key={index} style={{
                      background: 'rgba(168, 85, 247, 0.1)',
                      border: '1px solid rgba(168, 85, 247, 0.2)',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'rgba(168, 85, 247, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: '#c084fc',
                        fontSize: '0.875rem',
                        fontWeight: 'bold'
                      }}>
                        {index + 1}
                      </div>
                      <span style={{ color: '#d1d5db', lineHeight: '1.5' }}>
                        {rec}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <button 
                  onClick={() => downloadPDF(showDetailedReport)}
                  style={{
                    padding: '0.75rem 2rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#10b981',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = 'rgba(16, 185, 129, 0.3)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'rgba(16, 185, 129, 0.2)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <Download size={20} />
                  تحميل التقرير الكامل
                </button>
                <button 
                  onClick={() => setShowDetailedReport(null)}
                  style={{
                    padding: '0.75rem 2rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(107, 114, 128, 0.3)',
                    background: 'rgba(107, 114, 128, 0.2)',
                    color: '#9ca3af',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = 'rgba(107, 114, 128, 0.3)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'rgba(107, 114, 128, 0.2)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.5;
              transform: scale(0.95);
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          /* Scrollbar Styling */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }

          ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
          }

          ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 4px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
          }

          /* Responsive Design */
          @media (max-width: 768px) {
            .message-max-width {
              max-width: 95% !important;
            }
            
            .quick-actions {
              flex-direction: column !important;
            }
            
            .input-area {
              flex-direction: column !important;
              gap: 0.5rem !important;
            }

            .modal-container {
              margin: 1rem !important;
              padding: 1rem !important;
              max-width: 95vw !important;
            }

            .charts-grid {
              grid-template-columns: 1fr !important;
            }

            .metrics-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }

          @media (max-width: 480px) {
            .metrics-grid {
              grid-template-columns: 1fr !important;
            }
            
            .status-bar {
              flex-direction: column !important;
              gap: 0.5rem !important;
            }
          }

          /* Hover Effects */
          .hover-scale:hover {
            transform: scale(1.02);
            transition: transform 0.2s ease;
          }

          /* Focus States */
          button:focus {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
          }

          input:focus {
            outline: 2px solid #10b981;
            outline-offset: 2px;
          }
        `}
      </style>
    </div>
  );
};

export default MisbarChatbot;