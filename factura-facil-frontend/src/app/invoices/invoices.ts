import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InvoiceService } from '../services/invoice.service'; 
import { ClientService } from '../services/client.service'; 
import { Invoice } from '../Models/invoice.model';
import { Client } from '../Models/client.model';
import { RouterLink } from '@angular/router';
import { NgClass, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-invoices',
  imports: [ReactiveFormsModule, RouterLink, NgClass, CurrencyPipe], // Usamos Control Flow moderno de Angular 21, no requiere CommonModule
  templateUrl: './invoices.html',
  styleUrl: './invoices.css',
})
export class Invoices implements OnInit {
  private fb = inject(FormBuilder);
  private invoiceService = inject(InvoiceService);
  private clientService = inject(ClientService);

  invoiceForm!: FormGroup;
  invoices: Invoice[] = [];
  clients: Client[] = [];
  
  loading: boolean = true;
  submitting: boolean = false;
  
  // Variable global para capturar errores de suscripción o acceso restringido (403)
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.initForm();
    this.loadInitialData();
  }

  private initForm(): void {
    this.invoiceForm = this.fb.group({
      client_id: ['', [Validators.required]],
      number: ['', [Validators.required, Validators.pattern(/^FAC-\d+$/)]],
      amount: ['', [Validators.required, Validators.min(1)]],
      concept: ['', [Validators.required, Validators.maxLength(255)]],
      due_date: ['', [Validators.required]]
    });
  }

  private loadInitialData(): void {
    this.loading = true;
    this.errorMessage = null;
    
    this.clientService.getClients().subscribe({
      next: (clientsData) => {
        this.clients = clientsData;
        this.loadInvoices();
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

  loadInvoices(): void {
    this.invoiceService.getInvoices().subscribe({
      next: (invoicesData) => {
        this.invoices = invoicesData;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar facturas', err);
        this.loading = false;
        if (err.status === 403 && err.error?.message) {
          this.errorMessage = err.error.message;
        }
      }
    });
  }

  onSubmit(): void {
    if (this.invoiceForm.invalid) return;

    this.submitting = true;
    this.errorMessage = null;
    const newInvoice: Invoice = this.invoiceForm.value;

    this.invoiceService.createInvoice(newInvoice).subscribe({
      next: (createdInvoice) => {
        console.log('Factura creada con éxito', createdInvoice);
        this.invoiceForm.reset({ 
          client_id: '', 
          number: '', 
          amount: '', 
          concept: '', 
          due_date: '' 
        });
        this.loadInvoices();
        this.submitting = false;
      },
      error: (err) => {
        console.error('Error al crear la factura', err);
        this.submitting = false;
        if (err.status === 403 && err.error?.message) {
          this.errorMessage = err.error.message;
        }
      }
    });
  }

  downloadPDF(id: number): void {
    this.invoiceService.downloadInvoicePDF(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Factura-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      error: (err) => {
        console.error('Error al descargar el PDF', err);
        if (err.status === 403 && err.error?.message) {
          this.errorMessage = err.error.message;
        }
      }
    });
  }

  copyPaymentLink(id: number): void {
    this.invoiceService.createClientPaymentSession(id).subscribe({
      next: (response) => {
        if (response.checkout_url) {
          navigator.clipboard.writeText(response.checkout_url);
          alert('¡Enlace de pago copiado al portapapeles!');
        }
      },
      error: (err) => {
        console.error('Error al generar enlace de pago', err);
        if (err.status === 403 && err.error?.message) {
          this.errorMessage = err.error.message;
        }
      }
    });
  }

  cancelInvoice(id: number): void {
    if (confirm('¿Estás seguro de que deseas cancelar esta factura?')) {
      this.errorMessage = null;
      this.invoiceService.deleteInvoice(id).subscribe({
        next: () => {
          this.loadInvoices();
        },
        error: (err) => {
          console.error('Error al cancelar factura', err);
          if (err.status === 403 && err.error?.message) {
            this.errorMessage = err.error.message;
          }
        }
      });
    }
  }

  getClientName(clientId: number): string {
    const client = this.clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente Desconocido';
  }
}