/* =========================================================
   FILE: js/excel-generator.js
   FUNGSI:
   1. Mesin Pengisi Otomatis (Auto-Filler) Template Microsoft
      Excel (.xlsx) 3-Sheet resmi PHE WMO (lengkap dengan
      5 Warna Background Matriks Risiko pada Tingkat Risiko).
   2. Mesin Konversi & Download Langsung 1-Klik ke PDF (.pdf)
      3 Halaman Landscape yang identik 100% dengan 3 Lembar Excel.
   ========================================================= */

window.PrakarsaExcelGenerator = (function () {
  const TEMPLATE_STORAGE_KEY = "prakarsa_excel_template_base64_v1";
  const TEMPLATE_NAME_KEY = "prakarsa_excel_template_filename_v1";

  function escapeXml(unsafeStr) {
    if (unsafeStr === null || unsafeStr === undefined) return "";
    return String(unsafeStr)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function escapeHtml(unsafeStr) {
    if (unsafeStr === null || unsafeStr === undefined) return "";
    return String(unsafeStr)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function saveTemplateToStorage(file, callback) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const dataUrl = e.target.result;
      const base64Data = dataUrl.split(",")[1];
      try {
        localStorage.setItem(TEMPLATE_STORAGE_KEY, base64Data);
        localStorage.setItem(TEMPLATE_NAME_KEY, file.name);
        if (callback) callback(true, file.name);
      } catch (err) {
        console.error("Gagal menyimpan template ke localStorage:", err);
        if (callback) callback(false, "Ukuran file terlalu besar untuk memori browser.");
      }
    };
    reader.readAsDataURL(file);
  }

  function getSavedTemplateInfo() {
    const defaultBase64 = window.PRAKARSA_DEFAULT_EXCEL_BASE64 || "";
    const customBase64 = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    const customName = localStorage.getItem(TEMPLATE_NAME_KEY);

    if (defaultBase64) {
      return {
        hasTemplate: true,
        fileName: "Template_RA_PRAKARSA_3_Lembar.xlsx (Tersedia Otomatis di Website)",
        base64: defaultBase64
      };
    }

    return {
      hasTemplate: Boolean(customBase64),
      fileName: customName || "Belum ada file template Excel yang dihubungkan",
      base64: customBase64
    };
  }

  function normalizeSplitTagsInXml(xmlText) {
    return xmlText.replace(/\{\{(?:<[^>]+>|\s)*([A-Z0-9_]+)(?:<[^>]+>|\s)*\}\}/g, "{{$1}}");
  }

  async function buildFilledExcelData(formDataMap) {
    if (typeof window.JSZip === "undefined") {
      alert("Library JSZip belum termuat. Pastikan koneksi internet aktif saat membuka halaman.");
      return null;
    }

    const saved = getSavedTemplateInfo();
    if (!saved.hasTemplate) {
      alert("Template Excel belum tersedia.");
      return null;
    }

    const zip = await window.JSZip.loadAsync(saved.base64, { base64: true });

    const xmlPathsToProcess = [];
    zip.forEach((relativePath) => {
      if (
        relativePath === "xl/sharedStrings.xml" ||
        /^xl\/worksheets\/sheet\d+\.xml$/.test(relativePath)
      ) {
        xmlPathsToProcess.push(relativePath);
      }
    });

    for (const xmlPath of xmlPathsToProcess) {
      const fileObj = zip.file(xmlPath);
      if (!fileObj) continue;

      let xmlContent = await fileObj.async("string");
      xmlContent = normalizeSplitTagsInXml(xmlContent);

      Object.keys(formDataMap).forEach((tagKey) => {
        const placeholder = "{{" + tagKey + "}}";
        const safeValue = escapeXml(formDataMap[tagKey]);
        xmlContent = xmlContent.split(placeholder).join(safeValue);
      });

      // Bersihkan sisa tag {{...}} jika ada yang belum terisi
      xmlContent = xmlContent.replace(/\{\{[A-Z0-9_]+\}\}/g, "");

      zip.file(xmlPath, xmlContent);
    }

    const outBlob = await zip.generateAsync({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    return { blob: outBlob };
  }

  function triggerBlobDownload(blob, fileName) {
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 2500);
  }

  // =========================================================
  // OPSI 1: DOWNLOAD DOKUMEN RA (.XLSX) — 3 SHEET + WARNA MATRIKS
  // =========================================================
  async function generateFilledExcel(formDataMap, outputFileName) {
    try {
      const result = await buildFilledExcelData(formDataMap);
      if (!result) return false;
      triggerBlobDownload(result.blob, outputFileName || "Risk_Assessment_PHE_WMO.xlsx");
      return true;
    } catch (err) {
      console.error("Kesalahan saat memproses file Excel:", err);
      alert("Gagal memproses file Excel.");
      return false;
    }
  }

  // Warna Background & Teks Sel Tingkat Risiko sesuai Matriks 5x5 PHE WMO
  function getRiskCellColorStyle(scoreVal) {
    const n = Number(scoreVal);
    if (!n || n < 1) return "background:#FFFFFF; color:#000000;";
    if (n >= 1 && n <= 3) return "background:#2E7D32; color:#FFFFFF; font-weight:700;";
    if (n === 4) return "background:#8CC67B; color:#000000; font-weight:700;";
    if (n >= 5 && n <= 9) return "background:#FFFF00; color:#000000; font-weight:700;";
    if (n >= 10 && n <= 14) return "background:#FF9900; color:#000000; font-weight:700;";
    return "background:#FF0000; color:#000000; font-weight:700;";
  }

  // =========================================================
  // OPSI 2: DOWNLOAD LANGSUNG DOKUMEN RA (.PDF) 1-KLIK
  //         (Menghasilkan File .PDF 3 Halaman Landscape yang
  //          Identik dengan 3 Sheet Excel tanpa perlu Convert Manual)
  // =========================================================
  function buildThreeSheetHtmlElement(formDataMap) {
    const logoSrc = window.PRAKARSA_PHE_LOGO_BASE64 || "logo-phe.png";

    // Baris Tabel Analisis Bahaya (Sheet 2: 10 baris)
    let stepRowsHtml = "";
    for (let s = 1; s <= 10; s++) {
      const no = escapeHtml(formDataMap["NO_" + s] || "");
      const langkah = escapeHtml(formDataMap["LANGKAH_" + s] || "");
      const bahaya = escapeHtml(formDataMap["BAHAYA_" + s] || "");
      const dampak = escapeHtml(formDataMap["DAMPAK_" + s] || "");
      const sevAwal = escapeHtml(formDataMap["KEPARAHAN_AWAL_" + s] || "");
      const probAwal = escapeHtml(formDataMap["KEMUNGKINAN_AWAL_" + s] || "");
      const riskAwal = escapeHtml(formDataMap["RISIKO_AWAL_" + s] || "");
      const ctrl = escapeHtml(formDataMap["PENGENDALIAN_" + s] || "");
      const sevSisa = escapeHtml(formDataMap["KEPARAHAN_SISA_" + s] || "");
      const probSisa = escapeHtml(formDataMap["KEMUNGKINAN_SISA_" + s] || "");
      const riskSisa = escapeHtml(formDataMap["RISIKO_SISA_" + s] || "");

      const initColorStyle = getRiskCellColorStyle(riskAwal);
      const resColorStyle = getRiskCellColorStyle(riskSisa);

      stepRowsHtml += `
        <tr style="height:24px;">
          <td style="text-align:center; vertical-align:middle;">${no}</td>
          <td>${langkah}</td>
          <td>${bahaya}</td>
          <td>${dampak}</td>
          <td style="text-align:center; vertical-align:middle;">${sevAwal}</td>
          <td style="text-align:center; vertical-align:middle;">${probAwal}</td>
          <td style="text-align:center; vertical-align:middle; ${initColorStyle}">${riskAwal}</td>
          <td>${ctrl}</td>
          <td style="text-align:center; vertical-align:middle;">${sevSisa}</td>
          <td style="text-align:center; vertical-align:middle;">${probSisa}</td>
          <td style="text-align:center; vertical-align:middle; ${resColorStyle}">${riskSisa}</td>
        </tr>
      `;
    }

    // Susun Tabel 28 Kategori THA (Sheet 3: 4 baris x 7 kategori)
    const thaCats = (window.PRAKARSA_DATA && window.PRAKARSA_DATA.thaCategories) || [];
    let thaBandsHtml = "";
    for (let band = 0; band < 4; band++) {
      let headerRow = "<tr>";
      let itemsRow = "<tr>";
      for (let col = 0; col < 7; col++) {
        const catIdx = band * 7 + col;
        const catNum = catIdx + 1;
        const catObj = thaCats[catIdx];
        const catChk = formDataMap["THA_KAT_" + catNum] || "☐";

        headerRow += `
          <td class="tha-chk-hdr">${catChk}</td>
          <td class="tha-txt-hdr">${catObj ? escapeHtml(catObj.title) : ""}</td>
        `;

        let chkLines = [];
        let txtLines = [];
        if (catObj && catObj.items) {
          catObj.items.forEach((itText, iIdx) => {
            const itChk = formDataMap[`THA_${catNum}_${iIdx + 1}`] || "☐";
            chkLines.push(`<div class="tha-row-item"><span class="tha-box-col">${itChk}</span><span class="tha-text-col">${escapeHtml(itText)}</span></div>`);
          });
        }
        itemsRow += `<td colspan="2" class="tha-itm-cell">${chkLines.join("")}</td>`;
      }
      headerRow += "</tr>";
      itemsRow += "</tr>";
      thaBandsHtml += headerRow + itemsRow;
    }

    const wrapper = document.createElement("div");
    wrapper.style.width = "1080px";
    wrapper.style.background = "#FFFFFF";
    wrapper.style.color = "#000000";
    wrapper.style.fontFamily = "Calibri, Arial, sans-serif";

    wrapper.innerHTML = `
      <style>
        .xl-pdf-root * { box-sizing: border-box; font-family: Calibri, Arial, sans-serif; color: #000000; }
        .xl-sheet-page {
          width: 1100px;
          background: #FFFFFF;
          padding: 10px 14px;
          margin-bottom: 16px;
        }
        .xl-table {
          width: 100%;
          border-collapse: collapse;
          border: 1.5px solid #000000;
          table-layout: fixed;
        }
        .xl-table th, .xl-table td {
          border: 1px solid #000000;
          padding: 3px 5px;
          font-size: 10px;
          line-height: 1.25;
          vertical-align: top;
          word-wrap: break-word;
        }
        .xl-logo-cell {
          text-align: center;
          vertical-align: middle !important;
          padding: 4px !important;
        }
        .xl-logo-img {
          max-height: 44px;
          max-width: 155px;
          object-fit: contain;
        }
        .xl-main-title {
          text-align: center;
          vertical-align: middle !important;
          font-size: 16px !important;
          font-weight: 800;
          font-style: italic;
        }
        .xl-gray {
          background-color: #D9D9D9 !important;
          font-weight: 700;
        }
        .xl-center {
          text-align: center;
          vertical-align: middle !important;
        }
        .tha-chk-hdr {
          background-color: #FFFF00 !important;
          width: 16px;
          text-align: center;
          vertical-align: middle !important;
          font-size: 8.5px !important;
          font-weight: 700;
          padding: 2px 1px !important;
        }
        .tha-txt-hdr {
          background-color: #FFFF00 !important;
          vertical-align: middle !important;
          font-size: 8px !important;
          font-weight: 700;
          padding: 2px 4px !important;
        }
        .tha-itm-cell {
          padding: 2px 3px !important;
          vertical-align: top !important;
        }
        .tha-row-item {
          display: flex;
          align-items: flex-start;
          gap: 3px;
          font-size: 6.7px;
          line-height: 1.18;
          margin-bottom: 1.2px;
        }
        .tha-box-col {
          width: 10px;
          flex-shrink: 0;
          text-align: center;
          font-weight: 700;
        }
        .tha-text-col {
          flex: 1;
        }
      </style>

      <div class="xl-pdf-root">
        <!-- =======================================================
             SHEET 1 (TABLE 1): INFORMASI PEKERJAAN & PERSETUJUAN
             ======================================================= -->
        <div class="xl-sheet-page">
          <table class="xl-table">
            <colgroup>
              <col style="width:18%;" />
              <col style="width:15%;" />
              <col style="width:13%;" />
              <col style="width:2%;" />
              <col style="width:7%;" />
              <col style="width:11.25%;" />
              <col style="width:11.25%;" />
              <col style="width:11.25%;" />
              <col style="width:11.25%;" />
            </colgroup>
            <tr>
              <td rowspan="2" class="xl-logo-cell">
                <img src="${logoSrc}" class="xl-logo-img" alt="Pertamina Hulu Energi" />
              </td>
              <td colspan="5" rowspan="2" class="xl-main-title">RISK ASSESSMENT (RA)</td>
              <td colspan="3" style="font-weight:700; vertical-align:middle;">RA No.: ${escapeHtml(formDataMap.RA_NO || "-")}</td>
            </tr>
            <tr>
              <td colspan="3" style="font-weight:700; vertical-align:middle;">Tanggal registrasi: ${escapeHtml(formDataMap.TANGGAL_REG || "-")}</td>
            </tr>
            <tr>
              <td colspan="3" class="xl-gray">Fasilitas/site: <span style="font-weight:400;">${escapeHtml(formDataMap.SITE || "-")}</span></td>
              <td colspan="6" class="xl-gray">Lokasi: <span style="font-weight:400;">${escapeHtml(formDataMap.LOKASI || "-")}</span></td>
            </tr>
            <tr>
              <td class="xl-gray">Tipe PTW:</td>
              <td colspan="8" style="font-weight:700;">
                <span style="display:inline-block; min-width:18px; text-align:center; border:1px solid #000; margin-right:4px;">${formDataMap.CEK_HOTWORK ? "V" : "&nbsp;"}</span> Hot work (merah)
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span style="display:inline-block; min-width:18px; text-align:center; border:1px solid #000; margin-right:4px;">${formDataMap.CEK_CRITICAL ? "V" : "&nbsp;"}</span> Critical work (kuning)
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span style="display:inline-block; min-width:18px; text-align:center; border:1px solid #000; margin-right:4px;">${formDataMap.CEK_BREAKING ? "V" : "&nbsp;"}</span> Breaking containment (hitam)
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span style="display:inline-block; min-width:18px; text-align:center; border:1px solid #000; margin-right:4px;">${formDataMap.CEK_GENERAL ? "V" : "&nbsp;"}</span> General work (biru)
              </td>
            </tr>
            <tr>
              <td colspan="9" style="height:44px;">
                <strong>Deskripsi pekerjaan (termasuk peralatan kerja):</strong> ${escapeHtml(formDataMap.DESKRIPSI || "-")}
              </td>
            </tr>
            <tr>
              <td colspan="3" style="font-size:9px;">
                <strong>Tim Kaji Risiko RA</strong> mengonfirmasi bahwa risiko pekerjaan yang dideskripsikan telah dikaji dan tindakan pengendalian yang memadai telah ditetapkan untuk menurunkan risiko pekerjaan.
              </td>
              <td style="border-top:none; border-bottom:none;"></td>
              <td colspan="5" style="font-size:9px;">
                <strong>Risk Assessment (RA) Reviewer</strong><br/>
                Saya telah meninjau tindakan pengendalian yang ditetapkan dapat menurunkan risiko dan menyetujui pekerjaan untuk dilaksanakan.
              </td>
            </tr>
            <tr>
              <td colspan="3" class="xl-gray xl-center">Tim Kaji Risiko</td>
              <td style="border-top:none; border-bottom:none;"></td>
              <td class="xl-gray"></td>
              <td class="xl-gray xl-center">Site Controller</td>
              <td class="xl-gray xl-center">Manager Lini</td>
              <td class="xl-gray xl-center">Field Manager/Sr. Manager</td>
              <td class="xl-gray xl-center">General Manager</td>
            </tr>
            <tr>
              <td class="xl-gray xl-center">Nama</td>
              <td class="xl-gray xl-center">Jabatan</td>
              <td class="xl-gray xl-center">Tanda tangan</td>
              <td style="border-top:none; border-bottom:none;"></td>
              <td class="xl-gray xl-center">Nama</td>
              <td class="xl-center">${escapeHtml(formDataMap.REV_SC_NAMA || "")}</td>
              <td class="xl-center">${escapeHtml(formDataMap.REV_ML_NAMA || "")}</td>
              <td class="xl-center">${escapeHtml(formDataMap.REV_FM_NAMA || "")}</td>
              <td class="xl-center">${escapeHtml(formDataMap.REV_GM_NAMA || "")}</td>
            </tr>
            <tr style="height:26px;">
              <td>${escapeHtml(formDataMap.TIM_NAMA_1 || "")}</td>
              <td>${escapeHtml(formDataMap.TIM_JABATAN_1 || "")}</td>
              <td></td>
              <td style="border-top:none; border-bottom:none;"></td>
              <td rowspan="2" class="xl-gray xl-center">Tanda tangan</td>
              <td rowspan="2"></td>
              <td rowspan="2"></td>
              <td rowspan="2"></td>
              <td rowspan="2"></td>
            </tr>
            <tr style="height:26px;">
              <td>${escapeHtml(formDataMap.TIM_NAMA_2 || "")}</td>
              <td>${escapeHtml(formDataMap.TIM_JABATAN_2 || "")}</td>
              <td></td>
              <td style="border-top:none; border-bottom:none;"></td>
            </tr>
            <tr style="height:26px;">
              <td>${escapeHtml(formDataMap.TIM_NAMA_3 || "")}</td>
              <td>${escapeHtml(formDataMap.TIM_JABATAN_3 || "")}</td>
              <td></td>
              <td style="border-top:none; border-bottom:none;"></td>
              <td class="xl-gray xl-center">Tanggal</td>
              <td class="xl-center">${escapeHtml(formDataMap.REV_SC_TGL || "")}</td>
              <td class="xl-center">${escapeHtml(formDataMap.REV_ML_TGL || "")}</td>
              <td class="xl-center">${escapeHtml(formDataMap.REV_FM_TGL || "")}</td>
              <td class="xl-center">${escapeHtml(formDataMap.REV_GM_TGL || "")}</td>
            </tr>
            <tr style="height:26px;">
              <td>${escapeHtml(formDataMap.TIM_NAMA_4 || "")}</td>
              <td>${escapeHtml(formDataMap.TIM_JABATAN_4 || "")}</td>
              <td></td>
              <td style="border-top:none; border-bottom:none;"></td>
              <td colspan="5" rowspan="3" style="font-size:8.5px; line-height:1.3;">
                Kaji risiko harus diperiksa dan ditandatangani SC sebelum memberikan otorisasi izin kerja.<br/>
                Setiap risiko sisa perlu diberikan persetujuan oleh pihak terkait sesuai dengan tingkatannya:<br/>
                &nbsp;&nbsp;• 1-3 (rendah) dan 4 (rendah ke moderate): Site Controller<br/>
                &nbsp;&nbsp;• 5-9 (moderate): Manager Lini<br/>
                &nbsp;&nbsp;• 10-12 (moderate ke tinggi): Field Manager/Senior Manager<br/>
                &nbsp;&nbsp;• 15-25 (high): General Manager
              </td>
            </tr>
            <tr style="height:26px;">
              <td>${escapeHtml(formDataMap.TIM_NAMA_5 || "")}</td>
              <td>${escapeHtml(formDataMap.TIM_JABATAN_5 || "")}</td>
              <td></td>
              <td style="border-top:none; border-bottom:none;"></td>
            </tr>
            <tr style="height:26px;">
              <td>${escapeHtml(formDataMap.TIM_NAMA_6 || "")}</td>
              <td>${escapeHtml(formDataMap.TIM_JABATAN_6 || "")}</td>
              <td></td>
              <td style="border-top:none; border-bottom:none;"></td>
            </tr>
            <tr>
              <td colspan="9" style="font-size:8.5px; line-height:1.35; padding:6px 8px;">
                <strong>Petunjuk pengisian:</strong><br/>
                1. Isi deskripsi pekerjaan<br/>
                2. Isi kolom nomor, langkah pekerjaan, bahaya, dampak, risiko awal, tindakan pengendalian (gunakan Task Hazard Assessment untuk membantu mengidentifikasi tindakan pengendalian yang sesuai), dan risiko sisa.<br/>
                3. Tim Kaji Risiko RA menandatangani Risk Assessment<br/>
                4. Persetujuan RA oleh pihak terkait sesuai tingkat risiko sisa.
              </td>
            </tr>
          </table>
        </div>

        <!-- =======================================================
             SHEET 2 (TABLE 2): IDENTIFIKASI BAHAYA & MATRIKS RISIKO
             ======================================================= -->
        <div class="xl-sheet-page">
          <table class="xl-table">
            <colgroup>
              <col style="width:4%;" />
              <col style="width:21%;" />
              <col style="width:16%;" />
              <col style="width:16%;" />
              <col style="width:4.5%;" />
              <col style="width:4.5%;" />
              <col style="width:4.5%;" />
              <col style="width:16%;" />
              <col style="width:4.5%;" />
              <col style="width:4.5%;" />
              <col style="width:4.5%;" />
            </colgroup>
            <tr>
              <td colspan="2" rowspan="2" class="xl-logo-cell">
                <img src="${logoSrc}" class="xl-logo-img" alt="Pertamina Hulu Energi" />
              </td>
              <td colspan="5" rowspan="2" class="xl-main-title">RISK ASSESSMENT (RA)</td>
              <td colspan="4" style="font-weight:700; vertical-align:middle;">RA No.: ${escapeHtml(formDataMap.RA_NO || "-")}</td>
            </tr>
            <tr>
              <td colspan="4" style="font-weight:700; vertical-align:middle;">Tanggal registrasi: ${escapeHtml(formDataMap.TANGGAL_REG || "-")}</td>
            </tr>
            <tr>
              <td colspan="3" class="xl-gray">Fasilitas/site: <span style="font-weight:400;">${escapeHtml(formDataMap.SITE || "-")}</span></td>
              <td colspan="8" class="xl-gray">Lokasi: <span style="font-weight:400;">${escapeHtml(formDataMap.LOKASI || "-")}</span></td>
            </tr>
            <tr>
              <th rowspan="2" class="xl-gray xl-center">No<br/>(1)</th>
              <th rowspan="2" class="xl-gray xl-center">Deskripsi Langkah Pekerjaan<br/>(2)</th>
              <th rowspan="2" class="xl-gray xl-center">Bahaya<br/>(3)</th>
              <th rowspan="2" class="xl-gray xl-center">Dampak<br/>(4)</th>
              <th colspan="3" class="xl-gray xl-center">Risiko Awal<br/>(5)</th>
              <th rowspan="2" class="xl-gray" style="text-align:center;">
                Tindakan Pengendalian (6)
                <div style="text-align:left; font-weight:400; font-size:8px; margin-top:3px;">
                  1. Eliminasi (EL)<br/>
                  2. Subtitusi (SB)<br/>
                  3. Engineering (EC)<br/>
                  4. Administratif (AD)<br/>
                  5. Alat Pelindung Diri (APD) khusus
                </div>
              </th>
              <th colspan="3" class="xl-gray xl-center">Risiko Sisa<br/>(7)</th>
            </tr>
            <tr>
              <th class="xl-gray xl-center" style="font-size:8px;">Keparahan (5a)</th>
              <th class="xl-gray xl-center" style="font-size:8px;">Kemungkinan (5b)</th>
              <th class="xl-gray xl-center" style="font-size:8px;">Tingkat Risiko (5c)</th>
              <th class="xl-gray xl-center" style="font-size:8px;">Keparahan (7a)</th>
              <th class="xl-gray xl-center" style="font-size:8px;">Kemungkinan (7b)</th>
              <th class="xl-gray xl-center" style="font-size:8px;">Tingkat Risiko (7c)</th>
            </tr>
            ${stepRowsHtml}
          </table>
        </div>

        <!-- =======================================================
             SHEET 3 (TABLE 3): TASK HAZARD ASSESSMENT (THA)
             ======================================================= -->
        <div class="xl-sheet-page">
          <table class="xl-table">
            <tr>
              <td colspan="4" class="xl-logo-cell" style="height:36px;">
                <img src="${logoSrc}" class="xl-logo-img" style="max-height:32px;" alt="Pertamina Hulu Energi" />
              </td>
              <td colspan="10" class="xl-main-title" style="font-style:normal; font-size:15px !important;">
                Task Hazard Assessment (THA)
              </td>
            </tr>
            <tr>
              <td colspan="14" style="text-align:center; font-size:8px; padding:2px 4px;">
                Tabel bahaya dan pengendalian berikut dapat membantu tim kaji risiko untuk mengelola risiko pekerjaan. Tabel ini tidak mencakup semua bahaya yang mungkin ada di pekerjaan.<br/>
                Tentukan bahaya yang ada pada langkah pekerjaan dan identifikasi langkah pengendalian yang akan dilakukan.
              </td>
            </tr>
            ${thaBandsHtml}
          </table>
        </div>
      </div>
    `;

    return wrapper;
  }

  async function generatePdfFromForm(formDataMap, pdfFileName) {
    const outFile = pdfFileName || "Risk_Assessment_PHE_WMO.pdf";

    const JsPDFClass =
      (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;

    if (typeof window.html2canvas === "undefined" || !JsPDFClass) {
      alert("Library pembuat PDF sedang dimuat. Pastikan koneksi internet aktif lalu coba lagi.");
      return false;
    }

    // Tempatkan di dalam viewport (bukan left: -9999px) agar html2canvas
    // menangkap 100% tabel, warna matriks, dan logo tanpa nge-blank putih!
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.overflow = "auto";
    overlay.style.background = "rgba(15, 38, 74, 0.88)";
    overlay.style.zIndex = "99999";
    overlay.style.padding = "20px 0";

    const statusBanner = document.createElement("div");
    statusBanner.style.color = "#FFFFFF";
    statusBanner.style.textAlign = "center";
    statusBanner.style.fontWeight = "800";
    statusBanner.style.fontSize = "16px";
    statusBanner.style.marginBottom = "12px";
    statusBanner.style.fontFamily = "Plus Jakarta Sans, Arial, sans-serif";
    statusBanner.textContent = "Sedang menyusun Dokumen PDF 3 Halaman (Mohon tunggu 1-2 detik)...";
    overlay.appendChild(statusBanner);

    const reportEl = buildThreeSheetHtmlElement(formDataMap);
    reportEl.style.width = "1100px";
    reportEl.style.margin = "0 auto";
    overlay.appendChild(reportEl);
    document.body.appendChild(overlay);

    try {
      // Pastikan seluruh gambar logo Base64 selesai ter-decode sebelum difoto canvas
      const imgs = Array.from(reportEl.querySelectorAll("img"));
      await Promise.all(
        imgs.map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) return resolve();
              img.onload = resolve;
              img.onerror = resolve;
            })
        )
      );
      await new Promise((r) => setTimeout(r, 120));

      const sheetPages = Array.from(reportEl.querySelectorAll(".xl-sheet-page"));
      const pdf = new JsPDFClass({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      const pageWidthMm = 297;
      const pageHeightMm = 210;
      const marginMm = 6;
      const maxW = pageWidthMm - marginMm * 2;
      const maxH = pageHeightMm - marginMm * 2;

      for (let i = 0; i < sheetPages.length; i++) {
        const sheetEl = sheetPages[i];
        const canvas = await window.html2canvas(sheetEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#FFFFFF",
          logging: false
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.96);
        const ratio = canvas.width / canvas.height;

        let renderW = maxW;
        let renderH = renderW / ratio;
        if (renderH > maxH) {
          renderH = maxH;
          renderW = renderH * ratio;
        }

        const xOffset = marginMm + (maxW - renderW) / 2;
        const yOffset = marginMm;

        if (i > 0) {
          pdf.addPage("a4", "landscape");
        }
        pdf.addImage(imgData, "JPEG", xOffset, yOffset, renderW, renderH);
      }

      pdf.save(outFile);
      return true;
    } catch (err) {
      console.error("Kesalahan saat mengunduh PDF:", err);
      alert("Gagal mengunduh file PDF: " + err.message);
      return false;
    } finally {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }
  }

  return {
    saveTemplate: saveTemplateToStorage,
    getTemplateInfo: getSavedTemplateInfo,
    generateExcel: generateFilledExcel,
    generatePdf: generatePdfFromForm
  };
})();
