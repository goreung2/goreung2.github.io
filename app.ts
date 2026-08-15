type Theme = 'light' | 'dark';

class ModernBlog {
  private themeBtn: HTMLButtonElement | null;
  private themeText: HTMLElement | null;
  private currentTheme: Theme = 'light';

  constructor() {
    this.themeBtn = document.getElementById('theme-toggle') as HTMLButtonElement;
    this.themeText = this.themeBtn?.querySelector('.theme-text') || null;
    this.init();
  }

  private init(): void {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    this.currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    this.applyTheme(this.currentTheme);
    this.bindEvents();
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
    if (this.themeText) {
      // 다크 모드일 땐 Light로 변경할 수 있도록 텍스트 표시
      this.themeText.textContent = theme === 'dark' ? 'Light' : 'Dark';
    }
  }

  private bindEvents(): void {
    this.themeBtn?.addEventListener('click', () => {
      this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
      this.applyTheme(this.currentTheme);
      localStorage.setItem('theme', this.currentTheme);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ModernBlog();
});
