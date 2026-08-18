const grid      = document.getElementById('section-grid');
const strip     = document.getElementById('section-strip');
const panels    = document.getElementById('section-panels');
const indicator = document.getElementById('strip-indicator');
const stripTabs    = document.querySelectorAll('.strip-tab');
const summaryCards = document.querySelectorAll('.section-summary');
const navButtons   = document.querySelectorAll('.nav-link[data-open]');

const NAV_H = 56;

let activeId = null;
let busy     = false;

// ── Sliding tab indicator ────────────────────────────────
function positionIndicator(id) {
  const tab = document.querySelector(`.strip-tab[data-target="${id}"]`);
  if (!tab) return;
  const stripRect = strip.getBoundingClientRect();
  const tabRect   = tab.getBoundingClientRect();
  indicator.style.left  = (tabRect.left - stripRect.left) + 'px';
  indicator.style.width = tabRect.width + 'px';
}

// ── Scroll strip to just below sticky nav ─────────────────
function scrollToStrip() {
  requestAnimationFrame(() => {
    const rect   = strip.getBoundingClientRect();
    const target = window.scrollY + rect.top - NAV_H - 24;
    window.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
  });
}

// ── Open a section ────────────────────────────────────────
function openSection(id) {
  if (busy) return;
  busy = true;

  setTabs(id);
  activeId = id;

  const clickedCard = document.querySelector(`.section-summary[data-target="${id}"]`);
  if (clickedCard) {
    clickedCard.style.transition = 'transform 0.1s cubic-bezier(0.22, 1, 0.36, 1)';
    clickedCard.style.transform  = 'scale(1.03)';
  }

  setTimeout(() => {
    if (clickedCard) {
      clickedCard.style.transform  = '';
      clickedCard.style.transition = '';
    }

    grid.style.animation = 'cardsExit 0.22s ease-in forwards';

    setTimeout(() => {
      grid.style.display   = 'none';
      grid.style.animation = '';

      strip.style.display  = 'flex';
      panels.style.display = 'block';

      indicator.style.transition = 'none';
      positionIndicator(id);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        indicator.style.transition = '';
      }));

      if (id === 'career') resetCareer();
      if (id === 'projects') resetProjects();

      const panel = document.getElementById(`panel-${id}`);
      panel.style.animation = 'panelEnter 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards';
      panel.classList.add('active');

      scrollToStrip();

      panel.addEventListener('animationend', () => {
        panel.style.animation = '';
        busy = false;
      }, { once: true });
    }, 220);
  }, 80);
}

// ── Switch tabs, animate height when content shrinks ──────
function switchSection(id) {
  if (busy || id === activeId) return;
  busy = true;

  const current = document.getElementById(`panel-${activeId}`);
  const next    = document.getElementById(`panel-${id}`);

  setTabs(id);
  positionIndicator(id);
  activeId = id;

  const startH = panels.offsetHeight;

  current.style.animation = 'panelTabOut 0.16s ease-out forwards';

  setTimeout(() => {
    current.classList.remove('active');
    current.style.animation = '';

    next.classList.add('active');
    if (id === 'career') resetCareer();
    if (id === 'projects') resetProjects();
    const endH = panels.offsetHeight;

    if (Math.abs(startH - endH) > 2) {
      panels.style.height   = startH + 'px';
      panels.style.overflow = 'hidden';

      requestAnimationFrame(() => {
        panels.style.transition = 'height 0.34s cubic-bezier(0.4, 0, 0.2, 1)';
        panels.style.height     = endH + 'px';
        setTimeout(() => {
          panels.style.height     = '';
          panels.style.overflow   = '';
          panels.style.transition = '';
        }, 340);
      });
    }

    next.style.animation = 'panelTabIn 0.22s cubic-bezier(0.22, 1, 0.36, 1) forwards';
    next.addEventListener('animationend', () => {
      next.style.animation = '';
      busy = false;
    }, { once: true });
  }, 160);
}

// ── Close ─────────────────────────────────────────────────
function closeSection() {
  if (busy) return;
  busy = true;

  const current = document.getElementById(`panel-${activeId}`);

  current.style.animation = 'panelExit 0.18s ease-out forwards';
  setTimeout(() => {
    current.classList.remove('active');
    current.style.animation = '';
    panels.style.display = 'none';
    strip.style.display  = 'none';
    activeId = null;
    clearTabs();

    grid.style.display   = 'grid';
    grid.style.animation = 'cardsEnter 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards';
    setTimeout(() => {
      grid.style.animation = '';
      busy = false;
    }, 300);
  }, 180);
}

// ── Helpers ───────────────────────────────────────────────
function setTabs(id) {
  stripTabs.forEach(t  => t.classList.toggle('active', t.dataset.target === id));
  navButtons.forEach(b => b.classList.toggle('active', b.dataset.open === id));
}

