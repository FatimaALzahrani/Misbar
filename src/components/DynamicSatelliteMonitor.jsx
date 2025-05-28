import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getDatabase, ref, onValue, set, push, serverTimestamp } from 'firebase/database';
import { AlertTriangle, BarChart2, Droplet, RefreshCw, Map, Thermometer, Cloud, Wind, Sun } from 'lucide-react';
import styled, { keyframes } from 'styled-components';

// مكون مراقبة الأقمار الصناعية باستخدام APIs رسمية
const OfficialSatelliteMonitor = ({ customRefreshInterval }) => {
  // حالة المواقع الزراعية (تُجلب ديناميكياً من Firebase)
  const [agriculturalSites, setAgriculturalSites] = useState([]);
  
  // حالة بيانات الأقمار الصناعية لكل موقع
  const [satelliteData, setSatelliteData] = useState({});
  
  // حالة التحميل
  const [loading, setLoading] = useState(true);
  
  // حالة الخطأ
  const [error, setError] = useState(null);
  
  // حالة الموقع المحدد
  const [selectedSite, setSelectedSite] = useState(null);
  
  // حالة التنبيهات
  const [alerts, setAlerts] = useState([]);
  
  // حالة عتبات التنبيهات (تُجلب من Firebase)
  const [alertThresholds, setAlertThresholds] = useState({
    ndvi_low: 0.3,
    cloud_cover_high: 30,
    water_usage_high: 75
  });
  
  // مرجع للتحديث الدوري
  const refreshTimerRef = useRef(null);
  
  // مرجع لحالة التحميل الأولي
  const initialLoadRef = useRef(true);
  
  // فترة التحديث (بالمللي ثانية)، يمكن تخصيصها من الخارج
  const refreshInterval = customRefreshInterval || 15 * 60 * 1000; // 15 دقيقة افتراضياً
  
  // مفاتيح API للخدمات المختلفة
  // قم بتعبئة هذه المفاتيح بعد الحصول عليها من مزودي الخدمات
  const apiKeys = {
    // Sentinel Hub API - https://www.sentinel-hub.com/
    sentinelHub: {
      clientId: "YOUR_SENTINEL_HUB_CLIENT_ID",
      clientSecret: "YOUR_SENTINEL_HUB_CLIENT_SECRET",
      instanceId: "YOUR_SENTINEL_HUB_INSTANCE_ID"
    },
    // Earth Engine API - https://earthengine.google.com/
    earthEngine: {
      apiKey: "YOUR_EARTH_ENGINE_API_KEY"
    },
    // NASA Earth Data API - https://earthdata.nasa.gov/
    nasaEarthData: {
      username: "YOUR_NASA_EARTH_DATA_USERNAME",
      password: "YOUR_NASA_EARTH_DATA_PASSWORD"
    },
    // USGS Earth Explorer API - https://ers.cr.usgs.gov/
    usgsEarthExplorer: {
      apiKey: "YOUR_USGS_API_KEY"
    }
  };
  
  // دالة تسجيل الأخطاء في Firebase
  const logError = useCallback((source, location, error) => {
    console.error(`[${source}] فشل في جلب بيانات ${source} للموقع ${location}`, error);
    
    try {
      const db = getDatabase();
      const errorsRef = ref(db, 'misbar/errors');
      push(errorsRef, {
        source,
        location,
        message: error.message || String(error),
        timestamp: serverTimestamp()
      });
    } catch (logError) {
      console.error('فشل في تسجيل الخطأ في Firebase:', logError);
    }
  }, []);
  
  // دالة إعادة المحاولة مع تأخير تصاعدي
  const retryWithBackoff = useCallback(async (fn, retries = 3, delay = 1000, backoff = 2) => {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * backoff, backoff);
    }
  }, []);
  
  // دالة جلب المواقع الزراعية من Firebase
  const fetchAgriculturalSites = useCallback(async () => {
    try {
      const db = getDatabase();
      const sitesRef = ref(db, 'misbar/locations');
      
      return new Promise((resolve, reject) => {
        onValue(sitesRef, (snapshot) => {
          if (snapshot.exists()) {
            const sitesData = snapshot.val();
            const sitesArray = Object.keys(sitesData).map(key => ({
              id: key,
              ...sitesData[key]
            }));
            resolve(sitesArray);
          } else {
            // إذا لم تكن هناك مواقع في Firebase، نقوم بإنشاء مواقع افتراضية وتخزينها
            const defaultSites = createDefaultSites();
            saveSitesToFirebase(defaultSites);
            resolve(defaultSites);
          }
        }, (error) => {
          reject(error);
        });
      });
    } catch (error) {
      logError('Firebase', 'جلب المواقع الزراعية', error);
      throw error;
    }
  }, [logError]);
  
  // دالة إنشاء مواقع افتراضية (تستخدم فقط إذا لم تكن هناك مواقع في Firebase)
  const createDefaultSites = () => {
    return [
      { 
        id: 'site1', 
        name: "مشروع الأحساء للنخيل", 
        lat: 25.4295, 
        lng: 49.6200,
        landsat_path: 164,
        landsat_row: 43,
        sentinel_tile: "39RUL",
        description: "أكبر واحة نخيل في العالم",
        area: "12000 هكتار",
        established: "1975",
        crop_type: "نخيل التمر",
        water_source: "آبار جوفية"
      },
      { 
        id: 'site2', 
        name: "مشروع الخرج الزراعي", 
        lat: 24.1333, 
        lng: 47.3000,
        landsat_path: 165,
        landsat_row: 43,
        sentinel_tile: "38RLN",
        description: "مشروع لإنتاج الألبان والأعلاف",
        area: "8500 هكتار", 
        established: "1980",
        crop_type: "أعلاف وقمح",
        water_source: "مياه معالجة"
      }
    ];
  };
  
  // دالة حفظ المواقع في Firebase
  const saveSitesToFirebase = (sites) => {
    try {
      const db = getDatabase();
      const sitesRef = ref(db, 'misbar/locations');
      
      // حفظ كل موقع بشكل منفصل
      sites.forEach(site => {
        const siteRef = ref(db, `misbar/locations/${site.id}`);
        set(siteRef, {
          name: site.name,
          lat: site.lat,
          lng: site.lng,
          landsat_path: site.landsat_path,
          landsat_row: site.landsat_row,
          sentinel_tile: site.sentinel_tile,
          description: site.description,
          area: site.area,
          established: site.established,
          crop_type: site.crop_type,
          water_source: site.water_source
        });
      });
    } catch (error) {
      logError('Firebase', 'حفظ المواقع الزراعية', error);
    }
  };
  
  // دالة جلب عتبات التنبيهات من Firebase
  const fetchAlertThresholds = useCallback(async () => {
    try {
      const db = getDatabase();
      const thresholdsRef = ref(db, 'misbar/settings/alert_thresholds');
      
      return new Promise((resolve, reject) => {
        onValue(thresholdsRef, (snapshot) => {
          if (snapshot.exists()) {
            resolve(snapshot.val());
          } else {
            // إذا لم تكن هناك عتبات في Firebase، نقوم بإنشاء عتبات افتراضية وتخزينها
            const defaultThresholds = {
              ndvi_low: 0.3,
              cloud_cover_high: 30,
              water_usage_high: 75
            };
            
            set(thresholdsRef, defaultThresholds);
            resolve(defaultThresholds);
          }
        }, (error) => {
          reject(error);
        });
      });
    } catch (error) {
      logError('Firebase', 'جلب عتبات التنبيهات', error);
      throw error;
    }
  }, [logError]);
  
  // دالة الحصول على رمز الوصول لـ Sentinel Hub API
  const getSentinelHubToken = useCallback(async () => {
    try {
      const response = await fetch('https://services.sentinel-hub.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: apiKeys.sentinelHub.clientId,
          client_secret: apiKeys.sentinelHub.clientSecret
        })
      });
      
      if (!response.ok) {
        throw new Error(`Sentinel Hub OAuth responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.access_token;
    } catch (error) {
      logError('Sentinel Hub OAuth', 'الحصول على رمز الوصول', error);
      throw error;
    }
  }, [apiKeys.sentinelHub.clientId, apiKeys.sentinelHub.clientSecret, logError]);
  
  // دالة جلب بيانات NDVI من Sentinel Hub API
  const fetchSentinelHubNDVI = useCallback(async (lat, lng) => {
    try {
      // الحصول على رمز الوصول
      const token = await getSentinelHubToken();
      
      // تحديد الفترة الزمنية (آخر 30 يوم)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      // إنشاء طلب للحصول على بيانات NDVI
      const response = await fetch('https://services.sentinel-hub.com/api/v1/statistics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          input: {
            bounds: {
              geometry: {
                type: "Point",
                coordinates: [lng, lat]
              },
              properties: {
                crs: "http://www.opengis.net/def/crs/EPSG/0/4326"
              }
            },
            data: [
              {
                type: "sentinel-2-l2a",
                dataFilter: {
                  timeRange: {
                    from: formattedStartDate,
                    to: formattedEndDate
                  },
                  maxCloudCoverage: 20
                }
              }
            ]
          },
          aggregation: {
            timeRange: {
              from: formattedStartDate,
              to: formattedEndDate
            },
            aggregationInterval: {
              of: "P1D"
            },
            evalscript: `
              //VERSION=3
              function setup() {
                return {
                  input: ["B04", "B08", "dataMask"],
                  output: [
                    { id: "ndvi", bands: 1 }
                  ]
                }
              }
              
              function evaluatePixel(sample) {
                let ndvi = index(sample.B08, sample.B04);
                return {
                  ndvi: [ndvi]
                };
              }
              
              function index(band1, band2) {
                return (band1 - band2) / (band1 + band2);
              }
            `
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Sentinel Hub API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // استخراج متوسط قيمة NDVI
      if (!data || !data.data || data.data.length === 0) {
        throw new Error('No NDVI data available for this location');
      }
      
      // حساب متوسط قيم NDVI المتوفرة
      let totalNDVI = 0;
      let validCount = 0;
      
      data.data.forEach(item => {
        if (item.outputs && item.outputs.ndvi && item.outputs.ndvi.bands && item.outputs.ndvi.bands[0]) {
          const ndviValue = item.outputs.ndvi.bands[0].stats.mean;
          if (ndviValue !== null && !isNaN(ndviValue)) {
            totalNDVI += ndviValue;
            validCount++;
          }
        }
      });
      
      if (validCount === 0) {
        throw new Error('No valid NDVI values found for this location');
      }
      
      return totalNDVI / validCount;
    } catch (error) {
      logError('Sentinel Hub API', `(${lat}, ${lng})`, error);
      throw error;
    }
  }, [getSentinelHubToken, logError]);
  
  // دالة جلب بيانات الغطاء السحابي من Sentinel Hub API
  const fetchSentinelHubCloudCover = useCallback(async (lat, lng) => {
    try {
      // الحصول على رمز الوصول
      const token = await getSentinelHubToken();
      
      // تحديد الفترة الزمنية (آخر 30 يوم)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      // إنشاء طلب للحصول على بيانات الغطاء السحابي
      const response = await fetch('https://services.sentinel-hub.com/api/v1/catalog/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bbox: [lng - 0.1, lat - 0.1, lng + 0.1, lat + 0.1],
          time: `${formattedStartDate}T00:00:00Z/${formattedEndDate}T23:59:59Z`,
          collections: ["sentinel-2-l2a"],
          limit: 10,
          fields: {
            include: ["properties.cloudCover"]
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Sentinel Hub API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // استخراج متوسط نسبة الغطاء السحابي
      if (!data || !data.features || data.features.length === 0) {
        throw new Error('No cloud cover data available for this location');
      }
      
      // حساب متوسط نسب الغطاء السحابي
      let totalCloudCover = 0;
      let validCount = 0;
      
      data.features.forEach(feature => {
        if (feature.properties && feature.properties.cloudCover !== undefined) {
          totalCloudCover += feature.properties.cloudCover * 100; // تحويل إلى نسبة مئوية
          validCount++;
        }
      });
      
      if (validCount === 0) {
        throw new Error('No valid cloud cover values found for this location');
      }
      
      return totalCloudCover / validCount;
    } catch (error) {
      logError('Sentinel Hub API', `(${lat}, ${lng})`, error);
      throw error;
    }
  }, [getSentinelHubToken, logError]);
  
  // دالة جلب بيانات درجة الحرارة من NASA POWER API
  const fetchNASAPowerTemperature = useCallback(async (lat, lng) => {
    try {
      // NASA POWER API لا يحتاج إلى مفتاح API
      const response = await fetch(`https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M&community=AG&longitude=${lng}&latitude=${lat}&start=20230101&end=20231231&format=JSON`);
      
      if (!response.ok) {
        throw new Error(`NASA POWER API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // استخراج متوسط درجة الحرارة
      if (!data || !data.properties || !data.properties.parameter || !data.properties.parameter.T2M) {
        throw new Error('No temperature data available for this location');
      }
      
      const temperatureData = data.properties.parameter.T2M;
      const temperatureValues = Object.values(temperatureData);
      
      // حساب متوسط درجات الحرارة
      const validTemperatures = temperatureValues.filter(value => value !== -999);
      
      if (validTemperatures.length === 0) {
        throw new Error('No valid temperature values found for this location');
      }
      
      const totalTemperature = validTemperatures.reduce((sum, value) => sum + value, 0);
      return totalTemperature / validTemperatures.length;
    } catch (error) {
      logError('NASA POWER API', `(${lat}, ${lng})`, error);
      throw error;
    }
  }, [logError]);
  
  // دالة جلب بيانات رطوبة التربة من NASA GRACE API
  const fetchNASAGraceSoilMoisture = useCallback(async (lat, lng) => {
    try {
      // تحتاج إلى مصادقة NASA Earth Data
      const headers = new Headers();
      headers.append('Authorization', 'Basic ' + btoa(`${apiKeys.nasaEarthData.username}:${apiKeys.nasaEarthData.password}`));
      
      const response = await fetch(`https://opendap.earthdata.nasa.gov/api/grace/soil_moisture?lat=${lat}&lon=${lng}`, {
        headers: headers
      });
      
      if (!response.ok) {
        throw new Error(`NASA GRACE API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // استخراج قيمة رطوبة التربة
      if (!data || !data.soil_moisture) {
        throw new Error('No soil moisture data available for this location');
      }
      
      // تحويل القيمة إلى نسبة مئوية (0-100%)
      return data.soil_moisture * 100;
    } catch (error) {
      logError('NASA GRACE API', `(${lat}, ${lng})`, error);
      throw error;
    }
  }, [apiKeys.nasaEarthData.username, apiKeys.nasaEarthData.password, logError]);
  
  // دالة جلب بيانات استهلاك المياه من Earth Engine API
  const fetchEarthEngineWaterUsage = useCallback(async (lat, lng) => {
    try {
      // هذه دالة تقريبية لأن Earth Engine API يتطلب إعداداً خاصاً
      // في التطبيق الفعلي، يجب استخدام مكتبة Earth Engine JavaScript API
      
      const response = await fetch(`https://earthengine.googleapis.com/v1/projects/earthengine-legacy/image:computePixels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKeys.earthEngine.apiKey}`
        },
        body: JSON.stringify({
          expression: `
            var dataset = ee.ImageCollection('NASA/FLDAS/NOAH01/C/GL/M/V001')
                  .filter(ee.Filter.date('2023-01-01', '2023-12-31'));
            var evapotranspiration = dataset.select('Evap_tavg');
            var point = ee.Geometry.Point([${lng}, ${lat}]);
            var evapValue = evapotranspiration.mean().reduceRegion({
              reducer: ee.Reducer.mean(),
              geometry: point,
              scale: 30
            });
            return evapValue;
          `
        })
      });
      
      if (!response.ok) {
        throw new Error(`Earth Engine API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // استخراج قيمة استهلاك المياه
      if (!data || !data.properties || !data.properties.Evap_tavg) {
        throw new Error('No water usage data available for this location');
      }
      
      // تحويل القيمة إلى نسبة مئوية (0-100%)
      // هذا تقريب، في التطبيق الفعلي يجب استخدام معادلة مناسبة
      const rawValue = data.properties.Evap_tavg;
      const normalizedValue = (rawValue / 10) * 100; // تطبيع القيمة إلى نسبة مئوية
      
      return Math.min(100, Math.max(0, normalizedValue)); // التأكد من أن القيمة بين 0 و 100
    } catch (error) {
      logError('Earth Engine API', `(${lat}, ${lng})`, error);
      throw error;
    }
  }, [apiKeys.earthEngine.apiKey, logError]);
  
  // دالة جلب جميع بيانات الأقمار الصناعية لموقع معين
  const fetchAllSatelliteData = useCallback(async (site) => {
    try {
      // جلب جميع البيانات بشكل متوازي
      const [ndviResult, cloudCoverResult, temperatureResult, soilMoistureResult, waterUsageResult] = await Promise.allSettled([
        retryWithBackoff(() => fetchSentinelHubNDVI(site.lat, site.lng)),
        retryWithBackoff(() => fetchSentinelHubCloudCover(site.lat, site.lng)),
        retryWithBackoff(() => fetchNASAPowerTemperature(site.lat, site.lng)),
        retryWithBackoff(() => fetchNASAGraceSoilMoisture(site.lat, site.lng)),
        retryWithBackoff(() => fetchEarthEngineWaterUsage(site.lat, site.lng))
      ]);
      
      // تجميع النتائج
      const result = {
        site_id: site.id,
        site_name: site.name,
        location: `${site.lat}, ${site.lng}`,
        timestamp: new Date().toISOString(),
        ndvi: ndviResult.status === 'fulfilled' ? ndviResult.value : null,
        ndvi_status: ndviResult.status === 'fulfilled' ? 'success' : 'error',
        ndvi_error: ndviResult.status === 'rejected' ? ndviResult.reason.message : null,
        cloud_cover: cloudCoverResult.status === 'fulfilled' ? cloudCoverResult.value : null,
        cloud_cover_status: cloudCoverResult.status === 'fulfilled' ? 'success' : 'error',
        cloud_cover_error: cloudCoverResult.status === 'rejected' ? cloudCoverResult.reason.message : null,
        temperature: temperatureResult.status === 'fulfilled' ? temperatureResult.value : null,
        temperature_status: temperatureResult.status === 'fulfilled' ? 'success' : 'error',
        temperature_error: temperatureResult.status === 'rejected' ? temperatureResult.reason.message : null,
        soil_moisture: soilMoistureResult.status === 'fulfilled' ? soilMoistureResult.value : null,
        soil_moisture_status: soilMoistureResult.status === 'fulfilled' ? 'success' : 'error',
        soil_moisture_error: soilMoistureResult.status === 'rejected' ? soilMoistureResult.reason.message : null,
        water_usage: waterUsageResult.status === 'fulfilled' ? waterUsageResult.value : null,
        water_usage_status: waterUsageResult.status === 'fulfilled' ? 'success' : 'error',
        water_usage_error: waterUsageResult.status === 'rejected' ? waterUsageResult.reason.message : null
      };
      
      // حفظ البيانات في Firebase
      saveSatelliteDataToFirebase(site.id, result);
      
      // التحقق من التنبيهات
      checkForAlerts(site, result);
      
      return result;
    } catch (error) {
      logError('Satellite Data', `${site.name} (${site.lat}, ${site.lng})`, error);
      throw error;
    }
  }, [fetchSentinelHubNDVI, fetchSentinelHubCloudCover, fetchNASAPowerTemperature, fetchNASAGraceSoilMoisture, fetchEarthEngineWaterUsage, retryWithBackoff, logError]);
  
  // دالة حفظ بيانات الأقمار الصناعية في Firebase
  const saveSatelliteDataToFirebase = useCallback((siteId, data) => {
    try {
      const db = getDatabase();
      const dataRef = ref(db, `misbar/satellite_data/${siteId}`);
      set(dataRef, {
        ...data,
        last_updated: serverTimestamp()
      });
      
      // تحديث الإحصائيات العامة
      updateStatistics();
    } catch (error) {
      logError('Firebase', `حفظ بيانات الموقع ${siteId}`, error);
    }
  }, [logError]);
  
  // دالة تحديث الإحصائيات العامة
  const updateStatistics = useCallback(() => {
    try {
      const db = getDatabase();
      const statsRef = ref(db, 'misbar/stats');
      
      // حساب الإحصائيات من البيانات الحالية
      const validNDVIValues = Object.values(satelliteData)
        .filter(data => data.ndvi !== null && data.ndvi_status === 'success')
        .map(data => data.ndvi);
      
      const averageNDVI = validNDVIValues.length > 0
        ? validNDVIValues.reduce((sum, val) => sum + val, 0) / validNDVIValues.length
        : 0;
      
      const totalAlerts = alerts.length;
      
      const bestQualitySites = Object.values(satelliteData)
        .filter(data => 
          data.ndvi_status === 'success' && 
          data.cloud_cover_status === 'success' && 
          data.temperature_status === 'success'
        ).length;
      
      set(statsRef, {
        averageNDVI,
        totalAlerts,
        bestQualitySites,
        last_updated: serverTimestamp()
      });
    } catch (error) {
      logError('Firebase', 'تحديث الإحصائيات', error);
    }
  }, [satelliteData, alerts, logError]);
  
  // دالة التحقق من التنبيهات
  const checkForAlerts = useCallback((site, data) => {
    const newAlerts = [];
    
    // التحقق من NDVI المنخفض
    if (data.ndvi !== null && data.ndvi < alertThresholds.ndvi_low) {
      newAlerts.push({
        id: `ndvi_low_${site.id}_${Date.now()}`,
        type: 'ndvi_low',
        site_id: site.id,
        site_name: site.name,
        message: `مؤشر NDVI منخفض (${data.ndvi.toFixed(2)}) في ${site.name}`,
        value: data.ndvi,
        threshold: alertThresholds.ndvi_low,
        timestamp: new Date().toISOString(),
        severity: 'high'
      });
    }
    
    // التحقق من الغطاء السحابي المرتفع
    if (data.cloud_cover !== null && data.cloud_cover > alertThresholds.cloud_cover_high) {
      newAlerts.push({
        id: `cloud_high_${site.id}_${Date.now()}`,
        type: 'cloud_cover_high',
        site_id: site.id,
        site_name: site.name,
        message: `غطاء سحابي مرتفع (${data.cloud_cover}%) في ${site.name}`,
        value: data.cloud_cover,
        threshold: alertThresholds.cloud_cover_high,
        timestamp: new Date().toISOString(),
        severity: 'medium'
      });
    }
    
    // التحقق من استهلاك المياه المرتفع
    if (data.water_usage !== null && data.water_usage > alertThresholds.water_usage_high) {
      newAlerts.push({
        id: `water_high_${site.id}_${Date.now()}`,
        type: 'water_usage_high',
        site_id: site.id,
        site_name: site.name,
        message: `استهلاك مياه مرتفع (${data.water_usage}%) في ${site.name}`,
        value: data.water_usage,
        threshold: alertThresholds.water_usage_high,
        timestamp: new Date().toISOString(),
        severity: 'high'
      });
    }
    
    // إضافة التنبيهات الجديدة إلى القائمة
    if (newAlerts.length > 0) {
      setAlerts(prevAlerts => [...prevAlerts, ...newAlerts]);
      
      // حفظ التنبيهات في Firebase
      saveAlertsToFirebase(newAlerts);
    }
  }, [alertThresholds]);
  
  // دالة حفظ التنبيهات في Firebase
  const saveAlertsToFirebase = useCallback((newAlerts) => {
    try {
      const db = getDatabase();
      const alertsRef = ref(db, 'misbar/alerts');
      
      newAlerts.forEach(alert => {
        const newAlertRef = push(alertsRef);
        set(newAlertRef, {
          ...alert,
          created_at: serverTimestamp()
        });
      });
    } catch (error) {
      logError('Firebase', 'حفظ التنبيهات', error);
    }
  }, [logError]);
  
  // دالة تحديث جميع البيانات
  const refreshAllData = useCallback(async () => {
    if (agriculturalSites.length === 0) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // جلب بيانات جميع المواقع بشكل متوازي
      const results = await Promise.all(
        agriculturalSites.map(site => fetchAllSatelliteData(site))
      );
      
      // تحويل النتائج إلى كائن مفهرس بمعرف الموقع
      const newSatelliteData = {};
      results.forEach(result => {
        newSatelliteData[result.site_id] = result;
      });
      
      setSatelliteData(newSatelliteData);
      setLoading(false);
      
      // تحديث الإحصائيات
      updateStatistics();
    } catch (error) {
      setError('فشل في تحديث البيانات: ' + error.message);
      setLoading(false);
    }
  }, [agriculturalSites, fetchAllSatelliteData, updateStatistics]);
  
  // تأثير لجلب المواقع الزراعية وعتبات التنبيهات عند تحميل المكون
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // جلب المواقع الزراعية وعتبات التنبيهات بشكل متوازي
        const [sites, thresholds] = await Promise.all([
          fetchAgriculturalSites(),
          fetchAlertThresholds()
        ]);
        
        setAgriculturalSites(sites);
        setAlertThresholds(thresholds);
        
        // تعيين الموقع الأول كموقع محدد افتراضياً
        if (sites.length > 0) {
          setSelectedSite(sites[0]);
        }
      } catch (error) {
        setError('فشل في تحميل البيانات الأولية: ' + error.message);
      }
    };
    
    loadInitialData();
  }, [fetchAgriculturalSites, fetchAlertThresholds]);
  
  // تأثير لتحديث البيانات عند تغيير المواقع الزراعية
  useEffect(() => {
    if (agriculturalSites.length > 0 && initialLoadRef.current) {
      refreshAllData();
      initialLoadRef.current = false;
    }
  }, [agriculturalSites, refreshAllData]);
  
  // تأثير لإعداد التحديث الدوري
  useEffect(() => {
    // إلغاء أي مؤقت سابق
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }
    
    // إعداد مؤقت جديد
    refreshTimerRef.current = setInterval(() => {
      refreshAllData();
    }, refreshInterval);
    
    // تنظيف المؤقت عند إزالة المكون
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [refreshInterval, refreshAllData]);
  
  // دالة تغيير الموقع المحدد
  const handleSiteChange = (site) => {
    setSelectedSite(site);
  };
  
  // دالة تحديث البيانات يدوياً
  const handleRefresh = () => {
    refreshAllData();
  };
  
  // تحديد بيانات الموقع المحدد
  const selectedSiteData = selectedSite ? satelliteData[selectedSite.id] : null;
  
  // تنسيق القيمة مع حالة البيانات
  const formatValue = (value, status, error, unit = '') => {
    if (status === 'success' && value !== null) {
      return `${typeof value === 'number' ? value.toFixed(2) : value}${unit}`;
    } else {
      return <ErrorText>{error || 'غير متوفر'}</ErrorText>;
    }
  };
  
  // تحديد لون مؤشر NDVI
  const getNDVIColor = (ndvi) => {
    if (ndvi === null) return '#ccc';
    if (ndvi < 0.2) return '#d9534f'; // أحمر - صحة نباتية منخفضة جداً
    if (ndvi < 0.4) return '#f0ad4e'; // برتقالي - صحة نباتية منخفضة
    if (ndvi < 0.6) return '#5bc0de'; // أزرق فاتح - صحة نباتية متوسطة
    if (ndvi < 0.8) return '#5cb85c'; // أخضر - صحة نباتية جيدة
    return '#3c763d'; // أخضر داكن - صحة نباتية ممتازة
  };
  
  // تحديد حالة مؤشر NDVI
  const getNDVIStatus = (ndvi) => {
    if (ndvi === null) return 'غير متوفر';
    if (ndvi < 0.2) return 'منخفض جداً';
    if (ndvi < 0.4) return 'منخفض';
    if (ndvi < 0.6) return 'متوسط';
    if (ndvi < 0.8) return 'جيد';
    return 'ممتاز';
  };
  
  return (
    <Container>
      <Header>
        <Title>مراقبة المواقع الزراعية بالأقمار الصناعية</Title>
        <RefreshButton onClick={handleRefresh} disabled={loading}>
          <RefreshCw size={16} />
          {loading ? 'جاري التحديث...' : 'تحديث البيانات'}
        </RefreshButton>
      </Header>
      
      {error && (
        <ErrorBanner>
          <AlertTriangle size={20} />
          {error}
        </ErrorBanner>
      )}
      
      <Content>
        <SidePanel>
          <SectionTitle>المواقع الزراعية</SectionTitle>
          <SitesList>
            {agriculturalSites.map(site => (
              <SiteItem 
                key={site.id} 
                selected={selectedSite && selectedSite.id === site.id}
                onClick={() => handleSiteChange(site)}
              >
                <SiteName>{site.name}</SiteName>
                <SiteLocation>{site.lat.toFixed(4)}, {site.lng.toFixed(4)}</SiteLocation>
                {satelliteData[site.id] && (
                  <SiteNDVI color={getNDVIColor(satelliteData[site.id].ndvi)}>
                    NDVI: {satelliteData[site.id].ndvi !== null 
                      ? satelliteData[site.id].ndvi.toFixed(2) 
                      : 'غير متوفر'}
                  </SiteNDVI>
                )}
              </SiteItem>
            ))}
          </SitesList>
          
          <SectionTitle>التنبيهات النشطة</SectionTitle>
          <AlertsList>
            {alerts.length > 0 ? (
              alerts.map(alert => (
                <AlertItem key={alert.id} severity={alert.severity}>
                  <AlertTriangle size={16} />
                  <AlertText>{alert.message}</AlertText>
                  <AlertTime>{new Date(alert.timestamp).toLocaleTimeString('ar-SA')}</AlertTime>
                </AlertItem>
              ))
            ) : (
              <NoAlerts>لا توجد تنبيهات نشطة</NoAlerts>
            )}
          </AlertsList>
        </SidePanel>
        
        <MainPanel>
          {loading && !selectedSiteData ? (
            <LoadingIndicator>
              <Spinner />
              جاري تحميل بيانات الأقمار الصناعية...
            </LoadingIndicator>
          ) : selectedSite && selectedSiteData ? (
            <>
              <SiteHeader>
                <SiteTitle>{selectedSite.name}</SiteTitle>
                <SiteDetails>
                  <SiteDetail>
                    <Map size={16} />
                    الموقع: {selectedSite.lat.toFixed(4)}, {selectedSite.lng.toFixed(4)}
                  </SiteDetail>
                  <SiteDetail>
                    <BarChart2 size={16} />
                    المساحة: {selectedSite.area}
                  </SiteDetail>
                </SiteDetails>
                <SiteDescription>{selectedSite.description}</SiteDescription>
              </SiteHeader>
              
              <DataGrid>
                <DataCard>
                  <DataCardHeader>
                    <DataCardTitle>مؤشر NDVI</DataCardTitle>
                    <DataCardIcon color={getNDVIColor(selectedSiteData.ndvi)}>
                      <Sun size={24} />
                    </DataCardIcon>
                  </DataCardHeader>
                  <DataCardValue>
                    {formatValue(selectedSiteData.ndvi, selectedSiteData.ndvi_status, selectedSiteData.ndvi_error)}
                  </DataCardValue>
                  <DataCardStatus>
                    الحالة: {selectedSiteData.ndvi !== null ? getNDVIStatus(selectedSiteData.ndvi) : 'غير متوفرة'}
                  </DataCardStatus>
                  <DataCardDescription>
                    مؤشر الاختلاف النباتي الطبيعي - يقيس صحة النباتات
                  </DataCardDescription>
                </DataCard>
                
                <DataCard>
                  <DataCardHeader>
                    <DataCardTitle>الغطاء السحابي</DataCardTitle>
                    <DataCardIcon>
                      <Cloud size={24} />
                    </DataCardIcon>
                  </DataCardHeader>
                  <DataCardValue>
                    {formatValue(
                      selectedSiteData.cloud_cover, 
                      selectedSiteData.cloud_cover_status, 
                      selectedSiteData.cloud_cover_error,
                      '%'
                    )}
                  </DataCardValue>
                  <DataCardStatus>
                    {selectedSiteData.cloud_cover !== null && (
                      selectedSiteData.cloud_cover > 50 
                        ? 'غطاء سحابي كثيف' 
                        : selectedSiteData.cloud_cover > 20 
                          ? 'غطاء سحابي متوسط' 
                          : 'غطاء سحابي منخفض'
                    )}
                  </DataCardStatus>
                  <DataCardDescription>
                    نسبة الغطاء السحابي فوق المنطقة
                  </DataCardDescription>
                </DataCard>
                
                <DataCard>
                  <DataCardHeader>
                    <DataCardTitle>درجة الحرارة</DataCardTitle>
                    <DataCardIcon>
                      <Thermometer size={24} />
                    </DataCardIcon>
                  </DataCardHeader>
                  <DataCardValue>
                    {formatValue(
                      selectedSiteData.temperature, 
                      selectedSiteData.temperature_status, 
                      selectedSiteData.temperature_error,
                      '°C'
                    )}
                  </DataCardValue>
                  <DataCardStatus>
                    {selectedSiteData.temperature !== null && (
                      selectedSiteData.temperature > 35 
                        ? 'مرتفعة' 
                        : selectedSiteData.temperature > 25 
                          ? 'معتدلة' 
                          : 'منخفضة'
                    )}
                  </DataCardStatus>
                  <DataCardDescription>
                    متوسط درجة الحرارة السطحية
                  </DataCardDescription>
                </DataCard>
                
                <DataCard>
                  <DataCardHeader>
                    <DataCardTitle>رطوبة التربة</DataCardTitle>
                    <DataCardIcon>
                      <Droplet size={24} />
                    </DataCardIcon>
                  </DataCardHeader>
                  <DataCardValue>
                    {formatValue(
                      selectedSiteData.soil_moisture, 
                      selectedSiteData.soil_moisture_status, 
                      selectedSiteData.soil_moisture_error,
                      '%'
                    )}
                  </DataCardValue>
                  <DataCardStatus>
                    {selectedSiteData.soil_moisture !== null && (
                      selectedSiteData.soil_moisture > 60 
                        ? 'رطوبة عالية' 
                        : selectedSiteData.soil_moisture > 30 
                          ? 'رطوبة متوسطة' 
                          : 'رطوبة منخفضة'
                    )}
                  </DataCardStatus>
                  <DataCardDescription>
                    نسبة رطوبة التربة في المنطقة
                  </DataCardDescription>
                </DataCard>
                
                <DataCard>
                  <DataCardHeader>
                    <DataCardTitle>استهلاك المياه</DataCardTitle>
                    <DataCardIcon>
                      <Droplet size={24} />
                    </DataCardIcon>
                  </DataCardHeader>
                  <DataCardValue>
                    {formatValue(
                      selectedSiteData.water_usage, 
                      selectedSiteData.water_usage_status, 
                      selectedSiteData.water_usage_error,
                      '%'
                    )}
                  </DataCardValue>
                  <DataCardStatus>
                    {selectedSiteData.water_usage !== null && (
                      selectedSiteData.water_usage > alertThresholds.water_usage_high 
                        ? 'استهلاك مرتفع' 
                        : selectedSiteData.water_usage > 50 
                          ? 'استهلاك متوسط' 
                          : 'استهلاك منخفض'
                    )}
                  </DataCardStatus>
                  <DataCardDescription>
                    نسبة استهلاك المياه مقارنة بالمعدل الطبيعي
                  </DataCardDescription>
                </DataCard>
              </DataGrid>
              
              <LastUpdated>
                آخر تحديث: {selectedSiteData.timestamp 
                  ? new Date(selectedSiteData.timestamp).toLocaleString('ar-SA') 
                  : 'غير متوفر'}
              </LastUpdated>
            </>
          ) : (
            <NoDataMessage>
              الرجاء اختيار موقع من القائمة لعرض بياناته
            </NoDataMessage>
          )}
        </MainPanel>
      </Content>
    </Container>
  );
};

// تعريف الأنماط المستخدمة في المكون
const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  font-family: 'Cairo', 'Tajawal', sans-serif;
  direction: rtl;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: #0c6b58;
  color: white;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px 24px;
  border-radius: 4px;
  margin: 16px 24px 0;
`;

const Content = styled.div`
  display: flex;
  height: 600px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
  }
`;

const SidePanel = styled.div`
  width: 300px;
  background-color: #fff;
  border-left: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    width: 100%;
    border-left: none;
    border-bottom: 1px solid #e9ecef;
  }
`;

const MainPanel = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: #f8f9fa;
`;

const SectionTitle = styled.h3`
  margin: 16px 16px 8px;
  font-size: 1rem;
  color: #495057;
  font-weight: 600;
`;

const SitesList = styled.div`
  overflow-y: auto;
  padding: 0 16px 16px;
`;

const SiteItem = styled.div`
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  background-color: ${props => props.selected ? '#e8f5e9' : '#f8f9fa'};
  border: 1px solid ${props => props.selected ? '#c8e6c9' : '#e9ecef'};
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.selected ? '#e8f5e9' : '#f1f3f5'};
  }
`;

const SiteName = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
  color: #212529;
  margin-bottom: 4px;
`;

const SiteLocation = styled.div`
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 8px;
`;

const SiteNDVI = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${props => props.color || '#212529'};
  background-color: rgba(0, 0, 0, 0.05);
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
`;

const AlertsList = styled.div`
  overflow-y: auto;
  padding: 0 16px 16px;
  flex: 1;
`;

const AlertItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  background-color: ${props => 
    props.severity === 'high' ? '#fff3cd' : 
    props.severity === 'medium' ? '#d1ecf1' : '#f8f9fa'};
  border: 1px solid ${props => 
    props.severity === 'high' ? '#ffeeba' : 
    props.severity === 'medium' ? '#bee5eb' : '#e9ecef'};
`;

const AlertText = styled.div`
  font-size: 0.85rem;
  color: #212529;
  flex: 1;
`;

const AlertTime = styled.div`
  font-size: 0.75rem;
  color: #6c757d;
`;

const NoAlerts = styled.div`
  text-align: center;
  padding: 24px 0;
  color: #6c757d;
  font-size: 0.9rem;
`;

const SiteHeader = styled.div`
  margin-bottom: 24px;
`;

const SiteTitle = styled.h2`
  margin: 0 0 12px;
  font-size: 1.5rem;
  color: #212529;
`;

const SiteDetails = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
`;

const SiteDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: #495057;
`;

const SiteDescription = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: #6c757d;
`;

const DataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const DataCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const DataCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const DataCardTitle = styled.h4`
  margin: 0;
  font-size: 1rem;
  color: #495057;
`;

const DataCardIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.color ? props.color : '#e9ecef'};
  color: ${props => props.color ? 'white' : '#495057'};
`;

const DataCardValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #212529;
  margin-bottom: 8px;
`;

const DataCardStatus = styled.div`
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 12px;
`;

const DataCardDescription = styled.div`
  font-size: 0.85rem;
  color: #adb5bd;
`;

const LastUpdated = styled.div`
  text-align: left;
  font-size: 0.85rem;
  color: #6c757d;
`;

const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
  font-size: 1rem;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #0c6b58;
  animation: ${spin} 1s linear infinite;
  margin-left: 12px;
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
  font-size: 1rem;
`;

const ErrorText = styled.span`
  color: #dc3545;
  font-size: 0.9rem;
  font-style: italic;
`;

export default OfficialSatelliteMonitor;
