const LOGIN_GOV_PROTOTYPE_AUTH_KEY = "fdicLoginGovPrototypeSignedIn";

let activeTrigger = null;

function getControlledModal(trigger) {
  const modalId = trigger.getAttribute("aria-controls");
  return modalId ? document.getElementById(modalId) : null;
}

function isSignedIn() {
  return sessionStorage.getItem(LOGIN_GOV_PROTOTYPE_AUTH_KEY) === "true";
}

function setSignedIn(signedIn) {
  if (signedIn) {
    sessionStorage.setItem(LOGIN_GOV_PROTOTYPE_AUTH_KEY, "true");
  } else {
    sessionStorage.removeItem(LOGIN_GOV_PROTOTYPE_AUTH_KEY);
  }
}

function applyAuthState({ announce = false } = {}) {
  const signedIn = isSignedIn();
  document.querySelectorAll("fdic-support-nav").forEach((supportNav) => {
    if (typeof supportNav.render === "function") {
      supportNav.render();
    }
  });

  document.querySelectorAll("[data-login-gov-cases-region]").forEach((region) => {
    region.hidden = !signedIn;
  });

  document.querySelectorAll("[data-login-gov-signed-out]").forEach((element) => {
    element.hidden = signedIn;
  });

  const status = document.getElementById("login-gov-auth-status");
  if (!status) {
    return;
  }

  if (!announce) {
    status.hidden = true;
    status.textContent = "";
    return;
  }

  status.hidden = false;
  status.textContent = signedIn ? "You are signed in." : "You have signed out.";
}

function consumeSimulatedReturn() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("loginGov") !== "simulated") {
    return false;
  }
  setSignedIn(true);
  params.delete("loginGov");
  const cleanQuery = params.toString();
  const cleanUrl = `${window.location.pathname}${cleanQuery ? `?${cleanQuery}` : ""}${window.location.hash}`;
  window.history.replaceState({}, "", cleanUrl);
  return true;
}

function openModal(trigger, modal) {
  activeTrigger = trigger;
  trigger.setAttribute("aria-expanded", "true");
  modal.hidden = false;
  document.body.classList.add("has-login-gov-modal");
  window.requestAnimationFrame(() => {
    const primaryAction = modal.querySelector("[data-login-gov-simulate], [data-login-gov-dismiss]");
    (primaryAction || modal).focus();
  });
}

function closeModal(modal) {
  if (!modal || modal.hidden) {
    return;
  }
  modal.hidden = true;
  document.body.classList.remove("has-login-gov-modal");
  if (activeTrigger) {
    activeTrigger.setAttribute("aria-expanded", "false");
    activeTrigger.focus();
    activeTrigger = null;
  }
}

function bindLoginGovModal(modal) {
  modal.querySelectorAll("[data-login-gov-dismiss]").forEach((dismissButton) => {
    dismissButton.addEventListener("click", () => {
      closeModal(modal);
    });
  });

  modal.querySelectorAll("[data-login-gov-simulate]").forEach((simulateButton) => {
    simulateButton.addEventListener("click", (event) => {
      const destination =
        simulateButton.getAttribute("data-login-gov-destination") || simulateButton.getAttribute("href");
      if (destination) {
        event.preventDefault();
      }
      setSignedIn(true);
      applyAuthState({ announce: true });
      if (destination) {
        window.location.href = destination;
        return;
      }
      closeModal(modal);
    });
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal(modal);
    }
  });

  modal.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }
    event.preventDefault();
    closeModal(modal);
  });
}

const returnedFromSimulatedLoginGov = consumeSimulatedReturn();

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-login-gov-stub]");
  if (trigger) {
    const modal = getControlledModal(trigger);
    if (modal) {
      event.preventDefault();
      openModal(trigger, modal);
    }
    return;
  }

  const signOutButton = event.target.closest("[data-login-gov-signout]");
  if (!signOutButton) {
    return;
  }
  if (signOutButton.closest("[data-login-gov-modal]")) {
    return;
  }
  event.preventDefault();
  setSignedIn(false);
  applyAuthState({ announce: true });
  document.querySelector("[data-login-gov-stub], [data-login-gov-signout]")?.focus();
});

document.querySelectorAll("[data-login-gov-modal]").forEach(bindLoginGovModal);

applyAuthState({ announce: returnedFromSimulatedLoginGov });
