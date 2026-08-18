const includeHtml = async function () {
  const includeTargets = Array.from(document.querySelectorAll('[data-include]'));

  await Promise.all(includeTargets.map(async function (target) {
    const source = target.getAttribute('data-include');

    if (!source) {
      return;
    }

    const response = await fetch(source);

    if (!response.ok) {
      throw new Error('Unable to load include: ' + source);
    }

    target.innerHTML = await response.text();
  }));
};

const initHeroWave = function () {

      const canvas = document.getElementById('heroWaveCanvas');

      if (!canvas) {
        return;
      }

      const ctx = canvas.getContext('2d');
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      let width = 0;
      let height = 0;
      let dpr = 1;
      let animationFrame = 0;
      let startTime = performance.now();
      let lastFrameTime = 0;
      const frameInterval = 1000 / 24;

      const resizeCanvas = function () {
        const rect = canvas.getBoundingClientRect();
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        width = Math.max(1, Math.floor(rect.width));
        height = Math.max(1, Math.floor(rect.height));
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };

      const drawWave = function (time) {
        if (!reduceMotion.matches && time - lastFrameTime < frameInterval) {
          animationFrame = window.requestAnimationFrame(drawWave);
          return;
        }

        lastFrameTime = time;
        const elapsed = reduceMotion.matches ? 0 : (time - startTime) / 1000;
        ctx.clearRect(0, 0, width, height);

        const horizon = height * 0.36;
        const baseY = height * 0.96;
        const columns = Math.max(24, Math.floor(width / 34));
        const rows = 20;
        const centerX = width / 2;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        for (let row = 0; row < rows; row += 1) {
          const depth = row / (rows - 1);
          const perspective = Math.pow(depth, 1.85);
          const yBase = horizon + perspective * (baseY - horizon);
          const rowWidth = width * (0.28 + perspective * 0.92);
          const xStart = centerX - rowWidth / 2;
          const dotSize = 0.7 + perspective * 2.45;
          const rowAlpha = 0.08 + perspective * 0.74;

          for (let column = 0; column <= columns; column += 1) {
            const xProgress = column / columns;
            const x = xStart + xProgress * rowWidth;
            const wave =
              Math.sin((xProgress * Math.PI * 2.2) + elapsed * 0.24) * 18 * perspective +
              Math.cos((depth * Math.PI * 4.8) - elapsed * 0.30) * 14 * perspective;
            const arch = Math.sin(xProgress * Math.PI) * 116 * perspective;
            const y = yBase - arch + wave;
            const colorMix = Math.sin(xProgress * Math.PI + elapsed * 0.16) * 0.5 + 0.5;
            const alpha = rowAlpha * (0.55 + colorMix * 0.45);

            ctx.beginPath();
            ctx.fillStyle = colorMix > 0.52
              ? 'rgba(107, 247, 255, ' + alpha + ')'
              : 'rgba(188, 107, 255, ' + alpha + ')';
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.restore();

        if (!reduceMotion.matches) {
          animationFrame = window.requestAnimationFrame(drawWave);
        }
      };

      const restartWave = function () {
        window.cancelAnimationFrame(animationFrame);
        resizeCanvas();
        startTime = performance.now();
        drawWave(startTime);
      };

      resizeCanvas();
      drawWave(startTime);
      window.addEventListener('resize', restartWave);

      if (typeof reduceMotion.addEventListener === 'function') {
        reduceMotion.addEventListener('change', restartWave);
      }
    
};

const initProjectInteractions = function () {

      const modal = document.getElementById('imageModal');
      const modalImg = document.getElementById('imageModalImg');
      const modalFrame = document.getElementById('imageModalFrame');
      const closeBtn = document.getElementById('imageModalClose');
      const expandableProjects = document.querySelectorAll('.expandable-project');
      const imageTriggers = document.querySelectorAll('[data-expand-image]');
      const embedTriggers = document.querySelectorAll('[data-expand-embed]');

      expandableProjects.forEach(function (project) {
        const toggleProject = function () {
          const isExpanded = project.classList.toggle('is-expanded');
          project.setAttribute('aria-expanded', String(isExpanded));
        };

        project.addEventListener('click', function (event) {
          if (event.target.closest('a, button, iframe')) {
            return;
          }

          toggleProject();
        });

        project.addEventListener('keydown', function (event) {
          if (event.key !== 'Enter' && event.key !== ' ') {
            return;
          }

          if (event.target.closest('a, button, iframe')) {
            return;
          }

          event.preventDefault();
          toggleProject();
        });
      });

      if (!modal || !modalImg || !modalFrame || !closeBtn) {
        return;
      }

      if (!imageTriggers.length && !embedTriggers.length) {
        return;
      }

      const showImage = function (src, alt) {
        modalFrame.style.display = 'none';
        modalFrame.src = '';
        modalImg.style.display = 'block';
        modalImg.src = src;
        modalImg.alt = alt;
      };

      const showEmbed = function (src, title) {
        modalImg.style.display = 'none';
        modalImg.src = '';
        modalFrame.style.display = 'block';
        modalFrame.title = title || 'Expanded prototype';
        modalFrame.src = src;
      };

      const closeModal = function () {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        modalImg.src = '';
        modalImg.style.display = 'none';
        modalFrame.style.display = 'none';
        modalFrame.src = '';
      };

      imageTriggers.forEach(function (trigger) {
        trigger.addEventListener('click', function () {
          const src = trigger.getAttribute('data-expand-image');
          const preview = trigger.querySelector('img');
          showImage(src || '', preview ? preview.alt : 'Expanded image');
          modal.classList.add('open');
          modal.setAttribute('aria-hidden', 'false');
        });
      });

      embedTriggers.forEach(function (trigger) {
        trigger.addEventListener('click', function () {
          const embedContainer = trigger.closest('.proof-embed');
          const iframe = embedContainer ? embedContainer.querySelector('iframe') : null;

          if (!iframe || !iframe.src) {
            return;
          }

          showEmbed(iframe.src, iframe.title);
          modal.classList.add('open');
          modal.setAttribute('aria-hidden', 'false');
        });
      });

      closeBtn.addEventListener('click', closeModal);

      modal.addEventListener('click', function (event) {
        if (event.target === modal) {
          closeModal();
        }
      });

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && modal.classList.contains('open')) {
          closeModal();
        }
      });

      const communityGalleries = Array.from(document.querySelectorAll('[data-community-gallery]'));

      communityGalleries.forEach(function (gallery) {
        const communitySlides = Array.from(gallery.querySelectorAll('[data-community-slide]'));

        if (communitySlides.length <= 1) {
          return;
        }

        let communitySlideIndex = 0;

        const showCommunitySlide = function (index) {
          communitySlides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === index);
          });
        };

        window.setInterval(function () {
          communitySlideIndex = (communitySlideIndex + 1) % communitySlides.length;
          showCommunitySlide(communitySlideIndex);
        }, 5000);
      });
    
};

const initPortfolio = async function () {
  try {
    await includeHtml();
    initHeroWave();
    initProjectInteractions();
  } catch (error) {
    console.error(error);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
  initPortfolio();
}
