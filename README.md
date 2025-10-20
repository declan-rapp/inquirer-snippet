# Inquirer Snippet Question

An Inquirer.js custom prompt for editing multiline snippets in the terminal, similar to Enquirer's Snippet question. This package provides an interactive template editor with live preview, field navigation, and validation support.

## Features

- **Interactive field navigation**: Use arrow keys and tab to move between fields
- **Live template preview**: See your template update in real-time as you fill in fields
- **Field validation**: Validate individual fields or the entire form
- **Customizable themes**: Customize colors and styling
- **Keyboard shortcuts**: Efficient navigation and editing with visual feedback
- **Required field support**: Mark fields as required with validation
- **Default values**: Pre-populate fields with initial values
- **Cursor visualization**: See exactly where you're typing when editing fields

## Installation

```bash
npm install inquirer-snippet
```

## Quick Start

```typescript
import snippetPrompt from 'inquirer-snippet';

const result = await snippetPrompt({
  message: 'Fill in the template:',
  template: 'Hello {{name}}, welcome to {{company}}!',
  fields: {
    name: { 
      message: 'Your name', 
      initial: 'John',
      required: true 
    },
    company: { 
      message: 'Company name', 
      initial: 'Acme Corp' 
    }
  },
  validate: (values) => {
    if (!values.name.trim()) {
      return 'Name is required';
    }
    return true;
  }
});
```

## API Reference

### Main Function

```typescript
function snippetPrompt(config: SnippetConfig): Promise<Record<string, string>>
```

The main function that creates and displays the snippet prompt.

### Types

#### `SnippetConfig`

The main configuration object for the snippet prompt.

```typescript
interface SnippetConfig {
  message: string;
  template: string;
  fields: Record<string, SnippetField>;
  validate?: (values: Record<string, string>) => string | boolean;
  theme?: PartialDeep<Theme<SnippetTheme>>;
}
```

**Properties:**

- **`message`** (`string`) - The question message displayed to the user
- **`template`** (`string`) - The template string containing `{{fieldName}}` placeholders
- **`fields`** (`Record<string, SnippetField>`) - Object defining all template fields
- **`validate?`** (`function`, optional) - Validation function that receives all field values
  - **Parameters:** `values: Record<string, string>` - All field values
  - **Returns:** `string | boolean` - `true` if valid, `false` or error message string if invalid
- **`theme?`** (`PartialDeep<Theme<SnippetTheme>>`, optional) - Custom theme configuration

#### `SnippetField`

Configuration for individual template fields.

```typescript
interface SnippetField {
  message?: string;
  initial?: string;
  required?: boolean;
  options?: string[] | SelectOption[];
}
```

**Properties:**

- **`message?`** (`string`, optional) - Display message for the field (defaults to field name)
- **`initial?`** (`string`, optional) - Default/initial value for the field
- **`required?`** (`boolean`, optional) - Whether the field is required (used for validation)
- **`options?`** (`string[] | SelectOption[]`, optional) - Options for select fields. When provided, the field becomes a dropdown selection instead of text input

#### `SelectOption`

Configuration for select field options when using object format.

```typescript
interface SelectOption {
  name: string;
  value: string;
}
```

**Properties:**

- **`name`** (`string`) - Display name shown to the user
- **`value`** (`string`) - Value stored when this option is selected

#### `SnippetTheme`

Theme configuration for customizing the visual appearance.

```typescript
interface SnippetTheme {
  validationFailureMode: "keep" | "clear";
  style: {
    field: (text: string) => string;
    activeField: (text: string) => string;
    placeholder: (text: string) => string;
    activePlaceholder: (text: string) => string;
    message?: (text: string) => string;
  };
}
```

**Properties:**

- **`validationFailureMode`** - How to handle validation failures (`"keep"` or `"clear"`)
- **`style`** - Styling functions for different UI elements:
  - **`field`** - Style for filled field values
  - **`activeField`** - Style for the currently active field with a value
  - **`placeholder`** - Style for empty field placeholders
  - **`activePlaceholder`** - Style for the active empty field placeholder
  - **`message?`** - Style for the main prompt message (optional)

## User Interface

### Keyboard Controls

#### Navigation Mode (when not editing a field)
- **↑/↓ Arrow Keys** - Navigate between fields
- **Tab** - Move to next field (cycles to first after last)
- **Enter** - Start editing the currently active field (text input) or open select options (select field)
- **Ctrl+S** - Submit the completed form

