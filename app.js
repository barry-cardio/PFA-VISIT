(() => {
  "use strict";

  const C = window.PFA_CONFIG;
  const $ = (selector) => document.querySelector(selector);
  const formRoot = $("#formRoot");

  const state = {
    lang: "zh",
    step: 0,
    records: [],
    currentId: null,
    dirty: false
  };

  const productById = Object.fromEntries(C.products.map((item) => [item.id, item]));
  const nowIso = () => new Date().toISOString();
  const today = () => new Date().toISOString().slice(0, 10);
  const uid = () => `visit_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  const L = (zh, en) => state.lang === "zh" ? zh : en;
  const t = (key) => C.ui[state.lang][key] || key;
  const current = () => state.records.find((record) => record.id === state.currentId);
  const values = () => current().values;
  const value = (key, fallback = "") => values()[key] ?? fallback;
  const arrayValue = (key) => Array.isArray(values()[key]) ? values()[key] : [];
  const isFilled = (item) => Array.isArray(item) ? item.length > 0 : item !== "" && item !== null && item !== undefined;

  function makeRecord(seed = {}) {
    const timestamp = nowIso();
    return {
      id: uid(),
      createdAt: timestamp,
      updatedAt: timestamp,
      values: { visitDate: today(), ...seed }
    };
  }

  function setValue(key, nextValue) {
    values()[key] = nextValue;
    current().updatedAt = nowIso();
    state.dirty = true;
  }

  function optionLabel(list, code) {
    const found = (list || []).find((item) => item.value === code);
    return found ? found[state.lang] : code;
  }

  function labelsFor(list, codes) {
    return (Array.isArray(codes) ? codes : []).map((code) => optionLabel(list, code)).join(L("、", ", "));
  }

  function recordName(record) {
    const center = record.values.centerName || t("untitled");
    const date = record.values.visitDate || record.createdAt.slice(0, 10);
    return `${date} · ${center}`;
  }

  function fieldLabel(zh, en, required = false) {
    return `<span class="field-label">${esc(L(zh, en))}${required ? '<span class="req"> *</span>' : ""}</span>`;
  }

  function textField(key, zh, en, type = "text", options = {}) {
    const inputMode = options.inputMode ? ` inputmode="${options.inputMode}"` : "";
    const step = options.step ? ` step="${options.step}"` : "";
    const min = options.min !== undefined ? ` min="${options.min}"` : "";
    const max = options.max !== undefined ? ` max="${options.max}"` : "";
    const placeholder = options.placeholder ? ` placeholder="${esc(L(options.placeholder[0], options.placeholder[1]))}"` : "";
    const suffix = options.suffix ? `<span>${esc(options.suffix)}</span>` : "";
    return `<label class="field">${fieldLabel(zh, en, options.required)}<div class="${suffix ? "input-suffix" : ""}"><input data-field="${key}" type="${type}" value="${esc(value(key))}"${inputMode}${step}${min}${max}${placeholder}>${suffix}</div></label>`;
  }

  function textareaField(key, zh, en, placeholderZh = "", placeholderEn = "") {
    return `<label class="field">${fieldLabel(zh, en)}<textarea data-field="${key}" placeholder="${esc(L(placeholderZh, placeholderEn))}">${esc(value(key))}</textarea></label>`;
  }

  function selectField(key, zh, en, options, placeholderZh = "请选择", placeholderEn = "Select") {
    const selected = value(key);
    return `<label class="field">${fieldLabel(zh, en)}<select data-field="${key}"><option value="">${esc(L(placeholderZh, placeholderEn))}</option>${options.map((item) => `<option value="${esc(item.value)}"${selected === item.value ? " selected" : ""}>${esc(item[state.lang])}</option>`).join("")}</select></label>`;
  }

  function chipGroup(key, options, mode = "multi", extraClass = "") {
    const selected = mode === "multi" || mode === "rank3" ? arrayValue(key) : [value(key)];
    return `<div class="chip-group ${extraClass}" data-group="${key}">${options.map((item) => {
      const index = selected.indexOf(item.value);
      const rank = mode === "rank3" && index >= 0 ? ` rank-${index + 1}` : "";
      return `<button type="button" class="chip${index >= 0 ? " selected" : ""}${rank}" data-chip data-field="${key}" data-value="${esc(item.value)}" data-mode="${mode}">${esc(item[state.lang])}</button>`;
    }).join("")}</div>`;
  }

  function otherIfSelected(arrayKey, fieldKey, zh = "其他说明", en = "Other details", otherValue = "other") {
    return arrayValue(arrayKey).includes(otherValue) || value(arrayKey) === otherValue ? `<div style="margin-top:10px">${textField(fieldKey, zh, en)}</div>` : "";
  }

  function subsection(titleZh, titleEn, body, helperZh = "", helperEn = "") {
    return `<section class="subsection"><h3>${esc(L(titleZh, titleEn))}</h3>${helperZh || helperEn ? `<p class="helper">${esc(L(helperZh, helperEn))}</p>` : ""}${body}</section>`;
  }

  function percentGroup(key, items) {
    const total = items.reduce((sum, item) => sum + (Number(value(`${key}_${item.value}`)) || 0), 0);
    const hasAny = items.some((item) => isFilled(value(`${key}_${item.value}`)));
    const statusClass = !hasAny ? "" : total === 100 ? "valid" : "invalid";
    const statusText = !hasAny ? t("notEnough") : total === 100 ? t("valid") : t("invalid");
    return `<div class="percentage-list">${items.map((item) => `<div class="percentage-row"><label for="${key}_${item.value}">${esc(item[state.lang])}</label><div class="percentage-input"><input id="${key}_${item.value}" data-field="${key}_${item.value}" data-percent-group="${key}" type="number" inputmode="decimal" min="0" max="100" step="5" value="${esc(value(`${key}_${item.value}`))}"><span>%</span></div></div>`).join("")}</div><div class="sum-status ${statusClass}" data-sum-status="${key}"><span>${t("sum")}</span><strong>${hasAny ? `${total}% · ${statusText}` : statusText}</strong></div>`;
  }

  function volumeBlock(key, zh, en) {
    return `<div class="experience-card"><h4 style="margin:0 0 12px;color:var(--dark)">${esc(L(zh, en))}</h4><div class="field-grid two">${textField(key, "年度例数", "Annual cases", "number", { inputMode: "numeric", min: 0, step: 1, suffix: L("例", "") })}${selectField(`${key}Quality`, "数据口径", "Data basis", C.lists.dataQuality)}</div><div style="margin-top:10px">${fieldLabel("快速量级", "Quick range")}${chipGroup(`${key}Band`, C.lists.volumeBand, "single")}</div></div>`;
  }

  function ratioResult(numeratorKey, denominatorKey, labelZh, labelEn) {
    const numerator = Number(value(numeratorKey));
    const denominator = Number(value(denominatorKey));
    const result = denominator > 0 && isFilled(value(numeratorKey)) && Number.isFinite(numerator) ? `${(numerator / denominator * 100).toFixed(1)}%` : t("notEnough");
    return `<div class="metric-result" data-ratio="${numeratorKey}:${denominatorKey}"><span>${esc(L(labelZh, labelEn))}</span><strong>${esc(result)}</strong></div>`;
  }

  function sectionShell(index, content) {
    const section = C.sections[index];
    return `<article class="section-card"><header class="section-heading"><p class="section-kicker">${String(index + 1).padStart(2, "0")} / ${C.sections.length}</p><h2>${esc(section[state.lang])}</h2></header><div class="section-body">${content}</div></article>`;
  }

  function renderProfile() {
    const metadata = `<div class="field-grid">${textField("visitDate", "拜访日期", "Visit date", "date", { required: true })}${textField("country", "国家", "Country")}${textField("city", "城市", "City")}${textField("centerName", "医院/中心", "Hospital / center", "text", { required: true })}${textField("physician", "医生", "Physician")}${textField("physicianRole", "职务", "Role")}${textField("interviewer", "访谈人", "Interviewer")}${textField("visitType", "拜访形式", "Visit format", "text", { placeholder: ["现场/线上/会议", "On-site / online / congress"] })}</div>`;
    const volumes = `${volumeBlock("totalAblations", "全部电生理消融", "All EP ablations")}${volumeBlock("afAblations", "房颤消融", "AF ablations")}${volumeBlock("pfaCases", "PFA手术", "PFA procedures")}${volumeBlock("pviOnlyCases", "全部AF病例中的PVI-only", "PVI-only among all AF cases")}${ratioResult("pfaCases", "afAblations", "PFA占房颤消融", "PFA share of AF ablation")}${ratioResult("pviOnlyCases", "afAblations", "PVI-only占房颤消融", "PVI-only share of AF ablation")}`;
    return sectionShell(0, subsection("拜访信息", "Visit information", metadata) + subsection("中心年度业务量", "Annual center volume", volumes, "可以填准确数字，也可以只选择快速量级。", "Enter an exact number or select a quick range."));
  }

  function renderTechnology() {
    const pfa = `${fieldLabel("PFA产品（可多选）", "PFA products (multi-select)")}${chipGroup("pfaProducts", C.lists.pfaProducts, "multi")}${otherIfSelected("pfaProducts", "pfaOther", "其他PFA产品", "Other PFA product", "pfa_other")}`;
    const rf = `${fieldLabel("RF射频产品（可多选）", "RF products (multi-select)")}${chipGroup("rfProducts", C.lists.rfProducts, "multi")}${otherIfSelected("rfProducts", "rfOther", "其他RF产品", "Other RF product", "rf_other")}`;
    const cryo = `${fieldLabel("冷冻球囊产品（可多选）", "Cryoballoon products (multi-select)")}${chipGroup("cryoProducts", C.lists.cryoProducts, "multi")}${otherIfSelected("cryoProducts", "cryoOther", "其他冷冻产品", "Other cryo product", "cryo_other")}`;
    const shares = percentGroup("technologyShare", [C.option("rf", "点对点RF", "Point-by-point RF"), C.option("rf_balloon", "RF球囊", "RF balloon"), C.option("cryo", "冷冻球囊", "Cryoballoon"), C.option("pfa", "PFA", "PFA")]);
    return sectionShell(1, subsection("房颤消融技术结构", "AF ablation mix", shares) + subsection("PFA", "PFA", pfa) + subsection("RF射频", "Radiofrequency", rf) + subsection("冷冻球囊", "Cryoballoon", cryo));
  }

  function renderAnesthesia() {
    const anesthesia = percentGroup("anesthesia", [C.option("conscious", "清醒镇静", "Conscious sedation"), C.option("deep", "深度镇静", "Deep sedation"), C.option("ga", "全麻", "General anesthesia")]);
    const disposition = percentGroup("disposition", [C.option("same_day", "当天出院", "Same-day discharge"), C.option("one_night", "留院一晚", "One-night stay"), C.option("two_plus", "两晚及以上", "Two nights or more")]);
    const payment = percentGroup("payment", [C.option("hybrid", "Hybrid-DRG", "Hybrid-DRG"), C.option("inpatient", "Inpatient DRG", "Inpatient DRG")]);
    const costs = percentGroup("costSplit", [C.option("labor", "技术劳务", "Clinical labor"), C.option("consumable", "耗材", "Consumables"), C.option("other", "其他成本", "Other costs")]);
    return sectionShell(2,
      subsection("麻醉方案", "Anesthesia mix", anesthesia) +
      subsection("PVI-only术后安排", "Post-PVI-only disposition", disposition + `<div style="margin-top:12px">${textareaField("sameDayFactors", "影响当天出院的主要因素", "Main barriers to same-day discharge")}</div>`) +
      subsection("Hybrid-DRG与住院路径", "Hybrid-DRG and inpatient pathway", payment + `<div style="margin-top:14px">${fieldLabel("不能进入Hybrid的主要原因", "Main reasons cases cannot enter Hybrid")}${chipGroup("hybridReasons", C.lists.hybridReasons, "multi")}${otherIfSelected("hybridReasons", "hybridOther")}</div><div class="field-grid two" style="margin-top:14px">${selectField("deepSedationDisposition", "Hybrid下deep sedation术后安排", "Disposition after deep sedation under Hybrid", C.lists.deepSedationDisposition)}${selectField("paymentEvidence", "支付比例口径", "Payment data basis", C.lists.evidenceBasis)}</div>`) +
      subsection("清醒镇静价值", "Value of conscious sedation", chipGroup("sedationValue", C.lists.sedationValue, "multi")) +
      subsection("单台成本结构", "Per-case cost structure", costs + `<div style="margin-top:12px">${selectField("costEvidence", "成本比例口径", "Cost data basis", C.lists.evidenceBasis)}</div>`)
    );
  }

  function renderWorkflow() {
    const satisfaction = `${fieldLabel("现有PFA设备总体满足度", "Overall satisfaction with current PFA equipment")}${rating("equipmentSatisfaction")}`;
    const unmet = `${fieldLabel("希望厂家优化的方向", "Areas manufacturers should improve")}${chipGroup("unmetNeeds", C.lists.unmetNeeds, "multi")}${otherIfSelected("unmetNeeds", "unmetOther")}`;
    const transseptal = `${fieldLabel("目前采用的房间隔穿刺/换鞘方式", "Current transseptal access / sheath exchange")}${chipGroup("transseptalMethods", C.lists.transseptalMethods, "multi")}<div style="margin-top:14px">${fieldLabel("影像引导方式", "Imaging guidance")}${chipGroup("imagingGuidance", C.lists.imagingGuidance, "multi")}</div><div class="field-grid two" style="margin-top:14px">${textField("integratedAccessShare", "PFA治疗鞘一体化穿刺比例", "Integrated access with PFA therapy sheath", "number", { inputMode: "decimal", min: 0, max: 100, step: 5, suffix: "%" })}${textField("transseptalTime", "穿刺及换鞘时间", "Access and sheath-exchange time", "number", { inputMode: "decimal", min: 0, step: 1, suffix: "min" })}</div>${textareaField("transseptalPain", "主要困难", "Main difficulties")}`;
    const dicom = `${fieldLabel("需要的DICOM/PACS/HIS功能", "Required DICOM/PACS/HIS functions")}${chipGroup("dicomFunctions", C.lists.dicomFunctions, "multi")}<div class="field-grid two" style="margin-top:14px">${selectField("dicomCurrent", "目前是否使用DICOM连接", "Current DICOM connectivity", C.lists.yesNoUnknown)}${selectField("dicomImportance", "对产品选择的重要性", "Importance in product selection", [C.option("must", "必须具备", "Must-have"), C.option("important", "重要", "Important"), C.option("nice", "Nice-to-have", "Nice-to-have"), C.option("low", "影响较小", "Low impact")])}</div>`;
    return sectionShell(3, subsection("当前满足度与需求", "Current satisfaction and needs", satisfaction + `<div style="margin-top:16px">${unmet}</div>`) + subsection("房间隔穿刺", "Transseptal access", transseptal, "这里记录的是PFA治疗鞘是否直接配合针或RF导丝完成穿刺，而不是鞘管本身穿刺。", "Capture whether the PFA therapy sheath is used with a needle or RF wire for direct access; the sheath itself does not puncture.") + subsection("DICOM / PACS / HIS", "DICOM / PACS / HIS", dicom));
  }

  function rankSummary(key, list) {
    const selected = arrayValue(key);
    return selected.length ? `<div class="rank-summary">${selected.map((code, index) => `<strong>${index + 1}.</strong> ${esc(optionLabel(list, code))}`).join(" &nbsp; ")}</div>` : "";
  }

  function rating(key) {
    const ratingOptions = [1, 2, 3, 4, 5].map((n) => C.option(String(n), String(n), String(n)));
    return chipGroup(key, ratingOptions, "single", "rating");
  }

  function experienceCard(productId) {
    const product = productById[productId];
    if (!product) return "";
    const prefix = `exp_${productId}`;
    return `<article class="experience-card"><div class="card-title-row"><h4>${esc(product.name)}</h4><span class="maker-tag">${esc(product.maker)}</span></div><div class="field-grid two">${textField(`${prefix}_monthly`, "约多少例/月", "Approx. cases/month", "number", { inputMode: "numeric", min: 0, step: 1 })}${selectField(`${prefix}_support`, "厂家CS支持", "Vendor clinical support", C.lists.csSupport)}${selectField(`${prefix}_future`, "未来使用意向", "Future use intention", C.lists.futureUse)}${textField(`${prefix}_share`, "占本中心PFA比例", "Share of center PFA", "number", { inputMode: "decimal", min: 0, max: 100, step: 5, suffix: "%" })}</div><div style="margin-top:14px">${fieldLabel("满意点", "What works well")}${chipGroup(`${prefix}_good`, C.lists.satisfaction, "multi")}${otherIfSelected(`${prefix}_good`, `${prefix}_goodOther`)}</div><div style="margin-top:14px">${fieldLabel("不满意点", "What does not work well")}${chipGroup(`${prefix}_bad`, C.lists.dissatisfaction, "multi")}${otherIfSelected(`${prefix}_bad`, `${prefix}_badOther`)}</div></article>`;
  }

  function renderExperience() {
    const selected = arrayValue("pfaProducts").filter((id) => productById[id]);
    const cards = selected.length ? selected.map(experienceCard).join("") : `<div class="empty-state">${esc(t("noProduct"))}</div>`;
    return sectionShell(4, subsection("PFA品牌使用体验", "PFA brand experience", cards, "体验卡只显示已在“技术与设备”中选择的产品。", "Cards appear only for products selected in Technology & Devices."));
  }

  function priceCard(productId) {
    const product = productById[productId];
    if (!product) return "";
    const prefix = `price_${productId}`;
    const currencies = [C.option("EUR", "EUR €", "EUR €"), C.option("GBP", "GBP £", "GBP £"), C.option("USD", "USD $", "USD $"), C.option("OTHER", "其他", "Other")];
    return `<article class="price-card"><div class="card-title-row"><h4>${esc(product.name)}</h4><span class="maker-tag">${esc(product.maker)}</span></div><div class="field-grid two">${selectField(`${prefix}_currency`, "币种", "Currency", currencies)}${selectField(`${prefix}_basis`, "价格口径", "Price basis", C.lists.priceBasis)}${textField(`${prefix}_catheter`, "单导管价格", "Catheter-only price", "number", { inputMode: "decimal", min: 0, step: 1 })}${textField(`${prefix}_total`, "单台全部耗材", "Total disposables per case", "number", { inputMode: "decimal", min: 0, step: 1 })}</div><div style="margin-top:12px">${fieldLabel("价格包含", "Price includes")}${chipGroup(`${prefix}_includes`, C.lists.priceIncludes, "multi")}</div></article>`;
  }

  function renderPricing() {
    const selected = arrayValue("priceProducts");
    const picker = `${fieldLabel("选择需要记录价格的产品", "Select products to capture pricing")}${chipGroup("priceProducts", C.lists.pfaProducts.filter((item) => item.value !== "pfa_other"), "multi")}`;
    const cards = selected.map(priceCard).join("");
    const acceptable = `<div class="field-grid two">${selectField("acceptableCurrency", "币种", "Currency", [C.option("EUR", "EUR €", "EUR €"), C.option("GBP", "GBP £", "GBP £"), C.option("USD", "USD $", "USD $"), C.option("OTHER", "其他", "Other")])}${selectField("acceptableBasis", "判断口径", "Assessment basis", C.lists.evidenceBasis)}${textField("acceptableCatheter", "医院可接受单导管价格", "Acceptable catheter-only price", "number", { inputMode: "decimal", min: 0, step: 1 })}${textField("acceptableTotal", "医院可接受单台全部耗材", "Acceptable total disposables", "number", { inputMode: "decimal", min: 0, step: 1 })}</div>${textareaField("acceptableConditions", "允许PFA溢价的条件", "Conditions that justify a PFA premium")}`;
    return sectionShell(5, subsection("竞品价格", "Competitor pricing", picker + cards, "分别记录单导管和单台总耗材，并标明净价、标价或估计。", "Separate catheter-only and total disposable cost, and identify net, list or estimated pricing.") + subsection("医院可接受价格", "Acceptable hospital price", acceptable));
  }

  function renderMapping() {
    const mapping = `${fieldLabel("理想3D系统最重要的前三项", "Top three features of an ideal 3D system")}${chipGroup("mappingFeatures", C.lists.mappingFeatures, "rank3")}${rankSummary("mappingFeatures", C.lists.mappingFeatures)}${textareaField("cartoEnsiteGaps", "相比CARTO和EnSite最希望优化什么", "Most important improvements vs CARTO and EnSite")}`;
    const boston = `<div class="field-grid two">${selectField("bostonNavStatus", "FARAWAVE NAV/OPAL HDx状态", "FARAWAVE NAV/OPAL HDx status", C.lists.navStatus)}${textField("boston3dShare", "Boston PFA使用三维比例", "Share of Boston PFA using 3D", "number", { inputMode: "decimal", min: 0, max: 100, step: 5, suffix: "%" })}${selectField("bostonNavValue", "医生认为三维的实际价值", "Perceived value of 3D", C.lists.navValue)}${textField("bostonMainMessage", "Boston主要推广点", "Boston's main promotional message")}</div>${textareaField("bostonBarrier", "三维采用障碍", "Barriers to 3D adoption")}`;
    const medtronic = `<div class="info-box">${esc(L("Sphere-9和Sphere-360均集成Affera三维系统；Sphere-360是OTW single-shot导管，但仍属于Affera三维工作流。PulseSelect不依赖专用三维系统。", "Sphere-9 and Sphere-360 are integrated with Affera. Sphere-360 is an OTW single-shot catheter but remains part of the Affera 3D workflow. PulseSelect does not require a dedicated 3D system."))}</div><div class="field-grid two">${selectField("sphere360Status", "Sphere-360中心状态", "Sphere-360 center status", C.lists.sphereStatus)}${textField("sphere360Monthly", "Sphere-360病例量", "Sphere-360 cases/month", "number", { inputMode: "numeric", min: 0, step: 1 })}${selectField("sphere360Replace", "是否计划替代PulseSelect", "Plan to replace PulseSelect", C.lists.replacement)}${selectField("afferaRequiredReported", "中心反馈是否必须使用Affera", "Center reports Affera is required", C.lists.yesNoUnknown)}</div><div style="margin-top:14px">${fieldLabel("Sphere-9主要病例类型", "Main Sphere-9 case types")}${chipGroup("sphere9Cases", C.lists.sphere9Cases, "multi")}</div>${textareaField("medtronicChoiceReason", "选择PulseSelect、Sphere-9或Sphere-360的原因", "Reasons for choosing PulseSelect, Sphere-9 or Sphere-360")}`;
    return sectionShell(6, subsection("理想3D标测系统", "Ideal 3D mapping system", mapping) + subsection("Boston三维路径", "Boston 3D pathway", boston) + subsection("Medtronic产品路径", "Medtronic product pathway", medtronic));
  }

  function renderAction() {
    const assessment = `${fieldLabel("总体机会评级", "Overall opportunity rating")}${chipGroup("opportunity", C.lists.opportunity, "single")}<div style="margin-top:14px">${fieldLabel("采用新PFA的关键决策人", "Key decision-makers for new PFA adoption")}${chipGroup("decisionMakers", C.lists.decisionMakers, "multi")}</div>${textareaField("trialConditions", "进入中心/试用的必要条件", "Requirements for evaluation or adoption")}${textareaField("switchBarriers", "不愿切换品牌的主要原因", "Main barriers to switching")}`;
    const actions = `${fieldLabel("下一步行动", "Next actions")}${chipGroup("nextActions", C.lists.nextActions, "multi")}<div class="field-grid two" style="margin-top:14px">${textField("actionOwner", "负责人", "Owner")}${textField("actionDate", "目标日期", "Target date", "date")}</div>${textareaField("meetingSummary", "会议结论/重要原话", "Meeting conclusion / key quotes", "仅记录与业务判断直接相关的内容", "Capture only content directly relevant to the business decision")}`;
    return sectionShell(7, subsection("商业判断", "Commercial assessment", assessment) + subsection("下一步", "Next steps", actions));
  }

  const renderers = [renderProfile, renderTechnology, renderAnesthesia, renderWorkflow, renderExperience, renderPricing, renderMapping, renderAction];

  function render() {
    document.documentElement.lang = state.lang === "zh" ? "zh-CN" : "en";
    $("#appTitle").textContent = t("title");
    $("#appSubtitle").textContent = t("subtitle");
    $("#privacyText").textContent = t("privacy");
    $("#languageToggle").textContent = state.lang === "zh" ? "EN" : "中";
    $("#recordLabel").textContent = t("record");
    $("#completionLabel").textContent = t("complete");
    $("#previousStep").textContent = `‹ ${t("previous")}`;
    $("#nextStep").textContent = `${t("next")} ›`;
    $("#pdfButton").textContent = t("savePdf");
    $("#exportJson").textContent = t("exportJson");
    $("#importJson").textContent = t("importJson");
    $("#newRecord").title = t("newRecord");
    $("#duplicateRecord").title = t("duplicate");
    $("#deleteRecord").title = t("delete");
    renderRecordSelect();
    renderStepNav();
    formRoot.innerHTML = renderers[state.step]();
    $("#previousStep").disabled = state.step === 0;
    $("#nextStep").disabled = state.step === C.sections.length - 1;
    updateProgress();
    requestAnimationFrame(() => {
      const active = $(".step-button.active");
      if (active) active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    });
  }

  function renderRecordSelect() {
    $("#recordSelect").innerHTML = state.records.map((record) => `<option value="${record.id}"${record.id === state.currentId ? " selected" : ""}>${esc(recordName(record))}</option>`).join("");
  }

  const sectionPrefixes = [
    ["visit", "country", "city", "center", "physician", "interviewer", "totalAblations", "afAblations", "pfaCases", "pviOnlyCases"],
    ["technologyShare", "pfaProducts", "rfProducts", "cryoProducts"],
    ["anesthesia", "disposition", "payment", "hybrid", "deepSedation", "sedationValue", "costSplit", "costEvidence"],
    ["equipmentSatisfaction", "unmetNeeds", "transseptal", "integratedAccess", "imagingGuidance", "dicom"],
    ["exp_"], ["price", "acceptable"], ["mapping", "carto", "boston", "sphere", "affera", "medtronic"],
    ["opportunity", "decisionMakers", "trialConditions", "switchBarriers", "nextActions", "action", "meetingSummary"]
  ];

  function sectionHasData(index) {
    return Object.entries(values()).some(([key, item]) => sectionPrefixes[index].some((prefix) => key.startsWith(prefix)) && isFilled(item) && !(key === "visitDate" && index === 0));
  }

  function renderStepNav() {
    $("#stepNav").innerHTML = C.sections.map((section, index) => `<button type="button" class="step-button${index === state.step ? " active" : ""}${sectionHasData(index) ? " has-data" : ""}" data-step="${index}">${index + 1}. ${esc(section[state.lang])}</button>`).join("");
  }

  function updateProgress() {
    const keys = ["centerName", "afAblations", "pfaCases", "pfaProducts", "anesthesia_conscious", "disposition_same_day", "payment_hybrid", "equipmentSatisfaction", "transseptalMethods", "dicomFunctions", "acceptableCatheter", "mappingFeatures", "opportunity", "nextActions"];
    const completed = keys.filter((key) => isFilled(value(key))).length;
    const percent = Math.round(completed / keys.length * 100);
    $("#completionText").textContent = `${percent}%`;
    $("#progressFill").style.width = `${percent}%`;
  }

  function updateLiveCalculations() {
    document.querySelectorAll("[data-sum-status]").forEach((node) => {
      const key = node.dataset.sumStatus;
      const inputs = [...document.querySelectorAll(`[data-percent-group="${key}"]`)];
      const hasAny = inputs.some((input) => input.value !== "");
      const total = inputs.reduce((sum, input) => sum + (Number(input.value) || 0), 0);
      node.className = `sum-status ${!hasAny ? "" : total === 100 ? "valid" : "invalid"}`;
      node.querySelector("strong").textContent = !hasAny ? t("notEnough") : `${total}% · ${total === 100 ? t("valid") : t("invalid")}`;
    });
    document.querySelectorAll("[data-ratio]").forEach((node) => {
      const [numeratorKey, denominatorKey] = node.dataset.ratio.split(":");
      const numerator = Number(value(numeratorKey));
      const denominator = Number(value(denominatorKey));
      node.querySelector("strong").textContent = denominator > 0 && isFilled(value(numeratorKey)) && Number.isFinite(numerator) ? `${(numerator / denominator * 100).toFixed(1)}%` : t("notEnough");
    });
    renderRecordSelect();
    updateProgress();
  }

  function handleChip(button) {
    const key = button.dataset.field;
    const code = button.dataset.value;
    const mode = button.dataset.mode;
    if (mode === "single") {
      setValue(key, value(key) === code ? "" : code);
    } else if (mode === "rank3") {
      const selected = [...arrayValue(key)];
      const index = selected.indexOf(code);
      if (index >= 0) selected.splice(index, 1);
      else {
        if (selected.length === 3) selected.shift();
        selected.push(code);
      }
      setValue(key, selected);
    } else {
      const selected = new Set(arrayValue(key));
      selected.has(code) ? selected.delete(code) : selected.add(code);
      setValue(key, [...selected]);
    }
    render();
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2500);
  }

  function goStep(next) {
    state.step = Math.max(0, Math.min(C.sections.length - 1, next));
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  formRoot.addEventListener("input", (event) => {
    const field = event.target.dataset.field;
    if (!field) return;
    let nextValue = event.target.value;
    if (event.target.type === "number" && nextValue !== "") {
      const min = event.target.min === "" ? -Infinity : Number(event.target.min);
      const max = event.target.max === "" ? Infinity : Number(event.target.max);
      if (Number(nextValue) < min) nextValue = String(min);
      if (Number(nextValue) > max) nextValue = String(max);
      event.target.value = nextValue;
    }
    setValue(field, nextValue);
    updateLiveCalculations();
  });

  formRoot.addEventListener("change", (event) => {
    const field = event.target.dataset.field;
    if (!field) return;
    setValue(field, event.target.value);
    updateLiveCalculations();
  });

  formRoot.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-chip]");
    if (chip) handleChip(chip);
  });

  $("#stepNav").addEventListener("click", (event) => {
    const button = event.target.closest("[data-step]");
    if (button) goStep(Number(button.dataset.step));
  });
  $("#previousStep").addEventListener("click", () => goStep(state.step - 1));
  $("#nextStep").addEventListener("click", () => goStep(state.step + 1));
  $("#languageToggle").addEventListener("click", () => { state.lang = state.lang === "zh" ? "en" : "zh"; render(); });

  $("#recordSelect").addEventListener("change", (event) => { state.currentId = event.target.value; state.step = 0; render(); });
  $("#newRecord").addEventListener("click", () => {
    const record = makeRecord();
    state.records.push(record);
    state.currentId = record.id;
    state.step = 0;
    state.dirty = true;
    render();
  });
  $("#duplicateRecord").addEventListener("click", () => {
    const clone = makeRecord(JSON.parse(JSON.stringify(values())));
    clone.values.visitDate = today();
    clone.values.centerName = value("centerName") ? `${value("centerName")} ${L("（复制）", "(copy)")}` : "";
    state.records.push(clone);
    state.currentId = clone.id;
    state.dirty = true;
    render();
  });
  $("#deleteRecord").addEventListener("click", () => {
    if (!window.confirm(t("confirmDelete"))) return;
    state.records = state.records.filter((record) => record.id !== state.currentId);
    if (!state.records.length) state.records.push(makeRecord());
    state.currentId = state.records[0].id;
    state.step = 0;
    state.dirty = true;
    render();
  });

  $("#moreButton").addEventListener("click", () => {
    const menu = $("#moreMenu");
    menu.hidden = !menu.hidden;
    $("#moreButton").setAttribute("aria-expanded", String(!menu.hidden));
  });

  function safeFilename(text) {
    return String(text || "Untitled").trim().replace(/[\\/:*?"<>|\s]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 70) || "Untitled";
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  $("#exportJson").addEventListener("click", () => {
    const payload = { schemaVersion: 1, exportedAt: nowIso(), language: state.lang, records: state.records };
    downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }), `PFA_Visit_Records_${today()}.json`);
    state.dirty = false;
    $("#moreMenu").hidden = true;
    showToast(t("exportJson"));
  });
  $("#importJson").addEventListener("click", () => $("#jsonFile").click());
  $("#jsonFile").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.records) || !parsed.records.every((record) => record.id && record.values && typeof record.values === "object")) throw new Error("schema");
      state.records = parsed.records.length ? parsed.records : [makeRecord()];
      state.currentId = state.records[0].id;
      state.lang = parsed.language === "en" ? "en" : "zh";
      state.step = 0;
      state.dirty = false;
      render();
      showToast(t("imported"));
    } catch (error) {
      showToast(t("invalidFile"));
    } finally {
      event.target.value = "";
      $("#moreMenu").hidden = true;
    }
  });

  function addPrintItem(items, label, content, wide = false) {
    if (!isFilled(content)) return;
    items.push(`<div class="print-item${wide ? " wide" : ""}"><span class="k">${esc(label)}</span><span class="v">${esc(content)}</span></div>`);
  }

  function percentText(prefix, list) {
    const parts = list.map((item) => {
      const entry = value(`${prefix}_${item.value}`);
      return isFilled(entry) ? `${item[state.lang]} ${entry}%` : "";
    }).filter(Boolean);
    return parts.join(L("；", "; "));
  }

  function volumeText(key) {
    const number = value(key);
    const band = value(`${key}Band`);
    const quality = value(`${key}Quality`);
    const body = isFilled(number) ? `${number} ${L("例/年", "cases/year")}` : band ? optionLabel(C.lists.volumeBand, band) : "";
    return body ? `${body}${quality ? ` · ${optionLabel(C.lists.dataQuality, quality)}` : ""}` : "";
  }

  function reportSection(title, items, extra = "") {
    if (!items.length && !extra) return "";
    return `<section class="print-section"><h2>${esc(title)}</h2>${items.length ? `<div class="print-grid">${items.join("")}</div>` : ""}${extra}</section>`;
  }

  function productNames(ids) {
    return (ids || []).map((id) => productById[id] ? `${productById[id].maker} · ${productById[id].name}` : id).join(L("、", ", "));
  }

  function buildPrintReport() {
    const v = values();
    const sections = [];
    let items = [];
    addPrintItem(items, L("拜访日期", "Visit date"), v.visitDate);
    addPrintItem(items, L("医院/中心", "Hospital / center"), v.centerName);
    addPrintItem(items, L("国家/城市", "Country / city"), [v.country, v.city].filter(Boolean).join(" / "));
    addPrintItem(items, L("医生/职务", "Physician / role"), [v.physician, v.physicianRole].filter(Boolean).join(" / "));
    addPrintItem(items, L("访谈人", "Interviewer"), v.interviewer);
    addPrintItem(items, L("全部消融量", "All EP ablations"), volumeText("totalAblations"));
    addPrintItem(items, L("房颤消融量", "AF ablations"), volumeText("afAblations"));
    addPrintItem(items, L("PFA量", "PFA procedures"), volumeText("pfaCases"));
    addPrintItem(items, L("PVI-only量", "PVI-only procedures"), volumeText("pviOnlyCases"));
    if (Number(v.afAblations) > 0 && isFilled(v.pfaCases)) addPrintItem(items, L("PFA/AF", "PFA/AF"), `${(Number(v.pfaCases) / Number(v.afAblations) * 100).toFixed(1)}%`);
    if (Number(v.afAblations) > 0 && isFilled(v.pviOnlyCases)) addPrintItem(items, L("PVI-only/AF", "PVI-only/AF"), `${(Number(v.pviOnlyCases) / Number(v.afAblations) * 100).toFixed(1)}%`);
    sections.push(reportSection(C.sections[0][state.lang], items));

    items = [];
    addPrintItem(items, L("技术结构", "Technology mix"), percentText("technologyShare", [C.option("rf", "点对点RF", "Point-by-point RF"), C.option("rf_balloon", "RF球囊", "RF balloon"), C.option("cryo", "冷冻球囊", "Cryoballoon"), C.option("pfa", "PFA", "PFA")]));
    addPrintItem(items, "PFA", productNames(v.pfaProducts));
    addPrintItem(items, "RF", labelsFor(C.lists.rfProducts, v.rfProducts));
    addPrintItem(items, L("冷冻", "Cryo"), labelsFor(C.lists.cryoProducts, v.cryoProducts));
    sections.push(reportSection(C.sections[1][state.lang], items));

    items = [];
    addPrintItem(items, L("麻醉比例", "Anesthesia mix"), percentText("anesthesia", [C.option("conscious", "清醒镇静", "Conscious sedation"), C.option("deep", "深度镇静", "Deep sedation"), C.option("ga", "全麻", "General anesthesia")]));
    addPrintItem(items, L("术后安排", "Disposition"), percentText("disposition", [C.option("same_day", "当天出院", "Same-day"), C.option("one_night", "留院一晚", "One night"), C.option("two_plus", "两晚及以上", "Two+ nights")]));
    addPrintItem(items, L("当天出院障碍", "Same-day barriers"), v.sameDayFactors, true);
    addPrintItem(items, L("支付路径", "Payment pathway"), percentText("payment", [C.option("hybrid", "Hybrid-DRG", "Hybrid-DRG"), C.option("inpatient", "Inpatient DRG", "Inpatient DRG")]));
    addPrintItem(items, L("不能进入Hybrid原因", "Reasons not eligible for Hybrid"), labelsFor(C.lists.hybridReasons, v.hybridReasons));
    addPrintItem(items, L("Hybrid下deep sedation", "Deep sedation under Hybrid"), optionLabel(C.lists.deepSedationDisposition, v.deepSedationDisposition));
    addPrintItem(items, L("清醒镇静价值", "Value of conscious sedation"), labelsFor(C.lists.sedationValue, v.sedationValue));
    addPrintItem(items, L("成本结构", "Cost structure"), percentText("costSplit", [C.option("labor", "技术劳务", "Clinical labor"), C.option("consumable", "耗材", "Consumables"), C.option("other", "其他", "Other")]));
    sections.push(reportSection(C.sections[2][state.lang], items));

    items = [];
    addPrintItem(items, L("设备满足度", "Equipment satisfaction"), v.equipmentSatisfaction ? `${v.equipmentSatisfaction}/5` : "");
    addPrintItem(items, L("希望优化", "Desired improvements"), labelsFor(C.lists.unmetNeeds, v.unmetNeeds));
    addPrintItem(items, L("穿刺/换鞘方式", "Access/sheath exchange"), labelsFor(C.lists.transseptalMethods, v.transseptalMethods));
    addPrintItem(items, L("影像引导", "Imaging guidance"), labelsFor(C.lists.imagingGuidance, v.imagingGuidance));
    addPrintItem(items, L("一体化穿刺比例", "Integrated access share"), isFilled(v.integratedAccessShare) ? `${v.integratedAccessShare}%` : "");
    addPrintItem(items, L("DICOM需求", "DICOM requirements"), labelsFor(C.lists.dicomFunctions, v.dicomFunctions), true);
    sections.push(reportSection(C.sections[3][state.lang], items));

    const expRows = (v.pfaProducts || []).filter((id) => productById[id]).map((id) => {
      const p = productById[id];
      const prefix = `exp_${id}`;
      const good = labelsFor(C.lists.satisfaction, v[`${prefix}_good`]);
      const bad = labelsFor(C.lists.dissatisfaction, v[`${prefix}_bad`]);
      const support = optionLabel(C.lists.csSupport, v[`${prefix}_support`]);
      return good || bad || support || isFilled(v[`${prefix}_monthly`]) ? `<tr><td>${esc(p.name)}</td><td>${esc(v[`${prefix}_monthly`] ? `${v[`${prefix}_monthly`]} / month` : "")}</td><td>${esc(good)}</td><td>${esc(bad)}</td><td>${esc(support)}</td></tr>` : "";
    }).filter(Boolean).join("");
    sections.push(reportSection(C.sections[4][state.lang], [], expRows ? `<table class="print-table"><thead><tr><th>${L("产品", "Product")}</th><th>${L("病例量", "Volume")}</th><th>${L("满意", "Positive")}</th><th>${L("不满意", "Negative")}</th><th>CS</th></tr></thead><tbody>${expRows}</tbody></table>` : ""));

    const priceRows = (v.priceProducts || []).map((id) => {
      const p = productById[id];
      if (!p) return "";
      const prefix = `price_${id}`;
      const any = [v[`${prefix}_currency`], v[`${prefix}_basis`], v[`${prefix}_catheter`], v[`${prefix}_total`]].some(isFilled);
      return any ? `<tr><td>${esc(p.name)}</td><td>${esc(v[`${prefix}_currency`] || "")}</td><td>${esc(v[`${prefix}_catheter`] || "")}</td><td>${esc(v[`${prefix}_total`] || "")}</td><td>${esc(optionLabel(C.lists.priceBasis, v[`${prefix}_basis`]))}</td></tr>` : "";
    }).filter(Boolean).join("");
    items = [];
    addPrintItem(items, L("可接受单导管价格", "Acceptable catheter price"), v.acceptableCatheter ? `${v.acceptableCurrency || ""} ${v.acceptableCatheter}`.trim() : "");
    addPrintItem(items, L("可接受单台耗材", "Acceptable total disposables"), v.acceptableTotal ? `${v.acceptableCurrency || ""} ${v.acceptableTotal}`.trim() : "");
    addPrintItem(items, L("允许溢价条件", "Conditions for premium"), v.acceptableConditions, true);
    sections.push(reportSection(C.sections[5][state.lang], items, priceRows ? `<table class="print-table" style="margin-bottom:8px"><thead><tr><th>${L("产品", "Product")}</th><th>${L("币种", "Currency")}</th><th>${L("导管", "Catheter")}</th><th>${L("总耗材", "Total")}</th><th>${L("口径", "Basis")}</th></tr></thead><tbody>${priceRows}</tbody></table>` : ""));

    items = [];
    addPrintItem(items, L("理想3D前三项", "Top ideal 3D features"), labelsFor(C.lists.mappingFeatures, v.mappingFeatures));
    addPrintItem(items, L("CARTO/EnSite改进", "Improvements vs CARTO/EnSite"), v.cartoEnsiteGaps, true);
    addPrintItem(items, L("Boston NAV状态", "Boston NAV status"), optionLabel(C.lists.navStatus, v.bostonNavStatus));
    addPrintItem(items, L("Boston三维比例", "Boston 3D share"), isFilled(v.boston3dShare) ? `${v.boston3dShare}%` : "");
    addPrintItem(items, L("Sphere-360状态", "Sphere-360 status"), optionLabel(C.lists.sphereStatus, v.sphere360Status));
    addPrintItem(items, L("Sphere-360病例量", "Sphere-360 volume"), isFilled(v.sphere360Monthly) ? `${v.sphere360Monthly} / month` : "");
    addPrintItem(items, L("替代PulseSelect", "Replace PulseSelect"), optionLabel(C.lists.replacement, v.sphere360Replace));
    addPrintItem(items, L("Sphere-9病例类型", "Sphere-9 case types"), labelsFor(C.lists.sphere9Cases, v.sphere9Cases));
    sections.push(reportSection(C.sections[6][state.lang], items));

    items = [];
    addPrintItem(items, L("机会评级", "Opportunity rating"), optionLabel(C.lists.opportunity, v.opportunity));
    addPrintItem(items, L("决策人", "Decision-makers"), labelsFor(C.lists.decisionMakers, v.decisionMakers));
    addPrintItem(items, L("试用/进入条件", "Evaluation/adoption requirements"), v.trialConditions, true);
    addPrintItem(items, L("切换阻力", "Switching barriers"), v.switchBarriers, true);
    addPrintItem(items, L("下一步", "Next actions"), labelsFor(C.lists.nextActions, v.nextActions));
    addPrintItem(items, L("负责人/日期", "Owner/date"), [v.actionOwner, v.actionDate].filter(Boolean).join(" / "));
    addPrintItem(items, L("会议结论", "Meeting conclusion"), v.meetingSummary, true);
    sections.push(reportSection(C.sections[7][state.lang], items));

    const title = t("printTitle");
    $("#printReport").innerHTML = `<header class="print-header"><div><h1>${esc(title)}</h1><p>${esc([v.centerName, v.physician, v.visitDate].filter(Boolean).join(" · "))}</p><p>${esc(t("privacy"))}</p></div><img src="insight-lifetech-logo.png" alt="Insight Lifetech"></header>${sections.join("")}<footer class="print-footer">Insight Lifetech · ${esc(t("generated"))}: ${esc(new Date().toLocaleString(state.lang === "zh" ? "zh-CN" : "en-GB"))}</footer>`;
  }

  $("#pdfButton").addEventListener("click", () => {
    buildPrintReport();
    const oldTitle = document.title;
    document.title = `PFA_Visit_${safeFilename(value("centerName"))}_${value("visitDate") || today()}_${state.lang.toUpperCase()}`;
    const restoreTitle = () => { document.title = oldTitle; };
    window.addEventListener("afterprint", restoreTitle, { once: true });
    showToast(t("pdfHint"));
    setTimeout(() => {
      window.print();
      setTimeout(restoreTitle, 60000);
    }, 120);
  });

  window.addEventListener("beforeunload", (event) => {
    if (!state.dirty) return;
    event.preventDefault();
    event.returnValue = t("unsaved");
  });

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(() => {}));
  }

  const first = makeRecord();
  state.records.push(first);
  state.currentId = first.id;
  render();
})();
