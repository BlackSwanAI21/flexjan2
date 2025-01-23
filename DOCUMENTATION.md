# FlexAIJan Documentation

## Features

### Theme System
The application includes a comprehensive theme system with:

- **Predefined Themes**
  - Default (Indigo accents)
  - Dark Mode
  - Ocean (Blue tones)
  - Forest (Green palette)
  - Custom (User-defined colors)

- **Theme Components**
  - `CustomThemeForm`: Allows customization of 8 key colors
  - `ThemePreview`: Live preview of theme changes
  - `ColorInput`: Color picker with hex/RGB support

- **Theme Storage**
  - Stored in Supabase `user_preferences` table
  - Includes theme name, custom colors, and logo URL
  - Protected by Row Level Security policies

### Chat System

- **Conversation Types**
  - Authenticated User Chats (Dashboard)
  - Public Share Link Chats
  - Anonymous Sessions

- **Message Persistence**
  - Real-time UI updates
  - Background database saves
  - Retry mechanism for failed saves
  - Proper error handling

- **Security**
  - Row Level Security for conversations
  - Share token validation
  - API key protection
  - Proper user isolation

## Technical Details

### Theme Implementation

```typescript
// Theme Context Usage
const { theme, setTheme, customColors } = useTheme();

// Theme Classes
.theme-default
.theme-dark
.theme-ocean
.theme-forest
.theme-custom

// CSS Variables
--primary
--primary-hover
--secondary
--background
--card-background
--text-primary
--text-secondary
--border-color
```

### Chat Implementation

```typescript
// Chat Hooks
function useChat(assistantId: string, saveMessageToDb?: (message: Message) => Promise<void>)
function useConversation(agentId: string)

// Message Flow
User Message -> UI Update -> API Call -> Database Save
AI Response -> API Response -> UI Update -> Database Save

// Database Schema
conversations {
  id: uuid
  agent_id: uuid
  user_id: uuid?
  session_id: text
  shared_token: text?
}

conversation_messages {
  id: uuid
  conversation_id: uuid
  role: text
  content: text
  created_at: timestamp
}
```

## Recent Fixes

### Theme System Fixes

1. **Infinite Recursion in RLS Policy**
   - Issue: Theme changes failed with 500 error
   - Fix: Simplified RLS policies and removed recursive checks
   - Impact: Stable theme persistence for all users

2. **Theme Context in Protected Routes**
   - Issue: Context lost between route changes
   - Fix: Restructured route handling and context hierarchy
   - Impact: Consistent theme application across the app

### Chat System Fixes

1. **AI Message Persistence**
   - Issue: AI responses not saving for authenticated users
   - Fix: Properly passed saveMessageToDb callback
   - Impact: Complete conversation history for all users

2. **Message Flow Logging**
   - Added comprehensive logging
   - Track message lifecycle
   - Monitor save operations
   - Debug persistence issues

## Best Practices

### Theme System
1. Always wrap protected routes with ThemeProvider
2. Use CSS variables for theme colors
3. Test theme changes across all components
4. Handle theme loading states

### Chat System
1. Save messages immediately after generation
2. Handle save failures gracefully
3. Maintain UI consistency during saves
4. Log all critical operations

## Configuration

### Theme System
```typescript
// Default theme configuration
const defaultTheme = {
  primary: '#6366F1',
  'primary-hover': '#4F46E5',
  secondary: '#9CA3AF',
  background: '#FFFFFF',
  'card-background': '#F3F4F6',
  'text-primary': '#111827',
  'text-secondary': '#4B5563',
  border: '#E5E7EB'
};
```

### Chat System
```typescript
// Chat configuration
const POLL_INTERVAL = 300; // ms
const MAX_POLL_ATTEMPTS = 100;
const RETRY_ATTEMPTS = 3;
```

### GHL Webhook System

- **Webhook Processing**
  - Receives incoming webhooks from Go High Level
  - Processes messages through OpenAI Assistant
  - Performs time detection and moderation
  - Updates GHL contacts with responses

- **Time Detection**
  - Analyzes messages for time references
  - Supports multiple time formats
  - Timezone-aware processing
  - Returns ISO8601 formatted times

```typescript
// Time Detection Usage
interface TimeDetectionResult {
  phoneNumber: string | null;
  timezone: string;
  detectedTime?: string;
}

// GHL Contact Update Format
interface GHLContactUpdate {
  email?: string;
  phone?: string;
  customField: {
    chat_gpt: string;
    thread_id: string;
    ai_moderation_reason?: string;
    call_back_time?: string;
  }
}

// Webhook Response Format
interface WebhookResponse {
  success: boolean;
  message: string;
  thread_id?: string;
  status: 'processed' | 'blocked' | 'failed' | /* other statuses */;
  explanation?: string;
  booking_time?: string;
}
```

### GHL Integration

- **Contact Updates**
  - Automatic contact creation/update in GHL
  - Custom field synchronization
  - Booking time updates
  - Thread tracking
  - Moderation status updates

- **Security**
  - API key validation
  - Rate limiting (1,000 requests/minute)
  - Request timeout handling (30 seconds)
  - Error handling and logging

- **Best Practices**
  1. Always validate incoming webhook payloads
  2. Handle both email and phone number scenarios
  3. Properly format booking times
  4. Include comprehensive error logging
  5. Implement proper retry mechanisms