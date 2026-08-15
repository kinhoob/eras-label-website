import React from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaySound: () => void;
}

export function SidebarMenu({ isOpen, onClose, onPlaySound }: SidebarMenuProps) {
  const { data: categories = [] } = trpc.catalog.categories.useQuery(undefined, { enabled: isOpen });

  if (!isOpen) return null;

  return (
    <div className="lovable-menu-overlay" onClick={onClose}>
      <div className="lovable-side-menu" onClick={(e) => e.stopPropagation()}>
        <div className="lovable-menu-header">
          <span className="lovable-menu-kicker">EXPLORAR ERAS</span>
          <button onClick={() => { onPlaySound(); onClose(); }} className="p-2 font-bold uppercase text-sm hover:text-[#c95139]">
            Fechar [X]
          </button>
        </div>
        <div className="lovable-menu-links">
          <Link href="/" onClick={() => { onPlaySound(); onClose(); }}>Início</Link>
          <Link href="/archive" onClick={() => { onPlaySound(); onClose(); }}>Arquivo de Eras</Link>
          <Link href="/manifesto" onClick={() => { onPlaySound(); onClose(); }}>Manifesto Completo</Link>
          <Link href="/events" onClick={() => { onPlaySound(); onClose(); }}>Eventos</Link>
          <Link href="/contact" onClick={() => { onPlaySound(); onClose(); }}>Contato</Link>
          <a href="https://chat.whatsapp.com/I9UWZ9A6MmCLVm92mF86MK?mode=gi_t" target="_blank" rel="noreferrer" onClick={onPlaySound} className="vip-whatsapp">
            Grupo VIP no WhatsApp
          </a>
        </div>
        <div className="lovable-menu-section">
          <span className="lovable-menu-kicker">CATEGORIAS</span>
          <div className="lovable-menu-sublinks">
            <Link href="/" onClick={() => { onPlaySound(); onClose(); }}>Todos os Produtos</Link>
                {categories.length > 0 ? categories.map((category) => (
                  <Link key={category.id} href={`/category/${category.slug}`} onClick={() => { onPlaySound(); onClose(); }}>{category.name}</Link>
                )) : <>
                  <Link href="/category/camisetas" onClick={() => { onPlaySound(); onClose(); }}>Camisetas</Link>
                  <Link href="/category/bones" onClick={() => { onPlaySound(); onClose(); }}>Bonés</Link>
                </>}
          </div>
        </div>
        <div className="lovable-menu-section">
          <span className="lovable-menu-kicker">COLEÇÕES</span>
          <div className="lovable-menu-sublinks">
            <Link href="/collection/paradox" onClick={() => { onPlaySound(); onClose(); }}>Paradox Collection</Link>
            <Link href="/collection/lost-between-eras" onClick={() => { onPlaySound(); onClose(); }}>Lost Between Eras</Link>
            <Link href="/collection/raizes" onClick={() => { onPlaySound(); onClose(); }}>Raízes — Recife & La Ursa</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
