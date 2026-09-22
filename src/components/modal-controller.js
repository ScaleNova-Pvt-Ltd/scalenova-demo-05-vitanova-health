/**
 * ScaleNova EliteOS — Modal Controller
 * Accessible drawer and modal window engine for clinical protocols and doctor dossiers
 */

class ModalController {
  constructor() {
    this.activeModal = null;
    this.init();
  }

  init() {
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-modal]');
      if (trigger) {
        e.preventDefault();
        const modalId = trigger.getAttribute('data-modal');
        this.open(modalId);
        return;
      }

      const closeBtn = e.target.closest('[data-close-modal]');
      if (closeBtn) {
        e.preventDefault();
        this.close();
        return;
      }

      if (e.target.classList.contains('modal-overlay')) {
        this.close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.close();
      }
    });
  }

  open(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    this.close();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.activeModal = modal;
  }

  close() {
    if (!this.activeModal) return;
    this.activeModal.classList.remove('active');
    document.body.style.overflow = '';
    this.activeModal = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.modalController = new ModalController();
});
