## Feedback System

### Overview
The feedback system allows both authenticated and anonymous users to submit feedback for agents. Feedback includes a rating (1-5) and optional comment.

### Anonymous Feedback
- Anonymous users can submit feedback through shared agent URLs
- No authentication required
- Feedback is tracked using the share token
- No notifications are created for anonymous feedback

### Authenticated Feedback
- Authenticated users can submit feedback for agents they have access to
- Feedback is linked to their user account
- Activity notifications are created for the agent owner

### Database Structure
```sql
-- agent_feedback table
CREATE TABLE agent_feedback (
  id uuid PRIMARY KEY,
  agent_id uuid NOT NULL,
  user_id uuid,  -- nullable for anonymous feedback
  rating integer NOT NULL,
  comment text,
  share_token text,  -- for tracking anonymous feedback
  created_at timestamptz,
  updated_at timestamptz
);
```

### Notification System
- Activity notifications are created only for authenticated feedback
- The notification trigger checks for user_id before creating a notification
- This prevents errors when anonymous users submit feedback
- Agent owners receive notifications for authenticated feedback only

### Security
- RLS policies ensure proper access control
- Anonymous users can only submit feedback through valid share tokens
- Share tokens are validated against active shared agent URLs 