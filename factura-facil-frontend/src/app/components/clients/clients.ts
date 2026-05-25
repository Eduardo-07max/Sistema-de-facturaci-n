import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { Client } from '../../Models/client.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-clients',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
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
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar clientes', err);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.clientForm.invalid) return;

    const clientData: Client = this.clientForm.value;

    if (this.isEditing && this.currentClientId) {
      // Actualizar cliente existente
      this.clientService.updateClient(this.currentClientId, clientData).subscribe({
        next: () => {
          this.loadClients();
          this.resetForm();
        },
        error: (err) => console.error('Error al actualizar cliente', err)
      });
    } else {
      // Crear nuevo cliente
      this.clientService.createClient(clientData).subscribe({
        next: () => {
          this.loadClients();
          this.resetForm();
        },
        error: (err) => console.error('Error al crear cliente', err)
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
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      this.clientService.deleteClient(id).subscribe({
        next: () => this.loadClients(),
        error: (err) => console.error('Error al eliminar cliente', err)
      });
    }
  }

  resetForm(): void {
    this.clientForm.reset();
    this.isEditing = false;
    this.currentClientId = null;
  }
}
