type Theme = 'light' | 'dark';

class BlogApp {
  private themeBtn: HTMLButtonElement | null;
  private currentTheme: Theme = 'light';

  constructor() {
    this.themeBtn = document.getElementById('theme-toggle') as HTMLButtonElement;
    this.init();
  }

  private init(): void {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
      this.currentTheme = savedTheme;
    } else if (systemPrefersDark) {
      this.currentTheme = 'dark';
    }

    this.applyTheme(this.currentTheme);
    this.bindEvents();
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
    if (this.themeBtn) {
      const icon = this.themeBtn.querySelector('.theme-icon');
      if (icon) {
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
      }
    }
  }

  private bindEvents(): void {
    this.themeBtn?.addEventListener('click', () => {
      this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
      this.applyTheme(this.currentTheme);
      localStorage.setItem('theme', this.currentTheme);
    });

    const cards = document.querySelectorAll('.post-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const title = card.querySelector('.post-title')?.textContent;
        console.log(`선택된 포스트: ${title}`);
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new BlogApp();
});
