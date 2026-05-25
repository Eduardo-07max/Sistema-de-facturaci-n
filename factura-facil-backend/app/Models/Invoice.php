<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $fillable = ['client_id', 'number','concept', 'amount','due_date', 'status'];

    // Relación: Una factura pertenece a un cliente
    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
