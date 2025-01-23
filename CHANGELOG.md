# Changelog

## [Unreleased]

### Fixed
- Fixed AI message persistence in chat conversations
  - AI responses now properly save for authenticated users
  - Added comprehensive message flow logging
  - Improved error handling for message saves
  - Fixed callback passing between hooks
- Fixed theme system issues
  - Resolved infinite recursion in user_preferences RLS policy
  - Fixed theme context maintenance in protected routes
  - Improved theme persistence reliability
  - Enhanced error handling for theme changes
- Fixed time detection in webhook responses
  - Properly passing booking time to GHL
  - Fixed timezone conversion issues
  - Improved time format consistency
  - Enhanced error handling for time detection
- Improved GHL contact updates
  - Fixed contact creation/update logic
  - Enhanced custom field handling
  - Improved error reporting
  - Added proper validation checks

### Added
- Enhanced AI Moderation feature with three-tier system
  - Light Moderation for basic content filtering
  - Medium Moderation (Recommended) for balanced control
  - Compliance Moderation for strict enforcement
- Improved TimeZoneSelect component
  - Added search functionality for timezone lookup
  - Included all IANA timezone regions
  - Enhanced UI with region-based organization
  - Added keyboard accessibility
- Enhanced moderation parsing logic
  - Improved handling of compliance moderation scores
  - Added robust parsing for both sentiment and compliance scores
  - Fixed sentiment score extraction in compliance mode
  - Implemented fallback score handling for better reliability
- Database connection pooling with 10 concurrent connections
- LRU caching for webhooks and preferences with 5-minute TTL
- Request rate limiting (1,000 requests per minute)
- Request timeout handling (30-second timeout)
- Maximum polling attempts for OpenAI operations (20 attempts)
- Implemented GHL webhook response system
  - Added contact update functionality with GHL API
  - Integrated time detection with booking time updates
  - Added custom field synchronization
  - Implemented comprehensive error handling
- Enhanced time detection system
  - Added timezone-aware time parsing
  - Implemented GPT-4o time analysis
  - Added support for multiple time formats
  - Integrated with GHL booking system
- Improved webhook processing
  - Added payload validation
  - Implemented contact detail extraction
  - Added GHL API integration
  - Enhanced error handling and logging

### Changed
- Updated ModerationLevelSelect component
  - Redesigned slider interface for better usability
  - Improved visual feedback and transitions
  - Fixed container overflow issues
  - Added stacked label layout for better space utilization
  - Prevented accidental form submissions during slider interaction
- Modified timezone selection behavior
  - Improved search and filter functionality
  - Enhanced dropdown UI for better readability
  - Added clear visual hierarchy for selected timezone
- Updated webhook response format
  - Added booking_time field
  - Enhanced status reporting
  - Improved error explanations
  - Added comprehensive logging
- Modified GHL integration
  - Updated API endpoint handling
  - Enhanced contact field mapping
  - Improved response processing
  - Added retry mechanisms

### Fixed
- Resolved container overflow issues with Compliance Moderation label
- Fixed form submission triggers from slider interaction
- Corrected layout spacing in moderation level display
- Improved mobile responsiveness of slider component
- Enhanced accessibility of interactive elements
- Fixed sentiment score parsing in compliance moderation mode
- Resolved score validation issues in moderation system
- Database connection leaks with proper release mechanism
- Long-running requests blocking the connection pool
- Race conditions in webhook processing
- OpenAI API timeout issues

### Technical Updates
- Refactored ModerationLevelSelect component for better maintainability
- Improved TypeScript type definitions for moderation levels
- Enhanced component reusability and prop interfaces
- Updated styling to use Tailwind CSS best practices

### Development Notes
- Default moderation level set to 'medium'
- Added comprehensive documentation for AI features
- Improved component test coverage
- Enhanced development environment setup instructions

## [Previous Versions]

### Added

#### Welcome Page Redesign (January 2024)
- **Feature**: Sales-focused welcome page layout
- **Changes**:
  - Added 2x2 feature grid with modern icons
  - Updated content for sales and lead generation
  - Added welcome page toggle in share modal
  - Improved visual hierarchy and spacing

#### Chat UI Enhancements (January 2024)
- **Feature**: Enhanced chat message display and interactions
- **Changes**:
  - Added clickable URLs in chat messages
  - Implemented confetti animation for completed conversations
  - Added mobile-responsive progress indicators
  - Enhanced visual feedback for conversation stages
  - Improved message bubble animations

