/* =========================================================
   FILE: js/app.js
   FUNGSI: Mengatur interaksi formulir Risk Assessment:
           - Tahap 1: Tipe PTW, Lokasi/Area ORF, Masa Pakai 7 Hari,
             Tim Kaji Risiko, dan 4 Baris Tetap RA Reviewer.
           - Tahap 2: Identifikasi Bahaya, Penilaian Risiko Awal
             (Dropdown Tabel Interaktif Severity 5-1 Fokus Dampak
             Manusia Lengkap & Probability 5-1 + Warna Matriks 5x5),
             Hirarki Tindakan Pengendalian (EL, SB, EC, AD, APD),
             serta Penilaian Risiko Sisa otomatis (Tanpa Emoji).
   ========================================================= */

window.PrakarsaApp = (function () {
  const STORAGE_KEY = "prakarsa_ra_documents_v2";

  let selectedCategory = "general";
  let selectedSite = "Onshore Receiving Facility";
  let selectedArea = "Area Proses";
  let currentStatusFilter = "ALL";
  let currentRAStep = 1;

  // State Tahap 3: Task Hazard Assessment (THA)
  let thaState = {};
  let thaSearchQuery = "";
  let showOnlySelectedTHA = false;

  // Data dinamis Langkah Pekerjaan di Tahap 2
  let hazardSteps = [
    {
      stepDescription: "",
      hazard: "",
      impact: "",
      initialSeverity: 0,
      initialProbability: 0,
      controls: [
        {
          type: "EC",
          text: ""
        }
      ],
      residualSeverity: 0,
      residualProbability: 0
    }
  ];

  function showToast(message) {
    const toast = document.getElementById("toastNotification");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3400);
  }

  // =========================================================
  // NAVIGASI ANTAR TAHAP (TAHAP 1 <-> TAHAP 2 <-> TAHAP 3)
  // =========================================================
  function switchRAStep(stepNum) {
    currentRAStep = stepNum;
    const view1 = document.getElementById("raStep1View");
    const view2 = document.getElementById("raStep2View");
    const view3 = document.getElementById("raStep3View");
    const pill1 = document.getElementById("stepPill1");
    const pill2 = document.getElementById("stepPill2");
    const pill3 = document.getElementById("stepPill3");

    if (view1) view1.classList.toggle("active", stepNum === 1);
    if (view2) view2.classList.toggle("active", stepNum === 2);
    if (view3) view3.classList.toggle("active", stepNum === 3);

    if (pill1) pill1.classList.toggle("active", stepNum === 1);
    if (pill2) pill2.classList.toggle("active", stepNum === 2);
    if (pill3) pill3.classList.toggle("active", stepNum === 3);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function initStepNavigation() {
    const pill1 = document.getElementById("stepPill1");
    const pill2 = document.getElementById("stepPill2");
    const pill3 = document.getElementById("stepPill3");
    const btnGoToStep2 = document.getElementById("btnGoToStep2");
    const btnBackToStep1 = document.getElementById("btnBackToStep1");
    const btnGoToStep3 = document.getElementById("btnGoToStep3");
    const btnBackToStep2 = document.getElementById("btnBackToStep2");

    if (pill1) {
      pill1.addEventListener("click", () => switchRAStep(1));
    }
    if (pill2) {
      pill2.addEventListener("click", () => switchRAStep(2));
    }
    if (pill3) {
      pill3.addEventListener("click", () => switchRAStep(3));
    }
    if (btnGoToStep2) {
      btnGoToStep2.addEventListener("click", () => {
        switchRAStep(2);
        showToast("Memasuki Tahap 2: Identifikasi Bahaya, Penilaian Risiko & Pengendalian.");
      });
    }
    if (btnBackToStep1) {
      btnBackToStep1.addEventListener("click", () => {
        switchRAStep(1);
      });
    }
    if (btnGoToStep3) {
      btnGoToStep3.addEventListener("click", () => {
        switchRAStep(3);
        showToast("Memasuki Tahap 3: Task Hazard Assessment (THA).");
      });
    }
    if (btnBackToStep2) {
      btnBackToStep2.addEventListener("click", () => {
        switchRAStep(2);
      });
    }
  }

  // =========================================================
  // BAGIAN TAHAP 1: KATEGORI, SITE, AREA, REGISTRASI, TIM
  // =========================================================
  function renderWorkCategories() {
    const container = document.getElementById("workTypeGrid");
    if (!container) return;

    const categories = window.PRAKARSA_DATA.workCategories;
    container.innerHTML = "";

    categories.forEach((cat) => {
      const isSelected = cat.id === selectedCategory;
      const card = document.createElement("div");
      card.className = `work-type-card ${cat.cssClass} ${isSelected ? "selected" : ""}`;
      card.setAttribute("role", "radio");
      card.setAttribute("aria-checked", isSelected ? "true" : "false");
      card.tabIndex = 0;

      const strokeColor = cat.id === "critical" ? "#FFD400" : cat.colorHex;

      card.innerHTML = `
        <span class="radio-indicator">
          <svg class="radio-check-svg" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </span>
        <span class="work-type-label">${cat.label}</span>
      `;

      card.addEventListener("click", () => {
        selectedCategory = cat.id;
        renderWorkCategories();
        updateK3EducationalBanner(true);
      });

      container.appendChild(card);
    });
  }

  function updateK3EducationalBanner(forceShow) {
    const banner = document.getElementById("k3EduBanner");
    if (!banner) return;

    const catObj = window.PRAKARSA_DATA.workCategories.find((c) => c.id === selectedCategory);
    if (!catObj) return;

    banner.style.borderLeftColor = catObj.colorHex;
    banner.innerHTML = `
      <strong>Panduan K3 — ${catObj.label}</strong>
      <div>${catObj.description}</div>
      <div class="k3-edu-examples">
        <em>Contoh pekerjaan:</em> ${catObj.examples.join(" • ")}.
        <br/><small>*Klasifikasi akhir tetap mengacu pada prosedur SIKA / PTW yang berlaku di PHE WMO.</small>
      </div>
    `;

    if (forceShow) {
      banner.classList.add("visible");
    }
  }

  function renderSiteLocations() {
    const container = document.getElementById("siteLocationGrid");
    if (!container) return;

    const sites = window.PRAKARSA_DATA.siteLocations;
    container.innerHTML = "";

    sites.forEach((siteName) => {
      const isSelected = siteName === selectedSite;
      const card = document.createElement("div");
      card.className = `choice-card ${isSelected ? "selected" : ""}`;
      card.innerHTML = `
        <span class="choice-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="#E31E24" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </span>
        <span>${siteName}</span>
      `;

      card.addEventListener("click", () => {
        selectedSite = siteName;
        const availableAreas = window.PRAKARSA_DATA.workAreasBySite[selectedSite] || [];
        selectedArea = availableAreas.length > 0 ? availableAreas[0] : "";
        renderSiteLocations();
        renderWorkAreas();
      });

      container.appendChild(card);
    });
  }

  function renderWorkAreas() {
    const wrapper = document.getElementById("workAreaWrapper");
    if (!wrapper) return;

    const areas = window.PRAKARSA_DATA.workAreasBySite[selectedSite] || [];
    wrapper.innerHTML = "";

    if (areas.length === 0) {
      const infoBox = document.createElement("div");
      infoBox.className = "area-unavailable-box";
      infoBox.innerHTML = `
        <strong>Informasi Pemetaan Area Kerja — ${selectedSite}</strong>
        Daftar pilihan area pekerjaan untuk fasilitas <strong>${selectedSite}</strong> saat ini belum tersedia dan sedang dalam tahap pembaruan data sistem. Silakan tuliskan detail area kerja Anda secara langsung pada kolom <strong>Lokasi Spesifik</strong> di bawah ini.
      `;
      wrapper.appendChild(infoBox);
      return;
    }

    const grid = document.createElement("div");
    grid.className = "option-grid-4col";

    areas.forEach((areaName) => {
      const isSelected = areaName === selectedArea;
      const card = document.createElement("div");
      card.className = `choice-card ${isSelected ? "selected" : ""}`;
      card.innerHTML = `
        <span class="choice-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="#E31E24" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </span>
        <span>${areaName}</span>
      `;

      card.addEventListener("click", () => {
        selectedArea = areaName;
        renderWorkAreas();
      });

      grid.appendChild(card);
    });

    wrapper.appendChild(grid);
  }

  function formatDateID(dateStr) {
    if (!dateStr) return "-";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parts[2];
    return `${day} ${months[monthIdx] || parts[1]} ${year}`;
  }

  function addDaysToDateString(dateStr, daysToAdd) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + daysToAdd);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function initRegistrationDateValidity() {
    const regDateInput = document.getElementById("regDate");
    const validityBox = document.getElementById("raValidityInfo");
    if (!regDateInput || !validityBox) return;

    regDateInput.addEventListener("change", () => {
      const startVal = regDateInput.value;
      if (!startVal) {
        validityBox.classList.remove("active-validity");
        validityBox.innerHTML = `Masa berlaku dokumen RA adalah <strong>7 hari</strong> sejak tanggal registrasi dipilih.`;
        return;
      }

      const endVal = addDaysToDateString(startVal, 6);
      validityBox.classList.add("active-validity");
      validityBox.innerHTML = `
        <strong>Masa Berlaku RA (7 Hari):</strong> ${formatDateID(startVal)} s/d <strong>${formatDateID(endVal)}</strong>
      `;
    });
  }

  function bindSignatureInputs(rootEl) {
    const fileInputs = (rootEl || document).querySelectorAll(".hidden-file-input");
    fileInputs.forEach((input) => {
      if (input.id === "excelTemplateInput") return;
      if (input._bound) return;
      input._bound = true;
      input.addEventListener("change", () => {
        const labelSpan = input.parentElement.querySelector(".signature-placeholder");
        if (!labelSpan) return;
        if (input.files && input.files.length > 0) {
          labelSpan.textContent = "Terunggah: " + input.files[0].name;
          labelSpan.classList.add("has-file");
        } else {
          labelSpan.textContent = "Unggah soft file tanda tangan (opsional)";
          labelSpan.classList.remove("has-file");
        }
      });
    });
  }

  function initTeamMembersHandler() {
    const btnAdd = document.getElementById("btnAddTeamMember");
    const container = document.getElementById("teamMembersContainer");
    if (!btnAdd || !container) return;

    btnAdd.addEventListener("click", () => {
      const row = document.createElement("div");
      row.className = "person-grid-3col team-member-row";
      row.innerHTML = `
        <div class="field-group">
          <label class="field-label">Nama Tim</label>
          <div class="input-with-icon">
            <span class="input-icon">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <line x1="8" y1="13" x2="16" y2="13"></line>
                <line x1="8" y1="17" x2="13" y2="17"></line>
              </svg>
            </span>
            <input type="text" name="teamName[]" placeholder="Masukkan nama anggota tim kaji risiko" />
          </div>
        </div>
        <div class="field-group">
          <label class="field-label">Jabatan</label>
          <div class="input-with-icon select-with-icon">
            <span class="input-icon">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                <line x1="7" y1="9" x2="17" y2="9"></line>
                <line x1="7" y1="14" x2="13" y2="14"></line>
              </svg>
            </span>
            <select name="teamRole[]" class="role-select-dropdown">
              <option value="" disabled selected>Pilih jabatan tim kaji risiko</option>
              <option value="Risk Assessment Facilitator">Risk Assessment Facilitator</option>
              <option value="AA">AA (Area Authority)</option>
              <option value="PA">PA (Performing Authority)</option>
              <option value="Member">Member</option>
              <option value="SC">SC (Site Controller)</option>
            </select>
          </div>
        </div>
        <div class="field-group">
          <label class="field-label">Tanda Tangan <span class="optional-tag">(Opsional)</span></label>
          <label class="input-with-icon file-signature-box">
            <span class="input-icon">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
              </svg>
            </span>
            <span class="signature-placeholder">Unggah soft file tanda tangan (opsional)</span>
            <input type="file" name="teamSign[]" accept="image/*,.pdf" class="hidden-file-input" />
          </label>
        </div>
      `;
      container.appendChild(row);
      bindSignatureInputs(row);
      showToast("Baris anggota Tim Kaji Risiko berhasil ditambahkan.");
    });
  }

  // =========================================================
  // BAGIAN TAHAP 2: IDENTIFIKASI BAHAYA, DROPDOWN TABEL
  //                 INTERAKTIF (LEVEL 5 KE 1), MATRIKS RISIKO,
  //                 HIRARKI PENGENDALIAN & RISIKO SISA
  // =========================================================
  function initMatrixReferenceDrawer() {
    const btnToggle = document.getElementById("btnToggleMatrixReference");
    const btnClose = document.getElementById("btnCloseMatrixReference");
    const drawer = document.getElementById("matrixReferenceDrawer");
    if (!drawer) return;

    if (btnToggle) {
      btnToggle.addEventListener("click", () => {
        drawer.classList.toggle("visible");
      });
    }
    if (btnClose) {
      btnClose.addEventListener("click", () => {
        drawer.classList.remove("visible");
      });
    }
  }

  // Menampilkan keterangan lengkap Dampak terhadap Manusia setelah Severity dipilih
  function buildSeverityCriteriaHTML(sevVal) {
    const sevObj = window.PRAKARSA_DATA.severityLevels.find((s) => s.value === Number(sevVal));
    if (!sevObj) return "";
    return `
      <div class="criteria-mini-grid">
        <div><strong>Dampak terhadap Manusia (${sevObj.label}):</strong> ${sevObj.manusia}</div>
      </div>
    `;
  }

  // Menampilkan keterangan lengkap Panduan Penilaian setelah Probability dipilih
  function buildProbabilityCriteriaHTML(probVal) {
    const probObj = window.PRAKARSA_DATA.probabilityLevels.find((p) => p.value === Number(probVal));
    if (!probObj) return "";
    return `
      <div class="criteria-mini-grid">
        <div><strong>Kategori (${probObj.value} – ${probObj.category}):</strong> ${probObj.guide}</div>
      </div>
    `;
  }

  // Membuat Tabel Dropdown Interaktif untuk Keparahan (Severity) urut Level 5 ke 1
  function buildSeverityTablePickerHTML(selectedVal, pickerClass, placeholderText) {
    const sevListDesc = [...window.PRAKARSA_DATA.severityLevels].sort((a, b) => b.value - a.value);
    const chosen = sevListDesc.find((s) => s.value === Number(selectedVal));

    const triggerLabel = chosen
      ? `${chosen.label} — ${chosen.manusia.split(":")[0]}`
      : placeholderText;

    const rowsHTML = sevListDesc
      .map(
        (s) => `
        <tr class="picker-dropdown-row ${Number(selectedVal) === s.value ? "active-row" : ""}" data-val="${s.value}">
          <td style="width:155px;">
            <span class="picker-level-badge" style="background:${s.badgeColor}; color:${s.textColor};">
              ${s.label}
            </span>
          </td>
          <td>${s.manusia}</td>
        </tr>
      `
      )
      .join("");

    return `
      <div class="custom-picker-wrapper ${pickerClass}">
        <button type="button" class="custom-picker-trigger">
          <span>${triggerLabel}</span>
          <span class="picker-chevron">▼</span>
        </button>
        <div class="custom-picker-dropdown-panel">
          <table class="picker-dropdown-table">
            <thead>
              <tr>
                <th style="width:155px;">Level Keparahan</th>
                <th>Keterangan Dampak terhadap Manusia</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // Membuat Tabel Dropdown Interaktif untuk Kemungkinan (Probability) urut Nilai 5 ke 1
  function buildProbabilityTablePickerHTML(selectedVal, pickerClass, placeholderText) {
    const probListDesc = [...window.PRAKARSA_DATA.probabilityLevels].sort((a, b) => b.value - a.value);
    const chosen = probListDesc.find((p) => p.value === Number(selectedVal));

    const triggerLabel = chosen ? `${chosen.label}` : placeholderText;

    const rowsHTML = probListDesc
      .map(
        (p) => `
        <tr class="picker-dropdown-row ${Number(selectedVal) === p.value ? "active-row" : ""}" data-val="${p.value}">
          <td style="width:70px; text-align:center;">
            <span class="picker-level-badge" style="background:${p.badgeColor}; color:${p.textColor};">
              ${p.value}
            </span>
          </td>
          <td style="width:165px;"><strong>${p.category}</strong></td>
          <td>${p.guide}</td>
        </tr>
      `
      )
      .join("");

    return `
      <div class="custom-picker-wrapper ${pickerClass}">
        <button type="button" class="custom-picker-trigger">
          <span>${triggerLabel}</span>
          <span class="picker-chevron">▼</span>
        </button>
        <div class="custom-picker-dropdown-panel">
          <table class="picker-dropdown-table">
            <thead>
              <tr>
                <th style="width:70px; text-align:center;">Nilai</th>
                <th style="width:165px;">Kategori</th>
                <th>Panduan Penilaian Kemungkinan</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function bindTablePickerEvents(cardEl, pickerSelector, onSelectCallback) {
    const wrapper = cardEl.querySelector(pickerSelector);
    if (!wrapper) return;

    const triggerBtn = wrapper.querySelector(".custom-picker-trigger");
    const rows = wrapper.querySelectorAll(".picker-dropdown-row");

    triggerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const wasOpen = wrapper.classList.contains("open");
      document.querySelectorAll(".custom-picker-wrapper.open").forEach((el) => {
        el.classList.remove("open");
      });
      if (!wasOpen) {
        wrapper.classList.add("open");
      }
    });

    rows.forEach((row) => {
      row.addEventListener("click", (e) => {
        e.stopPropagation();
        const chosenVal = Number(row.getAttribute("data-val"));
        wrapper.classList.remove("open");
        onSelectCallback(chosenVal);
      });
    });
  }

  function renderHazardSteps() {
    const container = document.getElementById("hazardStepsContainer");
    if (!container) return;

    container.innerHTML = "";
    const sevList = window.PRAKARSA_DATA.severityLevels;
    const probList = window.PRAKARSA_DATA.probabilityLevels;
    const ctrlList = window.PRAKARSA_DATA.controlHierarchy;

    hazardSteps.forEach((stepData, stepIdx) => {
      const stepNo = stepIdx + 1;

      const initScore =
        stepData.initialSeverity && stepData.initialProbability
          ? stepData.initialSeverity * stepData.initialProbability
          : 0;
      const initMatrix = window.PRAKARSA_DATA.getRiskMatrixInfo(initScore);

      const resScore =
        stepData.residualSeverity && stepData.residualProbability
          ? stepData.residualSeverity * stepData.residualProbability
          : 0;
      const resMatrix = window.PRAKARSA_DATA.getRiskMatrixInfo(resScore);

      const initSevObj = sevList.find((s) => s.value === Number(stepData.initialSeverity));
      const initProbObj = probList.find((p) => p.value === Number(stepData.initialProbability));
      const resSevObj = sevList.find((s) => s.value === Number(stepData.residualSeverity));
      const resProbObj = probList.find((p) => p.value === Number(stepData.residualProbability));

      const card = document.createElement("div");
      card.className = "form-card hazard-step-card";

      // Susun daftar Tindakan Pengendalian pada langkah ini (tanpa emoji)
      const controlsHTML = stepData.controls
        .map((ctrlItem, cIdx) => {
          const ctrlMeta =
            ctrlList.find((c) => c.code === ctrlItem.type) || ctrlList[2];
          return `
            <div class="control-item-card" data-ctrl-idx="${cIdx}">
              <div class="control-item-top-row">
                <div class="field-group">
                  <label class="field-label">Bentuk / Hirarki Pengendalian #${cIdx + 1}</label>
                  <div class="input-with-icon select-with-icon">
                    <select class="role-select-dropdown ctrl-type-select" data-ctrl-idx="${cIdx}">
                      ${ctrlList
                        .map(
                          (c) =>
                            `<option value="${c.code}" ${
                              c.code === ctrlItem.type ? "selected" : ""
                            }>${c.label}</option>`
                        )
                        .join("")}
                    </select>
                  </div>
                </div>

                <div class="field-group">
                  <label class="field-label">Uraian Tindakan Pengendalian Spesifik</label>
                  <div class="input-with-icon">
                    <input
                      type="text"
                      class="ctrl-text-input"
                      data-ctrl-idx="${cIdx}"
                      value="${(ctrlItem.text || "").replace(/"/g, "&quot;")}"
                      placeholder="${ctrlMeta.placeholder}"
                    />
                  </div>
                </div>

                ${
                  stepData.controls.length > 1
                    ? `<button type="button" class="btn-remove-control" data-ctrl-idx="${cIdx}" title="Hapus pengendalian ini">Hapus</button>`
                    : `<div></div>`
                }
              </div>
              <div class="control-type-desc">
                <strong>${ctrlMeta.label}:</strong> ${ctrlMeta.description}
              </div>
            </div>
          `;
        })
        .join("");

      card.innerHTML = `
        <div class="hazard-step-header">
          <div class="hazard-step-badge-wrap">
            <span class="hazard-step-num-badge">LANGKAH #${stepNo}</span>
            <span class="hazard-step-title">Identifikasi Bahaya &amp; Pengendalian Risiko</span>
          </div>
          ${
            hazardSteps.length > 1
              ? `<button type="button" class="btn-remove-step" data-step-idx="${stepIdx}">Hapus Langkah #${stepNo}</button>`
              : ""
          }
        </div>

        <!-- 1. DESKRIPSI LANGKAH PEKERJAAN (KOLOM 2) -->
        <div class="form-subsection">
          <h3 class="section-heading">Deskripsi Langkah Pekerjaan (Kolom 2)</h3>
          <p class="subsection-hint">
            Jelaskan tahapan-tahapan pekerjaan yang memiliki risiko. Tuliskan dengan jelas dan tidak ambigu.
          </p>
          <div class="input-with-icon textarea-with-icon">
            <textarea
              rows="2"
              class="step-desc-input"
              placeholder="Contoh: Melakukan pengangkatan barang dengan manual"
            >${stepData.stepDescription || ""}</textarea>
          </div>
        </div>

        <!-- 2. BAHAYA (KOLOM 3) -->
        <div class="form-subsection">
          <h3 class="section-heading">Bahaya (Kolom 3)</h3>
          <p class="subsection-hint">
            Sebutkan potensi bahaya yang paling mungkin terjadi (pastikan sudah memahami situasi dan kondisi asli area kerja).
          </p>
          <div class="input-with-icon textarea-with-icon">
            <textarea
              rows="2"
              class="step-hazard-input"
              placeholder="Contoh: Potensi cedera otot tangan dan punggung jika terlalu berat atau lama"
            >${stepData.hazard || ""}</textarea>
          </div>
        </div>

        <!-- 3. DAMPAK (KOLOM 4) -->
        <div class="form-subsection">
          <h3 class="section-heading">Dampak (Kolom 4)</h3>
          <p class="subsection-hint">
            Sebutkan dampak yang paling mungkin terjadi jika terkena bahaya tersebut.
          </p>
          <div class="input-with-icon textarea-with-icon">
            <textarea
              rows="2"
              class="step-impact-input"
              placeholder="Contoh: Pegal-pegal, cedera otot, nyeri punggung bawah."
            >${stepData.impact || ""}</textarea>
          </div>
        </div>

        <!-- 4. RISIKO AWAL (KOLOM 5: 5a, 5b, 5c) -->
        <div class="risk-evaluation-block">
          <h3 class="section-heading" style="margin-bottom:4px;">Risiko Awal Sebelum Pengendalian (Kolom 5)</h3>
          <p class="subsection-hint">
            Pilih tingkat <strong>Keparahan (Severity)</strong> dan <strong>Kemungkinan (Probability)</strong> sebelum tindakan pengendalian dilakukan.
          </p>

          <div class="risk-eval-grid-2col">
            <!-- 5a. Keparahan Awal (Dropdown Tabel Interaktif 5 ke 1) -->
            <div class="risk-factor-box">
              <div class="risk-factor-top">
                <label class="field-label">Keparahan jika Bahaya Tersebut Terjadi (5a)</label>
                <span
                  class="selected-factor-pill init-sev-pill"
                  style="${
                    initSevObj
                      ? `background:${initSevObj.badgeColor}; color:${initSevObj.textColor};`
                      : ""
                  }"
                >
                  ${initSevObj ? `Terpilih: ${initSevObj.label}` : "Belum Dipilih"}
                </span>
              </div>
              ${buildSeverityTablePickerHTML(
                stepData.initialSeverity,
                "init-sev-picker",
                "Pilih Tingkat Keparahan (Level 5 s/d 1)"
              )}
              <div class="factor-criteria-preview init-sev-preview ${
                initSevObj ? "visible" : ""
              }">
                ${buildSeverityCriteriaHTML(stepData.initialSeverity)}
              </div>
            </div>

            <!-- 5b. Kemungkinan Awal (Dropdown Tabel Interaktif 5 ke 1) -->
            <div class="risk-factor-box">
              <div class="risk-factor-top">
                <label class="field-label">Kemungkinan Bahaya Tersebut Terjadi (5b)</label>
                <span
                  class="selected-factor-pill init-prob-pill"
                  style="${
                    initProbObj
                      ? `background:${initProbObj.badgeColor}; color:${initProbObj.textColor};`
                      : ""
                  }"
                >
                  ${initProbObj ? `Terpilih: Nilai ${initProbObj.value}` : "Belum Dipilih"}
                </span>
              </div>
              ${buildProbabilityTablePickerHTML(
                stepData.initialProbability,
                "init-prob-picker",
                "Pilih Kemungkinan Kejadian (Nilai 5 s/d 1)"
              )}
              <div class="factor-criteria-preview init-prob-preview ${
                initProbObj ? "visible" : ""
              }">
                ${buildProbabilityCriteriaHTML(stepData.initialProbability)}
              </div>
            </div>
          </div>

          <!-- 5c. Hasil Perkalian Tingkat Risiko Awal -->
          <div
            class="risk-score-result-bar init-risk-result-bar"
            style="background-color:${initMatrix.bgColor}; color:${initMatrix.textColor}; border-color:${initMatrix.borderColor};"
          >
            <div class="risk-score-left">
              <span class="risk-score-title">Tingkat Risiko Awal (Kolom 5c)</span>
              <span class="risk-score-formula">
                ${
                  initScore > 0
                    ? `Keparahan (${stepData.initialSeverity}) × Kemungkinan (${stepData.initialProbability}) = Skor ${initScore}`
                    : "Pilih Keparahan (5a) dan Kemungkinan (5b) untuk menghitung Tingkat Risiko Awal otomatis"
                }
              </span>
            </div>
            <div class="risk-score-right">
              <div class="risk-level-text-group">
                <span class="risk-level-category">${initMatrix.levelName}</span>
                <span class="risk-level-authority">Otorisasi: ${initMatrix.reviewerRole}</span>
              </div>
              <div class="risk-big-number">${initScore > 0 ? initScore : "-"}</div>
            </div>
          </div>
        </div>

        <!-- 5. TINDAKAN PENGENDALIAN (KOLOM 6: EL, SB, EC, AD, APD) -->
        <div class="form-subsection">
          <h3 class="section-heading">Tindakan Pengendalian (Kolom 6)</h3>
          <p class="subsection-hint">
            Pilih satu atau beberapa tindakan pengendalian yang paling realistis untuk diterapkan (Eliminasi, Substitusi, Rekayasa Teknis / Engineering, Administratif, atau APD Khusus).
          </p>

          <div class="controls-list-container">
            ${controlsHTML}
          </div>

          <button type="button" class="btn-add-control-item">
            + Tambah Tindakan Pengendalian Lainnya
          </button>
        </div>

        <!-- 6. RISIKO SISA SETELAH PENGENDALIAN (KOLOM 7: 7a, 7b, 7c) -->
        <div class="risk-evaluation-block" style="margin-bottom:0;">
          <h3 class="section-heading" style="margin-bottom:4px;">Risiko Sisa Setelah Dilakukan Pengendalian (Kolom 7)</h3>
          <p class="subsection-hint">
            Tentukan kembali nilai Keparahan dan Kemungkinan setelah tindakan pengendalian di atas diterapkan. <em>(Turunkan bertahap angka kemungkinan jika pengendalian efektif)</em>.
          </p>

          <div class="risk-eval-grid-2col">
            <!-- 7a. Keparahan Sisa (Dropdown Tabel Interaktif 5 ke 1) -->
            <div class="risk-factor-box">
              <div class="risk-factor-top">
                <label class="field-label">Keparahan jika Bahaya Tersebut Terjadi (7a)</label>
                <span
                  class="selected-factor-pill res-sev-pill"
                  style="${
                    resSevObj
                      ? `background:${resSevObj.badgeColor}; color:${resSevObj.textColor};`
                      : ""
                  }"
                >
                  ${resSevObj ? `Terpilih: ${resSevObj.label}` : "Belum Dipilih"}
                </span>
              </div>
              ${buildSeverityTablePickerHTML(
                stepData.residualSeverity,
                "res-sev-picker",
                "Pilih Tingkat Keparahan Sisa (Level 5 s/d 1)"
              )}
              <div class="factor-criteria-preview res-sev-preview ${
                resSevObj ? "visible" : ""
              }">
                ${buildSeverityCriteriaHTML(stepData.residualSeverity)}
              </div>
            </div>

            <!-- 7b. Kemungkinan Sisa (Dropdown Tabel Interaktif 5 ke 1) -->
            <div class="risk-factor-box">
              <div class="risk-factor-top">
                <label class="field-label">Kemungkinan Bahaya Tersebut Terjadi (7b)</label>
                <span
                  class="selected-factor-pill res-prob-pill"
                  style="${
                    resProbObj
                      ? `background:${resProbObj.badgeColor}; color:${resProbObj.textColor};`
                      : ""
                  }"
                >
                  ${resProbObj ? `Terpilih: Nilai ${resProbObj.value}` : "Belum Dipilih"}
                </span>
              </div>
              ${buildProbabilityTablePickerHTML(
                stepData.residualProbability,
                "res-prob-picker",
                "Pilih Kemungkinan Sisa (Turunkan bertahap jika efektif)"
              )}
              <div class="factor-criteria-preview res-prob-preview ${
                resProbObj ? "visible" : ""
              }">
                ${buildProbabilityCriteriaHTML(stepData.residualProbability)}
              </div>
            </div>
          </div>

          <!-- 7c. Hasil Perkalian Tingkat Risiko Sisa -->
          <div
            class="risk-score-result-bar res-risk-result-bar"
            style="background-color:${resMatrix.bgColor}; color:${resMatrix.textColor}; border-color:${resMatrix.borderColor};"
          >
            <div class="risk-score-left">
              <span class="risk-score-title">Tingkat Risiko Sisa / Akhir (Kolom 7c)</span>
              <span class="risk-score-formula">
                ${
                  resScore > 0
                    ? `Keparahan Sisa (${stepData.residualSeverity}) × Kemungkinan Sisa (${stepData.residualProbability}) = Skor ${resScore}`
                    : "Pilih Keparahan Sisa (7a) dan Kemungkinan Sisa (7b) untuk melihat Tingkat Risiko Akhir & Pejabat RA Reviewer"
                }
              </span>
            </div>
            <div class="risk-score-right">
              <div class="risk-level-text-group">
                <span class="risk-level-category">${resMatrix.levelName}</span>
                <span class="risk-level-authority">Wajib Disetujui: ${resMatrix.reviewerRole}</span>
              </div>
              <div class="risk-big-number">${resScore > 0 ? resScore : "-"}</div>
            </div>
          </div>
        </div>
      `;

      // Bind event input teks langkah, bahaya, dampak
      const descInput = card.querySelector(".step-desc-input");
      const hazardInput = card.querySelector(".step-hazard-input");
      const impactInput = card.querySelector(".step-impact-input");

      descInput.addEventListener("input", () => {
        stepData.stepDescription = descInput.value;
      });
      hazardInput.addEventListener("input", () => {
        stepData.hazard = hazardInput.value;
      });
      impactInput.addEventListener("input", () => {
        stepData.impact = impactInput.value;
      });

      // Bind Tabel Dropdown Risiko Awal (5a & 5b)
      bindTablePickerEvents(card, ".init-sev-picker", (val) => {
        stepData.initialSeverity = val;
        if (!stepData.residualSeverity) {
          stepData.residualSeverity = val;
        }
        renderHazardSteps();
      });

      bindTablePickerEvents(card, ".init-prob-picker", (val) => {
        stepData.initialProbability = val;
        renderHazardSteps();
      });

      // Bind Tabel Dropdown Risiko Sisa (7a & 7b)
      bindTablePickerEvents(card, ".res-sev-picker", (val) => {
        stepData.residualSeverity = val;
        renderHazardSteps();
      });

      bindTablePickerEvents(card, ".res-prob-picker", (val) => {
        stepData.residualProbability = val;
        renderHazardSteps();
      });

      // Bind Tindakan Pengendalian (Dropdown jenis & Input teks)
      const ctrlTypeSelects = card.querySelectorAll(".ctrl-type-select");
      ctrlTypeSelects.forEach((sel) => {
        sel.addEventListener("change", () => {
          const cIdx = Number(sel.getAttribute("data-ctrl-idx"));
          stepData.controls[cIdx].type = sel.value;
          renderHazardSteps();
        });
      });

      const ctrlTextInputs = card.querySelectorAll(".ctrl-text-input");
      ctrlTextInputs.forEach((inp) => {
        inp.addEventListener("input", () => {
          const cIdx = Number(inp.getAttribute("data-ctrl-idx"));
          stepData.controls[cIdx].text = inp.value;
        });
      });

      // Tombol Hapus 1 baris Pengendalian
      const removeCtrlBtns = card.querySelectorAll(".btn-remove-control");
      removeCtrlBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const cIdx = Number(btn.getAttribute("data-ctrl-idx"));
          stepData.controls.splice(cIdx, 1);
          renderHazardSteps();
        });
      });

      // Tombol Tambah Pengendalian pada langkah ini
      const btnAddCtrl = card.querySelector(".btn-add-control-item");
      btnAddCtrl.addEventListener("click", () => {
        stepData.controls.push({ type: "AD", text: "" });
        renderHazardSteps();
      });

      // Tombol Hapus Langkah Pekerjaan
      const btnRemoveStep = card.querySelector(".btn-remove-step");
      if (btnRemoveStep) {
        btnRemoveStep.addEventListener("click", () => {
          hazardSteps.splice(stepIdx, 1);
          renderHazardSteps();
          showToast(`Langkah #${stepNo} telah dihapus.`);
        });
      }

      container.appendChild(card);
    });
  }

  // Tutup panel dropdown tabel jika klik di luar
  document.addEventListener("click", () => {
    document.querySelectorAll(".custom-picker-wrapper.open").forEach((el) => {
      el.classList.remove("open");
    });
  });

  function initAddHazardStepButton() {
    const btnAddStep = document.getElementById("btnAddHazardStep");
    if (!btnAddStep) return;

    btnAddStep.addEventListener("click", () => {
      hazardSteps.push({
        stepDescription: "",
        hazard: "",
        impact: "",
        initialSeverity: 0,
        initialProbability: 0,
        controls: [{ type: "EC", text: "" }],
        residualSeverity: 0,
        residualProbability: 0
      });
      renderHazardSteps();
      showToast(`Langkah Pekerjaan #${hazardSteps.length} berhasil ditambahkan.`);
    });
  }

  // =========================================================
  // BAGIAN TAHAP 3: TASK HAZARD ASSESSMENT (THA) — 28 KATEGORI
  // =========================================================
  function ensureTHAStateInitialized() {
    const cats = window.PRAKARSA_DATA.thaCategories || [];
    cats.forEach((cat) => {
      if (!thaState[cat.id]) {
        thaState[cat.id] = {
          checked: false,
          items: cat.items.map(() => false)
        };
      }
    });
  }

  function updateTHASummaryCounter() {
    const counterEl = document.getElementById("thaSummaryCounter");
    if (!counterEl) return;

    let activeCatCount = 0;
    let checkedItemCount = 0;

    Object.keys(thaState).forEach((catId) => {
      const st = thaState[catId];
      const itemCount = st.items.filter(Boolean).length;
      if (st.checked || itemCount > 0) {
        activeCatCount++;
      }
      checkedItemCount += itemCount;
    });

    counterEl.textContent = `${activeCatCount} Kategori Bahaya | ${checkedItemCount} Pengendalian Tercentang`;
  }

  function renderTHACategories() {
    ensureTHAStateInitialized();
    const grid = document.getElementById("thaCategoriesGrid");
    if (!grid) return;

    grid.innerHTML = "";
    const cats = window.PRAKARSA_DATA.thaCategories || [];
    const query = thaSearchQuery.trim().toLowerCase();

    const filteredCats = cats.filter((cat) => {
      const st = thaState[cat.id];
      const hasSelected = st.checked || st.items.some(Boolean);
      if (showOnlySelectedTHA && !hasSelected) {
        return false;
      }
      if (!query) return true;
      const matchTitle = cat.title.toLowerCase().includes(query);
      const matchItem = cat.items.some((it) => it.toLowerCase().includes(query));
      return matchTitle || matchItem;
    });

    if (filteredCats.length === 0) {
      grid.innerHTML = `
        <div class="form-card" style="grid-column: 1 / -1; text-align:center; color:#64748B; padding:24px;">
          Tidak ada kategori Task Hazard Assessment (THA) yang sesuai dengan filter atau pencarian Anda.
        </div>
      `;
      updateTHASummaryCounter();
      return;
    }

    filteredCats.forEach((cat) => {
      const st = thaState[cat.id];
      const checkedCount = st.items.filter(Boolean).length;
      const isCatActive = st.checked || checkedCount > 0;

      const card = document.createElement("div");
      card.className = `tha-category-card ${isCatActive ? "active-tha-cat" : ""}`;

      const itemsHTML = cat.items
        .map((itemText, idx) => {
          const isChecked = st.items[idx];
          return `
            <label class="tha-item-label ${isChecked ? "checked-item" : ""}">
              <input
                type="checkbox"
                class="tha-item-checkbox"
                data-item-idx="${idx}"
                ${isChecked ? "checked" : ""}
              />
              <span>${itemText}</span>
            </label>
          `;
        })
        .join("");

      const allChecked = checkedCount === cat.items.length;

      card.innerHTML = `
        <div class="tha-cat-header">
          <div class="tha-cat-header-left">
            <input
              type="checkbox"
              class="tha-cat-checkbox"
              ${isCatActive ? "checked" : ""}
            />
            <span class="tha-cat-title">${cat.title}</span>
          </div>
          <span class="tha-cat-count-pill">${checkedCount}/${cat.items.length}</span>
        </div>
        <div class="tha-items-list">
          ${itemsHTML}
        </div>
        <div class="tha-cat-footer">
          <button type="button" class="btn-tha-select-all">
            ${allChecked ? "Batal Pilih Semua" : "Pilih Semua di Kategori Ini"}
          </button>
        </div>
      `;

      // Klik header / checkbox kategori
      const catHeader = card.querySelector(".tha-cat-header");
      const catCheckbox = card.querySelector(".tha-cat-checkbox");
      catHeader.addEventListener("click", (e) => {
        if (e.target !== catCheckbox) {
          catCheckbox.checked = !catCheckbox.checked;
        }
        st.checked = catCheckbox.checked;
        if (!st.checked) {
          st.items = st.items.map(() => false);
        }
        renderTHACategories();
      });

      // Klik masing-masing item pengendalian (multiple choice)
      const itemCheckboxes = card.querySelectorAll(".tha-item-checkbox");
      itemCheckboxes.forEach((chk) => {
        chk.addEventListener("change", () => {
          const idx = Number(chk.getAttribute("data-item-idx"));
          st.items[idx] = chk.checked;
          if (chk.checked) {
            st.checked = true;
          } else if (!st.items.some(Boolean)) {
            st.checked = false;
          }
          renderTHACategories();
        });
      });

      // Tombol Pilih Semua / Batal Pilih Semua di kategori ini
      const btnSelectAll = card.querySelector(".btn-tha-select-all");
      btnSelectAll.addEventListener("click", () => {
        const nextVal = !allChecked;
        st.checked = nextVal;
        st.items = st.items.map(() => nextVal);
        renderTHACategories();
      });

      grid.appendChild(card);
    });

    updateTHASummaryCounter();
  }

  function initTHAToolbarHandlers() {
    const searchInput = document.getElementById("thaSearchInput");
    const btnFilterSelected = document.getElementById("btnFilterSelectedTHA");
    const btnResetAll = document.getElementById("btnResetAllTHA");

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        thaSearchQuery = searchInput.value;
        renderTHACategories();
      });
    }

    if (btnFilterSelected) {
      btnFilterSelected.addEventListener("click", () => {
        showOnlySelectedTHA = !showOnlySelectedTHA;
        btnFilterSelected.textContent = showOnlySelectedTHA
          ? "Tampilkan Semua (28 Kategori)"
          : "Tampilkan Hanya yang Tercentang";
        renderTHACategories();
      });
      btnFilterSelected.textContent = "Tampilkan Hanya yang Tercentang";
    }

    if (btnResetAll) {
      btnResetAll.addEventListener("click", () => {
        thaState = {};
        ensureTHAStateInitialized();
        renderTHACategories();
        showToast("Seluruh pilihan Task Hazard Assessment (THA) telah di-reset.");
      });
    }
  }

  // =========================================================
  // PEMETAAN DATA KE FILE TEMPLATE EXCEL (.XLSX)
  // =========================================================
  function buildExcelTagMap() {
    const raNoVal = document.getElementById("raNumber").value.trim() || "-";
    const regDateVal = document.getElementById("regDate").value;
    const specificLocVal = document.getElementById("specificLocation").value.trim();
    const jobDescVal = document.getElementById("jobDescription").value.trim() || "-";

    const lokasiGabungan = [selectedArea, specificLocVal].filter(Boolean).join(" — ") || "-";

    const teamRows = document.querySelectorAll(".team-member-row");
    const teamData = [];
    teamRows.forEach((row) => {
      const tName = row.querySelector('input[name="teamName[]"]').value.trim();
      const tRole = row.querySelector('select[name="teamRole[]"]').value || "";
      teamData.push({ name: tName, role: tRole });
    });

    const reviewerInputs = document.querySelectorAll('input[name="reviewerName[]"]');
    const revMap = {
      "Site Controller": "",
      "Manager Line": "",
      "Field Manager": "",
      "General Manager": ""
    };
    reviewerInputs.forEach((inp) => {
      const roleKey = inp.getAttribute("data-role");
      revMap[roleKey] = inp.value.trim();
    });

    const formattedRegDate = regDateVal ? formatDateID(regDateVal) : "-";

    const tagMap = {
      RA_NO: raNoVal,
      TANGGAL_REG: formattedRegDate,
      SITE: selectedSite,
      LOKASI: lokasiGabungan,
      CEK_HOTWORK: selectedCategory === "hotwork" ? "V" : "",
      CEK_CRITICAL: selectedCategory === "critical" ? "V" : "",
      CEK_BREAKING: selectedCategory === "breaking" ? "V" : "",
      CEK_GENERAL: selectedCategory === "general" ? "V" : "",
      DESKRIPSI: jobDescVal,
      REV_SC_NAMA: revMap["Site Controller"] || "",
      REV_ML_NAMA: revMap["Manager Line"] || "",
      REV_FM_NAMA: revMap["Field Manager"] || "",
      REV_GM_NAMA: revMap["General Manager"] || "",
      REV_SC_TGL: revMap["Site Controller"] ? formattedRegDate : "",
      REV_ML_TGL: revMap["Manager Line"] ? formattedRegDate : "",
      REV_FM_TGL: revMap["Field Manager"] ? formattedRegDate : "",
      REV_GM_TGL: revMap["General Manager"] ? formattedRegDate : ""
    };

    for (let i = 1; i <= 6; i++) {
      const item = teamData[i - 1] || { name: "", role: "" };
      tagMap["TIM_NAMA_" + i] = item.name;
      tagMap["TIM_JABATAN_" + i] = item.role;
    }

    // Fungsi penentu kode Style (warna background cell di Excel) sesuai Matriks Risiko 5x5:
    // 137 = Hijau Tua (#2E7D32), 138 = Hijau Muda (#8CC67B), 139 = Kuning (#FFFF00),
    // 140 = Oranye (#FF9900), 141 = Merah (#FF0000), 20 = Putih (kosong)
    function getExcelRiskStyleId(scoreVal) {
      const n = Number(scoreVal);
      if (!n || n < 1) return "20";
      if (n >= 1 && n <= 3) return "137";
      if (n === 4) return "138";
      if (n >= 5 && n <= 9) return "139";
      if (n >= 10 && n <= 14) return "140";
      return "141";
    }

    for (let s = 1; s <= 10; s++) {
      const step = hazardSteps[s - 1];
      if (step) {
        const initRisk =
          step.initialSeverity && step.initialProbability
            ? step.initialSeverity * step.initialProbability
            : "";
        const resRisk =
          step.residualSeverity && step.residualProbability
            ? step.residualSeverity * step.residualProbability
            : "";
        const combinedControls = step.controls
          .filter((c) => c.text && c.text.trim())
          .map((c) => `${c.text.trim()} (${c.type})`)
          .join("; ");

        tagMap["NO_" + s] = String(s);
        tagMap["LANGKAH_" + s] = step.stepDescription || "";
        tagMap["BAHAYA_" + s] = step.hazard || "";
        tagMap["DAMPAK_" + s] = step.impact || "";
        tagMap["KEPARAHAN_AWAL_" + s] = step.initialSeverity ? String(step.initialSeverity) : "";
        tagMap["KEMUNGKINAN_AWAL_" + s] = step.initialProbability ? String(step.initialProbability) : "";
        tagMap["RISIKO_AWAL_" + s] = initRisk ? String(initRisk) : "";
        tagMap["STYLE_AWAL_" + s] = getExcelRiskStyleId(initRisk);
        tagMap["PENGENDALIAN_" + s] = combinedControls || "";
        tagMap["KEPARAHAN_SISA_" + s] = step.residualSeverity ? String(step.residualSeverity) : "";
        tagMap["KEMUNGKINAN_SISA_" + s] = step.residualProbability ? String(step.residualProbability) : "";
        tagMap["RISIKO_SISA_" + s] = resRisk ? String(resRisk) : "";
        tagMap["STYLE_SISA_" + s] = getExcelRiskStyleId(resRisk);
      } else {
        tagMap["NO_" + s] = "";
        tagMap["LANGKAH_" + s] = "";
        tagMap["BAHAYA_" + s] = "";
        tagMap["DAMPAK_" + s] = "";
        tagMap["KEPARAHAN_AWAL_" + s] = "";
        tagMap["KEMUNGKINAN_AWAL_" + s] = "";
        tagMap["RISIKO_AWAL_" + s] = "";
        tagMap["STYLE_AWAL_" + s] = "20";
        tagMap["PENGENDALIAN_" + s] = "";
        tagMap["KEPARAHAN_SISA_" + s] = "";
        tagMap["KEMUNGKINAN_SISA_" + s] = "";
        tagMap["RISIKO_SISA_" + s] = "";
        tagMap["STYLE_SISA_" + s] = "20";
      }
    }

    // Petakan pula 28 Kategori & 156 Poin Task Hazard Assessment (THA) Tahap 3
    // Format Tag Kategori: {{THA_KAT_1}} s/d {{THA_KAT_28}}
    // Format Tag Poin: {{THA_1_1}}, {{THA_1_2}}, dst. (Terisi "☑" jika dicentang, "☐" jika tidak)
    ensureTHAStateInitialized();
    const thaCats = window.PRAKARSA_DATA.thaCategories || [];
    thaCats.forEach((cat, cIdx) => {
      const catNum = cIdx + 1;
      const st = thaState[cat.id];
      const isCatChecked = st && (st.checked || st.items.some(Boolean));
      tagMap[`THA_KAT_${catNum}`] = isCatChecked ? "☑" : "☐";

      cat.items.forEach((_, iIdx) => {
        const itemNum = iIdx + 1;
        const isItemChecked = st && Boolean(st.items[iIdx]);
        tagMap[`THA_${catNum}_${itemNum}`] = isItemChecked ? "☑" : "☐";
      });
    });

    return tagMap;
  }

  function initExcelTemplateHandlers() {
    const btnToggleTagGuide = document.getElementById("btnToggleTagGuide");
    const tagGuideBox = document.getElementById("excelTagGuideBox");
    const excelInput = document.getElementById("excelTemplateInput");
    const statusText = document.getElementById("excelTemplateStatus");
    const btnDownloadExcel = document.getElementById("btnDownloadFilledExcel");

    if (btnToggleTagGuide && tagGuideBox) {
      btnToggleTagGuide.addEventListener("click", () => {
        tagGuideBox.classList.toggle("visible");
      });
    }

    if (window.PrakarsaExcelGenerator && statusText) {
      const info = window.PrakarsaExcelGenerator.getTemplateInfo();
      if (info.hasTemplate) {
        statusText.textContent = "Template aktif: " + info.fileName;
        statusText.classList.add("ready");
      }
    }

    if (excelInput && window.PrakarsaExcelGenerator) {
      excelInput.addEventListener("change", () => {
        if (!excelInput.files || excelInput.files.length === 0) return;
        const file = excelInput.files[0];
        window.PrakarsaExcelGenerator.saveTemplate(file, (ok, msg) => {
          if (ok) {
            statusText.textContent = "Template aktif: " + msg;
            statusText.classList.add("ready");
            showToast("File Template Excel (" + msg + ") berhasil dihubungkan & disimpan!");
          } else {
            showToast("Gagal menyimpan template: " + msg);
          }
        });
      });
    }

    if (btnDownloadExcel && window.PrakarsaExcelGenerator) {
      btnDownloadExcel.addEventListener("click", async () => {
        const tagMap = buildExcelTagMap();
        const safeNo = (tagMap.RA_NO || "Baru").replace(/[^a-zA-Z0-9_-]/g, "_");
        const outName = `RA_PHE_WMO_${safeNo}.xlsx`;
        const ok = await window.PrakarsaExcelGenerator.generateExcel(tagMap, outName);
        if (ok) {
          showToast("Dokumen Excel " + outName + " berhasil dibuat dan diunduh!");
        }
      });
    }

    const btnDownloadPdf = document.getElementById("btnDownloadFilledPdf");
    if (btnDownloadPdf && window.PrakarsaExcelGenerator) {
      btnDownloadPdf.addEventListener("click", async () => {
        const tagMap = buildExcelTagMap();
        const safeNo = (tagMap.RA_NO || "Baru").replace(/[^a-zA-Z0-9_-]/g, "_");
        const pdfName = `RA_PHE_WMO_${safeNo}.pdf`;
        const origLabel = btnDownloadPdf.innerHTML;
        btnDownloadPdf.disabled = true;
        btnDownloadPdf.innerHTML = "<span>Memproses Excel ke PDF 3 Halaman...</span>";
        showToast("Sedang mengonversi dokumen Excel menjadi PDF 3 Halaman...");
        try {
          const ok = await window.PrakarsaExcelGenerator.generatePdf(tagMap, pdfName);
          if (ok) {
            showToast("Dokumen PDF " + pdfName + " berhasil dibuat dan diunduh!");
          }
        } finally {
          btnDownloadPdf.disabled = false;
          btnDownloadPdf.innerHTML = origLabel;
        }
      });
    }

    const excelToPdfInput = document.getElementById("excelToPdfFileInput");
    if (excelToPdfInput && window.PrakarsaExcelGenerator) {
      excelToPdfInput.addEventListener("change", () => {
        if (!excelToPdfInput.files || excelToPdfInput.files.length === 0) return;
        const file = excelToPdfInput.files[0];
        showToast("Sedang mengubah file " + file.name + " menjadi PDF 3 Halaman...");
        window.PrakarsaExcelGenerator.convertExcelFileToPdf(file, (ok, msg) => {
          excelToPdfInput.value = "";
          if (ok) {
            showToast("Berhasil! File PDF " + msg + " telah diunduh.");
          } else {
            showToast("Silakan gunakan klik 2x Cetak_Excel_Jadi_PDF_Otomatis.bat di folder NEW RA.");
          }
        });
      });
    }
  }

  // =========================================================
  // PENYIMPANAN & TABEL STATUS DOKUMEN
  // =========================================================
  function getStoredDocuments() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(window.PRAKARSA_DATA.initialDocuments));
        return window.PRAKARSA_DATA.initialDocuments;
      }
      return JSON.parse(raw);
    } catch (err) {
      return window.PRAKARSA_DATA.initialDocuments;
    }
  }

  function saveStoredDocuments(docs) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    } catch (err) {
      console.error("Gagal menyimpan ke localStorage:", err);
    }
  }

  function collectFormEntry(statusType) {
    const raNoInput = document.getElementById("raNumber").value.trim();
    const regDateInput = document.getElementById("regDate").value;
    const specificLoc = document.getElementById("specificLocation").value.trim();
    const jobDesc = document.getElementById("jobDescription").value.trim();

    const teamRows = document.querySelectorAll(".team-member-row");
    const teamList = [];
    teamRows.forEach((row) => {
      const nameVal = row.querySelector('input[name="teamName[]"]').value.trim();
      const roleVal = row.querySelector('select[name="teamRole[]"]').value;
      if (nameVal) {
        teamList.push(roleVal ? `${nameVal} (${roleVal})` : nameVal);
      }
    });

    const reviewerInputs = document.querySelectorAll('input[name="reviewerName[]"]');
    const filledReviewers = [];
    reviewerInputs.forEach((inp) => {
      const rName = inp.value.trim();
      const rRole = inp.getAttribute("data-role");
      if (rName) {
        filledReviewers.push(`${rName} — ${rRole}`);
      }
    });

    const catObj = window.PRAKARSA_DATA.workCategories.find((c) => c.id === selectedCategory);
    const todayStr = new Date().toISOString().split("T")[0];
    const startDate = regDateInput || todayStr;
    const validUntilDate = addDaysToDateString(startDate, 6);

    const docs = getStoredDocuments();
    const nextNumber = String(docs.length + 1).padStart(3, "0");

    return {
      raNo: raNoInput || `RA/PHEWMO/2026/${nextNumber}`,
      validUntil: validUntilDate,
      categoryId: selectedCategory,
      categoryLabel: catObj ? catObj.label : "General / Umum",
      description: jobDesc || "Pemeriksaan dan pemeliharaan fasilitas proses di area kerja.",
      site: selectedSite,
      area: selectedArea || "Mengikuti Lokasi Spesifik",
      specificLocation: specificLoc || selectedArea || "-",
      regDate: startDate,
      teamLeader: teamList.length > 0 ? teamList.join(", ") : "Hafizal (PA)",
      reviewer:
        filledReviewers.length > 0
          ? filledReviewers.join(", ")
          : "Menunggu Penunjukan RA Reviewer",
      status: statusType,
      note:
        statusType === "Draft"
          ? "Dokumen disimpan sebagai draft pada Tahap 1 (Informasi Pekerjaan)."
          : `Telah menyelesaikan ${hazardSteps.length} langkah identifikasi bahaya & siap diperiksa.`
    };
  }

  function renderStatusTable() {
    const tbody = document.getElementById("statusTableBody");
    if (!tbody) return;

    const docs = getStoredDocuments();
    const filtered =
      currentStatusFilter === "ALL"
        ? docs
        : docs.filter((d) => d.status === currentStatusFilter);

    tbody.innerHTML = "";

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center; padding: 28px; color: #64748B;">
            Belum ada dokumen Risk Assessment dengan status <strong>${currentStatusFilter}</strong>.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach((doc) => {
      let badgeClass = "status-draft";
      if (doc.status === "Menunggu Pemeriksaan") badgeClass = "status-review";
      else if (doc.status === "Perlu Revisi") badgeClass = "status-revisi";
      else if (doc.status === "Disetujui") badgeClass = "status-approved";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${doc.raNo}</strong></td>
        <td>
          <span class="cat-mini-badge cat-${doc.categoryId}">${doc.categoryLabel}</span>
          <div>${doc.description}</div>
        </td>
        <td>
          <strong>${doc.site}</strong>
          <div style="font-size:12px; color:#64748B;">${doc.area} (${doc.specificLocation})</div>
        </td>
        <td>
          <div><strong>Mulai:</strong> ${formatDateID(doc.regDate)}</div>
          <div style="font-size:11.5px; color:#065F46;"><strong>s/d:</strong> ${formatDateID(doc.validUntil)} (7 Hari)</div>
        </td>
        <td>${doc.teamLeader}</td>
        <td>${doc.reviewer}</td>
        <td><span class="status-badge ${badgeClass}">${doc.status}</span></td>
        <td>
          <button type="button" class="btn-table-action" data-rano="${doc.raNo}">Lihat Catatan</button>
        </td>
      `;

      const actionBtn = tr.querySelector(".btn-table-action");
      actionBtn.addEventListener("click", () => {
        showToast(`[${doc.raNo}] Status: ${doc.status} — ${doc.note}`);
      });

      tbody.appendChild(tr);
    });
  }

  function initApp() {
    initStepNavigation();
    renderWorkCategories();
    renderSiteLocations();
    renderWorkAreas();
    initRegistrationDateValidity();
    bindSignatureInputs(document);
    initTeamMembersHandler();

    // Inisialisasi Tahap 2
    initMatrixReferenceDrawer();
    renderHazardSteps();
    initAddHazardStepButton();

    // Inisialisasi Tahap 3 (Task Hazard Assessment - 28 Kategori)
    renderTHACategories();
    initTHAToolbarHandlers();

    initExcelTemplateHandlers();
    renderStatusTable();

    const btnToggleEdu = document.getElementById("btnToggleEdu");
    const eduBanner = document.getElementById("k3EduBanner");
    if (btnToggleEdu && eduBanner) {
      btnToggleEdu.addEventListener("click", () => {
        updateK3EducationalBanner(false);
        eduBanner.classList.toggle("visible");
      });
    }

    const btnSaveDraft = document.getElementById("btnSaveDraft");
    if (btnSaveDraft) {
      btnSaveDraft.addEventListener("click", () => {
        const newDoc = collectFormEntry("Draft");
        const docs = getStoredDocuments();
        docs.unshift(newDoc);
        saveStoredDocuments(docs);
        renderStatusTable();
        showToast("Dokumen " + newDoc.raNo + " berhasil disimpan sebagai Draft!");
        window.PrakarsaNavigation.goTo("status");
      });
    }

    const raForm = document.getElementById("raForm");
    if (raForm) {
      raForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newDoc = collectFormEntry("Menunggu Pemeriksaan");
        const docs = getStoredDocuments();
        docs.unshift(newDoc);
        saveStoredDocuments(docs);
        renderStatusTable();
        showToast(
          "Seluruh data Tahap 1 & Tahap 2 (" +
            newDoc.raNo +
            ") berhasil disimpan ke daftar Status Dokumen!"
        );
        window.PrakarsaNavigation.goTo("status");
      });
    }

    const filterButtons = document.querySelectorAll("#statusFilterBar .status-filter-btn");
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentStatusFilter = btn.getAttribute("data-filter");
        renderStatusTable();
      });
    });
  }

  return {
    init: initApp,
    showToast: showToast,
    switchRAStep: switchRAStep
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  window.PrakarsaNavigation.init();
  window.PrakarsaApp.init();
});