function clearTabs() {
  stripTabs.forEach(t  => t.classList.remove('active'));
  navButtons.forEach(b => b.classList.remove('active'));
}

function expandEl(el, display) {
  el.style.display = display || 'block';
  const h = el.scrollHeight;
  el.style.maxHeight = '0';
  el.style.overflow  = 'hidden';
  el.style.transition = 'max-height 0.28s cubic-bezier(0.4, 0, 0.2, 1)';
  requestAnimationFrame(() => { el.style.maxHeight = h + 'px'; });
  setTimeout(() => {
    el.style.maxHeight  = '';
    el.style.overflow   = '';
    el.style.transition = '';
  }, 280);
}

function collapseEl(el, cb) {
  el.style.maxHeight  = el.scrollHeight + 'px';
  el.style.overflow   = 'hidden';
  el.style.transition = 'max-height 0.22s cubic-bezier(0.4, 0, 0.2, 1)';
  requestAnimationFrame(() => { el.style.maxHeight = '0'; });
  setTimeout(() => {
    el.style.display    = 'none';
    el.style.maxHeight  = '';
    el.style.overflow   = '';
    el.style.transition = '';
    if (cb) cb();
  }, 220);
}

// ── Event listeners ───────────────────────────────────────
summaryCards.forEach(card => {
  card.addEventListener('click', () => openSection(card.dataset.target));
});

stripTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    if (panels.style.display === 'none') openSection(tab.dataset.target);
    else switchSection(tab.dataset.target);
  });
});

document.getElementById('strip-back').addEventListener('click', closeSection);

navButtons.forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    if (panels.style.display !== 'block') openSection(btn.dataset.open);
    else switchSection(btn.dataset.open);
    setTimeout(scrollToStrip, 300);
  });
});

