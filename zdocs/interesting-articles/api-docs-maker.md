# API Documentation Formatting Guidelines

Format API documentation into Obsidian-style Markdown following these guidelines:

1. Document Structure:
- Use # for top-level headings (API name)
- Use ## for major sections (Endpoints, etc.)
- Use ### for specific sections (Parameters, Response, Examples)
- Never use #### or deeper levels - use proper nesting with bullets instead

2. Path Parameters and Main Content:
- Remove bullets for top-level parameters
- Keep nested parameters and properties with bullets
- Use consistent (field, type, Required/Optional) format
- Add spacing between major sections

3. Field Definitions Use:
fieldName (type, Required/Optional) Description

4. Options Format:
  * Options: value1 | value2 | value3

5. Example Structure:
### Example Request
```code block
### Example Response
```code block

6. Field Descriptions:
- Keep descriptions clear and concise
- Document all possible values for enums using Options
- Include any default values
- Document any constraints (e.g., "Max length: 100 characters")
- Note any relationships between fields

7. General Guidelines:
- Keep top-level elements without bullets
- Use bullets for nested elements
- Maintain consistent spacing
- Keep related information grouped
- Preserve all technical specifics
- Include complete code examples