#### Text Editing Mode (when editing a text field)
- **Type** - Enter/modify the field value with live preview
- **Enter** - Save the field value and exit editing mode
- **Escape** - Cancel editing and revert to previous value

#### Select Mode (when selecting from options)
- **↑/↓ Arrow Keys** - Navigate through available options
- **Enter** - Select the highlighted option and return to navigation mode
- **Escape** - Cancel selection and return to navigation mode

### Visual Feedback

The interface provides clear visual indicators for different states:

- **Active field** - Highlighted with inverted colors when navigating
- **Editing field** - Shows cursor position and live updates in template
- **Empty fields** - Display placeholder text in dimmed colors
- **Filled fields** - Show actual values in normal colors
- **Active empty field** - Highlighted placeholder text when navigating

### Template Rendering

- **Live preview** - Template updates in real-time as you type
- **Placeholder substitution** - `{{fieldName}}` placeholders are replaced with:
  - Field values (when filled)
  - Field messages or names (when empty)
  - Live input with cursor (when editing)

### Help Text

Context-sensitive help appears at the bottom:
- **Navigation mode**: Shows available navigation and submission keys
- **Text editing mode**: Shows how to save or cancel field editing
- **Select mode**: Shows how to navigate options and make selections

## Examples

### Select Fields

Select fields provide dropdown-style selection from predefined options. They can use simple string arrays or objects with custom display names and values.

```typescript
import snippetPrompt from 'inquirer-snippet';

const configResult = await snippetPrompt({
  message: 'Configure your application:',
  template: `# {{appName}} Configuration

Environment: {{environment}}
Debug Mode: {{debug}}
Log Level: {{logLevel}}
Database: {{database}}
API Version: {{apiVersion}}`,
  fields: {
    appName: {
      message: 'Application name',
      initial: 'MyApp'
    },
    environment: {
      message: 'Deployment environment',
      options: ['development', 'staging', 'production'],
      initial: 'development'
    },
    debug: {
      message: 'Debug mode',
      options: [
        { name: 'Enabled', value: 'true' },
        { name: 'Disabled', value: 'false' }
      ],
      initial: 'false'
    },
    logLevel: {
      message: 'Logging level',
      options: [
        { name: 'Debug', value: 'debug' },
        { name: 'Info', value: 'info' },
        { name: 'Warning', value: 'warn' },
        { name: 'Error', value: 'error' }
      ],
      initial: 'info'
    },
    database: {
      message: 'Database type',
      options: [
        { name: 'PostgreSQL', value: 'postgresql' },
        { name: 'MySQL', value: 'mysql' },
        { name: 'SQLite', value: 'sqlite' },
        { name: 'MongoDB', value: 'mongodb' }
      ],
      initial: 'postgresql'
    },
    apiVersion: {
      message: 'API version',
      options: ['v1', 'v2', 'v3'],
      initial: 'v2'
    }
  },
  validate: (values) => {
    if (!values.appName?.trim()) {
      return 'Application name is required';
    }
    if (values.environment === 'production' && values.debug === 'true') {
      return 'Debug mode should be disabled in production';
    }
    return true;
  }
});

// Result: { appName: "MyApp", environment: "production", debug: "false", ... }
```

**Select Field Features:**
- **String arrays**: Simple list of options where display name equals value
- **Object arrays**: Custom display names with different stored values
- **Navigation**: Use ↑/↓ arrows to browse options, Enter to select
- **Visual feedback**: Selected option is highlighted with ❯ indicator
- **Cancellation**: Press Escape to cancel selection and keep current value

### Basic Email Template

```typescript
import snippetPrompt from 'inquirer-snippet';

const emailResult = await snippetPrompt({
  message: 'Create an email:',
  template: `Subject: {{subject}}

Dear {{name}},

{{message}}

Best regards,
{{sender}}`,
  fields: {
    subject: { 
      message: 'Email subject', 
      required: true 
    },
    name: { 
      message: 'Recipient name', 
      initial: 'Customer' 
    },
    message: { 
      message: 'Email body', 
      initial: 'Thank you for your business!' 
    },
    sender: { 
      message: 'Your name', 
      initial: 'Support Team' 
    }
  },
  validate: (values) => {
    if (!values.subject?.trim()) {
      return 'Email subject is required';
    }
    if (!values.name?.trim()) {
      return 'Recipient name is required';
    }
    return true;
  }
});
// Result: { subject: "...", name: "...", message: "...", sender: "..." }
```

