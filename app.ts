// 다크 모드 상태 타입 정의
type Theme = 'light' | 'dark';

class BlogApp {
  private themeBtn: HTMLButtonElement | null;
  private currentTheme: Theme = 'light';

  constructor() {
    this.themeBtn = document.getElementById('theme-toggle') as HTMLButtonElement;
    this.init();
  }

  private init(): void {
    // 1. 저장된 테마 불러오기 또는 시스템 설정 확인
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

  // 테마 적용 함수
  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
    if (this.themeBtn) {
      const icon = this.themeBtn.querySelector('.theme-icon');
      if (icon) {
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
      }
    }
  }

  // 이벤트 바인딩
  private bindEvents(): void {
    // 테마 토글 버튼 클릭
    this.themeBtn?.addEventListener('click', () => {
      this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
      this.applyTheme(this.currentTheme);
      localStorage.setItem('theme', this.currentTheme);
    });

    // 포스트 카드 클릭 이벤트 처리
    const cards = document.querySelectorAll('.post-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const title = card.querySelector('.post-title')?.textContent;
        console.log(`선택된 포스트: ${title}`);
        // 추후 상세 페이지 이동 로직 작성 (예: location.href = '/post.html')
      });
    });
  }
}

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', () => {
  new BlogApp();
});
