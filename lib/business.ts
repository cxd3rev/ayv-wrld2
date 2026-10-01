import { CONTACT_EMAIL, CONTACT_PHONE, PRODUCT_NAME } from "@/config/site";

export const BUSINESS = {
  name: PRODUCT_NAME,
  owner: "Aron Vasolli",
  country: "Belgium",
  address: "",
  enterpriseNumber: "",
  email: CONTACT_EMAIL,
  phone: CONTACT_PHONE,
  whatsapp: "",
} as const;

export function whatsappUrl() {
  const digits = BUSINESS.whatsapp.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}
