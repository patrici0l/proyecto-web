import { Routes } from '@angular/router';

// ===========================
// LAYOUTS
// ===========================
import { PublicLayoutComponent } from './layouts/public/public-layout/public-layout';
import { AdminLayoutComponent } from './layouts/admin/admin-layout/admin-layout';
import { ProgramadorLayoutComponent } from './layouts/programador/programador-layout/programador-layout';

// ===========================
// GUARDS
// ===========================
import { rolGuard } from './guards/rol.guard';

// ===========================
// PÁGINAS PÚBLICAS
// ===========================
import { LoginComponent } from './pages/login/login';
import { InicioComponent } from './pages/inicio/inicio';
import { UsuariosComponent } from './pages/usuarios/usuarios';
import { PortafolioComponent } from './pages/portafolio/portafolio/portafolio';
import { AgendarAsesoriaComponent } from './pages/asesorias/agendar/agendar/agendar';
import { MisAsesoriasComponent } from './pages/asesorias/mis-asesorias/mis-asesorias/mis-asesorias';

// ===========================
// PÁGINAS DE ADMIN
// ===========================
import { AdminComponent } from './pages/admin/admin';
import { ProgramadoresComponent } from './pages/admin/programadores/programadores';
import { ProgramadorNuevoComponent } from './pages/admin/programadores/programador-nuevo';
import { EditarComponent } from './pages/admin/programadores/editar/editar';
import { ProyectosAdminComponent } from './pages/admin/programadores/proyectos/proyectos/proyectos';
import { ProyectoNuevoComponent } from './pages/admin/programadores/proyectos/proyecto-nuevo/proyecto-nuevo';
import { ProyectoEditarComponent } from './pages/admin/programadores/proyectos/proyecto-editar/proyecto-editar';

// ===========================
// PÁGINAS DE PROGRAMADOR
// ===========================
import { ProgramadorComponent } from './pages/programador/programador';
import { ProgramadorDashboardComponent } from './pages/programador/dashboard/dashboard';
import { ProgramadorAsesoriasComponent } from './pages/programador/asesorias/asesorias/asesorias';
import { ProgramadorDisponibilidadComponent } from './pages/programador/disponibilidad/disponibilidad';
import { NuevoProyectoComponent } from './pages/programador/nuevo-proyecto/nuevo-proyecto';
import { EditarProyectoComponent } from './pages/programador/editar-proyecto/editar-proyecto';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  { path: 'login', component: LoginComponent },

  // 1. ZONA PÚBLICA
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: 'inicio', component: InicioComponent },
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'portafolio/:id', component: PortafolioComponent },
      { path: 'asesoria/:idProgramador', component: AgendarAsesoriaComponent },
      {
        path: 'mis-asesorias',
        component: MisAsesoriasComponent,
        canActivate: [rolGuard],
        data: { rol: 'usuario' }
      }
    ]
  },

  // 2. ZONA ADMIN (Gestión Global)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [rolGuard],
    data: { rol: 'admin' },
    children: [
      { path: '', component: AdminComponent },
      { path: 'programadores', component: ProgramadoresComponent },
      { path: 'programadores/nuevo', component: ProgramadorNuevoComponent },
      { path: 'programadores/editar/:id', component: EditarComponent },
      // El admin puede ver/editar la disponibilidad de un programador específico
      { path: 'programadores/:id/disponibilidad', component: ProgramadorDisponibilidadComponent },
      { path: 'programadores/:id/proyectos', component: ProyectosAdminComponent },
      { path: 'programadores/:id/proyectos/nuevo', component: ProyectoNuevoComponent },
      { path: 'programadores/:id/proyectos/editarProyecto/:idProyecto', component: ProyectoEditarComponent },
    ]
  },

  // 3. ZONA PROGRAMADOR (Gestión Personal)
  // Aquí es donde el PDF exige que el programador gestione su horario [cite: 40]
  {
    path: 'programador',
    component: ProgramadorLayoutComponent,
    canActivate: [rolGuard],
    data: { rol: 'programador' },
    children: [
      { path: '', component: ProgramadorComponent },
      { path: 'dashboard', component: ProgramadorDashboardComponent },
      { path: 'nuevo-proyecto', component: NuevoProyectoComponent },
      { path: 'editar-proyecto/:id', component: EditarProyectoComponent },
      { path: 'asesorias', component: ProgramadorAsesoriasComponent },

      // RUTA CLAVE: Acceso a "Mi Disponibilidad"
      { path: 'disponibilidad', component: ProgramadorDisponibilidadComponent },
    ]
  },

  { path: '**', redirectTo: 'inicio' }
];