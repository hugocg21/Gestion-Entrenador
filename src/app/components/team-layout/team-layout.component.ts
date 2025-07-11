import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component'; // ✅

@Component({
  selector: 'team-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent], // ✅ Añade HeaderComponent aquí
  templateUrl: './team-layout.component.html',
})
export class TeamLayoutComponent {}
