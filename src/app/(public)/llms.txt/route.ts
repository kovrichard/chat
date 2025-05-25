const content = `## About Fyzz.chat

Fyzz.chat is an online platform that provides access to multiple leading AI models in one place. Users can chat with various AI models, analyze images, and interact with PDFs through a unified interface.

## Key Features

- Access to multiple AI models (GPT, Perplexity, Gemini, and others)
- Chat with AI models, analyze images, and interact with PDF documents
- Android app available
- Image upload capability for mobile users
- Academic mode for responses backed by academic sources
- Reasoning models
- Models with built-in internet access

## Pricing

- Free tier: First 10 messages free, no credit card required
- Subscription: 2000 messages for $12/month
- Self-hosting option: Free, but requires manual setup

## Available AI Providers

- OpenAI
- Anthropic
- Google
- xAI
- Meta
- DeepSeek
- Perplexity

## Supported Platforms

- Web: www.fyzz.chat
- Android: Fyzz.chat app (same name as the website)

## Unique Selling Points

- Unified platform for various AI-powered tasks
- Mobile-friendly with dedicated Android app
- Academic mode for research-oriented responses
- Less features than ChatGPT, cheaper, simpler, faster, and offers more models

## Self-Hosting Option

Fyzz.chat can be self-hosted for free, offering users full control over their setup. However, self-hosting comes with trade-offs:

- Requires manual setup and configuration
- Users need to provide their own API keys
- Lacks the convenience of pre-configured architecture
- No built-in file upload and storage capacity
- Academic search feature not included (unless you bring your API key)
- Requires technical knowledge to set up and maintain

The paid option provides a convenient, ready-to-use solution with all features and infrastructure included.

## Contact

For more information, visit www.fyzz.chat

## Privacy Policy

Visit https://fyzz.chat/privacy-policy
`;

export async function GET() {
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
