"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { MdOutlineMail } from "react-icons/md";
import { IoEyeOutline } from "react-icons/io5";
import { FaRegEyeSlash } from "react-icons/fa";
import { CiLock } from "react-icons/ci";
import { PiGarageLight } from "react-icons/pi";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError("Credenciales incorrectas. Por favor, inténtalo de nuevo.");
      } else {
        router.push("/ternium/dashboard");
      }
    } catch {
      setError("Error al iniciar sesión. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <div className="relative hidden lg:block">
          <div className="absolute inset-0 bg-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 via-slate-900/45 to-slate-950/90" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-center">
              <div className="text-[140px] font-extrabold leading-none tracking-tight text-white/95">
                T
              </div>
              <div className="-mt-2 text-2xl font-semibold tracking-[0.25em] text-white/65">
                TERNIUM
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-12 lg:px-12">
          <div className="w-full max-w-md">
            <div className="flex items-center gap-3">
              <PiGarageLight className="h-6 w-6" fill="#FF3300" />
              <div className="text-lg font-semibold text-slate-900">
                Ternium
              </div>
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
              Portal de Gestión de Órdenes
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Ingrese sus credenciales corporativas para acceder.
            </p>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-700"
                >
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <MdOutlineMail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="usuario@ternium.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none ring-red-600/20 transition focus:border-red-600 focus:ring-4"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <CiLock className="h-5 w-5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={isPasswordVisible ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Ingrese su contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 outline-none ring-red-600/20 transition focus:border-red-600 focus:ring-4"
                  />
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible((value) => !value)}
                    className="absolute inset-y-0 right-2 flex items-center rounded-md px-2 text-slate-400 transition hover:text-slate-600"
                    aria-label={
                      isPasswordVisible
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                  >
                    {isPasswordVisible ? (
                      <IoEyeOutline className="h-5 w-5" />
                    ) : (
                      <FaRegEyeSlash className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 h-12 w-full rounded-md bg-ternium-red text-sm font-semibold tracking-wide text-white transition hover:bg-[#c70511] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "INICIANDO SESIÓN..." : "INICIAR SESIÓN"}
              </button>
            </form>

            <div className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
              © {new Date().getFullYear()} Ternium. Todos los derechos reservados. Acceso autorizado
              únicamente.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
