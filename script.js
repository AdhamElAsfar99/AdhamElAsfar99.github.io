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

  // Project card expand/collapse interaction.
  var projectCards = document.querySelectorAll(".project-card");
  projectCards.forEach(function (card) {
    var toggleBtn = card.querySelector(".project-toggle-btn");
    var details = card.querySelector(".project-details");

    if (!toggleBtn || !details) {
      return;
    }

    function setProjectState(isExpanded) {
      card.classList.toggle("is-expanded", isExpanded);
      toggleBtn.setAttribute("aria-expanded", String(isExpanded));
      toggleBtn.setAttribute("aria-label", isExpanded ? "Hide project details" : "Show project details");

      if (isExpanded) {
        // Set max-height to the content height for smooth expansion.
        details.style.maxHeight = details.scrollHeight + "px";
      } else {
        // Collapse to 0 height.
        details.style.maxHeight = "0px";
      }
    }

    details.addEventListener("transitionend", function (event) {
      if (event.propertyName !== "max-height") {
        return;
      }

      if (card.classList.contains("is-expanded")) {
        // Remove the cap once fully expanded so content can adapt.
        details.style.maxHeight = "none";
      }
    });

    // Default to collapsed.
    setProjectState(false);

    toggleBtn.addEventListener("click", function () {
      var currentlyExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
      setProjectState(!currentlyExpanded);
    });
  });

  // Contact form modal interaction and validation.
  var contactFormBtn = document.getElementById("contact-form-btn");
  var contactFormModal = document.getElementById("contact-form-modal");
  var contactFormOverlay = document.querySelector(".contact-form-overlay");
  var contactFormClose = document.getElementById("contact-form-close");
  var contactForm = document.getElementById("contact-form");
  var contactNameInput = document.getElementById("contact-name");
  var contactEmailInput = document.getElementById("contact-email");
  var contactMessageInput = document.getElementById("contact-message");
  var formFeedback = document.getElementById("form-feedback");

  // Email validation regex.
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function openContactForm() {
    contactFormModal.classList.add("is-open");
    contactForm.reset();
    clearFormErrors();
    formFeedback.classList.remove("is-visible", "success", "error");
    contactNameInput.focus();
  }

  function closeContactForm() {
    contactFormModal.classList.remove("is-open");
  }

  function clearFormErrors() {
    var errorSpans = document.querySelectorAll(".form-error");
    errorSpans.forEach(function (span) {
      span.textContent = "";
      span.classList.remove("is-visible");
    });
  }

  function showFieldError(fieldName, message) {
    var errorSpan = document.querySelector(".form-error[data-field='" + fieldName + "']");
    if (errorSpan) {
      errorSpan.textContent = message;
      errorSpan.classList.add("is-visible");
    }
  }

  function validateForm() {
    clearFormErrors();
    var isValid = true;

    // Validate name.
    var name = contactNameInput.value.trim();
    if (!name) {
      showFieldError("name", "Name is required");
      isValid = false;
    }

    // Validate email.
    var email = contactEmailInput.value.trim();
    if (!email) {
      showFieldError("email", "Email is required");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      showFieldError("email", "Please enter a valid email address");
      isValid = false;
    }

    // Validate message.
    var message = contactMessageInput.value.trim();
    if (!message) {
      showFieldError("message", "Message is required");
      isValid = false;
    }

    return isValid;
  }

  function showFeedback(type, message) {
    formFeedback.textContent = message;
    formFeedback.classList.add("is-visible", type);
    formFeedback.classList.remove(type === "success" ? "error" : "success");
  }

  // Event listeners for form.
  contactFormBtn.addEventListener("click", openContactForm);
  contactFormOverlay.addEventListener("click", closeContactForm);
  contactFormClose.addEventListener("click", closeContactForm);

  // Close modal on Escape key.
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && contactFormModal.classList.contains("is-open")) {
      closeContactForm();
    }
  });

  // Form submission.
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    var name = contactNameInput.value.trim();
    var email = contactEmailInput.value.trim();
    var message = contactMessageInput.value.trim();

    // In a real application, you would send this data to a server here.
    console.log("Form submitted:", { name: name, email: email, message: message });

    // Show success feedback.
    showFeedback("success", "Thank you! Your message has been sent.");

    // Reset form and close after delay.
    setTimeout(function () {
      contactForm.reset();
      closeContactForm();
      formFeedback.classList.remove("is-visible", "success", "error");
    }, 1600);
  });
});
