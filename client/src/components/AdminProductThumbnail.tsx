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
    <div className="table-thumb" aria-label={alt}>
      {src && !failed ? (
        <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setFailed(true)} />
      ) : (
        <Package size={16} aria-hidden="true" />
      )}
    </div>
  );
}
