import { Routes } from '@angular/router';

// ===========================
// PÚBLICO (sin guard)
// ===========================
import { LoginComponent } from './pages/login/login';
import { InicioComponent } from './pages/inicio/inicio';
import { UsuariosComponent } from './pages/usuarios/usuarios';
import { PortafolioComponent } from './pages/portafolio/portafolio/portafolio';

// Asesorías
import { AgendarAsesoriaComponent } from './pages/asesorias/agendar/agendar/agendar';
import { MisAsesoriasComponent } from './pages/asesorias/mis-asesorias/mis-asesorias/mis-asesorias';

// ===========================
// ADMIN (guard rol=admin)
// ===========================
import { AdminComponent } from './pages/admin/admin';
import { ProgramadoresComponent } from './pages/admin/programadores/programadores';
import { ProgramadorNuevoComponent } from './pages/admin/programadores/programador-nuevo';
import { EditarComponent } from './pages/admin/programadores/editar/editar';
import { ProyectosAdminComponent } from './pages/admin/programadores/proyectos/proyectos/proyectos';
import { ProyectoNuevoComponent } from './pages/admin/programadores/proyectos/proyecto-nuevo/proyecto-nuevo';
import { ProyectoEditarComponent } from './pages/admin/programadores/proyectos/proyecto-editar/proyecto-editar';

// ===========================
// PROGRAMADOR (guard rol=programador)
// ===========================
import { ProgramadorComponent } from './pages/programador/programador';
import { ProgramadorDisponibilidadComponent } from './pages/programador/disponibilidad/disponibilidad';
import { ProgramadorAsesoriasComponent } from './pages/programador/asesorias/asesorias/asesorias';
import { ProgramadorDashboardComponent } from './pages/programador/dashboard/dashboard';

import { EditarProyectoComponent } from './pages/programador/editar-proyecto/editar-proyecto'; 
import { NuevoProyectoComponent } from './pages/programador/nuevo-proyecto/nuevo-proyecto';
// ===========================
// LAYOUTS + GUARD
// ===========================
import { rolGuard } from './guards/rol.guard';
import { PublicLayoutComponent } from './layouts/public/public-layout/public-layout';
import { AdminLayoutComponent } from './layouts/admin/admin-layout/admin-layout';
import { ProgramadorLayoutComponent } from './layouts/programador/programador-layout/programador-layout';

export const routes: Routes = [
  // ---------------------------
  // REDIRECCIONES / FUERA DE LAYOUT
  // ---------------------------
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  { path: 'login', component: LoginComponent },

  // ===========================
  // LAYOUT PÚBLICO
  // ===========================
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: 'inicio', component: InicioComponent },
      { path: 'usuarios', component: UsuariosComponent },

      // Portafolio público
      { path: 'portafolio/:id', component: PortafolioComponent },

      // Agendar asesoría
      { path: 'asesoria/:idProgramador', component: AgendarAsesoriaComponent },

      // Requiere login (cualquier rol)
      {
        path: 'mis-asesorias',
        component: MisAsesoriasComponent,
        canActivate: [rolGuard]
      },
    ]
  },

  // ===========================
  // LAYOUT ADMIN (Solo Admin)
  // ===========================
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [rolGuard],
    data: { rol: 'admin' },
    children: [
      { path: '', component: AdminComponent },

      // Gestión de Programadores
      { path: 'programadores', component: ProgramadoresComponent },
      { path: 'programadores/nuevo', component: ProgramadorNuevoComponent },
      { path: 'programadores/editar/:id', component: EditarComponent },

      // Gestión de Proyectos (Visto por Admin)
      { path: 'programadores/:id/proyectos', component: ProyectosAdminComponent },
      { path: 'programadores/:id/proyectos/nuevo', component: ProyectoNuevoComponent },
      { path: 'programadores/:id/proyectos/editarProyecto/:idProyecto', component: ProyectoEditarComponent },
    ]
  },

  // ===========================
  // LAYOUT PROGRAMADOR (Solo Programador)
  // ===========================
  {
    path: 'programador',
    component: ProgramadorLayoutComponent,
    canActivate: [rolGuard],
    data: { rol: 'programador' },
    children: [
      // Lista de proyectos (Home del programador)
      { path: '', component: ProgramadorComponent },

      // ✅ RUTA NUEVA: Editar Proyecto
      { path: 'nuevo-proyecto', component: NuevoProyectoComponent },
      { path: 'editar-proyecto/:id', component: EditarProyectoComponent },

      // Otras secciones
      { path: 'dashboard', component: ProgramadorDashboardComponent },
      { path: 'asesorias', component: ProgramadorAsesoriasComponent },
      { path: 'disponibilidad', component: ProgramadorDisponibilidadComponent },

      // Redirección de seguridad
      { path: 'proyectos', redirectTo: '', pathMatch: 'full' },
    ]
  },

  // ---------------------------
  // WILDCARD
  // ---------------------------
  { path: '**', redirectTo: 'inicio' }
];