// ── Career: project data ──────────────────────────────────
const careerData = {
  'loyalty-apis': {
    tag: 'BetMGM', title: 'Loyalty APIs', company: 'Sr. Product Manager, Player Experience',
    desc: 'Most players think BetMGM and MGM are one company. They\'re not, and for a long time our product made that painfully obvious. I built the Loyalty APIs to close that gap, connecting both platforms so players earn and redeem seamlessly, whether they\'re playing digitally or in person.',
    impact: [],
    screens: [
      {
        label: 'Before / After',
        before: 'assets/betmgm/rewards hub before.png',
        after: 'assets/betmgm/rewards hub after.png',
        caption: 'Before, the Rewards Hub was a static basic account summary. I led the rebuild into a live loyalty dashboard with Tier Status, Tier Credits progress, and automated real time MGM account linking.',
      },
      {
        label: 'Account Linking',
        left: 'assets/betmgm/rewards hub after.png',
        leftLabel: 'BetMGM',
        leftHover: 'assets/betmgm/account linking.png',
        leftHoverPos: '8%',
        right: 'assets/betmgm/mgm after comparison.PNG',
        rightLabel: 'MGM',
        caption: 'Players now have the same MGM Rewards ID for both digital and physical properties. We automated matching on day 1.',
      },
      {
        label: 'Real-Time Data',
        left: 'assets/betmgm/rewards hub after.png',
        leftLabel: 'BetMGM',
        leftHover: 'assets/betmgm/loyalty info.png',
        leftHoverPos: '38%',
        right: 'assets/betmgm/mgm after comparison.PNG',
        rightLabel: 'MGM',
        caption: 'With a shared rewards program, we focused on sharing this data real time and accurately. Players now see the same Tier Credit balance on both the BetMGM and MGM app.',
      },
    ],
  },
  'enablement-wins': {
    tag: 'BetMGM', title: 'Platform Enablement', company: 'Sr. Product Manager, Player Experience',
    desc: 'I led a mix of key strategic initiatives for our BetMGM Rewards Program. Some were focused on getting the brilliant basics right, others were enabling key partnerships like Marriott.',
    impact: [],
    screens: [
      {
        label: 'Marriott',
        gallery: [
          'assets/betmgm/marriott 1.png',
          'assets/betmgm/marriott 3.png',
        ],
        caption: 'We enabled Marriott account linking, point transfers, and other benefits to BetMGM players. The partnership was one of a kind and made various loyalty and points blogs, including "The Points Guy".',
      },
      {
        label: 'Global BRPs',
        img: 'assets/betmgm/global brps creative copy.jpg',
        caption: 'Before this, your BetMGM Rewards Points (BRPs) were locked to the state you earned them in. Play in Vegas, live in New York. Those points didn\'t follow you home. About 45% of our multi-state players were affected. We fixed it: one account, one points balance.',
      },
    ],
  },
  'ai-betmgm': {
    tag: 'BetMGM', title: 'AI at BetMGM', company: 'Sr. Product Manager, Player Experience',
    desc: 'One of my favorite initiatives. I saw the external push other companies had for AI and wanted BetMGM to be at the forefront. I co-led an AI Enablement Initiative, where the goal was to have every employee have their own "Operating System" (OS). We started with a Product OS and are quickly scaling across the business.',
    impact: [],
    screens: [
      {
        label: 'Personal OS',
        img: 'assets/betmgm/operating system.png',
        imgWidth: '420px',
        caption: 'We created an AI repository that included onboarding videos, pre-made templates, and guides to getting started with your Personal Operating System.',
      },
      {
        label: 'Team OS',
        img: 'assets/betmgm/team OS2.png',
        imgWidth: '900px',
        caption: 'We wanted everyone to be able to benefit from each other\'s context. So we created a git repo and called it Team OS, which allows us to scale context across the product org, including A/B tests, user research, roadmaps.',
      },
    ],
  },
  'rewards-store': {
    tag: 'BetMGM', title: 'Rewards Store Enhancements', company: 'Sr. Product Manager, Player Experience',
    desc: 'I led a full revamp of the BetMGM Rewards Store, giving users more visibility into what they could redeem for, and making it easier to do so. This increased monthly redemption rates from <15% to over 40%.',
    impact: [],
    screens: [
      {
        label: 'Rewards Store',
        before: 'assets/betmgm/store_before.PNG',
        after: 'assets/betmgm/store_after.PNG',
        caption: 'Key Enhancements: fixed item ordering so users see what they can redeem first, blocked unusable items, added custom icons per reward type, and a full UI uplift.',
      },
      {
        label: 'Redemption',
        before: 'assets/betmgm/redemption_before.PNG',
        after: 'assets/betmgm/redemption after.PNG',
        caption: 'The old modal had the bare minimum. The new bottom sheet shows full details, including longer item titles, detailed descriptions, custom icons, and more scalable spacing.',
      },
      {
        label: 'Merch Redemption',
        before: 'assets/betmgm/merch_before.PNG',
        after: 'assets/betmgm/redemption_merch_after.PNG',
        caption: 'Merch and voucher redemptions got the same bottom sheet treatment, but also allowed for pictures in the app. The description was also scalable and no longer limited to 3 short lines.',
      },
    ],
  },
  'betmgm-overview': {
    tag: 'BetMGM', title: 'BetMGM', company: 'Sr. Product Manager, Player Experience · 2024–present',
    sidePhoto: 'assets/betmgm/product summit.JPG',
    desc: 'I lead the product experience for the rewards program at BetMGM, targeting the top 10% of players — the segment driving 70%+ of revenue. I started by building the foundation (APIs, MGM Resorts data connectivity, Marriott) and now I\'m focused on 1/1 personalization at scale.',
    highlights: [
      { label: 'Rewards Store Enhancements', project: 'rewards-store' },
      { label: 'Loyalty APIs',               project: 'loyalty-apis' },
      { label: 'Platform Enablement',        project: 'enablement-wins' },
      { label: 'AI at BetMGM',              project: 'ai-betmgm' },
    ],
    screens: [],
  },
  'meta-overview': {
    tag: 'Meta', title: 'Meta', company: 'Product Operations Manager, SMX · 2021–2024',
    sidePhoto: 'assets/meta/meta hq.jpeg',
    sidePhotoWide: true,
    desc: 'I was lucky enough to break into consumer-facing product at Meta, where I led Product Operations for Stories and Messaging Experience (SMX). It was a horizontal PM role, supporting several engineering teams and splitting my focus between roadmap brainstorming and new feature launches.',
    highlights: [
      { label: 'External User Feedback Process', project: 'external-feedback' },
      { label: 'Highlighted Features',            project: 'highlighted-features' },
      { label: 'Product Feedback',                project: 'product-feedback' },
    ],
    screens: [],
  },
  'external-feedback': {
    tag: 'Meta', title: 'External User Feedback Process', company: 'Product Operations Manager, SMX',
    desc: 'I redesigned how users report issues and give feedback across Stories and Messaging. The new reporting flow tripled feedback volume without compromising user privacy, giving the team much faster signal for triage and prioritization. We then partnered with engineering to use machine learning to automatically diagnose new issues and trends.',
    impact: [],
    screens: [
      { label: 'Report Menu', img: 'assets/meta/external signal 1.PNG', imgWidth: '220px', imgHover: 'assets/meta/external signal 1 zoom.png', imgHoverPos: '15%', caption: 'Every story includes reporting options right in the menu, from a quick "Not interested" to a formal "Report story" for more serious issues.' },
      { label: 'Report Flow', img: 'assets/meta/external signal 2.PNG', imgWidth: '220px', caption: 'Reporting a technical problem lets users describe what went wrong and attach a screenshot or screen recording, giving the team far richer context than a bug report alone.' },
    ],
  },
  'highlighted-features': {
    tag: 'Meta', title: 'Highlighted Features', company: 'Product Operations Manager, SMX',
    desc: 'Every key feature we built felt like a unique experience, but the underlying theme was that Meta had the art down to a science. The ability to A/B test, iterate, and gather data and insights was as good as it gets. And when you\'re shipping to billions of users, the bar to getting a feature fully rolled out was so high.',
    impact: [],
    screens: [
      { label: 'Midcards', img: 'assets/meta/midcards.PNG', imgWidth: '220px', caption: 'Midcards is a big driver for several Stories metrics, including creation and reactions. I helped generate new midcards, iterate on existing ideas, and unship the ones that weren\'t working.' },
      { label: 'Stories Comments', img: 'assets/meta/comments.PNG', imgWidth: '220px', imgHover: 'assets/meta/comments zoom.png', imgHoverPos: '72%', caption: 'I learned so much working on this feature. We iterated and tested for my entire time at Meta and ultimately never fully rolled it out, but it\'s made its way to Instagram!' },
    ],
  },
  'product-feedback': {
    tag: 'Meta', title: 'Product Feedback', company: 'Product Operations Manager, SMX',
    desc: 'I was the voice of the customer, and turned user feedback into actionable roadmap items, oftentimes quick wins. This was less about big projects, but arguably some of my most valuable and impactful work, and where I learned how much little details made a difference!',
    impact: [],
    screens: [
      { label: 'Audio Toggle', img: 'assets/meta/music and reactions.png', imgWidth: '220px', imgHover: 'assets/meta/audio-toggle-zoom.png', imgHoverPos: '12%', caption: 'Users complained that music was broken, but many times their phone\'s audio wasn\'t on or the story itself had no audio. The toggle helped distinguish what was going on.' },
      { label: 'Reactions', img: 'assets/meta/reactions 2.png', imgWidth: '220px', imgHover: 'assets/meta/reactions-zoom.png', imgHoverPos: '82%', caption: 'I partnered with engineering to constantly iterate on the right reaction options, the signals that confirmed a user\'s action, and how we surfaced that back to story creators.' },
    ],
  },
  'deloitte-overview': {
    tag: 'Overview', title: 'Deloitte', company: 'Business Analyst · 2019–2021',
    sideGallery: ['assets/deloitte/deloitte full time.jpeg', 'assets/deloitte/deloitte full time 2.jpeg', 'assets/deloitte/deloitte 3.JPG'],
    desc: 'I started my career at Deloitte Consulting, first as a summer intern and then full-time as a Business Analyst. It was one of the best ways to start a career. I still remember how much my day-to-day changed when the world shut down in 2020 (I was at a sushi bar in SF for a client project). I built products for internal teams, which is where I realized I eventually wanted to become a product manager.',
    impact: [
      'Led a digital transformation for a global tech company: financial system upgrade for 5,000+ employees across 4 countries, on time',
      'Designed self-service HR tools (name/address changes, manager approvals) adopted by 10,000+ employees',
      'Implemented a JIRA-based case management system that improved ops for 500+ weekly inquiries',
    ],
    impactLabel: 'Selected Product Experience',
    screens: [],
  },
  'ucla-overview': {
    tag: 'Education', title: 'UCLA', company: 'B.A. Business Economics · Graduated Dec 2019',
    desc: 'UCLA was my dream school and some of the best years of my life! I always get nostalgia thinking about it. Go Bruins!',
    impact: [],
    screens: [
      { label: 'Education', gallery: ['assets/ucla/uclagrad.jpg', 'assets/ucla/social enterprise academy.jpeg'], bullets: [
        '2019 William Sharpe Fellow in Consulting. 1 of 20 students selected for the award, honoring the top Economics students each year.',
        '1 of 50 selected for the Social Enterprise Academy, a full-year program where we partnered with nonprofits to help develop a social enterprise.',
      ] },
      { label: 'Clubs', gallery: ['assets/ucla/180 degrees.JPG', 'assets/ucla/pse.JPG', 'assets/ucla/startup grind.JPG'], bullets: [
        '180 Degrees Consulting, Project Lead. Ran client engagements for nonprofits and social enterprises.',
        'Pi Sigma Epsilon, VP of Professional Development.',
        'Undergraduate Business Society (UBS) Consulting Workshop Participant: 1 of 25 selected for the 2-month program, which included private sessions with consulting firms and interview prep, ultimately landing my Deloitte internship.',
        'Startup Grind LA, one of 4 chapter members hosting events for the LA startup community. Pictured hosting author Alex Banayan for his book The Third Door.',
      ] },
      { label: 'Internships', gallery: ['assets/ucla/svb.JPG', 'assets/ucla/svb 2.jpeg', 'assets/ucla/deloitte internship.JPG', 'assets/ucla/deloitte internship 2.JPG'], caption: 'I took the unique approach of doing internships while taking classes. I\'d stack my classes into 2 days a week, then spend the other 2-3 days at the internship. It gave me invaluable experience and helped me understand the professional world a bit better.', timeline: [
        { period: 'Sophomore Year', company: 'Watertower Ventures', role: 'Venture Capital Intern, full year' },
        { period: 'Summer', company: 'Silicon Valley Bank', role: 'Summer Analyst' },
        { period: 'Junior Year', company: 'Ordermark / Nextbite', role: 'Operations Intern, fall (4 mo).<br>Later raised $120M Series C from SoftBank.' },
        { period: 'Summer', company: 'Deloitte', role: 'Summer Analyst. Received a full-time offer.' },
        { period: 'Senior Year', company: 'VaynerMedia', role: 'Marketing & Biz Analytics Intern, fall (4 mo)' },
      ] },
    ],
  },
};

