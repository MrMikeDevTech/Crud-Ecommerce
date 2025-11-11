function applyTheme() {
    const theme = localStorage.getItem("theme") ?? "light";
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    document.documentElement.dataset.theme = theme;
}

window.addEventListener("popstate", applyTheme);
window.addEventListener("pageshow", applyTheme);
window.addEventListener("load", applyTheme);
document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && applyTheme());

const origPushState = history.pushState;
history.pushState = function (...args) {
    origPushState.apply(this, args);
    applyTheme();
};
const origReplaceState = history.replaceState;
history.replaceState = function (...args) {
    origReplaceState.apply(this, args);
    applyTheme();
};

applyTheme();

function initializeThemeToggle() {
    const toggle = document.getElementById("theme-toggle");
    if (toggle) {
        toggle.addEventListener("click", () => {
            const current = localStorage.getItem("theme") ?? "light";
            const next = current === "light" ? "dark" : "light";
            localStorage.setItem("theme", next);
            applyTheme();
        });
    }
}

document.addEventListener("DOMContentLoaded", initializeThemeToggle);
document.addEventListener("astro:after-swap", () => {
    applyTheme();
    initializeThemeToggle();
});

if (document.startViewTransition) {
    document.addEventListener("viewtransitionend", () => {
        applyTheme();
        initializeThemeToggle();
    });
}

document.addEventListener("astro:after-swap", applyTheme);
