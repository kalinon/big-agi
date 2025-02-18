import { DLLMId } from '~/modules/llms/store-llms';
import { SystemPurposeId, SystemPurposes } from '../../../data';

import { createDMessage, DMessage, useChatStore } from '~/common/state/store-chats';


export function createAssistantTypingMessage(conversationId: string, assistantLlmLabel: DLLMId | 'prodia' | 'react-...', assistantPurposeId: SystemPurposeId | undefined, text: string): string {
  const assistantMessage: DMessage = createDMessage('assistant', text);
  assistantMessage.typing = true;
  assistantMessage.purposeId = assistantPurposeId;
  assistantMessage.originLLM = assistantLlmLabel;
  useChatStore.getState().appendMessage(conversationId, assistantMessage);
  return assistantMessage.id;
}


export function updatePurposeInHistory(conversationId: string, history: DMessage[], purposeId: SystemPurposeId): DMessage[] {
  const systemMessageIndex = history.findIndex(m => m.role === 'system');
  const systemMessage: DMessage = systemMessageIndex >= 0 ? history.splice(systemMessageIndex, 1)[0] : createDMessage('system', '');
  if (!systemMessage.updated && purposeId && SystemPurposes[purposeId]?.systemMessage) {
    systemMessage.purposeId = purposeId;
    systemMessage.text = SystemPurposes[purposeId].systemMessage
      .replaceAll('{{Today}}', new Date().toISOString().split('T')[0]);

    // HACK: this is a special case for the "Custom" persona, to set the message in stone (so it doesn't get updated when switching to another persona)
    if (purposeId === 'Custom')
      systemMessage.updated = Date.now();
  }
  history.unshift(systemMessage);
  useChatStore.getState().setMessages(conversationId, history);
  return history;
}