// व्हाट्सएप्प मैसेज टेम्पलेट
function sendWhatsApp(location, problem) {
    const phone = "919559401761";
    const message = `नमस्ते! मुझे सहायता चाहिए:
📍 लोकेशन: ${location}
⚠️ प्रॉब्लम: ${problem}
📞 कॉलबैक नंबर: 919559401761`;
    
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}
