-- Drop existing trigger and function
DROP TRIGGER IF EXISTS create_feedback_notification_trigger ON agent_feedback;
DROP FUNCTION IF EXISTS create_feedback_notification();

-- Create updated function that only creates notifications for authenticated feedback
CREATE OR REPLACE FUNCTION create_feedback_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification if user_id is not null
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO activity_notifications (user_id, agent_id, type)
    VALUES (NEW.user_id, NEW.agent_id, 'feedback');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER create_feedback_notification_trigger
  AFTER INSERT ON agent_feedback
  FOR EACH ROW
  EXECUTE FUNCTION create_feedback_notification(); 