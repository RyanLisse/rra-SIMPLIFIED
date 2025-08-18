# React useEffect Optimization Guide

## Overview

This document analyzes our codebase's `useEffect` usage patterns and provides recommendations based on React's official guidance on [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect).

## Key Principles

### When NOT to Use useEffect

1. **Transforming data for rendering** - Calculate values directly during rendering
2. **Handling user events** - Use event handlers instead of effects  
3. **Updating state based on props/state** - Calculate during rendering or use component keys
4. **Caching calculations** - Use `useMemo` instead of effects
5. **Sharing logic between event handlers** - Extract to separate functions

### Performance Anti-Patterns

- Chaining effects that trigger each other
- Using effects for event-specific logic
- Synchronizing state across components
- Creating "cascading" state updates

## Current Codebase Analysis

### ✅ Legitimate Use Cases (Keep)

#### DOM Side Effects
```typescript
// components/chat.tsx:45
useEffect(() => {
  scrollToBottom();
}, [items]);

// components/gpt5-chat-enhanced.tsx:128
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);
```
**Analysis**: These are legitimate side effects for DOM manipulation that should run after render.

#### Event Listeners & API Integration
```typescript
// components/ai-elements/inline-citation.tsx:135
useEffect(() => {
  if (!api) return;
  // Set up carousel event listeners
}, [api]);
```
**Analysis**: Setting up/tearing down event listeners is a valid useEffect use case.

#### Duration Tracking
```typescript
// components/ai-elements/reasoning.tsx:67
useEffect(() => {
  if (isStreaming) {
    if (startTime === null) {
      setStartTime(Date.now());
    }
  } else if (startTime !== null) {
    setDuration(Math.round((Date.now() - startTime) / 1000));
    setStartTime(null);
  }
}, [isStreaming, startTime, setDuration]);
```
**Analysis**: Time tracking based on external state changes is appropriate.

### ⚠️ Potential Optimizations

#### State Synchronization Anti-Pattern
```typescript
// components/ai-elements/branch.tsx:91
useEffect(() => {
  if (branches.length !== childrenArray.length) {
    setBranches(childrenArray);
  }
}, [childrenArray, branches, setBranches]);
```

**Problem**: Synchronizing one state with another state.

**Better Approach**: Calculate derived state during rendering:
```typescript
// Instead of useEffect, calculate directly:
const branches = useMemo(() => childrenArray, [childrenArray]);
// Or if more complex logic needed:
const branches = useMemo(() => {
  return processChildrenArray(childrenArray);
}, [childrenArray]);
```

#### Conditional State Creation
```typescript
// components/gpt5-chat-enhanced.tsx:121
useEffect(() => {
  // Create initial session if none exists
  if (!currentSessionId && sessions.length === 0) {
    createSession('New Chat');
  }
}, [currentSessionId, sessions.length, createSession]);
```

**Problem**: Creating state based on other state conditions.

**Better Approach**: Initialize during component mount or use lazy initialization:
```typescript
// Option 1: Lazy initialization
const [sessions, setSessions] = useState(() => {
  const stored = localStorage.getItem('sessions');
  return stored ? JSON.parse(stored) : [createInitialSession()];
});

// Option 2: Initialize in parent component
// Pass initialized sessions as props
```

#### UI State Management
```typescript
// components/ai-elements/reasoning.tsx:79
useEffect(() => {
  if (isStreaming && !isOpen) {
    setIsOpen(true);
  } else if (!isStreaming && isOpen && !defaultOpen && !hasAutoClosedRef) {
    const timer = setTimeout(() => {
      setIsOpen(false);
    }, 2000);
    return () => clearTimeout(timer);
  }
}, [isStreaming, isOpen, defaultOpen]);
```

**Analysis**: This could potentially be optimized by moving logic to event handlers, but the current implementation is acceptable for complex UI state transitions.

## Recommended Improvements

### High Priority

1. **Fix Branch State Synchronization** (components/ai-elements/branch.tsx)
   ```typescript
   // Current (anti-pattern)
   useEffect(() => {
     if (branches.length !== childrenArray.length) {
       setBranches(childrenArray);
     }
   }, [childrenArray, branches, setBranches]);

   // Improved
   const branches = useMemo(() => childrenArray, [childrenArray]);
   ```

2. **Optimize Session Initialization** (components/gpt5-chat-enhanced.tsx)
   ```typescript
   // Current (anti-pattern)
   useEffect(() => {
     if (!currentSessionId && sessions.length === 0) {
       createSession('New Chat');
     }
   }, [currentSessionId, sessions.length, createSession]);

   // Improved: Initialize in parent or use lazy state
   const [sessions] = useState(() => initializeSessions());
   ```

### Medium Priority

3. **Consider Event Handler Optimization** for reasoning auto-open/close
   - Current implementation is functional but could be moved to event handlers if the logic becomes more complex

### Low Priority

4. **Add useMemo for Expensive Calculations**
   - Review components for expensive computations that could benefit from memoization
   - Look for repeated filtering, sorting, or transformation operations

## Implementation Plan

### Phase 1: Fix Anti-Patterns
- [ ] Refactor branch.tsx state synchronization
- [ ] Optimize session initialization pattern  
- [ ] Test all changes thoroughly

### Phase 2: Performance Optimization
- [ ] Add useMemo for expensive calculations
- [ ] Review and optimize re-render patterns
- [ ] Add React DevTools profiling

### Phase 3: Documentation & Standards
- [ ] Create team guidelines for useEffect usage
- [ ] Add ESLint rules for common anti-patterns
- [ ] Document approved patterns

## Best Practices Going Forward

1. **Before adding useEffect, ask:**
   - Is this transforming data for rendering? → Calculate during render
   - Is this handling a user event? → Use event handler
   - Is this synchronizing state? → Consider lifting state up
   - Is this an expensive calculation? → Use useMemo

2. **Valid useEffect use cases:**
   - Setting up/cleaning up subscriptions
   - Manually changing the DOM
   - Triggering animations
   - Fetching data on component mount
   - Logging or analytics

3. **Performance monitoring:**
   - Use React DevTools Profiler
   - Watch for cascading re-renders
   - Monitor component mount/unmount cycles

## Testing Strategy

- Unit tests for all refactored components
- Integration tests for state management changes  
- Performance benchmarks before/after optimizations
- User acceptance testing for UI behavior changes

---

*This document should be updated as patterns evolve and new anti-patterns are discovered.*