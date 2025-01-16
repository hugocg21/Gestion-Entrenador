import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-restore-password',
  templateUrl: './restore-password.component.html',
})
export class RestorePasswordComponent implements OnInit {
  isDarkMode: boolean = false;

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    // Escuchar los cambios en el modo oscuro
    this.themeService.isDarkMode$.subscribe((isDarkMode) => {
      this.isDarkMode = isDarkMode;
    });
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode(); // Cambiar el tema
  }
}
