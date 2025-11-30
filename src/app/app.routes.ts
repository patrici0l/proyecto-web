import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { InicioComponent } from './pages/inicio/inicio';
import { UsuariosComponent } from './pages/usuarios/usuarios';
import { AdminComponent } from './pages/admin/admin';
import { ProgramadoresComponent } from './pages/admin/programadores/programadores';
import { ProgramadorNuevoComponent } from './pages/admin/programadores/programador-nuevo'; // 👈 NUEVO

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'inicio', component: InicioComponent },
  { path: 'usuarios', component: UsuariosComponent },

  { path: 'admin', component: AdminComponent },
  { path: 'admin/programadores', component: ProgramadoresComponent },

  // 👇 ruta para el formulario nuevo
  { path: 'admin/programadores/nuevo', component: ProgramadorNuevoComponent },
];