// ── Career: timeline sync ─────────────────────────────────
function setTimelineNode(companyId) {
  document.querySelectorAll('.ct-node').forEach(n => n.classList.remove('ct-node-active'));
  const node = document.querySelector(`.ct-node[data-company="${companyId}"]`);
  if (node) node.classList.add('ct-node-active');
}

// ── Career: open company (shared by timeline + accordion) ─
function openCompany(companyId) {
  const company = document.querySelector(`.cl-company[data-company="${companyId}"]`);
  if (!company) return;
  const isOpen = company.classList.contains('open');
  document.querySelectorAll('.cl-company').forEach(c => c.classList.remove('open'));
  if (!isOpen) {
    company.classList.add('open');
    setTimelineNode(companyId);
    const firstProject = company.querySelector('.cl-project');
    if (firstProject) {
      document.querySelectorAll('.cl-project').forEach(b => b.classList.remove('active'));
      firstProject.classList.add('active');
      activeProject = firstProject.dataset.project;
      renderDetail(activeProject);
    }
  }
  positionDetailPanel();
}

// ── Career: timeline node click ───────────────────────────
document.querySelectorAll('.ct-node[data-company]').forEach(node => {
  node.addEventListener('click', () => openCompany(node.dataset.company));
});

// ── Career: detail panel positioning (mobile inline) ─────
const careerLayout = document.querySelector('.career-layout');
const careerList   = document.getElementById('career-list');

