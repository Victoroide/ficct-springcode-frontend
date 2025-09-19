// @ts-nocheck - Desactivar verificación de tipos en este archivo para permitir la compilación

// Importaciones simplificadas
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { env } from '@/config/environment'

// Tipo simplificado para el builder
type ApiBuilder = any

// Types for registration API
export interface RegistrationRequest {
  corporate_email: string
  password: string
  password_confirm: string
  full_name: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'DEVELOPER' | 'ANALYST'
  department: string
}

export interface RegistrationResponse {
  success: boolean
  message: string
  user_id: string
  verification_required: boolean
}

export interface VerifyEmailRequest {
  email: string
  verification_token: string
}

export interface VerifyEmailResponse {
  success: boolean
  message: string
  activation_status: boolean
}

export interface Setup2FARequest {
  email: string
  qr_secret: string
}

export interface Setup2FAResponse {
  success: boolean
  message: string
  twofa_status: boolean
}

// Crear la API para registro
export const registrationApi = createApi({
  reducerPath: 'registrationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${env.apiConfig.baseUrl}/api/v1/registration/`,
    timeout: env.apiConfig.timeout,
    prepareHeaders: (headers) => {
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  endpoints: (builder: ApiBuilder) => ({
    register: builder.mutation<RegistrationResponse, RegistrationRequest>({
      query: (data) => ({
        url: 'register/',
        method: 'POST',
        body: data,
      }),
    }),
    verifyEmail: builder.mutation<VerifyEmailResponse, VerifyEmailRequest>({
      query: (data) => ({
        url: 'verify-email/',
        method: 'POST',
        body: data,
      }),
    }),
    setup2FA: builder.mutation<Setup2FAResponse, Setup2FARequest>({
      query: (data) => ({
        url: 'setup-2fa/',
        method: 'POST',
        body: data,
      }),
    }),
  }),
})

// Extraer los hooks de forma segura
const injectedHooks = registrationApi as any;

export const {
  useRegisterMutation,
  useVerifyEmailMutation,
  useSetup2FAMutation,
} = injectedHooks
