function getControlledPanel(button) {
  const panelId = button.getAttribute("aria-controls");
  if (!panelId) {
    return null;
  }
  return document.getElementById(panelId);
}

function setExpanded(button, panel, expanded) {
  button.setAttribute("aria-expanded", expanded ? "true" : "false");
  panel.hidden = !expanded;
}

function openPanel(button, panel) {
  setExpanded(button, panel, true);
  window.requestAnimationFrame(() => {
    panel.focus();
  });
}

function closePanel(button, panel) {
  setExpanded(button, panel, false);
  button.focus();
}

function bindLoginGovStub(button) {
  const panel = getControlledPanel(button);
  if (!panel) {
    return;
  }

  button.addEventListener("click", () => {
    const isExpanded = button.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      closePanel(button, panel);
      return;
    }
    openPanel(button, panel);
  });

  panel.querySelectorAll("[data-login-gov-dismiss]").forEach((dismissButton) => {
    dismissButton.addEventListener("click", () => {
      closePanel(button, panel);
    });
  });

  panel.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }
    event.preventDefault();
    closePanel(button, panel);
  });
}

document.querySelectorAll("[data-login-gov-stub]").forEach(bindLoginGovStub);