function positionDetailPanel() {
  const detail = document.getElementById('career-detail');
  if (window.innerWidth <= 860) {
    const openCo = careerList.querySelector('.cl-company.open');
    if (openCo) {
      openCo.after(detail);
    } else {
      careerList.appendChild(detail);
    }
  } else {
    if (detail.parentElement !== careerLayout) {
      careerLayout.appendChild(detail);
    }
  }
}

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(positionDetailPanel, 100);
});

// ── Career: company accordion ─────────────────────────────
function resetCareer() {
  document.querySelectorAll('.cl-company').forEach(c => c.classList.remove('open'));
  const betmgm = document.querySelector('.cl-company[data-company="betmgm"]');
  if (betmgm) betmgm.classList.add('open');
  setTimelineNode('betmgm');
  document.querySelectorAll('.cl-project').forEach(b => b.classList.remove('active'));
  const overviewBtn = document.querySelector('.cl-project[data-project="betmgm-overview"]');
  if (overviewBtn) overviewBtn.classList.add('active');
  activeProject = 'betmgm-overview';
  renderDetail('betmgm-overview');
}

function resetProjects() {
  const aiCard = document.querySelector('.project-card[data-project="ai-building"]');
  if (!aiCard) return;
  const detail = aiCard.querySelector('.pc-detail');
  if (!detail) return;
  if (!aiCard.classList.contains('open')) {
    aiCard.classList.add('open');
    expandEl(detail, 'flex');
  }
}

document.querySelectorAll('.cl-co-header').forEach(header => {
  header.addEventListener('click', () => {
    openCompany(header.closest('.cl-company').dataset.company);
  });
});

// ── Career: project selection + detail render ─────────────
let activeProject = null;

function buildGalleryHTML(photos) {
  const multi = photos.length > 1;
  return `<div class="cds-gallery-carousel">
      <div class="cds-gallery-viewport">
        <div class="cds-gallery-track">
          ${photos.map(src => `<div class="cds-gallery-slide"><img src="${src}" class="cds-gallery-img" alt=""></div>`).join('')}
        </div>
      </div>
      ${multi ? `
      <button class="cds-gallery-arrow cds-gallery-arrow--prev" aria-label="Previous photo">‹</button>
      <button class="cds-gallery-arrow cds-gallery-arrow--next" aria-label="Next photo">›</button>
      <div class="cds-gallery-dots">${photos.map((_, i) => `<button class="cds-gallery-dot${i === 0 ? ' active' : ''}" data-i="${i}"></button>`).join('')}</div>
      ` : ''}
    </div>`;
}

