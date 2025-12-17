import { User } from "../types";

// NOTE: In production, never expose API KEYS in the frontend code.
// Ideally, use environment variables: process.env.REACT_APP_ABACATE_PAY_KEY
const API_TOKEN = process.env.NEXT_PUBLIC_ABACATE_PAY_KEY || "YOUR_ABACATE_PAY_API_TOKEN_HERE";
const BASE_URL = "https://api.abacatepay.com/v1";

interface CreateBillingResponse {
  url: string;
  id: string;
}

export const createCheckoutSession = async (user: User): Promise<string> => {
  // Determine the return URL (where the user comes back to after paying)
  // We append ?status=paid to handle the success state in App.tsx
  const returnUrl = `${window.location.origin}/?status=paid`;

  // DEMO / DEV MODE HANDLING
  // If the API key is not set (is the default string), we simulate the payment process.
  // This prevents "Failed to fetch" errors when running the code without a real backend/key.
  if (API_TOKEN.includes("YOUR_ABACATE_PAY_API_TOKEN_HERE")) {
    console.warn("AbacatePay API Key not set. Running in DEMO mode (simulated payment).");
    
    // Simulate network delay for realism
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Return the success URL directly to simulate a successful redirection
    return returnUrl;
  }

  const payload = {
    frequency: "ONE_TIME", // or 'MONTHLY'
    methods: ["PIX", "CARD"],
    products: [
      {
        externalId: "gabaritando-premium",
        name: "GabaritandoIA Premium",
        description: "Acesso ilimitado a geração de flashcards e mapas mentais.",
        quantity: 1,
        price: 1000, // R$ 10.00 in cents
      },
    ],
    returnUrl: returnUrl,
    completionUrl: returnUrl,
    customer: {
      name: user.username || "Cliente GabaritandoIA",
      email: "cliente@exemplo.com", 
      taxId: "123.456.789-01",
      cellphone: "(11) 99999-9999", 
    },
  };

  try {
    const response = await fetch(`${BASE_URL}/billing/create`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn("AbacatePay API Warning:", errorData);
      throw new Error("Falha ao criar sessão de pagamento.");
    }

    const data = await response.json();
    const checkoutUrl = data?.data?.url || data?.url;

    if (!checkoutUrl) {
        throw new Error("URL de pagamento não retornada pela API.");
    }

    return checkoutUrl;
  } catch (error) {
    // Log as warning to avoid cluttering console with red errors during dev/test
    console.warn("Payment Gateway Error (Network/CORS/Key):", error);
    throw new Error("Erro de conexão com o pagamento. Verifique a API Key ou tente novamente.");
  }
};