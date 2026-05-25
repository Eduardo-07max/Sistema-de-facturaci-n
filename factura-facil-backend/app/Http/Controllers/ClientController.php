<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Solo traemos los clientes que pertenecen al usuario del Token
    $clients = $request->user()->clients; 
    
    return response()->json($clients, 200);

    }

    /**
     * Store a newly created resource in storage.
     */
   public function store(Request $request)
{
    // 1. Validamos los datos
    $validated = $request->validate([
        'name'   => 'required|string|max:255',
        'email'  => 'required|email|max:255',
        'tax_id' => 'nullable|string|max:50',
    ]);

    // 2. LA MAGIA: $request->user() obtiene al Eduardo que se logueó con el token.
    // Esto garantiza que el cliente se guarde con TU user_id automáticamente.
    $client = $request->user()->clients()->create($validated);

    return response()->json([
        'message' => '¡Victoria! Cliente vinculado a tu cuenta con éxito.',
        'client'  => $client
    ], 201);
}

    /**
     * Display the specified resource.
     */
    public function show(Request $request, $id)
    {
        // Buscamos el cliente SOLO entre los que te pertenecen
    $client = $request->user()->clients()->findOrFail($id);
    
    return response()->json($client);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $client = $request->user()->clients()->findOrFail($id);

    $validated = $request->validate([
        'name'   => 'string|max:255',
        'email'  => 'email|max:255',
        'tax_id' => 'nullable|string|max:50',
    ]);

    $client->update($validated);
    
    return response()->json([
        'message' => 'Cliente actualizado con éxito',
        'client'  => $client
    ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, $id)
    {
        $client = $request->user()->clients()->findOrFail($id);
    
    $client->delete();
    
    return response()->json([
        'message' => 'Cliente eliminado de tu cuenta'
    ]);
    }
}
