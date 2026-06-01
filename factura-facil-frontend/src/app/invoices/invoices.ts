import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InvoiceService } from '../services/invoice.service'; 
import { ClientService } from '../services/client.service'; 
import { Invoice } from '../Models/invoice.model';
import { Client } from '../Models/client.model';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-invoices',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
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

  ngOnInit(): void {
    this.initForm();
    this.loadInitialData();
  }

  private initForm(): void {
    this.invoiceForm = this.fb.group({
      client_id: ['', [Validators.required]],
      number: ['', [Validators.required, Validators.pattern(/^FAC-\d+$/)]],
      amount: ['', [Validators.required, Validators.min(1)]],
      concept: ['', [Validators.required, Validators.maxLength(255)]], // <-- Nuevo campo
      due_date: ['', [Validators.required]] // <-- Nuevo campo
    });
  }

  private loadInitialData(): void {
    this.loading = true;
    
    this.clientService.getClients().subscribe({
      next: (clientsData) => {
        this.clients = clientsData;
        this.loadInvoices();
      },
      error: (err) => {
        console.error('Error al cargar clientes', err);
        this.loading = false;
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
      }
    });
  }

  onSubmit(): void {
    if (this.invoiceForm.invalid) return;

    this.submitting = true;
    const newInvoice: Invoice = this.invoiceForm.value;

    this.invoiceService.createInvoice(newInvoice).subscribe({
      next: (createdInvoice) => {
        console.log('Factura creada con éxito', createdInvoice);
        // Reseteamos incluyendo los nuevos campos vacíos
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
      error: (err) => console.error('Error al descargar el PDF', err)
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
      error: (err) => console.error('Error al generar enlace de pago', err)
    });
  }

  cancelInvoice(id: number): void {
    if (confirm('¿Estás seguro de que deseas cancelar esta factura?')) {
      this.invoiceService.deleteInvoice(id).subscribe({
        next: () => {
          this.loadInvoices();
        },
        error: (err) => console.error('Error al cancelar factura', err)
      });
    }
  }

  getClientName(clientId: number): string {
    const client = this.clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente Desconocido';
  }
}