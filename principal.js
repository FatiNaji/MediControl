document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const menuToggle = document.getElementById("menuToggle");
  const navItems = document.querySelectorAll(".nav-item");
  const sections = document.querySelectorAll(".section");
  const pageTitle = document.getElementById("pageTitle");
  const pageSubtitle = document.getElementById("pageSubtitle");

  const titles = {
    inicio: ["Inicio", "Resumen general de MediControl."],
    medicamentos: ["Mis medicamentos", "Consulta tus medicamentos y horarios."],
    calendario: ["Calendario", "Organiza tus medicamentos por fecha."],
    recordatorios: ["Recordatorios", "Tus alarmas y próximas tomas."],
    historial: ["Historial", "Registro de tus medicamentos."],
    tratamientos: ["Guía de medicamentos", "Consulta para qué sirven tus medicamentos y la pauta que registraste."],
    perfil: ["Mi perfil", "Tus datos personales."],
    suscripcion: ["Planes y suscripción", "Consulta tu plan y las opciones disponibles."],
    farmacias: ["Farmacias cercanas", "Encuentra dónde consultar por tus medicamentos."]
  };

  // ---------------- NOMBRE DEL USUARIO ----------------
  const savedName = localStorage.getItem("medicontrolUsuario") || localStorage.getItem("medicontrolUsuarioActivo") || "";
  const firstName = savedName.trim().split(/\s+/)[0] || "";
  const initial = firstName.charAt(0).toUpperCase();

  const profileName = document.getElementById("profileName");
  const profileInitial = document.getElementById("profileInitial");
  const homeName = document.getElementById("homeName");

  if (profileName) profileName.textContent = firstName || "Mi cuenta";
  if (profileInitial) profileInitial.textContent = initial || "M";
  if (homeName) homeName.textContent = firstName || "bienvenido/a";

  // ---------------- NAVEGACIÓN ----------------
  function changeSection(name) {
    if (!titles[name]) return;

    navItems.forEach(item => {
      item.classList.toggle("active", item.dataset.section === name);
    });

    sections.forEach(section => {
      section.classList.toggle("active-section", section.id === name);
    });

    pageTitle.textContent = titles[name][0];
    pageSubtitle.textContent = titles[name][1];

    // En móvil, cerrar el menú después de seleccionar.
    if (window.innerWidth <= 800) {
      body.classList.remove("menu-open");
    }

    // Al entrar a medicamentos, refrescar la lista.
    if (name === "medicamentos") renderMedications();
    if (name === "tratamientos") renderTreatmentGuide();
  }

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      changeSection(item.dataset.section);
    });
  });

  menuToggle?.addEventListener("click", () => {
    if (window.innerWidth <= 800) {
      body.classList.toggle("menu-open");
    } else {
      body.classList.toggle("menu-closed");
    }
  });

  // ---------------- TARJETAS DEL INICIO ----------------
  document.querySelectorAll(".home-card").forEach(card => {
    card.addEventListener("click", () => {
      changeSection(card.dataset.go);
    });
  });

  // ---------------- CERRAR SESIÓN ----------------
  document.getElementById("logout")?.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  // ---------------- MEDICAMENTOS ----------------
  function getMedications() {
    try {
      const saved = JSON.parse(localStorage.getItem("medicontrolMedicamentos") || "[]");
      if (!Array.isArray(saved)) return [];
      // Limpieza de datos de demostración heredados. Conserva los registros reales
      // y elimina únicamente las filas de ejemplo conocidas por su combinación exacta.
      const sampleRows = [
        { name: "aspirina", quantity: "15", time: "10:00", stock: "30" },
        { name: "paracetamol", quantity: "5", time: "12:00", stock: "10" },
        { name: "ibuprofeno", quantity: "10", time: "05:00", stock: "20" }
      ];
      const cleaned = saved.filter(med => {
        if (String(med.id || "").startsWith("demo") || med.demo === true) return false;
        const name = String(med.name || "").trim().toLocaleLowerCase("es");
        const isKnownSample = sampleRows.some(row => name === row.name && String(med.quantity) === row.quantity && String(med.time) === row.time && String(med.stock) === row.stock);
        return !isKnownSample;
      });
      if (cleaned.length !== saved.length) localStorage.setItem("medicontrolMedicamentos", JSON.stringify(cleaned));
      return cleaned;
    } catch {
      localStorage.setItem("medicontrolMedicamentos", "[]");
      return [];
    }
  }

  function saveMedications(medications) {
    localStorage.setItem("medicontrolMedicamentos", JSON.stringify(medications));
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));
  }

  // Resumen educativo visible también en la lista de medicamentos registrados.
  function getMedicationUseSummary(name) {
    const normalized = String(name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const summaries = [
      { terms: ["ibuprofeno"], text: "Se usa para aliviar ciertos dolores y reducir la fiebre. Sigue la dosis de tu receta o envase; puede irritar el estómago." },
      { terms: ["paracetamol", "acetaminofen"], text: "Se usa para aliviar el dolor leve o moderado y reducir la fiebre. No excedas la dosis indicada." },
      { terms: ["omeprazol"], text: "Reduce el ácido del estómago y se usa para ciertos problemas relacionados con el ácido, según indicación profesional." },
      { terms: ["amoxicilina"], text: "Es un antibiótico para determinadas infecciones bacterianas y debe utilizarse únicamente según la receta." },
      { terms: ["loratadina"], text: "Ayuda a aliviar síntomas de alergia como estornudos, secreción nasal y picazón en los ojos." },
      { terms: ["losartan"], text: "Se utiliza principalmente para tratar la presión arterial alta bajo supervisión médica. No suspendas el tratamiento por tu cuenta." }
    ];
    const found = summaries.find(item => item.terms.some(term => normalized.includes(term)));
    return found ? found.text : "Consulta el envase o a un químico farmacéutico para conocer su uso y precauciones.";
  }

  function renderMedications() {
    const list = document.querySelector(".medication-list");
    const titleCount = document.querySelector(".section-title span");
    if (!list) return;

    const medications = getMedications();

    list.innerHTML = medications.length ? medications.map(med => `
      <article class="med-card">
        <div class="med-icon" aria-hidden="true">+</div>
        <div class="med-info">
          <h3>${escapeHtml(med.name)}</h3>
          <p>${escapeHtml(med.quantity)} ${escapeHtml(med.unit)} · ${escapeHtml(med.time)}</p>
          <small>${escapeHtml(med.frequency)} · ${escapeHtml(med.stock)} disponibles</small>
          <p class="medication-use-summary"><strong>¿Para qué sirve?</strong> ${escapeHtml(getMedicationUseSummary(med.name))}</p>
        </div>
        <span class="med-status ${Number(med.stock) <= 5 ? "pending" : "scheduled"}">
          ${Number(med.stock) <= 5 ? "Por terminar" : "Registrado"}
        </span>
      </article>
    `).join("") : `
      <div class="empty-state-card">
        <div class="empty-state-mark">+</div>
        <h3>Aún no tienes medicamentos registrados</h3>
        <p>Agrega el primer medicamento para organizar sus horarios y recordatorios.</p>
        <button type="button" class="empty-state-button" id="emptyAddMedication">Agregar medicamento</button>
      </div>`;

    document.getElementById("emptyAddMedication")?.addEventListener("click", openMedicationModal);
    if (titleCount) titleCount.textContent = `${medications.length} medicamento${medications.length === 1 ? "" : "s"} registrado${medications.length === 1 ? "" : "s"}`;
    const count = document.getElementById("profileMedicationCount");
    if (count) count.textContent = `${medications.length} medicamento${medications.length === 1 ? "" : "s"}`;
    const lowStock = medications.filter(med => Number(med.stock) <= 5);
    const warning = document.getElementById("stockWarning");
    const warningText = document.getElementById("stockWarningText");
    if (warning) warning.hidden = lowStock.length === 0;
    if (warningText && lowStock.length) warningText.textContent = `Revisa: ${lowStock.map(med => med.name).join(", ")}.`;
    renderMyDay();
  }

  // ---------------- MODAL AGREGAR MEDICAMENTO ----------------
  const medicationModal = document.getElementById("medicationModal");
  const medicationForm = document.getElementById("medicationForm");
  const medMessage = document.getElementById("medMessage");
  const addMedication = document.getElementById("addMedication");

  function openMedicationModal() {
    if (!medicationModal) return;
    medicationModal.classList.add("show");
    setTimeout(() => document.getElementById("medName")?.focus(), 50);
  }

  function closeMedicationModal() {
    if (!medicationModal) return;
    medicationModal.classList.remove("show");
    medicationForm?.reset();
    renderMedicationGuide();
    if (medMessage) medMessage.textContent = "";
  }

  addMedication?.addEventListener("click", openMedicationModal);
  document.getElementById("closeMedication")?.addEventListener("click", closeMedicationModal);
  document.getElementById("cancelMedication")?.addEventListener("click", closeMedicationModal);

  medicationModal?.addEventListener("click", event => {
    if (event.target === medicationModal) closeMedicationModal();
  });

  // ---------------- INFORMACIÓN AUTOMÁTICA DEL MEDICAMENTO ----------------
  // Fichas educativas breves y revisadas para medicamentos comunes.
  // No se generan dosis ni frecuencias: deben seguirse la receta y el envase.
  const medNameInput = document.getElementById("medName");
  const medicationInfoCard = document.getElementById("medicationInfoCard");
  const medicationInfoTitle = document.getElementById("medicationInfoTitle");
  const medicationInfoContent = document.getElementById("medicationInfoContent");

  const medicationGuides = [
    {
      terms: ["ibuprofeno"],
      title: "Ibuprofeno",
      use: "Se usa para aliviar ciertos dolores, como dolor de cabeza, muscular, dental o menstrual, y para reducir la fiebre. También puede reducir la inflamación.",
      tips: [
        "Sigue la dosis y el horario indicados por tu profesional de salud o en el envase.",
        "Tomarlo con comida o leche puede ayudar a reducir las molestias estomacales.",
        "No lo combines con otros antiinflamatorios sin consultar."
      ],
      caution: "Puede irritar el estómago y no es adecuado para todas las personas, especialmente algunas con úlceras, problemas renales o cardíacos, o que toman anticoagulantes.",
      source: "https://medlineplus.gov/spanish/druginfo/meds/a682159-es.html",
      sourceName: "MedlinePlus: ibuprofeno"
    },
    {
      terms: ["paracetamol", "acetaminofen", "acetaminofén"],
      title: "Paracetamol (acetaminofén)",
      use: "Se usa para aliviar el dolor leve o moderado y reducir la fiebre.",
      tips: [
        "Sigue la dosis del envase o de la receta; no tomes más cantidad ni con más frecuencia.",
        "Revisa otros medicamentos para la gripe o el dolor: algunos también contienen paracetamol."
      ],
      caution: "Tomar demasiado puede causar daño grave al hígado. Si tienes enfermedad hepática o dudas sobre otros medicamentos, consulta con un profesional.",
      source: "https://medlineplus.gov/spanish/druginfo/meds/a681004-es.html",
      sourceName: "MedlinePlus: acetaminofeno"
    },
    {
      terms: ["omeprazol"],
      title: "Omeprazol",
      use: "Reduce la producción de ácido del estómago. Se usa para ciertos problemas relacionados con el ácido, según la indicación médica.",
      tips: [
        "Sigue las instrucciones de la presentación y de la receta.",
        "No lo uses para cualquier dolor de estómago sin saber la causa."
      ],
      caution: "Consulta con un profesional si los síntomas persisten, empeoran o aparecen señales de alarma.",
      source: "https://medlineplus.gov/spanish/druginfo/meds/a693050-es.html",
      sourceName: "MedlinePlus: omeprazol"
    },
    {
      terms: ["amoxicilina"],
      title: "Amoxicilina",
      use: "Es un antibiótico utilizado para tratar determinadas infecciones bacterianas cuando lo prescribe un profesional.",
      tips: [
        "Úsala únicamente con receta y sigue exactamente las indicaciones recibidas.",
        "No sirve para resfriados ni otras infecciones causadas por virus."
      ],
      caution: "No la compartas ni guardes sobrantes para otra ocasión. Informa al profesional si tienes alergia a penicilinas.",
      source: "https://medlineplus.gov/spanish/druginfo/meds/a685001-es.html",
      sourceName: "MedlinePlus: amoxicilina"
    },
    {
      terms: ["loratadina"],
      title: "Loratadina",
      use: "Es un antihistamínico que alivia síntomas de alergia, como estornudos, secreción nasal y picazón en los ojos.",
      tips: [
        "Sigue las indicaciones de la etiqueta o de tu profesional de salud.",
        "Comprueba la presentación y consulta antes de combinarla con otros productos para alergia o resfriado."
      ],
      caution: "Si los síntomas son intensos, tienes dificultad para respirar o hinchazón de la cara o garganta, busca atención urgente.",
      source: "https://medlineplus.gov/spanish/druginfo/meds/a697038-es.html",
      sourceName: "MedlinePlus: loratadina"
    },
    {
      terms: ["losartan", "losartán"],
      title: "Losartán",
      use: "Se utiliza principalmente para tratar la presión arterial alta y algunas otras afecciones bajo supervisión médica.",
      tips: [
        "Tómalo siguiendo la pauta prescrita y no suspendas el tratamiento por tu cuenta.",
        "Mantén los controles de presión y las citas indicadas."
      ],
      caution: "Si estás embarazada o podrías estarlo, contacta de inmediato con tu profesional de salud para recibir indicaciones.",
      source: "https://medlineplus.gov/spanish/druginfo/meds/a695008-es.html",
      sourceName: "MedlinePlus: losartán"
    }
  ];

  function normalizeMedicineName(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function renderMedicationGuide() {
    if (!medNameInput || !medicationInfoCard || !medicationInfoContent) return;
    const typedName = medNameInput.value.trim();
    const normalized = normalizeMedicineName(typedName);
    medicationInfoCard.hidden = !normalized;

    if (!normalized) {
      medicationInfoContent.innerHTML = "";
      return;
    }

    const guide = medicationGuides.find(item =>
      item.terms.some(term => normalized.includes(normalizeMedicineName(term)))
    );

    if (!guide) {
      medicationInfoTitle.textContent = "No encontramos una ficha verificada";
      medicationInfoContent.innerHTML = `
        <p>Revisa el nombre y la presentación. Para evitar información incorrecta, no mostraremos consejos automáticos para este medicamento.</p>
        <p>Consulta el envase o pregunta a un químico farmacéutico.</p>`;
      return;
    }

    medicationInfoTitle.textContent = guide.title;
    medicationInfoContent.innerHTML = `
      <div class="medication-info-block">
        <strong>¿Para qué sirve?</strong>
        <p>${guide.use}</p>
      </div>
      <div class="medication-info-block">
        <strong>Consejos generales</strong>
        <ul>${guide.tips.map(tip => `<li>${tip}</li>`).join("")}</ul>
      </div>
      <div class="medication-info-warning">
        <strong>Precaución</strong>
        <p>${guide.caution}</p>
      </div>
      <p class="medication-info-source">Fuente informativa: ${guide.sourceName}</p>
      <p class="medication-info-disclaimer">Esta ficha es educativa. No recomienda una dosis ni un intervalo de toma; sigue la receta y las instrucciones de tu presentación.</p>`;
  }

  medNameInput?.addEventListener("input", renderMedicationGuide);
  medNameInput?.addEventListener("change", renderMedicationGuide);

  medicationForm?.addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("medName").value.trim();
    const quantity = document.getElementById("medQuantity").value;
    const unit = document.getElementById("medUnit").value;
    const time = document.getElementById("medTime").value;
    const frequency = document.getElementById("medFrequency").value;
    const stock = document.getElementById("medStock").value;

    if (!name || !quantity || !time || !stock) {
      if (medMessage) {
        medMessage.style.color = "#c94c4c";
        medMessage.textContent = "Completa todos los campos.";
      }
      return;
    }

    const medications = getMedications();
    medications.push({
      id: Date.now(),
      name,
      quantity,
      unit,
      time,
      frequency,
      stock
    });

    saveMedications(medications);
    renderMedications();
    renderTreatmentGuide();

    if (medMessage) {
      medMessage.style.color = "#08758e";
      medMessage.textContent = "✓ Medicamento guardado correctamente.";
    }

    setTimeout(closeMedicationModal, 700);
  });

  // ---------------- CALENDARIO ----------------
  const calendarGrid = document.getElementById("calendarGrid");
  const calendarMonth = document.getElementById("calendarMonth");
  const takenList = document.getElementById("takenList");
  const selectedDateTitle = document.getElementById("selectedDateTitle");
  const takenCount = document.getElementById("takenCount");
  const takenCountSide = document.getElementById("takenCountSide");

  const medicationHistory = JSON.parse(localStorage.getItem("medicontrolHistorialTomas") || "{}");
  let calendarDate = new Date();
  let selectedDateKey = formatDateKey(calendarDate.getFullYear(), calendarDate.getMonth(), calendarDate.getDate());


  function formatDateKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function getTodayKey() {
    const today = new Date();
    return formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());
  }

  function getScheduledTimes(med) {
    const base = String(med.time || "");
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(base)) return [];
    const [hour, minute] = base.split(":").map(Number);
    const start = hour * 60 + minute;
    const frequency = String(med.frequency || "").toLowerCase();
    let interval = 0;
    if (frequency.includes("cada 8")) interval = 8 * 60;
    if (frequency.includes("cada 12")) interval = 12 * 60;
    if (!interval || frequency.includes("una vez")) return [base];
    const times = [];
    for (let offset = 0; offset < 24 * 60; offset += interval) {
      const total = (start + offset) % (24 * 60);
      times.push(`${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`);
    }
    return [...new Set(times)].sort();
  }

  function isDoseRecorded(dayKey, medicationName, time) {
    return (medicationHistory[dayKey] || []).some(record =>
      String(record?.[0] || "").toLowerCase() === String(medicationName).toLowerCase() && String(record?.[1] || "") === time
    );
  }

  function renderMyDay() {
    const list = document.getElementById("myDayList");
    const progress = document.getElementById("myDayProgress");
    const dateLabel = document.getElementById("myDayDate");
    if (!list) return;

    const today = new Date();
    const todayKey = getTodayKey();
    const meds = getMedications();
    const doses = meds.flatMap(med => getScheduledTimes(med).map(time => ({ med, time })));
    doses.sort((a, b) => a.time.localeCompare(b.time));
    const confirmed = doses.filter(({ med, time }) => isDoseRecorded(todayKey, med.name, time)).length;
    if (progress) progress.textContent = `${confirmed}/${doses.length}`;
    if (dateLabel) dateLabel.textContent = today.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });

    if (!doses.length) {
      list.innerHTML = `<div class="my-day-empty"><strong>Aún no hay tomas programadas</strong><p>Agrega un medicamento con su horario para ver aquí tu plan diario.</p><button type="button" class="empty-state-button" data-open-medication>Agregar medicamento</button></div>`;
      list.querySelector("[data-open-medication]")?.addEventListener("click", openMedicationModal);
      return;
    }

    list.innerHTML = doses.map(({ med, time }) => {
      const done = isDoseRecorded(todayKey, med.name, time);
      const enoughStock = Number(med.stock) >= Number(med.quantity || 1);
      const status = done ? "Confirmada" : (enoughStock ? "Pendiente" : "Sin existencias suficientes");
      return `<article class="my-day-dose ${done ? "is-confirmed" : ""}">
        <div class="my-day-time">${escapeHtml(time)}</div>
        <div class="my-day-dose-info"><strong>${escapeHtml(med.name)}</strong><span>${escapeHtml(med.quantity || "1")} ${escapeHtml(med.unit || "unidad")} · ${escapeHtml(status)}</span></div>
        ${done ? `<span class="dose-done-label" aria-label="Toma confirmada">Confirmada</span>` : `<button type="button" class="dose-confirm-btn" data-confirm-dose="${escapeHtml(med.id)}" data-dose-time="${escapeHtml(time)}" ${enoughStock ? "" : "disabled"}>Ya la tomé</button>`}
      </article>`;
    }).join("");
  }

  document.getElementById("myDayList")?.addEventListener("click", event => {
    const button = event.target.closest("[data-confirm-dose]");
    if (!button) return;
    const medId = button.getAttribute("data-confirm-dose");
    const time = button.getAttribute("data-dose-time");
    const meds = getMedications();
    const med = meds.find(item => String(item.id) === String(medId));
    if (!med) return;
    const dayKey = getTodayKey();
    if (isDoseRecorded(dayKey, med.name, time)) {
      renderMyDay();
      return;
    }
    const amount = Math.max(1, Number(med.quantity) || 1);
    const stock = Math.max(0, Number(med.stock) || 0);
    if (stock < amount) {
      window.alert("No hay suficientes unidades registradas para confirmar esta toma. Revisa el inventario antes de continuar.");
      return;
    }
    med.stock = stock - amount;
    saveMedications(meds);
    if (!medicationHistory[dayKey]) medicationHistory[dayKey] = [];
    medicationHistory[dayKey].push([med.name, time, `${amount} ${med.unit || "unidad"}`]);
    localStorage.setItem("medicontrolHistorialTomas", JSON.stringify(medicationHistory));
    selectedDateKey = dayKey;
    renderMedications();
    renderMyDay();
    renderCalendar();
    renderTakenList(dayKey);
    const status = document.getElementById("historySummaryCount");
    if (status) status.textContent = String(Object.values(medicationHistory).reduce((sum, records) => sum + records.length, 0));
  });

  function renderTakenList(key) {
    if (!takenList || !selectedDateTitle || !takenCount) return;

    const records = medicationHistory[key] || [];
    const [year, month, day] = key.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    selectedDateTitle.textContent =
      `Tomados el ${date.toLocaleDateString("es-PE", { day: "numeric", month: "long" })}`;
    takenCount.textContent = records.length;
    if (takenCountSide) takenCountSide.textContent = records.length;

    if (!records.length) {
      takenList.innerHTML = `
        <div class="empty-taken">
          <span>💊</span>
          <p>No hay medicamentos registrados para este día.</p>
        </div>`;
      return;
    }

    takenList.innerHTML = records.map(([name, time, dose]) => `
      <div class="taken-item">
        <div class="taken-med-icon">💊</div>
        <div class="taken-info">
          <strong>${escapeHtml(name)}</strong>
          <small>${escapeHtml(dose)} · ${escapeHtml(time)}</small>
        </div>
        <span class="taken-status">✓ Tomado</span>
      </div>
    `).join("");
  }

  function renderCalendar() {
    if (!calendarGrid || !calendarMonth) return;

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let start = firstDay.getDay();
    start = start === 0 ? 6 : start - 1;

    let monthName = firstDay.toLocaleDateString("es-PE", {
      month: "long",
      year: "numeric"
    });
    monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    calendarMonth.textContent = monthName;

    calendarGrid.innerHTML = "";

    for (let i = 0; i < start; i++) {
      calendarGrid.insertAdjacentHTML("beforeend", `<div class="calendar-day empty"></div>`);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const key = formatDateKey(year, month, day);
      const records = medicationHistory[key] || [];
      const today = new Date();
      const todayClass = key === formatDateKey(today.getFullYear(), today.getMonth(), today.getDate()) ? "today" : "";
      const selectedClass = key === selectedDateKey ? "selected" : "";
      const takenClass = records.length ? "has-taken" : "";

      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = `calendar-day ${takenClass} ${todayClass} ${selectedClass}`;
      cell.innerHTML = `
        <span class="day-number">${day}</span>
        ${records.length ? `<span class="day-pill">✓ ${records.length} tomas</span>` : ""}
      `;

      cell.addEventListener("click", () => {
        selectedDateKey = key;
        renderCalendar();
        renderTakenList(key);
      });

      calendarGrid.appendChild(cell);
    }
  }

  document.getElementById("prevMonth")?.addEventListener("click", () => {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    renderCalendar();
  });

  document.getElementById("nextMonth")?.addEventListener("click", () => {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    renderCalendar();
  });

  // ---------------- INICIO ----------------
  changeSection("inicio");
  renderMedications();
  renderCalendar();
  renderTakenList(selectedDateKey);

  // ---------------- RECORDATORIOS / ALARMAS ----------------
  const alarmAudio = new Audio("assets/alarma_medicontrol.mp3");
  alarmAudio.preload = "auto";

  const reminderModal = document.getElementById("reminderModal");
  const reminderForm = document.getElementById("reminderForm");
  const reminderMessage = document.getElementById("reminderMessage");
  const alarmGrid = document.getElementById("alarmGrid");

  function openReminderModal() {
    reminderModal?.classList.add("show");
    setTimeout(() => document.getElementById("reminderMedicine")?.focus(), 50);
  }

  function closeReminderModal() {
    reminderModal?.classList.remove("show");
    reminderForm?.reset();
    if (reminderMessage) reminderMessage.textContent = "";
  }

  document.getElementById("addReminder")?.addEventListener("click", openReminderModal);
  document.getElementById("closeReminder")?.addEventListener("click", closeReminderModal);
  document.getElementById("cancelReminder")?.addEventListener("click", closeReminderModal);

  reminderModal?.addEventListener("click", event => {
    if (event.target === reminderModal) closeReminderModal();
  });

  function attachAlarmToggle(button) {
    button.addEventListener("click", () => {
      button.classList.toggle("on");
      const card = button.closest(".alarm-card");
      card?.classList.toggle("active-alarm", button.classList.contains("on"));
    });
  }

  document.querySelectorAll("[data-alarm-toggle]").forEach(attachAlarmToggle);

  function updateAlarmEmptyState() {
    if (!alarmGrid) return;
    const hasCards = alarmGrid.querySelector(".alarm-card");
    let empty = document.getElementById("alarmEmptyState");
    if (!hasCards && !empty) {
      empty = document.createElement("div");
      empty.id = "alarmEmptyState";
      empty.className = "empty-state-card alarm-empty-state";
      empty.innerHTML = `<div class="empty-state-mark">◷</div><h3>Aún no tienes recordatorios</h3><p>Programa una alarma para recibir un aviso a la hora de tu medicamento.</p><button type="button" class="empty-state-button" id="emptyAddReminder">Crear recordatorio</button>`;
      alarmGrid.appendChild(empty);
      document.getElementById("emptyAddReminder")?.addEventListener("click", openReminderModal);
    } else if (hasCards && empty) {
      empty.remove();
    }
    const counter = document.getElementById("profileReminderCount");
    if (counter) counter.textContent = `${alarmGrid.querySelectorAll(".alarm-card").length} alarmas programadas`;
  }
  updateAlarmEmptyState();

  document.getElementById("testAlarmSound")?.addEventListener("click", async () => {
    try {
      alarmAudio.currentTime = 0;
      await alarmAudio.play();
    } catch (error) {
      alert("Presiona nuevamente el botón para permitir el sonido del navegador.");
    }
  });

  document.getElementById("stopAllAlarms")?.addEventListener("click", () => {
    alarmAudio.pause();
    alarmAudio.currentTime = 0;

    // Apaga las alarmas activas visualmente.
    document.querySelectorAll(".alarm-toggle.on").forEach(button => {
      button.classList.remove("on");
      button.closest(".alarm-card")?.classList.remove("active-alarm");
    });
  });

  reminderForm?.addEventListener("submit", event => {
    event.preventDefault();

    const medicine = document.getElementById("reminderMedicine").value.trim();
    const time = document.getElementById("reminderTime").value;
    const frequency = document.getElementById("reminderFrequency").value;

    if (!medicine || !time) {
      reminderMessage.style.color = "#c94c4c";
      reminderMessage.textContent = "Completa todos los campos.";
      return;
    }

    const [hour, minute] = time.split(":");
    const displayHour = Number(hour) % 12 || 12;
    const period = Number(hour) >= 12 ? "PM" : "AM";
    const displayTime = `${String(displayHour).padStart(2, "0")}:${minute}`;

    const card = document.createElement("article");
    card.className = "alarm-card active-alarm";
    card.innerHTML = `
      <div class="alarm-time">${displayTime} <small>${period}</small></div>
      <div class="alarm-info">
        <strong>${escapeHtml(medicine)}</strong>
        <span>💊 1 tableta · ${escapeHtml(frequency)}</span>
      </div>
      <button class="alarm-toggle on" type="button" data-alarm-toggle aria-label="Activar o desactivar alarma">
        <span></span>
      </button>
    `;

    alarmGrid.appendChild(card);
    attachAlarmToggle(card.querySelector("[data-alarm-toggle]"));
    updateAlarmEmptyState();

    reminderMessage.style.color = "#08758e";
    reminderMessage.textContent = "✓ Alarma programada correctamente.";

    setTimeout(closeReminderModal, 700);
  });

  // Revisa las alarmas cada segundo. El sonido exacto que subiste se reproduce
  // cuando coincide la hora programada y la alarma está activa.
  setInterval(() => {
    const now = new Date();
    const current = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    document.querySelectorAll(".alarm-card.active-alarm").forEach(card => {
      const timeElement = card.querySelector(".alarm-time");
      if (!timeElement) return;

      const text = timeElement.textContent.trim();
      const match = text.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!match) return;

      let hour = Number(match[1]);
      const minute = match[2];
      const period = match[3].toUpperCase();

      if (period === "PM" && hour !== 12) hour += 12;
      if (period === "AM" && hour === 12) hour = 0;

      const scheduled = `${String(hour).padStart(2, "0")}:${minute}`;

      if (scheduled === current && card.dataset.lastTriggered !== current) {
        card.dataset.lastTriggered = current;
        alarmAudio.currentTime = 0;
        alarmAudio.play().catch(() => {});
      }
    });
  }, 1000);


  // ---------------- HISTORIAL ----------------
  const historyDate = document.getElementById("historyDate");
  const historyStatus = document.getElementById("historyStatus");
  const clearHistoryFilters = document.getElementById("clearHistoryFilters");
  const historyItems = document.querySelectorAll(".history-item");
  const historyEmpty = document.getElementById("historyEmpty");
  const historyDateLabel = document.getElementById("historyDateLabel");
  const historyTotal = document.getElementById("historyTotal");

  function filterHistory() {
    const selectedDate = historyDate?.value || "";
    const selectedStatus = historyStatus?.value || "todos";
    let visible = 0;

    historyItems.forEach(item => {
      const matchesDate = !selectedDate || item.dataset.date === selectedDate;
      const matchesStatus = selectedStatus === "todos" || item.dataset.status === selectedStatus;
      const show = matchesDate && matchesStatus;

      item.style.display = show ? "flex" : "none";
      if (show) visible++;
    });

    if (historyEmpty) historyEmpty.classList.toggle("show", visible === 0);

    if (historyDateLabel) {
      if (selectedDate) {
        const [y, m, d] = selectedDate.split("-");
        const date = new Date(Number(y), Number(m) - 1, Number(d));
        historyDateLabel.textContent = date.toLocaleDateString("es-PE", {
          day: "numeric",
          month: "long",
          year: "numeric"
        });
      } else {
        historyDateLabel.textContent = "Todos los registros";
      }
    }
  }

  historyDate?.addEventListener("change", filterHistory);
  historyStatus?.addEventListener("change", filterHistory);

  clearHistoryFilters?.addEventListener("click", () => {
    if (historyDate) historyDate.value = "";
    if (historyStatus) historyStatus.value = "todos";
    filterHistory();
  });

  if (historyTotal) historyTotal.textContent = historyItems.length;
  if (historyEmpty && historyItems.length === 0) historyEmpty.classList.add("show");
  filterHistory();


  // ---------------- GUÍA DE MEDICAMENTOS REGISTRADOS ----------------
  const treatmentGrid = document.getElementById("treatmentGrid");

  function findMedicationGuide(name) {
    const normalized = normalizeMedicineName(name);
    return medicationGuides.find(item =>
      item.terms.some(term => normalized.includes(normalizeMedicineName(term)))
    ) || null;
  }

  function renderTreatmentGuide() {
    if (!treatmentGrid) return;
    const medications = getMedications();
    if (!medications.length) {
      treatmentGrid.innerHTML = `
        <div class="empty-state-card treatment-empty-state">
          <div class="empty-state-mark">+</div>
          <h3>Aún no tienes medicamentos registrados</h3>
          <p>Cuando agregues uno en «Mis medicamentos», aquí aparecerá su información y el horario que registraste.</p>
          <button type="button" class="empty-state-button" data-go="medicamentos">Ir a Mis medicamentos</button>
        </div>`;
      treatmentGrid.querySelector('[data-go="medicamentos"]')?.addEventListener("click", () => {
        document.querySelector('.nav-item[data-section="medicamentos"]')?.click();
      });
      return;
    }

    treatmentGrid.innerHTML = medications.map(med => {
      const guide = findMedicationGuide(med.name);
      const use = guide ? guide.use : "No tenemos una ficha educativa verificada para este nombre. Revisa el envase o consulta a un químico farmacéutico.";
      const caution = guide ? guide.caution : "No sigas instrucciones generales sin confirmar el medicamento y su presentación.";
      const tips = guide ? `<ul class="medication-guide-tips">${guide.tips.map(tip => `<li>${escapeHtml(tip)}</li>`).join("")}</ul>` : "";
      return `
        <article class="treatment-card medication-guide-card">
          <div class="treatment-top">
            <div class="treatment-icon" aria-hidden="true">＋</div>
            <span class="treatment-status active">Registrado</span>
          </div>
          <h3>${escapeHtml(med.name)}</h3>
          <div class="medication-guide-block">
            <strong>¿Para qué sirve?</strong>
            <p>${escapeHtml(use)}</p>
          </div>
          <div class="medication-guide-schedule">
            <strong>Tu pauta registrada</strong>
            <div class="medication-guide-facts">
              <div><span>Cantidad por toma</span><b>${escapeHtml(med.quantity || "No indicada")} ${escapeHtml(med.unit || "")}</b></div>
              <div><span>Frecuencia</span><b>${escapeHtml(med.frequency || "No indicada")}</b></div>
              <div><span>Horario registrado</span><b>${escapeHtml(med.time || "No indicado")}</b></div>
              <div><span>Existencias registradas</span><b>${escapeHtml(med.stock ?? "No indicado")}</b></div>
            </div>
          </div>
          ${tips ? `<div class="medication-guide-block"><strong>Consejos generales</strong>${tips}</div>` : ""}
          <div class="medication-guide-warning"><strong>Precaución</strong><p>${escapeHtml(caution)}</p></div>
          <p class="medication-guide-source">${guide ? `Fuente informativa: ${escapeHtml(guide.sourceName)}` : "Fuente informativa no disponible para este medicamento."}</p>
          <p class="medication-guide-note">La cantidad y frecuencia mostradas son las que registraste, no una indicación médica. Sigue tu receta o las instrucciones de la presentación; no cambies la dosis por esta ficha.</p>
        </article>`;
    }).join("");
  }

  // La guía se actualiza al entrar en la sección y cuando se registra un medicamento.
  const originalRenderMedications = renderMedications;
  // Refrescar la guía desde los puntos donde cambia la lista de medicamentos.
  document.querySelectorAll('.nav-item[data-section="tratamientos"], [data-go="tratamientos"]').forEach(button => {
    button.addEventListener("click", renderTreatmentGuide);
  });
  renderTreatmentGuide();

  // ---------------- MI PERFIL ----------------
  const profileModal = document.getElementById("profileModal");
  const profileForm = document.getElementById("profileForm");
  const profileMessage = document.getElementById("profileMessage");

  function updateProfileView(name) {
    const cleanName = name.trim() || "Mi cuenta";
    const firstName = cleanName.split(/\s+/)[0] || "Mi cuenta";
    const initial = firstName.charAt(0).toUpperCase() || "M";

    document.getElementById("profileDisplayName").textContent = firstName;
    document.getElementById("profileFullName").textContent = cleanName;
    document.getElementById("profileInfoName").textContent = cleanName;
    document.getElementById("profileAvatar").textContent = initial;

    if (profileName) profileName.textContent = firstName === "Mi cuenta" ? "Mi cuenta" : firstName;
    if (profileInitial) profileInitial.textContent = initial || "M";
    if (homeName) homeName.textContent = firstName === "Mi cuenta" ? "bienvenido/a" : firstName;
  }

  function openProfileModal() {
    const currentName = localStorage.getItem("medicontrolUsuario") || localStorage.getItem("medicontrolUsuarioActivo") || "";
    const currentDni = localStorage.getItem("medicontrolDni") || "";

    document.getElementById("profileNameInput").value = currentName;
    document.getElementById("profileDniInput").value = currentDni;

    profileModal?.classList.add("show");
  }

  function closeProfileModal() {
    profileModal?.classList.remove("show");
    profileForm?.reset();
    if (profileMessage) profileMessage.textContent = "";
  }

  document.getElementById("editProfile")?.addEventListener("click", openProfileModal);
  document.getElementById("closeProfile")?.addEventListener("click", closeProfileModal);
  document.getElementById("cancelProfile")?.addEventListener("click", closeProfileModal);

  profileModal?.addEventListener("click", event => {
    if (event.target === profileModal) closeProfileModal();
  });

  profileForm?.addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("profileNameInput").value.trim();
    const dni = document.getElementById("profileDniInput").value.trim();

    if (!name || !/^\d{8}$/.test(dni)) {
      profileMessage.style.color = "#c94c4c";
      profileMessage.textContent = "El nombre es obligatorio y el DNI debe tener 8 números.";
      return;
    }

    localStorage.setItem("medicontrolUsuario", name);
    localStorage.setItem("medicontrolDni", dni);

    updateProfileView(name);
    document.getElementById("profileDni").textContent = "••••••••";
    document.getElementById("profileInfoDni").textContent = "••••••••";

    profileMessage.style.color = "#08758e";
    profileMessage.textContent = "✓ Perfil actualizado correctamente.";

    setTimeout(closeProfileModal, 700);
  });

  // ---------------- PLANES Y SUSCRIPCIÓN ----------------
  const subscriptionStatus = document.getElementById("subscriptionStatus");
  const currentPlanName = document.getElementById("currentPlanName");
  const currentPlanDescription = document.getElementById("currentPlanDescription");
  const startPremiumTrial = document.getElementById("startPremiumTrial");
  const chooseFreePlan = document.getElementById("chooseFreePlan");
  const managePlanButton = document.getElementById("managePlanButton");

  function getSubscriptionState() {
    let plan = localStorage.getItem("medicontrolPlan") || "gratis";
    const end = Number(localStorage.getItem("medicontrolTrialEnd") || 0);
    if (plan === "premium" && end && end <= Date.now()) {
      localStorage.setItem("medicontrolPlan", "gratis");
      plan = "gratis";
      return { plan, active: false, expired: true, days: 0 };
    }
    const expired = localStorage.getItem("medicontrolTrialUsed") === "true" && end > 0 && end <= Date.now() && plan !== "premium";
    return { plan, active: plan === "premium", expired, days: end ? Math.max(0, Math.ceil((end - Date.now()) / 86400000)) : 0 };
  }

  function renderSubscription() {
    const state = getSubscriptionState();
    if (subscriptionStatus) {
      subscriptionStatus.textContent = state.active ? `Prueba activa · ${state.days} día${state.days === 1 ? "" : "s"} restante${state.days === 1 ? "" : "s"}` : state.expired ? "Prueba finalizada" : "Plan gratuito";
      subscriptionStatus.classList.toggle("is-premium", state.active);
    }
    if (currentPlanName) currentPlanName.textContent = state.active ? "MediControl Plus · Prueba" : "MediControl Gratis";
    if (currentPlanDescription) currentPlanDescription.textContent = state.active ? `Tu prueba estará activa durante ${state.days} día${state.days === 1 ? "" : "s"} más. No se ha realizado ningún cobro.` : state.expired ? "Tu prueba terminó. Puedes seguir usando las funciones gratuitas." : "Funciones esenciales para organizar tus medicamentos, sin costo.";
    if (startPremiumTrial) {
      const used = localStorage.getItem("medicontrolTrialUsed") === "true";
      startPremiumTrial.disabled = state.active || used;
      startPremiumTrial.textContent = state.active ? "Prueba Premium activa" : used ? "Prueba gratuita ya utilizada" : "Probar Premium por 30 días";
    }
    if (chooseFreePlan) chooseFreePlan.textContent = state.active ? "Volver al plan gratuito" : "Plan gratuito seleccionado";
  }

  startPremiumTrial?.addEventListener("click", () => {
    if (localStorage.getItem("medicontrolTrialUsed") === "true") return;
    const now = Date.now();
    localStorage.setItem("medicontrolPlan", "premium");
    localStorage.setItem("medicontrolTrialUsed", "true");
    localStorage.setItem("medicontrolTrialStart", String(now));
    localStorage.setItem("medicontrolTrialEnd", String(now + 30 * 86400000));
    renderSubscription();
  });

  chooseFreePlan?.addEventListener("click", () => {
    localStorage.setItem("medicontrolPlan", "gratis");
    localStorage.removeItem("medicontrolTrialEnd");
    renderSubscription();
  });

  managePlanButton?.addEventListener("click", () => {
    const state = getSubscriptionState();
    alert(state.active ? `Tu prueba de MediControl Plus está activa. Quedan ${state.days} días. Esta versión no procesa pagos.` : "Tu cuenta utiliza MediControl Gratis. Puedes iniciar la prueba Premium desde esta pantalla.");
  });

  document.getElementById("stockSearchPharmacy")?.addEventListener("click", () => {
    const low = getMedications().filter(med => Number(med.stock) <= 5);
    const pharmacyNav = document.querySelector('.nav-item[data-section="farmacias"]');
    if (pharmacyNav) pharmacyNav.click();
    if (pharmacyMedicine && low.length) {
      pharmacyMedicine.value = low[0].name;
      renderPharmacyOptions(low[0].name);
    }
  });

  // ---------------- COMPARADOR DE FARMACIAS: precios simulados dinámicos ----------------
  const pharmacyForm = document.getElementById("pharmacyForm");
  const pharmacyMedicine = document.getElementById("pharmacyMedicine");
  const pharmacyResults = document.getElementById("pharmacyResults");

  // Valores de demostración por medicamento/presentación. No son cotizaciones reales.
  // Se comparan presentaciones equivalentes de ejemplo y se ordenan por precio.
  const pharmacyDemoCatalog = [
    { terms: ["ibuprofeno"], base: 8.40, presentation: "Caja de 10 tabletas · concentración por confirmar" },
    { terms: ["paracetamol", "acetaminofen", "acetaminofén"], base: 4.20, presentation: "Caja de 10 tabletas · concentración por confirmar" },
    { terms: ["aspirina", "acido acetilsalicilico", "ácido acetilsalicílico"], base: 5.60, presentation: "Caja de 10 tabletas · presentación por confirmar" },
    { terms: ["loratadina"], base: 6.90, presentation: "Caja de 10 tabletas · concentración por confirmar" },
    { terms: ["cetirizina"], base: 7.30, presentation: "Caja de 10 tabletas · concentración por confirmar" },
    { terms: ["omeprazol"], base: 8.80, presentation: "Caja de 14 cápsulas · concentración por confirmar" },
    { terms: ["amoxicilina"], base: 12.50, presentation: "Envase de demostración · requiere validar concentración y presentación" },
    { terms: ["metformina"], base: 9.70, presentation: "Caja de 30 tabletas · concentración por confirmar" },
    { terms: ["losartan", "losartán"], base: 10.20, presentation: "Caja de 30 tabletas · concentración por confirmar" },
    { terms: ["atorvastatina"], base: 11.40, presentation: "Caja de 30 tabletas · concentración por confirmar" },
    { terms: ["diclofenaco"], base: 7.80, presentation: "Caja de 10 tabletas · concentración por confirmar" },
    { terms: ["naproxeno"], base: 9.20, presentation: "Caja de 10 tabletas · concentración por confirmar" },
    { terms: ["vitamina c", "acido ascorbico", "ácido ascórbico"], base: 6.20, presentation: "Envase de demostración · presentación por confirmar" }
  ];
  const pharmacyDemoBrands = [
    { name: "Inkafarma", logo: "assets/inkafarma.png", factor: 1.00, search: "Inkafarma" },
    { name: "Boticas Perú", logo: "assets/boticas-peru.png", factor: 1.13, search: "Boticas Perú" },
    { name: "Mifarma", logo: "assets/mifarma.png", factor: 1.25, search: "Mifarma" }
  ];

  function normalizePharmacyText(value) {
    return String(value || "").toLocaleLowerCase("es-PE").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function getPharmacyDemoBase(medicine) {
    const normalized = normalizePharmacyText(medicine);
    const match = pharmacyDemoCatalog.find(item => item.terms.some(term => normalized.includes(normalizePharmacyText(term))));
    if (match) return { base: match.base, presentation: match.presentation, known: true };

    // Para medicamentos no catalogados, genera un precio de ejemplo estable
    // según el texto introducido; nunca se presenta como precio real.
    let hash = 0;
    for (const character of normalized) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
    const base = 5 + (hash % 1800) / 100;
    return { base: Math.round(base * 100) / 100, presentation: "Presentación no verificada · revisar concentración y cantidad", known: false };
  }

  function renderPharmacyOptions(medicine) {
    const cleanMedicine = String(medicine || "").trim();
    if (!cleanMedicine || !pharmacyResults) return;
    const demo = getPharmacyDemoBase(cleanMedicine);
    const options = pharmacyDemoBrands.map(brand => ({
      ...brand,
      price: Math.round(demo.base * brand.factor * 100) / 100,
      presentation: demo.presentation
    })).sort((a, b) => a.price - b.price);

    pharmacyResults.innerHTML = `<div class="pharmacy-results-heading"><h3>Opciones para ${escapeHtml(cleanMedicine)}</h3><p>Precios de demostración calculados para este medicamento, ordenados del menor al mayor.</p></div>` + options.map((item, index) => {
      const url = `https://www.google.com/search?q=${encodeURIComponent(item.search + " " + cleanMedicine + " comprar delivery Perú")}`;
      return `<article class="pharmacy-price-card"><div class="pharmacy-price-rank">${index + 1}</div><div class="pharmacy-brand-logo"><img src="${item.logo}" alt="Logo de ${escapeHtml(item.name)}" loading="lazy"></div><div class="pharmacy-price-info"><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(cleanMedicine)}</p><small>${escapeHtml(item.presentation)}</small><small>Precio simulado · disponibilidad no verificada</small></div><div class="pharmacy-price-action"><strong>S/ ${item.price.toFixed(2)}</strong><a href="${url}" target="_blank" rel="noopener noreferrer">Consultar compra / delivery ↗</a></div></article>`;
    }).join("") + `<p class="pharmacy-demo-footnote">Todos los importes son ficticios y cambian según el medicamento escrito. No son precios reales de las farmacias ni confirman stock. Verifica principio activo, concentración, presentación y disponibilidad con el establecimiento o en DIGEMID.</p>`;
  }

  pharmacyForm?.addEventListener("submit", event => {
    event.preventDefault();
    const medicine = pharmacyMedicine?.value.trim() || "";
    if (!medicine) { pharmacyMedicine?.focus(); return; }
    renderPharmacyOptions(medicine);
  });
  // Los datos de la cuenta se muestran sin nombres ficticios.
  updateProfileView(localStorage.getItem("medicontrolUsuario") || localStorage.getItem("medicontrolUsuarioActivo") || "");
  renderMedications();
  renderSubscription();

});
