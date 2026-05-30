/**
 * Blush & Buff Nail Studio - Main Javascript
 * Handles navigation, interactive components, dynamic hours widget, and gallery filtering.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollAnimations();
  initDynamicHours();
  initGiftCardSimulator();
  initGalleryFilterAndLightbox();
  initServicesSidebar();
});

/* ==========================================
   Navigation & Header Scroll
   ========================================== */
function initNavigation() {
  const header = document.querySelector('.main-header');
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Handle header background change on scroll
  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Trigger once on load to handle refreshed pages

  // Toggle Mobile Menu
  if (mobileNavToggle && navMenu) {
    mobileNavToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      mobileNavToggle.classList.toggle('open');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  // Close Mobile Menu on Nav Click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      mobileNavToggle.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Set active class based on current page filename
  const path = window.location.pathname;
  const page = path.split('/').pop() || 'index.html';
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === page || (page === 'index.html' && href === '#') || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* ==========================================
   Scroll Reveal Animations
   ========================================== */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  
  // Instantly activate all reveal elements on subpages for perfect immediate rendering
  const path = window.location.pathname;
  const page = path.split('/').pop() || 'index.html';
  const isHomepage = page === 'index.html' || page === '';

  if (!isHomepage) {
    revealElements.forEach(element => {
      element.classList.add('active');
    });
    return;
  }
  
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target); // Reveal once
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(element => {
      observer.observe(element);
    });
  } else {
    // Fallback for older browsers
    revealElements.forEach(element => {
      element.classList.add('active');
    });
  }
}

/* ==========================================
   Dynamic Hours Calculator & Pill Widget
   ========================================== */
function initDynamicHours() {
  const statusPill = document.getElementById('live-status-pill');
  const statusText = document.getElementById('live-status-text');
  const statusMsg = document.getElementById('live-status-message');
  
  if (!statusPill || !statusText) return;

  // Define Salon Hours of Operation (0: Sun, 1: Mon, 2: Tue, etc.)
  // Format: [isOpenDay, openHour, openMin, closeHour, closeMin]
  const schedule = {
    0: { isOpen: true,  open: 11, close: 16, note: '11:00 AM - 4:00 PM' }, // Sunday
    1: { isOpen: false, note: 'Closed' },                                 // Monday
    2: { isOpen: true,  open: 10, close: 19, note: '10:00 AM - 7:00 PM' }, // Tuesday
    3: { isOpen: true,  open: 10, close: 19, note: '10:00 AM - 7:00 PM' }, // Wednesday
    4: { isOpen: true,  open: 10, close: 19, note: '10:00 AM - 7:00 PM' }, // Thursday
    5: { isOpen: true,  open: 10, close: 19, note: '10:00 AM - 7:00 PM' }, // Friday
    6: { isOpen: true,  open: 9,  close: 18, note: '9:00 AM - 6:00 PM' }  // Saturday
  };

  const checkStatus = () => {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeValue = hours + minutes / 60;
    
    const todaySchedule = schedule[day];
    let isOpen = false;
    let nextDayInfo = '';

    if (todaySchedule.isOpen) {
      if (timeValue >= todaySchedule.open && timeValue < todaySchedule.close) {
        isOpen = true;
      }
    }

    // Highlight today's row in the hours table if it exists
    const dayRows = document.querySelectorAll('.hours-row');
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    dayRows.forEach(row => {
      const dayCell = row.querySelector('.hours-day');
      if (dayCell && dayCell.textContent.trim() === dayNames[day]) {
        row.classList.add('highlight');
      }
    });

    if (isOpen) {
      statusPill.className = 'status-pill open';
      statusText.innerHTML = '<span class="status-indicator-dot"></span>We Are Currently Open!';
      
      // Calculate closing text
      const closeHourRaw = todaySchedule.close;
      const closeHour12 = closeHourRaw > 12 ? closeHourRaw - 12 : closeHourRaw;
      const closeSuffix = closeHourRaw >= 12 ? 'PM' : 'AM';
      statusMsg.textContent = `Come visit us! We close at ${closeHour12}:00 ${closeSuffix} today.`;
    } else {
      statusPill.className = 'status-pill closed';
      statusText.innerHTML = '<span class="status-indicator-dot" style="background-color: var(--text-light)"></span>We Are Currently Closed';
      
      // Find when it opens next
      let daysToCheck = 1;
      let nextOpenDayIndex = (day + daysToCheck) % 7;
      
      while (!schedule[nextOpenDayIndex].isOpen && daysToCheck < 7) {
        daysToCheck++;
        nextOpenDayIndex = (day + daysToCheck) % 7;
      }
      
      const nextOpenDaySchedule = schedule[nextOpenDayIndex];
      const nextOpenDayName = dayNames[nextOpenDayIndex];
      const openHourRaw = nextOpenDaySchedule.open;
      const openHour12 = openHourRaw > 12 ? openHourRaw - 12 : openHourRaw;
      const openSuffix = openHourRaw >= 12 ? 'PM' : 'AM';
      
      const whenStr = daysToCheck === 1 ? 'tomorrow' : `on ${nextOpenDayName}`;
      statusMsg.textContent = `We will open ${whenStr} at ${openHour12}:00 ${openSuffix}. We hope to see you then!`;
    }
  };

  checkStatus();
  // Refresh state every 30 seconds
  setInterval(checkStatus, 30000);
}

