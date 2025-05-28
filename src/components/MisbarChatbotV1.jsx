import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, User, FileText, AlertCircle, CheckCircle, 
  TrendingUp, Download, Eye, MapPin, Satellite, 
  Calendar, Clock, Zap, Shield, Search, RefreshCw,
  BarChart3, PieChart, Activity, Droplets, Leaf
} from 'lucide-react';

const MisbarChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // البيانات الوهمية للمزارع
  const farmData = {
    'الأحساء': {
      location: 'الأحساء',
      area: '12000 هكتار',
      ndvi: 0.68,
      waterUsage: '85%',
      violations: 2,
      complaints: 1,
      lastUpdate: '2024-05-28',
      crops: 'نخيل التمر',
      issues: ['استهلاك مياه مرتفع', 'عدم وجود تراخيص للتوسع الجديد']
    },
    'الخرج': {
      location: 'الخرج',
      area: '8500 هكتار',
      ndvi: 0.54,
      waterUsage: '72%',
      violations: 0,
      complaints: 3,
      lastUpdate: '2024-05-28',
      crops: 'أعلاف وقمح',
      issues: ['شكوى من المزارعين المجاورين حول جودة المياه']
    },
    'الجوف': {
      location: 'الجوف',
      area: '15200 هكتار',
      ndvi: 0.72,
      waterUsage: '68%',
      violations: 1,
      complaints: 0,
      lastUpdate: '2024-05-28',
      crops: 'زيتون وفواكه',
      issues: ['تأخير في تجديد التراخيص']
    },
    'تبوك': {
      location: 'تبوك',
      area: '9800 هكتار',
      ndvi: 0.45,
      waterUsage: '91%',
      violations: 4,
      complaints: 2,
      lastUpdate: '2024-05-28',
      crops: 'قمح وشعير',
      issues: ['تجاوز في استهلاك المياه', 'عدم الالتزام بالمواعيد المحددة للري', 'شكاوى حول التلوث']
    }
  };

  const welcomeMessages = [
    {
      id: 1,
      type: 'bot',
      content: 'مرحباً بك في المُحادثة الذكية لمِسْبَار - المساعد الذكي للمراقبة الزراعية! ',
      timestamp: new Date(),
      features: ['تحليل البيانات', 'إنشاء التقارير', 'فحص الشكاوي', 'مراقبة المخالفات']
    },
    {
      id: 2,
      type: 'bot',
      content: 'يمكنني مساعدتك في:',
      timestamp: new Date(),
      options: [
        'إنشاء تقرير شامل للمزارع',
        'فحص الشكاوي والمخالفات',
        'تحليل استهلاك المياه',
        'مراقبة الغطاء النباتي NDVI',
        'إحصائيات المناطق الزراعية'
      ]
    }
  ];

  useEffect(() => {
    setMessages(welcomeMessages);
  }, []);

  const generateReport = async (location) => {
    setIsGeneratingReport(true);
    setIsTyping(true);

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
        issues: data.issues,
        recommendations: generateRecommendations(data)
      },
      charts: {
        ndviTrend: generateNDVIData(),
        waterUsage: generateWaterData(),
        violationsHistory: generateViolationsData()
      }
    };

    setCurrentAnalysis(report);
    setIsGeneratingReport(false);
    setIsTyping(false);

    const botMessage = {
      id: Date.now(),
      type: 'bot',
      content: `تم إنشاء التقرير الشامل لمنطقة ${location} بنجاح! 📊`,
      timestamp: new Date(),
      report: report
    };

    setMessages(prev => [...prev, botMessage]);
  };

  const generateRecommendations = (data) => {
    const recommendations = [];
    
    if (parseFloat(data.waterUsage.replace('%', '')) > 80) {
      recommendations.push('تحسين كفاءة أنظمة الري وتقليل الهدر');
      recommendations.push('تركيب أجهزة استشعار لمراقبة رطوبة التربة');
    }
    
    if (data.ndvi < 0.5) {
      recommendations.push('فحص صحة النباتات وتحسين برامج التسميد');
      recommendations.push('مراجعة أساليب الري والصرف');
    }
    
    if (data.violations > 0) {
      recommendations.push('متابعة المخالفات المسجلة وتصحيح الأوضاع');
      recommendations.push('تدريب الفرق على الالتزام بالقوانين');
    }
    
    if (data.complaints > 0) {
      recommendations.push('معالجة الشكاوي المقدمة من المجتمع المحلي');
      recommendations.push('تحسين التواصل مع الأطراف المعنية');
    }

    return recommendations.length > 0 ? recommendations : ['الأداء ضمن المعايير المطلوبة'];
  };

  const generateNDVIData = () => [
    { month: 'يناير', value: 0.45 },
    { month: 'فبراير', value: 0.52 },
    { month: 'مارس', value: 0.61 },
    { month: 'أبريل', value: 0.68 },
    { month: 'مايو', value: 0.72 }
  ];

  const generateWaterData = () => [
    { month: 'يناير', usage: 65 },
    { month: 'فبراير', usage: 72 },
    { month: 'مارس', usage: 78 },
    { month: 'أبريل', usage: 85 },
    { month: 'مايو', usage: 82 }
  ];

  const generateViolationsData = () => [
    { type: 'مياه', count: 3 },
    { type: 'تراخيص', count: 2 },
    { type: 'بيئية', count: 1 }
  ];

  const analyzeComplaint = async (complaintText) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const analysis = {
      severity: Math.random() > 0.5 ? 'عالية' : 'متوسطة',
      category: getComplaintCategory(complaintText),
      location: extractLocation(complaintText),
      actionRequired: Math.random() > 0.3,
      estimatedTime: '2-5 أيام عمل',
      relatedFarms: getRelatedFarms(complaintText)
    };

    setIsTyping(false);

    const response = {
      id: Date.now(),
      type: 'bot',
      content: 'تم تحليل الشكوى باستخدام الذكاء الاصطناعي:',
      timestamp: new Date(),
      analysis: analysis
    };

    setMessages(prev => [...prev, response]);
  };

  const getComplaintCategory = (text) => {
    if (text.includes('مياه') || text.includes('ري')) return 'استهلاك المياه';
    if (text.includes('تلوث') || text.includes('بيئة')) return 'التلوث البيئي';
    if (text.includes('ترخيص') || text.includes('قانون')) return 'المخالفات القانونية';
    if (text.includes('ضوضاء') || text.includes('صوت')) return 'التلوث السمعي';
    return 'شكوى عامة';
  };

  const extractLocation = (text) => {
    const locations = ['الأحساء', 'الخرج', 'الجوف', 'تبوك'];
    for (let location of locations) {
      if (text.includes(location)) return location;
    }
    return 'غير محدد';
  };

  const getRelatedFarms = (text) => {
    const location = extractLocation(text);
    return location !== 'غير محدد' ? [farmData[location]] : [];
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

    if (currentInput.includes('تقرير') || currentInput.includes('إحصائيات')) {
      const location = extractLocation(currentInput) || 'الأحساء';
      await generateReport(location);
    } else if (currentInput.includes('شكوى') || currentInput.includes('مخالفة')) {
      await analyzeComplaint(currentInput);
    } else {
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const botResponse = {
        id: Date.now(),
        type: 'bot',
        content: getSmartResponse(currentInput),
        timestamp: new Date()
      };
      
      setIsTyping(false);
      setMessages(prev => [...prev, botResponse]);
    }
  };

  const getSmartResponse = (input) => {
    if (input.includes('مساعدة') || input.includes('help')) {
      return 'يمكنني مساعدتك في إنشاء التقارير وتحليل الشكاوي. جرب قول "أريد تقرير عن مزارع الأحساء" أو "تحليل شكوى حول استهلاك المياه"';
    }
    if (input.includes('مرحبا') || input.includes('السلام')) {
      return 'مرحباً بك! أنا المساعد الذكي لمنصة مِسْبَار. كيف يمكنني مساعدتك اليوم؟';
    }
    if (input.includes('NDVI') || input.includes('نباتي')) {
      return 'مؤشر NDVI يقيس صحة الغطاء النباتي. القيم الأعلى من 0.6 تدل على نباتات صحية. هل تريد تقرير مفصل عن منطقة معينة؟';
    }
    return 'فهمت استفسارك. هل يمكنك توضيح أكثر؟ يمكنني مساعدتك في التقارير والشكاوي والإحصائيات.';
  };

  const QuickActions = () => (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
      marginBottom: '1rem'
    }}>
      {[
        'تقرير شامل للأحساء',
        'تحليل مخالفات الخرج',
        'إحصائيات استهلاك المياه',
        'شكاوي المنطقة الشرقية'
      ].map((action, index) => (
        <button
          key={index}
          onClick={() => setInputMessage(action)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#60a5fa',
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(59, 130, 246, 0.2)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(59, 130, 246, 0.1)'}
        >
          {action}
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
            {report.summary.waterUsage}
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

      {/* التوصيات */}
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ color: '#10b981', fontSize: '1rem', marginBottom: '0.5rem' }}>
          التوصيات:
        </h4>
        <ul style={{ color: '#d1d5db', fontSize: '0.875rem', paddingRight: '1rem' }}>
          {report.details.recommendations.map((rec, index) => (
            <li key={index} style={{ marginBottom: '0.25rem' }}>{rec}</li>
          ))}
        </ul>
      </div>

      {/* أزرار العمل */}
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
          <Download size={16} />
          تحميل PDF
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
          <Eye size={16} />
          عرض تفصيلي
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
          تحليل الشكوى
        </h3>
        <span style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '50px',
          fontSize: '0.75rem',
          background: analysis.severity === 'عالية' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
          color: analysis.severity === 'عالية' ? '#ef4444' : '#f59e0b'
        }}>
          أولوية {analysis.severity}
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        color: '#d1d5db',
        fontSize: '0.875rem'
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
          <strong style={{ color: '#c084fc' }}>يتطلب إجراء:</strong> {analysis.actionRequired ? 'نعم' : 'لا'}
        </div>
      </div>

      {analysis.relatedFarms.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
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
              }}>المساعد الذكي</h1>
              <p style={{
                color: '#bfdbfe',
                fontSize: '1rem',
                margin: 0
              }}>تقارير آلية وفحص ذكي للشكاوي</p>
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
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: '2rem',
        height: 'calc(100vh - 120px)',
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
                marginBottom: '1rem'
              }}
            >
              <div style={{
                maxWidth: '70%',
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
                  flexShrink: 0
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
                    padding: '1rem',
                    color: 'white'
                  }}>
                    <p style={{ margin: 0, lineHeight: '1.5' }}>
                      {message.content}
                    </p>

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
                              color: '#bbf7d0'
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
                            onMouseOver={(e) => e.target.style.background = 'rgba(16, 185, 129, 0.2)'}
                            onMouseOut={(e) => e.target.style.background = 'rgba(16, 185, 129, 0.1)'}
                          >
                            • {option}
                          </button>
                        ))}
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
                  gap: '0.5rem'
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
                    {isGeneratingReport ? 'جاري إنشاء التقرير...' : 'جاري الكتابة...'}
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
            placeholder="اكتب رسالتك هنا... (مثل: أريد تقرير عن مزارع الأحساء)"
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '1rem',
              outline: 'none'
            }}
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
              transition: 'all 0.3s ease'
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
          fontSize: '0.875rem'
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
        </div>
      </div>

      {/* Analytics Panel */}
      {currentAnalysis && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'linear-gradient(135deg, #1e293b, #334155)',
          borderRadius: '1rem',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(16px)',
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflowY: 'auto',
          zIndex: 1000,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              margin: 0
            }}>
              تحليل مفصل - {currentAnalysis.location}
            </h2>
            <button
              onClick={() => setCurrentAnalysis(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>

          {/* Detailed Charts */}
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
                اتجاه NDVI
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                {currentAnalysis.charts.ndviTrend.map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    background: 'rgba(59, 130, 246, 0.1)'
                  }}>
                    <span style={{ color: '#bfdbfe' }}>{item.month}</span>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div style={{
                        width: `${item.value * 100}px`,
                        height: '8px',
                        borderRadius: '4px',
                        background: 'linear-gradient(90deg, #60a5fa, #3b82f6)'
                      }} />
                      <span style={{ color: 'white', fontSize: '0.875rem' }}>
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
                استهلاك المياه
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                {currentAnalysis.charts.waterUsage.map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    background: 'rgba(16, 185, 129, 0.1)'
                  }}>
                    <span style={{ color: '#bbf7d0' }}>{item.month}</span>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div style={{
                        width: `${item.usage}px`,
                        height: '8px',
                        borderRadius: '4px',
                        background: item.usage > 80 
                          ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                          : 'linear-gradient(90deg, #6ee7b7, #10b981)'
                      }} />
                      <span style={{ color: 'white', fontSize: '0.875rem' }}>
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
                المخالفات
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                {currentAnalysis.charts.violationsHistory.map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    background: 'rgba(245, 158, 11, 0.1)'
                  }}>
                    <span style={{ color: '#fde047' }}>{item.type}</span>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div style={{
                        width: `${item.count * 15}px`,
                        height: '8px',
                        borderRadius: '4px',
                        background: 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                      }} />
                      <span style={{ color: 'white', fontSize: '0.875rem' }}>
                        {item.count}
                      </span>
                    </div>
                  </div>
                ))}
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

          .message-enter {
            animation: fadeIn 0.3s ease-out;
          }

          /* Scrollbar Styling */
          ::-webkit-scrollbar {
            width: 8px;
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
              max-width: 90% !important;
            }
            
            .quick-actions {
              flex-direction: column !important;
            }
            
            .input-area {
              flex-direction: column !important;
              gap: 0.5rem !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default MisbarChatbot;