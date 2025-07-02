import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this.isDarkModeSubject.asObservable();

  constructor() {
    const savedTheme = localStorage.getItem('darkMode');
    const isDarkMode = savedTheme ? JSON.parse(savedTheme) : false;
    this.isDarkModeSubject.next(isDarkMode);
    this.applyTheme(isDarkMode);
  }

  toggleDarkMode() {
    const currentMode = !this.isDarkModeSubject.value;
    this.isDarkModeSubject.next(currentMode);
    localStorage.setItem('darkMode', JSON.stringify(currentMode));
    this.applyTheme(currentMode);
  }

  private applyTheme(isDarkMode: boolean) {
    const html = document.documentElement;
    const body = document.body;

    if (isDarkMode) {
      html.classList.add('dark');
      body.classList.add('bg-gray-900', 'text-white');
      body.classList.remove('bg-white', 'text-gray-900');
    } else {
      html.classList.remove('dark');
      body.classList.add('bg-white', 'text-gray-900');
      body.classList.remove('bg-gray-900', 'text-white');
    }
  }
}