#### Webhook System Implementation (January 2024)
- **Feature**: Basic webhook system for receiving external requests
- **Changes**:
  - Added webhook creation endpoint
  - Implemented webhook storage in Supabase
  - Added webhook processing endpoint
  - Implemented webhook activation toggle
  - Added webhook history tracking
- **Technical Details**:
  - Unique webhook URL generation using crypto
  - Proper error handling and logging
  - Row Level Security policies for webhook access
  - Last request tracking in database

### Fixed

#### Public Share Link Issues (January 2024)
- **Issue**: OpenAI API key not found error when accessing shared agent URLs
- **Root Cause**: Incorrect RLS policies preventing anonymous users from accessing the agent owner's API key
- **Solution**: 
  - Implemented comprehensive API key access policies
  - Added proper share token handling
  - Fixed type casting for share token comparison
  - Added expiration checks for shared URLs

#### Conversation Saving in Shared URLs (January 2024)
- **Issue**: Conversations not saving when using public share links
- **Root Cause**: Missing RLS policies for anonymous users to create and view conversations
- **Solution**:
  - Added policies for anonymous users to create conversations
  - Implemented message creation policies for shared URLs
  - Added proper conversation ownership checks
  - Fixed message persistence for anonymous users

#### Chat Performance Optimization (January 2024)
- **Issue**: Slow response times (15+ seconds) and excessive API calls
- **Root Cause**: Inefficient polling and redundant API calls
- **Solution**:
  - Implemented API key caching to reduce database queries
  - Added parallel polling for status and messages
  - Reduced polling interval to 300ms
  - Added streaming-like updates with placeholder messages
  - Improved message deduplication

#### Chat Message Handling (January 2024)
- **Issue**: Duplicate messages and inconsistent updates
- **Root Cause**: Race conditions in message state management and polling
- **Solution**:
  - Added run ID tracking for message consistency
  - Implemented atomic message state updates
  - Improved message filtering and deduplication
  - Enhanced error handling for failed messages
  - Added immediate UI updates for better responsiveness
  - Optimized polling intervals to 300ms
  - Added proper cleanup for incomplete message states

#### OpenAI Gateway Error Handling (January 2024)
- **Issue**: Chat conversations failing after few messages due to OpenAI 502 Bad Gateway errors
- **Root Cause**: Temporary OpenAI API infrastructure issues causing gateway timeouts
- **Solution**:
  - Implemented retry mechanism with exponential backoff
  - Added specific handling for 502 errors
  - Increased resilience of API calls with up to 3 retries
  - Added logging for retry attempts

#### Webhook Authentication Issues (January 2024)
- **Issue**: Webhooks failing due to authentication requirements
- **Root Cause**: Supabase RLS policies requiring authentication for webhook access
- **Solution**: 
  - Configured Supabase client to bypass authentication for webhooks
  - Implemented proper webhook lookup by both URL and ID
  - Added comprehensive error logging
  - Improved webhook response handling

### Security Improvements

#### API Key Protection (January 2024)
- Implemented proper RLS policies for API key access
- Added secure share token validation
- Implemented expiration checks for shared URLs
- Added comprehensive CRUD policies for authenticated users

#### Database Security (January 2024)
- Added proper table relationships in policies
- Implemented type casting for secure comparisons
- Added active status checks for shared URLs
- Improved error handling and validation

### Technical Debt

#### Policy Cleanup (January 2024)
- Consolidated duplicate policies
- Removed redundant checks
- Added proper indexing for performance
- Improved policy naming and organization

## Future Plans

### Planned Features
- GHL Webhook Integration
  - Generate unique webhook URLs for users
  - Process GHL messages through OpenAI
  - Send responses back to GHL
  - Handle long-running tasks
- Webhook System Enhancements
  - Add payload validation
  - Implement custom headers support
  - Add webhook retry mechanism
  - Add rate limiting per webhook
  - Implement webhook secrets for security
  - Add webhook event types
  - Add webhook payload templates

### Infrastructure
- Consider migration to Railway.app for:
  - Better webhook support
  - Longer running processes
  - Improved error handling
  - Background job processing
- Railway.app Migration Considerations
  - Configure proper environment variables
  - Set up webhook rate limiting
  - Implement proper logging system
  - Configure proper SSL certificates
  - Set up monitoring for webhook health
  - Implement proper error tracking
  - Configure proper database backups

## [0.1.0] - 2024-03-27
### Added
- Initial release
- Express server setup
- Production middleware
- Health check endpoint
- Rate limiting
- Static file serving
- Error handling 