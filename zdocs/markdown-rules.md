# Markdown Documentation Rules

Format API documentation into Obsidian-style Markdown following these guidelines:

1. Document Structure:
- Use # for top-level headings (API name)
- Use ## for major sections (Endpoints, Objects, etc.)
- Use ### for specific endpoints or object definitions
- Never use #### or deeper levels - instead use proper nesting with bullets

2. Field Definitions:
- For all fields, use this exact format:
  ```
  * fieldName (type, Required/Optional) Description
  ```
- For fields with simple options, use inline pipe notation:
  ```
  * status (string, Required) Current status
    * Options: active | pending | completed
  ```

3. Nested Properties:
- Use increasing indentation (2 spaces) with bullets (*) for each level
- Always maintain parent-child relationships in the structure
- For deeply nested objects, show full hierarchy:
  ```
  * parent (object, Required) Parent description
    * child (string, Optional) Child description
      * grandchild (number, Required) Grandchild description
  ```

4. Examples:
- Always include complete examples after field definitions
- Use ```json for JSON examples
- Keep examples in the documentation even if they are long
- Include both request and response examples where applicable

Example of proper formatting:
```markdown
### createUser (POST /users)
Create a new user in the system.

* username (string, Required) Unique username for the account
* profile (object, Optional) User profile information
  * firstName (string, Required) User's first name
  * lastName (string, Required) User's last name
  * preferences (object, Optional) User preferences
    * theme (string, Optional) UI theme preference
      * Options: light | dark | system
    * notifications (boolean, Optional) Enable notifications

Example request:
```json
{
  "username": "johndoe",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "preferences": {
      "theme": "dark",
      "notifications": true
    }
  }
}
```

5. Additional Guidelines:
- Keep descriptions clear and concise
- Document all possible values for enums using Options
- Maintain consistent spacing between sections
- Include any default values in the field description
- Document any constraints (e.g., "Max length: 100 characters")