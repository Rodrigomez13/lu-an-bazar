import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { apiError, requireAdminRole } from "@/lib/admin-api";
import { isOpenAIConfigured } from "@/lib/supabase/config";

export const runtime = "nodejs";

const ProductAnalysis = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(20).max(500),
  category: z.enum([
    "Cocina y bebidas",
    "Electrodomésticos",
    "Cuidado personal",
    "Salud y bienestar",
    "Tecnología",
    "Hogar",
  ]),
  brand: z.string().max(80),
  color: z.string().max(80),
  material: z.string().max(120),
  dimensions: z.string().max(120),
  features: z.array(z.string().max(120)).min(2).max(6),
  keywords: z.array(z.string().max(40)).min(3).max(10),
});

export async function POST(request: Request) {
  try {
    await requireAdminRole(["admin", "catalog_manager"]);
    if (!isOpenAIConfigured()) {
      throw new Error("Agregá OPENAI_API_KEY en .env.local para usar el análisis automático.");
    }
    const formData = await request.formData();
    const image = formData.get("image");
    const price = String(formData.get("price") ?? "").trim();
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
    const base64 = Buffer.from(await image.arrayBuffer()).toString("base64");
    const response = await client.responses.parse({
      model: process.env.OPENAI_VISION_MODEL ?? "gpt-5.6",
      input: [
        {
          role: "system",
          content:
            "Sos catalogador de Lu An Bazar, Formosa, Argentina. Identificá sólo lo visible, no inventes especificaciones, potencia, capacidad ni certificaciones. Redactá español rioplatense claro y comercial. Si una marca, material o medida no puede confirmarse, respondé 'A confirmar'.",
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Creá la ficha para este producto${price ? ` cuyo precio es ARS ${price}` : ""}. El título debe ser concreto; la descripción debe tener 1 o 2 oraciones; las características deben ser observables o prudentes.`,
            },
            {
              type: "input_image",
              image_url: `data:${image.type};base64,${base64}`,
              detail: "high",
            },
          ],
        },
      ],
      text: { format: zodTextFormat(ProductAnalysis, "product_analysis") },
    });
    if (!response.output_parsed) {
      throw new Error("La IA no pudo interpretar el producto. Completá los datos manualmente.");
    }
    return Response.json({ ok: true, data: response.output_parsed });
  } catch (error) {
    return apiError(error, "No se pudo analizar la imagen.");
  }
}
