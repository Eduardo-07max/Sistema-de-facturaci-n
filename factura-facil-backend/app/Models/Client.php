<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    // Esto permite que podamos guardar datos masivamente
    protected $fillable = ['user_id', 'name', 'email', 'tax_id'];

    // Relación: Un cliente pertenece a un Freelancer (User)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function invoices()
    {
    return $this->hasMany(Invoice::class);
    }
}
