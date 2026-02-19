"use client";

import { useState } from "react";

import EmailIcon from "@/components/icons/EmailIcon";
import EyeIcon from "@/components/icons/EyeIcon";
import EyeOffIcon from "@/components/icons/EyeOffIcon";
import LockIcon from "@/components/icons/LockIcon";
import TerniumMark from "@/components/icons/TerniumMark";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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
              <TerniumMark className="h-9 w-9" />
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

            <form className="mt-8 space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-700"
                >
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <EmailIcon className="h-5 w-5" />
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
                    <LockIcon className="h-5 w-5" />
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
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="mt-1 h-12 w-full rounded-md bg-[#E30613] text-sm font-semibold tracking-wide text-white transition hover:bg-[#c70511]"
              >
                INICIAR SESIÓN
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
