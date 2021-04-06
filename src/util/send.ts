import { Message, MessageEmbed, User } from 'discord.js';
import { LimitedSizeMap } from './limitedSizeMap';

const messageToUserId = new LimitedSizeMap<
	string,
	{ owner: string; onDelete?: () => void }
>(1000);

export const DELETE_EMOJI = '🗑️';

export async function sendWithMessageOwnership(
	message: Message,
	toSend: string | { embed: MessageEmbed },
	onDelete?: () => void,
) {
	const sent = await message.channel.send(toSend);
	await addMessageOwnership(sent, message.author, onDelete);
}

export async function addMessageOwnership(
	message: Message,
	user: User,
	onDelete?: () => void,
) {
	await message.react(DELETE_EMOJI);

	messageToUserId.set(message.id, { owner: user.id, onDelete });
}

export function ownsBotMessage(message: Message, userId: string) {
	return messageToUserId.get(message.id)?.owner === userId;
}

export function clearMessageOwnership(message: Message) {
	messageToUserId.get(message.id)?.onDelete?.();
	messageToUserId.delete(message.id);
}
