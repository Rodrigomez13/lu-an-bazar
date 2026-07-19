import OpenAI, { toFile } from "openai";
import { apiError, requireAdminAccess } from "@/lib/admin-api";
import { isOpenAIConfigured } from "@/lib/supabase/config";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await requireAdminAccess();
    if (!isOpenAIConfigured()) {
      throw new Error("Agregá OPENAI_API_KEY en .env.local para mejorar imágenes.");
    }
    const formData = await request.formData();
    const image = formData.get("image");
    const productName = String(formData.get("name") ?? "producto").trim();
    if (!(image instanceof File) || image.size === 0) {
      throw new Error("Seleccioná una imagen.");
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(image.type)) {
      throw new Error("La imagen debe ser JPG, PNG o WebP.");
    }
    if (image.size > 10 * 1024 * 1024) {
      throw new Error("La imagen no puede superar los 10 MB.");
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.images.edit({
      model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-2",
      image: await toFile(Buffer.from(await image.arrayBuffer()), image.name, {
        type: image.type,
      }),
      prompt: `Create a faithful professional ecommerce product photo of the exact same ${productName} from the reference. Isolate only the product, remove hands, clutter, price stickers and the original background. Center it with comfortable margins on a clean warm off-white studio background, soft realistic shadow, neutral lighting, square composition. Preserve the exact product shape, colors, proportions, controls, packaging, logos and readable label text. Do not add accessories, claims, branding or features not present in the reference.`,
      size: "1024x1024",
      quality: "medium",
      background: "opaque",
      output_format: "webp",
      output_compression: 88,
    });
    const encoded = response.data?.[0]?.b64_json;
    if (!encoded) throw new Error("La IA no devolvió una imagen.");
    return new Response(Buffer.from(encoded, "base64"), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return apiError(error, "No se pudo mejorar la imagen.");
  }
}
