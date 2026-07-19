export const business = {
  name: "Lu An Bazar",
  address: "Av. Maradona 1444, Formosa, Argentina",
  phoneDisplay: "+54 9 370 432-5046",
  whatsappNumber: "5493704325046",
  instagramHandle: "@luanbazar",
  instagramUrl: "",
  facebookUrl: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "",
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://lu-an-bazar.vercel.app",
} as const;

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${business.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`;
