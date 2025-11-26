import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { InicioComponent } from './pages/inicio/inicio';
import { UsuariosComponent } from './pages/usuarios/usuarios';

import { AdminComponent } from './pages/admin/admin';
import { ProgramadorComponent } from './pages/programador/programador';
import { ProgramadoresComponent } from './pages/admin/programadores/programadores';

import { rolGuard } from './guards/rol.guard';
import { ProgramadorNuevoComponent } from './pages/admin/programadores/programador-nuevo';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'inicio', component: InicioComponent },
  { path: 'usuarios', component: UsuariosComponent },

  //  RUTA SOLO PARA ADMIN (panel principal)
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [rolGuard],
    data: { rol: 'admin' },
  },

  //  LISTADO DE PROGRAMADORES (también solo admin)
  {
    path: 'admin/programadores',
    component: ProgramadoresComponent,
    canActivate: [rolGuard],
    data: { rol: 'admin' },
  },
  {
    path: 'admin/programadores/nuevo',
    component: ProgramadorNuevoComponent,
    canActivate: [rolGuard],
    data: { rol: 'admin' },
  },

  //  RUTA SOLO PARA PROGRAMADOR
  {
    path: 'programador',
    component: ProgramadorComponent,
    canActivate: [rolGuard],
    data: { rol: 'programador' },
  },

  // Redirigir rutas no existentes
  { path: '**', redirectTo: 'login' },
];
