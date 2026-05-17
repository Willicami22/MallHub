import { serverEnv } from '@/features/.server/env/server-env.lib';

type TextPart = { type: 'text'; text: string };
type ImagePart = {
	type: 'image_url';
	image_url: { url: string; detail?: 'low' | 'high' | 'auto' };
};

type ChatMessage = {
	role: 'system' | 'user' | 'assistant';
	content: string | Array<TextPart | ImagePart>;
};

type ChatOptions = {
	messages: ChatMessage[];
	model?: string;
	temperature?: number;
	max_tokens?: number;
	response_format?: { type: 'json_object' | 'text' };
};

export async function chatCompletion(options: ChatOptions): Promise<string> {
	const apiKey = serverEnv.OPENAI_API_KEY;
	if (!apiKey) {
		throw new Error(
			'OPENAI_API_KEY is not configured. Add it to your .env file and restart the server.',
		);
	}

	const {
		messages,
		model = 'gpt-4o-mini',
		temperature = 0.3,
		max_tokens,
		response_format,
	} = options;

	const body: Record<string, unknown> = { model, messages, temperature };
	if (max_tokens) body.max_tokens = max_tokens;
	if (response_format) body.response_format = response_format;

	const res = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify(body),
	});

	if (!res.ok) {
		const errorText = await res.text();
		throw new Error(`OpenAI API error ${res.status}: ${errorText}`);
	}

	const data = (await res.json()) as {
		choices: Array<{ message: { content: string } }>;
	};

	return data.choices[0]?.message?.content ?? '';
}
