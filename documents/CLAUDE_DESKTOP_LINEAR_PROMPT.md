# Claude Desktop Prompt for Linear Issue Management

## Creating Linear Issues from Documentation

Use the following prompts with Claude Desktop to help create Linear issues and update their status:

### Create Linear Issues

```
I need to create Linear issues based on the documentation I've prepared. Please help me format these into Linear-ready issue descriptions that can be pasted directly into Linear.

Here are the documents to convert to issues:
[Paste markdown content or list document paths here]

For each issue, please:
1. Create a concise title that summarizes the problem and solution
2. Format the description with appropriate Markdown for Linear
3. Extract key labels for categorization (e.g., bug, feature, documentation)
4. Suggest priority based on impact (P0-P3)
5. Add a "status: done" section at the end of each issue
6. Estimate complexity (points: 1, 2, 3, 5, 8)

Please return these in a format that I can directly copy-paste into Linear.
```

### Mark Issues as Completed

```
I need to update the status of the following Linear issues to "Done". Please help me format a completion summary for each:

[List issues here with their current status]

For each issue, please provide:
1. A completion summary (1-3 sentences)
2. Any notable implementation details or deviations from the plan
3. Recommendations for follow-up work (if any)
4. A proper "Status: Done" section with completion date

Please format these so I can easily copy-paste them into Linear.
```

### Update Landing Page Implementation Status

```
I need to update the status of our landing page implementation. The recent error fixes resolved the blocking issues, and we're making good progress. Please help me create a status update for our Linear issue tracking.

Current status: [describe current status]
Recent achievements:
- Resolved middleware errors affecting page loading
- Fixed CSP configuration for proper resource loading
- Standardized MagicUI component imports

Next steps for upcoming session:
[List planned next steps]

Please format this as a Linear issue comment that I can copy-paste directly.
```

## General Tips for Linear Issue Creation

1. **Concise Titles**: Create clear, action-oriented titles (e.g., "Fix middleware error handling for static assets")

2. **Structured Description**:
   - Problem: What was broken/needed?
   - Solution: What was implemented?
   - Impact: What improved as a result?

3. **Markdown Formatting**:
   - Use headings (##) for sections
   - Use bullet points for lists
   - Use code blocks for code references
   - Use checkboxes for subtasks

4. **Labels and Priority**:
   - Add relevant labels (bug, feature, refactor)
   - Set appropriate priority (P0-P3)
   - Add estimate in points

5. **Completion**:
   - Add clear "Status: Done" section
   - Include completion date
   - Note any follow-up work