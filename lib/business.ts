export const BUSINESS = {
  name: "AYV Automation Stack",
  owner: "Aron Vasolli",
  country: "Belgium",
  address: "",
  enterpriseNumber: "",
  email: "info@ayvwrld.com",
  whatsapp: "",
} as const;

export function whatsappUrl() {
  const digits = BUSINESS.whatsapp.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}