/* ==========================================
   Gift Card Simulator
   ========================================== */
function initGiftCardSimulator() {
  const inputTo = document.getElementById('card-to');
  const inputFrom = document.getElementById('card-from');
  const inputAmount = document.getElementById('card-amount');
  const selectTheme = document.getElementById('card-theme-select');
  const themeBtns = document.querySelectorAll('.theme-btn');
  
  const cardPreview = document.getElementById('virtual-card-preview');
  const previewTo = document.getElementById('preview-to-name');
  const previewFrom = document.getElementById('preview-from-name');
  const previewAmount = document.getElementById('preview-amount-val');

  if (!cardPreview) return; // Only run on loyalty page

  const updateCard = () => {
    if (previewTo && inputTo) previewTo.textContent = inputTo.value.trim() || 'Valued Guest';
    if (previewFrom && inputFrom) previewFrom.textContent = inputFrom.value.trim() || 'Your Friend';
    
    if (previewAmount && inputAmount) {
      const val = parseFloat(inputAmount.value) || 0;
      previewAmount.textContent = val > 0 ? `$${val}` : '$50';
    }
  };

  const changeTheme = (themeName) => {
    cardPreview.className = `giftcard-preview theme-${themeName}`;
    
    // Update theme selector button UI
    themeBtns.forEach(btn => {
      if (btn.dataset.theme === themeName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update select dropdown if it exists
    if (selectTheme) selectTheme.value = themeName;
  };

  // Add event listeners for text inputs
  [inputTo, inputFrom, inputAmount].forEach(input => {
    if (input) {
      input.addEventListener('input', updateCard);
    }
  });

  // Handle color square clicks
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      changeTheme(btn.dataset.theme);
    });
  });

  // Handle dropdown changes (if applicable)
  if (selectTheme) {
    selectTheme.addEventListener('change', () => {
      changeTheme(selectTheme.value);
    });
  }

  // Initialize
  updateCard();
}

/* ==========================================
   Gallery Filters & Lightbox Overlay
   ========================================== */
function initGalleryFilterAndLightbox() {
  const filterPills = document.querySelectorAll('.filter-pill');
  const galleryItems = document.querySelectorAll('.gallery-card');
  const lightbox = document.getElementById('gallery-lightbox');
  
  if (galleryItems.length === 0) return; // Only run on gallery page

  // Category Filtering
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filter = pill.dataset.filter;

      galleryItems.forEach(item => {
        // Simple scale transition for filtering
        const itemCategory = item.dataset.category;
        
        if (filter === 'all' || itemCategory === filter) {
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.85)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // Lightbox Functionality
  if (lightbox) {
    const lightboxImg = document.getElementById('lightbox-image');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxCategory = document.getElementById('lightbox-category');
    const lightboxClose = document.getElementById('lightbox-close');

    galleryItems.forEach(card => {
      card.addEventListener('click', () => {
        const img = card.querySelector('img');
        const title = card.querySelector('.gallery-card-title');
        const categoryText = card.querySelector('.gallery-card-category');

        if (img && lightboxImg) {
          lightboxImg.src = img.src;
          lightboxImg.alt = img.alt;
        }
        
        if (title && lightboxTitle) lightboxTitle.textContent = title.textContent;
        if (categoryText && lightboxCategory) lightboxCategory.textContent = categoryText.textContent;
        
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      });
    });

    const closeLightbox = () => {
      lightbox.style.display = 'none';
      document.body.style.overflow = '';
    };

    lightboxClose.addEventListener('click', closeLightbox);
    
    // Close on click outside the content box
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.style.display === 'flex') {
        closeLightbox();
      }
    });
  }
}

/* ==========================================
   Services Page Sidebar Scrolling
   ========================================== */
function initServicesSidebar() {
  const sidebarBtns = document.querySelectorAll('.sidebar-menu-btn');
  const sections = document.querySelectorAll('.services-category-section');
  
  if (sidebarBtns.length === 0 || sections.length === 0) return;

  // Sidebar navigation click handler
  sidebarBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        // Highlight clicked button
        sidebarBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Scroll to category smoothly
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Highlight sidebar item as user scrolls down the page
  let activeSectionId = null;
  
  const handleScrollHighlight = () => {
    let currentActive = null;
    const scrollPos = window.scrollY + 120; // offset for sticky menu

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;

      if (scrollPos >= top && scrollPos < top + height) {
        currentActive = section.id;
      }
    });

    if (currentActive && currentActive !== activeSectionId) {
      activeSectionId = currentActive;
      
      sidebarBtns.forEach(btn => {
        if (btn.dataset.target === activeSectionId) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
  };

  window.addEventListener('scroll', handleScrollHighlight);
  handleScrollHighlight(); // Initialize once on load
}