function renderDetail(id) {
  const data = careerData[id];
  if (!data) return;

  const screens = data.screens;
  let screenIdx = 0;

  const pillsHTML = screens.map((s, i) =>
    `<button class="cds-pill${i === 0 ? ' active' : ''}" data-i="${i}">${s.label}</button>`
  ).join('');

  const slidesHTML = screens.map(s => {
    let visual;
    if (s.left && s.right) {
      const leftImg = s.leftHover
        ? `<div class="cds-hover-wrap">
               <img src="${s.left}" class="cds-comp-img" alt="${s.leftLabel || ''}">
               <img src="${s.leftHover}" class="cds-hover-img" style="top:${s.leftHoverPos || '8%'}" alt="${s.leftLabel || ''} detail">
             </div>`
        : `<img src="${s.left}" class="cds-comp-img" alt="${s.leftLabel || ''}">`;
      visual = `<div class="cds-comparison${s.leftHover ? ' cds-comparison--matched' : ''}">
           <div class="cds-comp-side">
             <div class="cds-comp-label cds-comp-before">${s.leftLabel || 'Left'}</div>
             ${leftImg}
           </div>
           <div class="cds-comp-side">
             <div class="cds-comp-label cds-comp-after">${s.rightLabel || 'Right'}</div>
             <img src="${s.right}" class="cds-comp-img" alt="${s.rightLabel || ''}">
           </div>
         </div>`;
    } else if (s.before && s.after) {
      visual = `<div class="cds-comparison">
           <div class="cds-comp-side">
             <div class="cds-comp-label cds-comp-before">Before</div>
             <img src="${s.before}" class="cds-comp-img" alt="Before">
           </div>
           <div class="cds-comp-side">
             <div class="cds-comp-label cds-comp-after">After</div>
             <img src="${s.after}" class="cds-comp-img" alt="After">
           </div>
         </div>`;
    } else if (s.img && s.imgHover) {
      visual = `<div class="cds-single-img"><div class="cds-hover-wrap" style="max-width:${s.imgWidth || '180px'}"><img src="${s.img}" class="cds-comp-img" alt=""><img src="${s.imgHover}" class="cds-hover-img" style="top:${s.imgHoverPos || '8%'}" alt="detail"></div></div>`;
    } else if (s.img) {
      visual = `<div class="cds-single-img"><img src="${s.img}" class="cds-single-img-el" style="${s.imgWidth ? `max-width:${s.imgWidth}` : ''}" alt=""></div>`;
    } else if (s.gallery) {
      visual = buildGalleryHTML(s.gallery);
    } else if (s.beforeAfter) {
      visual = `<div class="cds-comparison">
           <div class="cds-comp-side">
             <div class="cds-comp-label cds-comp-before">Before</div>
             <div class="ph-box cds-comp-ph"></div>
           </div>
           <div class="cds-comp-side">
             <div class="cds-comp-label cds-comp-after">After</div>
             <div class="ph-box cds-comp-ph"></div>
           </div>
         </div>`;
    } else {
      visual = `<div class="ph-box cds-ph-box"></div>`;
    }
    const visualHTML = s.detail
      ? `<div class="cds-flippable">
           <div class="cds-flippable-front">${visual}</div>
           <div class="cds-flippable-back"><img src="${s.detail}" class="cds-detail-img" alt="In-app view"></div>
           <button class="cds-flip-btn">See in-app ›</button>
         </div>`
      : visual;
    const captionHTML = s.caption ? `<p class="cds-caption">${s.caption}</p>` : '';
    const bulletsHTML = s.bullets
      ? `<ul class="cds-caption-list">${s.bullets.map(b => `<li>${b}</li>`).join('')}</ul>`
      : '';
    const timelineHTML = s.timeline
      ? `<div class="cds-mini-timeline">${s.timeline.map((t, i) => `
          <div class="mtl-node ${i % 2 === 0 ? 'mtl-left' : 'mtl-right'}">
            <div class="mtl-dot-wrap"><div class="mtl-dot"></div></div>
            <div class="mtl-content">
              <div class="mtl-period">${t.period}</div>
              <div class="mtl-company">${t.company}</div>
              <div class="mtl-role">${t.role}</div>
            </div>
          </div>`).join('')}</div>`
      : '';
    const bodyHTML = s.split
      ? `<div class="cds-slide-split"><div class="cds-slide-split-visual">${visualHTML}</div><div class="cds-slide-split-text">${captionHTML}${bulletsHTML}</div></div>${timelineHTML}`
      : `${visualHTML}${captionHTML}${bulletsHTML}${timelineHTML}`;
    return `<div class="cds-slide">${bodyHTML}</div>`;
  }).join('');

  const screensHTML = screens.length > 0 ? `
        <div class="cd-screens">
          <div class="cds-nav">
            <button class="cds-prev">&#8249;</button>
            <div class="cds-pills">${pillsHTML}</div>
            <button class="cds-next">&#8250;</button>
          </div>
          <div class="cds-viewport">
            <div class="cds-track">${slidesHTML}</div>
          </div>
        </div>` : '';

  const hasSideVisual = data.sidePhoto || data.sideGallery;
  const sideVisualHTML = data.sidePhoto
    ? `<div class="cd-proj-sidephoto${data.sidePhotoWide ? ' cd-proj-sidephoto--wide' : ''}"><img src="${data.sidePhoto}" alt=""></div>`
    : data.sideGallery
      ? `<div class="cd-proj-sidephoto cd-proj-sidegallery">${buildGalleryHTML(data.sideGallery)}</div>`
      : '';

  const innerHTML = `
      <div class="${hasSideVisual ? 'cd-proj-content' : ''}">
        <div class="cd-proj-header-wrap">
          <div class="cd-proj-header">
            <span class="cd-proj-tag">${data.tag}</span>
            <span class="cd-proj-title">${data.title}</span>
          </div>
          <div class="cd-proj-company">${data.company}</div>
        </div>
        <p class="cd-proj-desc">${data.desc}</p>
        ${data.highlights
          ? `<div class="cd-highlights">
               <div class="cd-highlights-label">Highlighted Product Experience</div>
               <div class="cd-highlights-list">${data.highlights.map(h => `<button class="cd-highlight-chip" data-project="${h.project}">${h.label}</button>`).join('')}</div>
             </div>`
          : data.impact.length > 0 ? `<div class="cd-highlights">${data.impactLabel ? `<div class="cd-highlights-label">${data.impactLabel}</div>` : ''}<ul class="cd-proj-impact">${data.impact.map(i => `<li>${i}</li>`).join('')}</ul></div>` : ''
        }
        ${screensHTML}
      </div>
      ${sideVisualHTML}`;

  document.getElementById('career-detail').innerHTML = `
    <div class="cd-proj${hasSideVisual ? ' cd-proj-with-photo' : ''}">${innerHTML}
    </div>`;

  positionDetailPanel();

  const detail  = document.getElementById('career-detail');
  const track   = detail.querySelector('.cds-track');
  const pills   = detail.querySelectorAll('.cds-pill');
  const prevBtn = detail.querySelector('.cds-prev');
  const nextBtn = detail.querySelector('.cds-next');

  function goToScreen(n) {
    screenIdx = Math.max(0, Math.min(n, screens.length - 1));
    track.style.transform = `translateX(-${screenIdx * 100}%)`;
    pills.forEach((p, i) => p.classList.toggle('active', i === screenIdx));
    prevBtn.disabled = screenIdx === 0;
    nextBtn.disabled = screenIdx === screens.length - 1;
  }

  if (screens.length > 0) {
    prevBtn.addEventListener('click', () => goToScreen(screenIdx - 1));
    nextBtn.addEventListener('click', () => goToScreen(screenIdx + 1));
    pills.forEach(p => p.addEventListener('click', () => goToScreen(+p.dataset.i)));
    goToScreen(0);
  }

  initGalleryCarousels(detail);
}

