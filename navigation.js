/* =========================================================
   FILE: js/navigation.js
   FUNGSI: Mengatur Sistem Login Akun Terdaftar (Hafizal,
           Nurlaili, Namira — Jabatan KP), perpindahan antar
           menu utama (Beranda, RA, Status), serta Logout.
   ========================================================= */

window.PrakarsaNavigation = (function () {
  const SESSION_AUTH_KEY = "prakarsa_logged_in_user_v1";

  // Daftar Akun Resmi yang Diizinkan Mengakses Sistem PRAKARSA
  const REGISTERED_ACCOUNTS = {
    hafizal: {
      username: "hafizal",
      password: "hafizal123",
      displayName: "HAFIZAL",
      shortRole: "KP.",
      fullRole: "Kerja Praktik (KP)"
    },
    nurlaili: {
      username: "nurlaili",
      password: "nurlaili123",
      displayName: "NURLAILI",
      shortRole: "KP.",
      fullRole: "Kerja Praktik (KP)"
    },
    namira: {
      username: "namira",
      password: "namira123",
      displayName: "NAMIRA",
      shortRole: "KP.",
      fullRole: "Kerja Praktik (KP)"
    }
  };

  function applyLoggedInUserToHeader(accountObj) {
    if (!accountObj) return;
    const headerUserName = document.getElementById("headerUserName");
    const headerUserRole = document.getElementById("headerUserRole");
    const profileDropdown = document.getElementById("profileDropdown");

    if (headerUserName) headerUserName.textContent = accountObj.displayName;
    if (headerUserRole) headerUserRole.textContent = accountObj.shortRole;

    if (profileDropdown) {
      const roleOptions = profileDropdown.querySelectorAll(".role-option");
      roleOptions.forEach((opt) => {
        const optName = opt.getAttribute("data-name");
        opt.classList.toggle("active", optName === accountObj.displayName);
      });
    }
  }

  function initLoginGate() {
    const loginGate = document.getElementById("loginOverlayGate");
    const loginForm = document.getElementById("prakarsaLoginForm");
    const userInp = document.getElementById("loginUsername");
    const pwdInp = document.getElementById("loginPassword");
    const errAlert = document.getElementById("loginErrorAlert");
    const btnTogglePwd = document.getElementById("btnTogglePwd");
    const btnLogout = document.getElementById("btnLogoutAccount");

    if (!loginGate || !loginForm) return;

    // Cek apakah sudah login pada sesi tab browser ini
    try {
      const savedUserKey = sessionStorage.getItem(SESSION_AUTH_KEY);
      if (savedUserKey && REGISTERED_ACCOUNTS[savedUserKey]) {
        loginGate.classList.add("hidden");
        applyLoggedInUserToHeader(REGISTERED_ACCOUNTS[savedUserKey]);
      } else {
        loginGate.classList.remove("hidden");
      }
    } catch (e) {
      loginGate.classList.remove("hidden");
    }

    // Tombol Lihat / Sembunyikan Password
    if (btnTogglePwd && pwdInp) {
      btnTogglePwd.addEventListener("click", () => {
        const isPwd = pwdInp.type === "password";
        pwdInp.type = isPwd ? "text" : "password";
        btnTogglePwd.textContent = isPwd ? "Sembunyikan" : "Lihat";
      });
    }

    // Submit Form Login
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const rawUser = (userInp.value || "").trim().toLowerCase();
      const rawPwd = (pwdInp.value || "").trim();

      const matchedAccount = REGISTERED_ACCOUNTS[rawUser];
      if (matchedAccount && matchedAccount.password === rawPwd) {
        if (errAlert) errAlert.classList.remove("visible");
        try {
          sessionStorage.setItem(SESSION_AUTH_KEY, matchedAccount.username);
        } catch (err) {}

        applyLoggedInUserToHeader(matchedAccount);
        loginGate.classList.add("hidden");
        pwdInp.value = "";

        if (window.PrakarsaApp && window.PrakarsaApp.showToast) {
          window.PrakarsaApp.showToast(
            "Selamat datang, " + matchedAccount.displayName + " (" + matchedAccount.shortRole + ")!"
          );
        }
      } else {
        if (errAlert) {
          errAlert.textContent =
            "Username atau Password tidak sesuai. Gunakan akun resmi yang terdaftar.";
          errAlert.classList.add("visible");
        }
      }
    });

    // Tombol Logout / Ganti Akun di Header Kanan Atas
    if (btnLogout) {
      btnLogout.addEventListener("click", (e) => {
        e.stopPropagation();
        try {
          sessionStorage.removeItem(SESSION_AUTH_KEY);
        } catch (err) {}

        const profileDropdown = document.getElementById("profileDropdown");
        if (profileDropdown) profileDropdown.classList.remove("open");

        if (errAlert) errAlert.classList.remove("visible");
        if (userInp) userInp.value = "";
        if (pwdInp) pwdInp.value = "";

        loginGate.classList.remove("hidden");
        if (userInp) userInp.focus();
      });
    }
  }

  // Fungsi utama untuk berpindah halaman
  function navigateTo(pageKey) {
    // 1. Ubah status aktif pada tombol Sidebar kiri
    const navButtons = document.querySelectorAll(".sidebar-nav .nav-item");
    navButtons.forEach((btn) => {
      if (btn.getAttribute("data-page") === pageKey) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // 2. Tampilkan section halaman yang sesuai & sembunyikan yang lain
    const pages = document.querySelectorAll(".page-section");
    pages.forEach((section) => {
      if (section.id === "page-" + pageKey) {
        section.classList.add("active");
      } else {
        section.classList.remove("active");
      }
    });

    // 3. Gulir halaman kembali ke atas dengan halus
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Inisialisasi seluruh tombol navigasi & gerbang login
  function initNavigation() {
    initLoginGate();

    // Klik tombol menu di Sidebar Kiri
    const navButtons = document.querySelectorAll(".sidebar-nav .nav-item");
    navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetPage = btn.getAttribute("data-page");
        navigateTo(targetPage);
      });
    });

    // Klik Kartu "Buat Risk Assessment" di Halaman Beranda
    const btnStartRA = document.getElementById("btnStartRA");
    if (btnStartRA) {
      btnStartRA.addEventListener("click", () => {
        navigateTo("ra");
      });
      btnStartRA.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigateTo("ra");
        }
      });
    }

    // Klik Tombol "+ Buat RA Baru" di Halaman Status
    const btnNewRAFromStatus = document.getElementById("btnNewRAFromStatus");
    if (btnNewRAFromStatus) {
      btnNewRAFromStatus.addEventListener("click", () => {
        navigateTo("ra");
      });
    }

    // Klik Logo Pertamina di Pojok Kiri Atas -> Kembali ke Beranda
    const brandLogoLink = document.getElementById("brandLogoLink");
    if (brandLogoLink) {
      brandLogoLink.addEventListener("click", (e) => {
        e.preventDefault();
        navigateTo("beranda");
      });
    }

    // Dropdown Profil Pengguna di Header
    const profileTrigger = document.getElementById("userProfileTrigger");
    const profileDropdown = document.getElementById("profileDropdown");
    const headerUserName = document.getElementById("headerUserName");
    const headerUserRole = document.getElementById("headerUserRole");

    if (profileTrigger && profileDropdown) {
      profileTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle("open");
      });

      document.addEventListener("click", () => {
        profileDropdown.classList.remove("open");
      });

      const roleOptions = profileDropdown.querySelectorAll(".role-option");
      roleOptions.forEach((option) => {
        option.addEventListener("click", () => {
          roleOptions.forEach((opt) => opt.classList.remove("active"));
          option.classList.add("active");

          const name = option.getAttribute("data-name");
          const role = option.getAttribute("data-role");
          const fullRole = option.getAttribute("data-fullrole");

          headerUserName.textContent = name;
          headerUserRole.textContent = role;

          if (window.PrakarsaApp && window.PrakarsaApp.showToast) {
            window.PrakarsaApp.showToast("Akun aktif: " + name + " (" + role + ") — " + fullRole);
          }
        });
      });
    }
  }

  return {
    init: initNavigation,
    goTo: navigateTo
  };
})();
