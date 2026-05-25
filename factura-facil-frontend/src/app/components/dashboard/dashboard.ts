import { Component, OnInit, inject, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth';
import { StripeService } from '../../services/stripe';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private stripeService = inject(StripeService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  // Guardamos el string exacto que maneja tu base de datos de Laravel
  subscriptionStatus: string = 'inactive'; 
  planName: string = 'Ninguno';
  loading: boolean = true;
  // En tu archivo dashboard.ts añade este estado:
isMobileMenuOpen = false;
  // 🔥 NUEVA VARIABLE: Controla si el menú del perfil está abierto o cerrado
  isDropdownOpen: boolean = false;

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.checkUserSubscription();
  }

  // 🔥 NUEVO MÉTODO: Alternar el estado del menú
  toggleDropdown(event: Event): void {
    event.stopPropagation(); // Evitamos que el evento fluya y cierre el menú de inmediato
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // 🔥 NUEVO ESCUCHADOR: Cierra el menú automáticamente si se hace clic en cualquier otra parte de la pantalla
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  checkUserSubscription(): void {
    this.stripeService.getSubscriptionStatus().subscribe({
      next: (response) => {
        // 🔥 CORREGIDO: Laravel devuelve 'subscribed' (true/false).
        // Si es true, asumimos 'active' porque pasó los filtros del Backend.
        if (response.subscribed === true) {
          this.subscriptionStatus = 'active';
          this.planName = 'Plan Freelancer Mensual';
          
          // Sincronizamos el localStorage con los datos frescos
          const oldData = JSON.parse(localStorage.getItem('user_data') || '{}');
          if (oldData && oldData.subscription_status !== 'active') {
            oldData.subscription_status = 'active';
            localStorage.setItem('user_data', JSON.stringify(oldData));
            console.log('¡Estado de suscripción actualizado localmente a active!');
          }
        } else {
          // Si es false, el usuario no tiene una suscripción válida
          this.subscriptionStatus = 'inactive';
          this.planName = 'Ninguno';
          
          // Limpiamos el almacenamiento local en caso de que haya expirado
          const oldData = JSON.parse(localStorage.getItem('user_data') || '{}');
          if (oldData.subscription_status) {
            oldData.subscription_status = 'inactive';
            localStorage.setItem('user_data', JSON.stringify(oldData));
          }
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener estado de suscripción', err);
        this.loading = false;
      }
    });
  }

  subscribeToFreelancerPlan(): void {
    this.loading = true;
    this.stripeService.createCheckoutSession().subscribe({
      next: (response) => {
        if (response.checkout_url) {
          window.location.href = response.checkout_url;
        }
      },
      error: (err) => {
        console.error('Error al crear sesión de checkout', err);
        this.loading = false;
      }
    });
  }

  goToStripePortal(): void {
    this.loading = true;
    this.stripeService.getCustomerPortalUrl().subscribe({
      next: (response) => {
        if (response.portal_url) {
          window.location.href = response.portal_url;
        }
      },
      error: (err) => {
        console.error('Error al abrir el portal de Stripe', err);
        this.loading = false;
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}