## [Unreleased]

### Fixed
- Fixed anonymous feedback submission by updating the feedback notification trigger to only create notifications for authenticated users
  - Previously, the system would fail when anonymous users tried to submit feedback due to a not-null constraint in the activity_notifications table
  - The trigger now checks for user_id before creating a notification 