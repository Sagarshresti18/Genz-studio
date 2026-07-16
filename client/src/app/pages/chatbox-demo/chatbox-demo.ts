import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClaudeChatInput } from '../../shared/components/ui/claude-chat-input/claude-chat-input';

@Component({
  selector: 'app-chatbox-demo',
  standalone: true,
  imports: [CommonModule, ClaudeChatInput],
  templateUrl: './chatbox-demo.html',
  styleUrls: []
})
export class ChatboxDemo {
  messages: string[] = [];
  userName = 'Saify';

  get greeting(): string {
    const currentHour = new Date().getHours();
    if (currentHour >= 12 && currentHour < 18) {
      return 'Good afternoon';
    } else if (currentHour >= 18) {
      return 'Good evening';
    }
    return 'Good morning';
  }

  handleSendMessage(data: any) {
    console.log('Sending message:', data.message);
    console.log('Attached files:', data.files);
    console.log('Pasted content:', data.pastedContent);
    console.log('Model:', data.model);
    console.log('Thinking enabled:', data.isThinkingEnabled);
    this.messages.push(data.message);
  }
}
