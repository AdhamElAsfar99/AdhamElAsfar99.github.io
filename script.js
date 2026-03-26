document.addEventListener("DOMContentLoaded", function () {
  var root = document.documentElement;
  var themeToggleButton = document.getElementById("theme-toggle");
  var savedTheme = localStorage.getItem("theme");

  function runIntroOverlay() {
    var body = document.body;
    var overlay = document.createElement("div");
    var introText = document.createElement("p");
    var message = "Welcome to my portfolio page!";
    var index = 1;

    overlay.className = "intro-overlay";
    overlay.setAttribute("role", "status");
    overlay.setAttribute("aria-live", "polite");

    introText.className = "intro-text";
    overlay.appendChild(introText);

    body.classList.add("is-loading");
    body.appendChild(overlay);

    requestAnimationFrame(function () {
      overlay.classList.add("is-visible");
    });

    function finishIntro() {
      overlay.classList.add("is-exit");
      body.classList.remove("is-loading");

      setTimeout(function () {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 620);
    }

    function typeFromLeft() {
      if (index > message.length) {
        setTimeout(finishIntro, 650);
        return;
      }

      // Reveal from left to right by taking progressively longer prefixes.
      introText.textContent = message.slice(0, index);
      index += 1;
      setTimeout(typeFromLeft, 52);
    }

    setTimeout(typeFromLeft, 300);
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    if (!themeToggleButton) {
      return;
    }

    themeToggleButton.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
    );
  }

  // Use saved choice when available, otherwise keep dark mode default.
  applyTheme(savedTheme === "light" ? "light" : "dark");

  if (themeToggleButton) {
    themeToggleButton.addEventListener("click", function () {
      var currentTheme = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      var nextTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
    });
  }

  runIntroOverlay();

  // Sections requested for expand/collapse behavior.
  var collapsibleSectionIds = [
    "experience",
    "skills",
    "projects",
    "publications",
    "achievements",
    "extracurricular"
  ];

  collapsibleSectionIds.forEach(function (sectionId) {
    var section = document.getElementById(sectionId);
    if (!section) {
      return;
    }

    var title = section.querySelector(".section-title");
    if (!title) {
      return;
    }

    var headingRow = document.createElement("div");
    headingRow.className = "section-heading-row";

    section.insertBefore(headingRow, title);
    headingRow.appendChild(title);

    // Create a wrapper for content below the title so visibility can be toggled.
    var contentWrapper = document.createElement("div");
    contentWrapper.className = "section-collapsible-content";
    contentWrapper.id = "section-content-" + sectionId;

    var sibling = headingRow.nextSibling;
    while (sibling) {
      var nextSibling = sibling.nextSibling;
      contentWrapper.appendChild(sibling);
      sibling = nextSibling;
    }

    section.appendChild(contentWrapper);

    var toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.className = "section-toggle-btn";
    toggleButton.setAttribute("aria-controls", contentWrapper.id);
    toggleButton.setAttribute("aria-label", "Expand section");
    toggleButton.innerHTML = '<span class="toggle-icon" aria-hidden="true">+</span>';

    headingRow.appendChild(toggleButton);

    function setSectionState(isExpanded) {
      section.classList.toggle("is-expanded", isExpanded);
      toggleButton.setAttribute("aria-expanded", String(isExpanded));
      toggleButton.setAttribute("aria-label", isExpanded ? "Collapse section" : "Expand section");
      toggleButton.querySelector(".toggle-icon").textContent = isExpanded ? "−" : "+";

      if (isExpanded) {
        contentWrapper.style.maxHeight = contentWrapper.scrollHeight + "px";
      } else {
        // Freeze current height before collapsing for a smooth transition.
        if (contentWrapper.style.maxHeight === "none") {
          contentWrapper.style.maxHeight = contentWrapper.scrollHeight + "px";
        }
        requestAnimationFrame(function () {
          contentWrapper.style.maxHeight = "0px";
        });
      }
    }

    contentWrapper.addEventListener("transitionend", function (event) {
      if (event.propertyName !== "max-height") {
        return;
      }

      if (section.classList.contains("is-expanded")) {
        // Remove the cap so expanded content can adapt naturally.
        contentWrapper.style.maxHeight = "none";
      }
    });

    // Default to collapsed so users can click to expand.
    setSectionState(false);

    toggleButton.addEventListener("click", function () {
      var currentlyExpanded = toggleButton.getAttribute("aria-expanded") === "true";
      setSectionState(!currentlyExpanded);
    });
  });
});
