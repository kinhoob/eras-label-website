import { useState } from "react";
import { Package } from "lucide-react";

type AdminProductThumbnailProps = {
  src?: string;
  alt: string;
};

/**
 * Miniatura resiliente do inventário: usa a foto do produto quando disponível
 * e retorna para o ícone de pacote quando a URL estiver vazia ou indisponível.
 */
export function AdminProductThumbnail({ src, alt }: AdminProductThumbnailProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="table-thumb" aria-label={alt} style={{ width: "32px", height: "32px", minWidth: "32px", borderRadius: "4px", overflow: "hidden", display: "inline-grid", placeItems: "center", background: "#e1d8cb", color: "#c95139" }}>
      {src && !failed ? (
        <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setFailed(true)} />
      ) : (
        <Package size={14} aria-hidden="true" />
      )}
    </div>
  );
}
