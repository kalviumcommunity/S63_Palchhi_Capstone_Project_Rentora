import gsap from 'gsap';

export const pageTransition = {
  navigate: (navigate, path) => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = '#0A2647';
    overlay.style.zIndex = '9999';
    overlay.style.opacity = '0';
    document.body.appendChild(overlay);

    gsap.to(overlay, {
      opacity: 1,
      duration: 0.3,
      onComplete: () => {
        navigate(path);
        
        setTimeout(() => {
          gsap.to(overlay, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
              document.body.removeChild(overlay);
            }
          });
        }, 100);
      }
    });
  }
};