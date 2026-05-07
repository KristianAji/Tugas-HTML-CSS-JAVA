window.addEventListener('scroll', () => {
    const nav = document.getElementById('nav');
    if (nav) nav.classList.toggle('scrolled', scrollY > 40);
});

const progBar = document.getElementById('prog');
if (progBar) {
    window.addEventListener('scroll', () => {
        const d = document.documentElement;
        const pct = (d.scrollTop / (d.scrollHeight - d.clientHeight)) * 100;
        progBar.style.width = pct + '%';
    });
}

const revealObs = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
    { threshold: 0.1 }
);
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

const canvas = document.getElementById('c');
if (canvas) {
    const cx = canvas.getContext('2d');
    let W, H, pts = [];

    function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
    resize();
    addEventListener('resize', resize);

    for (let i = 0; i < 65; i++) {
        pts.push({
            x: Math.random() * 1920,
            y: Math.random() * 1080,
            r: Math.random() * 1.4 + 0.3,
            vx: (Math.random() - .5) * .18,
            vy: (Math.random() - .5) * .18,
            a: Math.random() * .45 + 0.08
        });
    }

    (function draw() {
        cx.clearRect(0, 0, W, H);
        pts.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
            cx.beginPath();
            cx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            cx.fillStyle = `rgba(168,212,240,${p.a})`;
            cx.fill();
        });
        requestAnimationFrame(draw);
    })();
}

const grid = document.getElementById('grid');
if (grid) {
    let photos = [];
    let cur = 0;

    const lb    = document.getElementById('lb');
    const lbi   = document.getElementById('lbi');
    const lbcap = document.getElementById('lbcap');
    const lbnum = document.getElementById('lbnum');
    const gc    = document.getElementById('gc');

    const fallbackPhotos = [
        {"src":"image/image2.jpeg","cap":"Moment 1"},
        {"src":"image/image3.jpeg","cap":"Moment 2"},
        {"src":"image/image4.jpeg","cap":"Moment 3"},
        {"src":"image/image5.jpeg","cap":"Moment 4"},
        {"src":"image/image5,5.jpeg","cap":"Moment 5"},
        {"src":"image/image6.jpeg","cap":"Moment 6"},
        {"src":"image/image7.jpeg","cap":"Moment 7"},
        {"src":"image/image8.jpeg","cap":"Moment 8"},
        {"src":"image/image9.jpeg","cap":"Moment 9"},
        {"src":"image/image10.jpeg","cap":"Moment 10"},
        {"src":"image/image11.jpeg","cap":"Moment 11"},
        {"src":"image/image12.jpeg","cap":"Moment 12"},
        {"src":"image/image13.jpeg","cap":"Moment 13"},
        {"src":"image/image14.jpeg","cap":"Moment 14"},
        {"src":"image/image15.jpeg","cap":"Moment 15"}
    ];

    fetch('photos.json')
        .then(res => {
            if (!res.ok) throw new Error('JSON tidak ditemukan');
            return res.json();
        })
        .then(data => {
            photos = data;
            initGallery();
        })
        .catch(err => {
            console.warn('⚠️ fallback aktif:', err);
            photos = fallbackPhotos;
            initGallery();
        });

    function initGallery() {
        renderGallery();
        if (gc) gc.textContent = photos.length + ' Foto';
    }

    function renderGallery() {
        grid.innerHTML = '';

        photos.forEach((p, i) => {
            const el = document.createElement('div');
            el.className = 'g-item';
            el.style.transitionDelay = `${i * 0.04}s`;

            el.innerHTML = `
                <div class="g-num">${String(i + 1).padStart(2, '0')}</div>
                <img src="${p.src}" alt="${p.cap}" loading="lazy">
                <div class="g-overlay">
                    <div class="g-zoom">🔍</div>
                    <div class="g-cap">📍 ${p.cap}</div>
                </div>`;

            el.addEventListener('click', () => openLightbox(i));
            grid.appendChild(el);

            galleryObs.observe(el);
        });
    }

    function openLightbox(i) {
        cur = i;
        updateLightbox();
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function updateLightbox() {
        lbi.src = photos[cur].src;
        lbcap.textContent = '📍 ' + photos[cur].cap;
        lbnum.textContent = `${cur + 1} / ${photos.length}`;
    }

    function closeLightbox() {
        lb.classList.remove('open');
        document.body.style.overflow = '';
    }

    document.getElementById('lbc').onclick = closeLightbox;
    lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });

    document.getElementById('lbp').onclick = e => {
        e.stopPropagation();
        cur = (cur - 1 + photos.length) % photos.length;
        updateLightbox();
    };

    document.getElementById('lbn').onclick = e => {
        e.stopPropagation();
        cur = (cur + 1) % photos.length;
        updateLightbox();
    };

    document.addEventListener('keydown', e => {
        if (!lb.classList.contains('open')) return;

        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') {
            cur = (cur - 1 + photos.length) % photos.length;
            updateLightbox();
        }
        if (e.key === 'ArrowRight') {
            cur = (cur + 1) % photos.length;
            updateLightbox();
        }
    });

    const galleryObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('in');
                galleryObs.unobserve(e.target);
            }
        });
    }, { threshold: 0.05 });
}

const blogWrapper = document.querySelector('.bw');
if (blogWrapper) {
    const blogObs = new IntersectionObserver(
        entries => entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('in'); blogObs.unobserve(e.target); }
        }),
        { threshold: 0.08 }
    );
    document.querySelectorAll('.v-card, .a-card').forEach(el => blogObs.observe(el));

    const tbtn = document.getElementById('tbtn');
    if (tbtn) {
        let light = localStorage.getItem('kb-light') === '1';
        if (light) { document.body.classList.add('light'); tbtn.textContent = '🌙'; }
        tbtn.addEventListener('click', () => {
            light = !light;
            document.body.classList.toggle('light', light);
            tbtn.textContent = light ? '🌙' : '☀️';
            localStorage.setItem('kb-light', light ? '1' : '0');
        });
    }
}

function toggleLike(btn) {
    const on = btn.classList.toggle('liked');
    btn.innerHTML = on ? '♥ <span>Disukai!</span>' : '♡ <span>Suka</span>';
}

const contactWrapper = document.querySelector('.cw');
if (contactWrapper) {
    const contactObs = new IntersectionObserver(
        entries => entries.forEach((e, i) => {
            if (e.isIntersecting) {
                setTimeout(() => e.target.classList.add('in'), i * 80);
                contactObs.unobserve(e.target);
            }
        }),
        { threshold: 0.08 }
    );
    document.querySelectorAll('.c-card').forEach(el => contactObs.observe(el));
}