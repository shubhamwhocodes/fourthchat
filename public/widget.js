(function () {
    const script = document.currentScript;
    const botId = script.getAttribute('data-bot-id');

    if (!botId) {
        console.error('Chatbot Widget: data-bot-id attribute is missing.');
        return;
    }

    const container = document.createElement('div');
    container.id = 'chatbot-widget-container';
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';

    const button = document.createElement('button');
    button.innerText = 'Chat';
    button.style.padding = '10px 20px';
    button.style.backgroundColor = '#000';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';

    const chatWindow = document.createElement('div');
    chatWindow.style.display = 'none';
    chatWindow.style.width = '350px';
    chatWindow.style.height = '500px';
    chatWindow.style.backgroundColor = '#fff';
    chatWindow.style.border = '1px solid #ccc';
    chatWindow.style.marginBottom = '10px';
    chatWindow.style.borderRadius = '10px';
    chatWindow.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    chatWindow.innerHTML = '<div style="padding: 20px;">Chat Interface Placeholder</div>';

    // In a real implementation, this would be an iframe pointing to /embed/:botId
    // or a React component mounted here.

    button.onclick = () => {
        if (chatWindow.style.display === 'none') {
            chatWindow.style.display = 'block';
        } else {
            chatWindow.style.display = 'none';
        }
    };

    container.appendChild(chatWindow);
    container.appendChild(button);
    document.body.appendChild(container);
})();
