export function initSecurity() {
    // Temporary disable for development
    return;

    // Disable text selection
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.msUserSelect = 'none';

    // 1. Disable Right Click
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });

    // 2. Disable Keyboard Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)
    document.addEventListener('keydown', (e) => {
        if (
            e.keyCode === 123 || // F12
            (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || // Ctrl+Shift+I/J
            (e.ctrlKey && e.keyCode === 85) || // Ctrl+U (View Source)
            (e.metaKey && e.altKey && e.keyCode === 73) // Cmd+Alt+I (Mac)
        ) {
            e.preventDefault();
            return false;
        }
    });

    // 3. Disable Dragging Images
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('dragstart', (e) => {
            e.preventDefault();
        });
    });

    // 4. Console "Anti-Tamper" Warning
    const warningStyle = [
        'color: red',
        'font-size: 40px',
        'font-weight: bold',
        'text-shadow: 2px 2px black'
    ].join(';');
    
    console.log('%cSTOP!', warningStyle);
    console.log('This is a protected area. Any unauthorized attempts to copy or modify content are prohibited.');
}
