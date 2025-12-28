import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <--- IMPORTANTE: Agrega esto

// Asegúrate de que este import apunte al servicio NUEVO que hicimos en el paso anterior
import { AuthService } from '../../services/auth';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  imports: [CommonModule, FormsModule, ThemeToggleComponent] // <--- Agrega FormsModule aquí
})
export class LoginComponent {

  // Variables para el formulario
  email: string = '';
  password: string = '';
  nombre: string = ''; // Solo para registro

  esModoLogin: boolean = true; // True = Login, False = Registro
  cargando: boolean = false;
  mensajeError: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  async onSubmit() {
    this.cargando = true;
    this.mensajeError = '';

    if (this.esModoLogin) {
      // --- LOGIN ---
      // Para el Login, el backend espera "password" (porque recibe un Map)
      const datosLogin = {
        email: this.email,
        password: this.password
      };

      this.authService.login(datosLogin).subscribe({
        next: (res) => {
          console.log('Login exitoso', res);
          this.router.navigate(['/inicio']);
          this.cargando = false;
        },
        error: (err) => {
          console.error(err);
          this.mensajeError = 'Credenciales incorrectas o error de servidor';
          this.cargando = false;
        }
      });

    } else {
      // --- REGISTRO ---
      // AQUÍ ESTÁ EL TRUCO: 
      // Para el Registro, el backend espera "passwordHash" (porque recibe la Entidad Usuario)
      const datosRegistro = {
        email: this.email,
        passwordHash: this.password, // <--- ¡CAMBIO IMPORTANTE!
        nombre: this.nombre,
        rol: 'usuario'
      };

      this.authService.registrar(datosRegistro).subscribe({
        next: (res) => {
          console.log('Registro exitoso', res);
          alert('Cuenta creada con éxito. Ahora inicia sesión.');
          this.esModoLogin = true; // Cambiamos a login para que entres
          this.cargando = false;
        },
        error: (err) => {
          console.error(err);
          this.mensajeError = 'Error al registrarse. Intenta con otro correo.';
          this.cargando = false;
        }
      });
    }
  }

  toggleModo() {
    this.esModoLogin = !this.esModoLogin;
    this.mensajeError = '';
  }
}