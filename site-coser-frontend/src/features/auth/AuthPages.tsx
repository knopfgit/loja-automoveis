import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { getErrorMessage, api } from '../../services/api';
import { useAuth } from './AuthProvider';

const loginSchema = z.object({
  email: z.string().email('Informe um e-mail valido.'),
  password: z.string().min(1, 'Informe a senha.'),
});

const registerSchema = z.object({
  fullName: z.string().min(2, 'Informe seu nome completo.'),
  email: z.string().email('Informe um e-mail valido.'),
  document: z
    .string()
    .min(11, 'Informe um CPF ou CNPJ valido.')
    .refine((value) => {
      const digits = value.replace(/\D/g, '');
      return digits.length === 11 || digits.length === 14;
    }, 'Informe um CPF (11 digitos) ou CNPJ (14 digitos) valido.'),
  phone: z.string().optional(),
  password: z.string().min(8, 'A senha deve ter ao menos 8 caracteres.'),
});

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const form = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema) });

  return (
    <AuthShell title="Entrar na COSER" subtitle="Use uma credencial seed para acessar as areas por perfil.">
      <form
        className="form"
        onSubmit={form.handleSubmit(async (input) => {
          setError('');
          try {
            await login(input);
            navigate((location.state as { from?: string } | null)?.from ?? '/interno/dashboard');
          } catch (err) {
            setError(getErrorMessage(err));
          }
        })}
      >
        <input placeholder="E-mail" {...form.register('email')} />
        <small>{form.formState.errors.email?.message}</small>
        <input placeholder="Senha" type="password" {...form.register('password')} />
        <small>{form.formState.errors.password?.message}</small>
        {error && <div className="form-error">{error}</div>}
        <button className="button button-dark" type="submit" disabled={form.formState.isSubmitting}>Entrar</button>
        <Link to="/recuperar-senha">Esqueci minha senha</Link>
      </form>
    </AuthShell>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const form = useForm<z.infer<typeof registerSchema>>({ resolver: zodResolver(registerSchema) });

  return (
    <AuthShell title="Criar conta" subtitle="O cadastro publico cria uma conta de cliente.">
      <form
        className="form"
        onSubmit={form.handleSubmit(async (input) => {
          setError('');
          try {
            await register(input);
            navigate('/cliente/conta');
          } catch (err) {
            setError(getErrorMessage(err));
          }
        })}
      >
        <input placeholder="Nome completo" {...form.register('fullName')} />
        <input placeholder="E-mail" {...form.register('email')} />
        <input placeholder="CPF ou CNPJ" {...form.register('document')} />
        <input placeholder="WhatsApp" {...form.register('phone')} />
        <input placeholder="Senha" type="password" {...form.register('password')} />
        {Object.values(form.formState.errors).map((item) => <small key={item.message}>{item.message}</small>)}
        {error && <div className="form-error">{error}</div>}
        <button className="button button-dark" type="submit" disabled={form.formState.isSubmitting}>Cadastrar</button>
      </form>
    </AuthShell>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  return (
    <AuthShell title="Recuperar senha" subtitle="Enviaremos as instrucoes para o e-mail informado.">
      <form
        className="form"
        onSubmit={async (event) => {
          event.preventDefault();
          await api.post('/auth/forgot-password', { email });
          setDone(true);
        }}
      >
        <input required placeholder="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} />
        <button className="button button-dark" type="submit">Enviar</button>
        {done && <div className="success-box">Se o e-mail existir, as instrucoes serao enviadas.</div>}
      </form>
    </AuthShell>
  );
}

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="auth-page">
      <section className="auth-panel">
        <span className="eyebrow">Acesso</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
      </section>
    </div>
  );
}
