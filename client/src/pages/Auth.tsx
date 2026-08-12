import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Check, LockKeyhole } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Auth() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!email || !password || (mode === "signup" && !name)) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }
    setSubmitted(true);
    window.setTimeout(() => {
      toast.success(mode === "login" ? "Sessão iniciada." : "Conta criada com sucesso.");
      navigate("/");
    }, 500);
  }

  return (
    <main className="auth-page">
      <div className="auth-aside">
        <Link href="/" className="auth-back"><ArrowLeft size={16} /> Voltar para a loja</Link>
        <div className="auth-statement"><span>ERAS<span className="red-dot">.</span></span><p>Uma conta para guardar as suas escolhas — e acompanhar cada nova era.</p></div>
      </div>
      <section className="auth-card">
        <div className="auth-card-top"><span className="section-kicker">ÁREA DO CLIENTE</span><LockKeyhole size={18} /></div>
        <h1>{mode === "login" ? "Entrar na sua conta" : "Criar a sua conta"}</h1>
        <p className="auth-helper">Guarde os seus dados, endereços e pedidos para tornar a próxima compra mais simples.</p>
        {submitted ? <div className="auth-success"><Check size={28} /><p>A processar o seu acesso...</p></div> : <form onSubmit={submit} className="auth-form">
          {mode === "signup" && <label>Nome completo<Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu nome" /></label>}
          <label>E-mail<Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="voce@email.com" /></label>
          <label>Senha<Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="••••••••" /></label>
          <div className="auth-row"><label className="remember"><input type="checkbox" /> Lembrar de mim</label><a href="#forgot">Esqueci a senha</a></div>
          <Button type="submit" className="auth-submit">{mode === "login" ? "ENTRAR" : "CRIAR CONTA"} <ArrowRight size={16} /></Button>
        </form>}
        <button className="auth-switch" onClick={() => setMode(mode === "login" ? "signup" : "login")}>{mode === "login" ? "Ainda não tem conta? Criar agora" : "Já tem conta? Entrar"}</button>
        <div className="auth-admin-note"><span>Área administrativa?</span><Link href="/admin">Entrar no painel <ArrowRight size={13} /></Link></div>
      </section>
    </main>
  );
}
