/**
 * Chatbot Widget Loader
 * Embeds a floating chatbot widget on any website
 * 
 * Usage:
 * <script src="https://your-domain.com/widget/chatbot-widget.js"></script>
 * <script>
 *   ChatbotWidget.init({
 *     apiKey: 'cb_live_xxxxxxxxxxxx',
 *     chatbotId: 'uuid-here',
 *     position: 'bottom-right', // or 'bottom-left'
 *     primaryColor: '#6366f1',
 *     theme: 'light' // or 'dark'
 *   });
 * </script>
 */

(function () {
    'use strict';

    if (window.ChatbotWidget) {
        return;
    }

    const ChatbotWidget = {
        config: null,
        isOpen: false,
        iframe: null,
        button: null,
        container: null,

        /**
         * Initialize the widget
         * @param {Object} config - Configuration options
         */
        init: function (config) {
            if (!config.apiKey || !config.chatbotId) {
                console.error('[ChatbotWidget] apiKey and chatbotId are required');
                return;
            }

            this.config = {
                apiKey: config.apiKey,
                chatbotId: config.chatbotId,
                position: config.position || 'bottom-right',
                primaryColor: config.primaryColor || '#6366f1',
                theme: config.theme || 'light',
                title: config.title || 'Chat with us',
                subtitle: config.subtitle || "We're here to help!",
                baseUrl: config.baseUrl || null,
            };



            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.render());
            } else {
                this.render();
            }
        },

        /**
         * Render the widget on the page
         */
        render: function () {
            this.container = document.createElement('div');
            this.container.id = 'chatbot-widget-container';
            this.container.style.cssText = `
        position: fixed;
        ${this.config.position === 'bottom-left' ? 'left' : 'right'}: 20px;
        bottom: 20px;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;

            this.button = document.createElement('button');
            this.button.id = 'chatbot-widget-button';
            this.button.innerHTML = `
        <svg class="chatbot-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <svg class="close-icon" style="display: none;" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
            this.button.style.cssText = `
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: ${this.config.primaryColor};
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        transition: transform 0.2s, box-shadow 0.2s;
      `;

            this.button.addEventListener('click', () => this.toggle());
            this.button.addEventListener('mouseenter', () => {
                this.button.style.transform = 'scale(1.05)';
                this.button.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
            });
            this.button.addEventListener('mouseleave', () => {
                this.button.style.transform = 'scale(1)';
                this.button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            });

            this.iframe = document.createElement('iframe');
            this.iframe.id = 'chatbot-widget-iframe';

            const baseUrl = this.config.baseUrl ||
                (window.location.protocol === 'file:' ? 'http://localhost:3000' : window.location.origin);

            const widgetUrl = new URL('/widget/' + this.config.chatbotId, baseUrl);
            widgetUrl.searchParams.set('apiKey', this.config.apiKey);
            widgetUrl.searchParams.set('theme', this.config.theme);
            widgetUrl.searchParams.set('primaryColor', this.config.primaryColor);
            widgetUrl.searchParams.set('title', this.config.title);
            widgetUrl.searchParams.set('subtitle', this.config.subtitle);

            this.iframe.src = widgetUrl.toString();
            this.iframe.style.cssText = `
        width: 380px;
        height: 600px;
        max-width: calc(100vw - 40px);
        max-height: calc(100vh - 100px);
        border: none;
        border-radius: 12px;
        box-shadow: 0 8px 28px rgba(0, 0, 0, 0.2);
        position: absolute;
        bottom: 80px;
        ${this.config.position === 'bottom-left' ? 'left' : 'right'}: 0;
        transform: scale(0.8);
        opacity: 0;
        pointer-events: none;
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s;
      `;

            this.container.appendChild(this.button);
            this.container.appendChild(this.iframe);
            document.body.appendChild(this.container);
        },

        toggle: function () {
            this.isOpen = !this.isOpen;

            const chatIcon = this.button.querySelector('.chatbot-icon');
            const closeIcon = this.button.querySelector('.close-icon');

            if (this.isOpen) {
                // Open
                this.iframe.style.transform = 'scale(1)';
                this.iframe.style.opacity = '1';
                this.iframe.style.pointerEvents = 'auto';
                chatIcon.style.display = 'none';
                closeIcon.style.display = 'block';
            } else {
                // Close
                this.iframe.style.transform = 'scale(0.8)';
                this.iframe.style.opacity = '0';
                this.iframe.style.pointerEvents = 'none';
                chatIcon.style.display = 'block';
                closeIcon.style.display = 'none';
            }
        },

        open: function () {
            if (!this.isOpen) {
                this.toggle();
            }
        },

        close: function () {
            if (this.isOpen) {
                this.toggle();
            }
        }
    };

    window.ChatbotWidget = ChatbotWidget;
})();
