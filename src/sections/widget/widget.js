export function initContactWidget() {
    const widget = document.getElementById("contactWidget");
    if (!widget) return;

    window.toggleContactMenu = () => {
        widget.classList.toggle("active");
    };

    // Auto-expand after 30 seconds
    setTimeout(() => {
        if (!widget.classList.contains("active")) {
            widget.classList.add("active");
        }
    }, 30000);
}
