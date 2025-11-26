import { Component } from '@angular/core';
import { MenuComponent } from '../../components/menu/menu';

@Component({
  selector: 'app-programador',
  standalone: true,
  imports: [MenuComponent],
  templateUrl: './programador.html',
  styleUrl: './programador.scss',
})
export class ProgramadorComponent { }
