import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

interface CreateUserBody {
  nombre: string;
  apellido: string;
  email: string;
  contraseña: string;
  roleId: number;
  clienteId?: string;
  clienteNombre?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserBody = await request.json();
    const { nombre, apellido, email, contraseña, roleId, clienteId, clienteNombre } = body;

    if (!nombre || !apellido || !email || !contraseña || !roleId) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    // Verify the caller is an authenticated admin or user_admin
    const cookieStore = await cookies();
    const callerSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (toSet) => {
            try { toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch { /* server component */ }
          },
        },
      }
    );

    const { data: { user: callerUser }, error: authError } = await callerSupabase.auth.getUser();
    if (authError || !callerUser) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { data: callerData, error: callerRoleError } = await callerSupabase
      .from('users')
      .select('role_id, roles(name)')
      .eq('id', callerUser.id)
      .single();

    if (callerRoleError || !callerData) {
      return NextResponse.json({ error: 'No se pudo verificar tu rol' }, { status: 403 });
    }

    const callerRoleName = (callerData.roles as unknown as { name: string } | null)?.name?.toLowerCase() ?? '';
    const isAuthorized =
      callerRoleName.includes('admin') ||
      callerRoleName.includes('administrador') ||
      callerRoleName.includes('user_admin');

    if (!isAuthorized) {
      return NextResponse.json({ error: 'No tienes permisos para crear usuarios' }, { status: 403 });
    }

    // Resolve or create client if needed — caller has admin RLS permissions
    let resolvedClientId: string | null = clienteId ?? null;

    if (!resolvedClientId && clienteNombre?.trim()) {
      const { data: newClient, error: clientError } = await callerSupabase
        .from('clients')
        .insert({ name: clienteNombre.trim() })
        .select('id')
        .single();

      if (clientError) {
        return NextResponse.json({ error: 'No se pudo crear el cliente: ' + clientError.message }, { status: 400 });
      }
      resolvedClientId = newClient.id;
    }

    // Create auth user via signUp on an isolated client (no session persistence).
    // The DB trigger insert_user_in_public_table fires on auth.users INSERT and
    // auto-creates the public.users record from user_metadata.
    const signUpClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: newUser, error: createError } = await signUpClient.auth.signUp({
      email: email.trim(),
      password: contraseña,
      options: {
        data: {
          name: nombre.trim(),
          second_name: apellido.trim(),
          role_id: roleId,
        },
      },
    });

    if (createError) {
      if (createError.message.includes('already registered') || createError.message.includes('already exists')) {
        return NextResponse.json({ error: 'El correo electrónico ya está registrado' }, { status: 409 });
      }
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    if (!newUser.user?.id) {
      return NextResponse.json({ error: 'No se recibió el usuario creado' }, { status: 500 });
    }

    // Link external user to client — caller's authenticated session satisfies RLS WITH CHECK
    if (resolvedClientId) {
      const { error: linkError } = await callerSupabase
        .from('client_workers')
        .insert({ user_id: newUser.user.id, client_id: resolvedClientId });

      if (linkError) {
        return NextResponse.json({ error: 'No se pudo asociar el usuario al cliente: ' + linkError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, userId: newUser.user.id });
  } catch (err) {
    console.error('[create-user]', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
