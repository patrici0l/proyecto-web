import { Routes } from '@angular/router';

// ===========================
// PÚBLICO (sin guard)
// ===========================
import { LoginComponent } from './pages/login/login';
import { InicioComponent } from './pages/inicio/inicio';
import { UsuariosComponent } from './pages/usuarios/usuarios';
import { PortafolioComponent } from './pages/portafolio/portafolio/portafolio';

// Asesorías (público + “mis asesorías” con guard)
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
import { ProgramadorAsesoriasComponent } from './pages/programador/asesorias/asesorias/asesorias';

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

      // ✅ Portafolio público (coincide con usuarios.html)
      { path: 'portafolio/:id', component: PortafolioComponent },

      // ✅ Agendar asesoría (coincide con usuarios.html)
      { path: 'asesoria/:idProgramador', component: AgendarAsesoriaComponent },

      // ✅ Requiere login (cualquier rol)
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

      // Programadores
      { path: 'programadores', component: ProgramadoresComponent },
      { path: 'programadores/nuevo', component: ProgramadorNuevoComponent },
      { path: 'programadores/editar/:id', component: EditarComponent },

      // Proyectos del programador
      { path: 'programadores/:id/proyectos', component: ProyectosAdminComponent },
      { path: 'programadores/:id/proyectos/nuevo', component: ProyectoNuevoComponent },
      { path: 'programadores/:id/proyectos/editar/:idProyecto', component: ProyectoEditarComponent },
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
      { path: '', component: ProgramadorComponent },

      // ✅ Si quieres un alias real, redirige (mejor que duplicar component)
      { path: 'proyectos', redirectTo: '', pathMatch: 'full' },

      { path: 'asesorias', component: ProgramadorAsesoriasComponent }
    ]
  },

  // ---------------------------
  // WILDCARD
  // ---------------------------
  { path: '**', redirectTo: 'inicio' }
];
