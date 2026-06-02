import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService } from '../services/client.service'; 
import { Client } from '../Models/client.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-clients',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './clients.html',
  styleUrl: './clients.css',
})
export class Clients implements OnInit{
  private clientService = inject(ClientService);
  private fb = inject(FormBuilder);

  clients: Client[] = [];
  clientForm!: FormGroup;
  loading: boolean = true;
  isEditing: boolean = false;
  currentClientId: number | null = null;
  
  // Mensaje de error para el banner superior del HTML
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
  }

  initForm(): void {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      tax_id: [''] // RFC o identificación fiscal
    });
  }

  loadClients(): void {
    this.loading = true;
    this.errorMessage = null;

    this.clientService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar clientes', err);
        this.loading = false;
        
        if (err.status === 403 && err.error?.message) {
          this.errorMessage = err.error.message;
        }
      }
    });
  }

  onSubmit(): void {
    if (this.clientForm.invalid) return;

    this.errorMessage = null;
    const clientData: Client = this.clientForm.value;

    if (this.isEditing && this.currentClientId) {
      // Actualizar cliente existente
      this.clientService.updateClient(this.currentClientId, clientData).subscribe({
        next: () => {
          this.loadClients();
          this.resetForm();
        },
        error: (err) => {
          console.error('Error al actualizar cliente', err);
          if (err.status === 403 && err.error?.message) {
            this.errorMessage = err.error.message;
            // 🔥 Alerta nativa inmediata al intentar editar sin suscripción
            alert(`Acceso Denegado: ${err.error.message}`);
          }
        }
      });
    } else {
      // Crear nuevo cliente
      this.clientService.createClient(clientData).subscribe({
        next: () => {
          this.loadClients();
          this.resetForm();
        },
        error: (err) => {
          console.error('Error al crear cliente', err);
          if (err.status === 403 && err.error?.message) {
            this.errorMessage = err.error.message;
            // 🔥 Alerta nativa inmediata al intentar registrar sin suscripción
            alert(`Acceso Denegado: ${err.error.message}`);
          }
        }
      });
    }
  }

  editClient(client: Client): void {
    this.isEditing = true;
    this.currentClientId = client.id ?? null;
    this.clientForm.patchValue({
      name: client.name,
      email: client.email,
      phone: client.phone,
      tax_id: client.tax_id
    });
  }

  deleteClient(id: number | undefined): void {
    if (!id) return;
    this.errorMessage = null;

    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      this.clientService.deleteClient(id).subscribe({
        next: () => this.loadClients(),
        error: (err) => {
          console.error('Error al eliminar cliente', err);
          if (err.status === 403 && err.error?.message) {
            this.errorMessage = err.error.message;
            // 🔥 Alerta nativa inmediata al intentar borrar sin suscripción
            alert(`Acceso Denegado: ${err.error.message}`);
          }
        }
      });
    }
  }

  resetForm(): void {
    this.clientForm.reset();
    this.isEditing = false;
    this.currentClientId = null;
    this.errorMessage = null;
  }
}