// ── Career: swipeable photo galleries ─────────────────────
function initGalleryCarousels(root) {
  root.querySelectorAll('.cds-gallery-carousel').forEach(carousel => {
    const track    = carousel.querySelector('.cds-gallery-track');
    const slides   = carousel.querySelectorAll('.cds-gallery-slide');
    const dots     = carousel.querySelectorAll('.cds-gallery-dot');
    const prev     = carousel.querySelector('.cds-gallery-arrow--prev');
    const next     = carousel.querySelector('.cds-gallery-arrow--next');
    const total    = slides.length;
    let idx = 0;

    function goTo(n) {
      idx = (n + total) % total;
      track.style.transform = `translateX(-${idx * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }

    if (prev) prev.addEventListener('click', () => goTo(idx - 1));
    if (next) next.addEventListener('click', () => goTo(idx + 1));
    dots.forEach(d => d.addEventListener('click', () => goTo(+d.dataset.i)));

    let touchStartX = null;
    const viewport = carousel.querySelector('.cds-gallery-viewport');
    viewport.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    viewport.addEventListener('touchend', e => {
      if (touchStartX === null || total < 2) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) goTo(dx < 0 ? idx + 1 : idx - 1);
      touchStartX = null;
    }, { passive: true });
  });
}

// Initialize any galleries present in static HTML (e.g. MyBadges cards)
initGalleryCarousels(document);

document.querySelectorAll('.cl-project').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cl-project').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeProject = btn.dataset.project;
    renderDetail(activeProject);
    const co = btn.closest('.cl-company');
    if (co) setTimelineNode(co.dataset.company);
    const timeline = document.querySelector('.career-timeline');
    if (timeline) setTimeout(() => timeline.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  });
});

// Initialize timeline to BetMGM (default open company)
setTimelineNode('betmgm');

// ── Projects: expand/collapse cards ──────────────────────
document.querySelectorAll('.project-card').forEach(card => {
  const summary = card.querySelector('.pc-summary');
  if (!summary) return;
  summary.addEventListener('click', () => {
    const detail = card.querySelector('.pc-detail');
    if (!detail) return;

    if (card.classList.contains('open')) {
      card.classList.remove('open');
      collapseEl(detail);
    } else {
      card.classList.add('open');
      expandEl(detail, 'flex');
      setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
    }
  });
});

// ── Lightbox ──────────────────────────────────────────────
(function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lb-img');

  function open(src) {
    lbImg.src = src;
    lightbox.classList.add('open');
  }

  function close() {
    lightbox.classList.remove('open');
    lbImg.src = '';
  }

  document.getElementById('lb-close').addEventListener('click', close);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  // Event delegation — images are injected dynamically by renderDetail
  document.getElementById('career-detail').addEventListener('click', e => {
    const img = e.target.closest('.cds-comp-img, .cds-gallery-img, .cds-single-img-el');
    if (img) open(img.src);
  });
})();

// ── Career: highlight chip navigation ────────────────────
document.getElementById('career-detail').addEventListener('click', e => {
  const chip = e.target.closest('.cd-highlight-chip');
  if (!chip) return;
  const projectId = chip.dataset.project;
  document.querySelectorAll('.cl-project').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.cl-project[data-project="${projectId}"]`);
  if (btn) btn.classList.add('active');
  activeProject = projectId;
  renderDetail(projectId);
});

// ── Career: hover-swap click opens lightbox ───────────────
document.getElementById('career-detail').addEventListener('click', e => {
  const wrap = e.target.closest('.cds-hover-wrap');
  if (!wrap) return;
  const hoverImg = wrap.querySelector('.cds-hover-img');
  if (hoverImg) {
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lb-img');
    lbImg.src = hoverImg.src;
    lightbox.classList.add('open');
  }
});

// ── Career: flip toggle ───────────────────────────────────
document.getElementById('career-detail').addEventListener('click', e => {
  const btn = e.target.closest('.cds-flip-btn');
  if (!btn) return;
  const flippable = btn.closest('.cds-flippable');
  const isFlipped = flippable.classList.toggle('flipped');
  btn.textContent = isFlipped ? '‹ Back' : 'See in-app ›';
});

// ── Hobby carousel ────────────────────────────────────────
(function initCarousel() {
  const track = document.querySelector('.hc-track');
  const dots  = document.querySelectorAll('.hc-dot');
  const total = document.querySelectorAll('.hc-slide').length;
  let current = 0;

  function goTo(n) {
    current = (n + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  document.getElementById('hc-prev').addEventListener('click', () => goTo(current - 1));
  document.getElementById('hc-next').addEventListener('click', () => goTo(current + 1));
  dots.forEach(d => d.addEventListener('click', () => goTo(+d.dataset.index)));

  // Swipe support
  let touchStartX = null;
  const viewport = document.querySelector('.hc-viewport');
  viewport.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  viewport.addEventListener('touchend', e => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
    touchStartX = null;
  }, { passive: true });
})();


// ── Hobby photo strips (2-photo slides w/ sub-tabs) ───────
document.querySelectorAll('.hc-photo-wrap').forEach(wrap => {
  const strip = wrap.querySelector('.hc-photo-strip');
  const tabs  = wrap.querySelectorAll('.hc-sub-tab');
  const prev  = wrap.querySelector('.hc-photo-arrow--prev');
  const next  = wrap.querySelector('.hc-photo-arrow--next');
  const desc      = wrap.parentElement.querySelector('.hc-desc');
  const descs     = desc && desc.dataset.descs ? JSON.parse(desc.dataset.descs) : null;
  const descItems = wrap.parentElement.querySelectorAll('.hc-desc-item');
  if (!strip) return;

  const total = strip.children.length;
  strip.style.width = `${total * 100}%`;
  Array.from(strip.children).forEach(img => { img.style.width = `${100 / total}%`; });

  let current = 0;

  function goTo(i) {
    current = (i + total) % total;
    strip.style.transform = `translateX(-${current * (100 / total)}%)`;
    if (descs) desc.textContent = descs[current];
    descItems.forEach(d => d.classList.toggle('active', +d.dataset.mi === current));
    tabs.forEach((t, idx) => t.classList.toggle('active', idx === current));
  }

  tabs.forEach(tab => tab.addEventListener('click', () => goTo(+tab.dataset.mi)));
  prev.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));

  let touchStartX = null;
  wrap.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  wrap.addEventListener('touchend', e => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
    touchStartX = null;
  }, { passive: true });
});
