import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-toggle.html',
  styleUrls: ['./theme-toggle.scss']
})
export class ThemeToggleComponent implements OnInit {

  isDark: boolean = false;

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    // Si guardó 'dark', activamos. Si no (null o 'light'), dejamos claro.
    if (savedTheme === 'dark') {
      this.enableDarkMode();
    }
  }

  toggleTheme(): void {
    if (this.isDark) {
      this.enableLightMode();
    } else {
      this.enableDarkMode();
    }
  }

  private enableDarkMode(): void {
    this.isDark = true;
    // CAMBIO IMPORTANTE: Usamos documentElement (<html> tag)
    document.documentElement.classList.add('theme-dark');
    localStorage.setItem('theme', 'dark');
    console.log('Modo Oscuro ON');
  }

  private enableLightMode(): void {
    this.isDark = false;
    // CAMBIO IMPORTANTE: Usamos documentElement (<html> tag)
    document.documentElement.classList.remove('theme-dark');
    localStorage.setItem('theme', 'light');
    console.log('Modo Claro ON');
  }
}