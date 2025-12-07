import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login';
import { InicioComponent } from './pages/inicio/inicio';
import { UsuariosComponent } from './pages/usuarios/usuarios';
import { AdminComponent } from './pages/admin/admin';
import { ProgramadorComponent } from './pages/programador/programador';

import { ProgramadoresComponent } from './pages/admin/programadores/programadores';
import { ProgramadorNuevoComponent } from './pages/admin/programadores/programador-nuevo';
import { EditarComponent } from './pages/admin/programadores/editar/editar';

import { ProyectosAdminComponent } from './pages/admin/programadores/proyectos/proyectos/proyectos';
import { ProyectoNuevoComponent } from './pages/admin/programadores/proyectos/proyecto-nuevo/proyecto-nuevo';
import { ProyectoEditarComponent } from './pages/admin/programadores/proyectos/proyecto-editar/proyecto-editar';

import { PortafolioComponent } from './pages/portafolio/portafolio/portafolio';

import { AgendarAsesoriaComponent } from './pages/asesorias/agendar/agendar/agendar';
import { ProgramadorAsesoriasComponent } from './pages/programador/asesorias/asesorias/asesorias';
import { MisAsesoriasComponent } from './pages/asesorias/mis-asesorias/mis-asesorias/mis-asesorias';

import { rolGuard } from './guards/rol.guard';

import { PublicLayoutComponent } from './layouts/public/public-layout/public-layout';
import { AdminLayoutComponent } from './layouts/admin/admin-layout/admin-layout';
import { ProgramadorLayoutComponent } from './layouts/programador/programador-layout/programador-layout';

export const routes: Routes = [
  // redirección inicial -> a la página pública de inicio
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },

  // login queda fuera de los layouts
  { path: 'login', component: LoginComponent },

  // ===========================
  // LAYOUT PÚBLICO (usuario externo / general)
  // ===========================
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      // página principal pública
      { path: 'inicio', component: InicioComponent },

      // explorar programadores
      { path: 'usuarios', component: UsuariosComponent },

      // portafolio público de un programador
      { path: 'portafolio/:id', component: PortafolioComponent },

      // agendar asesoría (permitido sin login)
      { path: 'asesoria/:idProgramador', component: AgendarAsesoriaComponent },

      // mis asesorías (requiere estar logueado, pero usa el layout público)
      {
        path: 'mis-asesorias',
        component: MisAsesoriasComponent,
        canActivate: [rolGuard] // sin data.rol -> basta estar logueado
      }
    ]
  },

  // ===========================
  // LAYOUT ADMIN (solo rol admin)
  // ===========================
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [rolGuard],
    data: { rol: 'admin' },
    children: [
      // dashboard admin
      { path: '', component: AdminComponent },

      // gestión de programadores
      { path: 'programadores', component: ProgramadoresComponent },
      { path: 'programadores/nuevo', component: ProgramadorNuevoComponent },
      { path: 'programadores/editar/:id', component: EditarComponent },

      // gestión de proyectos de un programador
      { path: 'programadores/:id/proyectos', component: ProyectosAdminComponent },
      { path: 'programadores/:id/proyectos/nuevo', component: ProyectoNuevoComponent },
      { path: 'programadores/:id/proyectos/editar/:idProyecto', component: ProyectoEditarComponent }
    ]
  },

  // ===========================
  // LAYOUT PROGRAMADOR (solo rol programador)
  // ===========================
  {
    path: 'programador',
    component: ProgramadorLayoutComponent,
    canActivate: [rolGuard],
    data: { rol: 'programador' },
    children: [
      // dashboard / gestión de proyectos del propio programador
      { path: '', component: ProgramadorComponent },

      // alias para /programador/proyectos
      { path: 'proyectos', component: ProgramadorComponent },

      // asesorías que recibe el programador
      { path: 'asesorias', component: ProgramadorAsesoriasComponent }
    ]
  },

  // wildcard al final
  { path: '**', redirectTo: 'inicio' }
];