### React Component Generator

```typescript
const componentResult = await snippetPrompt({
  message: 'Generate React component:',
  template: `import React from 'react';

interface {{componentName}}Props {
  {{propName}}: {{propType}};
}

export const {{componentName}}: React.FC<{{componentName}}Props> = ({ {{propName}} }) => {
  return (
    <div>
      <h1>{{title}}</h1>
      <p>{{{propName}}}</p>
    </div>
  );
};

export default {{componentName}};`,
  fields: {
    componentName: { 
      message: 'Component name', 
      initial: 'MyComponent',
      required: true 
    },
    propName: { 
      message: 'Prop name', 
      initial: 'message' 
    },
    propType: { 
      message: 'Prop type', 
      initial: 'string' 
    },
    title: { 
      message: 'Component title', 
      initial: 'Hello World' 
    }
  },
  validate: (values) => {
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(values.componentName)) {
      return 'Component name must be PascalCase';
    }
    return true;
  }
});

// Write the generated component to a file
import { writeFileSync } from 'fs';
const componentCode = `import React from 'react';

interface ${componentResult.componentName}Props {
  ${componentResult.propName}: ${componentResult.propType};
}

export const ${componentResult.componentName}: React.FC<${componentResult.componentName}Props> = ({ ${componentResult.propName} }) => {
  return (
    <div>
      <h1>${componentResult.title}</h1>
      <p>{${componentResult.propName}}</p>
    </div>
  );
};

export default ${componentResult.componentName};`;

writeFileSync(`${componentResult.componentName}.tsx`, componentCode);
```

### GitHub Issue Template

```typescript
const issueResult = await snippetPrompt({
  message: 'Create a GitHub issue template:',
  template: `## {{title}}

**Reporter:** {{reporter}}
**Priority:** {{priority}}

### Description
{{description}}

### Steps to Reproduce
{{steps}}

### Expected Behavior
{{expected}}

### Environment
- OS: {{os}}
- Browser: {{browser}}
- Version: {{version}}`,
  fields: {
    title: {
      message: 'Issue title',
      initial: 'Bug Report',
      required: true
    },
    reporter: {
      message: 'Reporter name',
      initial: 'Developer'
    },
    priority: {
      message: 'Priority level',
      initial: 'Medium'
    },
    description: {
      message: 'Issue description',
      initial: 'Describe the issue here'
    },
    steps: {
      message: 'Steps to reproduce',
      initial: '1. Step one\n2. Step two'
    },
    expected: {
      message: 'Expected behavior',
      initial: 'What should happen'
    },
    os: {
      message: 'Operating System',
      initial: 'macOS'
    },
    browser: {
      message: 'Browser',
      initial: 'Chrome'
    },
    version: {
      message: 'Version',
      initial: '1.0.0'
    }
  },
  validate: (values) => {
    if (!values.title?.trim()) {
      return 'Issue title is required';
    }
    if (!values.description?.trim()) {
      return 'Issue description is required';
    }
    return true;
  }
});
```

### Custom Theme Example

