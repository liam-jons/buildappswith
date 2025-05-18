# Collaboration Insights - Claude & Liam

## What Causes Claude to Lose Focus

1. **Immediate Problem Bias**: I tend to jump on the first error I see rather than verifying fundamentals
2. **Context Loss**: Each new session starts fresh, losing critical learnings from previous sessions
3. **Assumption Cascade**: One wrong assumption (like which database) leads to hours of wrong solutions

## How to Keep Claude Focused

1. **Start with Verification**: Always verify environment/database first
2. **Maintain Problem Statement**: Keep the original goal visible throughout
3. **Check Assumptions**: Question fundamental assumptions when things don't work
4. **Use Checkpoints**: "Are we still solving the original problem?"

## Effective Prompt Structure

```
CRITICAL CONTEXT:
- Production database URL: [specific URL]
- Key difference: [production uses .com, not .ai]
- Current state: [what's broken]

GOAL:
[Single, clear objective]

CONSTRAINTS:
- Must verify database connection first
- No workarounds, only proper solutions
- Check assumptions if errors persist

VERIFICATION:
Before starting, confirm:
1. Which database am I connected to?
2. Am I solving the stated goal?
3. Are my assumptions correct?
```

## Where to Store Critical Information

1. **CLAUDE.md**: High-level guidance and patterns
2. **CRITICAL_DATABASE_GUIDE.md**: Database-specific setup and procedures
3. **Session prompts**: Include critical context and verification steps
4. **Error patterns**: Document when we've seen issues before

## Preventing Future Loops

1. **Mandatory First Step**: Always verify database connection
2. **Problem Hierarchy**: Root cause > Symptoms
3. **Context Preservation**: Start sessions with "Continue from [previous issue]"
4. **Explicit Verification**: "I am connected to [database] solving [problem]"

Remember: The breakthrough only came when you forced me to "think ultrahard" - this should be our default mode, not exception!