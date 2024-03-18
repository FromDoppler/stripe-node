// This is your test publishable API key.
const stripe = Stripe("pk_test_51OPQjAGO6oEBAyYIm8rYkFgpuVRhVDSY4NV63KX5uJnYTVnafVDAUhcFxDx4EnuES4P2YyyUGo0M7RmDYUB9jqLf00z0ja0Wrp");

initialize();

async function initialize() {
  const getCustomerEmail = () => {
    if (localStorage.getItem('dplrid')) {
        const encodedEmailHex = localStorage.getItem('dplrid');
        const decodedEmail = hexToString(encodedEmailHex);
        return decodedEmail;
    } else {
        return null;
    }
  };
  
  const customerEmail = getCustomerEmail();
  const response = await fetch("/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ customerEmail: customerEmail })
  });

  const { clientSecret } = await response.json();

  const checkout = await stripe.initEmbeddedCheckout({
    clientSecret,
  });

  // Mount Checkout
  checkout.mount('#checkout');
}

// Función para convertir hexadecimal a string ASCII
function hexToString(hex) {
    let string = '';
    for (let i = 0; i < hex.length; i += 2) {
        string += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return string;
}

