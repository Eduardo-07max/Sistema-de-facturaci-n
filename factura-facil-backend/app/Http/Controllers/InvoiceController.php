<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Traemos los clientes del usuario y sus facturas cargadas (Eager Loading)
        // Esto es mucho más eficiente para la base de datos
        $invoices = Invoice::whereHas('client', function ($query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })->get();

        return response()->json($invoices, 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // 1. Validamos los datos básicos incluyendo los nuevos campos
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'number'    => 'required|string|unique:invoices,number',
            'amount'    => 'required|numeric|min:0',
            'concept'   => 'required|string|max:255',
            'due_date'  => 'required|date',
        ]);

        // 2. SEGURIDAD: Verificamos que el cliente realmente le pertenezca al usuario logueado
        $client = $request->user()->clients()->findOrFail($validated['client_id']);

        // 3. CREACIÓN: Si el paso anterior no dio error, creamos la factura con todos los campos
        $invoice = $client->invoices()->create($validated);

        return response()->json([
            'message' => '¡Factura creada! A cobrar se ha dicho.',
            'invoice' => $invoice
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, $id)
    {
        $invoice = Invoice::whereHas('client', function ($query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })->findOrFail($id);

        return response()->json($invoice);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        // 1. Buscamos la factura con el filtro de seguridad (solo la nuestra)
        $invoice = Invoice::whereHas('client', function ($query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })->findOrFail($id);

        // 2. Validamos los datos (todo es opcional con 'sometimes') agregando los nuevos campos
        $validated = $request->validate([
            'number'   => 'sometimes|string|unique:invoices,number,' . $id,
            'amount'   => 'sometimes|numeric|min:0',
            'status'   => 'sometimes|string|in:pending,paid,canceled',
            'concept'  => 'sometimes|string|max:255',
            'due_date' => 'sometimes|date',
        ]);

        // 3. Actualizamos
        $invoice->update($validated);

        return response()->json([
            'message' => 'Factura actualizada correctamente.',
            'invoice' => $invoice
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, $id)
    {
        // Buscamos la factura pero filtramos a través de la relación del usuario
        $invoice = Invoice::whereHas('client', function ($query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })->findOrFail($id);

        $invoice->delete();

        return response()->json([
            'message' => 'Factura eliminada. Aquí no pasó nada.'
        ]);
    }

    public function downloadPDF(Request $request, $id)
    {
        // 1. Lógica de seguridad con Eager Loading para traer los datos del cliente
        $invoice = Invoice::whereHas('client', function ($query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })->with('client')->findOrFail($id);

        // Formatear fechas y montos de forma elegante
        $createdAt = $invoice->created_at ? $invoice->created_at->format('d/m/Y') : date('d/m/Y');
        $dueDate = $invoice->due_date ? \Carbon\Carbon::parse($invoice->due_date)->format('d/m/Y') : 'N/A';
        $amountFormatted = number_format($invoice->amount, 2);
        
        // Mapeo de estados visuales
        $statusLabels = [
            'paid' => ['text' => 'PAGADA', 'bg' => '#d1fae5', 'color' => '#065f46'],
            'pending' => ['text' => 'PENDIENTE', 'bg' => '#fef3c7', 'color' => '#92400e'],
            'canceled' => ['text' => 'CANCELADA', 'bg' => '#fee2e2', 'color' => '#991b1b'],
        ];
        
        $currentStatus = $statusLabels[$invoice->status] ?? ['text' => strtoupper($invoice->status ?? 'PENDIENTE'), 'bg' => '#f3f4f6', 'color' => '#374151'];

        // 2. HTML con diseño profesional estructurado para dompdf incluyendo concepto y vencimiento
        $html = "
        <!DOCTYPE html>
        <html lang='es'>
        <head>
            <meta charset='UTF-8'>
            <title>Factura {$invoice->number}</title>
            <style>
                body {
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    color: #333333;
                    line-height: 1.4;
                    font-size: 14px;
                    margin: 0;
                    padding: 0;
                }
                .invoice-box {
                    max-width: 800px;
                    margin: auto;
                    padding: 10px;
                }
                table {
                    width: 100%;
                    line-height: inherit;
                    text-align: left;
                    border-collapse: collapse;
                }
                table td {
                    padding: 8px;
                    vertical-align: top;
                }
                .header-table td {
                    padding-bottom: 30px;
                }
                .title {
                    font-size: 28px;
                    font-weight: bold;
                    color: #1e3a8a;
                    margin: 0;
                    letter-spacing: -0.5px;
                }
                .company-info {
                    text-align: right;
                    font-size: 12px;
                    color: #666666;
                }
                .details-table {
                    margin-bottom: 40px;
                    border-bottom: 1px solid #e5e7eb;
                    padding-bottom: 20px;
                }
                .section-title {
                    font-size: 11px;
                    font-weight: bold;
                    color: #9ca3af;
                    text-transform: uppercase;
                    margin-bottom: 5px;
                    letter-spacing: 0.5px;
                }
                .client-name {
                    font-size: 16px;
                    font-weight: bold;
                    color: #111827;
                }
                .client-email {
                    color: #4b5563;
                    font-size: 13px;
                }
                .invoice-info {
                    text-align: right;
                    font-size: 13px;
                }
                .status-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 50px;
                    font-size: 11px;
                    font-weight: bold;
                    text-align: center;
                    background-color: {$currentStatus['bg']};
                    color: {$currentStatus['color']};
                }
                .items-table {
                    width: 100%;
                    margin-top: 20px;
                }
                .items-table th {
                    background: #f9fafb;
                    border-bottom: 2px solid #e5e7eb;
                    font-weight: bold;
                    font-size: 12px;
                    text-transform: uppercase;
                    color: #4b5563;
                    padding: 12px 10px;
                    text-align: left;
                }
                .items-table td {
                    padding: 15px 10px;
                    border-bottom: 1px solid #f3f4f6;
                    font-size: 13px;
                }
                .text-right {
                    text-align: right;
                }
                .total-section {
                    margin-top: 30px;
                    float: right;
                    width: 35%;
                }
                .total-table td {
                    padding: 8px 0;
                }
                .total-row {
                    font-size: 18px;
                    font-weight: bold;
                    color: #1e3a8a;
                    border-top: 2px solid #1e3a8a;
                }
                .footer {
                    margin-top: 120px;
                    text-align: center;
                    font-size: 12px;
                    color: #9ca3af;
                    border-top: 1px solid #e5e7eb;
                    padding-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class='invoice-box'>
                <!-- Encabezado -->
                <table class='header-table'>
                    <tr>
                        <td>
                            <p class='title'>Factura Fácil</p>
                            <span style='font-size: 12px; color: #6b7280;'>SaaS para Freelancers</span>
                        </td>
                        <td class='company-info'>
                            <strong>Generado por:</strong><br>
                            {$request->user()->name}<br>
                            {$request->user()->email}
                        </td>
                    </tr>
                </table>

                <!-- Información de la factura y cliente -->
                <table class='details-table'>
                    <tr>
                        <td style='width: 50%;'>
                            <div class='section-title'>Facturado a</div>
                            <div class='client-name'>{$invoice->client->name}</div>
                            <div class='client-email'>{$invoice->client->email}</div>
                        </td>
                        <td class='invoice-info' style='width: 50%;'>
                            <div class='section-title'>Detalles del documento</div>
                            <strong>Folio:</strong> #{$invoice->number}<br>
                            <strong>Fecha de Emisión:</strong> {$createdAt}<br>
                            <strong>Fecha de Vencimiento:</strong> {$dueDate}<br>
                            <div style='margin-top: 8px;'>
                                <span class='status-badge'>{$currentStatus['text']}</span>
                            </div>
                        </td>
                    </tr>
                </table>

                <!-- Tabla de Conceptos -->
                <table class='items-table'>
                    <thead>
                        <tr>
                            <th>Descripción / Concepto</th>
                            <th class='text-right' style='width: 25%;'>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <strong>{$invoice->concept}</strong><br>
                                <span style='font-size: 11px; color: #6b7280;'>Correspondientes al folio de control interno #{$invoice->number}</span>
                            </td>
                            <td class='text-right' style='font-size: 15px; font-weight: 500;'>\${$amountFormatted}</td>
                        </tr>
                    </tbody>
                </table>

                <!-- Bloque de Totales -->
                <div class='total-section'>
                    <table class='total-table'>
                        <tr>
                            <td style='color: #6b7280;'>Subtotal:</td>
                            <td class='text-right'>\${$amountFormatted}</td>
                        </tr>
                        <tr>
                            <td style='color: #6b7280;'>Impuestos (0%):</td>
                            <td class='text-right'>\$0.00</td>
                        </tr>
                        <tr class='total-row'>
                            <td>Total:</td>
                            <td class='text-right'>\${$amountFormatted}</td>
                        </tr>
                    </table>
                </div>

                <div style='clear: both;'></div>

                <!-- Pie de página fijo -->
                <div class='footer'>
                    <p>Gracias por tu confianza y preferencia.</p>
                    <p style='font-size: 10px; margin-top: 5px;'>Este es un documento digital generado de manera automatizada a través de Factura Fácil.</p>
                </div>
            </div>
        </body>
        </html>
        ";

        // 3. Cargar el HTML renderizado y descargar
        $pdf = Pdf::loadHTML($html);
        return $pdf->download("factura-{$invoice->number}.pdf");
    }
}