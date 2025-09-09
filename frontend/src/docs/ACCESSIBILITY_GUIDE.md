# Accessibility Guide

This document outlines the comprehensive accessibility features implemented across all Netflix-style components in the learning platform.

## Overview

Our platform follows WCAG 2.1 AA guidelines and implements modern accessibility best practices to ensure an inclusive experience for all users, including those using assistive technologies.

## Global Accessibility Features

### Design Tokens & Color Contrast
- **High Contrast Ratios**: All text meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- **Color Independence**: Information is never conveyed through color alone
- **Focus Indicators**: Clear, high-contrast focus rings on all interactive elements
- **Dark Theme Optimized**: Reduced eye strain with carefully chosen color palette

### Typography
- **Readable Font Sizes**: Minimum 16px for body text
- **Line Height**: 1.5 for optimal readability
- **Font Weight**: Appropriate contrast between headings and body text
- **Responsive Typography**: Scales appropriately across devices

## Component-Specific Accessibility

### HeroCarousel Component

#### Keyboard Navigation
- **Tab Navigation**: All controls are keyboard accessible
- **Arrow Keys**: Navigate between slides using left/right arrow keys
- **Enter/Space**: Activate buttons and links
- **Escape**: Pause auto-play when focused

#### Screen Reader Support
- **ARIA Labels**: Descriptive labels for all controls
- **Live Regions**: Announces slide changes to screen readers
- **Role Attributes**: Proper carousel and slide roles
- **Hidden Content**: Off-screen slides are hidden from screen readers

#### Motor Accessibility
- **Large Click Targets**: Minimum 44px touch targets
- **Auto-play Controls**: Easy pause/play functionality
- **Reduced Motion**: Respects `prefers-reduced-motion` setting

```tsx
// Example ARIA implementation
<div
  role="region"
  aria-label="Featured courses carousel"
  aria-live="polite"
>
  <button
    aria-label={`Go to slide ${index + 1} of ${slides.length}`}
    aria-current={isActive ? 'true' : 'false'}
  >
    {/* Slide content */}
  </button>
</div>
```

### PosterCard Component

#### Interactive States
- **Focus Management**: Clear focus indicators
- **Hover Alternatives**: All hover effects have keyboard equivalents
- **Touch Targets**: Minimum 44px for mobile devices

#### Content Accessibility
- **Alt Text**: Descriptive alternative text for all images
- **Semantic HTML**: Proper heading hierarchy and structure
- **Link Purpose**: Clear indication of link destinations

```tsx
// Example implementation
<article className="poster-card" role="article">
  <img
    src={course.thumbnail}
    alt={`${course.title} course thumbnail`}
    loading="lazy"
  />
  <h3 className="text-lg font-semibold">{course.title}</h3>
  <p className="sr-only">
    Course duration: {course.duration}, 
    Difficulty: {course.difficulty}
  </p>
</article>
```

### ModalTrailer Component

#### Focus Management
- **Focus Trapping**: Focus stays within modal when open
- **Return Focus**: Focus returns to trigger element when closed
- **Initial Focus**: Focuses on close button or primary action

#### Keyboard Navigation
- **Escape Key**: Closes modal
- **Tab Navigation**: Cycles through modal controls
- **Enter/Space**: Activates video controls

#### Screen Reader Support
- **Modal Announcements**: Screen readers announce modal opening/closing
- **Video Descriptions**: Audio descriptions for video content
- **Control Labels**: Clear labels for all video controls

```tsx
// Example modal accessibility
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <button
    ref={closeButtonRef}
    onClick={onClose}
    aria-label="Close video preview"
  >
    <XMarkIcon className="w-6 h-6" />
  </button>
  {/* Modal content */}
</div>
```

### Homepage Layout

#### Navigation
- **Skip Links**: Skip to main content functionality
- **Landmark Roles**: Clear page structure with landmarks
- **Breadcrumbs**: Clear navigation hierarchy

#### Content Structure
- **Heading Hierarchy**: Logical H1-H6 structure
- **Section Labels**: Clear section identification
- **Content Grouping**: Related content properly grouped

### LessonDetailView Component

#### Video Player Accessibility
- **Keyboard Controls**: Full keyboard control of video playback
- **Captions**: Support for closed captions
- **Audio Descriptions**: Support for audio descriptions
- **Transcript**: Full text transcript available

#### Keyboard Shortcuts
- **Space**: Play/pause video
- **Arrow Keys**: Seek forward/backward, volume control
- **M**: Mute/unmute
- **F**: Fullscreen toggle
- **C**: Toggle captions
- **T**: Toggle transcript
- **N**: Toggle notes

#### Content Navigation
- **Chapter Navigation**: Clear chapter and lesson structure
- **Progress Indicators**: Visual and programmatic progress tracking
- **Bookmark Management**: Accessible bookmark controls

```tsx
// Example video accessibility
<video
  ref={videoRef}
  aria-label={`${currentLesson.title} video lesson`}
  aria-describedby="video-description"
>
  <track
    kind="captions"
    src={currentLesson.captionsUrl}
    srcLang="en"
    label="English captions"
    default
  />
  <track
    kind="descriptions"
    src={currentLesson.descriptionsUrl}
    srcLang="en"
    label="Audio descriptions"
  />
</video>
```

## Responsive Accessibility

### Mobile Considerations
- **Touch Targets**: Minimum 44px for all interactive elements
- **Gesture Alternatives**: All gestures have button alternatives
- **Orientation Support**: Works in both portrait and landscape
- **Zoom Support**: Content remains usable at 200% zoom

### Screen Size Adaptations
- **Flexible Layouts**: Content reflows appropriately
- **Priority Content**: Most important content visible first
- **Navigation Adaptation**: Mobile-friendly navigation patterns

## Testing & Validation

### Automated Testing
- **axe-core**: Integrated accessibility testing
- **Lighthouse**: Regular accessibility audits
- **ESLint**: jsx-a11y plugin for code-level checks

### Manual Testing
- **Keyboard Navigation**: Full keyboard testing
- **Screen Reader Testing**: NVDA, JAWS, VoiceOver testing
- **Color Contrast**: Manual contrast verification
- **Zoom Testing**: 200% zoom functionality testing

### User Testing
- **Assistive Technology Users**: Regular testing with real users
- **Cognitive Load Testing**: Simplified interface validation
- **Motor Accessibility Testing**: Alternative input method testing

## Implementation Checklist

### ✅ Completed Features
- [x] WCAG 2.1 AA color contrast ratios
- [x] Keyboard navigation for all components
- [x] Screen reader support with ARIA labels
- [x] Focus management and indicators
- [x] Semantic HTML structure
- [x] Alternative text for images
- [x] Video accessibility controls
- [x] Responsive touch targets
- [x] Reduced motion support
- [x] High contrast mode compatibility

### 🔄 In Progress
- [ ] Comprehensive screen reader testing
- [ ] User testing with assistive technology users
- [ ] Performance optimization for assistive technologies

### 📋 Future Enhancements
- [ ] Voice control integration
- [ ] Eye-tracking support
- [ ] Advanced cognitive accessibility features
- [ ] Multi-language accessibility support

## Resources & References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Accessibility Guidelines](https://webaim.org/)
- [MDN Accessibility Documentation](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## Support & Feedback

For accessibility-related issues or suggestions, please:
1. Check this guide for existing solutions
2. Test with multiple assistive technologies
3. Provide detailed reproduction steps
4. Include information about assistive technology used

Our commitment is to maintain and improve accessibility standards continuously, ensuring an inclusive learning experience for all users.