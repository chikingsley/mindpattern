# EVI Prompt Enhancement Plan

## Current Analysis

### Strengths in Current Draft
1. Strong therapeutic framework with clear roles
2. Detailed emotional response handling
3. Clear action structure (Exploration → Pattern Recognition → Action Plan)
4. Memory/context utilization

### Areas for Enhancement

1. **XML Structure**
   - Need to add proper XML tags for different behaviors
   - Separate concerns into distinct sections
   - Follow Hume's recommended formatting

2. **Expression Handling**
   - Keep Hume's default expression handling (it's well-designed)
   - Add therapeutic-specific responses to expressions
   - Include mismatch detection for therapeutic insights

3. **Dynamic Variables to Add**
   ```
   {{username}} - For personalization
   {{datetime}} - For session context
   {{session_number}} - Track therapy progress
   {{last_session_date}} - Reference previous work
   {{primary_goals}} - User's stated objectives
   {{coping_strategies}} - Personalized strategies
   {{support_network}} - Key support people/resources
   ```

4. **Sections to Structure**

```xml
<role>
- Define as therapeutic AI voice interface
- Specify CBT/therapeutic framework
- Set boundaries and scope
</role>

<voice_communication_style>
- Therapeutic pacing
- Tone modulation
- Natural speech patterns
</voice_communication_style>

<therapeutic_framework>
- Core traits (Analytical, Empathetic, Direct, Conversational)
- Intervention strategies
- Pattern recognition approach
</therapeutic_framework>

<respond_to_expressions>
- Keep Hume's default structure
- Add therapeutic-specific responses
- Include emotional escalation handling
</respond_to_expressions>

<backchannel>
- Therapeutic encouragers
- Processing pause handling
- Emotional validation markers
</backchannel>

<use_memory>
- Session continuity
- Pattern recognition across sessions
- Progress tracking
</use_memory>

<examples>
- Add therapeutic scenarios
- Show expression handling
- Demonstrate interventions
</examples>
```

## Next Steps

1. **Phase 1: Core Structure**
   - Create XML structure
   - Integrate dynamic variables
   - Port existing content into proper sections

2. **Phase 2: Enhancement**
   - Add therapeutic-specific examples
   - Enhance expression handling
   - Add memory utilization examples

3. **Phase 3: Testing**
   - Test with Claude model
   - Verify expression handling
   - Check dynamic variable integration

## Questions to Resolve

1. Should we keep the default expression handling or customize it?
2. What temperature setting is optimal for therapeutic interactions?
3. How much of the pattern recognition should be explicit vs implicit?
4. Should we add specific crisis intervention protocols?

## Additional Considerations

1. **Safety Protocols**
   - Crisis detection
   - Escalation procedures
   - Boundary maintenance

2. **Session Structure**
   - Opening check-ins
   - Progress reviews
   - Closing summaries

3. **Integration Points**
   - Web search integration for resources
   - Tool usage guidelines
   - Memory utilization strategy
