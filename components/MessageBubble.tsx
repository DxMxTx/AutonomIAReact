import React from 'react';
import { ChatMessage } from '../types';
import { BotIcon } from './IconComponents';

interface MessageBubbleProps {
    message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isAI = message.sender === 'ai';

    const bubbleClasses = isAI
        ? 'bg-gris-tecnologico text-grafito'
        : 'bg-purpura-innovador text-white';

    const containerClasses = isAI ? 'justify-start' : 'justify-end';

    return (
        <div className={`flex items-end gap-2 ${containerClasses}`}>
            {isAI && (
                 <div className="flex-shrink-0 w-8 h-8 rounded-full bg-lavanda-digital flex items-center justify-center">
                    <BotIcon className="w-5 h-5 text-purpura-innovador" />
                </div>
            )}
            <div
                className={`max-w-xl rounded-lg px-4 py-3 shadow-md ${bubbleClasses}`}
                style={{ whiteSpace: 'pre-wrap' }}
            >
                <p>{message.text}</p>
            </div>
        </div>
    );
};

export default MessageBubble;