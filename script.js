(() => {
  "use strict";

  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const setReadyState = () => root.classList.add("js");

  setReadyState();

  // Header and mobile navigation
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const menuToggle = document.querySelector("[data-menu-toggle]");

  const syncHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 30);
  };

  const closeMenu = () => {
    if (!menuToggle || !nav) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Открыть меню");
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  menuToggle?.addEventListener("click", () => {
    const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(willOpen));
    menuToggle.setAttribute("aria-label", willOpen ? "Закрыть меню" : "Открыть меню");
    nav?.classList.toggle("is-open", willOpen);
    document.body.classList.toggle("menu-open", willOpen);
  });

  nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  window.addEventListener("scroll", syncHeader, { passive: true });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1024) closeMenu();
  });
  syncHeader();

  // Re-apply an initial fragment after web fonts settle. This avoids landing
  // slightly above a section when a visitor opens a shared section link.
  if (location.hash) {
    window.setTimeout(() => {
      const targetId = decodeURIComponent(location.hash.slice(1));
      const target = document.getElementById(targetId);
      target?.scrollIntoView({ block: "start" });
    }, 240);
  }

  // Progressive reveals
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6%" },
    );

    revealItems.forEach((item) => revealObserver.observe(item));

    // Keep the first viewport visible even if the observer is delayed by a
    // background tab or a browser throttling event.
    window.setTimeout(() => {
      revealItems.forEach((item) => {
        const bounds = item.getBoundingClientRect();
        if (bounds.top < window.innerHeight * 1.08) item.classList.add("is-visible");
      });
    }, 80);
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  // Subtle pointer light. It is decorative and disabled for reduced motion.
  if (!reducedMotion && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener(
      "pointermove",
      (event) => {
        root.style.setProperty("--pointer-x", `${event.clientX}px`);
        root.style.setProperty("--pointer-y", `${event.clientY}px`);
      },
      { passive: true },
    );
  }

  // Hero scene micro-parallax
  const tiltScene = document.querySelector("[data-tilt]");
  if (tiltScene && !reducedMotion && window.matchMedia("(pointer: fine)").matches) {
    const heroVisual = tiltScene.parentElement;
    heroVisual?.addEventListener("pointermove", (event) => {
      const bounds = heroVisual.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      tiltScene.style.setProperty("--tilt-x", `${x * -8}px`);
      tiltScene.style.setProperty("--tilt-y", `${y * -8}px`);
    });
    heroVisual?.addEventListener("pointerleave", () => {
      tiltScene.style.setProperty("--tilt-x", "0px");
      tiltScene.style.setProperty("--tilt-y", "0px");
    });
  }

  // Pulse display
  const pulseValues = [...document.querySelectorAll("[data-pulse-value]")];
  const watchDemo = document.querySelector("[data-watch-demo]");
  const calmButton = document.querySelector("[data-calm-button]");
  const pulseLabels = [...document.querySelectorAll(".smartwatch__warning b")];
  let currentPulse = 118;

  const renderPulse = (value) => {
    currentPulse = Math.max(68, Math.min(142, Math.round(value)));
    pulseValues.forEach((node) => {
      node.textContent = String(currentPulse);
    });

    const level = currentPulse >= 120 ? "критический" : currentPulse >= 95 ? "высокий" : "стабильный";
    pulseLabels.forEach((node) => {
      node.textContent = level;
    });
  };

  calmButton?.addEventListener("click", () => {
    renderPulse(74);
    watchDemo?.classList.add("is-calm");
    calmButton.disabled = true;
    calmButton.firstChild.textContent = "Пульс снижен ";

    window.setTimeout(() => {
      watchDemo?.classList.remove("is-calm");
      calmButton.disabled = false;
      calmButton.firstChild.textContent = "Сбросить пульс ";
    }, 4200);
  });

  if (!reducedMotion) {
    window.setInterval(() => {
      if (!calmButton || !calmButton.disabled) renderPulse(currentPulse + (Math.random() * 3 - 1.5));
    }, 2600);
  }

  // Role selector
  const roleData = {
    electrician: {
      code: "ROLE / EL-01",
      title: "Электрик",
      symbol: "⌁",
      description:
        "Восстанавливает питание, обходит повреждённые цепи и помогает безопасно запустить оборудование объекта.",
      tasks: [
        "Чинит проводку и распределительные щиты",
        "Управляет электроснаряжением объекта",
        "Предотвращает перегрузки в сети",
      ],
      skill: "Быстрая диагностика",
    },
    engineer: {
      code: "ROLE / EN-02",
      title: "Инженер",
      symbol: "⌗",
      description:
        "Укрепляет конструкции, разбирает завалы и проверяет, какие элементы ещё можно безопасно использовать.",
      tasks: [
        "Чинит опорные балки и завалы",
        "Усиливает двери, люки и перекрытия",
        "Собирает защитные конструкции",
      ],
      skill: "Надёжный ремонт",
    },
    rigger: {
      code: "ROLE / RG-03",
      title: "Такелажник",
      symbol: "⌁",
      description:
        "Прокладывает маршруты, вяжет узлы и отвечает за переходы на высоте и страховку команды.",
      tasks: [
        "Устанавливает тросы, лестницы и карабины",
        "Открывает новые пути эвакуации",
        "Страхует других на переходах",
      ],
      skill: "Устойчивое движение",
    },
    medic: {
      code: "ROLE / MD-04",
      title: "Медик",
      symbol: "+",
      description:
        "Читает показания часов, стабилизирует давление и помогает группе вовремя остановиться, принять лекарство или сменить маршрут.",
      tasks: [
        "Выдаёт антидепрессанты и поддерживает группу",
        "Диагностирует переохлаждение и истощение",
        "Стабилизирует панические состояния",
      ],
      skill: "Контроль пульса",
    },
  };

  const roleTabs = [...document.querySelectorAll("[data-role]")];
  const rolePanel = document.querySelector("#role-panel");
  const roleSymbol = document.querySelector("[data-role-symbol]");
  const roleCode = document.querySelector("[data-role-code]");
  const roleTitle = document.querySelector("[data-role-title]");
  const roleDescription = document.querySelector("[data-role-description]");
  const roleTasks = document.querySelector("[data-role-tasks]");
  const roleSkill = document.querySelector("[data-role-skill]");

  const selectRole = (tab, moveFocus = false) => {
    const data = roleData[tab.dataset.role];
    if (!data) return;

    roleTabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
    });

    rolePanel?.classList.add("is-changing");
    roleSymbol?.classList.add("is-changing");

    window.setTimeout(() => {
      if (roleCode) roleCode.textContent = data.code;
      if (roleTitle) roleTitle.textContent = data.title;
      if (roleSymbol) roleSymbol.textContent = data.symbol;
      if (roleDescription) roleDescription.textContent = data.description;
      if (roleSkill) roleSkill.textContent = data.skill;
      if (roleTasks) {
        roleTasks.innerHTML = data.tasks
          .map((task, index) => `<li><span>0${index + 1}</span>${task}</li>`)
          .join("");
      }
      if (rolePanel) rolePanel.setAttribute("aria-labelledby", tab.id);
      rolePanel?.classList.remove("is-changing");
      roleSymbol?.classList.remove("is-changing");
    }, reducedMotion ? 0 : 150);

    if (moveFocus) tab.focus();
  };

  roleTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectRole(tab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
      event.preventDefault();

      let nextIndex = index;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = roleTabs.length - 1;
      if (["ArrowDown", "ArrowRight"].includes(event.key)) nextIndex = (index + 1) % roleTabs.length;
      if (["ArrowUp", "ArrowLeft"].includes(event.key)) nextIndex = (index - 1 + roleTabs.length) % roleTabs.length;
      selectRole(roleTabs[nextIndex], true);
    });
  });

  // Footer date
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
})();
