// GramSathi Centralized i18n Translation Engine
// 100% Global Language Switching across English, Hindi, Punjabi, Tamil, and Telugu

window.GramI18n = (function() {
  const dictionaries = {
    en: {
      brand: {
        name: "GramSathi",
        tagline: "Village Digital Command Center"
      },
      nav: {
        dashboard: "Dashboard",
        cosmos: "COSMOS",
        water: "Water",
        livestock: "Livestock",
        dairy: "Dairy & Milk",
        energy: "Energy",
        agriculture: "Agriculture",
        weather: "Weather",
        mandi: "Mandi Rates",
        schemes: "Govt Schemes",
        alerts: "Alerts",
        assistant: "GramSathi Assistant",
        settings: "Settings",
        export: "Export & Reports",
        about: "System / About"
      },
      header: {
        title: "GramSathi Rural Operating Platform",
        subtitle: "COSMOS Display, Microgrid Telemetry, Cattle Hub & Mandi Intelligence"
      },
      topbar: {
        mode: "Demo mode",
        alerts: "Alerts",
        reset_demo: "Reset Demo",
        hub_online: "Online Hub",
        hub_offline: "Offline Hub",
        synced: "Synced"
      },
      common: {
        normal: "Normal",
        warning: "Warning",
        critical: "Critical",
        healthy: "Healthy",
        watch: "Watch",
        attention: "Attention Required",
        live_data: "LIVE DATA",
        official_source: "OFFICIAL SOURCE",
        cached_data: "CACHED DATA",
        local_data: "LOCAL DATA",
        user_entered: "USER ENTERED",
        simulated_sensor: "SIMULATED SENSOR",
        demo_data: "DEMO DATA",
        save: "Save",
        cancel: "Cancel",
        close: "Close",
        delete: "Delete",
        edit: "Edit",
        add: "Add",
        export_csv: "Export CSV",
        export_json: "Export JSON",
        refresh: "Refresh",
        confirm: "Confirm Reset",
        all: "All",
        search: "Search",
        apply: "Apply",
        view_details: "View Details",
        action: "Action"
      },
      dashboard: {
        hero_title: "Your village. One connected view.",
        hero_subtitle: "Central digital operating platform for solar microgrid, water telemetry, livestock health, dairy ledger, and verified market intelligence.",
        search_placeholder: "Ask or search anything about your village...",
        search_btn: "Ask GramSathi",
        quick_ops: "Quick Village Operations",
        check_water: "Check Water",
        pump_control: "Pump Control",
        check_livestock: "Check Livestock",
        energy_status: "Energy Status",
        village_alerts: "Village Alerts",
        cosmos_display: "COSMOS Display",
        ai_assistant: "AI Assistant",
        record_milk: "Record Milk Log",
        refresh_all: "Refresh All Data",
        brief_title: "Today's Village Brief — Real-Time Systems Status",
        water_tank: "Water Tank",
        solar_microgrid: "Solar Microgrid",
        livestock_telemetry: "Livestock Telemetry",
        milk_collected: "Today's Milk Collected",
        weather: "Weather",
        incidents: "Incidents"
      },
      cosmos: {
        title: "COSMOS",
        tagline: "Universe in One Place • Powered by GramSathi",
        badge: "DIGITAL SIMULATION & LIVE TELEMETRY",
        village_status: "VILLAGE STATUS",
        pause_auto: "Pause Auto",
        resume_auto: "Resume Auto",
        fullscreen: "Fullscreen",
        village_map: "Digital Village Infrastructure Map",
        brief_title: "TODAY'S VILLAGE BRIEF",
        ask_voice: "Ask by Voice",
        ai_assistant: "AI Assistant"
      },
      water: {
        title: "Water Telemetry & Pump Automation",
        subtitle: "Real-time monitoring of community overhead tank, solar pump automation, and potable drinking water standards.",
        tank_level: "Tank Level",
        ph_level: "Water pH Level",
        turbidity: "Turbidity (NTU)",
        pump_status: "Pump Status",
        start_pump: "Start Solar Pump",
        stop_pump: "Stop Solar Pump"
      },
      energy: {
        title: "Solar Microgrid & Energy Control Panel",
        subtitle: "Real-time PV generation, LiFePO4 battery SoC, inverter telemetry, and village load balancing.",
        solar_gen: "Solar PV Output",
        battery_soc: "Battery SoC",
        village_load: "Village Essential Load",
        inverter_eff: "Inverter Efficiency"
      },
      livestock: {
        title: "Smart Livestock Hub & Health Telemetry",
        subtitle: "RFID identification, health collar telemetry (temp, heart rate, rumination), lactation cycles, and geofence tracking.",
        register_cattle: "Register Cattle Tag",
        view_profile: "View Full Profile",
        mark_health: "Mark Health Check",
        body_temp: "BODY TEMP",
        heart_rate: "HEART RATE",
        rumination: "RUMINATION",
        geofence: "Geofence"
      },
      dairy: {
        title: "Dairy Operations & Milk Records",
        subtitle: "Morning and evening collections, Fat/SNF tracking, yield totals, revenue estimator, and CSV records export.",
        today_yield: "Today's Total Yield",
        weekly_yield: "7-Day Cumulative",
        monthly_yield: "30-Day Cumulative",
        rate_estimator: "Rate Estimator (₹/L)",
        record_entry: "Record Milk Entry"
      },
      agri: {
        title: "Smart Agriculture & Hybrid Crop Advisor",
        subtitle: "Scientific crop knowledge search, multi-factor suitability evaluation, and personalized farm advisory.",
        search_placeholder: "Search crop knowledge base (e.g. Wheat, Mustard, Paddy)...",
        evaluate_btn: "Evaluate Farm Crop Suitability"
      },
      weather: {
        title: "Village Micro-Climate Weather Telemetry",
        subtitle: "Hyperlocal weather telemetry, live satellite meteorological feed, solar irradiance, and 7-day outlook.",
        use_gps: "Use My Live Location"
      },
      mandi: {
        title: "Agricultural Mandi Market Rates",
        subtitle: "Verified Agmarknet / e-NAM commodity market rates, modal prices, and authentic 7-day price trends.",
        search_placeholder: "Search commodity (e.g. Wheat, Mustard, Cotton)...",
        explain_ai: "Explain Market Data with AI"
      },
      schemes: {
        title: "Government Welfare & Agriculture Schemes",
        subtitle: "Direct benefit transfer (DBT) programs, subsidy guidelines, and official application portals.",
        wizard_btn: "Check Scheme Eligibility Wizard",
        search_placeholder: "Search schemes (e.g. Kisan, Dairy, Credit, Housing, Women)..."
      },
      alerts: {
        title: "Village Alert & Cellular SMS Center",
        subtitle: "IoT incident triggers, threshold alerts, and mobile cellular SMS broadcast audit log.",
        dispatch_sms: "Dispatch Simulated SMS"
      },
      assistant: {
        title: "GramSathi AI Village Assistant",
        subtitle: "Directly answers queries using live telemetry from solar, water tank, cattle health, dairy yield, and mandi rates.",
        search_placeholder: "Ask anything about your village (solar, water, livestock, crop, schemes)...",
        send: "Send",
        clear_chat: "Clear Chat",
        read_aloud: "Read Aloud",
        listening: "Listening... Speak now",
        ready: "Ready"
      },
      settings: {
        title: "Hub Settings & Product Configuration",
        subtitle: "Configure village hub identity, language, theme, simulation speed, and persistent backups.",
        general: "General Settings",
        data: "Data & Simulation",
        ai: "AI & Voice Provider",
        display: "Display & COSMOS Mode",
        system: "System & Diagnostics",
        danger: "Danger Zone",
        reset_demo: "Global Reset Demo State"
      },
      export: {
        title: "Export & Village Reporting Hub",
        subtitle: "Download official CSV/JSON data logs and comprehensive human-readable village status reports.",
        milk_csv: "Milk Ledger (CSV)",
        milk_json: "Milk Ledger (JSON)",
        livestock_csv: "Livestock Census (CSV)",
        livestock_json: "Livestock Census (JSON)",
        water_csv: "Water Telemetry (CSV)",
        water_json: "Water Telemetry (JSON)",
        energy_csv: "Solar Microgrid (CSV)",
        energy_json: "Solar Microgrid (JSON)",
        alerts_csv: "System Alerts (CSV)",
        village_report_md: "Comprehensive Village Report (Markdown)",
        village_report_json: "Complete Village Report (JSON)"
      }
    },
    hi: {
      brand: {
        name: "ग्रामसाथी",
        tagline: "ग्रामीण डिजिटल कमांड सेंटर"
      },
      nav: {
        dashboard: "डैशबोर्ड",
        cosmos: "कॉसमॉस (COSMOS)",
        water: "जल प्रणाली",
        livestock: "पशुधन हब",
        dairy: "डेयरी व दुग्ध",
        energy: "सौर ऊर्जा",
        agriculture: "कृषि सलाहकार",
        weather: "मौसम केंद्र",
        mandi: "मंडी भाव",
        schemes: "सरकारी योजनाएं",
        alerts: "अलर्ट व संदेश",
        assistant: "ग्रामसाथी सहायक",
        settings: "सेटिंग्स",
        export: "निर्यात व रिपोर्ट",
        about: "सिस्टम विवरण"
      },
      header: {
        title: "ग्रामसाथी ग्रामीण ऑपरेटिंग प्लेटफॉर्म",
        subtitle: "कॉसमॉस डिस्प्ले, सौर टेलीमेट्री, पशुधन हब व मंडी सूचना केंद्र"
      },
      topbar: {
        mode: "डेमो मोड",
        alerts: "अलर्ट",
        reset_demo: "रीसेट डेमो",
        hub_online: "हब ऑनलाइन",
        hub_offline: "हब ऑफलाइन",
        synced: "सिंक हुआ"
      },
      common: {
        normal: "सामान्य",
        warning: "चेतावनी",
        critical: "गंभीर",
        healthy: "स्वस्थ",
        watch: "निगरानी",
        attention: "ध्यान दें",
        live_data: "लाइव डेटा",
        official_source: "आधिकारिक स्रोत",
        cached_data: "सत्यापित डेटा",
        local_data: "स्थानीय डेटा",
        user_entered: "उपयोगकर्ता दर्ज",
        simulated_sensor: "सिम्युलेटेड सेंसर",
        demo_data: "डेमो डेटा",
        save: "सहेजें",
        cancel: "रद्द करें",
        close: "बंद करें",
        delete: "हटाएं",
        edit: "संपादित करें",
        add: "जोड़ें",
        export_csv: "सीएसवी निर्यात",
        export_json: "जेसन निर्यात",
        refresh: "ताज़ा करें",
        confirm: "रीसेट की पुष्टि करें",
        all: "सभी",
        search: "खोजें",
        apply: "आवेदन करें",
        view_details: "विवरण देखें",
        action: "कार्यवाही"
      },
      dashboard: {
        hero_title: "आपका गांव। एक संपूर्ण डिजिटल दृश्य।",
        hero_subtitle: "सौर माइक्रोग्रिड, पेयजल टैंक, पशु स्वास्थ्य, दुग्ध बहीखाता और सत्यापित मंडी भावों के लिए केंद्रीय ग्रामीण डिजिटल प्लेटफॉर्म।",
        search_placeholder: "अपने गांव के बारे में कुछ भी पूछें या खोजें...",
        search_btn: "ग्रामसाथी से पूछें",
        quick_ops: "त्वरित ग्रामीण कार्य",
        check_water: "पानी जांचें",
        pump_control: "पंप नियंत्रण",
        check_livestock: "पशुधन देखें",
        energy_status: "ऊर्जा स्थिति",
        village_alerts: "गांव के अलर्ट",
        cosmos_display: "कॉसमॉस डिस्प्ले",
        ai_assistant: "एआई सहायक",
        record_milk: "दूध दर्ज करें",
        refresh_all: "सभी डेटा ताज़ा करें",
        brief_title: "आज का ग्रामीण सारांश — रीयल-टाइम सिस्टम स्थिति",
        water_tank: "पानी का टैंक",
        solar_microgrid: "सौर माइक्रोग्रिड",
        livestock_telemetry: "पशुधन टेलीमेट्री",
        milk_collected: "आज का कुल दूध",
        weather: "मौसम",
        incidents: "सक्रिय घटनाएं"
      },
      cosmos: {
        title: "कॉसमॉस (COSMOS)",
        tagline: "एक ही स्थान पर संपूर्ण ग्रामीण ब्रह्मांड • ग्रामसाथी द्वारा संचालित",
        badge: "डिजिटल सिमुलेशन व लाइव टेलीमेट्री",
        village_status: "ग्रामीण स्थिति",
        pause_auto: "ऑटो रोकें",
        resume_auto: "ऑटो चलाएं",
        fullscreen: "फुलस्क्रीन",
        village_map: "डिजिटल ग्रामीण बुनियादी ढांचा मानचित्र",
        brief_title: "आज का ग्रामीण संक्षिप्त सारांश",
        ask_voice: "आवाज़ से पूछें",
        ai_assistant: "एआई सहायक"
      },
      water: {
        title: "जल टेलीमेट्री व पंप स्वचालन",
        subtitle: "सामुदायिक ओवरहेड टैंक, सौर पंप स्वचालन और पेयजल मानकों की निरंतर निगरानी।",
        tank_level: "टैंक स्तर",
        ph_level: "जल pH स्तर",
        turbidity: "टर्बिडिटी (NTU)",
        pump_status: "पंप स्थिति",
        start_pump: "सौर पंप चालू करें",
        stop_pump: "सौर पंप बंद करें"
      },
      energy: {
        title: "सौर माइक्रोग्रिड व ऊर्जा नियंत्रण",
        subtitle: "रीयल-टाइम सोलर पीवी उत्पादन, LiFePO4 बैटरी चार्ज, इन्वर्टर टेलीमेट्री और लोड संतुलन।",
        solar_gen: "सौर उत्पादन",
        battery_soc: "बैटरी चार्ज",
        village_load: "गांव का आवश्यक लोड",
        inverter_eff: "इन्वर्टर दक्षता"
      },
      livestock: {
        title: "स्मार्ट पशुधन हब व स्वास्थ्य टेलीमेट्री",
        subtitle: "आरएफआईडी पहचान, स्वास्थ्य कॉलर टेलीमेट्री (तापमान, हृदय गति, जुगाली), दुग्ध चक्र व जियोफेंस ट्रैकिंग।",
        register_cattle: "नया मवेशी जोड़ें",
        view_profile: "प्रोफ़ाइल देखें",
        mark_health: "स्वास्थ्य जांच दर्ज करें",
        body_temp: "शारीरिक तापमान",
        heart_rate: "हृदय गति",
        rumination: "जुगाली समय",
        geofence: "जियोफेंस चारागाह"
      },
      dairy: {
        title: "डेयरी संचालन व दुग्ध बहीखाता",
        subtitle: "सुबह-शाम दूध संग्रह, फैट/एसएनएफ ट्रैकिंग, उत्पादन योग, आय अनुमानक और सीएसवी रिकॉर्ड निर्यात।",
        today_yield: "आज का कुल दूध",
        weekly_yield: "7-दिवसीय कुल दूध",
        monthly_yield: "30-दिवसीय कुल दूध",
        rate_estimator: "दूध दर अनुमानक (₹/लीटर)",
        record_entry: "दूध रिकॉर्ड दर्ज करें"
      },
      agri: {
        title: "स्मार्ट कृषि व हाइब्रिड फसल सलाहकार",
        subtitle: "वैज्ञानिक फसल ज्ञान खोज, बहु-कारक उपयुक्तता मूल्यांकन और व्यक्तिगत कृषि सलाह।",
        search_placeholder: "फसल खोजें (जैसे गेहूं, सरसों, धान, चना, कपास)...",
        evaluate_btn: "खेत की फसल उपयुक्तता जांचें"
      },
      weather: {
        title: "ग्रामीण माइक्रो-क्लाइमेट मौसम टेलीमेट्री",
        subtitle: "स्थानीय मौसम टेलीमेट्री, लाइव उपग्रह मौसम डेटा, सौर विकिरण और 7-दिवसीय पूर्वानुमान।",
        use_gps: "मेरा लाइव स्थान उपयोग करें"
      },
      mandi: {
        title: "कृषि मंडी बाजार भाव",
        subtitle: "सत्यापित एगमार्कनेट / ई-नाम जिंस बाजार दरें, मॉडल भाव और 7-दिवसीय मूल्य रुझान।",
        search_placeholder: "फसल खोजें (जैसे गेहूं, सरसों, कपास, चना)...",
        explain_ai: "एआई से बाजार भाव समझें"
      },
      schemes: {
        title: "सरकारी कल्याणकारी व कृषि योजनाएं",
        subtitle: "प्रत्यक्ष लाभ अंतरण (DBT) कार्यक्रम, सब्सिडी दिशानिर्देश और आधिकारिक आवेदन पोर्टल।",
        wizard_btn: "योजना पात्रता खोजक",
        search_placeholder: "योजना खोजें (जैसे पीएम-किसान, डेयरी, ऋण, आवास, महिला)..."
      },
      alerts: {
        title: "ग्रामीण अलर्ट व सेलुलर एसएमएस केंद्र",
        subtitle: "आईओटी घटना ट्रिगर, थ्रेशोल्ड अलर्ट और मोबाइल सेलुलर एसएमएस प्रसारण ऑडिट लॉग।",
        dispatch_sms: "सिम्युलेटेड एसएमएस भेजें"
      },
      assistant: {
        title: "ग्रामसाथी एआई ग्रामीण सहायक",
        subtitle: "सौर ऊर्जा, पेयजल टैंक, मवेशी स्वास्थ्य, दूध उत्पादन और मंडी भाव के लाइव डेटा पर आधारित उत्तर।",
        search_placeholder: "अपने गांव के बारे में कुछ भी पूछें (सौर, पानी, मवेशी, फसल, योजनाएं)...",
        send: "पूछें",
        clear_chat: "चैट साफ़ करें",
        read_aloud: "बोलकर सुनाएं",
        listening: "सुन रहा हूँ... बोलिए",
        ready: "तैयार"
      },
      settings: {
        title: "हब सेटिंग्स व उत्पाद कॉन्फ़िगरेशन",
        subtitle: "गांव की पहचान, भाषा, थीम, सिमुलेशन गति और डेटा बैकअप कॉन्फ़िगर करें।",
        general: "सामान्य सेटिंग्स",
        data: "डेटा व सिमुलेशन",
        ai: "एआई व आवाज़ प्रदाता",
        display: "डिस्प्ले व कॉसमॉस मोड",
        system: "सिस्टम व डायग्नोस्टिक्स",
        danger: "डेंजर ज़ोन",
        reset_demo: "डेमो डेटा रीसेट करें"
      },
      export: {
        title: "डेटा निर्यात व ग्रामीण रिपोर्ट हब",
        subtitle: "आधिकारिक सीएसवी/जेसन डेटा लॉग और संपूर्ण पठनीय ग्रामीण स्थिति रिपोर्ट डाउनलोड करें।",
        milk_csv: "दूध बहीखाता (CSV)",
        milk_json: "दूध बहीखाता (JSON)",
        livestock_csv: "पशुधन जनगणना (CSV)",
        livestock_json: "पशुधन जनगणना (JSON)",
        water_csv: "जल टेलीमेट्री (CSV)",
        water_json: "जल टेलीमेट्री (JSON)",
        energy_csv: "सौर माइक्रोग्रिड (CSV)",
        energy_json: "सौर माइक्रोग्रिड (JSON)",
        alerts_csv: "सिस्टम अलर्ट (CSV)",
        village_report_md: "संपूर्ण ग्रामीण रिपोर्ट (Markdown)",
        village_report_json: "संपूर्ण ग्रामीण रिपोर्ट (JSON)"
      }
    },
    pa: {
      brand: { name: "ਗ੍ਰਾਮਸਾਥੀ", tagline: "ਪੇਂਡੂ ਡਿਜੀਟਲ ਕਮਾਂਡ ਸੈਂਟਰ" },
      nav: { dashboard: "ਡੈਸ਼ਬੋਰਡ", cosmos: "ਕਾਸਮਾਸ", water: "ਪਾਣੀ ਪ੍ਰਬੰਧਨ", livestock: "ਪਸ਼ੂ ਧਨ", dairy: "ਡੇਅਰੀ", energy: "ਸੌਰ ਊਰਜਾ", agriculture: "ਖੇਤੀਬਾੜੀ", weather: "ਮੌਸਮ", mandi: "ਮੰਡੀ ਭਾਅ", schemes: "ਸਰਕਾਰੀ ਸਕੀਮਾਂ", alerts: "ਚੇਤਾਵਨੀਆਂ", assistant: "ਗ੍ਰਾਮਸਾਥੀ ਸਹਾਇਕ", settings: "ਸੈਟਿੰਗਾਂ", export: "ਐਕਸਪੋਰਟ", about: "ਜਾਣਕਾਰੀ" },
      header: { title: "ਗ੍ਰਾਮਸਾਥੀ ਪੇਂਡੂ ਓਪਰੇਟਿੰਗ ਪਲੇਟਫਾਰਮ", subtitle: "ਸੂਰਜੀ ਊਰਜਾ, ਪਾਣੀ, ਪਸ਼ੂ ਧਨ ਅਤੇ ਮੰਡੀ ਜਾਣਕਾਰੀ ਕੇਂਦਰ" },
      topbar: { mode: "ਡੈਮੋ ਮੋਡ", alerts: "ਚੇਤਾਵਨੀਆਂ", reset_demo: "ਰੀਸੈਟ", hub_online: "ਹੱਬ ਆਨਲਾਈਨ", hub_offline: "ਹੱਬ ਆਫਲਾਈਨ", synced: "ਸਿੰਕ ਹੋਇਆ" },
      common: { normal: "ਆਮ", warning: "ਚੇਤਾਵਨੀ", critical: "ਗੰਭੀਰ", healthy: "ਤੰਦਰੁਸਤ", watch: "ਨਿਗਰਾਨੀ", attention: "ਧਿਆਨ ਦਿਓ", live_data: "ਲਾਈਵ ਡਾਟਾ", official_source: "ਸਰਕਾਰੀ ਸਰੋਤ", cached_data: "ਕੈਸ਼ ਡਾਟਾ", local_data: "ਸਥਾਨਕ ਡਾਟਾ", user_entered: "ਦਰਜ ਕੀਤਾ", simulated_sensor: "ਸੈਂਸਰ", demo_data: "ਡੈਮੋ", save: "ਸੰਭਾਲੋ", cancel: "ਰੱਦ ਕਰੋ", close: "ਬੰਦ ਕਰੋ", delete: "ਮਿਟਾਓ", edit: "ਸੋਧੋ", add: "ਜੋੜੋ", export_csv: "CSV", export_json: "JSON", refresh: "ਤਾਜ਼ਾ ਕਰੋ", confirm: "ਪੁਸ਼ਟੀ", all: "ਸਾਰੇ", search: "ਖੋਜੋ", apply: "ਅਰਜ਼ੀ ਦਿਓ", view_details: "ਵੇਰਵਾ", action: "ਕਾਰਵਾਈ" }
    },
    ta: {
      brand: { name: "கிராமசதி", tagline: "கிராம டிஜிட்டல் கட்டுப்பாட்டு மையம்" },
      nav: { dashboard: "முகப்பு", cosmos: "காஸ்மாஸ்", water: "நீர்", livestock: "கால்நடை", dairy: "பால் பண்ணை", energy: "சூரிய சக்தி", agriculture: "விவசாயம்", weather: "வானிலை", mandi: "சந்தை விலை", schemes: "அரசு திட்டங்கள்", alerts: "எச்சரிக்கைகள்", assistant: "கிராமசதி AI", settings: "அமைப்புகள்", export: "ஏற்றுமதி", about: "பற்றி" },
      header: { title: "கிராமசதி கிராம டிஜிட்டல் தளம்", subtitle: "சூரிய சக்தி, நீர் மேலாண்மை, கால்நடை மற்றும் சந்தை நுண்ணறிவு" },
      topbar: { mode: "மாதிரி", alerts: "எச்சரிக்கைகள்", reset_demo: "மீட்டமை", hub_online: "ஆன்லைன்", hub_offline: "ஆஃப்லைன்", synced: "இணைக்கப்பட்டது" },
      common: { normal: "இயல்பு", warning: "எச்சரிக்கை", critical: "முக்கியம்", healthy: "ஆரோக்கியம்", watch: "கண்காணிப்பு", attention: "கவனம்", live_data: "நேரலை", official_source: "அதிகாரப்பூர்வ", cached_data: "சேமிக்கப்பட்ட", local_data: "உள்ளூர்", user_entered: "உள்ளீடு", simulated_sensor: "சென்சார்", demo_data: "மாதிரி", save: "சேமி", cancel: "ரத்து", close: "மூடு", delete: "நீக்கு", edit: "திருத்து", add: "சேர்", export_csv: "CSV", export_json: "JSON", refresh: "புதுப்பி", confirm: "உறுதி", all: "அனைத்தும்", search: "தேடு", apply: "விண்ணப்பி", view_details: "விவரம்", action: "செயல்" }
    },
    te: {
      brand: { name: "గ్రామసాథి", tagline: "గ్రామీణ డిజిటల్ కమాండ్ సెంటర్" },
      nav: { dashboard: "డాష్‌బోర్డ్", cosmos: "కాస్మోస్", water: "నీరు", livestock: "పశుసంపద", dairy: "డైరీ", energy: "సౌర విద్యుత్", agriculture: "వ్యవసాయం", weather: "వాతావరణం", mandi: "మార్కెట్ ధరలు", schemes: "ప్రభుత్వ పథకాలు", alerts: "హెచ్చరికలు", assistant: "గ్రామసాథి AI", settings: "సెట్టింగ్‌లు", export: "ఎగుమతి", about: "గురించి" },
      header: { title: "గ్రామసాథి గ్రామీణ డిజిటల్ ప్లాట్‌ఫారమ్", subtitle: "సౌరశక్తి, నీరు, పశుసంపద మరియు మార్కెట్ సమాచార కేంద్రం" },
      topbar: { mode: "డెమో", alerts: "హెచ్చరికలు", reset_demo: "రీసెట్", hub_online: "ఆన్‌లైన్", hub_offline: "ఆఫ్‌లైన్", synced: "సింక్ అయింది" },
      common: { normal: "సాధారణం", warning: "హెచ్చరిక", critical: "కీలకం", healthy: "ఆరోగ్యకరం", watch: "పరిశీలన", attention: "శ్రద్ధ", live_data: "లైవ్ డేటా", official_source: "అధికారిక మూలం", cached_data: "కాష్ డేటా", local_data: "స్థానిక డేటా", user_entered: "నమోదు చేసిన", simulated_sensor: "సెన్సార్", demo_data: "డెమో", save: "సేవ్", cancel: "రద్దు", close: "మూసివేయి", delete: "తొలగించు", edit: "సవరించు", add: "జోడించు", export_csv: "CSV", export_json: "JSON", refresh: "రిఫ్రెష్", confirm: "ధృవీకరించు", all: "అన్నీ", search: "వెతకండి", apply: "దరఖాస్తు", view_details: "వివరాలు", action: "చర్య" }
    }
  };

  let currentLang = localStorage.getItem('gramsathi_lang') || 'en';

  function setLanguage(lang) {
    if (dictionaries[lang]) {
      currentLang = lang;
      localStorage.setItem('gramsathi_lang', lang);
      document.documentElement.lang = lang;
      updateDOM();
      if (window.GramApp && typeof window.GramApp.onLanguageChange === 'function') {
        window.GramApp.onLanguageChange(lang);
      }
    }
  }

  function getLanguage() {
    return currentLang;
  }

  function t(path, fallback = '') {
    const keys = path.split('.');
    let cur = dictionaries[currentLang];
    for (const k of keys) {
      if (cur && cur[k] !== undefined) {
        cur = cur[k];
      } else {
        // Fallback to English
        let fb = dictionaries['en'];
        for (const fbk of keys) {
          if (fb && fb[fbk] !== undefined) fb = fb[fbk];
          else return fallback || path;
        }
        return fb;
      }
    }
    return cur;
  }

  function updateDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key, el.textContent);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = t(key, el.placeholder);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.title = t(key, el.title);
    });
  }

  return {
    setLanguage,
    getLanguage,
    t,
    updateDOM,
    dictionaries
  };
})();

const t = window.GramI18n.t;
