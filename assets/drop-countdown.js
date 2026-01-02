/**
 * Drop Countdown Timer
 * JavaScript for countdown logic and status management
 */

class DropCountdown extends HTMLElement {
  constructor() {
    super();
    this.startDate = null;
    this.endDate = null;
    this.intervalId = null;
  }

  connectedCallback() {
    this.startDate = this.dataset.startDate ? new Date(this.dataset.startDate) : null;
    this.endDate = this.dataset.endDate ? new Date(this.dataset.endDate) : null;
    
    if (!this.startDate && !this.endDate) return;
    
    this.daysEl = this.querySelector('[data-countdown-days]');
    this.hoursEl = this.querySelector('[data-countdown-hours]');
    this.minutesEl = this.querySelector('[data-countdown-minutes]');
    this.secondsEl = this.querySelector('[data-countdown-seconds]');
    
    this.update();
    this.intervalId = setInterval(() => this.update(), 1000);
  }

  disconnectedCallback() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  update() {
    const now = new Date();
    const status = this.getStatus(now);
    let targetDate;
    
    if (status === 'upcoming') {
      targetDate = this.startDate;
    } else if (status === 'live') {
      targetDate = this.endDate;
    } else {
      this.showEnded();
      return;
    }
    
    if (!targetDate) {
      this.showEnded();
      return;
    }
    
    const diff = targetDate - now;
    
    if (diff <= 0) {
      // Status changed, update the page
      this.dispatchEvent(new CustomEvent('drop-status-change', {
        bubbles: true,
        detail: { status: status === 'upcoming' ? 'live' : 'ended' }
      }));
      return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    this.setValues(days, hours, minutes, seconds);
  }

  getStatus(now) {
    if (this.startDate && now < this.startDate) {
      return 'upcoming';
    } else if (this.endDate && now < this.endDate) {
      return 'live';
    } else {
      return 'ended';
    }
  }

  setValues(days, hours, minutes, seconds) {
    if (this.daysEl) this.animateValue(this.daysEl, this.padZero(days));
    if (this.hoursEl) this.animateValue(this.hoursEl, this.padZero(hours));
    if (this.minutesEl) this.animateValue(this.minutesEl, this.padZero(minutes));
    if (this.secondsEl) this.animateValue(this.secondsEl, this.padZero(seconds));
  }

  animateValue(el, newValue) {
    if (el.textContent !== newValue) {
      el.textContent = newValue;
    }
  }

  padZero(num) {
    return num.toString().padStart(2, '0');
  }

  showEnded() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.classList.add('drop-countdown--ended');
    this.setValues(0, 0, 0, 0);
  }
}

customElements.define('drop-countdown', DropCountdown);

/**
 * Drop Status Manager
 * Handles drop status transitions
 */
class DropStatus extends HTMLElement {
  constructor() {
    super();
    this.startDate = null;
    this.endDate = null;
  }

  connectedCallback() {
    this.startDate = this.dataset.startDate ? new Date(this.dataset.startDate) : null;
    this.endDate = this.dataset.endDate ? new Date(this.dataset.endDate) : null;
    
    this.updateStatus();
    
    // Listen for countdown status changes
    document.addEventListener('drop-status-change', (e) => {
      this.updateStatus();
    });
  }

  updateStatus() {
    const now = new Date();
    let status;
    
    if (this.startDate && now < this.startDate) {
      status = 'upcoming';
    } else if (this.endDate && now < this.endDate) {
      status = 'live';
    } else {
      status = 'ended';
    }
    
    this.setAttribute('data-status', status);
    
    // Update UI elements
    const statusBadge = document.querySelector('.drop-status');
    const addButton = document.querySelector('.drop-add-button');
    const notifySection = document.querySelector('.drop-notify');
    
    if (statusBadge) {
      statusBadge.className = `drop-status drop-status--${status}`;
      const textMap = {
        upcoming: 'Coming Soon',
        live: 'Drop Live',
        ended: 'Drop Ended'
      };
      const textEl = statusBadge.querySelector('.drop-status__text');
      if (textEl) textEl.textContent = textMap[status];
    }
    
    if (addButton) {
      if (status === 'live') {
        addButton.disabled = false;
        addButton.classList.remove('drop-add-button--disabled');
        addButton.textContent = 'Add to Cart';
      } else {
        addButton.disabled = true;
        addButton.classList.add('drop-add-button--disabled');
        addButton.textContent = status === 'upcoming' ? 'Coming Soon' : 'Sold Out';
      }
    }
    
    if (notifySection) {
      notifySection.style.display = status === 'live' ? 'none' : 'flex';
    }
  }
}

customElements.define('drop-status', DropStatus);

/**
 * Drop Notify Form Handler
 */
class DropNotify extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.form = this.querySelector('form');
    this.input = this.querySelector('input[type="email"]');
    this.button = this.querySelector('button[type="submit"]');
    this.successMessage = this.querySelector('.drop-notify__success');
    
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const email = this.input?.value;
    if (!email) return;
    
    this.button.disabled = true;
    this.button.textContent = 'Submitting...';
    
    try {
      // Submit to Shopify customer API
      const formData = new FormData();
      formData.append('contact[email]', email);
      formData.append('contact[tags]', 'drop-notify');
      
      await fetch('/contact', {
        method: 'POST',
        body: formData
      });
      
      // Show success
      if (this.form) this.form.style.display = 'none';
      if (this.successMessage) this.successMessage.style.display = 'flex';
      
    } catch (error) {
      console.error('Error submitting notify form:', error);
      this.button.disabled = false;
      this.button.textContent = 'Notify Me';
    }
  }
}

customElements.define('drop-notify', DropNotify);