```typescript
import { SnippetTheme } from 'inquirer-snippet';

const customTheme: Partial<SnippetTheme> = {
  style: {
    field: (text: string) => `\x1b[32m${text}\x1b[39m`, // Green
    activeField: (text: string) => `\x1b[42m\x1b[30m${text}\x1b[39m\x1b[49m`, // Green background
    placeholder: (text: string) => `\x1b[90m${text}\x1b[39m`, // Gray
    activePlaceholder: (text: string) => `\x1b[100m\x1b[37m${text}\x1b[39m\x1b[49m`, // Gray background
  }
};

const result = await snippetPrompt({
  message: 'Custom themed prompt:',
  template: 'Hello {{name}}!',
  fields: {
    name: { message: 'Your name', initial: 'World' }
  },
  theme: customTheme
});
```

### Advanced Validation Example

```typescript
const configResult = await snippetPrompt({
  message: 'Configure database connection:',
  template: `DATABASE_URL={{protocol}}://{{username}}:{{password}}@{{host}}:{{port}}/{{database}}
SSL_MODE={{sslMode}}
POOL_SIZE={{poolSize}}`,
  fields: {
    protocol: {
      message: 'Database protocol',
      initial: 'postgresql'
    },
    username: {
      message: 'Username',
      required: true
    },
    password: {
      message: 'Password',
      required: true
    },
    host: {
      message: 'Host',
      initial: 'localhost'
    },
    port: {
      message: 'Port',
      initial: '5432'
    },
    database: {
      message: 'Database name',
      required: true
    },
    sslMode: {
      message: 'SSL Mode',
      initial: 'require'
    },
    poolSize: {
      message: 'Connection pool size',
      initial: '10'
    }
  },
  validate: (values) => {
    // Validate required fields
    const required = ['username', 'password', 'database'];
    for (const field of required) {
      if (!values[field]?.trim()) {
        return `${field} is required`;
      }
    }

    // Validate port number
    const port = parseInt(values.port);
    if (isNaN(port) || port < 1 || port > 65535) {
      return 'Port must be a valid number between 1 and 65535';
    }

    // Validate pool size
    const poolSize = parseInt(values.poolSize);
    if (isNaN(poolSize) || poolSize < 1 || poolSize > 100) {
      return 'Pool size must be a number between 1 and 100';
    }

    // Validate SSL mode
    const validSslModes = ['disable', 'allow', 'prefer', 'require', 'verify-ca', 'verify-full'];
    if (!validSslModes.includes(values.sslMode)) {
      return `SSL mode must be one of: ${validSslModes.join(', ')}`;
    }

    return true;
  }
});

// Use the result to create a .env file
import { writeFileSync } from 'fs';
const envContent = `DATABASE_URL=${configResult.protocol}://${configResult.username}:${configResult.password}@${configResult.host}:${configResult.port}/${configResult.database}
SSL_MODE=${configResult.sslMode}
POOL_SIZE=${configResult.poolSize}`;

writeFileSync('.env', envContent);
```

## Advanced Usage

### Error Handling

```typescript
try {
  const result = await snippetPrompt({
    message: 'Fill template:',
    template: 'Hello {{name}}!',
    fields: {
      name: { message: 'Your name', required: true }
    },
    validate: (values) => {
      if (!values.name?.trim()) {
        return 'Name is required';
      }
      return true;
    }
  });
  
  console.log('Success:', result);
} catch (error) {
  if (error.message.includes('SIGINT')) {
    console.log('User cancelled the prompt');
  } else {
    console.error('Prompt error:', error.message);
  }
}
```

### Integration with Other Inquirer Prompts

```typescript
import { input, confirm } from '@inquirer/prompts';
import snippetPrompt from 'inquirer-snippet';

// Collect basic info first
const projectName = await input({ 
  message: 'Project name:' 
});

const useTypeScript = await confirm({ 
  message: 'Use TypeScript?' 
});

// Then use snippet for template generation
const packageJson = await snippetPrompt({
  message: 'Configure package.json:',
  template: `{
  "name": "{{name}}",
  "version": "{{version}}",
  "description": "{{description}}",
  "main": "{{main}}",
  "scripts": {
    "start": "{{startScript}}",
    "build": "{{buildScript}}",
    "test": "{{testScript}}"
  },
  "author": "{{author}}",
  "license": "{{license}}"
}`,
  fields: {
    name: { initial: projectName },
    version: { initial: '1.0.0' },
    description: { message: 'Package description' },
    main: { initial: useTypeScript ? 'dist/index.js' : 'index.js' },
    startScript: { initial: useTypeScript ? 'node dist/index.js' : 'node index.js' },
    buildScript: { initial: useTypeScript ? 'tsc' : 'echo "No build needed"' },
    testScript: { initial: 'jest' },
    author: { message: 'Author name' },
    license: { initial: 'MIT' }
  }
});
```

### Dynamic Field Generation

```typescript
// Generate fields dynamically based on user input
const fieldCount = await input({ 
  message: 'How many fields do you want?',
  validate: (input) => {
    const num = parseInt(input);
    return !isNaN(num) && num > 0 && num <= 10 ? true : 'Enter a number between 1 and 10';
  }
});

const fields: Record<string, SnippetField> = {};
let template = 'Form Data:\n';

for (let i = 1; i <= parseInt(fieldCount); i++) {
  const fieldName = `field${i}`;
  fields[fieldName] = {
    message: `Field ${i} value`,
    initial: `Value ${i}`
  };
  template += `${fieldName}: {{${fieldName}}}\n`;
}

const result = await snippetPrompt({
  message: 'Fill in the form:',
  template,
  fields
});
```

## Requirements

- Node.js 14+
- @inquirer/core ^10.0.0

## TypeScript Support

This package is written in TypeScript and includes full type definitions. All types are exported for use in your projects:

```typescript
import snippetPrompt, { 
  SnippetConfig, 
  SnippetField, 
  SnippetTheme 
} from 'inquirer-snippet';

// Type-safe configuration
const config: SnippetConfig = {
  message: 'Configure settings:',
  template: 'Setting: {{value}}',
  fields: {
    value: { message: 'Enter value' }
  }
};

const result: Record<string, string> = await snippetPrompt(config);
```

## Troubleshooting

### Common Issues

#### Prompt doesn't respond to keyboard input
- **Cause**: Terminal compatibility issues or conflicting input handlers
- **Solution**: Ensure you're running in a compatible terminal and no other prompts are active

#### Template placeholders not being replaced
- **Cause**: Incorrect placeholder syntax or field name mismatch
- **Solution**: Ensure placeholders use `{{fieldName}}` syntax and field names match exactly

```typescript
// ❌ Incorrect
template: 'Hello {name}!', // Wrong syntax
fields: { userName: { ... } } // Name mismatch

// ✅ Correct  
template: 'Hello {{name}}!',
fields: { name: { ... } }
```

#### Validation errors not showing
- **Cause**: Validation function not returning proper error messages
- **Solution**: Ensure validation returns `true` for valid input or a string for errors

```typescript
// ❌ Incorrect
validate: (values) => {
  if (!values.name) {
    console.log('Name required'); // Won't show in UI
    return false; // Should return string
  }
}

// ✅ Correct
validate: (values) => {
  if (!values.name?.trim()) {
    return 'Name is required'; // Shows in UI
  }
  return true;
}
```

#### Cursor not visible when editing
- **Cause**: Terminal doesn't support ANSI escape sequences
- **Solution**: Use a modern terminal that supports ANSI colors (most do)

#### Form submission not working
- **Cause**: Using wrong key combination
- **Solution**: Use **Ctrl+S** (not just 'S') to submit the form

### Performance Tips

- Keep templates reasonably sized (< 1000 lines) for best performance
- Use validation sparingly for complex operations
- Consider breaking very large templates into multiple smaller prompts

### Debugging

Enable debug mode to see internal state:

```typescript
// Add this before your prompt
process.env.DEBUG = 'inquirer-snippet';

const result = await snippetPrompt({
  // your config
});
```

## Migration Guide

### From Enquirer's Snippet

If you're migrating from Enquirer's snippet prompt:

```typescript
// Enquirer (old)
const { snippet } = require('enquirer');
const result = await snippet({
  message: 'Fill template',
  initial: 'Hello {{name}}!',
  fields: [
    { name: 'name', message: 'Name' }
  ]
});

// Inquirer Snippet Question (new)
import snippetPrompt from 'inquirer-snippet';
const result = await snippetPrompt({
  message: 'Fill template',
  template: 'Hello {{name}}!', // 'initial' becomes 'template'
  fields: {
    name: { message: 'Name' } // Array becomes object
  }
});
```

**Key differences:**
- `initial` property renamed to `template`
- `fields` is now an object instead of array
- Field configuration uses object properties instead of array items
- Validation function receives all values at once

## Reporting Issues

When reporting issues, please include:
- Node.js version
- Terminal/shell information
- Minimal reproduction code
- Expected vs actual behavior
- Any error messages

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Changelog

### v1.1.0
- **New Feature**: Select fields with dropdown options
  - Support for string arrays and object arrays with custom display names
  - Interactive option navigation with arrow keys
  - Visual selection indicators and help text
  - Full integration with existing validation and theming
- Enhanced keyboard navigation for mixed field types
- Improved text editing with better cursor handling

### v1.0.0
- Initial release
- Interactive field navigation with arrow keys
- Live template preview with cursor visualization
- Form validation support
- Customizable themes
- TypeScript support with full type definitions