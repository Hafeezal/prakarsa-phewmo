/* =========================================================
   FILE: js/data.js
   FUNGSI: Menyimpan seluruh data konfigurasi K3 PRAKARSA:
           - 4 Kategori Pekerjaan & Edukasi K3 (Tahap 1)
           - Site Lokasi & 8 Area Pekerjaan ORF (Tahap 1)
           - Panduan Keparahan / Severity 1–5 (Tahap 2)
           - Panduan Kemungkinan / Probability 1–5 (Tahap 2)
           - 5 Hirarki Tindakan Pengendalian EL, SB, EC, AD, APD (Tahap 2)
           - Aturan Warna & Kategori Matriks Risiko 5x5 (Skor 1–25)
   ========================================================= */

window.PRAKARSA_DATA = {
  // 1. Data 4 Kategori Pekerjaan & Edukasi K3 (Tahap 1)
  workCategories: [
    {
      id: "general",
      label: "General / Umum",
      cssClass: "cat-general",
      colorHex: "#0A84FF",
      description:
        "Pekerjaan umum yang tidak termasuk dalam kategori pekerjaan khusus atau pekerjaan kritis berdasarkan klasifikasi yang berlaku.",
      examples: [
        "Pemeriksaan rutin peralatan",
        "Pekerjaan administrasi lapangan",
        "Pengecatan ringan / housekeeping"
      ]
    },
    {
      id: "hotwork",
      label: "Hot Work / Pekerjaan Panas",
      cssClass: "cat-hotwork",
      colorHex: "#EE2229",
      description:
        "Pekerjaan yang dapat menghasilkan sumber penyalaan, percikan api, panas, atau energi termal yang berpotensi menimbulkan kebakaran atau ledakan.",
      examples: [
        "Pengelasan (welding)",
        "Penggerindaan (grinding)",
        "Pemotongan menggunakan alat panas"
      ]
    },
    {
      id: "critical",
      label: "Critical Work / Pekerjaan Kritis",
      cssClass: "cat-critical",
      colorHex: "#FFD400",
      description:
        "Pekerjaan yang memiliki potensi bahaya signifikan sehingga memerlukan pengendalian dan persyaratan keselamatan khusus.",
      examples: [
        "Bekerja di ketinggian (working at height)",
        "Operasi pengangkatan (lifting operation)",
        "Masuk ruang terbatas (confined space entry)"
      ]
    },
    {
      id: "breaking",
      label: "Breaking Containment / Pembukaan Isolasi",
      cssClass: "cat-breaking",
      colorHex: "#242629",
      description:
        "Pekerjaan yang melibatkan pembukaan atau pemutusan sistem yang sebelumnya tertutup dan dapat mengandung fluida, gas, uap, tekanan, atau energi tersimpan.",
      examples: [
        "Membuka sambungan flange pada jalur pipa",
        "Membongkar sambungan pipa proses",
        "Membuka peralatan atau bejana yang berpotensi masih bertekanan"
      ]
    }
  ],

  // 2. Pilihan Site Lokasi Pekerjaan PHE WMO
  siteLocations: [
    "Onshore Receiving Facility",
    "Lamongan Shorebase",
    "Central Processing Platform",
    "Poleng Processing Platform"
  ],

  // 3. Area Pekerjaan khusus Onshore Receiving Facility (8 Area)
  workAreasBySite: {
    "Onshore Receiving Facility": [
      "Gedung Baru (Belakang)",
      "Open Yard",
      "Area Fabrikasi",
      "Area Proses",
      "Area Flare",
      "Area Control Room",
      "Area Meeting Room",
      "Area Tangki Kondensat"
    ],
    "Lamongan Shorebase": [],
    "Central Processing Platform": [],
    "Poleng Processing Platform": []
  },

  // 4. Pilihan Dropdown Jabatan Tim Kaji Risiko
  teamRoleOptions: [
    "Risk Assessment Facilitator",
    "AA (Area Authority)",
    "PA (Performing Authority)",
    "Member",
    "SC (Site Controller)"
  ],

  // =========================================================
  // DATA TAHAP 2: PANDUAN MATRIKS RISIKO (SESUAI PDF RESMI)
  // =========================================================

  // 5. Panduan Dampak Bahaya (Severity / Keparahan) Level 1 s/d 5
  severityLevels: [
    {
      value: 1,
      label: "1 – Sangat Kecil",
      shortSummary: "First Aid Case (P3K), tanpa kerusakan lingkungan, kerugian < US$10 ribu",
      manusia:
        "First Aid Case (FAC): Cedera ringan yang cukup ditangani dengan pertolongan pertama (P3K), tanpa rujukan medis.",
      lingkungan:
        "Tidak ada kerusakan lingkungan atau tumpahan minyak kurang dari 1 barel (±159 liter).",
      aset: "Kerugian perusahaan kurang dari US$10 ribu (±Rp181 juta).",
      reputasi: "Tidak menimbulkan dampak terhadap reputasi perusahaan.",
      badgeColor: "#2E7D32",
      textColor: "#FFFFFF"
    },
    {
      value: 2,
      label: "2 – Kecil",
      shortSummary: "Medical Treatment Case (MTC), tumpahan 1–5 barel, kerugian US$10rb–100rb",
      manusia:
        "Medical Treatment Case (MTC): Cedera yang memerlukan penanganan medis lebih lanjut di klinik atau rumah sakit.",
      lingkungan:
        "Tumpahan minyak di area perusahaan lebih dari 1–5 barel (±159–795 liter).",
      aset: "Kerugian perusahaan US$10 ribu–100 ribu (±Rp181 juta–1,81 miliar).",
      reputasi: "Reputasi perusahaan terdampak di lingkungan internal.",
      badgeColor: "#8CC67B",
      textColor: "#0F264A"
    },
    {
      value: 3,
      label: "3 – Sedang",
      shortSummary: "Restricted Work Case (RWC), tumpahan 5–15 barel, kerugian US$100rb–1 juta",
      manusia:
        "Restricted Work Case (RWC): Cedera yang menyebabkan pekerja tidak dapat melakukan sebagian tugas normalnya dan harus bekerja dengan pembatasan.",
      lingkungan:
        "Kerusakan lingkungan di area perusahaan atau tumpahan minyak lebih dari 5–15 barel (±795–2.385 liter).",
      aset: "Kerugian perusahaan US$100 ribu–1 juta (±Rp1,81–18,1 miliar).",
      reputasi: "Reputasi perusahaan terdampak buruk di tingkat lokal (kota/kabupaten).",
      badgeColor: "#FACC15",
      textColor: "#0F264A"
    },
    {
      value: 4,
      label: "4 – Besar",
      shortSummary: "Single Fatality / Cacat Permanen / LTI, tumpahan 15–100 barel, dampak provinsi",
      manusia:
        "Single Fatality / Cacat Permanen / LTI: Kejadian yang menyebabkan satu orang meninggal, cacat permanen, atau kehilangan waktu kerja akibat cedera.",
      lingkungan:
        "Kerusakan lingkungan di area sensitif atau tumpahan minyak lebih dari 15–100 barel (±2.385–15.900 liter).",
      aset: "Kerugian perusahaan US$1–5 juta (±Rp18,1–90,6 miliar).",
      reputasi: "Reputasi perusahaan terdampak buruk di tingkat provinsi.",
      badgeColor: "#F97316",
      textColor: "#FFFFFF"
    },
    {
      value: 5,
      label: "5 – Sangat Besar",
      shortSummary: "Multiple Fatality, tumpahan > 100 barel, kerugian > US$5 juta, dampak nasional",
      manusia:
        "Multiple Fatality: Kejadian yang menyebabkan lebih dari satu orang meninggal dunia.",
      lingkungan:
        "Kerusakan lingkungan sangat berat di area sensitif atau tumpahan minyak lebih dari 100 barel (±15.900 liter).",
      aset: "Kerugian perusahaan lebih dari US$5 juta (±Rp90,6 miliar).",
      reputasi: "Reputasi perusahaan terdampak buruk secara nasional dan internasional.",
      badgeColor: "#E31E24",
      textColor: "#FFFFFF"
    }
  ],

  // 6. Panduan Kemungkinan Kejadian (Probability / Probabilitas) Nilai 1 s/d 5
  probabilityLevels: [
    {
      value: 1,
      label: "1 – Hampir Tidak Mungkin Terjadi",
      category: "Hampir Tidak Mungkin Terjadi",
      guide: "Kejadian hampir tidak mungkin terjadi dengan kondisi dan pengendalian saat ini.",
      badgeColor: "#2E7D32",
      textColor: "#FFFFFF"
    },
    {
      value: 2,
      label: "2 – Jarang Terjadi",
      category: "Jarang Terjadi",
      guide: "Kejadian jarang ditemukan, tetapi masih mungkin terjadi.",
      badgeColor: "#8CC67B",
      textColor: "#0F264A"
    },
    {
      value: 3,
      label: "3 – Bisa Terjadi",
      category: "Bisa Terjadi",
      guide: "Kejadian pernah terjadi di site atau umum terjadi pada pekerjaan sejenis.",
      badgeColor: "#FACC15",
      textColor: "#0F264A"
    },
    {
      value: 4,
      label: "4 – Sangat Mungkin Terjadi",
      category: "Sangat Mungkin Terjadi",
      guide: "Kejadian pernah terjadi setidaknya satu kali dalam 1 tahun terakhir di site.",
      badgeColor: "#F97316",
      textColor: "#FFFFFF"
    },
    {
      value: 5,
      label: "5 – Hampir Pasti Terjadi",
      category: "Hampir Pasti Terjadi",
      guide:
        "Kejadian sangat sering terjadi atau diperkirakan berulang setidaknya setiap 6 bulan, dan terjadi 6 bulan terakhir di site.",
      badgeColor: "#E31E24",
      textColor: "#FFFFFF"
    }
  ],

  // 7. 5 Hirarki Tindakan Pengendalian (Kolom 6 Formulir RA)
  controlHierarchy: [
    {
      code: "EL",
      label: "1. Eliminasi (EL)",
      description: "Menghilangkan sumber bahaya atau aktivitas berbahaya secara langsung dari proses kerja.",
      placeholder: "Contoh: Menghilangkan kebutuhan bekerja di ketinggian dengan menurunkan komponen ke lantai kerja (EL)"
    },
    {
      code: "SB",
      label: "2. Substitusi (SB)",
      description: "Mengganti bahan, peralatan, atau metode kerja dengan alternatif yang memiliki bahaya lebih rendah.",
      placeholder: "Contoh: Mengganti cairan pembersih mudah terbakar dengan cairan berbasis air / water-based (SB)"
    },
    {
      code: "EC",
      label: "3. Rekayasa Teknis / Engineering (EC)",
      description: "Menggunakan rekayasa teknologi dan peralatan untuk membantu pekerjaan atau membatasi bahaya.",
      placeholder: "Contoh: Menggunakan hand pallet / alat bantu angkat mekanis untuk memindahkan beban berat (EC)"
    },
    {
      code: "AD",
      label: "4. Administratif (AD)",
      description: "Pengendalian melalui prosedur kerja aman (SOP/SIKA), rotasi pekerja, pelatihan, rambu K3, atau pengawasan.",
      placeholder: "Contoh: Melakukan toolbox meeting, memasang barikade keselamatan, dan membatasi durasi angkat (AD)"
    },
    {
      code: "APD",
      label: "5. Alat Pelindung Diri (APD) Khusus",
      description: "Penggunaan Alat Pelindung Diri spesifik untuk mengurangi tingkat keparahan dampak pada pekerja.",
      placeholder: "Contoh: Menggunakan safety gloves anti-slip, safety shoes steel toe, dan back support belt (APD)"
    }
  ],

  // 8. Fungsi Penentu Warna & Kategori Tingkat Risiko Berdasarkan Skor (Probability × Severity)
  //    Sesuai Tabel Matriks Risiko 5x5 yang Anda kirimkan:
  //    - 1 s/d 3  : Hijau Tua (#2E7D32)  -> Rendah (Site Controller)
  //    - 4        : Hijau Muda (#8CC67B) -> Rendah ke Moderate (Site Controller)
  //    - 5 s/d 9  : Kuning Cerah (#FFFF00) -> Moderate / Sedang (Manager Lini)
  //    - 10 s/d 12: Oranye (#FF9900)     -> Moderate ke Tinggi (Field Manager / Sr. Manager)
  //    - 15 s/d 25: Merah (#FF0000)      -> Tinggi / Sangat Besar (General Manager)
  getRiskMatrixInfo: function (score) {
    const num = Number(score);
    if (!num || num < 1) {
      return {
        score: 0,
        levelName: "Belum Dinilai",
        reviewerRole: "-",
        bgColor: "#E2E8F0",
        textColor: "#475569",
        borderColor: "#CBD5E1",
        cssClass: "risk-unrated"
      };
    }

    if (num >= 1 && num <= 3) {
      return {
        score: num,
        levelName: "Rendah (Low)",
        reviewerRole: "Site Controller",
        bgColor: "#2E7D32",
        textColor: "#FFFFFF",
        borderColor: "#1B5E20",
        cssClass: "risk-green-dark"
      };
    }

    if (num === 4) {
      return {
        score: num,
        levelName: "Rendah ke Moderate",
        reviewerRole: "Site Controller",
        bgColor: "#8CC67B",
        textColor: "#0F264A",
        borderColor: "#68A357",
        cssClass: "risk-green-light"
      };
    }

    if (num >= 5 && num <= 9) {
      return {
        score: num,
        levelName: "Moderate (Sedang)",
        reviewerRole: "Manager Lini",
        bgColor: "#FFFF00",
        textColor: "#0F264A",
        borderColor: "#D9B800",
        cssClass: "risk-yellow"
      };
    }

    if (num >= 10 && num <= 14) {
      return {
        score: num,
        levelName: "Moderate ke Tinggi",
        reviewerRole: "Field Manager / Sr. Manager",
        bgColor: "#FF9900",
        textColor: "#0F264A",
        borderColor: "#CC7A00",
        cssClass: "risk-orange"
      };
    }

    return {
      score: num,
      levelName: "Tinggi / Sangat Besar (High)",
      reviewerRole: "General Manager",
      bgColor: "#FF0000",
      textColor: "#FFFFFF",
      borderColor: "#B91C1C",
      cssClass: "risk-red"
    };
  },

  // =========================================================
  // DATA TAHAP 3: 28 KATEGORI TASK HAZARD ASSESSMENT (THA)
  //               SESUAI LEMBAR RESMI PHE WMO
  // =========================================================
  thaCategories: [
    // BARIS 1 (1 s/d 7)
    {
      id: "tha_perkakas",
      title: "Perkakas dan Peralatan",
      items: [
        "Inspeksi perkakas & peralatan",
        "Tidak menggunakan perkakas modifikasi",
        "Gunakan pelindung/guard",
        "Gunakan perkakas dan peralatan yang sesuai",
        "Lapisi atau hilangkan sisi/bagian yang tajam",
        "Terapkan teknik keselamatan tangan (hand safety)"
      ]
    },
    {
      id: "tha_obyek_bergerak",
      title: "Peralatan atau Obyek Bergerak",
      items: [
        "Pastikan integritas pelindung mesin",
        "Sediakan barrier pelindung",
        "Observer untuk mengawasi orang atau peralatan yang mendekat",
        "Shutdown atau lock out peralatan",
        "Jangan bekerja di line of fire"
      ]
    },
    {
      id: "tha_bergetar",
      title: "Peralatan Bergetar",
      items: [
        "Kelola waktu pajanan",
        "Kaji efek getaran pada peralatan",
        "Gunakan peralatan yang rendah getaran",
        "Terapkan pengendalian kebisingan"
      ]
    },
    {
      id: "tha_listrik_portable",
      title: "Peralatan Listrik Portable",
      items: [
        "Inspeksi kondisi dan tanggal pengetesan peralatan",
        "Terapkan pemantauan pengukuran gas kontinu",
        "Lindungi timah listrik dari benturan atau kerusakan"
      ]
    },
    {
      id: "tha_mobile",
      title: "Peralatan Bergerak/Mobile",
      items: [
        "Kaji kondisi peralatan",
        "Terapkan pengendalian personel atau akses",
        "Batasi dan monitor jarak dengan kabel atau peralatan listrik bertegangan",
        "Kelola bahaya di atas/overhead",
        "Patuhi peraturan jalan atau lokasi"
      ]
    },
    {
      id: "tha_bertekanan",
      title: "Peralatan Bertekanan",
      items: [
        "Lakukan isolasi-LOTO, blinding, atau defeat",
        "Depressurized, drain, purge, dan vent",
        "Buang tekanan yang terjebak",
        "Hindari auto-refrigeration ketika depressurizing",
        "Antisipasi tekanan/cairan sisa",
        "Amankan/ikat selang temporary"
      ]
    },
    {
      id: "tha_panas_dingin",
      title: "Peralatan Panas atau Dingin",
      items: [
        "Panaskan atau dinginkan peralatan sebelum dimulai",
        "Pasang barriers/pelindung",
        "Siapkan penanda warna",
        "Pasang kontrol suhu dingin dan brittle failure",
        "Gunakan sarung tangan suhu panas/dingin"
      ]
    },

    // BARIS 2 (8 s/d 14)
    {
      id: "tha_alat_angkat",
      title: "Peralatan Angkat",
      items: [
        "Pastikan kondisi dan sertifikasi alat angkat",
        "Minta persetujuan untuk pengangkatan di atas peralatan proses",
        "Miliki dokumen rencana pengangkatan/lift plan yang sudah disetujui",
        "Perhatikan jarak selamat pengoperasian alat angkat dari overhead power line"
      ]
    },
    {
      id: "tha_manual_handling",
      title: "Pengangkatan Manual",
      items: [
        "Kaji pekerjaan manual handling",
        "Batasi ukuran angkatan",
        "Jaga postur ergonomis",
        "Konfirmasi stabilitas angkatan dan platform kerja",
        "Cari bantuan atau alat bantu mekanik untuk menghindari titik jepit/pinch points"
      ]
    },
    {
      id: "tha_benda_jatuh",
      title: "Benda Jatuh",
      items: [
        "Pasang penanda dan barriers untuk mencegah akses di bawah pekerjaan pengangkatan",
        "Gunakan alat angkat untuk menaikkan perkakas menuju atau dari platform kerja",
        "Amankan/secure perkakas (tie-off)"
      ]
    },
    {
      id: "tha_material_berbahaya",
      title: "Material Berbahaya",
      items: [
        "Drain atau purging peralatan",
        "Ikuti pengendalian di MSDS",
        "Terapkan pengendalian bahaya kesehatan (Timbal, Asbestos, H2S, Sulfur Dioksida, NORM)",
        "Uji dan analisis material"
      ]
    },
    {
      id: "tha_potensi_tumpahan",
      title: "Potensi Tumpahan",
      items: [
        "Drain peralatan",
        "Sediakan peralatan spill containment",
        "Siapkan peralatan dan material pembersihan tumpahan",
        "Amankan/ikat dan isolasi selang jika tidak digunakan"
      ]
    },
    {
      id: "tha_limbah",
      title: "Pembuangan dan Pembersihan Limbah",
      items: [
        "Terapkan praktik pengelolaan lingkungan",
        "Ikuti prosedur pembuangan limbah di lapangan",
        "Bersihkan peralatan dan material di lapangan",
        "Optimasi pekerjaan untuk meminimalisir limbah terproduksi"
      ]
    },
    {
      id: "tha_terpeleset",
      title: "Terpleset, Tersandung, dan Jatuh",
      items: [
        "Identifikasi dan tutupi permukaan yang tidak rata",
        "Identifikasi dan lapisi permukaan yang tidak rata",
        "Amankan/tutupi kabel, kawat, atau pipa",
        "Bersihkan cairan/tumpahan",
        "Barikade atau pasang rantai/tali bukaan dan lubang"
      ]
    },

    // BARIS 3 (15 s/d 21)
    {
      id: "tha_ignition",
      title: "Sumber Nyala Api/Ignition",
      items: [
        "Hilangkan/isolasi/tampung material mudah terbakar",
        "Sediakan peralatan pemadam",
        "Bangun fire-safe habitat",
        "Sediakan fire watch",
        "Fire watcher harus tetap di lokasi 30 menit setelah pekerjaan panas selesai",
        "Lakukan pengetesan gas",
        "Bonding/grounding listrik statik atau pelindung katodik",
        "Hilangkan material mudah terbakar dalam radius 35 ft (10 m), material yang tidak bisa dihilangkan/dipindahkan harus ditutup pelindung tahan api atau tetap dalam kondisi basah selama pekerjaan panas berlangsung"
      ]
    },
    {
      id: "tha_pencahayaan",
      title: "Kurang Pencahayaan atau Pandangan",
      items: [
        "Sediakan pencahayaan alternatif",
        "Tunggu atau tunda pekerjaan sampai pandangan membaik",
        "Tidak ada pekerjaan di atas air (termasuk di atas laut) yang mungkin memerlukan penyelamatan"
      ]
    },
    {
      id: "tha_kebisingan",
      title: "Kebisingan Tinggi",
      items: [
        "Gunakan APD pelindung pendengaran yang sesuai",
        "Kelola waktu pajanan",
        "Matikan peralatan",
        "Gunakan alat yang senyap",
        "Gunakan sound barriers atau tirai peredam suara"
      ]
    },
    {
      id: "tha_cuaca",
      title: "Cuaca",
      items: [
        "Terapkan pengendalian untuk lantai licin",
        "Angin kencang - goggles",
        "Hidrasi akibat panas, istirahat",
        "Dingin - APD, pemanas",
        "Petir - pemilihan alat, tunda pekerjaan"
      ]
    },
    {
      id: "tha_energi_lain",
      title: "Energi Lain",
      items: [
        "Kendalikan compression atau expansion pegas",
        "Terapkan pengendalian elektromagnetik (radio)",
        "Kelola tekanan atau vakum",
        "Kelola proses yang menghasilkan panas",
        "Gunakan praktik kerja selamat aktivitas seismik"
      ]
    },
    {
      id: "tha_site_controller",
      title: "Site Controller",
      items: [
        "Jaga akses jalur keluar terbuka",
        "Pastikan shower dan eye wash station dapat diakses dan dipergunakan",
        "Miliki rencana penyelamatan",
        "Pastikan alarm darurat, peralatan pemadam, dan tombol shutdown tidak terhalangi"
      ]
    },
    {
      id: "tha_bahaya_lain",
      title: "Bahaya Lain",
      items: [
        "Terapkan pengendalian abrasive blasting (untuk peralatan)",
        "Siapkan rencana penyelaman",
        "Kelola peralatan yang berpotensi tersumbat",
        "Lakukan MOC untuk modifikasi atau sambungan sementara"
      ]
    },

    // BARIS 4 (22 s/d 28)
    {
      id: "tha_personel",
      title: "Personel",
      items: [
        "Lakukan induksi atau pelatihan untuk pekerja baru",
        "Mentoring, coaching atau pengawasan",
        "Verifikasi kompetensi, kemampuan, & pengalaman",
        "Tangani keterbatasan yang sesuai (fatigue, kelelahan, dan pembatasan pekerjaan)",
        "Kelola multi bahasa"
      ]
    },
    {
      id: "tha_ketinggian",
      title: "Bekerja di Ketinggian",
      items: [
        "Diskusikan praktik selamat bekerja di ketinggian",
        "Verifikasi sertifikasi peralatan fall restraint dan fall arrest",
        "Gunakan praktik kerja selamat turun dari ketinggian (abseiling)",
        "Titik angkur standar tersedia",
        "Lakukan 100% tie-off",
        "Jarak fall arrest mencukupi",
        "Amankan perkakas dari jatuh",
        "Inspeksi peralatan pelindung jatuh",
        "Rescue plan dikomunikasikan dan dipahami"
      ]
    },
    {
      id: "tha_ruang_terbatas",
      title: "Ruang Terbatas",
      items: [
        "Lakukan isolasi positif jika masuk ruang terbatas",
        "Diskusikan praktik selamat bekerja di ruang terbatas",
        "Lakukan pengukuran gas (initial, periodik, dan/atau kontinu)",
        "Monitor akses atau masuk",
        "Lindungi tepi permukaan yang tajam dari kontak",
        "Jangan taruh mesin portabel dekat ruang terbatas",
        "Sediakan observer",
        "Siapkan prosedur penyelamatan/rescue plan, termasuk alat dan team rescue",
        "Komunikasikan rescue plan",
        "Gunakan peralatan explosion proof",
        "Tentukan sarana komunikasi antara entry watcher dan entrant",
        "Pasang sirkulasi ventilasi",
        "Siapkan respirator (escape/work/rescue unit)",
        "Lakukan heat stress monitoring ketika suhu di dalam confined space >= 80°F (27°C)",
        "Lakukan pembilasan, pengosongan, atau pembersihan material, cairan, atau gas berbahaya"
      ]
    },
    {
      id: "tha_penggalian",
      title: "Penggalian",
      items: [
        "Identifikasi jenis tanah",
        "Tentukan sistem pelindung bahaya longsor (shoring / brancing / sloping / benching)",
        "Sediakan rencana penggalian atau prosedur kerja",
        "Temukan pipa atau kabel bawah tanah dengan penggalian tangan",
        "Verifikasi dan beri tanda fasilitas bawah tanah (pipa/kabel listrik/instrument/fiber optic)",
        "Perhatikan jarak selamat pengoperasian alat berat dari overhead power line",
        "De-energize layanan bawah tanah",
        "Terapkan pengendalian masuk ke ruang terbatas jika kedalaman parit >= 4 ft (1,2 m)",
        "Siapkan akses masuk-keluar yang selamat (spt ladder, stairway, ramp, slop, dsb.) jika galian >= 4 ft (1,2 m)",
        "Rescue plan dikomunikasikan dan dipahami",
        "Letakkan tumpukan tanah/material >= 2 ft (0,6 m) dari tepi galian",
        "Pasang hard barikade (pagar) untuk mencegah akses yang tidak diizinkan"
      ]
    },
    {
      id: "tha_radiasi",
      title: "Bahaya Radiasi",
      items: [
        "Gunakan barriers dan penanda untuk mencegah akses",
        "Beritahu personel yang mungkin terdampak",
        "Terapkan pengendalian NORM & Lakukan pengujian RAD"
      ]
    },
    {
      id: "tha_voltase_tinggi",
      title: "Energi atau Voltase Tinggi",
      items: [
        "Batasi akses hanya untuk personel yang diotorisasi",
        "Discharge peralatan dan pastikan tidak ada listriknya",
        "Observasi jarak selamat dari kabel",
        "Gunakan APD flash burn suit",
        "Gunakan sarung tangan, perkakas, dan alas insulated"
      ]
    },
    {
      id: "tha_simops",
      title: "Simultaneous Operations (SIMOPS)",
      items: [
        "Ikuti SIMOPS matrix",
        "Lakukan MOC jika ada deviasi dari pembatasan SIMOPS",
        "Interface antara tim kerja",
        "Gunakan barriers dan penanda untuk memisahkan aktivitas antar grup",
        "Izin kerja ditandatangani oleh AA tim kerja terdampak"
      ]
    }
  ],

  // 10. Data Awal Daftar Dokumen pada Menu Status
  initialDocuments: [
    {
      raNo: "RA/PHEWMO/2026/001",
      validUntil: "2026-11-03",
      categoryId: "hotwork",
      categoryLabel: "Hot Work / Pekerjaan Panas",
      description: "Pemotongan pipa besi 8 inch menggunakan gerinda listrik untuk penggantian komponen pipa proses.",
      site: "Onshore Receiving Facility",
      area: "Area Fabrikasi",
      specificLocation: "Bay 2 Workshop Fabrikasi ORF",
      regDate: "2026-10-28",
      teamLeader: "Hafizal (PA)",
      reviewer: "Yudi — Asset / Site Controller",
      status: "Disetujui",
      note: "Pengendalian percikan api (fire blanket & APAR standby) telah sesuai standar SIKA."
    },
    {
      raNo: "RA/PHEWMO/2026/002",
      validUntil: "2026-11-05",
      categoryId: "breaking",
      categoryLabel: "Breaking Containment / Pembukaan Isolasi",
      description: "Pembukaan sambungan flange pada jalur pipa gas untuk pemasangan blind plate.",
      site: "Central Processing Platform",
      area: "Mengikuti Lokasi Spesifik",
      specificLocation: "Area Process Unit - Deck B",
      regDate: "2026-10-30",
      teamLeader: "Hafizal (PA)",
      reviewer: "Baskoro — Field Manager",
      status: "Perlu Revisi",
      note: "Mohon lengkapi prosedur LOTO (Lock Out Tag Out) dan pengukuran gas test sebelum pembukaan baut flange."
    },
    {
      raNo: "RA/PHEWMO/2026/003",
      validUntil: "2026-11-06",
      categoryId: "general",
      categoryLabel: "General / Umum",
      description: "Memperbaiki komponen instrumen di TGRI menggunakan hand tools dan power tools.",
      site: "Onshore Receiving Facility",
      area: "Area Proses",
      specificLocation: "AREA PROCESS UNIT - TGRI",
      regDate: "2026-10-31",
      teamLeader: "Hafizal (PA)",
      reviewer: "Yudi — Asset / Site Controller",
      status: "Menunggu Pemeriksaan",
      note: "Dokumen telah dikirim ke RA Reviewer dan sedang menunggu pemeriksaan."
    }
  ]
};
