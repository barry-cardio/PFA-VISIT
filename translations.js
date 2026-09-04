window.PFA_CONFIG = (() => {
  const option = (value, zh, en) => ({ value, zh, en });

  const products = [
    { id: "farawave", maker: "Boston Scientific", name: "FARAWAVE" },
    { id: "farawave_nav", maker: "Boston Scientific", name: "FARAWAVE NAV" },
    { id: "pulseselect", maker: "Medtronic", name: "PulseSelect" },
    { id: "sphere9", maker: "Medtronic", name: "Sphere-9" },
    { id: "sphere360", maker: "Medtronic", name: "Sphere-360" },
    { id: "varipulse", maker: "J&J Biosense Webster", name: "VARIPULSE" },
    { id: "volt", maker: "Abbott", name: "Volt" },
    { id: "pfa_other", maker: "Other", name: "Other / 其他" }
  ];

  const sections = [
    option("profile", "中心概况", "Center profile"),
    option("technology", "技术与设备", "Technology & devices"),
    option("anesthesia", "麻醉与支付", "Anesthesia & payment"),
    option("workflow", "工作流需求", "Workflow needs"),
    option("experience", "品牌体验", "Brand experience"),
    option("pricing", "竞争与价格", "Competition & pricing"),
    option("mapping", "三维与产品路径", "Mapping & product pathway"),
    option("action", "判断与下一步", "Assessment & actions")
  ];

  const lists = {
    yesNoUnknown: [option("yes", "是", "Yes"), option("no", "否", "No"), option("unknown", "不清楚", "Unknown")],
    dataQuality: [option("estimate", "估算", "Estimate"), option("exact", "系统数据", "System data"), option("unknown", "不清楚", "Unknown")],
    volumeBand: [option("lt100", "<100", "<100"), option("100_299", "100–299", "100–299"), option("300_499", "300–499", "300–499"), option("500_999", "500–999", "500–999"), option("gte1000", "≥1,000", "≥1,000")],
    pfaProducts: products.map((p) => option(p.id, `${p.maker} · ${p.name}`, `${p.maker} · ${p.name}`)),
    rfProducts: [
      option("rf_boston", "Boston · INTELLANAV/STABLEPOINT", "Boston · INTELLANAV/STABLEPOINT"),
      option("rf_medtronic", "Medtronic · DiamondTemp/其他", "Medtronic · DiamondTemp/Other"),
      option("rf_jnj", "J&J · THERMOCOOL/QDOT", "J&J · THERMOCOOL/QDOT"),
      option("rf_abbott", "Abbott · TactiCath/TactiFlex", "Abbott · TactiCath/TactiFlex"),
      option("rf_other", "其他", "Other"), option("rf_unknown", "不清楚", "Unknown")
    ],
    cryoProducts: [
      option("arctic_front", "Medtronic · Arctic Front系列", "Medtronic · Arctic Front family"),
      option("polarx", "Boston · POLARx/POLARx FIT", "Boston · POLARx/POLARx FIT"),
      option("cryo_other", "其他", "Other"), option("cryo_unknown", "不清楚", "Unknown")
    ],
    satisfaction: [
      option("delivery", "输送顺畅", "Easy delivery"), option("handling", "操控直观", "Intuitive handling"),
      option("stability", "稳定性好", "Good stability"), option("speed", "手术效率高", "Efficient procedure"),
      option("signals", "电信号清晰", "Clear signals"), option("contact", "接触判断好", "Good contact feedback"),
      option("mapping", "三维集成好", "Good mapping integration"), option("safety", "安全信心高", "High safety confidence"),
      option("support", "厂家支持好", "Strong vendor support"), option("other", "其他", "Other")
    ],
    dissatisfaction: [
      option("position", "肺静脉定位困难", "PV positioning"), option("stiff", "导管偏硬", "Catheter stiffness"),
      option("rotate", "旋转/换位次数多", "Too many rotations/repositions"), option("movement", "肌肉收缩/患者移动", "Muscle contraction/patient movement"),
      option("bubble", "气泡问题", "Bubbles"), option("hemolysis", "溶血/肾功能担忧", "Hemolysis/renal concern"),
      option("signals", "电信号不足", "Signal quality"), option("mapping", "三维依赖", "3D dependency"),
      option("cost", "成本高", "High cost"), option("sheath", "鞘管尺寸大", "Large sheath"),
      option("support", "跟台支持不足", "Insufficient case support"), option("other", "其他", "Other")
    ],
    csSupport: [option("every", "每台跟台", "Every case"), option("initial", "仅首批病例", "Initial cases"), option("request", "按需到场", "On request"), option("remote", "远程支持", "Remote"), option("none", "不跟台", "None"), option("unknown", "不清楚", "Unknown")],
    futureUse: [option("increase", "增加使用", "Increase"), option("same", "维持", "Maintain"), option("reduce", "减少", "Reduce"), option("stop", "停止", "Stop"), option("unknown", "未决定", "Undecided")],
    hybridReasons: [
      option("clinical", "患者临床条件", "Clinical eligibility"), option("overnight", "需要较长住院观察", "Longer observation needed"),
      option("anesthesia", "麻醉/恢复资源限制", "Anesthesia/recovery constraints"), option("coding", "编码或支付条件", "Coding/payment criteria"),
      option("workflow", "当天出院流程未建立", "No same-day pathway"), option("capacity", "医院运营安排", "Hospital operations"),
      option("unknown", "不清楚", "Unknown"), option("other", "其他", "Other")
    ],
    sedationValue: [
      option("anesthesia", "减少麻醉支持", "Reduce anesthesia support"), option("volume", "增加手术量", "Increase procedure volume"),
      option("wait", "缩短等待时间", "Shorten waiting time"), option("same_day", "支持当天出院", "Support same-day discharge"),
      option("cost", "降低成本", "Reduce cost"), option("experience", "改善患者体验", "Improve patient experience"),
      option("limited", "价值有限", "Limited value"), option("unknown", "暂不判断", "Not sure")
    ],
    unmetNeeds: [
      option("access", "简化左房入路", "Simpler LA access"), option("handling", "更稳定易控的导管", "More stable/intuitive catheter"),
      option("contact", "可靠接触反馈", "Reliable contact feedback"), option("mapping", "更好三维集成", "Better 3D integration"),
      option("signals", "更清晰的电信号", "Clearer electrograms"), option("coverage", "电场/损伤覆盖显示", "Field/lesion coverage"),
      option("validation", "即时隔离验证", "Immediate isolation validation"), option("sedation", "更适合清醒镇静", "Conscious-sedation compatibility"),
      option("safety", "减少气泡/溶血等风险", "Lower bubble/hemolysis risk"), option("cost", "降低总成本", "Lower total cost"), option("other", "其他", "Other")
    ],
    transseptalMethods: [
      option("mechanical", "机械穿刺针", "Mechanical needle"), option("rf_needle", "RF穿刺针", "RF needle"),
      option("rf_wire", "RF穿刺导丝", "RF transseptal wire"), option("integrated", "PFA治疗鞘一体化穿刺", "Integrated access with PFA therapy sheath"),
      option("standard_then_exchange", "普通穿刺鞘后换PFA鞘", "Standard transseptal sheath then PFA sheath exchange"), option("unknown", "不清楚", "Unknown")
    ],
    imagingGuidance: [option("fluoro", "X线", "Fluoroscopy"), option("tee", "TEE", "TEE"), option("ice", "ICE", "ICE"), option("mapping", "三维系统", "3D mapping"), option("other", "其他", "Other")],
    dicomFunctions: [
      option("demographics", "获取患者人口学/检查信息", "Retrieve demographics/exam data"),
      option("retrieve", "从PACS调取CT/MRI", "Retrieve CT/MRI from PACS"),
      option("segment", "自动分割左房和肺静脉", "Automatic LA/PV segmentation"),
      option("register", "DICOM影像配准", "DICOM registration"),
      option("send_image", "回传影像/三维图到PACS", "Send images/3D maps to PACS"),
      option("send_report", "回传报告到PACS/HIS", "Send report to PACS/HIS"),
      option("one_way", "只需单向读取", "Read-only integration"), option("two_way", "需要双向交互", "Bidirectional integration")
    ],
    mappingFeatures: [
      option("speed", "建图速度", "Mapping speed"), option("accuracy", "定位精度", "Localization accuracy"),
      option("contact", "接触判断", "Contact assessment"), option("field", "电场覆盖显示", "Electric-field visualization"),
      option("tags", "自动消融标记", "Automatic ablation tags"), option("validation", "隔离验证", "Isolation validation"),
      option("dicom", "DICOM自动分割/配准", "DICOM segmentation/registration"), option("low_fluoro", "低/零X线", "Low/zero fluoroscopy"),
      option("compatibility", "跨品牌兼容", "Cross-brand compatibility"), option("cost", "降低系统成本", "Lower system cost"),
      option("learning", "缩短学习曲线", "Shorter learning curve")
    ],
    priceBasis: [option("net", "医院净采购价", "Hospital net price"), option("list", "标价", "List price"), option("estimate", "估计/听说", "Estimate/hearsay"), option("unknown", "不清楚", "Unknown")],
    priceIncludes: [option("sheath", "专用鞘", "Dedicated sheath"), option("mapping", "三维费用", "3D mapping"), option("capital", "设备", "Capital equipment"), option("rebate", "返利/量价协议", "Rebate/volume agreement")],
    navStatus: [option("using", "已使用", "In use"), option("introduced", "已介绍未使用", "Introduced, not used"), option("none", "未接触", "Not introduced"), option("unknown", "不清楚", "Unknown")],
    navValue: [option("high", "价值明确", "Clear value"), option("medium", "有一定价值", "Some value"), option("low", "价值有限", "Limited value"), option("unknown", "暂不判断", "Not sure")],
    sphereStatus: [option("none", "未接触", "Not introduced"), option("introduced", "已介绍", "Introduced"), option("trial", "已试用", "Trial use"), option("first", "首批病例", "Initial cases"), option("routine", "常规使用", "Routine use")],
    replacement: [option("yes", "计划替代", "Plan to replace"), option("partial", "部分病例替代", "Partial replacement"), option("no", "不替代", "No replacement"), option("undecided", "未决定", "Undecided")],
    sphere9Cases: [option("pvi", "PVI-only", "PVI-only"), option("pvi_plus", "PVI+", "PVI+"), option("persistent", "持续性AF", "Persistent AF"), option("at_flutter", "房速/房扑", "AT/AFL"), option("other", "其他", "Other")],
    opportunity: [option("high", "高", "High"), option("medium", "中", "Medium"), option("low", "低", "Low"), option("unknown", "暂不判断", "Not assessed")],
    decisionMakers: [option("operator", "术者", "Operator"), option("director", "科室主任", "Department head"), option("procurement", "采购", "Procurement"), option("management", "医院管理层", "Hospital management"), option("finance", "财务/医保", "Finance/reimbursement"), option("distributor", "代理商", "Distributor")],
    nextActions: [option("demo", "产品演示", "Product demo"), option("evidence", "提供临床资料", "Share clinical evidence"), option("price", "价格沟通", "Pricing discussion"), option("research", "研究合作", "Research collaboration"), option("procurement", "采购拜访", "Procurement meeting"), option("followup", "安排下次拜访", "Schedule follow-up"), option("none", "暂不跟进", "No follow-up")],
    evidenceBasis: [option("physician", "医生估计", "Physician estimate"), option("procurement", "采购数据", "Procurement data"), option("finance", "财务数据", "Finance data"), option("unknown", "不清楚", "Unknown")],
    deepSedationDisposition: [option("same_day", "通常当天出院", "Usually same-day"), option("overnight", "通常留院一晚", "Usually overnight"), option("mixed", "两者都有", "Mixed"), option("unknown", "不清楚", "Unknown")]
  };

  const ui = {
    zh: {
      title: "PFA中心拜访记录", subtitle: "现场访谈 · 自动汇总 · PDF/JSON归档", privacy: "数据不上传，仅在当前页面处理",
      newRecord: "新建", duplicate: "复制", delete: "删除", importJson: "导入JSON", exportJson: "导出JSON", savePdf: "保存PDF",
      previous: "上一项", next: "下一项", complete: "完成度", record: "当前记录", untitled: "未命名中心", empty: "尚未填写",
      exactNumber: "年度例数", quality: "数据口径", volumeBand: "快速量级", unknown: "不清楚", notes: "补充说明",
      sum: "合计", valid: "合计正确", invalid: "请调整至100%", notEnough: "信息不足", calculated: "自动计算",
      otherDetail: "其他说明", selectTop3: "依次选择前三项", optional: "选填", required: "必填", addPrice: "选择需要记录价格的产品",
      noProduct: "先在“技术与设备”中选择使用的PFA产品。", imported: "记录已导入", invalidFile: "JSON文件格式不正确", confirmDelete: "确认删除当前记录？",
      pdfHint: "系统打印窗口打开后请选择“保存为PDF”或“存储到文件”。", unsaved: "当前有尚未导出JSON的修改，离开页面可能丢失。",
      printTitle: "PFA中心拜访纪要", generated: "生成时间", sourceLabel: "记录口径", noneAnswered: "本部分暂无填写内容"
    },
    en: {
      title: "PFA Center Visit Record", subtitle: "Live interview · Auto summary · PDF/JSON archive", privacy: "No data upload; processed only in this page",
      newRecord: "New", duplicate: "Duplicate", delete: "Delete", importJson: "Import JSON", exportJson: "Export JSON", savePdf: "Save PDF",
      previous: "Previous", next: "Next", complete: "Completion", record: "Current record", untitled: "Untitled center", empty: "Not answered",
      exactNumber: "Annual cases", quality: "Data basis", volumeBand: "Quick range", unknown: "Unknown", notes: "Additional notes",
      sum: "Total", valid: "Total is valid", invalid: "Adjust total to 100%", notEnough: "Insufficient data", calculated: "Calculated",
      otherDetail: "Other details", selectTop3: "Select and rank top three", optional: "Optional", required: "Required", addPrice: "Select products to capture pricing",
      noProduct: "Select PFA products in Technology & Devices first.", imported: "Records imported", invalidFile: "Invalid JSON file", confirmDelete: "Delete the current record?",
      pdfHint: "In the system print dialog, choose Save as PDF or Save to Files.", unsaved: "Changes have not been exported to JSON and may be lost if you leave.",
      printTitle: "PFA Center Visit Summary", generated: "Generated", sourceLabel: "Evidence basis", noneAnswered: "No answers in this section"
    }
  };

  return { option, products, sections, lists, ui };
})();
