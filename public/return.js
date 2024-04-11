initialize();

async function initialize() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const sessionId = urlParams.get('session_id');
  const response = await fetch(`/session-status?session_id=${sessionId}`);
  const session = await response.json();

  if (session.status == 'open') {
    window.replace('http://localhost:4242/checkout.html')
  } else if (session.status == 'complete') {
    document.getElementById('customerName').innerHTML = session.customer_details.customer_name;
    document.getElementById('date').innerHTML = session.customer_details.date;
    document.getElementById('amount').innerHTML = `${session.customer_details.currency} ${session.customer_details.final_price}`;
    document.getElementById('ticketName').innerHTML = session.customer_details.ticket_name;
    document.getElementById('success').classList.remove('hidden');
  } else if (session.status == 'error') {
    document.getElementById('error').classList.remove('hidden');
  }
}