/**
 * Limites de imagem usados no catálogo público.
 *
 * As dimensões são suficientemente grandes para zoom e telas retina, mas
 * evitam que fotografias de câmara sejam enviadas em resolução desnecessária.
 */
export const PRODUCT_IMAGE_MAX_WIDTH = 1600;
export const PRODUCT_IMAGE_MAX_HEIGHT = 2000;
export const PRODUCT_IMAGE_MAX_BYTES = 1_500_000;
export const PRODUCT_IMAGE_QUALITY = 0.84;

export type ImageDimensions = {
  width: number;
  height: number;
};

export type ImageOptimizationPlan = ImageDimensions & {
  scale: number;
  needsResize: boolean;
  targetType: "image/webp" | "image/jpeg";
};

/**
 * Calcula as dimensões proporcionais finais sem distorcer a fotografia.
 * A função é pura para permitir testes sem depender das APIs do navegador.
 */
export function constrainImageDimensions(
  dimensions: ImageDimensions,
  maxWidth = PRODUCT_IMAGE_MAX_WIDTH,
  maxHeight = PRODUCT_IMAGE_MAX_HEIGHT,
): ImageDimensions & { scale: number } {
  if (dimensions.width <= 0 || dimensions.height <= 0) {
    throw new Error("As dimensões da imagem devem ser maiores que zero.");
  }

  const scale = Math.min(1, maxWidth / dimensions.width, maxHeight / dimensions.height);
  return {
    width: Math.max(1, Math.round(dimensions.width * scale)),
    height: Math.max(1, Math.round(dimensions.height * scale)),
    scale,
  };
}

/**
 * Decide o formato e o tamanho alvo que serão usados pelo upload do produto.
 * Fotografias comuns usam WebP; o JPEG é o fallback para navegadores sem WebP.
 */
export function getImageOptimizationPlan(
  dimensions: ImageDimensions,
  supportsWebP = true,
): ImageOptimizationPlan {
  const constrained = constrainImageDimensions(dimensions);
  return {
    ...constrained,
    needsResize: constrained.scale < 1,
    targetType: supportsWebP ? "image/webp" : "image/jpeg",
  };
}

/**
 * Converte um File de imagem para uma versão otimizada usando Canvas.
 * O processamento acontece antes do envio, reduzindo o tráfego e o custo de
 * armazenamento sem alterar o contrato existente do endpoint tRPC.
 */
export async function optimizeProductImage(file: File): Promise<{
  fileName: string;
  contentType: "image/webp" | "image/jpeg";
  dataUrl: string;
  originalBytes: number;
  optimizedBytes: number;
  width: number;
  height: number;
}> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecione um ficheiro de imagem válido.");
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    const supportsWebP = await canEncodeWebP();
    const plan = getImageOptimizationPlan({ width: image.naturalWidth, height: image.naturalHeight }, supportsWebP);
    const encoded = await encodeWithinBudget(image, plan);
    const dataUrl = await blobToDataUrl(encoded.blob);
    const extension = plan.targetType === "image/webp" ? "webp" : "jpg";
    const baseName = file.name.replace(/\.[^.]+$/, "") || "produto";

    return {
      fileName: `${baseName}.${extension}`,
      contentType: plan.targetType,
      dataUrl,
      originalBytes: file.size,
      optimizedBytes: encoded.blob.size,
      width: encoded.width,
      height: encoded.height,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** Carrega a imagem de forma assíncrona para obter dimensões confiáveis. */
function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Não foi possível ler a imagem selecionada."));
    image.src = source;
  });
}

/** Confirma se o navegador consegue codificar WebP antes de o usar. */
function canEncodeWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    canvas.toBlob((blob) => resolve(Boolean(blob && blob.type === "image/webp")), "image/webp", 0.5);
  });
}

/**
 * Codifica a imagem e reduz progressivamente a qualidade ou a dimensão até
 * atingir o orçamento de peso do catálogo. Assim, uma fotografia enorme não
 * consegue reintroduzir um ficheiro pesado no storefront.
 */
async function encodeWithinBudget(
  image: HTMLImageElement,
  plan: ImageOptimizationPlan,
): Promise<{ blob: Blob; width: number; height: number }> {
  let width = plan.width;
  let height = plan.height;
  const qualitySteps = [PRODUCT_IMAGE_QUALITY, 0.74, 0.64, 0.54, 0.44];

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Não foi possível preparar o processamento da imagem.");

    // Fundo branco evita áreas pretas quando uma fotografia sem transparência
    // é convertida para JPEG em navegadores sem suporte a WebP.
    if (plan.targetType === "image/jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
    }
    context.drawImage(image, 0, 0, width, height);

    const quality = qualitySteps[Math.min(attempt, qualitySteps.length - 1)];
    const blob = await canvasToBlob(canvas, plan.targetType, quality);
    if (blob.size <= PRODUCT_IMAGE_MAX_BYTES) {
      return { blob, width, height };
    }

    // Se a qualidade já foi reduzida, diminui a resolução gradualmente para
    // tratar imagens muito detalhadas sem ultrapassar o limite de transferência.
    width = Math.max(480, Math.round(width * 0.86));
    height = Math.max(600, Math.round(height * 0.86));
  }

  throw new Error("A imagem continua demasiado pesada após a otimização.");
}

/** Encapsula Canvas.toBlob e falha explicitamente se a codificação não ocorrer. */
function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("O navegador não conseguiu codificar a imagem otimizada."));
    }, type, quality);
  });
}

/** Converte o blob final para o data URL já aceito pela mutation de upload. */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Não foi possível preparar a imagem para envio."));
    reader.readAsDataURL(blob);
  });
}
