import { Component } from '@angular/core';
import { MenuComponent } from '../../components/menu/menu';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [MenuComponent],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class AdminComponent { }
